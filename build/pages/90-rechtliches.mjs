import { href, RATGEBER, esc } from '../site.mjs';
import { UPDATED, dateLong } from '../content.mjs';

const impressum = {
  slug: 'impressum/',
  kind: 'legal',
  title: 'Impressum – E-Rechnung Klartext',
  description: 'Impressum von E-Rechnung Klartext: Anbieter, Kontakt und Verantwortlicher für den Inhalt.',
  h1: 'Impressum',
  llms: 'Anbieterkennzeichnung nach § 5 DDG.',
  crumbs: [{ slug: 'impressum/', label: 'Impressum' }],
  updated: UPDATED,
  html: () => `      <header class="hero-article">
        <h1>Impressum</h1>
      </header>
      <article class="prose">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>S. Thomas Freimoser<br>München, Deutschland</p>
        <h2>Kontakt</h2>
        <p>E-Mail: kontakt [at] freimoser.de<br>LinkedIn: <a href="https://www.linkedin.com/in/freimoser">linkedin.com/in/freimoser</a></p>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>S. Thomas Freimoser<br>(Anschrift wie oben)</p>
        <h2>Haftung für Inhalte</h2>
        <p>Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Die Ratgeber sind allgemeine Information, keine Steuer- oder Rechtsberatung. Die Vorprüfung im Werkzeug ist keine amtliche Validierung.</p>
        <h2>Haftung für Links</h2>
        <p>Diese Website enthält Links zu externen Webseiten Dritter, auf deren Inhalte kein Einfluss besteht. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.</p>
        <h2>Urheberrecht</h2>
        <p>Die durch den Betreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Der Quellcode des Werkzeugs steht unter der MIT-Lizenz; verwendete Bibliotheken und Daten Dritter sind im <a href="https://github.com/freimoser/e-rechnung-klartext#lizenzen">README auf GitHub</a> mit ihren Lizenzen aufgeführt.</p>
        <h2>Über den Entwickler</h2>
        <p>Weitere Informationen und Projekte: <a href="https://freimoser.github.io/freimoser.de/">freimoser.de</a>.</p>
      </article>`,
};

const datenschutz = {
  slug: 'datenschutz/',
  kind: 'legal',
  title: 'Datenschutz – E-Rechnung Klartext',
  description: 'Datenschutzerklärung: Rechnungen werden nur lokal im Browser verarbeitet. Keine Cookies, kein Tracking; nur GitHub Pages verarbeitet Zugriffsdaten.',
  h1: 'Datenschutzerklärung',
  llms: 'Datenschutzerklärung: keine Datenerhebung durch die Website, Rechnungen nur lokal im Browser, Hosting bei GitHub Pages.',
  crumbs: [{ slug: 'datenschutz/', label: 'Datenschutz' }],
  updated: UPDATED,
  html: () => `      <header class="hero-article">
        <h1>Datenschutzerklärung</h1>
        <p class="meta-line">Stand: ${dateLong(UPDATED)}</p>
      </header>
      <article class="prose">
        <h2 id="kurz">Kurz gesagt</h2>
        <p>Diese Website erhebt selbst keine personenbezogenen Daten. Rechnungen, die du im Werkzeug öffnest, werden ausschließlich in deinem Browser verarbeitet und nicht hochgeladen. Es gibt keine Cookies, kein Tracking, keine Analysewerkzeuge, keine Werbung und keine eingebundenen Inhalte fremder Anbieter, auch keine externen Schriften.</p>

        <h2 id="verantwortlich">Verantwortlicher</h2>
        <p>S. Thomas Freimoser, München, Deutschland. E-Mail: kontakt [at] freimoser.de. Weitere Angaben im <a href="${href('impressum/')}">Impressum</a>.</p>

        <h2 id="rechnungen">Verarbeitung deiner Rechnungen</h2>
        <p>Wenn du eine Datei auswählst oder in das Werkzeug ziehst, liest dein Browser sie direkt von deinem Gerät. Anzeige, Vorprüfung, PDF- und CSV-Export laufen vollständig in deinem Browser. Die Datei und ihre Inhalte werden weder an uns noch an Dritte übertragen und nicht dauerhaft gespeichert. Schließt du den Tab, ist alles wieder weg.</p>
        <p>Die Sicherheitsrichtlinie der Seite (Content-Security-Policy) erlaubt technisch nur Verbindungen zu dieser Website selbst. Wie du das nachprüfen kannst, steht direkt beim Datei-Feld im <a href="${href('')}">Werkzeug</a>.</p>

        <h2 id="offline">Offline-Speicher im Browser</h2>
        <p>Damit das Werkzeug auch ohne Internet funktioniert, legt dein Browser beim ersten Besuch eine Kopie der Programmdateien dieser Website im Zwischenspeicher ab (Service Worker). Darin stehen nur Dateien der Website, niemals deine Rechnungen. Du kannst den Speicher jederzeit über die Einstellungen deines Browsers („Websitedaten löschen“) entfernen.</p>

        <h2 id="hosting">Hosting durch GitHub Pages</h2>
        <p>Die Website wird bei GitHub Pages gehostet, einem Dienst der GitHub Inc. (USA). Beim Aufruf der Seiten verarbeitet GitHub als Hoster technisch notwendige Zugriffsdaten, insbesondere deine IP-Adresse, um die Seiten auszuliefern und die Sicherheit des Dienstes zu gewährleisten. Darauf haben wir keinen Einfluss. Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Einzelheiten stehen in der <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement">Datenschutzerklärung von GitHub</a>.</p>

        <h2 id="links">Externe Links</h2>
        <p>Die Ratgeber verlinken auf amtliche Quellen (z. B. Bundesfinanzministerium, gesetze-im-internet.de, KoSIT). Erst wenn du einen solchen Link anklickst, verlässt du diese Website; dann gelten die Datenschutzbestimmungen des jeweiligen Anbieters.</p>

        <h2 id="rechte">Deine Rechte</h2>
        <p>Du hast nach der DSGVO das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Da diese Website selbst keine personenbezogenen Daten speichert, liegen uns in der Regel keine Daten über dich vor.</p>
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
