import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  CheckCircle,
  Copy,
  Check,
  X,
  Laptop,
  FileCode,
  FileText,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  AVVIA_APP_BAT_CONTENT,
  AVVIA_POWERSHELL_PS1_CONTENT,
  RISOLUZIONE_COMPRESSIONE_220MM_CONTENT,
  GUIDA_WINDOWS_CONTENT
} from '../constants/installScripts';

interface WindowsInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'compression' | 'pwa' | 'offline' | 'driver';
}

export const WindowsInstallModal: React.FC<WindowsInstallModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'compression'
}) => {
  const [activeTab, setActiveTab] = useState<'compression' | 'pwa' | 'offline' | 'driver'>(initialTab);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPwaInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (!installPromptEvent) {
      alert('Per installare l\'app in Microsoft Edge su Windows 11:\n1. Clicca sull\'icona "Installa" all\'estremità destra della barra degli indirizzi in alto.\n2. Oppure apri il menu (...) ➔ "App" ➔ "Installa questo sito come app".\n3. Spunta "Crea collegamento sul desktop" e conferma.');
      return;
    }
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setIsPwaInstalled(true);
      setInstallPromptEvent(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleDownloadTextFile = (content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 1500);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error('Error generating download blob', e);
    }
  };

  const handleDownloadZipPackage = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Script di avvio per Windows 11
      zip.file('AVVIA_APP.bat', AVVIA_APP_BAT_CONTENT);
      zip.file('Avvia-HydroPrint-Windows11.ps1', AVVIA_POWERSHELL_PS1_CONTENT);
      zip.file('GUIDA_INSTALLAZIONE_WINDOWS_11.md', GUIDA_WINDOWS_CONTENT);
      zip.file('RISOLUZIONE_COMPRESSIONE_220MM.md', RISOLUZIONE_COMPRESSIONE_220MM_CONTENT);

      // Informazioni di versione
      zip.file(
        'VERSIONE_WINDOWS_11.txt',
        `HydroPrint per Windows 11\nVersione: 4.1.0 (Windows 11 Edition)\nData rilascio: ${new Date().toLocaleDateString('it-IT')}\nSupporto formati: 219x87mm (Bypass) e 147.5x104mm (A6 Bypass)\nStampante target: Develop INEO3320 / Konica Minolta`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'hydro-mec-stampa-cartellini-windows11.zip');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 1500);
      setDownloadSuccess('hydro-mec-stampa-cartellini-windows11.zip');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Errore creazione zip in-memory', err);
      // Fallback
      handleDownloadTextFile(AVVIA_APP_BAT_CONTENT, 'AVVIA_APP.bat', 'application/x-bat');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">
                  HydroPrint • Guida & Risoluzione per Windows 11
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Solo Windows 11
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Risoluzione compressione cartellino 219mm, configurazione driver INEO3320 e avvio standalone
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2 overflow-x-auto scrollbar-none gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('compression')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === 'compression'
                ? 'bg-white text-rose-700 border-t-2 border-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>🔍 Problema Compressione 219 mm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4 text-blue-600" />
            <span>🚀 App Desktop Edge (PWA)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === 'offline'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>💻 Avvio Offline (.bat / PowerShell)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('driver')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === 'driver'
                ? 'bg-white text-amber-700 border-t-2 border-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>🖨️ Configurazione INEO3320</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>File <b>{downloadSuccess}</b> generato e scaricato sul tuo PC Windows 11!</span>
            </div>
          )}

          {/* TAB 1: RISOLUZIONE COMPRESSIONE 219 MM */}
          {activeTab === 'compression' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              {/* Highlight Box */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-950 text-sm mb-1">
                      Perché la Stampa da 219 mm Risulta Compressa a ~150 mm?
                    </h4>
                    <p className="text-rose-900 text-xs leading-relaxed">
                      La causa è la discordanza tra il formato <b>A6 (148 × 105 mm)</b> utilizzato per il cartellino blu e il formato <b>219 × 87 mm</b> del materiale in lavorazione. Quando Edge o Windows 11 mantengono l'impostazione "Adatta alla pagina" o il formato A6 memorizzato, il browser calcola il rapporto <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-rose-300">148 mm / 219 mm ≈ 67%</span> e schiaccia l'intera stampa nella larghezza di 150 mm!
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Schema Comparison */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Confronto Dimensionale dei Formati in Officina:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-1">
                    <span className="font-bold text-blue-900 flex items-center justify-between">
                      <span>1. Cartellino Blu (Controllare)</span>
                      <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[11px]">147.5 × 104 mm</span>
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      Coincide con il formato standard internazionale <b>A6 (148 × 105 mm)</b>. Per questo motivo il driver di Windows 11 lo stampa correttamente senza alcuna compressione.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-1">
                    <span className="font-bold text-amber-900 flex items-center justify-between">
                      <span>2. Cartellino Finito (Lavorazione)</span>
                      <span className="font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[11px]">219 × 87 mm</span>
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      È <b>71 mm più largo dell'A6</b>. Se stampato con impostazione A6, il driver o il browser riduce la larghezza da 219 a 148 mm, lasciando vuota la parte destra del foglio!
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps to Fix */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>I 3 Passaggi per Risolvere Definitivamente su Windows 11:</span>
                </h5>

                <div className="space-y-2.5">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Correzione Software Applicata nel Codice (Già Attiva)</span>
                    </div>
                    <p className="text-slate-600 text-xs pl-7">
                      Abbiamo integrato in questa versione l'iniezione dinamica della regola CSS <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">@page &#123; size: 219mm 87mm; margin: 0; &#125;</code>. Quando premi Stampa, Edge richiede esplicitamente a Windows 11 un foglio largo 219 mm invece di ereditare il vecchio formato A6.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>Impostazione Finestra di Stampa Microsoft Edge (Ctrl + P)</span>
                    </div>
                    <ul className="text-slate-600 text-xs pl-7 list-disc space-y-1">
                      <li><b>Scala:</b> Seleziona <b>100% (o Effettiva)</b>. <span className="text-rose-600 font-bold">NON selezionare mai "Adatta alla pagina" o "Adatta all'area stampabile"!</span></li>
                      <li><b>Margini:</b> Imposta su <b>Nessuno</b>.</li>
                      <li><b>Grafica di sfondo:</b> Lascia disattivata se stampi sopra i cartellini prestampati originali.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>Creazione Modulo Utente Personalizzato 219×87 mm in Windows 11</span>
                    </div>
                    <div className="text-slate-600 text-xs pl-7 space-y-1">
                      <p>
                        Per far sì che la stampante Develop INEO3320 non forzi il cassetto su A6:
                      </p>
                      <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                        <li>Premi <code className="bg-slate-100 px-1 font-bold">Win + R</code>, scrivi <code className="bg-slate-100 px-1 font-bold">control printers</code> e premi Invio.</li>
                        <li>Clicca in alto su <b>Proprietà server di stampa</b>.</li>
                        <li>Scheda <b>Moduli</b> ➔ Spunta <b>Crea un nuovo modulo</b> ➔ Nome: <code className="bg-slate-100 px-1 font-bold">Hydro-Mec 219x87</code>.</li>
                        <li>Imposta: Larghezza <b>21,90 cm</b>, Altezza <b>8,70 cm</b>, Margini <b>0,00 cm</b> ➔ Clicca <b>Salva modulo</b>.</li>
                        <li>Nelle Proprietà di stampa di INEO3320, seleziona questo formato per il <b>Cassetto Bypass</b>.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTextFile(RISOLUZIONE_COMPRESSIONE_220MM_CONTENT, 'RISOLUZIONE_COMPRESSIONE_220MM.md')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Scarica Guida Tecnica Completa (.md)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('offline')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Script & Pacchetto Windows 11</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PWA EDGE WINDOWS 11 */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <Laptop className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-950 text-sm mb-1">
                    Metodo Consigliato: Installazione Diretta con Microsoft Edge su Windows 11
                  </h4>
                  <p className="text-blue-900 text-xs leading-relaxed">
                    Nessun programma o runtime aggiuntivo richiesto. L'applicazione si installa con 1 clic direttamente in Microsoft Edge come programma desktop nativo di Windows 11, con la propria icona nella Barra delle Applicazioni e sul Desktop.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    {isPwaInstalled ? 'Applicazione già installata nel sistema!' : 'Installazione Istantanea:'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {isPwaInstalled
                      ? 'L\'app è già in esecuzione come finestra desktop standalone di Windows 11.'
                      : 'Clicca qui sotto per aggiungere HydroPrint alle app di Windows 11.'}
                  </span>
                </div>
                {!isPwaInstalled && (
                  <button
                    type="button"
                    onClick={handleInstallPwa}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors shrink-0 cursor-pointer text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Installa come App Windows 11</span>
                  </button>
                )}
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">W11</span>
                  <span>Istruzioni Visive per Microsoft Edge su Windows 11:</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-1 text-xs">
                  <li>In <b>Microsoft Edge</b>, guarda all'estremità destra della barra degli indirizzi in alto.</li>
                  <li>Clicca sull'icona <b>"App disponibile. Installa HydroPrint"</b> (icona a forma di monitor con freccia).</li>
                  <li>In alternativa, clicca sui tre puntini <b>(...)</b> in alto a destra ➔ <b>App</b> ➔ <b>Installa questo sito come app</b>.</li>
                  <li>Nella finestra di dialogo di Windows 11, spunta:
                    <ul className="list-disc pl-6 pt-1 space-y-0.5 text-slate-700 font-medium">
                      <li>☑ Crea collegamento sul desktop</li>
                      <li>☑ Aggiungi alla barra delle applicazioni</li>
                      <li>☑ Aggiungi a Start</li>
                    </ul>
                  </li>
                  <li>L'app si aprirà in una finestra desktop dedicata senza barre o schede, pronta all'uso!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: STANDALONE OFFLINE (.BAT / POWERSHELL) */}
          {activeTab === 'offline' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm mb-1">
                    Pacchetto Offline & Script per Windows 11
                  </h4>
                  <p className="text-emerald-900 text-xs leading-relaxed">
                    Per postazioni in officina che devono funzionare al 100% offline o su server locale LAN. Richiede solo Node.js LTS installato sul computer.
                  </p>
                </div>
              </div>

              {/* Download Package */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Scarica Pacchetto Completo Windows 11 (.zip)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Include script AVVIA_APP.bat, script PowerShell, guide e documentazione anti-compressione.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadZipPackage}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors shrink-0 cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Scarica Archivio ZIP Windows 11</span>
                </button>
              </div>

              {/* Single File Downloads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">AVVIA_APP.bat</span>
                    <span className="text-slate-500 text-[11px]">Script Batch doppio-clic per Windows 11</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadTextFile(AVVIA_APP_BAT_CONTENT, 'AVVIA_APP.bat', 'application/x-bat')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                    title="Scarica AVVIA_APP.bat"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Avvia-HydroPrint-Windows11.ps1</span>
                    <span className="text-slate-500 text-[11px]">Script PowerShell con creazione Desktop .lnk</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadTextFile(AVVIA_POWERSHELL_PS1_CONTENT, 'Avvia-HydroPrint-Windows11.ps1', 'text/plain')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                    title="Scarica script PowerShell"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Batch Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Contenuto dello script AVVIA_APP.bat:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(AVVIA_APP_BAT_CONTENT, 'bat')}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {copiedCmd === 'bat' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'bat' ? 'Copiato!' : 'Copia codice'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40 leading-relaxed">
                  {AVVIA_APP_BAT_CONTENT}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: CONFIGURAZIONE INEO3320 */}
          {activeTab === 'driver' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-950 text-sm mb-1 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-amber-700" />
                  Parametri Driver Develop INEO3320 in Windows 11
                </h4>
                <p className="text-amber-800 text-xs leading-relaxed">
                  Impostazioni consigliate per allineare millimetricamente le coordinate di stampa ai moduli cartacei prestampati Hydro-Mec nel cassetto Bypass.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Formato Carta (Cartellino 219 mm):</span>
                  <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded text-[11px]">Modulo 219 × 87 mm</span>
                  <p className="text-slate-500 text-[11px]">Creato in "Proprietà server di stampa" per evitare compressione</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Formato Carta (Cartellino Blu):</span>
                  <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded text-[11px]">A6 (105 × 148 mm)</span>
                  <p className="text-slate-500 text-[11px]">Standard internazionale per materiale da controllare</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Cassetto Carta / Sorgente:</span>
                  <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded text-[11px]">Vassoio Bypass (Manuale)</span>
                  <p className="text-slate-500 text-[11px]">Inserire i cartellini regolando con cura le guide di plastica</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Scala di Stampa del Browser:</span>
                  <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">100% (Effettiva)</span>
                  <p className="text-slate-500 text-[11px]">MAI "Adatta alla pagina" per mantenere le coordinate esatte</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 sm:col-span-2">
                  <span className="font-bold text-slate-800 block">Grafica di Sfondo:</span>
                  <p className="text-slate-600 text-[11px]">
                    - <b>Cartellino Prestampato (Uso Normale)</b>: lascia <u>disattivata</u> la grafica di sfondo per stampare soltanto l'inchiostro dei dati sopra il cartoncino.<br />
                    - <b>Fogli Bianchi o Etichette di Prova</b>: attiva il flag <i>"Includi sfondo cartellino nella stampa"</i> per riprodurre a colori l'intero modulo.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-slate-500 text-[11px]">
            Pacchetto e guide ottimizzati al 100% per Windows 11. Nessun componente Linux.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
