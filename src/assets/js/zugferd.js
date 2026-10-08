// Liest eingebettete Dateien und XMP-Metadaten aus PDF-Dateien (ZUGFeRD / Factur-X).
// pdf-lib wird erst bei Bedarf geladen und liegt im Repository (assets/vendor).

const scripts = new Map();

export function loadScript(src) {
  if (!scripts.has(src)) {
    scripts.set(src, new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Bibliothek konnte nicht geladen werden: ' + src));
      document.head.appendChild(s);
    }));
  }
  return scripts.get(src);
}

export async function loadPdfLib(base) {
  if (!window.PDFLib) await loadScript(base + 'assets/vendor/pdf-lib.min.js');
  return window.PDFLib;
}

const INVOICE_NAMES = ['factur-x.xml', 'zugferd-invoice.xml', 'xrechnung.xml', 'zugferd-invoice.xml'];

function text(obj, PDFLib) {
  if (!obj) return '';
  if (obj instanceof PDFLib.PDFString || obj instanceof PDFLib.PDFHexString) return obj.decodeText();
  if (obj instanceof PDFLib.PDFName) return obj.decodeText ? obj.decodeText() : obj.asString().replace(/^\//, '');
  return String(obj);
}

function streamBytes(stream, PDFLib) {
  if (!stream) return null;
  if (stream instanceof PDFLib.PDFRawStream) return PDFLib.decodePDFRawStream(stream).decode();
  if (typeof stream.getContents === 'function') return stream.getContents();
  return null;
}

export function isPdf(bytes) {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(1024, bytes.length)));
  return head.includes('%PDF-');
}

export async function extractPdf(bytes, base) {
  const PDFLib = await loadPdfLib(base);
  const { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef } = PDFLib;
  let doc;
  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false, throwOnInvalidObject: false });
  } catch (e) {
    return { ok: false, error: 'Die PDF-Datei ist beschädigt oder kann nicht gelesen werden.' };
  }
  const ctx = doc.context;
  const catalog = doc.catalog;
  const seen = new Set();
  const specs = [];

  const addSpec = (ref, nameFromTree) => {
    const key = ref instanceof PDFRef ? ref.toString() : null;
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    const dict = ref instanceof PDFRef ? ctx.lookup(ref) : ref;
    if (dict instanceof PDFDict) specs.push({ dict, nameFromTree });
  };

  const walk = (node, depth = 0) => {
    if (!(node instanceof PDFDict) || depth > 20) return;
    const names = node.lookupMaybe(PDFName.of('Names'), PDFArray);
    if (names) {
      for (let i = 0; i + 1 < names.size(); i += 2) addSpec(names.get(i + 1), text(names.lookup(i), PDFLib));
    }
    const kids = node.lookupMaybe(PDFName.of('Kids'), PDFArray);
    if (kids) for (let i = 0; i < kids.size(); i += 1) walk(kids.lookup(i), depth + 1);
  };

  try {
    const namesDict = catalog.lookupMaybe(PDFName.of('Names'), PDFDict);
    if (namesDict) walk(namesDict.lookupMaybe(PDFName.of('EmbeddedFiles'), PDFDict));
    const af = catalog.lookupMaybe(PDFName.of('AF'), PDFArray);
    if (af) for (let i = 0; i < af.size(); i += 1) addSpec(af.get(i), '');
  } catch {
    // Unvollständige Struktur: weiter mit dem, was gefunden wurde
  }

  const files = [];
  for (const { dict, nameFromTree } of specs) {
    try {
      const name = text(dict.lookup(PDFName.of('UF')), PDFLib) || text(dict.lookup(PDFName.of('F')), PDFLib) || nameFromTree || 'anhang';
      const ef = dict.lookupMaybe(PDFName.of('EF'), PDFDict);
      const stream = ef ? (ef.lookup(PDFName.of('F')) || ef.lookup(PDFName.of('UF'))) : null;
      const data = streamBytes(stream, PDFLib);
      if (!data) continue;
      let mime = '';
      if (stream && stream.dict) mime = text(stream.dict.lookup(PDFName.of('Subtype')), PDFLib).replace(/#2F/gi, '/');
      files.push({
        name,
        description: text(dict.lookup(PDFName.of('Desc')), PDFLib),
        relationship: text(dict.lookup(PDFName.of('AFRelationship')), PDFLib),
        mime,
        data,
      });
    } catch {
      // einzelne defekte Anhänge überspringen
    }
  }

  // XMP-Metadaten (Factur-X / ZUGFeRD-Erweiterungsschema)
  let xmp = null;
  try {
    const meta = catalog.lookup(PDFName.of('Metadata'));
    const raw = streamBytes(meta, PDFLib);
    if (raw) {
      const xml = new TextDecoder('utf-8').decode(raw);
      const pick = (tag) => {
        const m = new RegExp(`<(?:[\\w-]+:)?${tag}>([^<]*)</(?:[\\w-]+:)?${tag}>|(?:[\\w-]+:)?${tag}="([^"]*)"`).exec(xml);
        return m ? (m[1] || m[2] || '').trim() : '';
      };
      xmp = {
        conformance: pick('ConformanceLevel'),
        documentFileName: pick('DocumentFileName'),
        documentType: pick('DocumentType'),
        version: pick('Version'),
        pdfaPart: pick('part'),
        pdfaConformance: pick('conformance'),
      };
    }
  } catch {
    xmp = null;
  }

  const lower = (s) => s.toLowerCase();
  let invoice = files.find((f) => INVOICE_NAMES.includes(lower(f.name)));
  if (!invoice && xmp && xmp.documentFileName) invoice = files.find((f) => lower(f.name) === lower(xmp.documentFileName));
  if (!invoice) {
    invoice = files.find((f) => {
      if (!/\.xml$/i.test(f.name) && !/xml/i.test(f.mime)) return false;
      const head = new TextDecoder('utf-8').decode(f.data.subarray(0, 2000));
      return /CrossIndustryInvoice|CrossIndustryDocument|urn:oasis:names:specification:ubl:schema:xsd:(Invoice|CreditNote)-2/.test(head);
    });
  }
  return {
    ok: true,
    pages: doc.getPageCount(),
    files,
    invoice: invoice || null,
    attachments: files.filter((f) => f !== invoice),
    xmp,
  };
}
