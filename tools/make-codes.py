"""Erzeugt data/codelisten.json aus den offiziellen Codelisten.

Eingaben (nicht im Repository, siehe quellen.md):
  - Genericode-Dateien aus dem XRepository (https://www.xrepository.de), Ordner CODELISTS
  - CEN-Schematron 1.3.16 (EN16931-UBL-validation-preprocessed.sch), Datei CEN_UBL
Aufruf: python3 tools/make-codes.py <CODELISTS> <CEN_UBL>
"""
import json, re, sys, xml.etree.ElementTree as ET

cl_dir, cen_ubl = sys.argv[1], sys.argv[2]
NS = '{http://purl.oclc.org/dsdl/schematron}'

def gc(name):
    t = ET.parse(f'{cl_dir}/{name}.gc.xml')
    out = {}
    for row in t.iter('Row'):
        vals = {v.get('ColumnRef').lower(): (v.findtext('SimpleValue') or '').strip() for v in row.iter('Value')}
        out[vals['code']] = vals.get('name', '')
    return out

# Erlaubte Codes laut CEN-Prüfregeln (BR-CL-…)
allowed = {}
for a in ET.parse(cen_ubl).iter(NS + 'assert'):
    rid = a.get('id') or ''
    if rid.startswith('BR-CL-'):
        lists = re.findall(r"'\s((?:[A-Za-z0-9.-]+\s)+)'", a.get('test') or '')
        allowed[rid] = sorted(set(sum([l.split() for l in lists], [])))

units = {**gc('rec20_3'), **gc('rec21_3')}
data = {
    '_quelle': 'XRepository (KoSIT): rec20_3, rec21_3, untdid.4461_4, untdid.1001_5, untdid.5305_4, vatex_2; erlaubte Codes: CEN EN16931-Prüfregeln 1.3.16 (BR-CL-…)',
    'einheiten': {c: units.get(c, '') for c in allowed['BR-CL-23']},
    'zahlungsarten': {c: n for c, n in gc('untdid.4461_4').items() if c in allowed['BR-CL-16']},
    'rechnungsarten': {c: n for c, n in gc('untdid.1001_5').items() if c in allowed['BR-CL-01']},
    'steuerkategorien': {c: n for c, n in gc('untdid.5305_4').items() if c in allowed['BR-CL-17']},
    'befreiungsgruende': {c: n for c, n in gc('vatex_2').items()},
    'waehrungen': allowed['BR-CL-04'],
    'laender': allowed['BR-CL-14'],
    'eas': allowed['BR-CL-25'],
    'icd': allowed['BR-CL-10'],
}
json.dump(data, open('data/codelisten.json', 'w'), ensure_ascii=False, indent=0, sort_keys=True)
print({k: len(v) for k, v in data.items() if not k.startswith('_')})
