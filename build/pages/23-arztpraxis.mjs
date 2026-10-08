import { href } from '../site.mjs';
import { src, srcs, ratgeber, UPDATED } from '../content.mjs';

const faq = [
  { q: 'Muss eine Arztpraxis E-Rechnungen empfangen können?', a: 'Ja. Auch wer nur steuerfreie Leistungen erbringt, ist Unternehmer und muss seit dem 1. Januar 2025 E-Rechnungen empfangen können. Das BMF nennt Ärzte dabei ausdrücklich. Ein E-Mail-Postfach genügt.', src: [['bmfFaq', 'Frage 3'], ['bmf2025', 'Rn. 17'], ['ustae', 'Abschnitt 14.1 Abs. 5']] },
  { q: 'Brauchen Patientenrechnungen künftig eine E-Rechnung?', a: 'Nein. Rechnungen an Patientinnen und Patienten als Privatpersonen fallen nicht unter die E-Rechnungspflicht; für steuerfreie Heilbehandlungen besteht umsatzsteuerlich ohnehin keine Rechnungspflicht.', src: [['ustg14', 'Abs. 2 Satz 2'], ['bmfFaq', 'Frage 4']] },
  { q: 'Was gilt für ein Gutachten an eine Versicherung?', a: 'Gutachten in Versicherungsangelegenheiten sind laut Finanzverwaltung keine Heilbehandlung; die Steuerbefreiung für Heilbehandlungen gilt dafür nicht. Ist die Leistung steuerpflichtig und geht die Rechnung an ein Unternehmen wie eine Versicherung, ist sie als E-Rechnung auszustellen, mit den Übergangsregeln bis Ende 2027.', src: [['ustae', 'Abschnitt 4.14.1 Abs. 5 Nr. 6'], ['ustg27', 'Abs. 38']] },
  { q: 'Wir sind Kleinunternehmer mit einer kleinen Praxis. Was gilt?', a: 'Kleinunternehmer dürfen ihre Rechnungen immer als sonstige Rechnung ausstellen, müssen E-Rechnungen aber empfangen können.', src: [['ustdv34a', 'Satz 4'], ['ustae', 'Abschnitt 14.1 Abs. 5 Satz 2']] },
  { q: 'Wie öffnen wir eine XRechnung vom Labor oder Lieferanten?', a: 'Mit einem Viewer: Ziehe die Datei in das Werkzeug auf der Startseite. Die Rechnung wird nur im Browser gelesen, nichts wird hochgeladen. Die Original-Datei bewahrst du unverändert auf.', src: [['bmf2025', 'Rn. 60']] },
];

const sections = `        <h2 id="ueberblick">Überblick nach Art der Rechnung</h2>
        <div class="table-scroll">
          <table>
            <caption>Rechnungen von Arzt-, Zahnarzt- und Tierarztpraxen im Inland. Stand 08.10.2026.</caption>
            <thead><tr><th scope="col">Rechnung</th><th scope="col">E-Rechnung nötig?</th><th scope="col">Rechtsgrundlage</th></tr></thead>
            <tbody>
              <tr><th scope="row">Eingangsrechnungen von Lieferanten, Labor, Software-Anbietern</th><td>Empfang muss seit 1.1.2025 möglich sein</td><td>Abschnitt 14.1 Abs. 5 UStAE, BMF-FAQ Frage 3</td></tr>
              <tr><th scope="row">Heilbehandlung in der Human- oder Zahnmedizin (steuerfrei)</th><td>Nein, keine E-Rechnungspflicht</td><td>§ 4 Nr. 14 Buchst. a, § 14 Abs. 2 Satz 2 UStG</td></tr>
              <tr><th scope="row">Rechnung an Privatpatienten oder Tierhalter als Privatperson</th><td>Nein</td><td>§ 14 Abs. 2 Satz 2 Nr. 1 UStG</td></tr>
              <tr><th scope="row">Steuerpflichtige Leistung an ein Unternehmen (z. B. Gutachten für eine Versicherung, Vortrag für ein Unternehmen)</th><td>Ja, mit Übergangsregeln bis Ende 2027</td><td>Abschnitt 4.14.1 Abs. 5 UStAE, § 27 Abs. 38 UStG</td></tr>
              <tr><th scope="row">Rechnung mit steuerfreien und steuerpflichtigen Teilen an ein Unternehmen</th><td>Ja, für die ganze Rechnung</td><td>Abschnitt 14.1 Abs. 4 Satz 10 UStAE</td></tr>
              <tr><th scope="row">Rechnungen bis 250 Euro</th><td>Nein, sonstige Rechnung immer erlaubt</td><td>§ 33 UStDV</td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['ustg4', 'Nr. 14 Buchst. a'], ['ustg14', 'Abs. 2 Satz 2'], ['ustae', 'Abschnitt 4.14.1 Abs. 5 und 14.1 Abs. 4 und 5'], ['ustdv33', 'Satz 4'])}</p>

        <h2 id="empfangen">Empfangen: Das gilt für jede Praxis</h2>
        <p>Für das Umsatzsteuerrecht ist eine Praxis ein Unternehmen, auch wenn sie nur steuerfreie Heilbehandlungen abrechnet. Die Pflicht, E-Rechnungen empfangen zu können, gilt deshalb für jede Praxis seit dem 1. Januar 2025. In der Praxis betrifft das vor allem Rechnungen von Laboren, Dentallaboren, Praxisbedarf, Software und IT-Dienstleistern. Ein E-Mail-Postfach reicht. Wichtig für die Buchhaltung: Die Original-Datei (XML bzw. ZUGFeRD-PDF) ist unverändert aufzubewahren.</p>
        <p>${srcs(['bmfFaq', 'Frage 3'], ['bmf2025', 'Rn. 17 und 60'], ['ustae', 'Abschnitt 14.1 Abs. 5'])}</p>

        <h2 id="aerzte">Arzt- und Zahnarztpraxen: Ausstellen</h2>
        <p>Heilbehandlungen im Bereich der Humanmedizin, die im Rahmen der Tätigkeit als Arzt oder Zahnarzt erbracht werden, sind steuerfrei. Für steuerfreie Leistungen nach § 4 Nr. 8 bis 29 UStG besteht keine Pflicht zur Rechnung und damit auch keine Pflicht zur E-Rechnung.</p>
        <p>Anders ist es bei Tätigkeiten, die keine Heilbehandlung sind. Der Umsatzsteuer-Anwendungserlass nennt zum Beispiel Gutachten in Versicherungsangelegenheiten, Einstellungsuntersuchungen, Vorträge und die Lieferung von Hilfsmitteln. Für sie gilt die Steuerbefreiung für Heilbehandlungen nicht. Sind sie steuerpflichtig und gehen sie an ein anderes Unternehmen, etwa eine Versicherung oder einen Arbeitgeber, ist eine E-Rechnung nötig, bis Ende 2027 mit den <a href="${href('e-rechnung-pflicht-ab-wann/')}">Übergangsregeln</a>. Enthält eine Rechnung steuerfreie und steuerpflichtige Teile, gilt die Pflicht für die ganze Rechnung.</p>
        <p>Für Zahnarztpraxen gilt eine Besonderheit: Die Lieferung oder Wiederherstellung von Zahnprothesen und kieferorthopädischen Apparaten, die die Praxis selbst hergestellt hat, ist von der Steuerbefreiung ausgenommen.</p>
        <p>${srcs(['ustg4', 'Nr. 14 Buchst. a Satz 1 und 2'], ['ustg14', 'Abs. 2 Satz 2'], ['ustae', 'Abschnitt 4.14.1 Abs. 5 und 14.1 Abs. 4 Satz 10'])}</p>

        <h2 id="tieraerzte">Tierarztpraxen: Ausstellen</h2>
        <p>Die Steuerbefreiung in § 4 Nr. 14 Buchst. a UStG gilt nur für Heilbehandlungen im Bereich der <strong>Humanmedizin</strong>. Tierärztliche Leistungen sind dort nicht genannt. Rechnet eine Tierarztpraxis steuerpflichtige Leistungen an ein anderes Unternehmen ab, zum Beispiel an einen landwirtschaftlichen Betrieb, einen Reitstall oder eine Zoohandlung, gilt deshalb die allgemeine Regel: Die Rechnung ist als E-Rechnung auszustellen, mit den Übergangsregeln bis Ende 2027 und den üblichen Ausnahmen (bis 250 Euro, <a href="${href('e-rechnung-kleinunternehmer/')}">Kleinunternehmer</a>). Rechnungen an private Tierhalter sind nicht betroffen, siehe <a href="${href('e-rechnung-privatperson/')}">E-Rechnung und Privatpersonen</a>.</p>
        <p>Hinweis: Diese Einordnung ergibt sich aus dem Wortlaut des Gesetzes. Ein eigenes Beispiel der Finanzverwaltung zu Tierarztpraxen gibt es nicht; lass sie dir im Zweifel von deiner Steuerberatung bestätigen.</p>
        <p>${srcs(['ustg4', 'Nr. 14 Buchst. a'], ['ustg14', 'Abs. 2 Satz 2 Nr. 1'], ['ustdv33', 'Satz 4'], ['ustdv34a', 'Satz 4'])}</p>

        <h2 id="it">Für die Praxis-IT</h2>
        <p>E-Rechnungen kommen als XML-Datei (XRechnung) oder als PDF mit eingebetteter XML (ZUGFeRD). Praxisverwaltungssysteme lesen sie nicht immer selbst ein. Für den Alltag hilft ein Viewer, der die Datei lokal anzeigt und prüft; meldet ein Prüftool Fehlercodes wie BR-DE-15, stehen die Erklärungen unter <a href="${href('fehlercodes/')}">Fehlercodes</a>. Weitere kostenlose Werkzeuge für die Praxis-IT: der <a href="https://freimoser.github.io/gdt-viewer/">GDT Viewer</a> für Gerätedatentransfer-Dateien.</p>`;

export default {
  slug: 'e-rechnung-arztpraxis/',
  kind: 'ratgeber',
  title: 'E-Rechnung Arztpraxis: Was Praxen jetzt beachten müssen',
  description: 'E-Rechnung in der Arztpraxis: Empfang ist Pflicht, Patientenrechnungen sind ausgenommen. Was für Gutachten, Zahnärzte und Tierärzte gilt.',
  h1: 'E-Rechnung in der Arztpraxis',
  llms: 'E-Rechnung für Arzt-, Zahnarzt- und Tierarztpraxen: Empfang Pflicht, Heilbehandlungen (§ 4 Nr. 14 UStG) und Patientenrechnungen ausgenommen, steuerpflichtige Leistungen an Unternehmen (z. B. Versicherungsgutachten) und Tierärzte betroffen; mit Belegen.',
  crumbs: [{ slug: 'e-rechnung-arztpraxis/', label: 'Arztpraxis' }],
  updated: UPDATED,
  faq,
  html: () => ratgeber({
    h1: 'E-Rechnung in der Arztpraxis',
    answer: 'Jede Arzt-, Zahnarzt- und Tierarztpraxis muss seit dem 1. Januar 2025 E-Rechnungen <strong>empfangen</strong> können. <strong>Ausstellen</strong> muss sie E-Rechnungen nur für steuerpflichtige Leistungen an andere Unternehmen – steuerfreie Heilbehandlungen und Rechnungen an Privatpersonen sind nicht betroffen.',
    answerSrc: [['ustae', 'Abschnitt 14.1 Abs. 5'], ['bmfFaq', 'Frage 3'], ['ustg14', 'Abs. 2 Satz 2']],
    tocItems: [['ueberblick', 'Überblick als Tabelle'], ['empfangen', 'Empfangen'], ['aerzte', 'Arzt- und Zahnarztpraxen'], ['tieraerzte', 'Tierarztpraxen'], ['it', 'Für die Praxis-IT'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    relatedSlugs: ['e-rechnung-pflicht-ab-wann/', 'e-rechnung-kleinunternehmer/', 'e-rechnung-privatperson/', 'fehlercodes/'],
  }),
};
