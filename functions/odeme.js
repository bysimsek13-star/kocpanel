/**
 * odeme.js — İyzico ödeme entegrasyonu + kupon Cloud Functions
 * odemeBashalt  — checkout formu oluştur (onCall)
 * odemeDogrula  — iyzico callback, aboneliği aktifleştir (onRequest)
 * kuponDogrula  — kupon geçerlilik kontrolü (onCall)
 * aylikOdemeAl  — kayıtlı kartla aylık otomatik çekim (onSchedule)
 */

const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const Iyzipay = require('iyzipay');
const { temizle, emailGecerliMi, normalizeEmail, logYaz } = require('./helpers');
const { fiyatHesapla } = require('./fiyatUtils');

let _db;
function getDb() {
  if (!_db) _db = getFirestore();
  return _db;
}

let _iyzipay;
function getIyzipay() {
  if (!_iyzipay) {
    _iyzipay = new Iyzipay({
      apiKey:    process.env.IYZIPAY_API_KEY    || 'sandbox-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      secretKey: process.env.IYZIPAY_SECRET_KEY || 'sandbox-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      uri:       process.env.IYZIPAY_URI        || 'https://sandbox-api.iyzipay.com',
    });
  }
  return _iyzipay;
}

const PLAN_TUTAR    = '6000.00';
const PLAN_ID       = 'aylik_kocluk';
const PLAN_AD       = 'Aylık Koçluk Paketi';
const DOGRULAMA_URL = 'https://europe-west1-kocpaneli.cloudfunctions.net/odemeDogrula';
const BASARILI_URL  = 'https://elsway.com.tr/odeme-basarili';
const HATA_URL      = 'https://elsway.com.tr/odeme';

// Iyzipay callback'ini Promise'e dönüştür
function iyzipayPromisi(nesne, metot, istek) {
  return new Promise((coz, reddet) => {
    nesne[metot](istek, (hata, sonuc) => {
      if (hata) return reddet(hata);
      if (sonuc.status !== 'success') {
        return reddet(new Error(sonuc.errorMessage || `Iyzico: ${sonuc.errorCode}`));
      }
      coz(sonuc);
    });
  });
}

// iyzico Buyer nesnesi oluştur
function aliciOlustur(veli) {
  const isim    = veli.isim || 'Veli';
  const parcalar = isim.trim().split(' ');
  return {
    id:                   veli.uid,
    name:                 parcalar[0],
    surname:              parcalar.slice(1).join(' ') || 'Kullanıcı',
    gsmNumber:            veli.telefon || '+905000000000',
    email:                veli.email   || '',
    identityNumber:       '11111111111',
    registrationAddress:  'Türkiye',
    ip:                   '85.34.78.112',
    city:                 'Istanbul',
    country:              'Turkey',
    zipCode:              '34000',
  };
}

function adresOlustur(isim) {
  return {
    contactName: isim || 'Veli',
    city:        'Istanbul',
    country:     'Turkey',
    address:     'Türkiye',
    zipCode:     '34000',
  };
}

const SEPET_KALEMI = {
  id:        PLAN_ID,
  name:      PLAN_AD,
  category1: 'Eğitim',
  itemType:  Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
  price:     PLAN_TUTAR,
};

async function veliByEmail(email) {
  const snap = await getDb()
    .collection('kullanicilar')
    .where('email', '==', email)
    .where('rol', '==', 'veli')
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, ...doc.data() };
}

function aylikYenilemeTarihi() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

// ── Checkout formu başlat ─────────────────────────────────────────────────────
exports.odemeBashalt = onCall(async (request) => {
  const { email, kuponKodu } = request.data || {};
  const emailNorm = normalizeEmail(email);
  if (!emailGecerliMi(emailNorm)) throw new HttpsError('invalid-argument', 'Geçerli e-posta girin.');

  const veli = await veliByEmail(emailNorm);
  if (!veli) throw new HttpsError('not-found', 'Bu e-posta ile kayıtlı hesap bulunamadı.');

  let tutar        = PLAN_TUTAR;
  let indirimYuzde = 0;

  if (kuponKodu) {
    const kod = temizle(kuponKodu, 50).toUpperCase();
    indirimYuzde = await getDb().runTransaction(async (tx) => {
      const ref  = getDb().collection('kuponlar').doc(kod);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new HttpsError('not-found', 'Kupon bulunamadı.');
      const k = snap.data();
      if (k.kullanilanSayisi >= k.kullanimLimiti)
        throw new HttpsError('resource-exhausted', 'Kupon limiti dolmuş.');
      if (k.sonGecerlilik && k.sonGecerlilik.toDate() < new Date())
        throw new HttpsError('failed-precondition', 'Kupon süresi dolmuş.');
      tx.update(ref, { kullanilanSayisi: FieldValue.increment(1) });
      return k.indirimYuzde;
    });
    const indirim = (parseFloat(PLAN_TUTAR) * indirimYuzde) / 100;
    tutar = Math.max(0, parseFloat(PLAN_TUTAR) - indirim).toFixed(2);
  }

  const sonuc = await iyzipayPromisi(getIyzipay().checkoutFormInitialize, 'create', {
    locale:              Iyzipay.LOCALE.TR,
    conversationId:      veli.uid,
    price:               PLAN_TUTAR,
    paidPrice:           tutar,
    currency:            Iyzipay.CURRENCY.TRY,
    basketId:            PLAN_ID,
    paymentGroup:        Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    enabledInstallments: [1, 2, 3, 6],
    callbackUrl:         DOGRULAMA_URL,
    buyer:               aliciOlustur(veli),
    shippingAddress:     adresOlustur(veli.isim),
    billingAddress:      adresOlustur(veli.isim),
    basketItems:         [SEPET_KALEMI],
  });

  return {
    checkoutFormContent: sonuc.checkoutFormContent,
    token:               sonuc.token,
    toplamTutar:         tutar,
    indirimYuzde,
  };
});

// ── İyzico callbackUrl — ödemeyi doğrula, aboneliği aktifleştir ──────────────
exports.odemeDogrula = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.redirect(303, HATA_URL + '?hata=1');
    return;
  }
  const token = req.body?.token || req.query?.token;
  if (!token) {
    res.redirect(303, HATA_URL + '?hata=1');
    return;
  }

  try {
    const sonuc = await iyzipayPromisi(getIyzipay().checkoutFormRetrieve, 'retrieve', {
      locale: Iyzipay.LOCALE.TR,
      token,
    });

    if (sonuc.paymentStatus !== 'SUCCESS') {
      res.redirect(303, HATA_URL + '?hata=1');
      return;
    }

    const uid = sonuc.conversationId;
    await getDb().collection('abonelikler').doc(uid).set({
      durum:        'aktif',
      planId:       PLAN_ID,
      sonrakiOdeme: Timestamp.fromDate(aylikYenilemeTarihi()),
      odemeId:      sonuc.paymentId,
      kartUserKey:  sonuc.cardUserKey || null,
      kartToken:    sonuc.cardToken   || null,
      guncelleme:   FieldValue.serverTimestamp(),
      olusturma:    FieldValue.serverTimestamp(),
    }, { merge: true });

    await logYaz({
      kim:     uid,
      kimIsim: '',
      ne:      'ABONELIK_AKTIVASYON',
      detay:   { planId: PLAN_ID, odemeId: sonuc.paymentId },
    });

    res.redirect(303, BASARILI_URL);
  } catch (err) {
    console.error('[odemeDogrula]', err.message);
    res.redirect(303, HATA_URL + '?hata=1');
  }
});

// ── Kupon geçerlilik kontrolü (race condition koruması olmadan — sadece önizleme) ──
exports.kuponDogrula = onCall(async (request) => {
  const { kuponKodu } = request.data || {};
  if (!kuponKodu) throw new HttpsError('invalid-argument', 'Kupon kodu gerekli.');
  const kod  = temizle(kuponKodu, 50).toUpperCase();
  const snap = await getDb().collection('kuponlar').doc(kod).get();
  if (!snap.exists) return { gecerli: false, mesaj: 'Kupon bulunamadı.' };
  const k = snap.data();
  if (k.kullanilanSayisi >= k.kullanimLimiti) return { gecerli: false, mesaj: 'Kupon limiti dolmuş.' };
  if (k.sonGecerlilik && k.sonGecerlilik.toDate() < new Date()) return { gecerli: false, mesaj: 'Kupon süresi dolmuş.' };
  return { gecerli: true, indirimYuzde: k.indirimYuzde, mesaj: `%${k.indirimYuzde} indirim uygulandı.` };
});

// ── Aylık otomatik ödeme — kayıtlı kartla çekim (her ayın 1'i, 09:00 İstanbul) ──
exports.aylikOdemeAl = onSchedule(
  { schedule: '0 9 1 * *', timeZone: 'Europe/Istanbul' },
  async () => {
    const snap = await getDb()
      .collection('abonelikler')
      .where('durum', '==', 'aktif')
      .where('sonrakiOdeme', '<=', Timestamp.fromDate(new Date()))
      .get();
    if (snap.empty) return;

    await Promise.allSettled(snap.docs.map(async (doc) => {
      const ab  = { uid: doc.id, ...doc.data() };
      const ref = getDb().collection('abonelikler').doc(ab.uid);

      if (!ab.kartUserKey || !ab.kartToken) {
        await ref.update({ durum: 'odeme_basarisiz', guncelleme: FieldValue.serverTimestamp() });
        return;
      }

      const veliSnap = await getDb().collection('kullanicilar').doc(ab.uid).get();
      const veliVeri = veliSnap.exists ? { uid: ab.uid, ...veliSnap.data() } : { uid: ab.uid };

      try {
        await iyzipayPromisi(getIyzipay().payment, 'create', {
          locale:         Iyzipay.LOCALE.TR,
          conversationId: ab.uid,
          price:          PLAN_TUTAR,
          paidPrice:      PLAN_TUTAR,
          currency:       Iyzipay.CURRENCY.TRY,
          installment:    1,
          basketId:       PLAN_ID,
          paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
          paymentGroup:   Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
          paymentCard:    { cardUserKey: ab.kartUserKey, cardToken: ab.kartToken },
          buyer:           aliciOlustur(veliVeri),
          shippingAddress: adresOlustur(veliVeri.isim),
          billingAddress:  adresOlustur(veliVeri.isim),
          basketItems:     [SEPET_KALEMI],
        });
        await ref.update({
          sonrakiOdeme: Timestamp.fromDate(aylikYenilemeTarihi()),
          guncelleme:   FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error(`[aylikOdemeAl] uid=${ab.uid}:`, err.message);
        await ref.update({ durum: 'odeme_basarisiz', guncelleme: FieldValue.serverTimestamp() });
      }
    }));
  },
);

// ── Fiyat hesaplama — frontend buradan fiyat alır (discountCode gizli kalır) ──
exports.fiyatHesaplaCF = onCall(async (request) => {
  const { email = '', telefon = '', kod } = request.data || {};

  let kodDoc = null;
  if (kod) {
    const kodTemiz = temizle(String(kod), 50).toUpperCase();
    const snap = await getDb().collection('discountCodes').doc(kodTemiz).get();
    if (snap.exists) kodDoc = snap.data();
  }

  const emailNorm   = normalizeEmail(email);
  const telefonNorm = String(telefon).replace(/\D/g, '');
  const sonuc       = fiyatHesapla({ kodDoc, email: emailNorm, telefon: telefonNorm });

  return {
    kaynak:    sonuc.kaynak,
    net:       sonuc.net,
    kdvOrani:  sonuc.kdvOrani,
    kdvTutari: sonuc.kdvTutari,
    brut:      sonuc.brut,
    kodGecerli: sonuc.kodGecerli,
    kodSebep:  sonuc.kodSebep,
  };
});
