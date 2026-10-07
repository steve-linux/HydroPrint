import React, { useState } from 'react';
import { CartellinoType } from '../types';
import { TAG_DIMENSIONS } from '../constants/defaultPositions';

interface CardBackgroundProps {
  tipo: CartellinoType;
  opacity?: number; // 0 to 100
  customImage?: string;
  isPrint?: boolean;
}

export const CardBackground: React.FC<CardBackgroundProps> = ({
  tipo,
  opacity = 100,
  customImage,
  isPrint = false
}) => {
  const [imgError, setImgError] = useState(false);
  const dim = TAG_DIMENSIONS[tipo];

  // If a custom image is provided or default image path
  const imageSrc = customImage || (tipo === 'controllare' ? '/sfondo-blu.svg' : '/sfondo-finito.svg');

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${
        isPrint ? 'print-hide-bg' : ''
      }`}
      style={{
        opacity: opacity / 100,
        zIndex: 0
      }}
    >
      {!imgError ? (
        <img
          src={imageSrc}
          alt={`Sfondo ${tipo}`}
          className="w-full h-full object-fill block"
          onError={() => setImgError(true)}
        />
      ) : tipo === 'controllare' ? (
        // High fidelity inline SVG fallback for sfondo-blu
        <svg
          viewBox="0 0 1475 1040"
          className="w-full h-full object-fill block"
          preserveAspectRatio="none"
        >
          <rect width="1475" height="1040" fill="#29a7df" />
          <rect x="25" y="22" width="710" height="105" rx="6" fill="#031f38" />
          <g fill="#ffffff">
            <text x="50" y="96" fontFamily="'Arial Black', Impact, sans-serif" fontWeight="900" fontSize="82">
              HYDRO
            </text>
            <circle cx="438" cy="74" r="10" />
            <text x="468" y="96" fontFamily="'Arial Black', Impact, sans-serif" fontWeight="900" fontSize="82">
              ME
            </text>
            <g transform="translate(635, 68)">
              <circle cx="0" cy="0" r="33" fill="#ffffff" />
              <circle cx="0" cy="0" r="18" fill="#031f38" />
              <polygon points="4,-12 36,-12 36,12 4,12" fill="#031f38" />
            </g>
          </g>
          <text
            x="1240"
            y="58"
            textAnchor="middle"
            fontFamily="'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="44"
            fill="#052747"
          >
            MATERIALE DA
          </text>
          <text
            x="1240"
            y="112"
            textAnchor="middle"
            fontFamily="'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="44"
            fill="#052747"
          >
            CONTROLLARE
          </text>
          <line x1="8" y1="138" x2="1467" y2="138" stroke="#0e4370" strokeWidth="3" />
          <line x1="8" y1="312" x2="1467" y2="312" stroke="#0e4370" strokeWidth="3" />
          <line x1="8" y1="482" x2="1467" y2="482" stroke="#0e4370" strokeWidth="3" />
          <line x1="8" y1="652" x2="1467" y2="652" stroke="#0e4370" strokeWidth="3" />
          <line x1="8" y1="822" x2="1467" y2="822" stroke="#0e4370" strokeWidth="3" />
          <line x1="8" y1="992" x2="1467" y2="992" stroke="#0e4370" strokeWidth="3" />
          <text x="28" y="258" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="64" fill="#06223d">
            CODICE:
          </text>
          <text x="28" y="428" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="64" fill="#06223d">
            LANCIO:
          </text>
          <text x="28" y="598" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="64" fill="#06223d">
            Q.TA':
          </text>
          <text x="28" y="768" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="64" fill="#06223d">
            LAVORANTE:
          </text>
          <text x="28" y="938" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="64" fill="#06223d">
            NOTE:
          </text>
        </svg>
      ) : (
        // High fidelity inline SVG fallback for sfondo-finito
        <svg
          viewBox="0 0 2200 870"
          className="w-full h-full object-fill block"
          preserveAspectRatio="none"
        >
          <rect width="2200" height="870" fill="#ffffff" />
          <rect x="6" y="6" width="2188" height="858" fill="none" stroke="#111111" strokeWidth="6" />
          <line x1="6" y1="230" x2="2194" y2="230" stroke="#111111" strokeWidth="6" />
          <g>
            <text x="45" y="105" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="64" fill="#000000">
              HYDRO•MEC
            </text>
            <text x="45" y="195" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="54" fill="#000000">
              COD. LANCIO
            </text>
          </g>
          <rect x="546" y="6" width="1648" height="224" fill="#2b5faa" />
          <text
            x="1370"
            y="108"
            textAnchor="middle"
            fontFamily="'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="74"
            fill="#ffffff"
          >
            MATERIALE FINITO
          </text>
          <text
            x="1370"
            y="196"
            textAnchor="middle"
            fontFamily="'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="66"
            fill="#ffffff"
            letterSpacing="16"
          >
            DA VERSARE
          </text>
          <line x1="546" y1="6" x2="546" y2="864" stroke="#111111" strokeWidth="6" />
          <line x1="1650" y1="230" x2="1650" y2="864" stroke="#111111" strokeWidth="6" />
          <text x="568" y="295" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="52" fill="#000000">
            COD.
          </text>
          <text x="1670" y="295" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="52" fill="#000000">
            Q.tà:
          </text>
        </svg>
      )}
    </div>
  );
};
