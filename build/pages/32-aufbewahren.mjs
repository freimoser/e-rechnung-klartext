import { href } from '../site.mjs';
import { srcs, ratgeber } from '../content.mjs';

const faq = [
  { q: 'Reicht es, ein PDF der E-Rechnung zu speichern?', a: 'Nein. Aufzubewahren ist die Rechnung grundsätzlich im empfangenen Format, bei einer E-Rechnung zumindest der strukturierte Teil unversehrt in seiner ursprünglichen Form. Ein selbst erzeugtes PDF ist nur eine Lesehilfe.', src: [['ustae', 'Abschnitt 14b.1 Abs. 1 Satz 2 und 4'], ['bmf2025', 'Rn. 60']] },
  { q: 'Wann beginnt die Frist von acht Jahren?', a: 'Mit dem Ende des Kalenderjahres, in dem die Rechnung ausgestellt wurde. Eine Rechnung vom März 2026 ist also bis Ende 2034 aufzubewahren, unter Umständen auch länger.', src: [['ustg14b', 'Abs. 1 Satz 3'], ['ustae', 'Abschnitt 14b.1 Abs. 2 Satz 1']] },
  { q: 'Wann muss ich länger als acht Jahre aufbewahren?', a: 'Solange die Rechnung für Steuern von Bedeutung ist, deren Festsetzungsfrist noch läuft. Das betrifft zum Beispiel Rechnungen, die für eine Vorsteuerberichtigung mit zehnjährigem Berichtigungszeitraum wichtig sind, etwa bei Gebäuden.', src: [['ustae', 'Abschnitt 14b.1 Abs. 2 Satz 2 bis 4']] },
  { q: 'Brauche ich ein GoBD-zertifiziertes Archiv?', a: 'Für die Umsatzsteuer nicht zwingend: Allein weil E-Rechnungen außerhalb eines GoBD-konformen Systems gespeichert werden, liegt in der Regel kein Verstoß gegen die Aufbewahrungspflicht vor. Andere Aufbewahrungspflichten, etwa nach der Abgabenordnung und den GoBD, bleiben davon unberührt.', src: [['ustae', 'Abschnitt 14b.1 Abs. 1 Satz 5 und 8'], ['bmfFaq', 'Frage 13']] },
  { q: 'Gilt das auch für Kleinunternehmer und Vermieter?', a: 'Ja. Die Aufbewahrungspflicht für erhaltene Rechnungen trifft jeden Unternehmer, auch Kleinunternehmer und Vermieter.', src: [['ustg14b', 'Abs. 1 Satz 1']] },
];

const sections = `        <h2 id="was">Was du aufbewahren musst</h2>
        <p>Aufzubewahren sind ein Doppel jeder Rechnung, die du selbst ausstellst, und alle Rechnungen, die du erhältst. Die Aufbewahrung erfolgt grundsätzlich im <strong>empfangenen Format</strong>: Bei einer XRechnung ist das die XML-Datei, bei einer ZUGFeRD-Rechnung die PDF mit den eingebetteten Daten. Bei einer E-Rechnung muss zumindest der strukturierte Teil unversehrt in seiner ursprünglichen Form vorliegen.</p>
        <p>Ein ausgedrucktes oder selbst erzeugtes PDF ersetzt die Original-Datei deshalb nicht. Es darf zusätzlich abgelegt werden, wenn es dir beim Lesen hilft. Wie du eine XRechnung lesbar machst, steht unter <a href="${href('xrechnung-in-pdf/')}">XRechnung drucken und als PDF speichern</a>.</p>
        <p>${srcs(['ustg14b', 'Abs. 1 Satz 1'], ['ustae', 'Abschnitt 14b.1 Abs. 1 Satz 1, 2 und 4'], ['bmf2025', 'Rn. 60'])}</p>

        <h2 id="wie-lange">Wie lange: acht Jahre ab Jahresende</h2>
        <p>Die Aufbewahrungsfrist beträgt <strong>acht Jahre</strong> und beginnt mit dem Ende des Kalenderjahres, in dem die Rechnung ausgestellt wurde. Sie läuft nicht ab, solange die Rechnung für Steuern von Bedeutung ist, deren Festsetzungsfrist noch nicht abgelaufen ist. Das betrifft auch Rechnungen, die für eine Vorsteuerberichtigung mit zehnjährigem Berichtigungszeitraum relevant sind; dann endet die Frist erst, wenn die Festsetzungsfrist für das letzte Jahr dieses Zeitraums abgelaufen ist.</p>
        <p>${srcs(['ustg14b', 'Abs. 1 Satz 1 und 3'], ['ustae', 'Abschnitt 14b.1 Abs. 2'])}</p>

        <h2 id="wie">Wie: unverändert, lesbar, auffindbar</h2>
        <p>Echtheit der Herkunft, Unversehrtheit des Inhalts und Lesbarkeit müssen über die ganze Frist gewährleistet sein. Für die Umsatzsteuer gilt: Allein weil du E-Rechnungen außerhalb eines GoBD-konformen Datenverarbeitungssystems speicherst, liegt in der Regel kein Verstoß vor. Aufbewahrungspflichten nach anderen Vorschriften, etwa nach der Abgabenordnung und den GoBD, gelten daneben weiter; was dein Betrieb dafür braucht, klärst du am besten mit deiner Steuerberatung.</p>
        <p>${srcs(['ustae', 'Abschnitt 14b.1 Abs. 1 Satz 3, 5 und 8'], ['bmfFaq', 'Frage 13'], ['ao147', 'Abs. 1 und 3'])}</p>

        <h2 id="praxis">In der Praxis</h2>
        <ul>
          <li><strong>Original zuerst sichern:</strong> Speichere die empfangene Datei unverändert, bevor du sie weiterverarbeitest. Das Werkzeug auf dieser Seite liest Dateien nur und verändert sie nicht. Wie du E-Rechnungen entgegennimmst und prüfst, steht unter <a href="${href('e-rechnung-empfangen/')}">E-Rechnung empfangen</a>.</li>
          <li><strong>Original weitergeben:</strong> An Buchhaltung oder Steuerberatung geht immer die Original-Datei, nicht ein daraus erzeugtes PDF.</li>
          <li><strong>Lesbarkeit erhalten:</strong> Halte einen Viewer bereit, mit dem du die Dateien auch in einigen Jahren noch öffnen kannst, etwa den <a href="${href('')}">kostenlosen Viewer auf dieser Seite</a> oder den Viewer im ELSTER-Portal.</li>
        </ul>
        <p>${srcs(['ustae', 'Abschnitt 14b.1 Abs. 1 Satz 3'], ['bmfFaq', 'Frage 12a'])}</p>`;

export default {
  slug: 'e-rechnung-aufbewahren/',
  kind: 'ratgeber',
  title: 'E-Rechnung aufbewahren: was, wie lange, in welcher Form',
  description: 'E-Rechnung aufbewahren: acht Jahre ab Jahresende, im empfangenen Format, die XML-Datei unverändert. Ein PDF ersetzt das Original nicht – mit Quellen.',
  h1: 'E-Rechnung aufbewahren',
  llms: 'Aufbewahrung von E-Rechnungen: acht Jahre ab Ende des Ausstellungsjahres (§ 14b UStG), im empfangenen Format, strukturierter Teil unversehrt (Abschnitt 14b.1 UStAE), PDF ersetzt das Original nicht, längere Frist bei offener Festsetzungsfrist, GoBD-Hinweis.',
  crumbs: [{ slug: 'e-rechnung-aufbewahren/', label: 'Aufbewahren' }],
  published: '2026-11-25',
  updated: '2026-11-25',
  faq,
  html: () => ratgeber({
    h1: 'E-Rechnung aufbewahren',
    answer: 'E-Rechnungen sind <strong>acht Jahre</strong> aufzubewahren, gerechnet ab dem Ende des Jahres, in dem die Rechnung ausgestellt wurde. Aufbewahrt wird das empfangene Format: bei einer E-Rechnung zumindest der strukturierte Teil, unverändert in seiner ursprünglichen Form. Ein ausgedrucktes oder selbst erzeugtes PDF ersetzt das Original nicht.',
    answerSrc: [['ustg14b', 'Abs. 1'], ['ustae', 'Abschnitt 14b.1 Abs. 1 und 2']],
    tocItems: [['was', 'Was du aufbewahren musst'], ['wie-lange', 'Wie lange'], ['wie', 'Wie'], ['praxis', 'In der Praxis'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    ctaTitle: 'E-Rechnung lesbar machen',
    ctaText: 'Original-Datei hineinziehen, lesen und als PDF speichern. Die Datei selbst bleibt unverändert.',
    relatedSlugs: ['e-rechnung-empfangen/', 'xrechnung-in-pdf/', 'e-rechnung-vermieter/', 'e-rechnung-kleinunternehmer/'],
  }),
};
