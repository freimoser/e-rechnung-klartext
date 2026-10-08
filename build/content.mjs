// Bausteine für die Inhaltsseiten: Quellenangaben, FAQ, Handlungsaufforderung, weiterführende Links.
import { Q, ABGERUFEN } from '../src/assets/js/quellen.js';
import { href, esc, RATGEBER } from './site.mjs';

export const UPDATED = '2026-10-08';

export function dateDE(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export function dateLong(iso) {
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}. ${months[m - 1]} ${y}`;
}

// Quellenangabe mit Stand-Datum: src('ustae', 'Abschnitt 14.1 Abs. 5')
export function src(id, fundstelle = '') {
  const q = Q[id];
  if (!q) throw new Error('Unbekannte Quelle ' + id);
  const title = esc(q.titel.replace(/^BMF-Schreiben „.*“$/, 'BMF-Schreiben'));
  const label = q.url ? `<a href="${esc(q.url)}">${title}</a>` : title;
  const extra = [q.version, fundstelle].filter(Boolean).map(esc).join(', ');
  return `<span class="source">Stand ${dateDE(ABGERUFEN)}, Quelle: ${label}${extra ? ` (${extra})` : ''}</span>`;
}

// Mehrere Quellen in einer Zeile
export function srcs(...items) {
  return items.map(([id, f]) => src(id, f)).join('');
}

export const LEGAL_NOTE = '<p class="legal-note">Allgemeine Information, keine Steuer- oder Rechtsberatung. Für deinen Einzelfall wende dich an deine Steuerberatung.</p>';

export function metaLine(updated = UPDATED) {
  return `<p class="meta-line">Stand: ${dateLong(updated)} · Allgemeine Information, keine Steuer- oder Rechtsberatung · von <a href="https://freimoser.github.io/freimoser.de/">S. Thomas Freimoser</a></p>`;
}

export function faqHtml(faq, id = 'faq', title = 'Häufige Fragen') {
  return `<h2 id="${id}">${esc(title)}</h2>
      <div class="faq">
        ${faq.map((f) => `<details>
          <summary>${esc(f.q)}</summary>
          <p>${f.a}</p>
        </details>`).join('\n        ')}
      </div>`;
}

export function toc(items) {
  return `<nav class="toc" aria-label="Inhaltsverzeichnis">
      <p class="toc-title">Inhalt</p>
      <ol>${items.map(([id, label]) => `<li><a href="#${id}">${esc(label)}</a></li>`).join('')}</ol>
    </nav>`;
}

export function cta(title = 'E-Rechnung jetzt öffnen', text = 'XRechnung oder ZUGFeRD-Datei im Browser anzeigen, prüfen und als PDF speichern. Nichts wird hochgeladen.') {
  return `<div class="cta-box">
      <p><strong>${esc(title)}</strong>${esc(text)}</p>
      <a class="btn btn-primary" href="${href('')}">Zum Werkzeug</a>
    </div>`;
}

const DESCRIPTIONS = {
  'xrechnung-oder-zugferd/': 'Unterschiede, Vergleichstabelle und Empfehlung je Fall.',
  'xrechnung-in-pdf/': 'Schritt für Schritt als PDF speichern und drucken.',
  'zugferd-rechnung-pruefen/': 'Woran man eine gültige ZUGFeRD-Rechnung erkennt.',
  'e-rechnung-pflicht-ab-wann/': 'Zeitplan für Empfang und Versand mit Übergangsregeln.',
  'e-rechnung-kleinunternehmer/': 'Was beim Empfangen und Ausstellen gilt.',
  'e-rechnung-privatperson/': 'Was für Privatpersonen gilt und was nicht.',
  'e-rechnung-arztpraxis/': 'Arzt-, Zahnarzt- und Tierarztpraxen: was gilt.',
  'peppol/': 'Was Peppol ist und ob man es braucht.',
  'fehlercodes/': 'Alle Prüfregeln mit Erklärung in einfacher Sprache.',
  'begriffe/': 'EN 16931, KoSIT, UBL, CII, Leitweg-ID und mehr.',
};

export function related(slugs) {
  const all = [...RATGEBER, { slug: 'fehlercodes/', label: 'XRechnung-Fehlercodes' }, { slug: 'begriffe/', label: 'Begriffe zur E-Rechnung' }];
  return `<section class="related" aria-labelledby="weiterlesen">
      <h2 id="weiterlesen">Weiterlesen</h2>
      <div class="card-grid">
        ${slugs.map((s) => {
          const r = all.find((x) => x.slug === s);
          return `<a class="card-link" href="${href(s)}"><h3>${esc(r.label)}</h3><p>${esc(DESCRIPTIONS[s] || '')}</p></a>`;
        }).join('\n        ')}
      </div>
    </section>`;
}

// Gemeinsamer Aufbau einer Ratgeberseite
export function ratgeber({ h1, answer, sections, faq, relatedSlugs, tocItems, ctaTitle, ctaText }) {
  return `      <header class="hero-article">
        <h1>${esc(h1)}</h1>
        <p class="answer">${answer}</p>
        ${metaLine()}
      </header>
      ${tocItems ? toc(tocItems) : ''}
      <article class="prose">
${sections}
${faq && faq.length ? faqHtml(faq) : ''}
      </article>
      ${cta(ctaTitle, ctaText)}
      ${LEGAL_NOTE}
      ${related(relatedSlugs)}`;
}
