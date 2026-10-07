export type CartellinoType = 'controllare' | 'versare';

export interface Articolo {
  id: string;
  codice: string;
  rev: string;
  descrizione?: string;
}

export interface FieldCalibration {
  id: string;
  label: string;
  top: number; // in mm
  left: number; // in mm
  fontSize: number; // in pt
  fontWeight?: 'normal' | 'bold';
  align?: 'left' | 'center' | 'right';
  maxWidth?: number; // in mm (optional)
  heightMm?: number; // in mm for barcodes or boxes
  isBarcode?: boolean;
}

export interface TagDimensions {
  widthMm: number;
  heightMm: number;
  name: string;
  bgImage: string;
  bgSvg: string;
  description: string;
}

export type TagPositions = Record<string, FieldCalibration>;

export interface CartelliniPositions {
  controllare: Record<string, FieldCalibration>;
  versare: Record<string, FieldCalibration>;
}

export interface CartellinoFormData {
  tipo: CartellinoType;
  codiceArticolo: string;
  revisione: string;
  numeroLancio: string;
  numeroPezzi: string;
  lavorante: string;
  data: string;
  collo: string;
  colloNumero?: string;
  colloTotale?: string;
  noteLibere?: string;
  showBarcodeArticolo: boolean; // Flag to enable/disable and print/not print barcode articolo
  showBarcodeLancio: boolean; // Flag to enable/disable and print/not print barcode lancio
}

export interface AppSettings {
  isLocked: boolean; // Blocco/sblocco calibrazione e drag & drop
  showBackground: boolean; // Visualizza sfondo-blu / sfondo-finito
  backgroundOpacity: number; // 0 to 100
  printWithBackground: boolean; // Stampa anche lo sfondo o solo i testi
  printBorder?: boolean; // Stampa contorno sottile cartellino (per test o foglio bianco)
  zoomLevel: number; // In percentage
  showGridLines: boolean; // Linee guida mm
  printMode?: 'direct' | 'a4_bypass'; // Modalità stampa: formato diretto @page vs foglio A4 scala 100%
  a4Alignment?: 'top_left' | 'center'; // Allineamento sul foglio A4
  showCutMarks?: boolean; // Mostra guide di ritaglio
  customBgImages?: {
    controllare?: string;
    versare?: string;
  };
}

export interface FullBackupData {
  version: string;
  exportDate: string;
  appName: string;
  articoli: Articolo[];
  lavoranti: string[];
  posizioni: CartelliniPositions;
  settings?: Partial<AppSettings>;
}
