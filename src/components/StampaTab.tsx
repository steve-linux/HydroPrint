import React, { useState, useRef, useEffect } from 'react';
import {
  CartellinoType,
  FieldCalibration,
  CartellinoFormData,
  Articolo,
  AppSettings
} from '../types';
import { TAG_DIMENSIONS } from '../constants/defaultPositions';
import { InteractiveCardPreview } from './InteractiveCardPreview';
import {
  Printer,
  Calendar,
  Hash,
  Layers,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Barcode,
  Search,
  ChevronDown,
  X
} from 'lucide-react';

interface StampaTabProps {
  formData: CartellinoFormData;
  onChangeFormData: (updated: Partial<CartellinoFormData>) => void;
  articoli: Articolo[];
  lavoranti: string[];
  positions: Record<string, FieldCalibration>;
  settings: AppSettings;
  onUpdatePosition: (tipo: CartellinoType, fieldId: string, param: 'top' | 'left' | 'fontSize', value: number) => void;
  onToggleLock: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onPrint: () => void;
  barcodeWarnings: string[];
  onOpenWindowsGuide?: (tab?: 'compression' | 'pwa' | 'offline' | 'driver') => void;
}

export const StampaTab: React.FC<StampaTabProps> = ({
  formData,
  onChangeFormData,
  articoli,
  lavoranti,
  positions,
  settings,
  onUpdatePosition,
  onToggleLock,
  onUpdateSettings,
  onPrint,
  barcodeWarnings,
  onOpenWindowsGuide
}) => {
  const currentDim = TAG_DIMENSIONS[formData.tipo];

  // Searchable dropdown state
  const [isArticoloOpen, setIsArticoloOpen] = useState(false);
  const [isLavoranteOpen, setIsLavoranteOpen] = useState(false);
  const [searchArticoloQuery, setSearchArticoloQuery] = useState('');
  const [searchLavoranteQuery, setSearchLavoranteQuery] = useState('');
  const [highlightedArticoloIdx, setHighlightedArticoloIdx] = useState(-1);
  const [highlightedLavoranteIdx, setHighlightedLavoranteIdx] = useState(-1);
  // Modal per simulazione e test stampa a video
  const [simulazioneModalOpen, setSimulazioneModalOpen] = useState(false);
  const articoloContainerRef = useRef<HTMLDivElement>(null);
  const lavoranteContainerRef = useRef<HTMLDivElement>(null);
  const articoloListRef = useRef<HTMLDivElement>(null);
  const lavoranteListRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (articoloContainerRef.current && !articoloContainerRef.current.contains(e.target as Node)) {
        setIsArticoloOpen(false);
        setHighlightedArticoloIdx(-1);
      }
      if (lavoranteContainerRef.current && !lavoranteContainerRef.current.contains(e.target as Node)) {
        setIsLavoranteOpen(false);
        setHighlightedLavoranteIdx(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered lists (based on typed search query, preserving list while arrow keys navigate)
  const filteredArticoli = articoli.filter((a) => {
    const q = (searchArticoloQuery !== '' ? searchArticoloQuery : formData.codiceArticolo || '').toLowerCase().trim();
    if (!q) return true;
    return a.codice.toLowerCase().includes(q) || (a.descrizione && a.descrizione.toLowerCase().includes(q));
  });

  const filteredLavoranti = lavoranti.filter((l) => {
    const q = (searchLavoranteQuery !== '' ? searchLavoranteQuery : formData.lavorante || '').toLowerCase().trim();
    if (!q) return true;
    return l.toLowerCase().includes(q);
  });

  const handleSelectArticolo = (art: Articolo) => {
    onChangeFormData({
      codiceArticolo: art.codice,
      revisione: art.rev
    });
    setSearchArticoloQuery(art.codice);
    setIsArticoloOpen(false);
    setHighlightedArticoloIdx(-1);
  };

  const handleSelectLavorante = (name: string) => {
    onChangeFormData({
      lavorante: name
    });
    setSearchLavoranteQuery(name);
    setIsLavoranteOpen(false);
    setHighlightedLavoranteIdx(-1);
  };

  // Keyboard navigation for Articolo (Freccia giù seleziona direttamente)
  const handleArticoloKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredArticoli.length === 0) {
      if (e.key === 'Escape') setIsArticoloOpen(false);
      return;
    }

    if (!isArticoloOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsArticoloOpen(true);
      setHighlightedArticoloIdx(0);
      const target = filteredArticoli[0];
      if (target) {
        onChangeFormData({ codiceArticolo: target.codice, revisione: target.rev });
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isArticoloOpen) setIsArticoloOpen(true);
      const next = highlightedArticoloIdx < 0 ? 0 : (highlightedArticoloIdx + 1) % filteredArticoli.length;
      setHighlightedArticoloIdx(next);
      const target = filteredArticoli[next];
      if (target) {
        onChangeFormData({ codiceArticolo: target.codice, revisione: target.rev });
      }
      const child = articoloListRef.current?.querySelector(`[data-index="${next}"]`) as HTMLElement;
      child?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isArticoloOpen) setIsArticoloOpen(true);
      const prev = highlightedArticoloIdx <= 0 ? filteredArticoli.length - 1 : highlightedArticoloIdx - 1;
      setHighlightedArticoloIdx(prev);
      const target = filteredArticoli[prev];
      if (target) {
        onChangeFormData({ codiceArticolo: target.codice, revisione: target.rev });
      }
      const child = articoloListRef.current?.querySelector(`[data-index="${prev}"]`) as HTMLElement;
      child?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (isArticoloOpen && filteredArticoli.length > 0) {
        e.preventDefault();
        const activeIdx = highlightedArticoloIdx >= 0 ? highlightedArticoloIdx : 0;
        const target = filteredArticoli[activeIdx];
        if (target) {
          handleSelectArticolo(target);
        }
      }
    } else if (e.key === 'Tab') {
      if (isArticoloOpen && filteredArticoli.length > 0) {
        const activeIdx = highlightedArticoloIdx >= 0 ? highlightedArticoloIdx : 0;
        const target = filteredArticoli[activeIdx];
        if (target) {
          handleSelectArticolo(target);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsArticoloOpen(false);
      setHighlightedArticoloIdx(-1);
    }
  };

  // Keyboard navigation for Lavorante (Freccia giù seleziona direttamente)
  const handleLavoranteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredLavoranti.length === 0) {
      if (e.key === 'Escape') setIsLavoranteOpen(false);
      return;
    }

    if (!isLavoranteOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsLavoranteOpen(true);
      setHighlightedLavoranteIdx(0);
      const target = filteredLavoranti[0];
      if (target) {
        onChangeFormData({ lavorante: target });
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isLavoranteOpen) setIsLavoranteOpen(true);
      const next = highlightedLavoranteIdx < 0 ? 0 : (highlightedLavoranteIdx + 1) % filteredLavoranti.length;
      setHighlightedLavoranteIdx(next);
      const target = filteredLavoranti[next];
      if (target) {
        onChangeFormData({ lavorante: target });
      }
      const child = lavoranteListRef.current?.querySelector(`[data-index="${next}"]`) as HTMLElement;
      child?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isLavoranteOpen) setIsLavoranteOpen(true);
      const prev = highlightedLavoranteIdx <= 0 ? filteredLavoranti.length - 1 : highlightedLavoranteIdx - 1;
      setHighlightedLavoranteIdx(prev);
      const target = filteredLavoranti[prev];
      if (target) {
        onChangeFormData({ lavorante: target });
      }
      const child = lavoranteListRef.current?.querySelector(`[data-index="${prev}"]`) as HTMLElement;
      child?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (isLavoranteOpen && filteredLavoranti.length > 0) {
        e.preventDefault();
        const activeIdx = highlightedLavoranteIdx >= 0 ? highlightedLavoranteIdx : 0;
        const target = filteredLavoranti[activeIdx];
        if (target) {
          handleSelectLavorante(target);
        }
      }
    } else if (e.key === 'Tab') {
      if (isLavoranteOpen && filteredLavoranti.length > 0) {
        const activeIdx = highlightedLavoranteIdx >= 0 ? highlightedLavoranteIdx : 0;
        const target = filteredLavoranti[activeIdx];
        if (target) {
          handleSelectLavorante(target);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsLavoranteOpen(false);
      setHighlightedLavoranteIdx(-1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Dati e Compilazione Cartellino</h2>
            <p className="text-xs text-slate-500">
              Compila i campi per generare la stampa allineata al prestampato Hydro-Mec
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Formato cartellino:</span>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
              {currentDim.widthMm} × {currentDim.heightMm} mm
            </span>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipo Cartellino */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Tipo Cartellino Prestampato *</span>
              <span className="text-[11px] font-semibold text-blue-600 normal-case">
                {formData.tipo === 'versare' ? 'Sopra: Materiale in lavorazione' : 'Sotto: Materiale da controllare'}
              </span>
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => onChangeFormData({ tipo: e.target.value as CartellinoType })}
              className="w-full text-sm font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="versare">Materiale in lavorazione (220 × 87 mm)</option>
              <option value="controllare">Materiale da controllare (147.5 × 104 mm - Blu)</option>
            </select>
          </div>

            {/* Codice Articolo con Ricerca e Filtro Interattivo */}
          <div ref={articoloContainerRef} className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Codice Articolo *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Digita o premi ↓ per scegliere..."
                value={formData.codiceArticolo}
                onFocus={() => {
                  setIsArticoloOpen(true);
                  if (highlightedArticoloIdx === -1 && filteredArticoli.length > 0) {
                    setHighlightedArticoloIdx(0);
                  }
                }}
                onKeyDown={handleArticoloKeyDown}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchArticoloQuery(val);
                  onChangeFormData({ codiceArticolo: val });
                  setIsArticoloOpen(true);
                  setHighlightedArticoloIdx(0);
                }}
                className="w-full text-sm font-bold pl-3 pr-14 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                {formData.codiceArticolo && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchArticoloQuery('');
                      onChangeFormData({ codiceArticolo: '' });
                      setIsArticoloOpen(true);
                    }}
                    className="p-1 hover:text-slate-600 rounded cursor-pointer"
                    title="Cancella codice articolo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsArticoloOpen(!isArticoloOpen)}
                  className="p-1 hover:text-slate-600 rounded cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dropdown Lista Articoli Filtrata */}
            {isArticoloOpen && (
              <div
                ref={articoloListRef}
                className="absolute z-40 left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-100"
              >
                {filteredArticoli.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">
                    Nessun articolo trovato per "{formData.codiceArticolo}".
                    <br />
                    <span className="text-[11px] text-blue-600 font-semibold">
                      Puoi continuare a digitare per usarlo come codice libero.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="p-2 bg-slate-50 text-[11px] font-bold text-slate-600 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
                      <span>Trovati {filteredArticoli.length} articoli:</span>
                      <span className="text-[10px] text-blue-600 font-semibold">Premi ↓ per selezionare</span>
                    </div>
                    {filteredArticoli.map((art, idx) => (
                      <div
                        key={art.id}
                        data-index={idx}
                        onClick={() => handleSelectArticolo(art)}
                        onMouseEnter={() => setHighlightedArticoloIdx(idx)}
                        className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                          highlightedArticoloIdx === idx
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'hover:bg-blue-50 text-slate-900'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold text-sm truncate ${highlightedArticoloIdx === idx ? 'text-white' : 'text-slate-900'}`}>
                              {art.codice}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                              highlightedArticoloIdx === idx
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {art.rev}
                            </span>
                          </div>
                          {art.descrizione && (
                            <p className={`text-[11px] truncate mt-0.5 ${highlightedArticoloIdx === idx ? 'text-blue-100' : 'text-slate-500'}`}>
                              {art.descrizione}
                            </p>
                          )}
                        </div>

                        {highlightedArticoloIdx === idx && (
                          <div className="shrink-0 flex items-center gap-1 text-[10px] bg-white text-blue-700 px-2 py-0.5 rounded-md font-bold shadow-xs">
                            <span>Selezionato</span>
                            <span>➔</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="p-1.5 bg-slate-50 text-[10px] text-slate-500 text-center font-medium sticky bottom-0 border-t border-slate-100">
                      ⌨️ Frecce ↑ / ↓ per selezionare • Invio o Tab per confermare
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Campo Revisione (separato dall'articolo) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Revisione *</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Separato dall'Articolo
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Es. Rev. 00, Rev. 01"
                value={formData.revisione}
                onChange={(e) => onChangeFormData({ revisione: e.target.value })}
                className="w-full text-sm font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              />
              {formData.revisione && (
                <button
                  type="button"
                  onClick={() => onChangeFormData({ revisione: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  title="Cancella revisione"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Numero Lancio - Nuovo ogni volta, input diretto senza lista */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Numero Lancio *
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Es. L-2026-088"
                value={formData.numeroLancio}
                onChange={(e) => onChangeFormData({ numeroLancio: e.target.value })}
                className="w-full text-sm font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Numero Pezzi (Q.tà) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Numero Pezzi (Q.tà)
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                placeholder="Es. 150"
                value={formData.numeroPezzi}
                onChange={(e) => onChangeFormData({ numeroPezzi: e.target.value })}
                className="w-full text-sm font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Lavorante con Ricerca e Filtro Interattivo */}
          <div ref={lavoranteContainerRef} className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lavorante / Terzista
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Digita o premi ↓ per scegliere..."
                value={formData.lavorante}
                onFocus={() => {
                  setIsLavoranteOpen(true);
                  if (highlightedLavoranteIdx === -1 && filteredLavoranti.length > 0) {
                    setHighlightedLavoranteIdx(0);
                  }
                }}
                onKeyDown={handleLavoranteKeyDown}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchLavoranteQuery(val);
                  onChangeFormData({ lavorante: val });
                  setIsLavoranteOpen(true);
                  setHighlightedLavoranteIdx(0);
                }}
                className="w-full text-sm font-medium pl-9 pr-14 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                {formData.lavorante && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchLavoranteQuery('');
                      onChangeFormData({ lavorante: '' });
                      setIsLavoranteOpen(true);
                    }}
                    className="p-1 hover:text-slate-600 rounded cursor-pointer"
                    title="Cancella campo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsLavoranteOpen(!isLavoranteOpen)}
                  className="p-1 hover:text-slate-600 rounded cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dropdown Lista Lavoranti Filtrata */}
            {isLavoranteOpen && (
              <div
                ref={lavoranteListRef}
                className="absolute z-40 left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-100"
              >
                {filteredLavoranti.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">
                    Nessun lavorante trovato per "{formData.lavorante}".
                    <br />
                    <span className="text-[11px] text-blue-600 font-semibold">
                      Puoi usarlo direttamente come nome libero.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="p-2 bg-slate-50 text-[11px] font-bold text-slate-600 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
                      <span>Trovati {filteredLavoranti.length} lavoranti:</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Premi ↓ per selezionare</span>
                    </div>
                    {filteredLavoranti.map((lav, idx) => (
                      <div
                        key={idx}
                        data-index={idx}
                        onClick={() => handleSelectLavorante(lav)}
                        onMouseEnter={() => setHighlightedLavoranteIdx(idx)}
                        className={`p-2.5 cursor-pointer transition-colors text-xs font-semibold flex items-center justify-between ${
                          highlightedLavoranteIdx === idx
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'hover:bg-emerald-50 text-slate-900'
                        }`}
                      >
                        <span className="truncate">{lav}</span>
                        {highlightedLavoranteIdx === idx && (
                          <div className="shrink-0 flex items-center gap-1 text-[10px] bg-white text-emerald-800 px-2 py-0.5 rounded-md font-bold shadow-xs">
                            <span>Selezionato</span>
                            <span>➔</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="p-1.5 bg-slate-50 text-[10px] text-slate-500 text-center font-medium sticky bottom-0 border-t border-slate-100">
                      ⌨️ Frecce ↑ / ↓ per selezionare • Invio o Tab per confermare
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Data odierna */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Data Odierna
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={formData.data}
                onChange={(e) => onChangeFormData({ data: e.target.value })}
                className="w-full text-sm font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Numero Collo - Campi Separati (N° Collo e Totale Colli) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Numero Collo (N° / Totale)
            </label>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg p-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="1"
                  value={
                    formData.colloNumero !== undefined
                      ? formData.colloNumero
                      : (formData.collo ? formData.collo.replace(/collo:?\s*/i, '').split('/')[0] || '1' : '1')
                  }
                  onChange={(e) => {
                    const num = e.target.value;
                    const tot =
                      formData.colloTotale !== undefined
                        ? formData.colloTotale
                        : (formData.collo && formData.collo.includes('/') ? formData.collo.split('/')[1] || '1' : '1');
                    onChangeFormData({
                      colloNumero: num,
                      colloTotale: tot,
                      collo: `${num}/${tot}`
                    });
                  }}
                  className="w-full text-center text-sm font-bold py-1.5 px-2 bg-transparent border-0 focus:outline-none text-slate-900"
                  title="Collo numero corrente"
                />
              </div>

              <span className="text-slate-400 font-black text-sm select-none px-0.5">/</span>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="1"
                  value={
                    formData.colloTotale !== undefined
                      ? formData.colloTotale
                      : (formData.collo && formData.collo.includes('/') ? formData.collo.split('/')[1] || '1' : '1')
                  }
                  onChange={(e) => {
                    const tot = e.target.value;
                    const num =
                      formData.colloNumero !== undefined
                        ? formData.colloNumero
                        : (formData.collo ? formData.collo.replace(/collo:?\s*/i, '').split('/')[0] || '1' : '1');
                    onChangeFormData({
                      colloNumero: num,
                      colloTotale: tot,
                      collo: `${num}/${tot}`
                    });
                  }}
                  className="w-full text-center text-sm font-bold py-1.5 px-2 bg-transparent border-0 focus:outline-none text-slate-900"
                  title="Totale colli della spedizione"
                />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-0.5">
              <span>N° Collo</span>
              <span>Tot. Colli</span>
            </div>
          </div>

          {/* Note extra */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note Aggiuntive / Informazioni Speciali
            </label>
            <input
              type="text"
              placeholder="Es. Consegna urgente - Controllo dimensionale su quota C"
              value={formData.noteLibere || ''}
              onChange={(e) => onChangeFormData({ noteLibere: e.target.value })}
              className="w-full text-sm font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Sezione Barcode con Flag di Attivazione / Disattivazione */}
          <div className="lg:col-span-4 bg-blue-50/70 border border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Stampa Codici a Barre (Code 128)
                </span>
                <span className="text-[11px] text-slate-500">
                  Spunta o deseleziona i barcode che desideri stampare sul cartellino
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 select-none bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={formData.showBarcodeArticolo}
                  onChange={(e) => onChangeFormData({ showBarcodeArticolo: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Barcode Articolo {formData.showBarcodeArticolo ? '✓' : '(Disattivato)'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 select-none bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={formData.showBarcodeLancio}
                  onChange={(e) => onChangeFormData({ showBarcodeLancio: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Barcode Lancio {formData.showBarcodeLancio ? '✓' : '(Disattivato)'}</span>
              </label>
            </div>
          </div>

          {/* BANNER DI PREVENZIONE COMPRESSIONE 220 mm */}
          {formData.tipo === 'versare' && (
            <div className="lg:col-span-4 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-amber-950 text-xs sm:text-sm block">
                    ⚠️ Controllo Formato 220 mm (Anti-Compressione Windows 11)
                  </span>
                  <p className="text-amber-900 text-xs mt-0.5 leading-relaxed">
                    Se la stampa risultava compressa a ~150 mm, il driver o Edge stavano riutilizzando il formato A6 (148 mm) del cartellino blu.
                    Questo software ora inietta la direttiva <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-amber-950">@page 220×87 mm</code>.
                    Assicurati che nel prompt di stampa di Windows la <b>Scala sia al 100% (NON "Adatta alla pagina")</b>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenWindowsGuide && onOpenWindowsGuide('compression')}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shrink-0 transition-all cursor-pointer"
              >
                <span>Guida Risoluzione 220 mm</span>
              </button>
            </div>
          )}
        </div>

        {/* Avvisi barcode: meglio vederli prima di sprecare un cartellino prestampato */}
        {barcodeWarnings.length > 0 && (
          <div className="mt-6 p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 text-xs space-y-1.5">
            {barcodeWarnings.map((w) => (
              <div key={w} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Print Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-base font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>
                {formData.tipo === 'versare'
                  ? 'Stampa Cartellino 220 × 87 mm (Bypass)'
                  : 'Stampa Cartellino 147.5 × 104 mm (A6 Bypass)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSimulazioneModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
              title="Visualizza la simulazione del foglio di stampa a video prima di inviarlo al driver"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Anteprima Foglio / Test</span>
            </button>

            {/* Print Options */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pl-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.printWithBackground}
                  onChange={(e) => onUpdateSettings({ printWithBackground: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Includi sfondo grafico (per prova su fogli bianchi)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(settings.printBorder)}
                  onChange={(e) => onUpdateSettings({ printBorder: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Bordo cartellino (linea sottile di riferimento)</span>
              </label>

              {/* Selettore Modalità Stampa: Diretto vs A4 */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span>Layout:</span>
                <select
                  value={settings.printMode || 'direct'}
                  onChange={(e) => onUpdateSettings({ printMode: e.target.value as 'direct' | 'a4_bypass' })}
                  className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="direct">Formato Diretto 1:1 (@page Bypass)</option>
                  <option value="a4_bypass">Foglio A4 (Scala 100% Antiriduzione)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {formData.tipo === 'versare' ? (
                <><b>Cartellino 220 mm:</b> Vassoio Bypass. Nel driver assicurati: <b>Scala 100%</b> e formato non forzato ad A6.</>
              ) : (
                <><b>Cartellino Blu:</b> Vassoio Bypass A6 (105 × 148 mm). Scala: 100%.</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Live Preview with Drag & Drop */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Anteprima Reale e Allineamento Prestampato
            </h3>
            <span className="text-xs text-slate-500">
              (Sfondo {formData.tipo === 'controllare' ? 'sfondo-blu.jpg' : 'sfondo-finito.jpg'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateSettings({ showBackground: !settings.showBackground })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {settings.showBackground ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{settings.showBackground ? 'Nascondi Sfondo' : 'Mostra Sfondo'}</span>
            </button>
          </div>
        </div>

        <InteractiveCardPreview
          tipo={formData.tipo}
          positions={positions}
          formData={formData}
          settings={settings}
          onUpdatePosition={onUpdatePosition}
          onToggleLock={onToggleLock}
          isCalibrationMode={false}
        />
      </div>

      {/* Modal Simulazione Foglio di Stampa */}
      {simulazioneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Simulazione Foglio di Stampa • INEO3320
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verifica visiva del posizionamento millimetrico prima di inviare la stampa al driver
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSimulazioneModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-100 flex flex-col items-center">
              {/* Quick Info Box */}
              <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Formato: <b>{currentDim.name}</b> • Cassetto consigliato: <b>Bypass manuale</b> • Scala driver: <b>100%</b>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={settings.printWithBackground}
                      onChange={(e) => onUpdateSettings({ printWithBackground: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    <span>Mostra grafica di sfondo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.printBorder)}
                      onChange={(e) => onUpdateSettings({ printBorder: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    <span>Bordo cartellino</span>
                  </label>
                </div>
              </div>

              {/* Foglio Simulato 1:1 */}
              <div className="p-4 bg-white shadow-xl rounded-xl border border-slate-300 overflow-auto max-w-full flex justify-center">
                <InteractiveCardPreview
                  tipo={formData.tipo}
                  positions={positions}
                  formData={formData}
                  settings={settings}
                  onUpdatePosition={onUpdatePosition}
                  onToggleLock={onToggleLock}
                  isCalibrationMode={false}
                />
              </div>

              <p className="text-xs text-slate-500 text-center max-w-lg">
                Se nel driver della stampante l'anteprima appare bianca, assicurati che la scala sia impostata al <b>100%</b> e il cassetto su <b>Bypass</b>. Per cartellini prestampati, il testo nero si allineerà perfettamente alle caselle già stampate.
              </p>
            </div>

            <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSimulazioneModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Chiudi
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulazioneModalOpen(false);
                  setTimeout(() => onPrint(), 200);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Invia Stampa al Driver (Ctrl+P)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
