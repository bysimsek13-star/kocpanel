/**
 * kayit.js — Kayıt + PayTR ödeme + callback Cloud Functions
 *
 * fiyatSorgula   — indirim kodu + tarih bazlı fiyat hesapla (onCall)
 * kayitBaslat    — onboarding kaydı oluştur + PayTR iFrame token al (onCall)
 * paytrCallback  — PayTR ödeme bildirimi, imza doğrula, abonelik aktiflleştir (onRequest)
 */

const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const crypto  = require('crypto');
const https   = require('https');
const qs      = require('querystring');
const { temizle, emailGecerliMi, normalizeEmail, logYaz } = require('./helpers');

let _db;
function getDb() { if (!_db) _db = getFirestore(); return _db; }

// ── Sabitler ──────────────────────────────────────────────────────────────────
const STANDART_NET     = 6000;
const ERKEN_KAYIT_NET  = 5000;
const VARSAYILAN_KDV   = 20;
const ERKEN_BITIS      = new Date('2026-08-31T23:59:59+03:00');
const PARA_BIRIMI      = 'TL';
const ODEME_BASARILI   = 'https://elsway.com.tr/odeme-basarili';
const ODEME_BASARISIZ  = 'https://elsway.com.tr/kayit?hata=odeme';

// ── Fiyat mantığı (CF kopyası — src/utils/fiyatHesapla.js ile senkron) ───────
function kdvHesapla(net, oran) { return Math.round(net * oran) / 100; }
function erkenKayitAktif() { return new Date() <= ERKEN_BITIS; }

function kodDogrulaSync(kod, email, telefon) {
  if (!kod || kod.status !== 'active') return false;
  if (kod.usedCount >= kod.maxUses) return false;
  if (kod.validUntil) {
    const bitis = kod.validUntil.toDate ? kod.validUntil.toDate() : new Date(kod.validUntil);
    if (bitis < new Date()) return false;
  }
  const emailEslesti = kod.allowedEmail &&
    kod.allowedEmail.trim().toLowerCase() === (email || '').trim().toLowerCase();
  const telEslesti   = kod.allowedPhone &&
    kod.allowedPhone.replace(/\D/g, '') === (telefon || '').replace(/\D/g, '');
  return emailEslesti || telEslesti;
}

function fiyatHesaplaSync(ozelKod, email, telefon) {
  if (ozelKod && kodDogrulaSync(ozelKod, email, telefon)) {
    const kdvOrani  = ozelKod.vatRate ?? VARSAYILAN_KDV;
    const net       = ozelKod.monthlyNetAmount;
    const kdv       = kdvHesapla(net, kdvOrani);
    return { fiyatTuru: 'ozel_kod', netFiyat: net, kdvOrani, kdvTutari: kdv,
             brutFiyat: net + kdv, kuponKodu: ozelKod.code,
             surekliMi: ozelKod.appliesToRecurring ?? false };
  }
  if (erkenKayitAktif()) {
    const kdv = kdvHesapla(ERKEN_KAYIT_NET, VARSAYILAN_KDV);
    return { fiyatTuru: 'erken_kayit', netFiyat: ERKEN_KAYIT_NET,
             kdvOrani: VARSAYILAN_KDV, kdvTutari: kdv, brutFiyat: ERKEN_KAYIT_NET + kdv };
  }
  const kdv = kdvHesapla(STANDART_NET, VARSAYILAN_KDV);
  return { fiyatTuru: 'standart', netFiyat: STANDART_NET,
           kdvOrani: VARSAYILAN_KDV, kdvTutari: kdv, brutFiyat: STANDART_NET + kdv };
}

// ── PayTR yardımcıları ────────────────────────────────────────────────────────
function paytrToken(params, secret) {
  const dizi = Object.values(params).join('') + secret;
  return crypto.createHmac('sha256', secret).update(dizi).digest('base64');
}

function paytrCallbackGecerliMi(body, secret) {
  const { merchant_oid, status, total_amount, hash } = body;
  const beklenen = crypto
    .createHmac('sha256', secret)
    .update(merchant_oid + secret + status + total_amount)
    .digest('base64');
  return hash === beklenen;
}

function paytrIframeTokenAl(params) {
  return new Promise((coz, reddet) => {
    const veri = qs.stringify(params);
    const opts = {
      hostname: 'www.paytr.com',
      path:     '/odeme/api/v1/',
      method:   'POST',
      headers:  { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': veri.length },
    };
    const req = https.request(opts, (res) => {
      let yanit = '';
      res.on('data', d => { yanit += d; });
      res.on('end', () => {
        try {
          const json = JSON.parse(yanit);
          if (json.status === 'success') coz(json.token);
          else reddet(new Error(json.reason || 'PayTR token alınamadı.'));
        } catch { reddet(new Error('PayTR yanıtı parse edilemedi.')); }
      });
    });
    req.on('error', reddet);
    req.write(veri);
    req.end();
  });
}

// ── fiyatSorgula — onCall ────────────────────────────────────────────────────
exports.fiyatSorgula = onCall(async (request) => {
  const { kuponKodu, email, telefon } = request.data || {};
  const emailNorm = normalizeEmail(email || '');
  const telNorm   = (telefon || '').replace(/\D/g, '');

  let ozelKod = null;
  if (kuponKodu) {
    const kod = temizle(kuponKodu, 50).toUpperCase();
    const snap = await getDb().collection('discountCodes').doc(kod).get();
    if (snap.exists) ozelKod = { code: kod, ...snap.data() };
  }

  const fiyat = fiyatHesaplaSync(ozelKod, emailNorm, telNorm);

  if (kuponKodu && !ozelKod) return { ...fiyat, kuponHata: 'Kod bulunamadı.' };
  if (kuponKodu && ozelKod && fiyat.fiyatTuru !== 'ozel_kod')
    return { ...fiyat, kuponHata: 'Bu kod bu e-posta/telefon ile kullanılamaz.' };

  return fiyat;
});

// ── kayitBaslat — onCall ─────────────────────────────────────────────────────
exports.kayitBaslat = onCall(async (request) => {
  const {
    ogrenciIsim, ogrenciTelefon,
    veliIsim, veliEmail, veliTelefon,
    sinif, sinifTuru, alan,
    kuponKodu,
    hizmetSozlesmesi, kvkkOnay, acikRiza,
    userIp,
  } = request.data || {};

  const veliEmailNorm = normalizeEmail(veliEmail || '');
  if (!emailGecerliMi(veliEmailNorm)) throw new HttpsError('invalid-argument', 'Geçerli veli e-postası girin.');
  if (!ogrenciIsim || !veliIsim)     throw new HttpsError('invalid-argument', 'İsim alanları zorunludur.');
  if (!hizmetSozlesmesi || !kvkkOnay || !acikRiza)
    throw new HttpsError('invalid-argument', 'Tüm onay kutularını işaretleyin.');

  const veliTelNorm = (veliTelefon || '').replace(/\D/g, '');

  let ozelKod = null;
  if (kuponKodu) {
    const kod  = temizle(kuponKodu, 50).toUpperCase();
    const snap = await getDb().collection('discountCodes').doc(kod).get();
    if (!snap.exists) throw new HttpsError('not-found', 'Kupon bulunamadı.');
    ozelKod = { code: kod, ...snap.data() };
    if (!kodDogrulaSync(ozelKod, veliEmailNorm, veliTelNorm))
      throw new HttpsError('permission-denied', 'Bu kod bu e-posta/telefon ile kullanılamaz.');
  }

  const fiyat = fiyatHesaplaSync(ozelKod, veliEmailNorm, veliTelNorm);
  const odemeId = `EW-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const basvuru = {
    ogrenciIsim:     temizle(ogrenciIsim, 100),
    ogrenciTelefon:  temizle(ogrenciTelefon || '', 20),
    veliIsim:        temizle(veliIsim, 100),
    veliEmail:       veliEmailNorm,
    veliTelefon:     veliTelNorm,
    sinif:           temizle(sinif || '', 20),
    sinifTuru:       temizle(sinifTuru || '', 20),
    alan:            temizle(alan || '', 20),
    fiyatTuru:       fiyat.fiyatTuru,
    netFiyat:        fiyat.netFiyat,
    kdvOrani:        fiyat.kdvOrani,
    kdvTutari:       fiyat.kdvTutari,
    brutFiyat:       fiyat.brutFiyat,
    kuponKodu:       fiyat.kuponKodu || null,
    odemeSaglayici:  'paytr',
    odemeId,
    durum:           'odeme_bekleniyor',
    kocId:           null,
    hizmetSozlesmesi,
    kvkkOnay,
    acikRiza,
    olusturmaAt:     FieldValue.serverTimestamp(),
    guncellemeAt:    FieldValue.serverTimestamp(),
  };

  await getDb().collection('onboardingApplications').doc(odemeId).set(basvuru);

  const merchantId  = process.env.PAYTR_MERCHANT_ID  || '';
  const merchantKey = process.env.PAYTR_MERCHANT_KEY || '';
  const merchantSalt= process.env.PAYTR_MERCHANT_SALT|| '';

  const sepet = JSON.stringify([[`ElsWay Aylık Koçluk - ${fiyat.fiyatTuru}`, fiyat.brutFiyat * 100, 1]]);

  const params = {
    merchant_id:       merchantId,
    user_ip:           userIp || '127.0.0.1',
    merchant_oid:      odemeId,
    email:             veliEmailNorm,
    payment_amount:    fiyat.brutFiyat * 100,
    currency:          PARA_BIRIMI,
    user_basket:       Buffer.from(sepet).toString('base64'),
    no_installment:    0,
    max_installment:   3,
    user_name:         temizle(veliIsim, 100),
    user_phone:        veliTelNorm,
    merchant_ok_url:   ODEME_BASARILI,
    merchant_fail_url: ODEME_BASARISIZ,
    timeout_limit:     30,
    debug_on:          process.env.PAYTR_TEST_MODE === '1' ? 1 : 0,
    test_mode:         process.env.PAYTR_TEST_MODE === '1' ? 1 : 0,
    lang:              'tr',
  };

  params.paytr_token = paytrToken(params, merchantSalt);
  const iframeToken  = await paytrIframeTokenAl({ ...params, merchant_key: merchantKey });

  return { iframeToken, odemeId, fiyat };
});

// ── paytrCallback — onRequest (PayTR bildirim URL) ────────────────────────────
exports.paytrCallback = onRequest(async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

  const merchantSalt = process.env.PAYTR_MERCHANT_SALT || '';
  const body         = req.body || {};

  if (!paytrCallbackGecerliMi(body, merchantSalt)) {
    res.status(400).send('PAYTR_HASH_FAIL');
    return;
  }

  const { merchant_oid, status, total_amount } = body;
  const ref  = getDb().collection('onboardingApplications').doc(merchant_oid);
  const snap = await ref.get();

  if (!snap.exists) { res.status(200).send('OK'); return; }

  const basvuru = snap.data();

  if (status === 'success') {
    const odemeKayit = {
      odemeId:         merchant_oid,
      tutar:           parseInt(total_amount, 10) / 100,
      saglayici:       'paytr',
      durum:           'basarili',
      olusturmaAt:     FieldValue.serverTimestamp(),
    };
    await getDb().collection('payments').doc(merchant_oid).set(odemeKayit);

    await ref.update({ durum: 'odeme_basarili', guncellemeAt: FieldValue.serverTimestamp() });

    const abonelik = {
      veliEmail:       basvuru.veliEmail,
      ogrenciIsim:     basvuru.ogrenciIsim,
      planId:          'aylik_kocluk',
      discountCode:    basvuru.kuponKodu || null,
      monthlyNetAmount:basvuru.netFiyat,
      vatRate:         basvuru.kdvOrani,
      monthlyGrossAmount: basvuru.brutFiyat,
      provider:        'paytr',
      status:          'koc_bekleniyor',
      startedAt:       FieldValue.serverTimestamp(),
      nextBillingDate: Timestamp.fromDate((() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; })()),
      guncellemeAt:    FieldValue.serverTimestamp(),
    };
    await getDb().collection('subscriptions').doc(merchant_oid).set(abonelik);

    await logYaz({
      kim: 'system', kimIsim: 'PayTR Callback',
      ne: 'ODEME_BASARILI',
      detay: { odemeId: merchant_oid, tutar: odemeKayit.tutar },
    });
  } else {
    await ref.update({ durum: 'odeme_basarisiz', guncellemeAt: FieldValue.serverTimestamp() });
    await getDb().collection('payments').doc(merchant_oid).set({
      odemeId: merchant_oid, saglayici: 'paytr', durum: 'basarisiz',
      olusturmaAt: FieldValue.serverTimestamp(),
    });
  }

  res.status(200).send('OK');
});

// ── basvuruKaydet — Sprint 1B/1C: onboarding kaydı (PayTR henüz yok) ────────
// enforceAppCheck YOK — landing page (elsway.com.tr) App Check token'ı olmadan çağırır
// Yasal saklama: onay kayıtları min. 3 yıl tutulmalı (mesafeli satış).
exports.basvuruKaydet = onCall(async (request) => {
  const { ad, soyad, email, telefon, sinif, kod, veliAd, veliTelefon, onaylar } = request.data || {};

  // Zorunlu onay kontrolü
  if (!onaylar || onaylar.mesafeliSozlesme !== true || onaylar.kvkkAcikRiza !== true) {
    throw new HttpsError('failed-precondition', 'Zorunlu onaylar eksik.');
  }

  const emailNorm = normalizeEmail(email || '');
  if (!emailGecerliMi(emailNorm)) throw new HttpsError('invalid-argument', 'Geçerli e-posta girin.');
  if (!temizle(ad || '', 100))    throw new HttpsError('invalid-argument', 'Ad zorunludur.');
  if (!temizle(soyad || '', 100)) throw new HttpsError('invalid-argument', 'Soyad zorunludur.');

  const telNorm  = (telefon || '').replace(/\D/g, '');
  const kodTemiz = kod ? temizle(String(kod), 50).toUpperCase() : null;

  // IP ve User-Agent al
  const rawReq  = request.rawRequest || {};
  const ipHam   = (rawReq.headers && rawReq.headers['x-forwarded-for']) || rawReq.ip || '';
  const ip      = String(ipHam).split(',')[0].trim();
  const ua      = (rawReq.headers && rawReq.headers['user-agent']) || '';

  let ozelKod = null;
  if (kodTemiz) {
    const snap = await getDb().collection('discountCodes').doc(kodTemiz).get();
    if (snap.exists) ozelKod = { code: kodTemiz, ...snap.data() };
  }

  const fiyat = fiyatHesaplaSync(ozelKod, emailNorm, telNorm);

  await getDb().collection('onboardingApplications').add({
    ad:       temizle(ad, 100),
    soyad:    temizle(soyad, 100),
    email:    emailNorm,
    telefon:  telNorm,
    sinif:    temizle(sinif || '', 20),
    kod:      kodTemiz,
    veliAd:   veliAd ? temizle(veliAd, 100) : null,
    veliTelefon: veliTelefon ? String(veliTelefon).replace(/\D/g, '') : null,
    hesaplananFiyat: {
      net:      fiyat.netFiyat,
      kdvOrani: fiyat.kdvOrani,
      brut:     fiyat.brutFiyat,
      kaynak:   fiyat.fiyatTuru,
    },
    onayLog: {
      ip,
      userAgent:        temizle(String(ua), 500),
      sunucuZamani:     FieldValue.serverTimestamp(),
      surum:            '2026-06',
      mesafeliSozlesme: true,
      kvkkAcikRiza:     true,
      ticariIleti:      onaylar.ticariIleti === true,
    },
    status:    'odeme_bekliyor',
    olusturma: FieldValue.serverTimestamp(),
  });

  return { basarili: true };
});
