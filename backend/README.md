# mizu-agent

Nami — the brain behind the chat widget on the MIZU site. A single agent
built with the [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/),
running on **Gemini** through Google's OpenAI-compatible endpoint. No tools,
no handoffs — one agent, one job.

## API

| Route | Body | Response |
|---|---|---|
| `GET /health` | — | `{"status": "ok"}` |
| `POST /api/agent` | `{"message": string, "history": [{"role": "user"\|"assistant", "content": string}]?}` | `{"reply": string}` |

`history` is the prior turns, oldest first — send it so the agent has the
whole conversation. Errors come back as `{"detail": "..."}` with status
`503` (not configured) or `502` (agent run failed).

CORS is limited to `ALLOWED_ORIGINS` (default `http://localhost:3000`).

## Run

```sh
uv sync
cp .env.example .env   # then paste your Gemini API key into GEMINI_API_KEY
uv run main.py         # serves on :8000
```

Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Configure

All config lives in `.env` (see `.env.example`): `GEMINI_API_KEY`, `BASE_URL`,
`MODEL_NAME` (default `gemini-3.6-flash`), `ALLOWED_ORIGINS`, `HOST`, `PORT`.
Because the model goes through the OpenAI-compatible client, swapping
providers (GLM, DeepSeek, …) is just a `BASE_URL` + `MODEL_NAME` + key change.
