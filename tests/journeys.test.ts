import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dataset } from '../src/data/transport.ts';
import { findJourneys, formatTime } from '../src/lib/journeys.ts';
test('filter routes by ordered stops, departure threshold and chronological order', () => {
  const trips = findJourneys(dataset, 'demo-A', 'demo-C', 620);
  assert.equal(trips[0].departure, 620);
  assert.ok(trips.every(t => t.departure >= 620 && t.arrival > t.departure));
  assert.deepEqual(trips.map(t => t.departure), trips.map(t => t.departure).sort((a,b) => a-b));
});
test('pause excludes earlier departures and recalculates waiting', () => {
  const trip = findJourneys(dataset, 'demo-A', 'demo-C', 600 + 20)[0];
  assert.equal(trip.departure, 620);
  assert.equal(trip.wait, 0);
});
test('same, unknown, reverse stops and exhausted day return no trips', () => {
  for (const [from,to,time] of [['demo-A','demo-A',600],['unknown','demo-C',600],['demo-C','demo-A',600],['demo-A','demo-C',1440]] as const) assert.deepEqual(findJourneys(dataset,from,to,time),[]);
  assert.equal(formatTime(608), '10:08');
});
