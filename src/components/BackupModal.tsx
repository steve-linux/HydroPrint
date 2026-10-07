import React, { useState, useRef } from 'react';
import { Articolo, CartelliniPositions, AppSettings, FullBackupData } from '../types';
import { Download, Upload, ShieldCheck, FileJson, AlertCircle, CheckCircle, X, Copy, Check } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  articoli: Articolo[];
  lavoranti: string[];
  posizioni: CartelliniPositions;
  settings: AppSettings;
  onRestoreBackup: (backup: FullBackupData) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  articoli,
  lavoranti,
  posizioni,
  settings,
  onRestoreBackup
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importedJson, setImportedJson] = useState<FullBackupData | null>(null);
  const [rawText, setRawText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate current backup object
  const currentBackup: FullBackupData = {
    version: '2.0.0',
    appName: 'Hydro-Mec Stampa Cartellini',
    exportDate: new Date().toISOString(),
    articoli,
    lavoranti,
    posizioni,
    settings: {
      showBackground: settings.showBackground,
      backgroundOpacity: settings.backgroundOpacity,
      printWithBackground: settings.printWithBackground,
      showGridLines: settings.showGridLines
    }
  };

  const backupJsonString = JSON.stringify(currentBackup, null, 2);

  // Download JSON file
  const handleDownloadBackup = () => {
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `hydro-mec-backup-settaggi-${today}.json`;
    const blob = new Blob([backupJsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(backupJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse imported JSON
  const handleParseJson = (text: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const data = JSON.parse(text);
      if (!data.articoli || !Array.isArray(data.articoli)) {
        throw new Error('Il file di backup non contiene un elenco valido di articoli.');
      }
      if (!data.lavoranti || !Array.isArray(data.lavoranti)) {
        throw new Error('Il file di backup non contiene un elenco valido di lavoranti.');
      }
      if (!data.posizioni || typeof data.posizioni !== 'object') {
        throw new Error('Il file di backup non contiene la mappa di posizioni di calibrazione.');
      }

      setImportedJson(data as FullBackupData);
    } catch (err: any) {
      setImportedJson(null);
      setErrorMsg(err.message || 'Formato JSON non valido.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleParseJson(content);
    };
    reader.readAsText(file);
  };

  const handleApplyRestore = () => {
    if (!importedJson) return;
    onRestoreBackup(importedJson);
    setSuccessMsg('Configurazione, posizioni, articoli e lavoranti ripristinati con successo!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Backup e Trasferimento Settaggi (Cambio Browser / PC)
              </h2>
              <p className="text-xs text-slate-500">
                Esporta o importa l'intera configurazione (coordinate calibrazione mm, anagrafiche e opzioni)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            Esporta Configurazione (Crea Backup)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importa Configurazione (Ripristina su altro Browser)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <h4 className="text-xs font-bold text-indigo-900 mb-1">Cosa include questo salvataggio:</h4>
                <ul className="text-xs text-indigo-700 space-y-1 list-disc list-inside">
                  <li><b>{articoli.length}</b> Articoli con codici e numeri di revisione</li>
                  <li><b>{lavoranti.length}</b> Lavoranti e terzisti censiti</li>
                  <li>Tutte le <b>coordinate millimetriche calibrate</b> per entrambi i cartellini</li>
                  <li>Dimensioni font pt e parametri di stampa</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Scarica File di Backup (.json)
                </button>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiato!' : 'Copia Testo JSON'}</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Anteprima Contenuto Backup:
                </label>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg max-h-48 overflow-y-auto">
                  {backupJsonString}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-indigo-50/50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <FileJson className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  Carica il file .json scaricato dall'altro browser
                </p>
                <p className="text-xs text-slate-500 mt-1">Clicca per selezionare il file salvato</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Oppure incolla il codice JSON del backup:
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    handleParseJson(e.target.value);
                  }}
                  placeholder='{"version": "2.0.0", "articoli": [...], "posizioni": {...}}'
                  rows={4}
                  className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {importedJson && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    File di backup valido verificato!
                  </h4>
                  <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                    <li>Data salvataggio: {new Date(importedJson.exportDate).toLocaleString('it-IT')}</li>
                    <li>Articoli da ripristinare: <b>{importedJson.articoli?.length || 0}</b></li>
                    <li>Lavoranti da ripristinare: <b>{importedJson.lavoranti?.length || 0}</b></li>
                    <li>Calibrazioni posizioni: <b>Presenti per Cartellino Controllare & Versare</b></li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Chiudi
          </button>
          {activeTab === 'import' && (
            <button
              type="button"
              disabled={!importedJson}
              onClick={handleApplyRestore}
              className={`px-5 py-2 text-xs font-bold rounded-lg text-white transition-all shadow-xs ${
                importedJson
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-emerald-500/20'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              Ripristina Configurazione nel Browser
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
