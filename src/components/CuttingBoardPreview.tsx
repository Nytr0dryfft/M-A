import React from 'react';
import { Shield, Sparkles, SlidersHorizontal, Layers, Ruler } from 'lucide-react';
import { TeamShield } from '../types';
import { CncShieldRenderer } from './CncShieldRenderer';
import { getWoodById } from '../data/woods';
import { getAssetUrl } from '../utils/assets';

export type ShieldPosition = 'center' | 'top_right' | 'top_left' | 'bottom_right';

export interface CuttingBoardPreviewProps {
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  woodType: string;
  selectedTeam: TeamShield | null;
  engravingType: string; // 'sim_brasao_cnc' | 'sim_brasao_resinado' | 'sim_laser' | 'sim_monograma' | 'sim_logotipo' | 'nao'
  engravingText?: string;
  shieldPosition?: ShieldPosition;
  onPositionChange?: (pos: ShieldPosition) => void;
  shieldScaleCm?: number;
  onScaleChange?: (scaleCm: number) => void;
  showTechnicalView?: boolean;
  onToggleTechnicalView?: () => void;
  pieceType?: string;
}

export const CuttingBoardPreview: React.FC<CuttingBoardPreviewProps> = ({
  lengthCm,
  widthCm,
  thicknessCm,
  woodType,
  selectedTeam,
  engravingType,
  engravingText = '',
  shieldPosition = 'center',
  onPositionChange,
  shieldScaleCm = 14,
  onScaleChange,
  showTechnicalView = false,
  onToggleTechnicalView,
  pieceType = 'tabua_carne',
}) => {
  const [debugCncMask, setDebugCncMask] = React.useState<boolean>(false);
  const isPortaCopos = pieceType === 'porta_copos';

  // Fonte única de verdade das 4 madeiras oficiais do atelier
  const woodTheme = getWoodById(woodType);

  // Aspect ratio calculation constrained within a fixed preview viewport
  // Max container dimensions: 440px width, 280px height
  const containerMaxWidth = 440;
  const containerMaxHeight = 270;
  const boardRatio = lengthCm / widthCm;

  let boardPixelWidth: number;
  let boardPixelHeight: number;

  if (boardRatio >= containerMaxWidth / containerMaxHeight) {
    boardPixelWidth = containerMaxWidth;
    boardPixelHeight = containerMaxWidth / boardRatio;
  } else {
    boardPixelHeight = containerMaxHeight;
    boardPixelWidth = containerMaxHeight * boardRatio;
  }

  // Pixel scale factor: how many pixels per centimeter of the physical cutting board
  const pxPerCm = boardPixelWidth / lengthCm;

  // Real physical parameters translated into scaled pixels
  // 1. Groove offset margin from outer edge: 1.8 cm
  const grooveMarginCm = 1.8;
  const grooveMarginPx = Math.max(12, Math.round(grooveMarginCm * pxPerCm));

  // 2. Groove channel width: 1.0 cm (~8mm a 10mm fresa ball-nose real)
  const grooveWidthCm = 1.0;
  const grooveWidthPx = Math.max(6, Math.min(10, Math.round(grooveWidthCm * pxPerCm)));

  // 3. Corner radius for outer board and groove
  const outerCornerRadiusPx = Math.max(8, Math.round(1.5 * pxPerCm)); // ~1.5cm radius
  const grooveCornerRadiusPx = Math.max(6, Math.round(outerCornerRadiusPx * 0.75));

  // 4. Safe working area inside juice groove
  const safeMarginPx = grooveMarginPx + grooveWidthPx + 6;
  const innerWidthPx = boardPixelWidth - 2 * safeMarginPx;
  const innerHeightPx = boardPixelHeight - 2 * safeMarginPx;

  // 5. Shield size calculation in pixels:
  // REGRA ESTRITA: O brasão NUNCA pode ultrapassar 17 cm de diâmetro ou maior dimensão
  const MAX_SHIELD_SIZE_CM = 17;
  const maxAvailableSpaceCm = isPortaCopos
    ? Math.min(lengthCm - 1.5, widthCm - 1.5)
    : Math.min(
        lengthCm - 2 * (grooveMarginCm + grooveWidthCm + 1.2),
        widthCm - 2 * (grooveMarginCm + grooveWidthCm + 1.2)
      );

  const maxShieldScaleCm = isPortaCopos
    ? Math.min(8.5, maxAvailableSpaceCm)
    : Math.min(MAX_SHIELD_SIZE_CM, maxAvailableSpaceCm);

  const clampedScaleCm = Math.min(
    MAX_SHIELD_SIZE_CM,
    Math.min(
      shieldScaleCm,
      Math.max(isPortaCopos ? 4 : 8, maxShieldScaleCm)
    )
  );
  const shieldPixelSize = Math.round(clampedScaleCm * pxPerCm);

  // 6. Shield positioning coordinates inside working area
  const getShieldStyle = (): React.CSSProperties => {
    switch (shieldPosition) {
      case 'top_right':
        return {
          position: 'absolute',
          top: `${safeMarginPx + 4}px`,
          right: `${safeMarginPx + 4}px`,
        };
      case 'top_left':
        return {
          position: 'absolute',
          top: `${safeMarginPx + 4}px`,
          left: `${safeMarginPx + 4}px`,
        };
      case 'bottom_right':
        return {
          position: 'absolute',
          bottom: `${safeMarginPx + 4}px`,
          right: `${safeMarginPx + 4}px`,
        };
      case 'center':
      default:
        return {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const isResin = engravingType === 'sim_brasao_resinado';
  const isPureCnc = engravingType === 'sim_brasao_cnc';
  const isLaser = engravingType === 'sim_laser' || engravingType === 'sim_monograma' || engravingType === 'sim_logotipo';
  const hasEngraving = engravingType !== 'nao';

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Bar: Title & Technical Mode Switch */}
      <div className="flex items-center justify-between text-xs text-[#C29B68] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C29B68]" />
          <span>Vista Superior Ortogonal CNC</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#DFD3C3]/80">
            {lengthCm} × {widthCm} × {thicknessCm} cm
          </span>
          {onToggleTechnicalView && (
            <button
              type="button"
              onClick={onToggleTechnicalView}
              className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border transition-colors cursor-pointer ${
                showTechnicalView
                  ? 'bg-[#C29B68] text-[#111111] border-[#C29B68]'
                  : 'bg-black/40 text-[#DFD3C3] border-[#DFD3C3]/30 hover:border-[#C29B68]'
              }`}
              title="Alternar entre visualização realista e cotas de usinagem"
            >
              {showTechnicalView ? 'Modo Realista' : 'Cotas Técnicas'}
            </button>
          )}

          {isPureCnc && selectedTeam && (
            <button
              type="button"
              onClick={() => setDebugCncMask(!debugCncMask)}
              className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 border transition-all cursor-pointer ${
                debugCncMask
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-black/60 text-amber-300 border-amber-400/50 hover:border-amber-400 hover:text-amber-200'
              }`}
              title="Teste de depuração obrigatório: exibe exclusivamente o arquivo cncArtwork puro sem efeitos"
            >
              {debugCncMask ? '● DEBUG MASK ATIVO' : 'DEBUG CNC MASK'}
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport: Professional Studio Workbench View (Photographic Orthogonal Top-Down) */}
      <div
        className="w-full h-72 sm:h-80 bg-[#1A1715] border border-[#DFD3C3]/25 flex items-center justify-center p-3 relative overflow-hidden select-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 48%, rgba(95, 75, 58, 0.45) 0%, rgba(32, 27, 24, 0.9) 65%, rgba(16, 14, 12, 0.98) 100%)',
        }}
      >
        {/* Banner do Modo de Depuração Obrigatório */}
        {debugCncMask && isPureCnc && selectedTeam && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-amber-300 bg-black/95 px-2.5 py-1.5 border border-amber-400/80 z-30 pointer-events-none shadow-lg">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              MODO DEBUG CNC MASK ATIVO
            </span>
            <span className="truncate max-w-[280px] text-amber-400/90 font-bold">
              {selectedTeam.cncArtwork} (geometria vetorial pura)
            </span>
          </div>
        )}
        {/* Subtle studio tabletop surface texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(220, 185, 145, 0.15) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Technical Callout Overlay (Active when showTechnicalView is on) */}
        {showTechnicalView && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-[#C29B68] bg-black/85 px-2.5 py-1 border border-[#C29B68]/30 z-20 pointer-events-none">
            <span>CANALETA: Margem 20mm | Largura 12mm | Raio R15</span>
            <span>USINAGEM: Profundidade 2,5mm | Fresa Esférica Ø12mm</span>
          </div>
        )}

        {/* ========================================================
            THE ACTUAL CUTTING BOARD PIECE (REALISTIC SOLID WOOD PHOTO)
            ======================================================== */}
        <div
          className="relative transition-all duration-300 overflow-hidden"
          style={{
            width: `${boardPixelWidth}px`,
            height: `${boardPixelHeight}px`,
            borderRadius: `${outerCornerRadiusPx}px`,
            backgroundColor: woodTheme.baseColor,
            backgroundImage: `url("${woodTheme.textureUrl ? getAssetUrl(woodTheme.textureUrl) : getAssetUrl('/textures/teak_wood.jpg')}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: `
              0 22px 48px -10px rgba(0, 0, 0, 0.72),
              0 9px 20px -4px rgba(0, 0, 0, 0.45),
              0 2px 5px rgba(0, 0, 0, 0.3),
              inset 0 1.5px 2px rgba(255, 245, 220, 0.38),
              inset 0 -1.5px 2px rgba(45, 22, 10, 0.45)
            `,
          }}
        >
          {/* Subtle wood species tinting layer if applicable */}
          {woodTheme.filterTint && woodTheme.filterTint !== 'none' && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color opacity-35"
              style={{
                borderRadius: `${outerCornerRadiusPx}px`,
                backgroundColor: woodTheme.baseColor,
              }}
            />
          )}

          {/* Natural Satin Mineral Oil & Beeswax Studio Sheen */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: `${outerCornerRadiusPx}px`,
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 35%, transparent 60%, rgba(0, 0, 0, 0.08) 100%)',
            }}
          />

          {/* Chamfered outer edge bevel with realistic wood contour */}
          <div
            className="absolute inset-0 pointer-events-none border border-black/25"
            style={{
              borderRadius: `${outerCornerRadiusPx}px`,
              boxShadow: `
                inset 1px 1px 1.5px rgba(255, 255, 255, 0.18),
                inset -1px -1px 2px rgba(0, 0, 0, 0.35)
              `,
            }}
          />

          {/* ========================================================
              CANALETA PERIMETRAL DE GORDURA (JUICE GROOVE)
              Fresa ball-nose CNC usinada na própria madeira:
              - Continuidade absoluta dos veios e textura da madeira (sem cor sólida)
              - Rebaixo físico: oclusão sutil de profundidade + chanfro com reflexo fino
              ======================================================== */}
          {!isPortaCopos && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${grooveMarginPx}px`,
                left: `${grooveMarginPx}px`,
                right: `${grooveMarginPx}px`,
                bottom: `${grooveMarginPx}px`,
                borderRadius: `${grooveCornerRadiusPx}px`,
                border: `${grooveWidthPx}px solid rgba(22, 10, 5, 0.16)`,
                boxShadow: `
                  /* Parede interna da fresagem: sombra suave da concavidade */
                  inset 1px 1px 2px rgba(0, 0, 0, 0.42),
                  inset -0.5px -0.5px 1px rgba(255, 255, 255, 0.2),
                  /* Parede externa: leve oclusão de contato e reflexo de borda */
                  0 1px 1.5px rgba(0, 0, 0, 0.28),
                  0 -0.5px 1px rgba(255, 255, 255, 0.14)
                `,
              }}
            >
              {/* Leve concavidade no fundo arredondado da fresa esférica */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: `${Math.max(2, grooveCornerRadiusPx - 2)}px`,
                  boxShadow: 'inset 0 0.5px 1px rgba(0, 0, 0, 0.15)',
                }}
              />
            </div>
          )}

          {/* Technical Guide Outline for CNC Router Bit Path (shown in technical view) */}
          {showTechnicalView && !isPortaCopos && (
            <div
              className="absolute pointer-events-none border border-dashed border-[#C29B68]/50"
              style={{
                top: `${grooveMarginPx + grooveWidthPx / 2}px`,
                left: `${grooveMarginPx + grooveWidthPx / 2}px`,
                right: `${grooveMarginPx + grooveWidthPx / 2}px`,
                bottom: `${grooveMarginPx + grooveWidthPx / 2}px`,
                borderRadius: `${grooveCornerRadiusPx}px`,
              }}
            />
          )}

          {/* ========================================================
              ÁREA ÚTIL CENTRAL & BRASÃO USINADO EM CNC
              No fake rectangular plaques, no circular discs, no stickers!
              ======================================================== */}
          {hasEngraving && selectedTeam && (
            <div
              style={getShieldStyle()}
              className="flex flex-col items-center justify-center transition-all duration-200 pointer-events-none"
            >
              {/* CNC Machined Crest */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: `${shieldPixelSize}px`,
                  height: `${shieldPixelSize}px`,
                }}
              >
                {/* 
                  SISTEMA DE USINAGEM CNC TÉCNICA DOS ESCUDOS:
                  Renderiza como mapa de profundidade físico real de 2,5mm.
                  Preserva integralmente a textura da madeira e a geometria interna da arte (listras, letras, divisões).
                  NENHUMA silhueta preta ou elemento adesivo!
                */}
                <CncShieldRenderer
                  team={selectedTeam}
                  size={shieldPixelSize}
                  woodTheme={woodTheme}
                  mode={isResin ? 'resin' : isLaser ? 'laser' : 'pure_cnc'}
                  debugMode={debugCncMask && isPureCnc}
                />
              </div>

              {/* Optional Custom Engraved Text: ONLY shown if client explicitly typed it! */}
              {engravingText.trim() && (
                <div
                  className="mt-1 text-center font-serif text-[10px] sm:text-[11px] font-bold tracking-widest uppercase"
                  style={{
                    color: isResin ? '#111111' : '#2A180E',
                    textShadow: `
                      0 1px 1px rgba(255, 255, 255, 0.15),
                      0 -1px 1px rgba(0, 0, 0, 0.7)
                    `,
                    maxWidth: `${Math.round(innerWidthPx * 0.9)}px`,
                  }}
                >
                  {engravingText.trim()}
                </div>
              )}
            </div>
          )}

          {/* Case: No team shield, but custom text entered */}
          {hasEngraving && !selectedTeam && engravingText.trim() && (
            <div
              className="absolute inset-0 flex items-center justify-center p-6 text-center font-serif text-sm font-bold tracking-widest uppercase pointer-events-none"
              style={{
                color: '#2A180E',
                textShadow: '0 1px 1px rgba(255, 255, 255, 0.15), 0 -1px 1px rgba(0, 0, 0, 0.7)',
              }}
            >
              {engravingText.trim()}
            </div>
          )}

          {/* Technical Dimension Lines on Board (if showTechnicalView is on) */}
          {showTechnicalView && (
            <>
              {/* Length indicator (top) */}
              <div className="absolute -top-5 left-0 right-0 flex items-center justify-between text-[9px] font-mono text-[#C29B68]">
                <span>◀</span>
                <span className="bg-black/90 px-1 border border-[#C29B68]/30">L = {lengthCm} cm</span>
                <span>▶</span>
              </div>
              {/* Width indicator (right) */}
              <div className="absolute -right-6 top-0 bottom-0 flex flex-col items-center justify-between text-[9px] font-mono text-[#C29B68]">
                <span>▲</span>
                <span className="bg-black/90 px-1 border border-[#C29B68]/30 rotate-90 whitespace-nowrap">
                  W = {widthCm} cm
                </span>
                <span>▼</span>
              </div>
            </>
          )}
        </div>

        {/* Bottom Status Callouts */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#C29B68] bg-black/70 px-2 py-0.5 border border-[#C29B68]/30">
          <Shield className="w-3 h-3" />
          <span>
            {selectedTeam ? selectedTeam.name : 'Superfície sem brasão'}
            {hasEngraving && isResin && ' • Resina Atóxica'}
            {hasEngraving && isPureCnc && ' • Entalhe CNC Madeira'}
            {hasEngraving && isLaser && ' • Gravação CNC'}
          </span>
        </div>

        <div className="absolute bottom-2 right-2 text-[9px] uppercase tracking-wider text-[#DFD3C3]/70 bg-black/70 px-2 py-0.5 border border-[#DFD3C3]/20">
          Espessura: {thicknessCm} cm
        </div>
      </div>

      {/* ========================================================
          CONTROLES DE POSICIONAMENTO E TAMANHO DO BRASÃO
          ======================================================== */}
      {hasEngraving && selectedTeam && (
        <div className="p-3 bg-[#171412] border border-[#DFD3C3]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Posição na Tábua */}
          {onPositionChange && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-[#C29B68] shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Posição:</span>
              </span>
              <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
                {[
                  { id: 'center' as ShieldPosition, label: 'Centro' },
                  { id: 'top_right' as ShieldPosition, label: 'Sup. Dir.' },
                  { id: 'top_left' as ShieldPosition, label: 'Sup. Esq.' },
                  { id: 'bottom_right' as ShieldPosition, label: 'Inf. Dir.' },
                ].map((pos) => (
                  <button
                    type="button"
                    key={pos.id}
                    onClick={() => onPositionChange(pos.id)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                      shieldPosition === pos.id
                        ? 'bg-[#C29B68] text-[#111111] border-[#C29B68]'
                        : 'bg-black/30 text-[#DFD3C3] border-[#DFD3C3]/20 hover:border-[#C29B68]'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Diâmetro do Brasão */}
          {onScaleChange && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[10px] uppercase font-bold text-[#C29B68] shrink-0 flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                <span>Tamanho:</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={isPortaCopos ? 4 : 10}
                  max={
                    isPortaCopos
                      ? Math.max(5, Math.floor(maxShieldScaleCm))
                      : Math.min(17, Math.max(10, Math.floor(maxShieldScaleCm)))
                  }
                  value={clampedScaleCm}
                  onChange={(e) => onScaleChange(Math.min(17, Number(e.target.value)))}
                  className="w-20 sm:w-24 accent-[#C29B68] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-white tabular-nums w-12 text-right">
                  {clampedScaleCm} cm
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
