# Sources and Design Decisions

## Project basis

The project proposal is [Computer Graphics Project Proposal - Group 7](references/source-proposal.pptx), originally titled SPEEDFORM, for Group 7 in CS 4361.002. It names Adrian Alvarez, Alexandru Istrate and Omar Sabry. An unchanged copy accompanies this package. The current project name is SpeedTower.

| Proposal location | Design input |
| --- | --- |
| Slides 1 and 3 | Endless tower climbing, repeatable seed-based layouts and speedrunning motivation. |
| Slide 4 | Voxel meshing, hidden-face removal, streamed world construction and custom lighting. |
| Slide 5 | Movement, timer, seed input, rendering/generation responsibilities, profiling, ambient occlusion and post-processing. |
| Slide 6 | Six ordered implementation milestones. |
| Slide 7 | Playable platformer, shader suite, seed sharing and performance report. |

The selected gameplay specification adds circumferential side-view movement, independently rotating rings, Q/E item slots, matching immediate boost pads, wall jumping, recoverable falls, no checkpoints and six themed environment definitions. The chosen initial boost effects are dash, high jump and glide.

The design interprets infinity as on-demand generation with bounded resident world resources. One draw call, instantaneous buffer replacement and strictly constant overhead are not guaranteed. Course reproducibility also does not establish cross-browser deterministic input replay.

## Architecture decision register

| ID | Decision | Reason |
| --- | --- | --- |
| ADR-01 | Direct Three.js and a custom cylindrical 2.5D controller | The fixed radial track reduces movement to two logical axes while retaining 3D graphics. |
| ADR-02 | Main-thread simulation with worker-owned generation and meshing | Keeps collision and input straightforward while separating expensive world construction. |
| ADR-03 | Route-first templates with shared boundaries | Arbitrary density noise cannot establish reliable platforming routes. |
| ADR-04 | Versioned seeded course identity | Separates reproducible maps and comparable records after generator or movement changes. |
| ADR-05 | Bidirectional streaming with a spent-item journal | Allows recoverable falls without retaining all geometry or restoring collected items. |
| ADR-06 | Local records with interruption classification | Supports seed-based practice and comparison without adding an online service. |
| ADR-07 | Shared boost definitions with separate item and pad triggers | Both acquisition modes produce the same movement effect without mixing inventory and world-trigger state. |

## Technical references

References were checked during preproduction on October 6, 2026. Pin implementation dependency versions when the game scaffold is created, and update the course versions when relevant behavior changes.

- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html): WebGL2 renderer, frame statistics, compilation and rendering controls.
- [Three.js voxel geometry](https://threejs.org/manual/pages/voxel-geometry.html): exposed-face geometry and division into smaller voxel cells.
- [Three.js object disposal](https://threejs.org/manual/pages/how-to-dispose-of-objects.html): resource lifetime and explicit GPU disposal.
- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html): repeated prop rendering; not a substitute for removing internal voxel faces.
- [Vite guide](https://vite.dev/guide/): TypeScript-capable development and static production builds.
- [MDN Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers): isolated background work and messaging.
- [MDN transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects): ownership transfer of array buffers.
- [Rapier character controller](https://rapier.rs/docs/user_guides/javascript/character_controller/): physics alternative and controller rotation limitations.
- [Rapier determinism](https://rapier.rs/docs/user_guides/javascript/determinism/): conditions required for deterministic physics, distinct from seeded course generation.
- [Mermaid class diagrams](https://mermaid.js.org/syntax/classDiagram.html): editable UML-style class notation, relationships and multiplicities.

## Status of evidence

Gameplay tuning, reachability samples and performance budgets in this package are proposed engineering targets. M1 movement experiments, generation tests, playtests and the M6 benchmark must establish their results. Document rendering and link/traceability checks validate the planning artifacts only.
