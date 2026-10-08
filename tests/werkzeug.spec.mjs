// Tests des Werkzeugs mit selbst erzeugten Testrechnungen (tests/fixtures/out).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { openFiles, fixture, pdfText, downloadBytes } from './helpers.mjs';

const result = (page) => page.locator('#result');
const findingIds = async (page) => page.locator('.finding h3 a').allTextContents();

test.describe('Gültige Rechnungen', () => {
  for (const [file, syntax] of [['xrechnung-ubl.xml', 'UBL 2.1'], ['xrechnung-cii.xml', 'UN/CEFACT CII']]) {
    test(`XRechnung ${syntax} wird erkannt, angezeigt und ohne Befund geprüft`, async ({ page }) => {
      await openFiles(page, [file]);
      const r = result(page);
      await expect(r.locator('.fact').first()).toContainText('XRechnung 3.0.x');
      await expect(r.locator('.fact').first()).toContainText(syntax);
      await expect(r.locator('.fact').nth(1)).toContainText('Ja');
      await expect(r.locator('.fact').nth(2)).toContainText('keine Fehler gefunden');
      expect(await findingIds(page)).toEqual([]);
      await expect(r.locator('.notice.is-ok')).toContainText('keine Fehler und keine Warnungen');
      await expect(r.locator('.stand-line')).toContainText('Geprüft nach XRechnung 3.0.2, KoSIT-Regeln vom 31.08.2026');
      await expect(r.locator('.disclaimer')).toContainText('Vorprüfung, keine amtliche Validierung');
      const paper = r.locator('.paper');
      await expect(paper).toContainText('Musterfirma Labordienst Beispiel GmbH');
      await expect(paper).toContainText('Tierarztpraxis Dr. Max Mustermann (erfunden)');
      await expect(paper.locator('.lines-table tbody tr')).toHaveCount(3);
      await expect(paper).toContainText('237,41');
      await expect(paper).toContainText('SEPA-Überweisung');
      await expect(paper).toContainText('DE79 0000 0000 1234 5678 90');
      await expect(paper).toContainText('Stunde');
      // Nachgerechnet: alle Zeilen stimmen
      await expect(r.locator('.badge-error')).toHaveCount(0);
    });
  }

  test('Umlaute und Sonderzeichen werden korrekt angezeigt', async ({ page }) => {
    await openFiles(page, ['umlaute-sonderzeichen.xml']);
    const paper = result(page).locator('.paper');
    await expect(paper).toContainText('Größenwahn & Söhne Prüflabor GmbH (erfunden)');
    await expect(paper).toContainText('Äußere Weißenburger Straße 5');
    await expect(paper).toContainText('Łucja Kowalczyk');
    await expect(paper).toContainText('Prüfung „Härtegrad“ – Größe XL (Ø 12 mm)');
    await expect(paper).toContainText('Straßenkehrmaschine Ölwechsel <Spezial>');
    await expect(paper).toContainText('ẞ é è ñ č ř ő');
    expect(await findingIds(page)).toEqual([]);
  });

  test('Mehrere Steuersätze und steuerbefreite Position', async ({ page }) => {
    await openFiles(page, ['mehrere-steuersaetze.xml']);
    const paper = result(page).locator('.paper');
    await expect(paper).toContainText('Umsatzsteuer 7 %');
    await expect(paper).toContainText('Umsatzsteuer 19 %');
    await expect(paper).toContainText('Steuerbefreit');
    await expect(paper).toContainText('Steuerfrei nach § 4 Nr. 21 UStG');
    await expect(paper).toContainText('Treuerabatt');
    expect(await findingIds(page)).toEqual([]);
  });

  for (const file of ['mit-anhang.xml', 'mit-anhang-cii.xml']) {
    test(`Eingebetteter Anhang lässt sich herunterladen (${file})`, async ({ page }) => {
      await openFiles(page, [file]);
      const btn = result(page).locator('[data-action="download-embedded"]');
      await expect(btn).toContainText('leistungsnachweis.pdf');
      const [dl] = await Promise.all([page.waitForEvent('download'), btn.click()]);
      expect(dl.suggestedFilename()).toBe('leistungsnachweis.pdf');
      const bytes = await downloadBytes(dl);
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
      expect(await findingIds(page)).toEqual([]);
    });
  }
});

test.describe('Fehlerhafte Dateien', () => {
  test('Vorprüfung findet falsche Summe und fehlende Pflichtangaben (UBL)', async ({ page }) => {
    await openFiles(page, ['fehlerhaft.xml']);
    const ids = await findingIds(page);
    // Gleiche Codes wie der offizielle KoSIT-Validator (tests/kosit-baseline.json)
    expect(ids.sort()).toEqual(['BR-CO-10', 'BR-CO-13', 'BR-DE-15', 'BR-DE-27', 'BR-DE-6'].sort());
    await expect(result(page).locator('.fact').nth(2)).toContainText('4 Fehler, 1 Warnung');
    await expect(result(page).locator('.finding').first()).toContainText('Wer muss es beheben?');
    await expect(result(page).locator('a[href$="fehlercodes/#br-co-10"]')).toHaveCount(1);
    await expect(result(page).locator('.badge-error', { hasText: 'weicht ab' }).first()).toBeVisible();
  });

  test('Vorprüfung findet fehlende Käuferreferenz und Prozesskennung (CII)', async ({ page }) => {
    await openFiles(page, ['fehlerhaft-cii.xml']);
    const ids = await findingIds(page);
    expect(ids).toContain('BR-DE-15');
    expect(ids).toContain('PEPPOL-EN16931-R001');
  });

  test('Kaputte XML wird freundlich erklärt', async ({ page }) => {
    await openFiles(page, ['kaputt.xml']);
    await expect(result(page)).toContainText('Die XML-Datei ist beschädigt');
  });

  test('Normale PDF ohne Rechnungsdaten ist keine E-Rechnung', async ({ page }) => {
    await openFiles(page, ['normale-rechnung.pdf']);
    await expect(result(page)).toContainText('Das ist eine normale PDF, keine E-Rechnung');
    await expect(result(page).locator('.source a')).toHaveAttribute('href', /Umsatzsteuer-Anwendungserlass/);
  });
});

test.describe('ZUGFeRD / Factur-X', () => {
  const cases = [
    ['zugferd-en16931.pdf', 'EN 16931 (COMFORT)', 'Ja'],
    ['zugferd-basic.pdf', 'BASIC', 'Ja'],
    ['zugferd-extended.pdf', 'EXTENDED', 'Ja'],
    ['zugferd-xrechnung.pdf', 'XRECHNUNG', 'Ja'],
    ['zugferd-minimum.pdf', 'MINIMUM', 'Nein'],
    ['zugferd-basicwl.pdf', 'BASIC WL', 'Nein'],
  ];
  for (const [file, profile, ok] of cases) {
    test(`${file}: Profil ${profile}, gilt als E-Rechnung: ${ok}`, async ({ page }) => {
      await openFiles(page, [file]);
      const r = result(page);
      await expect(r.locator('.fact').first()).toContainText(`Profil ${profile}`);
      await expect(r.locator('.fact').first()).toContainText('eingebettet als');
      await expect(r.locator('.fact').nth(1).locator('.value')).toHaveText(ok);
      if (ok === 'Ja') expect(await findingIds(page)).toEqual([]);
      else await expect(r.locator('.fact').nth(1)).toContainText('gilt laut BMF nicht als E-Rechnung');
    });
  }

  test('Eingebettete XML und weitere Anhänge lassen sich speichern', async ({ page }) => {
    await openFiles(page, ['zugferd-mit-anhang.pdf']);
    const r = result(page);
    await expect(r.locator('.paper')).toContainText('leistungsnachweis.pdf');
    const [xml] = await Promise.all([page.waitForEvent('download'), r.locator('[data-action="xml"]').click()]);
    expect(xml.suggestedFilename()).toBe('factur-x.xml');
    expect((await downloadBytes(xml)).toString()).toContain('CrossIndustryInvoice');
    const [att] = await Promise.all([page.waitForEvent('download'), r.locator('[data-action="download-pdf-attachment"]').click()]);
    expect(att.suggestedFilename()).toBe('leistungsnachweis.pdf');
  });
});

test.describe('Export', () => {
  test('PDF enthält alle Positionen, Summen, Umlaute und den Ansichtshinweis', async ({ page }) => {
    await openFiles(page, ['umlaute-sonderzeichen.xml']);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="pdf"]')]);
    expect(dl.suggestedFilename()).toBe('umlaute-sonderzeichen-ansicht.pdf');
    const { text } = await pdfText(await downloadBytes(dl));
    const flat = text.replace(/\s+/g, ' ');
    for (const s of ['Größenwahn & Söhne Prüflabor GmbH', 'Äußere Weißenburger Straße 5', 'Łucja Kowalczyk', 'Prüfung „Härtegrad“ – Größe XL', 'Straßenkehrmaschine Ölwechsel <Spezial>', '99,98', '120,00', '219,98', '41,80', '261,78', 'Erzeugt aus E-Rechnung „umlaute-sonderzeichen.xml“', 'Ansicht, nicht die Originalrechnung']) {
      expect(flat, s).toContain(s);
    }
  });

  test('CSV ist Excel-tauglich (Semikolon, UTF-8 mit BOM, Dezimalkomma)', async ({ page }) => {
    await openFiles(page, ['mehrere-steuersaetze.xml']);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="csv"]')]);
    const bytes = await downloadBytes(dl);
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const lines = bytes.toString('utf8').slice(1).trim().split('\r\n');
    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain('Position;Artikelnummer;Bezeichnung');
    expect(lines[1]).toContain('Futtermittel Spezialdiät');
    expect(lines[1]).toContain(';12,90;');
    expect(lines[1]).toContain(';51,60;EUR');
  });

  test('Druckansicht zeigt nur die Rechnung', async ({ page }) => {
    await openFiles(page, ['xrechnung-ubl.xml']);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.site-nav')).toBeHidden();
    await expect(page.locator('#pruefung')).toBeHidden();
    await expect(page.locator('.paper')).toBeVisible();
  });
});

test.describe('Große Rechnung', () => {
  test('2.000 Positionen: Browser bleibt bedienbar, PDF und CSV vollständig', async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() => {
      window.__long = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long = Math.max(window.__long, e.duration); }).observe({ type: 'longtask', buffered: true });
    });
    const t0 = Date.now();
    await page.setInputFiles('#file-input', fixture('gross-2000.xml'));
    await page.waitForSelector('.paper');
    const openMs = Date.now() - t0;
    expect(openMs).toBeLessThan(8000);
    await expect(page.locator('.lines-table tbody tr')).toHaveCount(200);
    await page.click('[data-action="all-lines"]');
    await expect(page.locator('.lines-table tbody tr')).toHaveCount(2000);
    const longest = await page.evaluate(() => window.__long);
    expect(longest, 'längste Blockade des Browsers in ms').toBeLessThan(2500);
    expect(await findingIds(page)).toEqual([]);

    const [csv] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="csv"]')]);
    expect((await downloadBytes(csv)).toString('utf8').trim().split('\r\n')).toHaveLength(2001);

    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-action="pdf"]')]);
    const { text, pages } = await pdfText(await downloadBytes(dl));
    expect(pages).toBeGreaterThan(20);
    const flat = text.replace(/\s+/g, ' ');
    for (const n of [1, 2, 999, 1500, 2000]) expect(flat).toContain(`Laborparameter Nr. ${n} – Ölprobe`);
    const count = (flat.match(/Laborparameter Nr\. \d+ – Ölprobe/g) || []).length;
    expect(count).toBe(2000);
  });
});

test.describe('Bedienung', () => {
  test('Mehrere Dateien gleichzeitig öffnen und wechseln', async ({ page }) => {
    await openFiles(page, ['xrechnung-ubl.xml', 'zugferd-basic.pdf', 'fehlerhaft.xml']);
    await expect(page.locator('.file-tab')).toHaveCount(3);
    await page.locator('.file-tab', { hasText: 'fehlerhaft.xml' }).click();
    await expect(result(page).locator('.result-head h2')).toHaveText('fehlerhaft.xml');
    await page.click('[data-action="close"]');
    await expect(page.locator('.file-tab')).toHaveCount(2);
  });

  test('Beispielrechnungen laden mit einem Klick', async ({ page }) => {
    await page.goto('./');
    for (const [btn, text] of [['beispiel-xrechnung-ubl.xml', 'XRechnung 3.0.x'], ['beispiel-zugferd-en16931.pdf', 'EN 16931'], ['beispiel-mit-fehlern.xml', 'Fehler']]) {
      await page.click(`[data-sample="${btn}"]`);
      await expect(result(page).locator('.result-head h2')).toHaveText(btn);
      await expect(result(page).locator('.facts')).toContainText(text);
    }
  });

  test('Rohansicht: Suche und Sprung aus der Rechnungsansicht ins XML', async ({ page }) => {
    await openFiles(page, ['xrechnung-ubl.xml']);
    await page.locator('#roh summary').click();
    await page.fill('#raw-search', 'PayableAmount');
    await expect(page.locator('#raw-status')).toContainText('Treffer 1 von 1');
    await page.locator('.paper .xref', { hasText: 'RE-2026-0815' }).first().click();
    await expect(page.locator('.raw-line.is-target')).toContainText('<cbc:ID>RE-2026-0815</cbc:ID>');
    // Sprung aus einem Prüfbefund
    await openFiles(page, ['fehlerhaft.xml']);
    await page.locator('.finding').first().locator('[data-jump]').click();
    await expect(page.locator('.raw-line.is-target')).toContainText('<cbc:LineExtensionAmount currencyID="EUR">209.50</cbc:LineExtensionAmount>');
  });

  test('Datei-Knopf ist per Tastatur erreichbar und öffnet die Dateiauswahl', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.locator('#file-button').focus();
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.keyboard.press('Enter')]);
    expect(chooser.isMultiple()).toBe(true);
    await chooser.setFiles(fixture('xrechnung-cii.xml'));
    await expect(result(page).locator('.result-head h2')).toHaveText('xrechnung-cii.xml');
  });

  test('Es werden keine Daten an fremde Server geschickt', async ({ page }) => {
    const requests = [];
    page.on('request', (r) => requests.push(r.url()));
    await openFiles(page, ['zugferd-en16931.pdf']);
    await Promise.all([page.waitForEvent('download'), page.click('[data-action="pdf"]')]);
    const foreign = requests.filter((u) => !u.startsWith('http://localhost:') && !u.startsWith('blob:') && !u.startsWith('data:'));
    expect(foreign).toEqual([]);
    expect(requests.some((u) => /\.(xml|pdf)$/.test(u) && u.includes('fixtures'))).toBe(false);
  });
});
