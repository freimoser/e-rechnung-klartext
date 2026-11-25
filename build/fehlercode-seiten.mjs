// Einzelseiten für Prüfregeln, zu denen es mehr zu sagen gibt als eine Tabellenzeile:
// Behebung Schritt für Schritt und die umsatzsteuerliche Einordnung, jeweils mit Beleg.
// Regeln, die nur ein einzelnes fehlendes Feld melden (z. B. BR-DE-3 „Ort fehlt“), bleiben bewusst in der Tabelle.
import { STAND } from '../src/assets/js/stand.js';

// Umsatzsteuerliche Einordnung nach BMF-Schreiben vom 15.10.2025 (Rn. 6b, 35a) und 15.10.2026 (Rn. 22, 23)
const KEINE_PFLICHTANGABE = {
  text: 'Die betroffene Angabe gehört nicht zu den umsatzsteuerlichen Pflichtangaben. Ein Verstoß gegen diese Geschäftsregel ist umsatzsteuerlich deshalb in der Regel unbeachtlich: Die Datei bleibt eine E-Rechnung, und der Vorsteuerabzug hängt nicht an dieser Angabe. Technisch entspricht die Datei aber nicht den Prüfregeln; eine korrigierte Rechnung ist deshalb trotzdem sinnvoll.',
  src: [['bmf2025', 'Rn. 6b und 35a'], ['bmf2026', 'Rn. 22 und 23']],
};

const pflichtangabe = (was, nr) => ({
  text: `Betroffen ist eine umsatzsteuerliche Pflichtangabe: ${was}. Fehlt sie oder ist sie falsch, ist die Rechnung nicht ordnungsmäßig, und der Vorsteuerabzug des Empfängers ist gefährdet. Der Empfänger sollte sich eine berichtigte E-Rechnung schicken lassen.`,
  src: [['ustg14', `Abs. 4 Satz 1 Nr. ${nr}`], ['bmf2025', 'Rn. 35a'], ['bmf2026', 'Rn. 22']],
});

const SUMMEN = {
  text: 'Die Summenfelder sind keine eigene Pflichtangabe, sie hängen aber am Entgelt und am Steuerbetrag, die nach Steuersätzen aufgeschlüsselt in jede Rechnung gehören. Stimmen Entgelt oder Steuerbetrag nicht, ist die Rechnung nicht ordnungsmäßig. Kläre deshalb, welcher Betrag falsch ist, und lass dir im Zweifel eine berichtigte E-Rechnung schicken.',
  src: [['ustg14', 'Abs. 4 Satz 1 Nr. 7 und 8'], ['bmf2025', 'Rn. 35a'], ['bmf2026', 'Rn. 22']],
};

const NACHRECHNEN = 'Öffne die Rechnung im Werkzeug: Unter „Summen und Steuer nachgerechnet“ siehst du, welcher Betrag abweicht und um wie viel.';

export const CODE_SEITEN = {
  'BR-DE-15': {
    kurz: 'Käuferreferenz fehlt',
    desc: 'BR-DE-15: In der XRechnung fehlt die Käuferreferenz (BT-10), bei Behörden die Leitweg-ID. Ursache, Lösung und warum im B2B ein Platzhalter genügt.',
    beheben: [
      'Frag beim Rechnungsempfänger nach der Referenz. Behörden teilen ihre Leitweg-ID mit, oft schon in der Bestellung.',
      'Trage die Leitweg-ID bzw. Referenz in den Kundenstammdaten deiner Rechnungssoftware ein, damit sie in BT-10 übertragen wird.',
      'Bei Rechnungen an Unternehmen ohne vereinbarte Referenz genügt umsatzsteuerlich ein Platzhalter wie „-“; das Feld darf in der XRechnung aber nicht leer bleiben.',
      'Erzeuge die E-Rechnung neu und prüfe sie, bevor du sie verschickst.',
    ],
    behebenSrc: [['bmfFaq', 'Frage 6']],
    steuer: { text: 'Die Käuferreferenz gehört nicht zu den umsatzsteuerlichen Pflichtangaben. Das BMF nennt die fehlende Käuferreferenz ausdrücklich als Beispiel für einen Geschäftsregelfehler, der umsatzsteuerlich unbeachtlich ist. Bei Rechnungen an Behörden ist die Leitweg-ID aber nötig: Über sie wird die E-Rechnung eindeutig adressiert und an den öffentlichen Auftraggeber weitergeleitet.', src: [['bmf2025', 'Rn. 6b und 35a'], ['bmfFaq', 'Frage 6']] },
    verwandt: ['BR-DE-1', 'BR-DE-2', 'BR-DE-21'],
    links: [['peppol/', 'Peppol und Rechnungen an Behörden'], ['begriffe/#leitweg-id', 'Was ist eine Leitweg-ID?']],
  },
  'BR-DE-1': {
    kurz: 'Zahlungsangaben fehlen',
    desc: 'BR-DE-1: Der XRechnung fehlen die Zahlungsanweisungen (BG-16), mindestens die Zahlungsart. Was das bedeutet, wer es behebt und wie.',
    beheben: [
      'Lege in der Rechnungssoftware die Zahlungsart fest, also den Code in BT-81, zum Beispiel 58 für SEPA-Überweisung oder 59 für SEPA-Lastschrift.',
      'Hinterlege die passenden Angaben dazu: bei Überweisung die Bankverbindung (IBAN), bei Lastschrift Mandat, Gläubiger-ID und Konto des Zahlers.',
      'Erzeuge die E-Rechnung neu und prüfe sie, bevor du sie verschickst.',
    ],
    steuer: KEINE_PFLICHTANGABE,
    verwandt: ['BR-DE-23-a', 'BR-DE-18', 'BR-DE-15'],
  },
  'BR-DE-23-a': {
    kurz: 'Bankverbindung fehlt',
    desc: 'BR-DE-23-a: Die XRechnung nennt Überweisung als Zahlungsart (Code 30 oder 58), aber die Überweisungsangaben (BG-17) mit IBAN fehlen. Ursache und Lösung.',
    beheben: [
      'Prüfe die Zahlungsart in BT-81: 30 und 58 stehen für Überweisung.',
      'Hinterlege deine Bankverbindung in den Firmendaten der Rechnungssoftware, damit die Gruppe „Credit Transfer“ (BG-17) mit der IBAN übertragen wird.',
      'Soll der Kunde nicht überweisen, wähle stattdessen den passenden Code, etwa 59 für SEPA-Lastschrift.',
      'Erzeuge die E-Rechnung neu und prüfe sie.',
    ],
    steuer: KEINE_PFLICHTANGABE,
    verwandt: ['BR-DE-1', 'BR-DE-18'],
  },
  'BR-DE-2': {
    kurz: 'Kontaktdaten fehlen',
    desc: 'BR-DE-2: In der XRechnung fehlen die Kontaktdaten des Rechnungsstellers (BG-6). Dazu gehören BR-DE-5, -6 und -7: Ansprechpartner, Telefon, E-Mail.',
    beheben: [
      'Pflege in den Firmendaten deiner Rechnungssoftware einen Ansprechpartner (BT-41), eine Telefonnummer (BT-42) und eine E-Mail-Adresse (BT-43).',
      'Alle drei Angaben sind in der XRechnung vorgeschrieben; fehlt eine davon, meldet die Prüfung BR-DE-5, BR-DE-6 oder BR-DE-7.',
      'Erzeuge die E-Rechnung neu und prüfe sie.',
    ],
    steuer: KEINE_PFLICHTANGABE,
    verwandt: ['BR-DE-5', 'BR-DE-6', 'BR-DE-7', 'BR-DE-15'],
  },
  'BR-DE-16': {
    kurz: 'Steuernummer oder USt-IdNr. fehlt',
    desc: 'BR-DE-16: Die XRechnung weist Umsatzsteuer aus, nennt aber weder USt-IdNr. noch Steuernummer des Ausstellers. Warum das steuerlich zählt und die Lösung.',
    beheben: [
      'Hinterlege in den Firmendaten deiner Rechnungssoftware die Umsatzsteuer-Identifikationsnummer (BT-31) oder die Steuernummer (BT-32).',
      'Prüfe, ob die Software die Nummer in die E-Rechnung überträgt; manche Programme schreiben sie nur in das PDF.',
      'Erzeuge die E-Rechnung neu und prüfe sie.',
    ],
    steuer: pflichtangabe('die Steuernummer oder Umsatzsteuer-Identifikationsnummer des leistenden Unternehmers', 2),
    verwandt: ['BR-CO-14', 'BR-DE-2'],
  },
  'BR-DE-17': {
    kurz: 'Rechnungsart nicht vorgesehen',
    desc: 'BR-DE-17: Der Code der Rechnungsart (BT-3) ist in der XRechnung nicht vorgesehen. Welche Codes erlaubt sind und wie du die Warnung behebst.',
    beheben: [
      'Prüfe den Code in BT-3. Vorgesehen sind 380 (Rechnung), 381 (Gutschrift im Sinne einer Rechnungskorrektur), 384 (korrigierte Rechnung), 389 (Gutschrift durch den Leistungsempfänger), 326 (Teilrechnung) sowie 875, 876 und 877 für Bauleistungen.',
      'Stelle die Rechnungsart in der Software auf einen dieser Codes um.',
      'Es handelt sich um eine Warnung: Die Rechnung bleibt nach den Prüfregeln gültig.',
    ],
    steuer: KEINE_PFLICHTANGABE,
    verwandt: ['BR-DE-21', 'BR-16'],
  },
  'BR-DE-18': {
    kurz: 'Skonto falsch angegeben',
    desc: 'BR-DE-18: Skonto steht nicht im vorgeschriebenen Format in den Zahlungsbedingungen (BT-20). So muss die Zeile aussehen, mit Beispiel.',
    beheben: [
      'Schreibe Skonto in die Zahlungsbedingungen (BT-20) genau in diesem Format: <code>#SKONTO#TAGE=14#PROZENT=2.00#</code>, gefolgt von einem Zeilenumbruch.',
      'Prozentwerte mit Punkt und genau zwei Nachkommastellen, alles in Großbuchstaben, ohne Leerzeichen.',
      'Gilt das Skonto nur für einen Teil des fälligen Betrags, ergänze als viertes Segment <code>BASISBETRAG=…</code>.',
      'Mehrere Skontostufen stehen in eigenen Zeilen, jede nach demselben Muster.',
    ],
    steuer: { text: 'Skonto ist eine im Voraus vereinbarte Minderung des Entgelts und gehört deshalb in die Rechnung. Ob ein reiner Formatfehler hier steuerlich schadet, hängt davon ab, ob die Vereinbarung trotzdem eindeutig aus der Rechnung hervorgeht; im Zweifel eine berichtigte Rechnung anfordern. Seit dem BMF-Schreiben vom 15.10.2026 genügt bei einer schriftlichen Vereinbarung auch ein allgemeiner Hinweis darauf, wenn die Unterlagen kurzfristig vorgelegt werden können.', src: [['ustg14', 'Abs. 4 Satz 1 Nr. 7'], ['bmf2026', 'Rn. 15 und 16']] },
    verwandt: ['BR-DE-1', 'BR-CO-16'],
  },
  'BR-DE-21': {
    kurz: 'Kennung der XRechnung falsch',
    desc: `BR-DE-21: Die Spezifikationskennung (BT-24) entspricht nicht der XRechnung. Die richtige Kennung für XRechnung ${STAND.xrechnung.version} und was die Warnung bedeutet.`,
    beheben: [
      `Für XRechnung ${STAND.xrechnung.version} lautet die Kennung in BT-24: <code>${STAND.xrechnung.kennung}</code>.`,
      'Meist schreibt eine veraltete Softwareversion eine ältere Kennung. Aktualisiere die Rechnungssoftware oder frag den Hersteller.',
      'Es handelt sich um eine Warnung: Die Rechnung bleibt nach den Prüfregeln gültig.',
    ],
    steuer: KEINE_PFLICHTANGABE,
    verwandt: ['BR-DE-17', 'BR-DE-15'],
    links: [['xrechnung-oder-zugferd/', 'XRechnung oder ZUGFeRD']],
  },
  'BR-CO-10': {
    kurz: 'Summe der Positionen stimmt nicht',
    desc: 'BR-CO-10: Die Summe der Positionen (BT-106) weicht von den Positionsbeträgen (BT-131) ab. Meist ist es eine Rundung – so findest und behebst du den Fehler.',
    beheben: [
      'Die Summe der Nettobeträge der Positionen (BT-106) muss genau der Addition aller Positionsbeträge (BT-131) entsprechen, auf den Cent.',
      'Runde jede Position auf zwei Nachkommastellen und addiere erst dann; die Summe darf nicht aus ungerundeten Werten berechnet werden.',
      'Prüfe, ob nachträglich einzelne Beträge von Hand geändert wurden, ohne die Summe neu zu berechnen.',
      NACHRECHNEN,
    ],
    steuer: SUMMEN,
    verwandt: ['BR-CO-13', 'BR-CO-14', 'BR-CO-15', 'BR-CO-16'],
  },
  'BR-CO-13': {
    kurz: 'Nettobetrag stimmt nicht',
    desc: 'BR-CO-13: Der Nettobetrag der Rechnung (BT-109) stimmt nicht mit Positionen minus Nachlässen plus Zuschlägen überein. Ursache und Lösung.',
    beheben: [
      'Rechne nach: Nettobetrag (BT-109) = Summe der Positionen (BT-131) − Nachlässe auf Dokumentebene (BT-107) + Zuschläge auf Dokumentebene (BT-108).',
      'Häufig ist ein Rabatt oder eine Versandkostenpauschale im Nettobetrag enthalten, aber nicht als Nachlass oder Zuschlag übertragen worden, oder umgekehrt.',
      NACHRECHNEN,
    ],
    steuer: SUMMEN,
    verwandt: ['BR-CO-10', 'BR-CO-15', 'BR-S-08'],
  },
  'BR-CO-14': {
    kurz: 'Umsatzsteuer-Summe stimmt nicht',
    desc: 'BR-CO-14: Die gesamte Umsatzsteuer (BT-110) entspricht nicht der Summe der Steuerbeträge je Steuersatz (BT-117). Ursache und Lösung.',
    beheben: [
      'Die gesamte Umsatzsteuer (BT-110) muss genau der Summe der Steuerbeträge aller Umsatzsteuer-Aufschlüsselungen (BT-117) entsprechen.',
      'Berechne die Steuer je Steuersatz einmal aus dem zu versteuernden Betrag und runde kaufmännisch auf den Cent; addiere dann diese Beträge.',
      'Typisch ist eine abweichende Rundung, wenn die Software die Steuer je Position statt je Steuersatz rechnet.',
      NACHRECHNEN,
    ],
    steuer: SUMMEN,
    verwandt: ['BR-S-08', 'BR-CO-15', 'BR-CO-10'],
  },
  'BR-CO-15': {
    kurz: 'Bruttobetrag stimmt nicht',
    desc: 'BR-CO-15: Der Bruttobetrag (BT-112) ist nicht gleich Nettobetrag (BT-109) plus Umsatzsteuer (BT-110). Ursache und Lösung.',
    beheben: [
      'Rechne nach: Bruttobetrag (BT-112) = Nettobetrag (BT-109) + gesamte Umsatzsteuer (BT-110).',
      'Weicht der Betrag nur um Cent ab, ist meist eine Rundung die Ursache; weicht er stärker ab, fehlt oft ein Nachlass, Zuschlag oder eine Steuerposition.',
      NACHRECHNEN,
    ],
    steuer: SUMMEN,
    verwandt: ['BR-CO-13', 'BR-CO-14', 'BR-CO-16'],
  },
  'BR-CO-16': {
    kurz: 'Zahlbetrag stimmt nicht',
    desc: 'BR-CO-16: Der fällige Betrag (BT-115) ist nicht Brutto minus bereits gezahlt plus Rundung. Typisch bei Anzahlungen – so behebst du es.',
    beheben: [
      'Rechne nach: Fälliger Betrag (BT-115) = Bruttobetrag (BT-112) − bereits gezahlter Betrag (BT-113) + Rundungsbetrag (BT-114).',
      'Wurde eine Anzahlung abgezogen, muss sie als „bereits gezahlt“ (BT-113) angegeben sein und nicht nur im Zahlbetrag stecken.',
      'Rundet die Software den Zahlbetrag, gehört die Differenz in den Rundungsbetrag (BT-114).',
      NACHRECHNEN,
    ],
    steuer: SUMMEN,
    verwandt: ['BR-CO-15', 'BR-DE-18'],
  },
  'BR-S-08': {
    kurz: 'Steuerbasis beim Regelsteuersatz falsch',
    desc: 'BR-S-08: Der zu versteuernde Betrag je Steuersatz (BT-116) passt nicht zu den Positionen, Nachlässen und Zuschlägen mit diesem Satz. Ursache und Lösung.',
    beheben: [
      'Für jeden Steuersatz braucht die Rechnung eine eigene Umsatzsteuer-Aufschlüsselung, etwa eine für 19 % und eine für 7 %.',
      'Deren zu versteuernder Betrag (BT-116) muss der Summe der Positionen mit diesem Satz plus Zuschläge minus Nachlässe mit diesem Satz entsprechen.',
      'Häufig ist ein Nachlass oder Zuschlag auf Dokumentebene keinem oder dem falschen Steuersatz zugeordnet.',
      NACHRECHNEN,
    ],
    steuer: SUMMEN,
    verwandt: ['BR-CO-14', 'BR-CO-13', 'BR-CO-10'],
  },
  'BR-16': {
    kurz: 'Rechnung ohne Position',
    desc: 'BR-16: Die E-Rechnung enthält keine Rechnungsposition (BG-25). Warum jede E-Rechnung mindestens eine Position braucht und wie du es behebst.',
    beheben: [
      'Lege mindestens eine Rechnungsposition (BG-25) an, mit Bezeichnung, Menge, Einheit und Nettobetrag.',
      'Auch eine Pauschale wird als Position übertragen, etwa „Wartung laut Vertrag, 1 Stück“.',
      'Erzeuge die E-Rechnung neu und prüfe sie.',
    ],
    steuer: pflichtangabe('Menge und Art der gelieferten Gegenstände bzw. Umfang und Art der sonstigen Leistung', 5),
    verwandt: ['BR-CO-10', 'BR-DE-17'],
  },
};
