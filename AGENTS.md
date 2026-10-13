# Scope and ownership

The current user is Alexandru Istrate (`TechnicalTortuga`). Read [system ownership](docs/collaboration/OWNERSHIP.md) and [architecture review](docs/collaboration/ARCHITECTURE_REVIEW.md) before changing feature code.

- Omar Sabry (`r0xly`) owns rendering, camera presentation and voxel meshing: `src/rendering/`, `src/meshing/`.
- Adrian Alvarez (`atalvarez77`) owns generation and streaming: `src/world/`, `src/streaming/`.
- Alexandru owns movement/collision, boost behavior, lighting/shaders and run systems: `src/player/`, `src/boosts/`, `src/lighting/`, `src/run/`.
- Bootstrap/build tooling, shared contracts, the HUD shell and integration are shared areas. Feature-specific work still follows its owner.

Do not implement or modify Omar's or Adrian's systems on Alexandru's behalf unless the human explicitly authorizes the particular cross-owner change. Do not create fallback implementations of another owner's system to make a feature appear complete. Read-only review and documenting integration questions are allowed.

For this initial repository setup, create build tooling, documents and reserved directories only. Do not implement the renderer, mesher, generator, streamer, player controller, physics, boosts, shaders or storage adapters.

Class names and interfaces in preproduction are design proposals. They are not approved executable contracts. Discuss changes to a shared interface with the affected owners before turning it into code.

Keep package lifecycle scripts disabled. Use exact direct dependency versions and the committed lockfile; review provenance and advisories before dependency changes. Do not run `npm create`, `npx` downloads, automatic dependency upgrades, or a blanket audit fix as routine setup.

Never commit credentials, `.env` files, browser profiles, `node_modules`, build outputs or scratch renders. Use focused branches and describe affected ownership areas in PRs. Do not commit or publish extra game features as part of a tooling task.
