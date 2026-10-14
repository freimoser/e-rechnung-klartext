// Erkennt Standard, Version und Profil einer Rechnung und bewertet, ob das Format
// laut BMF als E-Rechnung gilt. Belege: siehe Konstante QUELLEN.
import { STAND } from './stand.js';
import { Q } from './quellen.js';

const U = Q.ustae.url;
export const QUELLEN = {
  bmfRn25: { text: 'Abschnitt 14.1 Abs. 12–14 UStAE (Stand 2. Juni 2026); BMF-Schreiben vom 15.10.2024, Rn. 25', url: U },
  ustaePdf: { text: 'Abschnitt 14.1 Abs. 2 Satz 4 Nr. 2 UStAE (Stand 2. Juni 2026): PDF-Dateien ohne integrierte Datensätze sind sonstige Rechnungen', url: U },
  bmfHybrid: { text: 'Abschnitt 14.4 Abs. 3 UStAE (Stand 2. Juni 2026): Bei hybriden Formaten ist der strukturierte Teil führend', url: U },
  bmfAufbewahrung: { text: 'BMF-Schreiben vom 15.10.2025, Rn. 60; Abschnitt 14b.1 UStAE', url: Q.bmf2025.url },
  bmfRn26: { text: 'Abschnitt 14.1 Abs. 12 Satz 3–4 UStAE (Stand 2. Juni 2026): weitere europäische Formate nach EN 16931', url: U },
  kositVersionen: { text: 'KoSIT: Versionen und Bundles der XRechnung', url: Q.xrVersionen.url },
  ferdFaq: { text: 'FeRD: FAQ „Zu ZUGFeRD“', url: Q.ferdFaq.url },
};

const XR3 = 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0';

// Liefert eine Beschreibung des Formats.
//   inv: Modell aus parse.js (oder null), container: 'xml' | 'pdf', pdfInfo: Ergebnis aus zugferd.js
export function describeFormat(inv, container, pdfInfo = null) {
  const spec = inv && inv.specId ? inv.specId.v : '';
  const lower = spec.toLowerCase();
  const out = {
    container,
    syntax: inv ? inv.syntax : null,
    syntaxLabel: inv ? (inv.syntax === 'UBL' ? 'UBL 2.1' : 'UN/CEFACT CII') : '',
    standard: 'Unbekannt',
    version: '',
    profile: '',
    specId: spec,
    isXRechnung: false,
    xrMajorMinor: null,
    outdated: null,
    eRechnung: { status: 'unklar', text: '', quelle: null },
    applyEN16931: true,
  };

  // XRechnung (auch als ZUGFeRD-Profil XRECHNUNG)
  const xr = /xrechnung_(\d+)\.(\d+)/.exec(lower);
  if (xr) {
    out.isXRechnung = true;
    out.xrMajorMinor = `${xr[1]}.${xr[2]}`;
    out.standard = 'XRechnung';
    out.version = out.xrMajorMinor === '3.0' ? '3.0.x' : out.xrMajorMinor;
    if (lower.includes('#conformant#') && lower.includes('extension')) out.profile = 'Extension';
    if (lower.includes(':cvd_')) out.profile = 'CVD (saubere Fahrzeuge)';
    if (out.xrMajorMinor !== '3.0') {
      out.outdated = `Diese Rechnung nutzt XRechnung ${out.xrMajorMinor}. Aktuell gültig ist XRechnung ${STAND.xrechnung.version}; Version 2.3 wurde laut KoSIT zum 01.02.2024 außer Kraft gesetzt, ältere Versionen ebenfalls.`;
    }
  } else if (spec === 'urn:cen.eu:en16931:2017') {
    out.standard = container === 'pdf' ? 'ZUGFeRD / Factur-X' : 'EN 16931 (Kernformat)';
    out.profile = container === 'pdf' ? 'EN 16931 (COMFORT)' : '';
  } else if (lower.includes('factur-x.eu') || lower.includes('zugferd')) {
    out.standard = 'ZUGFeRD / Factur-X';
    if (lower.includes('minimum')) out.profile = 'MINIMUM';
    else if (lower.includes('basicwl')) out.profile = 'BASIC WL';
    else if (lower.includes('extended')) out.profile = 'EXTENDED';
    else if (lower.includes('basic')) out.profile = 'BASIC';
    else out.profile = 'unbekanntes Profil';
    if (lower.includes('zugferd.de:2p0')) out.version = '2.0';
  } else if (lower.includes('peppol.eu:2017:poacc:billing:3.0')) {
    out.standard = 'Peppol BIS Billing 3.0';
  } else if (lower.startsWith('urn:cen.eu:en16931:2017')) {
    out.standard = 'EN 16931 mit Zusatzregeln';
  }

  if (container === 'pdf' && out.standard === 'XRechnung') {
    out.standard = 'ZUGFeRD / Factur-X';
    out.profile = 'XRECHNUNG';
  }
  if (pdfInfo && pdfInfo.xmp && pdfInfo.xmp.conformance && !out.profile) out.profile = pdfInfo.xmp.conformance;

  // Bewertung „gilt als E-Rechnung?“
  const r = out.eRechnung;
  if (out.standard === 'XRechnung' || (out.standard === 'ZUGFeRD / Factur-X' && out.profile === 'XRECHNUNG')) {
    r.status = 'ja';
    r.text = 'XRechnung ist laut BMF ein zulässiges Format für E-Rechnungen.';
    r.quelle = QUELLEN.bmfRn25;
    if (out.outdated) {
      r.status = 'unklar';
      r.text = 'Das Format XRechnung ist zulässig, diese Version ist aber nicht mehr in Kraft. Frag beim Rechnungssteller eine aktuelle Fassung an.';
      r.quelle = QUELLEN.kositVersionen;
    }
  } else if (out.standard === 'ZUGFeRD / Factur-X') {
    if (out.profile === 'MINIMUM' || out.profile === 'BASIC WL') {
      r.status = 'nein';
      r.text = `Das Profil ${out.profile} gilt laut BMF nicht als E-Rechnung. Es enthält zu wenige Rechnungsdaten.`;
      out.applyEN16931 = false;
    } else if (out.version === '2.0') {
      r.status = 'unklar';
      r.text = 'ZUGFeRD 2.0: Das BMF erkennt ZUGFeRD erst ab Version 2.0.1 an. An der Kennung lässt sich 2.0 nicht von 2.0.1 unterscheiden. Frag im Zweifel eine aktuelle Fassung an.';
    } else if (['BASIC', 'EN 16931 (COMFORT)', 'EXTENDED'].includes(out.profile)) {
      r.status = 'ja';
      r.text = `ZUGFeRD ab Version 2.0.1 ist laut BMF ein zulässiges E-Rechnungsformat; ausgenommen sind nur die Profile MINIMUM und BASIC-WL. Diese Rechnung nutzt das Profil ${out.profile}.`;
    } else {
      r.status = 'unklar';
      r.text = 'Das ZUGFeRD-Profil ließ sich nicht sicher bestimmen.';
    }
    r.quelle = QUELLEN.bmfRn25;
  } else if (out.standard === 'Peppol BIS Billing 3.0' || out.standard === 'EN 16931 (Kernformat)' || out.standard === 'EN 16931 mit Zusatzregeln') {
    r.status = 'ja';
    r.text = 'Das Format beruht auf der europäischen Norm EN 16931. Solche Formate sind laut BMF als E-Rechnung zulässig, sofern die Rechnung der Norm entspricht.';
    r.quelle = QUELLEN.bmfRn26;
  } else {
    r.status = 'unklar';
    r.text = 'Die Kennung der Spezifikation (BT-24) ist unbekannt oder fehlt. Ob es sich um eine E-Rechnung handelt, lässt sich so nicht feststellen.';
  }
  return out;
}

export function isCurrentXR(spec) {
  return spec && spec.startsWith(XR3);
}
