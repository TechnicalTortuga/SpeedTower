# World Generation and Streaming Specification

SpeedTower generates an endless upward castle from a numeric seed. This contract implements FR-07–10, FR-18–20, and FR-25 from [Requirements](02-requirements.md). No generator or reachability test exists yet. Numerical settings are prototype candidates for Milestones 1–3.

## Coordinate system and section boundaries

Use a fixed tower radius of **8 units**, a **1-unit voxel**, and **32-unit vertical sections**. Section indices are nonnegative integers; section 0 contains the base floor. The authoritative player location is section index plus local height. Horizontal `x` is unwrapped distance along the circumference, whose length is `2π × 8`; rendering converts it to an angle. Collision operates on circumference distance and height, while the rendered tower provides depth.

Platforms, walls, hazards, and boosts belong to an independently rotating ring or stationary group. Shared gameplay geometry produces collision and visible voxels; decoration must not conceal landings or create unrepresented obstacles.

A pure `boundaryProfile(n)` defines a shared stationary landing at logical height `32 × n`. Its arc centre comes from the boundary random stream, and its initial landing width is 4 units. Boundary 0 is a safe base floor spanning the full circumference. `generate(n)` uses boundary profiles `n` and `n + 1`, owns the lower landing, and reserves clearance around both. Its exit targets the successor’s lower landing. This gives independently generated neighbours compatible entrances and exits without requiring worker order or predecessor state. The destination section must be resident before the player can cross into it.

## Seed and identity contract

Accept only canonical unsigned decimal seeds from **0 through 4294967295**. Course identity combines seed, generator version, and movement-rules version. A tuning change that affects reachability or rotation changes the rules version; a layout algorithm or template change changes the generator version.

Use the exact FNV-1a keyed-stream and Mulberry32 algorithms defined in [Architecture and Tech Stack](03-architecture.md). Keys include seed, versions, section index, stream tag, and candidate identifier. Use independent `boundary`, `route`, `ring`, `platform`, `boost`, `decoration`, `hazard`, and `fallback` tags. Route changes cannot consume decoration draws, and asynchronous job order cannot alter a section. Never use `Math.random()` or wall-clock time to generate course content.

`generate(sectionIndex)` is pure for a course identity and versioned template catalogue. Gameplay descriptors and mesh inputs are independent of request order. Stable entity IDs contain course identity, section index, and local ID; collectible state adds `runId`. Canonical descriptor hashes support TC-12.

## Route-first generation

The worker performs these stages in order:

1. Read entrance/exit boundary profiles and the saturated difficulty value. Select the section theme and a compatible template family.
2. Build a baseline route using platforms, climbable walls, rotating rings, and safe waiting surfaces. Add optional boost shortcuts and lower recovery platforms.
3. Validate with the actual controller, moving-platform collision, and inherited ring velocity; exclude jump-buffer/coyote-time assistance.
4. Add hazards only outside reserved route and waiting clearances; validate the affected route again.
5. Add decorative voxels, then extract collision descriptors and independently mesh each rigid ring group.
6. Return immutable descriptors and transferable mesh buffers for staged main-thread activation.

`SectionTemplate` defines entrance/exit profiles, route sockets, allowed ring speeds, clearances, and optional placements. `RingSpec`, `PlatformSpec`, hazard descriptors, and boost placements are documented with the worker contract in [Architecture and Tech Stack](03-architecture.md). Templates should originate from a small hand-tested catalogue, then receive offline validation before wider procedural combinations are enabled.

Every mandatory transition must work with baseline movement and without consumable boosts. A boost shortcut may be faster or save a failed jump, but must never be the sole route upward. Provide waiting surfaces where ring alignment is required and recovery platforms below ordinary gaps. Lava is an explicitly lethal exception, with readable warnings and a baseline-safe crossing.

Try candidate identifiers **0–7** in order. Reject a candidate when a required transition fails the validator. After eight failures, use a deterministic stationary safe-connector template matched to the two boundary profiles. The fallback has no required boosts or route hazards. Validate it too; if it fails, report a generation error and suspend at the ready frontier instead of admitting an invalid section.

Validate **16 representative rotation phases** with legal waits, jumps, and wall movement. Sampling is not a proof covering every timing state. Report failed transitions and sampled states. TC-13 proposes **100 seeds × 100 sections**, including fallback and boundary compatibility; hand traversal remains required.

## Rotation and bounded difficulty

Evaluate each ring’s phase from its seeded initial phase and fixed simulation tick: `phase(t) = initialPhase + angularSpeed × t`, where `t = tickIndex / 120` seconds, normalized only when needed. Regenerating a ring evaluates its current phase, rather than restarting its animation. Collision samples the same phase as rendering. Grounded players inherit ring displacement; jump or step-off inherits tangential velocity once.

Increase route complexity gradually, then saturate after section **40**. Scale only within the catalogue’s validated gap, wall-height, waiting-time, and rotation limits. Do not keep increasing jump distances with height. The absolute ring speed cap is **0.5 rad/s**, or **4 units/s** tangentially at radius 8. The controller’s provisional maximum total horizontal speed is 26 units/s, upward speed 14 units/s, and downward speed 24 units/s. Generation uses those caps for streaming safety, and baseline jump parameters for route validation.

## Streaming, regeneration, and persistence

The normal resident window contains the current section, **two below**, and **three above**, clamped at section 0. Keep at most **eight resident sections**, allowing two additional direction-dependent prefetch sections. Limit worker generation to **two jobs** and completed upload payloads to a **two-result queue**. Budget their buffers separately from resident GPU geometry; bounded section counts alone do not guarantee bounded byte use.

Estimate prefetch distance from the relevant velocity cap multiplied by measured generation, transfer, and upload latency, plus a safety margin. The initial worker generation P95 target is **150 ms per section**. Measure upload latency as well; adjust section complexity and prefetch within the cap. These are targets, not established performance. Crossing a missing frontier suspends simulation ticks, rings, and active run timing with a visible loading state. A suspension after the run starts marks it interrupted (TC-17).

Stage a result until all ring meshes, collision data, and collectible journal entries are ready, then activate it atomically between ticks. Include a run token and course versions in requests/results; discard stale results after retry or seed changes (TC-16). Unload geometry, collision, and render resources only outside the required window. Ordinary falls can descend through regenerated sections indefinitely, down to the safe base; crossing a streaming boundary is never a death condition.

Use IndexedDB for a spent-pickup run journal. Load a section’s journal before activation, and persist dirty collection entries before evicting its state. Keep only resident entries and a bounded pending-write queue in memory. Disk history can grow with the number of collected items during a long run. A failed journal operation pauses the run with retry/restart actions; never silently restore spent pickups. Retry creates a new `runId` and empty journal while retaining course identity (TC-15).

Rebase local vertical coordinates every **512 units**. Preserve authoritative section/local height, maximum height, timer, splits, and entity identities. Horizontal distance remains unwrapped double precision; normalize derived angles for rendering. Rebase tests must cover ascent and descent (TC-19).

## Voxel and verification budgets

Cull hidden faces only within the same rigid moving group. Merge faces only when normal, material, and ambient-occlusion attributes match; independently rotating neighbours can expose faces later. Keep collision descriptors independent of greedy mesh topology. Bound lights, shadows, draw calls, vertices, and allocated bytes through measured graphics budgets.

TC-14 checks theme readability; TC-20 specifies a 30-minute ascent/descent soak targeting 60 FPS on recorded hardware. Measure frame-time percentiles, generation/upload latency, draw calls, vertices, section counts, JS/buffer/GPU resource estimates, and journal growth. Reject missing-terrain collisions, unbounded resident-resource growth, or pickup duplication. See [Roadmap and Validation](07-roadmap-and-validation.md).
