# SpeedTower — Requirements and Traceability

## Interpretation

These are future implementation targets, not completed test results. `FR` identifies behavior; `NFR` identifies quality constraints. `TC-01` through `TC-20` refer to the validation plan. Responsible systems own behavior; the roadmap assigns people.

The proposal establishes project/team context; the accepted plan establishes gameplay decisions. Changing candidate movement constants requires a rules-version change and route revalidation. The [architecture](03-architecture.md#stack-ownership-and-frame-flow) defines the named systems; the [validation plan](07-roadmap-and-validation.md#gameplay-acceptance-scenarios) defines test IDs.

## Player use cases

| ID | Player intent | Successful outcome |
|---|---|---|
| UC-01 | Start a course | A chosen or generated seed starts on the safe base |
| UC-02 | Climb rotating platforms | Predictable movement, jumps, and ring carry permit progress |
| UC-03 | Recover a fall | Lower terrain returns and permits a continued climb |
| UC-04 | Collect and spend boosts | Q/E show charges and successful effects consume them |
| UC-05 | Use an environmental pad | Entry applies an eligible effect with readable feedback |
| UC-06 | Pause and return | Simulation and active timing resume together |
| UC-07 | Review and retry | Summary reports height, splits, flags, and same-seed retry |
| UC-08 | Improve a local record | Comparable course and timing categories show personal progress |

## Functional requirements

| ID | Requirement | Responsible system | Acceptance and test |
|---|---|---|---|
| FR-01 | Start with a chosen seed or generate a seed; display course identity | GameSession | Same identity is visible at start and summary; TC-12 |
| FR-02 | Support A/D, arrows, Space, Q/E, Escape and centered side view | InputController; CameraRig | Controls and fixed apparent depth match the brief; TC-01 |
| FR-03 | Simulate fixed-radius tangential and vertical movement with fixed steps and swept collision | PlayerController; CollisionWorld | No tunneling or seam discontinuity at maximum configured speed; TC-05 |
| FR-04 | Carry grounded players with their supporting rotating ring | PlayerController; RingSystem | Idle player follows the support ring displacement; TC-02 |
| FR-05 | Inherit departure velocity once and establish new support on landing | PlayerController; CollisionWorld | Jump, walk-off, and opposing-ring landing add no duplicate carry; TC-03 |
| FR-06 | Provide wall slide and wall jump | PlayerController | Slide cap and upward/outward launch match configuration; TC-04 |
| FR-07 | Keep a baseline route traversable without boosts | SectionGenerator | Validated required transitions fit the conservative movement envelope; TC-13 |
| FR-08 | Generate sections independently from seed, index, and version | SectionGenerator | Request order and regeneration produce equivalent route/decoration data; TC-12 |
| FR-09 | Validate candidates and use a deterministic safe fallback | SectionGenerator | Failed candidates produce the approved connected fallback; TC-13 |
| FR-10 | Provide six themes with readable, explicit hazards | SectionGenerator; CollisionWorld | Theme catalogue is represented; cosmetic effects add no hidden forces; TC-14 |
| FR-11 | Fill Q then E with one charge each; allow duplicates | BoostInventory | Full inventory leaves pickup unspent in world; TC-09 |
| FR-12 | Activate boosts on press edges, Q before E, consuming only on success | BoostSystem | Held keys do not repeat; rejected effects retain charges; TC-09 |
| FR-13 | Dash tangentially using input or facing direction | BoostSystem; PlayerController | Collision applies during burst; active dash rejects repeats; TC-06 |
| FR-14 | High jump increases upward velocity to configured launch speed | BoostSystem; PlayerController | Ground, wall, and air launches work; no increase rejects consumption; TC-07 |
| FR-15 | Glide caps descent while airborne and ends on landing/expiry | BoostSystem; PlayerController | Grounded/active rejection and cross-type combination behave correctly; TC-08 |
| FR-16 | Pads trigger on entry, latch through overlap, and rearm after exit/cooldown | BoostSystem | Successful activation starts 0.5 s cooldown; invalid overlap never repeats; TC-10 |
| FR-17 | Recover ordinary falls; terminate on lethal hazards; retry from base | GameSession; CollisionWorld | Base catches safe falls; retry clears attempt state without checkpoints; TC-11 |
| FR-18 | Stream terrain above and below the player, including long falls | ChunkStreamer | Required terrain is available or run suspends before entry; TC-15 |
| FR-19 | Preserve spent pickups across section unloading and regeneration | RunStateStore | Collected IDs remain absent until a fresh retry; TC-15 |
| FR-20 | Reject stale worker results and activate complete sections atomically | ChunkStreamer; GenerationWorker | Canceled/old-run results never alter active collision or visuals; TC-16 |
| FR-21 | Suspend simulation and active clock for pause, hidden tab, loading, or storage | GameSession | All suspension paths resume together and flag active runs; TC-17 |
| FR-22 | Track maximum height and monotonic active time | RunTracker | Falls preserve height; suspended time is excluded; TC-18 |
| FR-23 | Record each upward section split once | RunTracker | Repeated ascent does not overwrite first-arrival splits; TC-18 |
| FR-24 | Store summaries and compare matching course/rules/timing flags locally | RunStateStore; RunTracker | Rank height first, then earlier first reach; interrupted status visible; TC-18 |
| FR-25 | Rebase large render coordinates while retaining logical heights | RenderSystem; CollisionWorld; CameraRig | Rebase preserves collision, ring phase, timing, and splits; TC-19 |

## Quality requirements

| ID | Constraint | Responsible system | Acceptance and test |
|---|---|---|---|
| NFR-01 | Target 60 FPS on documented desktop hardware | RenderSystem; ChunkStreamer | Report frame-time percentiles during 30-minute traversal; TC-20 |
| NFR-02 | Bound runtime world, collision, and buffer memory | ChunkStreamer | Runtime plateaus under sustained travel; growing disk journal reported separately; TC-15, TC-20 |
| NFR-03 | Bound worker concurrency, job queue, and uploads | GenerationWorker; RenderSystem | Configured limits hold under rapid ascent/fall; no unbounded backlog; TC-16, TC-20 |
| NFR-04 | Reproduce layouts using versioned generation inputs | SectionGenerator | Seed/order/version checks pass; input replay is not promised; TC-12 |
| NFR-05 | Dispose unloaded GPU resources and reusable buffers correctly | RenderSystem; ChunkStreamer | Repeated unload/reload causes no monotonic resource growth; TC-20 |
| NFR-06 | Make hazards, boosts, and landing surfaces visually readable | SectionGenerator; HUD | Symbols/silhouettes supplement color; tested at target viewport; TC-01, TC-14 |
| NFR-07 | Maintain responsive, stable movement | InputController; PlayerController | Press edges, grace windows, and sweeps remain stable across render rates; TC-01, TC-05 |
| NFR-08 | Preserve consistent local state on storage failure | RunStateStore; GameSession | Blocking failures suspend safely with retry feedback; no silent collectible reset; TC-15, TC-17 |
| NFR-09 | Keep documents, diagrams, requirements, and reports traceable | Documentation pipeline | Every requirement has an owner/acceptance; rendered reports agree with sources; artifact review |
| NFR-10 | Detect unavailable browser capabilities before play | GameSession | WebGL2/worker/storage checks provide a useful failure message; TC-17 |

## Traceability and acceptance gates

| Use case | Principal requirements | Planned scenarios |
|---|---|---|
| UC-01 | FR-01, FR-08–10 | TC-12–14 |
| UC-02 | FR-02–07, FR-13–15 | TC-01–08, TC-13 |
| UC-03 | FR-17–20, FR-25 | TC-11, TC-15–16, TC-19 |
| UC-04 | FR-11–15, FR-19 | TC-06–09, TC-15 |
| UC-05 | FR-16 | TC-10 |
| UC-06 | FR-21 | TC-17 |
| UC-07 | FR-17, FR-22–24 | TC-11, TC-18 |
| UC-08 | FR-01, FR-22–24 | TC-12, TC-18 |

Validate movement before tuning generation. Then check seed batches, section boundaries, safe fallbacks, bidirectional streaming, collectible persistence, stale worker replies, and rebasing.

The performance gate records hardware/browser, resolution, settings, seed, traversal, and resources; 60 FPS remains unverified. Inspect every exported page for diagram errors, overflow, consistency, and traceability. Later behavior changes update requirements, diagrams, and tests together.
