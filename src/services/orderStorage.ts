import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import {
  isFirebaseConfigured,
  getFirebaseFirestore,
  getFirebaseStorage,
} from '../config/firebase';
import { OrderQuoteData } from '../types/configurator';
import { generateBoardSnapshot } from '../utils/boardSnapshotGenerator';

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
  artworkUrls: UploadedArtworkResult[];
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
export function saveOrderToLocalStore(orderData: OrderQuoteData, previewDataUrl?: string) {
  try {
    const key = `atelier_order_${orderData.orderId}`;
    const serialized = JSON.stringify({
      ...orderData,
      previewDataUrl: previewDataUrl || orderData.previewDataUrl,
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
        const orderSnap = await getDoc(doc(db, 'orders', cleanId));
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
  onProgress?: (stage: 'preparando' | 'gerando_previa' | 'enviando_arquivos' | 'pronto') => void
): Promise<OrderSubmissionResult> {
  onProgress?.('gerando_previa');

  // 1. Gera a imagem de prévia real da tábua via Canvas de alta resolução
  let previewDataUrl: string = orderData.previewDataUrl || '';
  let previewBlob: Blob | null = null;

  try {
    const snapshot = await generateBoardSnapshot({
      pieceType: orderData.pieceType,
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
  } catch (snapshotErr) {
    console.warn('Aviso: falha ao gerar canvas snapshot:', snapshotErr);
    if (orderData.previewDataUrl) {
      previewBlob = dataUrlToBlob(orderData.previewDataUrl);
    }
  }

  // Grava sempre na cópia local para garantir redundância
  saveOrderToLocalStore(orderData, previewDataUrl);

  const isConfigured = isFirebaseConfigured();

  // Caso o usuário ainda não tenha configurado as chaves do Firebase
  if (!isConfigured) {
    onProgress?.('pronto');
    return {
      success: false,
      isExternalStorageActive: false,
      orderId: orderData.orderId,
      previewDataUrl,
      artworkUrls: [],
      error:
        'Serviço em nuvem externo (Firebase) não configurado. Seus arquivos foram gerados localmente no navegador e estão prontos para download e anexo manual no WhatsApp.',
    };
  }

  const db = getFirebaseFirestore();
  const storage = getFirebaseStorage();

  if (!db || !storage) {
    onProgress?.('pronto');
    return {
      success: false,
      isExternalStorageActive: false,
      orderId: orderData.orderId,
      previewDataUrl,
      artworkUrls: [],
      error: 'Não foi possível inicializar a conexão com o Firebase Storage / Firestore.',
    };
  }

  try {
    onProgress?.('enviando_arquivos');
    const orderFolder = `orders/${orderData.orderId}`;
    let previewUrl: string | null = null;
    const artworkUrls: UploadedArtworkResult[] = [];

    // 2. Upload da prévia visual da peça em PNG de alta definição
    if (previewBlob) {
      const previewRef = ref(
        storage,
        `${orderFolder}/previa-tabua-${orderData.orderId.toLowerCase()}.png`
      );
      const previewSnapshot = await uploadBytes(previewRef, previewBlob, {
        contentType: 'image/png',
        customMetadata: {
          orderId: orderData.orderId,
          pieceType: orderData.pieceType,
          createdAt: new Date().toISOString(),
        },
      });
      previewUrl = await getDownloadURL(previewSnapshot.ref);
    }

    // 3. Upload do arquivo SVG original ÍNTEGRO (ou imagem do cliente)
    const imageElements = orderData.elements.filter((el) => el.type === 'image' && el.imageSrc);

    for (let i = 0; i < imageElements.length; i++) {
      const el = imageElements[i];
      if (!el.imageSrc) continue;

      let fileBlob: Blob;
      let fileExtension = 'png';
      let contentType = 'image/png';

      // Se for SVG: preserva rigorosamente o conteúdo SVG original sem conversão
      if (el.isSvg) {
        fileExtension = 'svg';
        contentType = 'image/svg+xml';
        // Utiliza o conteúdo SVG bruto original se disponível, caso contrário o dataURL
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

      const fileSnapshot = await uploadBytes(fileRef, fileBlob, {
        contentType,
        customMetadata: {
          orderId: orderData.orderId,
          originalFileName: el.imageFileName || 'arte.svg',
          isOriginalSvg: String(Boolean(el.isSvg)),
          isVectorized: String(Boolean(el.isVectorized)),
        },
      });

      const downloadUrl = await getDownloadURL(fileSnapshot.ref);
      artworkUrls.push({
        fileName: uniqueInternalFileName,
        originalFileName: el.imageFileName || uniqueInternalFileName,
        storagePath: fileSnapshot.ref.fullPath,
        downloadUrl,
        type: el.isSvg ? 'svg' : 'raster',
        isSvg: Boolean(el.isSvg),
      });
    }

    // 4. Registro estruturado do pedido no Cloud Firestore
    const orderDocRef = doc(db, 'orders', orderData.orderId);
    await setDoc(orderDocRef, {
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
      elementsCount: orderData.elements.length,
      // Salva geometria e posicionamento exatos para reprodução CNC
      customizationSpecs: orderData.elements.map((el) => ({
        type: el.type,
        xPercent: el.xPercent,
        yPercent: el.yPercent,
        widthCm: el.widthCm,
        heightCm: el.heightCm,
        rotationDeg: el.rotationDeg,
        zIndex: el.zIndex,
        text: el.type === 'text' ? el.text : null,
        fontFamily: el.fontFamily || null,
        isBold: Boolean(el.isBold),
        originalFileName: el.imageFileName || null,
        isSvg: Boolean(el.isSvg),
      })),
      status: 'solicitado',
      source: 'web_configurator',
    });

    onProgress?.('pronto');

    return {
      success: true,
      isExternalStorageActive: true,
      orderId: orderData.orderId,
      previewUrl,
      previewDataUrl,
      artworkUrls,
    };
  } catch (err: any) {
    console.error('Erro ao armazenar no Firebase:', err);
    onProgress?.('pronto');
    return {
      success: false,
      isExternalStorageActive: true,
      orderId: orderData.orderId,
      previewDataUrl,
      artworkUrls: [],
      error: err.message || 'Falha ao gravar arquivos no serviço de nuvem.',
    };
  }
}
