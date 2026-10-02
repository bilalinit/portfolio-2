# Camera Navigator CHAIN (CameraNav)

**Game-style camera flying for Adobe After Effects, with automatic keyframing.**

Camera Navigator CHAIN turns an After Effects 3D camera into an FPS-style viewport controller.
You fly through the scene with **WASD + mouse drag** (like Blender or a first-person game), capture
the flight as keyframes with **snapshot or auto-key recording**, and organize complex shots as
**motion chains** — stacked camera-move segments that remain independently editable in the timeline.

The panel is a thin UI; all real-time work happens in a native C++ plugin inside After Effects,
which is what makes the movement smooth.

---

## Why this exists

The original version of this tool was a CEP panel that did everything by calling ExtendScript
through `evalScript()` roughly 60 times per second. Every call crosses JS → CSInterface →
ExtendScript → AE DOM with high, variable latency, which made camera movement choppy.

This project is a C++ refactor: the real-time loop (movement, rotation, keyframe writes) moved into
a native **AEGP plugin** running in After Effects' own idle loop, fed by a zero-copy shared-memory
channel from the panel. The CEP panel survives only as the control surface, and the original
ExtendScript implementation is kept as a fallback for when the native path is unavailable.

---

## Architecture

Three cooperating pieces:

```
CEP Panel (HTML/JS UI)                cameranav_bridge.exe              CameraNav.aex (C++ AEGP)
┌─────────────────────────┐    spawn    ┌──────────────────┐    ┌───────────────────────────┐
│ main.js                 │ ──────────► │ Win32 exe: named │    │ Lives inside After Effects │
│  • key bitmask (WASD…)  │             │ pipe server      │    │  • IdleHook polls SHM      │
│  • mouse-drag deltas    │  node_addon │  \\.\pipe\       │    │  • processes commands      │
│  • settings / buttons   │  index.js ─►│  cameranav       │    │  • moves/rotates nulls     │
│  • position readout     │  pipe client│  text protocol   │    │  • writes keyframes        │
└─────────────────────────┘             └────────┬─────────┘    └────────────┬───────────────┘
                                                 │  opens                    │ AE SDK suites
                                                 ▼                           ▼
                                     Shared memory "Local\CameraNav"   After Effects DOM
                                     (4 KB memory-mapped file)         (camera, nulls, keyframes)
```

| Component | Source | Build output | Role |
|---|---|---|---|
| **AEGP plugin** | `aftereffects-camera-nav/src/*.cpp` | `CameraNav.aex` | The real-time engine: idle hook, camera movement, rotation, keyframing, motion-chain rig management |
| **Bridge** | `aftereffects-camera-nav/bridge/cameranav_bridge.cpp` | `cameranav_bridge.exe` | IPC relay: exposes the plugin's shared memory over a named pipe so the CEP panel (Node) can reach it |
| **CEP panel** | `aftereffects-camera-nav/CEP/com.cameranav.chain/` | copied to CEP extensions folder | Thin UI: keyboard/mouse capture, camera & motion dropdowns, settings, feedback display |

**Hot path (every frame):** panel writes a key bitmask + mouse deltas into shared memory → the
plugin's idle hook reads them at AE's refresh rate and drives the camera. No `evalScript` involved.

**Cold path (per click):** commands (start/stop, chain motion, add keyframe, refresh camera list…)
travel the same channel as one-shot commands with an ack. Infrequent queries can also use
`evalScript` into `jsx/host.jsx`.

**Fallback path:** if shared memory / pipe is unavailable, the panel falls back to `host.jsx`
(ExtendScript), including a batched `tick()` mode that does everything in one call per frame.

---

## The motion-chain rig

Instead of animating the camera directly, the plugin builds a rig of null layers that splits the
camera transform into independently keyframable channels:

```
YAW_2  ←  PITCH_2  ←  YAW_1  ←  PITCH_1  ←  Camera
└─ Motion 2 ─┘       └─ Motion 1 ─┘
```

- The **YAW null** carries Position (the actual camera position) and Y Rotation.
- Its child, the **PITCH null**, carries X Rotation (pitch) and Z Rotation (roll).
- The camera is parented underneath with zeroed transforms and auto-orient disabled.
- Nulls are named `<CameraName>_YAW_<n>` / `<CameraName>_PITCH_<n>` and get per-motion label colors
  (Red → Green → Blue → Pink → Cyan → Purple → Yellow → Peach, repeating).

**Chaining a motion** inserts a new YAW/PITCH pair on top of the chain and re-parents the previous
topmost null under the new PITCH null. Because AEGP's `SetLayerParent` does *not* auto-adjust child
transforms the way ExtendScript does, the plugin manually converts the old null's position
keyframes (inverse-rotation matrix) and Y-rotation keyframes (`local = world − parentYaw`) into
parent-local space, so the visual result of the animation is unchanged. Each motion segment can
then be flown and edited on its own while earlier segments stay frozen.

Multiple cameras are supported: each camera owns a completely independent chain.

---

## Requirements

- **Windows 10/11** (the IPC layer — named pipes + memory-mapped files — is Win32-only)
- **Adobe After Effects CC 2019 or newer** (manifest targets AEFT 16.0+, CSXS 9+)
- For building from source:
  - After Effects SDK (AEGP) — a vendored copy lives in [`AEGP/`](AEGP/)
  - CMake 3.20+
  - Visual Studio 2019/2022 (MSVC, C++17)

---

## Building from source

### 1. C++ plugin (`CameraNav.aex`)

```bash
cd aftereffects-camera-nav
cmake -B build -DAEGP_SDK_PATH="<path-to-AEGP-SDK>" -G "Visual Studio 17 2022"
cmake --build build --config Release
```

Output: `aftereffects-camera-nav/build/Release/CameraNav.aex`
(If the SDK sits next to the project folder — as it does in this repo — the
`AEGP_SDK_PATH` flag can be omitted; CMake defaults to `../AEGP`.)

### 2. Bridge executable (`cameranav_bridge.exe`)

```bash
cd aftereffects-camera-nav/bridge
cmake -B build
cmake --build build --config Release
```

Output: `aftereffects-camera-nav/bridge/build/Release/cameranav_bridge.exe`.
Both binaries are prebuilt and already committed at these paths, so you only need this
if you change the C++ code. The bridge exe must be deployed next to the panel's
`node_addon/` folder (see below) — a copy already lives at
`CEP/com.cameranav.chain/node_addon/cameranav_bridge.exe`.

---

## Installation

1. **Install the plugin:** copy `CameraNav.aex` into After Effects' plug-in folder:
   `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Plug-ins\`

2. **Install the panel:** right-click `aftereffects-camera-nav/CEP/install.bat` → *Run as administrator*.
   It copies `com.cameranav.chain` into `%APPDATA%\Adobe\CEP\extensions\` and enables unsigned
   extensions (`PlayerDebugMode = 1` under `HKCU\Software\Adobe\CSXS.9/10/11`).
   (Manual copy works too, as long as `PlayerDebugMode` is set.)

3. **Restart After Effects** and open **Window → Extensions → Camera Navigator CHAIN**.

The plugin also adds commands to the **Composition** menu: *Fix Camera*, *[+] Snapshot Keyframe*,
*Start Navigation*, *Stop Navigation*.

---

## Quick start

1. Open a comp with 3D content. No camera? Click **Create Camera** (or the *Fix Camera* menu item) —
   it creates one at comp center, ready for navigation.
2. Pick a camera in the dropdown, or leave it on **Auto-detect**.
3. Click **START**. On first start the plugin creates the `YAW_1` / `PITCH_1` control nulls and
   parents the camera to them. The panel switches to the trackpad view.
4. Fly with the keyboard, look around by dragging on the trackpad.
5. Record the flight:
   - **Auto-Key Movement** checked → keyframes are written continuously as you fly, or
   - leave it off and press **[+] Snapshot** at moments you want to lock in.
6. Click **STOP** (or press **ESC** / right-click). The nulls and their keyframes remain in the
   timeline — scrub, ease, and edit them like any other keyframes.
7. For multi-stage shots, click **+ (chain)** after stopping a segment; a new motion is created at
   the previous segment's end and selected automatically. Repeat.

---

## Controls

| Input | Action |
|---|---|
| **W / S** | Move forward / backward (along current look direction) |
| **A / D** | Strafe left / right |
| **Q / E** | Move down / up |
| **C / V** | Roll camera (counterclockwise / clockwise) |
| **Shift** (hold) | Sprint — 2× speed |
| **Mouse drag** (on trackpad) | Look around (yaw + pitch, pitch clamped to ±85°) |
| **ESC** or **right-click** | Stop navigation |

Settings: **Speed** slider 1–300 (default 50), **Sensitivity** slider 0.1–2.0 (default 0.5),
**Auto-Key Movement** checkbox. While navigating, the panel shows a live X/Y/Z position readout
(updated every 200 ms).

---

## Panel reference

| Element | What it does |
|---|---|
| Camera dropdown + ↻ + *Create Camera* | Choose/auto-detect the camera; refresh list; create one if the comp has none |
| Motion dropdown + **+** | Select the active motion segment; chain a new one on top of the stack |
| *Remove Motion* | Deletes the selected motion's null pair; the chain re-bridges automatically |
| **START / STOP** | Begin/end a navigation session (START creates the rig on first use) |
| **[+] Snapshot** | Insert a keyframe (position, yaw, pitch, roll) at the current playhead |
| *Auto-Key Movement* | Record keyframes continuously during flight |
| Speed / Sensitivity sliders | Live-adjusted during navigation |
| Position display | Tracked camera position while navigating |

---

## How it works under the hood

- **Shared memory:** a 4 KB memory-mapped file `Local\CameraNav` (magic `0xCAFEBABE`) holds a
  fixed-layout command buffer: command + param + ack, key bitmask, mouse deltas, speed/sensitivity/
  auto-key, camera & motion selection, and feedback (position, yaw/pitch, nav-active, motion count,
  status flags, camera list). The layout is defined once in
  `aftereffects-camera-nav/include/SharedCommandBuffer.h`.
- **Bridge protocol:** the pipe speaks simple one-line text commands — `OPEN`, `READ` (returns the
  buffer as JSON), `WRITE_KEYS`, `WRITE_ROTATION`, `WRITE_COMMAND`, `WRITE_SETTINGS`,
  `WRITE_SELECTION`, `PING`, `QUIT`.
- **Idle loop:** the plugin registers an AEGP idle hook requesting zero sleep. Movement is
  throttled to ~20 ticks/sec; rotation deltas are consumed (read-and-zero) as they arrive.
- **Local state:** position/yaw/pitch/roll are read from AE once per session start and then tracked
  in memory, with only writes going to AE — AE's stream cache returns stale values mid-animation,
  so re-reading each tick caused jitter in early versions.
- **Draft mode:** while navigating, the comp's downsample factor is set to quarter resolution for a
  faster viewport and restored on stop.
- **Undo groups:** one undo group is opened per continuous input session, so a whole flight
  collapses to a single undo step.
- **Keyframe-aware writes:** movement/rotation streams update the existing keyframe at the current
  time instead of stacking duplicates.

### Debug logs (troubleshooting)

Each layer logs to `%TEMP%`: `cameranav_aegp_debug.txt` (C++ engine), `cameranav_entry_debug.txt`
(plugin startup), `cameranav_cep_debug.txt` (panel), `cameranav_pipe_debug.txt` (pipe client),
`cameranav_debug.txt` (shared-memory init). Note: some log paths are currently hardcoded to one
machine's temp directory (see *Known limitations*).

---

## Repository layout

```
save-18-beforepush/
├── README.md                    ← this file
├── aftereffects-camera-nav/     ← THE project
│   ├── CMakeLists.txt           plugin build
│   ├── include/                 SharedCommandBuffer.h (IPC layout), Config.h, ForwardDeclarations.h
│   ├── src/                     C++ AEGP plugin sources
│   │   ├── Entry.cpp            entry point, menu commands, hooks registration
│   │   ├── IdleHandler.cpp      real-time loop: command processing + movement
│   │   ├── CameraController.cpp movement/rotation math, camera creation
│   │   ├── MotionChainManager.cpp  rig creation, chaining, keyframe space conversion
│   │   ├── KeyframeManager.cpp  keyframe insertion
│   │   ├── StreamWrapper.cpp    layer stream get/set helpers
│   │   ├── SharedMemoryManager.cpp  Windows MMF wrapper
│   │   └── InputHookManager.cpp (dead code — superseded by CEP→SHM input)
│   ├── bridge/                  cameranav_bridge.cpp + CMakeLists
│   ├── CEP/                     deployable panel (com.cameranav.chain + install.bat)
│   │   └── com.cameranav.chain/
│   │       ├── js/main.js       panel logic (input capture, commands)
│   │       ├── jsx/host.jsx     full ExtendScript fallback implementation
│   │       ├── node_addon/      pipe client (index.js) + cameranav_bridge.exe
│   │       └── CSXS/manifest.xml
│   └── build/                   prebuilt CameraNav.aex
├── AEGP/                        vendored After Effects SDK (headers + Adobe samples)
├── bridge/ com.cameranav.chain/ (stale older copies of the above — canonical code lives under
│                                 aftereffects-camera-nav/)
├── REFACTOR_PLAN.md             architecture / technical reference
├── project-progress.md          development history & bug-fix log (chats 1–15)
├── TUTORIAL.md                  end-user guide with workflow examples
└── chat-*.txt                   development session transcripts
```

---

## Known limitations

- **Windows only**, and **one After Effects instance at a time** — the shared-memory name is fixed,
  so two AE instances would collide.
- **Chaining converts Y-rotation keyframes only.** If the re-parented null has X or Z rotation
  (roll) keyframes, their world→local conversion is not performed yet.
- **Snapshot keyframes are inserted unconditionally** — snapshotting twice at the same playhead can
  create duplicate keyframes (movement streams are deduplicated; snapshots are not).
- The legacy *Snapshot Keyframe* menu command (`AddManualKeyframe`) still keys the camera at frame 0
  instead of the playhead — prefer the panel's **[+] Snapshot**.
- The bridge re-declares the shared-buffer layout as hardcoded byte offsets; changes to
  `SharedCommandBuffer.h` must be mirrored manually in `cameranav_bridge.cpp`.
- Some debug-log paths are hardcoded (`C:\Users\...`) rather than using `%TEMP%`, so those logs
  silently no-op on other machines.
- The panel needs keyboard focus for hotkeys — click inside the panel after starting navigation.

---

## Documentation map

| Document | Contents |
|---|---|
| [TUTORIAL.md](aftereffects-camera-nav/CEP/TUTORIAL.md) | End-user guide: workflow, chaining walkthrough, 10-second flythrough example |
| [REFACTOR_PLAN.md](REFACTOR_PLAN.md) | Technical reference: motivation, architecture, SHM layout, phases |
| [project-progress.md](project-progress.md) | Development history: 15+ bug-fix narratives and the lessons they produced |

---

*Built by mizuu.edit. Windows-only; requires an After Effects version with CEP 9+ and the AEGP SDK
headers for compilation.*