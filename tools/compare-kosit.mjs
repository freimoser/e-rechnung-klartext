// Abgleich der Vorprüfung mit den Ergebnissen des offiziellen KoSIT-Validators (tests/kosit-baseline.json).
// Aufruf: node tools/compare-kosit.mjs <Ordner mit XML-Dateien> [...]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from '../build/serve.mjs';
import { runVorpruefung } from '../tests/vorpruefung-lauf.mjs';

const dirs = process.argv.slice(2);
const files = dirs.flatMap((d) => fs.readdirSync(d, { recursive: true }).filter((f) => f.endsWith('.xml')).map((f) => path.join(d, f)));
const base = JSON.parse(fs.readFileSync('tests/kosit-baseline.json', 'utf8'));
const server = createServer().listen(8091);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto('http://localhost:8091/e-rechnung-klartext/404.html');
const res = await runVorpruefung(page, files);
await browser.close();
server.close();
let fp = 0;
let fn = 0;
for (const [name, r] of Object.entries(res)) {
  const key = name.replace(/\.xml$/, '');
  const off = base[key];
  if (!off || r.broken) continue;
  const offErr = new Set(off.messages.filter(([, l]) => l === 'error').map(([c]) => c));
  const offAll = new Set(off.messages.map(([c]) => c));
  const mineErr = new Set(r.findings.filter(([, f]) => f === 'fatal' || f === 'error').map(([c]) => c));
  const mineAll = new Set(r.findings.map(([c]) => c));
  const falsePos = [...mineAll].filter((c) => !offAll.has(c));
  const missed = [...offErr].filter((c) => !mineErr.has(c));
  if (falsePos.length || missed.length) {
    console.log(`${name}: zusätzlich gemeldet ${JSON.stringify(falsePos)}; offiziell, aber nicht gemeldet ${JSON.stringify(missed)}`);
  }
  fp += falsePos.length;
  fn += missed.length;
}
console.log(`Dateien: ${Object.keys(res).length}, zusätzliche Meldungen: ${fp}, nicht erkannte offizielle Fehler: ${fn}`);
