import { href, abs, esc, SITE_NAME, TAGLINE } from '../site.mjs';
import { src, srcs, UPDATED, dateDE } from '../content.mjs';
import { STAND, standSatz } from '../../src/assets/js/stand.js';
import { Q } from '../../src/assets/js/quellen.js';

const faq = [
  {
    q: 'Ab wann muss ich E-Rechnungen empfangen können?',
    a: 'Seit dem 1. Januar 2025 müssen alle Unternehmen in Deutschland E-Rechnungen empfangen können, ohne Übergangsfrist. Dafür reicht ein E-Mail-Postfach.',
    src: srcs(['ustae', 'Abschnitt 14.1 Abs. 5'], ['bmfFaq', 'Frage 8 und 12']),
    link: ['e-rechnung-pflicht-ab-wann/', 'Zeitplan der E-Rechnungspflicht'],
  },
  {
    q: 'Ab wann muss ich selbst E-Rechnungen schreiben?',
    a: 'Für Rechnungen an andere Unternehmen spätestens für Umsätze ab dem 1. Januar 2028. Bis Ende 2026 sind noch Papier oder – mit Zustimmung – andere Formate erlaubt; für 2027 gilt das nur noch bei höchstens 800.000 Euro Vorjahresumsatz.',
    src: src('ustg27', '§ 27 Abs. 38 Nr. 1 und 2'),
    link: ['e-rechnung-pflicht-ab-wann/', 'Alle Fristen im Überblick'],
  },
  {
    q: 'Ist eine PDF-Rechnung eine E-Rechnung?',
    a: 'Eine normale PDF nicht. Eine E-Rechnung braucht ein strukturiertes Format nach der Norm EN 16931, etwa XRechnung oder ZUGFeRD ab Version 2.0.1 – ohne die Profile MINIMUM und BASIC-WL.',
    src: src('ustae', 'Abschnitt 14.1 Abs. 2 und 14'),
    link: ['xrechnung-oder-zugferd/', 'XRechnung oder ZUGFeRD?'],
  },
  {
    q: 'Wie öffne ich eine XRechnung?',
    a: 'Eine XRechnung ist eine XML-Datei, die man mit einem Viewer lesbar macht. Ziehe sie oben in das Werkzeug: Du siehst die Rechnung wie auf Papier und kannst sie als PDF speichern. Auch die Finanzverwaltung nennt einen eigenen Viewer.',
    src: src('bmfFaq', 'Frage 12a'),
    link: ['xrechnung-in-pdf/', 'XRechnung als PDF speichern'],
  },
  {
    q: 'Muss ich die XML-Datei aufbewahren?',
    a: 'Ja. Rechnungen sind acht Jahre aufzubewahren, und bei einer E-Rechnung muss der strukturierte Teil unverändert in seiner ursprünglichen Form vorliegen. Ein PDF-Ausdruck ersetzt die XML-Datei nicht.',
    src: srcs(['ustg14b', '§ 14b Abs. 1'], ['bmf2025', 'Rn. 60']),
    link: ['xrechnung-in-pdf/', 'Was beim Speichern zu beachten ist'],
  },
];

const html = () => `      <section class="hero" aria-labelledby="seitentitel">
        <h1 id="seitentitel">E-Rechnung kostenlos öffnen – XRechnung und ZUGFeRD ohne Upload</h1>
        <p class="lead">Datei hineinziehen und die Rechnung lesen wie auf Papier. Dazu eine Vorprüfung nach den offiziellen Regeln, Fehlercodes in normaler Sprache und Export als PDF oder CSV.</p>
        <p class="stand-line">${esc(standSatz())}. <a href="${Q.xrVersionen.url}">Quelle: KoSIT</a> · <a href="${href('fehlercodes/')}">Was die Fehlercodes bedeuten</a></p>
      </section>

      <section class="tool" aria-label="Werkzeug zum Öffnen von E-Rechnungen">
        <div id="dropzone" class="dropzone no-print">
          <div class="dropzone-inner">
            <div class="drop-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" stroke-linecap="round"/></svg>
            </div>
            <p class="drop-title">E-Rechnung hierher ziehen</p>
            <p class="drop-sub">XRechnung als XML (UBL oder CII) oder ZUGFeRD/Factur-X als PDF · auch mehrere Dateien</p>
            <input type="file" id="file-input" class="visually-hidden" accept=".xml,.pdf,application/xml,text/xml,application/pdf" multiple tabindex="-1" aria-hidden="true">
            <button type="button" class="btn btn-primary" id="file-button">Datei auswählen</button>
            <div class="privacy-note">
              <strong>Deine Rechnung bleibt auf deinem Rechner. Es wird nichts hochgeladen.</strong>
              Die Datei wird nur in deinem Browser gelesen. Es gibt keinen Server, keine Cookies und kein Tracking.
              <details>
                <summary>So prüfst du das selbst</summary>
                <ol>
                  <li>Öffne die Entwicklerwerkzeuge deines Browsers (Taste F12) und dort den Reiter „Netzwerk“. Wenn du eine Rechnung öffnest, wird keine Datei an einen Server geschickt.</li>
                  <li>Oder: Lade diese Seite einmal, trenne dann die Internetverbindung und öffne eine Rechnung. Es funktioniert weiter.</li>
                  <li>Technisch verbietet die Sicherheitsrichtlinie der Seite (Content-Security-Policy) Verbindungen zu fremden Servern. Der Quellcode ist offen auf GitHub.</li>
                </ol>
              </details>
            </div>
          </div>
        </div>

        <div class="samples no-print">
          <h2>Ausprobieren mit Beispielrechnungen</h2>
          <p>Alle Beispiele sind frei erfunden. Namen, Adressen und Bankdaten gehören niemandem.</p>
          <div class="sample-buttons">
            <button type="button" class="btn btn-ghost" data-sample="beispiel-xrechnung-ubl.xml">XRechnung (UBL)</button>
            <button type="button" class="btn btn-ghost" data-sample="beispiel-xrechnung-cii.xml">XRechnung (CII)</button>
            <button type="button" class="btn btn-ghost" data-sample="beispiel-zugferd-en16931.pdf">ZUGFeRD-PDF</button>
            <button type="button" class="btn btn-ghost" data-sample="beispiel-mit-fehlern.xml">Rechnung mit Fehlern</button>
          </div>
        </div>

        <p id="status" class="visually-hidden" role="status" aria-live="polite"></p>
        <div id="files" class="file-tabs hidden no-print" role="tablist" aria-label="Geöffnete Dateien"></div>
        <div id="result" class="tool hidden"></div>
        <noscript><div class="notice is-warn"><p>Das Werkzeug braucht JavaScript, weil die Rechnung nur in deinem Browser gelesen wird. Die Ratgeber funktionieren auch ohne.</p></div></noscript>
      </section>

      <section class="home-faq" aria-labelledby="fragen">
        <h2 id="fragen">Die fünf wichtigsten Fragen zur E-Rechnung</h2>
        <div class="qa">
          ${faq.map((f) => `<article>
            <h3>${esc(f.q)}</h3>
            <p>${f.a}</p>
            <p>${f.src}</p>
            <p><a href="${href(f.link[0])}">${esc(f.link[1])}</a></p>
          </article>`).join('\n          ')}
        </div>
      </section>

      <section class="home-faq" aria-labelledby="ratgeber">
        <h2 id="ratgeber">Ratgeber</h2>
        <div class="card-grid">
          <a class="card-link" href="${href('e-rechnung-arztpraxis/')}"><h3>E-Rechnung in der Arztpraxis</h3><p>Arzt-, Zahnarzt- und Tierarztpraxen: was beim Empfangen und Ausstellen gilt.</p></a>
          <a class="card-link" href="${href('e-rechnung-kleinunternehmer/')}"><h3>Kleinunternehmer</h3><p>Empfangen ja, ausstellen nein: die Regeln für § 19 UStG.</p></a>
          <a class="card-link" href="${href('e-rechnung-privatperson/')}"><h3>Privatpersonen</h3><p>Warum es für Privatkunden keine Pflicht gibt.</p></a>
          <a class="card-link" href="${href('zugferd-rechnung-pruefen/')}"><h3>ZUGFeRD-Rechnung prüfen</h3><p>Profile erkennen und gültige ZUGFeRD-Rechnungen von normalen PDFs unterscheiden.</p></a>
          <a class="card-link" href="${href('fehlercodes/')}"><h3>Fehlercodes erklärt</h3><p>BR-DE-15, BR-CO-10 und alle anderen Prüfregeln in einfacher Sprache.</p></a>
          <a class="card-link" href="${href('peppol/')}"><h3>Peppol</h3><p>Was das Netzwerk ist und ob du es brauchst.</p></a>
        </div>
      </section>`;

export default {
  slug: '',
  kind: 'tool',
  wide: true,
  title: 'E-Rechnung kostenlos öffnen: XRechnung & ZUGFeRD ohne Upload',
  description: 'E-Rechnung kostenlos öffnen: XRechnung online ohne Upload anzeigen, ZUGFeRD prüfen, Fehlercodes verstehen und als PDF speichern. Alles bleibt im Browser.',
  h1: 'E-Rechnung kostenlos öffnen – XRechnung und ZUGFeRD ohne Upload',
  llmsTitle: 'Werkzeug: E-Rechnung kostenlos öffnen',
  llms: 'Werkzeug im Browser: XRechnung (UBL/CII) und ZUGFeRD/Factur-X öffnen, Format und Profil erkennen, Vorprüfung nach KoSIT- und EN-16931-Regeln, Export als PDF und CSV, ohne Upload.',
  updated: UPDATED,
  scripts: ['assets/js/app.js'],
  faq: faq.map((f) => ({ q: f.q, a: f.a })),
  jsonld: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: abs(''),
      description: `${TAGLINE}. Vorprüfung nach XRechnung ${STAND.xrechnung.version} und den KoSIT-Regeln vom ${dateDE(STAND.kosit.schematronVom)}.`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Alle (Browser)',
      browserRequirements: 'Benötigt JavaScript',
      inLanguage: 'de-DE',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      featureList: [
        'XRechnung in UBL und CII öffnen',
        'ZUGFeRD und Factur-X aus PDF auslesen, Profil erkennen',
        'Rechnungsansicht wie auf Papier, Codes in Klartext',
        'Vorprüfung nach offiziellen KoSIT- und EN-16931-Prüfregeln',
        'Summen und Umsatzsteuer nachrechnen',
        'Export als PDF, Druckansicht und CSV',
        'Rohansicht des XML mit Suche',
        'Keine Datei verlässt den Rechner',
      ],
      author: { '@type': 'Person', name: 'S. Thomas Freimoser', url: 'https://freimoser.github.io/freimoser.de/' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: abs(''),
      inLanguage: 'de-DE',
      description: TAGLINE,
    },
  ],
  html,
};
