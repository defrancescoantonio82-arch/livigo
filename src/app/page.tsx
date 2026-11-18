"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PeregoPlanner from "@/components/perego-planner";
import DiscoverWelcome from "@/components/discover-welcome";
import { dataset, lines, sources, winterConfirmation } from "@/data/transport";
import { findJourneys, formatTime } from "@/lib/journeys";

export default function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("14:00");
  const [useNow, setUseNow] = useState(true);
  const [nowTime, setNowTime] = useState<string | null>(null);
  const [returnTime, setReturnTime] = useState("18:00");
  const [showReturn, setShowReturn] = useState(false);
  const [lineId, setLineId] = useState("");
  const [school, setSchool] = useState(false);
  const [coffee, setCoffee] = useState(false);
  const [pause, setPause] = useState(20);
  const [geo, setGeo] = useState("");
  const effectiveTime = useNow && nowTime ? nowTime : time;
  const [hours, minutes] = effectiveTime.split(":").map(Number);
  const earliest = hours * 60 + minutes + (coffee ? pause : 0);
  const validTime = /^\d{2}:\d{2}$/.test(effectiveTime) && Number.isFinite(earliest);
  const fromStop = dataset.stops.find((s) => s.name.toLocaleLowerCase("it").trim() === from.toLocaleLowerCase("it").trim());
  const toStop = dataset.stops.find((s) => s.name.toLocaleLowerCase("it").trim() === to.toLocaleLowerCase("it").trim());
  const results = validTime && fromStop && toStop
    ? findJourneys(dataset, fromStop.id, toStop.id, earliest, {
        includeSchoolOnly: school,
        lineId,
      })
    : [];
  const [returnHours, returnMinutes] = returnTime.split(":").map(Number);
  const returnResults = showReturn && fromStop && toStop && /^\d{2}:\d{2}$/.test(returnTime)
    ? findJourneys(dataset, toStop.id, fromStop.id, returnHours * 60 + returnMinutes, {includeSchoolOnly:school}) : [];
  const stopOptions = dataset.stops.map((s) => (
    <option key={s.id} value={s.name} />
  ));
  const nearbyAlternatives = !results.length && fromStop && toStop
    ? dataset.stops
        .filter((s) => s.id !== toStop.id && s.name.toLocaleLowerCase("it").replace(/fr\\.|\\(off\\)/g, "").trim() === toStop.name.toLocaleLowerCase("it").replace(/fr\\.|\\(off\\)/g, "").trim())
        .filter((s) => findJourneys(dataset, fromStop.id, s.id, earliest, { includeSchoolOnly: school, lineId }).length > 0)
    : [];


  useEffect(() => { setNowTime(new Intl.DateTimeFormat("en-GB", {timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date())); }, []);
  function localClock() { return new Intl.DateTimeFormat("en-GB", {timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date()); }
  function refreshNow() { setNowTime(localClock()); setUseNow(true); }
  function locate() {
    if (!navigator.geolocation) {
      setGeo("Geolocalizzazione non supportata dal browser.");
      return;
    }
    setGeo("Richiesta della posizione…");
    navigator.geolocation.getCurrentPosition(
      () =>
        setGeo(
          "Posizione rilevata. La fermata più vicina sarà disponibile con le coordinate ufficiali. La posizione non viene salvata.",
        ),
      () =>
        setGeo(
          "Posizione non disponibile o autorizzazione negata. Puoi selezionare le fermate manualmente.",
        ),
      { timeout: 10000 },
    );
  }

  return (
    <main>
      <header>
        <Link className="brand" href="/">
          LIVIGO
          <span className="brand-arrow" aria-hidden="true" />
        </Link>
        <span className="location">LIVIGNO · MOBILITÀ LOCALE</span>
        <span className="demo-pill">Orari da PDF ufficiali</span>
      </header>
      <nav className="service-nav" aria-label="Servizi di trasporto">
        <a href="#urbano">Urbano Silvestri</a>
        <a href="#perego">Livigno–Tirano</a>
        <a href="#fonti">PDF e fonti</a>
      </nav>
      <div className="discover-collapsed"><DiscoverWelcome /></div>
      <section className="hero">
        <div className="eyebrow">IL TUO PROSSIMO PASSO, PIÙ SEMPLICE</div>
        <h1>
          Goditi Livigno.
          <br />
          <span>Al viaggio pensiamo noi.</span>
        </h1>
        <p>Consulta le corse programmate. E prenditi il tempo per un caffè.</p>
        <div className="mountains" aria-hidden="true">
          ╱╲ &nbsp; ╱╲ &nbsp; ╱╲
        </div>
      </section>
      <aside className="notice">
        <strong>Orari Silvestri: Blu, Verde e Trepalle.</strong> PDF estivi dal
        31/08/2026. Orari invariati per l’inverno 2026–2027 secondo la conferma
        ricevuta dall’utente il 17/11/2026. Potenziamenti non ancora inclusi.
        Nessun dato in tempo reale. <a href="#fonti">Consulta fonti e limiti</a>
        .
      </aside>
      <div id="urbano" className="columns">
        <section className="panel planner">
          <div className="eyebrow">ORGANIZZA IL TUO SPOSTAMENTO</div>
          <h2>Dove vuoi andare?</h2>
          <details className="advanced-filters"><summary>Filtri avanzati · linea</summary><label htmlFor="line">Linea</label>
          <select
            id="line"
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
          >
            <option value="">Tutte le linee urbane</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select></details>
          <label htmlFor="from">Da dove parti?</label>
          <input id="from" type="search" list="livigo-stops" value={from}
            placeholder="Scrivi la fermata di partenza"
            autoComplete="off" onChange={(e) => setFrom(e.target.value)} />
          <button className="swap" onClick={() => { setFrom(to); setTo(from); }}
            aria-label="Scambia partenza e destinazione">⇅ Inverti percorso</button>
          <label htmlFor="to">Dove vuoi arrivare?</label>
          <input id="to" type="search" list="livigo-stops" value={to}
            placeholder="Scrivi la fermata di arrivo"
            autoComplete="off" onChange={(e) => setTo(e.target.value)} />
          <datalist id="livigo-stops">{stopOptions}</datalist>
          <p className="hint">Scrivi il nome e scegli una fermata suggerita. «fr.» indica il lato opposto della strada.</p>
          <div className="quick-time"><button className={useNow ? "active" : ""} onClick={refreshNow}>Parti adesso</button><button className={!useNow ? "active" : ""} onClick={() => setUseNow(false)}>Scegli orario</button></div>
          <label htmlFor="time">Partenze dalle</label>
          <input
            id="time"
            type="time"
            required
            value={effectiveTime}
            onFocus={() => setUseNow(false)}
            onChange={(e) => {setUseNow(false);setTime(e.target.value);}}
          />
          {useNow && <button className="refresh-time" onClick={refreshNow}>Aggiorna ora di partenza</button>}
          <p className="hint">
            Ora locale di Livigno (Europe/Rome), selezionata manualmente.
            Consulta le tabelle: non è una previsione di arrivo e non verifica
            il calendario per una data specifica.
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={school}
              onChange={(e) => setSchool(e.target.checked)}
            />{" "}
            Includi corse scolastiche Trepalle
          </label>
          <p className="hint">
            Corse 1 e 5 in entrambe le direzioni: solo scolastiche. Verifica il
            giorno di servizio; il calendario scolastico non è incluso nei PDF
            urbani.
          </p>
          <div className="coffee">
            <label className="check">
              <input
                type="checkbox"
                checked={coffee}
                onChange={(e) => setCoffee(e.target.checked)}
              />{" "}
              ☕ Prima, una pausa al bar
            </label>
            <p>Riparti con calma, quando sei pronto.</p>
            {coffee && (
              <label htmlFor="pause">
                Pausa in minuti
                <select
                  id="pause"
                  value={pause}
                  onChange={(e) => setPause(Number(e.target.value))}
                >
                  {[10, 20, 30, 45, 60].map((n) => (
                    <option key={n} value={n}>
                      {n} minuti
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="return-planner"><label className="check"><input type="checkbox" checked={showReturn} onChange={(e)=>setShowReturn(e.target.checked)}/> ↩ Cerca anche il ritorno</label>{showReturn && <><label htmlFor="return-time">Ritorno dalle</label><input id="return-time" type="time" value={returnTime} onChange={(e)=>setReturnTime(e.target.value)}/></>}</div>
          <p className="hint">
            Il filtro si aggiorna automaticamente. La pausa si calcola alla
            partenza; nessun bar reale è associato.
          </p>
        </section>
        <section className="departures" aria-labelledby="departures">
          <div className="results-heading">
            <div>
              <div className="eyebrow">IL TUO VIAGGIO</div>
              <h2 id="departures">Partenze programmate</h2>
            </div>
            <span className="count">{results.length} corse</span>
          </div>
          <p className="hint">
            {validTime
              ? coffee
                ? `Dopo la pausa, dalle ${formatTime(earliest)}`
                : `A partire dalle ${effectiveTime}`
              : "Seleziona un orario"}{" "}
            · solo collegamenti diretti nelle tabelle allegate
          </p>
          <div aria-live="polite">
            {!validTime ? (
              <div className="panel empty">Inserisci un orario valido.</div>
            ) : earliest >= 1440 ? (
              <div className="panel empty">
                La pausa termina il giorno successivo. Seleziona un orario
                precedente: la ricerca non estende le corse al giorno seguente.
              </div>
            ) : !fromStop || !toStop ? (
              <div className="panel empty">Scrivi partenza e destinazione e seleziona i nomi completi suggeriti. Nessuna ricerca viene effettuata finché entrambe le fermate non sono riconosciute.</div>
            ) : fromStop.id === toStop.id ? (
              <div className="panel empty">Scegli due fermate diverse.</div>
            ) : results.length === 0 ? (
              <div className="panel empty">
                Nessuna corsa diretta trovata nelle tabelle per questi filtri.
                Prova un altro orario o un’altra linea. Non vengono calcolati
                cambi o collegamenti del giorno successivo.
                {nearbyAlternatives.length > 0 && <div className="stop-alternatives"><strong>Forse intendevi il lato opposto?</strong>{nearbyAlternatives.map((s) => <button key={s.id} onClick={() => setTo(s.name)}>Cerca per {s.name}</button>)}</div>}
              </div>
            ) : (
              results.slice(0, 5).map((r, i) => {
                const line = lines.find((l) => l.id === r.lineId)!;
                const source = sources.find((s) => s.id === r.sourceId)!;
                return (
                  <article className="trip" key={r.id}>
                    <div className="trip-top">
                      <span className="line" style={{ background: line.color }}>
                        Linea {line.name}
                      </span>
                      <span className="hint">
                        {i === 0 ? "Prima nel filtro · " : ""}
                        {r.direction === "trepalle"
                          ? "Verso Trepalle"
                          : r.direction === "livigno"
                            ? "Verso Livigno"
                            : "Percorso circolare"}
                      </span>
                    </div>
                    {r.schoolOnly && (
                      <p className="school-warning">
                        Solo corsa scolastica · verifica il giorno di servizio
                      </p>
                    )}
                    <div className="times">
                      <div>
                        <strong>{formatTime(r.departure)}</strong>
                        <small>Partenza</small>
                      </div>
                      <div className="duration">
                        {r.arrival - r.departure} min <span>────────→</span>
                      </div>
                      <div>
                        <strong>{formatTime(r.arrival)}</strong>
                        <small>Arrivo</small>
                      </div>
                      <div className="wait">
                        <strong>{r.wait} min</strong>
                        <small>Attesa{coffee ? " dopo pausa" : ""}</small>
                      </div>
                    </div>
                    <div className="trip-footer">
                      <a
                        href={`${source.path}#page=${r.sourcePage}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF ufficiale · pag. {r.sourcePage} · col.{" "}
                        {r.sourceColumn}
                      </a>
                      <span>Tempo reale non disponibile</span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
      {showReturn && <section className="panel return-results" aria-live="polite"><div className="eyebrow">VIAGGIO DI RITORNO</div><h2>{toStop?.name ?? "Destinazione"} → {fromStop?.name ?? "Partenza"}</h2>{!fromStop || !toStop ? <p>Seleziona prima le due fermate.</p> : returnResults.length === 0 ? <p>Nessuna corsa diretta programmata per il ritorno dopo le {returnTime}. Controlla la direzione o prova un altro orario.</p> : returnResults.slice(0,5).map(r=><article className="return-trip" key={r.id}><strong>{formatTime(r.departure)} → {formatTime(r.arrival)}</strong><span>Linea {lines.find(l=>l.id===r.lineId)?.name} · {r.arrival-r.departure} min · programmata, non in tempo reale</span></article>)}</section>}
      <PeregoPlanner />
      <section className="bottom-grid">
        <div className="panel">
          <div className="eyebrow">ESPLORA, CON CALMA</div>
          <h2>La mappa, prossimamente.</h2>
          <p>
            Fermate e percorsi appariranno qui dopo la verifica delle coordinate
            ufficiali. I PDF non forniscono coordinate o posizioni dei mezzi.
          </p>
          <button className="primary" onClick={locate}>
            ⌖ Usa la mia posizione
          </button>
          <p role="status" className="hint">
            {geo ||
              "Attivazione facoltativa. Richiede il consenso del browser e HTTPS o localhost."}
          </p>
        </div>
        <div className="panel information">
          <div className="eyebrow">INFORMAZIONI TRASPARENTI</div>
          <h2>Sai sempre cosa stai guardando.</h2>
          <p>
            <strong>Programmato ufficiale</strong>
            <br />
            Orari trascritti dalle tabelle allegate, con link al PDF di origine.
            Non indicano la posizione effettiva del bus.
          </p>
          <p>
            <strong>Conferma per l’inverno</strong>
            <br />
            {winterConfirmation.statement} Conferma dell’utente, distinta dal
            contenuto stampato. Data di fine non specificata; nessuna estensione
            automatica alle stagioni future.
          </p>
          <p>
            <strong>Tempo reale</strong>
            <br />
            Non collegato. Nessuna posizione autobus o ritardo stimato.
          </p>
        </div>
      </section>
      <section
        id="fonti"
        className="panel sources"
        aria-labelledby="sources-title"
      >
        <div className="eyebrow">DOCUMENTI RICEVUTI</div>
        <h2 id="sources-title">Fonti e copertura</h2>
        <p>
          {dataset.stops.length} fermate e {dataset.trips.length} colonne di
          corsa importate per le tre linee urbane, incluse 4 corse scolastiche
          Trepalle escluse dal filtro iniziale. Le celle vuote restano assenti:
          nessun passaggio è stato stimato.
        </p>
        <p>
          <strong>Perego: A072 Livigno–Bormio e A070 Bormio–Tirano.</strong>{" "}
          Libretti invernali acquisiti dal sito ufficiale, con consultazione per
          quadro orario e combinazioni indicative via Bormio. I primi allegati
          A061, A066 e le tariffe A060/A061 rimangono documenti di altre tratte
          e non alimentano i risultati di questo collegamento.
        </p>
        <ul>
          {sources.map((source) => (
            <li key={source.id}>
              <a href={source.path} target="_blank" rel="noreferrer">
                {source.title} ↗
              </a>
              <span className="hint">
                {source.kind === "urban-timetable"
                  ? " · importato"
                  : source.kind === "corridor-timetable"
                    ? " · tratte principali importate"
                    : source.kind === "fare-matrix"
                      ? " · tariffe, non orari"
                      : " · documento di altra tratta"}
              </span>
            </li>
          ))}
        </ul>
        <p className="hint">
          I PDF urbani recano “stagione estiva dal 31.08.2026”, senza data
          finale o calendario dettagliato. La conferma invernale è stata
          ricevuta il 17/11/2026. Potenziamenti e variazioni successive non sono
          ancora inclusi. Verifica eventuali avvisi del gestore prima di
          partire.
        </p>
      </section>
      <footer>
        <span className="brand">
          LIVIGO
          <span className="brand-arrow" aria-hidden="true" />
        </span>
        <p>Più tempo per vivere la montagna.</p>
        <small>
          Progetto indipendente · Non è un servizio ufficiale Silvestri Bus o
          Perego.
        </small>
      </footer>
    </main>
  );
}
