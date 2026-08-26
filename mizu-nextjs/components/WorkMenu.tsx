"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { allWork, featuredProjects, totalWork, workCategories } from "@/data/projects";
import ProjectThumb from "@/components/ProjectThumb";
import { FolderIcon } from "@/components/icons";

/* featured rows link straight to their /work/[slug] case studies */
const slugByName = new Map(allWork.map((w) => [w.name, w.slug]));

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
   trigger (the parent owns the open/close timers).
   Mobile (≤860px): full-screen sheet that slides in from the LEFT,
   tap-driven from the mobile menu; "[+] MAIN MENU" goes back, "CLOSE [×]"
   closes everything. */
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

/* underline-on-hover for the category links */
const catLink =
  "relative w-fit text-[clamp(19px,1.5vw,28px)] font-medium tracking-[-0.02em] text-ink no-underline " +
  "after:content-[''] after:absolute after:left-0 after:-bottom-[3px] after:w-full after:h-px after:bg-current " +
  "after:scale-x-0 after:origin-right after:transition-transform after:duration-[350ms] after:ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "hover:after:scale-x-100 hover:after:origin-left max-[860px]:text-[24px]";

const rowText = "text-[11.5px] font-medium tracking-[0.03em] uppercase leading-[1.4]";

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
        className={
          open
            ? "fixed top-0 right-0 z-[540] w-[min(750px,100%)] max-h-[100dvh] overflow-y-auto overscroll-contain visible [transform:translateY(0)] [transition:transform_.65s_cubic-bezier(.77,0,.18,1),visibility_0s] max-[860px]:inset-0 max-[860px]:w-full max-[860px]:[transform:translateX(0)]"
            : "fixed top-0 right-0 z-[540] w-[min(750px,100%)] max-h-[100dvh] overflow-y-auto overscroll-contain invisible [transform:translateY(-103%)] [transition:transform_.65s_cubic-bezier(.77,0,.18,1),visibility_0s_linear_.65s] max-[860px]:inset-0 max-[860px]:w-full max-[860px]:[transform:translateX(-103%)]"
        }
      >
        {/* beige category area */}
        <div className="relative bg-beige pt-[70px] px-[30px] pb-5 max-[860px]:px-5 max-[860px]:pt-14 max-[860px]:pb-4">
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
            className="grid grid-cols-[auto_auto] justify-start gap-x-11 gap-y-1.5 max-[860px]:gap-x-8 max-[860px]:gap-y-2"
            aria-label="Work categories"
          >
            {workCategories.map((cat, i) => (
              <Link
                key={cat.label}
                href={`/work/category/${cat.slug}`}
                className={`${catLink} ${item(delays[i], phase)}`}
                onClick={onCloseAll}
              >
                {cat.label}
                <sup className="text-[0.45em] leading-[0] relative -top-[0.8em] ml-1">
                  {cat.count}
                </sup>
              </Link>
            ))}
          </nav>
        </div>

        {/* folder tab */}
        <div className="bg-white flex">
          <div
            className={`inline-flex items-center gap-2 h-[34px] pl-3.5 pr-8 bg-beige [clip-path:polygon(0_0,100%_0,calc(100%_-_15px)_100%,0_100%)] text-[11.5px] font-medium tracking-[0.05em] uppercase text-ink ${item(delays[1], phase)}`}
          >
            <FolderIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Featured projects</span>
          </div>
        </div>

        {/* featured projects list */}
        <div className="bg-white px-3.5 pb-3.5 max-[860px]:px-5 max-[860px]:pb-5">
          <div className="border-t border-[#ddd7ca]">
            {featuredProjects.map((project, i) => {
              const slug = slugByName.get(project.name);
              return (
                <Link
                  key={project.code}
                  href={slug ? `/work/${slug}` : "#"}
                  onClick={onCloseAll}
                  className={`grid grid-cols-[112px_1fr_1.35fr_76px] gap-5 items-center py-3 border-b border-[#ddd7ca] no-underline text-ink transition-[background-color] duration-[250ms] hover:bg-[#f4f0e7] min-[861px]:max-[1024px]:grid-cols-[88px_1fr_70px] max-[860px]:grid-cols-[130px_1fr_auto] max-[860px]:grid-rows-[auto_1fr] max-[860px]:gap-x-4 max-[860px]:gap-y-1 ${item(delays[Math.min(i + 2, delays.length - 1)], phase)}`}
                >
                  <span
                    aria-hidden="true"
                    className="w-[112px] h-[94px] overflow-hidden min-[861px]:max-[1024px]:w-[88px] min-[861px]:max-[1024px]:h-[74px] max-[860px]:row-span-2 max-[860px]:w-[130px] max-[860px]:h-[150px] [&>svg]:block [&>svg]:w-full [&>svg]:h-full"
                  >
                    <ProjectThumb kind={project.thumb} />
                  </span>
                  <span className={`${rowText} max-[860px]:col-start-2`}>{project.name}</span>
                  <span className={`${rowText} min-[861px]:max-[1024px]:hidden max-[860px]:col-start-2`}>{project.description}</span>
                  <span className={`${rowText} text-right max-[860px]:col-start-3 max-[860px]:row-start-2 max-[860px]:self-end`}>{project.code}</span>
                </Link>
              );
            })}
          </div>

          <Link
            href="/work"
            onClick={onCloseAll}
            className={`flex items-center justify-center h-10 mt-3 border border-ink text-ink no-underline text-[11.5px] font-medium tracking-[0.05em] uppercase transition-colors duration-300 hover:bg-ink hover:text-white ${item(delays[4], phase)}`}
          >
            See all work [{totalWork}]
          </Link>
        </div>
      </div>
    </>
  );
}
