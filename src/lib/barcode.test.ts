import { describe, expect, it } from 'vitest';
import {
  EDGE_MM,
  MODULE_MM_MAX,
  barcodeLayout,
  barcodeMaxWidthMm,
  barcodeModules,
  barcodeWarnings,
  formBarcodeWarnings
} from './barcode';
import { DEFAULT_POSIZIONI, TAG_DIMENSIONS } from '../constants/defaultPositions';
import { CartellinoFormData, CartellinoType, FieldCalibration } from '../types';

const form = (tipo: CartellinoType, codice: string, lancio: string): CartellinoFormData => ({
  tipo,
  codiceArticolo: codice,
  revisione: 'Rev. 01',
  numeroLancio: lancio,
  numeroPezzi: '40',
  lavorante: '',
  data: '2026-10-08',
  collo: '1/1',
  showBarcodeArticolo: true,
  showBarcodeLancio: true
});

// Posizioni salvate nel browser prima di questa modifica: senza maxWidth.
const savedBeforeFix = (tipo: CartellinoType): Record<string, FieldCalibration> =>
  Object.fromEntries(
    Object.entries(DEFAULT_POSIZIONI[tipo]).map(([k, f]) => {
      const { maxWidth, ...rest } = f;
      return [k, rest];
    })
  );

describe('misura del Code 128', () => {
  it('conta i moduli del codice', () => {
    expect(barcodeModules('L-2026-088')).toBe(145);
    expect(barcodeModules('01.002.00')).toBe(134);
  });

  it('rifiuta i caratteri che il Code 128 non può stampare', () => {
    expect(barcodeModules('N°5')).toBeNull();
    expect(barcodeModules('   ')).toBeNull();
  });

  it('un codice corto resta alla misura di sempre (0,40 mm per modulo)', () => {
    const l = barcodeLayout('123456', 100);
    expect(l.moduleMm).toBeCloseTo(MODULE_MM_MAX);
    expect(l.tooDense).toBe(false);
  });

  it('un codice lungo si stringe per stare nello spazio, e se diventa troppo fitto lo dice', () => {
    const l = barcodeLayout('CORPO-MEC-12', 39);
    expect(l.widthMm).toBe(39);
    expect(l.tooDense).toBe(true); // 39 mm / 167 moduli = 0,23 mm
    expect(barcodeLayout('01.002.00', 39).tooDense).toBe(false); // 0,29 mm
  });
});

describe('i barcode non escono dal cartellino', () => {
  for (const tipo of ['controllare', 'versare'] as CartellinoType[]) {
    for (const [fieldKey, field] of Object.entries(DEFAULT_POSIZIONI[tipo]).filter(([, f]) => f.isBarcode)) {
      it(`${tipo} / ${fieldKey}: anche un codice lunghissimo si ferma prima del bordo`, () => {
        const w = barcodeLayout('ABCDEFGHIJKLMNOPQRSTUVWXYZ', barcodeMaxWidthMm(tipo, fieldKey, field)).widthMm;
        expect(field.left + w).toBeLessThanOrEqual(TAG_DIMENSIONS[tipo].widthMm - EDGE_MM);
      });
    }
  }

  it('vale anche per le posizioni salvate prima di questa modifica', () => {
    const saved = savedBeforeFix('controllare');
    expect(barcodeMaxWidthMm('controllare', 'barcodeArticolo', saved.barcodeArticolo)).toBe(39);
  });

  it('se il barcode viene trascinato verso destra lo spazio si riduce di conseguenza', () => {
    const field = { ...DEFAULT_POSIZIONI.versare.barcodeArticolo, left: 200 };
    expect(barcodeMaxWidthMm('versare', 'barcodeArticolo', field)).toBe(220 - 200 - EDGE_MM);
  });
});

describe('casi visti nella revisione', () => {
  it('cartellino blu con i dati di esempio: nessun barcode tagliato o troppo fitto', () => {
    expect(formBarcodeWarnings(form('controllare', '01.002.00', 'L-2026-088'), DEFAULT_POSIZIONI.controllare)).toEqual([]);
  });

  it('cartellino 220 mm con codici realistici: i due barcode non si toccano più', () => {
    const warnings = formBarcodeWarnings(form('versare', 'CORPO-MEC-12', 'L-2026-01234'), savedBeforeFix('versare'));
    expect(warnings).toEqual([]);
  });

  it('se in Calibrazione due barcode vengono avvicinati troppo, l\'operatore viene avvisato', () => {
    const positions = { ...DEFAULT_POSIZIONI.versare, barcodeArticolo: { ...DEFAULT_POSIZIONI.versare.barcodeArticolo, left: 50 } };
    const warnings = formBarcodeWarnings(form('versare', '01.002.00', 'L-2026-088'), positions);
    expect(warnings.some((w) => w.includes('si toccano'))).toBe(true);
  });

  it('un lancio con "N°" non stampa un barcode sbagliato: avvisa', () => {
    const warnings = barcodeWarnings('versare', DEFAULT_POSIZIONI.versare, [
      { fieldKey: 'barcodeLancio', label: 'Barcode lancio', value: 'N° 88' }
    ]);
    expect(warnings[0]).toContain('non può stampare');
  });

  it('un barcode disattivato non genera avvisi', () => {
    const f = { ...form('controllare', 'CORPO-MEC-12', ''), showBarcodeArticolo: false };
    expect(formBarcodeWarnings(f, DEFAULT_POSIZIONI.controllare)).toEqual([]);
  });
});
