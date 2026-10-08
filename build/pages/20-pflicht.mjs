import { href } from '../site.mjs';
import { src, srcs, ratgeber, UPDATED } from '../content.mjs';

const faq = [
  { q: 'Muss ich für den Empfang von E-Rechnungen etwas anschaffen?', a: 'Nein. Für den Empfang reicht ein E-Mail-Postfach; ein eigenes Postfach nur für E-Rechnungen ist nicht nötig. Um die XML-Datei zu lesen, brauchst du einen Viewer wie das Werkzeug auf dieser Seite.', src: [['ustae', 'Abschnitt 14.1 Abs. 5']] },
  { q: 'Darf ich 2026 noch Papierrechnungen an Firmen schicken?', a: 'Ja. Für Umsätze bis Ende 2026 darf die Rechnung bis 31.12.2026 noch auf Papier übermittelt werden, eine andere elektronische Form wie eine einfache PDF nur mit Zustimmung des Empfängers.', src: [['ustg27', 'Abs. 38 Nr. 1']] },
  { q: 'Welcher Umsatz zählt für die 800.000-Euro-Grenze 2027?', a: 'Maßgeblich ist der Gesamtumsatz nach § 19 Abs. 2 UStG im Vorjahr, also 2026. Das ist die Summe der steuerbaren Umsätze nach vereinnahmten Entgelten, abzüglich bestimmter steuerfreier Umsätze.', src: [['ustg27', 'Abs. 38 Nr. 2'], ['ustg19', 'Abs. 2']] },
  { q: 'Was passiert, wenn ein Kunde meine E-Rechnung nicht annimmt?', a: 'Er hat dann keinen Anspruch auf eine Papier- oder PDF-Rechnung. Deine Pflichten gelten als erfüllt, wenn du eine E-Rechnung ausgestellt und dich nachweislich, zum Beispiel per Sendeprotokoll, um die Übermittlung bemüht hast.', src: [['ustae', 'Abschnitt 14.1 Abs. 5']] },
  { q: 'Gilt die Pflicht auch für Gutschriften und Reverse-Charge-Rechnungen?', a: 'Ja. Die Regeln gelten auch für Gutschriften und für Umsätze nach § 13b UStG, wenn beide Beteiligte im Inland ansässig sind.', src: [['bmf2025', 'Rn. 17']] },
  { q: 'Was passiert, wenn ich trotz Pflicht eine PDF-Rechnung schicke?', a: 'Dann liegt keine ordnungsmäßige Rechnung vor, und der Empfänger kann daraus dem Grunde nach keine Vorsteuer abziehen. Die Rechnung kann aber durch eine E-Rechnung berichtigt werden.', src: [['ustae', 'Abschnitt 15.2a Abs. 1']] },
];

const sections = `        <h2 id="kurz">Das Wichtigste in drei Sätzen</h2>
        <p>Seit dem <strong>1. Januar 2025</strong> müssen alle Unternehmen in Deutschland E-Rechnungen empfangen können, ohne Übergangsfrist. Für das <strong>Ausstellen</strong> an andere Unternehmen gibt es Übergangsregeln bis Ende 2027. Spätestens für Umsätze ab dem <strong>1. Januar 2028</strong> ist zwischen inländischen Unternehmen grundsätzlich die E-Rechnung Pflicht.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 5'], ['ustg27', 'Abs. 38'], ['bmfFaq', 'Frage 11 und 12'])}</p>

        <h2 id="zeitplan">Zeitplan: Empfang und Versand</h2>
        <div class="table-scroll">
          <table>
            <caption>Gilt für Rechnungen zwischen Unternehmen, die beide im Inland ansässig sind. Stand 08.10.2026.</caption>
            <thead><tr><th scope="col">Umsatz ausgeführt</th><th scope="col">Empfangen</th><th scope="col">Ausstellen an andere Unternehmen</th><th scope="col">Rechtsgrundlage</th></tr></thead>
            <tbody>
              <tr><th scope="row">2025 und 2026</th><td>E-Rechnung muss empfangen werden können</td><td>Papierrechnung erlaubt; andere elektronische Formate (z. B. einfache PDF) nur mit Zustimmung des Empfängers; Übermittlung bis 31.12.2026</td><td>§ 27 Abs. 38 Nr. 1 UStG</td></tr>
              <tr><th scope="row">2027, Vorjahresumsatz höchstens 800.000 €</th><td>wie oben</td><td>weiterhin Papier oder – mit Zustimmung – andere elektronische Formate; Übermittlung bis 31.12.2027</td><td>§ 27 Abs. 38 Nr. 2 UStG</td></tr>
              <tr><th scope="row">2027, Vorjahresumsatz über 800.000 €</th><td>wie oben</td><td>E-Rechnung; Ausnahme: EDI-Verfahren mit Zustimmung des Empfängers</td><td>§ 14 Abs. 2 UStG, § 27 Abs. 38 Nr. 3 UStG</td></tr>
              <tr><th scope="row">ab 1. Januar 2028</th><td>wie oben</td><td>E-Rechnung für alle (Ausnahmen siehe unten)</td><td>§ 14 Abs. 2 Satz 2 Nr. 1 UStG</td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['ustg27', 'Abs. 38 Nr. 1 bis 3'], ['ustg14', 'Abs. 2 Satz 2 Nr. 1'])}</p>
        <p>Auch nach 2027 bleibt ein zwischen beiden Seiten vereinbartes strukturiertes Format zulässig (zum Beispiel ein EDI-Verfahren), wenn es die richtige und vollständige Übertragung der Rechnungsangaben in ein Format nach der Norm EN 16931 erlaubt. ${src('ustg14', 'Abs. 1 Satz 6 Nr. 2')}</p>

        <h2 id="was-ist">Was als E-Rechnung zählt</h2>
        <p>Eine E-Rechnung ist eine Rechnung in einem strukturierten elektronischen Format, das eine elektronische Verarbeitung ermöglicht. Eine einfache PDF, ein Foto oder eine E-Mail mit Rechnungstext ist <strong>keine</strong> E-Rechnung, sondern eine „sonstige Rechnung“. Zulässig sind laut Finanzverwaltung insbesondere XRechnung und ZUGFeRD ab Version 2.0.1, ausgenommen die Profile MINIMUM und BASIC-WL. Mehr dazu unter <a href="${href('xrechnung-oder-zugferd/')}">XRechnung oder ZUGFeRD</a>.</p>
        <p>${srcs(['ustg14', 'Abs. 1 Satz 3 und 4'], ['ustae', 'Abschnitt 14.1 Abs. 2, 13 und 14'])}</p>

        <h2 id="ausnahmen">Ausnahmen: Hier ist keine E-Rechnung nötig</h2>
        <ul>
          <li><strong>Kleinbetragsrechnungen</strong> bis 250 Euro Gesamtbetrag dürfen immer als sonstige Rechnung übermittelt werden. ${src('ustdv33', 'Satz 4')}</li>
          <li><strong>Fahrausweise</strong> ebenso. ${src('ustdv34', 'Abs. 1 Satz 2')}</li>
          <li><strong>Kleinunternehmer</strong> nach § 19 UStG dürfen ihre Rechnungen immer als sonstige Rechnung übermitteln. Details unter <a href="${href('e-rechnung-kleinunternehmer/')}">E-Rechnung für Kleinunternehmer</a>. ${src('ustdv34a', 'Satz 4')}</li>
          <li><strong>Steuerfreie Leistungen nach § 4 Nr. 8 bis 29 UStG</strong>, zum Beispiel ärztliche Heilbehandlungen: Hier besteht schon keine Pflicht, überhaupt eine Rechnung auszustellen. Mehr unter <a href="${href('e-rechnung-arztpraxis/')}">E-Rechnung in der Arztpraxis</a>. ${src('ustg14', 'Abs. 2 Satz 2')}</li>
          <li><strong>Privatpersonen</strong>: Die Pflicht gilt nur für Leistungen an andere Unternehmer für deren Unternehmen. Siehe <a href="${href('e-rechnung-privatperson/')}">E-Rechnung und Privatpersonen</a>. ${src('ustg14', 'Abs. 2 Satz 2 Nr. 1')}</li>
          <li><strong>Geschäfte mit dem Ausland</strong>: Ist einer der Beteiligten nicht im Inland ansässig, besteht keine E-Rechnungspflicht. ${src('ustae', 'Abschnitt 14.1 Abs. 6 Satz 3')}</li>
        </ul>

        <h2 id="empfang">Was „empfangen können“ bedeutet</h2>
        <p>Es genügt, ein E-Mail-Postfach bereitzustellen; ein eigenes Postfach nur für E-Rechnungen ist nicht nötig. Die Pflicht gilt auch für Kleinunternehmer und für Unternehmen, die nur steuerfreie Umsätze ausführen, zum Beispiel Vermieter oder Arztpraxen. Wer eine E-Rechnung bekommt, sollte die Original-Datei aufbewahren: Rechnungen sind acht Jahre aufzubewahren, bei einer E-Rechnung zumindest der strukturierte Teil in seiner ursprünglichen Form.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 5'], ['bmf2025', 'Rn. 17 und 60'], ['ustg14b', 'Abs. 1'])}</p>

        <h2 id="folgen">Welche Folgen eine falsche Form hat</h2>
        <p>Besteht für einen Umsatz die Pflicht zur E-Rechnung und kommt stattdessen eine sonstige Rechnung (etwa eine einfache PDF), ist das keine ordnungsmäßige Rechnung: Der Empfänger kann daraus dem Grunde nach keine Vorsteuer abziehen. Hat eine E-Rechnung Fehler, unterscheidet das BMF: Formatfehler machen die Datei zur sonstigen Rechnung; fehlen Pflichtangaben, ist die Rechnung nicht ordnungsmäßig; andere Regelverstöße, etwa eine fehlende Käuferreferenz, sind umsatzsteuerlich unbeachtlich. Was einzelne Fehlercodes bedeuten, steht unter <a href="${href('fehlercodes/')}">XRechnung-Fehlercodes</a>.</p>
        <p>${srcs(['ustae', 'Abschnitt 15.2a Abs. 1'], ['bmf2025', 'Rn. 6a, 6b und 35a'])}</p>`;

export default {
  slug: 'e-rechnung-pflicht-ab-wann/',
  kind: 'ratgeber',
  title: 'E-Rechnung Pflicht ab wann? Alle Fristen 2025 bis 2028',
  description: 'E-Rechnung Pflicht ab wann: Empfang seit 1.1.2025, Versand mit Übergang bis Ende 2027. Zeitplan, 800.000-Euro-Grenze und Ausnahmen – mit Quellen.',
  h1: 'E-Rechnung: Pflicht ab wann?',
  llms: 'Zeitplan der E-Rechnungspflicht in Deutschland: Empfang seit 01.01.2025, Übergangsregeln für den Versand bis 31.12.2027 (800.000-Euro-Grenze, EDI), Pflicht ab 2028, Ausnahmen, Folgen; mit Belegen aus UStG, UStAE und BMF.',
  crumbs: [{ slug: 'e-rechnung-pflicht-ab-wann/', label: 'Pflicht ab wann?' }],
  updated: UPDATED,
  faq,
  html: () => ratgeber({
    h1: 'E-Rechnung: Pflicht ab wann?',
    answer: 'E-Rechnungen <strong>empfangen</strong> müssen alle Unternehmen in Deutschland seit dem 1. Januar 2025. E-Rechnungen <strong>ausstellen</strong> müssen sie für Leistungen an andere inländische Unternehmen spätestens für Umsätze ab dem 1. Januar 2028; bis dahin gelten Übergangsregeln.',
    answerSrc: [['ustae', 'Abschnitt 14.1 Abs. 5'], ['ustg27', 'Abs. 38'], ['ustg14', 'Abs. 2 Satz 2 Nr. 1']],
    tocItems: [['kurz', 'Das Wichtigste'], ['zeitplan', 'Zeitplan als Tabelle'], ['was-ist', 'Was als E-Rechnung zählt'], ['ausnahmen', 'Ausnahmen'], ['empfang', 'Was „empfangen können“ bedeutet'], ['folgen', 'Folgen einer falschen Form'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    relatedSlugs: ['e-rechnung-kleinunternehmer/', 'e-rechnung-privatperson/', 'e-rechnung-arztpraxis/', 'xrechnung-oder-zugferd/'],
  }),
};
