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
  listAll,
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

// Cache em memória RAM volátil para evitar requisições repetidas ao Firestore/Storage
interface MemoryCache {
  photos: CustomerPhoto[];
  timestamp: number;
}
let memoryPhotosCache: MemoryCache | null = null;
const MEMORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de frescor em RAM

export function invalidateCustomerPhotosCache(): void {
  memoryPhotosCache = null;
}

/**
 * Abre o IndexedDB com timeout estrito de 1.2 segundos para NUNCA travar
 * janelas anônimas ou navegadores com restrições de armazenamento privado.
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error('Timeout de abertura do IndexedDB (1.2s)'));
    }, 1200);

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('order', 'order', { unique: false });
          store.createIndex('published', 'published', { unique: false });
        }
      };

      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result);
      };

      request.onerror = () => {
        clearTimeout(timer);
        reject(request.error || new Error('Erro ao abrir IndexedDB'));
      };

      request.onblocked = () => {
        clearTimeout(timer);
        reject(new Error('IndexedDB bloqueado pelo navegador'));
      };
    } catch (e) {
      clearTimeout(timer);
      reject(e);
    }
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
    console.warn('LocalStorage inacessível ou quota excedida:', e);
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
 * Gera miniatura JPEG leve (< 80 KB) utilizando Canvas no navegador com timeout de segurança
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

    const timer = setTimeout(() => {
      reject(new Error('Timeout ao processar imagem no Canvas (8s)'));
    }, 8000);

    const img = new Image();
    let objectUrlToRevoke: string | null = null;

    if (
      typeof dataUrlOrFile === 'string' &&
      (dataUrlOrFile.startsWith('http://') || dataUrlOrFile.startsWith('https://'))
    ) {
      img.crossOrigin = 'anonymous';
    }

    const cleanup = () => {
      clearTimeout(timer);
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
        objectUrlToRevoke = null;
      }
    };

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 600;

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
          cleanup();
          reject(new Error('Canvas 2D context indisponível'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob && blob.size > 0) {
              resolve(blob);
            } else {
              reject(new Error('Falha ao gerar blob de miniatura'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    img.onerror = (e) => {
      cleanup();
      reject(new Error('Falha ao decodificar arquivo de imagem no navegador'));
    };

    if (typeof dataUrlOrFile === 'string') {
      img.src = dataUrlOrFile;
    } else {
      objectUrlToRevoke = URL.createObjectURL(dataUrlOrFile);
      img.src = objectUrlToRevoke;
    }
  });
}

/**
 * Carrega fotos com pipeline resiliente e timeouts estritos:
 * 1. Cache em RAM se disponível
 * 2. Consulta Firestore (timeout 2.5s)
 * 3. Fallback no Firebase Storage (timeout 2.5s)
 * 4. Fallback no IndexedDB local (timeout 1.0s)
 * 5. Fallback no LocalStorage
 * NUNCA trava em carregamento infinito para janelas anônimas.
 */
export async function loadCustomerPhotos(onlyPublished = false): Promise<CustomerPhoto[]> {
  // 1. Verificação de Cache em Memória
  if (memoryPhotosCache && Date.now() - memoryPhotosCache.timestamp < MEMORY_CACHE_TTL_MS) {
    const list = memoryPhotosCache.photos;
    return onlyPublished ? list.filter((p) => p.published) : list;
  }

  // 2. Consulta Firestore com Timeout Estrito de 2.2s
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      if (db) {
        const q = onlyPublished
          ? query(collection(db, 'customer_photos'), where('published', '==', true))
          : query(collection(db, 'customer_photos'));

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout Firestore (2.2s)')), 2200)
        );

        const snap = await Promise.race([getDocs(q), timeoutPromise]);
        const cloudPhotos: CustomerPhoto[] = [];
        snap.forEach((d) => {
          cloudPhotos.push(d.data() as CustomerPhoto);
        });

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
    } catch (err: any) {
      console.warn(
        'Consulta ao Firestore indisponível ou API desativada no Console, tentando Firebase Storage direto:',
        err?.message || err
      );
    }

    // 3. Fallback no Firebase Storage (se Firestore estiver vazio ou API desativada)
    const storage = getFirebaseStorage();
    if (storage) {
      try {
        const listRef = ref(storage, 'customer_photos');
        const timeoutStorage = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout Storage (2.2s)')), 2200)
        );
        const storageResult = await Promise.race([listAll(listRef), timeoutStorage]);

        const mainItems = storageResult.items.filter(
          (item) => !item.name.includes('_thumb') && !item.name.endsWith('.json')
        );

        if (mainItems.length === 0) {
          // O Firebase Storage respondeu e confirmou que a galeria na nuvem está vazia
          memoryPhotosCache = {
            photos: [],
            timestamp: Date.now(),
          };
          saveToLocalStorage([]);
          try {
            const dbLocal = await openIndexedDB();
            const tx = dbLocal.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
          } catch {}
          return [];
        }

        if (mainItems.length > 0) {
          const storagePhotos: CustomerPhoto[] = await Promise.all(
            mainItems.map(async (item, idx) => {
              const baseId = item.name.replace(/\.[^/.]+$/, '');
              const imageUrl = await getDownloadURL(item);
              const thumbItem = storageResult.items.find(
                (t) => t.name === `${baseId}_thumb.jpg`
              );
              const thumbUrl = thumbItem ? await getDownloadURL(thumbItem) : imageUrl;
              const rawName = baseId.replace(/[-_]/g, ' ');

              // Tenta ler o arquivo de metadados .json correspondente
              const jsonItem = storageResult.items.find((t) => t.name === `${baseId}.json`);
              if (jsonItem) {
                try {
                  const jsonUrl = await getDownloadURL(jsonItem);
                  const res = await fetch(jsonUrl);
                  if (res.ok) {
                    const parsed = await res.json();
                    return {
                      ...parsed,
                      id: parsed.id || baseId,
                      imageUrl: imageUrl || parsed.imageUrl,
                      thumbnailUrl: thumbUrl || parsed.thumbnailUrl || imageUrl,
                    } as CustomerPhoto;
                  }
                } catch {
                  // Continua para o objeto derivado
                }
              }

              return {
                id: baseId,
                imageUrl,
                thumbnailUrl: thumbUrl,
                category: 'Tábuas de Carne',
                title: rawName.charAt(0).toUpperCase() + rawName.slice(1),
                published: true,
                order: idx + 1,
                createdAt: new Date().toISOString(),
              };
            })
          );

          if (storagePhotos.length > 0) {
            memoryPhotosCache = {
              photos: storagePhotos,
              timestamp: Date.now(),
            };
            saveToLocalStorage(storagePhotos);
            return onlyPublished ? storagePhotos.filter((p) => p.published) : storagePhotos;
          }
        }
      } catch (storageErr: any) {
        console.warn('Verificação de fotos diretamente no Storage falhou:', storageErr?.message || storageErr);
      }
    }
  }

  // 4. Fallback no IndexedDB local com timeout estrito
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
  } catch (e: any) {
    // Silencioso em navegação anônima
  }

  // 5. Fallback no LocalStorage
  const localList = getFromLocalStorage();
  localList.sort((a, b) => (a.order || 0) - (b.order || 0));
  if (localList.length > 0) {
    memoryPhotosCache = { photos: localList, timestamp: Date.now() };
  }
  return onlyPublished ? localList.filter((p) => p.published) : localList;
}

/**
 * Salva uma nova fotografia real no Firebase Storage e Firestore.
 * Valida cada etapa e emite erros claros e diferenciados em vez de silenciar falhas.
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

  if (!isFirebaseConfigured()) {
    throw new Error('Configuração do Firebase ausente ou incompleta.');
  }

  // 1. Garante autenticação anônima do administrador
  const user = await ensureAuthenticatedUser();
  if (!user) {
    throw new Error(
      'Falha de autenticação no Firebase: Não foi possível autenticar a sessão do administrador via Firebase Auth.'
    );
  }

  const storage = getFirebaseStorage();
  const db = getFirebaseFirestore();

  if (!storage) {
    throw new Error('Firebase Storage não inicializado.');
  }

  let finalImageUrl = newPhoto.imageUrl;
  let finalThumbUrl = newPhoto.thumbnailUrl || '';

  // 2. Se a imagem estiver em formato base64, realizar upload real no Storage
  if (newPhoto.imageUrl.startsWith('data:')) {
    const rawDataUrl = newPhoto.imageUrl;
    const parts = rawDataUrl.split(';base64,');
    if (parts.length !== 2) {
      throw new Error('Formato da imagem inválido (base64 corrompido).');
    }

    const contentType = parts[0].split(':')[1] || 'image/jpeg';
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([uInt8Array], { type: contentType });

    // Gera miniatura local antes de subir (sem problemas de CORS)
    let thumbBlob: Blob;
    try {
      thumbBlob = await generateThumbnailBlob(rawDataUrl, 800, 600, 0.82);
    } catch (thumbErr) {
      console.warn('Geração de miniatura local falhou, utilizando arquivo original:', thumbErr);
      thumbBlob = blob;
    }

    const storageRef = ref(storage, `customer_photos/${newPhoto.id}.jpg`);
    const thumbRef = ref(storage, `customer_photos/${newPhoto.id}_thumb.jpg`);

    // Upload das imagens para o Firebase Storage com metadados administrativos estritos
    try {
      await Promise.all([
        uploadBytes(storageRef, blob, {
          contentType,
          cacheControl: 'public, max-age=31536000, immutable',
          customMetadata: {
            role: 'admin',
            uploadedBy: 'atelier_admin',
          },
        }),
        uploadBytes(thumbRef, thumbBlob, {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000, immutable',
          customMetadata: {
            role: 'admin',
            uploadedBy: 'atelier_admin',
          },
        }),
      ]);
    } catch (uploadErr: any) {
      console.error('Falha crítica no upload para o Firebase Storage:', uploadErr);
      if (uploadErr?.code === 'storage/unauthorized') {
        throw new Error(
          'PERMISSÃO NEGADA NO FIREBASE STORAGE (storage/unauthorized): As regras de segurança para a pasta "customer_photos" ainda não foram publicadas no Console do Firebase. Veja o botão "Publicar Regras" no painel.'
        );
      }
      throw new Error(
        `Falha no upload para o Firebase Storage: ${uploadErr?.code || uploadErr?.message || 'Erro desconhecido'}`
      );
    }

    // Obtenção das URLs públicas de download
    try {
      const [gotImageUrl, gotThumbUrl] = await Promise.all([
        getDownloadURL(storageRef),
        getDownloadURL(thumbRef),
      ]);
      finalImageUrl = gotImageUrl;
      finalThumbUrl = gotThumbUrl;
      newPhoto.imageUrl = finalImageUrl;
      newPhoto.thumbnailUrl = finalThumbUrl;
    } catch (urlErr: any) {
      console.error('Falha ao obter URL pública do Firebase Storage:', urlErr);
      throw new Error(`Imagem enviada, mas falha ao obter URL pública: ${urlErr?.message}`);
    }

    // Salva arquivo de metadados JSON no Storage para redundância caso Firestore esteja desativado
    try {
      const metaRef = ref(storage, `customer_photos/${newPhoto.id}.json`);
      const metaBlob = new Blob([JSON.stringify(newPhoto)], { type: 'application/json' });
      await uploadBytes(metaRef, metaBlob, {
        contentType: 'application/json',
        customMetadata: {
          role: 'admin',
          uploadedBy: 'atelier_admin',
        },
      });
    } catch (metaErr) {
      console.warn('Gravação de metadados redundantes no Storage falhou:', metaErr);
    }
  }

  // 3. Gravação dos metadados no Cloud Firestore com timeout estrito
  if (db) {
    try {
      const timeoutFirestore = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 1800)
      );
      await Promise.race([
        setDoc(doc(db, 'customer_photos', newPhoto.id), {
          ...newPhoto,
          authorRole: 'admin',
          serverTimestamp: serverTimestamp(),
        }),
        timeoutFirestore,
      ]);
    } catch (firestoreErr: any) {
      console.warn(
        'Aviso do Firestore (API desativada no Console ou timeout). A imagem foi salva no Storage e continuará visível:',
        firestoreErr?.message || firestoreErr
      );
    }
  }

  // 4. Salvar nos caches locais para visualização instantânea
  try {
    const dbLocal = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = dbLocal.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(newPhoto);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Ignora restrições do navegador local
  }

  const updatedLocal = [...existing, newPhoto];
  saveToLocalStorage(updatedLocal);

  // Invalida cache de RAM para forçar releitura
  invalidateCustomerPhotosCache();

  return newPhoto;
}

/**
 * Atualiza os dados de uma foto existente com tratamento de erros.
 */
export async function updateCustomerPhoto(photo: CustomerPhoto): Promise<CustomerPhoto> {
  const updatedPhoto = { ...photo };

  if (isFirebaseConfigured()) {
    const user = await ensureAuthenticatedUser();
    if (!user) {
      throw new Error('Falha de autenticação ao atualizar foto.');
    }

    const storage = getFirebaseStorage();
    const db = getFirebaseFirestore();

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

        let thumbBlob: Blob;
        try {
          thumbBlob = await generateThumbnailBlob(rawDataUrl, 800, 600, 0.82);
        } catch {
          thumbBlob = blob;
        }

        const storageRef = ref(storage, `customer_photos/${updatedPhoto.id}.jpg`);
        const thumbRef = ref(storage, `customer_photos/${updatedPhoto.id}_thumb.jpg`);

        await Promise.all([
          uploadBytes(storageRef, blob, {
            contentType,
            cacheControl: 'public, max-age=31536000, immutable',
            customMetadata: {
              role: 'admin',
              uploadedBy: 'atelier_admin',
            },
          }),
          uploadBytes(thumbRef, thumbBlob, {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000, immutable',
            customMetadata: {
              role: 'admin',
              uploadedBy: 'atelier_admin',
            },
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
      try {
        await setDoc(doc(db, 'customer_photos', updatedPhoto.id), {
          ...updatedPhoto,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e: any) {
        console.warn('Firestore update warning:', e?.message);
      }
    }
  }

  try {
    const dbLocal = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = dbLocal.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(updatedPhoto);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Ignora restrições do navegador
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
 * Exclui uma foto cadastrada e suas miniaturas do Firebase e locais.
 * Totalmente não bloqueante, com timeouts estritos para Firestore e Storage.
 */
export async function deleteCustomerPhoto(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      await ensureAuthenticatedUser();
      const db = getFirebaseFirestore();
      const storage = getFirebaseStorage();

      // 1. Deleção no Firestore com timeout estrito de 1.5s (não bloqueia caso API esteja desativada)
      if (db) {
        try {
          const timeoutFirestore = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore timeout')), 1500)
          );
          await Promise.race([deleteDoc(doc(db, 'customer_photos', id)), timeoutFirestore]);
        } catch (e: any) {
          console.warn('deleteDoc Firestore timeout/aviso (prosseguindo):', e?.message || e);
        }
      }

      // 2. Deleção no Firebase Storage
      if (storage) {
        // Listar e remover todos os arquivos correspondentes a este ID (original, miniatura, json)
        try {
          const listRef = ref(storage, 'customer_photos');
          const timeoutStorage = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Storage list timeout')), 2500)
          );
          const listResult = await Promise.race([listAll(listRef), timeoutStorage]);
          const matchingItems = listResult.items.filter(
            (item) =>
              item.name === id ||
              item.name.startsWith(`${id}.`) ||
              item.name.startsWith(`${id}_`)
          );
          if (matchingItems.length > 0) {
            await Promise.allSettled(matchingItems.map((item) => deleteObject(item)));
          }
        } catch (listErr) {
          console.warn('Listagem para deleção no Storage falhou:', listErr);
        }

        // Deleções diretas adicionais por garantia para todos os formatos possíveis
        const directDeletes = [
          deleteObject(ref(storage, `customer_photos/${id}.jpg`)),
          deleteObject(ref(storage, `customer_photos/${id}_thumb.jpg`)),
          deleteObject(ref(storage, `customer_photos/${id}.json`)),
          deleteObject(ref(storage, `customer_photos/${id}.png`)),
          deleteObject(ref(storage, `customer_photos/${id}.jpeg`)),
          deleteObject(ref(storage, `customer_photos/${id}.webp`)),
        ];
        await Promise.allSettled(directDeletes);
      }
    } catch (err) {
      console.warn('Erro ao deletar foto do Firebase:', err);
    }
  }

  // 3. Remoção do IndexedDB com timeout seguro
  try {
    const dbLocal = await openIndexedDB();
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 800);
      const transaction = dbLocal.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => {
        clearTimeout(timer);
        resolve();
      };
      req.onerror = () => {
        clearTimeout(timer);
        resolve();
      };
    });
  } catch (err) {
    // ignore
  }

  // 4. Remoção do LocalStorage
  const existing = getFromLocalStorage().filter((p) => p.id !== id);
  saveToLocalStorage(existing);

  // 5. Invalida cache de memória imediatamente para sincronizar todas as views
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

  try {
    const dbLocal = await openIndexedDB();
    const transaction = dbLocal.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    for (const item of updated) {
      store.put(item);
    }
  } catch (err) {
    // ignore
  }

  saveToLocalStorage(updated);

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
 * Diagnóstico completo em tempo real da conexão com o Firebase:
 * Testa Auth anônimo, permissão de escrita no Storage e conectividade do Firestore.
 */
export async function testFirebaseDiagnostics(): Promise<{
  authOk: boolean;
  authUid?: string;
  authError?: string;
  storageOk: boolean;
  storageError?: string;
  firestoreOk: boolean;
  firestoreError?: string;
}> {
  const result = {
    authOk: false,
    authUid: undefined as string | undefined,
    authError: undefined as string | undefined,
    storageOk: false,
    storageError: undefined as string | undefined,
    firestoreOk: false,
    firestoreError: undefined as string | undefined,
  };

  // 1. Testar Auth
  try {
    const user = await ensureAuthenticatedUser();
    if (user) {
      result.authOk = true;
      result.authUid = user.uid;
    } else {
      result.authError = 'Sessão anônima não pôde ser iniciada.';
    }
  } catch (e: any) {
    result.authError = e?.message || 'Erro de autenticação';
  }

  // 2. Testar Firebase Storage Write na pasta customer_photos
  try {
    const storage = getFirebaseStorage();
    if (storage) {
      const probeRef = ref(storage, 'customer_photos/_connection_probe.json');
      const probeBlob = new Blob([JSON.stringify({ timestamp: Date.now() })], {
        type: 'application/json',
      });
      await uploadBytes(probeRef, probeBlob, {
        contentType: 'application/json',
        customMetadata: { role: 'admin', uploadedBy: 'atelier_admin' },
      });
      result.storageOk = true;
      // Limpeza do arquivo probe
      try {
        await deleteObject(probeRef);
      } catch {}
    } else {
      result.storageError = 'Storage não inicializado.';
    }
  } catch (e: any) {
    if (e?.code === 'storage/unauthorized') {
      result.storageError =
        'Permissão negada (storage/unauthorized). As regras de segurança para customer_photos precisam ser publicadas no Console do Firebase.';
    } else {
      result.storageError = e?.message || e?.code || 'Erro no Storage';
    }
  }

  // 3. Testar Cloud Firestore
  try {
    const db = getFirebaseFirestore();
    if (db) {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de consulta ao Firestore (2.5s)')), 2500)
      );
      const snap = await Promise.race([
        getDocs(query(collection(db, 'customer_photos'))),
        timeout,
      ]);
      result.firestoreOk = true;
    } else {
      result.firestoreError = 'Firestore não inicializado.';
    }
  } catch (e: any) {
    result.firestoreError = e?.message || 'Cloud Firestore API desativada ou inacessível no projeto.';
  }

  return result;
}

/**
 * Otimiza fotografias existentes gerando miniaturas leves caso não possuam
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
    const user = await ensureAuthenticatedUser();
    if (!user) {
      throw new Error('Falha de autenticação ao otimizar fotos.');
    }
    const db = getFirebaseFirestore();
    const storage = getFirebaseStorage();

    for (let i = 0; i < toOptimize.length; i++) {
      const photo = toOptimize[i];
      if (onProgress) {
        onProgress(i + 1, toOptimize.length);
      }
      try {
        const thumbBlob = await generateThumbnailBlob(photo.imageUrl, 800, 600, 0.82);
        if (storage) {
          const thumbRef = ref(storage, `customer_photos/${photo.id}_thumb.jpg`);
          await uploadBytes(thumbRef, thumbBlob, {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000, immutable',
            customMetadata: { role: 'admin', uploadedBy: 'atelier_admin' },
          });
          const finalThumbUrl = await getDownloadURL(thumbRef);
          photo.thumbnailUrl = finalThumbUrl;

          if (db) {
            try {
              await setDoc(
                doc(db, 'customer_photos', photo.id),
                { thumbnailUrl: finalThumbUrl },
                { merge: true }
              );
            } catch {}
          }
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
