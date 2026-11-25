// Einzelseiten für ausgewählte Prüfregeln (Inhalte in build/fehlercode-seiten.mjs)
import { href, abs, esc } from '../site.mjs';
import { srcs, META_LINE, cta, LEGAL_NOTE } from '../content.mjs';
import { loadRules } from '../rules.mjs';
import { CODE_SEITEN } from '../fehlercode-seiten.mjs';

const STUFE = { fatal: 'Fehler', error: 'Fehler', warning: 'Warnung', information: 'Hinweis' };
const regeln = new Map(loadRules().map((r) => [r.id, r]));
const seite = (id) => `fehlercodes/${id.toLowerCase()}/`;
const ziel = (id) => (CODE_SEITEN[id] ? href(seite(id)) : `${href('fehlercodes/')}#${id.toLowerCase()}`);

function titel(id, kurz) {
  for (const t of [`${id}: ${kurz} – Ursache und Lösung`, `${id}: ${kurz} – Lösung`, `${id}: ${kurz}`]) if (t.length <= 60) return t;
  return `${id}: ${kurz}`;
}

function html(id, c) {
  const r = regeln.get(id);
  const stufe = STUFE[r.flags.UBL || r.flags.CII] || '';
  const quelle = id.startsWith('BR-DE') ? 'xrSchematron' : 'cenSchematron';
  const regeltext = [`<p lang="${r.lang}"><strong>${esc(r.official)}</strong></p>`, ...(r.de ? [`<p>Deutsche Fassung der XRechnung-Spezifikation: ${esc(r.de)}</p>`] : [])].join('\n        ');
  return `      <header class="hero-article">
        <h1>${esc(id)}: ${esc(c.kurz)}</h1>
        <p class="answer">${esc(r.plain)} <strong>Beheben muss es:</strong> ${esc(r.who.replace(/\.$/, ''))}.</p>
        ${META_LINE}
      </header>
      <article class="prose">
        <h2 id="regel">Offizieller Regeltext</h2>
        ${regeltext}
        <p>Stufe: <strong>${stufe}</strong>${stufe === 'Warnung' ? ' (die Rechnung bleibt nach den Prüfregeln gültig)' : ''}. ${srcs([quelle], ...(r.de ? [['xrSpez', 'Kapitel 12 und 17, deutsche Regeltexte']] : []))}</p>

        <h2 id="ursache">Typische Ursache</h2>
        <p>${esc(r.cause)}</p>

        <h2 id="beheben">So behebst du den Fehler</h2>
        <h3>Als Rechnungssteller</h3>
        <ol>
          ${c.beheben.map((s) => `<li>${s}</li>`).join('\n          ')}
        </ol>${c.behebenSrc ? `\n        <p>${srcs(...c.behebenSrc)}</p>` : ''}
        <h3>Als Empfänger</h3>
        <p>Ändern kannst du die Datei nicht; berichtigen muss grundsätzlich der Aussteller. Melde ihm den Code ${esc(id)} und bitte um eine korrigierte E-Rechnung. Mit dem <a href="${href('')}">Werkzeug</a> siehst du, an welcher Stelle der Datei der Fehler liegt, und kannst die neue Rechnung vor dem Buchen prüfen.</p>
        <p>${srcs(['ustae', 'Abschnitt 14.11 Abs. 1 Satz 7 und Abs. 2 Satz 1'])}</p>

        <h2 id="steuer">Ist die Rechnung trotzdem gültig?</h2>
        <p>${c.steuer.text}</p>
        <p>${srcs(...c.steuer.src)}</p>

        <h2 id="verwandt">Verwandte Regeln</h2>
        <ul>
          ${c.verwandt.map((v) => `<li><a href="${ziel(v)}">${esc(v)}</a>: ${esc(regeln.get(v)?.plain || '')}</li>`).join('\n          ')}${(c.links || []).map(([slug, label]) => `\n          <li><a href="${href(slug)}">${esc(label)}</a></li>`).join('')}
          <li><a href="${href('fehlercodes/')}">Alle Fehlercodes im Überblick</a></li>
        </ul>
      </article>
      ${cta(`${id} in deiner Rechnung?`, 'Öffne die Datei im Werkzeug: Die Vorprüfung zeigt den Befund mit Erklärung und springt an die Stelle im XML. Nichts wird hochgeladen.')}
      ${LEGAL_NOTE}`;
}

export default Object.entries(CODE_SEITEN).map(([id, c]) => {
  if (!regeln.has(id)) throw new Error(`Unbekannte Prüfregel ${id}`);
  for (const v of c.verwandt) if (!regeln.has(v)) throw new Error(`${id}: unbekannte verwandte Regel ${v}`);
  return {
    slug: seite(id),
    kind: 'reference',
    title: titel(id, c.kurz),
    description: c.desc,
    h1: `${id}: ${c.kurz}`,
    crumbs: [{ slug: 'fehlercodes/', label: 'Fehlercodes' }, { slug: seite(id), label: id }],
    published: '2026-11-25',
    updated: '2026-11-25',
    // Die Regel als Begriff im Verzeichnis auf /fehlercodes/
    jsonld: [{
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      name: id,
      termCode: id,
      description: regeln.get(id).plain,
      url: abs(seite(id)),
      inDefinedTermSet: abs('fehlercodes/'),
    }],
    html: () => html(id, c),
  };
});
