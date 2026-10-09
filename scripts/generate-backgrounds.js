import fs from 'fs';
import { execSync } from 'child_process';

const svgBlu = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1475 1040" width="1475" height="1040">
  <rect width="1475" height="1040" fill="#29a7df"/>
  
  <!-- Subtle card texture/gradient -->
  <defs>
    <linearGradient id="gradBlu" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2caae2" />
      <stop offset="100%" stop-color="#249fd7" />
    </linearGradient>
  </defs>
  <rect width="1475" height="1040" fill="url(#gradBlu)"/>

  <!-- Top Logo Banner -->
  <rect x="25" y="22" width="710" height="105" rx="6" fill="#031f38"/>
  <g fill="#ffffff">
    <!-- HYDRO -->
    <text x="50" y="96" font-family="'Arial Black', 'Segoe UI', Impact, sans-serif" font-weight="900" font-size="82" letter-spacing="2">HYDRO</text>
    <!-- Dot -->
    <circle cx="438" cy="74" r="10"/>
    <!-- ME -->
    <text x="468" y="96" font-family="'Arial Black', 'Segoe UI', Impact, sans-serif" font-weight="900" font-size="82" letter-spacing="1">ME</text>
    <!-- C with Cog/Gear -->
    <g transform="translate(635, 68)">
      <circle cx="0" cy="0" r="33" fill="#ffffff"/>
      <!-- Cog teeth -->
      <path d="M-6,-40 h12 v10 h-12 z" />
      <path d="M-6,30 h12 v10 h-12 z" />
      <path d="M-40,-6 h10 v12 h-10 z" />
      <path d="M30,-6 h10 v12 h-10 z" />
      <path d="M-28,-28 l8.5,-8.5 l8.5,8.5 l-8.5,8.5 z" />
      <path d="M20,20 l8.5,-8.5 l8.5,8.5 l-8.5,8.5 z" />
      <path d="M-28,20 l-8.5,8.5 l8.5,8.5 l8.5,-8.5 z" />
      <path d="M20,-28 l8.5,-8.5 l8.5,8.5 l-8.5,8.5 z" />
      <!-- Center cutouts -->
      <circle cx="0" cy="0" r="18" fill="#031f38"/>
      <!-- C cutout opening to right -->
      <polygon points="4,-12 36,-12 36,12 4,12" fill="#031f38"/>
    </g>
  </g>

  <!-- Top Right Title -->
  <text x="1240" y="58" text-anchor="middle" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="44" fill="#052747" letter-spacing="1">MATERIALE DA</text>
  <text x="1240" y="112" text-anchor="middle" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="44" fill="#052747" letter-spacing="1">CONTROLLARE</text>

  <!-- Horizontal divider lines -->
  <line x1="8" y1="138" x2="1467" y2="138" stroke="#0e4370" stroke-width="3"/>
  <line x1="8" y1="312" x2="1467" y2="312" stroke="#0e4370" stroke-width="3"/>
  <line x1="8" y1="482" x2="1467" y2="482" stroke="#0e4370" stroke-width="3"/>
  <line x1="8" y1="652" x2="1467" y2="652" stroke="#0e4370" stroke-width="3"/>
  <line x1="8" y1="822" x2="1467" y2="822" stroke="#0e4370" stroke-width="3"/>
  <line x1="8" y1="992" x2="1467" y2="992" stroke="#0e4370" stroke-width="3"/>

  <!-- Row Labels -->
  <text x="28" y="258" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="64" fill="#06223d" letter-spacing="1">CODICE:</text>
  <text x="28" y="428" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="64" fill="#06223d" letter-spacing="1">LANCIO:</text>
  <text x="28" y="598" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="64" fill="#06223d" letter-spacing="1">Q.TA':</text>
  <text x="28" y="768" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="64" fill="#06223d" letter-spacing="1">LAVORANTE:</text>
  <text x="28" y="938" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="64" fill="#06223d" letter-spacing="1">NOTE:</text>
</svg>
`;

const svgFinito = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2190 870" width="2190" height="870">
  <rect width="2190" height="870" fill="#ffffff"/>
  
  <!-- Outer perimeter line -->
  <rect x="6" y="6" width="2178" height="858" fill="none" stroke="#111111" stroke-width="6"/>

  <!-- Header horizontal separator -->
  <line x1="6" y1="230" x2="2184" y2="230" stroke="#111111" stroke-width="6"/>

  <!-- Header Left Box -->
  <g>
    <!-- HYDRO•MEC -->
    <text x="45" y="105" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="64" fill="#000000" letter-spacing="1">HYDRO•MEC</text>
    <text x="45" y="195" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="54" fill="#000000" letter-spacing="1">COD. LANCIO</text>
  </g>

  <!-- Header Right Blue Banner -->
  <rect x="546" y="6" width="1638" height="224" fill="#2b5faa"/>
  <text x="1365" y="108" text-anchor="middle" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="74" fill="#ffffff" letter-spacing="2">MATERIALE FINITO</text>
  <text x="1365" y="196" text-anchor="middle" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="66" fill="#ffffff" letter-spacing="16">DA VERSARE</text>

  <!-- Vertical separator lines in body -->
  <!-- Col 1 / 2 border -->
  <line x1="546" y1="6" x2="546" y2="864" stroke="#111111" stroke-width="6"/>
  <!-- Col 2 / 3 border -->
  <line x1="1650" y1="230" x2="1650" y2="864" stroke="#111111" stroke-width="6"/>

  <!-- Labels inside columns -->
  <text x="568" y="295" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="52" fill="#000000">COD.</text>
  <text x="1670" y="295" font-family="'Arial Black', 'Segoe UI', sans-serif" font-weight="900" font-size="52" fill="#000000">Q.tà:</text>
</svg>
`;

fs.writeFileSync('public/sfondo-blu.svg', svgBlu);
fs.writeFileSync('public/sfondo-finito.svg', svgFinito);

try {
  execSync('convert -density 150 public/sfondo-blu.svg public/sfondo-blu.jpg');
  execSync('convert -density 150 public/sfondo-finito.svg public/sfondo-finito.jpg');
  console.log('Successfully generated sfondo-blu.jpg and sfondo-finito.jpg');
} catch (e) {
  console.error('Convert failed, copying SVG as fallback', e);
  fs.copyFileSync('public/sfondo-blu.svg', 'public/sfondo-blu.jpg');
  fs.copyFileSync('public/sfondo-finito.svg', 'public/sfondo-finito.jpg');
}
