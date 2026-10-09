// Erzeugt Favicons, App-Icons und das Vorschaubild aus favicon.svg (einmalig, Ergebnis liegt im Repo).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const SRC = path.resolve('src');
const svg = fs.readFileSync(path.join(SRC, 'favicon.svg'), 'utf8');
// Vollflächige Variante ohne Rundung für Apple und maskierbare Icons (Motiv in der sicheren Zone)
const square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="0.45" stop-color="#3b82f6"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs><rect width="32" height="32" fill="url(#g)"/><g transform="translate(16 16) scale(0.78) translate(-16 -16)"><path d="M9.5 5.5h9l5 5v15a1.5 1.5 0 0 1-1.5 1.5h-12.5a1.5 1.5 0 0 1-1.5-1.5v-18.5a1.5 1.5 0 0 1 1.5-1.5z" fill="#fff"/><path d="M18.5 5.5v3.5a1.5 1.5 0 0 0 1.5 1.5h3.5" fill="#bfdbfe"/><rect x="11" y="13.5" width="6.5" height="2" rx="1" fill="#1d4ed8"/><rect x="11" y="17.5" width="10" height="2" rx="1" fill="#93c5fd"/><rect x="11" y="21.5" width="10" height="2" rx="1" fill="#93c5fd"/></g></svg>`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();

async function render(markup, size, file, transparent = true) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${markup.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  const buf = await page.screenshot({ omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
  if (file) fs.writeFileSync(path.join(SRC, file), buf);
  return buf;
}

const p16 = await render(svg, 16, 'favicon-16.png');
const p32 = await render(svg, 32, 'favicon-32.png');
const p48 = await render(svg, 48, 'favicon-48.png');
await render(square, 180, 'apple-touch-icon.png', false);
await render(svg, 192, 'icon-192.png');
await render(square, 512, 'icon-512.png', false);

// ICO mit eingebetteten PNGs (16, 32, 48)
const imgs = [[16, p16], [32, p32], [48, p48]];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(imgs.length, 4);
const dir = Buffer.alloc(16 * imgs.length);
let offset = 6 + dir.length;
imgs.forEach(([s, b], i) => {
  const o = i * 16;
  dir.writeUInt8(s, o); dir.writeUInt8(s, o + 1); dir.writeUInt8(0, o + 2); dir.writeUInt8(0, o + 3);
  dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
  dir.writeUInt32LE(b.length, o + 8); dir.writeUInt32LE(offset, o + 12);
  offset += b.length;
});
fs.writeFileSync(path.join(SRC, 'favicon.ico'), Buffer.concat([header, dir, ...imgs.map((x) => x[1])]));

// Vorschaubild 1200 × 630 im Familien-Design
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<html><head><style>
body{margin:0;width:1200px;height:630px;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;color:#e8eef4;
background:radial-gradient(ellipse 80% 60% at 30% -10%,rgba(59,130,246,.35),transparent),#0f1419;display:flex;align-items:center}
.wrap{display:flex;gap:56px;align-items:center;padding:0 72px}
.logo{width:96px;height:96px}
h1{font-size:64px;margin:18px 0 10px;letter-spacing:-.02em}
p{font-size:28px;color:#b8c4d2;margin:0 0 28px;line-height:1.35;max-width:640px}
.pills{display:flex;flex-wrap:wrap;gap:12px;max-width:660px}
.pill{font-size:22px;font-weight:600;padding:10px 18px;border-radius:999px;background:rgba(59,130,246,.18);color:#93c5fd}
.paper{width:330px;height:430px;background:#fff;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,.5);padding:28px;box-sizing:border-box;color:#1b1f24}
.paper .t{font-size:24px;font-weight:700;margin-bottom:18px}.row{height:12px;border-radius:6px;background:#e5e9ef;margin:10px 0}
.row.b{background:#93c5fd;width:60%}.row.s{width:45%}.sum{margin-top:26px;border-top:2px solid #1b1f24;padding-top:12px;font-weight:700;font-size:20px;display:flex;justify-content:space-between}
</style></head><body><div class="wrap"><div>${svg.replace('<svg ', '<svg class="logo" ')}
<h1>E-Rechnung Klartext</h1><p>XRechnung und ZUGFeRD öffnen, verstehen und als PDF speichern – ohne Upload</p>
<div class="pills"><span class="pill">XRechnung UBL &amp; CII</span><span class="pill">ZUGFeRD / Factur-X</span><span class="pill">Fehlercodes erklärt</span><span class="pill">100 % lokal</span></div></div>
<div class="paper"><div class="t">Rechnung</div><div class="row b"></div><div class="row"></div><div class="row s"></div><div class="row"></div><div class="row"></div><div class="row s"></div><div class="row"></div><div class="row"></div><div class="sum"><span>Gesamt</span><span>1.190,00 €</span></div></div></div></body></html>`);
fs.writeFileSync(path.join(SRC, 'og-image.png'), await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } }));
await browser.close();
console.log('Icons und Vorschaubild erzeugt.');
