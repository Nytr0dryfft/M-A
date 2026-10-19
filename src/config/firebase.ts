import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, signInAnonymously, type Auth, type User } from 'firebase/auth';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check';

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
  measurementId?: string;
}

/**
 * Credenciais do Projeto Firebase do Ateliê M&A (meaatelie-5b767)
 */
export const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: '',
  authDomain: 'meaatelie-5b767.firebaseapp.com',
  projectId: 'meaatelie-5b767',
  storageBucket: 'meaatelie-5b767.firebasestorage.app',
  messagingSenderId: '59735300037',
  appId: '1:59735300037:web:b034bc76323c6d06ba1dac',
  measurementId: 'G-NM507JK3NL',
};

export const getFirebaseConfig = (): FirebaseClientConfig => {
  const env =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env
      : ({} as Record<string, string>);

  let localConfig: FirebaseClientConfig = {};
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('atelier_firebase_config');
      if (stored) {
        localConfig = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }

  return {
    apiKey:
      localConfig.apiKey ||
      env.VITE_FIREBASE_API_KEY ||
      DEFAULT_FIREBASE_CONFIG.apiKey ||
      '',
    authDomain:
      localConfig.authDomain ||
      env.VITE_FIREBASE_AUTH_DOMAIN ||
      DEFAULT_FIREBASE_CONFIG.authDomain ||
      '',
    projectId:
      localConfig.projectId ||
      env.VITE_FIREBASE_PROJECT_ID ||
      DEFAULT_FIREBASE_CONFIG.projectId ||
      '',
    storageBucket:
      localConfig.storageBucket ||
      env.VITE_FIREBASE_STORAGE_BUCKET ||
      DEFAULT_FIREBASE_CONFIG.storageBucket ||
      '',
    messagingSenderId:
      localConfig.messagingSenderId ||
      env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      DEFAULT_FIREBASE_CONFIG.messagingSenderId ||
      '',
    appId:
      localConfig.appId ||
      env.VITE_FIREBASE_APP_ID ||
      DEFAULT_FIREBASE_CONFIG.appId ||
      '',
    measurementId:
      localConfig.measurementId ||
      env.VITE_FIREBASE_MEASUREMENT_ID ||
      DEFAULT_FIREBASE_CONFIG.measurementId ||
      '',
  };
};

export const setLocalFirebaseConfig = (config: FirebaseClientConfig | null): void => {
  if (typeof window === 'undefined') return;
  if (!config) {
    localStorage.removeItem('atelier_firebase_config');
  } else {
    localStorage.setItem('atelier_firebase_config', JSON.stringify(config));
  }
  cachedApp = null;
  cachedDb = null;
  cachedStorage = null;
};

/**
 * Verifica se o projeto Firebase foi configurado com os parâmetros essenciais
 * necessários para persistência no Firestore e Storage.
 */
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(
    config.projectId &&
    config.storageBucket &&
    !config.projectId.includes('YOUR_')
  );
};

export const hasFirebaseApiKey = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && !config.apiKey.includes('YOUR_'));
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
    const config = getFirebaseConfig();
    const appConfig: Record<string, any> = {
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    };
    if (config.apiKey) {
      appConfig.apiKey = config.apiKey;
    }
    if (config.measurementId) {
      appConfig.measurementId = config.measurementId;
    }
    cachedApp = initializeApp(appConfig);
  }
  return cachedApp;
};

export const getFirebaseFirestore = (): Firestore | null => {
  if (cachedDb) return cachedDb;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    cachedDb = getFirestore(app);
  } catch (e) {
    console.warn('Firestore initialization notice:', e);
  }
  return cachedDb;
};

export const getFirebaseStorage = (): FirebaseStorage | null => {
  if (cachedStorage) return cachedStorage;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    cachedStorage = getStorage(app);
  } catch (e) {
    console.warn('Firebase Storage initialization notice:', e);
  }
  return cachedStorage;
};

let cachedAuth: Auth | null = null;

export const getFirebaseAuth = (): Auth | null => {
  if (cachedAuth) return cachedAuth;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    cachedAuth = getAuth(app);
  } catch (e) {
    console.warn('Firebase Auth initialization notice:', e);
  }
  return cachedAuth;
};

let cachedAppCheck: AppCheck | null = null;

/**
 * Inicialização segura do Firebase App Check
 * Suporta reCAPTCHA v3 e tokens de depuração em desenvolvimento
 */
export const getFirebaseAppCheck = (): AppCheck | null => {
  if (cachedAppCheck) return cachedAppCheck;
  const app = getFirebaseApp();
  if (!app || typeof window === 'undefined') return null;

  const env =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env
      : ({} as Record<string, string>);

  const siteKey =
    env.VITE_FIREBASE_APPCHECK_KEY ||
    env.VITE_RECAPTCHA_SITE_KEY ||
    '';

  if (!siteKey) {
    // Se a chave ainda não foi informada nas variáveis de ambiente,
    // o App Check permanece inativo sem bloquear as operações do configurador
    return null;
  }

  try {
    cachedAppCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn('App Check initialization notice:', e);
  }

  return cachedAppCheck;
};

/**
 * Garante que o cliente web possua uma sessão anônima autenticada no Firebase
 * antes de realizar operações de upload no Storage ou gravação no Firestore.
 * Inclui timeout estrito de 5 segundos para nunca travar a interface do cliente.
 */
export const ensureAuthenticatedUser = async (): Promise<User | null> => {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  if (auth.currentUser) {
    return auth.currentUser;
  }

  // Auth requer apiKey configurada para se comunicar com o Identity Toolkit
  if (!hasFirebaseApiKey()) {
    return null;
  }

  try {
    const authPromise = signInAnonymously(auth);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Auth timeout (5s)')), 5000)
    );

    const cred = await Promise.race([authPromise, timeoutPromise]);
    return cred.user;
  } catch (err: any) {
    console.warn('Aviso de autenticação anônima do Firebase:', err?.message || err);
    return null;
  }
};

