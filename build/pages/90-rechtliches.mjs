import { href, RATGEBER, esc, LEGAL, emailText } from '../site.mjs';
import { UPDATED, dateLong } from '../content.mjs';

const adresse = (sep) => [LEGAL.street, `${LEGAL.zip} ${LEGAL.city}`, LEGAL.country].map(esc).join(sep);

const impressum = {
  slug: 'impressum/',
  kind: 'legal',
  // noindex: Das Impressum enthält eine Privatanschrift. § 5 DDG verlangt Erreichbarkeit über den Footer, keine Auffindbarkeit über Suchmaschinen.
  noindex: true,
  title: 'Impressum – E-Rechnung Klartext',
  description: 'Impressum von E-Rechnung Klartext: Anbieter, Kontakt und Verantwortlicher für den Inhalt.',
  h1: 'Impressum',
  crumbs: [{ slug: 'impressum/', label: 'Impressum' }],
  published: UPDATED,
  updated: '2026-10-15',
  html: () => `      <header class="hero-article">
        <h1>Impressum</h1>
      </header>
      <article class="prose">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>${esc(LEGAL.operator)}${LEGAL.companyName ? `<br>${esc(LEGAL.companyName)}` : ''}<br>${adresse('<br>')}</p>
        <h2>Kontakt</h2>
        <p>E-Mail: ${esc(emailText(LEGAL.email))}${LEGAL.phone ? `<br>Telefon: ${esc(LEGAL.phone)}` : ''}<br>LinkedIn: linkedin.com/in/freimoser</p>
        ${LEGAL.vatId ? `<h2>Umsatzsteuer-Identifikationsnummer</h2>\n        <p>Umsatzsteuer-Identifikationsnummer nach § 27a UStG: ${esc(LEGAL.vatId)}</p>` : ''}
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>${esc(LEGAL.responsible)}<br>(Anschrift wie oben)</p>
        <h2>Verbraucherstreitbeilegung</h2>
        <p>Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
        <h2>Haftung für Inhalte</h2>
        <p>Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Die Ratgeber sind allgemeine Information, keine Steuer- oder Rechtsberatung. Die Vorprüfung im Werkzeug ist keine amtliche Validierung.</p>
        <h2>Haftung für Links</h2>
        <p>Diese Website enthält Links zu externen Webseiten Dritter, auf deren Inhalte kein Einfluss besteht. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.</p>
        <h2>Urheberrecht</h2>
        <p>Die durch den Betreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Der Quellcode des Werkzeugs steht unter der MIT-Lizenz; verwendete Bibliotheken und Daten Dritter sind im <a href="https://github.com/freimoser/e-rechnung-klartext#lizenzen">README auf GitHub</a> mit ihren Lizenzen aufgeführt.</p>
        <h2>Über den Entwickler</h2>
        <p>Weitere Informationen und Projekte: <a href="https://freimoser.de/">freimoser.de</a>.</p>
      </article>`,
};

const datenschutz = {
  slug: 'datenschutz/',
  kind: 'legal',
  noindex: true,
  title: 'Datenschutz – E-Rechnung Klartext',
  description: 'Datenschutzerklärung: Rechnungen werden nur lokal im Browser verarbeitet. Keine Cookies, kein Tracking; nur GitHub Pages verarbeitet Zugriffsdaten.',
  h1: 'Datenschutzerklärung',
  crumbs: [{ slug: 'datenschutz/', label: 'Datenschutz' }],
  published: UPDATED,
  updated: '2026-10-22',
  html: () => `      <header class="hero-article">
        <h1>Datenschutzerklärung</h1>
        <p class="meta-line">Stand: ${dateLong('2026-10-22')}</p>
      </header>
      <article class="prose">
        <h2 id="kurz">Das Wichtigste in drei Sätzen</h2>
        <p class="answer">Rechnungen, die du im Werkzeug öffnest, verlassen dein Gerät nicht: Sie werden ausschließlich in deinem Browser verarbeitet und nirgendwohin hochgeladen. Diese Website setzt keine Cookies, misst nichts und bindet keine Inhalte fremder Anbieter ein, auch keine Schriften. Personenbezogene Daten verarbeitet nur der Hoster GitHub, um die Seiten auszuliefern.</p>

        <h2 id="verantwortlich">Verantwortlicher</h2>
        <p>${esc(LEGAL.operator)}, ${adresse(', ')}. E-Mail: ${esc(emailText(LEGAL.email))}. Weitere Angaben im <a href="${href('impressum/')}">Impressum</a>.</p>

        <h2 id="rechnungen">Verarbeitung deiner Rechnungen</h2>
        <p>Wenn du eine Datei auswählst oder in das Werkzeug ziehst, liest dein Browser sie direkt von deinem Gerät. Anzeige, Vorprüfung, PDF- und CSV-Export laufen vollständig in deinem Browser. Die Datei und ihre Inhalte werden weder an mich noch an Dritte übertragen und nicht dauerhaft gespeichert. Schließt du den Tab, ist alles wieder weg.</p>
        <p>Die Sicherheitsrichtlinie der Seite (Content-Security-Policy) erlaubt technisch nur Verbindungen zu dieser Website selbst. Wie du das nachprüfen kannst, steht direkt beim Datei-Feld im <a href="${href('')}">Werkzeug</a>.</p>

        <h2 id="hosting">Hosting und Server-Logfiles: GitHub Pages</h2>
        <p>Die Website wird bei GitHub Pages gehostet, einem Dienst der GitHub, Inc. (USA). Beim Aufruf einer Seite verarbeitet GitHub technisch notwendige Zugriffsdaten, insbesondere deine IP-Adresse, um die Seite auszuliefern. Nach eigener Angabe speichert GitHub die IP-Adresse von Besuchern einer GitHub-Pages-Seite aus Sicherheitsgründen (<a href="https://docs.github.com/de/pages/getting-started-with-github-pages/what-is-github-pages">GitHub-Dokumentation, Abschnitt „Datenerfassung“</a>). Auf diese Protokolle habe ich keinen Zugriff.</p>
        <p>Rechtsgrundlage ist mein berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Dabei werden Daten in die USA übermittelt. GitHub ist nach dem EU-US Data Privacy Framework zertifiziert (<a href="https://www.dataprivacyframework.gov/participant/6174">Eintrag in der offiziellen Liste</a>); die Übermittlung stützt sich auf den Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO). Einzelheiten stehen in der <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement">Datenschutzerklärung von GitHub</a>.</p>

        <h2 id="search-console">Google Search Console und Bing Webmaster Tools: keine Verarbeitung über diese Website</h2>
        <p>Diese Website ist in der Google Search Console und in den Bing Webmaster Tools von Microsoft angemeldet. <strong>Dabei wird nichts in deinem Browser geladen und nichts über dich an mich übermittelt.</strong> Es gibt kein Skript, kein Cookie und keinen Zählpixel. Die Daten entstehen bei Google und Microsoft im Rahmen der Suche, also unabhängig davon, ob du diese Website je aufrufst, und ich sehe sie ausschließlich zusammengefasst.</p>
        <p>Der Nachweis, dass mir diese Website gehört, steht jeweils als Bestätigungs-Tag im Quelltext jeder Seite. Das ist ein reiner Texteintrag: Er lädt nichts nach und baut keine Verbindung zu Google oder Microsoft auf. Für eine Auskunft nach Art. 15 DSGVO zu deinen Suchdaten sind Google und Microsoft die richtigen Ansprechpartner.</p>

        <h2 id="speicher">Cookies und Speicherung im Browser</h2>
        <p>Diese Website setzt keine Cookies. Gespeichert wird in deinem Browser nur das Folgende:</p>
        <div class="table-scroll">
          <table>
            <thead><tr><th scope="col">Was</th><th scope="col">Wozu</th><th scope="col">Wie lange</th><th scope="col">Rechtsgrundlage</th></tr></thead>
            <tbody>
              <tr><td>Zwischenspeicher des Service Workers (Name beginnt mit „erk-“)</td><td>Kopie der Programmdateien und Seiten dieser Website, damit das Werkzeug auch ohne Internet funktioniert. Niemals deine Rechnungen.</td><td>Bis zur nächsten Version der Website oder bis du die Websitedaten löschst</td><td>§ 25 Abs. 2 Nr. 2 TDDDG: für die von dir genutzte Offline-Funktion erforderlich</td></tr>
            </tbody>
          </table>
        </div>
        <p>Du kannst den Speicher jederzeit über die Einstellungen deines Browsers („Websitedaten löschen“) entfernen.</p>

        <h2 id="kontakt">Kontakt per E-Mail</h2>
        <p>Wenn du mir eine E-Mail schreibst, verarbeite ich deine Adresse und deine Nachricht, um dir zu antworten (Art. 6 Abs. 1 lit. f DSGVO). Ich lösche sie, sobald sie dafür nicht mehr gebraucht werden und keine gesetzliche Aufbewahrungspflicht besteht.</p>

        <h2 id="links">Externe Links</h2>
        <p>Die Ratgeber verlinken auf amtliche Quellen (z. B. Bundesfinanzministerium, gesetze-im-internet.de, KoSIT). Erst wenn du einen solchen Link anklickst, verlässt du diese Website; dann gelten die Datenschutzbestimmungen des jeweiligen Anbieters.</p>

        <h2 id="rechte">Deine Rechte</h2>
        <p>Du hast nach der DSGVO das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Da diese Website selbst keine personenbezogenen Daten speichert, liegen mir in der Regel keine Daten über dich vor.</p>
        <p>Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für mich zuständigen: <a href="https://www.lda.bayern.de/de/index.html">Bayerisches Landesamt für Datenschutzaufsicht</a>.</p>

        <h2 id="entscheidungen">Keine automatisierte Entscheidungsfindung</h2>
        <p>Es findet keine automatisierte Entscheidungsfindung und kein Profiling im Sinne von Art. 22 DSGVO statt.</p>
      </article>`,
};

const notFound = {
  slug: '404/',
  file: '404.html',
  kind: 'legal',
  noindex: true,
  title: 'Seite nicht gefunden – E-Rechnung Klartext',
  description: 'Diese Seite gibt es nicht. Zum Werkzeug und zu den Ratgebern rund um die E-Rechnung.',
  h1: 'Seite nicht gefunden',
  updated: UPDATED,
  html: () => `      <header class="hero-article">
        <h1>Seite nicht gefunden</h1>
        <p class="lead">Diese Adresse gibt es auf E-Rechnung Klartext nicht (mehr). Hier geht es weiter:</p>
      </header>
      <div class="cta-box">
        <p><strong>E-Rechnung öffnen</strong>XRechnung oder ZUGFeRD im Browser anzeigen, prüfen und als PDF speichern.</p>
        <a class="btn btn-primary" href="${href('')}">Zum Werkzeug</a>
      </div>
      <section class="related" aria-labelledby="ratgeber">
        <h2 id="ratgeber">Ratgeber</h2>
        <div class="card-grid">
          ${[...RATGEBER, { slug: 'fehlercodes/', label: 'Fehlercodes' }, { slug: 'begriffe/', label: 'Begriffe' }].map((r) => `<a class="card-link" href="${href(r.slug)}"><h3>${esc(r.label)}</h3></a>`).join('\n          ')}
        </div>
      </section>`,
};

export default [impressum, datenschutz, notFound];
