import {
  CanvasElement,
  ProductPieceType,
  BoardPlacementReport,
  ElementPlacementSpec,
} from '../types/configurator';
import { getWoodById } from '../data/woods';
import { getAssetUrl } from './assets';

export interface BoardSnapshotOptions {
  orderId?: string;
  pieceType: ProductPieceType;
  pieceLabel?: string;
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  woodType: string;
  isResin?: boolean;
  elements: CanvasElement[];
  targetWidth?: number; // Largura do render em pixels (padrão: 1200px para alta definição)
}

export interface BoardSnapshotResult {
  dataUrl: string;
  blob: Blob;
  placementReport: BoardPlacementReport;
}

/**
 * Carrega uma imagem de forma assíncrona
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar elemento visual'));
    img.src = src;
  });
}

/**
 * Desenha um retângulo com cantos arredondados no Canvas 2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Constrói o relatório técnico com dados estruturados de posicionamento de cada elemento
 */
export function generatePlacementReport(options: {
  orderId: string;
  pieceType: ProductPieceType;
  pieceLabel?: string;
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  woodType: string;
  elements: CanvasElement[];
}): BoardPlacementReport {
  const {
    orderId,
    pieceType,
    pieceLabel = pieceType === 'tabua_carne'
      ? 'Tábua de Carne Sob Medida'
      : 'Porta-Copos Personalizado',
    lengthCm,
    widthCm,
    thicknessCm,
    woodType,
    elements,
  } = options;

  const sortedElements = elements.slice().sort((a, b) => a.zIndex - b.zIndex);

  const elementSpecs: ElementPlacementSpec[] = sortedElements.map((el, index) => {
    const centerXCm = Math.round(((el.xPercent / 100) * lengthCm) * 100) / 100;
    const centerYCm = Math.round(((el.yPercent / 100) * widthCm) * 100) / 100;
    const leftCm = Math.round((centerXCm - el.widthCm / 2) * 100) / 100;
    const topCm = Math.round((centerYCm - el.heightCm / 2) * 100) / 100;

    const label =
      el.type === 'text'
        ? `Texto: "${el.text || ''}"`
        : el.isSvg
        ? `Vetor SVG: ${el.imageFileName || 'arte.svg'}`
        : `Imagem: ${el.imageFileName || 'arte.png'}`;

    return {
      elementIndex: index + 1,
      id: el.id,
      type: el.type,
      label,
      sourceFileName: el.imageFileName || (el.isSvg ? 'arte.svg' : null),
      textContent: el.type === 'text' ? el.text || '' : null,
      fontFamily: el.type === 'text' ? el.fontFamily || 'serif' : null,
      isBold: Boolean(el.isBold),
      isItalic: Boolean(el.isItalic),
      positionPercent: {
        x: Math.round(el.xPercent * 10) / 10,
        y: Math.round(el.yPercent * 10) / 10,
      },
      physicalPositionCm: {
        centerXCm,
        centerYCm,
        leftCm,
        topCm,
        unit: 'cm',
      },
      dimensionsCm: {
        widthCm: Math.round(el.widthCm * 10) / 10,
        heightCm: Math.round(el.heightCm * 10) / 10,
        unit: 'cm',
      },
      rotationDeg: Math.round(el.rotationDeg),
      zIndex: el.zIndex,
      isSvg: Boolean(el.isSvg),
    };
  });

  return {
    orderId,
    createdAt: new Date().toISOString(),
    pieceType,
    pieceLabel,
    woodName: woodType,
    boardDimensions: {
      lengthCm,
      widthCm,
      thicknessCm,
      unit: 'cm',
    },
    coordinateSystem: {
      unit: 'cm',
      referenceOrigin:
        'Canto superior esquerdo da tábua (0,0) com orientação horizontal (Comprimento = Eixo X, Largura = Eixo Y)',
      description:
        'Centro da tábua em (Comprimento/2, Largura/2). As coordenadas (centerXCm, centerYCm) indicam o ponto central de referência para alinhamento e fresamento CNC.',
    },
    elementsCount: elementSpecs.length,
    elements: elementSpecs,
  };
}

/**
 * Formata os dados de posicionamento em texto legível para Ficha Técnica e E-mail
 */
export function formatPlacementReportText(report: BoardPlacementReport): string {
  if (report.elements.length === 0) {
    return 'Nenhum elemento posicionado na tábua (peça lisa sem personalização).';
  }

  const lines: string[] = [
    `SISTEMA DE COORDENADAS: ${report.coordinateSystem.referenceOrigin}`,
    `DIMENSÕES DA PEÇA: ${report.boardDimensions.lengthCm} cm (Eixo X) x ${report.boardDimensions.widthCm} cm (Eixo Y) x ${report.boardDimensions.thicknessCm} cm (Espessura)`,
    `TOTAL DE ELEMENTOS: ${report.elementsCount}`,
    '',
  ];

  report.elements.forEach((el) => {
    lines.push(
      `[Elemento ${el.elementIndex}] ${el.label}`,
      `  • Tipo: ${el.type.toUpperCase()}${el.isSvg ? ' (VETOR SVG ORIGINAL)' : ''}`,
      el.sourceFileName ? `  • Arquivo de Origem: ${el.sourceFileName}` : '',
      el.textContent ? `  • Conteúdo do Texto: "${el.textContent}" (${el.fontFamily || 'serif'})` : '',
      `  • Posição Central: ${el.physicalPositionCm.centerXCm} cm X, ${el.physicalPositionCm.centerYCm} cm Y (${el.positionPercent.x}% X, ${el.positionPercent.y}% Y)`,
      `  • Canto Superior Esquerdo: ${el.physicalPositionCm.leftCm} cm X, ${el.physicalPositionCm.topCm} cm Y`,
      `  • Dimensões Físicas: ${el.dimensionsCm.widthCm} cm largura x ${el.dimensionsCm.heightCm} cm altura`,
      `  • Rotação: ${el.rotationDeg}°`,
      `  • Camada (Z-Index): ${el.zIndex}`,
      ''
    );
  });

  return lines.filter(Boolean).join('\n');
}

/**
 * Gera uma imagem PNG da tábua de carne / porta-copos personalizada
 * exatamente como configurada pelo cliente (proporções, modelo, arte, rotação, escala e posição).
 */
export async function generateBoardSnapshot(
  options: BoardSnapshotOptions
): Promise<BoardSnapshotResult> {
  const {
    orderId = `ORD-${Date.now().toString(36).toUpperCase()}`,
    pieceType,
    pieceLabel,
    lengthCm,
    widthCm,
    thicknessCm,
    woodType,
    isResin = false,
    elements,
    targetWidth = 1200,
  } = options;

  const isPortaCopos = pieceType === 'porta_copos';
  const boardRatio = widthCm / lengthCm;
  const canvasWidth = Math.round(targetWidth);
  const canvasHeight = Math.round(targetWidth * boardRatio);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto gráfico 2D do Canvas.');
  }

  const pxPerCm = canvasWidth / lengthCm;
  const woodTheme = getWoodById(woodType);

  // 1. Fundo da Madeira com Granulação e Gradiente Realista
  const outerCornerRadius = isPortaCopos ? 24 : 0;
  drawRoundedRect(ctx, 0, 0, canvasWidth, canvasHeight, outerCornerRadius);
  ctx.save();
  ctx.clip();

  // Preenchimento de base com cor da madeira
  ctx.fillStyle = woodTheme.baseColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Tenta desenhar textura fotográfica da madeira se disponível
  if (woodTheme.textureUrl) {
    try {
      const textureImg = await loadImage(getAssetUrl(woodTheme.textureUrl));
      ctx.drawImage(textureImg, 0, 0, canvasWidth, canvasHeight);
    } catch {
      // Fallback gracioso mantendo cor de base
    }
  }

  // Gradiente longitudinal sutil simulando fibras da madeira maciça
  const woodGradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  woodGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  woodGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.03)');
  woodGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
  woodGradient.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
  ctx.fillStyle = woodGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Simulação de chanfro na borda externa usinada
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 2. Canaleta de Gordura (Juice Groove) para Tábuas de Carne
  if (!isPortaCopos) {
    const grooveMarginCm = 1.8;
    const grooveWidthCm = 1.0;
    const grooveMarginPx = grooveMarginCm * pxPerCm;
    const grooveWidthPx = Math.max(6, Math.round(grooveWidthCm * pxPerCm));
    const grooveRadiusPx = 16;

    const gx = grooveMarginPx;
    const gy = grooveMarginPx;
    const gw = canvasWidth - grooveMarginPx * 2;
    const gh = canvasHeight - grooveMarginPx * 2;

    if (gw > 20 && gh > 20) {
      ctx.save();
      drawRoundedRect(ctx, gx, gy, gw, gh, grooveRadiusPx);
      ctx.lineWidth = grooveWidthPx;
      ctx.strokeStyle = woodTheme.grooveBottom || 'rgba(30, 15, 8, 0.35)';
      ctx.stroke();

      // Reflexo chanfrado interno
      ctx.lineWidth = Math.max(2, grooveWidthPx * 0.3);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.stroke();
      ctx.restore();
    }
  }

  // 3. Renderização de todos os elementos configurados (ordenados por zIndex)
  const sortedElements = elements.slice().sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sortedElements) {
    const centerX = (el.xPercent / 100) * canvasWidth;
    const centerY = (el.yPercent / 100) * canvasHeight;
    const elWidth = el.widthCm * pxPerCm;
    const elHeight = el.heightCm * pxPerCm;

    ctx.save();
    ctx.translate(centerX, centerY);
    if (el.rotationDeg !== 0) {
      ctx.rotate((el.rotationDeg * Math.PI) / 180);
    }

    if (el.type === 'image') {
      // Prioriza SVG em texto original codificado em dataURL para nitidez vetorial perfeita
      let imageSrcToLoad = el.imageSrc;
      if (el.isSvg && el.rawSvgText) {
        imageSrcToLoad = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(el.rawSvgText)}`;
      }

      if (imageSrcToLoad) {
        try {
          const img = await loadImage(imageSrcToLoad);

          ctx.save();
          if (isResin) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 2;
          } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
          }

          ctx.drawImage(img, -elWidth / 2, -elHeight / 2, elWidth, elHeight);
          ctx.restore();
        } catch (err) {
          console.warn('Falha ao renderizar imagem no snapshot:', err);
        }
      }
    } else if (el.type === 'text' && el.text) {
      const fontSizePx = Math.max(14, Math.round(elHeight * 0.75));
      ctx.font = `${el.isBold ? 'bold ' : ''}${el.isItalic ? 'italic ' : ''}${fontSizePx}px ${el.fontFamily || 'serif'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Efeito de relevo / resina CNC
      ctx.fillStyle = isResin ? '#120B07' : '#22140B';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.25)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 1;

      ctx.fillText(el.text, 0, 0);
    }

    ctx.restore();
  }

  ctx.restore(); // Fecha o clip da tábua

  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Erro ao converter Canvas para Blob PNG'));
      },
      'image/png',
      0.95
    );
  });

  const placementReport = generatePlacementReport({
    orderId,
    pieceType,
    pieceLabel,
    lengthCm,
    widthCm,
    thicknessCm,
    woodType,
    elements,
  });

  return { dataUrl, blob, placementReport };
}
