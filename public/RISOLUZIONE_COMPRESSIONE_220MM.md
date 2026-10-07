# DIAGNOSI & RISOLUZIONE DEL PROBLEMA: COMPRESSIONE DEL CARTELLINO DA 220 MM A ~150 MM

## 📌 Sintomo Riscontrato
Quando si seleziona e si invia in stampa il cartellino **"Materiale in Lavorazione / Da Versare"** di dimensione nominale **220 × 87 mm**:
- La stampa cartacea non occupa i 220 mm di larghezza del supporto prestampato inserito nel bypass.
- L'intera grafica e tutti i testi risultano orizzontalmente compressi e rimpiccioliti su una larghezza di circa **148-150 mm**.
- La parte destra del cartellino prestampato (ultimi 70 mm) rimane bianca, mentre le diciture "CODICE", "LANCIO", "Q.TA", "LAVORANTE" risultano tutte fuori sede verso sinistra.

---

## 🔬 Causa Tecnica Dettagliata (Root Cause Analysis)

Nel software HydroPrint sono presenti due formati fisici distinti di cartellino:
1. **Materiale da Controllare (Blu):** `147.5 × 104 mm`
2. **Materiale in Lavorazione (Finito):** `220 × 87 mm`

Il formato standard internazionale **ISO A6** misura esattamente **105 × 148 mm**.
Il cartellino blu (147.5 × 104 mm) coincide al millimetro con il formato **A6**!
Di conseguenza, il driver della stampante (Develop ineo 3320 / Konica Minolta / PCL6) in officina viene normalmente configurato dall'operatore con:
- **Formato carta predefinito: A6**
- **Cassetto di alimentazione: Bypass manuale**

Quando l'operatore passa a stampare il cartellino da **220 mm**:

### 1. Il limite di `@page { size: auto; }` nei CSS originali
Nel foglio di stile originale `index.css`, la direttiva di stampa dichiarava:
```css
@media print {
  @page {
    margin: 0 !important;
    size: auto;
  }
}
```
Quando `size` è impostato su `auto`, il motore di rendering Chromium (Microsoft Edge e Google Chrome su Windows 11) **non comunica al sistema operativo Windows una dimensione pagina esplicita personalizzata**. 
Chromium interroga quindi il driver di Windows 11, il quale restituisce l'ultimo formato utilizzato o il formato predefinito della stampante, ovvero **A6 (148 mm)**.

### 2. Il fattore di scala automatico di Chromium: 148mm / 220mm ≈ 67%
Chromium rileva un elemento HTML (`#print-root`) con larghezza dichiarata di **220 mm**, da collocare all'interno di un foglio configurato a livello di sistema operativo come **A6 (148 mm)**.
Quando nella finestra di stampa di Windows 11 è attiva l'opzione predefinita **"Adatta alla pagina"** (o "Adatta all'area stampabile"):
$$\text{Fattore di Riduzione} = \frac{148\text{ mm}}{220\text{ mm}} \approx 67.27\%$$
L'intero layout da 220 mm viene proporzionalmente ridotto del 33%, venendo **compresso e schiacciato esattamente nella larghezza di 148-150 mm** del formato A6!

---

## 🛠️ Come è Stato Risolto a Livello di Codice

Abbiamo applicato una soluzione ingegneristica su 4 livelli:

### 1. Iniezione Dinamica di `@page` con Dimensioni Esatte in Millimetri
In `src/components/PrintDocument.tsx`, per ciascun cartellino viene ora iniettato un blocco CSS dedicato:
- Per il cartellino da 220 mm:
  ```css
  @page {
    size: 220mm 87mm !important;
    margin: 0mm !important;
  }
  ```
- Per il cartellino blu:
  ```css
  @page {
    size: 147.5mm 104mm !important;
    margin: 0mm !important;
  }
  ```
In questo modo Microsoft Edge e Chromium comunicano direttamente allo spooler di Windows 11 che il documento richiede una pagina fisica di **220 mm di larghezza e 87 mm di altezza**, impedendo il fallback implicito sul formato A6.

### 2. Rimozione dei vincoli `width: 100%` in `index.css`
È stato rimosso il vincolo `width: 100%` su `html` e `body` a stampa, impostando invece `overflow: hidden` e dimensioni esatte in mm, evitando che il contenitore venga vincolato alla larghezza del foglio A6 memorizzato nel browser.

### 3. Modalità Stampa "Foglio A4 con Scala 100% Antiriduzione"
Per gli ambienti in cui il driver della stampante non permette all'operatore di salvare moduli personalizzati, è stata integrata la modalità alternativa **Foglio A4 Scala 100%**:
Il cartellino da 220 × 87 mm viene collocato su un foglio A4 (297 × 210 mm) al **100% esatto delle sue dimensioni fisiche**, senza alcuna scala o compressione.

---

## 📋 Configurazione del Driver di Stampa Windows 11 (Develop INEO3320)

Per ottenere una stampa millimetrica perfetta senza alcun intervento manuale ad ogni foglio, eseguire questa configurazione una tantum su Windows 11:

### Passaggio 1: Creazione del Modulo Carta Personalizzato in Windows 11
1. Premi la combinazione di tasti **`Win + R`**, digita:
   ```cmd
   control printers
   ```
   e premi **Invio**.
2. Fai clic su una qualsiasi stampante nell'elenco e clicca in alto su **"Proprietà server di stampa"** (Print Server Properties).
3. Nella scheda **"Moduli"**:
   - Metti la spunta su **☑ Crea un nuovo modulo**.
   - **Nome modulo:** digita `Hydro-Mec 220x87`.
   - **Descrizione modulo:** seleziona unità **Metrico**.
   - **Larghezza:** `22,00 cm` (oppure 220,0 mm).
   - **Altezza:** `8,70 cm` (oppure 87,0 mm).
   - **Margini stampante:** imposta tutti i margini (Sinistro, Destro, Superiore, Inferiore) a `0,00 cm`.
4. Clicca su **"Salva modulo"** e poi su **"Chiudi"**.

### Passaggio 2: Impostazione Cassetto Bypass su Develop INEO3320
1. Fai clic con il tasto destro sulla stampante **Develop INEO3320** (o Konica Minolta).
2. Seleziona **Preferenze di stampa** (Printing Preferences).
3. Nella scheda **Carta / Finitura** (Paper/Quality):
   - **Formato originale / Formato carta:** seleziona `Hydro-Mec 220x87` (oppure *Formato Personalizzato* e inserisci 220 mm × 87 mm).
   - **Alimentazione carta / Cassetto:** seleziona **Vassoio Bypass (Manuale)**.
   - **Tipo di carta:** Cartoncino / Carta spessa (Thick).
4. Clicca su **Applica** e poi su **OK**.

### Passaggio 3: Finestra di Stampa di Microsoft Edge / Chrome (`Ctrl + P`)
Quando si apre la finestra di anteprima di stampa:
- **Destinazione:** Develop INEO3320.
- **Formato carta:** `Hydro-Mec 220x87` (o Definito da applicazione).
- Clicca su **"Altre impostazioni"**:
  - **Scala:** seleziona **100% (Effettiva)** ➔ **NON selezionare mai "Adatta alla pagina" o "Adatta all'area stampabile"!**
  - **Margini:** seleziona **Nessuno**.
  - **Grafica di sfondo:** disattivata se si stampa sopra i cartellini prestampati originali.

Seguendo questa procedura, il cartellino da 220 mm verrà stampato con una precisione al decimo di millimetro senza alcuna compressione!
