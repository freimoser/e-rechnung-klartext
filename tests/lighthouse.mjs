// Lighthouse-Messung gegen den lokalen Server (gleiche Pfade und gzip wie GitHub Pages).
// Aufruf: npm run lighthouse  (benötigt lighthouse 13, z. B. LIGHTHOUSE_BIN=/pfad/zu/lighthouse)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createServer } from '../build/serve.mjs';

const PORT = 8095;
// Lighthouse-Programm: LIGHTHOUSE_BIN oder lokal installiertes lighthouse (npm i -g lighthouse@13)
const LH = process.env.LIGHTHOUSE_BIN || 'lighthouse';
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['', 'fehlercodes/', 'e-rechnung-pflicht-ab-wann/', 'xrechnung-oder-zugferd/'];
const presets = ['mobile', 'desktop'];
fs.mkdirSync('lighthouse', { recursive: true });
const server = createServer().listen(PORT);
const rows = [];
try {
  for (const p of pages) {
    for (const preset of presets) {
      const url = `http://localhost:${PORT}/e-rechnung-klartext/${p}`;
      const out = `lighthouse/${(p || 'start').replace(/\//g, '')}-${preset}.json`;
      const args = [url, '--quiet', '--output=json', `--output-path=${out}`,
        '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new'];
      if (preset === 'desktop') args.push('--preset=desktop');
      execFileSync(LH, args, { stdio: 'inherit' });
      const r = JSON.parse(fs.readFileSync(out, 'utf8'));
      const s = (k) => Math.round(r.categories[k].score * 100);
      rows.push({ seite: '/' + p, preset, performance: s('performance'), barrierefreiheit: s('accessibility'), bestPractices: s('best-practices'), seo: s('seo') });
    }
  }
} finally {
  server.close();
}
console.table(rows);
fs.writeFileSync('lighthouse/ergebnis.json', JSON.stringify(rows, null, 2));
