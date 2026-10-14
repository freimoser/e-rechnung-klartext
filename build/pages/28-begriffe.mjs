import { href, abs, esc } from '../site.mjs';
import { src, ratgeber, UPDATED } from '../content.mjs';

// Begriffe mit zitierfähigem Definitionssatz und Quelle
const TERMS = [
  { id: 'e-rechnung', term: 'E-Rechnung', def: 'Eine E-Rechnung ist eine Rechnung, die in einem strukturierten elektronischen Format ausgestellt, übermittelt und empfangen wird und eine elektronische Verarbeitung ermöglicht.', more: 'Das Format muss der europäischen Norm EN 16931 entsprechen oder zwischen den Beteiligten vereinbart sein.', src: ['ustg14', 'Abs. 1 Satz 3 und 6'] },
  { id: 'sonstige-rechnung', term: 'Sonstige Rechnung', def: 'Eine sonstige Rechnung ist eine Rechnung, die auf Papier oder in einem anderen elektronischen Format übermittelt wird, zum Beispiel eine einfache PDF.', src: ['ustg14', 'Abs. 1 Satz 4'] },
  { id: 'en-16931', term: 'EN 16931', def: 'EN 16931 ist die europäische Norm für die elektronische Rechnungsstellung: Teil 1 legt das semantische Datenmodell und die Geschäftsregeln fest, Teil 2 die verpflichtenden Syntaxen UBL 2.1 und UN/CEFACT CII.', more: 'Herausgeber ist das Europäische Komitee für Normung (CEN).', src: ['xrStart'] },
  { id: 'xrechnung', term: 'XRechnung', def: 'XRechnung ist der deutsche Standard für E-Rechnungen auf Grundlage der EN 16931, ein rein strukturiertes Format ohne Bildteil.', more: 'Er gilt als zulässiges E-Rechnungsformat; die gültige Version ist 3.0.2.', src: ['ustae', 'Abschnitt 14.1 Abs. 13'] },
  { id: 'zugferd', term: 'ZUGFeRD', def: 'ZUGFeRD ist ein hybrides Rechnungsformat aus einer PDF/A-3-Datei als Sichtteil und einer eingebetteten XML-Datei mit den Rechnungsdaten.', more: 'Ab Version 2.0.1 gilt es als E-Rechnung, außer in den Profilen MINIMUM und BASIC-WL.', src: ['ferdFaq', 'Aufbau'] },
  { id: 'factur-x', term: 'Factur-X', def: 'Factur-X ist der französische Name des mit ZUGFeRD technisch identischen Formats; ZUGFeRD 2.5.2 entspricht Factur-X 1.09.2.', src: ['ferdZf252'] },
  { id: 'profil', term: 'Profil (ZUGFeRD)', def: 'Ein ZUGFeRD-Profil legt fest, wie viele Daten der XML-Teil enthält: MINIMUM, BASIC WL, BASIC, EN 16931 und EXTENDED sowie das Referenzprofil XRECHNUNG.', more: 'MINIMUM und BASIC WL sind nur Buchungshilfen und keine E-Rechnungen.', src: ['ferdFaq', 'Profile'] },
  { id: 'hybrides-format', term: 'Hybrides Format', def: 'Ein hybrides Format besteht aus einem strukturierten Datenteil (z. B. XML) und einem menschenlesbaren Teil (z. B. PDF) in einer Datei; bei Abweichungen gehen die strukturierten Daten vor.', src: ['ustae', 'Abschnitt 14.1 Abs. 14 und 14.4 Abs. 3'] },
  { id: 'ubl', term: 'UBL', def: 'UBL (Universal Business Language) ist eine von OASIS herausgegebene, frei nutzbare Bibliothek von XML-Geschäftsdokumenten; die Version 2.1 ist eine der beiden Syntaxen der EN 16931.', src: ['ubl21'] },
  { id: 'cii', term: 'CII', def: 'CII (UN/CEFACT Cross Industry Invoice) ist ein XML-Rechnungsformat von UN/CEFACT und neben UBL die zweite verpflichtende Syntax der EN 16931; ZUGFeRD nutzt CII.', src: ['xrStart'] },
  { id: 'kosit', term: 'KoSIT', def: 'Die Koordinierungsstelle für IT-Standards (KoSIT) pflegt und entwickelt den Standard XRechnung im Auftrag des IT-Planungsrats.', more: 'Sie veröffentlicht die Prüfregeln und den Validator und ist die deutsche Peppol Authority.', src: ['erbGlossar', 'K'] },
  { id: 'cius', term: 'CIUS', def: 'Eine CIUS (Core Invoice Usage Specification) ist eine nationale oder branchenbezogene Konkretisierung der EN 16931, die konform zur Norm bleibt; XRechnung ist eine solche CIUS.', src: ['erbGlossar', 'C'] },
  { id: 'leitweg-id', term: 'Leitweg-ID', def: 'Die Leitweg-ID ist eine eindeutige Zeichenkette, mit der E-Rechnungen an Behörden technisch adressiert werden; der öffentliche Auftraggeber teilt sie dem Lieferanten mit.', more: 'In der XRechnung steht sie im Feld Käuferreferenz (BT-10); im B2B-Bereich wird sie nicht benötigt.', src: ['erbGlossar', 'L'] },
  { id: 'peppol', term: 'Peppol', def: 'Peppol ist eine Sammlung von Komponenten und Spezifikationen, mit der Geschäftspartner Dokumente wie E-Rechnungen standardisiert über das Peppol-Netzwerk austauschen; dahinter steht die Non-Profit-Organisation OpenPeppol.', src: ['erbPeppol'] },
  { id: 'peppol-id', term: 'Peppol-ID', def: 'Die Peppol-ID ist die technische Adresse eines Empfängers im Peppol-Netz aus Schemakennung und Nummer, zum Beispiel 0204 plus Leitweg-ID für die öffentliche Verwaltung.', src: ['xeinkaufPeppolFaq'] },
  { id: 'business-term', term: 'Business Term (BT) und Gruppe (BG)', def: 'Business Terms sind die nummerierten Informationselemente der EN 16931, etwa BT-1 für die Rechnungsnummer; Gruppen (BG) fassen zusammengehörige Elemente zusammen, etwa BG-4 für den Verkäufer.', src: ['xrSpez', 'Kapitel 11'] },
  { id: 'geschaeftsregel', term: 'Geschäftsregel (Prüfregel)', def: 'Geschäftsregeln sind technische Vorschriften zur Überprüfung der logischen Abhängigkeiten der in einer E-Rechnung enthaltenen Informationen, etwa ob Summen und Steuersätze zueinander passen.', more: 'Ihre Codes (BR-…) sind unter Fehlercodes erklärt.', src: ['bmf2025', 'Rn. 6b'] },
  { id: 'validierung', term: 'Validierung', def: 'Eine Validierung prüft, ob eine Rechnungsdatei die Formatvorgaben der EN 16931 und die geltenden Geschäftsregeln erfüllt; sie ist keine Voraussetzung für die steuerliche Anerkennung, aber sinnvoll.', src: ['bmfFaq', 'Frage 7'] },
  { id: 'visualisierung', term: 'Visualisierung (Viewer)', def: 'Eine Visualisierungsanwendung stellt den XML-Datensatz einer E-Rechnung für Menschen lesbar dar; eine zusätzliche menschenlesbare Fassung muss der Rechnungssteller nicht liefern.', src: ['ustae', 'Abschnitt 14.1 Abs. 13 und 14.4 Abs. 3'] },
];

const faq = [
  { q: 'Was ist der Unterschied zwischen UBL und CII?', a: 'Beide sind XML-Syntaxen der EN 16931 und bilden dieselben Rechnungsinhalte ab, nur mit unterschiedlichen Elementnamen. XRechnung gibt es in beiden, ZUGFeRD nutzt CII.', src: [['xrStart'], ['ferdFaq', 'Profile']] },
  { q: 'Brauche ich als Unternehmen eine Leitweg-ID?', a: 'Nein. Eine Leitweg-ID braucht nur, wer eine E-Rechnung an eine Behörde stellt; dann teilt die Behörde sie mit. Im B2B-Bereich genügt im Feld BT-10 umsatzsteuerlich schon ein Platzhalter.', src: [['bmfFaq', 'Frage 6']] },
  { q: 'Ist XRechnung dasselbe wie EN 16931?', a: 'Nein. Die EN 16931 ist die europäische Norm; XRechnung ist die deutsche Umsetzung (CIUS) mit zusätzlichen nationalen Regeln, den BR-DE-Regeln.', src: [['erbGlossar', 'C'], ['xrSpez', 'Kapitel 12.6']] },
];

const sections = `        <h2 id="lexikon">Die wichtigsten Begriffe</h2>
        <dl class="terms">
${TERMS.map((t) => `          <dt id="${t.id}"><strong>${esc(t.term)}</strong></dt>
          <dd><p>${esc(t.def)}${t.more ? ' ' + esc(t.more) : ''}</p><p>${src(t.src[0], t.src[1])}</p></dd>`).join('\n')}
        </dl>
        <p>Weiter: <a href="${href('xrechnung-oder-zugferd/')}">XRechnung oder ZUGFeRD</a> · <a href="${href('fehlercodes/')}">Fehlercodes</a> · <a href="${href('peppol/')}">Peppol</a></p>`;

export default {
  slug: 'begriffe/',
  kind: 'reference',
  title: 'E-Rechnung Begriffe: EN 16931, UBL, CII, Leitweg-ID',
  description: 'E-Rechnung Begriffe kurz erklärt: EN 16931, XRechnung, ZUGFeRD, Factur-X, UBL, CII, KoSIT, Leitweg-ID, Profile und Peppol-ID – mit Quellen.',
  h1: 'Begriffe zur E-Rechnung',
  llms: 'Lexikon der E-Rechnung mit zitierfähigen Definitionen und Quellen: E-Rechnung, sonstige Rechnung, EN 16931, XRechnung, ZUGFeRD, Factur-X, Profile, UBL, CII, KoSIT, CIUS, Leitweg-ID, Peppol, Peppol-ID, Business Terms, Geschäftsregeln, Validierung.',
  crumbs: [{ slug: 'begriffe/', label: 'Begriffe' }],
  updated: UPDATED,
  faq,
  jsonld: [{
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Begriffe zur E-Rechnung',
    url: abs('begriffe/'),
    inLanguage: 'de-DE',
    hasDefinedTerm: TERMS.map((t) => ({ '@type': 'DefinedTerm', name: t.term, description: t.def, url: abs('begriffe/') + '#' + t.id })),
  }],
  html: () => ratgeber({
    h1: 'Begriffe zur E-Rechnung',
    answer: 'Die wichtigsten Begriffe zur E-Rechnung in einem Satz: von EN 16931 über XRechnung, ZUGFeRD, UBL und CII bis Leitweg-ID und Peppol-ID – jeweils mit amtlicher oder offizieller Quelle.',
    tocItems: [['lexikon', 'Die wichtigsten Begriffe'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    relatedSlugs: ['xrechnung-oder-zugferd/', 'peppol/', 'fehlercodes/', 'zugferd-rechnung-pruefen/'],
  }),
};
