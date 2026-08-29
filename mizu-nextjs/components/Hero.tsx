"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NavRow from "@/components/NavRow";
import WorkMenu from "@/components/WorkMenu";
import MobileMenu from "@/components/MobileMenu";

/* shared load-in reveal (runs once on mount, pure CSS animation) */
const riseIn = "animate-[riseIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both]";

export default function Hero() {
  /* work panel: hover-driven on desktop, tap-driven from the mobile menu */
  const [workOpen, setWorkOpen] = useState(false);
  /* mobile main menu sheet (MENU / CLOSE) */
  const [navOpen, setNavOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openWork = useCallback(() => {
    clearCloseTimer();
    setWorkOpen(true);
  }, [clearCloseTimer]);

  /* short grace period so moving between the trigger and the panel keeps it open */
  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setWorkOpen(false);
    }, 200);
  }, [clearCloseTimer]);

  const toggleWork = useCallback(() => {
    clearCloseTimer();
    setWorkOpen((open) => !open);
  }, [clearCloseTimer]);

  const closeWork = useCallback(() => {
    clearCloseTimer();
    setWorkOpen(false);
  }, [clearCloseTimer]);

  /* Escape closes everything */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeWork();
        setNavOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeWork]);

  /* lock page scroll while the mobile menu is up */
  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  return (
    <section className="relative px-6 pt-5 pb-[26px] max-[860px]:p-[18px] max-[860px]:pb-10">
      {/* mobile menu trigger (top-right, like the reference) */}
      <button
        type="button"
        aria-controls="mobile-menu"
        aria-expanded={navOpen}
        onClick={() => setNavOpen(true)}
        className="absolute top-[18px] right-[18px] min-[861px]:hidden text-[12px] font-medium uppercase tracking-[0.05em] text-ink"
      >
        Menu <span aria-hidden="true" className="ml-1">[=]</span>
      </button>

      <div className="flex items-start justify-between gap-8 max-[860px]:flex-col max-[860px]:gap-7 max-[1024px]:gap-12">
        <a
          href="#"
          aria-label="MIZU — home"
          onClick={(e) => {
            /* while the mobile menu is up the logo sits above the sheet;
               tapping it should close the menu, not jump the page */
            if (navOpen) {
              e.preventDefault();
              setNavOpen(false);
            }
          }}
          className="font-display text-[clamp(76px,10.5vw,210px)] leading-[0.8] tracking-[0.005em] text-ink uppercase no-underline origin-top-left select-none shrink-0 animate-[logoIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both] [animation-delay:0.05s] max-[860px]:text-[clamp(72px,18vw,140px)] max-[860px]:relative max-[860px]:z-[530]"
        >
          Mizu
        </a>

        <div className="w-1/2 min-w-0 self-stretch min-h-[clamp(240px,16.5vw,320px)] flex flex-col max-[860px]:w-full max-[860px]:min-h-0">
          <NavRow
            className={`${riseIn} [animation-delay:0.18s]`}
            menuOpen={workOpen}
            onToggleMenu={toggleWork}
            onWorkMouseEnter={openWork}
            onWorkMouseLeave={scheduleClose}
          />

          <p
            className={`${riseIn} [animation-delay:0.32s] mt-[clamp(36px,5vw,94px)] max-w-[360px] text-[14px] leading-[1.42] tracking-[-0.005em] text-[#191510] max-[860px]:order-3 max-[860px]:mt-5`}
          >
            Design that holds. Code that runs. AI-enabled agents that do
            the work. We build AI-enabled websites, apps, and agents that
            carry real weight in your business.
          </p>

          <h1
            className={`${riseIn} [animation-delay:0.45s] mt-auto pt-8 text-[clamp(28px,3.2vw,64px)] font-medium tracking-[-0.035em] leading-[1.02] text-ink max-[860px]:order-2 max-[860px]:mt-24 max-[860px]:pt-0 max-[860px]:text-[clamp(34px,8.4vw,56px)]`}
          >
            Beautiful. Useful. Autonomous.
          </h1>
        </div>
      </div>

      <MobileMenu
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onOpenWork={openWork}
      />

      <WorkMenu
        open={workOpen}
        onClose={closeWork}
        onBack={() => setWorkOpen(false)}
        onCloseAll={() => {
          setWorkOpen(false);
          setNavOpen(false);
        }}
        onMenuMouseEnter={clearCloseTimer}
        onMenuMouseLeave={scheduleClose}
      />
    </section>
  );
}
