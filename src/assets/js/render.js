// Erzeugt die Rechnungsansicht („wie auf Papier“) und die Prüfbefunde als HTML.
import { v, has } from './xml.js';
import { dec, fmt } from './dec.js';
import { label, unitLabel, countryLabel, easLabel, noteSubject } from './codes.js';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function dateDE(f) {
  if (!f) return '';
  const iso = f.iso || (/^\d{4}-\d{2}-\d{2}$/.test(f.v) ? f.v : null);
  if (!iso) return f.v;
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export function moneyText(value, currency) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  try {
    if (currency && /^[A-Z]{3}$/.test(currency)) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: Math.max(2, decimalsOf(value)) }).format(n);
    }
  } catch {
    // unbekannte Währung
  }
  return `${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: Math.max(2, decimalsOf(value)) })}${currency ? ' ' + currency : ''}`;
}

function decimalsOf(s) {
  const i = String(s).indexOf('.');
  return i < 0 ? 0 : Math.min(String(s).length - i - 1, 6);
}

export function numText(value, maxFrac = 4) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: maxFrac });
}

export function ibanText(s) {
  const c = String(s || '').replace(/\s/g, '');
  return /^[A-Z]{2}\d{2}/.test(c) ? c.replace(/(.{4})/g, '$1 ').trim() : s;
}

// Skonto-Zeilen nach XRechnung (BR-DE-18) in Klartext übersetzen
export function paymentTermsText(raw) {
  const lines = String(raw || '').split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    const m = /^#SKONTO#TAGE=(\d+)#PROZENT=(\d+\.\d{2})(?:#BASISBETRAG=(-?\d+\.\d{2}))?#\s*$/.exec(line.trim());
    if (m) {
      const pct = Number(m[2]).toLocaleString('de-DE', { minimumFractionDigits: 2 });
      out.push(`Skonto: ${pct} % bei Zahlung innerhalb von ${m[1]} Tagen${m[3] ? ` (Basis ${Number(m[3]).toLocaleString('de-DE', { minimumFractionDigits: 2 })})` : ''}`);
    } else if (line.trim()) out.push(line.trim());
  }
  return out;
}

export const DOC_TITLES = {
  '380': 'Rechnung',
  '381': 'Gutschrift',
  '384': 'Korrigierte Rechnung',
  '389': 'Gutschrift (Gutschriftverfahren)',
  '326': 'Teilrechnung',
  '386': 'Vorauszahlungsrechnung',
  '875': 'Abschlagsrechnung',
  '876': 'Teilschlussrechnung',
  '877': 'Schlussrechnung',
};

export function docTitle(inv) {
  return DOC_TITLES[v(inv.typeCode)] || (inv.docType === 'creditnote' ? 'Gutschrift' : 'Rechnung');
}

// Baut die Papieransicht. refs sammelt die XML-Elemente für die Sprungfunktion.
export function renderPaper(inv, ctx) {
  const refs = [];
  const cur = v(inv.currency);
  const X = (field, content) => {
    if (!field) return content ?? '';
    const i = refs.push(field.el) - 1;
    return `<span class="xref" data-x="${i}">${content ?? esc(field.v)}</span>`;
  };
  const M = (field, currency = cur) => (field ? X(field, esc(moneyText(field.v, field.currency || currency))) : '');

  const address = (a) => {
    if (!a) return '';
    const lines = [];
    if (has(a.line1)) lines.push(X(a.line1));
    if (has(a.line2)) lines.push(X(a.line2));
    if (has(a.line3)) lines.push(X(a.line3));
    const city = [a.zip ? X(a.zip) : '', a.city ? X(a.city) : ''].filter(Boolean).join(' ');
    if (city) lines.push(city);
    if (has(a.region)) lines.push(X(a.region));
    if (has(a.country) && a.country.v !== 'DE') lines.push(X(a.country, esc(countryLabel(a.country.v))));
    return lines.join('<br>');
  };

  const party = (p, role) => {
    if (!p) return `<div class="party"><span class="party-role">${role}</span><em>keine Angabe</em></div>`;
    const rows = [];
    if (p.tradingName && p.name && p.tradingName.v !== p.name.v) rows.push(`<span class="code">Handelsname:</span> ${X(p.tradingName)}`);
    const adr = address(p.address);
    if (p.contact) {
      const c = p.contact;
      const cs = [c.name ? X(c.name) : '', c.phone ? `Tel. ${X(c.phone)}` : '', c.email ? X(c.email) : ''].filter(Boolean);
      if (cs.length) rows.push(cs.join('<br>'));
    }
    if (p.vatId) rows.push(`USt-IdNr.: ${X(p.vatId)}`);
    if (p.taxId) rows.push(`Steuernummer: ${X(p.taxId)}`);
    if (p.legalId) rows.push(`Register-/Kennnummer: ${X(p.legalId)}`);
    if (p.ids) p.ids.forEach((id) => rows.push(`Kennung: ${X(id)}${id.scheme ? ` <span class="code">(${esc(id.scheme)})</span>` : ''}`));
    if (p.endpoint) rows.push(`Elektronische Adresse: ${X(p.endpoint)} <span class="code">(${esc(easLabel(p.endpoint.scheme))})</span>`);
    if (p.legalInfo) rows.push(`<span class="code">${X(p.legalInfo)}</span>`);
    return `<address class="party"><span class="party-role">${role}</span>
      <span class="party-name">${p.name ? X(p.name) : '<em>Name fehlt</em>'}</span><br>
      ${adr}${rows.length ? '<br>' + rows.join('<br>') : ''}</address>`;
  };

  // Kopfdaten
  const meta = [];
  const metaItem = (lbl, html) => { if (html) meta.push(`<div><dt>${lbl}</dt><dd>${html}</dd></div>`); };
  metaItem('Rechnungsnummer', inv.number ? X(inv.number) : '<em>fehlt</em>');
  metaItem('Rechnungsdatum', inv.issueDate ? X(inv.issueDate, esc(dateDE(inv.issueDate))) : '<em>fehlt</em>');
  if (inv.delivery && inv.delivery.date) metaItem('Liefer-/Leistungsdatum', X(inv.delivery.date, esc(dateDE(inv.delivery.date))));
  if (inv.period) metaItem('Leistungszeitraum', `${inv.period.start ? X(inv.period.start, esc(dateDE(inv.period.start))) : '…'} – ${inv.period.end ? X(inv.period.end, esc(dateDE(inv.period.end))) : '…'}`);
  if (inv.dueDate) metaItem('Fällig am', X(inv.dueDate, esc(dateDE(inv.dueDate))));
  if (has(inv.buyerRef)) metaItem('Käuferreferenz / Leitweg-ID', X(inv.buyerRef));
  if (has(inv.orderRef)) metaItem('Bestellnummer', X(inv.orderRef));
  if (has(inv.salesOrderRef)) metaItem('Auftragsnummer', X(inv.salesOrderRef));
  if (has(inv.contractRef)) metaItem('Vertragsnummer', X(inv.contractRef));
  if (has(inv.projectRef)) metaItem('Projektnummer', X(inv.projectRef));
  if (has(inv.despatchAdviceRef)) metaItem('Lieferschein', X(inv.despatchAdviceRef));
  if (has(inv.receivingAdviceRef)) metaItem('Wareneingangsmeldung', X(inv.receivingAdviceRef));
  if (has(inv.tenderRef)) metaItem('Vergabe-/Losnummer', X(inv.tenderRef));
  if (has(inv.invoicedObject)) metaItem('Abrechnungsobjekt', X(inv.invoicedObject));
  if (has(inv.buyerAccountingRef)) metaItem('Buchungsreferenz des Käufers', X(inv.buyerAccountingRef));
  inv.preceding.forEach((p) => metaItem('Bezieht sich auf Rechnung', `${p.id ? X(p.id) : ''}${p.date ? ` vom ${X(p.date, esc(dateDE(p.date)))}` : ''}`));
  if (cur && cur !== 'EUR') metaItem('Währung', X(inv.currency));

  // Positionen
  const limit = ctx.allLines ? inv.lines.length : Math.min(inv.lines.length, ctx.initialLines || 200);
  const lineRows = [];
  const lineRow = (l, depth = 0) => {
    const extra = [];
    if (has(l.desc)) extra.push(X(l.desc));
    if (has(l.note)) extra.push(X(l.note));
    if (has(l.sellerItemId)) extra.push(`Art.-Nr. ${X(l.sellerItemId)}`);
    if (has(l.buyerItemId)) extra.push(`Ihre Art.-Nr. ${X(l.buyerItemId)}`);
    if (l.stdId) extra.push(`${l.stdId.scheme === '0160' ? 'GTIN' : 'Kennung'} ${X(l.stdId)}`);
    if (l.period) extra.push(`Zeitraum ${l.period.start ? X(l.period.start, esc(dateDE(l.period.start))) : '…'} – ${l.period.end ? X(l.period.end, esc(dateDE(l.period.end))) : '…'}`);
    if (has(l.orderLineRef)) extra.push(`Bestellposition ${X(l.orderLineRef)}`);
    l.attributes.forEach((a) => extra.push(`${a.name ? X(a.name) : ''}: ${a.value ? X(a.value) : ''}`));
    l.allowances.forEach((a) => extra.push(`Nachlass ${M(a.amount)}${a.reason ? ' – ' + X(a.reason) : ''}`));
    l.charges.forEach((c) => extra.push(`Zuschlag ${M(c.amount)}${c.reason ? ' – ' + X(c.reason) : ''}`));
    if (l.price.gross) extra.push(`Bruttopreis ${M(l.price.gross)}${l.price.discount ? `, Rabatt ${M(l.price.discount)}` : ''}`);
    const base = l.price.baseQty && Number(l.price.baseQty.v) !== 1 ? ` <span class="code">je ${X(l.price.baseQty, esc(numText(l.price.baseQty.v)))} ${esc(unitLabel(l.price.baseUnit ? l.price.baseUnit.v : ''))}</span>` : '';
    const vat = l.vatRate ? `${X(l.vatRate, esc(numText(l.vatRate.v, 2)))} %` : (l.vatCat ? X(l.vatCat) : '');
    const indent = depth ? ` class="sub-${Math.min(depth, 3)}"` : '';
    lineRows.push(`<tr>
      <td data-label="Pos.">${l.id ? X(l.id) : ''}</td>
      <td data-label="Bezeichnung"${indent}>${l.name ? `<strong>${X(l.name)}</strong>` : '<em>ohne Bezeichnung</em>'}${extra.length ? `<span class="line-desc">${extra.join('<br>')}</span>` : ''}</td>
      <td class="num" data-label="Menge">${l.qty ? X(l.qty, esc(numText(l.qty.v))) : ''} ${l.unit ? X(l.unit, esc(unitLabel(l.unit.v))) : ''}</td>
      <td class="num" data-label="Einzelpreis">${M(l.price.net)}${base}</td>
      <td class="num" data-label="USt.">${vat}</td>
      <td class="num" data-label="Betrag">${M(l.net)}</td>
    </tr>`);
    l.sub.forEach((s2) => lineRow(s2, depth + 1));
  };
  inv.lines.slice(0, limit).forEach((l) => lineRow(l));
  const more = inv.lines.length > limit
    ? `<p class="more-lines"><button type="button" class="paper-btn" data-action="all-lines">Alle ${inv.lines.length.toLocaleString('de-DE')} Positionen anzeigen</button> <span class="code">(${limit.toLocaleString('de-DE')} von ${inv.lines.length.toLocaleString('de-DE')} angezeigt; PDF und CSV enthalten immer alle)</span></p>`
    : '';

  // Nachlässe/Zuschläge auf Belegebene
  const docAc = [...inv.allowances.map((a) => ({ ...a, sign: '−' })), ...inv.charges.map((c) => ({ ...c, sign: '+' }))];
  const acHtml = docAc.length ? `<h3>Nachlässe und Zuschläge auf die gesamte Rechnung</h3>
    <div class="lines-wrap" tabindex="0" role="region" aria-label="Nachlässe und Zuschläge"><table><thead><tr><th>Art</th><th>Grund</th><th class="num">USt.</th><th class="num">Betrag</th></tr></thead><tbody>
    ${docAc.map((a) => `<tr><td>${a.isCharge ? 'Zuschlag' : 'Nachlass'}</td><td>${a.reason ? X(a.reason) : ''}${a.reasonCode ? ` <span class="code">(Code ${X(a.reasonCode)})</span>` : ''}${a.percent && a.base ? `<span class="line-desc">${X(a.percent, esc(numText(a.percent.v, 2)))} % von ${M(a.base)}</span>` : ''}</td><td class="num">${a.vatRate ? X(a.vatRate, esc(numText(a.vatRate.v, 2)) + ' %') : (a.vatCat ? X(a.vatCat) : '')}</td><td class="num">${a.sign} ${M(a.amount)}</td></tr>`).join('')}
    </tbody></table></div>` : '';

  // Summen
  const t = inv.totals || {};
  const tot = [];
  const totRow = (lbl, field, cls = '') => { if (field) tot.push(`<tr class="${cls}"><td>${lbl}</td><td class="num">${M(field)}</td></tr>`); };
  totRow('Summe Positionen (netto)', t.lineNet);
  totRow('abzüglich Nachlässe', t.allowances);
  totRow('zuzüglich Zuschläge', t.charges);
  totRow('Gesamtbetrag netto', t.taxExcl);
  inv.vat.forEach((x) => {
    const lbl = `Umsatzsteuer ${x.rate ? esc(numText(x.rate.v, 2)) + ' %' : ''} auf ${x.base ? esc(moneyText(x.base.v, cur)) : ''}`;
    tot.push(`<tr><td>${lbl}</td><td class="num">${M(x.amount)}</td></tr>`);
  });
  if (t.tax && inv.vat.length !== 1) totRow('Umsatzsteuer gesamt', t.tax);
  totRow('Gesamtbetrag brutto', t.taxIncl, 'grand');
  totRow('bereits gezahlt', t.prepaid);
  totRow('Rundung', t.rounding);
  totRow('Zu zahlender Betrag', t.due, 'grand');
  if (t.taxAcc) totRow(`Umsatzsteuer in ${esc(v(inv.taxCurrency))}`, t.taxAcc);

  // Steuerkategorien mit Befreiungsgrund
  const vatNotes = inv.vat
    .filter((x) => x.cat && (x.cat.v !== 'S' || x.exReason || x.exCode))
    .map((x) => `<li>${X(x.cat, esc(label('steuerkategorien', x.cat.v) || x.cat.v))} <span class="code">(${esc(x.cat.v)})</span>${x.exReason ? ': ' + X(x.exReason) : ''}${x.exCode ? ` <span class="code">${X(x.exCode)} – ${esc(label('befreiungsgruende', x.exCode.v))}</span>` : ''}</li>`);

  // Zahlung
  const pay = [];
  inv.paymentMeans.forEach((pm) => {
    const code = v(pm.code);
    const lines = [`<dt>Zahlungsart</dt><dd>${pm.code ? X(pm.code, esc(label('zahlungsarten', code) || code)) : ''}${pm.text ? ` (${X(pm.text)})` : ''}</dd>`];
    pm.accounts.forEach((a) => {
      if (a.iban) lines.push(`<dt>IBAN</dt><dd>${X(a.iban, esc(ibanText(a.iban.v)))}</dd>`);
      if (a.bic) lines.push(`<dt>BIC</dt><dd>${X(a.bic)}</dd>`);
      if (a.name) lines.push(`<dt>Kontoinhaber</dt><dd>${X(a.name)}</dd>`);
    });
    if (pm.ref) lines.push(`<dt>Verwendungszweck</dt><dd>${X(pm.ref)}</dd>`);
    if (pm.card) lines.push(`<dt>Karte</dt><dd>${pm.card.pan ? X(pm.card.pan) : ''}${pm.card.holder ? ', ' + X(pm.card.holder) : ''}</dd>`);
    if (pm.mandate) lines.push(`<dt>Mandatsreferenz</dt><dd>${X(pm.mandate)}</dd>`);
    if (pm.creditorId) lines.push(`<dt>Gläubiger-ID</dt><dd>${X(pm.creditorId)}</dd>`);
    if (pm.debitedAccount) lines.push(`<dt>Belastetes Konto</dt><dd>${X(pm.debitedAccount, esc(ibanText(pm.debitedAccount.v)))}</dd>`);
    pay.push(`<dl class="kv">${lines.join('')}</dl>`);
  });
  const terms = inv.paymentTerms.map((f) => X(f, paymentTermsText(f.el.textContent).map(esc).join('<br>'))).join('<br>');

  // Sonstiges
  const notes = inv.notes.map((n) => `<p>${n.subject ? `<span class="code">${esc(noteSubject(n.subject.v))}:</span> ` : ''}${n.content ? X(n.content, esc(n.content.v).replace(/\n/g, '<br>')) : ''}</p>`).join('');
  const deliveryHtml = inv.delivery && (inv.delivery.address || inv.delivery.name || inv.delivery.locationId)
    ? `<div><h3>Lieferung</h3><p>${inv.delivery.name ? X(inv.delivery.name) + '<br>' : ''}${address(inv.delivery.address)}${inv.delivery.locationId ? `<br>Lieferort-Kennung: ${X(inv.delivery.locationId)}` : ''}</p></div>` : '';
  const payeeHtml = inv.payee ? `<div><h3>Abweichender Zahlungsempfänger</h3><p>${inv.payee.name ? X(inv.payee.name) : ''}${inv.payee.legalId ? `<br>Registernummer: ${X(inv.payee.legalId)}` : ''}</p></div>` : '';
  const repHtml = inv.taxRep ? `<div><h3>Steuervertreter</h3><p>${inv.taxRep.name ? X(inv.taxRep.name) : ''}<br>${address(inv.taxRep.address)}${inv.taxRep.vatId ? `<br>USt-IdNr.: ${X(inv.taxRep.vatId)}` : ''}</p></div>` : '';

  // Anlagen
  const attach = [];
  inv.docs.forEach((d0, i) => {
    const parts = [`<strong>${d0.id ? X(d0.id) : 'Anlage'}</strong>`];
    if (d0.desc) parts.push(X(d0.desc));
    if (d0.bin) parts.push(`<button type="button" class="paper-btn" data-action="download-embedded" data-index="${i}">${esc(d0.bin.filename || 'Datei')} herunterladen</button>`);
    if (d0.uri) parts.push(`Externer Link (nur öffnen, wenn du dem Absender vertraust): <a href="${esc(d0.uri.v)}" rel="noopener noreferrer nofollow" target="_blank">${esc(d0.uri.v)}</a>`);
    attach.push(`<li>${parts.join(' – ')}</li>`);
  });
  (ctx.pdfAttachments || []).forEach((f, i) => {
    attach.push(`<li><strong>${esc(f.name)}</strong> (in der PDF eingebettet${f.description ? ': ' + esc(f.description) : ''}) – <button type="button" class="paper-btn" data-action="download-pdf-attachment" data-index="${i}">herunterladen</button></li>`);
  });

  const html = `<article class="paper" lang="de" aria-label="Rechnungsansicht">
    <div class="paper-top">
      ${party(inv.seller, 'Rechnungssteller')}
      ${party(inv.buyer, 'Rechnungsempfänger')}
    </div>
    <h2 class="doc-title">${esc(docTitle(inv))}${inv.number ? ' ' + X(inv.number) : ''}</h2>
    <p class="code">Rechnungsart: ${inv.typeCode ? X(inv.typeCode, esc(label('rechnungsarten', inv.typeCode.v) || inv.typeCode.v)) + ` (${esc(inv.typeCode.v)})` : 'nicht angegeben'}</p>
    <dl class="meta">${meta.join('')}</dl>
    ${notes ? `<h3>Bemerkungen</h3>${notes}` : ''}
    <h3>Positionen</h3>
    <div class="lines-wrap" tabindex="0" role="region" aria-label="Positionen"><table class="lines-table">
      <thead><tr><th>Pos.</th><th>Bezeichnung</th><th class="num">Menge</th><th class="num">Einzelpreis</th><th class="num">USt.</th><th class="num">Betrag</th></tr></thead>
      <tbody>${lineRows.join('')}</tbody>
    </table></div>
    ${more}
    ${acHtml}
    <div class="totals"><table><tbody>${tot.join('')}</tbody></table></div>
    ${vatNotes.length ? `<h3>Steuerhinweise</h3><ul>${vatNotes.join('')}</ul>` : ''}
    <div class="two-col">
      ${pay.length || terms || inv.dueDate ? `<div><h3>Zahlung</h3>${pay.join('')}${terms ? `<p>${terms}</p>` : ''}</div>` : ''}
      ${deliveryHtml}${payeeHtml}${repHtml}
    </div>
    ${attach.length ? `<h3>Anlagen</h3><ul class="attach-list">${attach.join('')}</ul>` : ''}
    <p class="paper-note">Ansicht erzeugt von E-Rechnung Klartext aus der Datei „${esc(ctx.fileName)}“. Diese Ansicht ist nicht die Originalrechnung; maßgeblich sind die Daten in der E-Rechnung selbst.</p>
  </article>`;
  return { html, refs };
}

const SEV = {
  fatal: { cls: 'is-error', badge: 'badge-error', text: 'Fehler' },
  error: { cls: 'is-error', badge: 'badge-error', text: 'Fehler' },
  warning: { cls: 'is-warn', badge: 'badge-warn', text: 'Warnung' },
  information: { cls: 'is-info', badge: 'badge-info', text: 'Hinweis' },
};

// Befunde der Vorprüfung; meta liefert Erklärung und Zuständigkeit je Regel
export function renderFindings(findings, meta, base, refs) {
  if (!findings.length) return '';
  return `<ul class="findings">${findings.map((f) => {
    const s = SEV[f.flag] || SEV.fatal;
    const m = meta[f.id] || {};
    let x = '';
    if (f.el) x = ` data-x="${refs.push(f.el) - 1}"`;
    const anchor = f.id.toLowerCase();
    return `<li class="finding ${s.cls}">
      <h3><span class="badge ${s.badge}">${s.text}</span> <a href="${base}fehlercodes/#${anchor}">${esc(f.id)}</a></h3>
      <p>${esc(f.msg)}</p>
      ${m.plain ? `<p><strong>Was das bedeutet:</strong> ${esc(m.plain)}</p>` : ''}
      <p><strong>Wer muss es beheben?</strong> ${esc(m.who || 'In der Regel der Rechnungssteller bzw. dessen Rechnungssoftware.')}</p>
      ${f.el ? `<p><button type="button" class="btn btn-ghost" data-jump="${x.match(/\d+/)[0]}">Stelle im XML zeigen</button></p>` : ''}
    </li>`;
  }).join('')}</ul>`;
}

export function renderRecompute(rc, currency) {
  const icon = (ok) => (ok === null ? '–' : ok ? '<span class="badge badge-ok">stimmt</span>' : '<span class="badge badge-error">weicht ab</span>');
  const money = (x) => (x === null || x === undefined ? '–' : esc(moneyText(String(Number(x) / 1e8), currency)));
  const rows = rc.rows.map((r) => `<tr><th scope="row">${esc(r.label)} <span class="muted">(${r.bt})</span></th><td class="num">${money(r.stated)}</td><td class="num">${money(r.expected)}</td><td>${icon(r.ok)}</td></tr>`);
  rc.vatRows.forEach((r) => rows.push(`<tr><th scope="row">Umsatzsteuer ${esc(r.cat)} ${r.rate !== null ? esc(fmt(r.rate)) + ' %' : ''} <span class="muted">(BT-117)</span></th><td class="num">${money(r.stated)}</td><td class="num">${money(r.expected)}</td><td>${icon(r.ok)}</td></tr>`));
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="Nachgerechnete Beträge"><table><caption>Nachgerechnet: Rechnungsangabe im Vergleich zum Ergebnis aus den Einzelwerten. Steuerbeträge dürfen laut Prüfregel um weniger als 1 Währungseinheit abweichen.</caption>
    <thead><tr><th scope="col">Betrag</th><th scope="col">laut Rechnung</th><th scope="col">nachgerechnet</th><th scope="col">Ergebnis</th></tr></thead>
    <tbody>${rows.join('')}</tbody></table></div>`;
}

export { dec };
