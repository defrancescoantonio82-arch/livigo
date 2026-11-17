import imported from "./imported/perego.json" with { type: "json" };
export type Terminal = "livigno" | "bormio" | "tirano";
export type ServiceProfile =
  | "school-weekday"
  | "school-saturday"
  | "nonschool-weekday"
  | "nonschool-saturday"
  | "holiday";
export type PeregoTrip = {
  id: string;
  lineId: "a070" | "a072";
  profile: ServiceProfile;
  origin: Terminal;
  destination: Terminal;
  originName: string;
  destinationName: string;
  departure: number;
  arrival: number;
  notes: string;
  validFrom: string;
  validTo: string;
  sourceId: string;
  sourcePage: number;
  sourceColumn: number;
};
export const peregoTrips = imported as PeregoTrip[];
export const terminals: { id: Terminal; name: string }[] = [
  { id: "livigno", name: "Livigno · Bus Station" },
  { id: "bormio", name: "Bormio · Autostazione, Milano" },
  { id: "tirano", name: "Tirano · FS/RhB Autostazione, Calcagno" },
];
export const serviceProfiles: { id: ServiceProfile; name: string }[] = [
  { id: "school-weekday", name: "Lunedì–venerdì · scolastico" },
  { id: "school-saturday", name: "Sabato · scolastico" },
  { id: "nonschool-weekday", name: "Lunedì–venerdì · non scolastico" },
  { id: "nonschool-saturday", name: "Sabato · non scolastico" },
  { id: "holiday", name: "Festivo" },
];
