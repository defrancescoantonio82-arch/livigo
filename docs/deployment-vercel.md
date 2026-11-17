# Pubblicare LIVIGO su Vercel da iPhone

Il repository è `defrancescoantonio82-arch/livigo`, branch `main`. Questa procedura crea un sito HTTPS accessibile da Safari; non richiede un computer, localhost, un dominio acquistato o credenziali da inserire nel codice.

## Configurazione preparata

| Impostazione | Valore |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | Radice del repository (`./`); non `src` |
| Node.js | 24.x, fissato da `package.json` e `.nvmrc` |
| Install Command | `npm ci` |
| Build Command | `npm run verify` |
| Output Directory | Default di Next.js; lascia l'override disattivato |
| Branch per la produzione | `main` |
| Environment Variables | Nessuna richiesta |

`vercel.json` specifica framework, installazione e comando di build. `npm run verify` esegue lint, `next typegen` e TypeScript, 13 test e build Next.js. La generazione dei tipi permette il controllo anche in un checkout senza `.next` e senza `next-env.d.ts`. Le dipendenze sono fissate nel lockfile con URL del registry pubblico npm.

Non impostare `npm run dev` o `npm start` come Build Command. Vercel gestisce autonomamente il servizio Next.js dopo la build. Non servono export statico, riscritture verso la home, configurazioni di porte o importatori Python durante il deployment. I PDF in `public/orari` devono restare accessibili ai loro percorsi originali.

## Procedura in Safari

1. Apri [vercel.com/new](https://vercel.com/new). Accedi o registrati con **Continue with GitHub**, usando l'account proprietario del repository. Se la pagina mobile comprime alcune opzioni, usa il menu pagina di Safari e **Richiedi sito desktop**.
2. Nella sezione **Import Git Repository**, seleziona l'account `defrancescoantonio82-arch` e cerca `livigo`.
3. Se il repository non compare, tocca **Adjust GitHub App Permissions** o **Configure GitHub App**. Installa/configura l'app **Vercel** sul tuo account GitHub e, sotto **Only select repositories**, aggiungi `livigo`. Salva e torna all'importazione. L'accesso già concesso al Codex Connector non autorizza automaticamente l'app GitHub di Vercel.
4. Tocca **Import** accanto a `defrancescoantonio82-arch/livigo`. Scegli il tuo account/team Vercel e un nome progetto disponibile, ad esempio `livigo`. Se esiste già un progetto collegato a questo repository, aprilo invece di crearne un duplicato e avvia un nuovo deployment di `main`.
5. Controlla **Framework Preset: Next.js**, directory radice e i comandi della tabella. I valori di installazione e build sono già nel file `vercel.json`: non sostituirli con i comandi di sviluppo. Non aggiungere variabili d'ambiente o token. Node.js 24.x è determinato da `package.json`; lo puoi verificare anche in **Settings → Build and Deployment**.
6. Tocca **Deploy**. Attendi lo stato **Ready**: durante la build devono passare tutti i controlli. Se compare **Error**, apri **Build Logs** per leggere il primo errore; non aggirare i controlli.
7. Apri il progetto e individua il **dominio di produzione** assegnato da Vercel, visibile anche in **Settings → Domains**. Apri il link `https://…vercel.app` effettivamente indicato da Vercel. Il nome esatto dipende dalla disponibilità: nessun URL è prenotato da questi file.
8. Per verificare che il sito sia pubblico, apri quel dominio in un pannello privato di Safari, senza login Vercel. Se richiede l'accesso, controlla **Settings → Deployment Protection**: usa il dominio di produzione e una configurazione che non protegga quel dominio. **Standard Protection** lascia pubblici i domini di produzione ma può proteggere gli URL dei singoli deployment; **All Deployments** protegge anche il dominio di produzione. Se necessario per la prova pubblica, disattiva la Vercel Authentication per la produzione. Non creare né condividere token di bypass.
9. Puoi salvare il sito con **Condividi → Aggiungi alla schermata Home**. È un collegamento all'app web: non aggiunge supporto offline.

## Verifica sul tuo iPhone

Apri il dominio HTTPS assegnato e verifica la selezione delle fermate, la pausa al bar, i collegamenti Perego e l'apertura di un PDF nella sezione fonti. La geolocalizzazione si attiva soltanto premendo il pulsante e concedendo il consenso di Safari/iOS; se il consenso è negato, restano disponibili i selettori manuali. Non individua ancora la fermata vicina, perché le coordinate ufficiali non sono integrate.

Non è stato eseguito un deployment remoto da questa sessione: non sono presenti un account Vercel autenticato, un token di deployment o un progetto Vercel collegato. Non serve inviare credenziali a Codex: il collegamento GitHub avviene attraverso Vercel nel tuo browser. Le verifiche locali di build non sostituiscono la conferma **Ready** della piattaforma.

## Aggiornamenti successivi

Dopo il collegamento, i nuovi commit di `main` attivano normalmente un deployment di produzione. Le altre branch/PR generano anteprime secondo la configurazione del progetto. Per recuperare una versione precedente usa il rollback dalla dashboard Vercel; non modificare gli orari per risolvere un problema di hosting.

Nessun dato ufficiale Silvestri/Perego o PDF è stato modificato per questa preparazione. Nessuna chiave API è richiesta. I file `.env*`, `.vercel` e le chiavi `.pem` sono già esclusi dal versionamento; le credenziali di accesso non vanno inserite nei file del progetto o nelle variabili `NEXT_PUBLIC_*`, che sono visibili al browser.

## Riferimenti ufficiali

- [Next.js su Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Node.js supportato e selezione con package.json](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Collegare GitHub e rendere visibile un repository](https://vercel.com/docs/git/vercel-for-github)
- [Deployment Protection e domini pubblici](https://vercel.com/docs/deployment-protection)

## Esito della preparazione

Verificato il 17/11/2026 con Node.js 24.22.1 in una copia pulita del repository, senza `node_modules`, `.next`, `next-env.d.ts` o cache TypeScript preesistenti: `npm ci` e `npm run verify` completati. Passati lint, typecheck, 13 test e build di produzione. Configurazione JSON verificata rispetto alle proprietà dello schema ufficiale Vercel. Nessuna modifica a codice applicativo, dati o PDF; nessun file di credenziali versionato o pattern riconoscibile di chiave rilevato nei file testuali controllati.

L'installazione emette un avviso di deprecazione per ESLint 9.39.5 già nel lockfile. Non è un errore e non blocca lint o deployment; l'aggiornamento di versione maggiore non è necessario per questa pubblicazione di prova.

Resta da eseguire il primo deployment nell'account Vercel e la prova sul dispositivo Safari reale. Non è stato assegnato o verificato alcun URL pubblico da questa sessione.
