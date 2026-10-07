import React, { useRef, useState, useEffect } from 'react';
import { CartellinoType, FieldCalibration, CartellinoFormData, AppSettings } from '../types';
import { TAG_DIMENSIONS } from '../constants/defaultPositions';
import { CardBackground } from './CardBackground';
import { BarcodeRenderer } from './BarcodeRenderer';
import { barcodeMaxWidthMm } from '../lib/barcode';
import { Lock, Unlock, Move } from 'lucide-react';

interface InteractiveCardPreviewProps {
  tipo: CartellinoType;
  positions: Record<string, FieldCalibration>;
  formData: CartellinoFormData;
  settings: AppSettings;
  onUpdatePosition: (tipo: CartellinoType, fieldId: string, param: 'top' | 'left' | 'fontSize', value: number) => void;
  onToggleLock: () => void;
  selectedFieldId?: string | null;
  onSelectField?: (fieldId: string | null) => void;
  isCalibrationMode?: boolean;
}

export const InteractiveCardPreview: React.FC<InteractiveCardPreviewProps> = ({
  tipo,
  positions,
  formData,
  settings,
  onUpdatePosition,
  onToggleLock,
  selectedFieldId,
  onSelectField,
  isCalibrationMode = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeDraggingField, setActiveDraggingField] = useState<string | null>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    initialTop: number;
    initialLeft: number;
    cardWidthPx: number;
    cardHeightPx: number;
  } | null>(null);

  const dim = TAG_DIMENSIONS[tipo];

  // Helper text preparation based on form data
  const getFieldText = (fieldKey: string): string => {
    const artOnly = formData.codiceArticolo
      ? formData.codiceArticolo
      : (isCalibrationMode ? '[Codice Articolo]' : '');

    const revOnly = formData.revisione
      ? formData.revisione
      : (isCalibrationMode ? '[Rev. 00]' : '');

    const formattedDate = formData.data
      ? new Date(formData.data).toLocaleDateString('it-IT')
      : new Date().toLocaleDateString('it-IT');

    const formattedCollo = (() => {
      if (formData.colloNumero !== undefined && formData.colloTotale !== undefined) {
        const num = formData.colloNumero || '1';
        const tot = formData.colloTotale || '1';
        return `Collo: ${num}/${tot}`;
      }
      if (formData.collo) {
        return formData.collo.toLowerCase().includes('collo')
          ? formData.collo
          : `Collo: ${formData.collo}`;
      }
      return 'Collo: 1/1';
    })();

    switch (fieldKey) {
      case 'codice':
        return artOnly;
      case 'revisione':
        return revOnly;
      case 'lancio':
        return formData.numeroLancio || (isCalibrationMode ? '[Lancio]' : '');
      case 'qta':
        return formData.numeroPezzi ? `${formData.numeroPezzi} PZ` : (isCalibrationMode ? '[Q.tà PZ]' : '');
      case 'lavorante':
        return formData.lavorante || (isCalibrationMode ? '[Lavorante]' : '');
      case 'data':
        return formattedDate;
      case 'collo':
        return formattedCollo;
      case 'note':
        return formData.noteLibere || (isCalibrationMode ? '[Note libere]' : '');
      default:
        return '';
    }
  };

  // Pointer drag handling (mouse + touch)
  const handlePointerDown = (e: React.PointerEvent, fieldId: string) => {
    if (settings.isLocked) {
      if (onSelectField) onSelectField(fieldId);
      return;
    }

    if (!cardRef.current) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const field = positions[fieldId];
    if (!field) return;

    if (onSelectField) onSelectField(fieldId);
    setActiveDraggingField(fieldId);

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialTop: field.top,
      initialLeft: field.left,
      cardWidthPx: cardRect.width,
      cardHeightPx: cardRect.height
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDraggingField || !dragStartRef.current || settings.isLocked) return;

    const { clientX, clientY, initialTop, initialLeft, cardWidthPx, cardHeightPx } = dragStartRef.current;
    const deltaX_px = e.clientX - clientX;
    const deltaY_px = e.clientY - clientY;

    // Convert pixel movement to millimeters
    const deltaX_mm = (deltaX_px / cardWidthPx) * dim.widthMm;
    const deltaY_mm = (deltaY_px / cardHeightPx) * dim.heightMm;

    let newLeft = Math.round((initialLeft + deltaX_mm) * 2) / 2; // 0.5mm step
    let newTop = Math.round((initialTop + deltaY_mm) * 2) / 2;

    // Clamp inside tag bounds with safe margin
    newLeft = Math.max(0, Math.min(dim.widthMm - 5, newLeft));
    newTop = Math.max(0, Math.min(dim.heightMm - 5, newTop));

    onUpdatePosition(tipo, activeDraggingField, 'left', newLeft);
    onUpdatePosition(tipo, activeDraggingField, 'top', newTop);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDraggingField) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture release fallback
      }
      setActiveDraggingField(null);
      dragStartRef.current = null;
    }
  };

  // Keyboard nudge with arrow keys when a field is selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (settings.isLocked || !selectedFieldId || !positions[selectedFieldId]) return;

      const step = e.shiftKey ? 2.0 : 0.5; // Shift for faster nudge
      const current = positions[selectedFieldId];

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.max(0, Math.round((current.top - step) * 2) / 2);
        onUpdatePosition(tipo, selectedFieldId, 'top', next);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(dim.heightMm, Math.round((current.top + step) * 2) / 2);
        onUpdatePosition(tipo, selectedFieldId, 'top', next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = Math.max(0, Math.round((current.left - step) * 2) / 2);
        onUpdatePosition(tipo, selectedFieldId, 'left', next);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = Math.min(dim.widthMm, Math.round((current.left + step) * 2) / 2);
        onUpdatePosition(tipo, selectedFieldId, 'left', next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.isLocked, selectedFieldId, positions, tipo, dim, onUpdatePosition]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Visual Toolbar on top of preview */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-t-xl border border-b-0 border-slate-300 shadow-xs no-print">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleLock}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              settings.isLocked
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-amber-700 text-white hover:bg-amber-800 ring-2 ring-amber-300 animate-pulse'
            }`}
            title={settings.isLocked ? 'Clicca per sbloccare e abilitare il Drag & Drop' : 'Clicca per bloccare le posizioni'}
          >
            {settings.isLocked ? (
              <>
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>Posizioni Bloccate</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-amber-200" />
                <span>Drag & Drop Sbloccato</span>
              </>
            )}
          </button>

          <span className="text-xs text-slate-500 hidden sm:inline">
            {settings.isLocked
              ? 'Tocca "Posizioni Bloccate" per abilitare lo spostamento a trascinamento'
              : 'Trascina i testi e i barcode con il mouse o usa le frecce della tastiera (±0.5mm)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active coordinate HUD indicator */}
          {selectedFieldId && positions[selectedFieldId] && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-mono font-medium">
              <span className="font-sans font-bold">{positions[selectedFieldId].label}:</span>
              <span>X (Sin): {positions[selectedFieldId].left} mm</span>
              <span>Y (Alt): {positions[selectedFieldId].top} mm</span>
              {positions[selectedFieldId].isBarcode ? (
                <span>Alt: {positions[selectedFieldId].heightMm || 12} mm</span>
              ) : (
                <span>Font: {positions[selectedFieldId].fontSize} pt</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Screen Card Container with scale/zoom */}
      <div className="w-full max-w-4xl overflow-auto p-4 sm:p-6 bg-slate-200/80 border border-slate-300 rounded-b-xl flex justify-center items-center shadow-inner">
        {/* Card Screen Element with strict millimeter dimensions */}
        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative bg-white shadow-xl transition-shadow select-none overflow-hidden"
          style={{
            width: `${dim.widthMm}mm`,
            height: `${dim.heightMm}mm`,
            minWidth: `${dim.widthMm}mm`,
            minHeight: `${dim.heightMm}mm`,
            maxWidth: `${dim.widthMm}mm`,
            maxHeight: `${dim.heightMm}mm`,
            boxSizing: 'border-box'
          }}
        >
          {/* Card Background image or SVG */}
          {settings.showBackground && (
            <CardBackground
              tipo={tipo}
              opacity={settings.backgroundOpacity}
              customImage={settings.customBgImages?.[tipo]}
              isPrint={!settings.printWithBackground}
            />
          )}

          {/* Optional Millimeter grid lines for precise optical alignment */}
          {settings.showGridLines && !settings.isLocked && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20 no-print"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)',
                backgroundSize: '10mm 10mm'
              }}
            />
          )}

          {/* Dynamic Draggable Fields (Text + Barcodes) */}
          {Object.entries(positions).map(([fieldKey, field]) => {
            // Skip legacy combined info field
            if (fieldKey === 'info') {
              return null;
            }

            // Check if it's a barcode field and whether it should be shown/printed
            const isBarcodeArticolo = fieldKey === 'barcodeArticolo';
            const isBarcodeLancio = fieldKey === 'barcodeLancio';
            const isCollo = fieldKey === 'collo';

            if (isBarcodeArticolo) {
              if (!formData.showBarcodeArticolo) return null;
              if (!formData.codiceArticolo && !isCalibrationMode) return null;
            }
            if (isBarcodeLancio) {
              if (!formData.showBarcodeLancio) return null;
              if (!formData.numeroLancio && !isCalibrationMode) return null;
            }

            const isSelected = selectedFieldId === fieldKey;
            const isDragging = activeDraggingField === fieldKey;

            return (
              <div
                key={fieldKey}
                onPointerDown={(e) => handlePointerDown(e, fieldKey)}
                onClick={() => onSelectField && onSelectField(fieldKey)}
                className={`field-label absolute cursor-default leading-none transition-colors select-none ${
                  !settings.isLocked ? 'cursor-grab active:cursor-grabbing group hover:ring-2 hover:ring-blue-400' : ''
                } ${
                  isSelected && !settings.isLocked
                    ? 'ring-2 ring-blue-600 bg-blue-100/70 shadow-md rounded-xs z-20'
                    : 'z-10'
                } ${isDragging ? 'opacity-90 ring-2 ring-emerald-500 bg-emerald-100/80 z-30' : ''}`}
                style={{
                  top: `${field.top}mm`,
                  left: `${field.left}mm`,
                  fontSize: `${field.fontSize}pt`,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontWeight: field.fontWeight || 'bold',
                  color: '#000000',
                  lineHeight: '1.1',
                  padding: isSelected && !settings.isLocked ? '1px 3px' : '0'
                }}
              >
                {isBarcodeArticolo ? (
                  <BarcodeRenderer
                    value={formData.codiceArticolo || 'ART-001'}
                    heightMm={field.heightMm || 12}
                    maxWidthMm={barcodeMaxWidthMm(tipo, fieldKey, field)}
                  />
                ) : isBarcodeLancio ? (
                  <BarcodeRenderer
                    value={formData.numeroLancio || 'L-2026-088'}
                    heightMm={field.heightMm || 12}
                    maxWidthMm={barcodeMaxWidthMm(tipo, fieldKey, field)}
                  />
                ) : isCollo ? (
                  /* Riquadro attorno a Collo: X/Y */
                  <span
                    className="inline-block font-bold whitespace-nowrap"
                    style={{
                      border: '1.5px solid #000000',
                      padding: '0.6mm 2.2mm',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      borderRadius: '2px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                    }}
                  >
                    {getFieldText(fieldKey)}
                  </span>
                ) : (
                  <span>{getFieldText(fieldKey)}</span>
                )}

                {/* Drag handle badge when field is selected and unlocked */}
                {isSelected && !settings.isLocked && (
                  <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap pointer-events-none no-print">
                    <Move className="w-2.5 h-2.5" />
                    <span>
                      {field.label}: {field.left}mm, {field.top}mm
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Helper indicator */}
      <div className="w-full max-w-4xl text-center mt-2 text-xs text-slate-500 no-print">
        Dimensioni reali cartellino: <b>{dim.widthMm} mm × {dim.heightMm} mm</b>. 
        Stampante raccomandata: <b>INEO3320 (cassetto Bypass A6)</b>.
      </div>
    </div>
  );
};
