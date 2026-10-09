"""Erzeugt data/pruefregeln-offiziell.json aus den offiziellen Prüfregeln.

Eingaben (Releases, nicht im Repository – siehe quellen.md):
  CEN_UBL  en16931-ubl-1.3.16/schematron/preprocessed/EN16931-UBL-validation-preprocessed.sch
  CEN_CII  en16931-cii-1.3.16/schematron/preprocessed/EN16931-CII-validation-preprocessed.sch
  XR_UBL   xrechnung-3.0.2-schematron-2.6.0/schematron/ubl/XRechnung-UBL-validation.sch
  XR_CII   xrechnung-3.0.2-schematron-2.6.0/schematron/cii/XRechnung-CII-validation.sch
  SPEC     XRechnung-v3.0.2.pdf (deutsche Regeltexte, Kapitel 12 und 17)
Aufruf: python3 tools/extract-rules.py CEN_UBL CEN_CII XR_UBL XR_CII SPEC
Benötigt pdftotext (poppler) für die Spezifikation.
"""
import html, json, re, subprocess, sys, tempfile, xml.etree.ElementTree as ET

NS = '{http://purl.oclc.org/dsdl/schematron}'
files = dict(zip(['CEN-UBL', 'CEN-CII', 'XR-UBL', 'XR-CII'], sys.argv[1:5]))
spec_pdf = sys.argv[5]

rules = {}
order = []
for src, f in files.items():
    for el in ET.parse(f).iter():
        if el.tag not in (NS + 'assert', NS + 'report'):
            continue
        txt = re.sub(r'\s+', ' ', ''.join(el.itertext())).strip()
        rid = el.get('id')
        if not rid:
            m = re.match(r'\[([A-Z0-9-]+)\]', txt)
            rid = m.group(1) if m else None
        if not rid:
            continue
        if rid not in rules:
            rules[rid] = {'id': rid, 'texte': {}, 'stufe': {}}
            order.append(rid)
        rules[rid]['texte'][src] = txt
        rules[rid]['stufe'][src] = el.get('flag') or 'fatal'

# Deutsche Regeltexte aus der Spezifikation (Spalten über Wortkoordinaten)
with tempfile.NamedTemporaryFile(suffix='.html') as tmp:
    subprocess.run(['pdftotext', '-bbox-layout', spec_pdf, tmp.name], check=True)
    h = open(tmp.name, encoding='utf-8').read()
pages = re.findall(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', h, re.S)
ID_RE = re.compile(r'^(BR-[A-Z]{0,4}-?\d+[a-z]?|BR-\d+|BR-CO-\d+|BR-DEX-\d+|PEPPOL-EN16931-R\d+|BR-DE-\d+)$')
de, de_order = {}, []
for w, ht, body in pages:
    words = [(float(a), float(b), html.unescape(t)) for a, b, c, d, t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', body)]
    hdr = [x for x in words if x[2] == 'Beschreibung']
    if not hdr:
        continue
    ziel = [x for x in words if x[2] == 'Ziel']
    desc_x = hdr[0][0] - 2
    ctx_x = ziel[0][0] - 3 if ziel else 9999
    lines = {}
    for x in words:
        if x[1] <= hdr[0][1] + 12 or x[1] > float(ht) - 60:
            continue
        lines.setdefault(round(x[1] / 2.5), []).append(x)
    cur = None
    for k in sorted(lines):
        ws = sorted(lines[k])
        idtxt = ''.join(x[2] for x in ws if x[0] < desc_x)
        desc = [x[2] for x in ws if desc_x <= x[0] < ctx_x]
        if idtxt == 'BR-':
            cur = '__P__'; de[cur] = []
        elif idtxt and cur == '__P__' and ID_RE.match('BR-' + idtxt):
            cur = 'BR-' + idtxt; de[cur] = de.pop('__P__'); de_order.append(cur)
        elif idtxt and ID_RE.match(idtxt):
            cur = idtxt
            if cur not in de:
                de[cur] = []; de_order.append(cur)
        elif idtxt:
            cur = None
        if cur and desc:
            de[cur].append(' '.join(desc))

def join(parts):
    t = ' '.join(parts)
    def j(m):
        a, b = m.group(1), m.group(2)
        if b.islower() or (a.isupper() and b.isupper()):
            return a + b
        return a + '-' + b
    t = re.sub(r'(\w)- (\w)', j, t)
    t = re.sub(r'\(B-([TG])-(\d+)\)', r'(B\1-\2)', t)
    return re.sub(r'\s+', ' ', t).strip()

def canon(i):
    return re.sub(r'-0+(\d)', r'-\1', i)

alias = {'BR-IG': 'BR-AF', 'BR-IP': 'BR-AG'}  # Spezifikation: IGIC/IPSI-Regeln heißen dort BR-IG/BR-IP
de_by_canon = {}
for k in de_order:
    if k == '__P__':
        continue
    key = k
    for a, b in alias.items():
        if k.startswith(a + '-'):
            key = b + k[len(a):]
    de_by_canon[canon(key)] = join(de[k])

out = []
for rid in order:
    r = rules[rid]
    d = de_by_canon.get(canon(rid))
    if d:
        r['de'] = d
    out.append(r)
json.dump(out, open('data/pruefregeln-offiziell.json', 'w'), ensure_ascii=False, indent=0)
print(len(out), 'Regeln,', sum(1 for r in out if 'de' in r), 'mit deutschem Text')
