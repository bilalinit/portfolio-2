"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { featuredProjects, totalWork, workCategories } from "@/data/projects";
import ProjectThumb from "@/components/ProjectThumb";
import { FolderIcon } from "@/components/icons";

type WorkMenuProps = {
  open: boolean;
  onClose: () => void;
  /** mobile only: back to the main menu sheet */
  onBack: () => void;
  /** mobile only: close menu + panel entirely (the × button) */
  onCloseAll: () => void;
  onMenuMouseEnter?: () => void;
  onMenuMouseLeave?: () => void;
};

/* Menu lifecycle:
   - "open"    → staggered wmIn entrance (fill-forwards holds items visible)
   - "closing" → explicit wmOut fade while the panel slides away; a plain
                 transition can't be relied on here because removing the
                 entrance animation and fading must happen as one deliberate step
   - "closed"  → dormant, items hidden
   Reopening mid-fade cancels the exit and replays the entrance.
   Desktop: drops down from the top-right, opens on hover of the WORK
   trigger (the parent owns the open/close timers). The width is
   clamp(460px, 44vw, 720px): it used to be max(50vw + 24px, 750px),
   which pinned the panel at ~50% of the viewport on BOTH a 1440 laptop
   and a 1920 monitor — 750px on one, 984px on the other, so a 33% wider
   screen bought a 31% wider panel and nothing felt more generous. The
   clamp caps the panel in absolute px, so past ~1640px the panel takes a
   steadily smaller SHARE of the screen (44% → 36% at 1920 → 28% at
   2560) while the type and thumbs inside stop growing. The 460px floor
   matters: the trigger is anchored in the nav's right cluster, so
   anything much narrower would leave the trigger outside the panel and
   break the hover hand-off. The root is a size container (`@container`)
   and internal type/gaps/thumbs use cqw clamps, so proportions hold as
   the panel resizes.
   Mobile (≤860px): full-screen sheet that slides in from the LEFT,
   tap-driven from the mobile menu; "[+] MAIN MENU" goes back, "CLOSE [×]"
   closes everything. The sheet is mounted by MenuLayer in the root layout:
   its links navigate WITHOUT closing anything — when the route commits,
   MenuLayer closes the menus, so the slide-away always uncovers the page
   you asked for (never home, never a late blink). */
type Phase = "closed" | "open" | "closing";

const itemIn = "animate-[wmIn_0.55s_cubic-bezier(0.22,0.61,0.36,1)_forwards]";
const itemOut = "animate-[wmOut_0.3s_ease_forwards]";
const delays = [
  "[animation-delay:0.3s]",
  "[animation-delay:0.36s]",
  "[animation-delay:0.42s]",
  "[animation-delay:0.48s]",
  "[animation-delay:0.54s]",
];

/* per-phase classes for every animated child */
const item = (delay: string, phase: Phase) =>
  phase === "open"
    ? `opacity-0 ${itemIn} ${delay}`
    : phase === "closing"
      ? `opacity-0 ${itemOut}`
      : "opacity-0";

/* Category links — Website / Mobile App / Experiential / E-commerce.

   Sized SMALL and set MEDIUM, on purpose. Two earlier passes pushed these
   both the wrong ways and both looked worse:
     - 4.4cqw/32px at weight 350: far too large, and so thin the words read
       as an accident rather than a choice.
     - 19px/1.5vw at weight 500: too quiet to lead the panel.
   The fix is not a size between those two, it's to stop using size to carry
   the hierarchy at all. At ~20px the categories are barely larger than the
   row labels; WEIGHT (500) plus the tight tracking is what separates them,
   which keeps the panel compact and stops the category block from shouting
   over the projects it's meant to filter.

   vw, not cqw: these are set off the viewport deliberately, so the category
   block holds a steady relationship to the screen rather than growing with
   the panel. Note this contradicts the container-units argument below — it
   is a choice, not an oversight, and the weight is doing the work. */
const catLink =
  "relative w-fit text-[clamp(17px,1.35vw,22px)] font-medium tracking-[-0.02em] text-ink no-underline " +
  "after:content-[''] after:absolute after:left-0 after:-bottom-[3px] after:w-full after:h-px after:bg-current " +
  "after:scale-x-0 after:origin-right after:transition-transform after:duration-[350ms] after:ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "hover:after:scale-x-100 hover:after:origin-left max-[860px]:text-[24px]";

/* Micro labels — project name, blurb, code. These are the panel's quietest
   element by design: small, wide-tracked uppercase caps that sit under the
   categories without competing. 11px flat (not a clamp, not container units —
   scaling these with the panel is what produced the "screenshot of a bigger
   menu" feel) and slightly opened up at .05em so they stay legible at that
   size without getting bolder. */
const rowText =
  "text-[11px] font-medium tracking-[0.05em] uppercase leading-[1.4]";

const topButton =
  "text-[12px] font-medium uppercase tracking-[0.05em] text-ink transition-colors duration-200 hover:text-ink/60";

export default function WorkMenu({
  open,
  onClose,
  onBack,
  onCloseAll,
  onMenuMouseEnter,
  onMenuMouseLeave,
}: WorkMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("closed");

  /* drive the phase machine from the open prop */
  const openRef = useRef(open);
  useEffect(() => {
    const wasOpen = openRef.current;
    openRef.current = open;
    if (open === wasOpen) return;

    if (open) {
      setPhase("open");
      return;
    }

    /* fade contents out (~300ms), then settle into the dormant state */
    setPhase("closing");
    const t = setTimeout(() => setPhase("closed"), 320);
    return () => clearTimeout(t);
  }, [open]);

  /* click anywhere outside closes the menu (trigger is exempt) */
  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node;
      const trigger = document.getElementById("work-trigger");
      if (root.contains(target) || trigger?.contains(target)) return;
      onClose();
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open, onClose]);

  return (
    <>
      {/* dark backdrop over the rest of the site; below the panel (z-540)
          and the nav (z-600) so both stay bright, fades with the menu */}
      <div
        aria-hidden="true"
        className={
          open
            ? "pointer-events-none fixed inset-0 z-[450] bg-black/45 [transition:opacity_.45s_ease,visibility_0s]"
            : "pointer-events-none fixed inset-0 z-[450] bg-black/45 invisible opacity-0 [transition:opacity_.45s_ease,visibility_0s_linear_.45s]"
        }
      />

      <div
        ref={rootRef}
        id="work-menu"
        aria-hidden={!open}
        onPointerEnter={(e) => {
          /* the grace-period timers only matter for mouse hover */
          if (e.pointerType === "mouse") onMenuMouseEnter?.();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") onMenuMouseLeave?.();
        }}
        className={`@container fixed top-0 right-0 z-[540] w-[clamp(460px,44vw,720px)] max-h-[100dvh] overflow-y-auto overflow-x-clip overscroll-contain max-[860px]:bg-white ${
          open
            ? "visible [transform:translateY(0)] [transition:transform_.65s_cubic-bezier(.77,0,.18,1),visibility_0s] max-[860px]:inset-0 max-[860px]:w-full max-[860px]:[transform:translateX(0)]"
            : "invisible [transform:translateY(-103%)] [transition:transform_.65s_cubic-bezier(.77,0,.18,1),visibility_0s_linear_.65s] max-[860px]:inset-0 max-[860px]:w-full max-[860px]:[transform:translateX(-103%)]"
        }`}
      >
        {/* Category area. The top inset is what clears the nav strip, so it
            stays generous; the side padding is deliberately tight, because
            the category block is a compact two-column cluster now and the
            earlier roomy 34px gutters made it read as a separate section
            competing with the project list. */}
        <div className="relative bg-beige pt-[clamp(34px,6cqw,56px)] px-[clamp(18px,3.4cqw,28px)] pb-4 max-[860px]:px-5 max-[860px]:pt-14 max-[860px]:pb-4">
          {/* mobile-only: close everything */}
          <button
            type="button"
            onClick={onCloseAll}
            className={`absolute top-[16px] right-[18px] min-[861px]:hidden ${topButton} ${item(delays[0], phase)}`}
          >
            Close <span aria-hidden="true" className="ml-1">[×]</span>
          </button>

          {/* mobile-only: back to the main menu sheet */}
          <button
            type="button"
            onClick={onBack}
            className={`min-[861px]:hidden mb-8 block max-[860px]:mt-[100px] ${topButton} ${item(delays[0], phase)}`}
          >
            <span aria-hidden="true" className="mr-1">[+]</span> Main menu
          </button>

          <nav
            className="grid grid-cols-[auto_auto] justify-start gap-x-[clamp(28px,5cqw,64px)] gap-y-0.5 max-[860px]:gap-x-8 max-[860px]:gap-y-2"
            aria-label="Work categories"
          >
            {workCategories.map((cat, i) => (
              <Link
                key={cat.label}
                href={`/work/category/${cat.slug}`}
                className={`${catLink} ${item(delays[i], phase)} active:opacity-60`}
              >
                {cat.label}
                {/* the count rides high and reads as a quiet annotation on the
                    word, not a footnote — .5em, lifted, and dimmed so it
                    never competes with the category itself */}
                <sup className="text-[0.5em] font-normal leading-[0] relative -top-[0.85em] ml-1 text-ink/55">
                  {cat.count}
                </sup>
              </Link>
            ))}
          </nav>
        </div>

        {/* folder tab */}
        <div className="bg-white flex">
          <div
            className={`inline-flex items-center gap-2 h-[34px] pl-3.5 pr-8 bg-beige [clip-path:polygon(0_0,100%_0,calc(100%_-_15px)_100%,0_100%)] text-[11.5px] font-medium tracking-[0.08em] uppercase text-ink ${item(delays[1], phase)}`}
          >
            <FolderIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Featured projects</span>
          </div>
        </div>

        {/* featured projects list — overflow-clip stops the wmIn entrance
            (items rise from translateY(26px)) from extending this section's
            scrollable area; without it the "See all work" button's descent
            briefly overflows the panel and pops a scrollbar for ~0.5s */}
        <div className="overflow-clip bg-white px-3.5 pb-3.5 max-[860px]:px-5 max-[860px]:pb-5">
          <div className="border-t border-[#ddd7ca]">
            {featuredProjects.map((project, i) => {
              return (
                <Link
                  key={project.slug}
                  href={`/work/${project.slug}`}
                  className={`grid grid-cols-[clamp(112px,15.6cqw,200px)_1fr_1.35fr_auto] gap-[clamp(20px,2.8cqw,40px)] items-center py-[clamp(12px,1.7cqw,26px)] border-b border-[#ddd7ca] no-underline text-ink transition-[background-color] duration-[250ms] hover:bg-[#f4f0e7] active:bg-[#eee8da] @max-[600px]:grid-cols-[clamp(88px,17cqw,132px)_1fr_auto] @max-[600px]:gap-[clamp(12px,2cqw,20px)] max-[860px]:grid-cols-[130px_1fr_auto] max-[860px]:grid-rows-[auto_1fr] max-[860px]:gap-x-4 max-[860px]:gap-y-1 ${item(delays[Math.min(i + 2, delays.length - 1)], phase)}`}
                >
                  <span
                    aria-hidden="true"
                    className="w-[clamp(112px,15.6cqw,200px)] h-[clamp(94px,13cqw,166px)] overflow-hidden @max-[600px]:w-[clamp(88px,17cqw,132px)] @max-[600px]:h-[clamp(74px,13cqw,110px)] max-[860px]:row-span-2 max-[860px]:w-[130px] max-[860px]:h-[150px] [&>svg]:block [&>svg]:w-full [&>svg]:h-full [&>img]:block [&>img]:w-full [&>img]:h-full [&>img]:object-cover"
                  >
                    <ProjectThumb kind={project.thumb} />
                  </span>
                  <span className={`${rowText} max-[860px]:col-start-2`}>{project.name}</span>
                  <span className={`${rowText} @max-[600px]:hidden max-[860px]:col-start-2`}>{project.blurb}</span>
                  <span className={`${rowText} text-right max-[860px]:col-start-3 max-[860px]:row-start-2 max-[860px]:self-end`}>{project.tag}</span>
                </Link>
              );
            })}
          </div>

          <Link
            href="/work"
            className={`flex items-center justify-center h-[40px] mt-3 border border-ink text-ink no-underline text-[11.5px] font-medium tracking-[0.08em] uppercase transition-colors duration-300 hover:bg-ink hover:text-white active:bg-ink/90 active:text-white ${item(delays[4], phase)}`}
          >
            See all work [{totalWork}]
          </Link>
        </div>
      </div>
    </>
  );
}
