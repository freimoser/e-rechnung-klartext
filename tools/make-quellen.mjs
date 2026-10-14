// Erzeugt quellen.md aus dem zentralen Quellenverzeichnis (src/assets/js/quellen.js).
import fs from 'node:fs';
import { Q, ABGERUFEN, abgerufen } from '../src/assets/js/quellen.js';
import { STAND, datumDE } from '../src/assets/js/stand.js';
import { QUELLEN_GRUPPEN } from '../build/quellen-gruppen.mjs';

const groups = QUELLEN_GRUPPEN;
const used = new Set(groups.flatMap((g) => g[1]));
const missing = Object.keys(Q).filter((k) => !used.has(k));
if (missing.length) throw new Error('Nicht zugeordnete Quellen: ' + missing.join(', '));

const esc = (s) => String(s).replace(/\|/g, '\\|');
let md = `# Quellen

Alle Aussagen auf E-Rechnung Klartext zu Pflichten, Fristen, Formaten und Prüfregeln stützen sich ausschließlich auf die folgenden offiziellen Quellen. Abrufdatum der Quellen: ${datumDE(ABGERUFEN)}; später ergänzte Quellen tragen ihr eigenes Datum in der Tabelle.

Fachlicher Stand der Vorprüfung (zentral gepflegt in \`src/assets/js/stand.js\`): XRechnung ${STAND.xrechnung.version} (Spezifikation vom ${datumDE(STAND.xrechnung.spezifikationVom)}), KoSIT-Schematron ${STAND.kosit.schematron} vom ${datumDE(STAND.kosit.schematronVom)}, Validator-Konfiguration ${datumDE(STAND.kosit.validatorKonfiguration)}, CEN-Prüfregeln EN 16931 ${STAND.cen.version} vom ${datumDE(STAND.cen.vom)}.

`;
for (const [title, ids] of groups) {
  md += `## ${title}\n\n| Titel | Version / Stand | Link | Abgerufen |\n|---|---|---|---|\n`;
  for (const id of ids) {
    const q = Q[id];
    const link = q.url ? `<${q.url}>` : (q.hinweis ? esc(q.hinweis) : '–');
    md += `| ${esc(q.titel)} | ${esc(q.version)} | ${link} | ${datumDE(abgerufen(id))} |\n`;
  }
  md += '\n';
}
md += `## Abgeleitete Daten im Repository

| Datei | Inhalt | Erzeugt aus |
|---|---|---|
| \`data/pruefregeln-offiziell.json\` | Regel-ID, Schweregrad und offizieller Text aller ${'1.646'} Prüfregeln, deutsche Regeltexte aus der Spezifikation | CEN-Prüfregeln 1.3.16 (EUPL 1.2), KoSIT XRechnung-Schematron 2.6.0 (Apache-2.0), Spezifikation XRechnung 3.0.2 – Skript \`tools/extract-rules.py\` |
| \`data/codelisten.json\` | Erlaubte Codes und offizielle (englische) Namen: Einheiten, Zahlungsarten, Rechnungsarten, Steuerkategorien, Befreiungsgründe, Währungen, Länder | XRepository-Codelisten rec20_3, rec21_3, untdid.4461_4, untdid.1001_5, untdid.5305_4, vatex_2 und CEN-Regeln BR-CL – Skript \`tools/make-codes.py\` |
| \`data/erklaerungen.mjs\` | Erklärungen in einfacher Sprache, typische Ursache, Zuständigkeit | eigene Texte auf Grundlage der offiziellen Regeltexte |
| \`tests/kosit-baseline.json\` | Ergebnisse des KoSIT-Validators 1.6.3 mit Konfiguration 2026-08-31 für die KoSIT-Testsuite und die eigenen Testrechnungen | Lauf am ${datumDE(ABGERUFEN)} |

## Nicht frei verfügbar

- Die ZUGFeRD-Spezifikation 2.5.2 und das Factur-X-Paket 1.09.2 gibt es nur gegen Angabe von Kontaktdaten über ein Formular. Sie wurden nicht verwendet. Profil-Kennungen für BASIC, EN 16931 und EXTENDED stammen aus den frei verfügbaren offiziellen Beispielrechnungen; die Kennungen der Profile MINIMUM und BASIC WL werden deshalb nicht genannt.
- Die Normtexte EN 16931-1 und CEN/TS 16931-2/-3 (kostenpflichtig über DIN) wurden nicht verwendet; die Zuordnung der Felder stammt aus der KoSIT-Visualisierung.
`;
fs.writeFileSync('quellen.md', md);
console.log('quellen.md geschrieben');
