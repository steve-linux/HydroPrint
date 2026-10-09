import React, { useRef } from 'react';
import { CartellinoType, FieldCalibration, CartellinoFormData, AppSettings } from '../types';
import { TAG_DIMENSIONS } from '../constants/defaultPositions';
import { InteractiveCardPreview } from './InteractiveCardPreview';
import { barcodeMaxWidthMm } from '../lib/barcode';
import {
  Lock,
  Unlock,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Grid,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Upload,
  Barcode
} from 'lucide-react';

interface CalibrationTabProps {
  selectedTipo: CartellinoType;
  onChangeTipo: (tipo: CartellinoType) => void;
  positions: Record<string, FieldCalibration>;
  allPositions: Record<CartellinoType, Record<string, FieldCalibration>>;
  formData: CartellinoFormData;
  settings: AppSettings;
  onUpdatePosition: (tipo: CartellinoType, fieldId: string, param: 'top' | 'left' | 'fontSize' | 'heightMm' | 'maxWidth', value: number) => void;
  onResetDefaults: (tipo: CartellinoType) => void;
  onSavePositions: () => void;
  onToggleLock: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  customBgFileHandler: (tipo: CartellinoType, file: File) => void;
  onChangeFormData?: (updated: Partial<CartellinoFormData>) => void;
}

export const CalibrationTab: React.FC<CalibrationTabProps> = ({
  selectedTipo,
  onChangeTipo,
  positions,
  formData,
  settings,
  onUpdatePosition,
  onResetDefaults,
  onSavePositions,
  onToggleLock,
  onUpdateSettings,
  selectedFieldId,
  onSelectField,
  customBgFileHandler,
  onChangeFormData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentDim = TAG_DIMENSIONS[selectedTipo];

  return (
    <div className="space-y-6">
      {/* Header and Controls Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">🎯 Calibrazione Posizioni e Allineamento</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                INEO3320 Bypass
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Trascina i testi direttamente con il mouse / touch nell'anteprima, oppure imposta le coordinate millimetriche (mm) e i punti (pt) dei font.
            </p>
          </div>

          {/* Prominent Lock / Unlock Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleLock}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                settings.isLocked
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-amber-700 text-white hover:bg-amber-800 ring-4 ring-amber-200 animate-pulse'
              }`}
            >
              {settings.isLocked ? (
                <>
                  <Lock className="w-5 h-5 text-emerald-200" />
                  <span>🔒 Posizioni Bloccate (Protetto)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5 text-amber-200" />
                  <span>🔓 Sbloccato: Trascina o Modifica</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onSavePositions}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salva Modifiche</span>
            </button>
          </div>
        </div>

        {/* Options Row: Cartellino selection, background controls, opacity, grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cartellino da Calibrare:
            </label>
            <select
              value={selectedTipo}
              onChange={(e) => onChangeTipo(e.target.value as CartellinoType)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-blue-500"
            >
              <option value="versare">Materiale in lavorazione (219 × 87 mm)</option>
              <option value="controllare">Materiale da controllare (147.5 × 104 mm - Blu)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Visualizzazione Sfondo:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ showBackground: !settings.showBackground })}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border ${
                  settings.showBackground
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
              >
                {settings.showBackground ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4" />}
                <span>{settings.showBackground ? 'Sfondo Visibile' : 'Sfondo Nascosto'}</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ showGridLines: !settings.showGridLines })}
                title="Attiva/disattiva griglia mm"
                className={`p-2 rounded-lg border text-xs font-semibold ${
                  settings.showGridLines
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-100 border-slate-300 text-slate-500'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Opacità Sfondo:
              </label>
              <span className="text-xs font-mono font-bold text-slate-600">
                {settings.backgroundOpacity}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.backgroundOpacity}
              onChange={(e) => onUpdateSettings({ backgroundOpacity: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex flex-col justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) customBgFileHandler(selectedTipo, file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Carica Scansione Personale</span>
            </button>
          </div>
        </div>

        {/* Status banner */}
        {!settings.isLocked && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center gap-2">
            <Unlock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <b>Modalità Modifica Attiva:</b> Puoi cliccare e trascinare le scritte direttamente sul cartellino qui sotto con il mouse. Usa anche le frecce della tastiera per micro-spostamenti di 0.5 mm!
            </span>
          </div>
        )}
      </div>

      {/* Main Preview with Live Drag & Drop */}
      <div className="flex flex-col items-center">
        <InteractiveCardPreview
          tipo={selectedTipo}
          positions={positions}
          formData={formData}
          settings={settings}
          onUpdatePosition={onUpdatePosition}
          onToggleLock={onToggleLock}
          selectedFieldId={selectedFieldId}
          onSelectField={onSelectField}
          isCalibrationMode={true}
        />
      </div>

      {/* Numeric calibration table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Tabella Valori Coordinate (mm) e Font (pt)
          </h3>
          <button
            type="button"
            onClick={() => onResetDefaults(selectedTipo)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ripristina Default di Fabbrica</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">Campo</th>
                <th className="p-3 text-center">Alto / Top (mm)</th>
                <th className="p-3 text-center">Sinistra / Left (mm)</th>
                <th className="p-3 text-center">Font (pt) / Barcode: altezza e larghezza max (mm)</th>
                <th className="p-3 text-center">Azioni Rapide (±0.5 mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(positions).map(([fieldKey, field]) => {
                const isSelected = selectedFieldId === fieldKey;
                const isBarcode = field.isBarcode || fieldKey.toLowerCase().includes('barcode');
                const isArticoloDisabled = fieldKey === 'barcodeArticolo' && !formData.showBarcodeArticolo;
                const isLancioDisabled = fieldKey === 'barcodeLancio' && !formData.showBarcodeLancio;
                const isFieldDisabled = isArticoloDisabled || isLancioDisabled;

                return (
                  <tr
                    key={fieldKey}
                    onClick={() => onSelectField(fieldKey)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                    } ${isFieldDisabled ? 'opacity-60 bg-slate-50/40' : ''}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                        {isBarcode && <Barcode className="w-4 h-4 text-blue-600 shrink-0" />}
                        <span className="font-bold text-slate-900">{field.label}</span>
                        {isBarcode && onChangeFormData && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (fieldKey === 'barcodeArticolo') {
                                onChangeFormData({ showBarcodeArticolo: !formData.showBarcodeArticolo });
                              } else if (fieldKey === 'barcodeLancio') {
                                onChangeFormData({ showBarcodeLancio: !formData.showBarcodeLancio });
                              }
                            }}
                            className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              isFieldDisabled
                                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            }`}
                            title="Clicca per attivare o disattivare la stampa di questo barcode"
                          >
                            {isFieldDisabled ? 'Disattivato (Abilita)' : 'Attivo in Stampa'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Top mm input */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={currentDim.heightMm}
                          disabled={settings.isLocked}
                          value={field.top}
                          onChange={(e) =>
                            onUpdatePosition(selectedTipo, fieldKey, 'top', parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center font-mono font-bold p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-100"
                        />
                        <span className="text-slate-400 font-sans">mm</span>
                      </div>
                    </td>

                    {/* Left mm input */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={currentDim.widthMm}
                          disabled={settings.isLocked}
                          value={field.left}
                          onChange={(e) =>
                            onUpdatePosition(selectedTipo, fieldKey, 'left', parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center font-mono font-bold p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-100"
                        />
                        <span className="text-slate-400 font-sans">mm</span>
                      </div>
                    </td>

                    {/* Font size pt OR Barcode height mm input */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        {isBarcode ? (
                          <>
                            <input
                              type="number"
                              step="1"
                              min="5"
                              max="35"
                              disabled={settings.isLocked}
                              value={field.heightMm || 12}
                              onChange={(e) =>
                                onUpdatePosition(
                                  selectedTipo,
                                  fieldKey,
                                  'heightMm',
                                  parseFloat(e.target.value) || 12
                                )
                              }
                              className="w-16 text-center font-mono font-bold p-1.5 bg-blue-50/50 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-100"
                            />
                            <span className="text-blue-600 font-sans font-medium text-[11px]">mm alt.</span>
                            {/* Spazio massimo in larghezza: un codice lungo si stringe per starci */}
                            <input
                              type="number"
                              step="1"
                              min="10"
                              max={currentDim.widthMm}
                              disabled={settings.isLocked}
                              value={barcodeMaxWidthMm(selectedTipo, fieldKey, field)}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                if (Number.isFinite(v) && v > 0) {
                                  onUpdatePosition(selectedTipo, fieldKey, 'maxWidth', v);
                                }
                              }}
                              title="Larghezza massima del barcode: se il codice è lungo, le barre si stringono per non uscire da questo spazio"
                              className="ml-2 w-16 text-center font-mono font-bold p-1.5 bg-blue-50/50 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-100"
                            />
                            <span className="text-blue-600 font-sans font-medium text-[11px]">mm larg. max</span>
                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              step="1"
                              min="8"
                              max="36"
                              disabled={settings.isLocked}
                              value={field.fontSize}
                              onChange={(e) =>
                                onUpdatePosition(
                                  selectedTipo,
                                  fieldKey,
                                  'fontSize',
                                  parseInt(e.target.value, 10) || 12
                                )
                              }
                              className="w-16 text-center font-mono font-bold p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-100"
                            />
                            <span className="text-slate-400 font-sans">pt</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Quick Nudge Buttons */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={settings.isLocked}
                          title="Sposta a sinistra di 0.5 mm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdatePosition(selectedTipo, fieldKey, 'left', Math.max(0, field.left - 0.5));
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded border border-slate-300 font-mono font-bold"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          disabled={settings.isLocked}
                          title="Sposta a destra di 0.5 mm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdatePosition(selectedTipo, fieldKey, 'left', field.left + 0.5);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded border border-slate-300 font-mono font-bold"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          disabled={settings.isLocked}
                          title="Sposta in alto di 0.5 mm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdatePosition(selectedTipo, fieldKey, 'top', Math.max(0, field.top - 0.5));
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded border border-slate-300 font-mono font-bold"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={settings.isLocked}
                          title="Sposta in basso di 0.5 mm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdatePosition(selectedTipo, fieldKey, 'top', field.top + 0.5);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded border border-slate-300 font-mono font-bold"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
