"use client";

import { useEffect, useRef } from "react";
import { featuredProjects } from "@/data/projects";
import ProjectThumb from "@/components/ProjectThumb";
import { FolderIcon } from "@/components/icons";

type WorkMenuProps = {
  open: boolean;
  onClose: () => void;
};

/* staggered entrance: base state hides items, .open plays the wmIn keyframe;
   the always-on opacity transition gives the soft fade while closing */
const itemIn = "animate-[wmIn_0.55s_cubic-bezier(0.22,0.61,0.36,1)_forwards]";
const delays = [
  "[animation-delay:0.3s]",
  "[animation-delay:0.36s]",
  "[animation-delay:0.42s]",
  "[animation-delay:0.48s]",
  "[animation-delay:0.54s]",
];
const item = (delay: string, open: boolean) =>
  `opacity-0 transition-opacity duration-300 ${open ? `${itemIn} ${delay}` : ""}`;

/* underline-on-hover for the category links */
const catLink =
  "relative w-fit text-[clamp(19px,1.5vw,28px)] font-medium tracking-[-0.02em] text-ink no-underline " +
  "after:content-[''] after:absolute after:left-0 after:-bottom-[3px] after:w-full after:h-px after:bg-current " +
  "after:scale-x-0 after:origin-right after:transition-transform after:duration-[350ms] after:ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "hover:after:scale-x-100 hover:after:origin-left";

const rowText = "text-[11.5px] font-medium tracking-[0.03em] uppercase leading-[1.4]";

export default function WorkMenu({ open, onClose }: WorkMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

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
    <div
      ref={rootRef}
      id="work-menu"
      aria-hidden={!open}
      className={
        open
          ? "fixed top-0 right-0 z-[500] w-[min(750px,100%)] visible [transform:translateY(0)] [transition:transform_.65s_cubic-bezier(.77,0,.18,1),visibility_0s] max-[860px]:w-full"
          : "fixed top-0 right-0 z-[500] w-[min(750px,100%)] invisible [transform:translateY(-103%)] [transition:transform_.65s_cubic-bezier(.77,0,.18,1),visibility_0s_linear_.65s] max-[860px]:w-full"
      }
    >
      {/* beige category area */}
      <div className="bg-beige pt-[70px] px-[30px] pb-5 max-[860px]:pt-16 max-[860px]:px-5 max-[860px]:pb-[18px]">
        <nav
          className="grid grid-cols-[auto_auto] justify-start gap-x-11 gap-y-1.5 max-[860px]:gap-x-7"
          aria-label="Work categories"
        >
          <a href="#" className={`${catLink} ${item(delays[0], open)}`} onClick={(e) => { e.preventDefault(); onClose(); }}>
            Website<sup className="text-[0.45em] leading-[0] relative -top-[0.8em] ml-1">7</sup>
          </a>
          <a href="#" className={`${catLink} ${item(delays[1], open)}`} onClick={(e) => { e.preventDefault(); onClose(); }}>
            Mobile App<sup className="text-[0.45em] leading-[0] relative -top-[0.8em] ml-1">4</sup>
          </a>
          <a href="#" className={`${catLink} ${item(delays[2], open)}`} onClick={(e) => { e.preventDefault(); onClose(); }}>
            Experiential<sup className="text-[0.45em] leading-[0] relative -top-[0.8em] ml-1">4</sup>
          </a>
          <a href="#" className={`${catLink} ${item(delays[3], open)}`} onClick={(e) => { e.preventDefault(); onClose(); }}>
            E-commerce<sup className="text-[0.45em] leading-[0] relative -top-[0.8em] ml-1">3</sup>
          </a>
        </nav>
      </div>

      {/* folder tab */}
      <div className="bg-white flex">
        <div
          className={`inline-flex items-center gap-2 h-[34px] pl-3.5 pr-8 bg-beige [clip-path:polygon(0_0,100%_0,calc(100%_-_15px)_100%,0_100%)] text-[11.5px] font-medium tracking-[0.05em] uppercase text-ink ${item(delays[1], open)}`}
        >
          <FolderIcon className="w-3.5 h-3.5 shrink-0" />
          <span>Featured projects</span>
        </div>
      </div>

      {/* featured projects list */}
      <div className="bg-white px-3.5 pb-3.5">
        <div className="border-t border-[#ddd7ca]">
          {featuredProjects.map((project, i) => (
            <a
              key={project.code}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className={`grid grid-cols-[112px_1fr_1.35fr_76px] gap-5 items-center py-3 border-b border-[#ddd7ca] no-underline text-ink transition-[background-color,opacity] hover:bg-[#f4f0e7] max-[1024px]:grid-cols-[88px_1fr_70px] opacity-0 ${
                open ? `duration-[250ms] ${itemIn} ${delays[Math.min(i + 2, delays.length - 1)]}` : "duration-300"
              }`}
            >
              <span
                aria-hidden="true"
                className="w-[112px] h-[94px] overflow-hidden max-[1024px]:w-[88px] max-[1024px]:h-[74px] [&>svg]:block [&>svg]:w-full [&>svg]:h-full"
              >
                <ProjectThumb kind={project.thumb} />
              </span>
              <span className={rowText}>{project.name}</span>
              <span className={`${rowText} max-[1024px]:hidden`}>{project.description}</span>
              <span className={`${rowText} text-right`}>{project.code}</span>
            </a>
          ))}
        </div>

        <a
          href="#work"
          onClick={onClose}
          className={`flex items-center justify-center h-10 mt-3 border border-ink text-ink no-underline text-[11.5px] font-medium tracking-[0.05em] uppercase transition-[background-color,color,opacity] duration-300 hover:bg-ink hover:text-white ${item(delays[4], open)}`}
        >
          See all work [17]
        </a>
      </div>
    </div>
  );
}
