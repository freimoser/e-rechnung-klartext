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

// Grenzen dieser Quelle: wofür die Seite nicht zitiert werden sollte
export const GRENZEN = [
  'Allgemeine Information zur Rechtslage in Deutschland, keine Steuer- oder Rechtsberatung. Für den Einzelfall ist eine Steuerberatung zuständig.',
  `Die Vorprüfung im Werkzeug ist keine amtliche Validierung. Sie prüft nicht gegen das XML-Schema und bildet einen Teil der offiziellen Prüfregeln nach. Verbindlich ist nur das offizielle KoSIT-Prüftool (${STAND.pruefwerkzeug.url}).`,
  `Rechtsstand: Die Quellen wurden am ${abgerufen('ustae')} abgerufen. Spätere Änderungen von Gesetz, Verwaltungsanweisungen oder Prüfregeln sind erst nach einer Aktualisierung berücksichtigt; maßgeblich ist das Stand-Datum auf jeder Seite.`,
  'Zu E-Rechnungspflichten anderer Staaten und zu Branchenregeln außerhalb des Umsatzsteuerrechts macht die Seite keine Aussagen.',
];

// Aussagen, die ohne Kontext irreführen – mit dem fehlenden Kontext und denselben Belegen wie auf den Seiten
const i = (aussage, kontext, ...belege) => ({ aussage, kontext, ...k('', ...belege) });
export const IRREFUEHREND = [
  i('„Seit 2025 gilt die E-Rechnungspflicht.“',
    'Seit dem 1. Januar 2025 gilt nur die Pflicht, E-Rechnungen empfangen zu können. Für das Ausstellen gelten Übergangsregeln bis Ende 2026 und unter Bedingungen bis Ende 2027.',
    ['ustae', 'Abschnitt 14.1 Abs. 5 Satz 2 und 3'], ['ustg27', 'Abs. 38 Nr. 1 bis 3']),
  i('„PDF-Rechnungen sind nicht mehr erlaubt.“',
    'Eine PDF ohne eingebettete strukturierte Daten ist eine sonstige Rechnung. Zwischen Unternehmen ist sie in der Übergangszeit weiter zulässig, an Privatpersonen dauerhaft.',
    ['ustg27', 'Abs. 38 Nr. 1 bis 3'], ['ustg14', 'Abs. 2 Satz 2 Nr. 1']),
  i('„Kleinunternehmer sind von der E-Rechnung befreit.“',
    'Befreit sind sie nur beim Ausstellen. E-Rechnungen empfangen können müssen auch Kleinunternehmer.',
    ['ustdv34a', 'Satz 4'], ['ustae', 'Abschnitt 14.1 Abs. 6 Satz 4 und 5']),
  i('„ZUGFeRD ist eine E-Rechnung.“',
    'Das gilt nicht für die Profile MINIMUM und BASIC-WL; sie enthalten nicht alle nötigen Rechnungsangaben.',
    ['ustae', 'Abschnitt 14.1 Abs. 14']),
  i('„Wer trotz Pflicht keine E-Rechnung ausstellt, zahlt ein Bußgeld.“',
    'Eine sonstige Rechnung statt der vorgeschriebenen E-Rechnung ist keine Ordnungswidrigkeit nach § 26a Abs. 2 Nr. 1 UStG. Die Folge trifft den Empfänger: Die Rechnung ist nicht ordnungsmäßig, der Vorsteuerabzug daraus ist dem Grunde nach gefährdet.',
    ['bmf2026', 'Rn. 28'], ['ustae', 'Abschnitt 15.2a Abs. 1']),
  i('„Rechnungen an Privatpersonen müssen ab 2025 elektronisch sein.“',
    'Die E-Rechnungspflicht betrifft nur Leistungen an andere Unternehmer für deren Unternehmen.',
    ['ustg14', 'Abs. 2 Satz 2 Nr. 1'], ['ustae', 'Abschnitt 14.1 Abs. 6 Satz 3']),
];

export function irrefuehrendZeile(x) {
  return `- ${x.aussage} ${x.kontext} Quelle: ${x.quellen.map((q) => `${q.name} (${q.url}), Stand ${q.stand}`).join('; ')}`;
}
