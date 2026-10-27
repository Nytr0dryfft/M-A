import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import {
  isFirebaseConfigured,
  getFirebaseFirestore,
  getFirebaseStorage,
  ensureAuthenticatedUser,
  getFirebaseAuth,
} from '../config/firebase';
import { OrderQuoteData, BoardPlacementReport } from '../types/configurator';
import { generateBoardSnapshot } from '../utils/boardSnapshotGenerator';
import {
  checkQuoteQuota,
  consumeQuoteQuota,
  validateOrderFilesBeforeUpload,
} from './rateLimitService';
import { SECURITY_CONFIG } from '../config/security';

/**
 * Executa uma operação assíncrona com timeout estrito para evitar travamento da UI
 */
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: any;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} excedeu o tempo limite (${Math.round(ms / 1000)}s).`)),
      ms
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export interface UploadedArtworkResult {
  fileName: string;
  originalFileName: string;
  storagePath: string;
  downloadUrl: string;
  type: 'svg' | 'raster';
  isSvg: boolean;
}

export interface OrderSubmissionResult {
  success: boolean;
  isExternalStorageActive: boolean;
  orderId: string;
  previewUrl?: string | null;
  previewDataUrl?: string | null;
  svgDownloadUrl?: string | null;
  artworkUrls: UploadedArtworkResult[];
  placementReport?: BoardPlacementReport | null;
  placementReportUrl?: string | null;
  error?: string | null;
}

/**
 * Converte dataUrl base64 em Blob com tipo MIME correspondente
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  if (parts.length === 2) {
    const contentType = parts[0].split(':')[1] || 'image/png';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }

  // Fallback para SVG ou texto codificado em URI
  if (dataUrl.includes('data:image/svg+xml')) {
    const svgContent = decodeURIComponent(dataUrl.split(',')[1] || '');
    return new Blob([svgContent], { type: 'image/svg+xml' });
  }

  return new Blob([dataUrl], { type: 'text/plain' });
}

/**
 * Salva o pedido localmente no navegador (IndexedDB / LocalStorage)
 * para garantir que nenhum dado seja perdido se a nuvem ainda não estiver configurada.
 */
export function saveOrderToLocalStore(
  orderData: OrderQuoteData,
  previewDataUrl?: string,
  placementReport?: BoardPlacementReport
) {
  try {
    const key = `atelier_order_${orderData.orderId}`;
    const serialized = JSON.stringify({
      ...orderData,
      previewDataUrl: previewDataUrl || orderData.previewDataUrl,
      placementReport: placementReport || orderData.placementReport,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.warn('Armazenamento local excedido ou bloqueado:', e);
  }
}

/**
 * Recupera um pedido por código do pedido (e opcionalmente verifica contato do cliente para segurança)
 */
export async function getOrderFromStore(
  orderId: string,
  clientContact?: string
): Promise<{ order: OrderQuoteData; isFromCloud: boolean } | null> {
  const cleanId = orderId.trim().toUpperCase();

  // 1. Tenta recuperar do Cloud Firestore se o Firebase estiver ativo
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      if (db) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na consulta de pedido')), 3500)
        );
        const orderSnap = await Promise.race([getDoc(doc(db, 'orders', cleanId)), timeoutPromise]);
        if (orderSnap.exists()) {
          const data = orderSnap.data() as any;

          // Verificação de privacidade: se contato for fornecido, confere os últimos dígitos
          if (clientContact) {
            const cleanInput = clientContact.replace(/\D/g, '');
            const cleanStored = (data.clientContact || '').replace(/\D/g, '');
            if (cleanInput.length >= 4 && !cleanStored.endsWith(cleanInput.slice(-4))) {
              throw new Error('Código do pedido ou telefone não correspondem ao registro.');
            }
          }

          return { order: data as OrderQuoteData, isFromCloud: true };
        }
      }
    } catch (err: any) {
      if (err.message?.includes('não correspondem')) throw err;
      console.warn('Falha na consulta ao Firestore:', err);
    }
  }

  // 2. Fallback para LocalStorage do atelier / navegador
  try {
    const key = `atelier_order_${cleanId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (clientContact) {
        const cleanInput = clientContact.replace(/\D/g, '');
        const cleanStored = (parsed.clientContact || '').replace(/\D/g, '');
        if (cleanInput.length >= 4 && !cleanStored.endsWith(cleanInput.slice(-4))) {
          throw new Error('Código do pedido ou telefone não correspondem ao registro.');
        }
      }
      return { order: parsed as OrderQuoteData, isFromCloud: false };
    }
  } catch (err: any) {
    if (err.message?.includes('não correspondem')) throw err;
    console.warn('Erro ao ler pedido do armazenamento local:', err);
  }

  return null;
}

// Cache em memória de uploads realizados para evitar arquivos órfãos e re-uploads redundantes em tentativas
const orderUploadCache = new Map<string, OrderSubmissionResult>();

export function getCachedOrderUpload(orderId: string): OrderSubmissionResult | undefined {
  return orderUploadCache.get(orderId);
}

export function clearOrderUploadCache(orderId: string): void {
  orderUploadCache.delete(orderId);
}

/**
 * Processa a encomenda:
 * 1. Gera prévia PNG de alta definição fiel à personalização (posição, modelo, canaleta, escala, rotação).
 * 2. Preserva o SVG original íntegro e sem conversão.
 * 3. Envia os arquivos ao Firebase Storage (se configurado) com regras de segurança ativas.
 * 4. Grava os metadados no Cloud Firestore.
 * 5. Salva cópia de segurança no armazenamento local.
 */
export async function persistOrderToCloud(
  orderData: OrderQuoteData,
  onProgress?: (stage: 'preparando' | 'gerando_previa' | 'enviando_arquivos' | 'pronto') => void,
  forceUpload = false
): Promise<OrderSubmissionResult> {
  // 1. Verificação de cota autoritativa antes de processar imagens ou uploads
  const quotaCheck = await checkQuoteQuota();
  if (!quotaCheck.allowed) {
    onProgress?.('pronto');
    return {
      success: false,
      isExternalStorageActive: false,
      orderId: orderData.orderId,
      artworkUrls: [],
      error: quotaCheck.friendlyMessage || SECURITY_CONFIG.MESSAGES.RATE_LIMIT_EXCEEDED,
    };
  }

  // Se já foi feito upload nesta sessão e não foi solicitado recálculo forçado, reutiliza
  if (!forceUpload && orderUploadCache.has(orderData.orderId)) {
    const cached = orderUploadCache.get(orderData.orderId)!;
    if (cached.success) {
      onProgress?.('pronto');
      return cached;
    }
  }

  onProgress?.('gerando_previa');

  // 2. Gera a imagem de prévia real da tábua via Canvas de alta resolução e relatório de posicionamento
  let previewDataUrl: string = orderData.previewDataUrl || '';
  let previewBlob: Blob | null = null;
  let placementReport: BoardPlacementReport | undefined = orderData.placementReport;

  try {
    const snapshot = await generateBoardSnapshot({
      orderId: orderData.orderId,
      pieceType: orderData.pieceType,
      pieceLabel: orderData.pieceLabel,
      lengthCm: orderData.dimensions.lengthCm,
      widthCm: orderData.dimensions.widthCm,
      thicknessCm: orderData.dimensions.thicknessCm,
      woodType: orderData.woodName,
      isResin: orderData.technique.isResin,
      elements: orderData.elements,
      targetWidth: 1200,
    });
    previewDataUrl = snapshot.dataUrl;
    previewBlob = snapshot.blob;
    placementReport = snapshot.placementReport;
  } catch (snapshotErr) {
    console.warn('Aviso: falha ao gerar canvas snapshot:', snapshotErr);
    if (orderData.previewDataUrl) {
      previewBlob = dataUrlToBlob(orderData.previewDataUrl);
    }
  }

  // 3. Validação rigorosa de arquivos (tamanho, formato e contorno)
  const fileValidation = validateOrderFilesBeforeUpload(orderData, previewBlob);
  if (!fileValidation.valid) {
    onProgress?.('pronto');
    return {
      success: false,
      isExternalStorageActive: false,
      orderId: orderData.orderId,
      previewDataUrl,
      artworkUrls: [],
      error: fileValidation.friendlyError || SECURITY_CONFIG.MESSAGES.FILE_SIZE_EXCEEDED,
    };
  }

  // Grava sempre na cópia local para redundância em caso de oscilação de rede
  saveOrderToLocalStore(orderData, previewDataUrl, placementReport);

  const isConfigured = isFirebaseConfigured();

  if (!isConfigured) {
    onProgress?.('pronto');
    return {
      success: false,
      isExternalStorageActive: false,
      orderId: orderData.orderId,
      previewDataUrl,
      artworkUrls: [],
      placementReport: placementReport || null,
      error:
        'O armazenamento em nuvem não está ativo no momento. Seus arquivos foram gerados e estão salvos no navegador para envio direto pelo WhatsApp.',
    };
  }

  const db = getFirebaseFirestore();
  const storage = getFirebaseStorage();

  if (!storage) {
    onProgress?.('pronto');
    return {
      success: false,
      isExternalStorageActive: false,
      orderId: orderData.orderId,
      previewDataUrl,
      artworkUrls: [],
      error: 'Conexão temporariamente indisponível. Por favor, tente novamente ou use o botão do WhatsApp.',
    };
  }

  try {
    onProgress?.('enviando_arquivos');
    console.log(`[OrderStorage] Iniciando persistência de arquivos para o pedido ${orderData.orderId}...`);

    // 4. Garante autenticação anônima se configurada (com timeout de 5s)
    await ensureAuthenticatedUser();

    const orderFolder = `orders/${orderData.orderId}`;
    let previewUrl: string | null = null;
    const artworkUrls: UploadedArtworkResult[] = [];

    // 5. Upload ou reutilização da prévia visual da peça em PNG
    if (previewBlob) {
      const previewFileName = `previa-montagem-${orderData.orderId.toLowerCase()}.png`;
      const previewRef = ref(storage, `${orderFolder}/${previewFileName}`);

      try {
        // Tenta obter URL caso o arquivo já tenha sido enviado em tentativa anterior (evita duplicidade)
        previewUrl = await withTimeout(
          getDownloadURL(previewRef),
          5000,
          'Verificação de prévia existente'
        );
        console.log(`[OrderStorage] Prévia PNG já existente no bucket para ${orderData.orderId}. Reutilizando.`);
      } catch {
        // Arquivo ainda não existe no bucket: realiza o upload com timeout de 15s
        const previewSnapshot = await withTimeout(
          uploadBytes(previewRef, previewBlob, {
            contentType: 'image/png',
            customMetadata: {
              orderId: orderData.orderId,
              pieceType: orderData.pieceType,
              createdAt: new Date().toISOString(),
            },
          }),
          15000,
          'Upload da prévia PNG'
        );
        previewUrl = await withTimeout(
          getDownloadURL(previewSnapshot.ref),
          8000,
          'Obtenção de link da prévia'
        );
        console.log(`[OrderStorage] Upload da prévia PNG concluído para o pedido ${orderData.orderId}.`);
      }
    }

    // 6. Upload ou reutilização do arquivo SVG original ÍNTEGRO
    const imageElements = orderData.elements.filter((el) => el.type === 'image' && el.imageSrc);

    for (let i = 0; i < imageElements.length; i++) {
      const el = imageElements[i];
      if (!el.imageSrc) continue;

      let fileBlob: Blob;
      let fileExtension = 'png';
      let contentType = 'image/png';

      if (el.isSvg) {
        fileExtension = 'svg';
        contentType = 'image/svg+xml';
        if (el.rawSvgText) {
          fileBlob = new Blob([el.rawSvgText], { type: 'image/svg+xml;charset=utf-8' });
        } else {
          fileBlob = dataUrlToBlob(el.imageSrc);
        }
      } else {
        fileExtension = el.imageFileType?.includes('png') ? 'png' : 'jpg';
        contentType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        fileBlob = dataUrlToBlob(el.imageSrc);
      }

      const safeBaseName = (el.imageFileName || 'arte')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 32);

      const uniqueInternalFileName = `arte-${i + 1}-${safeBaseName}-${orderData.orderId.toLowerCase()}.${fileExtension}`;
      const fileRef = ref(storage, `${orderFolder}/${uniqueInternalFileName}`);

      let downloadUrl: string | null = null;
      try {
        downloadUrl = await withTimeout(
          getDownloadURL(fileRef),
          5000,
          'Verificação de arte existente'
        );
        console.log(`[OrderStorage] Arte ${uniqueInternalFileName} já presente no bucket. Reutilizando.`);
      } catch {
        const fileSnapshot = await withTimeout(
          uploadBytes(fileRef, fileBlob, {
            contentType,
            customMetadata: {
              orderId: orderData.orderId,
              originalFileName: el.imageFileName || 'arte.svg',
              isOriginalSvg: String(Boolean(el.isSvg)),
              isVectorized: String(Boolean(el.isVectorized)),
            },
          }),
          15000,
          'Upload do arquivo de arte'
        );
        downloadUrl = await withTimeout(
          getDownloadURL(fileSnapshot.ref),
          8000,
          'Obtenção de link da arte'
        );
        console.log(`[OrderStorage] Upload da arte ${uniqueInternalFileName} concluído.`);
      }

      if (downloadUrl) {
        artworkUrls.push({
          fileName: uniqueInternalFileName,
          originalFileName: el.imageFileName || uniqueInternalFileName,
          storagePath: fileRef.fullPath,
          downloadUrl,
          type: el.isSvg ? 'svg' : 'raster',
          isSvg: Boolean(el.isSvg),
        });
      }
    }

    // 7. Upload ou reutilização do relatório estruturado de posicionamento CNC em JSON
    let placementReportUrl: string | null = null;
    if (placementReport) {
      const reportRef = ref(
        storage,
        `${orderFolder}/ficha-posicionamento-cnc-${orderData.orderId.toLowerCase()}.json`
      );
      try {
        placementReportUrl = await withTimeout(
          getDownloadURL(reportRef),
          4000,
          'Verificação de ficha CNC existente'
        );
        console.log(`[OrderStorage] Ficha CNC já existente para ${orderData.orderId}. Reutilizando.`);
      } catch {
        try {
          const reportBlob = new Blob([JSON.stringify(placementReport, null, 2)], {
            type: 'application/json;charset=utf-8',
          });
          const reportSnapshot = await withTimeout(
            uploadBytes(reportRef, reportBlob, {
              contentType: 'application/json',
              customMetadata: {
                orderId: orderData.orderId,
                elementsCount: String(placementReport.elementsCount),
                createdAt: new Date().toISOString(),
              },
            }),
            10000,
            'Upload da ficha CNC'
          );
          placementReportUrl = await withTimeout(
            getDownloadURL(reportSnapshot.ref),
            5000,
            'Obtenção de link da ficha CNC'
          );
        } catch (repErr) {
          console.warn('[OrderStorage] Aviso: ficha JSON CNC omitida do bucket:', repErr);
        }
      }
    }

    const svgArtwork = artworkUrls.find((a) => a.isSvg) || artworkUrls[0];
    const svgDownloadUrl = svgArtwork?.downloadUrl || null;

    const finalResult: OrderSubmissionResult = {
      success: true,
      isExternalStorageActive: true,
      orderId: orderData.orderId,
      previewUrl,
      previewDataUrl,
      svgDownloadUrl,
      artworkUrls,
      placementReport: placementReport || null,
      placementReportUrl,
    };

    // Cache em memória e local
    orderUploadCache.set(orderData.orderId, finalResult);
    saveOrderToLocalStore(orderData, previewDataUrl, placementReport);

    // 8. Grava registro no Firestore de modo não-bloqueante (timeout curto de 2s)
    if (db) {
      try {
        const firestoreWritePromise = setDoc(doc(db, 'orders', orderData.orderId), {
          orderId: orderData.orderId,
          createdAt: serverTimestamp(),
          clientName: orderData.clientName,
          clientContact: orderData.clientContact,
          clientEmail: orderData.clientEmail || '',
          pieceType: orderData.pieceType,
          pieceLabel: orderData.pieceLabel,
          woodId: orderData.woodId,
          woodName: orderData.woodName,
          dimensions: orderData.dimensions,
          technique: orderData.technique.name,
          finish: orderData.finish.name,
          quantity: orderData.quantity,
          budget: orderData.budget,
          notes: orderData.notes || '',
          imageRightsConfirmed: orderData.imageRightsConfirmed,
          previewUrl,
          artworkUrls,
          placementReport: placementReport || null,
          placementReportUrl,
          elementsCount: orderData.elements.length,
          status: 'solicitado',
          source: 'web_configurator',
        });

        await withTimeout(firestoreWritePromise, 2000, 'Gravação no Firestore');
        console.log(`[OrderStorage] Registro gravado no Firestore.`);
      } catch (firestoreErr: any) {
        console.warn(`[OrderStorage] Aviso: Firestore ledger secundário omitido (${firestoreErr?.message || 'offline'}).`);
      }
    }

    // 9. Consome cota autoritativa
    const auth = getFirebaseAuth();
    await consumeQuoteQuota(auth?.currentUser?.uid, orderData.orderId);

    onProgress?.('pronto');
    return finalResult;
  } catch (err: any) {
    console.error('Falha controlada no armazenamento:', err);
    onProgress?.('pronto');

    let friendlyError: string = SECURITY_CONFIG.MESSAGES.GENERIC_SUBMISSION_ERROR;
    if (err?.code === 'storage/unauthorized' || err?.message?.includes('storage/unauthorized')) {
      friendlyError =
        'O envio temporário de arquivos está restrito pelas regras de segurança. Seus arquivos de corte e prévia estão preservados no navegador. Por favor, envie diretamente aos marceneiros pelo WhatsApp.';
    }

    return {
      success: false,
      isExternalStorageActive: true,
      orderId: orderData.orderId,
      previewDataUrl,
      artworkUrls: [],
      error: friendlyError,
    };
  }
}
