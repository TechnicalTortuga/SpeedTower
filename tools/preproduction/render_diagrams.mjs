#!/usr/bin/env node
// Render editable Mermaid sources with a pinned browser module.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const sourceDir = path.resolve(process.argv[2] || path.join(root, 'docs/preproduction/diagrams'));
const outputDir = path.join(sourceDir, 'rendered');
const require = createRequire(import.meta.url);
const runtimeModules = process.env.SPEEDTOWER_NODE_MODULES;
const load = name => {
  if (runtimeModules) return require(path.join(runtimeModules, name));
  try { return require(name); }
  catch {
    return require(path.resolve(path.dirname(process.execPath), '../node_modules', name));
  }
};
const { chromium } = load('playwright');
const mermaidUrl = 'https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs';

await fs.mkdir(outputDir, { recursive: true });
const files = (await fs.readdir(sourceDir)).filter(x => x.endsWith('.mmd')).sort();
if (!files.length) throw new Error('No Mermaid sources found');
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let executablePath = process.env.SPEEDTOWER_CHROME;
if (!executablePath && process.platform === 'darwin') {
  try { await fs.access(macChrome); executablePath = macChrome; } catch {}
}
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 2200, height: 1800 }, deviceScaleFactor: 2 });
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:white"></body></html>');
  await page.evaluate(async url => {
    window.mermaid = (await import(url)).default;
    window.mermaid.initialize({
      startOnLoad: false, securityLevel: 'strict', theme: 'base',
      themeVariables: {
        fontFamily: 'Arial, sans-serif', fontSize: '19px',
        primaryColor: '#edf3f8', primaryTextColor: '#172737',
        primaryBorderColor: '#52728c', lineColor: '#40586e',
        secondaryColor: '#eef5ef', tertiaryColor: '#f7f8fa',
        background: '#ffffff', actorBkg: '#edf3f8', actorTextColor: '#172737',
        signalColor: '#40586e', signalTextColor: '#172737',
      },
      flowchart: { htmlLabels: false, curve: 'linear', padding: 18, nodeSpacing: 32, rankSpacing: 40 },
      sequence: { useMaxWidth: false, wrap: true, actorMargin: 28, messageMargin: 28, diagramMarginX: 24, diagramMarginY: 18 },
      class: { useMaxWidth: false, htmlLabels: false, padding: 18 },
    });
  }, mermaidUrl);
  for (const [index, filename] of files.entries()) {
    const source = await fs.readFile(path.join(sourceDir, filename), 'utf8');
    const svg = await page.evaluate(async ({ source, index }) => {
      await window.mermaid.parse(source);
      const result = await window.mermaid.render(`speedtowerFigure${index}`, source);
      document.body.innerHTML = result.svg;
      const el = document.querySelector('svg');
      const box = el.viewBox.baseVal;
      el.setAttribute('width', Math.ceil(box.width));
      el.setAttribute('height', Math.ceil(box.height));
      el.style.maxWidth = 'none';
      el.style.background = '#ffffff';
      return el.outerHTML;
    }, { source, index });
    const base = filename.replace(/\.mmd$/, '');
    await fs.writeFile(path.join(outputDir, `${base}.svg`), svg);
    const el = page.locator('svg');
    const box = await el.boundingBox();
    await el.screenshot({ path: path.join(outputDir, `${base}.png`), timeout: 30000 });
    results.push({ source: filename, sha256: createHash('sha256').update(source).digest('hex'), width: Math.ceil(box.width), height: Math.ceil(box.height) });
    console.log(`${filename}: ${Math.ceil(box.width)} x ${Math.ceil(box.height)}`);
  }
  await fs.writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify({ mermaidVersion: '11.12.0', diagrams: results }, null, 2) + '\n');
} finally {
  await browser.close();
}
