import React from 'react';
import { CartellinoType, FieldCalibration, CartellinoFormData, AppSettings } from '../types';
import { TAG_DIMENSIONS } from '../constants/defaultPositions';
import { CardBackground } from './CardBackground';
import { BarcodeRenderer } from './BarcodeRenderer';
import { SAMPLE_FORM, fieldText } from '../lib/cartellino';
import { barcodeMaxWidthMm } from '../lib/barcode';

interface PrintDocumentProps {
  tipo: CartellinoType;
  positions: Record<string, FieldCalibration>;
  formData: CartellinoFormData;
  settings: AppSettings;
  // true solo per il pulsante "Stampa di prova": stampa dati di esempio per controllare l'allineamento
  testPrint?: boolean;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  tipo,
  positions,
  formData,
  settings,
  testPrint = false
}) => {
  const dim = TAG_DIMENSIONS[tipo];
  const isA4Mode = settings.printMode === 'a4_bypass';

  // Sempre e solo i dati inseriti: un campo vuoto resta vuoto sul cartellino.
  // I dati di esempio escono soltanto con la stampa di prova, chiesta apposta.
  const data: CartellinoFormData = testPrint ? { ...formData, ...SAMPLE_FORM } : formData;
  const getFieldText = (fieldKey: string): string => fieldText(fieldKey, data);
  const barcodeArticoloVal = data.codiceArticolo;
  const barcodeLancioVal = data.numeroLancio;

  return (
    <>
      {/* 
        DIRETTIVA CRITICA DI RISOLUZIONE COMPRESSIONE 219mm:
        Iniezione esplicita di @page con la larghezza e altezza esatta del cartellino.
        Questo impedisce al motore di stampa di Windows 11 / Edge di ereditare
        il formato A6 (148 mm) del cartellino precedente o di comprimere 219mm su 150mm.
      */}
      <style>
        {isA4Mode
          ? `
            @page {
              size: A4 landscape !important;
              margin: 0mm !important;
            }
            @media print {
              #print-container-a4 {
                width: 297mm !important;
                height: 210mm !important;
                position: relative !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
              }
            }
          `
          : `
            @page {
              size: ${dim.widthMm}mm ${dim.heightMm}mm !important;
              margin: 0mm !important;
            }
            @media print {
              html, body {
                width: ${dim.widthMm}mm !important;
                height: ${dim.heightMm}mm !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              #root {
                width: ${dim.widthMm}mm !important;
                height: ${dim.heightMm}mm !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          `}
      </style>

      <div
        id={isA4Mode ? 'print-container-a4' : undefined}
        style={
          isA4Mode
            ? {
                position: 'absolute',
                left: 0,
                top: 0,
                width: '297mm',
                height: '210mm',
                boxSizing: 'border-box'
              }
            : undefined
        }
      >
        <div
          id="print-root"
          style={{
            position: 'absolute',
            left: isA4Mode ? (settings.a4Alignment === 'center' ? '38.5mm' : '10mm') : 0,
            top: isA4Mode ? (settings.a4Alignment === 'center' ? '61.5mm' : '10mm') : 0,
            width: `${dim.widthMm}mm`,
            height: `${dim.heightMm}mm`,
            minWidth: `${dim.widthMm}mm`,
            minHeight: `${dim.heightMm}mm`,
            maxWidth: `${dim.widthMm}mm`,
            maxHeight: `${dim.heightMm}mm`,
            boxSizing: 'border-box',
            overflow: 'hidden',
            backgroundColor: settings.printWithBackground ? '#ffffff' : 'transparent',
            border: settings.printBorder || (isA4Mode && settings.showCutMarks) ? '0.5pt solid #000000' : 'none',
            color: '#000000',
            margin: 0,
            padding: 0,
            transform: 'none'
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
                    maxWidthMm={barcodeMaxWidthMm(tipo, fieldKey, field)}
                    isPrint
                  />
                ) : isBarcodeLancio ? (
                  <BarcodeRenderer
                    value={barcodeLancioVal}
                    heightMm={field.heightMm || 12}
                    maxWidthMm={barcodeMaxWidthMm(tipo, fieldKey, field)}
                    isPrint
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
      </div>
    </>
  );
};
