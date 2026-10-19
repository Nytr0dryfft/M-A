import {
  isFirebaseConfigured,
  getFirebaseFirestore,
  getFirebaseStorage,
  ensureAuthenticatedUser,
} from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export interface CustomerPhoto {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string; // Miniatura compacta (< 90 KB) para carregamento ultrarrápido na galeria
  title?: string;
  category: string;
  wood?: string;
  clientName?: string;
  isNameAuthorized?: boolean;
  city?: string;
  rating?: number; // 1 a 5 real, ou undefined se não houver
  comment?: string; // Comentário real, ou undefined se não houver
  published: boolean;
  order: number;
  createdAt: string;
}

const DB_NAME = 'AtelierMA_CustomerPhotos_DB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

// Cache em memória RAM volátil para evitar requisições repetidas ao Firestore
interface MemoryCache {
  photos: CustomerPhoto[];
  timestamp: number;
}
let memoryPhotosCache: MemoryCache | null = null;
const MEMORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de frescor absoluto em RAM (invalidação em tempo real ao editar)

export function invalidateCustomerPhotosCache(): void {
  memoryPhotosCache = null;
}

// Helper para abrir o IndexedDB nativo
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('order', 'order', { unique: false });
        store.createIndex('published', 'published', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback no LocalStorage para navegadores com restrições e inicialização em 0ms
const LOCAL_STORAGE_KEY = 'atelier_ma_customer_photos_v1';

function getFromLocalStorage(): CustomerPhoto[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToLocalStorage(photos: CustomerPhoto[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  } catch (e) {
    console.warn('LocalStorage cheio ou inacessível:', e);
  }
}

/**
 * Retorna fotos do cache local de forma síncrona (0ms de latência para render imediato)
 */
export function getCachedCustomerPhotos(onlyPublished = false): CustomerPhoto[] {
  if (memoryPhotosCache && Date.now() - memoryPhotosCache.timestamp < MEMORY_CACHE_TTL_MS) {
    const list = memoryPhotosCache.photos;
    return onlyPublished ? list.filter((p) => p.published) : list;
  }
  const local = getFromLocalStorage();
  local.sort((a, b) => (a.order || 0) - (b.order || 0));
  return onlyPublished ? local.filter((p) => p.published) : local;
}

/**
 * Gera miniatura WebP/JPEG leve (< 90 KB) utilizando Canvas no navegador
 */
export async function generateThumbnailBlob(
  dataUrlOrFile: string | File | Blob,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.82
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Ambiente sem suporte a DOM'));
      return;
    }
    const img = new Image();
    if (typeof dataUrlOrFile === 'string' && (dataUrlOrFile.startsWith('http://') || dataUrlOrFile.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context indisponível'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Falha ao gerar blob de miniatura'));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = (e) => reject(e);

    if (typeof dataUrlOrFile === 'string') {
      img.src = dataUrlOrFile;
    } else {
      img.src = URL.createObjectURL(dataUrlOrFile);
    }
  });
}

/**
 * Carrega fotos com Stale-While-Revalidate:
 * 1. Retorna cache em RAM se ainda válido.
 * 2. Consulta Firestore com timeout estrito de 4.5s para nunca travar a UI.
 * 3. Faz fallback suave para IndexedDB / LocalStorage.
 */
export async function loadCustomerPhotos(onlyPublished = false): Promise<CustomerPhoto[]> {
  // 1. Verificação de Cache em Memória
  if (memoryPhotosCache && Date.now() - memoryPhotosCache.timestamp < MEMORY_CACHE_TTL_MS) {
    const list = memoryPhotosCache.photos;
    return onlyPublished ? list.filter((p) => p.published) : list;
  }

  // 2. Consulta Firestore com Timeout Estrito
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      if (db) {
        // Para visitantes públicos, filtra estritamente por published == true para respeitar firestore.rules
        const q = onlyPublished
          ? query(collection(db, 'customer_photos'), where('published', '==', true))
          : query(collection(db, 'customer_photos'));

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na consulta do Firestore (4.5s)')), 4500)
        );

        const snap = await Promise.race([getDocs(q), timeoutPromise]);
        const cloudPhotos: CustomerPhoto[] = [];
        snap.forEach((d) => {
          cloudPhotos.push(d.data() as CustomerPhoto);
        });

        // Ordenação segura em memória (evita necessidade de índice composto no Firestore)
        cloudPhotos.sort((a, b) => (a.order || 0) - (b.order || 0));

        if (cloudPhotos.length > 0) {
          memoryPhotosCache = {
            photos: cloudPhotos,
            timestamp: Date.now(),
          };
          saveToLocalStorage(cloudPhotos);
          return onlyPublished ? cloudPhotos.filter((p) => p.published) : cloudPhotos;
        }
      }
    } catch (err) {
      console.warn('Consulta ao Firestore não respondeu a tempo ou falhou, utilizando cache local:', err);
    }
  }

  // 3. Fallback no IndexedDB local
  try {
    const db = await openIndexedDB();
    const photos: CustomerPhoto[] = await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const result: CustomerPhoto[] = request.result || [];
        result.sort((a, b) => (a.order || 0) - (b.order || 0));
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });

    if (photos.length > 0) {
      memoryPhotosCache = { photos, timestamp: Date.now() };
      return onlyPublished ? photos.filter((p) => p.published) : photos;
    }
  } catch (e) {
    console.warn('IndexedDB inacessível, recorrendo ao LocalStorage:', e);
  }

  // 4. Fallback no LocalStorage
  const localList = getFromLocalStorage();
  localList.sort((a, b) => (a.order || 0) - (b.order || 0));
  if (localList.length > 0) {
    memoryPhotosCache = { photos: localList, timestamp: Date.now() };
  }
  return onlyPublished ? localList.filter((p) => p.published) : localList;
}

/**
 * Salva uma nova fotografia real com geração automática de miniatura otimizada
 * e cabeçalhos de cache permanente no Firebase Storage.
 */
export async function createCustomerPhoto(
  data: Omit<CustomerPhoto, 'id' | 'createdAt' | 'order'>
): Promise<CustomerPhoto> {
  const existing = await loadCustomerPhotos(false);
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((p) => p.order || 0)) + 1 : 1;

  const newPhoto: CustomerPhoto = {
    ...data,
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    order: nextOrder,
    createdAt: new Date().toISOString(),
  };

  // Se o Firebase estiver ativo, salvar no Firestore e Storage
  if (isFirebaseConfigured()) {
    try {
      await ensureAuthenticatedUser();
      const db = getFirebaseFirestore();
      const storage = getFirebaseStorage();

      let finalImageUrl = newPhoto.imageUrl;
      let finalThumbUrl = newPhoto.thumbnailUrl || '';

      // Se a imagem for data URL base64, subir para o Firebase Storage
      if (storage && newPhoto.imageUrl.startsWith('data:')) {
        const rawDataUrl = newPhoto.imageUrl;
        const parts = rawDataUrl.split(';base64,');
        if (parts.length === 2) {
          const contentType = parts[0].split(':')[1] || 'image/jpeg';
          const raw = window.atob(parts[1]);
          const uInt8Array = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          const blob = new Blob([uInt8Array], { type: contentType });

          // 1. Gera miniatura leve (< 80 KB) a partir da imagem local ANTES de subir (sem problemas de CORS)
          let thumbBlob: Blob;
          try {
            thumbBlob = await generateThumbnailBlob(rawDataUrl, 800, 600, 0.82);
          } catch (thumbErr) {
            console.warn('Miniatura local falhou, usando blob original:', thumbErr);
            thumbBlob = blob;
          }

          const storageRef = ref(storage, `customer_photos/${newPhoto.id}.jpg`);
          const thumbRef = ref(storage, `customer_photos/${newPhoto.id}_thumb.jpg`);

          // 2. Upload paralelo com cabeçalho de cache de 1 ano
          await Promise.all([
            uploadBytes(storageRef, blob, {
              contentType,
              cacheControl: 'public, max-age=31536000, immutable',
            }),
            uploadBytes(thumbRef, thumbBlob, {
              contentType: 'image/jpeg',
              cacheControl: 'public, max-age=31536000, immutable',
            }),
          ]);

          // 3. Obtenção paralela de URLs de download
          const [gotImageUrl, gotThumbUrl] = await Promise.all([
            getDownloadURL(storageRef),
            getDownloadURL(thumbRef),
          ]);

          finalImageUrl = gotImageUrl;
          finalThumbUrl = gotThumbUrl;
          newPhoto.imageUrl = finalImageUrl;
          newPhoto.thumbnailUrl = finalThumbUrl;
        }
      }

      if (db) {
        await setDoc(doc(db, 'customer_photos', newPhoto.id), {
          ...newPhoto,
          serverTimestamp: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Erro ao salvar foto no Firebase, salvando apenas localmente:', err);
    }
  }

  // Invalida cache em memória para forçar nova leitura atualizada
  invalidateCustomerPhotosCache();

  // Salvar no IndexedDB
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(newPhoto);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write error:', err);
  }

  // Manter LocalStorage sincronizado
  const updated = [...existing, newPhoto];
  saveToLocalStorage(updated);

  return newPhoto;
}

/**
 * Atualiza os dados de uma foto existente.
 */
export async function updateCustomerPhoto(photo: CustomerPhoto): Promise<CustomerPhoto> {
  const updatedPhoto = { ...photo };

  if (isFirebaseConfigured()) {
    try {
      await ensureAuthenticatedUser();
      const db = getFirebaseFirestore();
      const storage = getFirebaseStorage();

      // Se a imagem for data URL base64 nova, subir para o Firebase Storage
      if (storage && updatedPhoto.imageUrl.startsWith('data:')) {
        const rawDataUrl = updatedPhoto.imageUrl;
        const parts = rawDataUrl.split(';base64,');
        if (parts.length === 2) {
          const contentType = parts[0].split(':')[1] || 'image/jpeg';
          const raw = window.atob(parts[1]);
          const uInt8Array = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          const blob = new Blob([uInt8Array], { type: contentType });

          // Gera miniatura leve (< 80 KB) a partir da imagem local antes de subir
          let thumbBlob: Blob;
          try {
            thumbBlob = await generateThumbnailBlob(rawDataUrl, 800, 600, 0.82);
          } catch (thumbErr) {
            console.warn('Miniatura local falhou no update:', thumbErr);
            thumbBlob = blob;
          }

          const storageRef = ref(storage, `customer_photos/${updatedPhoto.id}.jpg`);
          const thumbRef = ref(storage, `customer_photos/${updatedPhoto.id}_thumb.jpg`);

          // Upload paralelo com cabeçalho de cache de 1 ano
          await Promise.all([
            uploadBytes(storageRef, blob, {
              contentType,
              cacheControl: 'public, max-age=31536000, immutable',
            }),
            uploadBytes(thumbRef, thumbBlob, {
              contentType: 'image/jpeg',
              cacheControl: 'public, max-age=31536000, immutable',
            }),
          ]);

          const [gotImageUrl, gotThumbUrl] = await Promise.all([
            getDownloadURL(storageRef),
            getDownloadURL(thumbRef),
          ]);

          updatedPhoto.imageUrl = gotImageUrl;
          updatedPhoto.thumbnailUrl = gotThumbUrl;
        }
      }

      if (db) {
        await setDoc(doc(db, 'customer_photos', updatedPhoto.id), {
          ...updatedPhoto,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Erro ao atualizar foto no Firebase:', err);
    }
  }

  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(updatedPhoto);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB update error:', err);
  }

  const existing = getFromLocalStorage();
  const idx = existing.findIndex((p) => p.id === updatedPhoto.id);
  if (idx >= 0) {
    existing[idx] = updatedPhoto;
  } else {
    existing.push(updatedPhoto);
  }
  saveToLocalStorage(existing);

  invalidateCustomerPhotosCache();
  return updatedPhoto;
}

/**
 * Exclui uma foto cadastrada e suas miniaturas.
 */
export async function deleteCustomerPhoto(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      await ensureAuthenticatedUser();
      const db = getFirebaseFirestore();
      const storage = getFirebaseStorage();
      if (db) {
        await deleteDoc(doc(db, 'customer_photos', id));
      }
      if (storage) {
        try {
          const storageRef = ref(storage, `customer_photos/${id}.jpg`);
          await deleteObject(storageRef);
        } catch {
          // Ignora se arquivo não existir
        }
        try {
          const thumbRef = ref(storage, `customer_photos/${id}_thumb.jpg`);
          await deleteObject(thumbRef);
        } catch {
          // Ignora se miniatura não existir
        }
      }
    } catch (err) {
      console.warn('Erro ao deletar foto do Firebase:', err);
    }
  }

  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
  }

  const existing = getFromLocalStorage().filter((p) => p.id !== id);
  saveToLocalStorage(existing);

  invalidateCustomerPhotosCache();
  return true;
}

/**
 * Reordena as fotos com base em uma nova lista de IDs.
 */
export async function reorderCustomerPhotos(orderedIds: string[]): Promise<CustomerPhoto[]> {
  const current = await loadCustomerPhotos(false);
  const updated: CustomerPhoto[] = [];

  orderedIds.forEach((id, index) => {
    const item = current.find((p) => p.id === id);
    if (item) {
      const nextItem = { ...item, order: index + 1 };
      updated.push(nextItem);
    }
  });

  // Salvar no IndexedDB
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    for (const item of updated) {
      store.put(item);
    }
  } catch (err) {
    console.warn('IndexedDB reorder error:', err);
  }

  // Atualizar LocalStorage
  saveToLocalStorage(updated);

  // Se Firebase ativo, atualizar cada um em paralelo
  if (isFirebaseConfigured()) {
    try {
      await ensureAuthenticatedUser();
      const db = getFirebaseFirestore();
      if (db) {
        await Promise.all(
          updated.map((item) =>
            setDoc(doc(db, 'customer_photos', item.id), item, { merge: true })
          )
        );
      }
    } catch (err) {
      console.warn('Firebase reorder error:', err);
    }
  }

  invalidateCustomerPhotosCache();
  return updated;
}

/**
 * Otimiza fotografias existentes no Firebase que não possuem miniatura dedicada (< 80 KB).
 * Gera miniatura compacta, sobe para o Firebase Storage com cache permanente de 1 ano
 * e persiste a nova thumbnailUrl no Firestore.
 */
export async function optimizeExistingCustomerPhotos(
  onProgress?: (current: number, total: number) => void
): Promise<{ total: number; optimized: number; failed: number }> {
  const currentPhotos = await loadCustomerPhotos(false);
  const toOptimize = currentPhotos.filter(
    (p) => !p.thumbnailUrl || p.thumbnailUrl === p.imageUrl || p.thumbnailUrl.trim() === ''
  );

  let optimized = 0;
  let failed = 0;

  if (toOptimize.length === 0) {
    return { total: 0, optimized: 0, failed: 0 };
  }

  if (isFirebaseConfigured()) {
    await ensureAuthenticatedUser();
    const db = getFirebaseFirestore();
    const storage = getFirebaseStorage();

    for (let i = 0; i < toOptimize.length; i++) {
      const photo = toOptimize[i];
      if (onProgress) {
        onProgress(i + 1, toOptimize.length);
      }
      try {
        const thumbBlob = await generateThumbnailBlob(photo.imageUrl, 800, 600, 0.82);
        if (storage && db) {
          const thumbRef = ref(storage, `customer_photos/${photo.id}_thumb.jpg`);
          await uploadBytes(thumbRef, thumbBlob, {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000, immutable',
          });
          const finalThumbUrl = await getDownloadURL(thumbRef);
          photo.thumbnailUrl = finalThumbUrl;

          await setDoc(
            doc(db, 'customer_photos', photo.id),
            { thumbnailUrl: finalThumbUrl },
            { merge: true }
          );
          optimized++;
        }
      } catch (err) {
        console.warn(`Falha ao otimizar foto ${photo.id}:`, err);
        failed++;
      }
    }
  }

  invalidateCustomerPhotosCache();
  return { total: toOptimize.length, optimized, failed };
}
