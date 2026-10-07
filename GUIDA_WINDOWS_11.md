# HydroPrint • Guida Completa per Windows 11

Guida all'installazione, esecuzione e configurazione dell'applicazione **HydroPrint** su workstation e PC di reparto con **Windows 11**.

---

## 🚀 Metodo 1 (Consigliato): Installazione come App Desktop Windows 11 (PWA)
*Nessun software da compilare, nessuna libreria da installare. Funziona immediatamente con Microsoft Edge preinstallato su Windows 11.*

### Istruzioni passo-passo con Microsoft Edge:
1. Apri l'indirizzo dell'applicazione in **Microsoft Edge**:
2. Guarda l'estremità destra della **barra degli indirizzi in alto**:
   - Vedrai comparire l'icona **"App disponibile. Installa HydroPrint"** (un monitor con freccia verso il basso).
   - In alternativa, clicca sui tre puntini in alto a destra `...` ➔ **App** ➔ **Installa questo sito come app**.
3. Nella finestra di dialogo di conferma di Windows 11:
   - Lascia il nome predefinito **HydroPrint - Stampa Cartellini Hydro-Mec**.
   - Spunta le opzioni desiderate:
     - ☑ **Aggiungi alla barra delle applicazioni**
     - ☑ **Crea collegamento sul desktop**
     - ☑ **Aggiungi a Start**
4. Clicca su **Installa**.
5. L'applicazione apparirà ora come un programma Windows indipendente, in una finestra pulita senza elementi del browser, e potrà essere avviata direttamente dal Desktop o dalla Barra delle Applicazioni.

---

## 💻 Metodo 2: Esecuzione Offline Locale con Node.js & Script `AVVIA_APP.bat`
*Ideale per postazioni d'officina o computer di collaudo che devono funzionare al 100% offline sulla rete locale LAN.*

### Prerequisiti:
- **Node.js (versione 18 LTS o superiore)**: Scaricabile gratuitamente dal sito ufficiale [https://nodejs.org/](https://nodejs.org/).

### Avvio con 1 Clic:
1. Scarica ed estrai la cartella del progetto in `C:\HydroPrint` (o nella cartella desiderata).
2. Fai doppio clic sul file **`AVVIA_APP.bat`**:
   - Lo script verifica la presenza di Node.js.
   - Alla prima esecuzione esegue in automatico l'installazione delle librerie con `npm install`.
   - Avvia il server locale sulla porta 3000.
   - Apre in automatico **Microsoft Edge in modalità App Desktop** all'indirizzo `http://localhost:3000`.

### Avvio Avanzato con PowerShell:
È disponibile anche lo script **`Avvia-HydroPrint-Windows11.ps1`**, che crea in automatico il collegamento `.lnk` con icona sul Desktop dell'utente corrente se non è già presente.

---

## 🖨️ Calibrazione Stampante & Risoluzione Compressione 220 mm
Consultare il documento specifico **`RISOLUZIONE_COMPRESSIONE_220MM.md`** (accessibile anche dal pulsante "Diagnosi Compressione 220mm" nell'applicazione) per le istruzioni dettagliate sulla creazione del modulo carta personalizzato in Windows 11 e la configurazione del vassoio Bypass.

---

## 💾 Salvataggio e Backup Dati
Tutti i codici articolo, i nomi dei lavoranti e le coordinate di calibrazione millimetrica sono salvati in modo permanente nella memoria locale del PC (LocalStorage v4).
Tramite il pulsante **"Backup / Ripristino"** in alto è possibile:
1. Scaricare il file di backup `.json` completo con un clic.
2. Trasferire il file su qualsiasi altro PC con Windows 11 tramite chiavetta USB o cartella condivisa di rete.
3. Ripristinare istantaneamente tutta la configurazione sul nuovo computer.
