// Klartext für Codes. Gültige Codes und offizielle (englische) Namen stammen aus den
// Codelisten im XRepository bzw. den CEN-Prüfregeln (assets/data/codelisten.json).
// Für häufige Codes gibt es zusätzlich eine deutsche Übersetzung.

let lists = null;

export async function loadCodes(base) {
  if (lists) return lists;
  try {
    const res = await fetch(base + 'assets/data/codelisten.json');
    lists = await res.json();
  } catch {
    lists = {};
  }
  return lists;
}

export function codeLists() {
  return lists || {};
}

const DE = {
  rechnungsarten: {
    '326': 'Teilrechnung',
    '380': 'Rechnung',
    '381': 'Gutschrift (Rechnungskorrektur zugunsten des Kunden)',
    '383': 'Belastungsanzeige',
    '384': 'Korrigierte Rechnung',
    '386': 'Vorauszahlungsrechnung',
    '389': 'Gutschrift im Gutschriftverfahren (vom Leistungsempfänger ausgestellt)',
    '751': 'Rechnungsinformation für Buchungszwecke',
    '875': 'Abschlagsrechnung (Bauleistung)',
    '876': 'Teilschlussrechnung (Bauleistung)',
    '877': 'Schlussrechnung (Bauleistung)',
  },
  steuerkategorien: {
    S: 'Umsatzsteuer zum Regelsatz oder ermäßigten Satz',
    Z: 'Nullsatz',
    E: 'Steuerbefreit',
    AE: 'Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)',
    K: 'Innergemeinschaftliche Lieferung oder Leistung (steuerfrei)',
    G: 'Ausfuhr außerhalb der EU (steuerfrei)',
    O: 'Nicht steuerbar (außerhalb des Anwendungsbereichs der Umsatzsteuer)',
    L: 'IGIC (Kanarische Inseln)',
    M: 'IPSI (Ceuta und Melilla)',
    B: 'Split Payment (Italien)',
  },
  zahlungsarten: {
    '1': 'Nicht festgelegt',
    '10': 'Barzahlung',
    '20': 'Scheck',
    '30': 'Überweisung (nicht SEPA)',
    '31': 'Überweisung',
    '42': 'Zahlung auf ein Bankkonto',
    '48': 'Bankkarte',
    '49': 'Lastschrift',
    '54': 'Kreditkarte',
    '55': 'Debitkarte',
    '57': 'Dauerauftrag',
    '58': 'SEPA-Überweisung',
    '59': 'SEPA-Lastschrift',
    '68': 'Online-Zahlungsdienst',
    '97': 'Verrechnung',
    ZZZ: 'Individuell vereinbart',
  },
  einheiten: {
    C62: 'Stück',
    H87: 'Stück',
    XPP: 'Stück',
    EA: 'Stück',
    XPK: 'Packung',
    XPA: 'Päckchen',
    XBX: 'Karton',
    XCT: 'Karton',
    XBO: 'Flasche',
    XSA: 'Sack',
    XPX: 'Palette',
    PR: 'Paar',
    SET: 'Satz',
    LS: 'Pauschale',
    E48: 'Leistungseinheit',
    P1: 'Prozent',
    SEC: 'Sekunde',
    MIN: 'Minute',
    HUR: 'Stunde',
    DAY: 'Tag',
    WEE: 'Woche',
    MON: 'Monat',
    QAN: 'Quartal',
    ANN: 'Jahr',
    GRM: 'Gramm',
    KGM: 'Kilogramm',
    TNE: 'Tonne',
    MGM: 'Milligramm',
    MMT: 'Millimeter',
    CMT: 'Zentimeter',
    MTR: 'Meter',
    KMT: 'Kilometer',
    MTK: 'Quadratmeter',
    MTQ: 'Kubikmeter',
    LTR: 'Liter',
    MLT: 'Milliliter',
    KWH: 'Kilowattstunde',
    KWT: 'Kilowatt',
    MWH: 'Megawattstunde',
    D64: 'Blatt',
    ZZ: 'Individuell vereinbart',
  },
};

// Kurzform der Einheit für die Positionstabelle
export function unitLabel(code) {
  if (!code) return '';
  const de = DE.einheiten[code];
  if (de) return de;
  const en = (codeLists().einheiten || {})[code];
  return en ? `${en} (${code})` : code;
}

export function label(list, code) {
  if (!code) return '';
  const de = (DE[list] || {})[code];
  if (de) return de;
  const en = (codeLists()[list] || {})[code];
  return en || '';
}

// Ist der Code laut offizieller Liste gültig? (null = Liste nicht geladen)
export function isKnown(list, code) {
  const l = codeLists()[list];
  if (!l) return null;
  return Array.isArray(l) ? l.includes(code) : Object.prototype.hasOwnProperty.call(l, code);
}

const COUNTRIES = {
  DE: 'Deutschland', AT: 'Österreich', CH: 'Schweiz', FR: 'Frankreich', NL: 'Niederlande', BE: 'Belgien',
  LU: 'Luxemburg', IT: 'Italien', ES: 'Spanien', PL: 'Polen', CZ: 'Tschechien', DK: 'Dänemark', SE: 'Schweden',
  FI: 'Finnland', NO: 'Norwegen', GB: 'Vereinigtes Königreich', IE: 'Irland', PT: 'Portugal', GR: 'Griechenland',
  HU: 'Ungarn', SK: 'Slowakei', SI: 'Slowenien', HR: 'Kroatien', RO: 'Rumänien', BG: 'Bulgarien', EE: 'Estland',
  LV: 'Lettland', LT: 'Litauen', LI: 'Liechtenstein', US: 'Vereinigte Staaten',
};

export function countryLabel(code) {
  return COUNTRIES[code] || code || '';
}

// Elektronische Adresse: Schema-Kennungen (EAS), die in Deutschland häufig vorkommen
const EAS = {
  EM: 'E-Mail',
  '0204': 'Leitweg-ID',
  '9930': 'Umsatzsteuer-ID (DE)',
  '0088': 'GLN',
  '0246': 'Unternehmens-Basisdaten (DE)',
};

export function easLabel(code) {
  return EAS[code] || (code ? `Schema ${code}` : '');
}

// Betreff-Codes von Bemerkungen (UNTDID 4451) zeigen wir als Code an,
// weil die offizielle Liste nicht in den genutzten Quellen enthalten ist.
export function noteSubject(code) {
  return code ? `Betreff ${code}` : '';
}
