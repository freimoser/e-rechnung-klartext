import { href } from '../site.mjs';
import { srcs, ratgeber } from '../content.mjs';

const faq = [
  { q: 'Muss ich als privater Vermieter E-Rechnungen empfangen können?', a: 'Ja. Wer Wohnungen vermietet, ist umsatzsteuerlich Unternehmer, auch wenn die Vermietung steuerfrei ist. Du musst E-Rechnungen deshalb empfangen können, etwa vom Handwerker; ein E-Mail-Postfach genügt.', src: [['ustae', 'Abschnitt 14.1 Abs. 5'], ['bmfFaq', 'Frage 3']] },
  { q: 'Muss ich meinen Mietern E-Rechnungen schicken?', a: 'In der Regel nein. Die Vermietung von Wohnungen ist steuerfrei, und für steuerfreie Vermietungen besteht keine Pflicht, überhaupt eine Rechnung auszustellen. Anders ist es, wenn du an ein Unternehmen vermietest und auf die Steuerbefreiung verzichtet hast.', src: [['ustg4', 'Nr. 12'], ['ustg14', 'Abs. 2 Satz 2'], ['bmfFaq', 'Frage 4']] },
  { q: 'Ich vermiete Gewerberäume mit Umsatzsteuer. Brauche ich jeden Monat eine E-Rechnung?', a: 'Nein. Bei einem Mietverhältnis genügt eine einmalige E-Rechnung für den ersten Zeitraum, in die der Mietvertrag eingebettet ist oder aus der klar hervorgeht, dass es eine Dauerrechnung ist. Ändern sich die Rechnungsangaben, etwa bei einer Mieterhöhung, ist eine neue E-Rechnung nötig.', src: [['ustae', 'Abschnitt 14.1 Abs. 19 Satz 1 und 3, Abschnitt 14.5 Abs. 17 Satz 4 und 5']] },
  { q: 'Mein Mietvertrag dient bisher als Rechnung. Muss ich ihn ersetzen?', a: 'Nicht, solange sich die Rechnungsangaben nicht ändern. Für eine zulässigerweise als sonstige Rechnung erteilte Dauerrechnung musst du keine zusätzliche E-Rechnung ausstellen.', src: [['ustae', 'Abschnitt 14.1 Abs. 19 Satz 4']] },
  { q: 'Ich vermiete eine Ferienwohnung. Was gilt?', a: 'Die kurzfristige Beherbergung ist nicht steuerfrei. Übernachtet ein Unternehmer für sein Unternehmen, etwa auf Geschäftsreise, gelten für deine Rechnung die allgemeinen Regeln zur E-Rechnung, es sei denn, du bist Kleinunternehmer oder der Betrag liegt bei höchstens 250 Euro.', src: [['ustg4', 'Nr. 12 Satz 2'], ['ustg14', 'Abs. 2 Satz 2 Nr. 1'], ['ustdv33', 'Satz 4'], ['ustdv34a', 'Satz 4']] },
];

const sections = `        <h2 id="ueberblick">Überblick: Was für Vermieter gilt</h2>
        <div class="table-scroll">
          <table>
            <caption>Vermietung von Grundstücken und Wohnungen im Inland.</caption>
            <thead><tr><th scope="col">Situation</th><th scope="col">Was gilt</th><th scope="col">Rechtsgrundlage</th></tr></thead>
            <tbody>
              <tr><th scope="row">E-Rechnungen empfangen, z. B. vom Handwerker</th><td>Ja, seit 1. Januar 2025; ein E-Mail-Postfach genügt</td><td>Abschnitt 14.1 Abs. 5 UStAE</td></tr>
              <tr><th scope="row">Wohnung langfristig vermieten (steuerfrei)</th><td>Keine Rechnungspflicht, also auch keine E-Rechnungspflicht</td><td>§ 4 Nr. 12, § 14 Abs. 2 Satz 2 UStG</td></tr>
              <tr><th scope="row">An ein Unternehmen mit Umsatzsteuer vermieten (Verzicht nach § 9 UStG)</th><td>E-Rechnung für die Miete, mit den Übergangsregeln bis Ende 2027</td><td>§ 9, § 14 Abs. 2 Satz 2 Nr. 1, § 27 Abs. 38 UStG</td></tr>
              <tr><th scope="row">Mietverhältnis mit E-Rechnungspflicht</th><td>Einmalige E-Rechnung als Dauerrechnung genügt; neue E-Rechnung, wenn sich die Angaben ändern</td><td>Abschnitt 14.1 Abs. 19, 14.5 Abs. 17 UStAE</td></tr>
              <tr><th scope="row">Ferienwohnung, Gast reist geschäftlich</th><td>Nicht steuerfrei; Rechnung an das Unternehmen grundsätzlich als E-Rechnung</td><td>§ 4 Nr. 12 Satz 2, § 14 Abs. 2 Satz 2 Nr. 1 UStG</td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 5 und 19'], ['ustg4', 'Nr. 12'], ['ustg9', 'Abs. 1 und 2'], ['ustg14', 'Abs. 2 Satz 2'])}</p>

        <h2 id="empfangen">Empfangen: auch private Vermieter</h2>
        <p>Wer Wohnungen vermietet, ist umsatzsteuerlich Unternehmer, auch wenn die Mieten steuerfrei sind und keine Umsatzsteuer anfällt. Seit dem 1. Januar 2025 musst du deshalb E-Rechnungen empfangen können, zum Beispiel von Handwerkern, Hausverwaltungen oder Versorgern, die für das Mietobjekt abrechnen. Ein normales E-Mail-Postfach genügt; zum Lesen reicht ein Viewer wie <a href="${href('')}">dieses Werkzeug</a>. Wie das im Alltag geht, steht unter <a href="${href('e-rechnung-empfangen/')}">E-Rechnung empfangen</a>.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 5'], ['bmfFaq', 'Frage 3 und 12'])}</p>

        <h2 id="wohnung">Wohnungsmiete: keine E-Rechnung nötig</h2>
        <p>Die Vermietung von Grundstücken und Wohnungen ist steuerfrei. Für steuerfreie Vermietungen besteht keine Pflicht, eine Rechnung auszustellen, und damit auch keine Pflicht zur E-Rechnung. Das gilt für Wohnungsmieter genauso wie für die meisten gewerblichen Mieter, solange du nicht auf die Steuerbefreiung verzichtest.</p>
        <p>Nicht steuerfrei sind unter anderem die kurzfristige Beherbergung, etwa in einer Ferienwohnung, und die Vermietung von Stellplätzen für Fahrzeuge.</p>
        <p>${srcs(['ustg4', 'Nr. 12'], ['ustg14', 'Abs. 2 Satz 2'], ['bmfFaq', 'Frage 4'])}</p>

        <h2 id="option">Miete mit Umsatzsteuer: Dauerrechnung als E-Rechnung</h2>
        <p>Vermietest du an ein Unternehmen, das die Räume ausschließlich für Umsätze nutzt, die den Vorsteuerabzug nicht ausschließen, kannst du auf die Steuerbefreiung verzichten und Umsatzsteuer berechnen. Dann ist die Miete eine Leistung an einen anderen Unternehmer für dessen Unternehmen, und es gelten die Regeln zur E-Rechnung mit den <a href="${href('e-rechnung-pflicht-ab-wann/')}">Übergangsregeln bis Ende 2027</a>.</p>
        <ul>
          <li><strong>Einmal statt monatlich:</strong> Bei einem Mietverhältnis genügt eine einmalige E-Rechnung für den ersten Zeitraum, in die der Mietvertrag eingebettet ist oder aus der klar hervorgeht, dass es sich um eine Dauerrechnung handelt.</li>
          <li><strong>Änderungen:</strong> Ändern sich die Rechnungsangaben, zum Beispiel bei einer Mieterhöhung, ist eine neue E-Rechnung nötig.</li>
          <li><strong>Bestehende Verträge:</strong> Für eine zulässigerweise als sonstige Rechnung erteilte Dauerrechnung musst du keine zusätzliche E-Rechnung ausstellen, solange sich die Angaben nicht ändern.</li>
          <li><strong>Rechnungsnummer:</strong> Es genügt eine einmalige Nummer aus dem Vertrag, etwa die Wohnungs-, Objekt- oder Mieternummer; sie muss im strukturierten Teil stehen.</li>
        </ul>
        <p>${srcs(['ustg9', 'Abs. 1 und 2'], ['ustae', 'Abschnitt 14.1 Abs. 19, 14.5 Abs. 12 und 17'])}</p>

        <h2 id="aufbewahren">Rechnungen aufbewahren</h2>
        <p>Auch als Vermieter bewahrst du erhaltene E-Rechnungen acht Jahre auf, und zwar die Original-Datei. Ein ausgedrucktes PDF ersetzt sie nicht. Einzelheiten unter <a href="${href('e-rechnung-aufbewahren/')}">E-Rechnung aufbewahren</a>.</p>
        <p>${srcs(['ustg14b', 'Abs. 1'], ['ustae', 'Abschnitt 14b.1 Abs. 1 Satz 2 und 4'])}</p>`;

export default {
  slug: 'e-rechnung-vermieter/',
  kind: 'ratgeber',
  title: 'E-Rechnung Vermieter: empfangen ja, ausstellen meist nicht',
  description: 'E-Rechnung für Vermieter: Empfang seit 2025 Pflicht, auch privat. Wohnungsmiete ohne E-Rechnung, Gewerbemiete mit Option als Dauerrechnung – mit Quellen.',
  h1: 'E-Rechnung für Vermieter',
  llms: 'Was Vermieter zur E-Rechnung wissen müssen: Empfang seit 01.01.2025 Pflicht (auch private Vermieter sind Unternehmer), steuerfreie Wohnungsmiete ohne Rechnungspflicht (§ 4 Nr. 12 UStG), Gewerbemiete mit Option (§ 9 UStG) als E-Rechnung, Dauerrechnung (Abschnitt 14.1 Abs. 19 UStAE), Ferienwohnung.',
  crumbs: [{ slug: 'e-rechnung-vermieter/', label: 'Vermieter' }],
  published: '2026-11-25',
  updated: '2026-11-25',
  faq,
  html: () => ratgeber({
    h1: 'E-Rechnung für Vermieter',
    answer: 'Vermieter müssen E-Rechnungen seit dem 1. Januar 2025 <strong>empfangen</strong> können, auch private Vermieter. Für die Wohnungsmiete selbst ist <strong>keine</strong> E-Rechnung nötig, weil sie steuerfrei ist. Eine E-Rechnung brauchst du nur, wenn du an ein Unternehmen mit Umsatzsteuer vermietest; dann genügt eine einmalige Dauerrechnung.',
    answerSrc: [['ustae', 'Abschnitt 14.1 Abs. 5 und 19'], ['ustg4', 'Nr. 12'], ['bmfFaq', 'Frage 3 und 4']],
    tocItems: [['ueberblick', 'Überblick als Tabelle'], ['empfangen', 'Empfangen'], ['wohnung', 'Wohnungsmiete'], ['option', 'Miete mit Umsatzsteuer'], ['aufbewahren', 'Aufbewahren'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    relatedSlugs: ['e-rechnung-empfangen/', 'e-rechnung-aufbewahren/', 'e-rechnung-pflicht-ab-wann/', 'e-rechnung-kleinunternehmer/'],
  }),
};
