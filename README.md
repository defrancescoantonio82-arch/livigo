# LIVIGO

Assistente per il trasporto pubblico locale di Livigno. Prima versione responsive in italiano, realizzata con Next.js App Router, TypeScript e Tailwind CSS. Prototipo indipendente, non affiliato a Silvestri Bus.

## Avvio

Richiede Node.js >= 22.18 e npm.

```sh
npm ci
npm run dev
```

Apri http://localhost:3000. Per produzione: `npm run build` e `npm start`. Il repository non pubblica automaticamente un sito: può essere importato in un hosting compatibile con Next.js (ad esempio Vercel).

## Funzionalità

- Selezione partenza e destinazione, scambio delle fermate e scelta dell'ora demo.
- Corse dirette ordinate per partenza, con linea, arrivo e attesa.
- Pausa al bar di 10–60 minuti: mostra le partenze successive alla pausa alla fermata iniziale. Non prenota e non identifica bar reali.
- Stati per fermate uguali, percorsi assenti e fine delle corse demo.
- Richiesta facoltativa della posizione, non salvata o trasmessa; nessuna ricerca della fermata vicina senza coordinate ufficiali.
- Spazio per futura mappa; chiara distinzione fra demo, programmato ufficiale e tempo reale.

## Dati: leggere prima dell'uso

**TUTTI i risultati sono dimostrativi.** Fermata demo A/B/C e orari sono fixture fittizie, non fermate o corse reali. Non usare l'app per pianificare viaggi effettivi. I nomi Blu, Verde e Trepalle sono predisposti; i collegamenti demo non descrivono i loro itinerari reali. La simulazione parte dalle 10:00, non segue l'ora corrente e contiene soltanto collegamenti A → B → C. Attesa = partenza meno ora selezionata (più eventuale pausa). Non vengono simulate posizioni di autobus o informazioni in tempo reale.

## Struttura

- `src/app/page.tsx`: interfaccia interattiva e geolocalizzazione facoltativa.
- `src/app/layout.tsx`: lingua e metadati.
- `src/app/globals.css`: stile responsive, con Tailwind importato.
- `src/data/transport.ts`: tipi, linee e dataset demo. Coordinate e fonti ufficiali sono null.
- `src/lib/journeys.ts`: filtro delle corse dirette e formattazione orari.
- `tests/journeys.test.ts`: verifiche del filtro e della pausa.

## Integrare i PDF ufficiali

1. Acquisire i PDF ufficiali Silvestri Bus per Blu, Verde e Trepalle, conservando URL, data di acquisizione e periodo di validità.
2. Verificare fermate, direzioni, sequenza, giorni di servizio, eccezioni festive/stagionali e corse oltre mezzanotte. Il modello base va esteso con calendari di servizio prima dell'uso reale.
3. Importare e verificare manualmente gli orari; popolare `sourceUrl`, `validFrom`, `validTo`, impostare `kind: 'official'` solo dopo validazione. Adeguare le etichette UI e sostituire l'orologio demo con data/ora Europe/Rome e gestione del calendario.
4. Aggiungere coordinate soltanto da una fonte verificata, poi integrare mappa e ricerca della fermata vicina.
5. Per il tempo reale serve un feed autorizzato distinto (es. GTFS-RT), con fonte, timestamp e controllo dei dati obsoleti. I soli PDF non forniscono ritardi o posizioni dei mezzi.

## Controlli

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Nessuna chiave o credenziale richiesta per questa versione. Geolocalizzazione disponibile solo su HTTPS o localhost, previo consenso del browser.
