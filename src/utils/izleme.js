import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Aktif kullanıcı referansı (AuthContext tarafından set edilir) ─────────────
let _currentUser = null;
export function setIzlemeUser(user) {
  _currentUser = user;
}
export function getIzlemeUser() {
  return _currentUser;
}

function normalizeText(value, max = 1200) {
  if (value == null) return '';
  return String(value).slice(0, max);
}

function currentPath() {
  try {
    return window.location.pathname + window.location.search;
  } catch {
    return '';
  }
}

function currentUserAgent() {
  try {
    return navigator.userAgent;
  } catch {
    return '';
  }
}

export async function logIstemciHatasi({
  error,
  info = '',
  kaynak = 'react',
  user = null,
  ekstra = {},
}) {
  try {
    const u = user || _currentUser;
    if (!u?.uid) return;
    await addDoc(collection(db, 'istemciHataKayitlari'), {
      uid: u.uid,
      email: u.email || '',
      rol: u.rol || '',
      kaynak,
      mesaj: normalizeText(error?.message || error || 'Bilinmeyen istemci hatası', 500),
      stack: normalizeText(error?.stack || '', 4000),
      info: normalizeText(info, 2500),
      path: currentPath(),
      userAgent: normalizeText(currentUserAgent(), 500),
      ekstra,
      olusturma: serverTimestamp(),
    });
  } catch (e) {
    console.warn('İstemci hatası loglanamadı:', e?.message || e);
  }
}

export async function logPerformansMetriği(metric, user = null) {
  try {
    const u = user || _currentUser;
    const sample = 1.0;
    if (Math.random() > sample) return;
    await addDoc(collection(db, 'istemciPerformans'), {
      uid: u?.uid || '',
      email: u?.email || '',
      rol: u?.rol || '',
      isim: metric?.name || '',
      deger: typeof metric?.value === 'number' ? Number(metric.value) : null,
      rating: metric?.rating || '',
      delta: typeof metric?.delta === 'number' ? Number(metric.delta) : null,
      id: metric?.id || '',
      path: currentPath(),
      userAgent: normalizeText(currentUserAgent(), 500),
      olusturma: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Performans metriği loglanamadı:', e?.message || e);
  }
}

// ─── Global hata dinleyicileri (index.js'de bir kez kurulur) ──────────────────
export function globalHataDinleyicileriniKur() {
  window.addEventListener('error', event => {
    logIstemciHatasi({
      error: { message: event.message, stack: event.error?.stack || '' },
      kaynak: 'window.onerror',
      ekstra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  window.addEventListener('unhandledrejection', event => {
    const err = event.reason;
    logIstemciHatasi({
      error: { message: err?.message || String(err), stack: err?.stack || '' },
      kaynak: 'unhandledrejection',
    });
  });
}
