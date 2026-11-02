# Audit fixes and verification

Work branch: `audit-review-fix`. The pre-existing Vercel deployment changes
were first committed on `main` as `bbe838d`. The owner approved merging,
pushing both branches and deployment on 3 November 2026.

## Implemented

- Patched frontend and Python dependency graphs; regenerated both lockfiles
  and the backend's hashed production requirements. Next remains on 15.x.
- Added bounded per-process visitor/total request counters, concurrency
  limits, stale-record cleanup, and trusted client-IP handling. Direct Uvicorn
  serving does not trust forwarded headers; Vercel metadata is used only on
  Vercel. No new service, database, account or paid dependency is required.
- Reject oversized JSON bodies before parsing, unexpected fields, blank
  messages, oversized history and excessive aggregate context. Deny unexpected
  browser origins before the agent runs, and restrict accepted content types.
- Check the complete bounded conversation in the input guardrail; fail closed
  when its classifier is unavailable. Always disable agent tracing.
- Bound model output, SDK turns and execution time; explicitly cancel streamed
  runs when the generator closes. Avoid exposing provider exception content.
- Bound/prune frontend history, exclude failed turns from future model context,
  enforce the composer limit, guard duplicate sends, and retain fallback 429
  cooldowns. Only unsupported streaming endpoints trigger a fallback request.
- Add client deadlines, cancellation and reader cleanup; validate SSE payloads,
  handle LF/CRLF/CR framing, and cap frame/output buffers.
- Generate Cloudflare security headers with the configured chat origin. Reject
  unsafe/private backend origins in Cloudflare deployment builds. Inline
  scripts/styles remain allowed because static Next.js hydration needs them.
- Correct the privacy policy's host to Vercel and describe actual memory cleanup.
  Broaden secret-file exclusions in Git/deployment bundles.

## Verified locally

- `uv run --locked python -m unittest discover -s tests -v`: 15 tests passed.
- `npm test`: 47 tests passed, including invalid deployment-origin rejection.
- `npm audit`: zero known vulnerabilities in the resolved frontend graph.
- `pip-audit` against the synchronized Python environment: zero findings.
- TypeScript validation passed; production static export completed.
- All 17 intended exported page/project/category routes returned 200 with
  expected markup. Unknown page/project, `/.env` and frontend API paths
  returned 404. Home-page assets loaded successfully.
- Generated anti-framing, MIME-sniffing, referrer, permissions and CSP headers
  were applied in the local export preview.
- Gemini checks passed: ordinary answer, blocked prompt extraction, and a
  streamed project response that called the project-details tool.
- Browser checks passed: rendered chat and follow-up replies, 4,000-character
  composer limit, Contact fallback, no observed console/CSP errors, mobile
  menu scroll lock/restoration, and no horizontal overflow at 390/1366 widths.

This Windows host incorrectly reports `EISDIR` when Node checks ordinary files
or directories with `readlink`. Standard builds hit that environmental error
on both Node 22 and 24. The successful build used a local-only compatibility
preloader outside the repository that normalizes the error only for verified
non-symlinks. No workaround is included in the application or Cloudflare
configuration. A normal Cloudflare/Linux build still needs verification during
the approved deployment. The local preview was built with a loopback chat URL;
deployment must rebuild with the public HTTPS Vercel origin.

## Deployment checklist

1. Owner reviews the branch and local preview (approved).
2. Merge/push and deploy the updated backend and frontend.
3. Enable the existing Vercel project's included firewall rate-limit rule:
   POST paths starting with `/api/agent`, shared IP counting across both
   endpoints, five requests per 60 seconds, action 429. Exact steps and the
   current documentation link are in `backend/README.md`. Check the account's
   included usage and do not enable a paid plan/add-on.
4. Verify the public rule, sanitized client-IP metadata, health, streaming,
   CORS, security headers, and the Cloudflare build. Keep Gemini unpaid with
   provider quotas; no billing is to be attached as part of this rollout.

The free design uses layered edge and per-process controls. It is not a strict
worldwide quota: process counters reset and differ across instances, edge
limits can be regional, and distributed clients can rotate IPs. Provider
quotas are the aggregate backstop. A shared counter can be reconsidered if
traffic warrants it. No finite test suite guarantees the absence of exploits.
