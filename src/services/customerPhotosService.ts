import {
  isFirebaseConfigured,
  getFirebaseFirestore,
  getFirebaseStorage,
} from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
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

// Fallback no LocalStorage para navegadores com restrições
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
 * Carrega todas as fotos cadastradas.
 * Se o Firebase estiver ativo, busca do Cloud Firestore.
 * Caso contrário, busca do IndexedDB (com fallback em LocalStorage).
 */
export async function loadCustomerPhotos(onlyPublished = false): Promise<CustomerPhoto[]> {
  // 1. Tentar Firebase Firestore se configurado
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      if (db) {
        const q = query(collection(db, 'customer_photos'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        const cloudPhotos: CustomerPhoto[] = [];
        snap.forEach((d) => {
          cloudPhotos.push(d.data() as CustomerPhoto);
        });

        if (cloudPhotos.length > 0) {
          // Atualiza cache local
          saveToLocalStorage(cloudPhotos);
          return onlyPublished ? cloudPhotos.filter((p) => p.published) : cloudPhotos;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar fotos do Firestore, usando armazenamento local:', err);
    }
  }

  // 2. Carregar do IndexedDB local
  try {
    const db = await openIndexedDB();
    const photos: CustomerPhoto[] = await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const result: CustomerPhoto[] = request.result || [];
        result.sort((a, b) => a.order - b.order);
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });

    if (photos.length > 0) {
      return onlyPublished ? photos.filter((p) => p.published) : photos;
    }
  } catch (e) {
    console.warn('Erro no IndexedDB, buscando do LocalStorage:', e);
  }

  // 3. Fallback no LocalStorage
  const localList = getFromLocalStorage();
  localList.sort((a, b) => a.order - b.order);
  return onlyPublished ? localList.filter((p) => p.published) : localList;
}

/**
 * Salva uma nova fotografia real com seus metadados reais.
 */
export async function createCustomerPhoto(
  data: Omit<CustomerPhoto, 'id' | 'createdAt' | 'order'>
): Promise<CustomerPhoto> {
  const existing = await loadCustomerPhotos(false);
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((p) => p.order)) + 1 : 1;

  const newPhoto: CustomerPhoto = {
    ...data,
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    order: nextOrder,
    createdAt: new Date().toISOString(),
  };

  // Se o Firebase estiver ativo, salvar no Firestore (e Storage se for base64)
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      const storage = getFirebaseStorage();

      let finalImageUrl = newPhoto.imageUrl;

      // Se a imagem for data URL base64, subir para o Firebase Storage
      if (storage && newPhoto.imageUrl.startsWith('data:')) {
        const parts = newPhoto.imageUrl.split(';base64,');
        if (parts.length === 2) {
          const contentType = parts[0].split(':')[1] || 'image/jpeg';
          const raw = window.atob(parts[1]);
          const uInt8Array = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          const blob = new Blob([uInt8Array], { type: contentType });
          const storageRef = ref(storage, `customer_photos/${newPhoto.id}.jpg`);
          await uploadBytes(storageRef, blob, { contentType });
          finalImageUrl = await getDownloadURL(storageRef);
          newPhoto.imageUrl = finalImageUrl;
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
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      if (db) {
        await setDoc(doc(db, 'customer_photos', photo.id), {
          ...photo,
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
      const req = store.put(photo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB update error:', err);
  }

  const existing = getFromLocalStorage();
  const idx = existing.findIndex((p) => p.id === photo.id);
  if (idx >= 0) {
    existing[idx] = photo;
  } else {
    existing.push(photo);
  }
  saveToLocalStorage(existing);

  return photo;
}

/**
 * Exclui uma foto cadastrada.
 */
export async function deleteCustomerPhoto(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
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
          // Ignora se arquivo no storage não existir
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

  // Se Firebase ativo, atualizar cada um
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      if (db) {
        for (const item of updated) {
          await setDoc(doc(db, 'customer_photos', item.id), item, { merge: true });
        }
      }
    } catch (err) {
      console.warn('Firebase reorder error:', err);
    }
  }

  return updated;
}
