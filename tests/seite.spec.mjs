// Tests der Website: Links, Sitemap, Metadaten, strukturierte Daten, Darstellung, Barrierefreiheit.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sitemapUrls, localPath, openFiles } from './helpers.mjs';

const SITE = 'https://freimoser.github.io/e-rechnung-klartext/';
const urls = sitemapUrls();
const VERIFY = '6pYvtFCnU7UFcQFajtMSkQ7tYMy3Z_Bt7teKiT5yKNg';

test('Sitemap enthält alle 13 indexierbaren Seiten mit lastmod', async ({ request }) => {
  expect(urls).toHaveLength(13);
  const xml = await (await request.get('sitemap.xml')).text();
  expect((xml.match(/<lastmod>2026-\d\d-\d\d<\/lastmod>/g) || []).length).toBe(13);
  for (const u of urls) expect(u.startsWith(SITE) && u.endsWith('/')).toBe(true);
});

test('Alle internen Links und Sitemap-Einträge liefern 200', async ({ page, request }) => {
  const seen = new Set();
  const queue = urls.map(localPath);
  const failed = [];
  while (queue.length) {
    const p = queue.shift();
    const abs = new URL(p, 'http://localhost/e-rechnung-klartext/').pathname;
    if (seen.has(abs)) continue;
    seen.add(abs);
    let res = await request.get(abs, { maxRedirects: 0 }).catch(() => null);
    if (!res) res = await request.get(abs, { maxRedirects: 0 });
    if (res.status() !== 200) { failed.push(`${abs} → ${res.status()}`); continue; }
    if (!(res.headers()['content-type'] || '').includes('text/html')) continue;
    await page.goto(abs);
    const links = await page.$$eval('a[href], link[href], script[src], img[src]', (els) => els.map((e) => e.getAttribute('href') || e.getAttribute('src')));
    for (const l of links) {
      if (!l || /^(https?:|mailto:|#|blob:|data:)/.test(l)) continue;
      queue.push(new URL(l.split('#')[0].split('?')[0], 'http://localhost' + abs).pathname);
    }
  }
  expect(failed).toEqual([]);
  expect(seen.size).toBeGreaterThan(20);
});

test('Unbekannte Adressen zeigen die eigene 404-Seite mit Links', async ({ page }) => {
  const res = await page.goto('gibt-es-nicht/');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Seite nicht gefunden');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('main a.card-link')).toHaveCount(10);
});

for (const url of urls) {
  const p = localPath(url);
  test(`Metadaten und Aufbau: ${p}`, async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(p);
    const title = await page.title();
    expect(title.length).toBeLessThanOrEqual(60);
    const desc = await page.getAttribute('meta[name="description"]', 'content');
    expect(desc.length).toBeLessThanOrEqual(155);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
    await expect(page.locator('meta[name="google-site-verification"]')).toHaveAttribute('content', VERIFY);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', url);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', SITE + 'og-image.png');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    // Impressum und Datenschutz im Fußbereich
    await expect(page.locator('footer a[href$="/impressum/"]')).toHaveCount(1);
    await expect(page.locator('footer a[href$="/datenschutz/"]')).toHaveCount(1);
    // Strukturierte Daten gültig und passend
    const lds = (await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent))).map((t) => JSON.parse(t));
    const types = lds.map((l) => l['@type']);
    if (p !== './') expect(types).toContain('BreadcrumbList');
    const faqs = await page.locator('.faq details, .qa article').count();
    if (faqs) {
      const faq = lds.find((l) => l['@type'] === 'FAQPage');
      expect(faq, 'FAQPage fehlt').toBeTruthy();
      for (const q of faq.mainEntity) await expect(page.getByText(q.name, { exact: true }).first()).toBeVisible();
    }
    if (/xrechnung-in-pdf|zugferd-rechnung-pruefen/.test(p)) expect(types).toContain('HowTo');
    if (/begriffe|fehlercodes/.test(p)) expect(types).toContain('DefinedTermSet');
    if (p === './') { expect(types).toContain('WebApplication'); expect(types).toContain('WebSite'); }
    const ratgeber = /xrechnung-oder|xrechnung-in-pdf|zugferd-rechnung|pflicht|kleinunternehmer|privatperson|arztpraxis|peppol/.test(p);
    if (ratgeber) {
      const art = lds.find((l) => l['@type'] === 'Article');
      expect(art.dateModified).toMatch(/^2026-/);
      await expect(page.locator('.legal-note')).toContainText('Allgemeine Information, keine Steuer- oder Rechtsberatung');
      await expect(page.locator('.answer')).toBeVisible();
      await expect(page.locator('.cta-box a[href="/e-rechnung-klartext/"]')).toHaveCount(1);
      const internal = await page.locator('article.prose a[href^="/e-rechnung-klartext/"]').count();
      expect(internal).toBeGreaterThanOrEqual(3);
      expect(await page.locator('.source').count()).toBeGreaterThan(2);
    }
    // keine Bilder ohne Alternativtext, keine Inline-Styles (CSP)
    expect(await page.locator('img:not([alt])').count()).toBe(0);
    expect(errors).toEqual([]);
  });

  test(`360 px ohne seitliches Scrollen: ${p}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(p);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(w).toBeLessThanOrEqual(360);
  });

  test(`Barrierefreiheit (axe): ${p}`, async ({ page }) => {
    await page.goto(p);
    // Bei /fehlercodes/ sind die 1.340 Syntaxregeln gleich aufgebaut wie die fachlichen; geprüft werden diese
    let axe = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
    if (p.includes('fehlercodes')) axe = axe.exclude('tbody[data-group="ubl"]').exclude('tbody[data-group="cii"]');
    const res = await axe.analyze();
    expect(res.violations.map((v) => `${v.id}: ${v.nodes.length}× ${v.nodes[0].target}`)).toEqual([]);
  });
}

test('Titel und Beschreibungen sind auf allen Seiten eindeutig', async ({ page }) => {
  const titles = new Set();
  const descs = new Set();
  for (const u of urls) {
    await page.goto(localPath(u));
    titles.add(await page.title());
    descs.add(await page.getAttribute('meta[name="description"]', 'content'));
  }
  expect(titles.size).toBe(urls.length);
  expect(descs.size).toBe(urls.length);
});

test('Rechnungsansicht bei 360 px ohne seitliches Scrollen und axe-konform', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openFiles(page, ['umlaute-sonderzeichen.xml']);
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(w).toBeLessThanOrEqual(360);
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(res.violations.map((v) => `${v.id}: ${v.nodes[0].target}`)).toEqual([]);
});

test('Fehlercodes: Sprungmarke und Suche', async ({ page }) => {
  await page.goto('fehlercodes/#br-de-15');
  await expect(page.locator('tr#br-de-15')).toBeVisible();
  await expect(page.locator('tr#br-de-15')).toContainText('Leitweg-ID');
  await expect(page.locator('#br-1')).toHaveCount(1); // Kurzform ohne führende Null
  await page.fill('#code-filter', 'BR-CO-10');
  await expect(page.locator('#code-count')).toHaveText(/^\d+ Treffer$/);
  await expect(page.locator('tr#br-co-10')).toBeVisible();
  await expect(page.locator('tr#br-01')).toBeHidden();
  expect(await page.locator('.rules-table tr[id]').count()).toBe(1646);
});

test('Nach dem ersten Laden auch offline nutzbar', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await new Promise((r) => setTimeout(r, 1800));
    const reg = await navigator.serviceWorker.ready;
    return !!reg.active;
  });
  await page.waitForFunction(async () => (await caches.keys()).length > 0 && (await (await caches.open((await caches.keys())[0])).keys()).length > 20);
  await context.setOffline(true);
  await page.reload();
  await page.click('[data-sample="beispiel-zugferd-en16931.pdf"]');
  await expect(page.locator('#result .facts')).toContainText('EN 16931');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="pdf"]')]);
  expect(dl.suggestedFilename()).toMatch(/ansicht\.pdf$/);
  await context.setOffline(false);
});
