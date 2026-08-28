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

const GENERATING_LABEL = "Thinking…";

/* raw tool names from the backend → what the visitor sees */
const TOOL_ACTIVITY_LABELS: Record<string, string> = {
  get_project_details: "Reading up on our work…",
};

export function activityLabelFor(phase: string, tool?: string): string | null {
  if (phase === "tool") {
    return (tool && TOOL_ACTIVITY_LABELS[tool]) || "Working on it…";
  }
  if (phase === "generating") return GENERATING_LABEL;
  return null; /* tool_done → keep the current label (no churn between steps) */
}

export class AgentStreamError extends Error {
  stage: "connect" | "stream";

  constructor(stage: "connect" | "stream", message: string) {
    super(message);
    this.stage = stage;
  }
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

  function handleFrame(frame: string) {
    let eventName = "";
    const dataLines: string[] = [];
    for (const line of frame.split("\n")) {
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
      return;
    }

    if (eventName === "activity") {
      const label = activityLabelFor(data.phase ?? "", data.tool);
      if (label) cb.onActivity(label);
    } else if (eventName === "delta") {
      if (typeof data.text === "string" && data.text) cb.onDelta(data.text);
    } else if (eventName === "delta_reset") {
      cb.onDeltaReset();
    } else if (eventName === "final") {
      outcome.final = typeof data.response === "string" ? data.response : "";
    } else if (eventName === "error") {
      outcome.error = data.message ?? "The agent failed to answer.";
    }
  }

  return {
    outcome,
    feed(chunk: string) {
      buffer += chunk;
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        handleFrame(buffer.slice(0, sep));
        buffer = buffer.slice(sep + 2);
      }
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
  history: { role: "user" | "assistant"; content: string }[];
  onActivity: (label: string) => void;
  onDelta: (text: string) => void;
  onDeltaReset: () => void;
}): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${AGENT_URL}/api/agent/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: opts.message, history: opts.history }),
    });
  } catch {
    throw new AgentStreamError("connect", "Could not reach the agent.");
  }
  if (!res.ok || !res.body) {
    throw new AgentStreamError("connect", `agent HTTP ${res.status}`);
  }

  const session = createSession({
    onActivity: opts.onActivity,
    onDelta: opts.onDelta,
    onDeltaReset: opts.onDeltaReset,
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    session.feed(decoder.decode(value, { stream: true }));
    if (session.outcome.final !== null || session.outcome.error !== null) break;
  }
  if (session.outcome.final === null && session.outcome.error === null) {
    session.flush();
  }

  if (session.outcome.error !== null) {
    throw new AgentStreamError("stream", session.outcome.error);
  }
  if (session.outcome.final === null) {
    throw new AgentStreamError("stream", "Assistant stopped responding.");
  }
  return session.outcome.final;
}
