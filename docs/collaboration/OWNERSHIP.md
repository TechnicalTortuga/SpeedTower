# System ownership and handoffs

This is the current working allocation, based on the proposal. Alexandru is `TechnicalTortuga`; Omar is `r0xly`; Adrian is `atalvarez77`. Folder reservations protect each person's contribution. The team can revise this allocation explicitly.

| Area and reserved folder | Primary owner | Planned systems | Handoff |
| --- | --- | --- | --- |
| Rendering — `src/rendering/` | Omar | Three.js scene, RenderSystem, CameraRig, GPU resource disposal | Reads player/world state; renders each ring with its authoritative phase. |
| Voxel meshing — `src/meshing/` | Omar | VoxelMesher, face removal, greedy meshes, geometry buffers | Receives Adrian's gameplay/decorative geometry; agrees AO attributes with Alexandru. |
| Generation — `src/world/` | Adrian | SectionGenerator, templates, seeds, environments, reachability and boundary profiles | Produces platform/ring/entity data; consumes a movement envelope agreed with Alexandru. |
| Streaming — `src/streaming/` | Adrian | ChunkStreamer, generation-job scheduling, activation/eviction | Coordinates Omar's mesh output and Alexandru's collision/run state. |
| Movement — `src/player/` | Alexandru | InputController, PlayerController, CollisionWorld, runtime RingSystem | Uses Adrian's geometry; publishes state and phases for Omar's renderer. |
| Boosts — `src/boosts/` | Alexandru | BoostSystem, BoostInventory, item/pad triggers | Adrian places entities; Omar presents them; Alexandru defines activation behavior. |
| Lighting — `src/lighting/` | Alexandru | Lighting/shaders, AO response, shadow settings, atmosphere and speed effects | Omar integrates materials and mesh attributes; meshing remains Omar's work. |
| Run systems — `src/run/` | Alexandru | GameSession, SimulationClock, RunTracker, timing, splits, seed UI data and records | Streaming readiness affects suspension; persistence boundary requires joint review. |
| UI shell — `src/ui/` | Shared integration | HTML/CSS HUD and menus | Alex supplies run/inventory data; presentation work is coordinated rather than reassigned. |
| Contracts — `src/shared/` | Affected owners jointly | Future agreed data types and worker messages | Review before changing a producer/consumer contract. |
| Worker boundary — `src/workers/` | Adrian + Omar, shared integration | Generation-worker wiring and transferable mesh messages | Adrian owns generation/job flow; Omar owns meshing algorithms; no implementation exists yet. |
| Bootstrap and tools | Shared integration, coordinated by Alexandru | Entry page, package/build configuration, documentation and CI | Changes must preserve each owner's reserved feature areas. |

## Boundaries that need a team decision

- **RunStateStore:** the planning interface combines spent-pickup history, splits and local records. Adrian needs collectible history for streaming; Alexandru needs run records. Agree whether there is one shared storage adapter or separate stores before implementation. IndexedDB is a proposed backend, not implemented here.
- **Ambient occlusion:** Omar owns extracting/meshing vertex data; Alexandru owns how shaders use that data. Agree the AO calculation and attribute layout together.
- **RingSystem:** Adrian defines initial phase/speed in generated ring data; Alexandru advances authoritative gameplay phases; Omar applies those phases in rendering.
- **Collision:** Adrian supplies solid platform descriptions; Alexandru implements movement sweeps/contact response. Decorative voxels must respect that shared geometry.

## Working rule

Implement your owned feature on a branch. Request the other owner when crossing a boundary; coordinate a small contract change rather than writing a substitute for their implementation. Work on Alexandru's behalf may review other systems read-only, but must not implement Omar's or Adrian's work without explicit authorization.

The initial starter contains folder README files and a static entry page. It contains no implementation of any planned game system.
