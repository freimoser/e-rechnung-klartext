// Gemeinsame Helfer für die Tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FIX = path.join(ROOT, 'tests', 'fixtures', 'out');
export const fixture = (name) => path.join(FIX, name);

// Datei über das Dateifeld öffnen und warten, bis das Ergebnis da ist
export async function openFiles(page, names) {
  await page.goto('./');
  await page.setInputFiles('#file-input', names.map(fixture));
  await page.waitForSelector('#result:not(.hidden) .result-head');
}

// Text aus einer PDF-Datei (Bytes) mit pdf.js lesen
export async function pdfText(bytes) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: false, disableFontFace: true, verbosity: 0 }).promise;
  let out = '';
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    out += tc.items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join('') + '\n';
  }
  return { text: out, pages: doc.numPages };
}

export async function downloadBytes(download) {
  const p = await download.path();
  return fs.readFileSync(p);
}

// Alle Seiten aus der gebauten Sitemap
export function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, '_site', 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

export function localPath(url) {
  return url.replace('https://freimoser.github.io/e-rechnung-klartext/', './');
}
