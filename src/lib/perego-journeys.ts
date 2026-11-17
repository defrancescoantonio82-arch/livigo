import type { PeregoTrip, Terminal, ServiceProfile } from "../data/perego";
export type PeregoJourney = {
  id: string;
  departure: number;
  arrival: number;
  wait: number;
  transferWait: number | null;
  legs: PeregoTrip[];
};
/** Table combinations only. All leg restrictions remain attached; no calendar is inferred.
 * For each first leg, show the earliest compatible second departure (including variants
 * at that departure time). Do not silently pick one conditional variant over another.
 */
export function findPeregoJourneys(
  trips: PeregoTrip[],
  origin: Terminal,
  destination: Terminal,
  earliest: number,
  profile: ServiceProfile,
  transferMargin = 5,
): PeregoJourney[] {
  if (
    origin === destination ||
    !Number.isFinite(earliest) ||
    earliest < 0 ||
    earliest >= 1440 ||
    !Number.isFinite(transferMargin) ||
    transferMargin < 0
  )
    return [];
  const eligible = trips.filter((t) => t.profile === profile);
  const direct = eligible
    .filter(
      (t) =>
        t.origin === origin &&
        t.destination === destination &&
        t.departure >= earliest,
    )
    .map((t) => ({
      id: t.id,
      departure: t.departure,
      arrival: t.arrival,
      wait: t.departure - earliest,
      transferWait: null,
      legs: [t],
    }));
  if (origin === "bormio" || destination === "bormio")
    return direct.sort((a, b) => a.departure - b.departure);
  return eligible
    .filter(
      (t) =>
        t.origin === origin &&
        t.destination === "bormio" &&
        t.departure >= earliest,
    )
    .flatMap((first) => {
      const connections = eligible
        .filter(
          (t) =>
            t.origin === "bormio" &&
            t.destination === destination &&
            t.departure >= first.arrival + transferMargin &&
            t.validFrom <= first.validTo &&
            first.validFrom <= t.validTo,
        )
        .sort((a, b) => a.departure - b.departure);
      if (!connections.length) return [];
      return connections
        .filter((t) => t.departure === connections[0].departure)
        .map((second) => ({
          id: `${first.id}-${second.id}`,
          departure: first.departure,
          arrival: second.arrival,
          wait: first.departure - earliest,
          transferWait: second.departure - first.arrival,
          legs: [first, second],
        }));
    })
    .sort((a, b) => a.departure - b.departure || a.arrival - b.arrival);
}
