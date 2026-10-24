# Atlas — software architecture mapping tool

Atlas is a MIZU browser-based tool for turning repository evidence into an
editable software architecture map. It supports frontend, backend, API,
mobile, desktop/Electron, CLI, library, infrastructure and mixed projects.
It maps existing software; it does not build or host the project being mapped.

## Links

- Live app: https://atlas-app-3el.pages.dev/
- Repository: https://github.com/AhmedSaeed4/atlas
- MIZU case study: /work/atlas
- Example graph: https://atlas-app-3el.pages.dev/workspace?view=MUwNPd2D-ryo2dWUP3a0cw

The example is a read-only map of the separately built TechFlow customer-support
system, with 36 components and 81 connections when verified. It illustrates
agents, APIs, workers, databases and infrastructure. Those counts describe the
example, not Atlas's capacity or runtime telemetry. It is not a system built
inside Atlas, and the live sharing link remains subject to owner revocation.

## Workflow

Copy the agent prompt from Atlas into the coding agent already working in the
target repository. The agent inspects repository evidence and generates a JSON
architecture file for import. Manual mode produces JSON; automatic mode also
produces a Python helper that validates and creates a snapshot viewer URL.
Atlas itself has no AI service, does not require a model API key, has no
analytics, and never uploads source repository files. Cloud mode uploads the
map when chosen, so do not describe all Atlas use as entirely offline.

Import by pasting JSON, selecting a file or dropping a JSON file. Pan, zoom,
search, filter component types and inspect details such as purpose, inputs,
outputs, dependencies, source evidence and uncertainty. Map and dependency-step
Timeline views help explore the architecture. Timeline steps are not dates.

Edit components, connections and layout; undo and redo map edits. Export JSON
for backups, SVG for scalable diagrams and PNG for images. Evidence-backed
charts may be included in components; do not invent measurements or pass rates.

## Storage and sharing

Local mode requires no account or cloud connection. Maps live in this browser's
local storage and do not automatically sync across devices. Export JSON for a
backup; browser storage can be cleared or become unavailable.

Optional cloud workspaces use Google sign-in and Firestore. Owners edit their
maps and may enable or revoke read-only live sharing. Shared viewers cannot
edit the owner's graph. Cloud saves may report conflicts and failures.

Snapshot links embed map data in the URL fragment and decode locally. Recipients
can work with independent copies; editing a snapshot does not update the
sender's map. Snapshot links are separate from live cloud sharing and deleting
a local map does not revoke copies of its snapshot link. Avoid sensitive
repository details in any shared map.

## Engineering and running locally

Built with HTML, CSS and JavaScript modules, with optional Firebase Google
authentication and Firestore. The static frontend is hosted on Cloudflare Pages.
Dark and light themes, keyboard controls and reduced-motion support are included.

After obtaining the repository, Node.js 18 or newer can serve the checked-in
static files with `npm start`. Open http://127.0.0.1:4173 for the homepage and
http://127.0.0.1:4173/workspace for the workspace. Local links only work on the
same computer unless a LAN or public host is configured. Rebuilding the optional
Firebase client requires Node.js 20 or newer, `npm ci` and `npm run build:cloud`.
Consult the repository README for current setup details.

## Limits and accurate claims

The supplied README documents imports up to 2 MiB, 800 nodes and 2,400 edges.
PNG exports are capped at 8,192 pixels per dimension and 24 million pixels total;
SVG remains available for larger maps. Snapshot URLs over 60,000 characters
are refused. Cloud account allowances and Firebase quotas apply; do not promise
unlimited free cloud storage or guaranteed availability. Do not confuse Atlas's
optional cloud sharing with simultaneous multi-user editing.
