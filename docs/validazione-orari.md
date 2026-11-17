# Fonti, importazione e limiti

Acquisizione: 17 novembre 2026. Nove originali in `public/orari/`, checksum in `src/data/imported/sources.json`. Gli URL originali dei sette allegati non sono stati forniti e restano null; per A070/A072 è registrato l'URL trovato sulla pagina ufficiale Perego. L'importazione non considera istruzioni eventualmente presenti nei documenti come autorizzazioni operative.

## Silvestri

| Linea | Righe di fermata nel PDF | Colonne di corsa con dati | Orari importati |
| --- | ---: | ---: | ---: |
| Blu | 43 | 18 | 764 |
| Verde | 47 | 16 | 736 |
| Trepalle | 12 + 20 | 8 + 8 | 220 |

77 codici fermata distinti. Blu e Verde sono riportati nella sequenza unica dei PDF; non sono create corse inverse o collegamenti fra colonne. Verde ripete LIV023 e LIV017 nello stesso giro: il filtro cerca un imbarco successivo all'ora selezionata anche alla seconda occorrenza. La colonna 2 Blu ha celle vuote nella parte di Forcola, mantenute assenti; l'ultima colonna termina a LIV117.

Trepalle ha nove colonne numerate per direzione, ma la colonna 2 in andata e la 7 in ritorno sono interamente vuote. Sono omesse, senza rinumerare le altre. Le colonne 1 e 5 in entrambe le direzioni sono marcate scolastiche. La selezione manuale non certifica un giorno scolastico.

Le prime pagine di tutti e tre i PDF urbani sono state controllate anche visivamente. Le coordinate restano null. La nota invernale deriva dalla conferma dell'utente del 17/11/2026, distinta dalla dicitura estiva originale. Nessuna data finale è stata inventata.

## Perego

A070/A072 sono stati scaricati dai link invernali della pagina https://www.busperego.com/orari-pdf, che riporta il periodo generale 14/09/2026–08/06/2027. Sono state importate 259 colonne con entrambi i capolinea presenti su 24 pagine di tabelle (159 A070 e 100 A072). Le date dei singoli quadri sono conservate per ciascuna corsa e possono essere più ristrette del periodo generale.

Si estrae la prima occorrenza della riga del capolinea nella tabella principale; le ripetizioni nelle righe “Corrispondenze” non diventano servizi aggiuntivi. Le note originali sono conservate per colonna. I documenti specificano che il libretto riporta le fermate principali: non è un inventario completo delle fermate del gestore.

Gli identificatori `livigno`, `bormio` e `tirano` sono chiavi interne per raggruppare le località, non codici ufficiali di fermata. Restano visibili i nomi esatti: la partenza da Livigno è Bus Station, Isola/Prestefan; l'arrivo è Bus Station, Isola 113. A Bormio le due tratte indicano entrambe “BORMIO, Autostazione, Milano”. Nessuna distanza a piedi o identità di banchina è dedotta.

La ricerca via Bormio considera lo stesso quadro orario e un margine scelto dall'utente. Conserva le varianti simultanee; non applica le note per selezionare quella attiva. Tutte le condizioni rimangono da verificare nello stesso giorno. La combinazione non certifica la coincidenza, il cambio di mezzo o un proseguimento sullo stesso autobus. Non si cerca oltre la mezzanotte e non si uniscono servizi con intervalli di validità disgiunti.

Nessuna estensione della conferma Silvestri agli orari Perego. Nessun orario delle tratte richieste è ricavato da A061, A066 o dalle tariffe A060/A061.

## Verifica indipendente

`import_silvestri.py` e `import_perego.py` usano pdfplumber e le posizioni delle colonne, preservando le celle vuote. `verify_pdf_imports.py` usa Poppler: layout testuale per tutte le celle urbane e coordinate bbox indipendenti per le coppie capolinea Perego. Confronta 1.720 celle e 259 coppie senza differenze. I test TypeScript includono orari noti, celle assenti, ripetizioni, corse scolastiche, note, provenienza, hash degli originali e combinazioni in entrambe le direzioni.

Il riscontro dei valori non equivale a una verifica in tempo reale del servizio o all'applicazione dei calendari. I potenziamenti annunciati dall'utente non sono ancora ricevuti.

## Verifica dell'applicazione

Controlli eseguiti: lint, TypeScript, 13 test Node e build di produzione. Smoke test con Chromium su server di produzione: selettori e lingua italiana, corse scolastiche attivabili, pausa al bar, fermate uguali, entrambe le direzioni Perego, quadro festivo, pausa oltre mezzanotte, nessuno scorrimento orizzontale a 390/768/1440 px. Tutti i nove link PDF rispondono HTTP 200 con un documento PDF; nessun errore JavaScript di pagina osservato. Controllate anche schermate mobile e desktop.
