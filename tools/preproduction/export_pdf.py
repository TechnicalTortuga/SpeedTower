#!/usr/bin/env python3
"""Export the saved planning report through a separate LibreOffice profile."""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/preproduction'
NAME = 'SpeedTower-Preproduction-Specification'

def main():
    source = OUT / f'{NAME}.docx'
    executable = (os.environ.get('SPEEDTOWER_SOFFICE')
                  or shutil.which('soffice') or shutil.which('libreoffice'))
    if not executable or not source.exists():
        raise SystemExit('Build the DOCX first and supply a LibreOffice executable.')
    with tempfile.TemporaryDirectory(prefix='speedtower-pdf-') as temporary:
        work = Path(temporary)
        result = subprocess.run([
            executable, f'-env:UserInstallation={(work / "profile").as_uri()}',
            '--headless', '--convert-to', 'pdf', '--outdir', str(work), str(source)
        ], check=True, capture_output=True, text=True)
        pdf = work / f'{NAME}.pdf'
        if not pdf.exists() or not pdf.stat().st_size:
            raise SystemExit(f'LibreOffice produced no PDF: {result.stderr}')
        shutil.copyfile(pdf, OUT / pdf.name)
    print(OUT / f'{NAME}.pdf')

if __name__ == '__main__':
    main()
