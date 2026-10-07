import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  heightMm?: number; // height in mm
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  heightMm = 12,
  displayValue = false,
  fontSize = 10,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;
    const cleanVal = (value || '').trim();

    if (!cleanVal) {
      setHasError(false);
      return;
    }

    try {
      setHasError(false);
      JsBarcode(svgRef.current, cleanVal, {
        format: 'CODE128',
        width: 1.4,
        height: Math.max(15, Math.round(heightMm * 3.2)),
        displayValue: displayValue,
        fontSize: fontSize,
        font: 'Arial',
        fontOptions: 'bold',
        textMargin: 1,
        margin: 2,
        background: 'transparent',
        lineColor: '#000000'
      });
    } catch (err) {
      console.warn('Barcode generation warning for value:', cleanVal, err);
      setHasError(true);
    }
  }, [value, heightMm, displayValue, fontSize]);

  if (!value || !value.trim()) {
    return null;
  }

  if (hasError) {
    return (
      <div className="text-[10px] font-mono text-red-600 border border-red-300 p-1 rounded bg-red-50">
        Barcode err: {value}
      </div>
    );
  }

  return (
    <div className={`inline-block select-none leading-none ${className}`}>
      <svg
        ref={svgRef}
        className="block"
        style={{
          maxHeight: `${heightMm}mm`,
          height: `${heightMm}mm`,
          width: 'auto'
        }}
      />
    </div>
  );
};
