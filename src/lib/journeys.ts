import type { Dataset } from "../data/transport";
/** Consult the supplied timetable; this does not infer a service calendar. */
export function findJourneys(
  data: Dataset,
  from: string,
  to: string,
  earliest: number,
  options: { includeSchoolOnly?: boolean; lineId?: string } = {},
) {
  if (
    from === to ||
    !Number.isFinite(earliest) ||
    earliest < 0 ||
    earliest >= 1440
  )
    return [];
  return data.trips
    .flatMap((trip) => {
      if (trip.schoolOnly && !options.includeSchoolOnly) return [];
      if (options.lineId && trip.lineId !== options.lineId) return [];
      // Circular routes may visit the same stop twice. Match a later arrival
      // after the earliest eligible occurrence of the departure stop.
      for (let a = 0; a < trip.stopTimes.length; a++) {
        const departure = trip.stopTimes[a];
        if (departure.stopId !== from || departure.minutes < earliest) continue;
        const arrival = trip.stopTimes
          .slice(a + 1)
          .find((stop) => stop.stopId === to);
        if (!arrival) continue;
        return [
          {
            id: trip.id,
            lineId: trip.lineId,
            departure: departure.minutes,
            arrival: arrival.minutes,
            wait: departure.minutes - earliest,
            sourceId: trip.sourceId,
            sourcePage: trip.sourcePage,
            sourceColumn: trip.sourceColumn,
            schoolOnly: !!trip.schoolOnly,
            direction: trip.direction,
          },
        ];
      }
      return [];
    })
    .sort((a, b) => a.departure - b.departure);
}
export function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
