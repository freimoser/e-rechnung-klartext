// Führt offizielle Regeltexte und Erklärungen zusammen (für /fehlercodes/ und das Werkzeug).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, catRule, codeRule, decRule, syntaxRule } from '../data/erklaerungen.mjs';
import { IMPLEMENTED } from '../src/assets/js/validate.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const GROUPS = [
  { key: 'br', title: 'Pflichtangaben und Grundregeln der EN 16931', test: (id) => /^BR-\d+$/.test(id), lead: 'Diese Regeln stammen aus der europäischen Norm EN 16931 und gelten für jede E-Rechnung nach der Norm, also auch für ZUGFeRD ab dem Profil BASIC.' },
  { key: 'br-co', title: 'Rechenregeln und Bedingungen (BR-CO)', test: (id) => /^BR-CO-/.test(id), lead: 'Rechenregeln prüfen, ob Summen, Steuer und Zahlbetrag zusammenpassen, und welche Angaben voneinander abhängen.' },
  { key: 'ust', title: 'Regeln je Umsatzsteuerkategorie', test: (id) => /^BR-(S|Z|E|AE|IC|G|O|AF|AG|B)-/.test(id), lead: 'Kategorien: S = Regelsteuersatz, Z = Nullsatz, E = steuerbefreit, AE = Reverse Charge, IC/K = innergemeinschaftliche Lieferung, G = Ausfuhr, O = nicht steuerbar, AF/L = IGIC (Kanaren), AG/M = IPSI (Ceuta/Melilla), B = Split Payment (Italien).' },
  { key: 'br-cl', title: 'Codelisten (BR-CL)', test: (id) => /^BR-CL-/.test(id), lead: 'Codes wie Währung, Land, Einheit oder Zahlungsart müssen aus der jeweils vorgeschriebenen offiziellen Liste stammen.' },
  { key: 'br-dec', title: 'Nachkommastellen (BR-DEC)', test: (id) => /^BR-DEC-/.test(id), lead: 'Beträge dürfen höchstens zwei Nachkommastellen haben.' },
  { key: 'br-de', title: 'Nationale Regeln der XRechnung (BR-DE)', test: (id) => /^BR-DE-/.test(id), lead: 'Zusätzliche Regeln der KoSIT für die XRechnung. Sie gelten nur für Rechnungen nach dem Standard XRechnung, nicht für ZUGFeRD-Profile außer XRECHNUNG.' },
  { key: 'br-dex', title: 'Regeln der Extension XRechnung (BR-DEX)', test: (id) => /^BR-DEX-/.test(id), lead: 'Gelten nur für Rechnungen nach der Extension XRechnung (z. B. mit Unterpositionen oder Zahlungen Dritter).' },
  { key: 'peppol', title: 'Von Peppol übernommene Regeln (PEPPOL-EN16931)', test: (id) => /^PEPPOL-/.test(id), lead: 'Seit XRechnung 3.0 gehören diese Regeln aus Peppol BIS Billing 3.0 auch zur XRechnung.' },
  { key: 'br-tmp', title: 'Temporäre Regeln (BR-TMP)', test: (id) => /^BR-TMP-/.test(id), lead: 'Übergangsregeln der KoSIT, bis die CEN-Prüfregeln die Fälle selbst abdecken.' },
  { key: 'ubl', title: 'Syntaxregeln für UBL (UBL-CR, UBL-SR, UBL-DT)', test: (id) => /^UBL-/.test(id), lead: 'Diese Regeln prüfen den technischen Aufbau einer UBL-Datei. Die meisten UBL-CR-Regeln sind Warnungen: Das Element ist im Datenmodell der E-Rechnung nicht vorgesehen und wird vom Empfänger ignoriert.' },
  { key: 'cii', title: 'Syntaxregeln für CII (CII-SR, CII-DT)', test: (id) => /^CII-/.test(id), lead: 'Diese Regeln prüfen den technischen Aufbau einer CII-Datei (auch ZUGFeRD und Factur-X). Die meisten CII-SR-Regeln sind Warnungen: Das Element ist im Datenmodell der E-Rechnung nicht vorgesehen.' },
];

function sortKey(id) {
  const m = /^(.*?)-?(\d+)([a-z-]*)$/.exec(id);
  return m ? [m[1], Number(m[2]), m[3]] : [id, 0, ''];
}

export function cmp(a, b) {
  const x = sortKey(a);
  const y = sortKey(b);
  return x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : x[1] - y[1] || (x[2] < y[2] ? -1 : x[2] > y[2] ? 1 : 0);
}

function stripPrefix(t) {
  return String(t || '').replace(/^\[[^\]]+\]\s*-?\s*/, '').trim();
}

export function loadRules() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pruefregeln-offiziell.json'), 'utf8'));
  return raw.map((r) => {
    const st = r.stufe;
    const flags = { UBL: st['XR-UBL'] || st['CEN-UBL'] || null, CII: st['XR-CII'] || st['CEN-CII'] || null };
    const fromXr = !!(st['XR-UBL'] || st['XR-CII']);
    const texts = [...new Set(Object.values(r.texte).map(stripPrefix))];
    const official = texts[0];
    const anyFlag = flags.UBL || flags.CII;
    const expl = E[r.id] || catRule(r.id) || codeRule(r.id) || decRule(r.id, official) || syntaxRule(r.id, official, anyFlag);
    const group = GROUPS.find((g) => g.test(r.id));
    return {
      id: r.id,
      group: group ? group.key : 'other',
      flags,
      source: fromXr ? `KoSIT XRechnung-Schematron 2.6.0` : 'CEN EN16931-Prüfregeln 1.3.16',
      syntaxes: [flags.UBL && 'UBL', flags.CII && 'CII'].filter(Boolean),
      official,
      officialAlt: texts.length > 1 ? texts.slice(1) : [],
      de: r.de && r.de !== official ? r.de : null,
      lang: /[äöüß]| muss | soll | darf |Das Element|Eine Rechnung/.test(official) ? 'de' : 'en',
      ...expl,
    };
  });
}

export function writeToolData(rules, outDir) {
  const ids = new Set(rules.map((r) => r.id));
  const missing = IMPLEMENTED.filter((id) => !ids.has(id));
  if (missing.length) throw new Error(`Die Vorprüfung meldet Codes, die nicht im offiziellen Regelwerk stehen: ${missing.join(', ')}`);
  const data = {};
  for (const r of rules) {
    if (!IMPLEMENTED.includes(r.id)) continue;
    data[r.id] = { flags: r.flags, plain: r.plain, who: r.who };
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'pruefregeln-werkzeug.json'), JSON.stringify(data));
  return Object.keys(data).length;
}
