# AGENTS.md

Rules and context for AI agents working in this repo. Read this before making changes.

**Prime rule: only act on explicit user instructions.** No commits, pushes, merges, or branch operations unless asked. All work happens on `dev`.

## Project

**MIZU** — digital agency site (portfolio). Built with Next.js App Router, so new pages go in `mizu-nextjs/app/<route>/page.tsx`.

Current pages:

- `/` — landing page (`mizu-nextjs/app/page.tsx`), section order: `Cursor → Hero (nav + work menu) → Showcase (skill sets) → Pricing → Footer`
- More pages are planned — when adding one, reuse the existing shell (Cursor, nav via Hero, Footer) and follow the design system below

## Stack

- Next.js 15 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS v4
- The app lives in **`mizu-nextjs/`** — run all commands from that folder
- No test suite. Verify changes with `npx tsc --noEmit` + a request to `http://localhost:3000` (expect 200 and the expected markup in the response)

## Commands (inside `mizu-nextjs/`)

- Dev server: `npm run dev` → http://localhost:3000
- Type check: `npx tsc --noEmit` (must pass before saying "done")
- Production build: `npm run build`
- Nami backend: from `backend/`, run `uv run main.py` (it's a uv project — never the global Python, which lacks the `agents` deps) → http://localhost:8000

## Environment (Windows — PowerShell)

- `&&` does **not** work in PowerShell; use `;` or separate calls
- `gh` is not on PATH — call it as `"C:\Program Files\GitHub CLI\gh.exe"` (logged in as `bilalinit`)
- Do **not** edit files via PowerShell `Set-Content` pipelines — encoding changes and file locks break Turbopack (os error 32). Use proper file-edit tools
- The dev server runs in the background and can wedge or die. If requests hang: find the PID with `Get-NetTCPConnection -LocalPort 3000 -State Listen`, kill it, restart `npm run dev`
- First page load after a cold start is slow (on-demand compile) — retry before assuming failure

## Structure

```
mizu-nextjs/
├── app/            layout.tsx (fonts: Anton = display, Inter = body), page.tsx (section order), globals.css
├── components/     one component per section/feature (Hero, NavRow, WorkMenu, MobileMenu, Pricing, Footer, Cursor…)
│   └── skills/     SkillSets.tsx (the "Design skill sets" section)
├── data/           content as typed exports (projects.ts, skills.ts) — put copy/content here, not inline in JSX
└── public/         static assets
```

## Design system

- **Palette tokens** (`@theme` in globals.css): `beige #c9c1b1`, `ink #131009`, `dark #1a120b`, `coal #121212`. Use tokens (`bg-beige`, `text-ink`) or the neutral grays for light sections (`#f0f0f0`, `#e7e7e7`, `#1a1a1a`, `#666666`)
- **Fonts:** `font-display` (Anton — huge, uppercase, brand moments) and Inter (everything else)
- **Motion:** standard ease `cubic-bezier(0.22,0.61,0.36,1)`; the pricing section uses elastic `cubic-bezier(0.34,1.56,0.64,1)`. Keyframes live in globals.css
- **Recurring motifs:** bracket labels (`[=]`, `[×]`, `[17]`), folder tabs with `clip-path` corners, uppercase ~11.5px micro labels, underline-draw-on-hover links (`after: scale-x-0 → 100`)
- Every animation needs a `prefers-reduced-motion` fallback (see existing blocks at the bottom of globals.css)

## Hard rules (bugs we already hit — do not reintroduce)

1. **Hover-driven UI must be mouse-only.** Use `onPointerEnter`/`onPointerLeave` with an `e.pointerType === "mouse"` guard. Touch taps fire compat mouse events → double-fire (menu opens then instantly closes)
2. **Never define a component inside another component's body.** React remounts the subtree on every state change, which kills CSS transitions (elements pop in with no animation)
3. **Breakpoints:** mobile ≤860px, tablet 861–1024px, desktop ≥1025px. Never stack `max-[860px]:` and `max-[1024px]:` on the same property of one element — use the range form `min-[861px]:max-[1024px]:` instead
4. **mix-blend-difference must sit on the transformed cursor wrapper itself.** A transformed parent creates an isolated stacking group, so a blended child would never see the page (cursor stays white everywhere)
5. **Custom cursor renders only when** `(hover: hover) and (pointer: fine) and (min-width: 1025px)` — same conditions as the `cursor: none` rule in globals.css. Never on phones/tablets
6. **Fixed panels taller than the viewport** need `max-h-[100dvh] overflow-y-auto overscroll-contain` (the work menu)
7. **Body scroll locks** while the mobile menu is open (effect in Hero)
8. **Tap targets ≥ ~44px on touch**, and the logo must not sit within a finger's reach of mobile menu links (it floats above the menu sheet; tapping it closes the menu instead of navigating)

## Git

- Branches: `dev` = working branch · `main` = stable · `backup` = archive
- **Do nothing on your own initiative: no commits, no pushes, no merges, no branch switching unless the user explicitly asks.** All work happens on `dev`
- Remote: `origin` = `github.com/bilalinit/portfolio-2` (private)
- Root-level `*.png` / `*.html` files are design references — commit them alongside the work they relate to

## Reference material (repo root)

- `mizu.html` — original static prototype (hero + work menu source of truth)
- `price.html` — pricing section source; its animations were ported 1:1 and must stay identical
- `smallscreen1-3.png` — mobile nav reference · `4.png` — skills section reference · `footer.png` — footer reference
