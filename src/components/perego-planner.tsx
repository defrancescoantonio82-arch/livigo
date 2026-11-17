"use client";
import { useState } from "react";
import {
  peregoTrips,
  serviceProfiles,
  terminals,
  type Terminal,
  type ServiceProfile,
} from "@/data/perego";
import { sources } from "@/data/transport";
import { findPeregoJourneys } from "@/lib/perego-journeys";
import { formatTime } from "@/lib/journeys";

export default function PeregoPlanner() {
  const [from, setFrom] = useState<Terminal>("livigno");
  const [to, setTo] = useState<Terminal>("tirano");
  const [profile, setProfile] = useState<ServiceProfile>("school-weekday");
  const [time, setTime] = useState("08:00");
  const [margin, setMargin] = useState(5);
  const [pause, setPause] = useState(0);
  const [hours, minutes] = time.split(":").map(Number);
  const earliest = hours * 60 + minutes + pause;
  const validTime = /^\d{2}:\d{2}$/.test(time) && Number.isFinite(earliest);
  const results = validTime
    ? findPeregoJourneys(peregoTrips, from, to, earliest, profile, margin)
    : [];
  const options = terminals.map((t) => (
    <option key={t.id} value={t.id}>
      {t.name}
    </option>
  ));
  const dateLabel = (date: string) => date.split("-").reverse().join("/");
  return (
    <section
      id="perego"
      className="panel perego-section"
      aria-labelledby="perego-title"
    >
      <div className="eyebrow">OLTRE LIVIGNO · PEREGO</div>
      <h2 id="perego-title">Livigno ⇄ Bormio ⇄ Tirano</h2>
      <p>
        A072 per Livigno–Bormio, A070 per Bormio–Tirano. Consulta gli orari
        delle due tratte e le combinazioni via Bormio.
      </p>
      <aside className="notice">
        <strong>Consultazione per quadro orario.</strong> Scegli il tipo di
        giorno riportato nel PDF: il filtro non verifica una data specifica o le
        condizioni delle singole corse. Anche le varianti condizionate sono
        mostrate. Le combinazioni via Bormio sono indicative e non garantiscono
        la coincidenza o lo stesso mezzo.
      </aside>
      <div className="perego-controls">
        <div>
          <label htmlFor="perego-from">Partenza Perego</label>
          <select
            id="perego-from"
            value={from}
            onChange={(e) => setFrom(e.target.value as Terminal)}
          >
            {options}
          </select>
        </div>
        <div>
          <label htmlFor="perego-to">Destinazione Perego</label>
          <select
            id="perego-to"
            value={to}
            onChange={(e) => setTo(e.target.value as Terminal)}
          >
            {options}
          </select>
        </div>
        <div>
          <label htmlFor="perego-profile">Quadro orario da consultare</label>
          <select
            id="perego-profile"
            value={profile}
            onChange={(e) => setProfile(e.target.value as ServiceProfile)}
          >
            {serviceProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="perego-time">Partenze dalle (Europe/Rome)</label>
          <input
            id="perego-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="perego-pause">Pausa prima di partire</label>
          <select
            id="perego-pause"
            value={pause}
            onChange={(e) => setPause(Number(e.target.value))}
          >
            {[0, 10, 20, 30, 45, 60].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Nessuna pausa" : `Pausa al bar · ${n} minuti`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="perego-margin">Margine minimo a Bormio</label>
          <select
            id="perego-margin"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
          >
            {[5, 10, 15, 30].map((n) => (
              <option key={n} value={n}>
                {n} minuti · scelta di ricerca
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="hint">
        Per ogni prima tratta mostriamo la prima partenza compatibile della
        seconda tratta e le sue eventuali varianti. Il margine è una preferenza
        di ricerca, non un tempo ufficiale di cambio. Le fermate intermedie sono
        consultabili nei PDF.
      </p>
      <details>
        <summary>Periodi e condizioni da controllare</summary>
        <p className="hint">
          Il periodo generale dei libretti è 14/09/2026–08/06/2027. I quadri non
          scolastici hanno intervalli più ristretti: controlla le date su ogni
          tratta. La nota generale indica 07/12 e 23–31/12/2026; 01–05/01,
          08–09/02 e 25–30/03/2027 per il non scolastico, con riserva di
          modifica. Le sigle come ✔❄3, ✔/✖Ve-PNS, ✔/✖PSC, ✔NAT, ✔PNS e i simboli
          cerchiati rimandano alle condizioni e ai proseguimenti spiegati nel
          PDF. Non sono applicate automaticamente dal filtro; una combinazione
          richiede che tutte le condizioni di entrambe le tratte siano
          soddisfatte nello stesso giorno.
        </p>
      </details>
      <div className="perego-results" aria-live="polite">
        {!validTime ? (
          <p>Inserisci un orario valido.</p>
        ) : earliest >= 1440 ? (
          <p>
            La pausa termina il giorno successivo: scegli un orario precedente.
          </p>
        ) : from === to ? (
          <p>Scegli due località diverse.</p>
        ) : results.length === 0 ? (
          <p>
            Nessuna combinazione nelle tabelle con questi filtri. Prova un altro
            orario o un margine diverso. Non cerchiamo nel giorno successivo.
          </p>
        ) : (
          <>
            <p className="hint">
              {results.length} risultati da tabella · condizioni da verificare
            </p>
            {results.map((result) => (
              <article className="trip" key={result.id}>
                <div className="trip-top">
                  <span className="line perego-line">
                    Perego ·{" "}
                    {result.legs.map((l) => l.lineId.toUpperCase()).join(" + ")}
                  </span>
                  <span className="hint">
                    {result.legs.length === 2
                      ? "2 tratte via Bormio"
                      : "Tratta diretta"}
                  </span>
                </div>
                <div className="times">
                  <div>
                    <strong>{formatTime(result.departure)}</strong>
                    <small>Partenza</small>
                  </div>
                  <div className="duration">
                    {result.arrival - result.departure} min
                    <span>────────→</span>
                  </div>
                  <div>
                    <strong>{formatTime(result.arrival)}</strong>
                    <small>Arrivo</small>
                  </div>
                  <div className="wait">
                    <strong>{result.wait} min</strong>
                    <small>Attesa{pause > 0 ? " dopo pausa" : ""}</small>
                  </div>
                </div>
                {result.transferWait !== null && (
                  <p className="school-warning">
                    Intervallo a Bormio: {result.transferWait} min. Coincidenza
                    indicativa; verifica se occorre cambiare mezzo.
                  </p>
                )}
                <ol className="legs">
                  {result.legs.map((leg) => {
                    const source = sources.find((s) => s.id === leg.sourceId)!;
                    return (
                      <li key={leg.id}>
                        <strong>
                          {leg.lineId.toUpperCase()} · {leg.id}
                        </strong>
                        <br />
                        {formatTime(leg.departure)} {leg.originName}
                        <br />
                        {formatTime(leg.arrival)} {leg.destinationName}
                        <br />
                        <span className="hint">
                          Periodo del quadro: {dateLabel(leg.validFrom)}–
                          {dateLabel(leg.validTo)}
                        </span>
                        <p className="leg-note">
                          {leg.notes
                            ? `Note del PDF: ${leg.notes} · leggi le condizioni prima di scegliere questa corsa.`
                            : "Nessuna nota aggiuntiva nella colonna; resta da verificare il calendario del quadro selezionato."}
                        </p>
                        <a
                          href={`${source.path}#page=${leg.sourcePage}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          PDF ufficiale · pag. {leg.sourcePage} · col.{" "}
                          {leg.sourceColumn}
                        </a>
                      </li>
                    );
                  })}
                </ol>
                <p className="hint">
                  Orari programmati · nessun tempo reale · validità delle
                  condizioni non verificata
                </p>
              </article>
            ))}
          </>
        )}
      </div>
      <p className="hint">
        Fonte:{" "}
        <a
          href="https://www.busperego.com/orari-pdf"
          target="_blank"
          rel="noreferrer"
        >
          pagina ufficiale Bus Perego
        </a>
        , consultata il 17/11/2026. Le conferme sugli orari urbani Silvestri non
        modificano i calendari Perego.
      </p>
    </section>
  );
}
