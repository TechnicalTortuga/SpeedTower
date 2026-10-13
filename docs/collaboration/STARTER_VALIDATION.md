# Starter validation

Verified on October 13, 2026. This records repository setup checks, separate from the future game's acceptance tests.

| Check | Result |
| --- | --- |
| Ownership | All three supplied GitHub accounts are mapped in CODEOWNERS and the ownership guide. Other members' feature folders contain README reservations only. |
| Architecture scope | Drafted class/interface contracts remain documentation. No renderer, mesher, generator, streamer, movement, boost, shader or storage implementation was added. |
| Dependency footprint | Four exact direct packages; lockfile contains 49 resolved package entries, including platform variants. All resolved URLs use the official npm registry. |
| Install hooks | `.npmrc` disables lifecycle scripts; install used `npm ci --ignore-scripts`. The graph includes an optional fsevents install hook, which was not enabled. |
| Known advisories | `npm audit` returned zero known vulnerabilities at verification time. This is not a malware-free guarantee. |
| Publication verification | `npm audit signatures` completed successfully: 25 installed packages have verified registry signatures; nine have verified attestations. Other-platform optional entries were not verified by this machine's installed-package check. |
| Compiler and build | `npm run build` passed its TypeScript check and Vite production build. Only the static development shell is bundled. |
| Browser smoke check | Production preview displays the SpeedTower heading and development placeholder correctly. |
| Planning exports | Eight chapters, 35 requirements, 20 future scenarios and 14 diagrams. Renamed Word/PDF exports pass source/hash and identifier checks; all 36 rendered pages were visually reviewed. Report chapter edits during setup are limited to the SpeedTower name and its historical source-title clarification. |
| Collaboration links | Local links in the root/contribution/ownership documents and reserved-folder READMEs resolve. |
| CI definition | Check/build, known-advisory audit, signature verification and planning-export checks are configured. Third-party Actions are pinned to verified upstream commit SHAs with read-only contents permission and no persisted checkout credential. Remote workflow results are reported separately after publication. |

The preproduction Word/PDF and ZIP preserve the October 6 gameplay plan with the SpeedTower name updated on October 13. The separate collaboration documents identify architecture proposals to review and current ownership. No new gameplay systems were silently added to the report.

No gameplay tests or frame-rate benchmark were run. Vitest/Playwright dependencies will be added when owners implement features requiring their tests.
