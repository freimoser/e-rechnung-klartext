// Werkzeug „E-Rechnung öffnen“: alles läuft im Browser, nichts wird hochgeladen.
import { STAND, datumDE, standSatz } from './stand.js';
import { detectSyntax, parseInvoice } from './parse.js';
import { describeFormat, QUELLEN } from './format.js';
import { validate, recompute } from './validate.js';
import { loadCodes } from './codes.js';
import { renderPaper, renderFindings, renderRecompute, esc } from './render.js';
import { XmlView } from './xmlview.js';
import { isPdf, extractPdf } from './zugferd.js';
import { v } from './xml.js';

const BASE = '/e-rechnung-klartext/';
const $ = (sel, root = document) => root.querySelector(sel);

const state = { files: [], active: -1, meta: null };
let xmlView = null;

async function ruleMeta() {
  if (state.meta) return state.meta;
  try {
    state.meta = await (await fetch(BASE + 'assets/data/pruefregeln-werkzeug.json')).json();
  } catch {
    state.meta = {};
  }
  return state.meta;
}

function announce(msg) {
  const s = $('#status');
  if (s) s.textContent = msg;
}

function decodeXml(bytes) {
  let start = 0;
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) start = 3;
  const head = new TextDecoder('latin1').decode(bytes.subarray(start, Math.min(bytes.length, 300)));
  const m = /encoding=["']([A-Za-z0-9._-]+)["']/.exec(head);
  let enc = m ? m[1].toLowerCase() : 'utf-8';
  if (bytes[0] === 0xff && bytes[1] === 0xfe) enc = 'utf-16le';
  if (bytes[0] === 0xfe && bytes[1] === 0xff) enc = 'utf-16be';
  try {
    return new TextDecoder(enc).decode(bytes.subarray(start));
  } catch {
    return new TextDecoder('utf-8').decode(bytes.subarray(start));
  }
}

function parseXmlText(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const err = doc.getElementsByTagName('parsererror')[0];
  if (err) {
    const detail = err.textContent.replace(/\s+/g, ' ').trim();
    return { error: detail };
  }
  return { doc };
}

// Verarbeitet eine Datei vollständig und liefert einen Eintrag für die Dateiliste
export async function processFile(name, bytes) {
  const entry = { name, size: bytes.length, kind: 'unknown', bytes };
  await loadCodes(BASE);
  const meta = await ruleMeta();
  let xmlText = null;
  let pdfInfo = null;
  if (isPdf(bytes)) {
    entry.container = 'pdf';
    pdfInfo = await extractPdf(bytes, BASE);
    entry.pdfInfo = pdfInfo;
    if (!pdfInfo.ok) {
      entry.kind = 'error';
      entry.message = pdfInfo.error;
      return entry;
    }
    if (!pdfInfo.invoice) {
      entry.kind = 'plainpdf';
      return entry;
    }
    entry.xmlName = pdfInfo.invoice.name;
    entry.xmlBytes = pdfInfo.invoice.data;
    xmlText = decodeXml(pdfInfo.invoice.data);
  } else {
    entry.container = 'xml';
    xmlText = decodeXml(bytes);
    if (!/^\s*</.test(xmlText)) {
      entry.kind = 'notxml';
      return entry;
    }
  }
  const parsed = parseXmlText(xmlText);
  if (parsed.error) {
    entry.kind = 'broken';
    entry.message = parsed.error;
    return entry;
  }
  entry.doc = parsed.doc;
  const syn = detectSyntax(parsed.doc);
  if (syn.syntax === 'ZUGFeRD1') {
    entry.kind = 'zugferd1';
    return entry;
  }
  if (syn.syntax === 'unknown') {
    entry.kind = 'otherxml';
    entry.root = syn.rootName;
    return entry;
  }
  const inv = parseInvoice(parsed.doc);
  entry.inv = inv;
  entry.format = describeFormat(inv, entry.container, pdfInfo);
  entry.findings = validate(inv, entry.format, meta);
  entry.recompute = recompute(inv);
  entry.kind = 'invoice';
  return entry;
}

/* ---------------- Anzeige ---------------- */

function sizeText(n) {
  return n > 1048576 ? `${(n / 1048576).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(n / 1024)).toLocaleString('de-DE')} KB`;
}

function quelleLink(q) {
  if (!q) return '';
  return `<span class="source">Stand ${datumDE(STAND.quellenAbgerufen)}, Quelle: <a href="${esc(q.url)}">${esc(q.text)}</a></span>`;
}

const AUFBEWAHRUNG = `<div class="notice no-print"><h3>Wichtig für die Ablage</h3>
  <p>Das Original ist die XML-Datei bzw. die ZUGFeRD-PDF, so wie du sie bekommen hast. Bewahre sie unverändert auf. Das PDF, das du hier erzeugen kannst, ist nur eine Ansicht und ersetzt das Original nicht.
  <span class="source">Stand ${datumDE(STAND.quellenAbgerufen)}, Quelle: <a href="${QUELLEN.bmfAufbewahrung.url}">${QUELLEN.bmfAufbewahrung.text}</a> (der strukturierte Teil ist unversehrt in seiner ursprünglichen Form aufzubewahren)</span></p></div>`;

function pruefHinweis() {
  return `<p class="stand-line">${esc(standSatz())} (Spezifikation vom ${datumDE(STAND.xrechnung.spezifikationVom)}, EN-16931-Regeln ${STAND.cen.version}).</p>
  <p class="disclaimer"><strong>Vorprüfung, keine amtliche Validierung.</strong> Geprüft werden die häufigsten offiziellen Regeln. Verbindlich ist das <a href="${STAND.pruefwerkzeug.url}">offizielle KoSIT-Prüftool</a> (${esc(STAND.pruefwerkzeug.name)}).</p>`;
}

function renderNotice(entry) {
  const title = esc(entry.name);
  let body = '';
  switch (entry.kind) {
    case 'plainpdf':
      body = `<div class="notice is-warn"><h3>Das ist eine normale PDF, keine E-Rechnung</h3>
        <p>In dieser PDF-Datei stecken keine eingebetteten Rechnungsdaten (keine XML-Datei). Eine solche Datei ist nach dem Umsatzsteuergesetz keine E-Rechnung, sondern eine „sonstige Rechnung“. Ob du sie annehmen musst, hängt davon ab, ob für diese Rechnung schon die E-Rechnungspflicht gilt; in der Übergangszeit ist sie nur mit deiner Zustimmung zulässig.</p>
        <p>${quelleLink(QUELLEN.ustaePdf)}</p>
        <p>Mehr dazu: <a href="${BASE}e-rechnung-pflicht-ab-wann/">E-Rechnung: Pflicht ab wann?</a></p></div>`;
      if (entry.pdfInfo && entry.pdfInfo.attachments.length) body += attachmentsList(entry, 'In der PDF stecken trotzdem diese Dateien:');
      break;
    case 'broken':
      body = `<div class="notice is-error"><h3>Die XML-Datei ist beschädigt</h3>
        <p>Die Datei lässt sich nicht als XML lesen. Häufige Ursachen: Die Datei wurde unvollständig übertragen, von Hand bearbeitet oder ist gar keine XML-Datei. Bitte den Rechnungssteller um eine neue Datei.</p>
        <p class="muted">Meldung des Browsers: ${esc(entry.message.slice(0, 400))}</p></div>`;
      break;
    case 'notxml':
      body = `<div class="notice is-error"><h3>Keine XML- oder PDF-Datei</h3><p>Diese Datei ist weder XML noch PDF. E-Rechnungen kommen als XML-Datei (XRechnung) oder als PDF mit eingebetteter XML (ZUGFeRD, Factur-X).</p></div>`;
      break;
    case 'otherxml':
      body = `<div class="notice is-warn"><h3>XML-Datei, aber keine bekannte Rechnung</h3><p>Das Wurzelelement heißt „${esc(entry.root)}“. Erkannt werden Rechnungen in UBL 2.1 (Invoice, CreditNote) und UN/CEFACT CII (CrossIndustryInvoice).</p></div>`;
      break;
    case 'zugferd1':
      body = `<div class="notice is-warn"><h3>ZUGFeRD 1.0 erkannt</h3><p>Diese Rechnung nutzt das alte Format ZUGFeRD 1.0. Laut BMF gilt ZUGFeRD erst ab Version 2.0.1 als zulässiges E-Rechnungsformat. Bitte den Rechnungssteller um eine aktuelle Fassung.</p><p>${quelleLink(QUELLEN.bmfRn25)}</p></div>`;
      break;
    case 'error':
      body = `<div class="notice is-error"><h3>Datei konnte nicht gelesen werden</h3><p>${esc(entry.message)}</p></div>`;
      break;
    default:
      body = '';
  }
  return `<div class="result-head no-print"><div><h2>${title}</h2><p class="muted">${sizeText(entry.size)}</p></div>
    <div class="actions"><button type="button" class="btn btn-ghost" data-action="close">Datei schließen</button></div></div>${body}
    ${entry.doc ? rawPanel() : ''}`;
}

function attachmentsList(entry, lead) {
  return `<div class="panel"><h2>Eingebettete Dateien</h2><p>${esc(lead)}</p><ul>${entry.pdfInfo.attachments.map((f, i) => `<li>${esc(f.name)} <button type="button" class="btn btn-ghost" data-action="download-pdf-attachment" data-index="${i}">herunterladen</button></li>`).join('')}</ul></div>`;
}

function rawPanel() {
  return `<details class="panel no-print" id="roh">
    <summary><strong>Rohansicht für Profis (XML)</strong></summary>
    <p class="muted">Tipp: Ist diese Ansicht geöffnet, springt ein Klick auf einen Wert in der Rechnungsansicht zur passenden Stelle im XML. Mit der Tastatur geht es über die Suche.</p>
    <div class="raw-tools">
      <label class="visually-hidden" for="raw-search">Im XML suchen</label>
      <input type="search" id="raw-search" placeholder="Im XML suchen, z. B. BuyerReference" autocomplete="off">
      <button type="button" class="btn btn-ghost" data-action="raw-prev">Vorheriger</button>
      <button type="button" class="btn btn-ghost" data-action="raw-next">Nächster</button>
    </div>
    <div class="raw-view" id="raw-view" tabindex="0" aria-label="XML-Inhalt"></div>
    <p class="raw-status" id="raw-status" aria-live="polite"></p>
  </details>`;
}

function renderInvoice(entry) {
  const { inv, format } = entry;
  const errors = entry.findings.filter((f) => f.flag === 'fatal' || f.flag === 'error').length;
  const warns = entry.findings.filter((f) => f.flag === 'warning').length;
  const infos = entry.findings.filter((f) => f.flag === 'information').length;
  const ctx = { fileName: entry.name, allLines: entry.allLines, initialLines: 200, pdfAttachments: entry.pdfInfo ? entry.pdfInfo.attachments : [] };
  const paper = renderPaper(inv, ctx);
  entry.refs = paper.refs;
  const fmtLine = [format.standard, format.version, format.profile && `Profil ${format.profile}`].filter(Boolean).join(' ');
  const er = format.eRechnung;
  const erCls = er.status === 'ja' ? 'is-ok' : er.status === 'nein' ? 'is-error' : 'is-warn';
  const erText = er.status === 'ja' ? 'Ja' : er.status === 'nein' ? 'Nein' : 'Nicht sicher';
  const checkCls = !format.applyEN16931 ? 'is-warn' : errors ? 'is-error' : warns ? 'is-warn' : 'is-ok';
  const checkText = !format.applyEN16931
    ? 'nicht anwendbar'
    : errors ? `${errors} ${errors === 1 ? 'Fehler' : 'Fehler'}${warns ? `, ${warns} ${warns === 1 ? 'Warnung' : 'Warnungen'}` : ''}`
      : warns ? `keine Fehler, ${warns} ${warns === 1 ? 'Warnung' : 'Warnungen'}` : 'keine Fehler gefunden';
  const findingsHtml = renderFindings(entry.findings, state.meta || {}, BASE, entry.refs);
  const pdfBtn = entry.container === 'pdf' && entry.xmlBytes ? `<button type="button" class="btn btn-ghost" data-action="xml">Eingebettete XML speichern</button>` : '';
  return `<div class="result-head no-print">
      <div><h2>${esc(entry.name)}</h2><p class="muted">${esc(fmtLine)} · ${esc(format.syntaxLabel)} · ${inv.lines.length.toLocaleString('de-DE')} ${inv.lines.length === 1 ? 'Position' : 'Positionen'} · ${sizeText(entry.size)}</p></div>
      <div class="actions">
        <button type="button" class="btn btn-primary" data-action="pdf">Als PDF speichern</button>
        <button type="button" class="btn btn-ghost" data-action="print">Drucken</button>
        <button type="button" class="btn btn-ghost" data-action="csv">Positionen als CSV</button>
        ${pdfBtn}
        <button type="button" class="btn btn-ghost" data-action="close">Datei schließen</button>
      </div>
    </div>
    <div class="facts no-print">
      <div class="fact"><span class="label">Format</span><span class="value">${esc(fmtLine || 'unbekannt')}</span>
        <p>Syntax: ${esc(format.syntaxLabel)}${entry.container === 'pdf' ? ` · eingebettet als „${esc(entry.xmlName)}“` : ''}</p>
        ${format.outdated ? `<p><strong>${esc(format.outdated)}</strong></p>` : ''}
        ${format.specId ? `<p class="muted">Kennung (BT-24): <code>${esc(format.specId)}</code></p>` : ''}</div>
      <div class="fact ${erCls}"><span class="label">Gilt als E-Rechnung?</span><span class="value">${erText}</span>
        <p>${esc(er.text)}</p>${er.status === 'ja' && errors ? '<p><strong>Das Format ist zulässig, die Vorprüfung hat aber Fehler gefunden.</strong> Bitte den Rechnungssteller um eine korrigierte Rechnung.</p>' : ''}${er.quelle ? `<p>${quelleLink(er.quelle)}</p>` : ''}</div>
      <div class="fact ${checkCls}"><span class="label">Vorprüfung</span><span class="value">${esc(checkText)}</span>
        <p><a href="#pruefung">Zu den Einzelheiten</a></p></div>
    </div>
    ${AUFBEWAHRUNG}
    <section class="panel no-print" id="pruefung" aria-labelledby="pruefung-titel">
      <h2 id="pruefung-titel">Vorprüfung</h2>
      ${pruefHinweis()}
      ${!format.applyEN16931 ? `<p>Für das Profil ${esc(format.profile)} gelten die Regeln der EN 16931 nicht vollständig; deshalb werden hier nur die Summen nachgerechnet.</p>` : ''}
      ${format.applyEN16931 && !entry.findings.length ? '<div class="notice is-ok"><p>Die Vorprüfung hat keine Fehler und keine Warnungen gefunden.</p></div>' : ''}
      ${findingsHtml}
      <h3>Summen und Steuer nachgerechnet</h3>
      ${renderRecompute(entry.recompute, v(inv.currency))}
    </section>
    <section id="ansicht" aria-label="Rechnungsansicht">${paper.html}</section>
    ${rawPanel()}`;
}

function renderTabs() {
  const box = $('#files');
  if (state.files.length < 2) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }
  box.classList.remove('hidden');
  box.innerHTML = state.files.map((f, i) => `<button type="button" role="tab" class="btn btn-ghost file-tab" aria-selected="${i === state.active}" data-tab="${i}">${esc(f.name)}</button>`).join('');
}

function show(i) {
  state.active = i;
  renderTabs();
  const res = $('#result');
  const entry = state.files[i];
  if (!entry) {
    res.classList.add('hidden');
    res.innerHTML = '';
    return;
  }
  res.classList.remove('hidden');
  res.innerHTML = entry.kind === 'invoice' ? renderInvoice(entry) : renderNotice(entry);
  xmlView = null;
  const raw = $('#roh', res);
  if (raw) {
    raw.addEventListener('toggle', () => {
      const paper = $('.paper', res);
      if (raw.open) {
        ensureXmlView(entry);
        if (paper) paper.classList.add('linkable');
      } else if (paper) paper.classList.remove('linkable');
    });
    $('#raw-search', res).addEventListener('input', (e) => { ensureXmlView(entry); xmlView.search(e.target.value); });
    $('#raw-search', res).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); xmlView.next(e.shiftKey ? -1 : 1); } });
  }
}

function ensureXmlView(entry) {
  if (xmlView) return xmlView;
  xmlView = new XmlView($('#raw-view'), $('#raw-status'));
  xmlView.load(entry.doc);
  return xmlView;
}

function jumpToElement(entry, el) {
  const raw = $('#roh');
  if (!raw || !el) return;
  raw.open = true;
  const view = ensureXmlView(entry);
  $('.paper') && $('.paper').classList.add('linkable');
  requestAnimationFrame(() => {
    view.jumpTo(el);
    raw.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ---------------- Aktionen ---------------- */

async function handleFiles(list) {
  const files = Array.from(list || []);
  if (!files.length) return;
  announce(files.length === 1 ? `Lese ${files[0].name} …` : `Lese ${files.length} Dateien …`);
  let first = -1;
  for (const file of files) {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const entry = await processFile(file.name, bytes);
      state.files.push(entry);
      if (first < 0) first = state.files.length - 1;
    } catch (e) {
      state.files.push({ name: file.name, size: file.size, kind: 'error', message: 'Beim Lesen ist ein Fehler aufgetreten: ' + e.message });
      if (first < 0) first = state.files.length - 1;
    }
    await new Promise((r) => setTimeout(r, 0));
  }
  show(first);
  const e = state.files[first];
  announce(e.kind === 'invoice'
    ? `${e.name} geöffnet: ${e.format.standard}, ${e.findings.length ? e.findings.length + ' Befunde in der Vorprüfung' : 'keine Befunde in der Vorprüfung'}.`
    : `${e.name} geöffnet.`);
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadSample(name) {
  announce('Lade Beispielrechnung …');
  const res = await fetch(BASE + 'beispiele/' + name);
  const blob = await res.blob();
  await handleFiles([new File([blob], name)]);
}

async function onAction(btn) {
  const entry = state.files[state.active];
  const act = btn.dataset.action;
  if (!entry && !['sample'].includes(act)) return;
  const exp = () => import('./export.js');
  const baseName = entry ? entry.name.replace(/\.(xml|pdf)$/i, '') : '';
  if (act === 'pdf') {
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'PDF wird erzeugt …';
    try {
      const { invoicePdf, download } = await exp();
      const bytes = await invoicePdf(entry.inv, { base: BASE, fileName: entry.name });
      download(bytes, `${baseName}-ansicht.pdf`, 'application/pdf');
      announce('PDF erstellt.');
    } catch (e) {
      announce('Das PDF konnte nicht erzeugt werden: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  } else if (act === 'csv') {
    const { invoiceCsv, download } = await exp();
    download(invoiceCsv(entry.inv), `${baseName}-positionen.csv`, 'text/csv;charset=utf-8');
    announce('CSV erstellt.');
  } else if (act === 'xml') {
    const { download } = await exp();
    download(entry.xmlBytes, entry.xmlName || `${baseName}.xml`, 'application/xml');
  } else if (act === 'print') {
    if (!entry.allLines && entry.inv.lines.length > 200) {
      entry.allLines = true;
      show(state.active);
    }
    setTimeout(() => window.print(), 50);
  } else if (act === 'all-lines') {
    entry.allLines = true;
    announce(`Zeige alle ${entry.inv.lines.length.toLocaleString('de-DE')} Positionen …`);
    setTimeout(() => { show(state.active); $('#ansicht').scrollIntoView({ block: 'start' }); }, 30);
  } else if (act === 'close') {
    state.files.splice(state.active, 1);
    show(Math.min(state.active, state.files.length - 1));
    announce('Datei geschlossen.');
    if (!state.files.length) $('#file-button').focus();
  } else if (act === 'download-embedded') {
    const d0 = entry.inv.docs[Number(btn.dataset.index)];
    if (!d0 || !d0.bin) return;
    const { download } = await exp();
    const bin = atob(d0.bin.data.replace(/\s+/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    download(bytes, d0.bin.filename || 'anhang', d0.bin.mime || 'application/octet-stream');
  } else if (act === 'download-pdf-attachment') {
    const f = entry.pdfInfo.attachments[Number(btn.dataset.index)];
    const { download } = await exp();
    download(f.data, f.name, f.mime || 'application/octet-stream');
  } else if (act === 'raw-next' || act === 'raw-prev') {
    ensureXmlView(entry).next(act === 'raw-next' ? 1 : -1);
  }
}

function init() {
  const input = $('#file-input');
  const zone = $('#dropzone');
  if (!input || !zone) return;
  $('#file-button').addEventListener('click', () => input.click());
  input.addEventListener('change', () => { handleFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove('dragover'); }));
  zone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
  // Dateien, die neben der Ablagefläche fallen gelassen werden, nicht im Browser öffnen
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  document.addEventListener('click', (e) => {
    const sample = e.target.closest('[data-sample]');
    if (sample) { loadSample(sample.dataset.sample); return; }
    const tab = e.target.closest('[data-tab]');
    if (tab) { show(Number(tab.dataset.tab)); return; }
    const jump = e.target.closest('[data-jump]');
    const entry = state.files[state.active];
    if (jump && entry) { jumpToElement(entry, entry.refs[Number(jump.dataset.jump)]); return; }
    const btn = e.target.closest('[data-action]');
    if (btn) { onAction(btn); return; }
    const x = e.target.closest('.paper.linkable .xref');
    if (x && entry) jumpToElement(entry, entry.refs[Number(x.dataset.x)]);
  });
  document.documentElement.classList.add('js');
}

init();
