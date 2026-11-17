# LIVIGO

Assistente per il trasporto pubblico locale di Livigno. Interfaccia responsive in italiano con Next.js App Router, TypeScript e Tailwind CSS. Progetto indipendente, non affiliato a Silvestri Bus o Perego.

## Avvio

Richiede Node.js >= 22.18 e npm.

```sh
npm ci
npm run dev
```

Apri http://localhost:3000. Per produzione: `npm run build` e `npm start`. Il repository non pubblica automaticamente un sito: può essere importato in un hosting compatibile con Next.js.

## Dati ufficiali integrati

### Silvestri: Blu, Verde e Trepalle

77 fermate, 50 colonne di corsa e 1.720 orari trascritti dai tre PDF allegati. I codici fermata sono quelli stampati. Le celle vuote non vengono riempite e i percorsi circolari mantengono le fermate ripetute. Nessun dato demo entra nei risultati ufficiali.

I PDF recano **stagione estiva dal 31/08/2026**, senza data finale. Il 17/11/2026 l'utente ha confermato che gli stessi orari restano validi per l'inverno 2026–2027 e che fornirà successivamente i potenziamenti. Questa conferma è registrata separatamente in `winterConfirmation`: non è una data stampata nei PDF o una verifica presso il gestore. Non si estende automaticamente alle stagioni future.

Trepalle: corse 1 e 5 scolastiche in entrambe le direzioni, escluse inizialmente e attivabili con una casella dedicata. Il calendario dei giorni di scuola non è nei PDF e non viene dedotto.

### Perego: Livigno ⇄ Bormio ⇄ Tirano

Dalla [pagina ufficiale Perego](https://www.busperego.com/orari-pdf), consultata il 17/11/2026, sono stati acquisiti i libretti invernali **A072 Livigno–Valdidentro–Bormio** e **A070 Bormio–Sondalo–Tirano**, periodo generale 14/09/2026–08/06/2027. I singoli quadri possono avere intervalli più ristretti.

259 voci complete fra i capolinea sono consultabili nei cinque quadri: lunedì–venerdì scolastico, sabato scolastico, lunedì–venerdì non scolastico, sabato non scolastico, festivo. Le corse parziali e le fermate intermedie rimangono consultabili nei PDF e non sono trasformate in corse complete.

Per Livigno–Tirano e ritorno il filtro combina due tratte via Bormio. Per ogni prima tratta mostra la prima partenza della seconda tratta compatibile con il margine scelto e le eventuali varianti allo stesso orario. Non valuta le condizioni per una data specifica: **sono combinazioni di tabelle, non coincidenze garantite**. Le note, gli intervalli di validità e i riferimenti di entrambe le tratte sono visibili; è necessario verificare che le condizioni valgano nello stesso giorno. Non è presunto che si debba cambiare mezzo o che il bus sia lo stesso.

La scelta del quadro è manuale. Non vengono inferiti festività, prefestivi, calendario scolastico, giorni di apertura impianti o eccezioni delle singole corse. Le varianti condizionate restano visibili con le note originali, per consultazione. La conferma invernale Silvestri non modifica i calendari Perego.

### Altri allegati

Le matrici tariffarie A060/A061 e i libretti A061 Tirano–Aprica–Edolo e A066 Vervio–Mazzo–Tirano sono conservati e consultabili nella sezione fonti. Non alimentano i risultati del collegamento Livigno–Tirano. Non vengono dedotti prezzi dalle matrici né tratte dalle sole corrispondenze stampate.

## Funzionalità

- Selezione fermate e linea urbana, scambio di partenza/destinazione e ora manuale Europe/Rome.
- Partenza, arrivo, durata e attesa, con collegamento alla pagina e alla colonna del PDF.
- Pausa al bar di 10–60 minuti alla partenza, senza inventare bar o prenotazioni. Attesa calcolata dopo la pausa.
- Consultazione Perego per capolinea e quadro, con margine a Bormio configurabile.
- Nessun tempo reale, ritardo stimato o posizione autobus.
- Geolocalizzazione facoltativa, non salvata o trasmessa dall'app; nessuna ricerca della fermata vicina senza coordinate ufficiali.
- Spazio per futura mappa, nessuna coordinata inventata.

Il filtro è una consultazione delle tabelle: non segue automaticamente l'ora corrente, non verifica un calendario di servizio per una data e non cerca nel giorno successivo. Potenziamenti e avvisi successivi non sono ancora integrati.

## Struttura e tracciabilità

- `src/app/`: pagina, stile responsive, lingua e metadati.
- `src/components/perego-planner.tsx`: consultazione del collegamento extraurbano.
- `src/data/transport.ts`: tipi, linee, dataset urbano e conferma invernale; demo isolata per i test.
- `src/data/perego.ts`: tipi e quadri del collegamento Perego.
- `src/data/imported/`: orari importati e manifest delle fonti con SHA-256, nome originale, URL ove disponibile e date stampate.
- `src/lib/`: ricerca corse dirette, fermate ripetute e combinazioni Perego.
- `public/orari/`: nove PDF originali, accessibili dall'interfaccia.
- `scripts/`: importatori riproducibili e controllo indipendente dei dati.
- `docs/`: rapporti di importazione e note di validazione.
- `tests/`: tredici test su fonti, integrità, ricerca, condizioni e combinazioni.

## Controlli

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Per riprodurre l'importazione (solo manutenzione dati), con Python 3 e `pdfplumber==0.11.9`:

```sh
python -m pip install -r scripts/requirements.txt
python scripts/import_silvestri.py
python scripts/import_perego.py
python scripts/verify_pdf_imports.py
```

La verifica indipendente richiede `pdftotext` di Poppler e confronta tutte le 1.720 celle urbane e le 259 coppie capolinea Perego con l'estrazione pdfplumber. L'importazione non scarica automaticamente aggiornamenti dal sito.

## Prossimi dati

Integrare i potenziamenti come versioni distinte con fonte, periodo, giorni di servizio e precedenza rispetto agli orari base. Prima di abilitare la ricerca per una data, implementare e verificare calendari scolastici, festivi, eccezioni e restrizioni delle note Perego. Per la mappa servono coordinate da una fonte verificata; per il tempo reale serve un feed distinto autorizzato (ad esempio GTFS-RT). I PDF da soli non forniscono queste informazioni.
