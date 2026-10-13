# Planning-package validation

Initially validated on October 6, 2026; renamed SpeedTower exports rechecked on October 13, 2026. This record covers the planning artifacts. Gameplay acceptance, seed-batch reachability and performance benchmarks remain future work.

| Check | Result | Evidence |
| --- | --- | --- |
| AC-01 Source completeness | Pass | Eight numbered chapters; 25 functional requirements, ten quality requirements and 20 future gameplay scenarios with contiguous identifiers. |
| AC-02 Traceability | Pass | Requirements name responsible systems and acceptance criteria; referenced test IDs exist; every gameplay scenario has requirement coverage. NFR-09 uses this artifact review. |
| AC-03 Diagrams | Pass | All 14 Mermaid sources parsed and rendered using Mermaid 11.12.0. Source hashes match the diagram manifest. |
| AC-04 Links and contracts | Pass | Local Markdown file links resolve; required interfaces and all six environment themes are present. |
| AC-05 Report layout | Pass | All 36 rendered pages inspected at full resolution. Corrected class-field wrapping, state-transition label collisions and architecture-title crossings; affected pages rechecked. Tables, code, diagrams and captions are readable without clipping. |
| AC-06 Export consistency | Pass | Report chapter and figure hashes match current sources. The DOCX contains all requirement/test identifiers and 14 embedded figures. PDF generated from that DOCX. |

The unchanged proposal copy was checked against the original PowerPoint by SHA-256. The package retains editable Markdown and Mermaid, PNG/SVG exports, the Word/PDF reports, manifests and reproducible build instructions.

Run `python tools/preproduction/verify_package.py --exports` from the repository root after future changes. Automated results for this export are saved in [validation-results.json](../../output/preproduction/validation-results.json). Re-render and visually inspect changed pages; automated checks do not replace page review.

The 60 FPS target, movement constants, boost tuning, route samples and storage/performance budgets are proposals. This validation does not claim that a playable game exists or that its tests have passed.
