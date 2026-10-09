// Abgleich der Vorprüfung mit dem offiziellen KoSIT-Validator (Ergebnisse in tests/kosit-baseline.json).
// Die KoSIT-Testsuite (Apache-2.0) wird bei Bedarf von GitHub geladen und zwischengespeichert.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, FIX } from './helpers.mjs';
import { runVorpruefung } from './vorpruefung-lauf.mjs';

const CACHE = path.join(ROOT, 'tests', '.cache');
const ZIP_URL = 'https://github.com/itplr-kosit/xrechnung-testsuite/releases/download/v2026-08-31/xrechnung-3.0.2-testsuite-2026-08-31.zip';
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'kosit-baseline.json'), 'utf8'));

async function testsuiteFiles() {
  const dir = path.join(CACHE, 'testsuite');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(CACHE, { recursive: true });
    const res = await fetch(ZIP_URL);
    if (!res.ok) return null;
    const zip = path.join(CACHE, 'testsuite.zip');
    fs.writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
    fs.mkdirSync(dir, { recursive: true });
    execFileSync('unzip', ['-q', '-o', zip, '-d', dir]);
  }
  return fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.xml') && f.includes('instances')).map((f) => path.join(dir, f));
}

function compare(results) {
  const extra = [];
  const missed = [];
  for (const [name, r] of Object.entries(results)) {
    const off = baseline[name.replace(/\.xml$/, '')];
    if (!off || r.broken) continue;
    const offAll = new Set(off.messages.map(([c]) => c));
    const offErr = off.messages.filter(([, l]) => l === 'error').map(([c]) => c);
    const mine = new Set(r.findings.map(([c]) => c));
    for (const c of mine) if (!offAll.has(c)) extra.push(`${name}: ${c}`);
    for (const c of offErr) if (!mine.has(c)) missed.push(`${name}: ${c}`);
  }
  return { extra, missed };
}

test('Eigene Testrechnungen: gleiche Befunde wie der KoSIT-Validator', async ({ page }) => {
  await page.goto('404.html');
  const files = fs.readdirSync(FIX).filter((f) => f.endsWith('.xml') && f !== 'kaputt.xml').map((f) => path.join(FIX, f));
  const res = await runVorpruefung(page, files);
  const { extra, missed } = compare(res);
  expect(extra, 'Meldungen, die der KoSIT-Validator nicht hat').toEqual([]);
  expect(missed, 'Offizielle Fehler, die die Vorprüfung nicht findet').toEqual([]);
});

test('Offizielle KoSIT-Testsuite: keine falschen Fehlermeldungen', async ({ page }) => {
  const files = await testsuiteFiles();
  test.skip(!files, 'KoSIT-Testsuite nicht erreichbar (offline)');
  expect(files.length).toBe(86);
  await page.goto('404.html');
  const res = await runVorpruefung(page, files);
  const { extra, missed } = compare(res);
  expect(extra, 'Meldungen, die der KoSIT-Validator nicht hat').toEqual([]);
  // Nicht abgedeckte Codelisten-Regeln (BR-CL-10, BR-CL-13, BR-CL-21) sind bekannt und dokumentiert
  expect(missed.filter((m) => !/BR-CL-(10|13|21)$/.test(m))).toEqual([]);
});
