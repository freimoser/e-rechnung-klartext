// Lässt die Vorprüfung im Browser über XML-Dateien laufen und gibt die gemeldeten Codes zurück.
import fs from 'node:fs';
import path from 'node:path';

export async function runVorpruefung(page, files) {
  const payload = files.map((f) => ({ name: path.basename(f), text: fs.readFileSync(f, 'utf8') }));
  return page.evaluate(async (items) => {
    const B = '/e-rechnung-klartext/assets/js/';
    const { parseInvoice } = await import(B + 'parse.js');
    const { describeFormat } = await import(B + 'format.js');
    const { validate } = await import(B + 'validate.js');
    const { loadCodes } = await import(B + 'codes.js');
    await loadCodes('/e-rechnung-klartext/');
    const meta = await (await fetch('/e-rechnung-klartext/assets/data/pruefregeln-werkzeug.json')).json();
    const out = {};
    for (const it of items) {
      const doc = new DOMParser().parseFromString(it.text, 'application/xml');
      if (doc.getElementsByTagName('parsererror').length) { out[it.name] = { broken: true }; continue; }
      const inv = parseInvoice(doc);
      const fmt = describeFormat(inv, 'xml');
      const t0 = performance.now();
      const f = validate(inv, fmt, meta);
      out[it.name] = { ms: Math.round(performance.now() - t0), findings: f.map((x) => [x.id, x.flag]) };
    }
    return out;
  }, payload);
}
