"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotsIcon } from "@/components/icons";
import DotSphere, { type SphereMode } from "@/components/DotSphere";
import {
  AGENT_URL,
  AgentStreamError,
  rateLimitError,
  streamAgentChat,
} from "@/lib/agentStream";

/* Chat widget (home page) — pill ⇄ panel morph (ported from
   animation_refrance_chat.html) built around ONE persistent strip:

     [ dots icon | prompt slot ]      ← never unmounts, never fades

   The strip is the whole pill (icon + "Let's work together") and also
   the panel's input row (icon + "Ask me anything…" input) — same slot,
   same icon. All text movement is done by the clip edge; the input
   repositions only inside the circle leg, always ahead of the wall, so
   every reveal is a pure stationary wipe:

     open    label wiped away by the narrowing width · input glides to
             rest inside the shrinking circle (never exposed) · the
             widening bar reveals it in place — no slide at reveal time
     close   panel folds onto its input strip · wall wipes the input
             out during the retract · the extending pill wipes the CTA
             back in

   The resting pill ALWAYS reads "Let's work together"; its width is
   measured from a permanent hidden measurer span (absolutely posed,
   so flex can never squeeze it and corrupt the value). The panel face
   reserves the strip's 56px via bottom padding. The icon is a single
   block ready for later heartbeat/thinking treatments (spins while
   thinking today).

   Every send routes through `sendToAgent` — a POST to Nami's brain: a
   Python agent (OpenAI Agents SDK on Gemini) in backend/, served at
   /api/agent as {reply}. History rides along so it sees the whole
   conversation. */

type Msg = { from: "user" | "agent"; text: string; time: string };
type View = "greet" | "chat" | "contact";
/* morph geometry stages: pill → circle → bar → open (close reverses) */
type Stage = "pill" | "circle" | "bar" | "open";
/* the circle stage is shared by the open-shrink and the close-retract
   legs — the slot rules need to know which motion is running */
type Dir = "opening" | "closing" | null;

const ASSISTANT_NAME = "Nami";

const GREETING =
  "Hey — I'm Nami, MIZU's AI assistant. Anything catch your eye?";

const SUGGESTIONS = [
  "Where should I start?",
  "What do you do?",
  "I have a project",
];

/* the widget log → the wire format both endpoints accept */
const toHistory = (messages: Msg[]) =>
  messages.map((m) => ({
    role: m.from === "agent" ? ("assistant" as const) : ("user" as const),
    content: m.text,
  }));

/* Non-streaming fallback — used only when the stream endpoint can't be
   reached at all (e.g. an older backend behind AGENT_URL). */
async function sendToAgent(text: string, history: Msg[]): Promise<string> {
  const res = await fetch(`${AGENT_URL}/api/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: text,
      history: toHistory(history),
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw await rateLimitError(res);
    throw new Error(`agent HTTP ${res.status}`);
  }
  const data = (await res.json()) as { reply?: unknown };
  if (typeof data.reply !== "string" || !data.reply) {
    throw new Error("agent returned no reply");
  }
  return data.reply;
}

const now = () =>
  new Date()
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .toLowerCase();

/* ===== smooth streaming reveal =====
   Nami's answer streams in as token deltas; this hook buffers the full text
   and reveals it on a steady tick — a small fixed step plus ~1/50 of the
   remaining backlog per tick, so slow streams drip calmly and bursts
   auto-accelerate. Reduced motion reveals instantly. Must live at module
   scope (AGENTS.md rule #2). */
function useSmoothStream() {
  const [revealed, setRevealed] = useState("");
  const [hasText, setHasText] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const fullRef = useRef("");
  const lenRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const full = fullRef.current;
    if (lenRef.current >= full.length) {
      stop();
      setIsDone(true);
      return;
    }
    const step = Math.max(1, Math.ceil((full.length - lenRef.current) / 50));
    lenRef.current = Math.min(full.length, lenRef.current + step);
    setRevealed(full.slice(0, lenRef.current));
  }, [stop]);

  const start = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = window.setInterval(tick, 40);
    tick(); /* first step immediately — short replies shouldn't wait a tick */
  }, [tick]);

  const revealInstantly = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      lenRef.current = fullRef.current.length;
      setRevealed(fullRef.current);
      setIsDone(true);
      return true;
    }
    return false;
  }, []);

  const append = useCallback(
    (chunk: string) => {
      if (!chunk) return;
      fullRef.current += chunk;
      setHasText(true);
      setIsDone(false);
      if (!revealInstantly()) start();
    },
    [revealInstantly, start],
  );

  /* the final frame is authoritative — top the reveal up to it */
  const setFull = useCallback(
    (text: string) => {
      fullRef.current = text;
      setHasText(true);
      if (lenRef.current > text.length) {
        lenRef.current = text.length;
        setRevealed(text);
      }
      if (!revealInstantly()) start();
    },
    [revealInstantly, start],
  );

  const reset = useCallback(() => {
    stop();
    fullRef.current = "";
    lenRef.current = 0;
    setRevealed("");
    setHasText(false);
    setIsDone(false);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { revealed, hasText, isDone, append, setFull, reset };
}

/* ===== morph geometry ===== */
const PILL_H = 56; /* h-14 — the strip's height at pill/circle */
const STRIP_H_OPEN = 72; /* hosting the live input restores the original 24/20 row rhythm */
const COMPOSER_MAX_H = 70; /* textarea grows to 3 lines (16px × 1.45), then scrolls */
const STRIP_MAX_H = 98; /* strip ceiling once the composer is capped */
const RADIUS_PILL = PILL_H / 2;
const RADIUS_PANEL = 24; /* rounded-[24px] */
const PANEL_W = "min(400px, calc(100vw - 32px))"; /* 16px gutters */
/* pill width = measurer span + icon 28 + gap 12 + padding 24×2 */
const STRIP_CHROME = 88;
/* slot start inside the container: padding 24 + icon 28 + gap 12 */
const SLOT_X = 64;
/* stage holds — each next leg fires BEFORE the previous 0.4s
   transition ends, so the morph never stops moving: the slow tail of
   one leg overlaps the pickup of the next (CSS transitions retarget
   smoothly from wherever they are — no snap, no pause). */
const HOLD_CIRCLE = 340; /* pill → circle · width growth starts as the circle settles */
const HOLD_BAR_OPEN = 280; /* circle → bar · height starts rising while width finishes its last px */
const HOLD_BAR_CLOSE = 300; /* panel → bar · width folds in while height lands */
const HOLD_CIRCLE_CLOSE = 330; /* bar → circle · pill restores as width closes */

const chip =
  "inline-flex min-h-[44px] items-center rounded-full px-4 text-[14px] leading-tight no-underline transition-colors duration-200";

/* seconds → human gap for the rate-limit note ("42s" / "3 min") */
const formatRetry = (s: number) =>
  s >= 90 ? `${Math.round(s / 60)} min` : `${s}s`;

const iconBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors duration-200 hover:bg-white/20 hover:text-white";

export default function ChatWidget() {
  /* morph stage machine (drives the container's width/height/radius) */
  const [stage, setStage] = useState<Stage>("pill");
  const [dir, setDir] = useState<Dir>(null);
  const [view, setView] = useState<View>("greet");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  /* strip height: 72 at rest, grows with the composer as long questions
     stack (the face's bottom padding follows, then the measured panel) */
  const [stripH, setStripH] = useState(STRIP_H_OPEN);
  const [thinking, setThinking] = useState(false);
  /* desktop-fine-pointer only — touch taps fire compat mouse events,
     and hover is a mouse-only effect (AGENTS.md rule #1) */
  const [sphereHover, setSphereHover] = useState(false);

  /* measured geometry: pill width comes from a permanent hidden
     measurer (never squeezed → never corrupted); panel height from the
     panel face (per-view, capped by its own max-h) */
  const [pillW, setPillW] = useState(208);
  const [panelH, setPanelH] = useState(520);

  /* bump whenever the panel opens so its content re-cascades */
  const [seq, setSeq] = useState(0);

  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  /* Nami's current activity label ("Thinking…", "Reading up on our work…"),
     fed by the stream's activity frames; null → the render falls back */
  const [activity, setActivity] = useState<string | null>(null);
  /* smooth reveal of the streamed answer */
  const smooth = useSmoothStream();
  /* the final frame lands before the reveal finishes — the reply is only
     committed to the log once the reveal catches up, so the swap from
     streaming bubble to real message is invisible (same text, same style) */
  const settledRef = useRef<string | null>(null);
  /* timestamp captured at send time, shared by the streaming bubble and the
     committed message */
  const pendingTimeRef = useRef<string>("");

  /* rate-limit cooldown: the backend said 429 → sends are blocked until the
     retry time passes; `cooldownLeft` drives the placeholder countdown */
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  useEffect(() => {
    if (cooldownEnd === null) return;
    const update = () => {
      const left = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setCooldownLeft(left);
      if (left <= 0) setCooldownEnd(null);
    };
    update();
    const timer = window.setInterval(update, 500);
    return () => window.clearInterval(timer);
  }, [cooldownEnd]);

  const measureRef = useRef<HTMLSpanElement>(null);
  const panelFaceRef = useRef<HTMLElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  /* never leave dangling stage timers behind */
  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
    },
    []
  );

  /* track the measurer span (constant text, absolute → stable width;
     picks up font-load shifts too) */
  useEffect(() => {
    const el = measureRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const w = STRIP_CHROME + el.offsetWidth;
      setPillW((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* track the panel face's natural height (view switches + new messages) */
  useEffect(() => {
    const el = panelFaceRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      setPanelH((prev) => (prev === h ? prev : h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* the composer hugs its content up to the cap (then scrolls internally);
     measured ONLY at open — mid-morph stages have fake-narrow slots (the
     circle is 56px wide), which wrap the text, pump this box up and drag
     the strip height up and down behind it (the sphere/text jitter) */
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    if (stage !== "open") return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, COMPOSER_MAX_H)}px`;
  }, [input, stage]);

  /* strip follows the composer's box, which cascades: strip height →
     face padding → measured panel height → the morphing container */
  useEffect(() => {
    const el = composerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      setStripH((prev) => {
        const next = Math.min(STRIP_MAX_H, Math.max(STRIP_H_OPEN, el.offsetHeight + 28));
        return prev === next ? prev : next;
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* deterministic panel re-measure — the RO above can silently stop
     delivering across morph stages, so anything that can change the
     face's height re-reads it after commit (composer growth, view
     switches, new messages, streaming ticks) */
  useEffect(() => {
    const el = panelFaceRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    setPanelH((prev) => (prev === h ? prev : h));
  }, [stripH, input, view, stage, messages.length, thinking, smooth.revealed, seq]);

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* desktop-fine-pointer only — used for hover-type behaviors and the
     Enter-to-send shortcut (touch keyboards get the send button) */
  const finePointer = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* pill → circle → bar → open (overlapped legs; reduced motion skips
     straight to the end state, transitions being disabled anyway) */
  const openChat = useCallback(() => {
    if (busy.current || stage !== "pill") return;
    setDir("opening");
    if (reducedMotion()) {
      setSeq((s) => s + 1);
      setStage("open");
      return;
    }
    busy.current = true;
    setStage("circle");
    later(() => {
      setStage("bar");
      later(() => {
        setSeq((s) => s + 1);
        setStage("open");
        busy.current = false;
      }, HOLD_BAR_OPEN);
    }, HOLD_CIRCLE);
  }, [stage, later]);

  /* open → bar → circle → pill */
  const closeChat = useCallback(() => {
    if (busy.current || stage !== "open") return;
    setDir("closing");
    if (reducedMotion()) {
      setStage("pill");
      return;
    }
    busy.current = true;
    setStage("bar");
    later(() => {
      setStage("circle");
      later(() => {
        setStage("pill");
        busy.current = false;
      }, HOLD_CIRCLE_CLOSE);
    }, HOLD_BAR_CLOSE);
  }, [stage, later]);

  /* Escape closes the panel (once it's fully open) */
  useEffect(() => {
    if (stage !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [stage, closeChat]);

  /* clicking anywhere outside the widget collapses it back into the
     pill. Containment is recorded at POINTERDOWN — the click that
     unmounts a button (chip → chat view, back → tabs) leaves a
     detached node in the click's target by bubble time, which would
     make contains() lie; pointerdown always sees the live tree */
  const rootRef = useRef<HTMLDivElement>(null);
  const insideRef = useRef(true);
  useEffect(() => {
    if (stage !== "open") return;

    const onDocPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      insideRef.current = !!root && root.contains(e.target as Node);
    };
    const onDocClick = () => {
      if (!insideRef.current) closeChat();
    };

    document.addEventListener("pointerdown", onDocPointerDown, true);
    document.addEventListener("click", onDocClick);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown, true);
      document.removeEventListener("click", onDocClick);
    };
  }, [stage, closeChat]);

  /* focus the input once open — mouse/keyboard users only, so mobile
     keyboards don't jump up on their own */
  useEffect(() => {
    if (stage !== "open") return;
    if (finePointer()) {
      composerRef.current?.focus();
    }
  }, [stage, view]);

  /* keep the log pinned to the newest message (and to the streaming reveal
     as it grows) */
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking, smooth.revealed]);

  /* commit the finished reply only once the reveal has dripped out fully —
     swapping earlier would replace the visible streaming bubble mid-typing */
  useEffect(() => {
    if (settledRef.current === null || !smooth.isDone) return;
    const text = settledRef.current;
    settledRef.current = null;
    setMessages((m) => [...m, { from: "agent", text, time: pendingTimeRef.current }]);
    setThinking(false);
    setActivity(null);
    smooth.reset();
  }, [smooth.isDone]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking || cooldownLeft > 0) return;
    setMessages((m) => [...m, { from: "user", text, time: now() }]);
    setInput("");
    setView("chat");
    setThinking(true);
    pendingTimeRef.current = now();
    smooth.reset();
    try {
      const reply = await streamAgentChat({
        message: text,
        history: toHistory(messages),
        onActivity: setActivity,
        onDelta: smooth.append,
        onDeltaReset: smooth.reset,
      });
      settledRef.current = reply;
      smooth.setFull(reply);
    } catch (error) {
      /* the backend's per-visitor rate limit → say so and block sends
         until the retry time passes (no point letting requests fail) */
      const retryAfter =
        error instanceof AgentStreamError ? error.retryAfter : null;
      /* otherwise: if no stream was ever established (older backend,
         network refused), retry once without streaming; a mid-stream
         failure goes straight to the fallback message — partial text is
         discarded */
      if (
        retryAfter === null &&
        error instanceof AgentStreamError &&
        error.stage === "connect"
      ) {
        try {
          const reply = await sendToAgent(text, messages);
          settledRef.current = reply;
          smooth.setFull(reply);
          return;
        } catch {
          /* fall through */
        }
      }
      /* rate-limit note and failure apology are announced like any other
         Nami turn: dripped through the same smooth reveal and committed
         by the settled effect (which also drops the thinking state) — a
         pop-in bubble would break the conversation's rhythm */
      const notice =
        retryAfter !== null
          ? `I need a breather — you've reached the chat limit. Try again in ${formatRetry(retryAfter)}.`
          : "Sorry — I couldn't reach my brain just now. Give it another go in a moment, or email hello@mizu.studio.";
      smooth.reset();
      settledRef.current = notice;
      smooth.setFull(notice);
      if (retryAfter !== null) {
        setCooldownEnd(Date.now() + retryAfter * 1000);
      }
    }
  };

  /* ===== slot rules =====
     the input is parked ONLY while resting at pill — every other stage
     it sits at translateX(0):
       open   circle: it glides park→0 while the box shrinks; it stays
              ahead of the wall the whole way (edge−wall = 48−40p ≥ 8),
              so the reposition is invisible · bar: stationary at 0,
              the widening wall alone wipes it into view
       close  bar/circle: at 0, the wall wipes it out (the slide to
              park only assists after the wall has done most of the work)
     the CTA label needs direction because 'circle' is shared: it owns
     pill + circle-on-open, and only mounts at pill on close */
  const showInput = stage !== "pill";
  const labelVisible =
    stage === "pill" || (stage === "circle" && dir === "opening");
  const parkX = pillW - SLOT_X + 48;

  /* strip sphere mode: rest/hover while closed · agitated + white
     sparkle while Nami thinks · calm roll once open · elastic inhale
     during the morph legs (DotSphere eases between modes — no cuts) */
  const sphereMode: SphereMode =
    stage === "circle" || stage === "bar"
      ? "morph"
      : thinking
        ? "thinking"
        : stage === "open"
          ? "open"
          : sphereHover
            ? "hover"
            : "rest";

  /* the container's geometry per stage — these are what transition */
  const geom =
    stage === "pill"
      ? { width: pillW, height: PILL_H, borderRadius: RADIUS_PILL }
      : stage === "circle"
        ? { width: PILL_H, height: PILL_H, borderRadius: RADIUS_PILL }
        : stage === "bar"
          ? { width: PANEL_W, height: PILL_H, borderRadius: RADIUS_PILL }
          : { width: PANEL_W, height: panelH, borderRadius: RADIUS_PANEL };

  return (
    <div
      ref={rootRef}
      className={`chat-morph fixed bottom-4 left-4 z-[440] max-w-[calc(100vw-32px)] ${
        stage === "open" ? "open" : ""
      } ${stage === "pill" ? "idle cursor-pointer" : ""}`}
      style={geom}
    >
      {/* black backdrop — its own layer so idle hover grows the button
          without scaling what's inside it */}
      <div
        aria-hidden="true"
        className={`chat-bg absolute inset-0 rounded-[inherit] bg-black ${
          stage === "open"
            ? "shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
            : "shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
        }`}
      />

      {/* clip layer: rounds and crops everything while the box morphs —
          this edge is what wipes the prompts in and out. Pinned to
          scrollTop 0: focus/scroll-into-view must never shift the panel
          inside its own frame (overflow:hidden boxes still scroll) */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop !== 0) el.scrollTop = 0;
          if (el.scrollLeft !== 0) el.scrollLeft = 0;
        }}
      >
        {/* ===== panel face (header + body; the strip is the input row) ===== */}
        <section
          ref={panelFaceRef}
          role="dialog"
          aria-label={`Chat with ${ASSISTANT_NAME}, MIZU's AI assistant`}
          aria-hidden={stage !== "open"}
          className={`face-panel pointer-events-none absolute left-0 top-0 flex max-h-[calc(100dvh-32px)] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden text-white ${
            stage === "bar" || stage === "open" ? "" : "pb-14"
          } ${
            stage === "open" ? "opacity-100" : "opacity-0"
          }`}
          style={{
            /* room for the strip, which grows with the composer */
            paddingBottom: stage === "bar" || stage === "open" ? stripH : undefined,
          }}
        >
          {/* keyed wrapper: re-cascades the content on every open (and on
              view switches, which remount children as before) */}
          <div
            key={seq}
            className={`pointer-events-auto flex min-h-0 flex-1 flex-col ${
              stage === "open" ? "chat-panel-enter" : ""
            }`}
          >
            {/* header: tabs (greet/contact) or back (chat), close always */}
            <div className="relative flex shrink-0 items-center px-6 pt-4">
              {view === "chat" ? (
                <button
                  type="button"
                  aria-label="Back to greeting"
                  onClick={() => setView("greet")}
                  className={iconBtn}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
                    <path d="M14.5 5.5 8 12l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <nav className="flex items-center gap-4 pl-1" aria-label="Chat panels">
                  <button
                    type="button"
                    onClick={() => setView("greet")}
                    aria-pressed={view === "greet"}
                    className={`py-2 text-[15px] transition-colors duration-200 ${
                      view === "greet" ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("contact")}
                    aria-pressed={view === "contact"}
                    className={`py-2 text-[15px] transition-colors duration-200 ${
                      view === "contact" ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    Contact
                  </button>
                </nav>
              )}

              <button
                type="button"
                aria-label="Close chat"
                onClick={closeChat}
                className={`${iconBtn} absolute right-4 top-4`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {view === "greet" && (
              <>
                {/* portrait — no separate fill: same near-black as the panel,
                    so the block reads as one uniform surface until a real
                    portrait asset exists. Dots bloom outward on open. */}
                <div className="relative h-[min(300px,38dvh)] w-full shrink-0">
                  <DotsIcon
                    className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-beige/40"
                    bloom
                    bloomBase={350}
                  />
                </div>

                <div className="px-6 pt-4">
                  <p className="text-[14px] text-white/50">{ASSISTANT_NAME}</p>
                  <p className="mt-1 text-[19px] leading-[1.45] tracking-[-0.01em]">
                    {GREETING}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 px-6 pb-4 pt-5">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className={
                        i === 0
                          ? `${chip} bg-beige text-ink hover:bg-white`
                          : `${chip} bg-[#2b2b2b] text-white/60 hover:bg-[#333333] hover:text-white/90`
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {view === "chat" && (
              <div
                ref={logRef}
                role="log"
                aria-live="polite"
                aria-label="Conversation"
                className="chat-scroll flex-1 overflow-y-auto overscroll-contain px-6 pb-2 pt-3"
              >
                {messages.map((m, i) => (
                  <div key={i} className="mb-4">
                    <p className="text-[13px]">
                      <span className="font-medium text-white">
                        {m.from === "user" ? "You" : ASSISTANT_NAME}
                      </span>{" "}
                      <span className="text-white/40">{m.time}</span>
                    </p>
                    <p
                      className={`mt-0.5 text-[15px] leading-[1.5] [overflow-wrap:anywhere] ${
                        m.from === "user" ? "text-white/60" : "text-white/85"
                      }`}
                    >
                      {m.text}
                    </p>
                  </div>
                ))}

                {/* Nami at work: a shimmering activity label over the
                    bouncing dots while nothing has streamed yet ("Thinking…"
                    → "Reading up on our work…" when the tool fires), then
                    the label row collapses and the reply reveals in place,
                    dripping out as the stream arrives */}
                {thinking && !smooth.hasText && (
                  <div className="mb-4">
                    <p className="text-[13px]">
                      <span className="font-medium text-white">
                        {ASSISTANT_NAME}
                      </span>{" "}
                      <span className="shimmer-text text-[13px] font-medium">
                        {activity ?? "Thinking…"}
                      </span>
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"
                          style={{ animationDelay: `${i * 140}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {thinking && smooth.hasText && (
                  <div className="mb-4">
                    <p className="text-[13px]">
                      <span className="font-medium text-white">
                        {ASSISTANT_NAME}
                      </span>{" "}
                      <span className="text-white/40">
                        {pendingTimeRef.current}
                      </span>
                    </p>
                    <p className="mt-0.5 min-h-6 text-[15px] leading-[1.5] text-white/85 [overflow-wrap:anywhere]">
                      {smooth.revealed}
                    </p>
                  </div>
                )}
              </div>
            )}

            {view === "contact" && (
              <div className="px-6 pb-6 pt-4">
                <p className="text-[13px] text-white/50">Prefer a human?</p>
                <a
                  href="mailto:hello@mizu.studio"
                  className="relative mt-2 inline-block w-fit text-[19px] text-white no-underline after:absolute after:left-0 after:-bottom-[3px] after:h-px after:w-full after:bg-current after:origin-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.4,0,0.2,1)] hover:after:origin-left hover:after:scale-x-100"
                >
                  hello@mizu.studio
                </a>
                <p className="mt-3 text-[14px] leading-[1.5] text-white/60">
                  We reply within one business day.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ===== the persistent strip: one icon + one prompt slot ===== */}
        <div
          role={stage === "pill" ? "button" : undefined}
          tabIndex={stage === "pill" ? 0 : -1}
          aria-haspopup={stage === "pill" ? "dialog" : undefined}
          aria-label={
            stage === "pill" ? `Chat with ${ASSISTANT_NAME}, MIZU's AI assistant` : undefined
          }
          onClick={() => {
            if (stage === "pill") openChat();
          }}
          onKeyDown={(e) => {
            if (stage === "pill" && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              openChat();
            }
          }}
          onPointerEnter={(e) => {
            if (stage === "pill" && e.pointerType === "mouse") setSphereHover(true);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setSphereHover(false);
          }}
          className={`absolute bottom-0 left-0 flex w-full items-center gap-3 px-6 text-white [transition:height_.4s_cubic-bezier(.65,0,.35,1)] ${
            stage === "pill" || stage === "circle" ? "h-14" : ""
          }`}
          style={
            stage === "pill" || stage === "circle"
              ? undefined
              : { height: stripH }
          }
        >
          {/* THE mark — a real 3D dot sphere: drifts at rest, perks up
              under the mouse, agitates with white sparkles while Nami
              thinks, and does an elastic inhale through every morph */}
          <DotSphere className="h-7 w-7 shrink-0 text-white/80" mode={sphereMode} />

          {/* prompt slot: label and input are stacked absolutely, so the
              narrow box can never flex-squeeze them; the clip edge wipes
              them in/out and the slide does the hand-off */}
          <div className="relative h-full min-w-0 flex-1">
            <span
              aria-hidden={!labelVisible}
              className={`absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[14px] font-medium tracking-[-0.01em] ${
                labelVisible ? "visible" : "invisible"
              }`}
            >
              Let&rsquo;s work together
            </span>
            <textarea
              ref={composerRef}
              rows={1}
              value={input}
              tabIndex={showInput ? 0 : -1}
              aria-hidden={!showInput}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                /* hardware Enter sends (Shift+Enter stacks a line); touch
                   keyboards keep Enter for newlines — mobile sends with the
                   button beside the input */
                if (e.key === "Enter" && !e.shiftKey && finePointer()) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={
                cooldownLeft > 0
                  ? `Rate limited — try again in ${formatRetry(cooldownLeft)}`
                  : "Ask me anything..."
              }
              aria-label="Ask me anything"
              className="chat-scroll absolute left-0 right-0 top-1/2 h-[23px] resize-none bg-transparent text-[16px] leading-[1.45] text-white outline-none placeholder:text-white/40 [transition:transform_.4s_cubic-bezier(.65,0,.35,1)]"
              style={{
                /* same duration + curve as the geometry legs, so the
                   slide never slips relative to the moving wall */
                transform: showInput
                  ? "translateY(-50%)"
                  : `translate(${parkX}px, -50%)`,
              }}
            />

            {/* hidden measurer: constant text the pill width is derived
                from — absolute, so nothing can ever squeeze it */}
            <span
              aria-hidden="true"
              ref={measureRef}
              className="invisible pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[14px] font-medium tracking-[-0.01em]"
            >
              Let&rsquo;s work together
            </span>
          </div>

          {/* send — touch keyboards offer no send action, so the button
              exists exactly there (fine-pointer devices send with Enter);
              styled like the panel's round icon buttons */}
          <button
            type="button"
            aria-label="Send message"
            tabIndex={showInput ? 0 : -1}
            aria-hidden={!showInput}
            disabled={thinking || cooldownLeft > 0 || !input.trim()}
            onClick={() => send(input)}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-[background-color,color,opacity] duration-200 enabled:hover:bg-white/20 enabled:hover:text-white ${
              !showInput
                ? "pointer-events-none opacity-0"
                : thinking || cooldownLeft > 0 || !input.trim()
                  ? "opacity-40"
                  : "opacity-100"
            } [@media(hover:hover)_and_(pointer:fine)]:hidden`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 19V5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
