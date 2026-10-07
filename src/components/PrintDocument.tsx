import React from 'react';
import { CartellinoType, FieldCalibration, CartellinoFormData, AppSettings } from '../types';
import { TAG_DIMENSIONS } from '../constants/defaultPositions';
import { CardBackground } from './CardBackground';
import { BarcodeRenderer } from './BarcodeRenderer';

interface PrintDocumentProps {
  tipo: CartellinoType;
  positions: Record<string, FieldCalibration>;
  formData: CartellinoFormData;
  settings: AppSettings;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  tipo,
  positions,
  formData,
  settings
}) => {
  const dim = TAG_DIMENSIONS[tipo];

  // Se l'utente ha compilato almeno un campo, stampa i dati reali.
  // Se tutti i campi sono vuoti, stampa dati di prova di default così l'anteprima del driver non è mai bianca!
  const hasAnyData = Boolean(
    formData.codiceArticolo ||
    formData.revisione ||
    formData.numeroLancio ||
    formData.numeroPezzi ||
    formData.lavorante
  );

  const getFieldText = (fieldKey: string): string => {
    if (hasAnyData) {
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
          return formattedDate;
        case 'collo':
          return formattedCollo;
        case 'note':
          return formData.noteLibere || '';
        default:
          return '';
      }
    } else {
      // Dati di prova per test stampa e allineamento cartellino vuoto
      const formattedDate = new Date().toLocaleDateString('it-IT');
      switch (fieldKey) {
        case 'codice':
          return '01.002.00';
        case 'revisione':
          return 'Rev. 01';
        case 'lancio':
          return 'L-2026-088';
        case 'qta':
          return '150 PZ';
        case 'lavorante':
          return 'TORNERIA MECCANICA';
        case 'data':
          return formattedDate;
        case 'collo':
          return 'Collo: 1/1';
        case 'note':
          return 'TEST ALLINEAMENTO';
        default:
          return '';
      }
    }
  };

  const barcodeArticoloVal = hasAnyData
    ? formData.codiceArticolo
    : '01.002.00';

  const barcodeLancioVal = hasAnyData
    ? formData.numeroLancio
    : 'L-2026-088';

  return (
    <div
      id="print-root"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${dim.widthMm}mm`,
        height: `${dim.heightMm}mm`,
        minWidth: `${dim.widthMm}mm`,
        minHeight: `${dim.heightMm}mm`,
        maxWidth: `${dim.widthMm}mm`,
        maxHeight: `${dim.heightMm}mm`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: settings.printWithBackground ? '#ffffff' : 'transparent',
        border: settings.printBorder ? '0.5pt solid #000000' : 'none',
        color: '#000000',
        margin: 0,
        padding: 0
      }}
    >
      {/* Sfondo cartellino stampabile (solo se richiesto con spunta es. per carta bianca) */}
      {settings.printWithBackground && (
        <CardBackground
          tipo={tipo}
          opacity={100}
          customImage={settings.customBgImages?.[tipo]}
          isPrint={false}
        />
      )}

      {/* Campi stampabili calibrati al millimetro */}
      {Object.entries(positions).map(([fieldKey, field]) => {
        if (fieldKey === 'info') return null;

        const isBarcodeArticolo = fieldKey === 'barcodeArticolo';
        const isBarcodeLancio = fieldKey === 'barcodeLancio';
        const isCollo = fieldKey === 'collo';

        // Salta barcode disattivati o senza valore
        if (isBarcodeArticolo) {
          if (!formData.showBarcodeArticolo || !barcodeArticoloVal) return null;
        }
        if (isBarcodeLancio) {
          if (!formData.showBarcodeLancio || !barcodeLancioVal) return null;
        }

        const textContent = getFieldText(fieldKey);
        if (!isBarcodeArticolo && !isBarcodeLancio && !textContent) return null;

        return (
          <div
            key={fieldKey}
            className="print-field"
            style={{
              position: 'absolute',
              top: `${field.top}mm`,
              left: `${field.left}mm`,
              fontSize: `${field.fontSize}pt`,
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontWeight: field.fontWeight || 'bold',
              color: '#000000',
              lineHeight: '1.1',
              zIndex: 10,
              boxSizing: 'border-box'
            }}
          >
            {isBarcodeArticolo ? (
              <BarcodeRenderer
                value={barcodeArticoloVal}
                heightMm={field.heightMm || 12}
                displayValue={false}
              />
            ) : isBarcodeLancio ? (
              <BarcodeRenderer
                value={barcodeLancioVal}
                heightMm={field.heightMm || 12}
                displayValue={false}
              />
            ) : isCollo ? (
              <span
                style={{
                  display: 'inline-block',
                  border: '1.5px solid #000000',
                  padding: '0.6mm 2.2mm',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap'
                }}
              >
                {textContent}
              </span>
            ) : (
              <span>{textContent}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
