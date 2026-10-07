import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { barcodeLayout } from '../lib/barcode';

interface BarcodeRendererProps {
  value: string;
  heightMm?: number; // height in mm
  maxWidthMm: number; // spazio massimo in larghezza: il codice si stringe per starci
  isPrint?: boolean; // in stampa un codice non valido non lascia nulla sul cartellino
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  heightMm = 12,
  maxWidthMm,
  isPrint = false,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const cleanVal = (value || '').trim();
  const layout = barcodeLayout(cleanVal, maxWidthMm);

  useEffect(() => {
    if (!svgRef.current || !layout.ok) return;
    // Un'unità SVG = un modulo, senza margini: la larghezza in mm la decide barcodeLayout().
    JsBarcode(svgRef.current, cleanVal, {
      format: 'CODE128',
      width: 1,
      height: 100,
      displayValue: false,
      margin: 0,
      background: 'transparent',
      lineColor: '#000000'
    });
    svgRef.current.setAttribute('preserveAspectRatio', 'none');
  }, [cleanVal, layout.ok]);

  if (!cleanVal) {
    return null;
  }

  if (!layout.ok) {
    if (isPrint) return null;
    return (
      <div className="text-[10px] font-mono text-red-600 border border-red-300 p-1 rounded bg-red-50">
        Barcode non stampabile: {value}
      </div>
    );
  }

  return (
    <div className={`inline-block select-none leading-none ${className}`}>
      <svg
        ref={svgRef}
        className="block"
        style={{
          width: `${layout.widthMm}mm`,
          height: `${heightMm}mm`
        }}
      />
    </div>
  );
};
