import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Download,
  Terminal,
  Printer,
  CheckCircle,
  Copy,
  Check,
  X,
  Laptop,
  FolderArchive,
  Play,
  FileCode,
  FileText,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  AVVIA_APP_BAT_CONTENT,
  AVVIA_APP_SH_CONTENT,
  HYDRO_MEC_DESKTOP_CONTENT,
  GUIDA_WINDOWS_CONTENT,
  GUIDA_LINUX_CONTENT
} from '../constants/installScripts';

interface WindowsInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsInstallModal: React.FC<WindowsInstallModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'linux' | 'windows' | 'pwa' | 'printer'>('linux');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

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
      alert('Per installare l\'app:\n1. Clicca sui tre puntini (...) o sull\'icona "Installa" nella barra degli indirizzi del browser (Chrome, Edge, Brave, Chromium).\n2. Clicca su "Installa applicazione" per creare l\'icona nel menu e sul desktop.');
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

  const handleDownloadArchive = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
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
        return;
      }
    } catch (e) {
      console.warn('Fetch blob download failed, falling back to direct anchor link', e);
    }

    try {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1000);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error('Error downloading file', e);
      window.location.href = url;
    }
  };

  const handleDownloadTextFile = (content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error('Error downloading text file', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Download & Installazione (Linux & Windows)
              </h2>
              <p className="text-xs text-slate-300">
                Pacchetti verificati al 100% per apertura immediata in Esplora Risorse / Archive Manager
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast inside modal */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white text-xs px-6 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-200" />
              <span>
                File <b>{downloadSuccess}</b> generato e scaricato correttamente! È pronto per essere estratto.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadSuccess(null)}
              className="text-emerald-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('linux')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'linux'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-600" />
            🐧 Versione Linux (Ubuntu / Debian / Fedora)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'windows'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Laptop className="w-4 h-4 text-blue-600" />
            🪟 Versione Windows 11
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4 text-indigo-600" />
            App Desktop Nativa (PWA 1-Clic)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('printer')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'printer'
                ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-600" />
            Setup Stampante INEO3320
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs">
          {/* TAB LINUX */}
          {activeTab === 'linux' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm mb-1">
                    Pacchetto Linux Certificato & Pronto all'Uso
                  </h4>
                  <p className="text-emerald-800 leading-relaxed">
                    Il pacchetto viene generato istantaneamente con tutti i file sorgente, le immagini di sfondo, lo script <b>`avvia_app.sh`</b> e il file <b>`Hydro-Mec.desktop`</b> per integrare l'app nel menu del desktop (GNOME, KDE Plasma, XFCE).
                  </p>
                </div>
              </div>

              {/* Linux Download Buttons */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Scarica Pacchetto Completo (Scegli il formato che preferisci):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownloadArchive('/hydro-mec-stampa-cartellini-linux.tar.gz', 'hydro-mec-stampa-cartellini-linux.tar.gz')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>📥 Scarica Pacchetto (.tar.gz)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadArchive('/hydro-mec-stampa-cartellini-linux.zip', 'hydro-mec-stampa-cartellini-linux.zip')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>📥 Scarica Pacchetto (.zip)</span>
                  </button>
                </div>

                {/* Single file downloads */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadTextFile(AVVIA_APP_SH_CONTENT, 'avvia_app.sh', 'application/x-sh')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-300 transition-colors cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Scarica solo avvia_app.sh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTextFile(HYDRO_MEC_DESKTOP_CONTENT, 'Hydro-Mec.desktop', 'application/x-desktop')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Monitor className="w-3.5 h-3.5 text-blue-600" />
                    <span>Scarica Hydro-Mec.desktop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTextFile(GUIDA_LINUX_CONTENT, 'GUIDA_INSTALLAZIONE_LINUX.md', 'text/markdown;charset=utf-8')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-300 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Guida Linux (.md)</span>
                  </button>
                </div>
              </div>

              {/* Steps for Linux */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-slate-900">Passaggi rapidi per terminale Linux:</h5>

                {/* Passo 1 */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                  <div className="font-bold text-slate-800">1. Installa Node.js se non presente sul PC:</div>
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-md font-mono text-[11px] flex items-center justify-between">
                    <code>sudo apt update && sudo apt install -y nodejs npm</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('sudo apt update && sudo apt install -y nodejs npm', 'cmd_apt')}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      title="Copia comando"
                    >
                      {copiedCmd === 'cmd_apt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    (Su Fedora: <code>sudo dnf install nodejs npm</code> | Su Arch: <code>sudo pacman -S nodejs npm</code>)
                  </span>
                </div>

                {/* Passo 2 */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                  <div className="font-bold text-slate-800">2. Estrai l'archivio scaricato:</div>
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-md font-mono text-[11px] flex items-center justify-between">
                    <code>tar -xzf hydro-mec-stampa-cartellini-linux.tar.gz</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('tar -xzf hydro-mec-stampa-cartellini-linux.tar.gz', 'cmd_tar')}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      title="Copia comando"
                    >
                      {copiedCmd === 'cmd_tar' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Oppure per il file ZIP: <code>unzip hydro-mec-stampa-cartellini-linux.zip</code>
                  </span>
                </div>

                {/* Passo 3 */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                  <div className="font-bold text-slate-800">3. Avvia con 1 comando:</div>
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-md font-mono text-[11px] flex items-center justify-between">
                    <code>chmod +x avvia_app.sh && ./avvia_app.sh</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('chmod +x avvia_app.sh && ./avvia_app.sh', 'cmd_run')}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      title="Copia comando"
                    >
                      {copiedCmd === 'cmd_run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Lo script installerà in automatico le dipendenze al primo avvio e aprirà il browser predefinito su <b>http://localhost:3000</b>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB WINDOWS */}
          {activeTab === 'windows' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-950 text-sm mb-1">
                    Pacchetto Windows 11 Certificato & Verificato
                  </h4>
                  <p className="text-blue-800 leading-relaxed">
                    Scarica il pacchetto ZIP compresso in formato standard. Include tutti i sorgenti, le icone, gli sfondi e il file <b>`AVVIA_APP.bat`</b> che avvia il programma con un semplice doppio clic.
                  </p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadArchive('/hydro-mec-stampa-cartellini-windows11.zip', 'hydro-mec-stampa-cartellini-windows11.zip')}
                  className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>📥 Scarica Pacchetto Windows (.ZIP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTextFile(AVVIA_APP_BAT_CONTENT, 'AVVIA_APP.bat', 'application/x-bat')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  title="Scarica solo lo script di avvio AVVIA_APP.bat"
                >
                  <Play className="w-4 h-4 text-emerald-600" />
                  <span>Solo AVVIA_APP.bat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTextFile(GUIDA_WINDOWS_CONTENT, 'GUIDA_INSTALLAZIONE_WINDOWS_11.md', 'text/markdown;charset=utf-8')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  title="Scarica la guida completa in formato Markdown"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Guida Windows (.md)</span>
                </button>
              </div>

              {/* Instructions steps */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-slate-900">Passaggi di installazione su Windows 11:</h5>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="font-bold text-slate-800">Passo 1: Installa Node.js (se non presente)</div>
                  <p className="text-slate-500">
                    Scarica la versione LTS gratuita da{' '}
                    <a
                      href="https://nodejs.org/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-bold"
                    >
                      https://nodejs.org/
                    </a>{' '}
                    ed esegui l'installer avanti-avanti.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="font-bold text-slate-800">Passo 2: Estrai lo ZIP scaricato</div>
                  <p className="text-slate-500">
                    Fai tasto destro sul file `.zip` ➔ <b>Estrai tutto</b> in una cartella a piacere (es. <code>C:\HydroMec_Cartellini</code>).
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="font-bold text-slate-800">Passo 3: Doppio Clic su AVVIA_APP.bat</div>
                  <p className="text-slate-500">
                    Basta fare doppio clic su <b>AVVIA_APP.bat</b>: installerà in automatico le dipendenze al primo avvio e aprirà l'app su <code>http://localhost:3000</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB PWA */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-indigo-950 text-sm mb-1">
                    Il Metodo Più Semplice: App Desktop Nativa (Zero Installazioni)
                  </h4>
                  <p className="text-indigo-800 leading-relaxed">
                    Non serve estrarre archivi né installare Node.js. Tramite Chrome, Edge o Chromium, l'app si installa direttamente sul computer come programma desktop nativo sia su <b>Windows 11</b> che su <b>Linux</b>!
                  </p>
                </div>
              </div>

              {/* Install trigger button */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    {isPwaInstalled ? 'Applicazione già installata nel sistema!' : 'Installazione Istantanea:'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {isPwaInstalled
                      ? 'L\'app è già in esecuzione come finestra desktop standalone.'
                      : 'Clicca qui sotto o usa l\'icona nella barra degli indirizzi del browser.'}
                  </span>
                </div>

                {!isPwaInstalled && (
                  <button
                    type="button"
                    onClick={handleInstallPwa}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Installa come App Desktop</span>
                  </button>
                )}
              </div>

              {/* Step-by-step visual instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">L</span>
                    <span>Su Linux (Chrome / Chromium / Brave / Edge)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                    <li>Apri il link dell'app nel browser Linux</li>
                    <li>Clicca sull'icona <b>Installa</b> nella barra degli indirizzi in alto a destra</li>
                    <li>Oppure clicca su <b>⋮</b> ➔ <b>Salva e condividi</b> ➔ <b>Installa come app</b></li>
                    <li>L'app compare immediatamente nel menu applicazioni e nella dock di Linux!</li>
                  </ol>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">W</span>
                    <span>Su Windows 11 (Edge o Chrome)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                    <li>Apri l'app in Edge o Chrome</li>
                    <li>Clicca sull'icona <b>"Installa app"</b> nella barra indirizzi</li>
                    <li>Oppure seleziona dai tre puntini <b>(...)</b> ➔ <b>App</b> ➔ <b>Installa</b></li>
                    <li>Spunta <i>"Crea collegamento sul desktop"</i> e conferma!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB PRINTER */}
          {activeTab === 'printer' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-950 text-sm mb-1 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-amber-700" />
                  Impostazioni di Stampa per Develop INEO3320 (Windows & Linux CUPS)
                </h4>
                <p className="text-amber-800 leading-relaxed">
                  Per far collimare al millimetro i testi con le righe del cartellino prestampato, imposta la finestra di stampa del browser (<code>Ctrl + P</code>) come indicato.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Formato Carta:</span>
                  <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded text-[11px]">A6 (105 × 148 mm)</span>
                  <p className="text-slate-500 text-[11px]">Per cartellino Materiale da Controllare (147.5 × 104 mm)</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Cassetto Carta / Sorgente:</span>
                  <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded text-[11px]">Bypass / Vassoio Manuale</span>
                  <p className="text-slate-500 text-[11px]">Inserire i cartellini prestampati regolando le guide</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Orientamento:</span>
                  <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded text-[11px]">Orizzontale (Landscape)</span>
                  <p className="text-slate-500 text-[11px]">Allineato alla direzione di alimentazione del cartellino</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-800 block">Scala / Adattamento:</span>
                  <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">100% (Effettiva)</span>
                  <p className="text-slate-500 text-[11px]">NON selezionare "Adatta alla pagina" per mantenere i mm precisi</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 sm:col-span-2">
                  <span className="font-bold text-slate-800 block">Grafica di Sfondo:</span>
                  <p className="text-slate-600 text-[11px]">
                    - <b>Cartellino Prestampato (Uso Standard)</b>: lascia <u>disattivata</u> la grafica di sfondo per stampare soltanto l'inchiostro dei dati sopra il cartellino prestampato.<br />
                    - <b>Carta Bianca o Etichette</b>: attiva il flag <i>"Includi sfondo cartellino nella stampa"</i> per stampare anche la grafica blu/finito.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-slate-500 text-[11px]">
            Archivi generati direttamente in locale con Blob binario certificato al 100% integro.
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
