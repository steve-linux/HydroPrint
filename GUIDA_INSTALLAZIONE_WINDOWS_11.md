# Hydro-Mec • Guida Installazione su Windows 11

Questa guida descrive come installare ed eseguire l'applicazione **Hydro-Mec - Gestione e Stampa Cartellini** su **Windows 11** in officina o in ufficio tecnico.

---

## 🚀 Metodo 1 (Consigliato): Installazione come App Desktop Nativa (PWA)
*Nessun programma o runtime aggiuntivo richiesto. Funziona direttamente con Microsoft Edge o Google Chrome preinstallati su Windows 11.*

1. **Apri il link dell'applicazione** nel browser **Microsoft Edge** o **Google Chrome**.
2. **Installa l'App**:
   - Su **Microsoft Edge**:
     - Clicca sull'icona **"App disponibile. Installa Hydro-Mec"** (icona con un computer e una freccia) che compare all'estremità destra della barra degli indirizzi in alto.
     - *Oppure*: Clicca sui tre puntini `...` in alto a destra ➔ **App** ➔ **Installa Hydro-Mec - Gestione e Stampa Cartellini**.
   - Su **Google Chrome**:
     - Clicca sull'icona **Installa** nella barra degli indirizzi o sui tre puntini `⋮` ➔ **Salva e condividi** ➔ **Installa pagina come app**.
3. **Opzioni di Windows 11**:
   - Nella finestra di dialogo di conferma, spunta:
     - ☑ **Aggiungi alla barra delle applicazioni**
     - ☑ **Crea collegamento sul desktop**
     - ☑ **Aggiungi a Start**
4. **Fatto!** L'applicazione si aprirà in una finestra desktop dedicata senza barre del browser, pronta all'uso come qualsiasi programma nativo di Windows 11.

---

## 💻 Metodo 2: Installazione Standalone Locale con Node.js (Offline)
*Se desideri far girare l'applicazione completamente offline sulla rete aziendale o su un PC locale.*

### Prerequisiti
- **Node.js**: Scarica e installa la versione **LTS** gratuita da [https://nodejs.org/](https://nodejs.org/) (include `npm`).

### Passaggi di Installazione:
1. **Scarica il pacchetto del codice**:
   - Clicca sul pulsante **"Installa su Windows 11"** nella barra in alto dell'applicazione e seleziona **"Scarica Pacchetto ZIP per Windows 11"**.
   - Estrai l'archivio ZIP in una cartella a tuo piacimento (es. `C:\HydroMec_Cartellini`).
2. **Avvio Rapido (con 1 doppio clic)**:
   - Fai doppio clic sul file `AVVIA_APP.bat` contenuto nella cartella.
   - Lo script verificherà Node.js, installerà automaticamente le librerie al primo avvio e aprirà il browser predefinito all'indirizzo:
     ```
     http://localhost:3000
     ```
3. **Avvio Manuale da PowerShell / Prompt dei Comandi**:
   - Apri il terminale nella cartella del progetto ed esegui:
     ```cmd
     npm install
     npm run dev
     ```

---

## 🖨️ Configurazione Stampante INEO3320 in Windows 11
Per ottenere la centratura millimetrica perfetta sui cartellini prestampati:

1. **Cassetto di alimentazione**:
   - Inserire i cartellini prestampati nel **Cassetto Bypass (Vassoio Manuale)** della INEO3320 regolando le guide laterali.
2. **Prompt di stampa di Windows (`Ctrl + P`)**:
   - **Stampante**: Selezionare *Develop INEO3320*.
   - **Formato carta**: Selezionare **A6** (per il cartellino *Materiale da Controllare 147.5 × 104 mm*).
   - **Alimentazione carta**: **Bypass** (Vassoio manuale).
   - **Orientamento**: **Orizzontale**.
   - **Margini**: **Nessuno** (o Minimi).
   - **Scala**: **100%** (o "Dimensioni effettive" / non adattare alla pagina).
   - **Grafica di sfondo**: Se stampi su modulo prestampato già colorato, lascia **disattivata** l'opzione "Grafica di sfondo". Se stampi su cartoncino bianco liscio, attiva il flag *"Includi sfondo cartellino nella stampa"*.

---

## 💾 Trasferimento Dati tra PC Diversi o Cambio Browser
Per portare su un altro computer Windows 11 tutti gli articoli, lavoranti e la calibrazione salvata:
1. Clicca sul pulsante **"Backup / Cambia Browser"** in alto.
2. Clicca su **"Scarica File di Backup (.json)"**.
3. Sul nuovo PC apri l'app, clicca su **"Backup / Cambia Browser"** ➔ scheda **"Importa Configurazione"** e carica il file `.json`.
4. Tutti i dati, i font e le coordinate mm saranno ripristinati istantaneamente!
