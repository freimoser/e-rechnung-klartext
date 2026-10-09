// Erklärungen in einfacher Sprache zu den offiziellen Prüfregeln.
// Grundlage ist jeweils der offizielle Regeltext (data/pruefregeln-offiziell.json).
// Felder: plain = was die Regel verlangt, cause = typische Ursache, who = wer es beheben muss.

const S = 'Rechnungssteller (bzw. dessen Rechnungssoftware oder Dienstleister)';
const SW = 'Hersteller der Rechnungssoftware bzw. der Rechnungssteller';
const FEHLT = 'Das Feld ist in der Rechnungssoftware nicht gepflegt oder wird beim Erzeugen der E-Rechnung nicht übertragen.';
const RECHNEN = 'Die Software rundet einzelne Beträge anders als die Summen oder Beträge wurden nachträglich von Hand geändert.';

// Deutsche Kurznamen der Business Terms (BT) und Gruppen (BG)
export const BT = {
  'BT-1': 'Rechnungsnummer', 'BT-2': 'Rechnungsdatum', 'BT-3': 'Rechnungsart', 'BT-5': 'Rechnungswährung',
  'BT-6': 'Abrechnungswährung der Umsatzsteuer', 'BT-7': 'Datum der Steuerfälligkeit', 'BT-8': 'Code für das Datum der Steuerfälligkeit',
  'BT-9': 'Fälligkeitsdatum', 'BT-10': 'Käuferreferenz (bei Behörden: Leitweg-ID)', 'BT-11': 'Projektnummer', 'BT-12': 'Vertragsnummer',
  'BT-13': 'Bestellnummer', 'BT-14': 'Auftragsnummer', 'BT-15': 'Wareneingangsmeldung', 'BT-16': 'Lieferschein',
  'BT-17': 'Vergabe- oder Losnummer', 'BT-18': 'Kennung des abgerechneten Objekts', 'BT-19': 'Buchungsreferenz des Käufers',
  'BT-20': 'Zahlungsbedingungen', 'BT-21': 'Betreff-Code einer Bemerkung', 'BT-22': 'Bemerkung', 'BT-23': 'Prozesskennung',
  'BT-24': 'Kennung der Spezifikation', 'BT-25': 'Nummer der vorherigen Rechnung', 'BT-26': 'Datum der vorherigen Rechnung',
  'BT-27': 'Name des Rechnungsstellers', 'BT-28': 'Handelsname des Rechnungsstellers', 'BT-29': 'Kennung des Rechnungsstellers',
  'BT-30': 'Registernummer des Rechnungsstellers', 'BT-31': 'USt-IdNr. des Rechnungsstellers', 'BT-32': 'Steuernummer des Rechnungsstellers',
  'BT-33': 'weitere rechtliche Angaben des Rechnungsstellers', 'BT-34': 'elektronische Adresse des Rechnungsstellers',
  'BT-35': 'Adresszeile 1 des Rechnungsstellers', 'BT-37': 'Ort des Rechnungsstellers', 'BT-38': 'Postleitzahl des Rechnungsstellers',
  'BT-40': 'Ländercode des Rechnungsstellers', 'BT-41': 'Ansprechpartner des Rechnungsstellers', 'BT-42': 'Telefonnummer des Rechnungsstellers',
  'BT-43': 'E-Mail-Adresse des Rechnungsstellers', 'BT-44': 'Name des Rechnungsempfängers', 'BT-46': 'Kennung des Rechnungsempfängers',
  'BT-47': 'Registernummer des Rechnungsempfängers', 'BT-48': 'USt-IdNr. des Rechnungsempfängers', 'BT-49': 'elektronische Adresse des Rechnungsempfängers',
  'BT-52': 'Ort des Rechnungsempfängers', 'BT-53': 'Postleitzahl des Rechnungsempfängers', 'BT-55': 'Ländercode des Rechnungsempfängers',
  'BT-59': 'Name des Zahlungsempfängers', 'BT-62': 'Name des Steuervertreters', 'BT-63': 'USt-IdNr. des Steuervertreters',
  'BT-69': 'Ländercode des Steuervertreters', 'BT-72': 'Liefer- bzw. Leistungsdatum', 'BT-73': 'Beginn des Abrechnungszeitraums',
  'BT-74': 'Ende des Abrechnungszeitraums', 'BT-77': 'Ort der Lieferanschrift', 'BT-78': 'Postleitzahl der Lieferanschrift',
  'BT-80': 'Ländercode der Lieferanschrift', 'BT-81': 'Code der Zahlungsart', 'BT-83': 'Verwendungszweck', 'BT-84': 'IBAN bzw. Kontokennung',
  'BT-87': 'Kartennummer', 'BT-89': 'Mandatsreferenz', 'BT-90': 'Gläubiger-Identifikationsnummer', 'BT-91': 'IBAN des belasteten Kontos',
  'BT-92': 'Betrag eines Nachlasses', 'BT-95': 'Steuerkategorie eines Nachlasses', 'BT-97': 'Grund eines Nachlasses', 'BT-98': 'Grund-Code eines Nachlasses',
  'BT-99': 'Betrag eines Zuschlags', 'BT-102': 'Steuerkategorie eines Zuschlags', 'BT-104': 'Grund eines Zuschlags', 'BT-105': 'Grund-Code eines Zuschlags',
  'BT-106': 'Summe der Positionen', 'BT-107': 'Summe der Nachlässe', 'BT-108': 'Summe der Zuschläge', 'BT-109': 'Gesamtbetrag ohne Umsatzsteuer',
  'BT-110': 'Summe der Umsatzsteuer', 'BT-111': 'Umsatzsteuer in Abrechnungswährung', 'BT-112': 'Gesamtbetrag mit Umsatzsteuer',
  'BT-113': 'bereits gezahlter Betrag', 'BT-114': 'Rundungsbetrag', 'BT-115': 'fälliger Betrag', 'BT-116': 'zu versteuernder Betrag je Steuersatz',
  'BT-117': 'Steuerbetrag je Steuersatz', 'BT-118': 'Steuerkategorie', 'BT-119': 'Steuersatz', 'BT-120': 'Befreiungsgrund (Text)',
  'BT-121': 'Befreiungsgrund (Code)', 'BT-122': 'Kennung einer Anlage', 'BT-123': 'Beschreibung einer Anlage', 'BT-124': 'Speicherort einer Anlage',
  'BT-125': 'angehängte Datei', 'BT-126': 'Positionsnummer', 'BT-129': 'Menge', 'BT-130': 'Mengeneinheit', 'BT-131': 'Nettobetrag der Position',
  'BT-134': 'Beginn des Leistungszeitraums einer Position', 'BT-135': 'Ende des Leistungszeitraums einer Position', 'BT-136': 'Nachlass auf eine Position',
  'BT-141': 'Zuschlag auf eine Position', 'BT-146': 'Nettopreis', 'BT-147': 'Rabatt auf den Preis', 'BT-148': 'Bruttopreis', 'BT-149': 'Basismenge des Preises',
  'BT-150': 'Einheit der Basismenge', 'BT-151': 'Steuerkategorie der Position', 'BT-152': 'Steuersatz der Position', 'BT-153': 'Artikelbezeichnung',
  'BT-157': 'Artikelkennung (z. B. GTIN)', 'BT-158': 'Artikelklassifizierung', 'BT-160': 'Name einer Artikeleigenschaft', 'BT-161': 'Wert einer Artikeleigenschaft',
  'BG-3': 'Verweis auf eine vorherige Rechnung', 'BG-5': 'Anschrift des Rechnungsstellers', 'BG-6': 'Kontaktdaten des Rechnungsstellers',
  'BG-8': 'Anschrift des Rechnungsempfängers', 'BG-10': 'abweichender Zahlungsempfänger', 'BG-11': 'Steuervertreter', 'BG-12': 'Anschrift des Steuervertreters',
  'BG-14': 'Abrechnungszeitraum', 'BG-15': 'Lieferanschrift', 'BG-16': 'Zahlungsanweisungen', 'BG-17': 'Überweisungsangaben',
  'BG-18': 'Kartenzahlungsangaben', 'BG-19': 'Lastschriftangaben', 'BG-20': 'Nachlass auf die gesamte Rechnung', 'BG-21': 'Zuschlag auf die gesamte Rechnung',
  'BG-23': 'Umsatzsteueraufschlüsselung', 'BG-24': 'Anlagen', 'BG-25': 'Rechnungsposition', 'BG-26': 'Leistungszeitraum einer Position',
  'BG-27': 'Nachlass auf eine Position', 'BG-28': 'Zuschlag auf eine Position', 'BG-32': 'Artikeleigenschaften',
};

const fehlt = (was, extra = '') => ({ plain: `In der Rechnung fehlt: ${was}.${extra ? ' ' + extra : ''}`, cause: FEHLT, who: S });

export const E = {
  'BR-01': { plain: 'Die Rechnung muss angeben, nach welcher Spezifikation sie aufgebaut ist (z. B. XRechnung 3.0). Daran erkennt die empfangende Software die Regeln.', cause: 'Die Rechnungssoftware schreibt die Kennung nicht in die Datei oder die Datei wurde von Hand erstellt.', who: SW },
  'BR-02': fehlt('die Rechnungsnummer'),
  'BR-03': fehlt('das Rechnungsdatum'),
  'BR-04': fehlt('die Rechnungsart (z. B. 380 für eine normale Rechnung)'),
  'BR-05': fehlt('die Währung der Rechnung (z. B. EUR)'),
  'BR-06': fehlt('der Name des Rechnungsstellers'),
  'BR-07': fehlt('der Name des Rechnungsempfängers', 'Ohne Namen ist nicht erkennbar, an wen die Rechnung geht.'),
  'BR-08': fehlt('die Anschrift des Rechnungsstellers'),
  'BR-09': fehlt('der Ländercode in der Anschrift des Rechnungsstellers (z. B. DE)'),
  'BR-10': fehlt('die Anschrift des Rechnungsempfängers'),
  'BR-11': fehlt('der Ländercode in der Anschrift des Rechnungsempfängers (z. B. DE)', 'Häufig fehlt beim Kunden in den Stammdaten das Land.'),
  'BR-12': fehlt('die Summe aller Positionen (netto)'),
  'BR-13': fehlt('der Gesamtbetrag ohne Umsatzsteuer'),
  'BR-14': fehlt('der Gesamtbetrag mit Umsatzsteuer'),
  'BR-15': fehlt('der fällige Betrag'),
  'BR-16': { plain: 'Eine E-Rechnung muss mindestens eine Position enthalten.', cause: 'Die Rechnung wurde ohne Positionen erzeugt, etwa nur mit einem Gesamtbetrag.', who: S },
  'BR-17': fehlt('der Name des abweichenden Zahlungsempfängers', 'Wenn das Geld an jemand anderen als den Rechnungssteller gehen soll (z. B. Factoring), muss dieser genannt sein.'),
  'BR-18': fehlt('der Name des Steuervertreters'),
  'BR-19': fehlt('die Anschrift des Steuervertreters'),
  'BR-20': fehlt('der Ländercode in der Anschrift des Steuervertreters'),
  'BR-21': fehlt('die Nummer einer Position'),
  'BR-22': fehlt('die Menge einer Position'),
  'BR-23': fehlt('die Mengeneinheit einer Position (z. B. Stück, Stunde)', 'Häufig ist im Artikelstamm keine Einheit hinterlegt.'),
  'BR-24': fehlt('der Nettobetrag einer Position'),
  'BR-25': fehlt('die Bezeichnung eines Artikels bzw. einer Leistung'),
  'BR-26': fehlt('der Nettopreis einer Position'),
  'BR-27': { plain: 'Der Nettopreis einer Position darf nicht negativ sein. Gutschriften und Rückbuchungen werden über eine negative Menge oder eine eigene Rechnungsart abgebildet.', cause: 'Ein Rabatt oder eine Rückerstattung wurde als Position mit negativem Preis angelegt.', who: S },
  'BR-28': { plain: 'Der Bruttopreis einer Position darf nicht negativ sein.', cause: 'Ein Rabatt wurde als negativer Preis eingetragen.', who: S },
  'BR-29': { plain: 'Das Ende des Abrechnungszeitraums darf nicht vor dem Beginn liegen.', cause: 'Beginn und Ende wurden vertauscht oder ein Datum ist falsch eingegeben.', who: S },
  'BR-30': { plain: 'Das Ende des Leistungszeitraums einer Position darf nicht vor dem Beginn liegen.', cause: 'Beginn und Ende wurden vertauscht oder ein Datum ist falsch eingegeben.', who: S },
  'BR-31': fehlt('der Betrag eines Nachlasses auf die gesamte Rechnung'),
  'BR-32': fehlt('die Steuerkategorie eines Nachlasses auf die gesamte Rechnung', 'Jeder Nachlass muss einem Steuersatz zugeordnet sein, sonst lässt sich die Steuer nicht richtig berechnen.'),
  'BR-33': fehlt('der Grund (Text oder Code) für einen Nachlass auf die gesamte Rechnung'),
  'BR-36': fehlt('der Betrag eines Zuschlags auf die gesamte Rechnung'),
  'BR-37': fehlt('die Steuerkategorie eines Zuschlags auf die gesamte Rechnung'),
  'BR-38': fehlt('der Grund (Text oder Code) für einen Zuschlag auf die gesamte Rechnung'),
  'BR-41': fehlt('der Betrag eines Nachlasses auf eine Position'),
  'BR-42': fehlt('der Grund (Text oder Code) für einen Nachlass auf eine Position'),
  'BR-43': fehlt('der Betrag eines Zuschlags auf eine Position'),
  'BR-44': fehlt('der Grund (Text oder Code) für einen Zuschlag auf eine Position'),
  'BR-45': fehlt('in der Umsatzsteueraufschlüsselung der zu versteuernde Betrag'),
  'BR-46': fehlt('in der Umsatzsteueraufschlüsselung der Steuerbetrag'),
  'BR-47': fehlt('in der Umsatzsteueraufschlüsselung die Steuerkategorie (z. B. S für den normalen Steuersatz)'),
  'BR-48': fehlt('in der Umsatzsteueraufschlüsselung der Steuersatz', 'Nur bei nicht steuerbaren Umsätzen (Kategorie O) entfällt er.'),
  'BR-49': fehlt('der Code der Zahlungsart (z. B. 58 für SEPA-Überweisung)'),
  'BR-50': fehlt('die Kontonummer bzw. IBAN, obwohl Überweisungsangaben gemacht werden'),
  'BR-51': { plain: 'Aus Sicherheitsgründen darf die vollständige Kartennummer nicht in der Rechnung stehen, höchstens die ersten sechs und letzten vier Ziffern.', cause: 'Die Software überträgt die komplette Kartennummer.', who: SW },
  'BR-52': fehlt('die Kennung einer Anlage'),
  'BR-53': fehlt('die Umsatzsteuer in der Abrechnungswährung, obwohl eine solche Währung angegeben ist'),
  'BR-54': { plain: 'Jede Artikeleigenschaft braucht einen Namen und einen Wert.', cause: 'Eine Eigenschaft wurde nur halb ausgefüllt.', who: S },
  'BR-55': fehlt('die Nummer der Rechnung, auf die sich diese Rechnung bezieht'),
  'BR-56': fehlt('die USt-IdNr. des Steuervertreters'),
  'BR-57': fehlt('der Ländercode in der Lieferanschrift'),
  'BR-61': { plain: 'Bei Zahlung per Überweisung muss die Rechnung die IBAN bzw. Kontonummer des Empfängers enthalten.', cause: 'Die Bankverbindung ist in der Rechnungssoftware nicht hinterlegt.', who: S },
  'BR-62': { plain: 'Zur elektronischen Adresse des Rechnungsstellers gehört die Angabe, welches Schema sie nutzt (z. B. EM für E-Mail).', cause: 'Die Software schreibt die Adresse ohne das Attribut schemeID.', who: SW },
  'BR-63': { plain: 'Zur elektronischen Adresse des Rechnungsempfängers gehört die Angabe, welches Schema sie nutzt (z. B. EM für E-Mail oder 0204 für die Leitweg-ID).', cause: 'Die Software schreibt die Adresse ohne das Attribut schemeID.', who: SW },
  'BR-64': { plain: 'Zu einer Artikelkennung (z. B. GTIN) gehört die Angabe des Schemas.', cause: 'Die Software schreibt die Kennung ohne Schema.', who: SW },
  'BR-65': { plain: 'Zu einer Artikelklassifizierung gehört die Angabe, nach welcher Liste klassifiziert wird.', cause: 'Die Software schreibt die Klassifizierung ohne Listenkennung.', who: SW },
  'BR-CO-03': { plain: 'Für die Steuerfälligkeit darf entweder ein Datum oder ein Code angegeben sein, nicht beides.', cause: 'Die Software füllt beide Felder.', who: SW },
  'BR-CO-04': { plain: 'Jede Position muss einer Umsatzsteuerkategorie zugeordnet sein (z. B. S für den normalen Satz, E für steuerbefreit).', cause: 'Beim Artikel ist keine Steuerkategorie hinterlegt.', who: S },
  'BR-CO-05': { plain: 'Grund-Code und Grundtext eines Nachlasses müssen dieselbe Art von Nachlass beschreiben.', cause: 'Code und Text wurden unabhängig voneinander gepflegt.', who: S },
  'BR-CO-06': { plain: 'Grund-Code und Grundtext eines Zuschlags müssen dieselbe Art von Zuschlag beschreiben.', cause: 'Code und Text wurden unabhängig voneinander gepflegt.', who: S },
  'BR-CO-07': { plain: 'Grund-Code und Grundtext eines Positionsnachlasses müssen zusammenpassen.', cause: 'Code und Text wurden unabhängig voneinander gepflegt.', who: S },
  'BR-CO-08': { plain: 'Grund-Code und Grundtext eines Positionszuschlags müssen zusammenpassen.', cause: 'Code und Text wurden unabhängig voneinander gepflegt.', who: S },
  'BR-CO-09': { plain: 'Eine Umsatzsteuer-Identifikationsnummer muss mit dem Länderkürzel beginnen, z. B. DE123456789.', cause: 'Die USt-IdNr. wurde ohne Länderkürzel oder mit Leerzeichen am Anfang erfasst, oder im Feld steht stattdessen die Steuernummer.', who: S },
  'BR-CO-10': { plain: 'Die angegebene Summe der Positionen muss genau der Summe aller Positionsbeträge entsprechen.', cause: RECHNEN, who: S },
  'BR-CO-11': { plain: 'Die Summe der Nachlässe muss genau der Summe der einzelnen Nachlässe auf die gesamte Rechnung entsprechen.', cause: RECHNEN, who: S },
  'BR-CO-12': { plain: 'Die Summe der Zuschläge muss genau der Summe der einzelnen Zuschläge auf die gesamte Rechnung entsprechen.', cause: RECHNEN, who: S },
  'BR-CO-13': { plain: 'Der Nettobetrag der Rechnung muss gleich Summe der Positionen minus Nachlässe plus Zuschläge sein.', cause: RECHNEN, who: S },
  'BR-CO-14': { plain: 'Die gesamte Umsatzsteuer muss genau der Summe der Steuerbeträge je Steuersatz entsprechen.', cause: RECHNEN, who: S },
  'BR-CO-15': { plain: 'Der Bruttobetrag muss gleich Nettobetrag plus Umsatzsteuer sein.', cause: RECHNEN, who: S },
  'BR-CO-16': { plain: 'Der fällige Betrag muss gleich Bruttobetrag minus bereits gezahlt plus Rundung sein.', cause: 'Eine Anzahlung oder Rundung ist im Zahlbetrag berücksichtigt, aber nicht als eigenes Feld angegeben (oder umgekehrt).', who: S },
  'BR-CO-17': { plain: 'Der Steuerbetrag je Steuersatz muss zum Betrag und zum Steuersatz passen (Betrag × Satz ÷ 100, auf zwei Stellen gerundet).', cause: 'Die Steuer wurde je Position gerundet und dann addiert, oder ein falscher Steuersatz ist angegeben.', who: S },
  'BR-CO-18': { plain: 'Jede Rechnung braucht mindestens eine Zeile in der Umsatzsteueraufschlüsselung, auch bei 0 % oder steuerfreien Umsätzen.', cause: 'Bei steuerfreien Rechnungen lässt die Software die Aufschlüsselung weg.', who: SW },
  'BR-CO-19': { plain: 'Wenn ein Abrechnungszeitraum angegeben ist, muss er mindestens einen Beginn oder ein Ende haben.', cause: 'Ein leeres Zeitraum-Element wird erzeugt.', who: SW },
  'BR-CO-20': { plain: 'Wenn eine Position einen Leistungszeitraum hat, muss er mindestens einen Beginn oder ein Ende haben.', cause: 'Ein leeres Zeitraum-Element wird erzeugt.', who: SW },
  'BR-CO-21': { plain: 'Jeder Nachlass auf die gesamte Rechnung braucht einen Grund als Text, als Code oder beides.', cause: FEHLT, who: S },
  'BR-CO-22': { plain: 'Jeder Zuschlag auf die gesamte Rechnung braucht einen Grund als Text, als Code oder beides.', cause: FEHLT, who: S },
  'BR-CO-23': { plain: 'Jeder Nachlass auf eine Position braucht einen Grund als Text, als Code oder beides.', cause: FEHLT, who: S },
  'BR-CO-24': { plain: 'Jeder Zuschlag auf eine Position braucht einen Grund als Text, als Code oder beides.', cause: FEHLT, who: S },
  'BR-CO-26': { plain: 'Der Rechnungssteller muss eindeutig erkennbar sein: über eine Kennung, eine Registernummer oder die USt-IdNr.', cause: 'Weder USt-IdNr. noch Handelsregisternummer noch eine andere Kennung sind in den Firmendaten der Software hinterlegt.', who: S },

  'BR-DE-1': { plain: 'Eine XRechnung muss Zahlungsangaben enthalten, mindestens die Zahlungsart.', cause: 'Die Zahlungsart ist in der Software nicht hinterlegt.', who: S },
  'BR-DE-2': { plain: 'Eine XRechnung muss Kontaktdaten des Rechnungsstellers enthalten (Ansprechpartner, Telefon, E-Mail).', cause: 'Die Kontaktdaten sind in den Firmendaten der Rechnungssoftware nicht gepflegt.', who: S },
  'BR-DE-3': fehlt('der Ort des Rechnungsstellers'),
  'BR-DE-4': fehlt('die Postleitzahl des Rechnungsstellers'),
  'BR-DE-5': fehlt('der Name eines Ansprechpartners beim Rechnungssteller'),
  'BR-DE-6': fehlt('die Telefonnummer des Rechnungsstellers'),
  'BR-DE-7': fehlt('die E-Mail-Adresse des Rechnungsstellers'),
  'BR-DE-8': fehlt('der Ort des Rechnungsempfängers'),
  'BR-DE-9': fehlt('die Postleitzahl des Rechnungsempfängers'),
  'BR-DE-10': fehlt('der Ort in der Lieferanschrift'),
  'BR-DE-11': fehlt('die Postleitzahl in der Lieferanschrift'),
  'BR-DE-14': fehlt('der Steuersatz in der Umsatzsteueraufschlüsselung', 'In XRechnung muss er immer angegeben werden, auch wenn er 0 ist.'),
  'BR-DE-15': { plain: 'Eine XRechnung muss eine Käuferreferenz enthalten. Bei Rechnungen an Behörden ist das die Leitweg-ID, die der Auftraggeber vorgibt. Bei Rechnungen an Unternehmen kann eine andere Referenz oder ein Platzhalter stehen.', cause: 'Der Rechnungssteller kennt die Leitweg-ID nicht oder hat sie beim Kunden nicht hinterlegt.', who: 'Rechnungssteller; die Leitweg-ID bzw. Referenz muss ihm der Rechnungsempfänger vorher mitteilen.' },
  'BR-DE-16': { plain: 'Wer Umsatzsteuer ausweist (oder steuerfreie, steuerbefreite oder Reverse-Charge-Umsätze abrechnet), muss seine USt-IdNr. oder Steuernummer angeben.', cause: 'Weder USt-IdNr. noch Steuernummer sind in den Firmendaten der Rechnungssoftware hinterlegt.', who: S },
  'BR-DE-17': { plain: 'XRechnung sieht nur bestimmte Rechnungsarten vor: 326, 380, 381, 384, 389, 875, 876 und 877. Andere Codes sollen nicht verwendet werden.', cause: 'Die Software nutzt einen anderen Code aus der allgemeinen Liste.', who: SW },
  'BR-DE-18': { plain: 'Skonto muss in den Zahlungsbedingungen in einem festen Format stehen, z. B. „#SKONTO#TAGE=14#PROZENT=2.00#“, in Großbuchstaben und mit Zeilenumbruch am Ende.', cause: 'Skonto wurde als freier Text geschrieben oder das Format ist leicht falsch (Komma statt Punkt, fehlende Nachkommastellen, fehlender Zeilenumbruch).', who: S },
  'BR-DE-19': { plain: 'Bei SEPA-Überweisung soll die IBAN gültig sein (richtiger Aufbau und Prüfziffer).', cause: 'Tippfehler in der IBAN oder Leerzeichen/Sonderzeichen in der Kontonummer.', who: S },
  'BR-DE-20': { plain: 'Bei SEPA-Lastschrift soll die IBAN des belasteten Kontos gültig sein.', cause: 'Tippfehler in der IBAN des Kunden.', who: S },
  'BR-DE-21': { plain: 'Die Kennung der Spezifikation soll genau der aktuellen XRechnung-Kennung entsprechen.', cause: 'Die Software nutzt noch eine veraltete XRechnung-Version oder schreibt die Kennung falsch.', who: SW },
  'BR-DE-22': { plain: 'Jede Anlage braucht einen eigenen Dateinamen; derselbe Dateiname darf nicht zweimal vorkommen.', cause: 'Mehrere Anlagen wurden mit demselben Namen angehängt (z. B. „scan.pdf“).', who: S },
  'BR-DE-23-a': { plain: 'Bei Zahlung per Überweisung müssen die Überweisungsangaben (Bankverbindung) enthalten sein.', cause: 'Die Bankverbindung fehlt in der Rechnungssoftware.', who: S },
  'BR-DE-23-b': { plain: 'Bei Zahlung per Überweisung dürfen keine Karten- oder Lastschriftangaben in der Rechnung stehen.', cause: 'Die Software schreibt Angaben für mehrere Zahlungsarten gleichzeitig.', who: SW },
  'BR-DE-24-a': { plain: 'Bei Kartenzahlung müssen die Kartenangaben enthalten sein.', cause: FEHLT, who: S },
  'BR-DE-24-b': { plain: 'Bei Kartenzahlung dürfen keine Überweisungs- oder Lastschriftangaben in der Rechnung stehen.', cause: 'Die Software schreibt Angaben für mehrere Zahlungsarten gleichzeitig.', who: SW },
  'BR-DE-25-a': { plain: 'Bei SEPA-Lastschrift müssen die Lastschriftangaben (Mandat, Gläubiger-ID, Konto) enthalten sein.', cause: FEHLT, who: S },
  'BR-DE-25-b': { plain: 'Bei SEPA-Lastschrift dürfen keine Überweisungs- oder Kartenangaben in der Rechnung stehen.', cause: 'Die Software schreibt zusätzlich die eigene Bankverbindung als Überweisungskonto.', who: SW },
  'BR-DE-26': { plain: 'Eine korrigierte Rechnung (Code 384) soll angeben, welche Rechnung sie korrigiert.', cause: 'Der Verweis auf die ursprüngliche Rechnung wurde nicht eingetragen.', who: S },
  'BR-DE-27': { plain: 'Die Telefonnummer des Rechnungsstellers soll mindestens drei Ziffern enthalten.', cause: 'Im Feld steht ein Platzhalter wie „-“ oder Text statt einer Nummer.', who: S },
  'BR-DE-28': { plain: 'Die E-Mail-Adresse des Rechnungsstellers soll gültig aufgebaut sein (genau ein @, kein Leerzeichen).', cause: 'Tippfehler, Leerzeichen oder mehrere Adressen in einem Feld.', who: S },
  'BR-DE-29': { plain: 'Diese Regel wird seit XRechnung 3.0.0 durch PEPPOL-EN16931-R061 ersetzt.', cause: '–', who: '–' },
  'BR-DE-30': { plain: 'Bei SEPA-Lastschrift muss die Gläubiger-Identifikationsnummer des Rechnungsstellers angegeben sein.', cause: FEHLT, who: S },
  'BR-DE-31': { plain: 'Bei SEPA-Lastschrift muss die IBAN des Kontos angegeben sein, das belastet wird.', cause: FEHLT, who: S },
  'BR-DE-TMP-32': { plain: 'Eine Rechnung sollte das Liefer- bzw. Leistungsdatum enthalten: als Datum, als Abrechnungszeitraum oder als Zeitraum in jeder Position. Das ist ein Hinweis, kein Fehler.', cause: 'Das Leistungsdatum steht nur im Freitext oder fehlt.', who: S },
  'BR-DE-CVD-01': { plain: 'Bei Rechnungen nach der Clean Vehicles Directive (CVD) muss die Vertragsnummer angegeben sein.', cause: FEHLT, who: S },
  'BR-DE-CVD-02': { plain: 'Bei Rechnungen nach der Clean Vehicles Directive (CVD) muss die Vergabe- oder Losnummer angegeben sein.', cause: FEHLT, who: S },
  'BR-DE-CVD-03': { plain: 'Eine CVD-Rechnung muss mindestens eine Position mit Fahrzeugklassifizierung „CVD“ und der Eigenschaft „cva“ enthalten.', cause: 'Die Fahrzeugangaben fehlen in den Positionen.', who: S },
  'BR-DE-CVD-04': { plain: 'Die Fahrzeugkategorie muss aus der Liste der zulässigen Kategorien stammen (M1, M2, M3, N1, N2, N3).', cause: 'Falsche oder freie Angabe der Fahrzeugkategorie.', who: S },
  'BR-DE-CVD-05': { plain: 'Die Eigenschaft „cva“ muss einen zulässigen Wert haben (clean, zero-emission oder other).', cause: 'Falsche oder freie Angabe.', who: S },
  'BR-DE-CVD-06-a': { plain: 'Eine Position mit CVD-Klassifizierung braucht genau eine Eigenschaft „cva“.', cause: 'Die Eigenschaft fehlt oder ist doppelt.', who: S },
  'BR-DE-CVD-06-b': { plain: 'Eine Position mit Eigenschaft „cva“ braucht genau eine CVD-Klassifizierung.', cause: 'Die Klassifizierung fehlt oder ist doppelt.', who: S },
  'BR-TMP-CVD-01': { plain: 'Das Schema der Artikelklassifizierung muss aus der Codeliste UNTDID 7143 stammen.', cause: 'Unbekanntes Schema angegeben.', who: SW },
  'BR-DEX-01': { plain: 'Eine Anlage hat einen nicht zulässigen Dateityp (MIME-Code). In der XRechnung-Extension ist zusätzlich XML erlaubt.', cause: 'Es wurde ein Dateiformat angehängt, das nicht erlaubt ist (z. B. Word).', who: S },
  'BR-DEX-02': { plain: 'Der Betrag einer Position mit Unterpositionen soll der Summe ihrer Unterpositionen entsprechen.', cause: RECHNEN, who: S },
  'BR-DEX-03': { plain: 'Jede Unterposition muss genau eine Umsatzsteuerangabe enthalten.', cause: FEHLT, who: SW },
  'BR-DEX-04': { plain: 'Kennungs-Schemata müssen aus der Liste ISO 6523 ICD stammen.', cause: 'Unbekanntes Schema angegeben.', who: SW },
  'BR-DEX-05': { plain: 'Kennungs-Schemata müssen aus der Liste ISO 6523 ICD stammen.', cause: 'Unbekanntes Schema angegeben.', who: SW },
  'BR-DEX-06': { plain: 'Kennungs-Schemata müssen aus der Liste ISO 6523 ICD stammen.', cause: 'Unbekanntes Schema angegeben.', who: SW },
  'BR-DEX-07': { plain: 'Das Schema einer elektronischen Adresse muss aus der Liste EAS stammen; in der Extension sind zusätzlich die DiGA-Codes XR01 bis XR03 erlaubt.', cause: 'Unbekanntes Schema angegeben.', who: SW },
  'BR-DEX-08': { plain: 'Das Schema einer Lieferort-Kennung muss aus der Liste ISO 6523 ICD stammen.', cause: 'Unbekanntes Schema angegeben.', who: SW },
  'BR-DEX-09': { plain: 'Der fällige Betrag muss Bruttobetrag minus bereits gezahlt plus Rundung plus Zahlungen Dritter ergeben.', cause: RECHNEN, who: S },
  'BR-DEX-10': fehlt('die Art einer Zahlung durch Dritte'),
  'BR-DEX-11': fehlt('der Betrag einer Zahlung durch Dritte'),
  'BR-DEX-12': fehlt('die Beschreibung einer Zahlung durch Dritte'),
  'BR-DEX-13': { plain: 'Der Betrag einer Zahlung durch Dritte darf höchstens zwei Nachkommastellen haben.', cause: 'Ungerundeter Betrag.', who: SW },
  'BR-DEX-14': { plain: 'Eine Zahlung durch Dritte muss in der Rechnungswährung angegeben sein.', cause: 'Abweichende Währung angegeben.', who: S },
  'BR-DEX-15': { plain: 'Die CII-Datei scheint Unterpositionen zu nutzen; das unterstützt XRechnung in CII nicht.', cause: 'Unterpositionen in CII statt in UBL.', who: SW },
  'BR-TMP-2': { plain: 'Der Speicherort einer externen Anlage muss eine vollständige Internetadresse sein (z. B. mit https://).', cause: 'Es wurde nur ein Dateiname oder ein Pfad ohne Schema angegeben.', who: S },
  'BR-TMP-3': { plain: 'Wenn die Basismenge des Preises beim Brutto- und beim Nettopreis angegeben ist, müssen beide gleich sein.', cause: 'Die Software schreibt unterschiedliche Basismengen.', who: SW },
  'BR-TMP-4': { plain: 'Eine Anlage darf höchstens eine Beschreibung haben.', cause: 'Die Software schreibt die Beschreibung doppelt.', who: SW },
  'BR-TMP-5': { plain: 'Eine Anlage darf höchstens eine eingebettete Datei enthalten.', cause: 'Mehrere Dateien in einer Anlage.', who: SW },
  'BR-TMP-6': { plain: 'In UBL müssen Datumsangaben das Format JJJJ-MM-TT haben (z. B. 2026-10-08).', cause: 'Die Software schreibt Datum und Uhrzeit oder ein deutsches Datumsformat.', who: SW },
  'BR-TMP-7': { plain: 'In CII müssen Datumsangaben das Format JJJJMMTT mit dem Kennzeichen format="102" haben (z. B. 20261008).', cause: 'Die Software schreibt ein anderes Datumsformat.', who: SW },

  'PEPPOL-EN16931-R001': fehlt('die Prozesskennung (BT-23)', 'XRechnung 3.0 verlangt sie, weil die Regeln mit Peppol vereinheitlicht wurden.'),
  'PEPPOL-EN16931-R005': { plain: 'Eine eigene Abrechnungswährung für die Umsatzsteuer darf nur angegeben werden, wenn sie sich von der Rechnungswährung unterscheidet.', cause: 'Die Software trägt in beide Felder EUR ein.', who: SW },
  'PEPPOL-EN16931-R008': { plain: 'Die Datei darf keine leeren Elemente enthalten. Ein Feld ist entweder gefüllt oder es fehlt ganz.', cause: 'Die Software schreibt alle Felder, auch wenn nichts eingetragen ist.', who: SW },
  'PEPPOL-EN16931-R010': { plain: 'Die elektronische Adresse des Rechnungsempfängers muss angegeben sein (z. B. E-Mail-Adresse oder bei Behörden die Leitweg-ID).', cause: 'Beim Kunden ist keine E-Rechnungsadresse hinterlegt.', who: 'Rechnungssteller; die Adresse muss ihm der Rechnungsempfänger mitteilen.' },
  'PEPPOL-EN16931-R020': { plain: 'Die elektronische Adresse des Rechnungsstellers muss angegeben sein (z. B. E-Mail-Adresse).', cause: 'In den Firmendaten ist keine E-Rechnungsadresse hinterlegt.', who: S },
  'PEPPOL-EN16931-R040': { plain: 'Wenn bei einem Nachlass oder Zuschlag Grundbetrag und Prozentsatz angegeben sind, muss der Betrag dazu passen.', cause: RECHNEN, who: S },
  'PEPPOL-EN16931-R041': { plain: 'Wenn ein Nachlass oder Zuschlag als Prozentsatz angegeben ist, muss auch der Grundbetrag angegeben sein.', cause: FEHLT, who: SW },
  'PEPPOL-EN16931-R042': { plain: 'Wenn bei einem Nachlass oder Zuschlag ein Grundbetrag angegeben ist, muss auch der Prozentsatz angegeben sein.', cause: FEHLT, who: SW },
  'PEPPOL-EN16931-R043': { plain: 'Das Kennzeichen „Nachlass oder Zuschlag“ muss genau true oder false lauten.', cause: 'Die Software schreibt einen anderen Wert (z. B. 1 oder 0).', who: SW },
  'PEPPOL-EN16931-R043-1': { plain: 'Das Kennzeichen „Nachlass oder Zuschlag“ muss genau true oder false lauten.', cause: 'Die Software schreibt einen anderen Wert (z. B. 1 oder 0).', who: SW },
  'PEPPOL-EN16931-R043-2': { plain: 'Das Kennzeichen „Nachlass oder Zuschlag“ muss genau true oder false lauten.', cause: 'Die Software schreibt einen anderen Wert (z. B. 1 oder 0).', who: SW },
  'PEPPOL-EN16931-R044': { plain: 'Zuschläge auf den Preis einer Position sind nicht erlaubt, nur Rabatte.', cause: 'Ein Preisaufschlag wurde auf Preisebene statt als Zuschlag auf die Position abgebildet.', who: SW },
  'PEPPOL-EN16931-R046': { plain: 'Der Nettopreis muss Bruttopreis minus Rabatt sein, wenn ein Bruttopreis angegeben ist.', cause: RECHNEN, who: S },
  'PEPPOL-EN16931-R053': { plain: 'Es darf nur eine Steuersumme mit Aufschlüsselung geben.', cause: 'Die Software schreibt die Steuersumme mehrfach.', who: SW },
  'PEPPOL-EN16931-R054': { plain: 'Bei abweichender Abrechnungswährung darf es nur eine Steuersumme ohne Aufschlüsselung geben.', cause: 'Die Software schreibt die Steuersumme mehrfach.', who: SW },
  'PEPPOL-EN16931-R055': { plain: 'Die Umsatzsteuer in Rechnungswährung und in Abrechnungswährung müssen dasselbe Vorzeichen haben.', cause: 'Ein Betrag wurde mit falschem Vorzeichen umgerechnet.', who: S },
  'PEPPOL-EN16931-R061': { plain: 'Bei Zahlung per Lastschrift muss die Mandatsreferenz angegeben sein.', cause: 'Die Mandatsreferenz ist beim Kunden nicht hinterlegt.', who: S },
  'PEPPOL-EN16931-R101': { plain: 'Eine Dokumentreferenz in der Position darf nur für die Kennung des abgerechneten Objekts genutzt werden.', cause: 'Die Software nutzt das Feld für andere Dokumente.', who: SW },
  'PEPPOL-EN16931-R110': { plain: 'Der Leistungsbeginn einer Position muss innerhalb des Abrechnungszeitraums der Rechnung liegen.', cause: 'Der Rechnungszeitraum ist zu kurz angegeben oder ein Positionsdatum ist falsch.', who: S },
  'PEPPOL-EN16931-R111': { plain: 'Das Leistungsende einer Position muss innerhalb des Abrechnungszeitraums der Rechnung liegen.', cause: 'Der Rechnungszeitraum ist zu kurz angegeben oder ein Positionsdatum ist falsch.', who: S },
  'PEPPOL-EN16931-R120': { plain: 'Der Nettobetrag einer Position soll Menge × Preis (geteilt durch die Basismenge) plus Zuschläge minus Nachlässe ergeben, mit höchstens 2 Cent Abweichung.', cause: 'Der Preis wurde gerundet, die Basismenge fehlt oder ein Rabatt ist nicht als Nachlass angegeben.', who: S },
  'PEPPOL-EN16931-R121': { plain: 'Die Basismenge des Preises muss größer als 0 sein.', cause: 'Im Feld steht 0.', who: SW },
  'PEPPOL-EN16931-R130': { plain: 'Die Einheit der Preisbasismenge muss der Mengeneinheit der Position entsprechen.', cause: 'Preis und Menge nutzen unterschiedliche Einheiten (z. B. Preis je Packung, Menge in Stück).', who: S },
  'BR-B-01': { plain: 'Die Kategorie „Split Payment“ ist nur für Rechnungen innerhalb Italiens vorgesehen.', cause: 'Falsche Steuerkategorie gewählt.', who: S },
  'BR-B-02': { plain: 'Eine Rechnung mit „Split Payment“ darf keine Positionen mit normaler Steuerkategorie enthalten.', cause: 'Kategorien gemischt.', who: S },
  'BR-IC-11': { plain: 'Bei einer innergemeinschaftlichen Lieferung muss das Lieferdatum oder der Abrechnungszeitraum angegeben sein.', cause: FEHLT, who: S },
  'BR-IC-12': { plain: 'Bei einer innergemeinschaftlichen Lieferung muss das Land der Lieferanschrift angegeben sein.', cause: FEHLT, who: S },
  'BR-O-11': { plain: 'Eine Rechnung über nicht steuerbare Umsätze (O) darf keine weiteren Steuerkategorien enthalten.', cause: 'Steuerbare und nicht steuerbare Positionen wurden in einer Rechnung gemischt.', who: S },
  'BR-O-12': { plain: 'Eine Rechnung über nicht steuerbare Umsätze (O) darf keine Positionen mit anderer Steuerkategorie enthalten.', cause: 'Kategorien gemischt.', who: S },
  'BR-O-13': { plain: 'Eine Rechnung über nicht steuerbare Umsätze (O) darf keine Nachlässe mit anderer Steuerkategorie enthalten.', cause: 'Kategorien gemischt.', who: S },
  'BR-O-14': { plain: 'Eine Rechnung über nicht steuerbare Umsätze (O) darf keine Zuschläge mit anderer Steuerkategorie enthalten.', cause: 'Kategorien gemischt.', who: S },
};

// Steuerkategorie-Regeln (gleicher Aufbau je Kategorie)
const CAT = {
  S: 'Regelsteuersatz (S)', Z: 'Nullsatz (Z)', E: 'steuerbefreite Umsätze (E)', AE: 'Reverse Charge (AE)',
  IC: 'innergemeinschaftliche Lieferung (K)', G: 'Ausfuhr außerhalb der EU (G)', O: 'nicht steuerbare Umsätze (O)',
  AF: 'IGIC – Kanarische Inseln (L)', AG: 'IPSI – Ceuta und Melilla (M)',
};

export function catRule(id) {
  const m = /^BR-(S|Z|E|AE|IC|G|O|AF|AG)-(\d+)$/.exec(id);
  if (!m) return null;
  const c = CAT[m[1]];
  const n = Number(m[2]);
  const zeroRate = ['Z', 'E', 'AE', 'IC', 'G'].includes(m[1]);
  const t = {
    1: { plain: `Wenn Positionen, Nachlässe oder Zuschläge mit ${c} vorkommen, braucht die Umsatzsteueraufschlüsselung eine passende Zeile dafür${m[1] === 'S' ? ' (je Steuersatz)' : ' (genau eine)'}.`, cause: 'Die Aufschlüsselung fehlt, ist doppelt oder passt nicht zu den Positionen.' },
    2: { plain: m[1] === 'O' ? `Bei ${c} darf die Rechnung keine USt-IdNr. des Rechnungsstellers, des Steuervertreters oder des Empfängers enthalten.` : `Bei Positionen mit ${c} muss die Rechnung die USt-IdNr. bzw. Steuernummer des Rechnungsstellers enthalten${['AE', 'IC'].includes(m[1]) ? ' und zusätzlich die USt-IdNr. des Empfängers' : ''}.`, cause: 'Die Steuernummer bzw. USt-IdNr. ist in den Stammdaten nicht hinterlegt.' },
    3: { plain: `Bei einem Nachlass mit ${c} gelten dieselben Pflichtangaben zu Steuernummer bzw. USt-IdNr. wie bei den Positionen.`, cause: 'Die Steuernummer bzw. USt-IdNr. ist nicht hinterlegt.' },
    4: { plain: `Bei einem Zuschlag mit ${c} gelten dieselben Pflichtangaben zu Steuernummer bzw. USt-IdNr. wie bei den Positionen.`, cause: 'Die Steuernummer bzw. USt-IdNr. ist nicht hinterlegt.' },
    5: { plain: m[1] === 'S' ? 'Bei Positionen mit Regelsteuersatz muss der Steuersatz größer als 0 sein.' : m[1] === 'O' ? `Bei Positionen mit ${c} darf kein Steuersatz angegeben sein.` : zeroRate ? `Bei Positionen mit ${c} muss der Steuersatz 0 sein.` : `Bei Positionen mit ${c} muss der Steuersatz zur Kategorie passen.`, cause: 'Steuerkategorie und Steuersatz passen nicht zusammen, etwa „S“ mit 0 %.' },
    6: { plain: `Beim Steuersatz eines Nachlasses mit ${c} gelten dieselben Vorgaben wie bei den Positionen.`, cause: 'Steuerkategorie und Steuersatz passen nicht zusammen.' },
    7: { plain: `Beim Steuersatz eines Zuschlags mit ${c} gelten dieselben Vorgaben wie bei den Positionen.`, cause: 'Steuerkategorie und Steuersatz passen nicht zusammen.' },
    8: { plain: `Der zu versteuernde Betrag für ${c} muss gleich der Summe der Positionen dieser Kategorie plus Zuschläge minus Nachlässe sein${m[1] === 'S' ? ' (je Steuersatz)' : ''}.`, cause: RECHNEN },
    9: { plain: m[1] === 'S' || m[1] === 'AF' || m[1] === 'AG' ? `Der Steuerbetrag für ${c} muss Betrag × Steuersatz ÷ 100 sein.` : `Der Steuerbetrag für ${c} muss 0 sein.`, cause: 'Die Steuer wurde falsch berechnet oder eine falsche Kategorie gewählt.' },
    10: { plain: ['S', 'Z', 'AF', 'AG'].includes(m[1]) ? `Bei ${c} darf kein Befreiungsgrund angegeben sein.` : `Bei ${c} muss ein Befreiungsgrund angegeben sein (als Text oder als Code), zum Beispiel der Hinweis auf die Steuerbefreiung.`, cause: 'Der Hinweis auf die Steuerbefreiung fehlt oder steht nur im Freitext.' },
  }[n];
  if (!t) return null;
  return { ...t, who: S };
}

const CL = {
  'BR-CL-01': 'die Rechnungsart (UNTDID 1001)', 'BR-CL-03': 'ein Währungscode an einem Betrag (ISO 4217)', 'BR-CL-04': 'der Code der Rechnungswährung (ISO 4217)',
  'BR-CL-05': 'der Code der Abrechnungswährung (ISO 4217)', 'BR-CL-06': 'der Code für das Datum der Steuerfälligkeit (UNTDID 2005)',
  'BR-CL-07': 'das Schema der Objektkennung (UNTDID 1153)', 'BR-CL-08': 'der Betreff-Code einer Bemerkung (UNTDID 4451)',
  'BR-CL-10': 'das Schema einer Kennung (ISO 6523 ICD)', 'BR-CL-11': 'das Schema einer Registernummer (ISO 6523 ICD)',
  'BR-CL-13': 'das Schema einer Artikelklassifizierung (UNTDID 7143)', 'BR-CL-14': 'ein Ländercode (ISO 3166-1)', 'BR-CL-15': 'ein Ländercode beim Ursprungsland (ISO 3166-1)',
  'BR-CL-16': 'der Code der Zahlungsart (UNTDID 4461)', 'BR-CL-17': 'eine Steuerkategorie (UNTDID 5305)', 'BR-CL-18': 'eine Steuerkategorie in einer Position (UNTDID 5305)',
  'BR-CL-19': 'der Grund-Code eines Nachlasses (UNTDID 5189)', 'BR-CL-20': 'der Grund-Code eines Zuschlags (UNTDID 7161)',
  'BR-CL-21': 'das Schema einer Artikelkennung (ISO 6523 ICD)', 'BR-CL-22': 'der Code des Befreiungsgrundes (VATEX)', 'BR-CL-23': 'eine Mengeneinheit (UN/ECE Rec. 20 und 21)',
  'BR-CL-24': 'der Dateityp (MIME-Code) einer Anlage', 'BR-CL-25': 'das Schema einer elektronischen Adresse (EAS)', 'BR-CL-26': 'das Schema einer Lieferort-Kennung (ISO 6523 ICD)',
};

export function codeRule(id) {
  if (CL[id]) return { plain: `Nicht erlaubt ist hier ${CL[id]}, wenn der Code nicht in der offiziellen Codeliste steht. Codes müssen exakt so geschrieben sein wie in der Liste.`, cause: 'Ein eigener, veralteter oder falsch geschriebener Code wurde verwendet (z. B. „Stk“ statt C62 für Stück).', who: SW };
  const m = /^BR-DEC-\d+$/.test(id);
  if (m) return null;
  return null;
}

export function decRule(id, officialText) {
  if (!/^BR-DEC-/.test(id)) return null;
  const bt = /\((BT-\d+)\)/.exec(officialText || '');
  const name = bt && BT[bt[1]] ? `${BT[bt[1]]} (${bt[1]})` : 'dieser Betrag';
  return { plain: `Der Betrag „${name}“ darf höchstens zwei Nachkommastellen haben.`, cause: 'Die Software rundet den Betrag nicht auf Cent, bevor sie ihn in die Datei schreibt.', who: SW };
}

// Syntaxregeln (UBL-CR, CII-SR, UBL-SR, UBL-DT, CII-DT) – kurze, elementbezogene Erklärung aus dem offiziellen Text
export function syntaxRule(id, officialText, flag) {
  const t = String(officialText || '').replace(/^\[[^\]]+\]\s*-?\s*/, '').trim().replace(/\.$/, '');
  const warn = flag === 'warning';
  const who = warn ? 'Softwarehersteller (nicht zwingend)' : 'Softwarehersteller';
  const r = (plain, cause) => ({ plain, cause, who });
  let m;
  if ((m = /^(.*?)\s*should not be present$/i.exec(t)) || (m = /^A UBL (?:invoice|credit note) should not include (?:a |an |the )?(.*)$/i.exec(t))) {
    return r(`„${m[1]}“ ist in der EN 16931 nicht vorgesehen${warn ? '; nur Warnung, die Rechnung bleibt gültig' : ''}.`, 'Zusatzfeld der vollen Syntax');
  }
  if ((m = /^A UBL (?:invoice|credit note) shall not include (?:a |an |the )?(.*)$/i.exec(t)) || (m = /^(.*?)\s+shall not be used$/i.exec(t))) {
    return r(`„${m[1]}“ darf in der E-Rechnung nicht vorkommen.`, 'Unzulässiges Feld geschrieben');
  }
  if ((m = /^(.*?)\s+(?:shall|should|must) (?:only )?(?:occur|exist|be present) (?:maximum |at most )?once\b(.*)$/i.exec(t)) || (m = /^Only one (.*?) (?:should|shall|must) be present(.*)$/i.exec(t)) || (m = /^Only one (.*?) is allowed(.*)$/i.exec(t))) {
    return r(`„${m[1]}“ darf nur einmal vorkommen.`, 'Angabe mehrfach geschrieben');
  }
  if ((m = /^(.*?)\s+shall occur maximum twice(.*)$/i.exec(t))) return r(`„${m[1]}“ darf höchstens zweimal vorkommen.`, 'Angabe zu oft geschrieben');
  if ((m = /^(.*?)\s+must exist exactly once$/i.exec(t))) return r(`„${m[1]}“ muss genau einmal vorhanden sein.`, 'Pflichtelement fehlt oder ist doppelt');
  if (/fraction digits|decimal/i.test(t)) return r('Zahlenwert mit zu vielen Nachkommastellen oder falschem Format.', 'Nicht gerundet oder Komma statt Punkt');
  return r('Abweichung vom vorgesehenen Aufbau der Datei; Einzelheiten im offiziellen Text.', 'Syntax nicht genau eingehalten');
}
