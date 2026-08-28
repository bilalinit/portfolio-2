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
| Chat widget "Nami" | 🔶 In progress — UI + morph + DotSphere modes done; agent UI wired to `/api/agent`, awaiting Gemini key |
| About / Services / Careers pages | ⬜ Not started — nav links are `#` placeholders |
| Footer social links | ⬜ Placeholder `#` |
| Real project media | ⬜ Placeholder SVG thumbs (`ProjectThumb.tsx`) + shared showreel |
| Python agent backend (`backend/`) | 🔶 Built — FastAPI + Agents SDK on Gemini (uv); needs `GEMINI_API_KEY` in `backend/.env`; deployment (HF Spaces) later |

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
- **Agent backend `backend/` (2026-08-28):** uv project — FastAPI + openai-agents, single no-tools agent on Gemini via `AsyncOpenAI` + `OpenAIChatCompletionsModel` against Google's OpenAI-compatible endpoint. `POST /api/agent` takes `{message, history[]}` → `{reply}`; CORS pinned to the site origin; 503 pre-key, 502 on run failure. `sendToAgent()` now POSTs there (history rides along) with a chat fallback message on failure; `npx tsc --noEmit` green, endpoints smoke-tested, verified end-to-end through the widget with the real key. Model: default `gemini-3.6-flash` in code, but `.env` overrides to `gemini-3.5-flash-lite` — flash is only **20 req/day** on the free tier and burns out mid-testing; flash-lite has its own, larger bucket.
- **Nami instructions v2 (2026-08-28):** front-desk persona — studio positioning + short project summaries + hard boundaries: informs but never transacts, and never narrates limitations — commercial intent gets a warm "we'd love to — hello@mizu.studio" hand-off, no "I can't start projects" meta-talk. Voice rule: always "we built / we design", third-person "MIZU..." only when directly asked what MIZU is. Frontend copy (work grid, pricing numbers) deliberately kept out — it's placeholder and being reworked.
- **Project knowledge tool (2026-08-28):** `get_project_details(project)` function tool — full client-facing write-ups live in `backend/knowledge/*.md` (`dropsync.md`, `camera-navigator-chain.md`, distilled from the projects' READMEs/docs: what it IS, no build history); the tool loads a whole file into context on demand so the instructions stay short. Instructions carry only 2-line summaries + slugs and a "digest, don't dump" rule. Tool invocations log to the server console. New projects: drop a distilled markdown in `knowledge/`, add its slug to `PROJECT_DOCS` + the tool's Literal + a short summary in the instructions.
- **Streaming + activity label (2026-08-28):** `POST /api/agent/stream` — SSE frames (`activity`/`delta`/`delta_reset`/`final`/`error`) off `Runner.run_streamed()`; thinking-out-loud guard sends `delta_reset` when a tool call follows streamed text. Widget consumes via `lib/agentStream.ts` (fetch + ReadableStream; labels mapped client-side: `get_project_details` → "Reading up on our work…", generating → "Thinking…"). Thinking UI: shimmer label over the bouncing dots (`.shimmer-text` in globals.css; solid-color fallback under reduced motion — transparent text + no animation would vanish). Once text flows, the loader row is replaced by a streaming bubble (`useSmoothStream` hook, 40ms ticker, reduced-motion = instant reveal); the reply commits to the log only when the reveal catches up, so streaming-bubble → message swap is invisible. Non-streaming `/api/agent` kept as fallback (widget retries it only if the stream can't be established).
- **Per-visitor rate limiting (2026-08-28):** sliding windows in `main.py` — **5 req/min + 15 req/hour per IP** (env-tunable via `RATE_LIMIT_PER_MINUTE`/`RATE_LIMIT_PER_HOUR`), one shared timestamp deque per visitor so a burst burns both caps; checked before the agent runs on BOTH endpoints, over-limit → 429 JSON `{error, message, retryAfter, window}` + `Retry-After` header (CORS headers present on it). IP = rightmost `X-Forwarded-For` entry (proxy-appended; earlier entries are client-spoofable), else connection host. In-memory on purpose — the Space is a persistent process, a restart merely forgives limits; no Redis. Widget: `AgentStreamError.retryAfter` set from 429 (either endpoint) → Nami posts "I need a breather — you've reached the chat limit. Try again in Xs/min", sends blocked until the retry passes, input placeholder counts down; normal failure copy unchanged. Tested: unit tests on window math (minute/hour/expiry/slide/isolation, no Gemini calls), live curl burst (5×200 → 429, stream 429 on the same bucket), and browser E2E with temp 3/hour limits (3 replies → 4th shows limit message + cooldown blocks send). No token cap / history truncation — deliberately skipped (request limit is the real protection; low caps would clip Nami's answers).
- **Next up:** scheduling tool behind /api/agent; deployment (Hugging Face Spaces) later — SSE needs `Cache-Control: no-cache` / `X-Accel-Buffering: no` (already set) and no gzip at the proxy. Bots: Cloudflare Turnstile (free, invisible to humans) worth adding when the site goes public.

---

## Known gaps / TODO

1. About, Services, Careers pages (nav + footer links currently `#`)
2. Real portrait for Nami (greet view uses DotsIcon bloom on near-black block)
3. Real project thumbnails + per-project media (currently SVG placeholders + shared showreel)
4. Footer social links (`#`)
5. `GEMINI_API_KEY` into `backend/.env` + end-to-end chat test
6. README.md is stale (mentions CSS Modules; app uses Tailwind v4 utilities)

---

## Workflow reminders

- Verify with `npx tsc --noEmit` then load `localhost:3000` (cold start is slow — retry)
- PowerShell: `&&` doesn't work — use `;`; never edit via `Set-Content` pipelines (Turbopack file locks)
- Dev server can wedge — kill via `Get-NetTCPConnection -LocalPort 3000` PID, restart
- Root-level `*.png` / `*.html` are design references, committed alongside related work
- Only act on explicit instruction: no commits/pushes/merges unless asked
