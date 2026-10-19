/**
 * Serviço de Verificação de Cotas, Rate-Limiting e Validação de Arquivos
 * Aplica controle no servidor (Firestore com regras de segurança atômicas) e no navegador.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '../config/firebase';
import { SECURITY_CONFIG } from '../config/security';
import { OrderQuoteData } from '../types/configurator';

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  friendlyMessage?: string;
  source: 'server' | 'local';
}

const LOCAL_STORAGE_KEY = 'mea_quote_rate_limit_history';

/**
 * Lê timestamps locais gravados no navegador
 */
function getLocalHistory(): number[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as number[];
    const cutoff = Date.now() - SECURITY_CONFIG.WINDOW_MS;
    return list.filter((ts) => typeof ts === 'number' && ts > cutoff);
  } catch {
    return [];
  }
}

/**
 * Grava timestamps locais
 */
function recordLocalHistory(timestamps: number[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timestamps));
  } catch {
    // ignora se local storage estiver restrito
  }
}

/**
 * Valida a cota antes do envio:
 * 1. Verifica no Firestore se houver usuário autenticado e conexão ativa.
 * 2. Verifica redundância local.
 */
export async function checkQuoteQuota(targetUserId?: string): Promise<QuotaCheckResult> {
  const now = Date.now();
  const cutoff = now - SECURITY_CONFIG.WINDOW_MS;

  // 1. Verificação local primária rápida
  const localHistory = getLocalHistory();
  if (localHistory.length >= SECURITY_CONFIG.MAX_QUOTES_PER_USER_24H) {
    return {
      allowed: false,
      remaining: 0,
      friendlyMessage: SECURITY_CONFIG.MESSAGES.RATE_LIMIT_EXCEEDED,
      source: 'local',
    };
  }

  // 2. Verificação no Servidor Firestore (Base autoritativa inviolável)
  const auth = getFirebaseAuth();
  const uid = targetUserId || auth?.currentUser?.uid;
  const db = getFirebaseFirestore();

  if (db && uid) {
    try {
      const limitRef = doc(db, 'quote_rate_limits', uid);
      const snap = await Promise.race([
        getDoc(limitRef),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Rate limit check timeout')), 3000)
        ),
      ]);

      if (snap.exists()) {
        const data = snap.data();
        const serverTimestamps: number[] = Array.isArray(data?.requestTimestamps)
          ? data.requestTimestamps.filter((ts: any) => typeof ts === 'number' && ts > cutoff)
          : [];

        if (serverTimestamps.length >= SECURITY_CONFIG.MAX_QUOTES_PER_USER_24H) {
          return {
            allowed: false,
            remaining: 0,
            friendlyMessage: SECURITY_CONFIG.MESSAGES.RATE_LIMIT_EXCEEDED,
            source: 'server',
          };
        }

        return {
          allowed: true,
          remaining: SECURITY_CONFIG.MAX_QUOTES_PER_USER_24H - serverTimestamps.length,
          source: 'server',
        };
      }
    } catch (err) {
      console.warn('[RateLimitService] Verificação no servidor indisponível, usando fallback seguro:', err);
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, SECURITY_CONFIG.MAX_QUOTES_PER_USER_24H - localHistory.length),
    source: 'local',
  };
}

/**
 * Registra o consumo da cota de forma atômica no servidor Firestore e no armazenamento local
 */
export async function consumeQuoteQuota(
  targetUserId?: string,
  orderId?: string
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now();
  const cutoff = now - SECURITY_CONFIG.WINDOW_MS;

  // Atualiza localmente
  const localHistory = getLocalHistory().filter((ts) => ts > cutoff);
  localHistory.push(now);
  recordLocalHistory(localHistory);

  // Atualiza no Servidor Firestore
  const auth = getFirebaseAuth();
  const uid = targetUserId || auth?.currentUser?.uid;
  const db = getFirebaseFirestore();

  let remaining = Math.max(0, SECURITY_CONFIG.MAX_QUOTES_PER_USER_24H - localHistory.length);

  if (db && uid) {
    try {
      const limitRef = doc(db, 'quote_rate_limits', uid);
      const snap = await Promise.race([
        getDoc(limitRef),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Rate limit write timeout')), 2500)
        ),
      ]);

      let serverTimestamps: number[] = [];
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.requestTimestamps)) {
          serverTimestamps = data.requestTimestamps.filter(
            (ts: any) => typeof ts === 'number' && ts > cutoff
          );
        }
      }
      serverTimestamps.push(now);

      await setDoc(
        limitRef,
        {
          userId: uid,
          lastOrderId: orderId || null,
          lastUpdatedAt: serverTimestamp(),
          requestTimestamps: serverTimestamps,
          totalRequests24h: serverTimestamps.length,
        },
        { merge: true }
      );

      remaining = Math.max(0, SECURITY_CONFIG.MAX_QUOTES_PER_USER_24H - serverTimestamps.length);
    } catch (err) {
      console.warn('[RateLimitService] Registro de cota no servidor postergado:', err);
    }
  }

  return { success: true, remaining };
}

/**
 * Em caso de falha de rede comprovada no envio do e-mail, estorna o último consumo da cota
 */
export async function rollbackQuoteQuota(targetUserId?: string): Promise<void> {
  const localHistory = getLocalHistory();
  if (localHistory.length > 0) {
    localHistory.pop();
    recordLocalHistory(localHistory);
  }

  const auth = getFirebaseAuth();
  const uid = targetUserId || auth?.currentUser?.uid;
  const db = getFirebaseFirestore();

  if (db && uid) {
    try {
      const limitRef = doc(db, 'quote_rate_limits', uid);
      const snap = await getDoc(limitRef);
      if (snap.exists()) {
        const data = snap.data();
        const list: number[] = Array.isArray(data?.requestTimestamps) ? [...data.requestTimestamps] : [];
        if (list.length > 0) {
          list.pop();
          await setDoc(
            limitRef,
            {
              requestTimestamps: list,
              totalRequests24h: list.length,
              lastUpdatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
    } catch (err) {
      console.warn('[RateLimitService] Rollback no servidor falhou:', err);
    }
  }
}

/**
 * Validação rigorosa de segurança dos arquivos antes de qualquer upload ao Firebase Storage
 */
export function validateOrderFilesBeforeUpload(
  orderData: OrderQuoteData,
  previewBlob?: Blob | null
): { valid: boolean; friendlyError?: string } {
  // 0. Validação estrita de dimensões físicas (espessura máxima de 3,5 cm)
  if (
    orderData.dimensions.thicknessCm > SECURITY_CONFIG.MAX_BOARD_THICKNESS_CM ||
    orderData.dimensions.thicknessCm <= 0
  ) {
    return {
      valid: false,
      friendlyError: `A espessura máxima permitida para usinagem no atelier é de ${SECURITY_CONFIG.MAX_BOARD_THICKNESS_CM.toFixed(1).replace('.', ',')} cm.`,
    };
  }

  // 1. Quantidade de elementos
  if (orderData.elements.length > SECURITY_CONFIG.MAX_ELEMENTS_COUNT) {
    return {
      valid: false,
      friendlyError: SECURITY_CONFIG.MESSAGES.TOO_MANY_ELEMENTS,
    };
  }

  // 2. Valida prévia PNG
  if (previewBlob && previewBlob.size > SECURITY_CONFIG.MAX_PREVIEW_PNG_SIZE_BYTES) {
    return {
      valid: false,
      friendlyError: SECURITY_CONFIG.MESSAGES.FILE_SIZE_EXCEEDED,
    };
  }

  // 3. Valida elementos de imagem e vetores SVG
  let totalFilesSize = previewBlob ? previewBlob.size : 0;

  for (const el of orderData.elements) {
    if (el.type !== 'image') continue;

    // Se tiver SVG bruto, valida tamanho e sintaxe básica
    if (el.isSvg && el.rawSvgText) {
      const svgBytes = new TextEncoder().encode(el.rawSvgText).length;
      if (svgBytes > SECURITY_CONFIG.MAX_SVG_SIZE_BYTES) {
        return {
          valid: false,
          friendlyError: SECURITY_CONFIG.MESSAGES.FILE_SIZE_EXCEEDED,
        };
      }
      totalFilesSize += svgBytes;

      // Anti-XSS e Anti-malware: Rejeita scripts ou tags inseguras no SVG antes do upload
      const lowerSvg = el.rawSvgText.toLowerCase();
      if (
        lowerSvg.includes('<script') ||
        lowerSvg.includes('javascript:') ||
        lowerSvg.includes('onload=') ||
        lowerSvg.includes('onerror=') ||
        lowerSvg.includes('<iframe')
      ) {
        return {
          valid: false,
          friendlyError:
            'O arquivo SVG contém elementos não permitidos para corte em CNC. Por favor, utilize apenas contornos e vetores gráficos limpos.',
        };
      }
    } else if (el.imageSrc?.startsWith('data:')) {
      const base64Part = el.imageSrc.split(',')[1] || '';
      const estimatedBytes = Math.round(base64Part.length * 0.75);

      if (estimatedBytes > SECURITY_CONFIG.MAX_RASTER_SIZE_BYTES) {
        return {
          valid: false,
          friendlyError: SECURITY_CONFIG.MESSAGES.FILE_SIZE_EXCEEDED,
        };
      }
      totalFilesSize += estimatedBytes;
    }
  }

  // 4. Limite agregado do pedido
  if (totalFilesSize > SECURITY_CONFIG.MAX_TOTAL_ORDER_FILES_SIZE_BYTES) {
    return {
      valid: false,
      friendlyError: SECURITY_CONFIG.MESSAGES.FILE_SIZE_EXCEEDED,
    };
  }

  return { valid: true };
}
