// Baut die statische Seite nach _site/. Läuft lokal (npm run build) und in der GitHub-Action.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BASE, SITE_NAME, TAGLINE, THEME_COLOR, abs } from './site.mjs';
import { renderPage } from './layout.mjs';
import { loadRules, writeToolData } from './rules.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, '_site');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else if (!entry.name.endsWith('.template.js')) fs.copyFileSync(a, b);
  }
}

function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p, base));
    else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

function hashFiles(files) {
  const h = crypto.createHash('sha256');
  for (const f of files.sort()) h.update(f).update(fs.readFileSync(path.join(SRC, f)));
  return h.digest('hex').slice(0, 10);
}

async function loadPages() {
  const dir = path.join(ROOT, 'build', 'pages');
  const pages = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mjs')).sort()) {
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    const list = Array.isArray(mod.default) ? mod.default : [mod.default];
    pages.push(...list);
  }
  return pages;
}

function checkPage(p) {
  const problems = [];
  if (!p.noindex) {
    if (p.title.length > 60) problems.push(`Title zu lang (${p.title.length}): ${p.title}`);
    if (p.description.length > 155) problems.push(`Description zu lang (${p.description.length})`);
  }
  const h1 = (p.html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${h1} H1-Überschriften`);
  if (problems.length) throw new Error(`Seite /${p.slug}: ${problems.join('; ')}`);
}

export async function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(SRC, OUT);
  // Daten für das Werkzeug: Codelisten und Erklärungen der implementierten Prüfregeln
  const dataOut = path.join(OUT, 'assets', 'data');
  fs.mkdirSync(dataOut, { recursive: true });
  fs.writeFileSync(path.join(dataOut, 'codelisten.json'), JSON.stringify(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'codelisten.json'), 'utf8'))));
  writeToolData(loadRules(), dataOut);
  const assetFiles = listFiles(SRC).filter((f) => !f.endsWith('.template.js'));
  const version = hashFiles(assetFiles);
  const ctx = { version };

  const pages = await loadPages();
  const titles = new Set();
  const descs = new Set();
  for (const p of pages) {
    if (typeof p.html === 'function') p.html = p.html(ctx);
    checkPage(p);
    if (!p.noindex) {
      if (titles.has(p.title)) throw new Error(`Doppelter Title: ${p.title}`);
      if (descs.has(p.description)) throw new Error(`Doppelte Description: ${p.description}`);
      titles.add(p.title);
      descs.add(p.description);
    }
    const html = renderPage(p, ctx);
    const file = p.file ? path.join(OUT, p.file) : path.join(OUT, p.slug, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }

  const indexable = pages.filter((p) => !p.noindex);

  // sitemap.xml
  const urls = indexable.map((p) => `  <url>\n    <loc>${abs(p.slug)}</loc>\n    <lastmod>${p.updated}</lastmod>\n  </url>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

  // llms.txt
  const llms = [
    `# ${SITE_NAME}`,
    '',
    `> ${TAGLINE}. Kostenloses Werkzeug und Ratgeber zur E-Rechnung in Deutschland: XRechnung (UBL und CII) und ZUGFeRD/Factur-X im Browser anzeigen, mit einer Vorprüfung nach den offiziellen KoSIT- und EN-16931-Regeln prüfen und als PDF oder CSV speichern. Alle Dateien werden ausschließlich lokal im Browser verarbeitet.`,
    '',
    'Alle Aussagen zu Pflichten und Fristen sind mit amtlichen Quellen (BMF, UStG, KoSIT) und Stand-Datum belegt. Allgemeine Information, keine Steuer- oder Rechtsberatung.',
    '',
    '## Seiten',
    '',
    ...indexable.map((p) => `- [${p.llmsTitle || p.h1}](${abs(p.slug)}): ${p.llms || p.description}`),
    '',
    '## Quellen',
    '',
    '- [Quellenverzeichnis](https://github.com/freimoser/e-rechnung-klartext/blob/main/quellen.md): alle genutzten amtlichen Quellen mit Version, Link und Abrufdatum',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, 'llms.txt'), llms);

  // Web-App-Manifest
  const manifest = {
    name: SITE_NAME,
    short_name: 'E-Rechnung',
    description: TAGLINE,
    lang: 'de',
    start_url: BASE,
    scope: BASE,
    display: 'standalone',
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: `${BASE}icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: `${BASE}favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
    ],
  };
  fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

  // Service Worker mit Vorab-Cache aller Seiten und Dateien
  const all = listFiles(OUT).filter((f) => !['sw.js', '404.html'].includes(f) && !f.endsWith('.map'));
  const precache = all.map((f) => BASE + f.replace(/(^|\/)index\.html$/, '$1'));
  const swHash = crypto.createHash('sha256');
  for (const f of all.sort()) swHash.update(f).update(fs.readFileSync(path.join(OUT, f)));
  const tpl = fs.readFileSync(path.join(SRC, 'sw.template.js'), 'utf8');
  fs.writeFileSync(path.join(OUT, 'sw.js'), tpl
    .replace('__VERSION__', swHash.digest('hex').slice(0, 12))
    .replace('__BASE__', BASE)
    .replace('__PRECACHE__', JSON.stringify(precache, null, 0)));

  // GitHub Pages soll nichts mit Jekyll umwandeln
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  return { pages, version };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { pages, version } = await build();
  console.log(`Gebaut: ${pages.length} Seiten, Version ${version} → _site/`);
}
