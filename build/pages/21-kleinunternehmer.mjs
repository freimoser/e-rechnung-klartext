import { href } from '../site.mjs';
import { src, srcs, ratgeber, UPDATED } from '../content.mjs';

const faq = [
  { q: 'Muss ich als Kleinunternehmer E-Rechnungen empfangen können?', a: 'Ja. Die Pflicht, E-Rechnungen empfangen zu können, gilt auch für Kleinunternehmer. Ein E-Mail-Postfach genügt.', src: [['ustae', 'Abschnitt 14.1 Abs. 5 Satz 2 und 3']] },
  { q: 'Muss ich als Kleinunternehmer E-Rechnungen schreiben?', a: 'Nach dem Umsatzsteuerrecht nicht: Rechnungen von Kleinunternehmern dürfen dort immer als sonstige Rechnung übermittelt werden, also auf Papier oder als einfache PDF. Anders bei Rechnungen an Bundesbehörden: Die E-Rechnungsverordnung verlangt grundsätzlich eine elektronische Rechnung, auch von Kleinunternehmern.', src: [['ustdv34a', 'Satz 4'], ['erechv3', 'Abs. 1 und 3']] },
  { q: 'Darf ich trotzdem freiwillig E-Rechnungen schicken?', a: 'Ja. An andere inländische Unternehmen geht das auch ohne deren Zustimmung. An Privatpersonen braucht eine E-Rechnung die Zustimmung des Empfängers.', src: [['ustae', 'Abschnitt 14.1 Abs. 6 Satz 4 und 5']] },
  { q: 'Was passiert, wenn ich die Kleinunternehmergrenze überschreite?', a: 'Wer zur Regelbesteuerung wechselt, muss ab diesem Zeitpunkt unter den übrigen Voraussetzungen auch E-Rechnungen ausstellen – mit den allgemeinen Übergangsregeln bis Ende 2027.', src: [['bmfFaq', 'Frage 4'], ['ustg27', 'Abs. 38']] },
  { q: 'Wie kennzeichne ich in einer XRechnung, dass ich Kleinunternehmer bin?', a: 'Laut KoSIT mit der Steuerkategorie E, Steuersatz 0, Steuerbetrag 0 und dem Hinweistext „Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG“ als Befreiungsgrund und als weitere rechtliche Angabe.', src: [['xrSpez', 'Kapitel 13.3']] },
];

const sections = `        <h2 id="ueberblick">Überblick: Was für Kleinunternehmer gilt</h2>
        <div class="table-scroll">
          <table>
            <caption>Kleinunternehmer nach § 19 UStG im Inland.</caption>
            <thead><tr><th scope="col">Frage</th><th scope="col">Antwort</th><th scope="col">Rechtsgrundlage</th></tr></thead>
            <tbody>
              <tr><th scope="row">E-Rechnungen empfangen</th><td>Ja, seit 1. Januar 2025 (E-Mail-Postfach genügt)</td><td>Abschnitt 14.1 Abs. 5 UStAE</td></tr>
              <tr><th scope="row">E-Rechnungen ausstellen</th><td>Nach dem UStG nein, sonstige Rechnung (Papier, PDF) ist immer erlaubt</td><td>§ 34a Satz 4 UStDV</td></tr>
              <tr><th scope="row">Rechnungen an Bundesbehörden</th><td>Grundsätzlich elektronisch, in der Regel als XRechnung; Ausnahme u. a. Direktaufträge bis 1.000 Euro</td><td>§§ 3 und 4 ERechV</td></tr>
              <tr><th scope="row">Freiwillig E-Rechnung an Unternehmen</th><td>Erlaubt, ohne Zustimmung des Empfängers</td><td>Abschnitt 14.1 Abs. 6 Satz 4 UStAE</td></tr>
              <tr><th scope="row">Freiwillig E-Rechnung an Privatpersonen</th><td>Nur mit Zustimmung des Empfängers</td><td>Abschnitt 14.1 Abs. 6 Satz 5 UStAE</td></tr>
              <tr><th scope="row">Wechsel zur Regelbesteuerung</th><td>Ab dann gelten die allgemeinen Regeln zur E-Rechnung</td><td>BMF-FAQ, Frage 4</td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 5 und 6'], ['ustdv34a', 'Satz 4'], ['erechv3', 'Abs. 1 und 3'], ['bmfFaq', 'Frage 4'])}</p>

        <h2 id="wer">Wer ist Kleinunternehmer?</h2>
        <p>Kleinunternehmer im Sinne des Umsatzsteuergesetzes ist, wer im Inland ansässig ist und dessen Gesamtumsatz im vorangegangenen Kalenderjahr <strong>25.000 Euro</strong> nicht überschritten hat und im laufenden Kalenderjahr <strong>100.000 Euro</strong> nicht überschreitet. Seine Umsätze sind dann steuerfrei; er weist keine Umsatzsteuer aus.</p>
        <p>${src('ustg19', 'Abs. 1 Satz 1')}</p>

        <h2 id="empfangen">Empfangen: Was du brauchst</h2>
        <p>Auch als Kleinunternehmer bekommst du von Lieferanten künftig E-Rechnungen, etwa vom Großhandel, vom Software-Anbieter oder vom Steuerberater. Du musst sie annehmen können; eine Papier- oder PDF-Rechnung kannst du nicht verlangen, wenn der Lieferant zur E-Rechnung verpflichtet ist. Dafür reicht ein E-Mail-Postfach. Zum Lesen der XML-Datei genügt ein Viewer, zum Beispiel <a href="${href('')}">dieses Werkzeug</a>. Bewahre die Original-Datei acht Jahre auf; ein ausgedrucktes PDF ersetzt sie nicht. Wie das geht, steht unter <a href="${href('xrechnung-in-pdf/')}">XRechnung drucken und als PDF speichern</a>.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 5'], ['ustg14b', 'Abs. 1'], ['bmf2025', 'Rn. 60'])}</p>

        <h2 id="ausstellen">Ausstellen: Was in deine Rechnung muss</h2>
        <p>Du darfst weiter Papier- oder PDF-Rechnungen schreiben. Eine Kleinunternehmer-Rechnung muss mindestens enthalten:</p>
        <ol>
          <li>vollständigen Namen und Anschrift von dir und vom Leistungsempfänger,</li>
          <li>deine Steuernummer oder Umsatzsteuer-Identifikationsnummer oder Kleinunternehmer-Identifikationsnummer,</li>
          <li>das Ausstellungsdatum,</li>
          <li>Menge und Art der Lieferung bzw. Umfang und Art der Leistung,</li>
          <li>das Entgelt in einer Summe mit dem Hinweis, dass die Steuerbefreiung für Kleinunternehmer gilt (§ 19 UStG),</li>
          <li>bei einer Gutschrift das Wort „Gutschrift“.</li>
        </ol>
        <p>${src('ustdv34a', 'Satz 1')}</p>
        <p>Willst du freiwillig eine XRechnung ausstellen, gibt die KoSIT vor: Steuerkategorie E, Steuersatz 0 %, Steuerbetrag 0 und als Befreiungsgrund der Text „Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG“. ${src('xrSpez', 'Kapitel 13.3')}</p>

        <h2 id="behoerden">Rechnungen an Behörden</h2>
        <p>Für Rechnungen an öffentliche Auftraggeber gelten eigene Vorschriften neben dem Umsatzsteuerrecht. An Bundesbehörden müssen Rechnungen nach der E-Rechnungsverordnung grundsätzlich elektronisch gestellt werden, in der Regel als XRechnung. Eine Ausnahme für Kleinunternehmer sieht die Verordnung nicht vor; ausgenommen sind unter anderem Rechnungen über Direktaufträge bis 1.000 Euro. Andere öffentliche Auftraggeber können eigene Vorgaben haben. Für die Adressierung brauchst du die <a href="${href('begriffe/')}#leitweg-id">Leitweg-ID</a> der Behörde.</p>
        <p>${srcs(['erechv3', 'Abs. 1 und 3'], ['erechv4', 'Abs. 1'], ['bmfFaq', 'Frage 4a und 6'], ['bmf2026', 'Rn. 24 und 25'])}</p>

        <h2 id="wechsel">Wenn du die Grenze überschreitest</h2>
        <p>Überschreitest du die Umsatzgrenzen oder verzichtest du auf die Kleinunternehmerregelung, bist du ab dem Wechsel zur Regelbesteuerung grundsätzlich zur E-Rechnung verpflichtet, sobald du Leistungen an andere inländische Unternehmen abrechnest. Bis Ende 2027 gelten dabei die allgemeinen Übergangsregeln, die unter <a href="${href('e-rechnung-pflicht-ab-wann/')}">E-Rechnung: Pflicht ab wann?</a> erklärt sind.</p>
        <p>${srcs(['bmfFaq', 'Frage 4'], ['ustg27', 'Abs. 38'])}</p>`;

export default {
  slug: 'e-rechnung-kleinunternehmer/',
  kind: 'ratgeber',
  title: 'E-Rechnung Kleinunternehmer: empfangen ja, ausstellen nein',
  description: 'E-Rechnung für Kleinunternehmer: Empfang seit 2025 Pflicht, Ausstellen nicht. Pflichtangaben, freiwillige XRechnung und Wechsel – mit Quellen.',
  h1: 'E-Rechnung für Kleinunternehmer',
  llms: 'Was Kleinunternehmer (§ 19 UStG) bei der E-Rechnung beachten müssen: Empfang Pflicht, Ausstellen nach UStG freiwillig (§ 34a UStDV), Ausnahme Rechnungen an Bundesbehörden (ERechV), Pflichtangaben, Kennzeichnung in der XRechnung, Wechsel zur Regelbesteuerung.',
  crumbs: [{ slug: 'e-rechnung-kleinunternehmer/', label: 'Kleinunternehmer' }],
  updated: '2026-11-25',
  faq,
  html: () => ratgeber({
    h1: 'E-Rechnung für Kleinunternehmer',
    answer: 'Kleinunternehmer müssen E-Rechnungen seit dem 1. Januar 2025 <strong>empfangen</strong> können, müssen selbst aber <strong>keine</strong> E-Rechnungen ausstellen: Nach dem Umsatzsteuerrecht dürfen ihre Rechnungen immer auf Papier oder als einfache PDF verschickt werden. Ausnahme sind Rechnungen an Bundesbehörden.',
    answerSrc: [['ustae', 'Abschnitt 14.1 Abs. 5 Satz 2'], ['ustdv34a', 'Satz 4'], ['erechv3', 'Abs. 1 und 3']],
    tocItems: [['ueberblick', 'Überblick als Tabelle'], ['wer', 'Wer ist Kleinunternehmer?'], ['empfangen', 'Empfangen'], ['ausstellen', 'Ausstellen und Pflichtangaben'], ['behoerden', 'Rechnungen an Behörden'], ['wechsel', 'Wenn du die Grenze überschreitest'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    relatedSlugs: ['e-rechnung-pflicht-ab-wann/', 'xrechnung-in-pdf/', 'e-rechnung-privatperson/', 'begriffe/'],
  }),
};
