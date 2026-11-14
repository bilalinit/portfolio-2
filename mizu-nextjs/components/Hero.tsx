"use client";

import Link from "next/link";
import { Manrope } from "next/font/google";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMenus } from "@/components/MenuLayer";
import { MizuMark } from "@/components/icons";
import styles from "./Hero.module.css";

const wordmarkFont = Manrope({
  subsets: ["latin"],
  weight: "300",
  display: "block",
  preload: true,
});

/* Preserve the existing entrance for supporting hero copy. */
const riseIn = "rise animate-[riseIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both]";

/* hero copy — pulled out of the JSX so the layout below stays about layout */
const tagline = ["Design that", "holds. Code", "that runs."];

const aboutLinks = ["About"];

/* The two destination tiles top-right.

   These carry the masthead's only saturated colour, so they're built as
   stacked layers rather than flat swatches: a base fill, an "ink" layer
   underneath that is revealed by a corner-origin wipe on hover, the label,
   and the arrow. A plain background-colour swap read as a flicker next to
   the soft corners; the wipe gives the tile somewhere to travel.

   `primary` is the solid blue call to action, `secondary` the quiet grey
   sibling. `corner` sets the wipe origin so the two feel related but not
   identical, and `external` switches the arrow glyph — these point at very
   different kinds of destination and the arrow should admit it. */
type Tile = {
  label: string;
  href: string;
  tone: "primary" | "secondary";
  corner: "bottom-left" | "top-right";
  external?: boolean;
};

const tiles: Tile[] = [
  {
    label: "Contact",
    href: "/#pricing",
    tone: "primary",
    corner: "bottom-left",
  },
  {
    label: "All work",
    href: "/work",
    tone: "secondary",
    corner: "top-right",
    external: true,
  },
];

/* Shared tile box. Kept as one string so the two tones can't drift apart
   in padding or corner radius. focus-visible is spelled out rather than left
   to the UA default because globals.css hides the system cursor on desktop
   (the custom Cursor takes over) — without an explicit ring a keyboard user
   would have no focus indicator whatsoever. */
const tileBox =
  "tile group relative isolate flex shrink-0 w-[clamp(112px,8.8vw,160px)] " +
  "items-end overflow-hidden no-underline rounded-[2px] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/* The ink that floods a tile on hover is NOT an element here — it's a
   full-bleed layer in globals.css (.tile-wipe) masked with a radial
   gradient, so the edge is feathered out of the corner instead of arriving
   as a hard-edged rectangle. Only the corner differs between the two tiles,
   and that's carried by the data attribute below. */

/* a "+" link in the mid nav columns — the plus is a static glyph, not an
   icon, so it inherits the label's colour and size */
const plusLink =
  "group inline-flex items-center gap-1.5 text-[clamp(13px,1.05vw,15px)] " +
  "font-normal leading-none tracking-[-0.01em] text-brand-ink no-underline " +
  "transition-opacity duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
  "hover:opacity-55";

/* the two mid columns' headings ("About us", "Our expertise") */
const colHeading =
  "text-[clamp(12px,0.95vw,14px)] font-normal leading-none tracking-[-0.005em] text-ink";

/* Hero — an editorial masthead above a full-bleed wordmark.

   Top strip: mark + wordmark on the left, a mid band of stacked nav columns
   separated by a hairline rule, then the two destination tiles and the
   language label hard right. Below the strip's own rule, the wordmark is set
   enormous in the light display cut so it spans its column edge to edge,
   with the brand statement and a small note in a right-hand column that
   spans the same baseline. The wordmark uses a scoped Manrope Light trial
   beside the Instrument Sans statement, the site's shared editorial family.

   Tiles and mid columns are desktop-only; below 1025px the strip collapses
   to the mark + wordmark and the mobile MENU trigger, and the tiles become a
   full-width row so Contact stays one tap away. */
export default function Hero({ compact = false }: { compact?: boolean }) {
  /* menu state lives in MenuLayer (root layout) so the panels survive the
     route changes their own links trigger; this component only hosts the
     triggers (mobile MENU button, desktop WORK link) */
  const menus = useMenus();
  const [scrolled, setScrolled] = useState(false);
  const wordmark = useRef<HTMLHeadingElement>(null);
  const [wordmarkReady, setWordmarkReady] = useState(false);

  useLayoutEffect(() => {
    if (compact || !wordmark.current) return;
    let active = true;
    const family = getComputedStyle(wordmark.current).fontFamily.split(",")[0];
    const reveal = () => { if (active) setWordmarkReady(true); };
    // Start the existing entrance only after its actual glyphs are available.
    // A fallback font has different advances at this size and shifts MIZU sideways.
    document.fonts.load(`300 1em ${family}`).then(reveal, reveal);
    return () => { active = false; };
  }, [compact]);

  // One CSS state controls every moving part, including the dropdown.
  // Publish it before paint so labels and clipping cannot start a frame apart.
  useLayoutEffect(() => {
    document.documentElement.dataset.mastheadScrolled = String(scrolled);
  }, [scrolled]);

  useEffect(() => {
    let lastY = Math.max(0, window.scrollY);
    let travel = 0;
    let collapsed = lastY > 48;
    setScrolled(collapsed);

    const onScroll = () => {
      // The mobile menu temporarily fixes the body at the saved scroll offset.
      if (document.body.style.position === "fixed") return;
      const nextY = Math.max(0, window.scrollY);
      const delta = nextY - lastY;
      lastY = nextY;
      // Accumulate small movements in one direction, ignoring trackpad jitter.
      travel = delta * travel < 0 ? delta : travel + delta;
      if (nextY <= 12) {
        if (collapsed) setScrolled(false);
        collapsed = false;
        travel = 0;
      } else if (Math.abs(travel) >= 6) {
        const nextCollapsed = travel > 0 && nextY > 48;
        if (nextCollapsed !== collapsed) {
          collapsed = nextCollapsed;
          setScrolled(collapsed);
        }
        travel = 0;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      delete document.documentElement.dataset.mastheadScrolled;
    };
  }, []);

  return (
    <section className="relative px-[clamp(18px,2.4vw,40px)] pb-[clamp(22px,2.2vw,38px)]">
      {/* Reserve the expanded height so scrolling never shifts the hero. */}
      <div className="masthead-space" aria-hidden="true" />
      <header className="masthead" data-menu-open={menus.navOpen}>
      {/* ── masthead strip ───────────────────────────────────────── */}
      <nav aria-label="Primary" className="masthead-row flex items-center justify-between gap-x-[clamp(16px,2vw,32px)]">
        {/* mark + wordmark */}
        <Link
          href="/"
          aria-label="MIZU — home"
          onClick={(e) => {
            /* while the mobile menu is up the logo sits above the sheet;
               tapping it should close the menu, not jump the page */
            if (menus.navOpen) {
              e.preventDefault();
              menus.closeNav();
            }
          }}
          className="masthead-logo no-underline inline-flex min-h-[44px] items-center gap-[0.42em] text-[clamp(17px,1.5vw,23px)] text-brand-ink select-none max-[1024px]:relative max-[1024px]:z-[530]"
        >
          <span className="inline-flex items-center gap-[0.42em] leading-none">
            <MizuMark className="h-[0.68em] w-auto shrink-0 -translate-y-[0.04em]" />
            <span className="font-normal tracking-[-0.025em]">Mizu</span>
          </span>
        </Link>

        {/* mid band: three stacked columns. Hidden on tablet and below —
            the hairline rule that separates them needs the width. */}
        <div className="hidden min-[1025px]:flex flex-1 items-center justify-between gap-x-[clamp(24px,3.4vw,64px)] pl-[clamp(24px,4vw,88px)]">
          {/* stacked three-line tagline */}
          <p className="text-[clamp(12px,0.95vw,15px)] font-normal leading-[1.18] tracking-[-0.005em] text-ink max-w-[10ch]">
            {tagline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>

          <div className="masthead-columns">
            <Link href="/about" aria-label="About me" className="masthead-column masthead-control">
              <span className={`masthead-heading ${colHeading}`} aria-hidden={scrolled}>About me</span>
              {aboutLinks.map((label) => (
                <span key={label} className={`masthead-link ${plusLink}`}>
                  <span aria-hidden="true" className="text-[1.15em] leading-none">
                    +
                  </span>
                  {label}
                </span>
              ))}
            </Link>

            {/* hairline divider — the only vertical rule in the strip */}
            <span
              aria-hidden="true"
              className="masthead-divider w-px shrink-0 bg-ink/20"
            />

              <button
                type="button"
                id="work-trigger"
                className="masthead-column masthead-control"
                aria-label="Work"
                aria-controls="work-menu"
                aria-expanded={menus.workOpen}
                aria-haspopup="true"
                onClick={() => {
                  menus.toggleWork();
                }}
                onPointerEnter={(e) => {
                  /* hover-to-open is mouse-only: a touch tap also fires
                     compat enter events, which would open the panel and then
                     the click would immediately toggle it shut */
                  if (e.pointerType === "mouse") menus.openWork();
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") menus.scheduleWorkClose();
                }}
              >
              <span className={`masthead-heading ${colHeading}`} aria-hidden={scrolled}>My expertise</span>
              <span className={`masthead-link ${plusLink}`}>
                <span aria-hidden="true" className="text-[1.15em] leading-none">
                  +
                </span>
                Work
              </span>
              </button>
          </div>
        </div>

        {/* tiles + language, hard right */}
        <div className="hidden min-[1025px]:flex items-center gap-[clamp(12px,1.4vw,26px)]">
          {tiles.map((tile) => {
            /* the label and arrow swap corners between the two tiles, which
               is what keeps the pair from reading as two copies of one chip */
            const flip = tile.corner === "top-right";

            /* the face inverts to the ground colour as the ink wipe passes
               under it — same end state on both tones, different start */
            const face =
              "z-10 px-[clamp(14px,1vw,18px)] py-[14px] text-[clamp(12px,0.95vw,15px)] " +
              "font-normal leading-none tracking-[-0.01em] transition-colors " +
              "duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
              (tile.tone === "primary" ? "text-white" : "text-ink") +
              " group-hover:text-on-dark group-focus-visible:text-on-dark";

            /* the arrow leads on hover, pushed outward from its own corner */
            const arrowShift = flip
              ? "group-hover:-translate-x-[3px] group-focus-visible:-translate-x-[3px]"
              : "group-hover:translate-x-[3px] group-focus-visible:translate-x-[3px]";

            const body = (
              <>
                <span
                  aria-hidden="true"
                  data-corner={tile.corner}
                  className="tile-wipe absolute inset-0 -z-10"
                />
                <span className="masthead-tile-content flex w-full items-center justify-between gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      "tile-arrow text-[0.95em] leading-none transition-transform duration-[520ms] " +
                      `ease-[cubic-bezier(0.22,0.61,0.36,1)] ${arrowShift}`
                    }
                  >
                    {tile.external ? "↗" : "↘"}
                  </span>
                  <span className="whitespace-nowrap">{tile.label}</span>
                </span>
              </>
            );

            /* A neutral gray keeps the secondary tile visible against the
               near-white page without reintroducing a warm tint. */
            const className = `masthead-tile ${tileBox} ${
              tile.tone === "primary" ? "bg-[#3149f5]" : "bg-[#e5e5e5]"
            } ${face}`;

            return tile.href.startsWith("/") ? (
              <Link key={tile.label} href={tile.href} className={className}>
                {body}
              </Link>
            ) : (
              <a key={tile.label} href={tile.href} className={className}>
                {body}
              </a>
            );
          })}

          <span className="text-[clamp(12px,0.95vw,15px)] font-normal leading-none tracking-[-0.005em] text-ink">
            EN
          </span>
        </div>

        {/* mobile menu trigger */}
        <button
          type="button"
          aria-controls="mobile-menu"
          aria-expanded={menus.navOpen}
          onClick={menus.openNav}
          className="masthead-menu-trigger min-[1025px]:hidden min-h-[44px] -mr-2 -my-2 px-2 py-2 text-[12px] font-medium uppercase tracking-[0.05em] text-brand-ink"
        >
          Menu <span aria-hidden="true" className="ml-1">[=]</span>
        </button>
      </nav>

      {/* ── the strip's own rule ─────────────────────────────────── */}
      <span
        aria-hidden="true"
        className="masthead-rule block h-px w-full bg-ink/20"
      />
      </header>

      {/* ── wordmark + statement ─────────────────────────────────── */}
      {!compact && <div className="mt-[clamp(20px,2vw,34px)] grid grid-cols-1 items-start gap-y-[clamp(26px,3vw,48px)] min-[1025px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] min-[1025px]:gap-x-[clamp(28px,3.4vw,72px)]">
        {/* giant wordmark. The cell is the query container and the h1 is
            sized in cqw against it, so the word always spans the column
            instead of resting on a guessed-at vw clamp. cqw resolves
            against the NEAREST ancestor container, which is why @container
            sits on this wrapper and not on the h1 itself. */}
        <div className="@container m-0">
          {/* Container-relative sizing preserves the existing hero grid.
              Manrope Light at 41cqw occupies about 91% of this column at
              1440px; recheck letter bounds when changing font or tracking. */}
          {/* select-none: at 41cqw a stray drag across the masthead would
              otherwise paint a selection block over a third of the screen.
              user-select is deliberately NOT "none" on the sr-only copy —
              it sits inside the h1 so it inherits, and it is the wordmark's
              only accessible text, so it stays selectable for anyone
              copying it. */}
          <h1 ref={wordmark} data-font-ready={wordmarkReady} className={`${wordmarkFont.className} ${styles.wordmark} m-0 select-none text-[41cqw] uppercase leading-[0.74] tracking-[-0.03em] text-brand-ink`}>
            <span className="sr-only select-text">Mizu</span>
            <span aria-hidden="true">Mizu</span>
          </h1>
        </div>

        {/* right column: the statement, and a small note pinned to the
            baseline of the wordmark */}
        <div className="flex flex-col justify-between gap-y-[clamp(28px,3.4vw,56px)] min-[1025px]:pt-[clamp(10px,1.4vw,26px)]">
          <p
            className={`${riseIn} ${styles.statement} [animation-delay:0.42s]`}
          >
            I build{" "}
            <span>websites, apps and agents</span> that carry real weight in your
            business.
          </p>

          <p
            hidden
            className={`${riseIn} m-0 text-[clamp(12px,0.95vw,15px)] font-normal leading-[1.25] tracking-[-0.005em] text-ink/70 [animation-delay:0.55s]`}
          >
            Working together
            <br />
            since 2023
          </p>
        </div>
      </div>}
    </section>
  );
}
