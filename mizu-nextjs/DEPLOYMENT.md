# Cloudflare Pages

The frontend exports static pages. Nami runs separately on Vercel.

## Git-connected Pages project

- Project name: `mizu-studio`.
- Live frontend: `https://mizu-studio.pages.dev`.
- Production branch: `main`.
- Root directory: `mizu-nextjs`.
- Build command: `npm run build:cloudflare`.
- Output directory: `out`.
- Node version: 22 (`.node-version`).
- Build-time variable: `NEXT_PUBLIC_AGENT_URL=https://<nami-project>.vercel.app`.

For the initial frontend-only launch, set `NEXT_PUBLIC_AGENT_ENABLED=false`.
This shows a clear unavailable message, disables chat requests and keeps the
Contact tab available. When the backend is ready, set the public URL above,
change NEXT_PUBLIC_AGENT_ENABLED to `true`, and rebuild.

Use the Vercel deployment's production origin, not a preview URL.
Changing NEXT_PUBLIC_AGENT_URL requires rebuilding the frontend. Do not publish
with a localhost or LAN backend address. Never place Gemini keys in NEXT_PUBLIC
variables or frontend files.

`build:cloudflare` retains the unused source showreel in public/ but removes its
generated copy from out/: the legacy file exceeds Pages' 25 MiB asset limit.
The preparation script also checks all other generated assets against that limit.

## Nami backend connection (Vercel)

Deploy `backend/` as its own Vercel project (root directory `backend`, no
framework preset). The `api/` entry files + `vercel.json` in that folder
carry the whole setup: one function per endpoint (`/health`, `/api/agent`,
`/api/agent/stream`), `knowledge/` bundled into the agent functions.
Dependencies come from `requirements.txt` (exported from `uv.lock`).

Store GEMINI_API_KEY and ALLOWED_ORIGINS as Vercel project env vars.
ALLOWED_ORIGINS must include the live frontend origin:
`https://mizu-studio.pages.dev`.
Multiple origins are comma-separated. Preview URLs need explicit CORS
handling; do not assume every preview hostname is automatically allowed.

Before launch, verify /health, chat streaming and the allowed-origin preflight.
Confirm the policy accurately identifies Cloudflare and Vercel as hosts.

## Verification

Run `npm run build:cloudflare` and `npx tsc --noEmit`. Serve out/ with a static
server and check direct loads of /, /work, every /work/<slug>, category routes,
/about, /privacy-policy and a nonexistent path. Check mobile menus, project
filters, assets, Gmail drafts and a real Nami reply after the backend is ready.
