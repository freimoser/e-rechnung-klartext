// Gemeinsame Konstanten und Helfer für den Seitenaufbau.
export const BASE = '/e-rechnung-klartext/';
export const ORIGIN = 'https://freimoser.github.io';
export const SITE_URL = ORIGIN + BASE;
export const SITE_NAME = 'E-Rechnung Klartext';
export const TAGLINE = 'XRechnung und ZUGFeRD öffnen, verstehen und als PDF speichern – ohne Upload';
export const REPO_URL = 'https://github.com/freimoser/e-rechnung-klartext';
export const GOOGLE_VERIFICATION = '6pYvtFCnU7UFcQFajtMSkQ7tYMy3Z_Bt7teKiT5yKNg';
export const THEME_COLOR = '#0f1419';

export const AUTHOR = {
  '@type': 'Person',
  name: 'S. Thomas Freimoser',
  url: 'https://freimoser.github.io/freimoser.de/',
};

// Interne Adresse aus einem Pfad relativ zur Basis ('' = Startseite)
export function href(slug = '') {
  return BASE + slug;
}

export function abs(slug = '') {
  return SITE_URL + slug;
}

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Hauptnavigation (kurz) – die vollständige Liste steht im Fußbereich
export const NAV = [
  { slug: '', label: 'Werkzeug' },
  { slug: 'fehlercodes/', label: 'Fehlercodes' },
  { slug: 'e-rechnung-pflicht-ab-wann/', label: 'Pflicht ab wann?' },
  { slug: 'xrechnung-oder-zugferd/', label: 'XRechnung oder ZUGFeRD' },
  { slug: 'xrechnung-in-pdf/', label: 'In PDF umwandeln' },
  { slug: 'begriffe/', label: 'Begriffe' },
];

export const RATGEBER = [
  { slug: 'xrechnung-oder-zugferd/', label: 'XRechnung oder ZUGFeRD' },
  { slug: 'xrechnung-in-pdf/', label: 'XRechnung in PDF umwandeln' },
  { slug: 'zugferd-rechnung-pruefen/', label: 'ZUGFeRD-Rechnung prüfen' },
  { slug: 'e-rechnung-pflicht-ab-wann/', label: 'E-Rechnung: Pflicht ab wann?' },
  { slug: 'e-rechnung-kleinunternehmer/', label: 'E-Rechnung für Kleinunternehmer' },
  { slug: 'e-rechnung-privatperson/', label: 'E-Rechnung und Privatpersonen' },
  { slug: 'e-rechnung-arztpraxis/', label: 'E-Rechnung in der Arztpraxis' },
  { slug: 'peppol/', label: 'Peppol' },
];

// Weitere Seiten von Thomas – nur Adressen, die beim letzten Prüflauf 200 geliefert haben
// (Prüfung: tests/check-external.mjs). LDT & BDT Viewer und CSV to Calendar lieferten 404.
export const MORE_TOOLS = [
  { url: 'https://freimoser.github.io/gdt-viewer/', label: 'GDT Viewer' },
  { url: 'https://freimoser.github.io/easy-photo-editor/', label: 'Easy Photo Editor' },
  { url: 'https://freimoser.github.io/freimoser.de/', label: 'Über den Entwickler' },
];
