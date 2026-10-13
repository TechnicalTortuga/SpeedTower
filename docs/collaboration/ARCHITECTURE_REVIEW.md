# Architecture proposals to review before implementation

The October 6 preproduction package is a design draft. The proposal establishes goals and broad responsibilities; it does not mandate every class or numeric parameter added during planning. This review is the current companion to that package, dated October 13, 2026.

| Source | What it establishes | Status |
| --- | --- | --- |
| Original Group 7 PowerPoint | Voxel castle climbing, procedural seeds, graphics techniques, six milestones and broad team tasks | Project basis. |
| Gameplay decisions in this conversation | Centered circumferential movement, rotating rings, Q/E boosts, pads, endless generation and recoverable ordinary falls | Current design direction; tuning remains open. |
| Preproduction architecture draft | Named classes, custom cylindrical controller, generation worker, storage interface, boundary profiles, sampling/streaming caps and initial constants | Proposed decomposition and engineering defaults. Owners may simplify, rename or replace them after review. |
| Subsequent persistence discussion | Exportable progress snapshots and a resumed-run category | Discussed option. Not implemented or silently added to the original requirements. |

## Review queue

| Proposal | Review participants | Decision needed |
| --- | --- | --- |
| Modular core with worker generation (option B) | All three | Confirm the worker boundary; rendering stays on the main thread initially unless profiling supports a change. |
| PlayerController / CollisionWorld / RingSystem | Alexandru, Adrian for geometry, Omar for presentation | Decide the smallest practical module split and the authoritative state handed to rendering. |
| SectionGenerator and safe boundary profiles | Adrian with Alexandru | Review template sockets, movement-envelope validation and fallback design. |
| VoxelMesher and RingMeshBuffers | Omar with Adrian and Alexandru | Agree geometry ownership, material/AO attributes and separate meshes for independently rotating rings. |
| ChunkStreamer / GenerationWorker | Adrian with Omar | Agree job IDs, cancellation, transfer ownership, atomic activation and resource limits. |
| GameSession / SimulationClock / RunTracker | Alexandru | Decide whether these need separate classes or can begin as smaller modules. |
| RunStateStore and IndexedDB | Alexandru and Adrian | Separate record persistence from collectible history or agree a shared adapter. Test storage availability. |
| HUD connection to RenderSystem | All three | The HTML HUD can consume run data directly; the diagram's relationship is not an instruction to embed HUD logic in Omar's renderer. |
| Progress export/import | Alexandru and Adrian | Define snapshot state, format/versioning and restored-run rules before adding requirements. |
| Numeric movement, boost and performance defaults | Relevant owners | Establish values through prototypes and measurements; do not treat proposed numbers as test results. |

## Initial repository scope

The starter establishes TypeScript/Vite tooling, a Three.js dependency, module reservations, review guidance and the planning sources/reports. No drafted game interface is copied into executable TypeScript yet. Vitest and Playwright remain planned tools to add when feature tests exist; keeping them out of this starter reduces its dependency graph.

Owners should record decisions with a short rationale in a PR and update affected requirements/diagrams when behavior changes. Regenerate Word/PDF only when their source chapters change. Read the original [sources and decisions](../preproduction/08-sources-and-decisions.md) alongside this review.
