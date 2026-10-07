import { Articolo, CartellinoFormData } from '../types';

// Data di oggi nel fuso orario del PC (YYYY-MM-DD).
// toISOString() usa UTC: tra mezzanotte e le 2 (ora legale) darebbe la data di ieri.
export const todayIso = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// "2026-10-08" -> "08/10/2026" senza passare da new Date(), che leggerebbe la stringa come UTC.
export const formatDateIt = (iso: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!match) return iso || '';
  return `${match[3]}/${match[2]}/${match[1]}`;
};

// La data compilata in automatico segue il giorno corrente (app lasciata aperta di notte);
// una data scelta a mano dall'operatore non viene mai toccata.
export const refreshAutoDate = (
  current: string,
  autoValue: string,
  today: string
): { data: string; autoValue: string } => {
  if (current === autoValue && current !== today) {
    return { data: today, autoValue: today };
  }
  return { data: current, autoValue };
};

// Dati di esempio usati SOLO dal pulsante "Stampa di prova" (allineamento su cartellino vuoto).
export const SAMPLE_FORM: Omit<CartellinoFormData, 'tipo' | 'data' | 'showBarcodeArticolo' | 'showBarcodeLancio'> = {
  codiceArticolo: '01.002.00',
  revisione: 'Rev. 01',
  numeroLancio: 'L-2026-088',
  numeroPezzi: '150',
  lavorante: 'TORNERIA MECCANICA',
  collo: '1/1',
  colloNumero: '1',
  colloTotale: '1',
  noteLibere: 'TEST ALLINEAMENTO'
};

export const formatCollo = (formData: CartellinoFormData): string => {
  if (formData.colloNumero !== undefined && formData.colloTotale !== undefined) {
    return `Collo: ${formData.colloNumero || '1'}/${formData.colloTotale || '1'}`;
  }
  if (formData.collo) {
    return formData.collo.toLowerCase().includes('collo') ? formData.collo : `Collo: ${formData.collo}`;
  }
  return 'Collo: 1/1';
};

// Testo stampato per ciascun campo. Un campo vuoto resta vuoto: niente dati inventati.
export const fieldText = (fieldKey: string, formData: CartellinoFormData): string => {
  switch (fieldKey) {
    case 'codice':
      return formData.codiceArticolo || '';
    case 'revisione':
      return formData.revisione || '';
    case 'lancio':
      return formData.numeroLancio || '';
    case 'qta':
      return formData.numeroPezzi ? `${formData.numeroPezzi} PZ` : '';
    case 'lavorante':
      return formData.lavorante || '';
    case 'data':
      return formatDateIt(formData.data);
    case 'collo':
      return formatCollo(formData);
    case 'note':
      return formData.noteLibere || '';
    default:
      return '';
  }
};

// Campi segnati con * nel modulo.
const REQUIRED: { key: keyof CartellinoFormData; label: string }[] = [
  { key: 'codiceArticolo', label: 'Codice articolo' },
  { key: 'revisione', label: 'Revisione' },
  { key: 'numeroLancio', label: 'Numero lancio' }
];

export const missingRequired = (formData: CartellinoFormData): string[] =>
  REQUIRED.filter(({ key }) => !String(formData[key] ?? '').trim()).map(({ label }) => label);
