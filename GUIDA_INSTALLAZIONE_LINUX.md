# Hydro-Mec • Guida Installazione ed Esecuzione su Linux

Questa guida descrive come installare ed eseguire l'applicazione **Hydro-Mec - Gestione e Stampa Cartellini** su qualsiasi distribuzione **Linux** (Ubuntu, Debian, Linux Mint, Fedora, RHEL, Arch Linux, Manjaro, openSUSE, ecc.).

---

## 🚀 Metodo 1 (Consigliato): Installazione come App Desktop Nativa (PWA)
*Il metodo più rapido e integrato con il desktop Linux (GNOME, KDE Plasma, XFCE, Cinnamon, MATE). Non richiede l'installazione di Node.js.*

Funziona con qualsiasi browser basato su Chromium disponibile per Linux (**Google Chrome**, **Chromium**, **Brave**, **Microsoft Edge per Linux**):

1. **Apri l'applicazione nel browser** su Linux.
2. **Installa l'App**:
   - Clicca sull'icona **"Installa applicazione"** all'estremità destra della barra degli indirizzi.
   - *Oppure* apri il menu del browser (`⋮` o `≡`) ➔ **"Salva e condividi"** / **"App"** ➔ **"Installa pagina come app"** (o *"Installa Hydro-Mec"*).
3. **Integrazione con il Desktop Linux**:
   - L'applicazione viene aggiunta automaticamente al menu delle applicazioni di sistema (`~/.local/share/applications/`), alla dash e al desktop.
   - Si avvia in una finestra desktop dedicata e isolata, senza barre degli indirizzi o schede del browser, con prestazioni fulminee.

---

## 💻 Metodo 2: Pacchetto Sorgente Scaricabile (.tar.gz / .zip) & Script `avvia_app.sh`
*Ideale per l'esecuzione 100% offline in officina, su server locale o su postazioni di lavoro Linux senza connessione internet.*

### 1. Installazione Prerequisiti (Node.js)
Assicurati che Node.js (versione 18+ o LTS) sia installato. Se non è presente, installalo con il gestore pacchetti della tua distro:

- **Ubuntu / Debian / Linux Mint**:
  ```bash
  sudo apt update
  sudo apt install -y nodejs npm
  ```
- **Fedora / CentOS / RHEL**:
  ```bash
  sudo dnf install -y nodejs npm
  ```
- **Arch Linux / Manjaro**:
  ```bash
  sudo pacman -S nodejs npm
  ```
- **openSUSE**:
  ```bash
  sudo zypper install nodejs npm
  ```

### 2. Download ed Estrazione
1. Clicca sul pulsante **"Installa su Windows / Linux"** nella barra in alto dell'applicazione.
2. Scarica il file **`hydro-mec-stampa-cartellini-linux.tar.gz`** (o `.zip`).
3. Estrai l'archivio nella tua cartella preferita (es. `~/HydroMec_Cartellini`):
   ```bash
   tar -xzf hydro-mec-stampa-cartellini-linux.tar.gz -C ~/HydroMec_Cartellini
   cd ~/HydroMec_Cartellini
   ```

### 3. Avvio con 1 Clic tramite Script Bash
Rendi eseguibile e avvia lo script `avvia_app.sh`:
```bash
chmod +x avvia_app.sh
./avvia_app.sh
```
- Lo script verificherà la presenza di Node.js.
- Al primo avvio installerà automaticamente tutte le librerie necessarie con `npm install`.
- Avvierà il server locale e aprirà automaticamente il browser su:
  ```
  http://localhost:3000
  ```

### 4. Creazione icona nel Menu Applicazioni Linux (.desktop)
Per avviare l'app direttamente dal menu delle applicazioni o dal Desktop:
```bash
chmod +x Hydro-Mec.desktop
cp Hydro-Mec.desktop ~/.local/share/applications/
```

---

## 🖨️ Configurazione Stampante Develop INEO3320 su Linux (CUPS)
Per garantire che i testi stampati collimino al millimetro con le caselle prestampate:

1. **Gestione Stampanti CUPS (`http://localhost:631` o Impostazioni di Sistema)**:
   - Assicurati che la stampante *Develop INEO3320* (o driver PostScript/PCL generico Konica Minolta / Develop) sia configurata in rete.
2. **Finestra di Stampa del Browser (`Ctrl + P`)**:
   - **Destinazione**: Seleziona *Develop INEO3320*.
   - **Formato Carta**: Seleziona **A6** (105 × 148 mm).
   - **Alimentazione Carta / Cassetto**: Seleziona **Bypass / Vassoio Manuale** (dove sono posizionati i cartellini prestampati Hydro-Mec).
   - **Orientamento**: **Orizzontale** (Landscape).
   - **Scala**: Seleziona **100%** (o **Dimensioni effettive**, disattiva "Adatta all'area stampabile").
   - **Margini**: Imposta **Nessuno** o **Minimi**.
   - **Grafica di sfondo**:
     - *Cartellini prestampati colorati originali*: **Disattivata** (stampa solo testo e barcode).
     - *Fogli bianchi di prova*: **Attivata** per stampare anche la cornice grafica.

---

## 🔄 Trasferimento Dati e Settaggi (Cross-Platform)
I backup generati dal pulsante **"Backup / Cambia Browser"** sono file standard JSON (.json) e sono compatibili al 100% tra **Linux**, **Windows**, **macOS** e qualsiasi browser:
1. Esporta il file `.json` su un PC.
2. Copialo sull'altro PC (tramite chiavetta USB o rete interna).
3. Clicca su **"Backup / Cambia Browser"** ➔ **"Importa Configurazione"** per ripristinare codici articolo, lavoranti e calibrazioni millimetriche.
