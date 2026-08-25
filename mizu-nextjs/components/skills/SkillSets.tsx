"use client";

import { useEffect, useRef, useState } from "react";
import { skillGroups, skillsIntro } from "@/data/skills";

/* "Design skill sets" section — B2 "Rows" layout.
   Entrance: drift — the left column slides in from the left, the rows
   from the right, staggered via the --d custom property (CSS in
   globals.css). Elements stay hidden until the section scrolls into
   view, and everything appears instantly under prefers-reduced-motion.

   Each skill row expands its detail on hover (mouse). Tap/click still
   toggles for touch and keyboard users; only one row stays open.
   Height animates via the grid-template-rows 0fr→1fr trick. */
export default function SkillSets() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={`sk bg-coal px-[clamp(20px,2.5vw,44px)] py-[clamp(80px,9vw,160px)] ${
        shown ? "is-shown" : ""
      }`}
    >
      <div className="mx-auto grid w-[min(1760px,100%)] gap-y-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-[clamp(48px,7vw,140px)]">
        {/* ===== left column (drifts in from the left) ===== */}
        <div>
          <div className="el el-l" style={d(0)}>
            <p className="text-[12px] uppercase tracking-[0.08em] text-white/40">
              (Skills)
            </p>
          </div>

          <div className="el el-l" style={d(90)}>
            <h2 className="mt-6 text-[clamp(34px,3.4vw,58px)] font-normal leading-[1.05] tracking-[-0.02em] text-white">
              Design
              <br />
              skill sets
            </h2>
          </div>

          <div className="el el-l" style={d(200)}>
            <p className="mt-8 max-w-[380px] text-[14px] leading-[1.5] text-white/50">
              {skillsIntro}
            </p>
          </div>
        </div>

        {/* ===== right column: accordion rows (drift in from the right) ===== */}
        <div className="flex flex-col gap-12">
          {skillGroups.map((group, gi) => {
            const hd = 240 + gi * 180;
            return (
              <section
                key={group.title}
                aria-label={group.title}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="el absolute left-0 top-0 h-px w-full bg-white/15"
                  style={d(hd)}
                />

                <div
                  className="el el-r flex items-baseline justify-between pt-5"
                  style={d(hd + 40)}
                >
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.08em] text-white/70">
                    {group.title}
                  </h3>
                  <span className="text-[12px] text-white/35">
                    {group.count}
                  </span>
                </div>

                <ul className="pt-2">
                  {group.skills.map((skill, i) => {
                    const rd = 320 + gi * 180 + i * 60;
                    const key = `${gi}-${i}`;
                    const open = openKey === key;
                    return (
                      <li
                        key={skill.name}
                        className="relative"
                        onPointerEnter={(e) => {
                          if (e.pointerType === "mouse") setOpenKey(key);
                        }}
                        onPointerLeave={(e) => {
                          if (e.pointerType === "mouse")
                            setOpenKey((k) => (k === key ? null : k));
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="el absolute bottom-0 left-0 h-px w-full bg-white/[0.08]"
                          style={d(rd)}
                        />
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={`skill-panel-${key}`}
                          onClick={() => setOpenKey(open ? null : key)}
                          style={d(rd + 40)}
                          className={`el el-r group flex w-full items-center gap-3 py-[14px] text-left text-[clamp(15px,1.1vw,19px)] transition-colors duration-200 ${
                            open ? "text-white" : "text-white/60 hover:text-white"
                          }`}
                        >
                          {/* chevron: slides in on hover, points down when open */}
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 8 12"
                            fill="none"
                            className={`h-3 w-2 shrink-0 transition-all duration-200 ${
                              open
                                ? "translate-x-0 rotate-90 opacity-60"
                                : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                            }`}
                          >
                            <path
                              d="M1.5 1l5 5-5 5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <span className="flex-1">{skill.name}</span>
                          <span className="text-[11px] tabular-nums text-white/30">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </button>

                        {/* expandable detail (opens on hover, 400ms) */}
                        <div
                          id={`skill-panel-${key}`}
                          className={`grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                            open
                              ? "[grid-template-rows:1fr]"
                              : "[grid-template-rows:0fr]"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="max-w-[560px] pb-[16px] pl-5 text-[13.5px] leading-[1.55] text-white/45">
                              {skill.detail}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
