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
    if (u.endsWith('.git')) continue; // Klon-Adresse im README, kein Link
    if (!found.has(u)) found.set(u, new Set());
    found.get(u).add(f);
  }
}
// Browser-Kennung: Manche Behördenseiten (ELSTER, xeinkauf) leiten unbekannte Programme im Kreis um
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const results = [];
for (const u of [...found.keys()].sort()) {
  let status = 0;
  try {
    // Weiterleitungen nicht folgen: Jeder Link soll direkt auf die Zieladresse zeigen
    const res = await fetch(u, { redirect: 'manual', headers: { 'user-agent': UA, 'accept-language': 'de-DE,de;q=0.9' }, signal: AbortSignal.timeout(20000) });
    status = res.status;
    if (status >= 300 && status < 400) status = `${status} → ${res.headers.get('location')}`;
  } catch (e) {
    status = 'Fehler: ' + e.message;
  }
  results.push({ status, url: u, in: [...found.get(u)].length });
  if (status !== 200) console.log(status, u, [...found.get(u)].slice(0, 3).join(', '));
}
console.log(`${results.length} externe Adressen geprüft, ${results.filter((r) => r.status === 200).length} mit 200.`);
fs.mkdirSync('tests/.cache', { recursive: true });
fs.writeFileSync('tests/.cache/externe-links.json', JSON.stringify(results, null, 2));
