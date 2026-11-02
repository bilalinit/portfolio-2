# mizu-agent

Nami — the brain behind the chat widget on the MIZU site. A single agent
built with the [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/),
running on **Gemini** through Google's OpenAI-compatible endpoint. One agent,
one job, one tool (`get_project_details` loads a project write-up on demand).

## API

| Route | Body | Response |
|---|---|---|
| `GET /health` | — | `{"status": "ok"}` |
| `POST /api/agent` | `{"message": string, "history": [{"role": "user"\|"assistant", "content": string}]?}` | `{"reply": string}` |
| `POST /api/agent/stream` | same body | SSE frames: `activity` / `delta` / `delta_reset` / `final` / `error` |

`history` is the prior turns, oldest first — send it so the agent has the
whole conversation. Errors come back as `{"detail": "..."}` with status
`503` (not configured) or `502` (agent run failed).

CORS is limited to `ALLOWED_ORIGINS` (default `http://localhost:3000`).

## Guardrails

Every request passes an **input guardrail** before Nami runs — a cheap
classifier agent (structured output; verified working on Gemini's
OpenAI-compatible endpoint) that blocks jailbreaks and prompt extraction,
off-topic "do my homework" misuse, and abuse. Blocked requests get a canned
front-desk reply shaped like a normal answer with `"blocked": true` (the
stream gets it as the `final` frame), so callers render it like any other
reply. The gate reviews the full bounded conversation as untrusted input and
fails closed if the classifier errors. Agent tracing is always disabled.

## Run

```sh
uv sync
cp .env.example .env   # then paste your Gemini API key into GEMINI_API_KEY
uv run main.py         # serves on :8000
```

Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Configure

All config lives in `.env` (see `.env.example`): `GEMINI_API_KEY`, `BASE_URL`,
`MODEL_NAME` (default `gemini-3.6-flash`), `GUARDRAIL_MODEL` (classifier
model, defaults to `MODEL_NAME`), `ALLOWED_ORIGINS`, `HOST`, `PORT`.
Because the model goes through the OpenAI-compatible client, swapping
providers (GLM, DeepSeek, …) is just a `BASE_URL` + `MODEL_NAME` + key change.

## Deploy (Vercel)

The same app runs on Vercel as Python serverless functions:

- `api/health.py`, `api/agent.py` and `api/agent/stream.py` each wrap the
  FastAPI app with a `FixedPath` ASGI shim that pins the public path — the
  Vercel Python runtime hands the app a rewritten path, so without the shim
  FastAPI's router would never match (one endpoint per function, no rewrites)
- `vercel.json` sets `maxDuration` and bundles `knowledge/` with the two
  agent functions
- `requirements.txt` is what Vercel installs (it doesn't read `uv.lock`) —
  regenerate after dependency changes:
  `uv export --no-dev --no-emit-project --format requirements-txt -o requirements.txt`

Config goes into Vercel's project env vars (never a bundled `.env`):
`GEMINI_API_KEY` and `ALLOWED_ORIGINS` (the frontend origin, e.g.
`https://mizu-studio.pages.dev`); `MODEL_NAME`/`GUARDRAIL_MODEL` optional.
Local dev keeps using `.env`.

## Free abuse protection (no additional service)

Before enabling public chat, configure the backend project's **Vercel Firewall**:

1. Firewall → Configure → New Rule, named `nami-chat-limit`.
2. Match request method `POST` AND request path starting with `/api/agent`.
   One rule covers both chat endpoints. Count by IP, without splitting the
   counter by endpoint/path.
3. Choose Rate Limit → Fixed Window → 60 seconds → 5 requests → return 429.
4. Review the plan/pricing shown in your account. Hobby currently includes one
   rate-limit rule and one million allowed requests; do not enable a paid plan
   or paid add-on for this setup. Review changes and publish the rule when the
   deployment is approved.
5. Verify a sixth request receives 429 even when alternating between endpoints.
   Check the rule is published on the backend project and covers its public
   domain. Publishing a firewall rule changes live traffic immediately.

Reference: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting .

The application adds per-process sliding limits (5/minute, 15/hour per visitor),
an all-visitors cap (100/hour per process), and at most 3 concurrent runs per
process. Configure with `RATE_LIMIT_PER_MINUTE`, `RATE_LIMIT_PER_HOUR`,
`GLOBAL_RATE_LIMIT_PER_HOUR`, and `MAX_CONCURRENT_RUNS`. Forwarded client IPs
are trusted only when running on Vercel; a direct server uses its socket peer.
IP records have bounded size and expire after an hour of inactivity. No Redis,
database account, or new provider is required.

These are layered abuse controls, not a strict global quota. Process counters
reset on restart and are separate across instances; edge limits can also be
regional. Rotating IPs can evade IP-based caps. Keep the Gemini project on its
unpaid tier with provider quotas, and do not attach billing as part of this
deployment. Provider quotas remain the backstop against aggregate model usage.
If usage grows, revisit a shared counter then.

Requests must be JSON, at most 64 KiB, with a nonblank message of at most 4,000
characters. History allows at most 20 entries and 12,000 total content characters
including the latest message. Unexpected fields are rejected. The frontend
prunes old history and excludes failed turns. Agent runs have a 40-second
deadline, 4-turn limit, and bounded output; the client gives up after 50 seconds.

## Regression checks

Run `uv run python -m unittest discover -s tests -v`. Tests mock model calls and
exercise validation, rate windows, spoofed headers, body bounds, concurrency,
classifier failures, execution deadlines, and stream cleanup without API usage.
