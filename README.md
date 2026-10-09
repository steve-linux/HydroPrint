# HydroPrint

Compilazione e stampa dei cartellini prestampati Hydro-Mec sulla Develop ineo 3320 (vassoio bypass):

- **Materiale in lavorazione / da versare**: 219 × 87 mm
- **Materiale da controllare** (blu): 147,5 × 104 mm

È una pagina web (React + Vite) che gira nel browser. Articoli, lavoranti, posizioni di calibrazione
e impostazioni restano salvati nel browser del PC (localStorage): per spostarli su un altro PC si usa
**Backup / Ripristino**. Nessun dato viene inviato in rete.

## Avviarla sul proprio PC

Serve [Node.js](https://nodejs.org/) (versione LTS).

```
npm install
npm run dev
```

Poi aprire http://localhost:3000. Su Windows c'è anche `AVVIA_APP.bat`, che fa le stesse cose.

## Controlli prima di consegnare una modifica

```
npm run lint    # controllo dei tipi (TypeScript)
npm test        # test automatici (Vitest)
npm run build   # compilazione
```

Gli stessi controlli partono da soli su GitHub a ogni Pull Request (`.github/workflows/controlli.yml`):
nella pagina della Pull Request compare una spunta verde se passano, una croce rossa se qualcosa si è rotto.

I test stanno accanto al codice che controllano (`src/lib/*.test.ts`) e sono scritti in italiano:
leggerli è il modo più veloce per sapere cosa l'app garantisce (es. "un modulo vuoto non stampa dati inventati").

## Dove sta cosa

| Cartella / file | Cosa contiene |
|---|---|
| `src/App.tsx` | stato dell'app, salvataggio nel browser, stampa |
| `src/components/` | le schermate (Stampa, Calibrazione, Articoli, Lavoranti, finestre di import/backup) |
| `src/components/PrintDocument.tsx` | il foglio che va davvero alla stampante |
| `src/lib/cartellino.ts` | regole sui dati: data, testo dei campi, campi obbligatori, revisione |
| `src/lib/barcode.ts` | misura dei barcode Code 128: larghezza, leggibilità, sovrapposizioni |
| `src/constants/defaultPositions.ts` | formati dei cartellini e posizioni di fabbrica (mm) |

## Come si lavora (anche con AI Studio)

1. **Un problema = una issue** su GitHub: cosa succede, cosa ci si aspettava, come riprodurlo.
2. **Ogni modifica su un ramo (branch)**, non direttamente su `main`: `main` è sempre la versione
   che funziona e che si usa in officina.
3. **Commit piccoli**, ognuno con un messaggio che dice *cosa* cambia e *perché*.
4. **Una Pull Request** per proporre il ramo: descrive le modifiche, elenca le issue che risolve e
   come provarle. GitHub esegue i controlli automatici.
5. **Prova sulla stampante vera** prima di unire: un cartellino di prova per ciascun formato.
6. **Merge** della Pull Request su `main`: le issue collegate si chiudono da sole.
7. **In AI Studio: Settings → GitHub → Pull** prima di chiedere nuove modifiche, così AI Studio
   riparte dalla versione aggiornata invece di sovrascriverla con la sua copia vecchia.
