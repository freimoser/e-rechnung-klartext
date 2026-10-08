// Export als PDF (im Browser erzeugt) und als CSV (Excel-tauglich).
import { v, has } from './xml.js';
import { loadPdfLib, loadScript } from './zugferd.js';
import { label, unitLabel, countryLabel } from './codes.js';
import { dateDE, moneyText, numText, ibanText, paymentTermsText, docTitle } from './render.js';

/* ---------------- CSV ---------------- */

function csvCell(value, isText = true) {
  let s = String(value ?? '');
  // Schutz vor Formel-Ausführung in Tabellenprogrammen
  if (isText && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[";\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

function deNumber(s) {
  if (s === null || s === undefined || s === '') return '';
  return String(s).trim().replace('.', ',');
}

export function invoiceCsv(inv) {
  const head = ['Position', 'Artikelnummer', 'Bezeichnung', 'Beschreibung', 'Menge', 'Einheit', 'Einheitencode', 'Einzelpreis netto', 'Preisbasismenge', 'USt-Kategorie', 'USt-Satz %', 'Nettobetrag', 'Währung'];
  const rows = [head.map((h) => csvCell(h)).join(';')];
  const cur = v(inv.currency);
  const add = (l) => {
    rows.push([
      csvCell(v(l.id)),
      csvCell(v(l.sellerItemId)),
      csvCell(v(l.name)),
      csvCell(v(l.desc)),
      csvCell(deNumber(v(l.qty)), false),
      csvCell(unitLabel(v(l.unit))),
      csvCell(v(l.unit)),
      csvCell(deNumber(v(l.price.net)), false),
      csvCell(deNumber(v(l.price.baseQty)), false),
      csvCell(v(l.vatCat)),
      csvCell(deNumber(v(l.vatRate)), false),
      csvCell(deNumber(v(l.net)), false),
      csvCell(cur),
    ].join(';'));
    l.sub.forEach(add);
  };
  inv.lines.forEach(add);
  return '﻿' + rows.join('\r\n') + '\r\n';
}

/* ---------------- PDF ---------------- */

const A4 = [595.28, 841.89];
const MARGIN = 42;

async function loadFonts(base, PDFLib, doc) {
  if (!window.fontkit) await loadScript(base + 'assets/vendor/fontkit.umd.min.js');
  doc.registerFontkit(window.fontkit);
  const [reg, bold] = await Promise.all([
    fetch(base + 'assets/fonts/NotoSans-Regular.ttf').then((r) => r.arrayBuffer()),
    fetch(base + 'assets/fonts/NotoSans-Bold.ttf').then((r) => r.arrayBuffer()),
  ]);
  return {
    regular: await doc.embedFont(reg, { subset: true }),
    bold: await doc.embedFont(bold, { subset: true }),
  };
}

// Zeichen, die die Schrift nicht kennt, werden ersetzt statt den Export abbrechen zu lassen
function makeSafe(font) {
  const cache = new Map();
  const charset = new Set(font.getCharacterSet ? font.getCharacterSet() : []);
  return (s) => {
    const str = String(s ?? '').replace(/\r\n?/g, '\n').replace(/\t/g, ' ');
    if (!charset.size) return str;
    let out = '';
    for (const ch of str) {
      if (ch === '\n') { out += ch; continue; }
      const cp = ch.codePointAt(0);
      if (!cache.has(cp)) cache.set(cp, charset.has(cp));
      out += cache.get(cp) ? ch : '?';
    }
    return out;
  };
}

export async function invoicePdf(inv, { base, fileName }) {
  const PDFLib = await loadPdfLib(base);
  const { PDFDocument, rgb } = PDFLib;
  const doc = await PDFDocument.create();
  doc.setTitle(`${docTitle(inv)} ${v(inv.number)} – Ansicht`);
  doc.setSubject(`Ansicht der E-Rechnung ${fileName}`);
  doc.setCreator('E-Rechnung Klartext (https://freimoser.github.io/e-rechnung-klartext/)');
  doc.setProducer('E-Rechnung Klartext mit pdf-lib');
  doc.setLanguage('de-DE');
  const F = await loadFonts(base, PDFLib, doc);
  const safe = makeSafe(F.regular);
  const safeB = makeSafe(F.bold);
  const ink = rgb(0.1, 0.12, 0.14);
  const grey = rgb(0.36, 0.39, 0.43);
  const line = rgb(0.83, 0.86, 0.89);
  const cur = v(inv.currency);
  const W = A4[0] - 2 * MARGIN;

  let page;
  let y;
  const newPage = () => {
    page = doc.addPage(A4);
    y = A4[1] - MARGIN;
  };
  newPage();
  const FOOT = 40;
  const ensure = (h) => { if (y - h < MARGIN + FOOT) { newPage(); return true; } return false; };

  const width = (s, size, bold) => (bold ? F.bold : F.regular).widthOfTextAtSize(s, size);
  const wrap = (text, size, maxW, bold = false) => {
    const fixer = bold ? safeB : safe;
    const out = [];
    for (const para of fixer(text).split('\n')) {
      const words = para.split(/ +/);
      let cur2 = '';
      for (const w0 of words) {
        let w = w0;
        // sehr lange Wörter (z. B. IBAN ohne Leerzeichen) hart umbrechen
        while (width(w, size, bold) > maxW) {
          let cut = w.length - 1;
          while (cut > 1 && width(w.slice(0, cut), size, bold) > maxW) cut -= 1;
          if (cur2) { out.push(cur2); cur2 = ''; }
          out.push(w.slice(0, cut));
          w = w.slice(cut);
        }
        const test = cur2 ? cur2 + ' ' + w : w;
        if (width(test, size, bold) <= maxW) cur2 = test;
        else { out.push(cur2); cur2 = w; }
      }
      out.push(cur2);
    }
    return out;
  };
  const text = (s, x, yy, size = 9, bold = false, color = ink) => {
    page.drawText((bold ? safeB : safe)(s), { x, y: yy, size, font: bold ? F.bold : F.regular, color });
  };
  const textRight = (s, xRight, yy, size = 9, bold = false, color = ink) => {
    const t = (bold ? safeB : safe)(s);
    page.drawText(t, { x: xRight - width(t, size, bold), y: yy, size, font: bold ? F.bold : F.regular, color });
  };
  const para = (s, size = 9, bold = false, color = ink, x = MARGIN, maxW = W) => {
    for (const l of wrap(s, size, maxW, bold)) {
      ensure(size + 4);
      text(l, x, y - size, size, bold, color);
      y -= size + 3.5;
    }
  };
  const heading = (s) => {
    ensure(28);
    y -= 10;
    text(s.toUpperCase(), MARGIN, y - 8, 7.5, true, grey);
    y -= 13;
  };

  // Absender / Empfänger
  const partyLines = (p) => {
    if (!p) return ['keine Angabe'];
    const out = [];
    if (p.address) {
      const a = p.address;
      [a.line1, a.line2, a.line3].forEach((f) => { if (has(f)) out.push(f.v); });
      const city = [v(a.zip), v(a.city)].filter(Boolean).join(' ');
      if (city) out.push(city);
      if (has(a.country) && a.country.v !== 'DE') out.push(countryLabel(a.country.v));
    }
    if (p.contact) {
      if (has(p.contact.name)) out.push(p.contact.name.v);
      if (has(p.contact.phone)) out.push('Tel. ' + p.contact.phone.v);
      if (has(p.contact.email)) out.push(p.contact.email.v);
    }
    if (p.vatId) out.push('USt-IdNr.: ' + p.vatId.v);
    if (p.taxId) out.push('Steuernummer: ' + p.taxId.v);
    if (p.legalId) out.push('Registernummer: ' + p.legalId.v);
    if (p.endpoint) out.push('E-Adresse: ' + p.endpoint.v);
    return out;
  };
  const colW = (W - 20) / 2;
  const leftL = [v(inv.seller && inv.seller.name), ...partyLines(inv.seller)];
  const rightL = [v(inv.buyer && inv.buyer.name), ...partyLines(inv.buyer)];
  const leftW = leftL.flatMap((s, i) => wrap(s, i ? 8.5 : 10, colW, i === 0).map((t) => [t, i]));
  const rightW = rightL.flatMap((s, i) => wrap(s, i ? 8.5 : 10, colW, i === 0).map((t) => [t, i]));
  text('RECHNUNGSSTELLER', MARGIN, y - 7, 7, true, grey);
  text('RECHNUNGSEMPFÄNGER', MARGIN + colW + 20, y - 7, 7, true, grey);
  y -= 12;
  const rowsTop = y;
  leftW.forEach(([t, i], k) => text(t, MARGIN, rowsTop - 10 - k * 12, i ? 8.5 : 10, i === 0));
  rightW.forEach(([t, i], k) => text(t, MARGIN + colW + 20, rowsTop - 10 - k * 12, i ? 8.5 : 10, i === 0));
  y = rowsTop - Math.max(leftW.length, rightW.length) * 12 - 14;

  // Titel und Kopfdaten
  text(`${docTitle(inv)} ${v(inv.number)}`, MARGIN, y - 16, 16, true);
  y -= 26;
  const meta = [];
  meta.push(['Rechnungsnummer', v(inv.number) || '–']);
  meta.push(['Rechnungsdatum', dateDE(inv.issueDate) || '–']);
  if (inv.typeCode) meta.push(['Rechnungsart', `${label('rechnungsarten', inv.typeCode.v) || inv.typeCode.v} (${inv.typeCode.v})`]);
  if (inv.delivery && inv.delivery.date) meta.push(['Liefer-/Leistungsdatum', dateDE(inv.delivery.date)]);
  if (inv.period) meta.push(['Leistungszeitraum', `${dateDE(inv.period.start) || '…'} – ${dateDE(inv.period.end) || '…'}`]);
  if (inv.dueDate) meta.push(['Fällig am', dateDE(inv.dueDate)]);
  if (has(inv.buyerRef)) meta.push(['Käuferreferenz / Leitweg-ID', inv.buyerRef.v]);
  if (has(inv.orderRef)) meta.push(['Bestellnummer', inv.orderRef.v]);
  if (has(inv.contractRef)) meta.push(['Vertragsnummer', inv.contractRef.v]);
  if (has(inv.projectRef)) meta.push(['Projektnummer', inv.projectRef.v]);
  inv.preceding.forEach((p) => meta.push(['Bezieht sich auf Rechnung', `${v(p.id)}${p.date ? ' vom ' + dateDE(p.date) : ''}`]));
  const mcol = W / 3;
  for (let i = 0; i < meta.length; i += 3) {
    ensure(26);
    meta.slice(i, i + 3).forEach(([k, val], j) => {
      text(k, MARGIN + j * mcol, y - 7, 7, false, grey);
      const t = wrap(val, 9, mcol - 8, true)[0] || '';
      text(t, MARGIN + j * mcol, y - 18, 9, true);
    });
    y -= 26;
  }
  if (inv.notes.length) {
    heading('Bemerkungen');
    inv.notes.forEach((n) => para(v(n.content), 8.5));
  }

  // Positionen
  heading('Positionen');
  const cols = [
    { k: 'pos', w: 30, title: 'Pos.' },
    { k: 'name', w: 0, title: 'Bezeichnung' },
    { k: 'qty', w: 72, title: 'Menge', right: true },
    { k: 'price', w: 72, title: 'Einzelpreis', right: true },
    { k: 'vat', w: 38, title: 'USt.', right: true },
    { k: 'net', w: 78, title: 'Betrag', right: true },
  ];
  cols[1].w = W - cols.reduce((a, c) => a + c.w, 0);
  const xs = [];
  cols.reduce((x, c) => { xs.push(x); return x + c.w; }, MARGIN);
  const tableHead = () => {
    ensure(18);
    cols.forEach((c, i) => {
      if (c.right) textRight(c.title.toUpperCase(), xs[i] + c.w - 2, y - 8, 7, true, grey);
      else text(c.title.toUpperCase(), xs[i] + 2, y - 8, 7, true, grey);
    });
    y -= 12;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + W, y }, thickness: 1, color: ink });
    y -= 2;
  };
  tableHead();
  const lineEntry = (l, depth) => {
    const desc = [];
    if (has(l.desc)) desc.push(l.desc.v);
    if (has(l.sellerItemId)) desc.push('Art.-Nr. ' + l.sellerItemId.v);
    if (l.period) desc.push(`Zeitraum ${dateDE(l.period.start) || '…'} – ${dateDE(l.period.end) || '…'}`);
    l.allowances.forEach((a) => desc.push(`Nachlass ${moneyText(v(a.amount), cur)}${a.reason ? ' – ' + a.reason.v : ''}`));
    l.charges.forEach((c) => desc.push(`Zuschlag ${moneyText(v(c.amount), cur)}${c.reason ? ' – ' + c.reason.v : ''}`));
    const indent = depth * 8;
    const nameLines = wrap(v(l.name) || 'ohne Bezeichnung', 8.5, cols[1].w - 6 - indent, true);
    const descLines = desc.length ? wrap(desc.join(' · '), 7.5, cols[1].w - 6 - indent) : [];
    const qty = `${numText(v(l.qty))} ${unitLabel(v(l.unit))}`.trim();
    const qtyLines = wrap(qty, 8.5, cols[2].w - 4);
    const h = Math.max(nameLines.length * 11 + descLines.length * 9.5, qtyLines.length * 11) + 6;
    if (ensure(h)) tableHead();
    const top = y - 9;
    text(v(l.id), xs[0] + 2, top, 8.5);
    nameLines.forEach((t, i) => text(t, xs[1] + 2 + indent, top - i * 11, 8.5, true));
    descLines.forEach((t, i) => text(t, xs[1] + 2 + indent, top - nameLines.length * 11 - i * 9.5, 7.5, false, grey));
    qtyLines.forEach((t, i) => textRight(t, xs[2] + cols[2].w - 2, top - i * 11, 8.5));
    textRight(moneyText(v(l.price.net), cur), xs[3] + cols[3].w - 2, top, 8.5);
    textRight(l.vatRate ? `${numText(l.vatRate.v, 2)} %` : v(l.vatCat), xs[4] + cols[4].w - 2, top, 8.5);
    textRight(moneyText(v(l.net), cur), xs[5] + cols[5].w - 2, top, 8.5);
    y -= h;
    page.drawLine({ start: { x: MARGIN, y: y + 2 }, end: { x: MARGIN + W, y: y + 2 }, thickness: 0.5, color: line });
    l.sub.forEach((s) => lineEntry(s, depth + 1));
  };
  inv.lines.forEach((l) => lineEntry(l, 0));

  // Nachlässe und Zuschläge
  const docAc = [...inv.allowances, ...inv.charges];
  if (docAc.length) {
    heading('Nachlässe und Zuschläge auf die gesamte Rechnung');
    docAc.forEach((a) => {
      ensure(14);
      text(`${a.isCharge ? 'Zuschlag' : 'Nachlass'}${a.reason ? ': ' + a.reason.v : ''}`, MARGIN, y - 9, 8.5);
      textRight(`${a.isCharge ? '+' : '−'} ${moneyText(v(a.amount), cur)}`, MARGIN + W, y - 9, 8.5);
      y -= 13;
    });
  }

  // Summen
  const t = inv.totals || {};
  const sums = [];
  if (t.lineNet) sums.push(['Summe Positionen (netto)', t.lineNet.v]);
  if (t.allowances) sums.push(['abzüglich Nachlässe', t.allowances.v]);
  if (t.charges) sums.push(['zuzüglich Zuschläge', t.charges.v]);
  if (t.taxExcl) sums.push(['Gesamtbetrag netto', t.taxExcl.v]);
  inv.vat.forEach((x) => sums.push([`Umsatzsteuer ${x.rate ? numText(x.rate.v, 2) + ' % ' : ''}auf ${moneyText(v(x.base), cur)}`, v(x.amount)]));
  if (t.taxIncl) sums.push(['Gesamtbetrag brutto', t.taxIncl.v, true]);
  if (t.prepaid) sums.push(['bereits gezahlt', t.prepaid.v]);
  if (t.rounding) sums.push(['Rundung', t.rounding.v]);
  if (t.due) sums.push(['Zu zahlender Betrag', t.due.v, true]);
  y -= 6;
  ensure(sums.length * 14 + 10);
  const sx = MARGIN + W * 0.45;
  sums.forEach(([k, val, strong]) => {
    ensure(14);
    text(k, sx, y - 9, strong ? 9.5 : 8.5, !!strong);
    textRight(moneyText(val, cur), MARGIN + W, y - 9, strong ? 9.5 : 8.5, !!strong);
    y -= strong ? 15 : 13;
    if (strong) page.drawLine({ start: { x: sx, y: y + 3 }, end: { x: MARGIN + W, y: y + 3 }, thickness: 0.8, color: ink });
  });

  // Steuerhinweise
  const vatNotes = inv.vat.filter((x) => x.cat && (x.cat.v !== 'S' || x.exReason || x.exCode));
  if (vatNotes.length) {
    heading('Steuerhinweise');
    vatNotes.forEach((x) => para(`${label('steuerkategorien', x.cat.v) || x.cat.v} (${x.cat.v})${x.exReason ? ': ' + x.exReason.v : ''}${x.exCode ? ' – ' + x.exCode.v : ''}`, 8.5));
  }

  // Zahlung
  if (inv.paymentMeans.length || inv.paymentTerms.length || inv.dueDate) {
    heading('Zahlung');
    inv.paymentMeans.forEach((pm) => {
      para(`Zahlungsart: ${label('zahlungsarten', v(pm.code)) || v(pm.code)}${pm.text ? ' (' + pm.text.v + ')' : ''}`, 8.5);
      pm.accounts.forEach((a) => {
        if (a.iban) para(`IBAN: ${ibanText(a.iban.v)}${a.bic ? '   BIC: ' + a.bic.v : ''}`, 8.5);
        if (a.name) para(`Kontoinhaber: ${a.name.v}`, 8.5);
      });
      if (pm.ref) para(`Verwendungszweck: ${pm.ref.v}`, 8.5);
      if (pm.mandate) para(`Mandatsreferenz: ${pm.mandate.v}`, 8.5);
      if (pm.creditorId) para(`Gläubiger-ID: ${pm.creditorId.v}`, 8.5);
      if (pm.debitedAccount) para(`Belastetes Konto: ${ibanText(pm.debitedAccount.v)}`, 8.5);
    });
    inv.paymentTerms.forEach((f) => paymentTermsText(f.el.textContent).forEach((l) => para(l, 8.5)));
  }

  // Lieferung
  if (inv.delivery && inv.delivery.address) {
    heading('Lieferanschrift');
    const a = inv.delivery.address;
    para([v(inv.delivery.name), v(a.line1), v(a.line2), [v(a.zip), v(a.city)].filter(Boolean).join(' '), a.country && a.country.v !== 'DE' ? countryLabel(a.country.v) : ''].filter(Boolean).join(', '), 8.5);
  }
  if (inv.docs.length) {
    heading('Anlagen in der E-Rechnung');
    inv.docs.forEach((d0) => para(`${v(d0.id)}${d0.desc ? ' – ' + d0.desc.v : ''}${d0.bin && d0.bin.filename ? ' (' + d0.bin.filename + ')' : ''}${d0.uri ? ' – ' + d0.uri.v : ''}`, 8.5));
  }

  // Fußzeile auf jeder Seite
  const pages = doc.getPages();
  const note = `Erzeugt aus E-Rechnung „${fileName}“ – Ansicht, nicht die Originalrechnung. Maßgeblich ist die E-Rechnung selbst.`;
  pages.forEach((p, i) => {
    page = p;
    const noteLines = wrap(note, 7, W - 70);
    noteLines.forEach((l, k) => text(l, MARGIN, MARGIN - 4 + (noteLines.length - 1 - k) * 9, 7, false, grey));
    textRight(`Seite ${i + 1} von ${pages.length}`, MARGIN + W, MARGIN - 4, 7, false, grey);
    p.drawLine({ start: { x: MARGIN, y: MARGIN + 6 + (noteLines.length - 1) * 9 }, end: { x: MARGIN + W, y: MARGIN + 6 + (noteLines.length - 1) * 9 }, thickness: 0.5, color: line });
  });
  return doc.save();
}

export function download(bytes, name, type) {
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
