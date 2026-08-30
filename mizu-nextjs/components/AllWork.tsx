"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { allWork, totalWork, workCategories } from "@/data/projects";
import type { WorkItem } from "@/data/projects";
import ProjectThumb from "@/components/ProjectThumb";

/* "All work" grid — the /work page body, modeled on the reference grid
   (allwork.png): dark canvas, portrait cards, centered title + meta
   line under each. The page has no shell, so the back link lives here
   at the top of the section. Each card links to its /work/[slug] case
   study. With `items`/`activeCategory` it doubles as the filtered
   category view (/work/category/[slug]): the chip swaps for the active
   filter, linking back to the full grid. Entrance: rise — elements
   drift up, staggered via the --d custom property (CSS in globals.css),
   revealed when the section scrolls into view; everything appears
   instantly under prefers-reduced-motion. */

type AllWorkProps = {
  items?: WorkItem[];
  /** label of the active filter, e.g. "Website" — shows the clear chip */
  activeCategory?: string;
};

export default function AllWork({ items = allWork, activeCategory }: AllWorkProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

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
      { threshold: 0.05 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  const [first, second, third, fourth] = workCategories;

  return (
    <section
      ref={ref}
      className={`aw bg-coal px-[clamp(20px,2.5vw,44px)] pt-[clamp(24px,3vw,44px)] pb-[clamp(80px,9vw,160px)] ${
        shown ? "is-shown" : ""
      }`}
    >
      <div className="mx-auto w-[min(1760px,100%)]">
        {/* back to the landing page */}
        <div className="el" style={d(0)}>
          <Link
            href="/"
            className="inline-flex items-center py-2 text-[12px] font-medium uppercase tracking-[0.05em] text-white no-underline transition-colors duration-200 hover:text-white/60"
          >
            <span aria-hidden="true" className="mr-1">[+]</span> Back
          </Link>
        </div>

        {/* ===== header ===== */}
        <div className="el mt-[clamp(56px,6vw,116px)]" style={d(80)}>
          <p className="text-[12px] uppercase tracking-[0.08em] text-white/40">
            (Work)
          </p>
        </div>

        <div className="el" style={d(160)}>
          <h1 className="mt-6 text-[clamp(28px,3vw,46px)] font-normal leading-[1.05] tracking-[-0.02em] text-white">
            Mizu Studio <span className="text-white/40">/ Work</span>
          </h1>
        </div>

        <div className="el mt-5 flex flex-col items-start gap-1.5" style={d(240)}>
          {activeCategory ? (
            /* filtered view: the chip clears the filter */
            <Link
              href="/work"
              className="inline-flex items-center bg-white/10 px-1.5 py-0.5 text-[12px] leading-[1.5] text-white/80 no-underline transition-colors duration-200 hover:bg-white/20"
            >
              [×] {activeCategory} [{items.length}] — show all
            </Link>
          ) : (
            <>
              <p className="bg-white/10 px-1.5 py-0.5 text-[12px] leading-[1.5] text-white/80">
                [+] All work [{totalWork}]
              </p>
              <p className="text-[12px] leading-[1.5] text-white/40">
                {first.label} [{first.count}] — {second.label} [{second.count}]
              </p>
              <p className="text-[12px] leading-[1.5] text-white/40">
                {third.label} [{third.count}] — {fourth.label} [{fourth.count}]
              </p>
            </>
          )}
        </div>

        {/* ===== card grid: 2 cols mobile, 3 tablet, 4 desktop ===== */}
        <div className="mt-[clamp(48px,6vw,96px)] grid grid-cols-2 gap-x-[clamp(18px,2.5vw,40px)] gap-y-[clamp(44px,5.5vw,84px)] min-[861px]:grid-cols-3 min-[1025px]:grid-cols-4">
          {items.map((item, i) => (
            <Link
              key={item.name}
              href={`/work/${item.slug}`}
              className="el group block no-underline outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              style={d(Math.min(i * 55, 400))}
            >
              <div className="aspect-[3/4] overflow-hidden bg-[#1c1c1c] [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:transition-transform [&>svg]:duration-700 [&>svg]:ease-[cubic-bezier(0.22,0.61,0.36,1)] [&:hover>svg]:scale-[1.04] [&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-700 [&>img]:ease-[cubic-bezier(0.22,0.61,0.36,1)] [&:hover>img]:scale-[1.04]">
                <ProjectThumb kind={item.thumb} />
              </div>
              <p className="relative mx-auto mt-[clamp(14px,1.6vw,22px)] w-fit text-[13px] leading-[1.4] text-white after:absolute after:left-0 after:-bottom-[3px] after:h-px after:w-full after:bg-current after:origin-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:after:origin-left group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100 group-focus-visible:after:origin-left">
                {item.name}
              </p>
              <p className="mt-1 text-center text-[12.5px] leading-[1.4] text-white/40">
                {item.category} — {item.year}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
