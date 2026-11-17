import type { Dataset } from '../data/transport';
export function findJourneys(data: Dataset, from: string, to: string, earliest: number) {
  if (from === to) return [];
  return data.trips.flatMap(trip => {
    const a = trip.stopTimes.findIndex(stop => stop.stopId === from);
    const b = trip.stopTimes.findIndex(stop => stop.stopId === to);
    if (a < 0 || b <= a || trip.stopTimes[a].minutes < earliest) return [];
    return [{ id: trip.id, lineId: trip.lineId, departure: trip.stopTimes[a].minutes, arrival: trip.stopTimes[b].minutes, wait: trip.stopTimes[a].minutes - earliest }];
  }).sort((a, b) => a.departure - b.departure);
}
export function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}
