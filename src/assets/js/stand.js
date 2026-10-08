// Fachlicher Stand der Vorprüfung – die EINZIGE Stelle für Versionsangaben.
// Bei einem neuen KoSIT-Release nur diese Datei anpassen; Build und Werkzeug lesen von hier.
// Quellen: siehe /quellen.md im Repository.

export const STAND = {
  // Aktuell gültige XRechnung-Version laut https://xeinkauf.de/xrechnung/versionen-und-bundles/
  xrechnung: {
    version: '3.0.2',
    spezifikationVom: '2024-06-20',
    gueltigBisMindestens: '2027-07-31',
    kennung: 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0',
  },
  // KoSIT-Prüfregeln (Schematron) und Validator-Konfiguration, Bundle vom 31.08.2026
  kosit: {
    schematron: '2.6.0',
    schematronVom: '2026-08-31',
    validatorKonfiguration: '2026-08-31',
    bundle: '2026-08-31',
  },
  // EN-16931-Prüfregeln von CEN/TC 434, auf denen die KoSIT-Konfiguration aufbaut
  cen: {
    version: '1.3.16',
    vom: '2026-04-13',
  },
  // Datum, an dem die Rechts- und Fachquellen zuletzt abgerufen wurden
  quellenAbgerufen: '2026-10-08',
  // Offizielles Prüfwerkzeug der KoSIT (Referenzimplementierung)
  pruefwerkzeug: {
    name: 'KoSIT-Validator mit XRechnung-Konfiguration',
    url: 'https://github.com/itplr-kosit/validator-configuration-xrechnung',
  },
};

export function datumDE(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export function standSatz() {
  return `Geprüft nach XRechnung ${STAND.xrechnung.version}, KoSIT-Regeln vom ${datumDE(STAND.kosit.schematronVom)}`;
}
