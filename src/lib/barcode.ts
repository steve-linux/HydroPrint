import JsBarcode from 'jsbarcode';
import { CartellinoFormData, CartellinoType, FieldCalibration } from '../types';
import { DEFAULT_POSIZIONI, TAG_DIMENSIONS } from '../constants/defaultPositions';

// Larghezza di una barra elementare ("modulo") del Code 128.
// 0,40 mm è la misura che l'app usava già: i codici corti restano identici a prima.
export const MODULE_MM_MAX = 0.4;
// Sotto 0,25 mm molti lettori da officina iniziano a sbagliare: si avvisa l'operatore.
export const MODULE_MM_MIN_SAFE = 0.25;
// Margine da lasciare libero verso il bordo destro del cartellino.
export const EDGE_MM = 3;
// Zona di rispetto richiesta dal Code 128 ai lati del codice: 10 moduli.
export const QUIET_ZONE_MODULES = 10;

// Numero di moduli del codice (barre + spazi), oppure null se il testo non è codificabile
// (il Code 128 accetta solo caratteri ASCII: "N°" o lettere accentate non vanno).
export const barcodeModules = (value: string): number | null => {
  const clean = (value || '').trim();
  if (!clean) return null;
  try {
    const out: { encodings?: { data: string }[] } = {};
    JsBarcode(out, clean, { format: 'CODE128' });
    return (out.encodings || []).reduce((sum, e) => sum + e.data.length, 0) || null;
  } catch {
    return null;
  }
};

// Spazio massimo in larghezza per un barcode: il valore impostato in Calibrazione,
// altrimenti quello di fabbrica, sempre senza uscire dal cartellino.
export const barcodeMaxWidthMm = (tipo: CartellinoType, fieldKey: string, field: FieldCalibration): number => {
  const available = TAG_DIMENSIONS[tipo].widthMm - field.left - EDGE_MM;
  const configured = field.maxWidth ?? DEFAULT_POSIZIONI[tipo][fieldKey]?.maxWidth ?? available;
  return Math.max(0, Math.min(configured, available));
};

export interface BarcodeLayout {
  ok: boolean;
  modules: number;
  widthMm: number;
  moduleMm: number;
  tooDense: boolean;
}

// Larghezza reale del barcode: misura piena se ci sta, altrimenti stretto per stare nello spazio.
export const barcodeLayout = (value: string, maxWidthMm: number): BarcodeLayout => {
  const modules = barcodeModules(value);
  if (!modules) return { ok: false, modules: 0, widthMm: 0, moduleMm: 0, tooDense: false };
  const widthMm = Math.min(modules * MODULE_MM_MAX, maxWidthMm);
  const moduleMm = widthMm / modules;
  return { ok: true, modules, widthMm, moduleMm, tooDense: moduleMm < MODULE_MM_MIN_SAFE };
};

interface BarcodeCheck {
  fieldKey: string;
  label: string;
  value: string;
}

const fmt = (n: number) => n.toFixed(2).replace('.', ',');

// Avvisi in italiano da mostrare prima della stampa.
export const barcodeWarnings = (
  tipo: CartellinoType,
  positions: Record<string, FieldCalibration>,
  barcodes: BarcodeCheck[]
): string[] => {
  const warnings: string[] = [];
  const boxes: { label: string; left: number; right: number; top: number; bottom: number; quietMm: number }[] = [];

  for (const { fieldKey, label, value } of barcodes) {
    const field = positions[fieldKey];
    if (!field || !value.trim()) continue;
    const layout = barcodeLayout(value, barcodeMaxWidthMm(tipo, fieldKey, field));
    if (!layout.ok) {
      warnings.push(`${label}: "${value}" contiene caratteri che il Code 128 non può stampare (es. °, à, è). Il barcode non verrà stampato.`);
      continue;
    }
    if (layout.tooDense) {
      warnings.push(
        `${label}: barre troppo sottili (${fmt(layout.moduleMm)} mm, minimo consigliato ${fmt(MODULE_MM_MIN_SAFE)} mm). ` +
          `Il lettore potrebbe non leggerlo: in Calibrazione aumenta la "larghezza max" o sposta il barcode a sinistra.`
      );
    }
    boxes.push({
      label,
      left: field.left,
      right: field.left + layout.widthMm,
      top: field.top,
      bottom: field.top + (field.heightMm || 12),
      quietMm: QUIET_ZONE_MODULES * layout.moduleMm
    });
  }

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const quiet = Math.max(a.quietMm, b.quietMm);
      const overlapY = a.top < b.bottom && b.top < a.bottom;
      const overlapX = a.left < b.right + quiet && b.left < a.right + quiet;
      if (overlapX && overlapY) {
        warnings.push(`${a.label} e ${b.label} si toccano o sono troppo vicini: lo scanner non riuscirà a leggerli. Distanziali in Calibrazione.`);
      }
    }
  }

  return warnings;
};

// Avvisi per i barcode che verrebbero stampati con i dati del modulo.
export const formBarcodeWarnings = (
  formData: CartellinoFormData,
  positions: Record<string, FieldCalibration>
): string[] =>
  barcodeWarnings(formData.tipo, positions, [
    { fieldKey: 'barcodeLancio', label: 'Barcode lancio', value: formData.showBarcodeLancio ? formData.numeroLancio : '' },
    { fieldKey: 'barcodeArticolo', label: 'Barcode articolo', value: formData.showBarcodeArticolo ? formData.codiceArticolo : '' }
  ]);
