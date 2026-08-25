"use client";

import { AccessibilityIcon } from "@/components/icons";

type NavRowProps = {
  className?: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onWorkMouseEnter: () => void;
  onWorkMouseLeave: () => void;
};

const links = [
  { label: "About", href: "#" },
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
          <span>
            {menuOpen && (
              <span aria-hidden="true" className="mr-[0.15em]">
                [
              </span>
            )}
            Work
            {menuOpen && (
              <span aria-hidden="true" className="ml-[0.15em]">
                ]
              </span>
            )}
          </span>
        </a>

        {links.map((link) => (
          <a key={link.label} href={link.href} className={navLink}>
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
        <button
          type="button"
          aria-label="Accessibility options"
          className="inline-flex items-center justify-center w-[34px] h-[34px] border border-ink bg-transparent text-ink transition-colors duration-300 hover:bg-ink hover:text-beige max-[1024px]:w-9 max-[1024px]:h-9"
        >
          <AccessibilityIcon />
        </button>
      </div>
    </div>
  );
}
