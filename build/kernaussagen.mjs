// Kernaussagen für llms.txt – jede mit denselben amtlichen Belegen wie auf den Ratgeberseiten.
import { Q, abgerufen } from '../src/assets/js/quellen.js';
import { STAND } from '../src/assets/js/stand.js';

// k(text, [quellenId, fundstelle], …)
const k = (text, ...belege) => ({
  text,
  quellen: belege.map(([id, fundstelle]) => ({
    name: [Q[id].kurz, fundstelle].filter(Boolean).join(', '),
    url: Q[id].url,
    stand: abgerufen(id),
  })),
});

export const KERNAUSSAGEN = [
  k('Seit dem 1. Januar 2025 müssen alle inländischen Unternehmen E-Rechnungen empfangen können; ein E-Mail-Postfach genügt.',
    ['ustae', 'Abschnitt 14.1 Abs. 5 Satz 2 und 3'], ['ustg27', 'Abs. 38 Nr. 1']),
  k('E-Rechnungen an andere inländische Unternehmen sind spätestens für Umsätze ab dem 1. Januar 2028 Pflicht. Für Umsätze 2025 und 2026 sind Papier oder (mit Zustimmung) andere Formate erlaubt, für 2027 nur noch bei höchstens 800.000 Euro Gesamtumsatz im Vorjahr oder per EDI.',
    ['ustg27', 'Abs. 38 Nr. 1 bis 3']),
  k('Als E-Rechnung gelten insbesondere XRechnung und ZUGFeRD ab Version 2.0.1, ausgenommen die Profile MINIMUM und BASIC-WL. Eine einfache PDF ohne integrierte Daten ist keine E-Rechnung, sondern eine sonstige Rechnung.',
    ['ustg14', 'Abs. 1 Satz 3 und 4'], ['ustae', 'Abschnitt 14.1 Abs. 2, 13 und 14']),
  k('Kleinunternehmer müssen E-Rechnungen empfangen können, dürfen ihre eigenen Rechnungen aber immer als sonstige Rechnung (Papier, PDF) übermitteln.',
    ['ustdv34a', 'Satz 4'], ['ustae', 'Abschnitt 14.1 Abs. 6 Satz 4 und 5']),
  k('Für Rechnungen an Privatpersonen gibt es keine E-Rechnungspflicht; die Pflicht gilt nur für Leistungen an andere Unternehmer für deren Unternehmen.',
    ['ustg14', 'Abs. 2 Satz 2 Nr. 1'], ['ustae', 'Abschnitt 14.1 Abs. 6 Satz 3']),
  k('Für nach § 4 Nr. 8 bis 29 UStG steuerfreie Leistungen, etwa ärztliche Heilbehandlungen, besteht keine Rechnungspflicht und damit keine E-Rechnungspflicht.',
    ['ustg14', 'Abs. 2 Satz 2']),
  k('Rechnungen sind acht Jahre aufzubewahren; bei einer E-Rechnung muss zumindest der strukturierte Teil unversehrt in seiner ursprünglichen Form vorliegen. Eine PDF-Ansicht ersetzt die XML-Datei nicht.',
    ['ustg14b', 'Abs. 1'], ['bmf2025', 'Rn. 60']),
  k(`Aktuell gilt XRechnung ${STAND.xrechnung.version}; die KoSIT-Prüfregeln (Schematron ${STAND.kosit.schematron}) stammen vom ${STAND.kosit.schematronVom}.`,
    ['xrVersionen'], ['xrSchematron']),
];

// Eine Zeile für llms.txt
export function kernaussageZeile(k) {
  return `- ${k.text} Quelle: ${k.quellen.map((q) => `${q.name} (${q.url}), Stand ${q.stand}`).join('; ')}`;
}
