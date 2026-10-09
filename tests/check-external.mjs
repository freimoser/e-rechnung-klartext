// Prüft alle externen Adressen aus den gebauten Seiten, README.md und quellen.md auf Status 200.
// Aufruf: node tests/check-external.mjs
import fs from 'node:fs';
import path from 'node:path';

function files(dir) {
  return fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => path.join(dir, f));
}
const sources = [...files('_site'), 'README.md', 'quellen.md'];
const found = new Map();
for (const f of sources) {
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.matchAll(/https?:\/\/[^\s"'<>)`|]+/g)) {
    let u = m[0].replace(/&amp;/g, '&').replace(/[.,;]+$/, '');
    if (/^https?:\/\/(localhost|schema\.org|www\.w3\.org|purl\.org|docs\.oasis-open\.org\/ubl\/os-UBL-2\.1\/xsd)/.test(u)) continue;
    if (u.startsWith('https://freimoser.github.io/e-rechnung-klartext')) continue; // eigene Seite, lokal getestet
    if (!found.has(u)) found.set(u, new Set());
    found.get(u).add(f);
  }
}
const results = [];
for (const u of [...found.keys()].sort()) {
  let status = 0;
  try {
    const res = await fetch(u, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (Linkpruefung E-Rechnung Klartext)' }, signal: AbortSignal.timeout(20000) });
    status = res.status;
  } catch (e) {
    status = 'Fehler: ' + e.message;
  }
  results.push({ status, url: u, in: [...found.get(u)].length });
  if (status !== 200) console.log(status, u, [...found.get(u)].slice(0, 3).join(', '));
}
console.log(`${results.length} externe Adressen geprüft, ${results.filter((r) => r.status === 200).length} mit 200.`);
fs.mkdirSync('tests/.cache', { recursive: true });
fs.writeFileSync('tests/.cache/externe-links.json', JSON.stringify(results, null, 2));
