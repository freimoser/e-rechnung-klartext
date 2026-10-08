import { href } from '../site.mjs';
import { src, srcs, ratgeber, UPDATED } from '../content.mjs';

const faq = [
  { q: 'Ist Peppol für Unternehmen in Deutschland Pflicht?', a: 'Nein. Den Übertragungsweg stimmen Rechnungssteller und Empfänger miteinander ab; neben Peppol kommen etwa E-Mail oder Portale in Frage. Für den Empfang reicht ein E-Mail-Postfach. Für Wirtschaftsunternehmen ist der Empfang über Peppol freiwillig.', src: [['xeinkaufB2B'], ['xeinkaufPeppolFaq'], ['ustae', 'Abschnitt 14.1 Abs. 4 und 5']] },
  { q: 'Was kostet Peppol?', a: 'Innerhalb von Peppol fallen keine Transaktions- oder Roaming-Gebühren an. Kosten entstehen für den Zugang über einen Access Point, entweder über einen Dienstleister oder mit eigenem Access Point samt kostenpflichtiger Mitgliedschaft bei OpenPeppol.', src: [['xeinkaufPeppol']] },
  { q: 'Was ist ein Access Point?', a: 'Ein Zugangspunkt ins Peppol-Netzwerk. Um Dokumente über Peppol auszutauschen, braucht man eine Verbindung zu einem Access Point – selbst betrieben oder über einen Service Provider.', src: [['xeinkaufPeppolFaq']] },
  { q: 'Was ist eine Peppol-ID?', a: 'Die technische Adresse eines Empfängers im Peppol-Netz, bestehend aus einer Schemakennung und einer Nummer. Die öffentliche Verwaltung in Deutschland nutzt dafür die Leitweg-ID (Schema 0204), Unternehmen meist die Umsatzsteuer-Identifikationsnummer (Schema 9930).', src: [['xeinkaufPeppolFaq'], ['peppolCodelists']] },
  { q: 'Kann ich eine über Peppol empfangene Rechnung hier öffnen?', a: 'Ja, wenn du die Rechnungsdatei (XML) hast. Das Werkzeug liest XRechnung und Peppol BIS Billing 3.0 in UBL und CII und zeigt sie lesbar an.' },
];

const sections = `        <h2 id="was">Was ist Peppol?</h2>
        <p>Peppol (ursprünglich „Pan-European Public Procurement OnLine“) ist eine Sammlung von Komponenten und Spezifikationen, mit denen Geschäftspartner Dokumente auf standardisierte Weise über das Peppol-Netzwerk austauschen, darunter E-Rechnungen. Entwickelt wird es von der Non-Profit-Organisation OpenPeppol. Die Teilnehmer sind über Zugangspunkte (Access Points) angebunden; wer an wen senden kann, steht in einem Verzeichnis (Service Metadata Publisher, SMP).</p>
        <p>${srcs(['erbPeppol'], ['peppolOrg'], ['xeinkaufPeppolFaq'])}</p>
        <p>In Deutschland ist die <strong>KoSIT</strong> im Auftrag des IT-Planungsrats die nationale Peppol Authority. ${srcs(['xeinkaufPeppol'], ['peppolAuthorities'])}</p>

        <h2 id="brauche-ich">Brauche ich Peppol?</h2>
        <div class="table-scroll">
          <table>
            <caption>Stand 08.10.2026.</caption>
            <thead><tr><th scope="col">Situation</th><th scope="col">Peppol nötig?</th><th scope="col">Beleg</th></tr></thead>
            <tbody>
              <tr><th scope="row">E-Rechnungen von Lieferanten empfangen</th><td>Nein, ein E-Mail-Postfach genügt</td><td>Abschnitt 14.1 Abs. 5 UStAE</td></tr>
              <tr><th scope="row">E-Rechnungen an andere Unternehmen schicken</th><td>Nein, der Weg wird mit dem Empfänger abgestimmt (z. B. E-Mail, Portal, Peppol)</td><td>Abschnitt 14.1 Abs. 4 UStAE, KoSIT</td></tr>
              <tr><th scope="row">E-Rechnungen an den Bund (OZG-RE) schicken</th><td>Nein; es gibt vier Wege: Peppol, E-Mail, Upload und Eingabe im Webportal</td><td>E-Rechnung Bund</td></tr>
              <tr><th scope="row">Viele Rechnungen vollautomatisch an Behörden senden</th><td>Sinnvoll: Peppol ist dort der einzige Weg für Maschine-zu-Maschine-Kommunikation und Massenversand</td><td>E-Rechnung Bund</td></tr>
            </tbody>
          </table>
        </div>
        <p>${srcs(['ustae', 'Abschnitt 14.1 Abs. 4 und 5'], ['xeinkaufB2B'], ['erbPeppol'])}</p>

        <h2 id="xrechnung">Peppol und XRechnung</h2>
        <p>XRechnung ist ein <strong>Format</strong>, Peppol ein <strong>Transportweg</strong>. Über Peppol lassen sich XRechnungen in UBL und CII übertragen. Für Rechnungen an die öffentliche Verwaltung innerhalb Deutschlands verlangen die nationalen Vorgaben im Peppol-Netz den Standard XRechnung; Empfänger im Netz müssen grundsätzlich auch das internationale Format Peppol BIS Billing 3.0 annehmen können. Seit XRechnung 3.0 sind außerdem Regeln aus Peppol BIS Billing 3.0 Teil der XRechnung; sie erscheinen in Prüfberichten als <a href="${href('fehlercodes/')}#gruppe-peppol">PEPPOL-EN16931-Codes</a>.</p>
        <p>${srcs(['xeinkaufPeppolFaq'], ['xrSpez', 'Kapitel 12.5'])}</p>

        <h2 id="peppol-id">Die Peppol-ID</h2>
        <p>Eine Peppol-ID adressiert den Empfänger technisch im Netz. Sie besteht aus einer Schemakennung und einer Nummer, zum Beispiel 0204 für die Leitweg-ID der öffentlichen Verwaltung oder 9930 für die deutsche Umsatzsteuer-Identifikationsnummer. Die Adressierungsdaten sollten Empfänger möglichst selbst an ihre Lieferanten mitteilen. Mehr zu Leitweg-ID und anderen Begriffen unter <a href="${href('begriffe/')}">Begriffe</a>.</p>
        <p>${srcs(['xeinkaufPeppolFaq'], ['peppolCodelists'])}</p>

        <h2 id="kosten">Kosten</h2>
        <p>Für das Senden und Empfangen innerhalb von Peppol gibt es keine Transaktions- oder Roaming-Gebühren. Kosten entstehen für den Zugang: entweder über einen Service Provider oder durch einen eigenen Access Point, der eine kostenpflichtige Mitgliedschaft bei OpenPeppol voraussetzt. ${src('xeinkaufPeppol')}</p>`;

export default {
  slug: 'peppol/',
  kind: 'ratgeber',
  title: 'Peppol E-Rechnung: Was ist Peppol und brauche ich es?',
  description: 'Peppol E-Rechnung einfach erklärt: was das Netzwerk ist, ob Unternehmen es brauchen, wie es mit XRechnung zusammenhängt und was eine Peppol-ID ist.',
  h1: 'Peppol: das Netzwerk für E-Rechnungen',
  llms: 'Peppol erklärt: internationales Netzwerk (OpenPeppol) zum Austausch von E-Rechnungen, in Deutschland nicht Pflicht, KoSIT als Peppol Authority, Verhältnis zu XRechnung, Peppol-ID (0204 Leitweg-ID, 9930 USt-IdNr.), Kosten.',
  crumbs: [{ slug: 'peppol/', label: 'Peppol' }],
  updated: UPDATED,
  faq,
  html: () => ratgeber({
    h1: 'Peppol: das Netzwerk für E-Rechnungen',
    answer: 'Peppol ist ein internationales Netzwerk mit einheitlichen Regeln, über das Unternehmen und Behörden E-Rechnungen von Software zu Software austauschen. Für Unternehmen in Deutschland ist Peppol <strong>nicht vorgeschrieben</strong>: Den Übertragungsweg stimmen Rechnungssteller und Empfänger ab, und für den Empfang genügt ein E-Mail-Postfach.',
    tocItems: [['was', 'Was ist Peppol?'], ['brauche-ich', 'Brauche ich Peppol?'], ['xrechnung', 'Peppol und XRechnung'], ['peppol-id', 'Die Peppol-ID'], ['kosten', 'Kosten'], ['faq', 'Häufige Fragen']],
    sections,
    faq,
    relatedSlugs: ['xrechnung-oder-zugferd/', 'begriffe/', 'e-rechnung-pflicht-ab-wann/', 'fehlercodes/'],
  }),
};
