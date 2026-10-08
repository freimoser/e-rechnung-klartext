// Vorprüfung nach ausgewählten offiziellen Prüfregeln (CEN EN 16931 1.3.16, KoSIT XRechnung-Schematron 2.6.0).
// Die Logik bildet die Schematron-Ausdrücke der jeweiligen Regel nach. Keine amtliche Validierung.
import { dec, sum, mul, div, round2, round0, abs, fmt, decimals, fromInt } from './dec.js';
import { isKnown, codeLists } from './codes.js';
import { v, has } from './xml.js';

const XR30 = 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0';
const XR_IDS = [XR30, XR30 + '#conformant#urn:xeinkauf.de:kosit:extension:xrechnung_3.0', XR30 + '#compliant#urn:xeinkauf.de:kosit:xrechnung:cvd_0.9'];
const SKONTO = /(^|\r?\n)#(SKONTO)#TAGE=([0-9]+#PROZENT=[0-9]+\.[0-9]{2})(#BASISBETRAG=-?[0-9]+\.[0-9]{2})?#$/;
const EMAIL = /^[^@\s]+@([^@.\s]+\.)+[^@.\s]+$/;
const PHONE = /([0-9].*){3,}/;
const URL = /^([a-zA-Z])([a-zA-Z0-9+.-])+:.*/;
const IBAN = /^[A-Z]{2}[0-9]{2}[a-zA-Z0-9]{0,30}$/;
const DE17 = ['326', '380', '384', '389', '381', '875', '876', '877'];
const CATS = ['S', 'Z', 'E', 'AE', 'K', 'G', 'O'];
const CAT_RULE = { S: 'BR-S', Z: 'BR-Z', E: 'BR-E', AE: 'BR-AE', K: 'BR-IC', G: 'BR-G', O: 'BR-O' };
const CAT_NAME = {
  S: 'Regelsatz (S)', Z: 'Nullsatz (Z)', E: 'steuerbefreit (E)', AE: 'Reverse Charge (AE)',
  K: 'innergemeinschaftliche Lieferung (K)', G: 'Ausfuhr (G)', O: 'nicht steuerbar (O)',
};

// Alle Regel-Codes, die diese Vorprüfung melden kann (wird beim Bauen gegen das offizielle Regelwerk geprüft)
export const IMPLEMENTED = [
  'BR-01', 'BR-02', 'BR-03', 'BR-04', 'BR-05', 'BR-06', 'BR-07', 'BR-08', 'BR-09', 'BR-10', 'BR-11', 'BR-12', 'BR-13',
  'BR-14', 'BR-15', 'BR-16', 'BR-17', 'BR-18', 'BR-19', 'BR-20', 'BR-21', 'BR-22', 'BR-23', 'BR-24', 'BR-25', 'BR-26',
  'BR-27', 'BR-28', 'BR-29', 'BR-30', 'BR-31', 'BR-32', 'BR-33', 'BR-36', 'BR-37', 'BR-38', 'BR-41', 'BR-42', 'BR-43',
  'BR-44', 'BR-45', 'BR-46', 'BR-47', 'BR-48', 'BR-49', 'BR-50', 'BR-51', 'BR-52', 'BR-53', 'BR-54', 'BR-55', 'BR-56',
  'BR-57', 'BR-61', 'BR-62', 'BR-63', 'BR-64', 'BR-65',
  'BR-CO-03', 'BR-CO-04', 'BR-CO-09', 'BR-CO-10', 'BR-CO-11', 'BR-CO-12', 'BR-CO-13', 'BR-CO-14', 'BR-CO-15',
  'BR-CO-16', 'BR-CO-17', 'BR-CO-18', 'BR-CO-19', 'BR-CO-20', 'BR-CO-21', 'BR-CO-22', 'BR-CO-23', 'BR-CO-24', 'BR-CO-26',
  ...CATS.flatMap((c) => ['01', '05', '08', '09', '10'].map((n) => `${CAT_RULE[c]}-${n}`)),
  'BR-S-02', 'BR-Z-02', 'BR-E-02', 'BR-AE-02', 'BR-IC-02', 'BR-G-02', 'BR-O-02', 'BR-O-11',
  'BR-CL-01', 'BR-CL-04', 'BR-CL-05', 'BR-CL-14', 'BR-CL-16', 'BR-CL-17', 'BR-CL-18', 'BR-CL-23', 'BR-CL-25',
  'BR-DEC-01', 'BR-DEC-02', 'BR-DEC-05', 'BR-DEC-06', 'BR-DEC-09', 'BR-DEC-10', 'BR-DEC-11', 'BR-DEC-12', 'BR-DEC-13',
  'BR-DEC-14', 'BR-DEC-15', 'BR-DEC-16', 'BR-DEC-17', 'BR-DEC-18', 'BR-DEC-19', 'BR-DEC-20', 'BR-DEC-23', 'BR-DEC-24',
  'BR-DEC-25', 'BR-DEC-27', 'BR-DEC-28',
  'BR-DE-1', 'BR-DE-2', 'BR-DE-3', 'BR-DE-4', 'BR-DE-5', 'BR-DE-6', 'BR-DE-7', 'BR-DE-8', 'BR-DE-9', 'BR-DE-10',
  'BR-DE-11', 'BR-DE-14', 'BR-DE-15', 'BR-DE-16', 'BR-DE-17', 'BR-DE-18', 'BR-DE-19', 'BR-DE-20', 'BR-DE-21',
  'BR-DE-22', 'BR-DE-23-a', 'BR-DE-23-b', 'BR-DE-24-a', 'BR-DE-24-b', 'BR-DE-25-a', 'BR-DE-25-b', 'BR-DE-26',
  'BR-DE-27', 'BR-DE-28', 'BR-DE-30', 'BR-DE-31', 'BR-DE-TMP-32',
  'PEPPOL-EN16931-R001', 'PEPPOL-EN16931-R005', 'PEPPOL-EN16931-R008', 'PEPPOL-EN16931-R010', 'PEPPOL-EN16931-R020',
  'PEPPOL-EN16931-R040', 'PEPPOL-EN16931-R041', 'PEPPOL-EN16931-R042', 'PEPPOL-EN16931-R046', 'PEPPOL-EN16931-R055',
  'PEPPOL-EN16931-R061', 'PEPPOL-EN16931-R110', 'PEPPOL-EN16931-R111', 'PEPPOL-EN16931-R120', 'PEPPOL-EN16931-R121',
  'PEPPOL-EN16931-R130', 'BR-TMP-2', 'BR-TMP-6', 'BR-TMP-7',
];

const money = (x) => (x === null || x === undefined ? '–' : fmt(x));
const d = (f) => (f ? dec(f.v) : null);

function ibanOk(raw) {
  const s = String(raw || '').replace(/\s/g, '');
  if (!IBAN.test(s)) return false;
  const re = s.slice(4) + s.slice(0, 2).toUpperCase() + s.slice(2, 4);
  let num = '';
  for (const ch of re) {
    const cp = ch.codePointAt(0);
    num += String(cp > 64 ? cp - 55 : cp - 48);
  }
  let rest = 0;
  for (const digit of num) rest = (rest * 10 + Number(digit)) % 97;
  return rest === 1;
}

// meta: { [ruleId]: { flags: { UBL, CII } } } aus assets/data/pruefregeln-werkzeug.json
export function validate(inv, format, meta = {}) {
  const findings = [];
  const syn = inv.syntax;
  const add = (id, msg, el, also) => {
    const m = meta[id];
    const flag = (m && m.flags && (m.flags[syn] || m.flags.UBL || m.flags.CII)) || 'fatal';
    findings.push({ id, flag, msg, el: el || null, also: also || null });
  };
  const xr = format.isXRechnung && format.xrMajorMinor === '3.0';
  const en = format.applyEN16931;

  if (en) checkEN16931(inv, add);
  if (en) checkCodes(inv, add);
  if (en) checkDecimals(inv, add);
  if (xr) checkXRechnung(inv, add);
  if (xr) checkPeppol(inv, add);
  if (xr) checkTemporary(inv, add);

  const order = { fatal: 0, error: 0, warning: 1, information: 2 };
  findings.sort((a, b) => order[a.flag] - order[b.flag]);
  return findings;
}

/* -------- Nachrechnen (für Anzeige und Regeln) -------- */
export function recompute(inv) {
  const lineSum = sum(inv.lines.map((l) => d(l.net)));
  const allowSum = sum(inv.allowances.map((a) => d(a.amount)));
  const chargeSum = sum(inv.charges.map((c) => d(c.amount)));
  const t = inv.totals || {};
  const vatSum = sum(inv.vat.map((x) => d(x.amount)));
  const rows = [];
  const row = (label, bt, stated, expected) => {
    if (!stated && expected === null) return;
    const s = stated ? dec(stated.v) : null;
    rows.push({ label, bt, stated: s, expected, ok: s !== null && expected !== null ? s === expected : null, el: stated ? stated.el : null });
  };
  row('Summe der Positionen', 'BT-106', t.lineNet, round2(lineSum));
  if (inv.allowances.length || t.allowances) row('Summe Nachlässe', 'BT-107', t.allowances, round2(allowSum));
  if (inv.charges.length || t.charges) row('Summe Zuschläge', 'BT-108', t.charges, round2(chargeSum));
  const lineNet = d(t.lineNet);
  const taxExclExp = lineNet !== null ? round2(lineNet + (d(t.charges) ?? 0n) - (d(t.allowances) ?? 0n)) : null;
  row('Gesamtbetrag ohne Umsatzsteuer', 'BT-109', t.taxExcl, taxExclExp);
  row('Summe Umsatzsteuer', 'BT-110', t.tax, inv.vat.length ? round2(vatSum) : null);
  const taxExcl = d(t.taxExcl);
  const tax = d(t.tax);
  row('Gesamtbetrag mit Umsatzsteuer', 'BT-112', t.taxIncl, taxExcl !== null ? round2(taxExcl + (tax ?? 0n)) : null);
  const taxIncl = d(t.taxIncl);
  row('Fälliger Betrag', 'BT-115', t.due, taxIncl !== null ? round2(taxIncl - (d(t.prepaid) ?? 0n) + (d(t.rounding) ?? 0n)) : null);
  const vatRows = inv.vat.map((x) => {
    const base = d(x.base);
    const rate = d(x.rate);
    const exp = base !== null && rate !== null ? round2(mul(abs(base), rate) / 100n) * (base < 0n ? -1n : 1n) : null;
    const stated = d(x.amount);
    return { cat: v(x.cat), rate, base, stated, expected: exp, ok: stated !== null && exp !== null ? abs(abs(stated) - abs(exp)) < fromInt(1) : null, el: x.amount ? x.amount.el : null };
  });
  return { rows, vatRows };
}

/* -------- EN 16931 -------- */
function checkEN16931(inv, add) {
  const t = inv.totals || {};
  if (!has(inv.specId)) add('BR-01', 'Die Kennung der Spezifikation (BT-24) fehlt. Ohne sie weiß keine Software, nach welchen Regeln die Rechnung aufgebaut ist.', inv.root);
  if (!has(inv.number)) add('BR-02', 'Die Rechnungsnummer (BT-1) fehlt.', inv.root);
  if (!has(inv.issueDate)) add('BR-03', 'Das Rechnungsdatum (BT-2) fehlt.', inv.root);
  if (!has(inv.typeCode)) add('BR-04', 'Die Rechnungsart (BT-3) fehlt.', inv.root);
  if (!has(inv.currency)) add('BR-05', 'Die Währung der Rechnung (BT-5) fehlt.', inv.root);
  const s = inv.seller || {};
  const b = inv.buyer || {};
  if (!has(s.name)) add('BR-06', 'Der Name des Rechnungsstellers (BT-27) fehlt.', s.el || inv.root);
  if (!has(b.name)) add('BR-07', 'Der Name des Rechnungsempfängers (BT-44) fehlt.', b.el || inv.root);
  if (!s.address) add('BR-08', 'Die Anschrift des Rechnungsstellers (BG-5) fehlt.', s.el || inv.root);
  else if (!has(s.address.country)) add('BR-09', 'In der Anschrift des Rechnungsstellers fehlt der Ländercode (BT-40).', s.address.el);
  if (!b.address) add('BR-10', 'Die Anschrift des Rechnungsempfängers (BG-8) fehlt.', b.el || inv.root);
  else if (!has(b.address.country)) add('BR-11', 'In der Anschrift des Rechnungsempfängers fehlt der Ländercode (BT-55).', b.address.el);
  if (!has(t.lineNet)) add('BR-12', 'Die Summe der Positionen (BT-106) fehlt.', t.el || inv.root);
  if (!has(t.taxExcl)) add('BR-13', 'Der Gesamtbetrag ohne Umsatzsteuer (BT-109) fehlt.', t.el || inv.root);
  if (!has(t.taxIncl)) add('BR-14', 'Der Gesamtbetrag mit Umsatzsteuer (BT-112) fehlt.', t.el || inv.root);
  if (!has(t.due)) add('BR-15', 'Der fällige Betrag (BT-115) fehlt.', t.el || inv.root);
  if (!inv.lines.length) add('BR-16', 'Die Rechnung enthält keine einzige Position (BG-25).', inv.root);
  if (inv.payee && !has(inv.payee.name)) add('BR-17', 'Es ist ein abweichender Zahlungsempfänger angegeben, aber ohne Namen (BT-59).', inv.payee.el);
  if (inv.taxRep) {
    if (!has(inv.taxRep.name)) add('BR-18', 'Ein Steuervertreter ist angegeben, aber ohne Namen (BT-62).', inv.taxRep.el);
    if (!inv.taxRep.address) add('BR-19', 'Ein Steuervertreter ist angegeben, aber ohne Anschrift (BG-12).', inv.taxRep.el);
    else if (!has(inv.taxRep.address.country)) add('BR-20', 'In der Anschrift des Steuervertreters fehlt der Ländercode (BT-69).', inv.taxRep.address.el);
    if (!has(inv.taxRep.vatId)) add('BR-56', 'Ein Steuervertreter ist angegeben, aber ohne Umsatzsteuer-Identifikationsnummer (BT-63).', inv.taxRep.el);
  }

  // Positionen
  inv.lines.forEach((l, i) => {
    const n = has(l.id) ? l.id.v : String(i + 1);
    if (!has(l.id)) add('BR-21', `Position ${i + 1}: Die Positionsnummer (BT-126) fehlt.`, l.el);
    if (!has(l.qty)) add('BR-22', `Position ${n}: Die Menge (BT-129) fehlt.`, l.el);
    if (!has(l.unit)) add('BR-23', `Position ${n}: Die Mengeneinheit (BT-130) fehlt.`, l.el);
    if (!has(l.net)) add('BR-24', `Position ${n}: Der Nettobetrag der Position (BT-131) fehlt.`, l.el);
    if (!has(l.name)) add('BR-25', `Position ${n}: Die Artikelbezeichnung (BT-153) fehlt.`, l.el);
    if (!has(l.price.net)) add('BR-26', `Position ${n}: Der Nettopreis (BT-146) fehlt.`, l.el);
    else if (d(l.price.net) < 0n) add('BR-27', `Position ${n}: Der Nettopreis (BT-146) ist negativ (${l.price.net.v}). Preise dürfen nicht negativ sein; Gutschriften werden über Menge oder Rechnungsart abgebildet.`, l.price.net.el);
    if (l.price.gross && d(l.price.gross) < 0n) add('BR-28', `Position ${n}: Der Bruttopreis (BT-148) ist negativ.`, l.price.gross.el);
    if (l.period) {
      if (!l.period.start && !l.period.end) add('BR-CO-20', `Position ${n}: Ein Leistungszeitraum ist angelegt, enthält aber weder Beginn noch Ende.`, l.period.el);
      if (l.period.start && l.period.end && l.period.start.iso && l.period.end.iso && l.period.end.iso < l.period.start.iso) add('BR-30', `Position ${n}: Das Ende des Leistungszeitraums liegt vor dem Beginn.`, l.period.el);
    }
    if (!has(l.vatCat)) add('BR-CO-04', `Position ${n}: Die Umsatzsteuerkategorie der Position (BT-151) fehlt.`, l.el);
    l.allowances.forEach((a) => {
      if (!has(a.amount)) add('BR-41', `Position ${n}: Ein Nachlass hat keinen Betrag (BT-136).`, a.el);
      if (!a.reason && !a.reasonCode) { add('BR-42', `Position ${n}: Ein Nachlass hat weder Grund noch Grund-Code (BT-139/BT-140).`, a.el); add('BR-CO-23', `Position ${n}: Ein Nachlass hat weder Grund noch Grund-Code.`, a.el); }
    });
    l.charges.forEach((c) => {
      if (!has(c.amount)) add('BR-43', `Position ${n}: Ein Zuschlag hat keinen Betrag (BT-141).`, c.el);
      if (!c.reason && !c.reasonCode) { add('BR-44', `Position ${n}: Ein Zuschlag hat weder Grund noch Grund-Code (BT-144/BT-145).`, c.el); add('BR-CO-24', `Position ${n}: Ein Zuschlag hat weder Grund noch Grund-Code.`, c.el); }
    });
    l.attributes.forEach((a) => {
      if (!has(a.name) || !has(a.value)) add('BR-54', `Position ${n}: Eine Artikeleigenschaft hat keinen Namen oder keinen Wert (BT-160/BT-161).`, a.el);
    });
    if (l.stdId && !l.stdId.scheme) add('BR-64', `Position ${n}: Bei der Artikelkennung (BT-157) fehlt das Schema.`, l.stdId.el);
    l.classifications.forEach((c) => { if (c && !c.scheme) add('BR-65', `Position ${n}: Bei der Artikelklassifizierung (BT-158) fehlt das Schema.`, c.el); });
  });

  if (inv.period) {
    if (!inv.period.start && !inv.period.end && !(inv.syntax === 'UBL' && inv.taxPointCode)) add('BR-CO-19', 'Ein Abrechnungszeitraum (BG-14) ist angelegt, enthält aber weder Beginn noch Ende.', inv.period.el);
    const st = inv.period.start;
    const en = inv.period.end;
    if (st && en && st.iso && en.iso && en.iso < st.iso) add('BR-29', `Das Ende des Abrechnungszeitraums (${en.v}) liegt vor dem Beginn (${st.v}).`, inv.period.el);
  }

  // Nachlässe und Zuschläge auf Belegebene
  inv.allowances.forEach((a, i) => {
    if (!has(a.amount)) add('BR-31', `Nachlass ${i + 1}: Der Betrag (BT-92) fehlt.`, a.el);
    if (!has(a.vatCat)) add('BR-32', `Nachlass ${i + 1}: Die Umsatzsteuerkategorie (BT-95) fehlt.`, a.el);
    if (!a.reason && !a.reasonCode) { add('BR-33', `Nachlass ${i + 1}: Es fehlt der Grund oder der Grund-Code (BT-97/BT-98).`, a.el); add('BR-CO-21', `Nachlass ${i + 1}: Es fehlt der Grund oder der Grund-Code.`, a.el); }
  });
  inv.charges.forEach((c, i) => {
    if (!has(c.amount)) add('BR-36', `Zuschlag ${i + 1}: Der Betrag (BT-99) fehlt.`, c.el);
    if (!has(c.vatCat)) add('BR-37', `Zuschlag ${i + 1}: Die Umsatzsteuerkategorie (BT-102) fehlt.`, c.el);
    if (!c.reason && !c.reasonCode) { add('BR-38', `Zuschlag ${i + 1}: Es fehlt der Grund oder der Grund-Code (BT-104/BT-105).`, c.el); add('BR-CO-22', `Zuschlag ${i + 1}: Es fehlt der Grund oder der Grund-Code.`, c.el); }
  });

  // Umsatzsteueraufschlüsselung
  if (!inv.vat.length) add('BR-CO-18', 'Die Rechnung enthält keine Umsatzsteueraufschlüsselung (BG-23).', inv.root);
  inv.vat.forEach((x, i) => {
    const lbl = `Steuerzeile ${i + 1}${has(x.cat) ? ` (${x.cat.v}${has(x.rate) ? ' ' + x.rate.v + ' %' : ''})` : ''}`;
    if (!has(x.base)) add('BR-45', `${lbl}: Der zu versteuernde Betrag (BT-116) fehlt.`, x.el);
    if (!has(x.amount)) add('BR-46', `${lbl}: Der Steuerbetrag (BT-117) fehlt.`, x.el);
    if (!has(x.cat)) add('BR-47', `${lbl}: Die Steuerkategorie (BT-118) fehlt.`, x.el);
    if (!x.rate && v(x.cat) !== 'O') add('BR-48', `${lbl}: Der Steuersatz (BT-119) fehlt.`, x.el);
    // BR-CO-17
    if (has(x.amount)) {
      const amt = d(x.amount);
      const rate = d(x.rate);
      const base = d(x.base) ?? 0n;
      let ok;
      if (rate === null || round0(rate) === 0n) ok = round0(amt) === 0n;
      else {
        const exp = round2(mul(abs(base), rate) / 100n);
        ok = inv.syntax === 'CII'
          ? abs(amt) - fromInt(1) <= exp && abs(amt) + fromInt(1) >= exp
          : abs(amt) - fromInt(1) < exp && abs(amt) + fromInt(1) > exp;
      }
      if (!ok) add('BR-CO-17', `${lbl}: Der Steuerbetrag ${money(amt)} passt nicht zu ${money(base)} × ${x.rate ? x.rate.v : '0'} %.`, x.amount.el);
    }
  });

  // Zahlungsangaben
  inv.paymentMeans.forEach((pm) => {
    const code = v(pm.code);
    if (!has(pm.code)) add('BR-49', 'Bei einer Zahlungsanweisung fehlt der Code der Zahlungsart (BT-81).', pm.el);
    if (['30', '58'].includes(code)) {
      if (!pm.accounts.some((a) => has(a.iban))) add('BR-61', `Zahlungsart ${code} (Überweisung), aber keine Kontonummer bzw. IBAN (BT-84) angegeben.`, pm.el);
      pm.accounts.forEach((a) => { if (!has(a.iban)) add('BR-50', 'Ein Empfängerkonto ist angelegt, aber die Kontokennung (BT-84) ist leer.', a.el); });
    }
    if (pm.card && pm.card.pan && pm.card.pan.v.replace(/\s+/g, ' ').length > 10) add('BR-51', 'Die Kartennummer (BT-87) ist zu lang. Aus Sicherheitsgründen dürfen höchstens die ersten 6 und die letzten 4 Ziffern stehen.', pm.card.pan.el);
  });

  inv.docs.forEach((doc, i) => { if (!has(doc.id)) add('BR-52', `Anlage ${i + 1}: Die Kennung des Dokuments (BT-122) fehlt.`, doc.el); });
  if (has(inv.taxCurrency) && !t.taxAcc) add('BR-53', `Eine Abrechnungswährung für die Umsatzsteuer (BT-6: ${inv.taxCurrency.v}) ist angegeben, aber der Steuerbetrag in dieser Währung (BT-111) fehlt.`, inv.taxCurrency.el);
  inv.preceding.forEach((p) => { if (!has(p.id)) add('BR-55', 'Ein Verweis auf eine frühere Rechnung ist angelegt, aber ohne Rechnungsnummer (BT-25).', p.el); });
  if (inv.delivery && inv.delivery.address && !has(inv.delivery.address.country)) add('BR-57', 'In der Lieferanschrift fehlt der Ländercode (BT-80).', inv.delivery.address.el);
  if (s.endpoint && !s.endpoint.scheme) add('BR-62', 'Bei der elektronischen Adresse des Rechnungsstellers (BT-34) fehlt das Schema.', s.endpoint.el);
  if (b.endpoint && !b.endpoint.scheme) add('BR-63', 'Bei der elektronischen Adresse des Rechnungsempfängers (BT-49) fehlt das Schema.', b.endpoint.el);
  if (inv.taxPointDate && inv.taxPointCode) add('BR-CO-03', 'Es sind sowohl ein Datum der Steuerfälligkeit (BT-7) als auch ein Code dafür (BT-8) angegeben. Erlaubt ist nur eines von beiden.', inv.taxPointDate.el);

  // BR-CO-09: Präfix der USt-IdNr.
  const countries = codeLists().laender;
  for (const [vat, who] of [[s.vatId, 'des Rechnungsstellers'], [b.vatId, 'des Rechnungsempfängers'], [inv.taxRep && inv.taxRep.vatId, 'des Steuervertreters']]) {
    if (vat && countries && !countries.includes(vat.v.slice(0, 2)) && vat.v.slice(0, 2) !== 'EL') add('BR-CO-09', `Die Umsatzsteuer-Identifikationsnummer ${who} (${vat.v}) beginnt nicht mit einem gültigen Länderkürzel.`, vat.el);
  }
  if (!(s.ids && s.ids.length) && !s.legalId && !s.vatId) add('BR-CO-26', 'Der Rechnungssteller ist nicht eindeutig gekennzeichnet: Es fehlt eine Kennung (BT-29), eine Registernummer (BT-30) oder die Umsatzsteuer-Identifikationsnummer (BT-31).', s.el || inv.root);

  // Summen BR-CO-10 bis BR-CO-16
  const lineSum = round2(sum(inv.lines.map((l) => d(l.net))));
  if (has(t.lineNet) && inv.lines.every((l) => has(l.net)) && d(t.lineNet) !== lineSum) {
    add('BR-CO-10', `Die Summe der Positionen (BT-106) ist mit ${money(d(t.lineNet))} angegeben, die Positionen ergeben zusammen aber ${money(lineSum)}.`, t.lineNet.el);
  }
  const allowSum = round2(sum(inv.allowances.map((a) => d(a.amount))));
  if (t.allowances ? d(t.allowances) !== allowSum : inv.allowances.length > 0) {
    add('BR-CO-11', `Die Summe der Nachlässe (BT-107) ${t.allowances ? `ist ${money(d(t.allowances))}` : 'fehlt'}, die einzelnen Nachlässe ergeben ${money(allowSum)}.`, t.allowances ? t.allowances.el : t.el);
  }
  const chargeSum = round2(sum(inv.charges.map((c) => d(c.amount))));
  if (t.charges ? d(t.charges) !== chargeSum : inv.charges.length > 0) {
    add('BR-CO-12', `Die Summe der Zuschläge (BT-108) ${t.charges ? `ist ${money(d(t.charges))}` : 'fehlt'}, die einzelnen Zuschläge ergeben ${money(chargeSum)}.`, t.charges ? t.charges.el : t.el);
  }
  if (has(t.taxExcl) && has(t.lineNet)) {
    const exp = round2(d(t.lineNet) + (d(t.charges) ?? 0n) - (d(t.allowances) ?? 0n));
    if (d(t.taxExcl) !== exp) add('BR-CO-13', `Der Gesamtbetrag ohne Umsatzsteuer (BT-109) ist ${money(d(t.taxExcl))}, aus Positionen, Zuschlägen und Nachlässen ergibt sich ${money(exp)}.`, t.taxExcl.el);
  }
  if (inv.vat.length && t.tax) {
    const vs = round2(sum(inv.vat.map((x) => d(x.amount))));
    if (d(t.tax) !== vs) add('BR-CO-14', `Die Summe der Umsatzsteuer (BT-110) ist ${money(d(t.tax))}, die Steuerzeilen ergeben zusammen ${money(vs)}.`, t.tax.el);
  }
  if (has(t.taxIncl) && has(t.taxExcl)) {
    const exp = round2(d(t.taxExcl) + (d(t.tax) ?? 0n));
    const ok = t.tax ? d(t.taxIncl) === exp : (inv.syntax === 'CII' && d(t.taxIncl) === d(t.taxExcl));
    if (!ok) add('BR-CO-15', `Der Gesamtbetrag mit Umsatzsteuer (BT-112) ist ${money(d(t.taxIncl))}, erwartet werden ${money(exp)} (netto plus Umsatzsteuer).`, t.taxIncl.el);
  }
  if (has(t.due) && has(t.taxIncl)) {
    const raw = d(t.taxIncl) - (d(t.prepaid) ?? 0n);
    const due = d(t.due);
    const rnd = d(t.rounding);
    let ok;
    if (inv.syntax === 'CII') ok = due === raw + (rnd ?? 0n);
    else ok = rnd !== null ? round2(due - rnd) === round2(raw) : due === (t.prepaid ? round2(raw) : d(t.taxIncl));
    if (!ok) add('BR-CO-16', `Der fällige Betrag (BT-115) ist ${money(due)}, erwartet werden ${money(round2(raw + (rnd ?? 0n)))} (Gesamtbetrag minus bereits gezahlt plus Rundung).`, t.due.el);
  }

  checkVatCategories(inv, add);
}

function catOf(f) {
  return f ? f.v.trim() : '';
}

function checkVatCategories(inv, add) {
  const s = inv.seller || {};
  const b = inv.buyer || {};
  const sellerAnyTax = !!(s.vatId || s.taxId);
  const sellerVat = !!s.vatId;
  const repVat = !!(inv.taxRep && inv.taxRep.vatId);
  const buyerVat = !!b.vatId;
  const buyerLegal = !!b.legalId;

  for (const c of CATS) {
    const R = CAT_RULE[c];
    const lines = inv.lines.filter((l) => catOf(l.vatCat) === c);
    const allows = inv.allowances.filter((a) => catOf(a.vatCat) === c);
    const charges = inv.charges.filter((x) => catOf(x.vatCat) === c);
    const bds = inv.vat.filter((x) => catOf(x.cat) === c);
    const used = lines.length + allows.length + charges.length;
    // -01
    if (c === 'S') {
      if ((used > 0) !== (bds.length > 0)) add('BR-S-01', used ? 'Es gibt Positionen mit Regelsteuersatz (S), aber keine passende Zeile in der Umsatzsteueraufschlüsselung.' : 'Die Umsatzsteueraufschlüsselung enthält eine Zeile mit Regelsteuersatz (S), aber keine Position nutzt diese Kategorie.', inv.root);
    } else if ((used > 0 || bds.length > 0) && bds.length !== 1) {
      add(`${R}-01`, `Für die Kategorie ${CAT_NAME[c]} muss es genau eine Zeile in der Umsatzsteueraufschlüsselung geben, gefunden: ${bds.length}.`, inv.root);
    }
    // -02 (Positionen)
    if (lines.length) {
      if (['S', 'Z', 'E'].includes(c) && !(sellerAnyTax || repVat)) add(`${R}-02`, `Positionen mit ${CAT_NAME[c]}, aber der Rechnungssteller hat weder Umsatzsteuer-Identifikationsnummer noch Steuernummer (BT-31/BT-32) und es gibt keinen Steuervertreter.`, s.el || inv.root);
      if (c === 'AE' && !((sellerAnyTax || repVat) && (buyerVat || buyerLegal))) add('BR-AE-02', 'Reverse Charge (AE): Es fehlen die Steuernummer bzw. USt-IdNr. des Rechnungsstellers oder die USt-IdNr. bzw. Registernummer des Empfängers.', inv.root);
      if (c === 'K' && !((sellerVat || repVat) && buyerVat)) add('BR-IC-02', 'Innergemeinschaftliche Lieferung (K): Es fehlen die USt-IdNr. des Rechnungsstellers und/oder des Empfängers.', inv.root);
      if (c === 'G' && !(sellerVat || repVat)) add('BR-G-02', 'Ausfuhr (G): Die USt-IdNr. des Rechnungsstellers (BT-31) fehlt.', s.el || inv.root);
      if (c === 'O' && (sellerVat || repVat || buyerVat)) add('BR-O-02', 'Nicht steuerbar (O): Die Rechnung darf dann keine USt-IdNr. des Rechnungsstellers, Steuervertreters oder Empfängers enthalten.', inv.root);
    }
    // -05 Steuersatz der Position
    lines.forEach((l) => {
      const r = d(l.vatRate);
      const n = v(l.id);
      if (c === 'S' && !(r !== null && r > 0n)) add('BR-S-05', `Position ${n}: Bei Regelsteuersatz (S) muss der Steuersatz größer als 0 sein.`, l.el);
      if (['Z', 'E', 'AE', 'K', 'G'].includes(c) && !(r !== null && r === 0n)) add(`${R}-05`, `Position ${n}: Bei ${CAT_NAME[c]} muss der Steuersatz 0 sein.`, l.el);
      if (c === 'O' && l.vatRate) add('BR-O-05', `Position ${n}: Bei nicht steuerbaren Umsätzen (O) darf kein Steuersatz angegeben sein.`, l.el);
    });
    // -08, -09, -10 je Aufschlüsselungszeile
    bds.forEach((x) => {
      const base = d(x.base);
      const amt = d(x.amount);
      const rate = d(x.rate);
      if (base !== null) {
        let ls = lines;
        let as = allows;
        let cs = charges;
        if (c === 'S' && rate !== null) {
          ls = lines.filter((l) => d(l.vatRate) === rate);
          as = allows.filter((a) => d(a.vatRate) === rate);
          cs = charges.filter((a) => d(a.vatRate) === rate);
        }
        const exp = inv.syntax === 'CII'
          ? round2(sum(ls.map((l) => d(l.net)))) + round2(sum(cs.map((a) => d(a.amount)))) - round2(sum(as.map((a) => d(a.amount))))
          : sum(ls.map((l) => d(l.net))) + sum(cs.map((a) => d(a.amount))) - sum(as.map((a) => d(a.amount)));
        const ok = c === 'S' && inv.syntax === 'UBL'
          ? base - fromInt(1) < exp && base + fromInt(1) > exp
          : base === exp;
        if (!ok) add(`${R}-08`, `${CAT_NAME[c]}${rate !== null ? ' ' + x.rate.v + ' %' : ''}: Der zu versteuernde Betrag (BT-116) ist ${money(base)}, aus den Positionen, Zuschlägen und Nachlässen ergibt sich ${money(exp)}.`, x.base.el);
      }
      if (amt !== null) {
        if (c === 'S') {
          if (rate !== null && base !== null) {
            const exp = round2(mul(abs(base), rate) / 100n);
            if (!(abs(amt) - fromInt(1) < exp && abs(amt) + fromInt(1) > exp)) add('BR-S-09', `Regelsteuersatz ${x.rate.v} %: Der Steuerbetrag ${money(amt)} passt nicht zum Betrag ${money(base)} (erwartet etwa ${money(exp)}).`, x.amount.el);
          }
        } else if (amt !== 0n) add(`${R}-09`, `${CAT_NAME[c]}: Der Steuerbetrag (BT-117) muss 0 sein, ist aber ${money(amt)}.`, x.amount.el);
      }
      const hasReason = !!(x.exReason || x.exCode);
      if (['S', 'Z'].includes(c) && hasReason) add(`${R}-10`, `${CAT_NAME[c]}: Hier darf kein Befreiungsgrund (BT-120/BT-121) angegeben sein.`, x.el);
      if (['E', 'AE', 'K', 'G', 'O'].includes(c) && !hasReason) add(`${R}-10`, `${CAT_NAME[c]}: Es fehlt der Grund für die Steuerbefreiung (BT-120 oder BT-121).`, x.el);
    });
  }
  const hasO = inv.vat.some((x) => catOf(x.cat) === 'O');
  if (hasO && inv.vat.some((x) => catOf(x.cat) !== 'O')) add('BR-O-11', 'Bei nicht steuerbaren Umsätzen (O) darf die Umsatzsteueraufschlüsselung keine weiteren Kategorien enthalten.', inv.root);
}

/* -------- Codelisten -------- */
function checkCodes(inv, add) {
  if (!codeLists().waehrungen) return;
  const bad = (list, f) => f && has(f) && isKnown(list, f.v) === false;
  if (bad('rechnungsarten', inv.typeCode)) add('BR-CL-01', `Die Rechnungsart „${inv.typeCode.v}“ (BT-3) steht nicht in der erlaubten Codeliste.`, inv.typeCode.el);
  if (bad('waehrungen', inv.currency)) add('BR-CL-04', `Der Währungscode „${inv.currency.v}“ (BT-5) ist nicht gültig.`, inv.currency.el);
  if (bad('waehrungen', inv.taxCurrency)) add('BR-CL-05', `Der Währungscode „${inv.taxCurrency.v}“ (BT-6) ist nicht gültig.`, inv.taxCurrency.el);
  const addrs = [inv.seller && inv.seller.address, inv.buyer && inv.buyer.address, inv.taxRep && inv.taxRep.address, inv.delivery && inv.delivery.address];
  addrs.forEach((a) => { if (a && bad('laender', a.country)) add('BR-CL-14', `Der Ländercode „${a.country.v}“ ist nicht gültig (ISO 3166-1).`, a.country.el); });
  inv.paymentMeans.forEach((pm) => { if (bad('zahlungsarten', pm.code)) add('BR-CL-16', `Der Code der Zahlungsart „${pm.code.v}“ (BT-81) ist nicht gültig.`, pm.code.el); });
  [...inv.vat.map((x) => x.cat), ...inv.allowances.map((a) => a.vatCat), ...inv.charges.map((c) => c.vatCat)].forEach((f) => {
    if (bad('steuerkategorien', f)) add('BR-CL-17', `Die Steuerkategorie „${f.v}“ ist nicht gültig.`, f.el);
  });
  inv.lines.forEach((l) => {
    if (bad('steuerkategorien', l.vatCat)) add('BR-CL-18', `Position ${v(l.id)}: Die Steuerkategorie „${l.vatCat.v}“ ist nicht gültig.`, l.vatCat.el);
    if (bad('einheiten', l.unit)) add('BR-CL-23', `Position ${v(l.id)}: Die Mengeneinheit „${l.unit.v}“ steht nicht in der erlaubten Codeliste (UN/ECE Rec. 20/21).`, l.unit.el);
  });
  [inv.seller && inv.seller.endpoint, inv.buyer && inv.buyer.endpoint].forEach((e) => {
    if (e && e.scheme && isKnown('eas', e.scheme) === false) add('BR-CL-25', `Das Schema „${e.scheme}“ der elektronischen Adresse ist nicht in der Codeliste EAS.`, e.el);
  });
}

/* -------- Nachkommastellen -------- */
function checkDecimals(inv, add) {
  const chk = (id, f, what) => { if (f && has(f) && decimals(f.v) > 2) add(id, `${what} hat mehr als zwei Nachkommastellen (${f.v}).`, f.el); };
  inv.allowances.forEach((a) => { chk('BR-DEC-01', a.amount, 'Ein Nachlass (BT-92)'); chk('BR-DEC-02', a.base, 'Der Grundbetrag eines Nachlasses (BT-93)'); });
  inv.charges.forEach((c) => { chk('BR-DEC-05', c.amount, 'Ein Zuschlag (BT-99)'); chk('BR-DEC-06', c.base, 'Der Grundbetrag eines Zuschlags (BT-100)'); });
  const t = inv.totals || {};
  chk('BR-DEC-09', t.lineNet, 'Die Summe der Positionen (BT-106)');
  chk('BR-DEC-10', t.allowances, 'Die Summe der Nachlässe (BT-107)');
  chk('BR-DEC-11', t.charges, 'Die Summe der Zuschläge (BT-108)');
  chk('BR-DEC-12', t.taxExcl, 'Der Gesamtbetrag ohne Umsatzsteuer (BT-109)');
  chk('BR-DEC-13', t.tax, 'Die Summe der Umsatzsteuer (BT-110)');
  chk('BR-DEC-14', t.taxIncl, 'Der Gesamtbetrag mit Umsatzsteuer (BT-112)');
  chk('BR-DEC-15', t.taxAcc, 'Die Umsatzsteuer in Abrechnungswährung (BT-111)');
  chk('BR-DEC-16', t.prepaid, 'Der bereits gezahlte Betrag (BT-113)');
  chk('BR-DEC-17', t.rounding, 'Der Rundungsbetrag (BT-114)');
  chk('BR-DEC-18', t.due, 'Der fällige Betrag (BT-115)');
  inv.vat.forEach((x) => { chk('BR-DEC-19', x.base, 'Ein zu versteuernder Betrag (BT-116)'); chk('BR-DEC-20', x.amount, 'Ein Steuerbetrag (BT-117)'); });
  inv.lines.forEach((l) => {
    chk('BR-DEC-23', l.net, `Der Nettobetrag von Position ${v(l.id)} (BT-131)`);
    l.allowances.forEach((a) => { chk('BR-DEC-24', a.amount, `Ein Nachlass in Position ${v(l.id)} (BT-136)`); chk('BR-DEC-25', a.base, `Ein Nachlass-Grundbetrag in Position ${v(l.id)} (BT-137)`); });
    l.charges.forEach((c) => { chk('BR-DEC-27', c.amount, `Ein Zuschlag in Position ${v(l.id)} (BT-141)`); chk('BR-DEC-28', c.base, `Ein Zuschlags-Grundbetrag in Position ${v(l.id)} (BT-142)`); });
  });
}

/* -------- XRechnung (nationale Regeln) -------- */
function checkXRechnung(inv, add) {
  const s = inv.seller || {};
  const b = inv.buyer || {};
  if (!inv.paymentMeans.length) add('BR-DE-1', 'Es fehlen Angaben zur Zahlung (BG-16), zum Beispiel Zahlungsart und Bankverbindung.', inv.root);
  if (!s.contact) add('BR-DE-2', 'Es fehlen die Kontaktdaten des Rechnungsstellers (BG-6).', s.el || inv.root);
  if (s.address && !has(s.address.city)) add('BR-DE-3', 'Der Ort des Rechnungsstellers (BT-37) fehlt.', s.address.el);
  if (s.address && !has(s.address.zip)) add('BR-DE-4', 'Die Postleitzahl des Rechnungsstellers (BT-38) fehlt.', s.address.el);
  if (s.contact) {
    if (!has(s.contact.name)) add('BR-DE-5', 'Der Ansprechpartner beim Rechnungssteller (BT-41) fehlt.', s.contact.el);
    if (!has(s.contact.phone)) add('BR-DE-6', 'Die Telefonnummer des Rechnungsstellers (BT-42) fehlt.', s.contact.el);
    if (!PHONE.test(v(s.contact.phone).replace(/\s+/g, ' ').trim())) add('BR-DE-27', has(s.contact.phone) ? `Die Telefonnummer „${s.contact.phone.v}“ enthält weniger als drei Ziffern.` : 'Ohne Telefonnummer ist auch die Formatregel für Telefonnummern nicht erfüllt.', s.contact.phone ? s.contact.phone.el : s.contact.el);
    if (!has(s.contact.email)) add('BR-DE-7', 'Die E-Mail-Adresse des Rechnungsstellers (BT-43) fehlt.', s.contact.el);
    if (!EMAIL.test(v(s.contact.email).replace(/\s+/g, ' ').trim())) add('BR-DE-28', has(s.contact.email) ? `„${s.contact.email.v}“ ist keine gültige E-Mail-Adresse.` : 'Ohne E-Mail-Adresse ist auch die Formatregel für E-Mail-Adressen nicht erfüllt.', s.contact.email ? s.contact.email.el : s.contact.el);
  }
  if (b.address && !has(b.address.city)) add('BR-DE-8', 'Der Ort des Rechnungsempfängers (BT-52) fehlt.', b.address.el);
  if (b.address && !has(b.address.zip)) add('BR-DE-9', 'Die Postleitzahl des Rechnungsempfängers (BT-53) fehlt.', b.address.el);
  if (inv.delivery && inv.delivery.address) {
    if (!has(inv.delivery.address.city)) add('BR-DE-10', 'In der Lieferanschrift fehlt der Ort (BT-77).', inv.delivery.address.el);
    if (!has(inv.delivery.address.zip)) add('BR-DE-11', 'In der Lieferanschrift fehlt die Postleitzahl (BT-78).', inv.delivery.address.el);
  }
  inv.vat.forEach((x) => { if (!has(x.rate)) add('BR-DE-14', `In der Umsatzsteueraufschlüsselung (Kategorie ${v(x.cat)}) fehlt der Steuersatz (BT-119).`, x.el); });
  if (!has(inv.buyerRef)) add('BR-DE-15', 'Die Käuferreferenz (BT-10) fehlt. Bei Rechnungen an Behörden steht hier die Leitweg-ID.', inv.root);
  const DE16 = ['S', 'Z', 'E', 'AE', 'K', 'G', 'L', 'M'];
  const used = [...inv.lines.map((l) => catOf(l.vatCat)), ...inv.allowances.map((a) => catOf(a.vatCat)), ...inv.charges.map((c) => catOf(c.vatCat))];
  if (used.some((c) => DE16.includes(c)) && !(s.vatId || s.taxId || inv.taxRep)) add('BR-DE-16', 'Der Rechnungssteller hat weder Umsatzsteuer-Identifikationsnummer (BT-31) noch Steuernummer (BT-32) angegeben, und es gibt keinen Steuervertreter.', s.el || inv.root);
  if (has(inv.typeCode) && !DE17.includes(inv.typeCode.v)) add('BR-DE-17', `Die Rechnungsart ${inv.typeCode.v} ist in XRechnung nicht vorgesehen. Üblich sind 326, 380, 381, 384, 389, 875, 876 und 877.`, inv.typeCode.el);
  // BR-DE-18 Skonto
  const terms = inv.paymentTerms[0];
  if (terms) {
    const raw = terms.el.textContent;
    const skontoLines = raw.split(/\r?\n/).filter((l) => l.trim().startsWith('#'));
    if (skontoLines.length) {
      const allOk = skontoLines.every((l) => SKONTO.test(l.replace(/\s+/g, ' ').trim()));
      const parts = raw.split(/#.+#/);
      const tailOk = /^\s*\n/.test(parts[parts.length - 1]);
      if (!allOk || !tailOk) add('BR-DE-18', 'Die Skonto-Angabe in den Zahlungsbedingungen (BT-20) hat nicht das vorgeschriebene Format, z. B. „#SKONTO#TAGE=14#PROZENT=2.00#“ mit Zeilenumbruch am Ende.', terms.el);
    }
  }
  inv.paymentMeans.forEach((pm) => {
    const code = v(pm.code);
    if (code === '58' && !ibanOk(pm.accounts[0] ? v(pm.accounts[0].iban) : '')) add('BR-DE-19', `Die IBAN ${pm.accounts[0] ? '„' + v(pm.accounts[0].iban) + '“ ' : ''}ist nicht gültig (Prüfziffer oder Aufbau falsch).`, pm.accounts[0] ? pm.accounts[0].el : pm.el);
    if (code === '59' && !ibanOk(v(pm.debitedAccount))) add('BR-DE-20', 'Die IBAN des zu belastenden Kontos (BT-91) ist nicht gültig.', pm.debitedAccount ? pm.debitedAccount.el : pm.el);
    const cii = inv.syntax === 'CII';
    // In CII gehören Mandat (BT-89) und Gläubiger-ID (BT-90) zum Zahlungsabschnitt der Rechnung
    const ddInfo = cii ? !!(pm.mandate || pm.creditorId || pm.debitedAccount) : !!pm.mandate;
    if (['30', '58'].includes(code)) {
      if (!pm.accounts.length) add('BR-DE-23-a', `Zahlungsart Überweisung (${code}), aber ohne Bankverbindung (BG-17).`, pm.el);
      if (pm.card || ddInfo) add('BR-DE-23-b', `Zahlungsart Überweisung (${code}): Karten- oder Lastschriftangaben dürfen dann nicht enthalten sein.`, pm.el);
    }
    if (['48', '54', '55'].includes(code)) {
      if (!pm.card) add('BR-DE-24-a', `Zahlungsart Karte (${code}), aber ohne Kartenangaben (BG-18).`, pm.el);
      if (pm.accounts.length || ddInfo) add('BR-DE-24-b', `Zahlungsart Karte (${code}): Überweisungs- oder Lastschriftangaben dürfen dann nicht enthalten sein.`, pm.el);
    }
    if (code === '59') {
      if (!ddInfo) add('BR-DE-25-a', 'Zahlungsart SEPA-Lastschrift (59), aber ohne Mandatsangaben (BG-19).', pm.el);
      const ciiBank = cii && pm.el && Array.from(pm.el.children).some((c) => ['PayeeSpecifiedCreditorFinancialInstitution', 'PayerSpecifiedDebtorFinancialInstitution'].includes(c.localName));
      if (pm.accounts.length || pm.card || ciiBank) add('BR-DE-25-b', 'Zahlungsart SEPA-Lastschrift (59): Überweisungs- oder Kartenangaben dürfen dann nicht enthalten sein.', pm.el);
    }
  });
  if (!XR_IDS.includes(v(inv.specId))) add('BR-DE-21', `Die Kennung der Spezifikation (BT-24) „${v(inv.specId)}“ entspricht nicht der aktuellen XRechnung-Kennung.`, inv.specId ? inv.specId.el : inv.root);
  const names = inv.docs.map((x) => x.bin && x.bin.filename).filter(Boolean);
  if (new Set(names).size !== names.length) add('BR-DE-22', 'Mehrere Anlagen haben denselben Dateinamen (BT-125). Jeder Dateiname darf nur einmal vorkommen.', inv.root);
  if (v(inv.typeCode) === '384' && !inv.preceding.length) add('BR-DE-26', 'Es handelt sich um eine korrigierte Rechnung (384), aber der Verweis auf die ursprüngliche Rechnung (BG-3) fehlt.', inv.typeCode.el);
  const pms = inv.paymentMeans;
  const bt89 = pms.some((pm) => pm.mandate);
  const bt90 = pms.some((pm) => pm.creditorId);
  const bt91 = pms.some((pm) => pm.debitedAccount);
  if (inv.syntax === 'CII') {
    const bg19 = bt89 || bt90 || bt91;
    if (bg19 && !((bt89 || bt91) && bt90)) add('BR-DE-30', 'SEPA-Lastschrift: Die Gläubiger-Identifikationsnummer (BT-90) fehlt.', inv.root);
    if (bg19 && !((bt89 || bt90) && bt91)) add('BR-DE-31', 'SEPA-Lastschrift: Die IBAN des zu belastenden Kontos (BT-91) fehlt.', inv.root);
  } else if (bt89 || pms.some((pm) => pm.el && pm.el.getElementsByTagNameNS('*', 'PaymentMandate').length)) {
    if (!bt90) add('BR-DE-30', 'SEPA-Lastschrift: Die Gläubiger-Identifikationsnummer (BT-90) fehlt.', inv.root);
    if (!bt91) add('BR-DE-31', 'SEPA-Lastschrift: Die IBAN des zu belastenden Kontos (BT-91) fehlt.', inv.root);
  }
  const deliveryInfo = (inv.delivery && inv.delivery.date) || inv.period || (inv.lines.length && inv.lines.every((l) => l.period));
  if (!deliveryInfo) add('BR-DE-TMP-32', 'Es fehlt ein Liefer- bzw. Leistungsdatum (BT-72) oder ein Leistungszeitraum (BG-14 oder in jeder Position BG-26).', inv.root);
}

/* -------- Von Peppol übernommene Regeln (Teil von XRechnung 3.0) -------- */
function checkPeppol(inv, add) {
  if (!inv.processId) add('PEPPOL-EN16931-R001', 'Die Prozesskennung (BT-23) fehlt.', inv.root);
  if (has(inv.taxCurrency) && has(inv.currency) && inv.taxCurrency.v === inv.currency.v) add('PEPPOL-EN16931-R005', 'Die Abrechnungswährung der Umsatzsteuer (BT-6) darf nicht gleich der Rechnungswährung (BT-5) sein. Dann wird BT-6 einfach weggelassen.', inv.taxCurrency.el);
  // R008: leere Elemente
  let firstEmpty = null;
  let count = 0;
  for (const el of inv.root.getElementsByTagName('*')) {
    if (el.children.length || el.textContent.trim() !== '') continue;
    if (inv.syntax === 'UBL' && el.localName === 'ID' && el.parentElement && el.parentElement.localName === 'OrderReference') continue;
    if (inv.syntax === 'CII' && el.localName === 'ApplicableHeaderTradeDelivery') continue;
    count += 1;
    if (!firstEmpty) firstEmpty = el;
  }
  if (count) add('PEPPOL-EN16931-R008', `Die Datei enthält ${count === 1 ? 'ein leeres Element' : count + ' leere Elemente'} (zum Beispiel <${firstEmpty.localName}>). Leere Elemente sind nicht erlaubt.`, firstEmpty);
  if (inv.buyer && !inv.buyer.endpoint) add('PEPPOL-EN16931-R010', 'Die elektronische Adresse des Rechnungsempfängers (BT-49) fehlt.', inv.buyer.el);
  if (inv.seller && !inv.seller.endpoint) add('PEPPOL-EN16931-R020', 'Die elektronische Adresse des Rechnungsstellers (BT-34) fehlt.', inv.seller.el);
  const slack = v(inv.currency) === 'HUF' ? dec('0.5') : dec('0.02');
  const acs = [...inv.allowances, ...inv.charges, ...inv.lines.flatMap((l) => [...l.allowances, ...l.charges])];
  acs.forEach((a) => {
    if (a.percent && a.base) {
      const exp = div(mul(d(a.base), d(a.percent)), fromInt(100));
      const amt = a.amount ? d(a.amount) : 0n;
      if (!(amt + slack >= exp && amt - slack <= exp)) add('PEPPOL-EN16931-R040', `Ein ${a.isCharge ? 'Zuschlag' : 'Nachlass'} von ${money(amt)} passt nicht zu ${a.percent.v} % von ${money(d(a.base))}.`, a.el);
    }
    if (a.percent && !a.base) add('PEPPOL-EN16931-R041', `Bei einem ${a.isCharge ? 'Zuschlag' : 'Nachlass'} ist ein Prozentsatz angegeben, aber kein Grundbetrag.`, a.el);
    if (!a.percent && a.base) add('PEPPOL-EN16931-R042', `Bei einem ${a.isCharge ? 'Zuschlag' : 'Nachlass'} ist ein Grundbetrag angegeben, aber kein Prozentsatz.`, a.el);
  });
  const periodStart = inv.period && inv.period.start ? inv.period.start.iso : null;
  const periodEnd = inv.period && inv.period.end ? inv.period.end.iso : null;
  inv.lines.forEach((l) => {
    const n = v(l.id);
    if (l.price.gross) {
      const exp = d(l.price.gross) - (l.price.discount ? d(l.price.discount) : 0n);
      if (l.price.net && d(l.price.net) !== exp) add('PEPPOL-EN16931-R046', `Position ${n}: Der Nettopreis (${l.price.net.v}) muss Bruttopreis minus Rabatt sein (${money(exp)}).`, l.price.net.el);
    }
    if (l.period && periodStart && l.period.start && l.period.start.iso && l.period.start.iso < periodStart) add('PEPPOL-EN16931-R110', `Position ${n}: Der Leistungsbeginn liegt vor dem Abrechnungszeitraum der Rechnung.`, l.period.el);
    if (l.period && periodEnd && l.period.end && l.period.end.iso && l.period.end.iso > periodEnd) add('PEPPOL-EN16931-R111', `Position ${n}: Das Leistungsende liegt nach dem Abrechnungszeitraum der Rechnung.`, l.period.el);
    // R120 Nettobetrag der Position
    const qty = l.qty ? d(l.qty) : fromInt(1);
    const price = l.price.net ? d(l.price.net) : 0n;
    let baseQty = l.price.baseQty ? d(l.price.baseQty) : fromInt(1);
    if (!baseQty) baseQty = fromInt(1);
    const allow = l.allowances.length ? round2(sum(l.allowances.map((a) => d(a.amount)))) : 0n;
    const charge = l.charges.length ? round2(sum(l.charges.map((c) => d(c.amount)))) : 0n;
    const exp = mul(qty, div(price, baseQty)) + charge - allow;
    const net = l.net ? d(l.net) : 0n;
    if (qty !== null && price !== null && !(net + slack >= exp && net - slack <= exp)) add('PEPPOL-EN16931-R120', `Position ${n}: Der Nettobetrag ${money(net)} passt nicht zu Menge × Preis (${money(exp)}).`, l.net ? l.net.el : l.el);
    if (l.price.baseQty && !(d(l.price.baseQty) > 0n)) add('PEPPOL-EN16931-R121', `Position ${n}: Die Basismenge des Preises (BT-149) muss größer als 0 sein.`, l.price.baseQty.el);
    if (l.price.baseUnit && l.unit && l.price.baseUnit.v !== l.unit.v) add('PEPPOL-EN16931-R130', `Position ${n}: Die Einheit der Preisbasismenge (${l.price.baseUnit.v}) weicht von der Mengeneinheit (${l.unit.v}) ab.`, l.price.baseUnit.el);
  });
  const t = inv.totals || {};
  if (has(inv.taxCurrency) && t.tax && t.taxAcc) {
    const a = d(t.tax);
    const b = d(t.taxAcc);
    if (!((a <= 0n && b <= 0n) || (a >= 0n && b >= 0n))) add('PEPPOL-EN16931-R055', 'Die Umsatzsteuer in Rechnungswährung (BT-110) und in Abrechnungswährung (BT-111) haben unterschiedliche Vorzeichen.', t.taxAcc.el);
  }
  inv.paymentMeans.forEach((pm) => {
    if (['49', '59'].includes(v(pm.code)) && !pm.mandate) add('PEPPOL-EN16931-R061', 'Bei Lastschrift fehlt die Mandatsreferenz (BT-89).', pm.el);
  });
}

/* -------- Temporäre KoSIT-Regeln -------- */
function checkTemporary(inv, add) {
  inv.docs.forEach((doc) => {
    if (doc.uri && !URL.test(doc.uri.v)) add('BR-TMP-2', `Der Speicherort einer Anlage (BT-124) „${doc.uri.v}“ ist keine vollständige Internetadresse.`, doc.uri.el);
  });
  const dates = [];
  for (const el of inv.root.getElementsByTagName('*')) {
    if (inv.syntax === 'UBL' && ['IssueDate', 'DueDate', 'StartDate', 'EndDate', 'ActualDeliveryDate', 'TaxPointDate', 'PaymentDueDate'].includes(el.localName)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(el.textContent.trim())) dates.push(el);
    }
  }
  if (dates.length) add('BR-TMP-6', `Ein Datum hat nicht das Format JJJJ-MM-TT (z. B. „${dates[0].textContent.trim()}“).`, dates[0]);
  if (inv.syntax === 'CII') {
    const bad = [inv.issueDate, inv.dueDate, inv.taxPointDate, inv.delivery && inv.delivery.date, inv.period && inv.period.start, inv.period && inv.period.end,
      ...inv.preceding.map((p) => p.date), ...inv.lines.flatMap((l) => (l.period ? [l.period.start, l.period.end] : []))]
      .filter(Boolean)
      .filter((f) => !/^\d{8}$/.test(f.v) || (f.el.getAttribute('format') || '') !== '102');
    if (bad.length) add('BR-TMP-7', `Ein Datum hat nicht das Format JJJJMMTT mit format="102" (z. B. „${bad[0].v}“).`, bad[0].el);
  }
}
