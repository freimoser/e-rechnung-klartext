import { href, abs, esc } from '../site.mjs';
import { src, srcs, metaLine, faqHtml, cta, related, LEGAL_NOTE, UPDATED, dateDE } from '../content.mjs';
import { loadRules, GROUPS, cmp } from '../rules.mjs';
import { STAND, standSatz } from '../../src/assets/js/stand.js';
import { Q } from '../../src/assets/js/quellen.js';

const STUFE = { fatal: 'Fehler', error: 'Fehler', warning: 'Warnung', information: 'Hinweis' };

function stufe(flags) {
  const u = flags.UBL && STUFE[flags.UBL];
  const c = flags.CII && STUFE[flags.CII];
  if (u && c && u !== c) return `${u} (UBL), ${c} (CII)`;
  return u || c || '';
}

// Ohne führende Nullen, z. B. BR-01 → br-1 (so stehen die Codes in der Spezifikation)
function alias(id) {
  const a = id.toLowerCase().replace(/-0+(\d)/g, '-$1');
  return a !== id.toLowerCase() ? a : null;
}

const faq = [
  { q: 'Was bedeutet BR-DE-15?', a: 'Die Käuferreferenz (BT-10) fehlt. Bei Rechnungen an Behörden steht dort die Leitweg-ID. Beheben muss es der Rechnungssteller; die Referenz bekommt er vom Rechnungsempfänger.' },
  { q: 'Was ist der Unterschied zwischen Fehler und Warnung?', a: 'Bei einem Fehler (Stufe „fatal“) entspricht die Rechnung nicht den Regeln; das offizielle Prüftool empfiehlt dann, sie nicht automatisch anzunehmen. Eine Warnung weist auf eine Abweichung hin, die die Gültigkeit nach den Prüfregeln nicht aufhebt.' },
  { q: 'Wer muss einen Fehler in einer E-Rechnung beheben?', a: 'Fast immer der Rechnungssteller, denn nur er kann die Datei neu erzeugen. Als Empfänger meldest du ihm den Fehlercode und bittest um eine korrigierte Rechnung.' },
  { q: 'Macht ein Prüffehler die Rechnung steuerlich ungültig?', a: 'Nicht automatisch. Laut BMF ist zu unterscheiden: Formatfehler machen die Datei zu einer sonstigen Rechnung; fehlende Pflichtangaben nach § 14 Abs. 4 UStG machen sie nicht ordnungsgemäß; andere Geschäftsregelfehler, etwa eine fehlende Käuferreferenz, sind umsatzsteuerlich unbeachtlich.' },
  { q: 'Woher stammen die Fehlercodes?', a: 'Aus den offiziellen Prüfregeln: den EN-16931-Regeln von CEN (BR-, BR-CO-, BR-CL-, UBL-, CII-Codes) und den XRechnung-Regeln der KoSIT (BR-DE-, BR-DEX-, BR-TMP-, PEPPOL-Codes).' },
];

function rows(rules) {
  return rules.map((r) => {
    const id = r.id.toLowerCase();
    const al = alias(r.id);
    const off = `<span class="off" lang="${r.lang}">${esc(r.official)}</span>${r.officialAlt.map((t) => `<span class="off-en" lang="${/[äöü]| muss /.test(t) ? 'de' : 'en'}">${esc(t)}</span>`).join('')}${r.de ? `<span class="off-en">Deutsche Fassung (Spezifikation XRechnung 3.0.2): ${esc(r.de)}</span>` : ''}`;
    return `<tr id="${id}"><th scope="row">${al ? `<span id="${al}"></span>` : ''}<a href="#${id}">${esc(r.id)}</a><br><span class="muted">${esc(stufe(r.flags))}</span></th><td>${off}</td><td>${esc(r.plain)}</td><td>${esc(r.cause)}</td><td>${esc(r.who)}</td></tr>`;
  }).join('\n');
}

const all = loadRules();
const groups = GROUPS.map((g) => ({ ...g, rules: all.filter((r) => r.group === g.key).sort((a, b) => cmp(a.id, b.id)) }));
const businessCount = groups.filter((g) => !['ubl', 'cii'].includes(g.key)).reduce((n, g) => n + g.rules.length, 0);

const html = () => `      <header class="hero-article">
        <h1>XRechnung Fehlercodes: alle Prüfregeln erklärt</h1>
        <p class="answer">Ein XRechnung-Fehlercode wie BR-DE-15 oder BR-CO-10 nennt die offizielle Prüfregel, gegen die eine E-Rechnung verstößt. Hier stehen alle ${all.length.toLocaleString('de-DE')} Regeln mit offiziellem Text, Erklärung in einfacher Sprache, typischer Ursache und der Antwort, wer den Fehler beheben muss.</p>
        <p class="stand-line"><strong>${esc(standSatz())}</strong> (Schematron ${STAND.kosit.schematron}, Validator-Konfiguration ${dateDE(STAND.kosit.validatorKonfiguration)}) und CEN-Prüfregeln EN 16931 Version ${STAND.cen.version} vom ${dateDE(STAND.cen.vom)}.</p>
        ${metaLine()}
      </header>

      <div class="prose">
        <p>Die Codes stammen direkt aus den offiziellen Prüfregeln. Fachliche Regeln (BR-…, BR-CO-…, BR-DE-… und weitere, zusammen ${businessCount.toLocaleString('de-DE')}) prüfen den Inhalt der Rechnung. Syntaxregeln (UBL-… und CII-…) prüfen den technischen Aufbau der Datei. Die Stufe „Fehler“ entspricht im Prüfbericht „fatal“.</p>
        <p>${srcs(['xrSchematron'], ['xrValidatorKonfig'], ['cenSchematron'], ['xrSpez', 'Kapitel 12 und 17, deutsche Regeltexte'])}</p>
        <p>Deine Rechnung zeigt einen dieser Codes? <a href="${href('')}">Öffne sie im Werkzeug</a>: Die Vorprüfung nennt die betroffene Stelle und springt auf Wunsch ins XML. Verbindlich ist nur das <a href="${Q.kositValidator.url}">offizielle KoSIT-Prüftool</a>.</p>
      </div>

      <div class="code-search no-print">
        <label for="code-filter">Code oder Stichwort suchen</label>
        <input type="search" id="code-filter" placeholder="z. B. BR-DE-15, Leitweg, IBAN" autocomplete="off">
        <p id="code-count" aria-live="polite">${all.length.toLocaleString('de-DE')} Regeln</p>
      </div>

      <nav class="toc" aria-label="Regelgruppen">
        <p class="toc-title">Regelgruppen</p>
        <ol>${groups.map((g) => `<li><a href="#gruppe-${g.key}">${esc(g.title)}</a> (${g.rules.length})</li>`).join('')}</ol>
      </nav>

      <div class="table-scroll rules-table">
        <table>
          <caption>Alle Prüfregeln der XRechnung ${STAND.xrechnung.version} und der EN 16931 (CEN ${STAND.cen.version}). Stufe laut offiziellem Schematron.</caption>
          <thead><tr><th scope="col">Code und Stufe</th><th scope="col">Offizieller Text</th><th scope="col">Was es bedeutet</th><th scope="col">Typische Ursache</th><th scope="col">Wer muss es beheben?</th></tr></thead>
${groups.map((g) => `          <tbody data-group="${g.key}">
            <tr class="rule-group-head"><th colspan="5" scope="colgroup" id="gruppe-${g.key}">${esc(g.title)} – ${g.rules.length} Regeln<br><span class="muted">${esc(g.lead)}</span></th></tr>
${rows(g.rules)}
          </tbody>`).join('\n')}
        </table>
      </div>

      <article class="prose">
${faqHtml(faq)}
        <p>${srcs(['bmf2025', 'Rn. 6a, 6b und 35a'], ['ustae', 'Abschnitt 14.5 Abs. 1'])}</p>
      </article>
      ${cta('Fehlercode in deiner Rechnung?', 'Öffne die Datei im Werkzeug: Die Vorprüfung zeigt jeden Befund mit Code, Erklärung und Fundstelle im XML.')}
      ${LEGAL_NOTE}
      ${related(['zugferd-rechnung-pruefen/', 'begriffe/', 'xrechnung-oder-zugferd/', 'peppol/'])}`;

export default {
  slug: 'fehlercodes/',
  kind: 'reference',
  wide: true,
  title: 'XRechnung Fehlercodes: alle Prüfregeln einfach erklärt',
  description: `XRechnung Fehlercodes wie BR-DE-15 oder BR-CO-10 verstehen: alle ${all.length.toLocaleString('de-DE')} offiziellen Prüfregeln mit Erklärung, Ursache und wer den Fehler beheben muss.`,
  h1: 'XRechnung Fehlercodes: alle Prüfregeln erklärt',
  llms: 'Vollständiges Verzeichnis aller Prüfregeln (BR, BR-CO, BR-DE, BR-CL, BR-DEC, PEPPOL, UBL, CII) mit offiziellem Text, einfacher Erklärung, typischer Ursache und Zuständigkeit; Sprungmarke je Code, z. B. /fehlercodes/#br-de-15.',
  crumbs: [{ slug: 'fehlercodes/', label: 'Fehlercodes' }],
  updated: UPDATED,
  faq,
  scripts: ['assets/js/fehlercodes.js'],
  jsonld: [{
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Prüfregeln der XRechnung und der EN 16931',
    description: `Offizielle Prüfregeln (KoSIT XRechnung-Schematron ${STAND.kosit.schematron}, CEN ${STAND.cen.version}) mit Erklärung in einfacher Sprache.`,
    url: abs('fehlercodes/'),
    inLanguage: 'de-DE',
    hasDefinedTerm: groups.filter((g) => !['ubl', 'cii'].includes(g.key)).flatMap((g) => g.rules).map((r) => ({
      '@type': 'DefinedTerm',
      termCode: r.id,
      name: r.id,
      description: r.plain,
      url: abs('fehlercodes/') + '#' + r.id.toLowerCase(),
    })),
  }],
  html,
};
