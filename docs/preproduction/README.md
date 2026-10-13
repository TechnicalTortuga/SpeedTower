# SpeedTower Preproduction Package

Start with the game brief, then read requirements and architecture before implementing the first movement prototype. The source documents and diagrams are editable. Their consolidated Word/PDF exports provide the same specification for review and submission.

| Document | Purpose |
| --- | --- |
| [01 Game design](01-game-design.md) | Player experience, controls, movement and initial tuning. |
| [02 Requirements](02-requirements.md) | Eight use cases, 25 functional requirements, ten quality requirements and test traceability. |
| [03 Architecture](03-architecture.md) | Three proposed architectures, recommended stack, contracts and data flow. |
| [04 World generation](04-world-generation.md) | Seeds, templates, route validation, streaming and persistent spent items. |
| [05 Environments and boosts](05-environments-and-boosts.md) | Six themes, challenge patterns, art direction and shared boost effects. |
| [06 Diagrams](06-diagrams.md) | Architecture, Design Class Diagram, sequences, states and generation flow with editable Mermaid sources. |
| [07 Roadmap and validation](07-roadmap-and-validation.md) | Six milestones, suggested ownership, 20 future acceptance scenarios and performance methodology. |
| [08 Sources and decisions](08-sources-and-decisions.md) | Proposal basis, architecture decisions and primary technical references. |

## Reports and maintenance

- [Editable Word report](../../output/preproduction/SpeedTower-Preproduction-Specification.docx)
- [PDF report](../../output/preproduction/SpeedTower-Preproduction-Specification.pdf)
- [Build and verification instructions](../../tools/preproduction/README.md)
- [Completed planning-package validation](VALIDATION.md)
- [Complete package ZIP](../../output/preproduction/SpeedTower-Preproduction-Package.zip)

Update the Markdown and Mermaid sources first, then regenerate diagrams and reports. Movement or generation changes require version updates and route revalidation. The numerical defaults and 60 FPS goal remain prototype targets; the listed gameplay tests have not been run.
