# Atlas

Atlas turns repository evidence into an editable software architecture map. It works for frontend, backend, API, mobile, desktop and Electron, CLI, library, infrastructure, and mixed projects. The app is plain HTML, CSS, and JavaScript modules. Local mode needs no account or cloud connection. Optional online workspaces use Google sign-in and Firestore for live, owner-controlled sharing. Atlas has no analytics or AI service and never uploads source repository files.

The landing page, workspace (including shared viewers), and admin page use `public/favicon.svg`: the existing four-square Atlas mark on a dark tile, so browser tabs remain readable against light and dark browser themes. To check locally, reload `/`, `/workspace`, and `/admin`, then open `/favicon.svg` and confirm it loads; no remote image or new dependency is required.

## Run locally

Use Node.js 18 or newer to serve the checked-in static files. The optional Firebase client is bundled locally; rebuilding it requires the development dependencies.

```sh
npm start
```

Open http://127.0.0.1:4173 for the landing page; the interactive workspace is at http://127.0.0.1:4173/workspace. The development server binds to loopback and serves only the deployable public/ folder. Local share links work on this computer only. Copy agent prompt is available on both pages; deploy the static app before sharing remotely.

To preview from another device on the same network, bind to this PC's LAN address. In PowerShell, replace the example address with your Wi-Fi/Ethernet IPv4 address:

```powershell
$env:HOST = "192.168.1.100"
$env:PORT = "4174"
node server.js
```

Open `http://192.168.1.100:4174/` on the other device. Keep the PC and server running, and allow the preview through Windows Firewall if needed. This is a local-network preview; remote access still uses the deployed site. Browser storage remains separate on each device and origin.

Run the checks with:

```sh
npm test
```

The tests cover import schema and limits, Foglamp-compatible aliases, cycle and empty graph layout, backward edges and loops, categorized and legacy charts, optional detail/junction compatibility, safe SVG escaping, PNG size caps, share-link encoding/decoding and decompression limits, named-link clipboard contracts, prompt mode/location gating, generated-v1 helper bounds, exact helper stdout round-tripping, candidate URL verification and tamper rejection, cross-working-directory behavior, touch-specific category highlighting, persistent invalid-share recovery, empty-library/clear-data flows, inspector preferences, and browser storage errors/recovery.

The component category row stays on one line and hides its scrollbar. Hover over the row and use the mouse wheel to browse left/right; trackpad horizontal scrolling and Shift+wheel stay native. When the row cannot scroll farther, normal page scrolling resumes. Check with `node --test test/filter-interaction.test.js`, then import a map with enough types to overflow and scroll both directions at desktop/tablet widths.

The introduction includes an open 3D line illustration of connected software windows around the Atlas mark, with no surrounding card. A repository editor, agent notes and an architecture map surround a 3D Atlas mark that follows the header logo's rounded squares, spacing, slight tilt and alternating greens. Its shallow solid tiles have beveled edges, three flat cel-shading tones and ink contours. The platform uses matching flat surfaces and fine seams; outlines follow only visible edges as the model turns. The stacked platform and tiles are drawn as complete solids so their surfaces do not slice across one another when turning; the surrounding windows retain soft ground shadows and connected floating pages. Hover gently lifts a window and briefly traces its connection; drag turns the scene in 3D. Camera damping keeps motion consistent across display refresh rates. After five seconds without pointer or keyboard input, the scene gently returns to its starting angle over about 2.4 seconds. New input interrupts the return immediately; holding a pointer prevents it. The timer pauses while hidden or offscreen. Reduced motion keeps the delay and restores the angle without animation. A larger fixed canvas gives the windows room to rotate at the same scale and center; the caption is a fixed overlay near the bottom of the drawing area and lets pointer input pass through. Very narrow phones fit the scene once on resize rather than changing its size during rotation. Arrow keys rotate the focused illustration; 0 or Escape restores the initial view. Normal wheel/page scrolling is preserved. The scene is fictional, uses no saved maps or remote assets, follows the theme, stacks below the introduction on narrow screens, respects reduced motion and stops rendering when settled, offscreen or hidden.

The lower homepage illustration is a single connected 3D point network in its own full-width section. A uniform projection keeps the globe round, with about 40% of the desktop width for the reading columns; containers below 780px put the labels above the globe. A lighter mesh, smaller secondary dots and depth shading make the main hubs easier to follow. Hover fades a nearby point and its direct connections into the accent color without moving points or changing the camera. The rigid globe gently drifts only while it is not being explored. Hover or focus a software layer/component to trace its relationships, click to keep a selection, and drag or scroll over the dotted network to rotate it. Wheel input over labels or empty space keeps normal page scrolling. Arrow keys rotate the focused illustration; 0 or Escape resets its view. Space pauses/resumes gentle motion while the illustration is focused. The example uses fictional data, follows the shared theme, stacks within narrow containers, respects reduced motion, and pauses when offscreen or hidden. It does not load or change saved maps.

Check the network topology, circular framing, local highlight paths, relationship mapping and landing routes with `node --test test/landing.test.js test/landing-network.test.js test/landing-scene.test.js`. Browser smoke: open `/` at desktop and phone widths in both themes; confirm the original hero copy/actions remain usable and no text is cut off. Inspect the rounded Atlas mark from front, side and back, with clear gaps, complete bevels, flat color bands and continuous outlines in both themes. Check that no hidden edges show through the logo or platform. Check the unboxed 3D windows, hover lift and brief connection feedback, and drag/keyboard rotation and reset without layout movement. Turn through shallow, steep and reversed angles; check that bottom and side edges stay visible, the illustration does not zoom or shift to fit, and the caption remains readable without blocking drag input. Rotate the windows and leave them alone for five seconds; confirm a gradual return without any zoom or layout change, interrupt it with a new drag or arrow key, and check that continued input postpones it. Then move the pointer around the dotted network: confirm highlights fade without pulling points or tilting the view, the shape stays round across desktop/tablet/phone sizes and rotation does not change its scale. Hover/click API service to trace its hub and immediate connections, then drag/scroll the network, verify scrolling over labels/empty space moves the page, use its keyboard controls, and check Copy agent prompt still opens the prompt with this site's `/workspace` URL. With reduced motion enabled, confirm idle movement stops while explicit rotation remains available.

## Build a map

Choose **Copy agent prompt** on the landing page or in the workspace and paste it into a coding agent that is already working in the target repository. Unless your instructions already name both a delivery mode and output folder, the prompt asks for those choices before repository inspection or file creation. It recommends an explicit dedicated folder outside the source repository and resolves relative paths only against a base you named. Both modes inspect the repository read-only, ground claims in evidence, avoid secret values, and keep generated files in the agreed folder.

### Manual mode

Manual mode creates one new timestamped JSON file for you to import into Atlas. It does not create or run a helper or produce a viewer link.

### Automatic mode

Automatic mode creates a timestamped JSON file and a versioned Python helper beside it, configured for that exact JSON. The standard-library helper checks the documented generated version 1 fields and limits, computes a share URL, decodes and round-trips its fragment locally, then compares both the recovered bytes and parsed graph before printing anything. This preflight is not a full Atlas normalizer or canonical-size check; Atlas import validation remains authoritative.

Run the helper with no arguments. It prints one exact viewer URL after the local checks pass. Use that exact stdout as the destination of a project-named Markdown link, for example:

    [Open project graph](EXACT_HELPER_STDOUT_URL)

Do not reconstruct, shorten, wrap, insert whitespace into, or edit the URL. The helper's default invocation creates no URL text file or HTML launcher. For example, replace the placeholder timestamp and folder with the exact paths for your run:

    python "/chosen/Atlas output/make_atlas_link-YYYYMMDD-HHMMSS.py"

If you can capture the final link destination mechanically into a candidate text file, the same helper can check it with --verify-url-file. It recomputes the URL from its configured JSON and requires an exact UTF-8 byte match, allowing only one terminal LF. It reads at most 60,002 bytes and prints only a verification status, not the URL, on success; missing, unreadable, oversized, or mismatched candidates fail without URL output. Substitute the exact helper and candidate-file paths:

    python "/chosen/Atlas output/make_atlas_link-YYYYMMDD-HHMMSS.py" --verify-url-file "/chosen/captured-link-destination.txt"

If browser tools are available, open the named link and inspect its actual address and the resulting page. Confirm the project name and expected component count and check that no share-error banner is visible before saying the map opened successfully. If the address or page cannot be inspected, report browser verification as unverified; a generated link alone is not proof that the viewer opened. If an incoming share is rejected, Atlas preserves the current map and shows the decoder reason with local JSON import recovery.

The version 1 JSON format is:

```json
{
  "schemaVersion": 1,
  "project": {
    "name": "Example",
    "description": "A short project summary",
    "type": "Web application"
  },
  "nodes": [
    {
      "id": "api",
      "label": "HTTP API",
      "type": "API",
      "description": "Routes requests to application services",
      "source": "src/api",
      "group": "Server",
      "details": {
        "purpose": "Receives and validates requests before dispatch",
        "operation": "Routes accepted requests to application services",
        "inputs": ["HTTP request"],
        "outputs": ["JSON response"],
        "dependencies": ["Application Service"],
        "evidence": ["src/api/routes.ts: route handler"],
        "uncertainty": ["Retry behavior is configured elsewhere"]
      }
    },
    {
      "id": "service",
      "label": "Application Service",
      "type": "Service",
      "description": "Handles application rules behind the API",
      "source": "src/services",
      "group": "Server"
    }
  ],
  "edges": [
    {
      "id": "api-service",
      "source": "api",
      "target": "service",
      "label": "calls [observed]"
    }
  ]
}
```

A node may optionally include repository-grounded `details`: `purpose` (up to 500 characters), `operation` (up to 1,000), and `inputs`, `outputs`, `dependencies`, `evidence`, and `uncertainty` lists (up to 8 entries of 240 characters each). These details are shown in the inspector and in the accessible description of exported SVG nodes. The viewer treats all imported labels and details as text.

A node may optionally include an evidence-backed `chart` with a measured `label`, `kind` (`bar`, `line`, or `area`), 2 to 32 finite `values`, optional `unit`, and required `evidence`. Chart `label` is limited to 80 characters; `unit` to 24; `evidence` to 240. Independent categories use `kind: "bar"` and one `categories` label (up to 80 characters) per value. Ordered line/area series require matching category labels and an `order` explanation (up to 160 characters). Values are capped at +/- 1,000,000,000,000. Counts are not pass rates or proof of quality. Ask for a chart only when repository evidence supports its meaning; do not invent telemetry or dates. Older version 1 charts without categories remain valid and are shown as separate unlabeled bars with an explicit note that order is unspecified. Chart fields survive JSON export, share links, storage, and import. Use the local theme switch for light/dark surfaces; the preference is saved separately from project data, and SVG/PNG exports use the currently selected palette.

The **Timeline** view groups components into connected dependency steps numbered Step 01, Step 02, and so on. It shows direction and relationship labels, uses no calendar dates, and remains readable when a map has many stages. The **View example flow** action explicitly adds or reuses only the request-flow demo as its own project without replacing saved maps, including edits to an existing demo. Its area chart counts components per stage and its line chart counts outgoing edges per stage. Both are visibly marked as demonstration structural data, not runtime telemetry. A new browser opens to an empty project library. The landing-page sample links and the workspace **View example flow** action are opt-in; opening workspace.html?example=flow explicitly requests the same demo, consumes that query after opening, and never overrides a #map share fragment.

You can also paste JSON, choose a file, or drop a JSON file onto the graph. Imported text is shown as text, checked before it is used, and kept in browser storage. Use Export > Download JSON to make a backup and Import architecture to restore it in another browser. The workspace **Clear local data** confirmation removes saved maps, clears the current share fragment and example-flow route, and leaves the workspace empty after refresh. Cancel leaves the library unchanged. The app keeps the separate theme and inspector preferences. Clearing the browser's site data through browser settings also removes those preferences. Imports are limited to 2 MiB, 800 nodes, and 2,400 edges. Unsupported schema versions and broken references are rejected.

Edit nodes and connections in the app, drag nodes into a useful arrangement, and save JSON, SVG, or PNG. PNG rasterization is capped at 8,192 pixels per dimension and 24 million pixels total; the full SVG export remains available for larger maps.

On the Map, right-click empty canvas to add a component at that world position; panning and zooming are accounted for, and Cancel creates nothing. Right-click a component, or focus it and press ContextMenu/Shift+F10, to edit it, connect from it, or delete it with confirmation. Edit and connect forms save only on Save; Cancel returns focus to the originating component. Delete captures the component and map identity and removes it and its attached connections only after confirmation. Drag a circular output port to an input port to open a connection form with the direction prefilled. A canceled or invalid gesture does not change the map. Select a connection to edit it, or use its context menu to edit, reconnect either endpoint, delete with confirmation, or branch it. The context menu supports arrow keys, Home/End, Tab/Shift+Tab to leave for the next/previous page control, and Escape; dialogs return focus to the originating graph item.

A version 1 node may use `"type": "Junction"` with `"junction": true` as a presentation waypoint; it does not claim a runtime software component. Use junctions only for genuine fan-out or when splitting an evidenced connection makes the map clearer. Branching keeps the original source-to-junction direction and relationship, uses an unlabeled junction-to-original-target continuation, and labels the new junction-to-branch edge only with the user-provided relationship. The junction and both added connections are saved together only after Save. Cancel leaves the original graph untouched. Export and share preserve the marker. Existing self-links and parallel connections remain supported.

## Local storage and share links

The project library is stored in this browser's local storage for this site. It does not sync between devices. A missing library starts empty. If browser storage is blocked, changes are only in the current session; use Export > Download JSON to keep a backup, then Import architecture to restore it elsewhere. The app reports quota failures instead of claiming a save succeeded and preserves malformed saved bytes for recovery. The inspector's width and expanded state use separate guarded local preferences and never touch the project library. Drag its desktop divider or use the keyboard separator controls; on small screens the inspector stacks below the graph.

A share link embeds the graph in its URL fragment using gzip plus base64url, with a raw UTF-8 base64url fallback. Copy named link puts a project-named Markdown link and, where supported, a rich-text hyperlink on the clipboard; Copy link remains available for the complete plain URL. Prompt-generated viewer links target workspace.html; the site root is the landing page. Existing links with a #map fragment on the root are redirected to the workspace while preserving their query and fragment. The viewer decodes and validates the fragment locally. Browsers do not send a URL fragment in the HTTP request, and local fragment decoding makes no network request. The Content Security Policy permits only the configured services needed by optional online mode. A copied link still contains the complete map data, so avoid sharing maps with sensitive repository details. Links over 60,000 characters are refused; use JSON export and local import instead. Recipients can pan, zoom, filter, inspect, edit, and save their own independent browser copy; their changes do not update the sender map or other recipients, and there is no live collaboration.


When you delete a project opened from a shared link, Atlas clears the URL fragment only when it exactly matches that project, so refreshing will not restore the deleted local copy. Canceling or deleting an unrelated project preserves the current fragment. Deletion does not revoke a copied URL: opening an older external link later can import a fresh snapshot again.

A link generated on localhost opens only on the same computer. For other people, first deploy the static app and use its public URL.

## Deploy free static hosting

The deployment output contains only `public/`. Tests and the local development server are outside the deployment output.

### Vercel

Import the repository and select **Other** as the Framework Preset. Enable **Build Command Override** and leave the build command blank to serve the checked-in static files, including the locally bundled Firebase client. Set the output directory to `public`. The included `vercel.json` sets the output directory and security headers. See [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build).

### Cloudflare Pages

Create a Pages project from the repository. Use `exit 0` as the build command and `public` as the build output directory. The included `public/_headers` applies the security headers. See [Cloudflare Pages framework guides](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

After deployment, open the public app and use **Copy agent prompt** so the prompt includes its deployed base URL. Do not deploy using a localhost URL. No account credentials or deployment access are included with this project.

## Privacy and security

Local import, editing, rendering, browser storage and fragment sharing work without an account. Sign in from the landing page or workspace Account panel; signing in alone never uploads maps. Settings controls automatic saving of future maps to your account. Firebase loads for account access, session restoration and online maps; it does not load for anonymous local use. No telemetry or source repository files are sent. The Firebase SDK is hosted locally; initiating Google sign-in also loads the required Google OAuth helper script and Firebase sign-in iframe. These are the narrow authentication exception to local assets, not analytics. Security headers allow only the app and the configured Firebase/Auth services; labels are rendered as text, and SVG exports escape XML text and attributes.



### Import/export size

Atlas limits imported JSON to 2 MiB and checks the exact UTF-8 size of the two-space formatted JSON export before accepting new imports or creating share links. Previously generated bounded v1 share links and existing browser-saved maps remain readable even if their formatted export exceeds that cap. Such maps can be saved only unchanged or with a smaller formatted export until they return under the limit; new imports are rejected if their formatted export would exceed it.

Existing oversized legacy maps can still be downloaded as JSON backups. A formatted backup larger than 2 MiB cannot be imported back into Atlas until the map is reduced below the limit. New accepted maps pass the formatted-size check before saving.


## Optional online workspaces

Local mode remains available without signing in. JSON backups and self-contained fragment links keep working. A fragment link is an independent copy; an online link points to a live workspace and contains only its random identifier.

Google sign-in identifies the owner. In Settings, **Automatically save future maps online** is off by default and is separate from signing in. When enabled and signed in, creating a local map, importing JSON in Local Workspace or opening an agent fragment link saves that new map to your account. Import architecture in Cloud Workspace is an explicit direct upload to the current signed-in owner, independent of this preference, and creates no duplicate local workspace. Uploading includes labels, descriptions, notes, evidence, connections and saved layout. It does not upload the source repository. Existing local maps stay local until you explicitly move them. Maps opened while signed out remain local after signing in. Turning automatic saving off affects future maps, while maps already in your account continue to autosave edits. Owners edit normally without an edit-mode switch; recipients can inspect and navigate but cannot change or delete the map. Anyone with an enabled viewing link can read it, so an unlisted link is not confidential recipient authentication. Stopping sharing or deleting the online workspace disables future viewing; it cannot erase copies recipients already obtained.

For an agent-generated fragment link, Atlas validates and keeps a local copy first. When automatic saving is enabled and the account is signed in, a successful upload replaces the current browser address with the compact online workspace URL. The original link in the agent conversation remains an independent snapshot. Failed uploads retain the local map and original address with an explicit retry. A map initially opened locally is not silently uploaded by a later sign-in or preference change.

Deleting a cloud workspace retires its local association and cached creation result after the server confirms deletion. If its local copy is also deleted, reopening the original agent-generated fragment link recreates the local snapshot and can be moved or saved online with a fresh workspace ID. The old live cloud link remains unavailable. An interrupted upload keeps its original pending candidate for an explicit retry, so a lost response does not create duplicate maps.

Older browser-saved associations can still reference a cloud copy deleted in another browser or before these fixes. Opening a linked local map now checks the signed-in owner’s library on the server. If the committed copy is missing, Atlas removes only that saved reference and offers Move to Cloud Workspace again; the local map stays intact. Reload latest on a failed owned reference can return to that saved local map. An offline/permission failure, account or route change, unknown ownership or an unconfirmed pending upload never clears the reference. Recovery does not upload a replacement automatically.

Old-reference regressions: `node --test test/cloud-reference-recovery.test.js`; `npm run test:cloud:rules`. With disposable data, move a local map online, delete its cloud copy in another tab/browser, and keep the first browser’s saved local map. Open its cloud copy or reload the failed owner view; verify the local map remains available and Move can create a new copy after confirmation.

Deletion/reimport regressions: `node --test test/map-admission.test.js test/cloud-import.test.js test/sidebar-library.test.js test/cloud-associations.test.js`; `npm run test:cloud:rules`. The emulator covers creating, deleting, and moving the same agent map again under the same owner, then reading the new graph. Browser smoke with a disposable map: open an agent fragment link, move it to cloud, delete the cloud and local copies, reopen the same fragment link and move it again; verify the new cloud map opens and the original live link stays unavailable. Repeat with automatic saving enabled, and check an interrupted upload retries the same candidate.

The main Share action for an account map opens its short live-link controls during normal editing. New account maps start private; explicitly enable sharing before sending the link. Re-enabling sharing makes the same previous URL usable again. Local Share continues to offer a self-contained snapshot link and JSON backups. Use the bottom workspace dropdown to choose Local Workspace or Cloud Workspace and browse either library directly in the sidebar. Switching libraries does not move maps, upload them, or change the automatic-saving preference. Each map has its own settings button for actions on that specific map, including details, JSON backup, and confirmed deletion. Local maps can be explicitly moved to cloud; owner cloud maps also have live sharing and stop-sharing controls. Account and general Settings remain separate. Previously opened owner maps display a temporary read-only memory preview immediately while the server checks access; first opens still need a network fetch. The library dropdown uses a custom sidebar menu with a current-mode checkmark, viewport-aware placement and keyboard navigation. Mouse selection has no native focus border; keyboard focus remains visible. Clear local data appears only in Local Workspace mode. Loading uses the existing status/canvas caption, with controls kept in place instead of an extra banner. During a first cloud-map load, theme-matched skeletons fill missing description, filter and inspector content; the graph canvas stays empty and the selected sidebar card breathes subtly until the response finishes. Content fades in over240ms when ready, while the remaining skeletons fade out. Cached previews remain visible, and background saves/live revisions do not replay the entrance. Reduced-motion preferences remove the movement and fades, and hidden pages pause repeating effects. Returning to the cloud library reuses its same-account list and listener; browsing does not reset the currently open map, and clicking that map again does not restart its subscription or discard unsent edits. Memory previews are bounded, cleared on account changes and lost on a page reload. First-fetch latency cannot be guaranteed independently of Firebase and the network. Sharing/deletion controls use the owner library metadata, while graph data loads only when details or JSON export need it. Viewer updates use the live listener after a saved revision; no refresh or polling is required.

Google sign-in is remembered by Firebase in this browser profile for this exact site origin until you sign out or clear site data. Landing and workspace pages restore a previously signed-in account automatically; already-open tabs also detect sign-in and sign-out. A temporary Checking label prevents an unverified signed-out state during restoration. The account hint is only a boolean that triggers a Firebase check; it is never an identity or permission. A failed check retains the hint for a later retry, while a confirmed sign-out clears it. Auth persistence is separate from graph storage and the explicit future-map auto-save preference. Different browser profiles, Chrome versus Firefox, localhost versus127.0.0.1, and different ports have separate sessions. Never-signed-in local visits still avoid loading Firebase.

Sign-in from long agent-generated map links uses a short current-page URL while the Google popup is active. The map stays loaded in the same document; the original link and history state return after success, cancellation, popup blocking or network failure. New navigation during sign-in takes precedence. Map fragments and query parameters are kept out of the authentication handler request; no upload setting changes.

Regression command: `node --test test/auth-popup.test.js test/account-session.test.js test/cloud-service.test.js`. After changing the Firebase adapter, run `npm run build:cloud` to update the checked-in bundle. Browser smoke on localhost with a disposable map: open a long agent link while signed out, click Account then Sign in, confirm Google opens without URI Too Long, close the popup and verify the exact map link and graph return, retry sign-in, then move the map only when explicitly choosing Cloud Workspace.

Session regression command: `node --test test/account-session.test.js test/account-presentation.test.js test/cloud-service.test.js test/cloud-subscription.test.js`. After rebuilding, use a disposable account on the same origin: sign in, navigate workspace -> landing -> workspace, reload, open a new tab, then sign out and confirm other open tabs update without a second sign-in. Verify that an already-open signed-out landing tab updates after sign-in elsewhere, and that restoration does not change the automatic-saving setting. Do not clear an owner profile's site data for these checks.

Owner edits have a separate browser recovery draft scoped to the account and workspace until confirmed saved. Concurrent changes are reported as conflicts; camera movement and filters do not save graph revisions. A stable pending creation ID lets interrupted uploads reconcile on retry instead of duplicating a committed map.

The database stores UTF-8 JSON in bounded byte chunks with a current revision pointer. Backend rules enforce owner-only writes, immutable ownership and current-revision reads. Conflicting saves must be reported rather than silently overwrite another revision. There is no visit-count or inactivity deletion policy.

The configured development project is `atlas-ahmedsaeed4-2026`. Firestore is in `asia-south1`; Google sign-in is enabled. No Storage or Functions service is required. Hosting the static files and configuring Firebase access rules are separate steps. For another deployment, use a dedicated Firebase project, replace the public web configuration, test its rules, authorize the final site hostname for sign-in, and update the exact CSP service/domain entries. Never put service-account keys or private credentials in the static files.
### Rebuilding and checking online mode

The checked-in cloud bundle allows static hosting without a hosting build. To rebuild it after changing the Firebase client, use Node.js 20 or newer, run `npm ci`, then `npm run build:cloud`. Run `npm test` for the application tests. Run `npm run test:cloud:rules` with Java 21 or newer to check database permissions against the isolated `demo-atlas-cloud-rules` emulator project. Emulator tests must not target a production database.

Opening maps, receiving revisions, reconnecting and rule dependency checks consume database reads. Larger maps use multiple documents. Monitor the dedicated project's usage; the free tier is bounded. See the official [Firestore quotas](https://firebase.google.com/docs/firestore/quotas) and [read billing details](https://firebase.google.com/docs/firestore/pricing).

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the module layout and browser-local data flow.

## License

MIT. See [LICENSE](LICENSE).

### Free-service operation
Keep the dedicated Firebase project on the Spark plan with no Cloud Billing account linked. Atlas uses Google sign-in and Standard Firestore's free allowance; no Cloud Functions, App Hosting, paid backend, or automatic plan upgrade is required. Serve the static website using a free hosting plan. Cloud reads, writes, storage and transfer still have limits; reaching a free quota can stop cloud requests until that quota resets. Local maps and JSON backups remain available. See [Firebase Spark plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) and [Firestore free quotas](https://firebase.google.com/docs/firestore/quotas).
Shared-map viewers can inspect and search, copy the same live URL with Share, copy the agent prompt, and export JSON, SVG, PNG or an image. Editing, add-component/relationship and layout controls are hidden for viewers. Reading/exporting does not grant owner permissions; loading or unavailable maps cannot be exported, and pending raster exports stop if navigation or access loss changes their map.

Viewer action regression checks: `node --test test/workspace-actions.test.js test/ui-regression.test.js`. These cover viewer versus owner/local controls, confirmed-read availability, pending owner navigation, revoked/deleted/private access, and raster context changes.

Shared-view recipients see an Atlas introduction and a Create your own graph — free link instead of the Local/Cloud switcher, their account-library prompt or local backup controls. The link opens `./workspace` in a separate tab with no view ID or copied graph; returning visitors keep their existing maps. Owners retain the normal sidebar when their identity is confirmed. This is presentation only; it does not change upload preferences or sharing permissions.

## Workspace limits

Each signed-in account can own up to20 Cloud Workspaces by default. The administrator can grant30,40 or unlimited workspaces to an account. Local maps do not count toward this account limit. Creating a new map, importing an agent map online, or moving a local map online uses one slot; editing or sharing an existing cloud map uses no additional slots. At the limit, local moves and automatic uploads keep their local map available; direct cloud imports keep their JSON/file in the import dialog for retry and explain how to make room. A slot is released only when deletion of its cloud workspace succeeds. Existing over-limit data is preserved and can still be edited or deleted.

The limit is enforced in Firestore rules as well as the client. An owner-only workspace-ID registry changes atomically with each create or final delete, including concurrent tabs and lost-response retries. Clients cannot reset it, reserve phantom slots, or give themselves an exemption. The policy does not require a paid function or billing upgrade.

For a new dedicated Firebase project, deploy the tested rules with `firebase deploy --only firestore:rules --project <your-project-id>`. Before first activation, use trusted administration to initialize `workspaceQuota/{uid}` for every existing owner's actual workspace IDs, then verify exact membership. Registry fields are `schemaVersion:1`, `workspaceIds`, `lastWorkspaceId`, `lastAction:"seed"`, and server `createdAt`/`updatedAt` timestamps. Preserve existing registries and graphs; do not seed from a browser count. Enable `system/workspaceQuota` with `enabled:true` only after verification. This server-only record pauses new creates/final deletes while setup is incomplete; existing edits and sharing remain available. For an empty project no registry seed is necessary.

Verify locally with:

```sh
npm run build:cloud
node --test test/cloud-quota.test.js test/routing.test.js test/map-admission.test.js
npm run test:cloud:rules
npm test
```

## Clean workspace routes

New app, viewer and agent links use `/workspace` (for example `/workspace?view=<id>`). Existing `/workspace.html` URLs remain supported; the app replaces the filename in the browser address without losing a view query or map fragment. JSON files and local browser data are unchanged. The development server serves both paths. Vercel uses `cleanUrls:true`, and [Cloudflare Pages serves matching HTML at extensionless paths](https://developers.cloudflare.com/pages/configuration/serving-pages/). Other static hosts must map `/workspace` to `public/workspace.html`; retain the old path and preserve queries/fragments. [Vercel clean URL documentation](https://vercel.com/docs/project-configuration/vercel-json#cleanurls) describes its hosting setting. Public hosting deployment remains a separate action.

### Check local map deletion

Run `node --test test/sidebar-library.test.js test/controller-utils.test.js test/storage.test.js` for target, pending-save, deletion-snapshot and persistence checks. For a browser smoke check, use disposable local maps: create a map, open View example flow, and open the sample row settings. Cancel Delete local map once, confirm it next, then reload and verify only the sample is gone. Recreate the sample, select the other disposable map, and delete the inactive sample through its own row settings; the selected map should remain unchanged. Cloud records are not involved in this local check. Also open a disposable encoded map link with automatic cloud saving off, refresh, and verify both Edit project > Delete project and the row settings > Delete local map allow confirmed deletion. A reserved cloud ID for a map that stayed local is not an upload; it must not block deletion. Candidates with a prepared upload payload, unknown status, or an active move remain protected until resolved.

Desktop type chips have a three-click cycle: lock the hover highlight, hide that category, then restore its visibility. Click an empty area of the map to clear the highlight and component/connection selection while keeping the workspace and inspector open; panning or cancelled gestures do not deselect. A locked highlight stays while moving the pointer, panning, zooming or focusing another chip; clicking another visible category locks that one instead. All restores hidden categories and clears the highlight. Keyboard activation follows the desktop cycle; touch still taps to highlight and taps again to clear. These are local viewing controls and never change the shared map. Both libraries show newly created/imported maps first: local maps retain their insertion order and cloud maps sort by creation time, independent of edit timestamps. Editing, renaming or sharing keeps a map in its existing position. A deliberate Local-to-Cloud dropdown switch opens the first owned cloud map in sidebar order when its list is available; later list refreshes do not change your selection. Manual map selection and switching back to local cancel pending automatic selection. Direct shared links continue to open their own target.

Library/type regressions: `node --test test/sidebar-library.test.js test/filter-interaction.test.js test/cloud-ui.test.js`. Browser smoke: start from a disposable local map, switch to cloud and check the top map opens; choose another cloud map, return local, then switch cloud and check the top opens again. Rapidly return local before a delayed cloud list arrives and verify no later navigation. Hover a category, click once, move to the graph and pan/zoom: the highlight remains. Click an empty map area and verify the lock clears without closing the inspector; lock it again and pan to confirm it persists. Click the same category twice more to verify hide then restore; All resets other hidden categories. Import a new disposable map in each library and check it appears at the top, then edit an older map and check its row stays put. Repeat on a shared viewer without graph writes.

Local-only admission reminders appear once when a workspace is created or first imported, beside its sidebar card, with an Okay button. Restored library entries do not show the reminder after refresh or a landing-page round trip, even without clicking Okay; reopening a map does not repeat it. This uses the existing saved library and changes no storage/upload preferences. On mobile, the new reminder waits until its sidebar card is visible. Actionable upload failures and recovery/retry notices remain available. Browser smoke: create a disposable local map, leave the reminder open and reload, then go home and return; it stays absent. Create another map and verify its own reminder appears once. Repeat with a new fragment import and hard refresh.

Workspace and landing pages declare an early canvas background and browser color scheme before external assets load. The saved theme is applied before body rendering; this reduces white flashes during navigation while keeping the viewer CTA as a normal new-tab link. Browser-controlled blank-tab painting before the destination document arrives is outside the page's styling.

Per-map live sharing updates cached sidebar metadata immutably because service summaries are read-only. Browser smoke with a disposable cloud map: open its sidebar settings, create a live link, copy it, close/reopen settings, revoke it, then close/reopen again. Sharing controls and the row status follow the confirmed result, and another map remains unchanged. A failed service action must show an error without claiming success.

The sidebar View example flow shortcut appears while the selected library has fewer than two workspaces. Two or more local entries hide it in Local Workspace; two or more maps owned by the signed-in account hide it in Cloud Workspace. It updates when libraries change or a map is added/deleted, and reappears below two. Shared viewers keep it hidden; the landing-page sample link remains available. Browser smoke: create two disposable local workspaces, reload, remove one, and switch to cloud libraries with one/two maps.

Map settings closes with X, Close, Escape, or a click/tap on the dimmed backdrop. Inside clicks and drags beginning inside the panel keep it open. Backdrop dismissal uses the same target/read cleanup as Close; it never saves or confirms an action. Browser smoke: open local/cloud row settings, click inside, click outside, reopen, and check Escape/confirmation cancellation.

Project details and the component editor also support backdrop dismissal through the normal cancel/close cleanup; unsaved form changes are discarded. Add node resolves the currently active local or cloud workspace rather than the last selected browser-local map. Cloud-owner browser smoke: open an owned map, Add node, save a fictional component, reopen to edit it, then switch maps and check its target remains correct. Shared viewers retain read-only controls/guards.

Async feedback: per-workspace create/move, share/revoke/copy, details loading/saving, export and delete show progress in the existing button and block repeated actions until completion. Controls restore after failure/cancel; changing panels never applies an old result to a new target. Automatic creation and owner autosave use the existing header/row. Save retries keep the existing recovery panel steady while the button shows Retrying; a failed save stops its spinner and preserves the recovery draft. Clipboard confirmations are transient horizontally centered manual popovers at the original bottom offset above native dialogs, with no extra success section; modal clipboard fallbacks stay inside the active modal. If copying is completely blocked, the live URL is selected in the existing error area for manual copying. A successful move offers Open Cloud Workspace in place of Move. Theme-matched indicators preserve button geometry, pause on hidden pages and respect reduced motion. Account sign-in/out, snapshot preparation, main copy actions and exports use the same feedback. Clipboard actions keep their existing label for the first 160 ms, showing progress only if still pending; the Copy agent prompt button uses the same small pressed movement as the other buttons, without an accent flash.


At 820px and narrower, a compact 32px rounded-square menu icon with a padded 44px touch target opens a sidebar drawer with an inside Close button. Tapping the dimmed area, pressing Escape or selecting a workspace closes it. The map is inert and page scrolling pauses while the drawer is open; keyboard focus stays in the drawer and returns to the opener on dismissal. Desktop resizing restores the normal sidebar and unlocks the map. Browser smoke with disposable maps: at 768px and 390px, open the drawer, click inside, tap outside, reopen and use Close/Escape, then select a workspace; verify the backdrop and scroll lock clear each time. Use Tab/Shift+Tab, open Import from the drawer, and resize above/below 820px while it is open. Check both themes and reduced motion. Press Copy agent prompt and verify the same 1px movement as Share, a steady label on quick copies and progress on slow copies.

Action gate regressions: `node --test test/action-feedback.test.js test/sidebar-library.test.js test/account-presentation.test.js`. Browser smoke with disposable data: throttle cloud actions, create a live link and double-click its confirmation; verify one submission and immediate progress. Copy while settings stays open and verify the pasted URL/new confirmation. Revoke, save inactive-map details, move a local map and delete a disposable cloud map. Try a failed action, retry, close during pending work and open another target; controls must restore and stale completion must not change the new panel. Enable save-new-maps only in a disposable browser context to check automatic creation/header failure recovery. Check dark/light, narrow screens and reduced motion. No real owner data is required for these checks. Switch Local to Cloud and back using both mouse and keyboard; verify first-cloud selection, the mode checkmark, Escape/Tab/outside dismissal and local-only Clear local data. Check the same menu at a 390px viewport and both themes. For prompt copying, verify quick success keeps the label steady, delayed completion displays the spinner without changing button dimensions, and blocked clipboard access restores the button and opens the manual-copy fallback.


Architecture import follows the sidebar destination captured when the dialog opens. In Cloud Workspace, paste/file/drop uses the same validation and imports directly to the verified signed-in account; it does not add a local project or change automatic-saving consent. The existing submit button shows Importing and restores controls/input on failure. A small owner/hash-scoped candidate ID (no graph payload) supports idempotent retry with the same JSON, including after refreshing and selecting/pasting that JSON again. A confirmed import opens its graph immediately. Closing the dialog or changing account prevents stale navigation; an already committed upload remains in its owner’s cloud library. Shared viewers cannot import. Local Workspace retains local import and optional future-map admission behavior.

Checks: `node --test test/cloud-import.test.js test/cloud-ui.test.js test/controller-utils.test.js`; `npm test`. Browser smoke with disposable data: keep automatic saving off, select Cloud Workspace (including an empty library), import pasted JSON and a file, verify the cloud list gains a map and local list count is unchanged. Simulate create failure, verify input/control recovery, then retry the same JSON and verify one candidate/map. Close during a delayed upload and verify completion never replaces the current graph. Select Local Workspace and import a different map; verify only the local list grows. Use a shared viewer and verify Import remains hidden. Drag/drop uses the same captured destination/UID and rejects a late file read after either changes.


### Undo and redo map edits

Use Ctrl+Z (Command+Z on Mac) to undo and Ctrl+Y or Ctrl+Shift+Z (Command+Shift+Z on Mac) to redo. The two compact arrow controls beside Layout do the same. Ctrl+C keeps copying; inputs and textareas retain the browser's native text undo. Completed node drags count as one step. Node/connection additions, edits and removals, project details and automatic layout are reversible; pan, zoom, search, filters, workspace creation/deletion, sharing and account changes are outside graph history.

History is separate for each local map and cloud owner/map during this page session. Switching maps keeps their available history, while reload clears it. A new edit after undo discards redo. History is bounded to50 steps per map,20 remembered maps and32MiB estimated string memory across the session; older snapshots/maps may be evicted. Cloud undo/redo uses the existing owner-checked autosave and live-update path. Applied changes from another session reset earlier history; own matching save confirmations retain it. Shared viewers have no Undo/Redo mutation controls. These limits do not alter the saved graphs or exports.

Run `node --test test/edit-history.test.js test/cloud-ui.test.js`. Browser smoke with disposable maps: drag a node several times in one gesture, undo once to the original position and redo; edit its label, add/delete a node with a connection and undo/redo; change layout and undo while preserving zoom. Undo, make another edit and verify redo disables. Switch maps and check history remains separate; reload and check both arrows start disabled. Test Ctrl+Z inside an edit field without changing the saved graph. Repeat edits/rapid undo/redo with an owned fictional cloud workspace while autosave is pending; verify the final confirmed graph. Applied external revisions and account changes must clear stale cloud history, and shared viewers must not expose editing controls.


### Account administration

The static `/admin` page is available only to the sole administrator confirmed by Firestore. Its account directory shows names, emails, registered workspace usage and allowance choices20/30/40/unlimited. The administrator keeps unlimited access. Set an account back to20 to revoke extra allowance; existing maps remain editable, exportable and deletable even above the new cap. Limits affect new Cloud Workspace creation only. Browser-local maps do not count. Unlimited removes the Atlas account count cap; Firebase's service quotas still apply.

Administrator identity lives in an operator-created `system/adminAccess` document. Every browser, including the admin browser, is forbidden from changing it. Account limits are protected by Firestore rules and read during the workspace admission transaction; editing JavaScript, a profile name/email or local storage cannot grant permission. Other users cannot enumerate the directory or read another account's allowance/usage. Administration does not grant access to private workspace graphs. The existing Account panel shows Manage accounts only after a server-confirmed admin check.

Signed-in verified users enroll only their own name/email from Firebase token claims. The operator bootstrap backfills existing Firebase Auth account metadata without password/hash/token export, telemetry, graph access, new paid services or application hosting changes. Accounts created outside Atlas appear after bootstrap or after opening the updated app; the directory count is the loaded registered directory, not a live Firebase Auth total. Pages are bounded to50 accounts.

From an already authenticated Firebase CLI operator environment, preview the exact project/account first:

```sh
node scripts/bootstrap-admin.js --project YOUR_PROJECT_ID --email YOUR_ADMIN_EMAIL
```

The default command is read-only. Deploy the tested `firestore.rules` to that selected project, then explicitly apply using the verified Firebase UID returned by preview:

```sh
node scripts/bootstrap-admin.js --project YOUR_PROJECT_ID --email YOUR_ADMIN_EMAIL --apply --uid VERIFIED_FIREBASE_UID
```

Apply refuses a different existing administrator, unverified/disabled selected accounts, linked billing, stale configuration/profile writes, or published rules that differ from the tested local rules. It atomically creates immutable admin configuration, the administrator's unlimited allowance and current Auth directory profiles. It leaves all workspace and usage documents untouched. Repeating the setup is idempotent. With a separately installed pinned CLI, `ATLAS_FIREBASE_CLI_LIB` may point to its `lib` directory; no credentials belong in code or command arguments. Ordinary grants/revocations then use the page, without further CLI access. Concurrent stale allowance edits require Refresh before saving.

Checks: `node --test test/account-access.test.js test/admin-controller.test.js test/admin-bootstrap.test.js test/cloud-service.test.js`; `npm run test:cloud:rules`; `npm run build:cloud`; `npm test`. Use disposable accounts/data: signed-out and non-admin visits must reveal no account rows; admin can grant30/40/unlimited and restore20; an over-limit downgrade preserves every existing map; an account switch immediately clears the directory; delayed/failed saves restore controls and ignore stale completions. Verify narrow/light/dark/reduced-motion presentation and native sign-in persistence on the same origin. Emulator tests also attempt direct writes to bypass the UI, profile/role spoofing, private directory reads and creation of maximum eight-chunk graphs.