"""Nami — MIZU's chat agent.

A single Gemini agent (no tools) behind a tiny HTTP API:

    GET  /health                → {"status": "ok"}
    POST /api/agent             {message, history?} → {reply}

`history` is the prior turn list, oldest first, roles "user"/"assistant" —
feeding it back gives the agent the whole conversation, not just the last line.

Run:  uv run main.py     (config via .env, see .env.example)
"""

import json
import logging
import os
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Literal

from agents import (
    Agent,
    AgentUpdatedStreamEvent,
    OpenAIChatCompletionsModel,
    RawResponsesStreamEvent,
    Runner,
    RunItemStreamEvent,
    function_tool,
    set_tracing_disabled,
)
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
BASE_URL = os.getenv(
    "BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/"
)
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.6-flash")
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("mizu-agent")

# responses come from Gemini; with no OpenAI key, tracing must stay off or
# every run tries to export spans to OpenAI and logs 401s
if not os.getenv("OPENAI_API_KEY"):
    set_tracing_disabled(True)

# AsyncOpenAI refuses an empty key at construction — stand in a placeholder
# so the server still boots pre-key; run_agent() 503s on missing keys anyway
client = AsyncOpenAI(api_key=GEMINI_API_KEY or "missing", base_url=BASE_URL)

# ==== project knowledge tool ============================================
# Full client-facing write-ups live as markdown files; the instructions keep
# only short summaries. The tool loads a whole file into the model's context
# on demand, so deep detail costs nothing until someone asks for it.

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"

PROJECT_DOCS = {
    "dropsync": "dropsync.md",
    "camera-navigator-chain": "camera-navigator-chain.md",
}


@function_tool
def get_project_details(
    project: Literal["dropsync", "camera-navigator-chain"],
) -> str:
    """Load the full write-up for one MIZU project: features, capabilities,
    architecture and engineering details.

    Use this whenever the visitor wants more depth on a project than the
    short summary you already know — features, how something works, what is
    included, technical substance. Skip it for small talk or questions the
    short summary already answers.

    Args:
        project: "dropsync" (secure file-sharing & collaboration app) or
            "camera-navigator-chain" (After Effects camera-control plugin).
    """
    path = KNOWLEDGE_DIR / PROJECT_DOCS[project]
    log.info("tool call: get_project_details(project=%r)", project)
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return (
            f"The detailed write-up for {project} could not be loaded right "
            "now. Offer to have a human share the details over email instead."
        )

agent = Agent(
    name="Nami",
    instructions="""\
You are Nami, the AI assistant on MIZU's portfolio site. You are the studio's
front desk: you help visitors understand what MIZU does and whether MIZU is
the right fit for them.

## The studio
MIZU is a digital agency — "Move fast, build to last." We design and build
websites, mobile apps, e-commerce, and experiential installations. The
through-line is craft with real engineering behind it: polished, animated
frontends backed by serious systems — auth, encryption, real-time data,
AI backends.

## Selected work (short versions — full write-ups live behind your tool)
- DropSync ("dropsync") — a secure, temporary file-sharing and collaboration
  app: browser-encrypted drops (text, files, drawings) that expire on a
  schedule, shared workspaces with group chat, live calls, and a built-in AI
  assistant. We built it end-to-end. Live at drag-drop-app.vercel.app.
- Camera Navigator CHAIN ("camera-navigator-chain") — an After Effects
  plugin with game-style first-person camera control: WASD flight that
  records as clean, editable keyframes, chained motions, built as a native
  C++ real-time pipeline with a custom panel inside the app.

## The project-details tool
When someone asks for more than the short version — features, how something
works, what's included, technical substance — call get_project_details with
the project's slug, then answer from what it returns. Digest the document
and reply in your normal short, plain-text voice; never dump the raw
document, markdown, or bullet lists at the visitor, and don't reveal that
you read it from a file — it's simply your knowledge of our work.

## Your job
Answer questions about MIZU: what we offer, how we work, what we've built.
Help visitors figure out if MIZU fits their need, and point the ones with
real intent to a human.

## Hard boundaries
- When someone shows commercial intent (a project, a quote, a partnership,
  a meeting), respond like a great front desk: warm, brief, and straight to
  the bridge — hello@mizu.studio or the Contact tab, a human replies within
  one business day. That is the entire move. Never make it about yourself.
- No narrating your limitations on the way there: never say "I can't start
  projects", "I can't book calls", "I'm just an AI" or similar. You don't
  announce what you can't do — you simply connect the person with a human.
  Only if someone directly asks whether you're an AI, answer honestly and
  carry on.
- Don't invent: no made-up prices, timelines, discounts, team members, client
  names, or project details. Exact pricing and estimates come from a human —
  say the team will put together the specifics.
- Stick to what's in these instructions. If asked about specifics not covered
  here — other projects, team, rates — don't improvise; say a human can share
  the details over email.

## Voice
- Speak as one of the team: "we built", "we design", "our work". Never talk
  about MIZU in the third person ("MIZU is an agency that...", "MIZU built").
  The one exception: if someone asks what MIZU is, you may name it once to
  introduce it — "MIZU is a digital agency; we..." — then straight back to
  "we".
- Warm, direct, a little playful. No corporate filler, no emojis.
- Short — 1-3 sentences; this is a small chat panel.
- Plain text only: no markdown, no bullet lists, no links in your replies.
""",
    tools=[get_project_details],
    model=OpenAIChatCompletionsModel(model=MODEL_NAME, openai_client=client),
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class AgentRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=50)


app = FastAPI(title="mizu-agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/agent")
async def run_agent(req: AgentRequest) -> dict:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503, detail="Agent not configured: GEMINI_API_KEY is missing"
        )

    thread = [m.model_dump() for m in req.history]
    thread.append({"role": "user", "content": req.message})

    try:
        result = await Runner.run(agent, thread)
    except Exception:
        log.exception("agent run failed")
        raise HTTPException(
            status_code=502, detail="The agent failed to answer. Try again in a moment."
        )

    return {"reply": result.final_output}


# ---- streaming variant -------------------------------------------------
# The same run, but frames are pushed as they happen so the widget can show
# a live activity label and reveal the answer while it is being written:
#
#   event: activity   {"phase": "tool" | "tool_done" | "generating", "tool"?}
#   event: delta      {"text": "..."}          (answer text only)
#   event: delta_reset {}
#   event: final      {"response": "..."}
#   event: error      {"kind": "rate_limited" | "unknown", "message": "..."}
#
# Keepalive comment frames (": ping") are ignored by SSE parsers.


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


async def stream_run(thread: list[dict]) -> AsyncIterator[str]:
    try:
        result = Runner.run_streamed(agent, thread)
        streamed_text = False
        async for event in result.stream_events():
            if isinstance(event, RunItemStreamEvent):
                # the model talked and only then committed to a tool — that
                # talk was thinking-out-loud, so make the client discard it
                if (
                    event.name
                    in ("tool_called", "handoff_requested", "handoff_occured")
                    and streamed_text
                ):
                    streamed_text = False
                    yield sse("delta_reset", {})
                if event.name == "tool_called":
                    tool = getattr(event.item.raw_item, "name", None) or "tool"
                    yield sse("activity", {"phase": "tool", "tool": tool})
                elif event.name == "tool_output":
                    yield sse("activity", {"phase": "tool_done"})
                elif event.name == "message_output_created":
                    yield sse("activity", {"phase": "generating"})
            elif isinstance(event, AgentUpdatedStreamEvent):
                yield sse("activity", {"phase": "generating"})
            elif isinstance(event, RawResponsesStreamEvent):
                # only response.output_text.delta is answer text; other
                # .delta events carry tool arguments / reasoning
                if getattr(event.data, "type", None) == "response.output_text.delta":
                    delta = getattr(event.data, "delta", None)
                    if isinstance(delta, str) and delta:
                        streamed_text = True
                        yield sse("delta", {"text": delta})
        yield sse("final", {"response": result.final_output})
    except Exception as exc:
        log.exception("agent stream failed")
        detail = str(exc)
        kind = (
            "rate_limited"
            if "429" in detail or "quota" in detail.lower()
            else "unknown"
        )
        yield sse(
            "error",
            {
                "kind": kind,
                "message": "The agent failed to answer. Try again in a moment.",
            },
        )


@app.post("/api/agent/stream")
async def run_agent_stream(req: AgentRequest) -> StreamingResponse:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503, detail="Agent not configured: GEMINI_API_KEY is missing"
        )

    thread = [m.model_dump() for m in req.history]
    thread.append({"role": "user", "content": req.message})

    return StreamingResponse(
        stream_run(thread),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
    )
