"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { briefSteps, buildQuoteDraft, customPlan, quoteCopy, recurringPlans, serviceScopeOptions } from "@/data/pricing";
import { gmailComposeUrl } from "@/lib/contact";

/* Pricing section — ported from price.html (original gray palette) with
   the exact animation
   choreography (all keyframes/easings live in globals.css under .pr-*):
   - tab indicator: elastic translateX, 0.6s cubic-bezier(0.34,1.56,0.64,1)
   - panels: opacity 0.4s + elastic transform 0.6s cross-fade
   - form steps: staggered stepIn (50ms steps)
   - pricing cards: staggered cardIn (80ms steps)
   - form steps dim to 40% until focused or filled

   The section is functional: the Single tab is a four-question brief that
   assembles itself into a pre-filled Gmail draft as the visitor
   picks options — we read the email and answer with a real number. The
   Recurring cards open plan-specific drafts the same way. */

type Tab = "single" | "recurring";

/* the house CTA of this section — same pill the recurring cards use */
const ctaClass =
  "w-full rounded-[10px] bg-[#1a1a1a] py-3.5 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-white [transition:transform_.2s_ease,opacity_.2s_ease] hover:-translate-y-px hover:opacity-90";

export default function Pricing() {
  const [tab, setTab] = useState<Tab>("single");
  /* focused form step (the reference starts with step 1 lit) */
  const [activeStep, setActiveStep] = useState(0);

  /* the brief — four required picks + one optional notes line */
  const [picks, setPicks] = useState<string[]>(["", "", "", ""]);
  const [notes, setNotes] = useState("");
  const ready = picks.every(Boolean);
  const scopeOptions = serviceScopeOptions[picks[0]] || briefSteps[1].options;

  /* the demo page had this section above the fold, so its entrance
     played on load; here it sits below the skills section, so the first
     activation waits until the section scrolls into view */
  const [revealed, setRevealed] = useState(false);
  const revealRef = useRef<HTMLElement>(null);

  /* panels are absolutely positioned for the cross-fade, so the wrapper
     needs to track the active panel's height */
  const singleRef = useRef<HTMLDivElement>(null);
  const recurringRef = useRef<HTMLDivElement>(null);
  const [minH, setMinH] = useState(600);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = tab === "single" ? singleRef.current : recurringRef.current;
      if (el) setMinH(Math.max(600, el.offsetHeight));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab, revealed]);

  const setPick = (i: number, value: string) => {
    setPicks((prev) => prev.map((p, j) => {
      if (j === i) return value;
      if (i === 0 && j === 1 && value !== prev[0]) return "";
      return p;
    }));
  };

  /* the assembled draft */
  const draft = useMemo(() => buildQuoteDraft(picks, notes), [picks, notes]);
  const briefHref = gmailComposeUrl(draft.subject, draft.body);

  const singleActive = revealed && tab === "single";
  const recurringActive = revealed && tab === "recurring";

  return (
    <section
      id="pricing"
      ref={revealRef}
      className="bg-[#f0f0f0] px-6 py-20 text-[#1a1a1a] max-[860px]:px-[18px]"
    >
      <div className="mx-auto grid w-full max-w-[1100px] gap-10 min-[901px]:grid-cols-[320px_1fr] min-[901px]:gap-20">
        {/* ===== left column ===== */}
        <div className="min-[901px]:sticky min-[901px]:top-20 min-[901px]:self-start">
          <h2 className="mb-6 text-[clamp(48px,6.5vw,72px)] font-medium leading-[1.05] tracking-[-0.04em]">
            Simple
            <br />
            pricing
          </h2>
          <p className="mb-4 max-w-[300px] text-[15px] leading-[1.6] text-[#666666]">
            Most projects will be priced according to your needs, but we can
            still give a clear idea of timelines and budget.
          </p>
          <p className="max-w-[300px] text-[15px] leading-[1.6] text-[#666666]">
            For ongoing demands, we can also offer monthly engagements.
          </p>
        </div>

        {/* ===== right column ===== */}
        <div>
          {/* tab switcher (elastic indicator) */}
          <div className="relative mb-6 grid w-fit grid-cols-2 rounded-full bg-[#e8e8e8] p-1">
            <div
              aria-hidden="true"
              className="pr-indicator absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] will-change-transform [transition:transform_.6s_cubic-bezier(.34,1.56,.64,1)]"
              style={{
                transform: tab === "single" ? "translateX(0)" : "translateX(100%)",
              }}
            />
            <button
              type="button"
              onClick={() => setTab("single")}
              aria-pressed={tab === "single"}
              className={`relative z-[1] rounded-full px-6 py-2.5 text-[14px] font-medium transition-colors duration-300 ${
                tab === "single" ? "text-[#1a1a1a]" : "text-[#666666]"
              }`}
            >
              Single project
            </button>
            <button
              type="button"
              onClick={() => setTab("recurring")}
              aria-pressed={tab === "recurring"}
              className={`relative z-[1] rounded-full px-6 py-2.5 text-[14px] font-medium transition-colors duration-300 ${
                tab === "recurring" ? "text-[#1a1a1a]" : "text-[#666666]"
              }`}
            >
              Recurring
            </button>
          </div>

          {/* panels */}
          <div className="relative" style={{ minHeight: minH }}>
            {/* single project — the brief */}
            <div
              ref={singleRef}
              aria-hidden={!singleActive}
              className={`pr-panel ${singleActive ? "active" : ""}`}
            >
              <div className="rounded-[24px] bg-white p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] max-[640px]:p-6">
                <div className="mb-8">
                  <h3 className="mb-2 text-[32px] font-medium tracking-[-0.02em]">
                    Single Project
                  </h3>
                  <p className="text-[14px] text-[#666666]">
                    {quoteCopy.description}
                  </p>
                </div>

                {briefSteps.map((step, i) => (
                  <div
                    key={step.label}
                    className={`pr-step mb-6 opacity-40 transition-opacity duration-300 ${
                      activeStep === i || picks[i] ? "opacity-100" : ""
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f0f0] text-[12px] font-semibold">
                        {i + 1}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#aaaaaa]">
                        {step.label}
                      </div>
                    </div>
                    <select
                      className="pr-select"
                      aria-label={step.label}
                      value={picks[i]}
                      onFocus={() => setActiveStep(i)}
                      onChange={(e) => setPick(i, e.target.value)}
                    >
                      <option value="">{step.placeholder}</option>
                      {(i === 1 ? scopeOptions : step.options).map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    {step.hint && <p className="mt-2 text-[12px] leading-[1.5] text-[#666666]">{step.hint}</p>}
                  </div>
                ))}

                {/* optional notes */}
                <div
                  className={`pr-step mb-8 opacity-40 transition-opacity duration-300 ${
                    activeStep === 4 || notes ? "opacity-100" : ""
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f0f0] text-[12px] font-semibold">
                      5
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#aaaaaa]">
                      {quoteCopy.notesLabel}
                    </div>
                  </div>
                  <input
                    type="text"
                    className="pr-input"
                    aria-label={quoteCopy.notesLabel}
                    placeholder={quoteCopy.notesPlaceholder}
                    maxLength={300}
                    value={notes}
                    onFocus={() => setActiveStep(4)}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* single CTA — opens the pre-filled email draft */}
                {ready ? (
                  <a href={briefHref} target="_blank" rel="noopener noreferrer" className={`${ctaClass} block`}>
                    Get a quote
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={`${ctaClass} cursor-not-allowed opacity-40`}
                  >
                    Get a quote
                  </button>
                )}
                <p className="mt-3 text-center text-[12px] leading-[1.5] text-[#666666]">{quoteCopy.draftHint}</p>
              </div>
            </div>

            {/* recurring */}
            <div
              ref={recurringRef}
              aria-hidden={!recurringActive}
              className={`pr-panel ${recurringActive ? "active" : ""}`}
            >
              <div className="mb-4 rounded-[24px] bg-white p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] max-[640px]:p-6">
                <h3 className="mb-2 text-[32px] font-medium tracking-[-0.02em]">
                  Recurring collaboration
                </h3>
                <p className="text-[14px] text-[#666666]">
                  For ongoing needs, with flexible capacity and continuous
                  delivery over time.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-2">
                {recurringPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className="pr-card flex flex-col rounded-[24px] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#666666]">
                      {plan.name}
                    </div>
                    <div className="mb-2 text-[48px] font-semibold leading-none tracking-[-0.03em]">
                      {plan.price}
                      <span className="text-[18px] font-normal text-[#666666]">
                        /month
                      </span>
                    </div>
                    <p className="mb-6 text-[13px] leading-[1.5] text-[#666666]">
                      {plan.desc}
                    </p>
                    <ul className="flex-1">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="border-t border-[#e5e5e5] py-2.5 text-[13px] text-[#666666]"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a
                      target="_blank" rel="noopener noreferrer"
                      href={gmailComposeUrl(
                        plan.subject,
                        [
                          "Hi MIZU,",
                          "",
                          plan.bodyIntro,
                          "",
                          ...plan.features.map((f) => `- ${f}`),
                          "",
                          quoteCopy.emailSuffix,
                        ].join("\n")
                      )}
                      className="mt-6 w-full rounded-[10px] bg-[#1a1a1a] py-3.5 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-white no-underline [transition:transform_.2s_ease,opacity_.2s_ease] hover:-translate-y-px hover:opacity-90"
                    >
                      {plan.cta}
                    </a>
                  </div>
                ))}

                {/* custom engagement — wide strip below the two plans */}
                <div className="pr-card flex flex-col rounded-[24px] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] min-[901px]:col-span-2 min-[901px]:flex-row min-[901px]:items-center min-[901px]:justify-between min-[901px]:gap-8 min-[901px]:px-10">
                  <div className="max-[900px]:mb-5">
                    <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#666666]">
                      {customPlan.name}
                    </div>
                    <p className="max-w-[560px] text-[14px] leading-[1.55] text-[#1a1a1a]">
                      {customPlan.desc}
                    </p>
                  </div>
                  <a
                    target="_blank" rel="noopener noreferrer"
                    href={gmailComposeUrl(
                      customPlan.subject,
                      [
                        "Hi MIZU,",
                        "",
                        customPlan.bodyIntro,
                        "",
                        "- What we need built:",
                        "- Roughly how much of your time:",
                        "- For how long:",
                        "",
                        quoteCopy.emailSuffix,
                      ].join("\n")
                    )}
                    className="w-full shrink-0 rounded-[10px] border border-[#1a1a1a]/25 py-3.5 px-6 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[#1a1a1a] no-underline [transition:background-color_.2s_ease] hover:bg-[#e8e8e8] min-[901px]:w-auto"
                  >
                    {customPlan.cta}
                  </a>
                </div>
              </div>

              <p className="mt-4 px-2 text-center text-[12px] text-[#666666]">
                Pause or cancel monthly · Roll unused days · No lock-in
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
