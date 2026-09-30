"use client";

import Link from "next/link";
import { useMenus } from "@/components/MenuLayer";
import { MizuMark } from "@/components/icons";

/* shared load-in reveal (runs once on mount, pure CSS animation). Tagged
   `rise` so globals.css can switch it off under prefers-reduced-motion. */
const riseIn =
  "rise animate-[riseIn_0.9s_cubic-bezier(0.22,0.61,0.36,1)_both]";

/* the four letters, so each can rise on its own beat */
const WORDMARK = ["M", "i", "z", "u"];

/* stagger step between letters, in seconds */
const LETTER_STEP = 0.07;

/* hero copy — pulled out of the JSX so the layout below stays about layout */
const tagline = ["Design that", "holds. Code", "that runs."];

const aboutLinks = ["Company"];

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
  "tile group relative isolate flex h-[clamp(50px,4.4vw,74px)] w-[clamp(84px,7.6vw,132px)] " +
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
  "font-normal leading-none tracking-[-0.01em] text-ink no-underline " +
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
   spans the same baseline. The type is Inter Tight rather than Anton: Anton
   is far too heavy at this size, and the reference reads as a light
   grotesque sitting on a lot of air.

   Tiles and mid columns are desktop-only; below 1025px the strip collapses
   to the mark + wordmark and the mobile MENU trigger, and the tiles become a
   full-width row so Contact stays one tap away. */
export default function Hero({ compact = false }: { compact?: boolean }) {
  /* menu state lives in MenuLayer (root layout) so the panels survive the
     route changes their own links trigger; this component only hosts the
     triggers (mobile MENU button, desktop WORK link) */
  const menus = useMenus();

  return (
    <section className="relative px-[clamp(18px,2.4vw,40px)] pt-[clamp(10px,0.9vw,16px)] pb-[clamp(22px,2.2vw,38px)]">
      {/* ── masthead strip ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-x-[clamp(16px,2vw,32px)]">
        {/* mark + wordmark */}
        <a
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
          className="no-underline inline-flex min-h-[44px] items-center gap-[0.42em] text-ink select-none max-[1024px]:relative max-[1024px]:z-[530]"
        >
          <MizuMark className="h-[clamp(17px,1.45vw,22px)] w-[clamp(17px,1.45vw,22px)] shrink-0" />
          <span className="text-[clamp(17px,1.5vw,23px)] font-normal leading-none tracking-[-0.025em]">
            Mizu
          </span>
        </a>

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

          <div className="flex items-center gap-[clamp(24px,3.4vw,64px)]">
            <div className="flex flex-col gap-[clamp(12px,1.2vw,20px)]">
              <span className={colHeading}>About us</span>
              {aboutLinks.map((label) => (
                <Link key={label} href="/about" className={plusLink}>
                  <span aria-hidden="true" className="text-[1.15em] leading-none">
                    +
                  </span>
                  {label}
                </Link>
              ))}
            </div>

            {/* hairline divider — the only vertical rule in the strip */}
            <span
              aria-hidden="true"
              className="h-[clamp(44px,4.4vw,76px)] w-px shrink-0 bg-ink/20"
            />

            <div className="flex flex-col gap-[clamp(12px,1.2vw,20px)]">
              <span className={colHeading}>Our expertise</span>
              <a
                href="#work"
                id="work-trigger"
                className={plusLink}
                aria-controls="work-menu"
                aria-expanded={menus.workOpen}
                aria-haspopup="true"
                onClick={(e) => {
                  e.preventDefault();
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
                <span aria-hidden="true" className="text-[1.15em] leading-none">
                  +
                </span>
                Work
              </a>
            </div>
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
              "relative z-10 flex w-full items-center justify-between gap-2 " +
              "p-[clamp(9px,0.8vw,13px)] text-[clamp(12px,0.95vw,15px)] " +
              "font-normal leading-none tracking-[-0.01em] transition-colors " +
              "duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
              (tile.tone === "primary" ? "text-white" : "text-ink") +
              " group-hover:text-beige group-focus-visible:text-beige";

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
                <span className="flex w-full items-center justify-between gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      "tile-arrow text-[0.95em] leading-none transition-transform duration-[520ms] " +
                      `ease-[cubic-bezier(0.22,0.61,0.36,1)] ${arrowShift}`
                    }
                  >
                    {tile.external ? "↗" : "↘"}
                  </span>
                  <span>{tile.label}</span>
                </span>
              </>
            );

            /* the neutral tile needs to sit clearly ON the ground, not
               dissolve into it: at #d8d8d8 it was 1.25:1 against the old
               beige and 1.11:1 against the new off-white, so the tile had no
               visible edge at all. #c6c3bb restores 1.37:1 while staying
               quiet beside the blue. */
            const className = `${tileBox} ${
              tile.tone === "primary" ? "bg-[#3149f5]" : "bg-[#c6c3bb]"
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
          className="min-[1025px]:hidden min-h-[44px] -mr-2 -my-2 px-2 py-2 text-[12px] font-medium uppercase tracking-[0.05em] text-ink"
        >
          Menu <span aria-hidden="true" className="ml-1">[=]</span>
        </button>
      </div>

      {/* ── the strip's own rule ─────────────────────────────────── */}
      <span
        aria-hidden="true"
        className="mt-[clamp(10px,0.9vw,15px)] block h-px w-full bg-ink/20"
      />

      {/* ── wordmark + statement ─────────────────────────────────── */}
      {!compact && <div className="mt-[clamp(20px,2vw,34px)] grid grid-cols-1 items-start gap-y-[clamp(26px,3vw,48px)] min-[1025px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] min-[1025px]:gap-x-[clamp(28px,3.4vw,72px)]">
        {/* giant wordmark. The cell is the query container and the h1 is
            sized in cqw against it, so the word always spans the column
            instead of resting on a guessed-at vw clamp. cqw resolves
            against the NEAREST ancestor container, which is why @container
            sits on this wrapper and not on the h1 itself. */}
        <div className="@container m-0">
          {/* 41cqw against a 1.5fr column, and the two are a matched pair.
              An earlier pass fixed the wordmark's width by dropping the type
              to 33cqw while leaving the column at 2.05fr — which just moved
              the empty space inside the cell: the letters shrank to 48% of
              the viewport and 14% of it became dead slack before the
              statement column even started. Sizing the type back up and
              narrowing the COLUMN instead keeps the big wordmark and spends
              the width on the text. Measured at 1440: word 53%, statement
              column 37%, gap 5%.

              "MIZU" is ~2.35em of advance (M .87 / I .28 / Z .60 / U .72,
              less .03em tracking × 4), so 41cqw of this column lands the word
              at ~97% of the cell with ~2% slack. Re-measure both numbers
              together if the tracking or the fr ratio changes. */}
          {/* select-none: at 41cqw a stray drag across the masthead would
              otherwise paint a selection block over a third of the screen.
              user-select is deliberately NOT "none" on the sr-only copy —
              it sits inside the h1 so it inherits, and it is the wordmark's
              only accessible text, so it stays selectable for anyone
              copying it. */}
          <h1 className="m-0 select-none font-mark text-[41cqw] font-[280] uppercase leading-[0.74] tracking-[-0.03em] text-ink">
            <span className="sr-only select-text">Mizu</span>
            {WORDMARK.map((letter, i) => (
              <span
                key={`${letter}-${i}`}
                aria-hidden="true"
                className={`${riseIn} inline-block [animation-delay:${0.05 + i * LETTER_STEP}s]`}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* right column: the statement, and a small note pinned to the
            baseline of the wordmark */}
        <div className="flex flex-col justify-between gap-y-[clamp(28px,3.4vw,56px)] min-[1025px]:pt-[clamp(10px,1.4vw,26px)]">
          <p
            className={`${riseIn} m-0 max-w-[22ch] text-[clamp(19px,1.9vw,32px)] font-normal leading-[1.16] tracking-[-0.022em] text-ink [animation-delay:0.42s]`}
          >
            We are a digital studio making websites, apps and agents that
            carry real weight in your business.
          </p>

          <p
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
