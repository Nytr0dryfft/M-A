/**
 * Validador e sanitizador de upload de imagens para o atelier CNC.
 * Suporta PNG, JPEG e SVG seguro.
 */

export interface ImageUploadResult {
  dataUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  isSvg: boolean;
  isRaster: boolean;
  hasAlpha: boolean;
  sanitizedSvgString?: string;
  originalFile?: File;
}

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

/**
 * Validação de Magic Bytes para prevenir renomeação fraudulenta de arquivos maliciosos
 */
function checkMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 4) return false;

  // PNG: 89 50 4E 47
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return mimeType === 'image/png';
  }

  // JPEG / JPG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return mimeType === 'image/jpeg' || mimeType === 'image/jpg';
  }

  // WEBP: 'RIFF' .... 'WEBP'
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return mimeType === 'image/webp';
  }

  // SVG: texto XML começando ou contendo <svg
  if (mimeType === 'image/svg+xml') {
    const headerStr = new TextDecoder().decode(bytes.slice(0, 1024)).toLowerCase();
    // Bloqueia XXE perigoso
    if (headerStr.includes('<!doctype') && headerStr.includes('entity')) {
      return false;
    }
    return headerStr.includes('<svg') || headerStr.includes('<?xml');
  }

  return false;
}

/**
 * Sanitiza rigorosamente documentos SVG removendo qualquer script ou vetor de XSS.
 */
export function sanitizeSvg(rawSvg: string): string {
  // Prevenção contra XXE em DOCTYPE
  if (/<!entity/i.test(rawSvg)) {
    throw new Error('Arquivo SVG rejeitado: contém entidades externas potencialmente perigosas.');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, 'image/svg+xml');

  // Verifica erro de parse no parser XML do navegador
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Arquivo SVG malformado ou corrompido.');
  }

  const svgRoot = doc.documentElement;
  if (svgRoot.tagName.toLowerCase() !== 'svg') {
    throw new Error('Conteúdo do arquivo não possui uma tag raiz <svg> válida.');
  }

  // Tags perigosas a serem removidas
  const bannedTags = [
    'script',
    'foreignobject',
    'iframe',
    'object',
    'embed',
    'link',
    'applet',
    'meta',
    'html',
    'body',
    'base',
    'audio',
    'video',
    'source',
    'track',
    'form',
    'input',
    'button',
    'textarea',
  ];

  bannedTags.forEach((tag) => {
    const elements = svgRoot.querySelectorAll(tag);
    elements.forEach((el) => el.remove());
  });

  // Limpa tags <style> contendo referências externas ou imports
  const styles = svgRoot.querySelectorAll('style');
  styles.forEach((style) => {
    const cssText = style.textContent || '';
    if (/@import/i.test(cssText) || /url\s*\(/i.test(cssText) || /behavior/i.test(cssText)) {
      style.remove();
    }
  });

  // Atributos de eventos (onclick, onload, etc.) e links perigosos
  const allElements = [svgRoot, ...Array.from(svgRoot.querySelectorAll('*'))];
  allElements.forEach((el) => {
    const attributes = Array.from(el.attributes);
    for (const attr of attributes) {
      const name = attr.name.toLowerCase();
      const value = attr.value.toLowerCase().replace(/\s+/g, '');

      // Remove qualquer atributo on* (handlers JS inline)
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }

      // Remove referências perigosas a javascript:, vbscript: ou links externos não-locais
      if (
        name === 'href' ||
        name === 'xlink:href' ||
        name === 'src'
      ) {
        if (
          value.includes('javascript:') ||
          value.includes('vbscript:') ||
          value.startsWith('http:') ||
          value.startsWith('https:') ||
          value.startsWith('//')
        ) {
          el.removeAttribute(attr.name);
        }
      }
    }
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgRoot);
}

/**
 * Lê e valida um arquivo de imagem submetido pelo usuário.
 */
export async function processUploadedFile(file: File): Promise<ImageUploadResult> {
  if (!file) {
    throw new Error('Nenhum arquivo selecionado.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `O arquivo enviado (${sizeMb} MB) excede o limite máximo permitido de 15 MB.`
    );
  }

  // Normalização do tipo MIME
  let normalizedMime = file.type.toLowerCase();
  const lowerName = file.name.toLowerCase();

  if (!normalizedMime || normalizedMime === 'application/octet-stream') {
    if (lowerName.endsWith('.png')) normalizedMime = 'image/png';
    else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) normalizedMime = 'image/jpeg';
    else if (lowerName.endsWith('.webp')) normalizedMime = 'image/webp';
    else if (lowerName.endsWith('.svg')) normalizedMime = 'image/svg+xml';
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(normalizedMime)) {
    throw new Error(
      'Formato de arquivo não suportado. Por favor, envie uma imagem em SVG, PNG, JPG/JPEG ou WEBP.'
    );
  }

  // Leitura dos bytes para validação de integridade
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  const isValidMagic = checkMagicBytes(uint8, normalizedMime);
  if (!isValidMagic) {
    throw new Error(
      'O conteúdo do arquivo não corresponde à sua assinatura real (arquivo corrompido ou extensão incorreta).'
    );
  }

  // Processamento especial para SVG
  if (normalizedMime === 'image/svg+xml') {
    const rawText = new TextDecoder().decode(uint8);
    const sanitized = sanitizeSvg(rawText);

    // Converte o SVG sanitizado em DataURL segura
    const encoded = encodeURIComponent(sanitized);
    const dataUrl = `data:image/svg+xml;utf8,${encoded}`;

    // Obtém dimensões intrínsecas a partir do elemento SVG ou Image
    const dims = await getImageDimensions(dataUrl);

    return {
      dataUrl,
      fileName: file.name,
      fileType: 'image/svg+xml',
      fileSize: file.size,
      width: dims.width,
      height: dims.height,
      isSvg: true,
      isRaster: false,
      hasAlpha: true,
      sanitizedSvgString: sanitized,
      originalFile: file,
    };
  }

  // Processamento para imagens rasterizadas (PNG / JPEG / WEBP)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler os dados da imagem.'));
    reader.readAsDataURL(file);
  });

  const dims = await getImageDimensions(dataUrl);

  return {
    dataUrl,
    fileName: file.name,
    fileType: normalizedMime,
    fileSize: file.size,
    width: dims.width,
    height: dims.height,
    isSvg: false,
    isRaster: true,
    hasAlpha: normalizedMime === 'image/png' || normalizedMime === 'image/webp',
    originalFile: file,
  };
}

/**
 * Carrega a imagem no navegador para medir largura e altura intrínsecas
 */
function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 800,
      });
    };
    img.onerror = () => {
      // Fallback seguro caso não consiga ler dimensões intrínsecas
      resolve({ width: 800, height: 800 });
    };
    img.src = src;
  });
}
