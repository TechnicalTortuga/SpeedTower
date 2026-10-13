# Preproduction report tooling

The eight numbered Markdown chapters are the content authority. The report builder preserves their text, tables, interface snippets, external references and figure inventory. Mermaid sources remain editable; report figures are image exports of those sources.

## Dependencies

Use Python 3 with `python-docx` and Pillow, Node.js with Playwright, and a Chromium browser. The diagram renderer imports Mermaid **11.12.0** from jsDelivr; an internet connection is required for that pinned module and its dependencies. It renders locally in a separate headless browser profile. No Mermaid installation is required.

Keep report dependencies in a Python virtual environment and a separate Node tool environment. Review packages under the project's dependency policy before installing them. Avoid mixing different dependency sets during a single export. Existing diagram PNGs allow report rebuilding without downloading or executing the diagram renderer.

## Build order

Run from the repository root:

```sh
node tools/preproduction/render_diagrams.mjs
python tools/preproduction/build_report.py
```

If Playwright packages or Chrome reside elsewhere, set the task-specific `SPEEDTOWER_NODE_MODULES` and `SPEEDTOWER_CHROME` environment variables. Otherwise the renderer resolves local Node packages (or the bundled runtime's adjacent module directory), uses system Google Chrome on macOS when available, and falls back to Playwright's default Chromium installation.

Export the DOCX to PDF with `python tools/preproduction/export_pdf.py` using LibreOffice. Set `SPEEDTOWER_SOFFICE` if its executable is not on PATH. Keep page renders in the ignored `tmp/` directory. The final PDF is placed beside the DOCX under `output/preproduction/` as `SpeedTower-Preproduction-Specification.pdf`.

```sh
python tools/preproduction/verify_package.py --exports
```

The verifier checks source completeness, requirement/test traceability, local links, diagram/render inventory, source hashes and exported requirement/figure coverage. Diagram rendering also parses every Mermaid source. It does not replace human page inspection and does not run the future game's acceptance tests.

After successful verification and page review, run `python tools/preproduction/package_release.py` to bundle sources, tools and reports. The archive excludes Git metadata, dependencies, Python caches and scratch page renders. Re-run packaging after updating the validation record or exported reports.

## Export review

Inspect every rendered report page at full resolution. Fix clipping, unreadable figures, awkward table breaks and missing text in the source or builder, then rebuild and inspect again. The diagram manifest records Mermaid source hashes. `report-manifest.json` records chapter and figure hashes to detect stale exports. Do not commit scratch page renders or browser profiles.
