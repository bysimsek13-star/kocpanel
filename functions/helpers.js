/**
 * helpers.js — Paylaşılan yardımcı fonksiyonlar
 * index.js initializeApp() çağrısından SONRA require edilmelidir.
 */

const { HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { RISK_DURUM } = require('./sabitler');

// Lazy init — getFirestore() modül yükünde değil, ilk kullanımda çağrılır.
// Böylece test ortamında vi.mock() aktif olduktan sonra çağrılır.
let _db;
function getDb() {
  if (!_db) _db = getFirestore();
  return _db;
}

// ─── Tarih yardımcıları ───────────────────────────────────────────────────────
function dateToStrTR(date) {
  // Intl kullanarak timezone-aware YYYY-MM-DD üret (Türkiye kalıcı UTC+3)
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date).split('.').reverse().join('-');
}
function todayStrTR() {
  return dateToStrTR(new Date());
}
function daysAgoStrTR(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateToStrTR(d);
}

// ─── App Check doğrulaması ───────────────────────────────────────────────────
// Firebase Console'dan App Check enforce edildikten sonra onCall request'inde
// request.app alanı dolu gelir. Enforce edilmemişse undefined — bu kontrol
// yetkisiz istemcileri (bot, scraper) dışarıda tutar.
// Kullanım: appCheckKontrol(request) öğesini onCall handler'ının ilk satırına ekle.
function appCheckKontrol(request) {
  if (request.app === undefined) {
    throw new HttpsError(
      'unauthenticated',
      'App Check doğrulaması başarısız. Geçerli bir uygulama üzerinden erişin.'
    );
  }
}

// ─── Kimlik doğrulama yardımcıları ───────────────────────────────────────────
async function arayaniBul(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Giriş gerekli.');
  const snap = await getDb().collection('kullanicilar').doc(request.auth.uid).get();
  if (!snap.exists) throw new HttpsError('unauthenticated', 'Kullanıcı kaydı bulunamadı.');
  const data = snap.data();
  if (data.aktif === false) throw new HttpsError('permission-denied', 'Pasif kullanıcı işlem yapamaz.');
  return { uid: request.auth.uid, ...data };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function adminKontrol(request) {
  const arayan = await arayaniBul(request);
  if (arayan.rol !== 'admin') throw new HttpsError('permission-denied', 'Admin yetkisi gerekli.');
  return arayan;
}

async function kocVeyaAdminKontrol(request) {
  const arayan = await arayaniBul(request);
  if (arayan.rol !== 'admin' && arayan.rol !== 'koc')
    throw new HttpsError('permission-denied', 'Koç veya Admin yetkisi gerekli.');
  return arayan;
}

async function logYaz({ kim, kimIsim, ne, kimi = '', kimiIsim = '', detay = {} }) {
  await getDb().collection('auditLog').add({
    kim, kimIsim: kimIsim || '', ne, kimi, kimiIsim: kimiIsim || '',
    zaman: FieldValue.serverTimestamp(), detay,
  }).catch(e => console.warn('Log yazılamadı:', e.message));
}

function ogrenciDokuman({ isim, email, tur, beklenenSaat, kocId, veliEmail, veliUid, dogumTarihi }) {
  return {
    isim: isim.trim(), email,
    tur: tur || 'TYT',
    tamamlama: 0,
    beklenenSaat: beklenenSaat || 6,
    kocId: kocId || '',
    veliEmail: veliEmail || '',
    veliUid: veliUid || '',
    dogumTarihi: dogumTarihi || null,
    aktif: true,
    olusturma: FieldValue.serverTimestamp(),
    sonDenemeNet: null, sonDenemeTarih: null,
    haftalikTamamlamaOrani: 0, sonCalismaTarihi: null,
    toplamCalismaGunu: 0, riskDurumu: RISK_DURUM.YOK,
  };
}

// ─── Sahiplik doğrulaması ─────────────────────────────────────────────────────
// Koçun işlem yaptığı öğrencinin gerçekten kendisine ait olduğunu doğrular.
async function ogrencisiniDogrula(kocUid, ogrenciUid) {
  const snap = await getDb().collection('ogrenciler').doc(ogrenciUid).get();
  if (!snap.exists) throw new HttpsError('not-found', 'Öğrenci bulunamadı.');
  if (snap.data().kocId !== kocUid)
    throw new HttpsError('permission-denied', 'Bu öğrenci size ait değil.');
  return snap.data();
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const RATE_LIMIT_KOLEKSIYON = 'rateLimits';

async function rateLimitKontrol(uid, aksiyon, maxIstek = 10, pencereSaniye = 60) {
  const simdi = Date.now();
  const pencereBaslangic = simdi - pencereSaniye * 1000;
  const key = `${uid}_${aksiyon}`;
  const ref = getDb().collection(RATE_LIMIT_KOLEKSIYON).doc(key);

  return getDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const veri = snap.exists ? snap.data() : { istekler: [] };

    const aktifIstekler = (veri.istekler || []).filter((t) => t > pencereBaslangic);

    if (aktifIstekler.length >= maxIstek) {
      throw new Error('RATE_LIMIT_ASILDI');
    }

    aktifIstekler.push(simdi);
    tx.set(ref, { istekler: aktifIstekler, sonGuncelleme: simdi });
  });
}

// ─── Input Sanitizasyon ───────────────────────────────────────────────────────
function temizle(deger, maxUzunluk = 500) {
  if (deger === null || deger === undefined) return '';
  return String(deger).trim().slice(0, maxUzunluk).replace(/[<>]/g, '');
}

function emailGecerliMi(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function telefonNormalize(tel) {
  if (!tel) return '';
  return String(tel).replace(/\D/g, '').slice(-10);
}

module.exports = {
  getDb,
  dateToStrTR,
  todayStrTR,
  daysAgoStrTR,
  arayaniBul,
  normalizeEmail,
  adminKontrol,
  kocVeyaAdminKontrol,
  appCheckKontrol,
  logYaz,
  ogrenciDokuman,
  rateLimitKontrol,
  temizle,
  emailGecerliMi,
  telefonNormalize,
  ogrencisiniDogrula,
};
