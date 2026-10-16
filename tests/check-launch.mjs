// Livegang-Prüfung gegen den Build (_site): Blocker beenden mit Exit 1, Hinweise nur zur Information.
// Geprüft werden Fehlerklassen, keine konkreten Altwerte. Aufruf: npm run check:launch (nach npm run build)
import fs from 'node:fs';
import path from 'node:path';
import { BASE, SITE_URL } from '../build/site.mjs';

const OUT = process.argv[2] || '_site';
const blocker = [];
const hinweis = [];
const lies = (f) => (fs.existsSync(path.join(OUT, f)) ? fs.readFileSync(path.join(OUT, f), 'utf8') : null);
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const noindex = (html) => /<meta name="robots" content="noindex/.test(html);

// Pflichtseiten: vorhanden, vollständig, nicht im Suchindex (Privatanschrift)
for (const [seite, name] of [['impressum/index.html', 'Impressum'], ['datenschutz/index.html', 'Datenschutzerklärung']]) {
  const html = lies(seite);
  if (!html) { blocker.push(`${name} fehlt (${seite}).`); continue; }
  const t = text(html);
  if (/TODO|Platzhalter|wird gerade eingerichtet|\[(Name|Adresse|Straße|E-Mail)\]/i.test(t)) blocker.push(`${name} enthält einen Platzhalter.`);
  if (!/\b\d{5} [A-ZÄÖÜ][\wäöüß-]+/.test(t)) blocker.push(`${name}: Postleitzahl und Ort fehlen.`);
  if (!/(straße|str\.|weg|platz|allee|gasse|ring|damm|ufer)\s*\d+/i.test(t)) blocker.push(`${name}: Straße mit Hausnummer fehlt.`);
  if (!/(\[at\]|@)\s*[\w-]+\.[a-z]{2,}/i.test(t)) blocker.push(`${name}: E-Mail-Kontakt fehlt.`);
  if (!noindex(html)) blocker.push(`${name} ist indexierbar, sollte aber noindex, follow tragen (Privatanschrift).`);
}

// Startseite: Canonical vorhanden und auf der Live-Adresse
const start = lies('index.html') || '';
const canonical = start.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
if (!canonical) blocker.push('Startseite hat kein Canonical.');
else if (/localhost|127\.0\.0\.1|\.pages\.dev|^http:/.test(canonical)) blocker.push(`Canonical zeigt auf ${canonical} statt auf die Live-Adresse.`);
else if (canonical !== SITE_URL) blocker.push(`Canonical der Startseite (${canonical}) weicht von ${SITE_URL} ab.`);
if (!/<meta name="google-site-verification" content="[^"]+"/.test(start)) hinweis.push('Kein Search-Console-Bestätigungs-Tag auf der Startseite.');

// Sitemap und noindex: beide Richtungen
const xml = lies('sitemap.xml');
if (!xml) blocker.push('sitemap.xml fehlt.');
else {
  const inSitemap = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
  for (const f of fs.readdirSync(OUT, { recursive: true }).filter((x) => x.endsWith('.html'))) {
    const route = BASE + f.split(path.sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '');
    const ni = noindex(lies(f));
    if (ni && inSitemap.has(route)) blocker.push(`${route} steht in der Sitemap, trägt aber noindex.`);
    if (!ni && !inSitemap.has(route)) blocker.push(`${route} ist indexierbar, fehlt aber in der Sitemap.`);
  }
}

// Favicon: Google nutzt nur Kantenlängen, die ein Vielfaches von 48 sind
const pngGroesse = (f) => { const b = fs.readFileSync(path.join(OUT, f)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const icons = [...start.matchAll(/<link rel="icon" href="([^"]+\.png)"/g)].map((m) => m[1].slice(BASE.length));
const gross48 = icons.filter((f) => fs.existsSync(path.join(OUT, f))).map(pngGroesse).filter(([w, h]) => w === h && w % 48 === 0);
if (!gross48.length) blocker.push('Kein verlinktes PNG-Favicon mit einer Kantenlänge, die ein Vielfaches von 48 ist.');
for (const f of ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png']) if (!fs.existsSync(path.join(OUT, f))) blocker.push(`${f} fehlt.`);

// Messung: Einbindung und Datenschutzerklärung müssen zusammenpassen
const alleSeiten = fs.readdirSync(OUT, { recursive: true }).filter((x) => x.endsWith('.html')).map((f) => lies(f)).join('\n');
const ds = text(lies('datenschutz/index.html') || '');
const messung = { 'Google Analytics': /googletagmanager\.com|google-analytics\.com/, 'Cloudflare Web Analytics': /cloudflareinsights\.com/, Plausible: /plausible\.io/ };
let gemessen = false;
for (const [name, re] of Object.entries(messung)) {
  const eingebunden = re.test(alleSeiten);
  const erwaehnt = new RegExp(name, 'i').test(ds);
  if (eingebunden) gemessen = true;
  if (eingebunden && !erwaehnt) blocker.push(`${name} ist eingebunden, die Datenschutzerklärung erwähnt es nicht.`);
  if (!eingebunden && erwaehnt) blocker.push(`Die Datenschutzerklärung beschreibt ${name}, eingebunden ist es nicht.`);
}
if (!gemessen) hinweis.push('Keine Messung eingebunden; die Datenschutzerklärung sagt ausdrücklich, dass nichts gemessen wird.');

// Antwortmaschinen
for (const f of ['llms.txt', 'llms-full.txt']) if (!lies(f)) blocker.push(`${f} fehlt.`);

console.log(`Livegang-Prüfung: ${blocker.length} Blocker, ${hinweis.length} Hinweise`);
for (const b of blocker) console.log(`  BLOCKER  ${b}`);
for (const h of hinweis) console.log(`  Hinweis  ${h}`);
process.exit(blocker.length ? 1 : 0);
