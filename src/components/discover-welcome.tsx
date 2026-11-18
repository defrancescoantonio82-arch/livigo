"use client";
import { useEffect, useState } from "react";
type Prefs = { first: string; profile: string; interests: string[]; mobility: string };
const defaults: Prefs = { first: "yes", profile: "tourist", interests: ["nature"], mobility: "mixed" };
const options = [{ id: "nature", label: "Natura e panorami", emoji: "🏔️" },{ id: "food", label: "Cibo e tradizioni", emoji: "🧀" },{ id: "sport", label: "Sport e avventura", emoji: "🚴" },{ id: "family", label: "Famiglie", emoji: "👨‍👩‍👧" }];
export default function DiscoverWelcome() {
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState("Posizione non richiesta");
  useEffect(() => { try { const saved = localStorage.getItem("livigo-discover-v1"); if (saved) { setPrefs(JSON.parse(saved)); setStep(4); } } catch {} setReady(true); }, []);
  function finish() { try { localStorage.setItem("livigo-discover-v1", JSON.stringify(prefs)); } catch {} setStep(4); }
  function locate() { if (!navigator.geolocation) { setPosition("GPS non supportato"); return; } setPosition("Ricerca posizione…"); navigator.geolocation.getCurrentPosition(() => setPosition("Posizione autorizzata. Le fermate vicine saranno disponibili dopo la verifica delle coordinate."), () => setPosition("Posizione non disponibile: puoi continuare senza GPS."), { timeout: 10000 }); }
  if (!ready) return null;
  return <section className="discover" id="discover" aria-label="Scopri Livigno">
    <div className="discover-head"><span className="discover-kicker">LIVIGO DISCOVER</span><h2>Livigno ti aspetta.</h2><p>Scopri cosa vedere, come muoverti e dove fermarti lungo il percorso.</p></div>
    {step < 4 ? <div className="discover-card">
      <p className="discover-progress">Conosciamoci · {step + 1} di 4</p>
      {step === 0 && <><h3>È la tua prima volta a Livigno?</h3>{[["yes","Sì, è la prima volta"],["no","No, conosco già Livigno"]].map(([v,t])=><button className={prefs.first===v?"discover-choice selected":"discover-choice"} key={v} onClick={()=>setPrefs({...prefs,first:v})}>{t}</button>)}</>}
      {step === 1 && <><h3>Come vivi Livigno?</h3>{[["tourist","Sono in vacanza"],["seasonal","Lavoro qui per la stagione"],["resident","Vivo qui"]].map(([v,t])=><button className={prefs.profile===v?"discover-choice selected":"discover-choice"} key={v} onClick={()=>setPrefs({...prefs,profile:v})}>{t}</button>)}</>}
      {step === 2 && <><h3>Cosa vorresti scoprire?</h3><div className="discover-options">{options.map(o=><button key={o.id} aria-pressed={prefs.interests.includes(o.id)} className={prefs.interests.includes(o.id)?"discover-choice selected":"discover-choice"} onClick={()=>setPrefs({...prefs,interests:prefs.interests.includes(o.id)?prefs.interests.filter(i=>i!==o.id):[...prefs.interests,o.id]})}>{o.emoji} {o.label}</button>)}</div></>}
      {step === 3 && <><h3>Come preferisci muoverti?</h3>{[["walk","A piedi"],["bus","In autobus"],["mixed","A piedi e in autobus"],["car","Ho un'auto"]].map(([v,t])=><button className={prefs.mobility===v?"discover-choice selected":"discover-choice"} key={v} onClick={()=>setPrefs({...prefs,mobility:v})}>{t}</button>)}</>}
      <div className="discover-actions">{step>0&&<button className="discover-secondary" onClick={()=>setStep(step-1)}>Indietro</button>}<button className="discover-next" onClick={()=>step===3?finish():setStep(step+1)}>{step===3?"Scopri Livigno":"Continua"}</button><button className="discover-skip" onClick={finish}>Salta</button></div>
    </div> : <div className="discover-card"><h3>Cosa vuoi fare oggi?</h3><div className="discover-options">{options.filter(o=>prefs.interests.length===0||prefs.interests.includes(o.id)).map(o=><div className="discover-tile" key={o.id}><span>{o.emoji}</span><strong>{o.label}</strong><small>Itinerari in preparazione</small></div>)}</div><button className="discover-next" onClick={locate}>⌖ Esplora vicino a me</button><p role="status" className="discover-status">{position}</p><a className="discover-bus" href="#urbano">🚌 Cerca un autobus e consulta gli orari →</a><button className="discover-skip" onClick={()=>setStep(0)}>Modifica preferenze</button></div>}
    <p className="discover-disclaimer">LIVIGO è un progetto indipendente. Suggerimenti e itinerari saranno attivati solo con dati verificati; nessuna posizione viene memorizzata da questa funzione.</p>
  </section>;
