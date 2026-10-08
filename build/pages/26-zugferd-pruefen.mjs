import { href, abs, esc } from '../site.mjs';
import { src, srcs, ratgeber, UPDATED } from '../content.mjs';
import { Q } from '../../src/assets/js/quellen.js';
import { STAND } from '../../src/assets/js/stand.js';

const steps = [
  { name: 'PDF in einen Viewer laden', text: 'Ziehe die ZUGFeRD-PDF in das Werkzeug. Es liest die eingebettete XML-Datei aus, ohne dass die Datei deinen Rechner verlässt.' },
  { name: 'Eingebettete Rechnungsdaten finden', text: 'Steht bei „Format“ der Hinweis „eingebettet als factur-x.xml“ (oder xrechnung.xml), enthält die PDF strukturierte Rechnungsdaten. Fehlt die XML, ist es eine normale PDF und keine E-Rechnung.' },
  { name: 'Profil und Version ablesen', text: 'Das Werkzeug zeigt das Profil (BASIC, EN 16931, EXTENDED, XRECHNUNG, MINIMUM oder BASIC WL) und bewertet, ob es als E-Rechnung gilt.' },
  { name: 'Vorprüfung ansehen', text: 'Die Vorprüfung rechnet Summen und Steuer nach und prüft die häufigsten Regeln der EN 16931. Jeder Befund nennt den offiziellen Fehlercode.' },
  { name: 'Sichtteil mit den Daten vergleichen', text: 'Maßgeblich sind die XML-Daten. Weicht das PDF-Bild davon ab, gelten die Daten aus der XML.' },
  { name: 'Bei Bedarf offiziell validieren', text: 'Für eine verbindliche Prüfung speicherst du die eingebettete XML und prüfst sie mit dem KoSIT-Validator.' },
];

const faq = [
  { q: 'Woran erkenne ich, ob eine PDF eine ZUGFeRD-Rechnung ist?', a: 'An der eingebetteten XML-Datei. Nach FeRD ist pro PDF genau ein Rechnungsdatendokument zulässig, bezeichnet als „factur-x.xml“ bzw. „xrechnung.xml“. Eine PDF ohne eingebettete Daten ist eine sonstige Rechnung.', src: [['ferdFaq', 'Aufbau'], ['ustae', 'Abschnitt 14.1 Abs. 2 Satz 4']] },
  { q: 'Muss ich eine ZUGFeRD-Rechnung validieren?', a: 'Nein, eine Validierung ist laut BMF keine Voraussetzung für die steuerliche Anerkennung. Sie ist aber sinnvoll, und wer bei Sorgfalt eines ordentlichen Kaufmanns validiert, darf sich auf das technische Ergebnis verlassen. Den Prüfbericht aufzubewahren bietet sich an.', src: [['bmfFaq', 'Frage 7'], ['bmf2025', 'Rn. 35a']] },
  { q: 'Was gilt, wenn PDF und XML unterschiedliche Beträge zeigen?', a: 'Dann gelten die Daten aus dem strukturierten Teil, also der XML. Vorsteuer kann nur aus dem strukturierten Teil gezogen werden.', src: [['ustae', 'Abschnitt 14.4 Abs. 3'], ['bmfFaq', 'Frage 12a']] },
  { q: 'Muss die PDF im Format PDF/A-3 sein?', a: 'Laut FeRD sollte sie es sein. Technische Fehler beim PDF/A-Standard sind nach FeRD aber nur als Warnung zu beachten; der Empfänger kann eine korrigierte Fassung anfordern.', src: [['ferdFaq', 'PDF/A-3']] },
  { q: 'Gilt ZUGFeRD 1.0 noch als E-Rechnung?', a: 'Nein. Als E-Rechnung anerkannt ist ZUGFeRD erst ab Version 2.0.1.', src: [['ustae', 'Abschnitt 14.1 Abs. 14'], ['ferdFaq', 'ZUGFeRD 1.0']] },
];

const sections = `        <h2 id="merkmale">Merkmale einer gültigen ZUGFeRD-Rechnung</h2>
        <ul>
          <li><strong>Eingebettete XML-Datei</strong> in der PDF, bei ZUGFeRD/Factur-X „factur-x.xml“ bzw. im Profil XRECHNUNG „xrechnung.xml“. ${src('ferdFaq', 'Aufbau')}</li>
          <li><strong>Version 2.0.1 oder neuer</strong>; aktuell ist ZUGFeRD 2.5.2 (entspricht Factur-X 1.09.2). ${srcs(['ustae', 'Abschnitt 14.1 Abs. 14'], ['ferdZf252'])}</li>
          <li><strong>Profil ab BASIC</strong>: MINIMUM und BASIC-WL gelten nicht als E-Rechnung. ${src('ustae', 'Abschnitt 14.1 Abs. 14')}</li>
          <li><strong>Alle Pflichtangaben im XML</strong>: Ein bloßer Verweis auf eine Anlage genügt nicht. ${src('bmfFaq', 'Frage 7a')}</li>
          <li><strong>PDF/A-3</strong> als Sichtteil wird von FeRD vorgesehen; Fehler dort gelten als Warnung. ${src('ferdFaq', 'PDF/A-3')}</li>
        </ul>

        <h2 id="profile">Die Profile im Überblick</h2>
        <div class="table-scroll">
          <table>
            <caption>Profile nach FeRD; Kennung (BT-24) laut den offiziellen ZUGFeRD-Beispielrechnungen 2.5.2 bzw. der XRechnung-Spezifikation. * Die Kennungen von MINIMUM und BASIC WL stehen in der ZUGFeRD-Spezifikation, die FeRD nur gegen Angabe von Kontaktdaten abgibt; sie sind hier deshalb nicht aufgeführt. Stand 08.10.2026.</caption>
            <thead><tr><th scope="col">Profil</th><th scope="col">Inhalt</th><th scope="col">Gilt als E-Rechnung</th><th scope="col">Kennung im XML (BT-24)</th></tr></thead>
            <tbody>
              <tr><th scope="row">MINIMUM</th><td>Nur Kopfdaten und Gesamtbeträge, keine Positionen, keine Steueraufschlüsselung; Buchungshilfe</td><td>Nein</td><td>nur in der Spezifikation*</td></tr>
              <tr><th scope="row">BASIC WL</th><td>Alle Angaben zur Buchung auf Dokumentebene, keine Positionen; Buchungshilfe</td><td>Nein</td><td>nur in der Spezifikation*</td></tr>
              <tr><th scope="row">BASIC</th><td>Untermenge der EN 16931 für einfache Rechnungen</td><td>Ja; Empfang nach Absprache</td><td><code>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</code></td></tr>
              <tr><th scope="row">EN 16931 (COMFORT)</th><td>Bildet die EN 16931 vollständig ab</td><td>Ja</td><td><code>urn:cen.eu:en16931:2017</code></td></tr>
              <tr><th scope="row">EXTENDED</th><td>Erweiterung für komplexe Abläufe (z. B. mehrere Lieferorte)</td><td>Ja; Empfang nach Absprache</td><td><code>urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended</code></td></tr>
              <tr><th scope="row">XRECHNUNG</th><td>Referenzprofil: XRechnung (nur CII) in der PDF</td><td>Ja</td><td><code>${esc(STAND.xrechnung.kennung)}</code></td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['ferdFaq', 'Profile'], ['ferdBeispiele'], ['xrSpez', 'BT-24'], ['ustae', 'Abschnitt 14.1 Abs. 14'])}</p>

        <h2 id="anleitung">So prüfst du eine ZUGFeRD-Rechnung</h2>
        <ol>
          ${steps.map((s) => `<li><strong>${s.name}:</strong> ${s.text}</li>`).join('\n          ')}
        </ol>
        <p>Das BMF empfiehlt bei hybriden Rechnungen ausdrücklich, den XML-Teil selbst sichtbar zu machen, weil er bei Abweichungen maßgeblich ist. Genau das macht das <a href="${href('')}">Werkzeug</a>. Das offizielle Prüfwerkzeug der KoSIT ist der <a href="${Q.kositValidator.url}">KoSIT-Validator</a>; er prüft die XML-Datei.</p>
        <p>${srcs(['bmfFaq', 'Frage 12a'], ['kositValidator'])}</p>

        <h2 id="fehler">Häufige Probleme bei ZUGFeRD-Rechnungen</h2>
        <ul>
          <li><strong>Normale PDF</strong> ohne eingebettete XML: keine E-Rechnung. Bitte den Absender um eine E-Rechnung, wenn für die Rechnung die Pflicht gilt (siehe <a href="${href('e-rechnung-pflicht-ab-wann/')}">Pflicht ab wann?</a>).</li>
          <li><strong>Profil MINIMUM oder BASIC WL</strong>: Die Datei ist nur eine Buchungshilfe.</li>
          <li><strong>Summen in der XML weichen vom PDF ab</strong>: Es gilt die XML; die Vorprüfung zeigt die nachgerechneten Beträge.</li>
          <li><strong>Fehlercodes</strong> wie BR-CO-10 oder BR-S-08 bei der Validierung: Erklärungen unter <a href="${href('fehlercodes/')}">Fehlercodes</a>.</li>
        </ul>`;

export default {
  slug: 'zugferd-rechnung-pruefen/',
  kind: 'ratgeber',
  title: 'ZUGFeRD-Rechnung prüfen: Profil, Version, Fehler finden',
  description: 'ZUGFeRD Rechnung prüfen: eingebettete XML finden, Profil und Version erkennen, Summen nachrechnen. Welche Profile als E-Rechnung gelten – mit Quellen.',
  h1: 'ZUGFeRD-Rechnung prüfen',
  llms: 'Wie man eine ZUGFeRD-/Factur-X-Rechnung prüft: eingebettete factur-x.xml, Version ab 2.0.1, Profile (MINIMUM und BASIC WL keine E-Rechnung), Kennungen BT-24, XML maßgeblich, Validierung; Schritt-für-Schritt-Anleitung.',
  crumbs: [{ slug: 'zugferd-rechnung-pruefen/', label: 'ZUGFeRD prüfen' }],
  updated: UPDATED,
  faq,
  jsonld: [{
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'ZUGFeRD-Rechnung prüfen',
    description: 'ZUGFeRD-PDF öffnen, eingebettete XML finden, Profil und Version prüfen und die Rechnung vorprüfen.',
    inLanguage: 'de-DE',
    totalTime: 'PT3M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
    tool: [{ '@type': 'HowToTool', name: 'Webbrowser' }],
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text, url: abs('zugferd-rechnung-pruefen/') + '#anleitung' })),
  }],
  html: () => ratgeber({
    h1: 'ZUGFeRD-Rechnung prüfen',
    answer: 'Eine gültige ZUGFeRD-Rechnung ist eine PDF mit eingebetteter XML-Datei in Version 2.0.1 oder neuer und in einem Profil ab BASIC; MINIMUM und BASIC-WL gelten nicht als E-Rechnung. Prüfen kannst du das, indem du die PDF in einen Viewer lädst, der die XML ausliest, Profil und Version anzeigt und Summen sowie Pflichtangaben nachrechnet.',
    tocItems: [['merkmale', 'Merkmale einer gültigen ZUGFeRD-Rechnung'], ['profile', 'Die Profile im Überblick'], ['anleitung', 'So prüfst du'], ['fehler', 'Häufige Probleme'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    ctaTitle: 'ZUGFeRD-PDF jetzt prüfen',
    ctaText: 'PDF hineinziehen: Das Werkzeug zeigt eingebettete XML, Profil, Version und die Vorprüfung. Nichts wird hochgeladen.',
    relatedSlugs: ['xrechnung-oder-zugferd/', 'fehlercodes/', 'xrechnung-in-pdf/', 'begriffe/'],
  }),
};
