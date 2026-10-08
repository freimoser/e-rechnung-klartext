import {
  BASE, SITE_NAME, TAGLINE, REPO_URL, GOOGLE_VERIFICATION, THEME_COLOR, AUTHOR,
  NAV, RATGEBER, MORE_TOOLS, href, abs, esc,
} from './site.mjs';

export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-src blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

export const LOGO_SVG = `<svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true" focusable="false"><path d="M3 1.5h13.5L23.5 8.5V27a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 27V3A1.5 1.5 0 0 1 3 1.5z" fill="#fff"/><path d="M16.5 1.5V7a1.5 1.5 0 0 0 1.5 1.5h5.5" fill="#bfdbfe"/><rect x="5.5" y="12" width="9" height="2" rx="1" fill="#1d4ed8"/><rect x="5.5" y="16.5" width="15" height="2" rx="1" fill="#93c5fd"/><rect x="5.5" y="21" width="15" height="2" rx="1" fill="#93c5fd"/></svg>`;

function jsonld(obj) {
  // "<" escapen, damit kein Text das Skript-Element beenden kann
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

function breadcrumbLd(page) {
  const items = [{ name: SITE_NAME, url: abs('') }];
  for (const c of page.crumbs || []) items.push({ name: c.label, url: abs(c.slug) });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function faqLd(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) },
    })),
  };
}

export function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function articleLd(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.description,
    inLanguage: 'de-DE',
    datePublished: page.published || page.updated,
    dateModified: page.updated,
    author: AUTHOR,
    publisher: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    mainEntityOfPage: abs(page.slug),
    image: abs('og-image.png'),
  };
}

function nav(page) {
  const links = NAV.map((n) => {
    const cur = n.slug === page.slug ? ' aria-current="page"' : '';
    return `<a href="${href(n.slug)}"${cur}>${esc(n.label)}</a>`;
  }).join('\n      ');
  return `<nav class="site-nav" aria-label="Hauptnavigation">
      ${links}
    </nav>`;
}

function header() {
  return `<header class="header">
      <a class="brand" href="${href('')}">
        <span class="logo">${LOGO_SVG}</span>
        <span>
          <span class="brand-name">${SITE_NAME}</span>
          <span class="tagline">${esc(TAGLINE)}</span>
        </span>
      </a>
      <p class="privacy-badge" title="Rechnungen werden nur in deinem Browser gelesen">
        <span class="dot" aria-hidden="true"></span>
        100 % lokal – nichts wird hochgeladen
      </p>
    </header>`;
}

function breadcrumb(page) {
  if (!page.crumbs || !page.crumbs.length) return '';
  const items = [`<li><a href="${href('')}">${SITE_NAME}</a></li>`];
  page.crumbs.forEach((c, i) => {
    const last = i === page.crumbs.length - 1;
    items.push(last
      ? `<li><span aria-current="page">${esc(c.label)}</span></li>`
      : `<li><a href="${href(c.slug)}">${esc(c.label)}</a></li>`);
  });
  return `<nav class="breadcrumb" aria-label="Brotkrumen"><ol>${items.join('')}</ol></nav>`;
}

function footer() {
  const list = (arr) => arr.map((r) => `<li><a href="${href(r.slug)}">${esc(r.label)}</a></li>`).join('\n            ');
  const more = MORE_TOOLS.map((t) => `<li><a href="${t.url}">${esc(t.label)}</a></li>`).join('\n            ');
  return `<footer class="site-footer">
      <div class="site-footer-grid">
        <div>
          <h2>Werkzeug</h2>
          <ul>
            <li><a href="${href('')}">E-Rechnung öffnen</a></li>
            <li><a href="${href('fehlercodes/')}">Fehlercodes</a></li>
            <li><a href="${href('begriffe/')}">Begriffe</a></li>
            <li><a href="${REPO_URL}/blob/main/quellen.md">Quellen</a></li>
            <li><a href="${REPO_URL}">Quellcode auf GitHub</a></li>
          </ul>
        </div>
        <div>
          <h2>Ratgeber</h2>
          <ul>
            ${list(RATGEBER)}
          </ul>
        </div>
        <div>
          <h2>Weitere kostenlose Tools</h2>
          <ul>
            ${more}
          </ul>
        </div>
        <div>
          <h2>Rechtliches</h2>
          <ul>
            <li><a href="${href('impressum/')}">Impressum</a></li>
            <li><a href="${href('datenschutz/')}">Datenschutz</a></li>
          </ul>
        </div>
      </div>
      <p class="site-footer-note">${SITE_NAME} · Open Source (MIT) · keine Cookies, kein Tracking · allgemeine Information, keine Steuer- oder Rechtsberatung</p>
    </footer>`;
}

export function renderPage(page, ctx) {
  const url = abs(page.slug);
  const title = page.title;
  const ogTitle = page.ogTitle || page.title;
  const lds = [];
  if (page.crumbs && page.crumbs.length) lds.push(breadcrumbLd(page));
  if (page.kind === 'ratgeber' || page.kind === 'reference') lds.push(articleLd(page));
  if (page.faq && page.faq.length) lds.push(faqLd(page.faq));
  for (const extra of page.jsonld || []) lds.push(extra);

  const robots = page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  const canonical = page.noindex ? '' : `\n  <link rel="canonical" href="${url}">`;
  const scripts = (page.scripts || []).map((s) => `\n  <script type="module" src="${BASE}${s}?v=${ctx.version}"></script>`).join('');
  const pageClass = page.wide ? 'page' : 'page page-content';
  // Seitlich scrollbare Tabellen per Tastatur erreichbar machen (WCAG: scrollable-region-focusable)
  const body = page.html.replace(/<div class="table-scroll([^"]*)">/g, '<div class="table-scroll$1" tabindex="0" role="region" aria-label="Tabelle, bei Bedarf seitlich scrollbar">');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="${robots}">${canonical}
  <meta name="google-site-verification" content="${GOOGLE_VERIFICATION}" />
  <meta name="theme-color" content="${THEME_COLOR}">
  <meta name="author" content="${esc(AUTHOR.name)}">
  <meta property="og:type" content="${page.kind === 'tool' ? 'website' : 'article'}">
  <meta property="og:locale" content="de_DE">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${abs('og-image.png')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${SITE_NAME}: E-Rechnungen im Browser öffnen, ohne Upload">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ogTitle)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${abs('og-image.png')}">
  <link rel="stylesheet" href="${BASE}assets/css/site.css?v=${ctx.version}">
  <link rel="icon" href="${BASE}favicon.ico" sizes="any">
  <link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${BASE}favicon-16.png" type="image/png" sizes="16x16">
  <link rel="icon" href="${BASE}favicon-32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="${BASE}favicon-48.png" type="image/png" sizes="48x48">
  <link rel="apple-touch-icon" href="${BASE}apple-touch-icon.png" sizes="180x180">
  <link rel="manifest" href="${BASE}site.webmanifest">
  ${lds.map(jsonld).join('\n  ')}${scripts}
  <script type="module" src="${BASE}assets/js/sw-register.js?v=${ctx.version}"></script>
</head>
<body>
  <a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
  <div class="${pageClass}">
    ${nav(page)}

    ${header()}

    <main id="inhalt">
      ${breadcrumb(page)}
${body}
    </main>

    ${footer()}
  </div>
</body>
</html>
`;
}
