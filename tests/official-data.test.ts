import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dataset, sources, winterConfirmation } from "../src/data/transport.ts";
import { findJourneys } from "../src/lib/journeys.ts";
import { peregoTrips, serviceProfiles } from "../src/data/perego.ts";
import { findPeregoJourneys } from "../src/lib/perego-journeys.ts";

test("all original PDFs match their recorded hashes; winter confirmation is separate", () => {
  assert.equal(sources.length, 9);
  for (const source of sources) {
    const bytes = readFileSync(
      new URL(`../public${source.path}`, import.meta.url),
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      source.sha256,
    );
  }
  assert.equal(winterConfirmation.authority, "utente");
  assert.equal(dataset.validTo, null);
});
test("official urban data retains every time cell and no demo or invented GPS", () => {
  assert.equal(dataset.kind, "official");
  assert.equal(dataset.stops.length, 77);
  assert.equal(dataset.trips.length, 50);
  assert.equal(
    dataset.trips.reduce((n, t) => n + t.stopTimes.length, 0),
    1720,
  );
  assert.ok(
    dataset.stops.every(
      (s) =>
        !s.id.startsWith("demo") && s.latitude === null && s.longitude === null,
    ),
  );
  for (const trip of dataset.trips) {
    assert.ok(sources.some((s) => s.id === trip.sourceId));
    assert.equal(trip.sourcePage, 1);
    assert.ok(
      trip.stopTimes.every(
        (s, i, a) =>
          dataset.stops.some((stop) => stop.id === s.stopId) &&
          (i === 0 || s.minutes >= a[i - 1].minutes),
      ),
    );
  }
});
test("short Blu run preserves its missing Forcola cell and truncated final run", () => {
  const short = dataset.trips.find((t) => t.id === "blu-circuito-2")!;
  assert.ok(!short.stopTimes.some((s) => s.stopId === "LIV176"));
  assert.equal(
    short.stopTimes.find((s) => s.stopId === "LIV023")!.minutes,
    478,
  );
  const last = dataset.trips.find((t) => t.id === "blu-circuito-18")!;
  assert.equal(last.stopTimes.at(-1)!.stopId, "LIV117");
  assert.ok(!last.stopTimes.some((s) => s.stopId === "LIV019"));
});
test("Verde repeated stop can be boarded at its second occurrence", () => {
  const result = findJourneys(dataset, "LIV023", "LIV018", 445, {
    lineId: "verde",
  })[0];
  assert.equal(result.id, "verde-circuito-1");
  assert.equal(result.departure, 450);
  assert.equal(result.arrival, 456);
});
test("Trepalle school columns are conditional and excluded by default", () => {
  assert.equal(dataset.trips.filter((t) => t.schoolOnly).length, 4);
  const regular = findJourneys(dataset, "LIV019", "LIV004", 400, {
    lineId: "trepalle",
  });
  assert.equal(regular[0].departure, 497);
  const school = findJourneys(dataset, "LIV019", "LIV004", 400, {
    lineId: "trepalle",
    includeSchoolOnly: true,
  });
  assert.equal(school[0].departure, 420);
  assert.equal(school[0].schoolOnly, true);
  assert.ok(!dataset.trips.some((t) => t.id === "trepalle-trepalle-2"));
  assert.ok(!dataset.trips.some((t) => t.id === "trepalle-livigno-7"));
});
test("invalid time and next-day pauses never generate journeys", () => {
  for (const time of [NaN, -1, 1440, 1460]) {
    assert.deepEqual(findJourneys(dataset, "LIV101", "LIV022", time), []);
    assert.deepEqual(
      findPeregoJourneys(peregoTrips, "livigno", "tirano", time, "holiday"),
      [],
    );
  }
});
test("Perego contains complete terminal services in all five profiles, with provenance", () => {
  assert.equal(peregoTrips.length, 259);
  assert.equal(new Set(peregoTrips.map((t) => t.id)).size, 259);
  for (const profile of serviceProfiles) {
    for (const [from, to] of [
      ["livigno", "bormio"],
      ["bormio", "livigno"],
      ["bormio", "tirano"],
      ["tirano", "bormio"],
    ]) {
      assert.ok(
        peregoTrips.some(
          (t) =>
            t.profile === profile.id &&
            t.origin === from &&
            t.destination === to,
        ),
      );
    }
  }
  assert.ok(
    !peregoTrips.some(
      (t) => t.origin === "livigno" && t.destination === "tirano",
    ),
  );
  const conditional = peregoTrips.find((t) => t.id === "AP072122B")!;
  assert.equal(conditional.notes, "ARC ✔❄ 3");
  assert.equal(conditional.sourcePage, 2);
  assert.equal(conditional.departure, 780);
  assert.equal(conditional.arrival, 850);
});
test("Livigno to Tirano combines real legs at Bormio without losing conditions", () => {
  const result = findPeregoJourneys(
    peregoTrips,
    "livigno",
    "tirano",
    480,
    "school-weekday",
  )[0];
  assert.deepEqual(
    result.legs.map((l) => l.id),
    ["AP072112", "AP070132"],
  );
  assert.equal(result.departure, 505);
  assert.equal(result.arrival, 650);
  assert.equal(result.transferWait, 15);
  assert.equal(result.legs[0].notes, "Ⓐ");
  assert.equal(result.wait, 25);
});
test("Tirano to Livigno respects margin and never mixes service profiles", () => {
  for (const result of findPeregoJourneys(
    peregoTrips,
    "tirano",
    "livigno",
    500,
    "school-weekday",
    10,
  )) {
    assert.ok(result.legs.every((t) => t.profile === "school-weekday"));
    assert.ok(result.transferWait! >= 10);
    assert.equal(result.legs[0].destination, "bormio");
    assert.equal(result.legs[1].origin, "bormio");
  }
  assert.deepEqual(
    findPeregoJourneys(peregoTrips, "livigno", "tirano", 1439, "holiday"),
    [],
  );
  const direct = findPeregoJourneys(
    peregoTrips,
    "livigno",
    "bormio",
    480,
    "school-weekday",
  )[0];
  assert.equal(direct.legs.length, 1);
  assert.equal(direct.transferWait, null);
});
test("conditional variants at the same second departure are retained", () => {
  const first = peregoTrips.find((t) => t.id === "AP072112")!;
  const second = peregoTrips.find((t) => t.id === "AP070132")!;
  const trips = [
    first,
    second,
    { ...second, id: "variant", notes: "condition" },
  ];
  const results = findPeregoJourneys(
    trips,
    "livigno",
    "tirano",
    480,
    "school-weekday",
  );
  assert.equal(results.length, 2);
  assert.equal(results[1].legs[1].notes, "condition");
});
