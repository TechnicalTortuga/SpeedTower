# SpeedTower

SpeedTower is a proposed endless, seeded voxel castle platformer for Group 7 in CS 4361.002. The player climbs around a rotating tower in a centered side view, with independently moving rings, wall jumps and dash/high-jump/glide boosts.

This repository contains a minimal TypeScript/Vite starter and the preproduction specification. The entry page is a development placeholder. Game systems are reserved for their owners to implement on feature branches.

## Start here

Read [system ownership](docs/collaboration/OWNERSHIP.md), [architecture proposals to review](docs/collaboration/ARCHITECTURE_REVIEW.md) and [contribution instructions](CONTRIBUTING.md) before developing a feature. Proposed class names, interfaces and tuning in the planning package can be revised by the relevant owners.

| Member | Starting responsibility | Reserved folders |
| --- | --- | --- |
| Omar — `r0xly` | Rendering, camera and voxel meshing | `src/rendering/`, `src/meshing/` |
| Adrian — `atalvarez77` | Generation and streaming | `src/world/`, `src/streaming/` |
| Alexandru — `TechnicalTortuga` | Movement/collision, boosts, lighting and run systems | `src/player/`, `src/boosts/`, `src/lighting/`, `src/run/` |

Bootstrap, contracts, UI shell and integration are shared. See the ownership document for handoffs and unresolved storage/AO boundaries.

## Local setup

Use Node 24 LTS and npm. Install scripts are disabled by `.npmrc`; direct versions and the resolved dependency graph are pinned. Review the [dependency policy](docs/collaboration/DEPENDENCIES.md) before adding packages.

```sh
npm ci --ignore-scripts
npm run dev
```

The dev server uses `http://127.0.0.1:5173`. `npm run check` checks TypeScript; `npm run build` produces `dist/`; `npm run preview` serves the build locally. Vitest and Playwright are planned for feature tests and are not installed in this starter.

## Planning package

- [Preproduction package and reading guide](docs/preproduction/README.md)
- [Word report](output/preproduction/SpeedTower-Preproduction-Specification.docx)
- [PDF report](output/preproduction/SpeedTower-Preproduction-Specification.pdf)
- [Renamed preproduction package ZIP](output/preproduction/SpeedTower-Preproduction-Package.zip)
- [Report build and verification instructions](tools/preproduction/README.md)
- [Starter validation](docs/collaboration/STARTER_VALIDATION.md)
