import { href, esc, REPO_URL } from '../site.mjs';
import { src, srcs, metaLine, cta, related, UPDATED, dateDE } from '../content.mjs';
import { QUELLEN_GRUPPEN } from '../quellen-gruppen.mjs';
import { Q, ABGERUFEN, abgerufen } from '../../src/assets/js/quellen.js';
import { STAND } from '../../src/assets/js/stand.js';
import { IMPLEMENTED } from '../../src/assets/js/validate.js';

const tabellen = QUELLEN_GRUPPEN.map(([titel, ids]) => `        <h3>${esc(titel)}</h3>
        <div class="table-scroll">
          <table>
            <thead><tr><th scope="col">Quelle</th><th scope="col">Version / Stand</th><th scope="col">Abgerufen</th></tr></thead>
            <tbody>
${ids.map((id) => {
    const q = Q[id];
    const name = q.url ? `<a href="${esc(q.url)}">${esc(q.titel)}</a>` : esc(q.titel);
    return `              <tr><td>${name}${q.hinweis ? `<span class="source">${esc(q.hinweis)}</span>` : ''}</td><td>${esc(q.version)}</td><td>${dateDE(abgerufen(id))}</td></tr>`;
  }).join('\n')}
            </tbody>
          </table>
        </div>`).join('\n');

const neuere = STAND.cen.neuere
  ? `<p>Seit dem ${dateDE(STAND.cen.neuere.vom)} gibt es die CEN-Prüfregeln ${STAND.cen.neuere.version}. Die KoSIT-Konfiguration für XRechnung nutzt derzeit noch ${STAND.cen.version}; die Vorprüfung folgt bewusst dem offiziellen Prüftool und wird umgestellt, sobald die KoSIT eine neue Konfiguration veröffentlicht. ${srcs(['cenSchematron1317'], ['xrValidatorKonfig'])}</p>`
  : '';

const html = () => `      <header class="hero-article">
        <h1>Quellen und Methodik</h1>
        <p class="answer">E-Rechnung Klartext stützt sich ausschließlich auf amtliche und offizielle Quellen: Gesetze, Bundesfinanzministerium, KoSIT, CEN, FeRD und OpenPeppol. Hier stehen alle Quellen mit Version und Abrufdatum, und es ist erklärt, wie die Vorprüfung entsteht und wie sie geprüft wird.</p>
        ${metaLine('2026-10-14')}
      </header>
      <nav class="toc" aria-label="Inhaltsverzeichnis">
        <p class="toc-title">Inhalt</p>
        <ol><li><a href="#stand">Stand der Vorprüfung</a></li><li><a href="#vorpruefung">So entsteht die Vorprüfung</a></li><li><a href="#ratgeber">So entstehen die Ratgeber</a></li><li><a href="#aktualisierung">Aktualisierung</a></li><li><a href="#quellen">Alle Quellen</a></li></ol>
      </nav>
      <article class="prose">
        <h2 id="stand">Stand der Vorprüfung</h2>
        <div class="table-scroll">
          <table>
            <thead><tr><th scope="col">Baustein</th><th scope="col">Version</th><th scope="col">Datum</th></tr></thead>
            <tbody>
              <tr><th scope="row">XRechnung (Spezifikation)</th><td>${STAND.xrechnung.version}</td><td>${dateDE(STAND.xrechnung.spezifikationVom)}</td></tr>
              <tr><th scope="row">KoSIT XRechnung-Schematron</th><td>${STAND.kosit.schematron}</td><td>${dateDE(STAND.kosit.schematronVom)}</td></tr>
              <tr><th scope="row">KoSIT Validator-Konfiguration</th><td>${STAND.kosit.validatorKonfiguration}</td><td>${dateDE(STAND.kosit.validatorKonfiguration)}</td></tr>
              <tr><th scope="row">CEN EN-16931-Prüfregeln</th><td>${STAND.cen.version}</td><td>${dateDE(STAND.cen.vom)}</td></tr>
            </tbody>
          </table>
        </div>
        <p>XRechnung 3.0 bleibt laut KoSIT mindestens bis ${dateDE(STAND.xrechnung.gueltigBisMindestens)} in Kraft; von XRechnung 4.0 gibt es seit dem 15.09.2026 eine Vorversion, die noch nicht für den produktiven Einsatz gedacht ist. ${srcs(['xrVersionen'], ['xr4'])}</p>
        ${neuere}

        <h2 id="vorpruefung">So entsteht die Vorprüfung</h2>
        <ol>
          <li><strong>Regeln aus den offiziellen Dateien:</strong> Code, Schweregrad und Text aller 1.646 Prüfregeln stammen unverändert aus dem KoSIT-Schematron und den CEN-Prüfregeln; die deutschen Regeltexte aus der XRechnung-Spezifikation. ${srcs(['xrSchematron'], ['cenSchematron'], ['xrSpez', 'Kapitel 12 und 17'])}</li>
          <li><strong>Felder nach offizieller Zuordnung:</strong> Welche Angabe in UBL oder CII welchem Business Term entspricht, folgt der KoSIT-Visualisierung. ${src('xrVisualisierung')}</li>
          <li><strong>${IMPLEMENTED.length} Regeln nachgebaut:</strong> Die häufigsten fachlichen Regeln (Pflichtangaben, Rechenregeln, Steuerkategorien, Codelisten, Nachkommastellen, nationale XRechnung-Regeln, übernommene Peppol-Regeln) sind im Browser nachgebildet. Welche Regel was bedeutet, steht unter <a href="${href('fehlercodes/')}">Fehlercodes</a>.</li>
          <li><strong>Gegen das offizielle Prüftool geprüft:</strong> Alle 86 Dateien der KoSIT-Testsuite und eigene, frei erfundene Testrechnungen wurden mit dem KoSIT-Validator 1.6.3 und der XRechnung-Konfiguration geprüft. Die Vorprüfung meldet für diese Dateien keinen Befund, den der Validator nicht auch meldet. Der Abgleich läuft bei jeder Änderung automatisch. ${srcs(['kositValidator'], ['xrTestsuite'])}</li>
          <li><strong>Grenzen:</strong> Die Vorprüfung prüft nicht gegen das XML-Schema und deckt nicht jede Codeliste ab. Verbindlich ist nur das <a href="${esc(STAND.pruefwerkzeug.url)}">offizielle KoSIT-Prüftool</a>.</li>
        </ol>

        <h2 id="ratgeber">So entstehen die Ratgeber</h2>
        <p>Jede Aussage zu Pflichten, Fristen, Umsatzgrenzen und Formaten stützt sich auf eine amtliche Quelle und trägt auf der Seite ein Stand-Datum mit Link. Wo eine Aussage aus dem Gesetzeswortlaut abgeleitet ist und kein ausdrückliches Beispiel der Finanzverwaltung existiert, steht das dabei (zum Beispiel bei Tierarztpraxen in <a href="${href('e-rechnung-arztpraxis/')}">E-Rechnung in der Arztpraxis</a>). Was sich nicht belegen ließ, steht nicht auf der Seite.</p>
        <p>Nicht verwendet wurden die ZUGFeRD-Spezifikation und das Factur-X-Paket, weil es sie nur gegen Angabe von Kontaktdaten gibt, sowie die kostenpflichtigen Normtexte der EN 16931. Profil-Kennungen von ZUGFeRD stammen deshalb aus den frei verfügbaren offiziellen Beispielrechnungen. ${srcs(['ferdBeispiele'], ['ferdFaq'])}</p>
        <p>Die Ratgeber sind allgemeine Information, keine Steuer- oder Rechtsberatung.</p>

        <h2 id="aktualisierung">Aktualisierung</h2>
        <p>Die Versionsangaben stehen an einer einzigen Stelle im Quellcode. Veröffentlicht die KoSIT neue Prüfregeln, werden sie dort und in den Regeldaten aktualisiert und erneut gegen den offiziellen Validator geprüft. Der Quellcode ist öffentlich: <a href="${REPO_URL}">github.com/freimoser/e-rechnung-klartext</a>.</p>

        <h2 id="quellen">Alle Quellen</h2>
        <p>Abrufdatum der Quellen: ${dateDE(ABGERUFEN)}; später ergänzte Quellen tragen ihr eigenes Datum.</p>
${tabellen}
      </article>
      ${cta()}
      ${related(['fehlercodes/', 'e-rechnung-pflicht-ab-wann/', 'begriffe/', 'xrechnung-oder-zugferd/'])}`;

export default {
  slug: 'quellen/',
  kind: 'reference',
  title: 'Quellen und Methodik – E-Rechnung Klartext',
  description: 'Alle amtlichen Quellen von E-Rechnung Klartext mit Version und Abrufdatum – und wie die Vorprüfung entsteht und gegen das KoSIT-Prüftool geprüft wird.',
  h1: 'Quellen und Methodik',
  llms: 'Quellenverzeichnis (UStG, UStDV, UStAE, BMF, KoSIT, CEN, FeRD, OpenPeppol) mit Version und Abrufdatum; Methodik der Vorprüfung und Abgleich mit dem KoSIT-Validator an der offiziellen Testsuite.',
  crumbs: [{ slug: 'quellen/', label: 'Quellen und Methodik' }],
  updated: '2026-10-14',
  html,
};
