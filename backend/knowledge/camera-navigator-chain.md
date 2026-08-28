<!--
  MIZU assistant knowledge file — loaded whole when the get_project_details
  tool is called with project="camera-navigator-chain".
  Client-facing answers should describe what the product IS and can do —
  never volunteer build history or internal process. Reply in short
  plain-text prose, never raw markdown dumps.
-->

# Camera Navigator CHAIN — Technical Reference

## What It Is

Camera Navigator CHAIN is an After Effects plugin that provides game-style first-person camera control. The user presses WASD to fly through a 3D scene and drags the mouse to look around. Keyframes are recorded automatically or on-demand, producing a timeline animation that can be edited normally after recording.

The system is split into three cooperating processes:

1. **Gamecam.aex** — a C++ AEGP plugin loaded into After Effects. Runs an idle hook at AE's refresh rate (~60fps). Reads shared memory and manipulates the AE DOM directly via AEGP SDK suites.
2. **cameranav_bridge.exe** — a standalone Win32 process. Opens the same shared memory and serves a named pipe. Translates text commands from the CEP panel into shared-memory reads/writes.
3. **CEP Panel** — a panel (HTML/JS/CSS) running in After Effects' embedded Chromium browser. Captures keyboard/mouse input, sends commands to the bridge via named pipe, polls shared memory for feedback.

The real-time hot path (movement, rotation, keyframing) runs natively in C++ at AE's refresh rate with sub-microsecond latency via Windows shared memory (a 4KB memory-mapped file, `Local\CameraNav`), instead of the slow asynchronous `evalScript()` scripting route. A cold path via `evalScript()` handles infrequent one-shot operations (camera list refresh, motion list queries), and a JSX `tick()` fallback keeps the plugin functional without the C++ infrastructure.

---

## Process Lifecycle

1. **AE starts** → loads `Gamecam.aex` → creates SHM (`Local\CameraNav`), registers idle hook
2. **User opens CEP panel** → `main.js` spawns `cameranav_bridge.exe` as a child process
3. **Bridge starts** → opens SHM (auto-retries if the plugin loaded first) → creates the named pipe, waits for connection
4. **CEP connects** to the pipe → begins sending commands
5. **User clicks START** → `WRITE_COMMAND 1 0` → `CMD_START_NAV` in SHM → C++ idle hook creates nulls, starts processing movement
6. **User navigates** → CEP sends key/mouse data per frame → bridge writes to SHM → C++ reads and applies movement/rotation to null layers
7. **User clicks STOP** → `CMD_STOP_NAV` → C++ stops, nulls remain with keyframes
8. **AE closes** → DeathHook → `SharedMemoryManager::Shutdown()` cleans up SHM

## Communication Channels

- **Hot path (real-time)**: CEP → bridge via named pipe → shared memory → C++ idle hook. Zero disk I/O, sub-microsecond latency.
- **Cold path (one-shot)**: CEP calls `evalScript()` for infrequent operations (camera list, motion list). Tolerable latency since these happen once per click.
- **Fallback path**: if shared memory is unavailable, CEP falls back to a single `evalScript("tick(...)")` call per frame handled directly in ExtendScript — slower but functional.

## Shared Memory Layout

Memory-mapped file: `Local\CameraNav`, 4096 bytes.

```c
// Command enum (CEP -> C++)
enum CameraNavCommand : int32_t {
    CMD_NONE            = 0,
    CMD_START_NAV       = 1,
    CMD_STOP_NAV        = 2,
    CMD_SET_SPEED       = 3,
    CMD_SET_SENSITIVITY = 4,
    CMD_SET_AUTOKEY     = 5,
    CMD_ADD_KEYFRAME    = 6,
    CMD_CHAIN_MOTION    = 7,
    CMD_REMOVE_MOTION   = 8,
    CMD_CREATE_CAMERA   = 9,
    CMD_SET_CAMERA_ID   = 10,
    CMD_SET_MOTION_INDEX= 11,
};

// Key bitmask (CEP -> C++)
enum KeyBit : int32_t {
    KEY_W      = (1 << 0),  // 1
    KEY_A      = (1 << 1),  // 2
    KEY_S      = (1 << 2),  // 4
    KEY_D      = (1 << 3),  // 8
    KEY_Q      = (1 << 4),  // 16
    KEY_E      = (1 << 5),  // 32
    KEY_SHIFT  = (1 << 6),  // 64
};

// Status flags (C++ -> CEP)
enum StatusFlag : int32_t {
    STATUS_OK             = 0,
    STATUS_NO_CAMERA      = (1 << 0),
    STATUS_NO_COMP        = (1 << 1),
    STATUS_NO_MOTION_NULL = (1 << 2),
    STATUS_ERROR          = (1 << 3),
};

struct SharedCommandBuffer {
    // ---- CEP -> C++ commands ----
    volatile int32_t  magic;            // 0xCAFEBABE when initialized
    volatile int32_t  command;          // CameraNavCommand enum
    volatile int32_t  commandParam;     // generic param (motionIndex, cameraId, etc.)
    volatile int32_t  commandAck;       // C++ sets to command value after processing

    // ---- Real-time input (CEP writes, C++ reads) ----
    volatile int32_t  keysPressed;      // bitmask of KeyBit values
    volatile double   speed;            // current speed (1-300)
    volatile double   sensitivity;      // mouse sensitivity (0.1-2.0)
    volatile int32_t  autoKey;          // 0 or 1
    volatile int32_t  flightActive;     // 1 = flight undo group requested

    // ---- Rotation deltas (CEP writes, C++ reads and zeros) ----
    volatile double   rotationDX;       // mouse delta X (pixels)
    volatile double   rotationDY;       // mouse delta Y (pixels)

    // ---- Selection state (CEP writes) ----
    volatile int32_t  cameraId;         // AEGP_LayerIDVal, or 0 for auto-detect
    volatile int32_t  motionIndex;      // current motion index (1-based)

    // ---- Feedback (C++ writes, CEP reads) ----
    volatile double   posX, posY, posZ; // current YAW null position
    volatile double   yawDeg, pitchDeg; // current rotation in degrees
    volatile int32_t  navActive;        // 1 = navigating, 0 = inactive
    volatile int32_t  motionCount;      // number of motions in chain
    volatile int32_t  statusFlags;      // StatusFlag bitmask

    // ---- Padding to 4096 bytes ----
    char _reserved[4096 - 14*4 - 8*8];
};
```

## YAW/PITCH Null Hierarchy

The chain grows upward. Each motion = one YAW + one PITCH null pair.

```
YAW_2 <- PITCH_2 <- YAW_1 <- PITCH_1 <- Camera
(Motion 2)  (Motion 2)  (Motion 1)  (Motion 1)
```

What each layer controls:
- **YAW null Position**: Camera world position (movement applies here)
- **YAW null Y Rotation**: Horizontal look (left/right)
- **PITCH null X Rotation**: Vertical look (up/down)
- **Camera**: Position [0,0,0], Orientation [0,0,0], auto-orient OFF

**Naming convention**: `{CameraName}_YAW_{index}` and `{CameraName}_PITCH_{index}`

**Label colors per motion** (cycling AE label IDs):
```
[2=Red, 9=Green, 8=Blue, 5=Pink, 14=Cyan, 11=Purple, 3=Yellow, 7=Peach]
```

## Movement System

### Key Bitmask

| Bit | Key | Value |
|-----|-----|-------|
| 0 | W (forward) | 1 |
| 1 | A (strafe left) | 2 |
| 2 | S (backward) | 4 |
| 3 | D (strafe right) | 8 |
| 4 | Q (up) | 16 |
| 5 | E (down) | 32 |
| 6 | Shift (sprint 2x) | 64 |
| 7 | C (roll left) | 128 |
| 8 | V (roll right) | 256 |

### Movement Vector Math

The camera's default forward direction in AE is +Z. Given current yaw (Y rotation) and pitch (X rotation) in radians:

```
Forward vector:
  fwdX = sin(yaw) * cos(pitch)
  fwdY = -sin(pitch)
  fwdZ = cos(yaw) * cos(pitch)

Right vector (horizontal only):
  rightX = cos(yaw)
  rightZ = -sin(yaw)
```

| Key | Delta X | Delta Y | Delta Z |
|-----|---------|---------|---------|
| W | +fwdX * speed | +fwdY * speed | +fwdZ * speed |
| S | -fwdX * speed | -fwdY * speed | -fwdZ * speed |
| A | -rightX * speed | 0 | -rightZ * speed |
| D | +rightX * speed | 0 | +rightZ * speed |
| Q | 0 | +speed | 0 |
| E | 0 | -speed | 0 |
| Shift | Multiplies speed by 2.0 | | |

Roll speed is `speed * 0.02` per tick.

Movement is applied to the **YAW null's Position** (not the camera's position). The camera sits at position [0,0,0] relative to its parent PITCH null.

### Keyframe Decision

When writing a position or rotation value:
- If `autoKey` is on → always insert a keyframe at the current CTI
- If the stream already has keyframes (`numKeys > 0`) → insert a keyframe
- Otherwise → use `setValue` (no keyframe, just changes the static value)

This matches the ExtendScript behavior where keyframed streams always get new keyframes to avoid breaking animation curves.

## Rotation System

- `rotationDX` / `rotationDY` — mouse drag deltas accumulated in shared memory; the C++ idle hook reads them, applies them, then zeros them via `InterlockedExchange64`.
- The 0.004 sensitivity scale factor is applied in `IdleHandler.cpp` before calling `Rotate()`:

```cpp
yaw   += delta_x * sensitivity;   // sensitivity already includes the 0.004 factor
pitch -= delta_y * sensitivity;   // inverted (drag down = look up)
pitch  = clamp(pitch, -85°, +85°); // prevents gimbal lock
```

Applied to:
- **YAW null Y Rotation** = yaw in degrees
- **PITCH null X Rotation** = pitch in degrees

## Keyframe System

When `AddKeyframeToNulls` runs (from CMD_ADD_KEYFRAME or auto-key), it inserts keyframes on 4 streams:

| Layer | Stream | Type | Purpose |
|-------|--------|------|---------|
| YAW null | POSITION | ThreeD | Camera world position |
| YAW null | ROTATE_Y | OneD | Horizontal look direction |
| PITCH null | ROTATE_X | OneD | Vertical look direction |
| PITCH null | ROTATE_Z | OneD | Roll angle |

Two insertion paths:
- **Continuous movement/rotation**: if a keyframe already exists at the exact same time, its value is updated rather than creating a duplicate.
- **Manual snapshot**: inserts unconditionally at the current time.

## Draft Mode

During navigation, the comp's downsample factor is set to Quarter (4x4) so the viewport renders at 1/16 resolution — significantly improving frame rate. The original resolution is restored when navigation stops.

## Undo Grouping

All AE operations are grouped for clean undo:

| Operation | Undo Group | Scope |
|-----------|-----------|-------|
| Create First Motion | "Create Camera Controls" | Entire CreateFirstMotion |
| Chain New Motion | "Chain New Motion" | Entire ChainNewMotion |
| Remove Motion | "Remove Motion Nulls" | Entire RemoveMotion |
| Add Keyframe | "Add Keyframe" | Single keyframe insertion |
| Continuous movement | "Camera Move" | One group per input session (key down → key up) |

The movement undo group opens when input starts and closes when input stops — an entire flight segment can be undone in one step.

## Module Reference

### Entry.cpp
The AEGP plugin entry point. Stores the SPBasicSuite and plugin ID, initializes shared memory, registers 4 menu commands (Fix Camera, Snapshot Keyframe, Start Navigation, Stop Navigation) and 4 hooks (CommandHook, UpdateMenuHook, DeathHook, IdleHook), and owns the global `g_movement_state`.

### IdleHandler.cpp
The core real-time loop, called at AE's refresh rate. `ProcessSharedMemory` checks for pending commands → `ProcessCommand()`, and if navigation is active with input present → `ProcessMovement()`. Movement is processed at ~20fps (`NAV_TICK_MS = 50ms`) to balance smoothness against AE render time; commands are processed immediately.

### CameraController.cpp
All camera/null manipulation math: `GetCameraById`, `FixCamera` (creates a camera if none exists and converts it to one-node mode), `MoveDirection` (movement vector → YAW null position), `Rotate` (yaw/pitch deltas → null rotations), `Roll` (roll → PITCH null Z rotation).

### MotionChainManager.cpp
Manages the YAW/PITCH null hierarchy for chained motions: `GetMotionNulls` (find nulls by naming convention), `FindTopmostNull` (walks the parent chain up from the camera), `CreateFirstMotion` (YAW_1 + PITCH_1, camera parented into the chain), `ChainNewMotion` (new null pair parented on top, with existing position/Y-rotation keyframes converted from world to parent-local space), `RemoveMotion` (deletes the pair, reparents children), `GetMotionCount`.

### KeyframeManager.cpp
`AddKeyframeToNulls` — snapshot keyframe insertion on the 4 streams at the current CTI.

### StreamWrapper.cpp
Thin wrappers around AEGP StreamSuite for get/set of Position, Orientation, and Rotation X/Y/Z streams.

### SharedMemoryManager.cpp
Windows memory-mapped file wrapper: `Initialize()` (`CreateFileMappingA` + `MapViewOfFile`, magic `0xCAFEBABE`), `Shutdown()`, `GetBuffer()`, `IsInitialized()`.

## State Management

All dynamic values are tracked in `g_movement_state`: position (local-only during flight), yaw/pitch/roll, speed (1–300), sensitivity (0.01–2.0), auto-key flag, active flag, cached null/camera handles, motion index, camera id.

**Critical rule — local-only position tracking**: position is read from AE once at START_NAV, then updated locally in C++ and written to AE. It is never re-read during navigation — this avoids a bug where AE's stream API returns stale/cached values after inserting keyframes, causing the camera to bounce between old and new positions.

## CEP Panel Architecture

The CEP panel (`CEP/com.cameranav.chain/`) is a standard Adobe CEP extension:

| File | Purpose |
|------|---------|
| `CSXS/manifest.xml` | Extension manifest (targets AEFT 16.0–99.9, CSXS 9.0) |
| `index.html` | Panel HTML structure |
| `js/main.js` | Bridge connection (spawn + pipe + auto-reconnect), key/mouse capture, command dispatch, SHM polling (200ms), camera/motion dropdowns, settings |
| `jsx/host.jsx` | ExtendScript bridge: `getCameraList()`, `getMotionList()`, fallback `tick()` |
| `css/style.css` | Styling |
| `lib/CSInterface.js` | Adobe CEP library |

## Known Engineering Gotchas (for maintenance context)

- **AE auto-adjust on parenting**: after `AEGP_SetLayerParent`, AE modifies the child's Orientation to preserve visual position — code must re-set Orientation to [0,0,0] and re-apply rotation values immediately after parenting.
- **Layer name encoding**: `AEGP_GetLayerName` returns UTF-16 via `AEGP_MemHandle`; a UTF-16→ASCII helper handles null-name matching.
- **Thread safety**: CEP (CEF thread) writes shared memory; C++ (AE main thread) reads it. Single-producer/single-consumer, `volatile` fields, `InterlockedExchange` for delta zeroing.
- **Multiple AE instances**: shared-memory name can be made PID-specific to avoid collisions.
