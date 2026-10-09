import React, { useState, useRef } from 'react';
import { Articolo } from '../types';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-react';

interface CsvImportModalProps {
  type: 'articoli' | 'lavoranti';
  isOpen: boolean;
  onClose: () => void;
  onImportArticoli: (items: Articolo[], mode: 'merge' | 'replace') => void;
  onImportLavoranti: (items: string[], mode: 'merge' | 'replace') => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  type,
  isOpen,
  onClose,
  onImportArticoli,
  onImportLavoranti
}) => {
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // CSV parsing function supporting comma, semicolon, tab, and quotes
  const parseCsv = (text: string) => {
    setErrorMsg(null);
    if (!text.trim()) {
      setPreviewData([]);
      return;
    }

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setPreviewData([]);
      return;
    }

    // Auto-detect delimiter from first non-empty row
    const firstLine = lines[0];
    let delimiter = ';';
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;

    if (tabCount > semicolonCount && tabCount > commaCount) {
      delimiter = '\t';
    } else if (commaCount > semicolonCount) {
      delimiter = ',';
    }

    const parsedRows = lines.map((line) => {
      // Split with handling for quoted values
      const parts: string[] = [];
      let cur = '';
      let insideQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === delimiter && !insideQuote) {
          parts.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      parts.push(cur.trim().replace(/^"|"$/g, ''));
      return parts;
    });

    if (type === 'articoli') {
      // Check if row 0 is a header
      let startIdx = 0;
      const h0 = parsedRows[0][0]?.toLowerCase() || '';
      if (h0.includes('cod') || h0.includes('art') || h0.includes('item') || h0.includes('code')) {
        startIdx = 1;
      }

      const articoliList: Articolo[] = [];
      for (let i = startIdx; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        const codice = row[0]?.trim();
        if (!codice) continue;
        const rev = row[1]?.trim() || 'Rev. 00';
        const descrizione = row[2]?.trim() || '';

        articoliList.push({
          id: `art_${Date.now()}_${i}`,
          codice,
          rev,
          descrizione
        });
      }

      if (articoliList.length === 0) {
        setErrorMsg('Nessun articolo valido trovato nel file. Controlla il formato.');
      }
      setPreviewData(articoliList);
    } else {
      // lavoranti
      let startIdx = 0;
      const h0 = parsedRows[0][0]?.toLowerCase() || '';
      if (h0.includes('lav') || h0.includes('nome') || h0.includes('worker') || h0.includes('fornitore') || h0.includes('terzista')) {
        startIdx = 1;
      }

      const lavorantiList: string[] = [];
      for (let i = startIdx; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        const nome = row[0]?.trim();
        if (nome && !lavorantiList.includes(nome)) {
          lavorantiList.push(nome);
        }
      }

      if (lavorantiList.length === 0) {
        setErrorMsg('Nessun lavorante valido trovato nel testo o file CSV.');
      }
      setPreviewData(lavorantiList);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      parseCsv(content);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    parseCsv(val);
  };

  const handleConfirmImport = () => {
    if (previewData.length === 0) {
      setErrorMsg('Nessun dato valido da importare.');
      return;
    }

    if (
      importMode === 'replace' &&
      !confirm(
        `Sostituire l'intero elenco con i ${previewData.length} ${type === 'articoli' ? 'articoli' : 'lavoranti'} del file?\n\n` +
          'Quelli che ci sono adesso verranno cancellati. Se non sei sicuro, annulla e fai prima un Backup.'
      )
    ) {
      return;
    }

    if (type === 'articoli') {
      onImportArticoli(previewData as Articolo[], importMode);
    } else {
      onImportLavoranti(previewData as string[], importMode);
    }
    onClose();
  };

  const downloadSampleCsv = () => {
    let sampleContent = '';
    let sampleFileName = '';

    if (type === 'articoli') {
      sampleFileName = 'template_articoli_hydro_mec.csv';
      sampleContent =
        'Codice;Revisione;Descrizione\n' +
        'ART-10023;Rev. 01;Albero per riduttore R1\n' +
        'FL-8890;Rev. 00;Flangia motore PAM 140\n' +
        'CORPO-GH-44;Rev. 02;Carcassa monoblocco ghisa\n' +
        'PIGNONE-Z12;Rev. 03;Pignone conico cementato\n';
    } else {
      sampleFileName = 'template_lavoranti_hydro_mec.csv';
      sampleContent =
        'Lavorante / Terzista\n' +
        'Mario Rossi - Tornitura\n' +
        'Officina Meccanica Alpha Srl\n' +
        'Reparto Fresatura Interno\n' +
        'Trattamenti Galvanici Nord\n' +
        'Rettifiche Meccaniche Spa\n';
    }

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', sampleFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Importa {type === 'articoli' ? 'Articoli e Revisioni' : 'Lavoranti'} da CSV
              </h2>
              <p className="text-xs text-slate-500">
                Carica un file .csv o incolla il testo da Excel (separatori: punto e virgola, virgola, tab)
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {fileName ? `File selezionato: ${fileName}` : 'Clicca per scegliere un file CSV dal computer'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Formati supportati: .csv, .txt</p>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Oppure incolla direttamente il testo CSV / Excel:
            </label>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Scarica modello CSV di esempio
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder={
              type === 'articoli'
                ? 'Codice;Revisione;Descrizione\nART-100;Rev. 01;Albero\nART-200;Rev. 02;Flangia'
                : 'Mario Rossi\nOfficina Meccanica Alpha\nReparto Fresatura'
            }
            rows={4}
            className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Import Mode: Merge vs Replace */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-700">Modalità di importazione:</span>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Aggiungi ai dati esistenti (Unisci)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Sostituisci anagrafica attuale</span>
              </label>
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Data Preview */}
          {previewData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Anteprima ({previewData.length} record identificati):
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto text-xs bg-slate-50">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-200 text-slate-700 sticky top-0 font-semibold text-left">
                    {type === 'articoli' ? (
                      <tr>
                        <th className="p-2 border-b border-slate-300">Codice Articolo</th>
                        <th className="p-2 border-b border-slate-300">Revisione</th>
                        <th className="p-2 border-b border-slate-300">Descrizione</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-2 border-b border-slate-300">Lavorante / Terzista</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {type === 'articoli'
                      ? (previewData as Articolo[]).slice(0, 50).map((art, idx) => (
                          <tr key={idx} className="border-b border-slate-200 hover:bg-white">
                            <td className="p-2 font-mono font-bold text-slate-900">{art.codice}</td>
                            <td className="p-2 text-slate-700">{art.rev}</td>
                            <td className="p-2 text-slate-500">{art.descrizione || '-'}</td>
                          </tr>
                        ))
                      : (previewData as string[]).slice(0, 50).map((lav, idx) => (
                          <tr key={idx} className="border-b border-slate-200 hover:bg-white">
                            <td className="p-2 font-medium text-slate-900">{lav}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 50 && (
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  Mostrati primi 50 di {previewData.length} record.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={previewData.length === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2 text-xs font-bold rounded-lg text-white transition-all shadow-xs ${
              previewData.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-blue-500/20'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            Conferma Importazione ({previewData.length})
          </button>
        </div>
      </div>
    </div>
  );
};
