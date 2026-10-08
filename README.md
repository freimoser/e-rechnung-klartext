# E-Rechnung Klartext

**XRechnung und ZUGFeRD öffnen, verstehen und als PDF speichern – ohne Upload.** Kostenloses Werkzeug und Ratgeber zur E-Rechnung in Deutschland: Die Rechnung wird nur im Browser gelesen, angezeigt wie auf Papier, nach den offiziellen Prüfregeln vorgeprüft und auf Wunsch als PDF oder CSV gespeichert.

**Live:** [https://freimoser.github.io/e-rechnung-klartext/](https://freimoser.github.io/e-rechnung-klartext/)  
**Ratgeber:** [Pflicht ab wann?](https://freimoser.github.io/e-rechnung-klartext/e-rechnung-pflicht-ab-wann/) · [XRechnung oder ZUGFeRD](https://freimoser.github.io/e-rechnung-klartext/xrechnung-oder-zugferd/) · [XRechnung in PDF](https://freimoser.github.io/e-rechnung-klartext/xrechnung-in-pdf/) · [ZUGFeRD prüfen](https://freimoser.github.io/e-rechnung-klartext/zugferd-rechnung-pruefen/) · [Fehlercodes](https://freimoser.github.io/e-rechnung-klartext/fehlercodes/) · [Begriffe](https://freimoser.github.io/e-rechnung-klartext/begriffe/)

---

## Was macht dieses Projekt?

| Funktion | Beschreibung |
|----------|--------------|
| **Öffnen** | XRechnung als XML (UBL 2.1 und UN/CEFACT CII), ZUGFeRD/Factur-X als PDF mit eingebetteter XML, mehrere Dateien gleichzeitig, Drag & Drop |
| **Erkennen** | Format, Syntax, XRechnung-Version (auch veraltete), ZUGFeRD-Profil; Bewertung „gilt als E-Rechnung?“ mit Quelle; normale PDFs ohne Daten werden erkannt |
| **Anzeigen** | Rechnung wie auf Papier, Codes (Einheiten, Steuerkategorien, Zahlungsarten …) in Klartext, eingebettete Anhänge einzeln herunterladbar |
| **Vorprüfen** | Summen und Steuer nachrechnen, 201 offizielle Prüfregeln (EN 16931 und XRechnung) mit Erklärung, Zuständigkeit und Link auf das Fehlercode-Verzeichnis – ausdrücklich keine amtliche Validierung |
| **Exportieren** | PDF im Browser erzeugt (mit Hinweis „Ansicht, nicht die Originalrechnung“), Druckansicht, Positionen als CSV (Semikolon, UTF-8 mit BOM) |
| **Rohansicht** | XML eingerückt, mit Suche; Klick auf einen Wert springt zur Stelle im XML |
| **Fehlercodes** | Alle 1.646 Prüfregeln mit offiziellem Text, Erklärung in einfacher Sprache, typischer Ursache und Zuständigkeit, Sprungmarke je Code (z. B. `/fehlercodes/#br-de-15`) |
| **Ratgeber** | Pflicht ab wann, Kleinunternehmer, Privatpersonen, Arztpraxis, XRechnung oder ZUGFeRD, ZUGFeRD prüfen, Peppol, Begriffe – jede Aussage mit Stand und amtlicher Quelle |

**Stand der Vorprüfung:** XRechnung 3.0.2, KoSIT-Regeln (Schematron 2.6.0, Validator-Konfiguration) vom 31.08.2026, CEN-Prüfregeln EN 16931 1.3.16. Die Versionsangaben stehen an einer einzigen Stelle: [`src/assets/js/stand.js`](src/assets/js/stand.js).

---

## Datenschutz

- **100 % im Browser:** Rechnungen werden nicht hochgeladen, nicht gespeichert und nicht an Dritte übertragen.
- **Keine Cookies, kein Tracking, keine externen Schriften oder CDNs.** Alle Bibliotheken und Schriften liegen im Repository.
- **Content-Security-Policy** erlaubt nur Verbindungen zur eigenen Website (`connect-src 'self'`).
- **Offline:** Nach dem ersten Besuch speichert ein Service Worker die Programmdateien (nie Rechnungen); das Werkzeug funktioniert dann ohne Internet.
- Hosting über GitHub Pages; GitHub verarbeitet dabei als Hoster Zugriffsdaten.

---

## Quellen

Alle fachlichen Aussagen beruhen auf amtlichen bzw. offiziellen Quellen (UStG, UStDV, UStAE, BMF-Schreiben, BMF-FAQ, KoSIT, CEN, FeRD, OpenPeppol). Das vollständige Verzeichnis mit Version, Link und Abrufdatum steht in [`quellen.md`](quellen.md); im Code ist es in [`src/assets/js/quellen.js`](src/assets/js/quellen.js) gepflegt.

Die Vorprüfung wurde mit dem offiziellen **KoSIT-Validator 1.6.3** und der XRechnung-Konfiguration vom 31.08.2026 abgeglichen: An den 86 Dateien der KoSIT-Testsuite und den eigenen Testrechnungen meldet sie keine Befunde, die der Validator nicht auch meldet (`tests/kosit-baseline.json`, `tests/kosit.spec.mjs`).

---

## Lizenzen

Eigener Code: **MIT** (siehe [LICENSE](LICENSE)).

Im Repository enthaltene Bibliotheken, Schriften und Daten:

| Bestandteil | Version | Lizenz | Verwendung |
|-------------|---------|--------|------------|
| [pdf-lib](https://github.com/Hopding/pdf-lib) | 1.17.1 | MIT | ZUGFeRD-PDF lesen (eingebettete Dateien), PDF-Export – `src/assets/vendor/pdf-lib.min.js` |
| [@pdf-lib/fontkit](https://github.com/Hopding/fontkit) | 1.1.1 | MIT | Schrift in das PDF einbetten – `src/assets/vendor/fontkit.umd.min.js` |
| [Noto Sans](https://github.com/notofonts/latin-greek-cyrillic) | 2.015 | SIL Open Font License 1.1 | Schrift im PDF-Export (auf Latein, Griechisch, Kyrillisch reduziert) – `src/assets/fonts/` |
| [CEN EN16931 validation artefacts](https://github.com/ConnectingEurope/eInvoicing-EN16931) | 1.3.16 | EUPL 1.2 | Regeltexte und Codelisten (abgeleitet in `data/`) |
| [KoSIT XRechnung-Schematron](https://github.com/itplr-kosit/xrechnung-schematron) | 2.6.0 | Apache-2.0 | Regeltexte (abgeleitet in `data/`) |
| [KoSIT XRechnung Visualization](https://github.com/itplr-kosit/xrechnung-visualization) | 2026-08-31 | Apache-2.0 | Referenz für die Zuordnung UBL/CII zu den Business Terms |
| [KoSIT XRechnung Testsuite](https://github.com/itplr-kosit/xrechnung-testsuite) | 2026-08-31 | Apache-2.0 | Wird nur in den Tests heruntergeladen, nicht im Repository |
| Codelisten aus dem [XRepository](https://www.xrepository.de/) | siehe quellen.md | Lizenzangabe im XRepository leer | Codes und offizielle Namen (abgeleitet in `data/codelisten.json`) |

Nur zum Entwickeln und Testen (nicht auf der Website): Playwright (Apache-2.0), pdf.js / pdfjs-dist (Apache-2.0), axe-core (MPL-2.0), Lighthouse (Apache-2.0, optional).

---

## Schnellstart (lokal)

```bash
git clone https://github.com/freimoser/e-rechnung-klartext.git
cd e-rechnung-klartext
npm ci
npm run build
npm run serve
```

Browser: [http://localhost:8080/e-rechnung-klartext/](http://localhost:8080/e-rechnung-klartext/)

Der lokale Server bildet GitHub Pages nach (Basis-Pfad `/e-rechnung-klartext/`, eigene 404-Seite, gzip).

## Tests

```bash
npm test
```

- Testrechnungen erzeugen (`tests/fixtures/generate.mjs`, alle frei erfunden): XRechnung UBL und CII, ZUGFeRD-PDFs in den Profilen EN 16931, BASIC, EXTENDED, XRECHNUNG, MINIMUM und BASIC WL, normale PDF, Umlaute und Sonderzeichen, mehrere Steuersätze, Anhang, absichtliche Fehler, kaputte XML, 2.000 Positionen
- Werkzeug-Tests, Website-Tests (Links, Sitemap, Metadaten, strukturierte Daten, 360 px, axe), Offline-Test, Abgleich mit dem KoSIT-Validator
- Lighthouse: `npm i --no-save lighthouse@13 && npm run lighthouse` (misst Startseite, /fehlercodes/ und zwei Ratgeber, mobil und Desktop)
- Externe Links: `node tests/check-external.mjs`

## Aufbau

| Pfad | Inhalt |
|------|--------|
| `build/` | Build-Skript, Layout, Seiten (`build/pages/*.mjs`), lokaler Server |
| `src/` | Statische Dateien: CSS, JavaScript des Werkzeugs, Bibliotheken, Schrift, Icons, Beispielrechnungen |
| `data/` | Aus offiziellen Quellen abgeleitete Prüfregeln und Codelisten, Erklärungen |
| `tools/` | Skripte, mit denen `data/`, Icons und `quellen.md` erzeugt wurden |
| `tests/` | Testrechnungen, Playwright-Tests, Lighthouse |
| `.github/workflows/` | Deploy auf GitHub Pages bei Push auf `main`, Tests bei Pull Requests |

Die GitHub-Action baut die Seite mit `node build/build.mjs` (ohne externe Abhängigkeiten) und veröffentlicht `_site/` auf GitHub Pages.

## Hinweis

Allgemeine Information, keine Steuer- oder Rechtsberatung. Die Vorprüfung ersetzt keine amtliche Validierung; verbindlich ist das [KoSIT-Prüftool](https://github.com/itplr-kosit/validator).

## Weitere kostenlose Tools

- [GDT Viewer](https://freimoser.github.io/gdt-viewer/)
- [Easy Photo Editor](https://freimoser.github.io/easy-photo-editor/)
- [Über den Entwickler](https://freimoser.github.io/freimoser.de/)
