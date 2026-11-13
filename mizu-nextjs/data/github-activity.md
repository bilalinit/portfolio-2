The About page starts with the real `github-activity.json` snapshot, then automatically refreshes from the same-origin `/api/github-activity` Pages Function. It refreshes on opening the page and hourly while visible, including when returning to an older open tab. No site rebuild is needed for live updates.

The Function fetches AhmedSaeed4's public contribution calendar directly from GitHub, validates daily counts against its published total, and caches successful responses for one hour using Cloudflare's Cache API. No token, database, paid application, or scheduled rebuild is required. GitHub may delay publishing contributions; this is an hourly refreshed public calendar, not a real-time commit stream.

Only `/api/github-activity` invokes a Function (`public/_routes.json`); other routes stay static. Use Cloudflare Pages' Free/Workers Free plan: its current shared Functions/Workers limit is 100,000 requests/day. This feature adds no paid service, but cannot promise unlimited free API traffic. Edge caching reduces GitHub fetches; requests reaching the Function still count against the free quota.

Pages project root: `mizu-nextjs`. Build command: `npm run build:cloudflare`. Output: `out`. Deploy via Pages Git integration or Wrangler so the root `functions/` directory is compiled; dashboard drag-and-drop of `out/` alone does not deploy Functions. Existing chat backend settings are unchanged.

For local testing, build once and run `npm run dev:pages`. A plain static server or `next dev` does not run Pages Functions, so the snapshot remains visible there. If GitHub fails, changes its HTML markup, or the free quota is exhausted, the page retains the last successfully loaded calendar and its honest refresh date. The rest of the website continues to render independently.

Run `npm run refresh:github` with an authenticated GitHub CLI before rebuilding when you want to refresh the bundled fallback snapshot. Credentials remain in the CLI. Only AhmedSaeed4 is used; never include bilalinit activity.
