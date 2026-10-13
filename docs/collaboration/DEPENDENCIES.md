# Dependency policy

The starter is assembled manually. Direct dependencies are limited to Three.js, its TypeScript definitions, TypeScript and Vite. Additional direct testing, physics, UI-framework and plugin dependencies are deferred until an owned feature needs them. Three.js type definitions bring their own transitive dependencies, including Rapier compatibility types; no physics feature is implemented.

- Pin exact direct versions and commit `package-lock.json`. Install the reviewed graph with `npm ci --ignore-scripts`.
- `.npmrc` uses the official npm registry, `save-exact=true` and `ignore-scripts=true`. This disables package lifecycle hooks during install. Explicit project commands such as `npm run build` still execute code.
- Check official project releases, npm registry integrity/signatures/provenance where available, the resolved graph and security advisories before accepting an update.
- Run `npm audit` for known advisories and `npm audit signatures` to verify registry signatures/available provenance. Record failures accurately; missing/invalid verification is not a successful check.
- Do not run `npm audit fix --force`, remove script restrictions globally, add a registry token, or use an unreviewed generator to bypass a failed build.
- If a required package relies on an install hook, review that exact hook and agree a narrow exception before running it. There is no hook exception for this starter.
- Keep credentials and private environment files outside the repository. Do not install dependency updates while secret-bearing deployment work is in progress.

These controls reduce exposure; they do not prove downloaded package code is harmless. A compromised package can execute when imported or used by build tooling even when install hooks are disabled. Audits only report known issues, and signatures identify a publication rather than certify its behavior.

## Selected versions

| Package | Exact version | Purpose |
| --- | --- | --- |
| `three` | 0.186.1 | Future Three.js rendering dependency; no renderer exists in the starter. |
| `@types/three` | 0.186.0 | Matching Three.js type definitions. |
| `typescript` | 6.0.3 | Established JavaScript compiler distribution; avoids adding the newer native compiler's platform packages to this small starter. |
| `vite` | 8.3.4 | Development server and production build. |

Selection is dated October 13, 2026. Lockfile checks and install/build results are recorded in `docs/collaboration/STARTER_VALIDATION.md` after verification.

References: [GitHub's npm supply-chain response](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/), [npm audit and signature verification](https://docs.npmjs.com/cli/v11/commands/npm-audit/), [Vite 8.3.4 release](https://github.com/vitejs/vite/releases/tag/v8.3.4), [TypeScript 6.0.3 release](https://github.com/microsoft/TypeScript/releases/tag/v6.0.3), [Three.js releases](https://github.com/mrdoob/three.js/releases).
