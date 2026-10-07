import { CartelliniPositions, TagDimensions, CartellinoType } from '../types';

export const TAG_DIMENSIONS: Record<CartellinoType, TagDimensions> = {
  versare: {
    widthMm: 220,
    heightMm: 87,
    name: 'Materiale in Lavorazione (220 x 87 mm)',
    bgImage: '/sfondo-finito.jpg',
    bgSvg: '/sfondo-finito.svg',
    description: 'Cartellino per materiale in lavorazione / da versare (220 x 87 mm)'
  },
  controllare: {
    widthMm: 147.5,
    heightMm: 104,
    name: 'Materiale da Controllare (147.5 x 104 mm)',
    bgImage: '/sfondo-blu.jpg',
    bgSvg: '/sfondo-blu.svg',
    description: 'Cartellino Blu con logo Hydro-Mec, per materiale da controllare'
  }
};

export const DEFAULT_POSIZIONI: CartelliniPositions = {
  controllare: {
    codice: {
      id: 'codice',
      label: 'Codice Articolo (Testo)',
      top: 19,
      left: 38,
      fontSize: 18,
      fontWeight: 'bold'
    },
    revisione: {
      id: 'revisione',
      label: 'Revisione (Testo)',
      top: 19,
      left: 82,
      fontSize: 14,
      fontWeight: 'bold'
    },
    barcodeArticolo: {
      id: 'barcodeArticolo',
      label: 'Barcode Articolo',
      top: 17,
      left: 105,
      fontSize: 8,
      heightMm: 11,
      isBarcode: true
    },
    lancio: {
      id: 'lancio',
      label: 'Numero Lancio (Testo)',
      top: 36,
      left: 38,
      fontSize: 16,
      fontWeight: 'bold'
    },
    barcodeLancio: {
      id: 'barcodeLancio',
      label: 'Barcode Lancio',
      top: 34,
      left: 96,
      fontSize: 8,
      heightMm: 11,
      isBarcode: true
    },
    qta: {
      id: 'qta',
      label: 'Q.tà (Pezzi)',
      top: 53,
      left: 38,
      fontSize: 16,
      fontWeight: 'bold'
    },
    lavorante: {
      id: 'lavorante',
      label: 'Lavorante',
      top: 70,
      left: 48,
      fontSize: 15,
      fontWeight: 'bold'
    },
    data: {
      id: 'data',
      label: 'Data',
      top: 87,
      left: 32,
      fontSize: 13,
      fontWeight: 'bold'
    },
    collo: {
      id: 'collo',
      label: 'Collo',
      top: 87,
      left: 88,
      fontSize: 13,
      fontWeight: 'bold'
    },
    note: {
      id: 'note',
      label: 'Note Libere',
      top: 96,
      left: 32,
      fontSize: 11,
      fontWeight: 'normal'
    }
  },
  versare: {
    lancio: {
      id: 'lancio',
      label: 'Numero Lancio (Testo)',
      top: 34,
      left: 10,
      fontSize: 15,
      fontWeight: 'bold'
    },
    barcodeLancio: {
      id: 'barcodeLancio',
      label: 'Barcode Lancio',
      top: 48,
      left: 8,
      fontSize: 8,
      heightMm: 12,
      isBarcode: true
    },
    codice: {
      id: 'codice',
      label: 'Codice Articolo (Testo)',
      top: 34,
      left: 68,
      fontSize: 18,
      fontWeight: 'bold'
    },
    revisione: {
      id: 'revisione',
      label: 'Revisione (Testo)',
      top: 34,
      left: 132,
      fontSize: 14,
      fontWeight: 'bold'
    },
    barcodeArticolo: {
      id: 'barcodeArticolo',
      label: 'Barcode Articolo',
      top: 48,
      left: 68,
      fontSize: 8,
      heightMm: 12,
      isBarcode: true
    },
    qta: {
      id: 'qta',
      label: 'Q.tà (Pezzi)',
      top: 34,
      left: 175,
      fontSize: 16,
      fontWeight: 'bold'
    },
    lavorante: {
      id: 'lavorante',
      label: 'Lavorante',
      top: 68,
      left: 15,
      fontSize: 14,
      fontWeight: 'bold'
    },
    data: {
      id: 'data',
      label: 'Data',
      top: 68,
      left: 95,
      fontSize: 14,
      fontWeight: 'bold'
    },
    collo: {
      id: 'collo',
      label: 'Collo',
      top: 68,
      left: 160,
      fontSize: 14,
      fontWeight: 'bold'
    },
    note: {
      id: 'note',
      label: 'Note Libere',
      top: 78,
      left: 15,
      fontSize: 12,
      fontWeight: 'normal'
    }
  }
};

export const DEFAULT_ARTICOLI = [
  { id: '1', codice: 'ART-001', rev: 'Rev. 00', descrizione: 'Albero motore diam. 25' },
  { id: '2', codice: 'ART-002', rev: 'Rev. 01', descrizione: 'Flangia riduttore serie H' },
  { id: '3', codice: 'CORPO-MEC-12', rev: 'Rev. 03', descrizione: 'Corpo riduttore ghisa' },
  { id: '4', codice: 'ING-ELIC-34', rev: 'Rev. 02', descrizione: 'Ingranaggio elicoidale z=42' }
];

export const DEFAULT_LAVORANTI = [
  'Mario Rossi',
  'Officina Meccanica A',
  'Reparto B (Tornitura)',
  'Lavorazioni Esterne Spa',
  'Trattamenti Termici Nord'
];

export const STORAGE_KEYS = {
  ARTICOLI: 'hm_articoli_v4',
  LAVORANTI: 'hm_lavoranti_v4',
  POSIZIONI: 'hm_posizioni_v4',
  SETTINGS: 'hm_settings_v4',
  FORM: 'hm_form_v4',
  LEGACY_ARTICOLI: 'hm_articoli_v3',
  LEGACY_LAVORANTI: 'hm_lavoranti_v3',
  LEGACY_POSIZIONI: 'hm_posizioni_v3'
};
