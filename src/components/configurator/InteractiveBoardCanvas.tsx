import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  CanvasElement,
  ProductPieceType,
  PreviewMode,
} from '../../types/configurator';
import { getWoodById } from '../../data/woods';
import { getAssetUrl } from '../../utils/assets';
import {
  AlertTriangle,
  Copy,
  Trash2,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  RotateCw,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Move,
} from 'lucide-react';

interface InteractiveBoardCanvasProps {
  pieceType: ProductPieceType;
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  woodType: string;
  isResin: boolean;
  elements: CanvasElement[];
  selectedElementId: string | null;
  previewMode: PreviewMode;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (updated: CanvasElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onAlignElement: (
    id: string,
    alignment: 'center_h' | 'center_v' | 'left' | 'right' | 'top' | 'bottom'
  ) => void;
  onSnapshotReady?: (dataUrl: string) => void;
}

export const InteractiveBoardCanvas: React.FC<InteractiveBoardCanvasProps> = ({
  pieceType,
  lengthCm,
  widthCm,
  thicknessCm,
  woodType,
  isResin,
  elements,
  selectedElementId,
  previewMode,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onAlignElement,
  onSnapshotReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Largura dinâmica do contêiner para adaptação responsiva no mobile (320px, 360px, 375px, 390px, 430px)
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(520, Math.max(280, window.innerWidth - 32));
    }
    return 520;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) {
          setContainerWidth(w);
        }
      }
    };
    updateSize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateSize();
      });
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Nível padrão fixo de proporção do viewport de edição (100%)
  const zoomLevel = 1;
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Referência para distinguir clique simples de arraste (drag threshold > 4px)
  const pointerIntentRef = useRef<{
    pointerDown: boolean;
    hasMovedPastThreshold: boolean;
    startX: number;
    startY: number;
    elementId: string | null;
    elementStartX: number;
    elementStartY: number;
    elementStartWidthCm: number;
    elementStartHeightCm: number;
    elementStartRotation: number;
    aspectRatio: number;
    centerXPx: number;
    centerYPx: number;
  }>({
    pointerDown: false,
    hasMovedPastThreshold: false,
    startX: 0,
    startY: 0,
    elementId: null,
    elementStartX: 50,
    elementStartY: 50,
    elementStartWidthCm: 10,
    elementStartHeightCm: 10,
    elementStartRotation: 0,
    aspectRatio: 1,
    centerXPx: 0,
    centerYPx: 0,
  });

  const isPortaCopos = pieceType === 'porta_copos';
  const woodTheme = getWoodById(woodType);

  // ENQUADRAMENTO RESPONSIVO E RIGOROSAMENTE HORIZONTAL DA TÁBUA NO MOBILE:
  // - No desktop (>= 1024px): preserva o tamanho nominal (520px largura por 360px altura).
  // - No mobile (320px a 430px): enquadra suavemente no espaço disponível com margens simétricas.
  // - A tábua NUNCA é girada para vertical, esticada ou deformada.
  // - A proporção física lengthCm / widthCm é estritamente mantida (comprimento > largura).
  const isMobileViewport = containerWidth < 520;
  const lateralPadding = isMobileViewport ? 20 : 0;
  const availableWidth = Math.max(250, Math.min(520, containerWidth - lateralPadding));
  const maxBaseWidth = availableWidth;
  const maxBaseHeight = isMobileViewport
    ? Math.min(360, Math.round(availableWidth * 0.72))
    : 360;

  const boardRatio = lengthCm / widthCm;

  let basePixelWidth: number;
  let basePixelHeight: number;

  if (boardRatio >= maxBaseWidth / maxBaseHeight) {
    basePixelWidth = Math.round(maxBaseWidth);
    basePixelHeight = Math.round(maxBaseWidth / boardRatio);
  } else {
    basePixelHeight = Math.round(maxBaseHeight);
    basePixelWidth = Math.round(maxBaseHeight * boardRatio);
  }

  // Fator de escala: pixels na tela por centímetro real
  const pxPerCm = basePixelWidth / lengthCm;

  // Parâmetros físicos da madeira
  // 1. Canaleta de gordura (Juice Groove)
  const grooveMarginCm = 1.8;
  const grooveMarginPx = Math.round(grooveMarginCm * pxPerCm);
  const grooveWidthCm = 1.0;
  const grooveWidthPx = Math.max(5, Math.round(grooveWidthCm * pxPerCm));
  const outerRadiusPx = Math.max(8, Math.round(1.5 * pxPerCm));
  const grooveRadiusPx = Math.max(6, Math.round(outerRadiusPx * 0.75));

  // 2. Margem de segurança interna (Zona permitida para gravação sem tocar na canaleta)
  const safeMarginCm = isPortaCopos ? 1.0 : grooveMarginCm + grooveWidthCm + 0.8;
  const safeMarginPx = Math.round(safeMarginCm * pxPerCm);

  // Limites da área útil em cm
  const maxSafeWidthCm = lengthCm - 2 * safeMarginCm;
  const maxSafeHeightCm = widthCm - 2 * safeMarginCm;

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  // -------------------------------------------------------------
  // TRATAMENTO PROFISSIONAL DE EVENTOS: SELEÇÃO POR CLIQUE VS ARRASTE
  // -------------------------------------------------------------

  const handleElementPointerDown = (
    e: React.PointerEvent,
    element: CanvasElement
  ) => {
    // Interrompe borbulhamento para não desselecionar no clique da tábua
    e.stopPropagation();

    // 1. SELEÇÃO IMEDIATA COM CLIQUE SIMPLES
    onSelectElement(element.id);

    // 2. Prepara intenção de arraste SEM ativar isDragging antecipadamente
    pointerIntentRef.current = {
      pointerDown: true,
      hasMovedPastThreshold: false,
      startX: e.clientX,
      startY: e.clientY,
      elementId: element.id,
      elementStartX: element.xPercent,
      elementStartY: element.yPercent,
      elementStartWidthCm: element.widthCm,
      elementStartHeightCm: element.heightCm,
      elementStartRotation: element.rotationDeg,
      aspectRatio: element.aspectRatio || 1,
      centerXPx: 0,
      centerYPx: 0,
    };
  };

  // Início de redimensionamento por alça
  const handleResizeHandleDown = (
    e: React.PointerEvent,
    handleType: string,
    element: CanvasElement
  ) => {
    e.stopPropagation();
    setActiveHandle(handleType);

    pointerIntentRef.current = {
      pointerDown: true,
      hasMovedPastThreshold: true,
      startX: e.clientX,
      startY: e.clientY,
      elementId: element.id,
      elementStartX: element.xPercent,
      elementStartY: element.yPercent,
      elementStartWidthCm: element.widthCm,
      elementStartHeightCm: element.heightCm,
      elementStartRotation: element.rotationDeg,
      aspectRatio: element.aspectRatio || 1,
      centerXPx: 0,
      centerYPx: 0,
    };
  };

  // Início de rotação
  const handleRotateHandleDown = (
    e: React.PointerEvent,
    element: CanvasElement
  ) => {
    e.stopPropagation();
    setIsRotating(true);

    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const elemCenterXPx = rect.left + (element.xPercent / 100) * rect.width;
    const elemCenterYPx = rect.top + (element.yPercent / 100) * rect.height;

    pointerIntentRef.current = {
      pointerDown: true,
      hasMovedPastThreshold: true,
      startX: elemCenterXPx,
      startY: elemCenterYPx,
      elementId: element.id,
      elementStartX: element.xPercent,
      elementStartY: element.yPercent,
      elementStartWidthCm: element.widthCm,
      elementStartHeightCm: element.heightCm,
      elementStartRotation: element.rotationDeg,
      aspectRatio: element.aspectRatio || 1,
      centerXPx: elemCenterXPx,
      centerYPx: elemCenterYPx,
    };
  };

  // Movimento de pointer unificado no container
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!selectedElement) return;

    // A. Rotação ativa
    if (isRotating) {
      const centerXPx = pointerIntentRef.current.startX;
      const centerYPx = pointerIntentRef.current.startY;
      const angleRad = Math.atan2(e.clientY - centerYPx, e.clientX - centerXPx);
      let angleDeg = Math.round((angleRad * 180) / Math.PI) - 90;

      // Normaliza entre -180 e 180
      while (angleDeg > 180) angleDeg -= 360;
      while (angleDeg < -180) angleDeg += 360;

      // Snap magnético suave a cada 45 graus
      const snapPoints = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
      for (const snap of snapPoints) {
        if (Math.abs(angleDeg - snap) <= 4) {
          angleDeg = snap;
          break;
        }
      }

      onUpdateElement({
        ...selectedElement,
        rotationDeg: angleDeg,
      });
      return;
    }

    // B. Redimensionamento ativo por alça
    if (activeHandle) {
      const deltaXPx = (e.clientX - pointerIntentRef.current.startX) / zoomLevel;
      const deltaYPx = (e.clientY - pointerIntentRef.current.startY) / zoomLevel;

      const deltaWidthCm = deltaXPx / pxPerCm;
      const deltaHeightCm = deltaYPx / pxPerCm;
      const startWidth = pointerIntentRef.current.elementStartWidthCm;
      const startHeight = pointerIntentRef.current.elementStartHeightCm;
      const aspect = pointerIntentRef.current.aspectRatio;

      let newWidthCm = startWidth;
      let newHeightCm = startHeight;

      if (activeHandle === 'se') {
        newWidthCm = Math.max(2.5, startWidth + deltaWidthCm);
        newHeightCm = newWidthCm / aspect;
      } else if (activeHandle === 'nw') {
        newWidthCm = Math.max(2.5, startWidth - deltaWidthCm);
        newHeightCm = newWidthCm / aspect;
      } else if (activeHandle === 'ne') {
        newWidthCm = Math.max(2.5, startWidth + deltaWidthCm);
        newHeightCm = newWidthCm / aspect;
      } else if (activeHandle === 'sw') {
        newWidthCm = Math.max(2.5, startWidth - deltaWidthCm);
        newHeightCm = newWidthCm / aspect;
      }

      // Restrição física: Não pode exceder as dimensões físicas da tábua
      const maxAllowedWidthCm = lengthCm - 1;
      const maxAllowedHeightCm = widthCm - 1;

      if (newWidthCm > maxAllowedWidthCm) {
        newWidthCm = maxAllowedWidthCm;
        newHeightCm = newWidthCm / aspect;
      }
      if (newHeightCm > maxAllowedHeightCm) {
        newHeightCm = maxAllowedHeightCm;
        newWidthCm = newHeightCm * aspect;
      }

      onUpdateElement({
        ...selectedElement,
        widthCm: +newWidthCm.toFixed(2),
        heightCm: +newHeightCm.toFixed(2),
      });
      return;
    }

    // C. Verificação de Arraste de Elemento (Movimentação)
    if (pointerIntentRef.current.pointerDown) {
      const dist = Math.hypot(
        e.clientX - pointerIntentRef.current.startX,
        e.clientY - pointerIntentRef.current.startY
      );

      // Apenas entra em modo de arrasto se o usuário realmente movimentou o ponteiro (> 4px)
      if (!pointerIntentRef.current.hasMovedPastThreshold) {
        if (dist > 4) {
          pointerIntentRef.current.hasMovedPastThreshold = true;
          setIsDragging(true);
        } else {
          return;
        }
      }

      const deltaXPx = (e.clientX - pointerIntentRef.current.startX) / zoomLevel;
      const deltaYPx = (e.clientY - pointerIntentRef.current.startY) / zoomLevel;

      const deltaXPercent = (deltaXPx / basePixelWidth) * 100;
      const deltaYPercent = (deltaYPx / basePixelHeight) * 100;

      let newX = +(pointerIntentRef.current.elementStartX + deltaXPercent).toFixed(2);
      let newY = +(pointerIntentRef.current.elementStartY + deltaYPercent).toFixed(2);

      // Snap magnético inteligente ao centro exato da tábua (50%)
      if (Math.abs(newX - 50) < 1.2) newX = 50;
      if (Math.abs(newY - 50) < 1.2) newY = 50;

      // Restrição estrita de bordas: O elemento NUNCA sai da tábua
      const halfWPercent = ((selectedElement.widthCm / lengthCm) * 100) / 2;
      const halfHPercent = ((selectedElement.heightCm / widthCm) * 100) / 2;

      newX = Math.max(halfWPercent + 1, Math.min(100 - halfWPercent - 1, newX));
      newY = Math.max(halfHPercent + 1, Math.min(100 - halfHPercent - 1, newY));

      onUpdateElement({
        ...selectedElement,
        xPercent: newX,
        yPercent: newY,
      });
    }
  };

  const handlePointerUp = () => {
    pointerIntentRef.current.pointerDown = false;
    setIsDragging(false);
    setIsRotating(false);
    setActiveHandle(null);
  };

  // Rotação incremental por botão na toolbar
  const handleRotateDelta = (deltaDeg: number) => {
    if (!selectedElement) return;
    let next = selectedElement.rotationDeg + deltaDeg;
    while (next > 180) next -= 360;
    while (next < -180) next += 360;
    onUpdateElement({
      ...selectedElement,
      rotationDeg: next,
    });
  };

  // Helper para verificar se um elemento está ultrapassando a área permitida da canaleta
  const checkElementCollision = (el: CanvasElement): boolean => {
    const centerXCm = (el.xPercent / 100) * lengthCm;
    const centerYCm = (el.yPercent / 100) * widthCm;

    const halfW = el.widthCm / 2;
    const halfH = el.heightCm / 2;

    const left = centerXCm - halfW;
    const right = centerXCm + halfW;
    const top = centerYCm - halfH;
    const bottom = centerYCm + halfH;

    return (
      left < safeMarginCm ||
      right > lengthCm - safeMarginCm ||
      top < safeMarginCm ||
      bottom > widthCm - safeMarginCm
    );
  };

  // Gera snapshot de alta qualidade em PNG para a prévia da encomenda (SEM caixas de seleção)
  const generateSnapshot = useCallback(() => {
    if (!onSnapshotReady || !boardRef.current) return;

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = basePixelWidth * 2;
      exportCanvas.height = basePixelHeight * 2;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      // Desenha fundo da madeira
      ctx.fillStyle = woodTheme.baseColor;
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      const url = exportCanvas.toDataURL('image/png');
      onSnapshotReady(url);
    } catch {
      // Ignora falhas menores de snapshot cross-origin
    }
  }, [basePixelWidth, basePixelHeight, woodTheme.baseColor, onSnapshotReady]);

  useEffect(() => {
    const timer = setTimeout(generateSnapshot, 600);
    return () => clearTimeout(timer);
  }, [elements, lengthCm, widthCm, woodType, isResin, generateSnapshot]);

  const hasSelectedCollision = selectedElement ? checkElementCollision(selectedElement) : false;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-between w-full select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Área Central de Visualização & Interação */}
      <div
        className="relative w-full min-h-[250px] sm:min-h-[410px] flex items-center justify-center p-2.5 sm:p-6 overflow-hidden bg-[#15100D] border border-[#DFD3C3]/20 shadow-inner"
        onPointerDown={(e) => {
          // Clique no fundo vazio desseleciona elementos
          if (e.target === e.currentTarget) {
            onSelectElement(null);
          }
        }}
      >
        {/* Grid de fundo estilo prancheta de atelier */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(194, 155, 104, 0.25) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Eixos graduados no modo técnico */}
        {previewMode === 'tecnico_guias' && (
          <div className="absolute top-2 left-2 text-[9px] font-mono text-[#C29B68]/70 flex items-center gap-1 pointer-events-none">
            <span>0 cm</span>
            <span className="w-8 border-b border-[#C29B68]/40" />
            <span>Escala calibrada 1:{((pxPerCm) / 38).toFixed(1)}</span>
          </div>
        )}

        {/* O BLOCO PRINCIPAL DA TÁBUA DE MADEIRA */}
        <div
          ref={boardRef}
          className="relative transition-transform duration-75 ease-out shadow-2xl"
          style={{
            width: `${basePixelWidth}px`,
            height: `${basePixelHeight}px`,
            transform: `scale(${zoomLevel})`,
            borderRadius: `${outerRadiusPx}px`,
            backgroundColor: woodTheme.baseColor,
            backgroundImage:
              previewMode === 'monocromatico_cnc'
                ? 'none'
                : `url("${woodTheme.textureUrl ? getAssetUrl(woodTheme.textureUrl) : ''}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow:
              previewMode === 'monocromatico_cnc'
                ? '0 0 0 2px #fff, 0 10px 30px rgba(0,0,0,0.8)'
                : `
                  0 24px 50px -12px rgba(0, 0, 0, 0.85),
                  0 10px 22px -4px rgba(0, 0, 0, 0.5),
                  inset 0 1.5px 2px rgba(255, 245, 220, 0.4),
                  inset 0 -1.5px 2px rgba(45, 22, 10, 0.45)
                `,
            filter: previewMode === 'monocromatico_cnc' ? 'contrast(130%)' : 'none',
          }}
          onPointerDown={(e) => {
            // Clicar diretamente no corpo da madeira (sem elemento) desseleciona
            if (e.target === boardRef.current) {
              onSelectElement(null);
            }
          }}
        >
          {/* Verniz Acetinado & Reflexo de Luz */}
          {previewMode === 'realista' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: `${outerRadiusPx}px`,
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 65%, rgba(0, 0, 0, 0.1) 100%)',
              }}
            />
          )}

          {/* Borda Chanfrada usinada */}
          <div
            className="absolute inset-0 pointer-events-none border border-black/25"
            style={{
              borderRadius: `${outerRadiusPx}px`,
              boxShadow: `
                inset 1px 1px 1.5px rgba(255, 255, 255, 0.2),
                inset -1px -1px 2px rgba(0, 0, 0, 0.35)
              `,
            }}
          />

          {/* Canaleta de Gordura (Juice Groove) */}
          {!isPortaCopos && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${grooveMarginPx}px`,
                left: `${grooveMarginPx}px`,
                right: `${grooveMarginPx}px`,
                bottom: `${grooveMarginPx}px`,
                borderRadius: `${grooveRadiusPx}px`,
                border: `${grooveWidthPx}px solid ${
                  previewMode === 'monocromatico_cnc'
                    ? '#111'
                    : 'rgba(25, 12, 6, 0.22)'
                }`,
                boxShadow:
                  previewMode === 'monocromatico_cnc'
                    ? 'none'
                    : `
                      inset 1px 1px 2px rgba(0, 0, 0, 0.45),
                      inset -0.5px -0.5px 1px rgba(255, 255, 255, 0.2),
                      0 1px 1.5px rgba(0, 0, 0, 0.3)
                    `,
              }}
            />
          )}

          {/* Linha Guia de Área Permitida */}
          {(previewMode === 'tecnico_guias' || selectedElement) && (
            <div
              className="absolute pointer-events-none border border-dashed border-[#C29B68]/35 transition-opacity duration-200"
              style={{
                top: `${safeMarginPx}px`,
                left: `${safeMarginPx}px`,
                right: `${safeMarginPx}px`,
                bottom: `${safeMarginPx}px`,
                borderRadius: `${Math.max(4, grooveRadiusPx - 4)}px`,
              }}
            >
              <span className="absolute top-1 left-1.5 text-[8px] font-mono text-[#C29B68]/60 uppercase">
                Área Útil Permitida
              </span>
            </div>
          )}

          {/* Eixos Centrais de Alinhamento */}
          {previewMode === 'tecnico_guias' && (
            <>
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#C29B68]/20 pointer-events-none border-l border-dashed border-[#C29B68]/40" />
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#C29B68]/20 pointer-events-none border-t border-dashed border-[#C29B68]/40" />
            </>
          )}

          {/* ELEMENTOS ADICIONADOS PELO USUÁRIO (ORDENADOS POR Z-INDEX) */}
          {elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
              const isSelected = el.id === selectedElementId;
              const hasCollision = checkElementCollision(el);

              // Dimensões em pixels calculadas a partir das medidas físicas em cm
              const elPixelWidth = Math.round(el.widthCm * pxPerCm);
              const elPixelHeight = Math.round(el.heightCm * pxPerCm);

              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => handleElementPointerDown(e, el)}
                  style={{
                    position: 'absolute',
                    left: `${el.xPercent}%`,
                    top: `${el.yPercent}%`,
                    width: `${elPixelWidth}px`,
                    height: `${elPixelHeight}px`,
                    transform: `translate(-50%, -50%) rotate(${el.rotationDeg}deg)`,
                    zIndex: el.zIndex,
                    cursor: isDragging && isSelected ? 'grabbing' : 'grab',
                  }}
                  className={`group touch-none select-none ${
                    isSelected ? 'z-30' : 'hover:opacity-90'
                  }`}
                >
                  {/* CAIXA DELIMITADORA VISÍVEL AO SELECIONAR */}
                  {isSelected && (
                    <div
                      className={`absolute inset-0 pointer-events-none transition-all ${
                        hasCollision
                          ? 'border-2 border-red-500 shadow-[0_0_0_1px_rgba(0,0,0,0.8),0_0_12px_rgba(239,68,68,0.5)]'
                          : 'border-2 border-[#C29B68] shadow-[0_0_0_1px_rgba(0,0,0,0.8),0_0_8px_rgba(194,155,104,0.4)]'
                      }`}
                    />
                  )}

                  {/* 1. RENDERIZAÇÃO DA ARTE DO ELEMENTO */}
                  {el.type === 'image' && el.imageSrc ? (
                    <div
                      className="relative w-full h-full flex items-center justify-center overflow-hidden"
                      style={{
                        filter:
                          previewMode === 'monocromatico_cnc'
                            ? 'grayscale(100%) contrast(200%) brightness(80%)'
                            : isResin
                            ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.95)) drop-shadow(0 0 1px rgba(255,255,255,0.4))'
                            : 'drop-shadow(0 1px 1px rgba(255,255,255,0.3)) drop-shadow(0 -1px 2px rgba(0,0,0,0.85))',
                      }}
                    >
                      <img
                        src={el.imageSrc}
                        alt={el.imageFileName || 'Arte personalizada'}
                        className="max-w-full max-h-full object-contain pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : el.type === 'text' && el.text ? (
                    <div
                      className="w-full h-full flex items-center justify-center text-center p-1"
                      style={{
                        fontFamily: el.fontFamily || 'serif',
                        fontWeight: el.isBold ? 'bold' : 'normal',
                        fontStyle: el.isItalic ? 'italic' : 'normal',
                        color:
                          previewMode === 'monocromatico_cnc'
                            ? '#000000'
                            : isResin
                            ? '#140D09'
                            : '#25150C',
                        textShadow:
                          previewMode === 'monocromatico_cnc'
                            ? 'none'
                            : isResin
                            ? '0 1px 1px rgba(255,255,255,0.35), 0 0 2px rgba(0,0,0,0.8)'
                            : '0 1px 1px rgba(255,255,255,0.3), 0 -1px 1.5px rgba(0,0,0,0.7)',
                      }}
                    >
                      <span className="leading-tight select-none break-words max-w-full text-sm sm:text-base">
                        {el.text}
                      </span>
                    </div>
                  ) : null}

                  {/* 2. ALÇAS DE TRANSFORMAÇÃO & CONTROLES (SEMPRE VISÍVEIS ENQUANTO SELECIONADO) */}
                  {isSelected && (
                    <>
                      {/* Controle de Rotação Superior com Haste Visível */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
                        <div
                          onPointerDown={(e) => handleRotateHandleDown(e, el)}
                          className="w-6 h-6 -mb-1 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-115 transition-transform"
                          title="Girar elemento (clique e arraste para rotacionar)"
                        >
                          <div className="w-4 h-4 bg-[#C29B68] border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                            <RotateCw className="w-2.5 h-2.5 text-[#140D09]" />
                          </div>
                        </div>
                        {/* Haste de conexão */}
                        <div className="w-[1.5px] h-3 bg-[#C29B68] pointer-events-none shadow-xs" />
                      </div>

                      {/* Alças de Redimensionamento nos 4 Cantos (Área de toque ampla de 24x24 com miolo visível de 10x10) */}
                      {/* Canto Noroeste (NW) */}
                      <div
                        onPointerDown={(e) => handleResizeHandleDown(e, 'nw', el)}
                        className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-40"
                        title="Redimensionar elemento proporcionalmente"
                      >
                        <div className="w-2.5 h-2.5 bg-white border-2 border-[#C29B68] shadow-md" />
                      </div>

                      {/* Canto Nordeste (NE) */}
                      <div
                        onPointerDown={(e) => handleResizeHandleDown(e, 'ne', el)}
                        className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-40"
                        title="Redimensionar elemento proporcionalmente"
                      >
                        <div className="w-2.5 h-2.5 bg-white border-2 border-[#C29B68] shadow-md" />
                      </div>

                      {/* Canto Sudoeste (SW) */}
                      <div
                        onPointerDown={(e) => handleResizeHandleDown(e, 'sw', el)}
                        className="absolute -bottom-3 -left-3 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-40"
                        title="Redimensionar elemento proporcionalmente"
                      >
                        <div className="w-2.5 h-2.5 bg-white border-2 border-[#C29B68] shadow-md" />
                      </div>

                      {/* Canto Sudeste (SE) */}
                      <div
                        onPointerDown={(e) => handleResizeHandleDown(e, 'se', el)}
                        className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-40"
                        title="Redimensionar elemento proporcionalmente"
                      >
                        <div className="w-2.5 h-2.5 bg-[#C29B68] border-2 border-white shadow-md" />
                      </div>

                      {/* Badge Flutuante de Dimensões Reais em cm */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-[#E6DAC8] border border-white/20 text-[9px] font-mono px-2 py-0.5 whitespace-nowrap pointer-events-none shadow-md z-30">
                        {el.widthCm.toFixed(1)} × {el.heightCm.toFixed(1)} cm
                        {el.rotationDeg !== 0 && ` (${el.rotationDeg}°)`}
                      </div>
                    </>
                  )}

                  {/* Indicador de colisão com a canaleta */}
                  {hasCollision && (
                    <div
                      className="absolute -top-7 -right-7 p-1 bg-red-600 text-white rounded-full shadow-lg pointer-events-none animate-pulse z-40"
                      title="Aviso: Elemento ultrapassa a margem de segurança da canaleta"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. BARRA DE FERRAMENTAS CONTEXTUAL COMPACTA & CLARAMENTE VISÍVEL */}
      {selectedElement && (
        <div className="w-full mt-2.5 p-2.5 bg-[#1C140F] border border-[#DFD3C3]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#FAF8F5] animate-fadeIn">
          {/* Informações Dimensionais & Posição em Relação à Área Útil */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#DFD3C3]">
            <span className="font-semibold text-white truncate max-w-[130px] sm:max-w-[180px]">
              {selectedElement.type === 'text'
                ? `"${selectedElement.text}"`
                : selectedElement.imageFileName || 'Arte Vetorial'}
            </span>
            <span className="text-[#C29B68] font-mono font-bold">
              {selectedElement.widthCm.toFixed(1)} × {selectedElement.heightCm.toFixed(1)} cm
            </span>
            <span className="text-white/30">|</span>
            <span className="font-mono text-[10px] text-white/60">
              Posição: {selectedElement.xPercent.toFixed(0)}% X · {selectedElement.yPercent.toFixed(0)}% Y
            </span>
            <span className="text-white/30">|</span>
            {hasSelectedCollision ? (
              <span className="text-red-400 font-semibold flex items-center gap-1 text-[10px]">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Próximo à Canaleta</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Área Útil OK</span>
              </span>
            )}
          </div>

          {/* Botões de Ação Rápida: Alinhamento, Rotação, Camadas, Duplicação e Exclusão */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Centralizar Horizontalmente */}
            <button
              type="button"
              onClick={() => onAlignElement(selectedElement.id, 'center_h')}
              className="p-1.5 bg-black/50 hover:bg-[#8A5835] text-white transition-colors cursor-pointer border border-white/10"
              title="Centralizar Horizontalmente na Peça"
            >
              <AlignHorizontalDistributeCenter className="w-3.5 h-3.5" />
            </button>

            {/* Centralizar Verticalmente */}
            <button
              type="button"
              onClick={() => onAlignElement(selectedElement.id, 'center_v')}
              className="p-1.5 bg-black/50 hover:bg-[#8A5835] text-white transition-colors cursor-pointer border border-white/10"
              title="Centralizar Verticalmente na Peça"
            >
              <AlignVerticalDistributeCenter className="w-3.5 h-3.5" />
            </button>

            {/* Girar para a Esquerda (-15°) */}
            <button
              type="button"
              onClick={() => handleRotateDelta(-15)}
              className="p-1.5 bg-black/50 hover:bg-[#8A5835] text-white transition-colors cursor-pointer border border-white/10"
              title="Girar 15° para a Esquerda"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Girar para a Direita (+15°) */}
            <button
              type="button"
              onClick={() => handleRotateDelta(15)}
              className="p-1.5 bg-black/50 hover:bg-[#8A5835] text-white transition-colors cursor-pointer border border-white/10"
              title="Girar 15° para a Direita"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Trazer para Frente (Z-Index) */}
            <button
              type="button"
              onClick={() => onBringForward(selectedElement.id)}
              className="p-1.5 bg-black/50 hover:bg-[#8A5835] text-white transition-colors cursor-pointer border border-white/10"
              title="Trazer para Frente (Camada Acima)"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Enviar para Trás (Z-Index) */}
            <button
              type="button"
              onClick={() => onSendBackward(selectedElement.id)}
              className="p-1.5 bg-black/50 hover:bg-[#8A5835] text-white transition-colors cursor-pointer border border-white/10"
              title="Enviar para Trás (Camada Abaixo)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Duplicar */}
            <button
              type="button"
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="p-1.5 bg-black/50 hover:bg-[#8A5835] text-white transition-colors cursor-pointer border border-white/10"
              title="Duplicar Elemento"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Excluir */}
            <button
              type="button"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="p-1.5 bg-red-950/80 hover:bg-red-700 text-red-200 transition-colors cursor-pointer border border-red-500/30"
              title="Excluir Elemento da Composição"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
