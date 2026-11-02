/* Nami streaming client — consumes the backend's SSE frames
   (backend/main.py → POST /api/agent/stream):

     activity {phase, tool?} → a human label for what Nami is doing now
     delta    {text}         → answer text chunk
     delta_reset {}          → discard text so far (thinking-out-loud guard)
     final    {response}     → the authoritative full answer
     error    {kind, message}

   Labels are mapped client-side so wording tweaks ship without touching the
   backend. */

export const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL ?? "http://localhost:8000";

export const AGENT_ENABLED = process.env.NEXT_PUBLIC_AGENT_ENABLED !== "false";

export const MAX_MESSAGE_LENGTH = 4000;
export const CHAT_TIMEOUT_MS = 50000;
export type WireMessage = { role: "user" | "assistant"; content: string };
export function boundedHistory(history: WireMessage[], message: string): WireMessage[] {
  let remaining = 12000 - message.length;
  const result: WireMessage[] = [];
  for (const item of history.slice(-20).reverse()) {
    const content = item.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) continue;
    if (content.length > remaining) break;
    result.unshift({ role: item.role, content });
    remaining -= content.length;
  }
  while (result[0]?.role === "assistant") result.shift();
  return result;
}

const GENERATING_LABEL = "Thinking…";

/* raw tool names from the backend → what the visitor sees */
const TOOL_ACTIVITY_LABELS: Record<string, string> = {
  get_project_details: "Reading up on our work…",
};

export function activityLabelFor(phase: string, tool?: string): string | null {
  if (phase === "tool") {
    return (typeof tool === "string" && Object.prototype.hasOwnProperty.call(TOOL_ACTIVITY_LABELS, tool)
      ? TOOL_ACTIVITY_LABELS[tool] : null) || "Working on it…";
  }
  if (phase === "generating") return GENERATING_LABEL;
  return null; /* tool_done → keep the current label (no churn between steps) */
}

export class AgentStreamError extends Error {
  stage: "connect" | "stream";
  /* seconds until the visitor may chat again — set only when the backend
     answered 429 (per-visitor rate limit); null for every other failure */
  retryAfter: number | null;
  canFallback: boolean;

  constructor(
    stage: "connect" | "stream",
    message: string,
    retryAfter: number | null = null,
    canFallback = false,
  ) {
    super(message);
    this.stage = stage;
    this.retryAfter = retryAfter;
    this.canFallback = canFallback;
  }
}

/* Turn a 429 from either endpoint into an error carrying the server's
   retry time (JSON body first, Retry-After header as fallback). */
export async function rateLimitError(res: Response): Promise<AgentStreamError> {
  let retryAfter: number | null = null;
  try {
    const data = (await res.json()) as { retryAfter?: unknown };
    if (typeof data.retryAfter === "number" && Number.isFinite(data.retryAfter) && data.retryAfter > 0) {
      retryAfter = Math.min(3600, Math.ceil(data.retryAfter));
    }
  } catch {
    /* body wasn't JSON — fall back to the header */
  }
  if (retryAfter === null) {
    const header = res.headers.get("retry-after");
    const parsed = header ? Number.parseInt(header, 10) : Number.NaN;
    retryAfter = Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
  }
  return new AgentStreamError("connect", "Chat limit reached.", retryAfter);
}

interface StreamSession {
  feed: (chunk: string) => void;
  flush: () => void;
  outcome: { final: string | null; error: string | null };
}

function createSession(cb: {
  onActivity: (label: string) => void;
  onDelta: (text: string) => void;
  onDeltaReset: () => void;
}): StreamSession {
  const outcome = { final: null as string | null, error: null as string | null };
  let buffer = "";
  let textLength = 0;

  function handleFrame(frame: string) {
    let eventName = "";
    const dataLines: string[] = [];
    for (const line of frame.split(/\r\n|\r|\n/)) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return; /* keepalive / blank frame */
    let data: {
      phase?: string;
      tool?: string;
      text?: string;
      response?: string;
      message?: string;
    };
    try {
      data = JSON.parse(dataLines.join("\n"));
    } catch {
      throw new AgentStreamError("stream", "Invalid assistant response.");
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new AgentStreamError("stream", "Invalid assistant response.");

    if (eventName === "activity") {
      const label = activityLabelFor(data.phase ?? "", data.tool);
      if (label) cb.onActivity(label);
    } else if (eventName === "delta") {
      if (typeof data.text !== "string") throw new AgentStreamError("stream", "Invalid assistant response.");
      textLength += data.text.length;
      if (textLength > 16000) throw new AgentStreamError("stream", "Assistant response is too large.");
      cb.onDelta(data.text);
    } else if (eventName === "delta_reset") {
      textLength = 0;
      cb.onDeltaReset();
    } else if (eventName === "final") {
      if (typeof data.response !== "string" || !data.response.trim() || data.response.length > 4000) throw new AgentStreamError("stream", "Invalid assistant response.");
      outcome.final = data.response;
    } else if (eventName === "error") {
      outcome.error = typeof data.message === "string" ? data.message : "The agent failed to answer.";
    }
  }

  return {
    outcome,
    feed(chunk: string) {
      buffer += chunk;
      let match: RegExpExecArray | null;
      while ((match = /\r\n\r\n|\n\n|\r\r/.exec(buffer))) {
        if (match.index > 65536) throw new AgentStreamError("stream", "Assistant response is too large.");
        handleFrame(buffer.slice(0, match.index));
        buffer = buffer.slice(match.index + match[0].length);
        if (outcome.final !== null || outcome.error !== null) { buffer = ""; break; }
      }
      if (buffer.length > 65536) throw new AgentStreamError("stream", "Assistant response is too large.");
    },
    flush() {
      if (buffer.trim()) handleFrame(buffer);
      buffer = "";
    },
  };
}

/* Send one message and stream the answer. Resolves with the final response;
   throws AgentStreamError — "connect" means no stream was established at all
   (caller may retry the non-streaming endpoint), "stream" means it broke or
   errored mid-run (partial text may already be visible). */
export async function streamAgentChat(opts: {
  message: string;
  history: WireMessage[];
  signal?: AbortSignal;
  onActivity: (label: string) => void;
  onDelta: (text: string) => void;
  onDeltaReset: () => void;
}): Promise<string> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  opts.signal?.addEventListener("abort", abort, { once: true });
  if (opts.signal?.aborted) abort();
  const timer = setTimeout(abort, CHAT_TIMEOUT_MS);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let connected = false;
  try {
    const res = await fetch(AGENT_URL + "/api/agent/stream", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: opts.message, history: boundedHistory(opts.history, opts.message) }),
      signal: controller.signal,
    });
    if (res.status === 429) throw await rateLimitError(res);
    if (!res.ok || !res.body) throw new AgentStreamError("connect", "agent HTTP " + res.status, null, [404, 405, 501].includes(res.status));
    if (!res.headers.get("content-type")?.includes("text/event-stream")) throw new AgentStreamError("connect", "Invalid assistant stream.");
    connected = true;
    const session = createSession(opts);
    reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) { session.feed(decoder.decode()); session.flush(); break; }
      session.feed(decoder.decode(value, { stream: true }));
      if (session.outcome.final !== null || session.outcome.error !== null) break;
    }
    if (session.outcome.error !== null) throw new AgentStreamError("stream", session.outcome.error);
    if (session.outcome.final === null) throw new AgentStreamError("stream", "Assistant stopped responding.");
    return session.outcome.final;
  } catch (error) {
    if (error instanceof AgentStreamError) throw error;
    throw new AgentStreamError(connected ? "stream" : "connect", controller.signal.aborted ? "The chat request timed out or was cancelled." : "Could not reach the agent.");
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", abort);
    if (reader) {
      try { await reader.cancel(); } catch { /* Connection already closed. */ }
      reader.releaseLock();
    }
    controller.abort();
  }
}
