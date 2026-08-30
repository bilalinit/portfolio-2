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
| Work grid `/work` | ✅ Done — real content only (DropSync + Game cam) |
| Case studies `/work/[slug]` | ✅ Done (real projects only, static-generated; per-project media or shared showreel) |
| Category views `/work/category/[slug]` | ✅ Done |
| Chat widget "Nami" | 🔶 In progress — UI + morph + DotSphere modes + streaming + rate limiting done; end-to-end tested with the real key; deployment pending |
| About / Services / Careers pages | ⬜ Not started — nav links are `#` placeholders |
| Footer social links | ⬜ Placeholder `#` |
| Real project media | ✅ For the two live entries — all placeholder projects purged; grid is real-content only |
| Python agent backend (`backend/`) | 🔶 Built + tested end-to-end — FastAPI + Agents SDK on Gemini (uv), key in `backend/.env`; deployment (HF Spaces) later |

**Branches:** `dev` working · `main` stable · `backup` archive · `chat-agent` current (chat widget work)
**Latest commit:** `657982c` Brand copy v1
**Uncommitted (everything below is working-tree only):** real projects + boilerplate purge + single-source data wiring · responsive work menu (50vw panel, cqw scaling) + no-side-scroll rails + mobile slide regression fix · nav bracket shift fix · chat composer stacking + mobile send button + measurement/jitter/wrap fixes · DotsIcon hydration fix · PROGRESS.md itself

---

## What's built

### Pages (`mizu-nextjs/app/`)

- **`page.tsx`** — landing. Section order: `Cursor → Hero (nav + work menu) → Showcase (skill sets) → Pricing → Footer → ChatWidget`
- **`work/page.tsx`** — "See all work" grid; shell-less by design (Cursor + AllWork only), own metadata
- **`work/[slug]/page.tsx`** — case study per project: top bar, giant stacked Anton title, media block (per-project image when `media` is set, else shared showreel), Overview paragraph; `generateStaticParams` + `notFound()` guard
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
- **Agent backend `backend/` (2026-08-28):** uv project — FastAPI + openai-agents, single no-tools agent on Gemini via `AsyncOpenAI` + `OpenAIChatCompletionsModel` against Google's OpenAI-compatible endpoint. `POST /api/agent` takes `{message, history[]}` → `{reply}`; CORS pinned to the site origin; 503 pre-key, 502 on run failure. `sendToAgent()` now POSTs there (history rides along) with a chat fallback message on failure; `npx tsc --noEmit` green, endpoints smoke-tested, verified end-to-end through the widget with the real key. Model: default `gemini-3.6-flash` in code, but `.env` overrides to `gemini-3.5-flash-lite` — flash is only **20 req/day** on the free tier and burns out mid-testing; flash-lite has its own, larger bucket.
- **Nami instructions v2 (2026-08-28):** front-desk persona — studio positioning + short project summaries + hard boundaries: informs but never transacts, and never narrates limitations — commercial intent gets a warm "we'd love to — hello@mizu.studio" hand-off, no "I can't start projects" meta-talk. Voice rule: always "we built / we design", third-person "MIZU..." only when directly asked what MIZU is. Frontend copy (work grid, pricing numbers) deliberately kept out — it's placeholder and being reworked.
- **Project knowledge tool (2026-08-28):** `get_project_details(project)` function tool — full client-facing write-ups live in `backend/knowledge/*.md` (`dropsync.md`, `camera-navigator-chain.md`, distilled from the projects' READMEs/docs: what it IS, no build history); the tool loads a whole file into context on demand so the instructions stay short. Instructions carry only 2-line summaries + slugs and a "digest, don't dump" rule. Tool invocations log to the server console. New projects: drop a distilled markdown in `knowledge/`, add its slug to `PROJECT_DOCS` + the tool's Literal + a short summary in the instructions.
- **Streaming + activity label (2026-08-28):** `POST /api/agent/stream` — SSE frames (`activity`/`delta`/`delta_reset`/`final`/`error`) off `Runner.run_streamed()`; thinking-out-loud guard sends `delta_reset` when a tool call follows streamed text. Widget consumes via `lib/agentStream.ts` (fetch + ReadableStream; labels mapped client-side: `get_project_details` → "Reading up on our work…", generating → "Thinking…"). Thinking UI: shimmer label over the bouncing dots (`.shimmer-text` in globals.css; solid-color fallback under reduced motion — transparent text + no animation would vanish). Once text flows, the loader row is replaced by a streaming bubble (`useSmoothStream` hook, 40ms ticker, reduced-motion = instant reveal); the reply commits to the log only when the reveal catches up, so streaming-bubble → message swap is invisible. Non-streaming `/api/agent` kept as fallback (widget retries it only if the stream can't be established).
- **Per-visitor rate limiting (2026-08-28):** sliding windows in `main.py` — **5 req/min + 15 req/hour per IP** (env-tunable via `RATE_LIMIT_PER_MINUTE`/`RATE_LIMIT_PER_HOUR`), one shared timestamp deque per visitor so a burst burns both caps; checked before the agent runs on BOTH endpoints, over-limit → 429 JSON `{error, message, retryAfter, window}` + `Retry-After` header (CORS headers present on it). IP = rightmost `X-Forwarded-For` entry (proxy-appended; earlier entries are client-spoofable), else connection host. In-memory on purpose — the Space is a persistent process, a restart merely forgives limits; no Redis. Widget: `AgentStreamError.retryAfter` set from 429 (either endpoint) → Nami posts "I need a breather — you've reached the chat limit. Try again in Xs/min", sends blocked until the retry passes, input placeholder counts down; normal failure copy unchanged. Tested: unit tests on window math (minute/hour/expiry/slide/isolation, no Gemini calls), live curl burst (5×200 → 429, stream 429 on the same bucket), and browser E2E with temp 3/hour limits (3 replies → 4th shows limit message + cooldown blocks send). No token cap / history truncation — deliberately skipped (request limit is the real protection; low caps would clip Nami's answers).
- **Composer stacking + mobile send (2026-08-30):** the single-line input scrolled long questions sideways → now an auto-growing textarea (caps at 3 lines/70px, scrolls internally beyond with the scrollbar hidden — `.chat-scroll` in globals kills scrollbars on the composer AND the message log) that drives the widget's height: composer box → strip height → face bottom-padding → measured panel height → the morphing container. The face re-measure is deterministic (effect on composer/view/messages/streaming ticks) after the face ResizeObserver was found to silently stop delivering across morph stages; the clip layer pins scrollTop/Left to 0 so focus or scroll-into-view can never slide the panel inside its own frame. Hardware Enter sends (Shift+Enter stacks a line, touch Enter newlines); touch devices get a send button — round `bg-white/10` icon button (up arrow, same idiom as the panel's icon buttons), dimmed to 40% while empty/thinking/cooldown, shown only where `(hover: hover) and (pointer: fine)` doesn't match. Verified: a long question stacks exactly 3 lines growing the panel with zero overlap and no visible scrollbars, the strip re-anchors to the bottom, and the composer resets after a send.
- **Composer height + message wrap fixes (2026-08-30):** on a fresh open the box sat one line too high — the mount-time height measure ran while the widget was still a narrow 208px pill, wrapping the placeholder to two lines (46px) and never re-measuring; the grow effect now re-runs through the morph stages, so the fresh-opened box is one line, level with the DotSphere (measured: composer/dots/strip centers all equal). Unbroken long words (no spaces) overflowed the message column past the panel edge — committed and streaming message text now use `overflow-wrap: anywhere` (long words wrap in place; log `scrollWidth == clientWidth` with a 120-char word).
- **Morph jitter fix (2026-08-30):** the stage-driven re-measure above let the composer react to mid-morph layouts — at the 56px-wide circle stage the slot wraps its text, inflating the box to the cap and dragging the strip height up (56→98), then everything snapped back at open; since the strip centers the sphere and the text, that oscillation read as jitter during the reveal. The grow measure now runs ONLY at the open stage (real width), and the textarea carries a fixed 23px one-line base height for pill/circle/bar. Verified with a 60fps sampler across the morph: 211 frames, composer constant at 23px, strip 56→72 monotonic, zero height reversals.
- **Mobile no-side-scroll rails (2026-08-30):** user reported side scrolls + half-cut panels on real phones (devtools emulation). Swept 320/390/412/440 with base layout, chat open, mobile menu open, and work menu open: no in-flow overflow, chat panel always 16..vw−16, work menu w-full — could not reproduce in desktop emulation. Hardened anyway, since the old `overflow-x: hidden` (body only) is bypassable by mobile browsers (html can still pan): html + body now use `overflow-x: clip` — no horizontal pan can open on any device regardless of culprit (font boosting, fixed-panel edge cases). Chat morph root capped with `max-w-[calc(100vw-32px)]` so the panel/pill can never exceed the screen even on a mis-measure. If a device still misbehaves, capture device + width + which panels are open.
- **Mobile work-menu slide regression fix (2026-08-30):** the responsive width change flattened the panel's open/closed class ternary and left `max-[860px]:[transform:translateX(0)]` applied to BOTH states — the closed sheet no longer parked off-screen left, so the mobile slide (translateX −103% → 0) was gone: the panel just flipped visible and items popped against an instantly-appearing background. The per-state mobile transforms are restored per branch (closed −103%, open 0). Verified at 390px via the real MENU → Work flow with a 60fps transform sampler: parked at −386px, slides −385 → −229 → −86 → 0 over ~0.6s on the original bezier, 0 reversals across 231 frames. Audited against `main`: every animation-defining string (transform states, 0.65s bezier, wmIn/wmOut stagger, phase machine) is byte-identical — only width, cqw scaling and the featured-row data fields differ.
- **Work-menu hover scrollbar pop fix (2026-08-30):** hovering into the dropdown made the panel "jerk" — a scrollbar popped and vanished. rAF sampler on the panel caught it: during the staggered `wmIn` entrance the "See all work" button rises from `translateY(26px)`, and its descent pokes ~12px past the panel's bottom edge; the root's `overflow-y: auto` turned that transient into a 15px-wide scrollbar for ~90ms on EVERY open (and every hover-reopen), reflowing the panel as it appeared/disappeared. Fixed by clipping the white featured-list section (`overflow-clip`) at exactly the line the panel already clipped it visually, so the entrance travel no longer extends the scroll area; the root also gets `overflow-x-clip` (computes to hidden per the clip+auto pairing rule) so cqw fractional rounding can never flash a horizontal slider. Verified: 172-frame sampler across entrance + category-link hover → 0 scrollbar frames, `scrollHeight == clientHeight` throughout; at a 420px-tall viewport the permanent scrollbar still appears and the panel still scrolls to its max (tall-content rule intact). `tsc` green. Animation strings untouched — entrance looks identical (the descent was already invisible under the root's clip).
- **Next up:** scheduling tool behind /api/agent; deployment (Hugging Face Spaces) later — SSE needs `Cache-Control: no-cache` / `X-Accel-Buffering: no` (already set) and no gzip at the proxy. Bots: Cloudflare Turnstile (free, invisible to humans) worth adding when the site goes public.

### ✅ Responsive work menu + hydration fix (2026-08-30)
- **Work menu scaling (final):** the panel was a fixed 750px box pinned top-right — fine on laptops (≈52vw) but a detached corner card on monitors / zoomed-out browsers. Since the nav lives in the hero's right half, the trigger always sits at ~50vw, so the panel width is `max(50vw + 24px, 750px)` and its left edge lands just left of the `[WORK]` trigger at EVERY desktop width (measured −32px at 1920/2560/3440, −38 at 1440 incl. body scrollbar). The root is a size container (`@container`) and all internals scale in panel-relative `cqw` clamps — category links `clamp(19px,3cqw,44px)`, micro text `clamp(11.5px,1.7cqw,24px)`, gaps/paddings/thumbs/button heights similar — so proportions hold from tablet to ultrawide; generous caps keep extreme sizes sane. Tablet (750px floor) and mobile sheet overrides untouched. Verified with real-hover screenshots at 1440/1920/2560 + numerics at 3440: `scrollWidth == clientWidth` everywhere.
- **Menu overflow fix (found during verify):** the featured rows' tag column was a hard `76px` (sized for the old 11.5px text) — scaled-up "LIVE APP" overflowed it and forced a horizontal scrollbar on the panel. Column is now `auto` (content-sized).
- **Nav bracket shift fix:** the WORK trigger rendered its `[ ]` brackets into the DOM only while the menu was open, widening the label and shoving ABOUT/SERVICES/CAREERS sideways on every open. Brackets now always exist, absolutely positioned just outside the label (into the inter-link gaps, `pointer-events-none`) and fade via opacity — measured nav positions identical to 0.1px between rest and open.
- **Hydration fix (pre-existing):** `DotsIcon` computed dot coords with trig — server and browser disagreed in the last ulp (`cy="12.12435565298214"` vs `12.124355652982139`) and React logged a hydration attribute mismatch on `/`. Coordinates now rounded to 10 decimals in `icons.tsx`; dev-overlay issue badge cleared on reload.

### ✅ Boilerplate purge + single-source wiring (2026-08-30)
- **Content:** all 18 placeholder projects deleted. `allWork` is real work only — DropSync + Game cam.
- **Single source of truth:** `data/projects.ts` now derives everything from `allWork` — `workCategories` counts are computed per category (Website [1] / Mobile App [0] / Experiential [1] / E-commerce [0]; the [0]s fill themselves as real projects land), `totalWork = allWork.length`, and `featuredProjects` is projected from `featuredSlugs` (menu order: DropSync first, then Game cam — add a slug there to feature more). Menu featured rows link by slug (name-matching map removed) and show `blurb` + `tag` ("Live app" / "Desktop") where the fake project codes used to be.
- **Deeper overviews:** `WorkItem.overview` is now `string[]` — one paragraph per entry. DropSync gets 4 paragraphs (what it is, encryption model, collaboration features, the AI layer); Game cam 3 (what it is, the real-time C++/shared-memory architecture, the editable-output design). Case-study page renders stacked paragraphs, bumped type (17–21px, left-aligned column), metadata joins them.
- **Cleanup:** placeholder SVG thumbs removed — `ProjectThumb` renders one real asset per `ThumbKind` only.
- Verified: `tsc` green; /work shows 2 cards + derived counts; landing-page menu markup shows featured blurbs/tags and derived category counts; both case studies + category filter pages 200.

### ✅ Real projects: DropSync + Game cam (2026-08-30)
First two real projects in the works section, replacing placeholder entries (grid went 18 → 20; the "17 projects" note here was already stale).
- **Assets:** user dropped readmes + screenshots into `public/` (`dropsync-*.png/md`, `gamecam-*`). Logo lockups extracted with Pillow (brightness-threshold bbox on the #0d0d0d field): `dropsync-card.png` / `gamecam-card.png` — 600×800, wordmark centered on matching bg so `object-cover` fills the 3:4 card seamlessly; tight `*-logo.png` crops kept for reuse.
- **Data:** `ThumbKind` += `dropsync`/`gamecam`; `WorkItem` += optional `media {src, alt}`. DropSync → Website 2026 (grid #1, screenshot as case media); Game cam → Experiential 2026 (creative-tech bucket — none of the four categories really fits a plugin; trivially re-filed). Counts bumped (Website 8, Experiential 5).
- **Rendering:** `ProjectThumb` renders `<img>` for real assets; AllWork's card container got `[&>img]` variants of the svg sizing/hover-zoom selectors. Case-study page renders `work.media` image when present, else the shared showreel (Game cam's screenshot is portrait — kept on showreel).
- **Camera Navigator CHAIN knowledge file** is the same product; portfolio name follows the wordmark: "Game cam", slug `game-cam`.
- Verified: `tsc` green; /work shows 20 cards with both logo images at full opacity; `/work/dropsync` + `/work/game-cam` 200 with real media on the former.

### ✅ Brand copy v1 (2026-08-28)
Home-page copy rewritten off the ripped reference text. New brand line: **"Beautiful. Useful. Autonomous."** with AI-first positioning (AI-enabled sites/apps, agentic apps, digital FTEs). Propagated to: hero intro + headline, layout metadata, category-page meta, footer statement ("…digital employees and the products they live in. / Designed with intent. Built to work."), skills intro (fixed "high-stander / I propose" placeholder), and Nami's backend instructions. `data/projects.ts` entries still placeholder — real projects next.
- **Hero voice tweaks:** "MIZU builds" → "We build" (individual, not corporate), and "AI that does the work" → "AI-enabled agents that do the work" (concrete agents over abstract AI).
- **Skills section reworked (2026-08-28):** H2 "Design skill sets" → "Skill sets"; the two design-only groups replaced with three — Design (06) / Engineering (04) / AI & Agents (04, includes Digital FTEs + agentic apps). Row details rewritten in plain language after the first pitch read as "too tacky and too AI"; then four rows cut as generic filler (Performance, Security & auth, Automations, Model integration). Accordion component unchanged (data-driven).

---

## Known gaps / TODO

1. About, Services, Careers pages (nav + footer links currently `#`)
2. Real portrait for Nami (greet view uses DotsIcon bloom on near-black block)
3. More real projects — Mobile App + E-commerce categories sit at [0] until content arrives; add entries in `data/projects.ts` and every surface updates
4. Footer social links (`#`)
5. README.md is stale (mentions CSS Modules; app uses Tailwind v4 utilities)

---

## Workflow reminders

- Verify with `npx tsc --noEmit` then load `localhost:3000` (cold start is slow — retry)
- PowerShell: `&&` doesn't work — use `;`; never edit via `Set-Content` pipelines (Turbopack file locks)
- Dev server can wedge — kill via `Get-NetTCPConnection -LocalPort 3000` PID, restart
- Root-level `*.png` / `*.html` are design references, committed alongside related work
- Only act on explicit instruction: no commits/pushes/merges unless asked
