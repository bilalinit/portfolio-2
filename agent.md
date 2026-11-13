# Local portfolio design workflow

- MIZU is one independent developer’s brand, not a studio or agency. Use first-person singular for portfolio and contact copy. Nami is an AI assistant representing the developer, not a teammate. Preserve references to client teams and Warda’s teaching studio.

- Follow the technical and design rules in AGENTS.md.
- Keep the Work dropdown visually simple: no bracketed counters, eyebrow labels or introductory paragraphs. Use clear project cards, plain category links and one all-work destination.
- All Projects follows the same visual direction: no eyebrow labels or numeric counters; keep shared project artwork, subtle 4px image corners, and 2px controls.
- All Projects uses the live mizu-studio.pages.dev/work layout: three equal desktop columns, 30px column gaps and 46px row gaps, up to 1920px page width, and the same horizontal gutters as the navbar so the heading starts beneath the logo. Tablet uses two columns and mobile uses one, with normal top-to-bottom scrolling. Preserve the current card artwork, corners, titles and View project beneath images, descriptions and service tags; keep project order and filter animations. Do not restore staggered sizing, pinned horizontal scrolling or fade masks.
- Current user instructions take precedence over older repository workflow rules.
- Make the requested design changes locally and test them on localhost for the user to review.
- Stay on the current branch for this review. Do not create or switch branches until the user approves.
- Do not commit, push, merge, or publish anything without a subsequent explicit instruction.
- Keep the Sincro reference's smooth navbar collapse and expansion: pin the header, fade and slide the section headings, and shorten the header and destination tiles together.
- Expand the navbar on a small upward scroll anywhere on the page; collapse it when scrolling down. Keep the existing smooth transition and ignore tiny scroll jitter.
- Keep Company and Work links available while collapsed; preserve desktop hover menus and mobile navigation.
- Respect reduced motion, existing responsive breakpoints, and touch targets.
- Preserve the approved navbar animation and button spacing. Animate its visual bounds with transforms and clipping; avoid per-frame layout reads and root-style writes.
- Drive every navbar transition from the same root scroll-state attribute, published before paint, so labels, clipping, and dropdown alignment start together.
- Desktop smooth scrolling uses Lenis. Preserve native touch/reduced-motion scrolling, nested menu/chat scrolling, anchor navigation, and menu scroll locks.
- Hovering/opening the desktop Work dropdown must not stop page scrolling or hide the page scrollbar. Only the full-screen mobile menu locks the page.
- Keep the pricing sticky heading below the expanded navbar with a fixed gap; do not tie its top offset to the navbar animation. Pricing form controls use the same page-scroll smoothing as their surroundings.
- Verify TypeScript and the local page before reporting completion.
- The navbar mark uses the user's original rounded M image, traced into public/mizu-mark.svg and MizuMark in icons.tsx. Preserve that silhouette; do not substitute an MZ redesign.
- Main surfaces and navbar use neutral near-white (#fafafa) through the surface token; inverse text uses the separate on-dark token. Preserve white cards, neutral-gray pricing/footer sections, blue actions, and dark sections.
- Use brand-ink (#081423) selectively for the brand wordmark/logo and primary navigation. Keep body copy, dark section backgrounds, and buttons on their existing colors.
- Site copy, controls, headings, and credits use Instrument Sans with regular/medium/semibold roles. Preserve Manrope Light for the large MIZU wordmark. Skill sets keeps Inter and Inter Tight until its separate redesign.
- Pricing brief fields use the shared CustomSelect. Keep keyboard navigation, type-to-select, Escape dismissal, dependent service/scope choices, independent popup scrolling, and the page scrollbar intact.
- The single-project brief has three steps: service, scope, optional details. Service supports Something else with a required custom description and I'm not sure yet. Do not reintroduce design level or preferred start questions into the UI or email draft.
