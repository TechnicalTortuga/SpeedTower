#!/usr/bin/env python3
"""Check source completeness, traceability, local links and export inventory."""
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--exports', action='store_true')
    args = parser.parse_args()
    docs = ROOT / 'docs/preproduction'
    sources = sorted(docs.glob('[0-9][0-9]-*.md'))
    errors = []
    if len(sources) != 8:
        errors.append(f'Expected eight chapters, found {len(sources)}')
    requirement_text = (docs / '02-requirements.md').read_text()
    validation_text = (docs / '07-roadmap-and-validation.md').read_text()
    rows = [line for line in requirement_text.splitlines() if re.match(r'^\| (?:FR|NFR)-\d\d \|', line)]
    reqs = [re.search(r'(?:FR|NFR)-\d\d', line).group() for line in rows]
    expected = [f'FR-{x:02}' for x in range(1,26)] + [f'NFR-{x:02}' for x in range(1,11)]
    if sorted(reqs) != sorted(expected):
        errors.append('Requirement IDs are missing, repeated or unexpected')
    test_rows = re.findall(r'^\| (TC-\d\d) \|', validation_text, re.M)
    if sorted(test_rows) != [f'TC-{x:02}' for x in range(1,21)]:
        errors.append('Test scenario IDs are missing, repeated or unexpected')
    covered = set()
    for row in rows:
        ids = re.findall(r'TC-\d\d', row)
        covered.update(ids)
        if 'NFR-09' not in row and not ids:
            errors.append(f'Requirement without test: {row}')
        if any(t not in test_rows for t in ids):
            errors.append(f'Requirement references undefined test: {row}')
    if set(test_rows) - covered:
        errors.append(f'Scenarios without requirement: {sorted(set(test_rows)-covered)}')
    md_files = [ROOT/'README.md', docs/'README.md', docs/'VALIDATION.md', *sources, ROOT/'tools/preproduction/README.md']
    checked_links = 0
    for source in md_files:
        if not source.exists():
            errors.append(f'Missing index: {source.relative_to(ROOT)}'); continue
        for target in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', source.read_text()):
            target = target.strip('<>').split('#')[0]
            if not target or target.startswith(('http:', 'https:', 'mailto:')):
                continue
            checked_links += 1
            if not (source.parent / target).resolve().exists():
                errors.append(f'Broken link in {source.name}: {target}')
    combined = '\n'.join(x.read_text() for x in sources)
    for name in ['RunConfig','PlayerState','SectionTemplate','RingSpec','PlatformSpec','BoostDefinition','ChunkBuildRequest','ChunkBuildResult','RunStateStore','Stone Ruins','Overgrown Keep','Frost Citadel','Volcanic Forge','Arcane Tower','Storm Battlements']:
        if name not in combined:
            errors.append(f'Missing required term: {name}')
    diagrams = sorted((docs/'diagrams').glob('*.mmd'))
    for source in diagrams:
        for suffix in ('.png','.svg'):
            if not (docs/'diagrams/rendered'/source.with_suffix(suffix).name).exists():
                errors.append(f'Missing rendered diagram: {source.name}{suffix}')
    manifest_path = docs/'diagrams/rendered/manifest.json'
    if not manifest_path.exists():
        errors.append('Missing Mermaid render/parse manifest')
    else:
        render_manifest = json.loads(manifest_path.read_text())
        if {x['source'] for x in render_manifest['diagrams']} != {x.name for x in diagrams}:
            errors.append('Rendered diagrams do not match source inventory')
        for item in render_manifest['diagrams']:
            if item.get('sha256') != hashlib.sha256((docs/'diagrams'/item['source']).read_bytes()).hexdigest():
                errors.append(f'Stale rendered diagram: {item["source"]}')
    if args.exports:
        out = ROOT/'output/preproduction'
        manifest = json.loads((out/'report-manifest.json').read_text())
        for item in manifest['sources']:
            if hashlib.sha256((docs/item['file']).read_bytes()).hexdigest() != item['sha256']:
                errors.append(f'Export has stale source: {item["file"]}')
        if set(manifest['figures']) != {x.with_suffix('.png').name for x in diagrams}:
            errors.append('Report figure inventory mismatch')
        for name in manifest['figures']:
            if manifest.get('figureHashes', {}).get(name) != hashlib.sha256((docs/'diagrams/rendered'/name).read_bytes()).hexdigest():
                errors.append(f'Export has stale figure: {name}')
        docx = out/'SpeedTower-Preproduction-Specification.docx'
        pdf = out/'SpeedTower-Preproduction-Specification.pdf'
        if not pdf.exists() or pdf.stat().st_size == 0:
            errors.append('Final PDF missing or empty')
        with zipfile.ZipFile(docx) as z:
            tree = ET.fromstring(z.read('word/document.xml'))
            ns = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            texts = ' '.join(x.text or '' for x in tree.findall('.//w:t',ns))
            for name in expected + test_rows:
                if name not in texts:
                    errors.append(f'Export omitted {name}')
            media = [x for x in z.namelist() if x.startswith('word/media/')]
            if len(media) != len(diagrams):
                errors.append(f'DOCX figure count {len(media)} != {len(diagrams)}')
    result = {'status':'pass' if not errors else 'fail','chapters':len(sources),'functionalRequirements':25,'qualityRequirements':10,'futureTestScenarios':20,'diagrams':len(diagrams),'localLinksChecked':checked_links,'exportsChecked':args.exports,'errors':errors}
    print(json.dumps(result,indent=2))
    raise SystemExit(1 if errors else 0)

if __name__ == '__main__':
    main()
