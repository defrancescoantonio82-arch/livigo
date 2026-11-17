"""Extract terminal-to-terminal timetable entries (not intermediate stops).
Requires pdfplumber==0.11.9. No inferred calendars or guaranteed connections.
Rebuild: python scripts/import_perego.py
"""
from pathlib import Path
import hashlib
import json
import logging
import re
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT = Path(__file__).resolve().parents[1]
PROFILES = {'1': 'school-weekday', '2': 'school-saturday', '3': 'nonschool-weekday', '4': 'nonschool-saturday', '9': 'holiday'}
TRIPS = []
REPORT = []


def date(value):
    day, month, year = value.split('/')
    return f'{year}-{month}-{day}'


for line in ['a070', 'a072']:
    filename = f'perego-orari-{line}-inverno-2026-2027.pdf'
    path = ROOT / 'public/orari' / filename
    with pdfplumber.open(path) as pdf:
        for page_number, page in enumerate(pdf.pages, 1):
            words = page.extract_words(x_tolerance=1, y_tolerance=2)
            headers = sorted([w for w in words if re.fullmatch(r'AP' + line[1:] + r'\d{3}[A-Z]?', w['text'])], key=lambda w: w['x0'])
            if not headers:
                continue
            centers = [(w['x0'] + w['x1']) / 2 for w in headers]
            step = min(b-a for a,b in zip(centers, centers[1:]))
            left = centers[0] - step / 2
            row_end = centers[-1] + step / 2
            note_label = next(w for w in words if w['text'] == 'Note' and 0 < w['top']-headers[0]['top'] < 20)
            note_words = [w for w in words if abs(w['top'] - note_label['top']) < 3 and w['x0'] >= left]
            notes = [[] for _ in headers]
            for w in sorted(note_words, key=lambda w: w['x0']):
                column = min(range(len(centers)), key=lambda c: abs((w['x0']+w['x1'])/2-centers[c]))
                notes[column].append(w['text'])
            rows = {}
            for w in sorted(words, key=lambda w: (w['top'], w['x0'])):
                if w['text'] not in ('BORMIO,','TIRANO,','LIVIGNO,') or w['x0'] > 40:
                    continue
                row = [t for t in words if abs(t['top'] - w['top']) < 2]
                name = ' '.join(t['text'] for t in sorted(row,key=lambda t:t['x0']) if t['x1'] < left)
                terminal = {
                    'BORMIO, Autostazione, Milano': 'bormio',
                    'TIRANO, FS/RhB Autostazione, Calcagno': 'tirano',
                    'LIVIGNO, Bus Station, Isola/Prestefan': 'livigno-outbound',
                    'LIVIGNO, Bus Station, Isola 113': 'livigno-inbound',
                }.get(name)
                if terminal is None or terminal in rows:
                    continue  # first occurrence is main route, later repetitions are correspondences
                values = {}
                for t in row:
                    if not re.fullmatch(r'\d{2}\.\d{2}',t['text']) or t['x0'] < left or t['x1'] > row_end:
                        continue
                    center = (t['x0']+t['x1'])/2
                    c = min(range(len(centers)), key=lambda c: abs(center-centers[c]))
                    assert abs(center-centers[c]) < step / 2
                    assert c not in values
                    hour, minute = map(int,t['text'].split('.'))
                    assert hour < 24 and minute < 60
                    values[c] = hour*60+minute
                rows[terminal] = (w['top'],values,name)
            endpoints = ['bormio','tirano'] if line == 'a070' else ['bormio', 'livigno-outbound' if 'livigno-outbound' in rows else 'livigno-inbound']
            assert all(t in rows for t in endpoints), (line,page_number,list(rows))
            origin,destination = sorted(endpoints,key=lambda t:rows[t][0])
            text = page.extract_text()
            valid_from = date(re.search(r'DAL FROM\s+(\d{2}/\d{2}/\d{4})', text)[1])
            valid_to = date(re.search(r'AL TO\s+(\d{2}/\d{2}/\d{4})', text)[1])
            added = 0
            for c, header in enumerate(headers):
                if c not in rows[origin][1] or c not in rows[destination][1]:
                    continue  # partial journeys do not become fabricated terminal-to-terminal services
                departure = rows[origin][1][c]
                arrival = rows[destination][1][c]
                assert arrival >= departure
                trip = dict(id=header['text'],lineId=line,profile=PROFILES[header['text'][5]],
                            origin='livigno' if origin.startswith('livigno') else origin,
                            destination='livigno' if destination.startswith('livigno') else destination,
                            originName=rows[origin][2],destinationName=rows[destination][2],
                            departure=departure,arrival=arrival,notes=' '.join(notes[c]),
                            validFrom=valid_from,validTo=valid_to,sourceId='perego-'+line,
                            sourcePage=page_number,sourceColumn=c+1)
                TRIPS.append(trip)
                added += 1
            REPORT.append(dict(line=line,page=page_number,columns=len(headers),completeTerminalTrips=added))
    assert len(set(t['id'] for t in TRIPS)) == len(TRIPS)
(ROOT / 'src/data/imported/perego.json').write_text(json.dumps(TRIPS,ensure_ascii=False,indent=2)+'\n')
(ROOT / 'docs/perego-import-report.json').write_text(json.dumps(REPORT,indent=2)+'\n')
print('Imported',len(TRIPS),'complete terminal-to-terminal entries across',len(REPORT),'timetable pages.')
