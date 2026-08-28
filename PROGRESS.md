# MIZU — Project Progress

Living progress log for the MIZU digital-agency portfolio. Compile work here as it lands.
For agent rules, hard-won bug rules, and design system details see [AGENTS.md](AGENTS.md).

**Stack:** Next.js 15 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind CSS v4
**App root:** `mizu-nextjs/` · **Verify:** `npx tsc --noEmit` + page loads on `localhost:3000` (no test suite)

---

## Status snapshot

| Area | State |
|---|---|
| Landing page `/` | ✅ Done — Cursor → Hero → Showcase → Pricing → Footer → ChatWidget |
| Work grid `/work` | ✅ Done |
| Case studies `/work/[slug]` | ✅ Done (17 projects, static-generated; shared `showreel.mp4` as media block) |
| Category views `/work/category/[slug]` | ✅ Done |
| Chat widget "Nami" | 🔶 In progress — UI + morph + DotSphere modes done; agent backend stubbed |
| About / Services / Careers pages | ⬜ Not started — nav links are `#` placeholders |
| Footer social links | ⬜ Placeholder `#` |
| Real project media | ⬜ Placeholder SVG thumbs (`ProjectThumb.tsx`) + shared showreel |
| Python agent backend (`/api/agent`) | ⬜ Not started — OpenAI Agents SDK planned |

**Branches:** `dev` working · `main` stable · `backup` archive · `chat-agent` current (chat widget work)
**Latest commit:** `66a5497` Add work pages, all-work grid, and chat widget with morph animation
**Uncommitted:** chat-widget overhaul — DotSphere 5-mode animation system (untracked), ChatWidget mode wiring, icons bloom, globals.css chat styles

---

## What's built

### Pages (`mizu-nextjs/app/`)

- **`page.tsx`** — landing. Section order: `Cursor → Hero (nav + work menu) → Showcase (skill sets) → Pricing → Footer → ChatWidget`
- **`work/page.tsx`** — "See all work" grid; shell-less by design (Cursor + AllWork only), own metadata
- **`work/[slug]/page.tsx`** — case study per project: top bar, giant stacked Anton title, media block (showreel), Overview paragraph; `generateStaticParams` + `notFound()` guard
- **`work/category/[slug]/page.tsx`** — grid pre-filtered by category chip
- **`layout.tsx`** — fonts via `next/font`: Anton (display) · Inter (body) · Caveat (handwriting); favicon

### Components (`mizu-nextjs/components/`)

| Component | Role |
|---|---|
| `Cursor.tsx` | Custom cursor (rAF lerp dot, `mix-blend-difference` on the transformed wrapper); grows over `a, button`; only on fine-pointer ≥1025px |
| `Hero.tsx` | Beige hero, giant "Mizu" wordmark; owns work-menu hover (mouse-guarded, grace timers) + mobile menu state + body scroll lock |
| `NavRow.tsx` | Desktop nav: About/Services/Careers (`#` placeholders), `[Work]` trigger, Contact, accessibility |
| `WorkMenu.tsx` | WORK dropdown — closed/open/closing phases, backdrop, category links, featured project tabs, "See all work [n]" |
| `MobileMenu.tsx` | Mobile ≤860px sheet sliding from top; Work hands off to WorkMenu |
| `Showcase.tsx` | Dark wrapper around SkillSets |
| `skills/SkillSets.tsx` | "Design skill sets" accordion; IntersectionObserver reveals with `--d` stagger |
| `AllWork.tsx` | Portrait-card grid (2/3/4 cols); doubles as filtered category view |
| `Pricing.tsx` | 1:1 port of `price.html` — elastic tab indicator, cross-fading form/plan panels |
| `Footer.tsx` | Rounded cream card: statement, link columns, Contact us, legal row |
| `ProjectThumb.tsx` | SVG placeholder art per project (dime, sopfeu, halo, noir, …) |
| `ChatWidget.tsx` | "Nami" assistant pill — persistent strip `[dots icon | prompt slot]`; morph pill → circle → bar → panel with overlapped legs; greet/chat/contact views; `sendToAgent()` stub |
| `DotSphere.tsx` | 3D dot-sphere mark: fibonacci lattice, rAF loop, 5 eased modes (rest/hover/open/thinking/morph), squash-stretch, white sparkles, spring "inhale" on morph |
| `icons.tsx` | Inline SVGs — FolderIcon, AccessibilityIcon, DotsIcon (with bloom animation) |

### Data (`mizu-nextjs/data/`)

- `projects.ts` — `workCategories` (Website 7 / Mobile App 4 / Experiential 4 / E-commerce 3), `featuredProjects` (Dime, Sopfeu, Halo Dental), `allWork` (17 items with slug/year/overview)
- `skills.ts` — skills intro + UI (06) / UX (05) skill groups with detail copy

### Design system (`app/globals.css`)

- **Tokens** (`@theme`): `beige #c9c1b1` · `ink #131009` · `dark #1a120b` · `coal #121212`
- **Fonts:** `font-display` (Anton), Inter, Caveat accents
- **Motifs:** bracket labels `[Work]`, folder-tab clip corners, underline-draw hovers, scroll-reveals (`.sk`, `.aw` + `--d`), `cursor: none` behind the same media query as Cursor
- **Easing:** standard `cubic-bezier(0.22,0.61,0.36,1)` · pricing elastic `cubic-bezier(0.34,1.56,0.64,1)` · chat morph `.65,0,.35,1`
- **Reduced motion:** every animated system has a fallback (skills, all-work, pricing, chat widget, DotSphere)

---

## Feature log

### ✅ Landing port (3f09622)
Hero, cursor, nav, work menu, mobile menu ported from `mizu.html` to Next.js 15 + Tailwind v4.

### ✅ Skills, pricing, footer, responsive nav (8a2ca92)
Pricing ported 1:1 from `price.html` — animations identical. Inverted cursor.

### ✅ Work pages + all-work grid (66a5497)
`/work`, `/work/[slug]`, `/work/category/[slug]`; AllWork grid; ChatWidget morph skeleton; AGENTS.md conventions.

### 🔶 Chat widget "Nami" (in progress, branch `chat-agent`)
- **UI:** greet view (portrait + suggestion chips), chat log (user/agent, typing dots), contact view
- **Morph:** one persistent strip; pill → circle → bar → panel with deliberately overlapped legs (no pause between stages); clip-edge wipes; measurer-derived pill width
- **DotSphere animation system (2026-08-27):** 5 modes — rest (drift + breathing), hover (mouse-only, guarded), open (calm roll + precession), thinking (agitated spin + traveling wave + white sparkle flash, fake lighting), morph (spring "inhale" with overshoot release). All channels exponentially ease toward mode targets; phases accumulate, so mode hand-offs never cut. Dots shrunk 4.6px → 3.2px.
- **Next up:** Python agent (OpenAI Agents SDK) behind `/api/agent`; replace `sendToAgent()` stub in ChatWidget.tsx

---

## Known gaps / TODO

1. About, Services, Careers pages (nav + footer links currently `#`)
2. Real portrait for Nami (greet view uses DotsIcon bloom on near-black block)
3. Real project thumbnails + per-project media (currently SVG placeholders + shared showreel)
4. Footer social links (`#`)
5. `/api/agent` backend + swap `sendToAgent`
6. README.md is stale (mentions CSS Modules; app uses Tailwind v4 utilities)

---

## Workflow reminders

- Verify with `npx tsc --noEmit` then load `localhost:3000` (cold start is slow — retry)
- PowerShell: `&&` doesn't work — use `;`; never edit via `Set-Content` pipelines (Turbopack file locks)
- Dev server can wedge — kill via `Get-NetTCPConnection -LocalPort 3000` PID, restart
- Root-level `*.png` / `*.html` are design references, committed alongside related work
- Only act on explicit instruction: no commits/pushes/merges unless asked
