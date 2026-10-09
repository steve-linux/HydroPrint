import { beforeAll, describe, expect, it } from 'vitest';
import {
  fieldText,
  findArticolo,
  formatDateIt,
  missingRequired,
  refreshAutoDate,
  revisionAfterCodeChange,
  todayIso
} from './cartellino';
import { Articolo, CartellinoFormData } from '../types';

// Il PC dell'officina è in Italia: i test girano con lo stesso fuso orario.
beforeAll(() => {
  process.env.TZ = 'Europe/Rome';
});

const emptyForm: CartellinoFormData = {
  tipo: 'versare',
  codiceArticolo: '',
  revisione: '',
  numeroLancio: '',
  numeroPezzi: '',
  lavorante: '',
  data: '2026-10-08',
  collo: '1/1',
  colloNumero: '1',
  colloTotale: '1',
  noteLibere: '',
  showBarcodeArticolo: true,
  showBarcodeLancio: true
};

const articoli: Articolo[] = [
  { id: '1', codice: '01.002.00', rev: 'Rev. 01' },
  { id: '2', codice: '01.003.00', rev: 'Rev. 04' }
];

describe('data del cartellino', () => {
  it('a mezzanotte e mezza è già il giorno nuovo (prima usciva la data di ieri)', () => {
    const notte = new Date(2026, 9, 8, 0, 30); // 8 ottobre, 00:30 ora italiana
    expect(notte.toISOString().slice(0, 10)).toBe('2026-10-07'); // il vecchio metodo, in UTC
    expect(todayIso(notte)).toBe('2026-10-08');
  });

  it('formatta la data in italiano senza spostarla di un giorno', () => {
    expect(formatDateIt('2026-10-08')).toBe('08/10/2026');
    expect(formatDateIt('2026-01-01')).toBe('01/01/2026');
    expect(formatDateIt('')).toBe('');
  });

  it('la data automatica segue il nuovo giorno se l\'app resta aperta', () => {
    expect(refreshAutoDate('2026-10-07', '2026-10-07', '2026-10-08')).toEqual({
      data: '2026-10-08',
      autoValue: '2026-10-08'
    });
  });

  it('una data scelta a mano non viene mai cambiata', () => {
    expect(refreshAutoDate('2026-09-30', '2026-10-07', '2026-10-08')).toEqual({
      data: '2026-09-30',
      autoValue: '2026-10-07'
    });
  });
});

describe('testo stampato', () => {
  it('un modulo vuoto non stampa dati inventati', () => {
    for (const key of ['codice', 'revisione', 'lancio', 'qta', 'lavorante', 'note']) {
      expect(fieldText(key, emptyForm)).toBe('');
    }
  });

  it('stampa i dati inseriti', () => {
    const form = { ...emptyForm, codiceArticolo: '01.002.00', numeroPezzi: '40', colloNumero: '2', colloTotale: '3' };
    expect(fieldText('codice', form)).toBe('01.002.00');
    expect(fieldText('qta', form)).toBe('40 PZ');
    expect(fieldText('data', form)).toBe('08/10/2026');
    expect(fieldText('collo', form)).toBe('Collo: 2/3');
  });

  it('elenca i campi obbligatori mancanti', () => {
    expect(missingRequired(emptyForm)).toEqual(['Codice articolo', 'Revisione', 'Numero lancio']);
    expect(
      missingRequired({ ...emptyForm, codiceArticolo: 'X', revisione: 'Rev. 00', numeroLancio: '  ' })
    ).toEqual(['Numero lancio']);
  });
});

describe('codice articolo e revisione', () => {
  it('trova l\'articolo anche con maiuscole o spazi diversi', () => {
    expect(findArticolo(articoli, ' 01.002.00 ')?.rev).toBe('Rev. 01');
    expect(findArticolo(articoli, '01.002')).toBeUndefined();
    expect(findArticolo(articoli, '')).toBeUndefined();
  });

  it('un codice in anagrafica porta la sua revisione', () => {
    expect(revisionAfterCodeChange(articoli, '01.002.00', 'Rev. 01', '01.003.00')).toBe('Rev. 04');
  });

  it('un codice nuovo non si tiene la revisione dell\'articolo di prima', () => {
    expect(revisionAfterCodeChange(articoli, '01.002.00', 'Rev. 01', '01.009.00')).toBe('');
  });

  it('una revisione scritta a mano resta', () => {
    expect(revisionAfterCodeChange(articoli, '01.009.00', 'Rev. 07', '01.009.01')).toBe('Rev. 07');
  });

  it('cancellando il codice si cancella anche la revisione automatica', () => {
    expect(revisionAfterCodeChange(articoli, '01.002.00', 'Rev. 01', '')).toBe('');
  });
});
