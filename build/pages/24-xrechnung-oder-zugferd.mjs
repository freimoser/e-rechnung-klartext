import { href } from '../site.mjs';
import { src, srcs, ratgeber, UPDATED } from '../content.mjs';
import { STAND } from '../../src/assets/js/stand.js';

const faq = [
  { q: 'Ist ZUGFeRD eine E-Rechnung?', a: 'Ja, ab Version 2.0.1 – außer in den Profilen MINIMUM und BASIC-WL. Diese beiden enthalten zu wenige Angaben und gelten nur als Buchungshilfe.', src: [['ustae', 'Abschnitt 14.1 Abs. 14'], ['ferdFaq', 'Profile']] },
  { q: 'Muss ich als Empfänger beide Formate annehmen?', a: 'Eine E-Rechnung kannst du nicht einfach zurückweisen, um eine Papier- oder PDF-Rechnung zu bekommen. Welches zulässige Format und welchen Übermittlungsweg ihr nutzt, klärt ihr aber zivilrechtlich untereinander.', src: [['ustae', 'Abschnitt 14.1 Abs. 4, 5 und 12']] },
  { q: 'Welche Version von XRechnung ist aktuell?', a: `Aktuell gilt XRechnung ${STAND.xrechnung.version}; Version 3.0 bleibt mindestens bis 31.07.2027 in Kraft. Von XRechnung 4.0 gibt es seit dem 15.09.2026 eine Vorversion, die noch nicht für den produktiven Einsatz gedacht ist; die finale Fassung kommt laut KoSIT voraussichtlich im Frühjahr 2027.`, src: [['xrVersionen'], ['xr4']] },
  { q: 'Was ist Factur-X?', a: 'Factur-X ist die französische Bezeichnung desselben Formats. ZUGFeRD 2.5.2 entspricht Factur-X 1.09.2.', src: [['ferdZf252']] },
  { q: 'Welches Format verlangt der Bund?', a: 'Für E-Rechnungen an die Bundesverwaltung ist grundsätzlich XRechnung in der gültigen Fassung zu verwenden. Andere Standards sind möglich, wenn sie die Vorgaben erfüllen, zum Beispiel ZUGFeRD im Profil XRECHNUNG als reine XML-Datei.', src: [['erbPeppol']] },
];

const sections = `        <h2 id="vergleich">Vergleichstabelle</h2>
        <div class="table-scroll">
          <table>
            <caption>XRechnung und ZUGFeRD im Vergleich. Stand 08.10.2026.</caption>
            <thead><tr><th scope="col">Merkmal</th><th scope="col">XRechnung</th><th scope="col">ZUGFeRD / Factur-X</th></tr></thead>
            <tbody>
              <tr><th scope="row">Aufbau</th><td>Reine XML-Datei, für Menschen ohne Viewer nicht lesbar</td><td>PDF (PDF/A-3) mit eingebetteter XML-Datei: Sichtteil plus Datenteil</td></tr>
              <tr><th scope="row">Syntax</th><td>UBL 2.1 oder UN/CEFACT CII</td><td>UN/CEFACT CII</td></tr>
              <tr><th scope="row">Herausgeber</th><td>KoSIT im Auftrag des IT-Planungsrats</td><td>FeRD (Deutschland) gemeinsam mit FNFE-MPE (Frankreich)</td></tr>
              <tr><th scope="row">Aktuelle Version</th><td>${STAND.xrechnung.version} (3.0 in Kraft mindestens bis 31.07.2027)</td><td>2.5.2 (veröffentlicht 04.08.2026)</td></tr>
              <tr><th scope="row">Profile</th><td>Kern-Standard, dazu Extension und CVD</td><td>MINIMUM, BASIC WL, BASIC, EN 16931 (COMFORT), EXTENDED, Referenzprofil XRECHNUNG</td></tr>
              <tr><th scope="row">Gilt als E-Rechnung (B2B)</th><td>Ja</td><td>Ja ab Version 2.0.1, außer MINIMUM und BASIC-WL</td></tr>
              <tr><th scope="row">Was ist maßgeblich?</th><td>Die XML-Datei</td><td>Der XML-Teil; bei Abweichungen geht er dem PDF-Bild vor</td></tr>
              <tr><th scope="row">Rechnungen an den Bund</th><td>Grundsätzlich vorgeschrieben</td><td>Nur im Profil XRECHNUNG und als reine XML-Datei</td></tr>
              <tr><th scope="row">Typisch für</th><td>Öffentliche Auftraggeber, automatisierte Buchhaltung</td><td>Unternehmen, deren Kunden die Rechnung auch ohne Software lesen sollen</td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 12–14 und 14.4 Abs. 3'], ['xrVersionen'], ['ferdZf252'], ['ferdFaq', 'Profile und PDF/A-3'], ['erbPeppol'])}</p>

        <h2 id="xrechnung">XRechnung kurz erklärt</h2>
        <p>XRechnung ist der deutsche Standard für E-Rechnungen auf Grundlage der europäischen Norm EN 16931. Die Rechnung besteht nur aus Daten im XML-Format. Das macht sie ideal für die automatische Verarbeitung, aber ohne Viewer unlesbar. Die KoSIT pflegt den Standard und gibt die Prüfregeln heraus, die du unter <a href="${href('fehlercodes/')}">Fehlercodes</a> erklärt findest. Anders als bei ZUGFeRD darf bei XRechnung nur die gültige Version eingesetzt werden.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 13'], ['xrStart'], ['ferdFaq', 'Ältere Versionen'])}</p>

        <h2 id="zugferd">ZUGFeRD kurz erklärt</h2>
        <p>ZUGFeRD ist ein hybrides Format: eine PDF-Datei, die man wie gewohnt ansehen und drucken kann, mit einer eingebetteten XML-Datei für die Software. Für die Steuer zählt allein der XML-Teil. Das Profil bestimmt, wie viele Daten im XML stehen. MINIMUM und BASIC WL sind keine E-Rechnungen. Wie du das Profil erkennst, steht unter <a href="${href('zugferd-rechnung-pruefen/')}">ZUGFeRD-Rechnung prüfen</a>.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 14 und 14.4 Abs. 3'], ['ferdFaq', 'Profile'])}</p>

        <h2 id="empfehlung">Welches Format für welchen Fall?</h2>
        <div class="table-scroll">
          <table>
            <thead><tr><th scope="col">Du …</th><th scope="col">Empfehlung</th><th scope="col">Warum</th></tr></thead>
            <tbody>
              <tr><th scope="row">stellst Rechnungen an Behörden des Bundes</th><td>XRechnung</td><td>Grundsätzlich vorgeschrieben; Adressierung über die Leitweg-ID</td></tr>
              <tr><th scope="row">stellst Rechnungen an Unternehmen, die teils noch von Hand buchen</th><td>ZUGFeRD im Profil EN 16931</td><td>Lesbar wie eine PDF und zugleich maschinenlesbar; FeRD empfiehlt EN 16931 für EU-konforme Rechnungen</td></tr>
              <tr><th scope="row">tauschst Rechnungen vollautomatisch mit großen Kunden aus</th><td>Das Format, das ihr vereinbart (häufig XRechnung oder ZUGFeRD EN 16931/EXTENDED)</td><td>Format und Übermittlungsweg sind zivilrechtlich zu klären; EXTENDED braucht laut FeRD eine Absprache</td></tr>
              <tr><th scope="row">bekommst eine E-Rechnung und willst sie lesen</th><td>Egal – beides öffnet das <a href="${href('')}">Werkzeug</a></td><td>Für die Ablage gilt: das Original unverändert aufbewahren</td></tr>
              <tr><th scope="row">bist Kleinunternehmer</th><td>Keine Pflicht; freiwillig ist beides möglich</td><td>Siehe <a href="${href('e-rechnung-kleinunternehmer/')}">Kleinunternehmer</a></td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['erbPeppol'], ['bmfFaq', 'Frage 6'], ['ferdFaq', 'Profile'], ['ustae', 'Abschnitt 14.1 Abs. 4 Satz 7 und Abs. 12 Satz 5'], ['bmf2025', 'Rn. 60'])}</p>`;

export default {
  slug: 'xrechnung-oder-zugferd/',
  kind: 'ratgeber',
  title: 'XRechnung oder ZUGFeRD: Unterschied und Empfehlung',
  description: 'XRechnung oder ZUGFeRD? Unterschied als Vergleichstabelle: Aufbau, Profile, Versionen, was Behörden verlangen – und welches Format für welchen Fall passt.',
  h1: 'XRechnung oder ZUGFeRD: der Unterschied',
  llms: 'Vergleich XRechnung (reines XML, UBL/CII, KoSIT) und ZUGFeRD/Factur-X (PDF/A-3 mit XML, Profile MINIMUM bis EXTENDED, XRECHNUNG): Gültigkeit als E-Rechnung, Versionen, Anforderungen des Bundes, Empfehlung je Fall.',
  crumbs: [{ slug: 'xrechnung-oder-zugferd/', label: 'XRechnung oder ZUGFeRD' }],
  updated: UPDATED,
  faq,
  html: () => ratgeber({
    h1: 'XRechnung oder ZUGFeRD: der Unterschied',
    answer: 'Eine <strong>XRechnung</strong> ist eine reine XML-Datei, eine <strong>ZUGFeRD</strong>-Rechnung eine PDF mit eingebetteter XML-Datei. Beide sind zulässige E-Rechnungen; bei ZUGFeRD gilt das ab Version 2.0.1 und nicht für die Profile MINIMUM und BASIC-WL. Für Rechnungen an den Bund ist grundsätzlich XRechnung vorgeschrieben.',
    tocItems: [['vergleich', 'Vergleichstabelle'], ['xrechnung', 'XRechnung kurz erklärt'], ['zugferd', 'ZUGFeRD kurz erklärt'], ['empfehlung', 'Welches Format für welchen Fall?'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    relatedSlugs: ['zugferd-rechnung-pruefen/', 'xrechnung-in-pdf/', 'peppol/', 'begriffe/'],
  }),
};
