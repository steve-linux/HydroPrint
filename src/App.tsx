import React, { useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { missingRequired, refreshAutoDate, todayIso } from './lib/cartellino';
import { formBarcodeWarnings } from './lib/barcode';
import {
  CartellinoType,
  FieldCalibration,
  CartellinoFormData,
  Articolo,
  AppSettings,
  CartelliniPositions,
  FullBackupData
} from './types';
import {
  DEFAULT_POSIZIONI,
  DEFAULT_ARTICOLI,
  DEFAULT_LAVORANTI,
  STORAGE_KEYS,
  TAG_DIMENSIONS
} from './constants/defaultPositions';
import { StampaTab } from './components/StampaTab';
import { CalibrationTab } from './components/CalibrationTab';
import { ArticoliTab } from './components/ArticoliTab';
import { LavorantiTab } from './components/LavorantiTab';
import { CsvImportModal } from './components/CsvImportModal';
import { BackupModal } from './components/BackupModal';
import { WindowsInstallModal } from './components/WindowsInstallModal';
import { PrintDocument } from './components/PrintDocument';
import {
  Printer,
  Target,
  Package,
  Users,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Info,
  Laptop,
  Download,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // 1. Dati Anagrafici Articoli
  const [articoli, setArticoli] = useState<Articolo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARTICOLI);
      if (saved) return JSON.parse(saved);
      // Legacy migration check
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_ARTICOLI);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        return parsedLegacy.map((item: any, idx: number) => ({
          id: `art_mig_${idx}`,
          codice: item.codice || item.code || '',
          rev: item.rev || 'Rev. 00',
          descrizione: item.descrizione || ''
        }));
      }
    } catch (e) {
      console.error('Error loading articoli from storage', e);
    }
    return DEFAULT_ARTICOLI;
  });

  // 2. Dati Lavoranti
  const [lavoranti, setLavoranti] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAVORANTI);
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_LAVORANTI);
      if (legacy) return JSON.parse(legacy);
    } catch (e) {
      console.error('Error loading lavoranti from storage', e);
    }
    return DEFAULT_LAVORANTI;
  });

  // 3. Posizioni Calibrazione (in mm e pt)
  const [posizioni, setPosizioni] = useState<CartelliniPositions>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSIZIONI);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.versare && parsed.versare.info) {
          delete parsed.versare.info;
        }
        const mergedControllare = { ...DEFAULT_POSIZIONI.controllare, ...(parsed.controllare || {}) };
        if (!mergedControllare.revisione) {
          mergedControllare.revisione = DEFAULT_POSIZIONI.controllare.revisione;
        }
        const mergedVersare = { ...DEFAULT_POSIZIONI.versare, ...(parsed.versare || {}) };
        if (!mergedVersare.revisione) {
          mergedVersare.revisione = DEFAULT_POSIZIONI.versare.revisione;
        }
        return {
          controllare: mergedControllare,
          versare: mergedVersare
        };
      }
      const legacy =
        localStorage.getItem(STORAGE_KEYS.LEGACY_POSIZIONI) ||
        localStorage.getItem('hm_posizioni_v3') ||
        localStorage.getItem('hm_posizioni_v2') ||
        localStorage.getItem('hm_posizioni');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed.versare && parsed.versare.info) {
          delete parsed.versare.info;
        }
        const mergedControllare = { ...DEFAULT_POSIZIONI.controllare, ...(parsed.controllare || {}) };
        if (!mergedControllare.revisione) {
          mergedControllare.revisione = DEFAULT_POSIZIONI.controllare.revisione;
        }
        const mergedVersare = { ...DEFAULT_POSIZIONI.versare, ...(parsed.versare || {}) };
        if (!mergedVersare.revisione) {
          mergedVersare.revisione = DEFAULT_POSIZIONI.versare.revisione;
        }
        return {
          controllare: mergedControllare,
          versare: mergedVersare
        };
      }
    } catch (e) {
      console.error('Error loading posizioni from storage', e);
    }
    return DEFAULT_POSIZIONI;
  });

  // 4. Settaggi Applicazione (blocco, sfondo, opacità, stampa)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings from storage', e);
    }
    return {
      isLocked: false,
      showBackground: true,
      backgroundOpacity: 95,
      printWithBackground: false,
      printBorder: true,
      zoomLevel: 100,
      showGridLines: false
    };
  });

  // 5. Form di compilazione cartellino
  // La data compilata in automatico segue il giorno corrente finché l'operatore non la cambia a mano.
  const autoDateRef = useRef(todayIso());
  const [formData, setFormData] = useState<CartellinoFormData>(() => {
    return {
      tipo: 'versare',
      codiceArticolo: '',
      revisione: '',
      numeroLancio: '',
      numeroPezzi: '',
      lavorante: '',
      data: autoDateRef.current,
      collo: '1/1',
      colloNumero: '1',
      colloTotale: '1',
      noteLibere: '',
      showBarcodeArticolo: true,
      showBarcodeLancio: true
    };
  });

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Porta avanti la data automatica (app lasciata aperta da un giorno all'altro).
  // Restituisce la data aggiornata, che il chiamante può usare subito.
  const refreshDate = useCallback((): string => {
    const current = formDataRef.current.data;
    const { data, autoValue } = refreshAutoDate(current, autoDateRef.current, todayIso());
    autoDateRef.current = autoValue;
    if (data !== current) setFormData((prev) => ({ ...prev, data }));
    return data;
  }, []);

  useEffect(() => {
    const onActive = () => refreshDate();
    window.addEventListener('focus', onActive);
    document.addEventListener('visibilitychange', onActive);
    return () => {
      window.removeEventListener('focus', onActive);
      document.removeEventListener('visibilitychange', onActive);
    };
  }, [refreshDate]);

  // Stampa di prova: dati di esempio solo quando chiesti esplicitamente.
  const [testPrint, setTestPrint] = useState(false);

  // Tab di navigazione
  const [activeTab, setActiveTab] = useState<'stampa' | 'calibrazione' | 'articoli' | 'lavoranti'>('stampa');
  const [selectedCalibFieldId, setSelectedCalibFieldId] = useState<string | null>(null);

  // Modali
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvModalType, setCsvModalType] = useState<'articoli' | 'lavoranti'>('articoli');
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [windowsInstallModalOpen, setWindowsInstallModalOpen] = useState(false);
  const [windowsModalTab, setWindowsModalTab] = useState<'compression' | 'pwa' | 'offline' | 'driver'>('compression');

  // Toast Notifica
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sincronizzazione persistente LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICOLI, JSON.stringify(articoli));
      localStorage.setItem(STORAGE_KEYS.LEGACY_ARTICOLI, JSON.stringify(articoli));
    } catch (e) {
      console.error('Failed to save articoli', e);
    }
  }, [articoli]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAVORANTI, JSON.stringify(lavoranti));
      localStorage.setItem(STORAGE_KEYS.LEGACY_LAVORANTI, JSON.stringify(lavoranti));
    } catch (e) {
      console.error('Failed to save lavoranti', e);
    }
  }, [lavoranti]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSIZIONI, JSON.stringify(posizioni));
      localStorage.setItem(STORAGE_KEYS.LEGACY_POSIZIONI, JSON.stringify(posizioni));
    } catch (e) {
      console.error('Failed to save posizioni', e);
    }
  }, [posizioni]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Aggiornamento singolo parametro posizione di calibrazione (top, left, fontSize, heightMm, maxWidth)
  const handleUpdatePosition = useCallback(
    (tipo: CartellinoType, fieldId: string, param: 'top' | 'left' | 'fontSize' | 'heightMm' | 'maxWidth', value: number) => {
      setPosizioni((prev) => {
        const tagMap = prev[tipo] as Record<string, FieldCalibration>;
        if (!tagMap[fieldId]) return prev;
        return {
          ...prev,
          [tipo]: {
            ...tagMap,
            [fieldId]: {
              ...tagMap[fieldId],
              [param]: value
            }
          }
        };
      });
    },
    []
  );

  // Ripristino valori di default
  const handleResetDefaults = (tipo: CartellinoType) => {
    if (confirm(`Ripristinare le posizioni predefinite di fabbrica per "${TAG_DIMENSIONS[tipo].name}"?`)) {
      setPosizioni((prev) => ({
        ...prev,
        [tipo]: JSON.parse(JSON.stringify(DEFAULT_POSIZIONI[tipo]))
      }));
      showToast('Posizioni di fabbrica ripristinate.', 'info');
    }
  };

  const handleSavePositions = () => {
    showToast('Posizioni e coordinate salvate nel browser!');
  };

  // Blocco / sblocco calibrazione
  const handleToggleLock = () => {
    setSettings((prev) => {
      const nextLocked = !prev.isLocked;
      showToast(
        nextLocked
          ? '🔒 Posizioni BLOCCATE: protette da modifiche e trascinamenti accidentali.'
          : '🔓 Posizioni SBLOCCATE: puoi spostare le scritte con Drag & Drop!',
        nextLocked ? 'info' : 'success'
      );
      return {
        ...prev,
        isLocked: nextLocked
      };
    });
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Caricamento scansione personalizzata da file
  const handleCustomBgFile = (tipo: CartellinoType, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSettings((prev) => ({
        ...prev,
        customBgImages: {
          ...prev.customBgImages,
          [tipo]: dataUrl
        }
      }));
      showToast(`Immagine scansione caricata per ${tipo}!`);
    };
    reader.readAsDataURL(file);
  };

  // Import CSV Articoli
  const handleImportArticoli = (imported: Articolo[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setArticoli(imported);
    } else {
      // Merge skipping duplicates by code
      setArticoli((prev) => {
        const existingCodes = new Set(prev.map((a) => a.codice.toLowerCase()));
        const toAdd = imported.filter((a) => !existingCodes.has(a.codice.toLowerCase()));
        return [...prev, ...toAdd];
      });
    }
    showToast(`Importati ${imported.length} articoli con successo!`);
  };

  // Import CSV Lavoranti
  const handleImportLavoranti = (imported: string[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setLavoranti(imported);
    } else {
      setLavoranti((prev) => {
        const existingLower = new Set(prev.map((l) => l.toLowerCase()));
        const toAdd = imported.filter((l) => !existingLower.has(l.toLowerCase()));
        return [...prev, ...toAdd];
      });
    }
    showToast(`Importati ${imported.length} lavoranti con successo!`);
  };

  // Ripristino completo backup da altro browser / file JSON
  const handleRestoreBackup = (backup: FullBackupData) => {
    if (backup.articoli) setArticoli(backup.articoli);
    if (backup.lavoranti) setLavoranti(backup.lavoranti);
    if (backup.posizioni) {
      const versarePos = { ...DEFAULT_POSIZIONI.versare, ...(backup.posizioni.versare || {}) };
      delete (versarePos as any).info;
      setPosizioni({
        controllare: { ...DEFAULT_POSIZIONI.controllare, ...(backup.posizioni.controllare || {}) },
        versare: versarePos
      });
    }
    if (backup.settings) {
      setSettings((prev) => ({
        ...prev,
        ...backup.settings
      }));
    }
    showToast('Ripristino completo effettuato con successo!');
  };

  // Esecuzione stampa.
  // Stampa vera: prima di sprecare un cartellino prestampato si avvisa se mancano dati o se un barcode
  // non sarebbe leggibile. Stampa di prova: dati di esempio, per controllare l'allineamento.
  const handlePrint = (test = false) => {
    if (!test) {
      const missing = missingRequired(formData);
      const problems = [
        ...(missing.length ? [`Campi obbligatori vuoti: ${missing.join(', ')}.`] : []),
        ...formBarcodeWarnings(formData, posizioni[formData.tipo])
      ];
      if (problems.length && !confirm(`${problems.join('\n\n')}\n\nStampare comunque?`)) return;
    }

    // La pagina deve essere già aggiornata (data e dati di prova) quando parte window.print().
    flushSync(() => {
      refreshDate();
      setTestPrint(test);
    });
    if (test) {
      window.addEventListener('afterprint', () => setTestPrint(false), { once: true });
    }
    window.print();
  };

  return (
    <>
      {/* Interfaccia a Schermo (completamente nascosta durante la stampa) */}
      <div className="screen-interface min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main App Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md no-print sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl flex items-center justify-center shadow-md">
              <span className="font-black text-sm tracking-wider">HM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  HYDRO•MEC
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Cartellini Prestampati
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Stampa per Windows 11 • INEO3320 (Bypass 220×87 e 147.5×104 mm)
              </p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2">
            {/* Quick Lock Toggle in Header */}
            <button
              type="button"
              onClick={handleToggleLock}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                settings.isLocked
                  ? 'bg-emerald-700/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-700/50'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 ring-1 ring-amber-400/50'
              }`}
              title="Blocca o sblocca lo spostamento dei testi con Drag & Drop"
            >
              {settings.isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Posizioni Bloccate</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Drag & Drop Attivo</span>
                </>
              )}
            </button>

            {/* Quick Fix Button for 220mm format */}
            <button
              type="button"
              onClick={() => {
                setWindowsModalTab('compression');
                setWindowsInstallModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Diagnostica e risoluzione per cartellino 220 mm compresso su 150 mm"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="hidden sm:inline">Risolvi 220 mm</span>
              <span className="sm:hidden">220 mm</span>
            </button>

            {/* Windows 11 Desktop / Download Code Button */}
            <button
              type="button"
              onClick={() => {
                setWindowsModalTab('pwa');
                setWindowsInstallModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Guida Windows 11, installazione come app desktop in Edge e script di avvio"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guida Windows 11</span>
              <span className="sm:hidden">Win 11</span>
            </button>

            {/* Backup / Restore Button for Cross-browser transfer */}
            <button
              type="button"
              onClick={() => setBackupModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Esporta o importa l'intera configurazione per cambiare browser o PC"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup / Ripristino</span>
              <span className="sm:hidden">Backup</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex overflow-x-auto border-t border-slate-800 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('stampa')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'stampa'
                ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Stampa Cartellini</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('calibrazione');
              // Sincronizza tipo form se necessario
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'calibrazione'
                ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>🎯 Calibrazione Posizioni</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('articoli')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'articoli'
                ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Anagrafica Articoli & Rev ({articoli.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lavoranti')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'lavoranti'
                ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Anagrafica Lavoranti ({lavoranti.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'stampa' && (
          <StampaTab
            formData={formData}
            onChangeFormData={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
            articoli={articoli}
            lavoranti={lavoranti}
            positions={posizioni[formData.tipo]}
            settings={settings}
            onUpdatePosition={handleUpdatePosition}
            onToggleLock={handleToggleLock}
            onUpdateSettings={handleUpdateSettings}
            onPrint={() => handlePrint(false)}
            onTestPrint={() => handlePrint(true)}
            barcodeWarnings={formBarcodeWarnings(formData, posizioni[formData.tipo])}
            onOpenWindowsGuide={(tab) => {
              setWindowsModalTab(tab || 'compression');
              setWindowsInstallModalOpen(true);
            }}
          />
        )}

        {activeTab === 'calibrazione' && (
          <CalibrationTab
            selectedTipo={formData.tipo}
            onChangeTipo={(tipo) => setFormData((prev) => ({ ...prev, tipo }))}
            positions={posizioni[formData.tipo]}
            allPositions={posizioni}
            formData={formData}
            settings={settings}
            onUpdatePosition={handleUpdatePosition}
            onResetDefaults={handleResetDefaults}
            onSavePositions={handleSavePositions}
            onToggleLock={handleToggleLock}
            onUpdateSettings={handleUpdateSettings}
            selectedFieldId={selectedCalibFieldId}
            onSelectField={setSelectedCalibFieldId}
            customBgFileHandler={handleCustomBgFile}
            onChangeFormData={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
          />
        )}

        {activeTab === 'articoli' && (
          <ArticoliTab
            articoli={articoli}
            onAddArticolo={(item) =>
              setArticoli((prev) => [{ ...item, id: `art_${Date.now()}` }, ...prev])
            }
            onUpdateArticolo={(id, updated) =>
              setArticoli((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)))
            }
            onDeleteArticolo={(id) => setArticoli((prev) => prev.filter((a) => a.id !== id))}
            onOpenCsvModal={() => {
              setCsvModalType('articoli');
              setCsvModalOpen(true);
            }}
          />
        )}

        {activeTab === 'lavoranti' && (
          <LavorantiTab
            lavoranti={lavoranti}
            onAddLavorante={(nome) => setLavoranti((prev) => [nome, ...prev])}
            onUpdateLavorante={(idx, newName) =>
              setLavoranti((prev) => prev.map((l, i) => (i === idx ? newName : l)))
            }
            onDeleteLavorante={(idx) => setLavoranti((prev) => prev.filter((_, i) => i !== idx))}
            onOpenCsvModal={() => {
              setCsvModalType('lavoranti');
              setCsvModalOpen(true);
            }}
          />
        )}
      </main>

      {/* CSV Import Modal: montata solo quando è aperta, così ogni apertura riparte da zero
          (prima restavano anteprima e modalità "Sostituisci" dell'importazione precedente) */}
      {csvModalOpen && (
        <CsvImportModal
          key={csvModalType}
          type={csvModalType}
          isOpen={csvModalOpen}
          onClose={() => setCsvModalOpen(false)}
          onImportArticoli={handleImportArticoli}
          onImportLavoranti={handleImportLavoranti}
        />
      )}

      {/* Backup and Cross-Browser Settings Modal */}
      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        articoli={articoli}
        lavoranti={lavoranti}
        posizioni={posizioni}
        settings={settings}
        onRestoreBackup={handleRestoreBackup}
      />

      {/* Windows 11 Install Modal */}
      <WindowsInstallModal
        isOpen={windowsInstallModalOpen}
        onClose={() => setWindowsInstallModalOpen(false)}
        initialTab={windowsModalTab}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        HydroPrint • Ottimizzato per Windows 11 & stampante Develop INEO3320 (Bypass: 220×87 mm e 147.5×104 mm) • Dati salvati localmente nel browser.
      </footer>
    </div>

    {/* Documento di Stampa Dedicato (Visibile esclusivamente in anteprima e invio stampa) */}
    <PrintDocument
      tipo={formData.tipo}
      positions={posizioni[formData.tipo]}
      formData={formData}
      settings={settings}
      testPrint={testPrint}
    />
  </>
  );
}
