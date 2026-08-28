"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotsIcon } from "@/components/icons";
import DotSphere, { type SphereMode } from "@/components/DotSphere";

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

   Backend-agnostic: every send routes through `sendToAgent`, currently
   a canned preview reply. Swap its body when the Python agent
   (OpenAI Agents SDK) lands behind /api/agent. */

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

/* placeholder replies until the Agents SDK backend exists */
const PREVIEW_REPLIES = [
  "I'm a preview for now — my real brain (an OpenAI Agents SDK backend) is still being wired in. Soon I'll walk you through projects, pricing and process.",
  "Meanwhile: MIZU builds websites, mobile apps, brand systems and e-commerce. Move fast, build to last.",
  "Try the WORK menu up top, or reach a human via the Contact tab — hello@mizu.studio.",
];

async function sendToAgent(_text: string): Promise<string> {
  /* TODO: POST to the Python agent (OpenAI Agents SDK) and return its reply */
  await new Promise((r) => setTimeout(r, 900)); /* pretend latency */
  return PREVIEW_REPLIES[Math.floor(Math.random() * PREVIEW_REPLIES.length)];
}

const now = () =>
  new Date()
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .toLowerCase();

/* ===== morph geometry ===== */
const PILL_H = 56; /* h-14 — the strip's height at pill/circle */
const STRIP_H_OPEN = 72; /* hosting the live input restores the original 24/20 row rhythm */
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

const iconBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors duration-200 hover:bg-white/20 hover:text-white";

export default function ChatWidget() {
  /* morph stage machine (drives the container's width/height/radius) */
  const [stage, setStage] = useState<Stage>("pill");
  const [dir, setDir] = useState<Dir>(null);
  const [view, setView] = useState<View>("greet");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
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

  const measureRef = useRef<HTMLSpanElement>(null);
  const panelFaceRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, [stage, view]);

  /* keep the log pinned to the newest message */
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, { from: "user", text, time: now() }]);
    setInput("");
    setView("chat");
    setThinking(true);
    const reply = await sendToAgent(text);
    setMessages((m) => [...m, { from: "agent", text: reply, time: now() }]);
    setThinking(false);
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
      className={`chat-morph fixed bottom-4 left-4 z-[440] ${
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
          this edge is what wipes the prompts in and out */}
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        {/* ===== panel face (header + body; the strip is the input row) ===== */}
        <section
          ref={panelFaceRef}
          role="dialog"
          aria-label={`Chat with ${ASSISTANT_NAME}, MIZU's AI assistant`}
          aria-hidden={stage !== "open"}
          className={`face-panel pointer-events-none absolute left-0 top-0 flex max-h-[calc(100dvh-32px)] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden text-white ${
            stage === "bar" || stage === "open" ? "pb-[72px]" : "pb-14"
          } ${
            stage === "open" ? "opacity-100" : "opacity-0"
          }`}
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
                className="flex-1 overflow-y-auto overscroll-contain px-6 pb-2 pt-3"
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
                      className={`mt-0.5 text-[15px] leading-[1.5] ${
                        m.from === "user" ? "text-white/60" : "text-white/85"
                      }`}
                    >
                      {m.text}
                    </p>
                  </div>
                ))}

                {thinking && (
                  <div className="mb-4">
                    <p className="text-[13px]">
                      <span className="font-medium text-white">{ASSISTANT_NAME}</span>
                      <span className="text-white/40"> is typing</span>
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
            stage === "pill" || stage === "circle" ? "h-14" : "h-[72px]"
          }`}
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
            <input
              ref={inputRef}
              type="text"
              value={input}
              tabIndex={showInput ? 0 : -1}
              aria-hidden={!showInput}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(input);
              }}
              placeholder="Ask me anything..."
              aria-label="Ask me anything"
              className="absolute inset-0 h-full w-full bg-transparent text-[16px] text-white outline-none placeholder:text-white/40 [transition:transform_.4s_cubic-bezier(.65,0,.35,1)]"
              style={{
                /* same duration + curve as the geometry legs, so the
                   slide never slips relative to the moving wall */
                transform: showInput ? "translateX(0)" : `translateX(${parkX}px)`,
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
        </div>
      </div>
    </div>
  );
}
