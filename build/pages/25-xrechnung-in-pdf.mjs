import { href, abs } from '../site.mjs';
import { src, srcs, ratgeber, UPDATED } from '../content.mjs';

const steps = [
  { name: 'Werkzeug öffnen', text: 'Öffne die Startseite von E-Rechnung Klartext. Das Werkzeug läuft im Browser, du musst nichts installieren.' },
  { name: 'XRechnung hineinziehen', text: 'Ziehe die XML-Datei in das Feld „E-Rechnung hierher ziehen“ oder klicke auf „Datei auswählen“. Die Datei wird nur in deinem Browser gelesen und nicht hochgeladen.' },
  { name: 'Rechnung kontrollieren', text: 'Du siehst die Rechnung wie auf Papier: Absender, Empfänger, Positionen, Summen, Steuer und Bankverbindung. Die Vorprüfung zeigt, ob Summen und Pflichtangaben stimmen.' },
  { name: 'Als PDF speichern', text: 'Klicke auf „Als PDF speichern“. Das PDF wird im Browser erzeugt, enthält alle Positionen und trägt auf jeder Seite den Hinweis, dass es eine Ansicht und nicht die Originalrechnung ist.' },
  { name: 'Oder drucken', text: 'Mit „Drucken“ öffnet sich die Druckansicht deines Browsers. Gedruckt wird nur die Rechnung, ohne Menüs und Hinweise.' },
  { name: 'Original aufbewahren', text: 'Lege die ursprüngliche XML-Datei unverändert ab. Sie ist die Rechnung; das PDF ist nur eine lesbare Kopie.' },
];

const faq = [
  { q: 'Ist das erzeugte PDF eine gültige Rechnung?', a: 'Nein. Rechtlich ist die XML-Datei die Rechnung. Das PDF ist eine lesbare Darstellung zur Ansicht und zum Weiterreichen im Haus. Aufbewahren musst du die E-Rechnung in ihrem empfangenen Format.', src: [['ustae', 'Abschnitt 14b.1 Abs. 1 Satz 2 und 4'], ['bmf2025', 'Rn. 60']] },
  { q: 'Muss ich eine E-Rechnung überhaupt ausdrucken oder als PDF ablegen?', a: 'Nein. Eine zusätzliche menschenlesbare Fassung ist nicht erforderlich. Ein PDF ist nur eine Hilfe zum Lesen.', src: [['ustae', 'Abschnitt 14.4 Abs. 3']] },
  { q: 'Gibt es auch einen Viewer der Finanzverwaltung?', a: 'Ja. Das BMF nennt den E-Rechnungs-Viewer im ELSTER-Portal; daneben gibt es kostenfreie Angebote privater Anbieter.', src: [['bmfFaq', 'Frage 12a']] },
  { q: 'Funktioniert das auch mit ZUGFeRD-Rechnungen?', a: 'Ja. Eine ZUGFeRD-Rechnung ist schon eine PDF, maßgeblich sind aber die eingebetteten XML-Daten. Das Werkzeug zeigt die XML-Daten an, so wie es das BMF empfiehlt, und kann daraus ebenfalls ein PDF erzeugen.', src: [['bmfFaq', 'Frage 12a']] },
  { q: 'Werden Umlaute und Sonderzeichen richtig dargestellt?', a: 'Ja. Das PDF bettet eine Schrift mit lateinischen, griechischen und kyrillischen Zeichen ein (Noto Sans, freie Lizenz), also auch Umlaute, ß, €, Ł oder č.' },
];

const sections = `        <h2 id="anleitung">Schritt für Schritt: XRechnung als PDF speichern</h2>
        <ol>
          ${steps.map((s) => `<li><strong>${s.name}:</strong> ${s.text}</li>`).join('\n          ')}
        </ol>
        <p>Zum Werkzeug: <a href="${href('')}">E-Rechnung kostenlos öffnen</a>. Zum Ausprobieren gibt es dort Beispielrechnungen.</p>

        <h2 id="warum">Warum eine XRechnung unleserlich aussieht</h2>
        <p>Eine XRechnung besteht nur aus Daten im XML-Format. Sie dient in erster Linie der maschinellen Verarbeitung; für Menschen wird sie erst durch eine Visualisierungsanwendung lesbar. Öffnest du sie direkt im Editor oder Browser, siehst du nur verschachtelte Einträge wie <code>&lt;cbc:PayableAmount&gt;</code>. Ein Viewer übersetzt diese Felder in eine Rechnung, wie du sie kennst, und Codes wie <code>C62</code> oder <code>58</code> in Klartext („Stück“, „SEPA-Überweisung“).</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 13 Satz 3–5'], ['bmfFaq', 'Frage 12a'])}</p>

        <h2 id="original">PDF oder XML: Was du aufbewahren musst</h2>
        <p>Rechnungen sind acht Jahre aufzubewahren, und zwar grundsätzlich im empfangenen Format. Bei einer E-Rechnung muss zumindest der strukturierte Teil unversehrt in seiner ursprünglichen Form vorliegen. Das selbst erzeugte PDF ersetzt die XML-Datei deshalb nicht. Speichere beides, wenn das PDF für dich praktisch ist, aber gib für Buchhaltung und Archiv immer die Original-Datei weiter.</p>
        <p>${srcs(['ustg14b', 'Abs. 1'], ['ustae', 'Abschnitt 14b.1 Abs. 1'], ['bmf2025', 'Rn. 60'])}</p>

        <h2 id="csv">Positionen nach Excel übernehmen</h2>
        <p>Mit „Positionen als CSV“ erhältst du alle Positionen als Tabelle: Semikolon als Trennzeichen, Komma als Dezimalzeichen und UTF-8 mit Kennung, damit Excel Umlaute richtig anzeigt. Das ist praktisch für Vergleiche mit Bestellungen oder Lieferscheinen.</p>

        <h2 id="probleme">Wenn etwas nicht klappt</h2>
        <ul>
          <li><strong>„Die XML-Datei ist beschädigt“:</strong> Die Datei ist unvollständig oder keine XML. Bitte den Absender um eine neue Datei.</li>
          <li><strong>„Keine bekannte Rechnung“:</strong> Die Datei ist XML, aber keine Rechnung nach UBL oder CII, zum Beispiel ein Lieferavis.</li>
          <li><strong>Fehler in der Vorprüfung:</strong> Was ein Code wie BR-CO-10 bedeutet, steht unter <a href="${href('fehlercodes/')}">Fehlercodes</a>.</li>
          <li><strong>Normale PDF statt E-Rechnung:</strong> Das Werkzeug erkennt PDFs ohne eingebettete Daten. Mehr dazu unter <a href="${href('zugferd-rechnung-pruefen/')}">ZUGFeRD-Rechnung prüfen</a>.</li>
        </ul>`;

export default {
  slug: 'xrechnung-in-pdf/',
  kind: 'ratgeber',
  title: 'XRechnung in PDF umwandeln und drucken: Anleitung',
  description: 'XRechnung in PDF umwandeln und drucken: Schritt für Schritt im Browser, ohne Upload. Mit Hinweis, warum das Original-XML aufbewahrt werden muss.',
  h1: 'XRechnung in PDF umwandeln und drucken',
  llms: 'Anleitung: XRechnung (XML) im Browser lesbar machen, als PDF speichern, drucken oder Positionen als CSV exportieren; warum das PDF die Original-XML nicht ersetzt (Aufbewahrung im empfangenen Format).',
  crumbs: [{ slug: 'xrechnung-in-pdf/', label: 'XRechnung in PDF' }],
  updated: UPDATED,
  faq,
  jsonld: [{
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'XRechnung in PDF umwandeln und drucken',
    description: 'XRechnung im Browser öffnen, prüfen und als PDF speichern oder drucken – ohne Upload.',
    inLanguage: 'de-DE',
    totalTime: 'PT2M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
    tool: [{ '@type': 'HowToTool', name: 'Webbrowser' }],
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text, url: abs('xrechnung-in-pdf/') + '#anleitung' })),
  }],
  html: () => ratgeber({
    h1: 'XRechnung in PDF umwandeln und drucken',
    answer: 'Eine XRechnung wandelst du in ein PDF um, indem du die XML-Datei in einen Viewer lädst und dort „Als PDF speichern“ oder „Drucken“ wählst. Das geht kostenlos hier im Browser, ohne Upload. Wichtig: Das PDF ist nur eine Ansicht – aufbewahren musst du die Original-XML.',
    answerSrc: [['ustae', 'Abschnitt 14b.1 Abs. 1'], ['bmf2025', 'Rn. 60']],
    tocItems: [['anleitung', 'Schritt-für-Schritt-Anleitung'], ['warum', 'Warum XRechnungen unleserlich aussehen'], ['original', 'PDF oder XML aufbewahren?'], ['csv', 'Positionen nach Excel'], ['probleme', 'Wenn etwas nicht klappt'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    ctaTitle: 'XRechnung jetzt als PDF speichern',
    ctaText: 'Datei hineinziehen, prüfen, als PDF speichern oder drucken. Alles bleibt in deinem Browser.',
    relatedSlugs: ['xrechnung-oder-zugferd/', 'zugferd-rechnung-pruefen/', 'fehlercodes/', 'e-rechnung-kleinunternehmer/'],
  }),
};
