// Lighthouse-Messung gegen den lokalen Server (gleiche Pfade und gzip wie GitHub Pages).
// Lighthouse ist keine feste Abhängigkeit: vorher `npm i --no-save lighthouse@13` ausführen.
// Aufruf: npm run lighthouse [-- seite/ ...]
import fs from 'node:fs';
import { createServer } from '../build/serve.mjs';

let lighthouse;
let chromeLauncher;
try {
  lighthouse = (await import('lighthouse')).default;
  chromeLauncher = await import('chrome-launcher');
} catch {
  console.error('Lighthouse fehlt. Bitte zuerst: npm i --no-save lighthouse@13');
  process.exit(1);
}

const PORT = 8095;
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['', 'fehlercodes/', 'e-rechnung-pflicht-ab-wann/', 'xrechnung-oder-zugferd/'];
fs.mkdirSync('lighthouse', { recursive: true });
const server = createServer().listen(PORT);
const rows = [];
try {
  for (const preset of ['mobile', 'desktop']) {
    const config = preset === 'desktop' ? (await import('lighthouse/core/config/desktop-config.js')).default : undefined;
    for (const p of pages) {
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
      const r = await lighthouse(`http://localhost:${PORT}/e-rechnung-klartext/${p}`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, config);
      await chrome.kill();
      fs.writeFileSync(`lighthouse/${(p || 'start').replace(/\//g, '')}-${preset}.json`, r.report);
      const s = (k) => Math.round(r.lhr.categories[k].score * 100);
      rows.push({ seite: '/' + p, preset, performance: s('performance'), barrierefreiheit: s('accessibility'), bestPractices: s('best-practices'), seo: s('seo') });
    }
  }
} finally {
  server.close();
}
console.table(rows);
fs.writeFileSync('lighthouse/ergebnis.json', JSON.stringify(rows, null, 2));
