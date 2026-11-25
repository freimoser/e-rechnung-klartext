import { href } from '../site.mjs';
import { srcs, ratgeber } from '../content.mjs';

const faq = [
  { q: 'Kann ich verlangen, dass mir eine Rechnung weiter als PDF geschickt wird?', a: 'Nein. Wer technisch keine E-Rechnung empfangen kann oder die Annahme verweigert, hat keinen Anspruch auf eine andere Form. Ob er in der Übergangszeit noch Papier verschickt, entscheidet der Rechnungsaussteller; für eine einfache PDF braucht er zusätzlich deine Zustimmung.', src: [['ustae', 'Abschnitt 14.1 Abs. 5 Satz 4'], ['bmfFaq', 'Frage 11']] },
  { q: 'Brauche ich eine besondere Software oder Peppol?', a: 'Nein. Ein E-Mail-Postfach genügt, ein eigenes Postfach nur für E-Rechnungen ist nicht nötig. Zum Lesen reicht ein Viewer, zum Beispiel dieses Werkzeug oder der Viewer im ELSTER-Portal. Peppol brauchst du nur, wenn du es selbst nutzen willst.', src: [['ustae', 'Abschnitt 14.1 Abs. 5 Satz 3'], ['bmfFaq', 'Frage 8 und 12a']] },
  { q: 'Gilt das auch für Kleinunternehmer und Vermieter?', a: 'Ja. Die Pflicht, E-Rechnungen empfangen zu können, gilt für alle inländischen Unternehmer, ausdrücklich auch für Kleinunternehmer und für Unternehmer, die nur steuerfreie Umsätze ausführen, etwa Vermieter oder Ärzte.', src: [['ustae', 'Abschnitt 14.1 Abs. 5 Satz 1 und 2'], ['bmfFaq', 'Frage 3 und 12']] },
  { q: 'Muss ich jede E-Rechnung vor dem Buchen validieren?', a: 'Nein. Eine Validierung ist keine Voraussetzung für die steuerliche Anerkennung, hilft aber, fehlende oder unlogische Pflichtangaben zu finden.', src: [['bmfFaq', 'Frage 7']] },
  { q: 'Was mache ich mit einer fehlerhaften E-Rechnung?', a: 'Bitte den Aussteller um eine Berichtigung. Ist eine E-Rechnung vorgeschrieben, muss auch die Berichtigung eine E-Rechnung sein. Fehlende Pflichtangaben gefährden den Vorsteuerabzug; andere Regelverstöße sind umsatzsteuerlich oft unbeachtlich.', src: [['ustae', 'Abschnitt 14.11 Abs. 1 Satz 7'], ['bmf2026', 'Rn. 20, 22 und 23']] },
];

const sections = `        <h2 id="pflicht">Wer E-Rechnungen empfangen können muss</h2>
        <p>Seit dem <strong>1. Januar 2025</strong> müssen alle inländischen Unternehmer die technischen Voraussetzungen schaffen, um E-Rechnungen zu empfangen, ohne Übergangsfrist. Das gilt auch für Kleinunternehmer und für Unternehmer, die nur steuerfreie Umsätze ausführen, zum Beispiel <a href="${href('e-rechnung-vermieter/')}">Vermieter</a> oder <a href="${href('e-rechnung-arztpraxis/')}">Arztpraxen</a>. Privatpersonen sind nicht betroffen, mehr dazu unter <a href="${href('e-rechnung-privatperson/')}">E-Rechnung und Privatpersonen</a>.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 5 Satz 1 und 2'], ['bmfFaq', 'Frage 3 und 12'])}</p>

        <h2 id="postfach">Der Empfangsweg: ein E-Mail-Postfach genügt</h2>
        <p>Für den Empfang per E-Mail ist kein gesondertes Postfach nur für E-Rechnungen nötig. Das Gesetz schreibt keinen bestimmten Übermittlungsweg vor: Neben der E-Mail kommen etwa ein Download über ein Kundenportal oder eine Schnittstelle in Frage. Welcher Weg im Einzelfall gilt, vereinbaren Rechnungssteller und Empfänger.</p>
        <p>Ablehnen kannst du eine E-Rechnung nicht: Wer sie technisch nicht empfangen kann oder die Annahme verweigert, hat keinen Anspruch auf eine Papier- oder PDF-Rechnung. Der Aussteller hat seine Pflichten erfüllt, wenn er die E-Rechnung ausgestellt und sich nachweislich um die Übermittlung bemüht hat.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 5 Satz 3 bis 5'], ['bmfFaq', 'Frage 8'])}</p>

        <h2 id="lesen">Öffnen und lesen</h2>
        <p>Eine <strong>XRechnung</strong> ist eine reine XML-Datei; ohne Viewer sieht sie unleserlich aus. Eine <strong>ZUGFeRD-Rechnung</strong> ist eine PDF, in die die Rechnungsdaten als XML-Datei eingebettet sind. Maßgeblich sind die eingebetteten Daten: Weichen sie vom sichtbaren PDF ab, gilt der strukturierte Teil. Die Finanzverwaltung empfiehlt deshalb, den XML-Teil selbst anzuzeigen. Das geht kostenlos, etwa mit dem <a href="${href('')}">Werkzeug auf dieser Seite</a> oder dem E-Rechnungs-Viewer im ELSTER-Portal.</p>
        <p>${srcs(['bmfFaq', 'Frage 12a'], ['ustae', 'Abschnitt 14.4 Abs. 3'])}</p>

        <h2 id="pruefen">Prüfen, bevor du bezahlst oder buchst</h2>
        <p>Kontrolliere wie bei jeder Rechnung, ob Leistung, Beträge und Pflichtangaben stimmen. Eine technische Prüfung gegen die Regeln der Norm (Validierung) ist keine Voraussetzung für die steuerliche Anerkennung, findet aber fehlende oder unlogische Angaben. Die Vorprüfung im Werkzeug zeigt solche Befunde mit Code und Erklärung; was ein Code wie BR-DE-15 bedeutet, steht unter <a href="${href('fehlercodes/')}">XRechnung-Fehlercodes</a>.</p>
        <p>Nicht jeder Prüffehler macht die Rechnung steuerlich unbrauchbar: Verletzt eine Datei eine Geschäftsregel, bleibt sie umsatzsteuerlich grundsätzlich eine E-Rechnung. Fehlen aber Pflichtangaben, ist sie nicht ordnungsmäßig, und der Vorsteuerabzug ist gefährdet. Berichtigen kann grundsätzlich nur der Aussteller; bei vorheriger Vereinbarung geht es auch per Gutschrift durch dich. Die Berichtigung muss ebenfalls eine E-Rechnung sein.</p>
        <p>${srcs(['bmfFaq', 'Frage 7'], ['bmf2026', 'Rn. 20, 22 und 23'], ['ustae', 'Abschnitt 14.11 Abs. 1 Satz 7 und Abs. 2 Satz 1 und 7'])}</p>

        <h2 id="ablegen">Weitergeben und aufbewahren</h2>
        <p>Bewahre die empfangene Datei unverändert auf, bei einer XRechnung also die XML-Datei, bei ZUGFeRD die PDF mit den eingebetteten Daten. Ein ausgedrucktes oder selbst erzeugtes PDF ist nur eine Lesehilfe und ersetzt das Original nicht. Gib auch an deine Buchhaltung oder Steuerberatung immer die Original-Datei weiter. Wie lange und wie du sie aufbewahrst, steht unter <a href="${href('e-rechnung-aufbewahren/')}">E-Rechnung aufbewahren</a>.</p>
        <p>${srcs(['ustg14b', 'Abs. 1'], ['ustae', 'Abschnitt 14b.1 Abs. 1 Satz 2 und 4'])}</p>`;

export default {
  slug: 'e-rechnung-empfangen/',
  kind: 'ratgeber',
  title: 'E-Rechnung empfangen: Was Unternehmen brauchen',
  description: 'E-Rechnung empfangen: seit 2025 Pflicht für alle Unternehmen, auch Kleinunternehmer. Postfach, Viewer, Prüfen und Aufbewahren – mit Quellen.',
  h1: 'E-Rechnung empfangen: So geht es ohne Software',
  llms: 'Wie Unternehmen E-Rechnungen empfangen: Pflicht seit 01.01.2025 für alle inländischen Unternehmer (auch Kleinunternehmer, Vermieter), E-Mail-Postfach genügt, kein Anspruch auf PDF, Lesen mit Viewer (XML führend), Prüfen, Berichtigung, Aufbewahrung des Originals.',
  crumbs: [{ slug: 'e-rechnung-empfangen/', label: 'E-Rechnung empfangen' }],
  published: '2026-11-25',
  updated: '2026-11-25',
  faq,
  html: () => ratgeber({
    h1: 'E-Rechnung empfangen: So geht es ohne Software',
    answer: 'Seit dem 1. Januar 2025 müssen alle Unternehmen in Deutschland E-Rechnungen <strong>empfangen</strong> können, auch Kleinunternehmer und Vermieter. Ein normales E-Mail-Postfach genügt. Zum Lesen brauchst du einen Viewer; aufbewahren musst du die Original-Datei.',
    answerSrc: [['ustae', 'Abschnitt 14.1 Abs. 5'], ['bmfFaq', 'Frage 12a']],
    tocItems: [['pflicht', 'Wer empfangen können muss'], ['postfach', 'Der Empfangsweg'], ['lesen', 'Öffnen und lesen'], ['pruefen', 'Prüfen'], ['ablegen', 'Weitergeben und aufbewahren'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    ctaTitle: 'E-Rechnung bekommen?',
    ctaText: 'Datei hineinziehen und lesen wie auf Papier, mit Vorprüfung. Nichts wird hochgeladen.',
    relatedSlugs: ['e-rechnung-aufbewahren/', 'xrechnung-in-pdf/', 'fehlercodes/', 'e-rechnung-kleinunternehmer/'],
  }),
};
