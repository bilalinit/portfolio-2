# MIZU — Next.js + TypeScript

Pixel-faithful port of `../mizu.html` (the MIZU agency one-pager) to Next.js
App Router with TypeScript and CSS Modules.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

> `next/font/google` (Anton + Inter) downloads the fonts at build time, so the
> first install/dev run needs internet access.

## Structure

```
app/
  layout.tsx            # html/body, next/font (Anton + Inter), metadata
  page.tsx              # composes the page
  globals.css           # reset, design tokens, base styles
  icon.svg              # favicon (served automatically)
components/
  Cursor.tsx            # custom dot cursor (fine-pointer devices only)
  Hero.tsx              # beige hero; owns the work-menu open state
  NavRow.tsx            # nav links, WORK trigger, contact + a11y buttons
  WorkMenu.tsx          # the WORK dropdown panel
  Showcase.tsx          # dark section wrapper
  skills/SkillSets.tsx  # "Design skill sets" section (Rows layout, drift entrance)
  Pricing.tsx           # pricing section (elastic tabs, ported from price.html)
  Footer.tsx            # footer (rounded cream card, link columns, legal row)
  ProjectThumb.tsx      # SVG placeholder thumbs for featured projects
  icons.tsx             # folder + accessibility icons
data/
  projects.ts           # featured-project content
```

Each component is styled with Tailwind v4 utilities. `app/globals.css` holds the
design tokens (`@theme`: beige/ink/dark, Anton + Inter font stacks) and the three
keyframes (`riseIn`, `logoIn`, `wmIn`) referenced by arbitrary `animate-[…]`
utilities.
