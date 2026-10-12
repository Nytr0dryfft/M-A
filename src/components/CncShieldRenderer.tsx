import React, { useEffect, useState } from 'react';
import { TeamShield } from '../types';
import { getAssetUrl } from '../utils/assets';

export interface CncShieldRendererProps {
  team: TeamShield;
  size: number;
  woodTheme: {
    name: string;
    baseColor: string;
    gradient: string;
    grainColor: string;
    secondaryGrain: string;
    highlight: string;
    grooveBottom: string;
    borderTone: string;
    textureUrl?: string;
    filterTint?: string;
  };
  mode: 'pure_cnc' | 'resin' | 'laser';
  debugMode?: boolean;
}

/**
 * CncShieldRenderer
 *
 * ARQUITETURA DE ARTE SOBERANA:
 * - O sistema NÃO reconstrói, NÃO redesenha e NÃO simplifica a geometria do clube.
 * - displayLogo: Utilizado apenas para exibição no card de seleção ou resina.
 * - cncArtwork: Arquivo SVG monocromático soberano (ex: /clubs/flamengo/cnc.svg).
 *
 * FLUXO DE RENDERIZAÇÃO:
 * WOOD TEXTURE -> CNC SVG MASK -> INNER SHADOW -> SUBTLE DARKENING -> EDGE HIGHLIGHT -> BEVEL / DEPTH
 */
export const CncShieldRenderer: React.FC<CncShieldRendererProps> = ({
  team,
  size,
  woodTheme,
  mode,
  debugMode = false,
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);

  const cncArtworkUrl = getAssetUrl(team.cncArtwork || `/clubs/${team.id}/cnc.svg`);
  const displayLogoUrl = getAssetUrl(team.displayLogo || team.imageUrl || `/clubs/${team.id}/logo.svg`);

  // Carrega o SVG CNC bruto para renderização de máscara e depuração
  useEffect(() => {
    let isMounted = true;
    setLoadError(false);

    fetch(cncArtworkUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!isMounted) return;
        const cleaned = text
          .replace(/<\?xml[^>]*\?>/gi, '')
          .replace(/<!DOCTYPE[^>]*>/gi, '');
        setSvgContent(cleaned);
      })
      .catch(() => {
        // Fallback para o placeholder padrão
        fetch(getAssetUrl('/clubs/default-cnc.svg'))
          .then((res) => res.text())
          .then((fallbackText) => {
            if (!isMounted) return;
            const cleaned = fallbackText
              .replace(/<\?xml[^>]*\?>/gi, '')
              .replace(/<!DOCTYPE[^>]*>/gi, '');
            setSvgContent(cleaned);
          })
          .catch(() => {
            if (isMounted) setLoadError(true);
          });
      });

    return () => {
      isMounted = false;
    };
  }, [cncArtworkUrl, team.id]);

  // =========================================================================
  // MODO 1: TESTE DE DEPURAÇÃO OBRIGATÓRIO (DEBUG CNC MASK)
  // Mostra SOMENTE o cncArtwork puro, sem textura, sombra, bevel ou qualquer efeito.
  // =========================================================================
  if (debugMode) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-2 bg-[#121110] border-2 border-amber-400 relative select-none shadow-2xl"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className="absolute top-1 left-1.5 right-1.5 flex justify-between items-center text-[9px] font-mono font-bold text-amber-300 bg-black/90 px-1.5 py-0.5 border border-amber-400/40 z-20">
          <span>DEBUG MASK SOBERANO</span>
          <span className="truncate max-w-[140px] text-amber-400">{cncArtworkUrl}</span>
        </div>

        {/* Renderização 1:1 do SVG bruto sem filtros */}
        <div className="w-full h-full flex items-center justify-center pt-3 relative">
          {svgContent ? (
            <div className="w-full h-full flex items-center justify-center relative">
              <style>{`
                .debug-cnc-view svg { width: 100%; height: 100%; max-width: 100%; max-height: 100%; }
                .debug-cnc-view [fill]:not([fill="none"]) { fill: #FBBF24 !important; }
                .debug-cnc-view [stroke]:not([stroke="none"]) { stroke: #FBBF24 !important; }
                .debug-cnc-view text { fill: #FBBF24 !important; }
                .debug-cnc-view polygon { fill: #FBBF24 !important; }
                .debug-cnc-view rect:not([fill="none"]) { fill: #FBBF24 !important; }
                .debug-cnc-view path:not([fill="none"]) { fill: #FBBF24 !important; }
              `}</style>
              <div
                className="debug-cnc-view w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          ) : (
            <img
              src={cncArtworkUrl}
              alt={`Debug CNC: ${team.name}`}
              className="w-full h-full object-contain filter invert"
            />
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODO 2: USINAGEM CNC COM RESINA EPÓXI (sim_brasao_resinado)
  // Cavidade usinada e preenchida com resina culinária polida
  // =========================================================================
  if (mode === 'resin') {
    return (
      <div
        className="relative flex items-center justify-center pointer-events-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Sombra da cavidade periférica */}
        <img
          src={displayLogoUrl}
          alt={team.name}
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            filter: 'brightness(0) drop-shadow(0 1.5px 2px rgba(0,0,0,0.9))',
            opacity: 0.85,
            transform: 'translateY(1px)',
          }}
          referrerPolicy="no-referrer"
        />

        {/* Emblema esmaltado/resinado oficial */}
        <img
          src={displayLogoUrl}
          alt={team.name}
          className="relative w-full h-full object-contain"
          style={{
            filter: 'contrast(1.08) brightness(0.95) drop-shadow(0 0 1px rgba(0,0,0,0.5))',
          }}
          referrerPolicy="no-referrer"
        />

        {/* Brilho acetinado de resina vítrea */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)',
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // MODO 3: GRAVAÇÃO RASA A LASER (sim_laser)
  // Pirografia térmica nas fibras da madeira
  // =========================================================================
  if (mode === 'laser') {
    return (
      <div
        className="relative flex items-center justify-center pointer-events-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img
          src={cncArtworkUrl || displayLogoUrl}
          alt={team.name}
          className="relative w-full h-full object-contain"
          style={{
            filter: 'sepia(0.95) hue-rotate(-28deg) brightness(0.35) contrast(1.7)',
            mixBlendMode: 'multiply',
            opacity: 0.9,
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // =========================================================================
  // MODO 4: BAIXO-RELEVO CNC EM MADEIRA MACIÇA (pure_cnc)
  // A geometria de cncArtwork é usada como MÁSCARA sobre a madeira.
  //
  // FLUXO:
  // 1. Textura original da madeira continua visível dentro dos desbastes
  // 2. Máscara estrita baseada no arquivo vetorial soberano cncArtwork
  // 3. Sombra interna superior (profundidade física ~2,5mm)
  // 4. Escurecimento moderado do cerne da madeira desbastada
  // 5. Highlight sutil no chanfro da borda inferior
  // 6. As regiões não usinadas permanecem transparentes (madeira original da tábua)
  // =========================================================================
  const maskStyle: React.CSSProperties = {
    maskImage: `url("${cncArtworkUrl}")`,
    WebkitMaskImage: `url("${cncArtworkUrl}")`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
  };

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none select-none transition-transform duration-200"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Camada de desbaste usinado mascarada pelo SVG CNC soberano */}
      <div className="relative w-full h-full" style={maskStyle}>
        {/* 1. Textura contínua fotográfica de madeira real no fundo da cavidade rebaixada */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${woodTheme.textureUrl ? getAssetUrl(woodTheme.textureUrl) : getAssetUrl('/textures/pinus_wood.jpg')}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.78) contrast(1.15)',
          }}
        />

        {/* 2. Escurecimento do desbaste físico do cerne da madeira (profundidade CNC 2,5mm) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: woodTheme.grooveBottom,
            opacity: 0.35,
            mixBlendMode: 'multiply',
          }}
        />

        {/* 5. Sombra interna física (profundidade simulada de ~2,5 mm sob iluminação superior) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 7px, transparent 20px)',
          }}
        />

        {/* 6. Highlight discreto no chanfro da borda inferior cortada pela fresa */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(0deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 2px, transparent 6px)',
          }}
        />
      </div>

      {/* Sombra de oclusão de borda externa da cavidade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          ...maskStyle,
          boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.65)',
          opacity: 0.6,
        }}
      />
    </div>
  );
};
