import imported from "./imported/silvestri.json" with { type: "json" };
import sourceFiles from "./imported/sources.json" with { type: "json" };
export type LineId = "blu" | "verde" | "trepalle";
export type Stop = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};
export type ScheduledTrip = {
  id: string;
  lineId: LineId;
  sourceId?: string;
  sourcePage?: number;
  sourceColumn?: number;
  direction?: string;
  schoolOnly?: boolean;
  stopTimes: { stopId: string; minutes: number; sourceRow?: number }[];
};
export type Dataset = {
  kind: "demo" | "official";
  sourceUrl: string | null;
  validFrom: string | null;
  validTo: string | null;
  timezone: "Europe/Rome";
  stops: Stop[];
  trips: ScheduledTrip[];
};
export type RealtimeUpdate = {
  tripId: string;
  observedAt: string;
  delaySeconds: number;
  sourceUrl: string;
};
export const lines: { id: LineId; name: string; color: string }[] = [
  { id: "blu", name: "Blu", color: "#2563eb" },
  { id: "verde", name: "Verde", color: "#14835f" },
  { id: "trepalle", name: "Trepalle", color: "#a45721" },
];
export const sources = sourceFiles;
// Operational validity in winter was confirmed by the user, not printed in the PDFs.
export const winterConfirmation = {
  receivedOn: "2026-11-17",
  season: "inverno 2026–2027",
  authority: "utente",
  statement:
    "Per questo inverno non sono stati cambiati, restano sempre gli estivi.",
  enhancements: "Potenziamenti non ancora ricevuti",
};
export const dataset: Dataset = {
  kind: "official",
  sourceUrl: null,
  validFrom: "2026-08-31",
  validTo: null,
  timezone: "Europe/Rome",
  stops: imported.stops,
  trips: imported.trips.map((trip) => ({
    ...trip,
    lineId: trip.lineId as LineId,
  })),
};
// Retained only as an isolated test fixture, never merged with official data.
export const demoDataset: Dataset = {
  kind: "demo",
  sourceUrl: null,
  validFrom: null,
  validTo: null,
  timezone: "Europe/Rome",
  stops: ["A", "B", "C"].map((letter) => ({
    id: `demo-${letter}`,
    name: `Fermata demo ${letter}`,
    latitude: null,
    longitude: null,
  })),
  trips: lines.flatMap((line, index) =>
    [0, 1, 2].map((run) => ({
      id: `demo-${line.id}-${run}`,
      lineId: line.id,
      stopTimes: [0, 1, 2].map((stop) => ({
        stopId: `demo-${["A", "B", "C"][stop]}`,
        minutes: 600 + index * 10 + run * 30 + stop * 8,
      })),
    })),
  ),
};
