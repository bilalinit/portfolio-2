"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GitHubIcon } from "@/components/icons";
import { GITHUB_URL } from "@/data/social";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  onOpenWork: () => void;
};

const itemIn = "animate-[wmIn_0.55s_cubic-bezier(0.22,0.61,0.36,1)_both]";
const delays = [
  "[animation-delay:0.25s]",
  "[animation-delay:0.31s]",
  "[animation-delay:0.37s]",
  "[animation-delay:0.43s]",
  "[animation-delay:0.49s]",
  "[animation-delay:0.55s]",
];

/* staggered entrance, replays every time the menu opens */
const item = (delay: string, open: boolean) =>
  open ? `opacity-0 ${itemIn} ${delay}` : "opacity-0";

/* underline-on-hover, same language as the desktop nav */
const menuLink =
  "relative py-1 text-[clamp(28px,7.5vw,36px)] font-medium leading-[1.15] tracking-[-0.02em] text-ink no-underline " +
  "after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-px after:bg-current " +
  "after:scale-x-0 after:origin-right after:transition-transform after:duration-[380ms] after:ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "hover:after:scale-x-100 hover:after:origin-left";

const topButton =
  "min-h-[44px] text-[12px] font-medium uppercase tracking-[0.05em] text-ink transition-colors duration-200 hover:text-ink/60";

/* Mobile main menu: white sheet that slides down from the top with the
   primary links; the page below is dimmed. WORK hands over to the
   WorkMenu panel, which slides in from the left above this sheet (the
   sheet stays mounted underneath so "[+] Main menu" can hand back).
   Desktop hides the whole thing (min-[861px]:hidden). */
export default function MobileMenu({ open, onClose, onOpenWork }: MobileMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  /* tap anywhere outside the sheet closes it — except taps inside the work
     panel: it sits above this sheet, and its own controls ("[+] Main menu",
     "Close [×]") bubble here; closing the sheet on their click would yank
     the floor out from under the hand-back */
  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node;
      if (root.contains(target)) return;
      const workPanel = document.getElementById("work-menu");
      if (workPanel?.contains(target)) return;
      onClose();
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open, onClose]);

  const links = [
    { label: "Work", action: onOpenWork },
    { label: "About", href: "/about" },
    { label: "Services", href: "#" },
    { label: "Contact", href: "/#pricing" },
  ];

  return (
    <>
      {/* dim the page below the sheet */}
      <div
        aria-hidden="true"
        className={
          open
            ? "fixed inset-0 z-[460] bg-black/45 [transition:opacity_.45s_ease,visibility_0s]"
            : "fixed inset-0 z-[460] bg-black/45 invisible opacity-0 [transition:opacity_.45s_ease,visibility_0s_linear_.45s]"
        }
      />

      <div
        ref={rootRef}
        id="mobile-menu"
        aria-hidden={!open}
        className={
          open
            ? "fixed top-0 left-0 z-[520] w-full max-h-[100dvh] overflow-y-auto overscroll-contain min-[1025px]:hidden visible bg-white [transform:translateY(0)] [transition:transform_.65s_cubic-bezier(.77,0,.18,1),visibility_0s]"
            : "fixed top-0 left-0 z-[520] w-full max-h-[100dvh] overflow-y-auto overscroll-contain min-[1025px]:hidden invisible bg-white [transform:translateY(-103%)] [transition:transform_.65s_cubic-bezier(.77,0,.18,1),visibility_0s_linear_.65s]"
        }
      >
        <div className="px-[18px] pt-[18px] pb-9">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`${topButton} ${item(delays[0], open)}`}
            >
              Close <span aria-hidden="true" className="ml-1">[×]</span>
            </button>
          </div>

          <nav
            aria-label="Mobile"
            className="mt-[clamp(110px,calc(14.4vw_+_50px),180px)] flex flex-col items-start gap-2"
          >
            {links.map((link, i) => (
              <a
                key={link.label}
                hidden={link.label === "Services"}
                href={link.href ?? "#"}
                onClick={(e) => {
                  e.preventDefault();
                  if (link.action) link.action();
                  else if (link.href?.startsWith("/")) {
                    router.push(link.href);
                    if (link.href.split("#")[0] === pathname) onClose();
                  }
                  else onClose();
                }}
                className={`${menuLink} ${item(delays[i + 1], open)}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className={`mt-10 ${item(delays[5], open)}`}>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              aria-label="Visit AhmedSaeed4 on GitHub"
              className="inline-flex h-11 w-11 items-center justify-center border border-ink text-ink transition-colors duration-300 hover:bg-ink hover:text-white"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
