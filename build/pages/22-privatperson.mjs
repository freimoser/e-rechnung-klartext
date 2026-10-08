import { href } from '../site.mjs';
import { src, srcs, ratgeber, UPDATED } from '../content.mjs';

const faq = [
  { q: 'Muss ich als Privatperson E-Rechnungen empfangen können?', a: 'Nein. Die Regeln zur E-Rechnung betreffen nur Unternehmen untereinander; private Endverbraucher sind laut Bundesfinanzministerium nicht betroffen.', src: [['bmfFaq', 'Einleitung und Frage 4']] },
  { q: 'Darf mir ein Handwerker eine XRechnung statt einer Papierrechnung schicken?', a: 'Nur mit deiner Zustimmung. Die Zustimmung kann aber auch stillschweigend erfolgen, etwa wenn du die Rechnung widerspruchslos annimmst. Eine Papierrechnung ist in diesen Fällen immer zulässig.', src: [['ustae', 'Abschnitt 14.1 Abs. 6 Satz 5, Abs. 7 und Abs. 9 Satz 3']] },
  { q: 'Wie öffne ich eine XRechnung, die ich bekommen habe?', a: 'Mit einem Viewer. Ziehe die XML-Datei in das Werkzeug auf der Startseite: Du siehst die Rechnung wie auf Papier, die Datei verlässt deinen Rechner nicht. Auch die Finanzverwaltung nennt einen eigenen Viewer.', src: [['bmfFaq', 'Frage 12a']] },
  { q: 'Wie lange muss ich eine Handwerkerrechnung aufbewahren?', a: 'Für Arbeiten an deinem Grundstück, etwa Reparaturen am Haus, musst du als Privatperson die Rechnung oder einen anderen beweiskräftigen Beleg zwei Jahre aufbewahren.', src: [['ustg14b', 'Abs. 1 Satz 5']] },
  { q: 'Ich bin selbstständig und kaufe auch privat ein. Was gilt?', a: 'Entscheidend ist, wofür du die Leistung beziehst. Kaufst du für dein Unternehmen, ist das ein Umsatz zwischen Unternehmen; dann gelten die Regeln zur E-Rechnung. Für private Einkäufe gelten sie nicht.', src: [['ustg14', 'Abs. 2 Satz 2 Nr. 1']] },
];

const sections = `        <h2 id="ueberblick">Überblick</h2>
        <div class="table-scroll">
          <table>
            <caption>Rechnungen an Privatpersonen (Endverbraucher). Stand 08.10.2026.</caption>
            <thead><tr><th scope="col">Situation</th><th scope="col">Was gilt</th><th scope="col">Rechtsgrundlage</th></tr></thead>
            <tbody>
              <tr><th scope="row">Rechnung an eine Privatperson</th><td>Keine E-Rechnungspflicht; die Pflicht gilt nur für Leistungen an andere Unternehmer für deren Unternehmen</td><td>§ 14 Abs. 2 Satz 2 Nr. 1 UStG</td></tr>
              <tr><th scope="row">E-Rechnung an Privatperson schicken</th><td>Nur mit Zustimmung des Empfängers</td><td>§ 14 Abs. 1 Satz 5 UStG, Abschnitt 14.1 Abs. 6 Satz 5 UStAE</td></tr>
              <tr><th scope="row">Arbeiten am Haus oder Grundstück</th><td>Unternehmer muss eine Rechnung ausstellen; Papier ist erlaubt, elektronisch nur mit Zustimmung</td><td>§ 14 Abs. 2 Satz 2 Nr. 3 UStG, Abschnitt 14.1 Abs. 9 UStAE</td></tr>
              <tr><th scope="row">Aufbewahren als Privatperson</th><td>Nur bei Arbeiten am Grundstück: zwei Jahre</td><td>§ 14b Abs. 1 Satz 5 UStG</td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['ustg14', 'Abs. 1 Satz 5 und Abs. 2 Satz 2'], ['ustae', 'Abschnitt 14.1 Abs. 6 und 9'], ['ustg14b', 'Abs. 1 Satz 5'])}</p>

        <h2 id="warum">Warum Privatpersonen nicht betroffen sind</h2>
        <p>Die Pflicht zur E-Rechnung hängt an der Pflicht, überhaupt eine Rechnung auszustellen. Das Umsatzsteuergesetz verlangt die E-Rechnung nur für Leistungen an einen anderen Unternehmer für dessen Unternehmen, wenn beide im Inland ansässig sind. Rechnungen an Endverbraucher fallen nicht darunter. Das Bundesfinanzministerium schreibt dazu, dass „private Endverbraucher“ von diesen Regelungen nicht betroffen sind.</p>
        <p>${srcs(['ustg14', 'Abs. 2 Satz 2 Nr. 1'], ['bmfFaq', 'Einleitung'])}</p>

        <h2 id="zustimmung">Kann ich zu einer E-Rechnung gezwungen werden?</h2>
        <p>Nein. Wer einer Privatperson eine E-Rechnung schicken will, braucht deren Zustimmung. Die Zustimmung muss aber nicht ausdrücklich sein: Es genügt, dass beide Seiten die elektronische Übermittlung tatsächlich praktizieren, etwa weil du die Rechnung ohne Widerspruch annimmst. Willst du lieber eine Papierrechnung, sag es dem Absender; Papier ist in diesen Fällen immer zulässig.</p>
        <p>${srcs(['ustg14', 'Abs. 1 Satz 5'], ['ustae', 'Abschnitt 14.1 Abs. 6 Satz 5 und Abs. 7'])}</p>

        <h2 id="geoeffnet">Du hast trotzdem eine XRechnung bekommen?</h2>
        <p>Das kommt vor, etwa bei Online-Shops, Versorgern oder Handwerksbetrieben, die alle Rechnungen gleich verschicken. Eine XRechnung ist eine XML-Datei; ohne passendes Programm sieht sie unleserlich aus. So machst du sie lesbar:</p>
        <ol>
          <li>Öffne die Startseite mit dem <a href="${href('')}">Werkzeug</a>.</li>
          <li>Ziehe die Datei in das Feld oder wähle sie aus. Sie wird nur in deinem Browser gelesen.</li>
          <li>Du siehst die Rechnung wie auf Papier und kannst sie <a href="${href('xrechnung-in-pdf/')}">als PDF speichern oder drucken</a>.</li>
        </ol>

        <h2 id="vereine">Vereine und Behörden</h2>
        <p>Eine juristische Person, die nicht Unternehmer ist, zum Beispiel viele Vereine, darf ebenfalls eine Papierrechnung erhalten; elektronisch nur mit Zustimmung. Für Rechnungen an öffentliche Auftraggeber gelten eigene Vorschriften neben dem Umsatzsteuergesetz, zum Beispiel für den Bund seit dem 27. November 2020 die E-Rechnungsverordnung (ERechV); adressiert wird dort mit der Leitweg-ID (siehe <a href="${href('begriffe/')}">Begriffe</a>).</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 8'], ['bmfFaq', 'Frage 4a und 6'])}</p>`;

export default {
  slug: 'e-rechnung-privatperson/',
  kind: 'ratgeber',
  title: 'E-Rechnung Privatperson: Was gilt für Privatkunden?',
  description: 'E-Rechnung Privatperson: Für Rechnungen an Privatkunden gibt es keine Pflicht. Wann trotzdem eine XRechnung kommt und wie du sie öffnest.',
  h1: 'E-Rechnung und Privatpersonen',
  llms: 'Was Privatpersonen zur E-Rechnung wissen müssen: keine Pflicht im B2C, E-Rechnung nur mit Zustimmung, Handwerkerrechnungen (§ 14 Abs. 2 Satz 2 Nr. 3, zwei Jahre aufbewahren), XRechnung öffnen.',
  crumbs: [{ slug: 'e-rechnung-privatperson/', label: 'Privatpersonen' }],
  updated: UPDATED,
  faq,
  html: () => ratgeber({
    h1: 'E-Rechnung und Privatpersonen',
    answer: 'Für Rechnungen an Privatpersonen gibt es <strong>keine E-Rechnungspflicht</strong>: Die Pflicht gilt nur zwischen Unternehmen. Eine E-Rechnung darf eine Privatperson nur mit ihrer Zustimmung bekommen, und Privatpersonen müssen auch keine E-Rechnungen empfangen können.',
    tocItems: [['ueberblick', 'Überblick'], ['warum', 'Warum Privatpersonen nicht betroffen sind'], ['zustimmung', 'Kann ich gezwungen werden?'], ['geoeffnet', 'XRechnung bekommen – was tun?'], ['vereine', 'Vereine und Behörden'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    relatedSlugs: ['e-rechnung-pflicht-ab-wann/', 'xrechnung-in-pdf/', 'e-rechnung-kleinunternehmer/', 'begriffe/'],
  }),
};
