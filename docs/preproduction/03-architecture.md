# Proposed architecture and technical contracts

Status: pre-production proposal. These interfaces describe intended modules; no game implementation or performance result exists yet.

## Architecture alternatives

| Option | Structure | Tradeoff |
| --- | --- | --- |
| A: single-thread custom 2.5D | Three.js, player/collision systems, generation and meshing on the main thread | Fastest prototype; generation can interrupt movement and rendering. |
| **B: modular 2.5D with generation worker** | Main-thread gameplay and rendering; one module worker builds deterministic sections and meshes | **Recommended.** Clear team boundaries and bounded work queues, with manageable message contracts. |
| C: Three.js and Rapier 3D | Constrain a 3D character to a cylinder; kinematic rotating ring bodies | Useful for future radial movement; requires more contact, constraint, and synchronization work. |

The confirmed fixed apparent depth makes B appropriate: authoritative movement has two coordinates, unwrapped arc distance `x` and logical height. Three.js presents the result in 3D. Rapier's controller supports translational movement and sliding, but explicitly excludes rotational character movement; it would not remove the need to define circular movement and rotating contacts. [Rapier controller](https://rapier.rs/docs/user_guides/javascript/character_controller/)

## Stack, ownership, and frame flow

Use TypeScript, Vite, direct Three.js `WebGLRenderer`/WebGL2, an HTML/CSS HUD, a module Web Worker, and IndexedDB. Pin dependency versions in the future lockfile. Use Vitest for pure generation/state tests and Playwright for browser scenarios when implementation begins. Three.js documents WebGL2 as the renderer baseline. [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)

`GameSession` coordinates `SimulationClock`, `InputController`, `PlayerController`, `CollisionWorld`, `RingSystem`, `BoostSystem`, `BoostInventory`, `ChunkStreamer`, `RenderSystem`, `CameraRig`, `HUD`, `RunStateStore`, and `RunTracker`. It passes explicit state and commands; the renderer never owns gameplay decisions.

At each 120 Hz tick, integrate ready chunks and verify required terrain; snapshot input; advance ring phases; expire effects; process Q then E; sweep player movement; process world triggers; update run metrics and streaming requests. Pad effects begin at the next movement step. Rendering interpolates between completed states. Never skip gameplay ticks to hide a slow frame; cap catch-up work and suspend with an interruption flag when necessary.

Ground contact carries the player with its ring while controls add relative tangential movement. `vx` stores world tangential speed: grounded updates compute `vx = relativeSpeed + supportRingSpeed`; departure retains that `vx` without adding support speed again. Landing subtracts the new support speed from incoming world `vx` before friction/control adjusts relative movement. Grounded dash sets signed self speed to 18; airborne dash replaces world `vx` with signed 18. Both preserve vertical velocity. Sweeps use player motion relative to each ring. Boosts are orthogonal to movement mode.

`RingSystem` derives each phase from its seed-defined initial phase and simulation tick. `RenderSystem` rotates each ring by its world phase relative to the player's angle `x / radius`; `CameraRig` keeps the exterior player centered at fixed apparent depth. Use the same platform descriptions for geometry and collision. Wrap angles locally, while keeping `x` unwrapped.

## Proposed interfaces

These are documentation snippets, not source files. Validate `seed` as a canonical uint32 before creating `RunConfig`. A course identity is `(seed, generatorVersion, rulesVersion)`; `runId` identifies one attempt and is excluded from course identity.

```ts
type MovementMode = "grounded" | "airborne" | "wallSliding" | "dead";
type BoostKind = "dash" | "highJump" | "glide";
type LogicalHeight = { sectionIndex: number; localHeight: number };
type RunConfig = {
  seed: number; generatorVersion: string; rulesVersion: string; runId: string;
};
type SectionKey = Omit<RunConfig, "runId"> & { sectionIndex: number };
interface PlayerState {
  x: number; logicalHeight: LogicalHeight; vx: number; vy: number;
  supportRingId: string | null; facing: -1 | 1; movementMode: MovementMode;
}
interface RingSpec {
  id: string; localHeight: number; phase0: number; angularSpeed: number;
}
interface PlatformSpec {
  id: string; ringId: string;
  angleIntervals: readonly { start: number; end: number }[];
  bottom: number; top: number;
}
interface BoostDefinition {
  id: string; kind: BoostKind; duration: number; strength: number;
}
interface SectionTemplate {
  id: string; ringCountRange: readonly [number, number];
  routeSockets: readonly RouteSocket[]; maxAngularSpeed: number;
  reservedHeadroom: number; allowsLava: boolean; routeConstraints: RouteConstraints;
}
interface RouteSocket {
  kind: "launch" | "landing" | "wall";
  localHeight: number; arcOffset: number; arcWidth: number;
}
interface BoundaryProfile {
  boundaryIndex: number; ring: RingSpec; platform: PlatformSpec;
  reservedHeadroom: number;
}
interface RouteConstraints {
  maxRise: number; maxArcGap: number; minLandingWidth: number;
}
interface WorldEntitySpec {
  id: string; kind: "pickup" | "pad" | "hazard"; platformId: string;
  angleIntervals: PlatformSpec["angleIntervals"];
  bottom: number; top: number; boostId?: string;
  hazardKind?: "lava" | "spike" | "thorn" | "crystal" | "rune" | "conductor";
}
interface RingMeshBuffers {
  ringId: string; positions: Float32Array; normals: Float32Array;
  colors: Float32Array; indices: Uint32Array;
}
interface ChunkBuildRequest {
  type: "build"; runId: string; requestId: number; key: SectionKey;
}
interface ChunkBuildResult {
  type: "built"; runId: string; requestId: number; key: SectionKey;
  rings: readonly RingSpec[]; platforms: readonly PlatformSpec[];
  entities: readonly WorldEntitySpec[]; meshes: readonly RingMeshBuffers[];
}
interface ChunkBuildError {
  type: "error"; runId: string; requestId: number; key: SectionKey;
  message: string;
}
interface RunRecord {
  course: Omit<RunConfig, "runId">; maxHeight: LogicalHeight;
  timeAtMaxHeightMs: number; activeTimeMs: number;
  interrupted: boolean; boostsUsed: number;
}
interface SectionSplit { sectionIndex: number; firstCrossingMs: number }
interface RunStateStore {
  loadSpent(runId: string, key: SectionKey): Promise<ReadonlySet<string>>;
  persistSpent(runId: string, key: SectionKey, ids: readonly string[]): Promise<void>;
  flush(runId: string): Promise<void>;
  persistSplit(runId: string, split: SectionSplit): Promise<void>;
  loadSplits(runId: string, fromSection: number, limit: number): Promise<readonly SectionSplit[]>;
  getRecord(courseId: string, interrupted: boolean): Promise<RunRecord | undefined>;
  saveRecord(record: RunRecord): Promise<void>;
}
```

`persistSplit` writes only if that section has no prior split. `loadSplits` pages at most 64 entries. Record storage keys include course identity and interruption category.

Distances/speeds use game units and units/second; angles/speeds use radians and radians/second; durations use seconds. Height normalizes to a nonnegative integer section index and local height in `[0, 32)`. Vertical collision bounds are section-local; mesh positions and angular intervals are ring-local. Add ring phase for world intervals. Phase time is `tickIndex / 120` seconds. Split intervals at the seam with `0 <= start < end <= 2π`; full-circle intervals are allowed. `strength` means self dash speed, high-jump launch speed, or glide fall cap. Hazard styles share one lethal rule.

`GenerationWorker` returns transferable typed-array buffers and plain specifications, never Three.js objects. Transferring a buffer detaches it from its sender, so the worker must not reuse transferred arrays. [Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)

## Determinism, generation, and streaming

`SectionGenerator` builds a baseline route, validates a candidate against movement envelopes and sampled ring phases, then decorates it. Try at most eight candidates; use a known safe deterministic fallback. `boundaryProfile(n)` defines the stationary broad landing at height `32 * n`: section `n` owns its lower boundary and targets section `n + 1`'s lower landing. Both neighbours use the same keyed profile. Destination terrain must be resident before crossing. This is validation evidence, not a mathematical proof of reachability.

Key each random stream with UTF-8 bytes of `seed|generatorVersion|rulesVersion|sectionIndex|streamTag|candidateId`. Numbers are canonical unsigned decimal strings; version/tag identifiers contain only ASCII letters, digits, `.`, `_`, and `-`. Tags are `boundary`, `route`, `ring`, `platform`, `boost`, `decoration`, `hazard`, and `fallback`; boundary profiles use candidate `0`. Hash with uint32 FNV-1a: start `2166136261`, then for each byte use `Math.imul(hash ^ byte, 16777619) >>> 0`. Feed that hash to this Mulberry32 contract:

```ts
function mulberry32(state: number): () => number {
  return () => {
    let t = state = (state + 0x6D2B79F5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Fixed traversal order and separate streams prevent decoration, generation order, and worker timing from changing routes. Same seed reproduces specifications and initial phases. Simulation replay requires additional guarantees and is outside the initial deliverable. [Rapier determinism caveats](https://rapier.rs/docs/user_guides/javascript/determinism/)

`VoxelMesher` removes internal faces and greedily merges compatible faces within each ring; independently rotating rings never share face-culling or merged geometry. Repeated props may use instancing. One mesh per voxel is unsuitable. [Three.js voxel geometry](https://threejs.org/manual/pages/voxel-geometry.html), [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)

`ChunkStreamer` ordinarily retains six sections: current, two below, and three above; adaptive downward prefetch can raise the hard cap to eight. Limit queued builds and ready results to two each. Reject stale run/request/version results. Atomically activate geometry, collision, entities, and loaded spent flags at a tick boundary. On return, regenerated rings use the current tick rather than restarting their phase.

Mark collected pickups spent in resident state immediately, then journal stable IDs in IndexedDB; flush before eviction. Reusable pads need resident entry/cooldown state. Bound caches and pending writes; disk can grow during a long run. Death retains metrics/splits until summary storage completes; a new attempt resets its journal. Storage failure suspends with storage-retry/restart choices. Dispose ring geometry on eviction, retaining shared materials until unused. [Three.js resource disposal](https://threejs.org/manual/pages/how-to-dispose-of-objects.html)

## Graphics pipeline and shader suite

Render opaque voxel rings first, followed by pickups, pads, the avatar and atmospheric scenery. The HTML HUD is independent of post-processing. Keep materials and texture atlases shared across resident sections; update ring transforms rather than remeshing rotating geometry.

| Pass or asset | Initial design | Validation |
| --- | --- | --- |
| Voxel surface shader | GLSL vertex transforms and normal transforms; fragment lighting combines a diffuse response, ambient light, vertex-colour AO and bounded torch attenuation. Greedy merges preserve material and corner-AO compatibility. | Ring rotation changes lighting without moving collision differently; AO never erases a landing edge. |
| Torch and shadow lighting | At most four nearby torch lights; one directional shadow map, initially 1024 by 1024, covering the active player region. Use soft filtered shadows and emissive torch/lava surfaces. | Toggle shadows and torch count independently; measure passes and frame cost before increasing quality. |
| Parallax background | A background shader uses layered scenery and camera height/angle offsets to suggest distant castle surroundings. It does not supply collision. | Long climbs and origin rebasing preserve smooth offsets without discontinuities. |
| Speed post-processing | A scene render target feeds a restrained vignette and directional motion-cue pass during boosts. Default to no full-screen motion blur so upcoming platform edges remain legible. | Disable the pass for a cost comparison; verify HUD text and hazard silhouettes remain clear. |

The lighting limits and shadow resolution are prototype settings. Document shader uniforms, vertex inputs and per-pass costs in the M4 shader suite. If a quality setting misses the benchmark budget, reduce shadow coverage, light count or post-processing before lowering gameplay simulation frequency. These are proposed graphics designs, not compiled or measured shaders.

## Runtime budgets and failure behavior

Provisional limits: radius `8`, section height `32`, tangential speed `26`, downward speed `24`, upward speed `14`, and ring tangential speed at most `4`. Rebase render coordinates every `512` height units without changing logical height or seeds. Benchmark at 1080p, DPR 1, on documented hardware; tune these values together if streaming or collision budgets fail.

Pause, hidden-tab, missing-terrain, and storage suspensions freeze simulation, rings, effects, and active timing. Set `RunRecord.interrupted` when an active run stops timing. `RunTracker` uses a monotonic active wall clock with milliseconds displayed; fixed-step resolution does not establish submillisecond accuracy. Track highest height, its first-reaching time, elapsed active time, and boosts used. Keep the latest split resident and journal historical first-crossing splits in IndexedDB. No checkpoint or trailing death plane exists; lower platforms remain recoverable by regeneration. Lava templates and the base boundary supply explicit hazards/bounds.

Acceptance requires bidirectional revisits without pickup respawns, bounded resident resources/queues, high-speed swept contacts, matching mesh/collision phases, and a loading suspension before entering missing terrain. Performance targets require measurement; none have been tested yet.
