/** Official datasets must retain the source PDF, validity and Europe/Rome timezone. */
export type LineId = 'blu' | 'verde' | 'trepalle';
export type Stop = { id: string; name: string; latitude: number | null; longitude: number | null };
export type ScheduledTrip = { id: string; lineId: LineId; stopTimes: { stopId: string; minutes: number }[] };
export type Dataset = { kind: 'demo' | 'official'; sourceUrl: string | null; validFrom: string | null; validTo: string | null; timezone: 'Europe/Rome'; stops: Stop[]; trips: ScheduledTrip[] };
export type RealtimeUpdate = { tripId: string; observedAt: string; delaySeconds: number; sourceUrl: string };
export const lines: { id: LineId; name: string; color: string }[] = [
  { id: 'blu', name: 'Blu', color: '#2563eb' },
  { id: 'verde', name: 'Verde', color: '#14835f' },
  { id: 'trepalle', name: 'Trepalle', color: '#a45721' },
];
export const dataset: Dataset = {
  kind: 'demo', sourceUrl: null, validFrom: null, validTo: null, timezone: 'Europe/Rome',
  stops: ['A', 'B', 'C'].map(letter => ({ id: `demo-${letter}`, name: `Fermata demo ${letter}`, latitude: null, longitude: null })),
  // Fictional fixtures, unrelated to actual Silvestri Bus routes or timetables.
  trips: lines.flatMap((line, index) => [0, 1, 2].map(run => ({
    id: `demo-${line.id}-${run}`, lineId: line.id,
    stopTimes: [0, 1, 2].map(stop => ({ stopId: `demo-${['A', 'B', 'C'][stop]}`, minutes: 600 + index * 10 + run * 30 + stop * 8 })),
  }))),
};
