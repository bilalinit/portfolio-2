# Cloudflare Pages

The frontend exports static pages. Nami runs separately on Hugging Face Spaces.

## Git-connected Pages project

- Intended project name: `mizu-studio` (approved by the owner; availability pending).
- Production branch: `main`.
- Root directory: `mizu-nextjs`.
- Build command: `npm run build:cloudflare`.
- Output directory: `out`.
- Node version: 22 (`.node-version`).
- Build-time variable: `NEXT_PUBLIC_AGENT_URL=https://<your-space>.hf.space`.

For the initial frontend-only launch, set `NEXT_PUBLIC_AGENT_ENABLED=false`.
This shows a clear unavailable message, disables chat requests and keeps the
Contact tab available. When the backend is ready, set the public URL above,
change NEXT_PUBLIC_AGENT_ENABLED to `true`, and rebuild.

Use the Space's application origin, not its huggingface.co repository page.
Changing NEXT_PUBLIC_AGENT_URL requires rebuilding the frontend. Do not publish
with a localhost or LAN backend address. Never place Gemini keys in NEXT_PUBLIC
variables or frontend files.

`build:cloudflare` retains the unused source showreel in public/ but removes its
generated copy from out/: the legacy file exceeds Pages' 25 MiB asset limit.
The preparation script also checks all other generated assets against that limit.

## Nami backend connection

Configure the Docker Space to listen on `0.0.0.0:7860` (set HOST and PORT for
main.py, or use uvicorn with those arguments). Keep `knowledge/`, `pyproject.toml`
and `uv.lock` with the application. Store GEMINI_API_KEY as a Hugging Face secret.

Set ALLOWED_ORIGINS to the exact approved frontend origin, e.g.
`https://mizu-studio.pages.dev` once that address is actually assigned. Multiple
origins are comma-separated. Preview URLs need explicit CORS handling; do not
assume every preview hostname is automatically allowed.

Before launch, verify /health, chat streaming and the allowed-origin preflight.
Confirm the policy accurately identifies Cloudflare and Hugging Face as hosts.

## Verification

Run `npm run build:cloudflare` and `npx tsc --noEmit`. Serve out/ with a static
server and check direct loads of /, /work, every /work/<slug>, category routes,
/about, /privacy-policy and a nonexistent path. Check mobile menus, project
filters, assets, Gmail drafts and a real Nami reply after the backend is ready.
