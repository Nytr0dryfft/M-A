const fs = require('fs');
const path = require('path');

const clubsDir = path.join(__dirname, '..', 'public', 'clubs');

// Data for each club with its unique logo.svg and cnc.svg
const clubsData = {
  palmeiras: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- PALMEIRAS LOGO OFICIAL -->
  <defs>
    <path id="palm-text-arc" d="M 68 180 A 135 135 0 0 1 332 180" fill="none" />
  </defs>
  <circle cx="200" cy="200" r="190" fill="#006437" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#FFFFFF" />
  <circle cx="200" cy="200" r="162" fill="#006437" />
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" letter-spacing="4">
    <textPath href="#palm-text-arc" startOffset="50%" text-anchor="middle">PALMEIRAS</textPath>
  </text>
  <!-- 8 Estrelas no anel -->
  <g fill="#FFFFFF">
    <polygon points="200,344 204,354 214,354 206,360 209,370 200,364 191,370 194,360 186,354 196,354" />
    <polygon points="152,336 156,346 166,346 158,352 161,362 152,356 143,362 146,352 138,346 148,346" />
    <polygon points="248,336 252,346 262,346 254,352 257,362 248,356 239,362 242,352 234,346 244,346" />
    <polygon points="110,312 114,322 124,322 116,328 119,338 110,332 101,338 104,328 96,322 106,322" />
    <polygon points="290,312 294,322 304,322 296,328 299,338 290,332 281,338 284,328 276,322 286,322" />
    <polygon points="76,275 80,285 90,285 82,291 85,301 76,295 67,301 70,291 62,285 72,285" />
    <polygon points="324,275 328,285 338,285 330,291 333,301 324,295 315,301 318,291 310,285 320,285" />
    <polygon points="56,230 60,240 70,240 62,246 65,256 56,250 47,256 50,246 42,240 52,240" />
  </g>
  <!-- Escudo Central do Palestra -->
  <circle cx="200" cy="200" r="102" fill="#FFFFFF" stroke="#006437" stroke-width="4" />
  <circle cx="200" cy="200" r="95" fill="#006437" />
  <!-- Raios do Palestra -->
  <g stroke="#FFFFFF" stroke-width="3" opacity="0.9">
    <line x1="200" y1="105" x2="200" y2="295" />
    <line x1="105" y1="200" x2="295" y2="200" />
    <line x1="133" y1="133" x2="267" y2="267" />
    <line x1="133" y1="267" x2="267" y2="133" />
    <line x1="163" y1="112" x2="237" y2="288" />
    <line x1="237" y1="112" x2="163" y2="288" />
    <line x1="112" y1="163" x2="288" y2="237" />
    <line x1="112" y1="237" x2="288" y2="163" />
  </g>
  <!-- Monograma P clássico central -->
  <path d="M 182 145 H 208 C 226 145 238 155 238 172 C 238 189 226 199 208 199 H 196 V 255 H 182 Z M 196 158 V 186 H 207 C 218 186 224 180 224 172 C 224 164 218 158 207 158 Z" fill="#FFFFFF" stroke="#006437" stroke-width="2" />
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - PALMEIRAS -->
  <defs>
    <path id="palm-cnc-arc" d="M 68 180 A 135 135 0 0 1 332 180" fill="none" />
  </defs>
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta externa da borda circular chanfrada -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="12" />
    <!-- Canaleta do anel secundario -->
    <circle cx="200" cy="200" r="162" fill="none" stroke-width="6" />
    <!-- Texto PALMEIRAS usinado em arco -->
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" letter-spacing="4" stroke="none">
      <textPath href="#palm-cnc-arc" startOffset="50%" text-anchor="middle">PALMEIRAS</textPath>
    </text>
    <!-- 8 Estrelas usinadas -->
    <polygon points="200,344 204,354 214,354 206,360 209,370 200,364 191,370 194,360 186,354 196,354" stroke="none" />
    <polygon points="152,336 156,346 166,346 158,352 161,362 152,356 143,362 146,352 138,346 148,346" stroke="none" />
    <polygon points="248,336 252,346 262,346 254,352 257,362 248,356 239,362 242,352 234,346 244,346" stroke="none" />
    <polygon points="110,312 114,322 124,322 116,328 119,338 110,332 101,338 104,328 96,322 106,322" stroke="none" />
    <polygon points="290,312 294,322 304,322 296,328 299,338 290,332 281,338 284,328 276,322 286,322" stroke="none" />
    <polygon points="76,275 80,285 90,285 82,291 85,301 76,295 67,301 70,291 62,285 72,285" stroke="none" />
    <polygon points="324,275 328,285 338,285 330,291 333,301 324,295 315,301 318,291 310,285 320,285" stroke="none" />
    <polygon points="56,230 60,240 70,240 62,246 65,256 56,250 47,256 50,246 42,240 52,240" stroke="none" />
    <!-- Anel do Escudo Central -->
    <circle cx="200" cy="200" r="102" fill="none" stroke-width="8" />
    <!-- Raios canelados usinados do Palestra -->
    <g stroke-width="4">
      <line x1="200" y1="105" x2="200" y2="295" />
      <line x1="105" y1="200" x2="295" y2="200" />
      <line x1="133" y1="133" x2="267" y2="267" />
      <line x1="133" y1="267" x2="267" y2="133" />
      <line x1="163" y1="112" x2="237" y2="288" />
      <line x1="237" y1="112" x2="163" y2="288" />
      <line x1="112" y1="163" x2="288" y2="237" />
      <line x1="112" y1="237" x2="288" y2="163" />
    </g>
    <!-- Monograma P usinado em baixo-relevo -->
    <path d="M 180 142 H 210 C 230 142 242 153 242 172 C 242 191 230 202 210 202 H 198 V 258 H 180 Z M 198 156 V 188 H 208 C 220 188 228 181 228 172 C 228 163 220 156 208 156 Z" stroke="none" />
  </g>
</svg>`
  },

  corinthians: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- CORINTHIANS LOGO OFICIAL -->
  <defs>
    <path id="cor-top-arc" d="M 75 195 A 125 125 0 0 1 325 195" fill="none" />
    <path id="cor-bot-arc" d="M 315 225 A 125 125 0 0 1 85 225" fill="none" />
  </defs>
  <!-- Ancora nautica e Remos cruzados -->
  <g stroke="#C4122D" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Remos -->
    <line x1="60" y1="60" x2="340" y2="380" />
    <line x1="340" y1="60" x2="60" y2="380" />
    <!-- Cabos da ancora -->
    <path d="M 200 40 V 420" stroke-width="16" />
    <path d="M 110 390 C 140 430 260 430 290 390" stroke-width="18" />
  </g>
  <circle cx="200" cy="50" r="16" fill="none" stroke="#C4122D" stroke-width="8" />
  <!-- Boia circular com corda -->
  <circle cx="200" cy="210" r="145" fill="#FFFFFF" stroke="#000000" stroke-width="8" />
  <circle cx="200" cy="210" r="130" fill="#111111" />
  <circle cx="200" cy="210" r="92" fill="#FFFFFF" stroke="#C4122D" stroke-width="6" />
  <!-- Texto em arco -->
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" letter-spacing="2">
    <textPath href="#cor-top-arc" startOffset="50%" text-anchor="middle">S.C. CORINTHIANS PAULISTA</textPath>
  </text>
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" letter-spacing="5">
    <textPath href="#cor-bot-arc" startOffset="50%" text-anchor="middle">★ 1910 ★</textPath>
  </text>
  <!-- Bandeira Paulista no Centro -->
  <g transform="translate(142, 160)">
    <!-- 13 Listras -->
    <rect x="0" y="0" width="116" height="95" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
    <rect x="0" y="7" width="116" height="7" fill="#000000" />
    <rect x="0" y="21" width="116" height="7" fill="#000000" />
    <rect x="0" y="35" width="116" height="7" fill="#000000" />
    <rect x="0" y="49" width="116" height="7" fill="#000000" />
    <rect x="0" y="63" width="116" height="7" fill="#000000" />
    <rect x="0" y="77" width="116" height="7" fill="#000000" />
    <rect x="0" y="91" width="116" height="4" fill="#000000" />
    <!-- Cantao Vermelho -->
    <rect x="0" y="0" width="46" height="42" fill="#C4122D" />
    <circle cx="23" cy="21" r="13" fill="#FFFFFF" />
    <circle cx="23" cy="21" r="9" fill="#000000" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - CORINTHIANS -->
  <defs>
    <path id="cor-top-cnc-arc" d="M 75 195 A 125 125 0 0 1 325 195" fill="none" />
    <path id="cor-bot-cnc-arc" d="M 315 225 A 125 125 0 0 1 85 225" fill="none" />
  </defs>
  <g fill="#000000" stroke="#000000">
    <!-- Ancora e Remos usinados (fresa de 10mm) -->
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <line x1="60" y1="60" x2="340" y2="380" stroke-width="12" />
      <line x1="340" y1="60" x2="60" y2="380" stroke-width="12" />
      <path d="M 200 40 V 420" stroke-width="14" />
      <path d="M 110 390 C 140 430 260 430 290 390" stroke-width="16" />
      <circle cx="200" cy="50" r="16" stroke-width="8" />
    </g>
    <!-- Canaletas circulares da boia -->
    <circle cx="200" cy="210" r="145" fill="none" stroke-width="10" />
    <circle cx="200" cy="210" r="130" fill="none" stroke-width="6" />
    <circle cx="200" cy="210" r="92" fill="none" stroke-width="8" />
    <!-- Texto do anel desbastado -->
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="18" letter-spacing="2" stroke="none">
      <textPath href="#cor-top-cnc-arc" startOffset="50%" text-anchor="middle">S.C. CORINTHIANS PAULISTA</textPath>
    </text>
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="20" letter-spacing="5" stroke="none">
      <textPath href="#cor-bot-cnc-arc" startOffset="50%" text-anchor="middle">★ 1910 ★</textPath>
    </text>
    <!-- Bandeira no centro desbastada -->
    <g transform="translate(142, 160)" stroke="none">
      <rect x="0" y="7" width="116" height="7" />
      <rect x="0" y="21" width="116" height="7" />
      <rect x="0" y="35" width="116" height="7" />
      <rect x="0" y="49" width="116" height="7" />
      <rect x="0" y="63" width="116" height="7" />
      <rect x="0" y="77" width="116" height="7" />
      <!-- Cantao -->
      <rect x="0" y="0" width="46" height="42" fill="none" stroke="#000000" stroke-width="4" />
      <circle cx="23" cy="21" r="10" fill="none" stroke="#000000" stroke-width="5" />
    </g>
  </g>
</svg>`
  },

  'sao-paulo': {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- SAO PAULO FC LOGO OFICIAL -->
  <!-- 5 Estrelas no topo -->
  <g fill="#D4AF37">
    <polygon points="160,35 163,45 173,45 165,51 168,61 160,55 152,61 155,51 147,45 157,45" />
    <polygon points="240,35 243,45 253,45 245,51 248,61 240,55 232,61 235,51 227,45 237,45" />
  </g>
  <g fill="#CC0000">
    <polygon points="120,40 123,50 133,50 125,56 128,66 120,60 112,66 115,56 107,50 117,50" />
    <polygon points="200,20 203,30 213,30 205,36 208,46 200,40 192,46 195,36 187,30 197,30" />
    <polygon points="280,40 283,50 293,50 285,56 288,66 280,60 272,66 275,56 267,50 277,50" />
  </g>
  <!-- Escudo Triangular Clássico -->
  <polygon points="30,85 370,85 200,415" fill="#FFFFFF" stroke="#000000" stroke-width="12" stroke-linejoin="round" />
  <!-- Faixa preta com SPFC -->
  <polygon points="38,93 362,93 362,175 38,175" fill="#000000" />
  <text x="200" y="155" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="56" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">SPFC</text>
  <!-- Triangulos Vermelho e Preto inferiores -->
  <polygon points="46,183 194,183 194,395" fill="#CC0000" />
  <polygon points="206,183 354,183 206,395" fill="#000000" />
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - SAO PAULO FC -->
  <g fill="#000000" stroke="#000000">
    <!-- 5 Estrelas no topo usinadas -->
    <polygon points="160,35 163,45 173,45 165,51 168,61 160,55 152,61 155,51 147,45 157,45" stroke="none" />
    <polygon points="240,35 243,45 253,45 245,51 248,61 240,55 232,61 235,51 227,45 237,45" stroke="none" />
    <polygon points="120,40 123,50 133,50 125,56 128,66 120,60 112,66 115,56 107,50 117,50" stroke="none" />
    <polygon points="200,20 203,30 213,30 205,36 208,46 200,40 192,46 195,36 187,30 197,30" stroke="none" />
    <polygon points="280,40 283,50 293,50 285,56 288,66 280,60 272,66 275,56 267,50 277,50" stroke="none" />
    <!-- Canaleta externa do escudo perimetral -->
    <polygon points="30,85 370,85 200,415" fill="none" stroke-width="14" stroke-linejoin="round" />
    <!-- Divisao superior da barra -->
    <line x1="38" y1="175" x2="362" y2="175" stroke-width="8" />
    <!-- Texto SPFC entalhado em alto/baixo relevo -->
    <text x="200" y="155" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="56" text-anchor="middle" letter-spacing="6" stroke="none">SPFC</text>
    <!-- Triangulos inferiores desbastados separados por nervura de madeira -->
    <polygon points="56,190 190,190 190,380" stroke="none" />
    <polygon points="210,190 344,190 210,380" stroke="none" />
  </g>
</svg>`
  },

  santos: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- SANTOS FC LOGO OFICIAL -->
  <!-- Coroa de Rei Pelé e Estrelas -->
  <g fill="#D4AF37" stroke="#111111" stroke-width="2">
    <path d="M 160 48 L 172 26 L 188 40 L 200 20 L 212 40 L 228 26 L 240 48 Z" />
    <polygon points="135,32 138,40 146,40 140,45 142,53 135,48 128,53 130,45 124,40 132,40" />
    <polygon points="265,32 268,40 276,40 270,45 272,53 265,48 258,53 260,45 254,40 262,40" />
  </g>
  <!-- Contorno do Escudo -->
  <path d="M 40 70 L 360 70 C 360 250 260 360 200 410 C 140 360 40 250 40 70 Z" fill="#FFFFFF" stroke="#000000" stroke-width="12" stroke-linejoin="round" />
  <!-- Faixa Diagonal com S.F.C. -->
  <path d="M 40 70 L 160 70 L 360 260 L 360 320 L 280 320 L 40 130 Z" fill="#000000" />
  <text x="200" y="205" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="42" fill="#FFFFFF" text-anchor="middle" transform="rotate(32, 200, 195)">S. F. C.</text>
  <!-- Bola no quadrante superior -->
  <g transform="translate(90, 85)" fill="#FFFFFF" stroke="#000000" stroke-width="3">
    <circle cx="35" cy="35" r="30" />
    <polygon points="35,20 45,28 41,38 29,38 25,28" fill="#000000" />
    <line x1="35" y1="20" x2="35" y2="7" />
    <line x1="45" y1="28" x2="57" y2="22" />
    <line x1="41" y1="38" x2="52" y2="48" />
    <line x1="29" y1="38" x2="18" y2="48" />
    <line x1="25" y1="28" x2="13" y2="22" />
  </g>
  <!-- Listras Verticais Inferiores -->
  <g fill="#000000">
    <rect x="70" y="240" width="22" height="60" />
    <rect x="115" y="260" width="22" height="75" />
    <rect x="160" y="280" width="22" height="90" />
    <rect x="205" y="320" width="22" height="70" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - SANTOS FC -->
  <g fill="#000000" stroke="#000000">
    <!-- Coroa de Pelé e Estrelas no topo -->
    <path d="M 160 48 L 172 26 L 188 40 L 200 20 L 212 40 L 228 26 L 240 48 Z" fill="none" stroke-width="8" stroke-linejoin="round" />
    <polygon points="135,32 138,40 146,40 140,45 142,53 135,48 128,53 130,45 124,40 132,40" stroke="none" />
    <polygon points="265,32 268,40 276,40 270,45 272,53 265,48 258,53 260,45 254,40 262,40" stroke="none" />
    <!-- Canaleta perimetral do escudo -->
    <path d="M 40 70 L 360 70 C 360 250 260 360 200 410 C 140 360 40 250 40 70 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <!-- Faixa Diagonal canaleta -->
    <line x1="40" y1="130" x2="280" y2="320" stroke-width="8" />
    <line x1="160" y1="70" x2="360" y2="260" stroke-width="8" />
    <!-- Texto S.F.C. entalhado -->
    <text x="200" y="205" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="42" text-anchor="middle" transform="rotate(32, 200, 195)" stroke="none">S. F. C.</text>
    <!-- Bola clássica usinada -->
    <g transform="translate(90, 85)" fill="none" stroke-width="5">
      <circle cx="35" cy="35" r="30" />
      <polygon points="35,20 45,28 41,38 29,38 25,28" stroke-width="4" />
      <line x1="35" y1="20" x2="35" y2="7" />
      <line x1="45" y1="28" x2="57" y2="22" />
      <line x1="41" y1="38" x2="52" y2="48" />
      <line x1="29" y1="38" x2="18" y2="48" />
      <line x1="25" y1="28" x2="13" y2="22" />
    </g>
    <!-- Listras verticais usinadas -->
    <g stroke="none">
      <rect x="70" y="240" width="22" height="60" />
      <rect x="115" y="260" width="22" height="75" />
      <rect x="160" y="280" width="22" height="90" />
      <rect x="205" y="320" width="22" height="70" />
    </g>
  </g>
</svg>`
  },

  'atletico-mg': {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ATLETICO-MG LOGO OFICIAL -->
  <!-- Estrela dourada no topo -->
  <polygon points="200,20 206,38 226,38 210,50 216,68 200,56 184,68 190,50 174,38 194,38" fill="#D4AF37" stroke="#000000" stroke-width="2" />
  <!-- Contorno do Escudo -->
  <path d="M 50 80 L 350 80 C 350 260 260 360 200 410 C 140 360 50 260 50 80 Z" fill="#FFFFFF" stroke="#000000" stroke-width="12" stroke-linejoin="round" />
  <!-- Faixa superior preta com CAM -->
  <path d="M 58 88 L 342 88 C 342 165 310 175 200 175 C 90 175 58 165 58 88 Z" fill="#000000" />
  <text x="200" y="148" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="52" fill="#FFFFFF" text-anchor="middle" letter-spacing="10">CAM</text>
  <!-- Listras Verticais Preto e Branco -->
  <g fill="#000000">
    <rect x="78" y="185" width="34" height="110" />
    <rect x="146" y="185" width="34" height="175" />
    <rect x="220" y="185" width="34" height="175" />
    <rect x="288" y="185" width="34" height="110" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - ATLETICO-MG -->
  <g fill="#000000" stroke="#000000">
    <!-- Estrela do topo usinada -->
    <polygon points="200,20 206,38 226,38 210,50 216,68 200,56 184,68 190,50 174,38 194,38" stroke="none" />
    <!-- Canaleta perimetral do escudo -->
    <path d="M 50 80 L 350 80 C 350 260 260 360 200 410 C 140 360 50 260 50 80 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <!-- Divisao superior da barra -->
    <path d="M 58 175 C 120 175 280 175 342 175" fill="none" stroke-width="8" />
    <!-- CAM entalhado na madeira -->
    <text x="200" y="148" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="52" text-anchor="middle" letter-spacing="10" stroke="none">CAM</text>
    <!-- Listras verticais usinadas alternadas -->
    <g stroke="none">
      <rect x="78" y="185" width="34" height="110" />
      <rect x="146" y="185" width="34" height="175" />
      <rect x="220" y="185" width="34" height="175" />
      <rect x="288" y="185" width="34" height="110" />
    </g>
  </g>
</svg>`
  },

  cruzeiro: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- CRUZEIRO LOGO OFICIAL -->
  <circle cx="200" cy="200" r="190" fill="#003399" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#003399" stroke="#FFFFFF" stroke-width="4" />
  <!-- 5 Estrelas do Cruzeiro do Sul -->
  <g fill="#FFFFFF">
    <!-- Estrela Topo -->
    <polygon points="200,75 205,95 225,95 209,107 215,127 200,115 185,127 191,107 175,95 195,95" />
    <!-- Estrela Esquerda -->
    <polygon points="120,185 125,205 145,205 129,217 135,237 120,225 105,237 111,217 95,205 115,205" />
    <!-- Estrela Centro-Direita (Intrometida menor) -->
    <polygon points="230,225 233,238 247,238 236,246 240,259 230,251 220,259 224,246 213,238 227,238" />
    <!-- Estrela Direita -->
    <polygon points="280,185 285,205 305,205 289,217 295,237 280,225 265,237 271,217 255,205 275,205" />
    <!-- Estrela Base -->
    <polygon points="200,285 205,305 225,305 209,317 215,337 200,325 185,337 191,317 175,305 195,305" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - CRUZEIRO -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta circular chanfrada externa -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="14" />
    <circle cx="200" cy="200" r="165" fill="none" stroke-width="6" />
    <!-- 5 Estrelas do Cruzeiro do Sul esculpidas em baixo-relevo profundo -->
    <polygon points="200,75 205,95 225,95 209,107 215,127 200,115 185,127 191,107 175,95 195,95" stroke="none" />
    <polygon points="120,185 125,205 145,205 129,217 135,237 120,225 105,237 111,217 95,205 115,205" stroke="none" />
    <polygon points="230,225 233,238 247,238 236,246 240,259 230,251 220,259 224,246 213,238 227,238" stroke="none" />
    <polygon points="280,185 285,205 305,205 289,217 295,237 280,225 265,237 271,217 255,205 275,205" stroke="none" />
    <polygon points="200,285 205,305 225,305 209,317 215,337 200,325 185,337 191,317 175,305 195,305" stroke="none" />
  </g>
</svg>`
  },

  gremio: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="100%" height="100%">
  <!-- GREMIO LOGO OFICIAL -->
  <!-- 3 Estrelas no topo -->
  <polygon points="200,20 204,32 216,32 206,40 210,52 200,44 190,52 194,40 184,32 196,32" fill="#D4AF37" />
  <polygon points="150,28 154,40 166,40 156,48 160,60 150,52 140,60 144,48 134,40 146,40" fill="#C0C0C0" />
  <polygon points="250,28 254,40 266,40 256,48 260,60 250,52 240,60 244,48 234,40 246,40" fill="#CD7F32" />
  <!-- Bola Oval de Futebol -->
  <ellipse cx="200" cy="240" rx="160" ry="145" fill="#0D80BF" stroke="#000000" stroke-width="10" />
  <!-- Faixa Branca Central -->
  <path d="M 42 225 Q 200 245 358 225 L 356 265 Q 200 285 44 265 Z" fill="#FFFFFF" stroke="#000000" stroke-width="6" />
  <text x="200" y="260" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="34" fill="#000000" text-anchor="middle" letter-spacing="6">GREMIO</text>
  <!-- Gomos e meridianos da bola -->
  <g stroke="#000000" stroke-width="6" fill="none">
    <path d="M 200 95 V 230" />
    <path d="M 200 280 V 385" />
    <path d="M 110 120 Q 150 180 120 230" />
    <path d="M 290 120 Q 250 180 280 230" />
    <path d="M 120 275 Q 150 330 110 365" />
    <path d="M 280 275 Q 250 330 290 365" />
  </g>
  <text x="200" y="340" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" text-anchor="middle">1903</text>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - GREMIO -->
  <g fill="#000000" stroke="#000000">
    <!-- 3 Estrelas usinadas -->
    <polygon points="200,20 204,32 216,32 206,40 210,52 200,44 190,52 194,40 184,32 196,32" stroke="none" />
    <polygon points="150,28 154,40 166,40 156,48 160,60 150,52 140,60 144,48 134,40 146,40" stroke="none" />
    <polygon points="250,28 254,40 266,40 256,48 260,60 250,52 240,60 244,48 234,40 246,40" stroke="none" />
    <!-- Borda externa da bola oval -->
    <ellipse cx="200" cy="240" rx="160" ry="145" fill="none" stroke-width="14" />
    <!-- Faixa central canaletas -->
    <path d="M 42 225 Q 200 245 358 225" fill="none" stroke-width="8" />
    <path d="M 44 265 Q 200 285 356 265" fill="none" stroke-width="8" />
    <!-- Texto GREMIO e 1903 esculpidos -->
    <text x="200" y="260" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="6" stroke="none">GREMIO</text>
    <text x="200" y="340" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="24" text-anchor="middle" stroke="none">1903</text>
    <!-- Costuras e meridianos usinados -->
    <g fill="none" stroke-width="6">
      <path d="M 200 95 V 230" />
      <path d="M 200 280 V 385" />
      <path d="M 110 120 Q 150 180 120 230" />
      <path d="M 290 120 Q 250 180 280 230" />
      <path d="M 120 275 Q 150 330 110 365" />
      <path d="M 280 275 Q 250 330 290 365" />
    </g>
  </g>
</svg>`
  },

  internacional: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- INTERNACIONAL LOGO OFICIAL -->
  <circle cx="200" cy="200" r="190" fill="#E30613" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#FFFFFF" />
  <circle cx="200" cy="200" r="162" fill="#E30613" />
  <!-- Monograma SCI entrelaçado clássico -->
  <g fill="#FFFFFF" stroke="#E30613" stroke-width="2">
    <!-- S estilizado -->
    <path d="M 160 130 C 130 130 115 150 115 175 C 115 220 180 215 180 250 C 180 270 165 285 140 285 C 120 285 105 270 100 255 L 85 265 C 92 285 115 305 145 305 C 180 305 205 280 205 250 C 205 205 140 210 140 175 C 140 158 152 148 170 148 C 185 148 198 158 202 170 L 218 160 C 210 140 190 130 160 130 Z" />
    <!-- C central grande -->
    <path d="M 270 135 C 240 120 190 125 155 155 C 115 190 115 250 155 285 C 190 315 240 315 270 300 L 260 280 C 235 295 195 295 170 270 C 140 240 140 195 170 165 C 195 140 235 140 260 155 Z" />
    <!-- I central vertical -->
    <path d="M 220 110 H 260 V 130 H 248 V 280 H 260 V 300 H 220 V 280 H 232 V 130 H 220 Z" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - INTERNACIONAL -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta circular chanfrada externa -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="14" />
    <circle cx="200" cy="200" r="162" fill="none" stroke-width="8" />
    <!-- Monograma SCI entalhado em baixo relevo -->
    <path d="M 160 130 C 130 130 115 150 115 175 C 115 220 180 215 180 250 C 180 270 165 285 140 285 C 120 285 105 270 100 255 L 85 265 C 92 285 115 305 145 305 C 180 305 205 280 205 250 C 205 205 140 210 140 175 C 140 158 152 148 170 148 C 185 148 198 158 202 170 L 218 160 C 210 140 190 130 160 130 Z" stroke="none" />
    <path d="M 270 135 C 240 120 190 125 155 155 C 115 190 115 250 155 285 C 190 315 240 315 270 300 L 260 280 C 235 295 195 295 170 270 C 140 240 140 195 170 165 C 195 140 235 140 260 155 Z" stroke="none" />
    <path d="M 220 110 H 260 V 130 H 248 V 280 H 260 V 300 H 220 V 280 H 232 V 130 H 220 Z" stroke="none" />
  </g>
</svg>`
  },

  fluminense: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- FLUMINENSE LOGO OFICIAL -->
  <!-- Escudo Gotico Tricolor -->
  <path d="M 50 60 C 100 80 150 50 200 65 C 250 50 300 80 350 60 C 350 280 260 370 200 415 C 140 370 50 280 50 60 Z" fill="#8B1832" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round" />
  <path d="M 64 76 C 110 94 150 66 200 80 C 250 66 290 94 336 76 C 336 270 252 355 200 395 C 148 355 64 270 64 76 Z" fill="#006437" stroke="#FFFFFF" stroke-width="6" />
  <!-- Monograma FFC Gotico Central -->
  <g fill="#FFFFFF" stroke="#8B1832" stroke-width="2">
    <!-- F principal esquerdo -->
    <path d="M 120 130 H 180 V 150 H 145 V 195 H 175 V 215 H 145 V 300 H 120 Z" />
    <!-- F principal direito -->
    <path d="M 220 130 H 280 V 150 H 245 V 195 H 275 V 215 H 245 V 300 H 220 Z" />
    <!-- C central sobreposto -->
    <path d="M 230 170 C 210 160 175 165 155 190 C 130 220 130 260 155 290 C 180 315 220 310 240 295 L 230 275 C 215 285 190 290 175 275 C 158 255 158 225 175 205 C 190 190 215 185 230 195 Z" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - FLUMINENSE -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta externa do contorno gotico recortado -->
    <path d="M 50 60 C 100 80 150 50 200 65 C 250 50 300 80 350 60 C 350 280 260 370 200 415 C 140 370 50 280 50 60 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <!-- Canaleta interna tricolor -->
    <path d="M 68 80 C 110 96 150 70 200 84 C 250 70 290 96 332 80 C 332 265 250 350 200 390 C 150 350 68 265 68 80 Z" fill="none" stroke-width="6" />
    <!-- Monograma FFC usinado em baixo-relevo -->
    <path d="M 120 130 H 180 V 150 H 145 V 195 H 175 V 215 H 145 V 300 H 120 Z" stroke="none" />
    <path d="M 220 130 H 280 V 150 H 245 V 195 H 275 V 215 H 245 V 300 H 220 Z" stroke="none" />
    <path d="M 230 170 C 210 160 175 165 155 190 C 130 220 130 260 155 290 C 180 315 220 310 240 295 L 230 275 C 215 285 190 290 175 275 C 158 255 158 225 175 205 C 190 190 215 185 230 195 Z" stroke="none" />
  </g>
</svg>`
  },

  botafogo: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- BOTAFOGO LOGO OFICIAL -->
  <!-- Escudo Suíço Clássico -->
  <path d="M 50 70 C 100 85 150 70 200 70 C 250 70 300 85 350 70 C 350 260 260 360 200 415 C 140 360 50 260 50 70 Z" fill="#111111" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round" />
  <path d="M 66 86 C 110 98 150 86 200 86 C 250 86 290 98 334 86 C 334 250 250 345 200 395 C 150 345 66 250 66 86 Z" fill="#111111" stroke="#FFFFFF" stroke-width="4" />
  <!-- Estrela Solitária Branca -->
  <polygon points="200,120 223,195 300,195 238,242 261,315 200,270 139,315 162,242 100,195 177,195" fill="#FFFFFF" stroke="#111111" stroke-width="3" />
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - BOTAFOGO -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta externa do escudo perimetral -->
    <path d="M 50 70 C 100 85 150 70 200 70 C 250 70 300 85 350 70 C 350 260 260 360 200 415 C 140 360 50 260 50 70 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <path d="M 72 90 C 110 102 150 90 200 90 C 250 90 290 102 328 90 C 328 245 248 335 200 385 C 152 335 72 245 72 90 Z" fill="none" stroke-width="6" />
    <!-- Estrela Solitaria usinada com facetas biseladas 3D -->
    <polygon points="200,120 223,195 300,195 238,242 261,315 200,270 139,315 162,242 100,195 177,195" stroke="none" />
    <!-- Nervuras internas chanfradas da estrela -->
    <g stroke="#FFFFFF" stroke-width="4">
      <line x1="200" y1="120" x2="200" y2="270" />
      <line x1="300" y1="195" x2="200" y2="242" />
      <line x1="261" y1="315" x2="200" y2="242" />
      <line x1="139" y1="315" x2="200" y2="242" />
      <line x1="100" y1="195" x2="200" y2="242" />
    </g>
  </g>
</svg>`
  },

  vasco: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- VASCO DA GAMA LOGO OFICIAL -->
  <!-- Escudo Preto Medieval -->
  <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="#111111" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round" />
  <!-- Faixa Diagonal Branca -->
  <polygon points="50,65 140,65 350,335 350,380 280,400 50,135" fill="#FFFFFF" />
  <!-- Cruz Pátea / Cruz de Malta Vermelha -->
  <g transform="translate(160, 180)" fill="#C4122D">
    <path d="M 40 5 L 48 32 L 75 40 L 48 48 L 40 75 L 32 48 L 5 40 L 32 32 Z" stroke="#111111" stroke-width="2" />
  </g>
  <!-- Iniciais C R V G nos quadrantes -->
  <text x="100" y="115" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">C</text>
  <text x="300" y="115" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">R</text>
  <text x="100" y="340" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">V</text>
  <text x="300" y="340" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">G</text>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - VASCO DA GAMA -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta externa do escudo perimetral -->
    <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <!-- Faixa Diagonal canaletas paralelas -->
    <line x1="50" y1="65" x2="350" y2="340" stroke-width="8" />
    <line x1="50" y1="135" x2="280" y2="400" stroke-width="8" />
    <!-- Cruz Pátea entalhada no centro -->
    <g transform="translate(160, 180)" stroke="none">
      <path d="M 40 5 L 48 32 L 75 40 L 48 48 L 40 75 L 32 48 L 5 40 L 32 32 Z" />
    </g>
    <!-- Iniciais CRVG entalhadas -->
    <text x="100" y="115" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" text-anchor="middle" stroke="none">C</text>
    <text x="300" y="115" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" text-anchor="middle" stroke="none">R</text>
    <text x="100" y="340" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" text-anchor="middle" stroke="none">V</text>
    <text x="300" y="340" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" text-anchor="middle" stroke="none">G</text>
  </g>
</svg>`
  },

  bahia: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- BAHIA LOGO OFICIAL -->
  <defs>
    <path id="bahia-arc" d="M 68 180 A 135 135 0 0 1 332 180" fill="none" />
  </defs>
  <circle cx="200" cy="200" r="190" fill="#005CA9" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#FFFFFF" />
  <circle cx="200" cy="200" r="162" fill="#005CA9" />
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="3">
    <textPath href="#bahia-arc" startOffset="50%" text-anchor="middle">ESPORTE CLUBE BAHIA</textPath>
  </text>
  <text x="200" y="370" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" text-anchor="middle">1931</text>
  <!-- Bandeira Central com Mastro -->
  <circle cx="200" cy="210" r="100" fill="#FFFFFF" stroke="#005CA9" stroke-width="4" />
  <g transform="translate(145, 160)">
    <!-- Mastro -->
    <line x1="15" y1="10" x2="15" y2="105" stroke="#111111" stroke-width="5" stroke-linecap="round" />
    <circle cx="15" cy="10" r="5" fill="#D4AF37" />
    <!-- Bandeira tremulando -->
    <path d="M 17 15 Q 55 10 90 20 L 90 75 Q 55 65 17 75 Z" fill="#FFFFFF" stroke="#111111" stroke-width="3" />
    <path d="M 17 15 Q 55 10 90 20 L 90 35 Q 55 25 17 35 Z" fill="#005CA9" />
    <path d="M 17 55 Q 55 45 90 55 L 90 75 Q 55 65 17 75 Z" fill="#C4122D" />
    <!-- Triangulo branco no cantao azul -->
    <polygon points="17,15 45,25 17,35" fill="#C4122D" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - BAHIA -->
  <defs>
    <path id="bahia-cnc-arc" d="M 68 180 A 135 135 0 0 1 332 180" fill="none" />
  </defs>
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta circular chanfrada externa -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="14" />
    <circle cx="200" cy="200" r="162" fill="none" stroke-width="6" />
    <circle cx="200" cy="210" r="100" fill="none" stroke-width="8" />
    <!-- Texto do arco e ano -->
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="22" letter-spacing="3" stroke="none">
      <textPath href="#bahia-cnc-arc" startOffset="50%" text-anchor="middle">ESPORTE CLUBE BAHIA</textPath>
    </text>
    <text x="200" y="370" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="22" text-anchor="middle" stroke="none">1931</text>
    <!-- Mastro e bandeira usinados -->
    <g transform="translate(145, 160)">
      <line x1="15" y1="10" x2="15" y2="105" stroke-width="6" stroke-linecap="round" />
      <path d="M 17 15 Q 55 10 90 20 L 90 75 Q 55 65 17 75 Z" fill="none" stroke-width="4" />
      <path d="M 17 15 Q 55 10 90 20 L 90 35 Q 55 25 17 35 Z" stroke="none" />
      <path d="M 17 55 Q 55 45 90 55 L 90 75 Q 55 65 17 75 Z" stroke="none" />
    </g>
  </g>
</svg>`
  },

  fortaleza: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- FORTALEZA LOGO OFICIAL -->
  <!-- Estrelas no topo -->
  <g fill="#D4AF37">
    <polygon points="200,20 204,32 216,32 206,40 210,52 200,44 190,52 194,40 184,32 196,32" />
    <polygon points="160,25 164,37 176,37 166,45 170,57 160,49 150,57 154,45 144,37 156,37" />
    <polygon points="240,25 244,37 256,37 246,45 250,57 240,49 230,57 234,45 224,37 236,37" />
  </g>
  <!-- Escudo Clássico Francês Tricolor -->
  <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="#FFFFFF" stroke="#113377" stroke-width="10" stroke-linejoin="round" />
  <!-- Faixa superior com FORTALEZA -->
  <path d="M 58 73 L 342 73 L 342 145 L 58 145 Z" fill="#113377" />
  <text x="200" y="125" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">FORTALEZA</text>
  <!-- Faixas horizontais tricolores inferiores -->
  <rect x="58" y="153" width="284" height="60" fill="#C4122D" />
  <rect x="58" y="213" width="284" height="60" fill="#FFFFFF" />
  <path d="M 58 273 L 342 273 C 342 335 260 380 200 405 C 140 380 58 335 58 273 Z" fill="#113377" />
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - FORTALEZA -->
  <g fill="#000000" stroke="#000000">
    <!-- Estrelas do topo usinadas -->
    <polygon points="200,20 204,32 216,32 206,40 210,52 200,44 190,52 194,40 184,32 196,32" stroke="none" />
    <polygon points="160,25 164,37 176,37 166,45 170,57 160,49 150,57 154,45 144,37 156,37" stroke="none" />
    <polygon points="240,25 244,37 256,37 246,45 250,57 240,49 230,57 234,45 224,37 236,37" stroke="none" />
    <!-- Canaleta perimetral do escudo -->
    <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <line x1="58" y1="145" x2="342" y2="145" stroke-width="8" />
    <!-- FORTALEZA entalhado -->
    <text x="200" y="125" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4" stroke="none">FORTALEZA</text>
    <!-- Faixas usinadas alternadas -->
    <rect x="58" y="153" width="284" height="60" stroke="none" />
    <path d="M 58 273 L 342 273 C 342 335 260 380 200 405 C 140 380 58 335 58 273 Z" stroke="none" />
  </g>
</svg>`
  },

  'athletico-pr': {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ATHLETICO-PR LOGO OFICIAL -->
  <!-- 4 Listras Diagonais Ascendentes Vermelho e Preto -->
  <g fill="#CC0000" stroke="#111111" stroke-width="2">
    <polygon points="50,330 110,330 220,110 160,110" />
    <polygon points="125,330 185,330 275,150 215,150" />
    <polygon points="200,330 260,330 330,190 270,190" />
    <polygon points="275,330 335,330 375,250 315,250" />
  </g>
  <!-- Iniciais CAP no topo direito -->
  <text x="280" y="95" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="52" fill="#111111" letter-spacing="4">CAP</text>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - ATHLETICO-PR -->
  <g fill="#000000" stroke="#000000">
    <!-- 4 Listras de desbaste dinâmico fresadas -->
    <polygon points="50,330 110,330 220,110 160,110" stroke="none" />
    <polygon points="125,330 185,330 275,150 215,150" stroke="none" />
    <polygon points="200,330 260,330 330,190 270,190" stroke="none" />
    <polygon points="275,330 335,330 375,250 315,250" stroke="none" />
    <!-- Iniciais CAP gravadas -->
    <text x="280" y="95" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="52" letter-spacing="4" stroke="none">CAP</text>
  </g>
</svg>`
  },

  vitoria: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- VITORIA LOGO OFICIAL -->
  <!-- Estrelas no topo -->
  <g fill="#D4AF37">
    <polygon points="200,20 204,32 216,32 206,40 210,52 200,44 190,52 194,40 184,32 196,32" />
    <polygon points="160,25 164,37 176,37 166,45 170,57 160,49 150,57 154,45 144,37 156,37" />
    <polygon points="240,25 244,37 256,37 246,45 250,57 240,49 230,57 234,45 224,37 236,37" />
  </g>
  <!-- Contorno do Escudo -->
  <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="#FFFFFF" stroke="#111111" stroke-width="10" stroke-linejoin="round" />
  <!-- Barra superior com E.C.V. -->
  <path d="M 58 73 L 342 73 L 342 145 L 58 145 Z" fill="#111111" />
  <text x="200" y="125" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">E.C.V.</text>
  <!-- Listras Horizontais Vermelho e Preto -->
  <g fill="#D31411">
    <rect x="58" y="155" width="284" height="40" />
    <rect x="58" y="235" width="284" height="40" />
    <path d="M 58 315 L 342 315 C 342 345 300 375 200 405 C 100 375 58 345 58 315 Z" />
  </g>
  <g fill="#111111">
    <rect x="58" y="195" width="284" height="40" />
    <rect x="58" y="275" width="284" height="40" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - VITORIA -->
  <g fill="#000000" stroke="#000000">
    <!-- Estrelas no topo -->
    <polygon points="200,20 204,32 216,32 206,40 210,52 200,44 190,52 194,40 184,32 196,32" stroke="none" />
    <polygon points="160,25 164,37 176,37 166,45 170,57 160,49 150,57 154,45 144,37 156,37" stroke="none" />
    <polygon points="240,25 244,37 256,37 246,45 250,57 240,49 230,57 234,45 224,37 236,37" stroke="none" />
    <!-- Canaleta perimetral do escudo -->
    <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <line x1="58" y1="145" x2="342" y2="145" stroke-width="8" />
    <!-- E.C.V. entalhado -->
    <text x="200" y="125" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="44" text-anchor="middle" letter-spacing="6" stroke="none">E.C.V.</text>
    <!-- Listras horizontais usinadas alternadas -->
    <g stroke="none">
      <rect x="58" y="155" width="284" height="40" />
      <rect x="58" y="235" width="284" height="40" />
      <path d="M 58 315 L 342 315 C 342 345 300 375 200 405 C 100 375 58 345 58 315 Z" />
    </g>
  </g>
</svg>`
  },

  'sport-recife': {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- SPORT RECIFE LOGO OFICIAL -->
  <!-- Contorno do Escudo -->
  <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="#FFFFFF" stroke="#111111" stroke-width="10" stroke-linejoin="round" />
  <!-- Faixa superior preta com SCR -->
  <path d="M 58 73 L 342 73 L 342 145 L 58 145 Z" fill="#111111" />
  <text x="200" y="125" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">S. C. R.</text>
  <!-- Listras Horizontais Rubro-Negras -->
  <g fill="#BA0C2F">
    <rect x="58" y="155" width="284" height="40" />
    <rect x="58" y="235" width="284" height="40" />
    <path d="M 58 315 L 342 315 C 342 345 300 375 200 405 C 100 375 58 345 58 315 Z" />
  </g>
  <!-- Leão Coroado Rampante Central em Dourado -->
  <g transform="translate(160, 175)" fill="#D4AF37" stroke="#111111" stroke-width="2">
    <!-- Coroa do Leao -->
    <polygon points="40,5 45,15 55,10 65,15 70,5 75,20 35,20" />
    <!-- Silhueta do Leao Rampante -->
    <path d="M 45 22 C 55 22 65 30 65 42 C 75 45 85 55 80 70 L 70 65 C 72 75 65 85 68 100 L 75 120 L 60 120 L 55 105 L 45 105 L 40 120 L 25 120 L 32 95 C 25 90 20 80 25 70 C 20 60 25 45 35 35 Z" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - SPORT RECIFE -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta perimetral do escudo -->
    <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <line x1="58" y1="145" x2="342" y2="145" stroke-width="8" />
    <!-- S.C.R. gravado -->
    <text x="200" y="125" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="44" text-anchor="middle" letter-spacing="6" stroke="none">S. C. R.</text>
    <!-- Listras horizontais fresadas -->
    <rect x="58" y="155" width="284" height="40" stroke="none" />
    <rect x="58" y="235" width="284" height="40" stroke="none" />
    <path d="M 58 315 L 342 315 C 342 345 300 375 200 405 C 100 375 58 345 58 315 Z" stroke="none" />
    <!-- Leão Coroado gravado em relevo no centro -->
    <g transform="translate(160, 175)" stroke="none">
      <polygon points="40,5 45,15 55,10 65,15 70,5 75,20 35,20" />
      <path d="M 45 22 C 55 22 65 30 65 42 C 75 45 85 55 80 70 L 70 65 C 72 75 65 85 68 100 L 75 120 L 60 120 L 55 105 L 45 105 L 40 120 L 25 120 L 32 95 C 25 90 20 80 25 70 C 20 60 25 45 35 35 Z" />
    </g>
  </g>
</svg>`
  },

  ceara: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- CEARA LOGO OFICIAL -->
  <!-- Escudo Clássico Alvinegro -->
  <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="#FFFFFF" stroke="#111111" stroke-width="10" stroke-linejoin="round" />
  <!-- Faixa superior com CEARA -->
  <path d="M 58 73 L 342 73 L 342 145 L 58 145 Z" fill="#111111" />
  <text x="200" y="125" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" text-anchor="middle" letter-spacing="6">CEARÁ</text>
  <!-- Listras Verticais e 1914 -->
  <g fill="#111111">
    <rect x="78" y="155" width="40" height="150" />
    <rect x="180" y="155" width="40" height="220" />
    <rect x="282" y="155" width="40" height="150" />
  </g>
  <text x="200" y="270" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">1914</text>
  <!-- 7 Estrelas Brancas -->
  <g fill="#FFFFFF">
    <polygon points="200,165 202,172 210,172 204,177 206,184 200,180 194,184 196,177 190,172 198,172" />
    <polygon points="150,175 152,182 160,182 154,187 156,194 150,190 144,194 146,187 140,182 148,182" />
    <polygon points="250,175 252,182 260,182 254,187 256,194 250,190 244,194 246,187 240,182 248,182" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - CEARA -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta perimetral do escudo -->
    <path d="M 50 65 L 350 65 C 350 270 260 370 200 415 C 140 370 50 270 50 65 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <line x1="58" y1="145" x2="342" y2="145" stroke-width="8" />
    <!-- CEARA entalhado -->
    <text x="200" y="125" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="44" text-anchor="middle" letter-spacing="6" stroke="none">CEARÁ</text>
    <text x="200" y="270" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" text-anchor="middle" stroke="none">1914</text>
    <!-- Listras verticais usinadas alternadas -->
    <g stroke="none">
      <rect x="78" y="155" width="40" height="150" />
      <rect x="180" y="155" width="40" height="220" />
      <rect x="282" y="155" width="40" height="150" />
    </g>
  </g>
</svg>`
  },

  coritiba: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- CORITIBA LOGO OFICIAL -->
  <!-- Circulo Verde e Globo -->
  <circle cx="200" cy="200" r="190" fill="#00543D" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#FFFFFF" />
  <circle cx="200" cy="200" r="162" fill="#00543D" />
  <!-- Faixa Central CORITIBA -->
  <rect x="35" y="175" width="330" height="50" fill="#FFFFFF" stroke="#00543D" stroke-width="4" />
  <text x="200" y="212" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="34" fill="#00543D" text-anchor="middle" letter-spacing="4">CORITIBA</text>
  <!-- Meridianos do Globo -->
  <g stroke="#FFFFFF" stroke-width="5" fill="none">
    <circle cx="200" cy="200" r="110" />
    <path d="M 200 90 V 310" />
    <path d="M 130 115 Q 170 200 130 285" />
    <path d="M 270 115 Q 230 200 270 285" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - CORITIBA -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta circular chanfrada externa -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="14" />
    <circle cx="200" cy="200" r="162" fill="none" stroke-width="8" />
    <!-- Faixa central canaletas -->
    <line x1="38" y1="175" x2="362" y2="175" stroke-width="8" />
    <line x1="38" y1="225" x2="362" y2="225" stroke-width="8" />
    <!-- CORITIBA entalhado -->
    <text x="200" y="212" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="4" stroke="none">CORITIBA</text>
    <!-- Meridianos do globo usinados -->
    <g fill="none" stroke-width="5">
      <circle cx="200" cy="200" r="110" />
      <path d="M 200 90 V 310" />
      <path d="M 130 115 Q 170 200 130 285" />
      <path d="M 270 115 Q 230 200 270 285" />
    </g>
  </g>
</svg>`
  },

  goias: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- GOIAS LOGO OFICIAL -->
  <circle cx="200" cy="200" r="190" fill="#00563F" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#FFFFFF" />
  <circle cx="200" cy="200" r="162" fill="#00563F" />
  <!-- Monograma GEC grande estilizado -->
  <g fill="#FFFFFF">
    <text x="200" y="235" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="100" text-anchor="middle" letter-spacing="4">GEC</text>
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - GOIAS -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta circular chanfrada externa -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="14" />
    <circle cx="200" cy="200" r="162" fill="none" stroke-width="8" />
    <!-- Monograma GEC entalhado em baixo relevo -->
    <text x="200" y="235" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="100" text-anchor="middle" letter-spacing="4" stroke="none">GEC</text>
  </g>
</svg>`
  },

  'real-madrid': {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- REAL MADRID LOGO OFICIAL -->
  <!-- Coroa Real Espanhola no topo -->
  <g transform="translate(130, 20)" fill="#D4AF37" stroke="#111111" stroke-width="2">
    <!-- Cruz da Coroa -->
    <path d="M 70 8 V 28 M 60 18 H 80" stroke="#D4AF37" stroke-width="6" stroke-linecap="square" />
    <!-- Arco da Coroa -->
    <path d="M 15 65 C 25 35 115 35 125 65 Z" fill="#D4AF37" />
    <path d="M 20 60 C 45 40 95 40 120 60" fill="none" stroke="#C4122D" stroke-width="4" />
    <ellipse cx="70" cy="65" rx="58" ry="12" fill="#D4AF37" />
  </g>
  <!-- Circulo Dourado com Faixa Diagonal Azul -->
  <circle cx="200" cy="250" r="140" fill="#FFFFFF" stroke="#D4AF37" stroke-width="16" />
  <clipPath id="rm-circle-clip">
    <circle cx="200" cy="250" r="132" />
  </clipPath>
  <g clip-path="url(#rm-circle-clip)">
    <!-- Faixa Diagonal Roxa/Azul -->
    <polygon points="80,130 140,130 320,370 260,370" fill="#00529F" />
    <!-- Monograma MCF Entrelaçado -->
    <g fill="#D4AF37" stroke="#111111" stroke-width="2">
      <!-- M Grande -->
      <path d="M 125 190 L 160 300 L 200 230 L 240 300 L 275 190 L 255 190 L 240 250 L 200 190 L 160 250 L 145 190 Z" />
      <!-- C Central -->
      <path d="M 250 220 C 235 190 165 190 150 220 C 135 250 135 270 150 300 C 165 330 235 330 250 300 L 230 290 C 215 310 185 310 170 290 C 158 270 158 250 170 230 C 185 210 215 210 230 230 Z" />
    </g>
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - REAL MADRID -->
  <g fill="#000000" stroke="#000000">
    <!-- Coroa Real usinada com fresa fina -->
    <g transform="translate(130, 20)">
      <path d="M 70 8 V 28 M 60 18 H 80" stroke-width="8" stroke-linecap="square" />
      <path d="M 15 65 C 25 35 115 35 125 65 Z" fill="none" stroke-width="8" />
      <ellipse cx="70" cy="65" rx="58" ry="12" fill="none" stroke-width="6" />
    </g>
    <!-- Canaleta circular chanfrada do escudo -->
    <circle cx="200" cy="250" r="140" fill="none" stroke-width="14" />
    <circle cx="200" cy="250" r="128" fill="none" stroke-width="6" />
    <!-- Faixa Diagonal canaletas -->
    <line x1="100" y1="130" x2="300" y2="370" stroke-width="8" />
    <line x1="140" y1="130" x2="340" y2="370" stroke-width="8" />
    <!-- Monograma MCF gravado no centro -->
    <path d="M 125 190 L 160 300 L 200 230 L 240 300 L 275 190 L 255 190 L 240 250 L 200 190 L 160 250 L 145 190 Z" stroke="none" />
    <path d="M 250 220 C 235 190 165 190 150 220 C 135 250 135 270 150 300 C 165 330 235 330 250 300 L 230 290 C 215 310 185 310 170 290 C 158 270 158 250 170 230 C 185 210 215 210 230 230 Z" stroke="none" />
  </g>
</svg>`
  },

  barcelona: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="100%" height="100%">
  <!-- FC BARCELONA LOGO OFICIAL -->
  <!-- Contorno Ogival Dourado -->
  <path d="M 50 60 C 100 80 150 60 200 70 C 250 60 300 80 350 60 C 350 260 260 360 200 400 C 140 360 50 260 50 60 Z" fill="#D4AF37" stroke="#111111" stroke-width="8" stroke-linejoin="round" />
  <path d="M 62 72 C 105 90 150 72 200 80 C 250 72 295 90 338 72 C 338 250 252 345 200 385 C 148 345 62 250 62 72 Z" fill="#FFFFFF" />
  <!-- Cruz de São Jorge (Quadrante Superior Esquerdo) -->
  <rect x="62" y="80" width="134" height="100" fill="#FFFFFF" />
  <rect x="115" y="80" width="28" height="100" fill="#CC0000" />
  <rect x="62" y="115" width="134" height="28" fill="#CC0000" />
  <!-- Senyera Catalã (Quadrante Superior Direito) -->
  <g transform="translate(200, 80)">
    <rect x="0" y="0" width="138" height="100" fill="#D4AF37" />
    <rect x="20" y="0" width="22" height="100" fill="#CC0000" />
    <rect x="60" y="0" width="22" height="100" fill="#CC0000" />
    <rect x="100" y="0" width="22" height="100" fill="#CC0000" />
  </g>
  <!-- Faixa Central Dourada com FCB -->
  <rect x="62" y="175" width="276" height="50" fill="#D4AF37" stroke="#111111" stroke-width="3" />
  <text x="200" y="212" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="34" fill="#004D98" text-anchor="middle" letter-spacing="8">FCB</text>
  <!-- Listras Blaugrana e Bola Retrô Inferiores -->
  <g transform="translate(0, 225)">
    <path d="M 62 0 H 338 C 338 80 252 145 200 160 C 148 145 62 80 62 0 Z" fill="#004D98" />
    <rect x="110" y="0" width="35" height="120" fill="#A50044" />
    <rect x="180" y="0" width="40" height="140" fill="#A50044" />
    <rect x="255" y="0" width="35" height="120" fill="#A50044" />
    <!-- Bola Dourada Antiga -->
    <circle cx="200" cy="75" r="32" fill="#D4AF37" stroke="#111111" stroke-width="4" />
    <path d="M 175 75 Q 200 95 225 75" fill="none" stroke="#111111" stroke-width="3" />
    <line x1="200" y1="43" x2="200" y2="107" stroke="#111111" stroke-width="3" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - FC BARCELONA -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta externa do contorno ogival -->
    <path d="M 50 60 C 100 80 150 60 200 70 C 250 60 300 80 350 60 C 350 260 260 360 200 400 C 140 360 50 260 50 60 Z" fill="none" stroke-width="14" stroke-linejoin="round" />
    <!-- Cruz de São Jorge desbastada -->
    <rect x="115" y="80" width="28" height="95" stroke="none" />
    <rect x="62" y="115" width="134" height="28" stroke="none" />
    <!-- Barras da Senyera desbastadas -->
    <rect x="220" y="80" width="22" height="95" stroke="none" />
    <rect x="260" y="80" width="22" height="95" stroke="none" />
    <rect x="300" y="80" width="22" height="95" stroke="none" />
    <!-- Faixa central canaletas -->
    <line x1="62" y1="175" x2="338" y2="175" stroke-width="8" />
    <line x1="62" y1="225" x2="338" y2="225" stroke-width="8" />
    <!-- FCB entalhado -->
    <text x="200" y="212" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="34" text-anchor="middle" letter-spacing="8" stroke="none">FCB</text>
    <!-- Listras inferiores e bola -->
    <rect x="110" y="225" width="35" height="100" stroke="none" />
    <rect x="255" y="225" width="35" height="100" stroke="none" />
    <!-- Bola clássica de couro usinada -->
    <circle cx="200" cy="300" r="32" fill="none" stroke-width="6" />
    <path d="M 175 300 Q 200 320 225 300" fill="none" stroke-width="4" />
    <line x1="200" y1="268" x2="200" y2="332" stroke-width="4" />
  </g>
</svg>`
  },

  'manchester-city': {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- MANCHESTER CITY LOGO OFICIAL -->
  <defs>
    <path id="mcfc-top-arc" d="M 70 190 A 130 130 0 0 1 330 190" fill="none" />
    <path id="mcfc-bot-arc" d="M 320 220 A 130 130 0 0 1 80 220" fill="none" />
  </defs>
  <circle cx="200" cy="200" r="190" fill="#6CABDD" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#FFFFFF" />
  <circle cx="200" cy="200" r="162" fill="#6CABDD" />
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="3">
    <textPath href="#mcfc-top-arc" startOffset="50%" text-anchor="middle">MANCHESTER CITY</textPath>
  </text>
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" letter-spacing="4">
    <textPath href="#mcfc-bot-arc" startOffset="50%" text-anchor="middle">1894</textPath>
  </text>
  <!-- Escudo Central com Navio Mercantil e 3 Listras -->
  <path d="M 120 135 H 280 C 280 230 240 280 200 300 C 160 280 120 230 120 135 Z" fill="#FFFFFF" stroke="#00285E" stroke-width="6" />
  <!-- Navio no topo do canal -->
  <g transform="translate(160, 145)" fill="#D4AF37">
    <path d="M 10 35 L 70 35 L 60 50 L 20 50 Z" />
    <path d="M 40 10 L 40 30 L 65 30 Z" />
    <path d="M 35 15 L 35 30 L 15 30 Z" />
  </g>
  <!-- 3 Listras Diagonais dos Rios Irwell, Medlock e Irk -->
  <g fill="#6CABDD" stroke="#00285E" stroke-width="2">
    <polygon points="135,210 155,210 215,280 195,280" />
    <polygon points="175,210 195,210 235,270 215,270" />
    <polygon points="215,210 235,210 255,250 235,250" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - MANCHESTER CITY -->
  <defs>
    <path id="mcfc-cnc-top" d="M 70 190 A 130 130 0 0 1 330 190" fill="none" />
    <path id="mcfc-cnc-bot" d="M 320 220 A 130 130 0 0 1 80 220" fill="none" />
  </defs>
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta circular chanfrada externa -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="14" />
    <circle cx="200" cy="200" r="162" fill="none" stroke-width="6" />
    <!-- Texto do anel desbastado -->
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="22" letter-spacing="3" stroke="none">
      <textPath href="#mcfc-cnc-top" startOffset="50%" text-anchor="middle">MANCHESTER CITY</textPath>
    </text>
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="20" letter-spacing="4" stroke="none">
      <textPath href="#mcfc-cnc-bot" startOffset="50%" text-anchor="middle">1894</textPath>
    </text>
    <!-- Escudo central canaleta -->
    <path d="M 120 135 H 280 C 280 230 240 280 200 300 C 160 280 120 230 120 135 Z" fill="none" stroke-width="8" stroke-linejoin="round" />
    <!-- Navio Mercantil usinado -->
    <g transform="translate(160, 145)" stroke="none">
      <path d="M 10 35 L 70 35 L 60 50 L 20 50 Z" />
      <path d="M 40 10 L 40 30 L 65 30 Z" />
      <path d="M 35 15 L 35 30 L 15 30 Z" />
    </g>
    <!-- 3 Listras diagonais dos 3 rios -->
    <g stroke="none">
      <polygon points="135,210 155,210 215,280 195,280" />
      <polygon points="175,210 195,210 235,270 215,270" />
      <polygon points="215,210 235,210 255,250 235,250" />
    </g>
  </g>
</svg>`
  },

  'manchester-united': {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="100%" height="100%">
  <!-- MANCHESTER UNITED LOGO OFICIAL -->
  <!-- Faixas Curvas Superior e Inferior -->
  <path d="M 50 110 Q 200 70 350 110 L 330 160 Q 200 130 70 160 Z" fill="#FFE500" stroke="#C70101" stroke-width="4" />
  <text x="200" y="132" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="24" fill="#C70101" text-anchor="middle" letter-spacing="4">MANCHESTER</text>
  <path d="M 70 270 Q 200 300 330 270 L 350 320 Q 200 360 50 320 Z" fill="#FFE500" stroke="#C70101" stroke-width="4" />
  <text x="200" y="318" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="26" fill="#C70101" text-anchor="middle" letter-spacing="6">UNITED</text>
  <!-- Escudo Central com Navio e Red Devil -->
  <path d="M 120 150 H 280 C 280 240 240 280 200 300 C 160 280 120 240 120 150 Z" fill="#FFE500" stroke="#C70101" stroke-width="6" />
  <!-- Navio no topo -->
  <g transform="translate(160, 155)" fill="#C70101">
    <path d="M 10 30 L 70 30 L 60 42 L 20 42 Z" />
    <path d="M 40 10 L 40 26 L 65 26 Z" />
    <path d="M 35 14 L 35 26 L 15 26 Z" />
  </g>
  <!-- Red Devil com Tridente -->
  <g transform="translate(170, 205)" fill="#C70101">
    <!-- Cabeça com chifres -->
    <path d="M 20 15 L 25 5 L 30 15 L 35 5 L 40 15 C 45 25 15 25 20 15 Z" />
    <!-- Corpo e cauda -->
    <path d="M 23 25 H 37 V 55 H 23 Z" />
    <!-- Tridente empunhado -->
    <line x1="48" y1="5" x2="48" y2="70" stroke="#C70101" stroke-width="4" />
    <path d="M 40 12 L 48 5 L 56 12" fill="none" stroke="#C70101" stroke-width="4" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - MANCHESTER UNITED -->
  <g fill="#000000" stroke="#000000">
    <!-- Canaletas das faixas curvas -->
    <path d="M 50 110 Q 200 70 350 110" fill="none" stroke-width="8" />
    <path d="M 70 160 Q 200 130 330 160" fill="none" stroke-width="8" />
    <path d="M 70 270 Q 200 300 330 270" fill="none" stroke-width="8" />
    <path d="M 50 320 Q 200 360 350 320" fill="none" stroke-width="8" />
    <!-- Textos MANCHESTER UNITED entalhados -->
    <text x="200" y="132" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="24" text-anchor="middle" letter-spacing="4" stroke="none">MANCHESTER</text>
    <text x="200" y="318" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="26" text-anchor="middle" letter-spacing="6" stroke="none">UNITED</text>
    <!-- Escudo central canaleta -->
    <path d="M 120 150 H 280 C 280 240 240 280 200 300 C 160 280 120 240 120 150 Z" fill="none" stroke-width="8" stroke-linejoin="round" />
    <!-- Navio mercantil usinado -->
    <g transform="translate(160, 155)" stroke="none">
      <path d="M 10 30 L 70 30 L 60 42 L 20 42 Z" />
      <path d="M 40 10 L 40 26 L 65 26 Z" />
      <path d="M 35 14 L 35 26 L 15 26 Z" />
    </g>
    <!-- Red Devil com Tridente gravado -->
    <g transform="translate(170, 205)">
      <path d="M 20 15 L 25 5 L 30 15 L 35 5 L 40 15 C 45 25 15 25 20 15 Z" stroke="none" />
      <path d="M 23 25 H 37 V 55 H 23 Z" stroke="none" />
      <line x1="48" y1="5" x2="48" y2="70" stroke-width="4" />
      <path d="M 40 12 L 48 5 L 56 12" fill="none" stroke-width="4" />
    </g>
  </g>
</svg>`
  },

  'bayern-munchen': {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- BAYERN MUNCHEN LOGO OFICIAL -->
  <defs>
    <path id="fcb-top-arc" d="M 68 180 A 135 135 0 0 1 332 180" fill="none" />
  </defs>
  <circle cx="200" cy="200" r="190" fill="#DC052D" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#FFFFFF" />
  <circle cx="200" cy="200" r="162" fill="#DC052D" />
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" letter-spacing="3">
    <textPath href="#fcb-top-arc" startOffset="50%" text-anchor="middle">FC BAYERN MÜNCHEN</textPath>
  </text>
  <text x="200" y="370" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" text-anchor="middle">e. V.</text>
  <!-- Centro com Losangos da Baviera Azul e Branco -->
  <circle cx="200" cy="200" r="105" fill="#FFFFFF" stroke="#0066B2" stroke-width="6" />
  <clipPath id="bayern-center-clip">
    <circle cx="200" cy="200" r="100" />
  </clipPath>
  <g clip-path="url(#bayern-center-clip)" fill="#0066B2">
    <!-- Padrão geométrico de diamantes da Baviera -->
    <polygon points="120,150 150,130 180,150 150,170" />
    <polygon points="180,150 210,130 240,150 210,170" />
    <polygon points="240,150 270,130 300,150 270,170" />
    <polygon points="90,190 120,170 150,190 120,210" />
    <polygon points="150,190 180,170 210,190 180,210" />
    <polygon points="210,190 240,170 270,190 240,210" />
    <polygon points="270,190 300,170 330,190 300,210" />
    <polygon points="120,230 150,210 180,230 150,250" />
    <polygon points="180,230 210,210 240,230 210,250" />
    <polygon points="240,230 270,210 300,230 270,250" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - BAYERN MUNCHEN -->
  <defs>
    <path id="fcb-cnc-top" d="M 68 180 A 135 135 0 0 1 332 180" fill="none" />
  </defs>
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta circular chanfrada externa -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="14" />
    <circle cx="200" cy="200" r="162" fill="none" stroke-width="6" />
    <circle cx="200" cy="200" r="105" fill="none" stroke-width="8" />
    <!-- Texto FC BAYERN MÜNCHEN gravado -->
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="24" letter-spacing="3" stroke="none">
      <textPath href="#fcb-cnc-top" startOffset="50%" text-anchor="middle">FC BAYERN MÜNCHEN</textPath>
    </text>
    <text x="200" y="370" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="24" text-anchor="middle" stroke="none">e. V.</text>
    <!-- Malha de losangos bávaros usinada -->
    <g stroke="none">
      <polygon points="120,150 150,130 180,150 150,170" />
      <polygon points="180,150 210,130 240,150 210,170" />
      <polygon points="240,150 270,130 300,150 270,170" />
      <polygon points="90,190 120,170 150,190 120,210" />
      <polygon points="150,190 180,170 210,190 180,210" />
      <polygon points="210,190 240,170 270,190 240,210" />
      <polygon points="270,190 300,170 330,190 300,210" />
      <polygon points="120,230 150,210 180,230 150,250" />
      <polygon points="180,230 210,210 240,230 210,250" />
      <polygon points="240,230 270,210 300,230 270,250" />
    </g>
  </g>
</svg>`
  },

  psg: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- PARIS SAINT-GERMAIN LOGO OFICIAL -->
  <defs>
    <path id="psg-top-arc" d="M 75 190 A 130 130 0 0 1 325 190" fill="none" />
    <path id="psg-bot-arc" d="M 320 220 A 130 130 0 0 1 80 220" fill="none" />
  </defs>
  <circle cx="200" cy="200" r="190" fill="#004170" stroke="#FFFFFF" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="#FFFFFF" />
  <circle cx="200" cy="200" r="162" fill="#004170" />
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" letter-spacing="4">
    <textPath href="#psg-top-arc" startOffset="50%" text-anchor="middle">PARIS</textPath>
  </text>
  <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" letter-spacing="3">
    <textPath href="#psg-bot-arc" startOffset="50%" text-anchor="middle">SAINT-GERMAIN</textPath>
  </text>
  <!-- Centro com Torre Eiffel e Flor-de-Lis -->
  <circle cx="200" cy="205" r="100" fill="#FFFFFF" stroke="#004170" stroke-width="4" />
  <!-- Silhueta da Torre Eiffel Vermelha -->
  <g transform="translate(160, 120)" fill="#DA291C">
    <!-- Cúpula e topo -->
    <rect x="36" y="5" width="8" height="25" />
    <!-- Plataforma 1 -->
    <polygon points="34,30 46,30 48,55 32,55" />
    <rect x="25" y="55" width="30" height="6" />
    <!-- Pilares e Arco inferior -->
    <path d="M 22 61 L 5 130 H 22 L 30 90 Q 40 85 50 90 L 58 130 H 75 L 58 61 Z" />
    <!-- Flor de Lis Dourada na base -->
    <path d="M 40 98 C 45 92 50 95 48 105 C 55 102 58 110 50 115 H 30 C 22 110 25 102 32 105 C 30 95 35 92 40 98 Z" fill="#D4AF37" stroke="#111111" stroke-width="1" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - PSG -->
  <defs>
    <path id="psg-cnc-top" d="M 75 190 A 130 130 0 0 1 325 190" fill="none" />
    <path id="psg-cnc-bot" d="M 320 220 A 130 130 0 0 1 80 220" fill="none" />
  </defs>
  <g fill="#000000" stroke="#000000">
    <!-- Canaleta circular chanfrada externa -->
    <circle cx="200" cy="200" r="185" fill="none" stroke-width="14" />
    <circle cx="200" cy="200" r="162" fill="none" stroke-width="6" />
    <circle cx="200" cy="205" r="100" fill="none" stroke-width="8" />
    <!-- Textos PARIS SAINT-GERMAIN gravados -->
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="28" letter-spacing="4" stroke="none">
      <textPath href="#psg-cnc-top" startOffset="50%" text-anchor="middle">PARIS</textPath>
    </text>
    <text font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="20" letter-spacing="3" stroke="none">
      <textPath href="#psg-cnc-bot" startOffset="50%" text-anchor="middle">SAINT-GERMAIN</textPath>
    </text>
    <!-- Torre Eiffel usinada em baixo-relevo -->
    <g transform="translate(160, 120)" stroke="none">
      <rect x="36" y="5" width="8" height="25" />
      <polygon points="34,30 46,30 48,55 32,55" />
      <rect x="25" y="55" width="30" height="6" />
      <path d="M 22 61 L 5 130 H 22 L 30 90 Q 40 85 50 90 L 58 130 H 75 L 58 61 Z" />
      <!-- Flor de Lis -->
      <path d="M 40 98 C 45 92 50 95 48 105 C 55 102 58 110 50 115 H 30 C 22 110 25 102 32 105 C 30 95 35 92 40 98 Z" />
    </g>
  </g>
</svg>`
  },

  juventus: {
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- JUVENTUS LOGO OFICIAL -->
  <!-- Letreiro JUVENTUS no topo -->
  <text x="200" y="70" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="44" fill="#111111" text-anchor="middle" letter-spacing="6">JUVENTUS</text>
  <!-- O Icônico J Minimalista Duplo -->
  <g fill="#111111">
    <!-- J externo -->
    <path d="M 235 110 H 290 V 270 C 290 340 230 380 150 380 C 110 380 75 365 75 330 C 75 305 95 295 115 295 C 135 295 155 315 180 315 C 215 315 235 295 235 260 Z" />
    <!-- J interno paralelo -->
    <path d="M 155 110 H 210 V 230 C 210 255 195 270 170 270 C 150 270 140 255 140 240 C 140 225 150 215 160 215 C 170 215 180 225 190 225 C 195 225 195 220 195 210 V 110 Z" />
  </g>
</svg>`,
    cnc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="100%" height="100%">
  <!-- ARTE CNC MONOCROMATICA - JUVENTUS -->
  <g fill="#000000" stroke="#000000">
    <!-- JUVENTUS gravado no topo -->
    <text x="200" y="70" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="44" text-anchor="middle" letter-spacing="6" stroke="none">JUVENTUS</text>
    <!-- Faixas geométricas do J usinadas com profundidade de 2.5mm -->
    <g stroke="none">
      <path d="M 235 110 H 290 V 270 C 290 340 230 380 150 380 C 110 380 75 365 75 330 C 75 305 95 295 115 295 C 135 295 155 315 180 315 C 215 315 235 295 235 260 Z" />
      <path d="M 155 110 H 210 V 230 C 210 255 195 270 170 270 C 150 270 140 255 140 240 C 140 225 150 215 160 215 C 170 215 180 225 190 225 C 195 225 195 220 195 210 V 110 Z" />
    </g>
  </g>
</svg>`
  }
};

let count = 0;
for (const [id, data] of Object.entries(clubsData)) {
  const clubDir = path.join(clubsDir, id);
  if (!fs.existsSync(clubDir)) {
    fs.mkdirSync(clubDir, { recursive: true });
  }

  const logoPath = path.join(clubDir, 'logo.svg');
  const cncPath = path.join(clubDir, 'cnc.svg');

  fs.writeFileSync(logoPath, data.logo.trim() + '\n', 'utf8');
  fs.writeFileSync(cncPath, data.cnc.trim() + '\n', 'utf8');

  count++;
  console.log(`Generated [${id}]: logo.svg & cnc.svg`);
}

console.log(`Successfully generated assets for ${count} clubs.`);
