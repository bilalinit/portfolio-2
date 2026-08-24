"use client";

import { useCallback, useEffect, useState } from "react";
import NavRow from "@/components/NavRow";
import WorkMenu from "@/components/WorkMenu";

/* shared load-in reveal (runs once on mount, pure CSS animation) */
const riseIn = "animate-[riseIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both]";

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* Escape closes the menu */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <section className="px-6 pt-5 pb-[26px] max-[860px]:p-[18px] max-[860px]:pb-10">
      <div className="flex items-start justify-between gap-8 max-[860px]:flex-col max-[860px]:gap-7">
        <a
          href="#"
          aria-label="MIZU — home"
          className="font-display text-[clamp(76px,10.5vw,210px)] leading-[0.8] tracking-[0.005em] text-ink uppercase no-underline origin-top-left select-none shrink-0 animate-[logoIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both] [animation-delay:0.05s] max-[860px]:text-[clamp(72px,18vw,140px)]"
        >
          Mizu
        </a>

        <div className="w-1/2 min-w-0 self-stretch min-h-[clamp(240px,16.5vw,320px)] flex flex-col max-[860px]:w-full max-[860px]:min-h-0">
          <NavRow
            className={`${riseIn} [animation-delay:0.18s]`}
            menuOpen={menuOpen}
            onToggleMenu={toggleMenu}
          />

          <p
            className={`${riseIn} [animation-delay:0.32s] mt-[clamp(36px,5vw,94px)] max-w-[360px] text-[14px] leading-[1.42] tracking-[-0.005em] text-[#191510] max-[860px]:mt-10`}
          >
            Some say move fast, break things. MIZU is a digital agency that believes
            we&rsquo;ve broken enough things already.
          </p>

          <h1
            className={`${riseIn} [animation-delay:0.45s] mt-auto pt-8 text-[clamp(28px,3.2vw,64px)] font-medium tracking-[-0.035em] leading-[1.02] text-ink max-[860px]:mt-14 max-[860px]:pt-0 max-[860px]:text-[clamp(34px,8.4vw,56px)]`}
          >
            Move fast, build to last.
          </h1>
        </div>
      </div>

      <WorkMenu open={menuOpen} onClose={closeMenu} />
    </section>
  );
}
