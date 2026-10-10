# Warda — Online Quran Teaching Studio

Warda is the online home of **Wardah**, a professional Quran and Tajweed teacher. The site presents her courses (Noorani Qaida, Tajweed, Quran recitation, and more), lets students read and share their experiences, and routes everyone to WhatsApp to book a class. An AI assistant answers visitor questions automatically, in English or Roman Urdu.

The repository is a small monorepo with two apps:

| Folder | What it is | Stack |
|---|---|---|
| `warda_website/my-app` | The public website (landing page, reviews, profile) | Next.js 16, React 19, Tailwind CSS 4, Firebase |
| `warda-hugging/warda-app` | The AI assistant backend (chatbot API) | Python, FastAPI, OpenAI Agents SDK |

---

## Website (`warda_website/my-app`)

A single-page portfolio for the teaching studio, with a soft, elegant design (Playfair Display / Lato fonts, emerald palette, Framer Motion animations) and full dark-mode support.

### Features

- **Landing page** — Hero, About (Wardah's story and teaching philosophy), Lessons, a Quran verse break, FAQ, student reviews, and a contact call-to-action. Contact happens through a WhatsApp deep link, so visitors can go straight from the page to a conversation.
- **Course highlights** — The three learning tracks: The Basics (Qaida), Fluent Reading, and Memorization (Hifz).
- **Wall of Love (reviews)** — Visitors sign in with **Google** (Firebase Authentication) and post their story. Reviews are stored in **Cloud Firestore** and update live for everyone on the page via realtime listeners.
- **Profile page (`/profile`)** — Signed-in users can see and delete their own reviews ("Your Stories"), manage their session, and toggle between light and dark themes.
- **Protected routes** — The profile page requires sign-in; unauthenticated visitors are redirected to the home page.

### Under the hood

- Firebase is used for **Auth** (Google sign-in popup) and **Firestore** (the `reviews` collection, with security rules and indexes configured in `firestore.rules` / `firestore.indexes.json`).
- Deployed on Firebase Hosting (`firebase.json`, `.firebaserc`).

---

## AI Assistant Backend (`warda-hugging/warda-app`)

A lightweight REST API that powers the "Warda Assistant" chatbot. It is built with the **OpenAI Agents SDK** (`openai-agents`) and served by **FastAPI**, and is packaged as a Docker image to run as a **Hugging Face Space** (port 7860).

### How the agent works

- **Single purpose-built agent** — "Warda Assistant" is a support agent for the studio, not the teacher herself. Its system prompt enforces strict identity rules (always refers to Wardah in the third person) and a warm, concise tone.
- **LLM-agnostic** — The agent talks to **Google Gemini** (`gemini-2.5-flash-lite` by default) through the OpenAI-compatible chat completions API, so the model can be swapped with an environment variable.
- **Knowledge base in the prompt** — The agent knows Wardah's profile, all seven course offerings (Noorani Qaida, Basic & Advanced Tajweed, Quran Recitation, Masnoon Dua, Salat Mastery, Islamic Essentials), and scheduling options (30/40-minute sessions, flexible time zones).
- **Scenario logic** — Different playbooks per question type: pricing and platform questions are always routed to Wardah's WhatsApp link, course overviews are kept short, and religious rulings (fatwa-type questions) are politely deferred to Wardah herself.
- **Bilingual responses** — The agent mirrors the user's language: English in, English out; Roman Urdu in, Roman Urdu out (never Hindi script).
- **On-topic guardrail** — The agent runs with an output guardrail; if a conversation drifts off-topic, the tripwire catches it and the API returns a gentle "I'm here to help with our Quran courses" reply instead.
- **Stateless chat with history** — Each request carries the full conversation history, so the frontend stays simple and the backend scales horizontally.

### API

| Endpoint | Method | Description |
|---|---|---|
| `/chat` | POST | Send `{ "message": "...", "history": [{ "role", "content" }] }` and get `{ "response": "..." }` back |
| `/health` | GET | Health check (`{ "status": "healthy" }`) |
| `/` | GET | Simple info message |

CORS origins are configurable through the `ALLOWED_ORIGINS` environment variable (defaults to allowing all).

### Configuration (environment variables)

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | API key for the Gemini model |
| `OPENAI_BASE_URL` | OpenAI-compatible endpoint (defaults to Google's) |
| `OPENAI_MODEL` | Model name (defaults to `gemini-2.5-flash-lite`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (`*` by default) |

---

## Getting started

### Website

```bash
cd warda_website/my-app
npm install
npm run dev        # http://localhost:3000
```

Requires the Firebase project config in `lib/firebase.ts` to point at a project with Google sign-in and a `reviews` collection enabled.

### AI backend

```bash
cd warda-hugging/warda-app/backend
uv sync                        # install dependencies (Python 3.12+)
# put GEMINI_API_KEY=... in .env
uv run uvicorn backend.main:app --reload   # http://localhost:8000
```

`verify_agent.py` runs a handful of sample questions against the agent as a smoke test. For production, the included `Dockerfile` builds the same app for a Hugging Face Space (or any container host) listening on port 7860.
