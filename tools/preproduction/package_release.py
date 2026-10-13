#!/usr/bin/env python3
"""Bundle planning sources, build tools and reports without scratch files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/preproduction'
ARCHIVE = OUT / 'SpeedTower-Preproduction-Package.zip'

def main():
    files = [ROOT / name for name in ('README.md', '.gitignore', 'AGENTS.md', 'CONTRIBUTING.md')]
    for folder in ('docs/preproduction', 'docs/collaboration', 'tools/preproduction', 'output/preproduction'):
        files.extend(p for p in (ROOT / folder).rglob('*')
                     if p.is_file() and p != ARCHIVE
                     and '__pycache__' not in p.parts and p.suffix != '.pyc')
    required = [OUT / f'SpeedTower-Preproduction-Specification.{ext}'
                for ext in ('docx', 'pdf')]
    if any(not p.exists() for p in required):
        raise SystemExit('Build both reports before packaging.')
    with ZipFile(ARCHIVE, 'w', ZIP_DEFLATED) as archive:
        for source in sorted(set(files)):
            archive.write(source, source.relative_to(ROOT))
    with ZipFile(ARCHIVE) as archive:
        bad = archive.testzip()
        if bad:
            raise SystemExit(f'Archive integrity failed: {bad}')
        count = len(archive.namelist())
    print(f'{ARCHIVE} ({count} files)')

if __name__ == '__main__':
    main()
