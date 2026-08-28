<!--
  MIZU assistant knowledge file — loaded whole when the get_project_details
  tool is called with project="dropsync".
  Client-facing answers should describe what the product IS and can do —
  never volunteer build history or internal process. Reply in short
  plain-text prose, never raw markdown dumps.
-->

# DropSync

A secure, temporary file-sharing and collaboration app. Drop files, text, drawings, or start a live call on one device and pick them up on another — or collaborate with others in shared, encrypted workspaces. Everything is ephemeral by design: drops expire on a schedule you choose, and files are encrypted in the browser before they ever leave your device.

**Live app:** [drag-drop-app.vercel.app](https://drag-drop-app.vercel.app) — **AI agent backend:** [AhmedSaeed4/dropsync-agent](https://github.com/AhmedSaeed4/dropsync-agent)

## Features

**Drops** — Text snippets · File uploads (drag & drop, click, or clipboard paste) · Excalidraw drawings · Voice-to-text (Groq Whisper) · In-app reminders · Locked drops · Pinned drops · Multi-category organization

**Workspaces** — Shared encrypted spaces · 6-character invite codes · Owner/member roles · Group chat with quote-reply, editing, @mentions, #drop chips, read receipts, typing indicators, and presence

**Live calls** — LiveKit-powered group calling (desktop) · Up to 4 participants · Screen sharing · 30-minute daily per-person limit (trusted users exempt)

**AI assistant** — Chat with an AI agent over your drops (search, create, delete, stats, previews). Password-category drops are kept out of its reach.

**Backup & restore** — Password-protected `.dropsync` backups of your personal or workspace drops (files, drawings, categories, reminders, locked & password-category drops), restorable on any device with new IDs and preserved expiry

**Sharing** — Public view-only share links with auto-expiry, video player, and download

**Everyday UX** — Two layouts (Classic + Editorial) · Three themes (Light/Dark/Minimal) · 30-second delete undo · Bulk select/move/copy/delete · Saved paths scratchpad · FCM push notifications · Email verification

---

### Backup & Restore

- **Personal** — Export your personal drops to a password-protected `.dropsync` file from the drop-area toolbar; import from the gear next to Personal in the workspace switcher
- **Workspace** — Owners can export a workspace backup from the drop-list toolbar and import it from Workspace options (into a new or existing workspace). The owner-only button is a convenience gate: members already hold the shared workspace key
- **What's inside** — Active text drops, files, drawings, categories, display-name snapshots, reminders, locked drops, and password-category drops
- **What's not** — Expired drops, call drops, chat, share links, invite codes, and encryption keys
- **Password** — The archive is encrypted with a password you choose (8+ characters); DropSync cannot recover it if you forget it
- **On restore** — Drops get new IDs, keep their remaining expiry (capped at 24h), and re-importing is allowed with a duplicate warning
- **Large files** — 10 MB+ files ride in the backup without the extra per-file encryption layer, matching the live app (HTTPS-protected in transit)

### Drops

- **Upload** — Drag and drop files, click to browse, or Ctrl+V to paste an image directly
- **Text drops** — Markdown-capable composer with inline `#[Drop](id)` mention chips and a fullscreen editor view
- **Voice to text** — Record in the text modal or any chat composer; AI transcription via Groq Whisper (`whisper-large-v3`). Standard users get 20 clips per rolling 24h; trusted users are unlimited
- **Drawing drops** — Embedded Excalidraw canvas saved as PNG with embedded scene data, so drawings stay editable on reopen
- **Expiration** — 1h / 2h / 6h / 24h, or *forever* (forever is restricted to the trusted tier; timed drops can still be downgraded to a timed option)
- **Reminders** — In-app reminders on text drops (15m / 30m / 1h / 2h presets or custom); must fire before the drop's expiry; per-viewer glow with dismiss
- **Locking** — Workspace drops can be locked; only the creator or workspace owner can edit/move/delete/pin them
- **Pinning** — Up to 2 pinned drops per space; pinned drops sort to the top
- **Categories** — Up to 3 per drop; built-in Password and Link plus user-created custom categories; category filter pills with live counts
- **Editing** — Edit text content, name, categories, expiry, locked state, and attached images (file content is read-only)
- **Real-time** — Firestore `onSnapshot` listeners; changes appear across devices instantly
- **Preview** — Inline preview of text, images, videos (mp4/webm/ogg, streaming for binary files), text files, YouTube links, and drawings

### Workspaces

- **Create / join** — Create a workspace and share its 6-character invite code; join is enforced server-side via `/api/workspaces/join`
- **Shared encryption** — One shared AES-256 key per workspace, accessible to all members
- **Roles** — Owner (delete workspace, remove members, clear chat, transfer ownership) and members (leave anytime)
- **Move / copy** — Move or copy drops between personal space and workspaces, with automatic re-encryption and target-category resolution
- **Member management** — Kick members (invite code rotates so they can't rejoin), transfer ownership on leave, account deletion can hand workspaces to a successor

### Group Chat

- Encrypted at rest with the workspace key; real-time via Firestore
- **Quote-reply** — Reply with a quote strip; tapping it jumps to and highlights the parent message
- **Message editing** — Edit your own messages (within 24h, up to 10 edits), shown with an "(edited)" tag
- **Mentions & chips** — `#` autocompletes drops (clickable chips), `@` autocompletes members; mentions trigger FCM push + a workspace glow, and bypass mute
- **Read receipts** — "Seen by" roster per message, derived server-side
- **Typing & presence** — Live typing indicators and online/away member dots
- **`/clear`** — Workspace owners can wipe all messages with an inline confirmation
- **Notifications** — FCM push (production) + foreground browser notifications; mute toggle in Settings; iOS Safari unsupported

### Live Calls (desktop-only)

- LiveKit rooms managed by server-side API routes; call drops appear pinned at the top of the drop list with a LIVE badge
- Up to **4 participants**; mute, camera, screen share, fullscreen, and minimize (call keeps running minimized as a floating pill)
- **Daily time limit** — 30 minutes per person per day (UTC), enforced server-side with per-person accounting; trusted users are exempt and presence of a trusted user lifts the deadline for everyone; resets at midnight UTC
- One call per workspace at a time; capacity and limit checks happen server-side before any media permission is requested
- Phantom-call cleanup via LiveKit webhooks, stale-presence reaping, and a daily cron (`/api/call/enforce`)

### Share Links

- Generate a public view-only link for any drop with an auto-expiry
- Editorial share page (`/s/[shareId]`) with animated backgrounds, theme memory, video player, YouTube embed, copy, and download
- Reuses an existing active link when content hasn't changed; deleting the drop or share cleans up R2 assets
- Expired shares are cleaned up lazily on read and auto-deleted from R2

### Organization & Bulk Actions

- **Search** — by name/content; type `@` in a workspace search to filter by member
- **Sorting** — newest, manual (drag-and-drop reorder, persisted per space), name, size, expiry; fired reminders and pinned drops always sort first
- **Bulk select** — multi-select with bulk move, copy, and delete
- **Undo delete** — single-drop deletes get a 30-second undo toast with a live countdown

### Accounts

- **Sign-in** — Google or email/password (email users must verify their address first)
- **Settings** — display name, password reset, layout toggle, theme, chat-notification mute, magnetic footer toggle
- **Account deletion** — full flow with preview, re-authentication, and workspace ownership transfer
- **ToS consent** — clickwrap gate with versioning (`CURRENT_TERMS_VERSION`)
- **Admin dashboard** — `/admin` (owner-only) manages the trusted tier, which unlocks forever drops and unlimited call/voice usage

### UI & Themes

- **Editorial layout** (default) — clean, editorial design with pill buttons and rounded cards
- **Classic layout** — original card-style drop list
- **Three themes** — Light, Dark, Minimal (sage green), persisted per-user with a no-flash pre-paint script
- **Magnetic footer** — Lenis smooth scroll with a dissolve/magnet page footer (desktop wide screens; can be hidden from Settings)
- **Pages** — `/docs` user guide, `/about`, `/privacy`, `/terms`, `/admin`

## Security & Encryption

- **Client-side AES-256-GCM** — all text drops and files under 10 MB are encrypted in the browser before upload; the server never sees plaintext
- **Key management** — ECDH P-256 key pairs; the master key lives in IndexedDB with a Firestore backup for cross-device recovery; workspace drops use a shared workspace key
- **Large files** — 10 MB+ files are stored unencrypted for performance (HTTPS protects them in transit); the UI marks every drop ENCRYPTED / UNENCRYPTED
- **Chat encryption** — group chat messages are encrypted with the workspace key; the server only sees plaintext metadata (sender, timestamp)
- **Password drops & the AI** — password-category drops are excluded from the AI agent's reach
- **Server-side enforcement** — ownership/membership verified for every R2 delete, share, and call operation; invite-code joins, call limits, and forever-drop eligibility are all enforced on the server, not just in the UI

> **Note:** encryption protects data in transit and at rest on the server, but keys are backed up with your account — DropSync is not a zero-knowledge system (see the in-app Privacy page for the full details).

## Limits

| Limit | Value |
|-------|-------|
| Max file size | 500 MB per file |
| Encrypted threshold | Files under 10 MB are encrypted; 10 MB+ are not |
| Expiration options | 1h / 2h / 6h / 24h / forever (trusted tier) |
| Categories per drop | 3 |
| Pinned drops per space | 2 |
| Call participants | 4 |
| Call time | 30 min/day/person (trusted exempt), UTC |
| Voice transcription | 20 clips / rolling 24h (trusted unlimited), 2 MB per clip |
| Archive password | 8+ characters, user-chosen; cannot be recovered by DropSync |
| Group chat history | latest 200 messages |
| Message editing | own messages, ≤ 24h old, ≤ 10 edits |

## Tech Stack

- **Framework** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend services** — Firebase (Auth, Firestore, FCM), Cloudflare R2 (S3-compatible file storage)
- **Live calls** — LiveKit (client + server SDKs)
- **Drawings** — Excalidraw
- **Transcription** — Groq Whisper `whisper-large-v3`
- **AI agent** — separate FastAPI backend (OpenAI Agents SDK); the frontend connects via `NEXT_PUBLIC_AGENT_URL`
- **Animations & scroll** — motion, Lenis smooth scroll, dnd-kit (drag-sort)
- **Markdown** — react-markdown + remark-breaks (AI chat rendering)

---

---

# DropSync Agent Backend

AI-powered backend for [DropSync](https://github.com/AhmedSaeed4/dropsync) — a secure, temporary file-sharing and collaboration app. Built with FastAPI, the OpenAI Agents SDK, and MCP (Model Context Protocol).

The frontend's in-app AI assistant (chat panel → AI tab) talks to this service: it can search, create, update, move, copy, and delete drops, set reminders, manage workspaces and categories, and answer questions about how the app works.

## What It Does

- Chat with your drops using natural language — search, list, preview, create, update, move, copy, and delete text drops
- Create workspaces with auto-generated invite codes; join by invite code
- Fuzzy search — handles typos and misspellings across names, content, and categories
- Enforces per-workspace access control (personal drops are owner-only; workspace drops require membership)
- Sets, changes, and clears in-app reminders on text drops
- Password-category drops are protected by a three-layer defense (input guardrail + hard tool-level block + per-tool access checks)
- Trusted-tier enforcement — never-expiring ("forever") drops can only be created/kept by the owner or trusted users
- Knowledge agent answers "how does DropSync work?" questions without touching any data
- Per-user message limits (trusted users unlimited) — see **Limits**

## Architecture

```
Frontend (Next.js) ──POST /chat──▶ FastAPI (main.py)
                                      │  verify Firebase ID token → uid
                                      │  per-user quota gate (usage_limit.py)
                                      │  spawn FRESH MCP subprocess per request
                                      ▼
                              OpenAI Agents SDK (agent.py)
                                 ├─ DropSync Assistant (dropsync_agent)  — acts on data via MCP tools
                                 ├─ DropSync Knowledge (knowledge_agent) — app Q&A, no tools
                                 └─ PasswordGuardrail (input guardrail)  — LLM classifier, runs first
                                      │  bidirectional handoffs between assistant ⇄ knowledge
                                      ▼
                          MCP Tools Server (tools_server.py, stdio)
                                      │  Firestore reads/writes via Firebase Admin SDK
                                      │  decryption/encryption (decrypt.py)
                                      │  R2 image fetch/re-upload (r2.py)
                                      ▼
                                 Firebase Firestore
```

Key design points:

- **One MCP subprocess per request** — a fresh `tools_server.py` process is spawned (and cleaned up) for every `/chat` call. Nothing is pooled or reused across requests.
- **Caller identity is LLM-unforgeable** — the verified Firebase uid is injected into the subprocess environment as `DROPSYNC_VERIFIED_UID`. Tool parameters no longer accept a `user_id`, so the model has no channel to influence identity; `_verified_uid()` fails closed on a missing/invalid value.
- **Agents are cloned per request** — each request gets its own agent + MCP server pair, so concurrent requests can never cross wires (a race on the shared module-level agent would serve one user's identity to another).
- **Two agents with bidirectional handoff** — the assistant (has tools, acts on data) hands off to the knowledge agent for pure "how does X work" questions, and the knowledge agent hands back when an action is needed.
- **Admin SDK everywhere** — the backend bypasses `firestore.rules`, so every tool enforces authorization itself: workspace membership checks (`_is_workspace_member`), personal-drop ownership checks, and the trusted-tier gate (`is_trusted_caller`) before any write.

## Tools Available to the Agent

| Tool | Description |
|------|-------------|
| `list_drops` | List drops (personal or per-workspace) with decrypted content previews |
| `search_drops` | Fuzzy search across all accessible drops by name, content, or category (typo-tolerant, scored, top 10) |
| `get_drop` | Full details of a specific drop, including decrypted content |
| `preview_drop` | Open a drop in the frontend UI preview (returns drop id + workspace id) |
| `create_drop` | Create a new encrypted text drop (categories, expiration, optional reminder) |
| `update_drop` | Update a text drop's name, content (re-encrypted), categories, expiration, and/or reminder |
| `delete_drop` | Delete a drop (requires explicit user confirmation, per agent rules) |
| `move_drop` | Move a text drop between workspaces — content and attached images re-encrypted, categories preserved |
| `copy_drop` | Duplicate a text drop into another workspace, original untouched |
| `list_workspaces` | List the user's workspaces with role, member count, and invite code |
| `create_workspace` | Create a workspace with an auto-generated encryption key and invite code |
| `join_workspace` | Join a workspace with a 6-character invite code |
| `list_categories` | List categories with live drop-usage counts (personal or per-workspace) |
| `delete_category` | Delete a custom category (built-ins `password`/`link` cannot be deleted) |
| `get_storage_stats` | Storage stats with per-workspace breakdown (password drops counted, content hidden) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Run the agent on a message + conversation history (Firebase auth required) |
| `/health` | GET | Health check — returns `{"status": "ok", "model": "<live model>"}` |

### Chat Request

```json
{
  "message": "list my drops",
  "history": [
    { "role": "user", "content": "hi" },
    { "role": "assistant", "content": "Hello! How can I help?" }
  ]
}
```

- `message` — the new user message
- `history` — optional previous turns; **only `user`/`assistant` roles are accepted** (a `system` role is rejected at the request boundary)
- Auth: `Authorization: Bearer <firebase-id-token>`

### Chat Response

```json
{
  "response": "I found 2 drops: …",
  "previewDropId": "abc123",
  "previewWorkspaceId": "ws-456"
}
```

- `previewDropId` / `previewWorkspaceId` are present when the agent called `preview_drop`, letting the frontend open that drop in the UI.

## Security

- **Auth**: every `/chat` request requires a valid Firebase ID token; the caller's uid is verified server-side and never trusted from the body or model
- **Identity channel**: `DROPSYNC_VERIFIED_UID` travels out-of-band via a per-request subprocess env — the model cannot read or override it
- **Password protection (3 layers)**:
  1. **Input guardrail** — an LLM classifier (`PasswordGuardrail`) runs before the main agent and blocks password-content access attempts and jailbreak/injection attempts
  2. **Tool-level block** — every data tool independently rejects `password`-category drops (checks both the modern `categories` array and legacy `category` field)
  3. **Access control** — every tool re-verifies ownership/membership before reading or writing
- **Guardrail fail-open**: if the classifier errors, the request proceeds — the tool-level hard blocks are the real boundary, so a transient classifier failure leaks nothing
- **Trusted-tier gate**: `is_trusted_caller` (owner or `tier == 'trusted'`) is enforced on every forever-drop create/update/move write, defaulting to *standard* on any error (fail-closed)
- **Encryption**: drops are AES-256-GCM encrypted — personal drops via ECDH-derived keys, workspace drops via the shared workspace key; the backend decrypts on the fly so the agent can read (non-password) content, matching the app's design (not zero-knowledge — see the app's Privacy page)
- **No secrets in code**: all credentials come from environment variables

## Limits

| Limit | Value |
|-------|-------|
| Agent messages | 5 per hour + 25 per day (rolling windows, UTC) — **trusted users unlimited & untracked** |
| Create/copy/move per request | 7 drops max per single message (soft guardrail; no overall cap) |
| Categories per drop | 3 |
| Forever drops | owner / trusted tier only |
