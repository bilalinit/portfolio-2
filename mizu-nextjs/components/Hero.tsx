"use client";

import NavRow from "@/components/NavRow";
import { useMenus } from "@/components/MenuLayer";

/* shared load-in reveal (runs once on mount, pure CSS animation) */
const riseIn = "animate-[riseIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both]";

/* Hero — one stacked composition instead of the old two-sided split:
   nav top-right, then the wordmark lockup ("Mizu" in Helvetica Bold +
   "Studio" as a small tracked uppercase counterpoint), with the brand
   statement and intro paragraph flowing beneath in lighter type. The
   heavy Anton block read brutalist against the soft chat UI; Helvetica
   keeps the wordmark confident but classic. */
export default function Hero() {
  /* menu state lives in MenuLayer (root layout) so the panels survive the
     route changes their own links trigger; this component only hosts the
     triggers (mobile MENU button, desktop WORK link in NavRow) */
  const menus = useMenus();

  return (
    <section className="relative px-6 pt-5 pb-14 max-[860px]:p-[18px] max-[860px]:pb-10">
      {/* mobile menu trigger (top-right, like the reference) */}
      <button
        type="button"
        aria-controls="mobile-menu"
        aria-expanded={menus.navOpen}
        onClick={menus.openNav}
        className="absolute top-[18px] right-[18px] min-[861px]:hidden text-[12px] font-medium uppercase tracking-[0.05em] text-ink"
      >
        Menu <span aria-hidden="true" className="ml-1">[=]</span>
      </button>

      {/* primary nav — right-aligned so the WORK trigger stays in the
          panel's drop zone */}
      <div className={`intro-rise flex justify-end ${riseIn} [animation-delay:0.18s]`}>
        <NavRow
          className="w-fit"
          menuOpen={menus.workOpen}
          onToggleMenu={menus.toggleWork}
          onWorkMouseEnter={menus.openWork}
          onWorkMouseLeave={menus.scheduleWorkClose}
        />
      </div>

      {/* wordmark: the AE-rendered lockup (intro animation's final frame)
          as a permanent icon. IntroSplash aligns its video to this exact
          element, so the entrance animates straight into this image —
          brandIn is opacity-only because any transform here would move
          the element out from under the video's landing region. */}
      <div className="mt-[clamp(40px,9vh,104px)]">
        <a
          href="#"
          aria-label="MIZU — home"
          onClick={(e) => {
            /* while the mobile menu is up the logo sits above the sheet;
               tapping it should close the menu, not jump the page */
            if (menus.navOpen) {
              e.preventDefault();
              menus.closeNav();
            }
          }}
          className="inline-block no-underline select-none animate-[brandIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both] [animation-delay:0.05s] max-[860px]:relative max-[860px]:z-[530]"
        >
          <img
            id="hero-lockup"
            src="/mizu-lockup.png"
            alt=""
            width={608}
            height={128}
            draggable={false}
            /* no upper clamp: the intro video pins to this element's live
               rect, so the width must keep tracking the viewport or the
               animation drifts off-center past 1920px (slight upscale on
               big monitors — the video softens identically there) */
            className="block h-auto w-[max(280px,31.67vw)] max-[860px]:w-[min(66vw,320px)]"
          />
        </a>

        <h1
          className={`intro-rise ${riseIn} [animation-delay:0.32s] mt-7 max-w-[760px] text-[clamp(26px,3.4vw,46px)] font-normal leading-[1.1] tracking-[-0.02em] text-ink`}
        >
          Beautiful. Useful. Autonomous.
        </h1>

        <p
          className={`intro-rise ${riseIn} [animation-delay:0.45s] mt-5 max-w-[420px] text-[14px] leading-[1.5] tracking-[-0.005em] text-[#191510]/70`}
        >
          Design that holds. Code that runs. AI-enabled agents that do
          the work. We build AI-enabled websites, apps, and agents that
          carry real weight in your business.
        </p>
      </div>
    </section>
  );
}
