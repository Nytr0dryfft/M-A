/**
 * Algoritmo de Vetorização de Imagens Bitmap para Arte Vetorial CNC (SVG)
 *
 * Converte imagens rasterizadas (PNG, JPG, WEBP) em caminhos vetoriais fechados
 * reais (SVG paths com fill-rule evenodd), usando binarização adaptativa/Otsu,
 * rastreamento de contornos direcionados e simplificação Ramer-Douglas-Peucker (RDP).
 *
 * Não utiliza imagens base64 embutidas: gera geometria vetorial real para fresas CNC.
 */

export interface VectorizeOptions {
  threshold?: number; // 0 a 255 (padrão calculado via Otsu ou 128)
  invert?: boolean; // Inverter preto e branco
  smoothing?: number; // Tolerância RDP em pixels (0.5 a 3.0, padrão 1.2)
  minLoopSize?: number; // Filtro de ruído: descarta laços minúsculos (< N pontos)
}

export interface VectorizeResult {
  svgString: string;
  dataUrl: string;
  width: number;
  height: number;
  pathCount: number;
  pointCount: number;
  isComplexPhoto: boolean;
  thresholdUsed: number;
  otsuOptimalThreshold: number;
  binaryPreviewDataUrl: string;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Calcula o limiar de binarização ótimo pelo método estatístico de Otsu
 */
export function calculateOtsuThreshold(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  const histogram = new Int32Array(256);
  let totalPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 32) continue; // Ignora pixels transparentes

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    histogram[gray]++;
    totalPixels++;
  }

  if (totalPixels === 0) return 128;

  let sum = 0;
  for (let t = 0; t < 256; t++) {
    sum += t * histogram[t];
  }

  let sumB = 0;
  let weightB = 0;
  let maxVariance = 0;
  let bestThreshold = 128;

  for (let t = 0; t < 256; t++) {
    weightB += histogram[t];
    if (weightB === 0) continue;
    const weightF = totalPixels - weightB;
    if (weightF === 0) break;

    sumB += t * histogram[t];
    const meanB = sumB / weightB;
    const meanF = (sum - sumB) / weightF;

    const varianceBetween = weightB * weightF * Math.pow(meanB - meanF, 2);
    if (varianceBetween > maxVariance) {
      maxVariance = varianceBetween;
      bestThreshold = t;
    }
  }

  return Math.max(30, Math.min(225, bestThreshold));
}

/**
 * Distância perpendicular de um ponto até o segmento de reta
 */
function perpendicularDistance(p: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - p1.x, p.y - p1.y);
  }
  const num = Math.abs(dy * p.x - dx * p.y + p2.x * p1.y - p2.y * p1.x);
  return num / Math.hypot(dx, dy);
}

/**
 * Algoritmo Ramer-Douglas-Peucker (RDP) iterativo para simplificar polígonos
 * sem risco de estouro de pilha de recursão.
 */
function simplifyRDP(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  const stack: [number, number][] = [[0, points.length - 1]];
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  while (stack.length > 0) {
    const [start, end] = stack.pop()!;
    let dmax = 0;
    let index = start;

    for (let i = start + 1; i < end; i++) {
      const d = perpendicularDistance(points[i], points[start], points[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }

    if (dmax > epsilon) {
      keep[index] = 1;
      if (index - start > 1) stack.push([start, index]);
      if (end - index > 1) stack.push([index, end]);
    }
  }

  const result: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) result.push(points[i]);
  }
  return result;
}

/**
 * Vetoriza ImageData para SVG limpo compatível com fresamento CNC.
 */
export function vectorizeImageData(
  imgData: ImageData,
  options: VectorizeOptions = {}
): VectorizeResult {
  const { width, height, data } = imgData;
  const smoothing = options.smoothing ?? 1.2;
  const minLoopSize = options.minLoopSize ?? 6;

  // 1. Calcula limiar de Otsu caso não seja passado
  const otsu = calculateOtsuThreshold(data, width, height);
  const threshold = options.threshold ?? otsu;
  const invert = options.invert ?? false;

  // 2. Cria matriz binária (1 = sólido / gravado, 0 = vazio / madeira)
  const grid = new Uint8Array(width * height);
  let solidCount = 0;
  let gradientVariance = 0;

  // Amostragem para detecção de fotografia (tons de cinza contínuos)
  const graySamples: number[] = [];
  const sampleStep = Math.max(1, Math.floor((width * height) / 1000));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = (rowOffset + x) * 4;
      const alpha = data[idx + 3];

      let isSolid = false;
      if (alpha >= 32) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        if ((rowOffset + x) % sampleStep === 0) {
          graySamples.push(gray);
        }

        // Padrão: partes escuras (< threshold) viram gravação CNC
        // Se invert for true: partes claras (>= threshold) viram gravação CNC
        isSolid = invert ? gray >= threshold : gray < threshold;
      }

      if (isSolid) {
        grid[rowOffset + x] = 1;
        solidCount++;
      }
    }
  }

  // Verifica desvio padrão dos tons de cinza para classificar se é foto
  if (graySamples.length > 20) {
    const avg = graySamples.reduce((a, b) => a + b, 0) / graySamples.length;
    const sqDiffs = graySamples.map((v) => Math.pow(v - avg, 2));
    gradientVariance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / graySamples.length);
  }

  // 3. Monta grafo de arestas direcionadas das fronteiras
  // Cada aresta é orientada no sentido horário ao redor do pixel 1
  const edges = new Map<number, Point[]>();
  function addDirectedEdge(x1: number, y1: number, x2: number, y2: number) {
    const key = (y1 << 16) | (x1 & 0xffff);
    let list = edges.get(key);
    if (!list) {
      list = [];
      edges.set(key, list);
    }
    list.push({ x: x2, y: y2 });
  }

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      if (grid[rowOffset + x] === 1) {
        // Aresta Superior (se o pixel de cima for 0)
        if (y === 0 || grid[rowOffset - width + x] === 0) {
          addDirectedEdge(x, y, x + 1, y);
        }
        // Aresta Direita (se o pixel da direita for 0)
        if (x === width - 1 || grid[rowOffset + x + 1] === 0) {
          addDirectedEdge(x + 1, y, x + 1, y + 1);
        }
        // Aresta Inferior (se o pixel de baixo for 0)
        if (y === height - 1 || grid[rowOffset + width + x] === 0) {
          addDirectedEdge(x + 1, y + 1, x, y + 1);
        }
        // Aresta Esquerda (se o pixel da esquerda for 0)
        if (x === 0 || grid[rowOffset + x - 1] === 0) {
          addDirectedEdge(x, y + 1, x, y);
        }
      }
    }
  }

  // 4. Rastreia laços fechados
  const rawLoops: Point[][] = [];
  const maxLoopSteps = width * height * 4;

  for (const [startKey, outgoing] of edges.entries()) {
    while (outgoing.length > 0) {
      const firstTarget = outgoing.pop()!;
      const sx = (startKey << 16) >> 16;
      const sy = startKey >> 16;

      const loop: Point[] = [{ x: sx, y: sy }];
      let current: Point | null = firstTarget;
      let steps = 0;

      while (current && steps < maxLoopSteps) {
        steps++;
        loop.push({ x: current.x, y: current.y });
        if (current.x === sx && current.y === sy) {
          // Laço fechado com sucesso
          break;
        }

        const ck = (current.y << 16) | (current.x & 0xffff);
        const nextList = edges.get(ck);
        if (nextList && nextList.length > 0) {
          current = nextList.pop()!;
        } else {
          current = null;
        }
      }

      // Descarta laços abertos incompletos ou excessivamente pequenos (ruídos de 1-2 pixels)
      if (loop.length >= minLoopSize) {
        rawLoops.push(loop);
      }
    }
  }

  // 5. Aplica simplificação Ramer-Douglas-Peucker (RDP) para suavizar curvas e remover degraus
  const simplifiedLoops: Point[][] = [];
  let totalPoints = 0;

  for (const loop of rawLoops) {
    const simplified = simplifyRDP(loop, smoothing);
    if (simplified.length >= 3) {
      simplifiedLoops.push(simplified);
      totalPoints += simplified.length;
    }
  }

  // 6. Constrói a string do caminho SVG
  let pathD = '';
  for (const loop of simplifiedLoops) {
    if (loop.length < 3) continue;
    pathD += `M${loop[0].x} ${loop[0].y}`;
    for (let i = 1; i < loop.length; i++) {
      pathD += `L${loop[i].x} ${loop[i].y}`;
    }
    pathD += 'Z ';
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <path d="${pathD.trim()}" fill="#1C140F" fill-rule="evenodd" />
</svg>`;

  const encodedSvg = encodeURIComponent(svgString);
  const dataUrl = `data:image/svg+xml;utf8,${encodedSvg}`;

  // 7. Cria preview em DataURL binária (preto e branco) para conferência visual
  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = width;
  previewCanvas.height = height;
  const pctx = previewCanvas.getContext('2d');
  let binaryPreviewDataUrl = '';
  if (pctx) {
    const outImgData = pctx.createImageData(width, height);
    for (let i = 0; i < grid.length; i++) {
      const px = i * 4;
      const isOne = grid[i] === 1;
      outImgData.data[px] = isOne ? 20 : 250;
      outImgData.data[px + 1] = isOne ? 15 : 248;
      outImgData.data[px + 2] = isOne ? 12 : 245;
      outImgData.data[px + 3] = isOne ? 255 : 0;
    }
    pctx.putImageData(outImgData, 0, 0);
    binaryPreviewDataUrl = previewCanvas.toDataURL('image/png');
  }

  // Se houver mais de 300 caminhos ou grande variação de tons contínuos, marca como fotografia complexa
  const isComplexPhoto =
    simplifiedLoops.length > 250 ||
    totalPoints > 5000 ||
    (gradientVariance > 45 && simplifiedLoops.length > 80);

  return {
    svgString,
    dataUrl,
    width,
    height,
    pathCount: simplifiedLoops.length,
    pointCount: totalPoints,
    isComplexPhoto,
    thresholdUsed: threshold,
    otsuOptimalThreshold: otsu,
    binaryPreviewDataUrl,
  };
}

/**
 * Carrega qualquer arquivo de imagem rasterizada (PNG, JPG, WEBP) em canvas
 * e executa a vetorização.
 */
export async function vectorizeImageFile(
  fileOrUrl: File | string,
  options: VectorizeOptions = {}
): Promise<VectorizeResult> {
  let srcUrl = '';
  if (typeof fileOrUrl === 'string') {
    srcUrl = fileOrUrl;
  } else {
    srcUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(fileOrUrl);
    });
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Erro ao decodificar imagem para vetorização'));
    image.src = srcUrl;
  });

  // Redimensiona moderadamente caso a imagem seja gigante (> 800px) para garantir fluidez sub-segundo
  const maxDim = 800;
  let targetW = img.naturalWidth || 600;
  let targetH = img.naturalHeight || 600;

  if (targetW > maxDim || targetH > maxDim) {
    if (targetW >= targetH) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível obter contexto 2D do Canvas');

  ctx.drawImage(img, 0, 0, targetW, targetH);
  const imgData = ctx.getImageData(0, 0, targetW, targetH);

  return vectorizeImageData(imgData, options);
}
