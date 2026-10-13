# Implementation Roadmap and Validation

## Delivery sequence

The six milestones retain the proposal's ordering. Each milestone has an observable exit condition so the team can resolve movement and streaming risks before investing in graphical polish. Dates remain unset. The ownership below is a proposed division based on the proposal, with integration shared across the team.

| Milestone | Work and owner | Exit condition |
| --- | --- | --- |
| M1 Baseline engine | Omar: Three.js scene and camera. Alexandru: input, cylindrical movement and rotating-ring collision. | A small authored course demonstrates centered wraparound movement, ring carry, inherited jump momentum, wall movement and swept collision at candidate maximum speeds. |
| M2 Deterministic world | Adrian: keyed section generator, boundary profiles and templates. Omar: exposed-face extraction and greedy meshing. | Repeated generation produces identical gameplay data regardless of request order. Route validation rejects invalid candidates and selects a safe fallback. |
| M3 Streaming and mechanics | Adrian: bidirectional streamer and run journal. Alexandru: inventory, boost effects, pads and hazards. | Ascending and descending through evicted sections preserves collected-item state and ring phases. Meshes, collision and journal flags activate together. |
| M4 Lighting and atmosphere | Alexandru: GLSL lighting, voxel ambient occlusion, shadows and parallax. Omar: rendering integration. | All six environment treatments preserve platform and hazard readability. Quality controls demonstrate the cost of individual passes. |
| M5 Speedrunning systems | Alexandru: timer, section splits, seed entry, records and speed effects. Shared: HUD integration. | Same-course local records use consistent timing flags. Falls preserve height records and first-arrival splits. Restart resets run state. |
| M6 Optimization and polish | All: performance profiling, playtesting, tuning, resource disposal and course report. | The team publishes measurements, settings, hardware, failures and limitations for the benchmark protocol below. |

The first integration gate is M1. If rotating contacts or wall jumps remain unreliable, simplify the authored course and repair the controller before procedural variety. At M2, implement Stone Ruins and Volcanic Forge first to establish ordinary traversal and a lethal hazard. The remaining environment definitions already exist in the catalogue and join the same generator contracts.

## Gameplay acceptance scenarios

These are specifications for future tests. No game executable or gameplay test results accompany this preproduction package. Use Vitest for generation and controller scenarios that can run without rendering, and Playwright plus human playtesting for browser presentation and complete runs.

| ID | Scenario | Observable acceptance |
| --- | --- | --- |
| TC-01 | Controls and camera | A/D and arrows wrap around the tower, Space jumps, and the avatar remains centered without radial input or camera discontinuities. |
| TC-02 | Ring carry | With no input, a supported player follows the ring. Input moves relative to it. Leaving the support interval removes support. |
| TC-03 | Jump momentum and opposing landing | Takeoff inherits support velocity once. Airborne motion never repeatedly adds it. Landing on an opposing ring changes the support frame without teleporting. |
| TC-04 | Wall movement | Wall contact caps descent; a buffered jump pushes away and upward. Jumping into ceilings or corners remains collision-safe. |
| TC-05 | Wraparound and sweeps | Equivalent intervals on either side of the circumference seam collide identically. Maximum permitted velocities cannot skip thin walls or landing surfaces. |
| TC-06 | Dash | A valid activation applies the configured tangential burst and respects collision. A second active dash rejects without spending a charge. |
| TC-07 | High jump | Activation raises upward velocity to the configured launch value from ground, wall slide or air. Velocity already at or above that value rejects without spending. |
| TC-08 | Glide and combinations | Glide caps descent without reducing ascent and ends on landing or expiry. Dash and high jump can coexist with glide without multiplying its strength. |
| TC-09 | Inventory | Pickups fill Q then E; duplicates work; full slots leave items untouched. Held keys do not repeat. Simultaneous Q/E uses a stable order and spends only successful activations. |
| TC-10 | Pad rearming | Entry triggers once. Continuous overlap never repeats. Full exit plus the cooldown rearms the pad. Invalid activation cannot create a per-tick activation loop. |
| TC-11 | Falling, death and retry | Ordinary descent lands on available lower geometry or the starting base. Only designated lethal hazards end the run. Retry restores the seed's initial world and clears inventory/history. |
| TC-12 | Seed and ordering | Identical course identity produces byte-identical canonical gameplay descriptions for repeated, ascending, descending and shuffled section requests. Changing a version isolates records. |
| TC-13 | Reachability and fallback | Baseline movement can complete accepted transitions across sampled phases without held items. Exhausted attempts validate the deterministic safe template; failed fallback validation returns an error and safely suspends before entry. |
| TC-14 | Themes and hazards | All six themes keep platforms, walls, pickups, pads and lethal hazards recognizable. Decorative frost and wind do not secretly alter movement. |
| TC-15 | Descent and spent items | Collect, unload, descend and revisit a section. Collected items remain absent, uncollected items remain available, and ring phase matches current run time. |
| TC-16 | Worker and activation | Delayed or stale responses from an old run never activate. A section becomes traversable only when visuals, collision, triggers and spent flags are ready together. |
| TC-17 | Capabilities, suspension and timing | Missing WebGL2, worker or required storage capability produces useful startup feedback. Pause, hidden tab, missing terrain and storage failure freeze simulation, rings, effects and active elapsed time. Resuming causes no catch-up jump. Post-start interruptions flag the record. |
| TC-18 | Height, splits and records | First upward crossing writes each split once. Descent does not erase it or the maximum height. Local comparisons use matching course identity and timing classification. |
| TC-19 | Origin rebasing | Crossing each rebase threshold preserves contact, logical height, camera, ring phase and trigger identity. Repeat during ascending and descending movement. |
| TC-20 | Resource and performance soak | Complete the protocol below with active resources within caps, no missing terrain, and no upward trend in live section resources after repeated eviction. |

## Generation validation

Start with 100 canonical seeds, sections 0 through 99, and 16 rotation-phase samples per applicable transition. Include seed 0 and the maximum uint32 seed, maximum difficulty, template boundaries and every environment. Run identical batches with shuffled section requests and different worker completion schedules.

Use the actual controller as the final transition oracle. Analytical jump bounds are preliminary filters. Save a failure's seed, versions, section, candidate number, tick and controller state so the team can reproduce it. Template-level sampling and playtests provide evidence, not a mathematical proof that every possible run is traversable.

## Performance benchmark protocol

Record machine model, CPU, GPU, RAM, operating system, browser version, dependency versions and selected graphics quality. The initial reference setting is a 1920 by 1080 drawing buffer, device pixel ratio 1, foreground tab and a 60 Hz display. Use the same settings and seed set for comparisons.

After a two-minute shader and streaming warmup, run a 30-minute traversal workload that ascends, falls, revisits sections and uses maximum-speed boosts. Record frame-time percentiles, main-thread generation work, worker build time, upload/integration time, visible loading interruptions, live geometry/texture counts, draw calls, triangles, estimated buffer bytes, active sections and pending queues. Report ordinary traversal separately from frontier suspensions; do not hide stalled time by omitting it from measurements.

| Measure | Initial target or bound | Interpretation |
| --- | --- | --- |
| Frame delivery | 60 FPS target; p95 frame interval at most 16.7 ms and p99 at most 33.3 ms | Candidate acceptance targets on the documented reference machine, not measured results or a cross-device guarantee. |
| Worker section build | p95 at most 150 ms | Candidate budget used when sizing prefetch; tune from measured output complexity. |
| Resident sections | Six normally; eight maximum | Includes recovery terrain and adaptive prefetch. |
| Worker and ready queues | Two in flight; two completed results | Apply backpressure and drop obsolete work. |
| Streaming correctness | Zero missing-terrain collisions or deaths | An unavailable frontier causes visible suspension. |
| Resource lifetime | No sustained growth in live section geometry or collision buffers after eviction | Persistent journal disk growth is reported separately. |

Three.js exposes draw calls, primitive counts and live geometry/texture counts through `renderer.info`; those counts are not a direct GPU byte measurement. Estimate owned buffer sizes and label estimates. Explicitly dispose evicted geometry and release shared resources only when their reference count reaches zero. [Renderer statistics](https://threejs.org/docs/pages/WebGLRenderer.html), [resource disposal](https://threejs.org/manual/pages/how-to-dispose-of-objects.html).

## Risk register

| Risk | Mitigation and gate |
| --- | --- |
| Rotating contacts produce unfair jumps | Test carry, seams, wall contact and opposing landings on an authored M1 course before generation. |
| Procedural sections strand the player | Shared boundary profiles, safe waiting surfaces, baseline routes, controller validation and bounded retries with fallback at M2. |
| Boosts outrun generation | Velocity caps, directional prefetch, bounded jobs and a visible ready-frontier suspension at M3. |
| Revisits restore spent pickups | Stable entity IDs, journal flags applied before activation, persistence before eviction and storage-failure suspension. |
| Materials or ring transforms break meshing | Mesh per rigid ring, merge only compatible faces, and keep collision tied to shared platform descriptions. |
| Lighting obscures gameplay or exhausts frame budget | Readability checks in each theme and individually switchable shadow/post-processing passes at M4. |
| Timing comparisons become misleading | Active monotonic clock, explicit interruption classification, course/rules version separation and no input-replay claim. |

## Planning-package validation

AC-01 checks required documents and contiguous FR, NFR and TC identifiers. AC-02 checks that requirements reference existing test IDs and that every scenario has at least one requirement. AC-03 parses all Mermaid diagrams and verifies their source/image references. AC-04 checks local Markdown links and required interface/theme names. AC-05 renders the DOCX and PDF and inspects every page for readable tables, diagrams and code, with no clipping or overlap. AC-06 compares the exported report's content and figure inventory with the Markdown manifest. Package verification is recorded separately from future gameplay acceptance.
