import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  browserSessionPersistence,
  inMemoryPersistence,
} from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: 'AIzaSyDeHco3bRefSNYsRh3L490vB_XaZ739HZw',
  authDomain: 'kocpaneli.firebaseapp.com',
  projectId: 'kocpaneli',
  storageBucket: 'kocpaneli.firebasestorage.app',
  messagingSenderId: '12496447602',
  appId: '1:12496447602:web:175349e246c423a7d77aeb',
};

const app = initializeApp(firebaseConfig);

// App Check — reCAPTCHA v3 (prod) / debug token (dev)
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-undef
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'debug'),
    isTokenAutoRefreshEnabled: true,
  });
} else if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  // Production'da VITE_RECAPTCHA_SITE_KEY eksikse App Check devre dışı — kritik yapılandırma hatası
  console.error('[AppCheck] VITE_RECAPTCHA_SITE_KEY eksik — App Check devre dışı!');
}

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: [browserSessionPersistence],
  });
} catch (error) {
  console.warn('Ana auth initializeAuth başarısız, getAuth kullanılacak:', error?.message || error);
  authInstance = getAuth(app);
}

export const auth = authInstance;

let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: memoryLocalCache(),
  });
} catch (error) {
  console.warn(
    'Firestore persistent cache başlatılamadı, standart Firestore kullanılacak:',
    error?.message || error
  );
  dbInstance = getFirestore(app);
}

export const db = dbInstance;

const secondaryApp = initializeApp(firebaseConfig, 'secondary');

let secondaryAuthInstance;
try {
  secondaryAuthInstance = initializeAuth(secondaryApp, {
    persistence: [inMemoryPersistence],
  });
} catch (error) {
  console.warn(
    'Secondary auth initializeAuth başarısız, getAuth kullanılacak:',
    error?.message || error
  );
  secondaryAuthInstance = getAuth(secondaryApp);
}

export const secondaryAuth = secondaryAuthInstance;

export default app;
