"""Independent check using Poppler's text layout, not pdfplumber coordinates.
Requires pdftotext on PATH. Checks every imported time and terminal pair.
"""
from pathlib import Path
import json
import re
import subprocess
ROOT = Path(__file__).resolve().parents[1]


def extract(path):
    return subprocess.check_output(['pdftotext', '-layout', str(path), '-'], text=True)


def center(match):
    return (match.start() + match.end()) / 2


urban = json.loads((ROOT / 'src/data/imported/silvestri.json').read_text())
urban_cells = 0
for line in ('blu','verde','trepalle'):
    raw = extract(ROOT / 'public/orari' / f'silvestri-{line}-2026-08-31.pdf')
    rows = [row for row in raw.splitlines() if re.match(r'^LIV\d{3}\s', row)]
    pattern = r'\b\d{2}:\d{2}\b'
    if line == 'trepalle':
        heading = next(row for row in raw.splitlines() if 'direzione: TREPALLE' in row)
        anchors = [center(m) for m in re.finditer(r'\b[1-9]\b', heading)]
        assert len(anchors) == 9
    else:
        full_row = max(rows, key=lambda row: len(re.findall(pattern,row)))
        anchors = [center(m) for m in re.finditer(pattern, full_row)]
    expected = {}
    for n,row in enumerate(rows,1):
        direction = ('trepalle' if n <= 12 else 'livigno') if line == 'trepalle' else 'circuito'
        for match in re.finditer(pattern,row):
            column = min(range(len(anchors)), key=lambda c: abs(center(match)-anchors[c]))+1
            key = (direction,column,n)
            assert key not in expected
            h,m = map(int,match[0].split(':'))
            expected[key] = (row[:6],h*60+m)
    actual = {(t['direction'],t['sourceColumn'],stop['sourceRow']):(stop['stopId'],stop['minutes'])
              for t in urban['trips'] if t['lineId'] == line for stop in t['stopTimes']}
    assert actual == expected, (line, set(actual.items()) ^ set(expected.items()))
    urban_cells += len(actual)

perego = json.loads((ROOT / 'src/data/imported/perego.json').read_text())
import xml.etree.ElementTree as ET
count = 0
namespace = {'x':'http://www.w3.org/1999/xhtml'}
for line in ('a070','a072'):
    raw = subprocess.check_output(['pdftotext','-bbox-layout',str(ROOT/'public/orari'/f'perego-orari-{line}-inverno-2026-2027.pdf'),'-'])
    doc = ET.fromstring(raw)
    for page_number,page in enumerate(doc.findall('.//x:page',namespace),1):
        words = [dict(text=w.text or '',x0=float(w.attrib['xMin']),x1=float(w.attrib['xMax']),y=float(w.attrib['yMin'])) for w in page.findall('.//x:word',namespace)]
        headers = sorted([w for w in words if re.fullmatch(r'AP0\d{5}[A-Z]?',w['text'])],key=lambda w:w['x0'])
        if not headers: continue
        anchors = [(w['x0']+w['x1'])/2 for w in headers]
        step = min(b-a for a,b in zip(anchors,anchors[1:]))
        left = anchors[0]-step/2
        endpoints = {}
        for w in sorted(words,key=lambda w:(w['y'],w['x0'])):
            if w['text'] not in ('BORMIO,','TIRANO,','LIVIGNO,') or w['x0']>40: continue
            row = [t for t in words if abs(t['y']-w['y'])<2]
            name = ' '.join(t['text'] for t in sorted(row,key=lambda t:t['x0']) if t['x1']<left)
            valid_names = ['BORMIO, Autostazione, Milano','TIRANO, FS/RhB Autostazione, Calcagno'] if line=='a070' else ['BORMIO, Autostazione, Milano','LIVIGNO, Bus Station, Isola/Prestefan','LIVIGNO, Bus Station, Isola 113']
            if name not in valid_names or name in endpoints: continue
            values = {}
            for t in row:
                if not re.fullmatch(r'\d{2}\.\d{2}',t['text']) or t['x0']<left: continue
                c = min(range(len(anchors)),key=lambda c:abs((t['x0']+t['x1'])/2-anchors[c]))
                assert c not in values
                h,m = map(int,t['text'].split('.'))
                values[c]=h*60+m
            endpoints[name]=values
        assert len(endpoints)==2,(line,page_number,list(endpoints))
        endpoint_values=list(endpoints.values())
        complete_ids = {headers[c]['text'] for c in endpoint_values[0].keys() & endpoint_values[1].keys()}
        actual = [t for t in perego if t['lineId']==line and t['sourcePage']==page_number]
        assert complete_ids=={t['id'] for t in actual},(line,page_number)
        for t in actual:
            c=t['sourceColumn']-1
            assert endpoints[t['originName']][c]==t['departure'],t['id']
            assert endpoints[t['destinationName']][c]==t['arrival'],t['id']
            count+=1
print(f'Poppler cross-check passed: {urban_cells} urban cells and {count} Perego terminal pairs.')
