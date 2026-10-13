# Working on SpeedTower

Read [ownership](docs/collaboration/OWNERSHIP.md) and the [architecture review](docs/collaboration/ARCHITECTURE_REVIEW.md) before implementing a system. The starting allocation reserves Omar's rendering/meshing and Adrian's generation/streaming work. Shared interfaces need review from their producers and consumers.

## Start a feature branch

```sh
git clone https://github.com/TechnicalTortuga/SpeedTower.git
cd SpeedTower
git switch -c feature/your-name/feature-name
npm ci --ignore-scripts
npm run dev
```

Use Node 24 LTS (the `.nvmrc` selects 24) and npm. The starter is a static development page; game systems are implemented on owner branches. Public read access permits cloning/forking. Pushing a branch to the team repository requires accepted collaborator access. Omar's account is `r0xly`; Adrian's is `atalvarez77`. Contributors without access can fork and open a PR.

## Review and integration

1. Keep a PR focused on one feature or agreed contract change.
2. Name the owning area and request its owner as reviewer.
3. Run `npm run check` and `npm run build`; add meaningful feature tests as implementations arrive.
4. Explain resulting behavior and validation. Identify architecture proposals that were accepted or revised.
5. Merge through a PR into `main`. Do not force-push shared history.

`CODEOWNERS` maps all three accounts to their areas. It requests reviewers, and does not itself prevent edits or enforce approval. Branch rules must be configured separately if the team wants enforced reviews.

## Dependencies

Read the [dependency policy](docs/collaboration/DEPENDENCIES.md). Package install scripts are disabled by `.npmrc`. Avoid unreviewed generators, `npx` downloads, floating direct dependency versions and automated audit fixes. Dependency changes should be a separate PR with lockfile/provenance/advisory review.

## Planning documents

Editable Markdown/Mermaid lives under `docs/preproduction/`; matching reports live under `output/preproduction/`. Follow [report tooling instructions](tools/preproduction/README.md) when changing those chapters. Keep scratch renders, build outputs and dependencies out of Git.
