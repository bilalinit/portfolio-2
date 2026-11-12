"use client";

import { GitHubIcon } from "@/components/icons";
import { GITHUB_URL } from "@/data/social";

type NavRowProps = {
  className?: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onWorkMouseEnter: () => void;
  onWorkMouseLeave: () => void;
};

const links = [
  { label: "About", href: "/about" },
  { label: "Services", href: "#" },
  { label: "Careers", href: "#" },
];

/* underline-on-hover for every nav link (drawn via ::after) */
const navLink =
  "relative py-1 text-[12px] font-medium tracking-[0.05em] uppercase text-ink no-underline " +
  "after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-px after:bg-current " +
  "after:scale-x-0 after:origin-right after:transition-transform after:duration-[380ms] after:ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "hover:after:scale-x-100 hover:after:origin-left max-[1024px]:py-2";

export default function NavRow({
  className = "",
  menuOpen,
  onToggleMenu,
  onWorkMouseEnter,
  onWorkMouseLeave,
}: NavRowProps) {
  return (
    <div
      className={`relative z-[600] flex flex-wrap items-center gap-x-[clamp(16px,2vw,36px)] gap-y-3 max-[860px]:hidden ${className}`}
    >
      <nav className="flex gap-[clamp(14px,1.7vw,30px)] max-[1024px]:gap-[18px]" aria-label="Primary">
        <a
          href="#work"
          id="work-trigger"
          className={navLink}
          aria-controls="work-menu"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          onClick={(e) => {
            e.preventDefault();
            onToggleMenu();
          }}
          onPointerEnter={(e) => {
            /* hover-to-open is mouse-only: a touch tap also fires compat
               enter events, which would open the panel and then the click
               would immediately toggle it shut */
            if (e.pointerType === "mouse") onWorkMouseEnter();
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") onWorkMouseLeave();
          }}
        >
          <span className="relative inline-block">
            {/* brackets live outside the label (absolute) and fade in —
                rendering them inline on open widened the trigger and
                shoved the rest of the nav sideways */}
            <span
              aria-hidden="true"
              className={`absolute right-full top-0 mr-[0.15em] pointer-events-none transition-opacity duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                menuOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              [
            </span>
            Work
            <span
              aria-hidden="true"
              className={`absolute left-full top-0 ml-[0.15em] pointer-events-none transition-opacity duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                menuOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              ]
            </span>
          </span>
        </a>

        {links.map((link) => (
          <a key={link.label} href={link.href} className={`${navLink} ${link.label === "Services" ? "max-[1024px]:hidden" : ""}`}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex gap-2">
        <a
          href="#"
          className="inline-flex items-center justify-center h-[34px] px-4 border border-ink bg-transparent text-ink text-[11px] font-medium tracking-[0.06em] uppercase no-underline transition-colors duration-300 hover:bg-ink hover:text-beige max-[1024px]:h-9 max-[1024px]:px-3.5 max-[1024px]:text-[11.5px]"
        >
          Contact
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit AhmedSaeed4 on GitHub"
          className="inline-flex items-center justify-center w-11 h-11 border border-ink bg-transparent text-ink transition-colors duration-300 hover:bg-ink hover:text-beige"
        >
          <GitHubIcon />
        </a>
      </div>
    </div>
  );
}
