import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Configuração do Firebase para Frontend Estático (GitHub Pages / Domínio Próprio)
 * 
 * As credenciais públicas do Firebase Web SDK são seguras para serem injetadas
 * em tempo de build (via variáveis Vite VITE_FIREBASE_*). A proteção real dos dados
 * e das artes é garantida pelas Regras de Segurança (Firestore Rules e Storage Rules),
 * nunca expondo chaves privadas ou credenciais administrativas no bundle estático.
 */
export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const getFirebaseConfig = (): FirebaseClientConfig => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
};

/**
 * Verifica se o projeto Firebase foi configurado com os parâmetros essenciais
 * necessários para persistência no Firestore e Storage.
 */
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey &&
    config.projectId &&
    config.storageBucket &&
    !config.apiKey.includes('YOUR_') &&
    !config.projectId.includes('YOUR_')
  );
};

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedStorage: FirebaseStorage | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) return null;
  if (cachedApp) return cachedApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = existingApps[0];
  } else {
    cachedApp = initializeApp(getFirebaseConfig());
  }
  return cachedApp;
};

export const getFirebaseFirestore = (): Firestore | null => {
  if (cachedDb) return cachedDb;
  const app = getFirebaseApp();
  if (!app) return null;
  cachedDb = getFirestore(app);
  return cachedDb;
};

export const getFirebaseStorage = (): FirebaseStorage | null => {
  if (cachedStorage) return cachedStorage;
  const app = getFirebaseApp();
  if (!app) return null;
  cachedStorage = getStorage(app);
  return cachedStorage;
};
