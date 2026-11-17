"""Rebuild the urban archive from the supplied PDFs; requires pdfplumber==0.11.9.
Usage: python scripts/import_silvestri.py
No times are interpolated. Blank cells remain absent; PDF columns are never shifted.
"""
from pathlib import Path
import hashlib
import json
import re
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
STOPS = {}
TRIPS = []
REPORT = []


def extract(line, filename, expected_rows, expected_columns):
    with pdfplumber.open(ROOT / 'public/orari' / filename) as pdf:
        words = pdf.pages[0].extract_words(x_tolerance=1, y_tolerance=2)
    codes = [w for w in words if re.fullmatch(r'LIV\d{3}', w['text'])]
    times = [w for w in words if re.fullmatch(r'\d{2}:\d{2}', w['text'])]
    assert len(codes) == expected_rows
    if line == 'trepalle':
        headers = [w for w in words if re.fullmatch('[1-9]', w['text']) and 79 < w['top'] < 82]
        assert len(headers) == 9
        centers = [(w['x0'] + w['x1']) / 2 for w in headers]
    else:
        centers = []
        for w in sorted(times, key=lambda w: w['x0']):
            center = (w['x0'] + w['x1']) / 2
            if not centers or abs(center - centers[-1]) > 2:
                centers.append(center)
        assert len(centers) == expected_columns
    groups = {}
    cells = 0
    for row, code in enumerate(codes):
        row_words = [w for w in words if abs(w['top'] - code['top']) < 1]
        name = ' '.join(w['text'] for w in row_words if w['x0'] > code['x1'] and w['x1'] < centers[0] - 14)
        assert name.startswith('Livigno,'), name
        stop_id = code['text']
        if stop_id in STOPS:
            assert STOPS[stop_id]['name'] == name, (stop_id, STOPS[stop_id]['name'], name)
        STOPS[stop_id] = dict(id=stop_id, name=name, latitude=None, longitude=None)
        direction = ('trepalle' if row < 12 else 'livigno') if line == 'trepalle' else 'circuito'
        for w in row_words:
            if not re.fullmatch(r'\d{2}:\d{2}', w['text']):
                continue
            center = (w['x0'] + w['x1']) / 2
            column = min(range(len(centers)), key=lambda i: abs(center - centers[i]))
            assert abs(center - centers[column]) < 2
            key = (direction, column)
            group = groups.setdefault(key, [])
            hour, minute = map(int, w['text'].split(':'))
            assert 0 <= hour < 24 and 0 <= minute < 60
            value = hour * 60 + minute
            assert not group or value >= group[-1]['minutes'], (line, key, stop_id)
            group.append(dict(stopId=stop_id, minutes=value, sourceRow=row + 1))
            cells += 1
    for (direction, column), stop_times in groups.items():
        TRIPS.append(dict(id=f'{line}-{direction}-{column + 1}', lineId=line,
                          sourceId=line, sourcePage=1, sourceColumn=column + 1,
                          direction=direction,
                          schoolOnly=line == 'trepalle' and column + 1 in (1, 5),
                          stopTimes=stop_times))
    assert cells == len(times)
    REPORT.append(dict(line=line, rows=len(codes), trips=len(groups), cells=cells,
                       sha256=hashlib.sha256((ROOT / 'public/orari' / filename).read_bytes()).hexdigest()))


extract('blu', 'silvestri-blu-2026-08-31.pdf', 43, 18)
extract('verde', 'silvestri-verde-2026-08-31.pdf', 47, 16)
extract('trepalle', 'silvestri-trepalle-2026-08-31.pdf', 32, 9)
output = dict(stops=list(STOPS.values()), trips=TRIPS)
(ROOT / 'src/data/imported/silvestri.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'docs/import-report.json').write_text(json.dumps(REPORT, indent=2) + '\n')
print(json.dumps(dict(stops=len(STOPS), trips=len(TRIPS), tables=REPORT), indent=2))
