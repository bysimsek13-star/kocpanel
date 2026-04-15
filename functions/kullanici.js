/**
 * kullanici.js — Kullanıcı yönetimi Cloud Functions
 * emailKontrol, kullaniciOlustur, kullaniciAktiveEt, kullaniciPasifYap,
 * kullaniciSil, rolDegistir, kocAta, kocSilVeOgrenciTasi,
 * veliOgrenciBagla, sifreSifirlamaGonder, kocSil
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const {
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
  ogrencisiniDogrula,
} = require('./helpers');

const db = getFirestore();
const auth = getAuth();

// ─── Özel yardımcı: veli işle ────────────────────────────────────────────────
async function _veliIsle({ veliEmail, veliSifre, ogrenciUid, ogrenciIsim }) {
  const emailNorm = normalizeEmail(veliEmail);
  let veliUid = null;
  try {
    const mevcut = await auth.getUserByEmail(emailNorm);
    veliUid = mevcut.uid;
    const vSnap = await db.collection('kullanicilar').doc(veliUid).get();
    if (!vSnap.exists) {
      throw new HttpsError('already-exists', 'Veli e-postası Auth içinde var ama kullanıcı kaydı eksik. Önce migrasyon/düzeltme yapın.');
    }
    const veli = vSnap.data();
    if (veli.rol !== 'veli') {
      throw new HttpsError('already-exists', `Bu e-posta "${veli.rol}" rolüyle kayıtlı. Veli olarak bağlanamaz.`);
    }
    await auth.updateUser(veliUid, { disabled: false });
    await db.collection('kullanicilar').doc(veliUid).update({
      aktif: true, ogrenciUid, ogrenciIsim, email: emailNorm, yenidenAktiveTarihi: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      if (!veliSifre || veliSifre.length < 6) {
        throw new HttpsError('invalid-argument', 'Yeni veli için en az 6 karakterli veli şifresi gerekli.');
      }
      const vAuth = await auth.createUser({ email: emailNorm, password: veliSifre });
      veliUid = vAuth.uid;
      await db.collection('kullanicilar').doc(veliUid).set({
        email: emailNorm, rol: 'veli', ogrenciUid, ogrenciIsim,
        aktif: true, olusturma: FieldValue.serverTimestamp(),
      });
    } else {
      throw e;
    }
  }
  if (veliUid) {
    await db.collection('ogrenciler').doc(ogrenciUid).set({ veliUid, veliEmail: emailNorm }, { merge: true });
    await db.collection('kullanicilar').doc(ogrenciUid).set({ veliUid, veliEmail: emailNorm }, { merge: true });
  }
  return veliUid;
}

// ═══════════════════════════════════════════════════════
// 0. emailKontrol
// Frontend eklemeden önce çağırır.
// Döner: { durum: 'yok'|'aktif'|'pasif'|'cakisma'|'orphan', uid?, rol?, aktif?, isim?, kocId? }
// ═══════════════════════════════════════════════════════
exports.emailKontrol = onCall(async (request) => {
  await kocVeyaAdminKontrol(request);
  const { email, beklenenRol } = request.data;
  if (!email) throw new HttpsError('invalid-argument', 'email gerekli.');
  const emailNorm = normalizeEmail(email);

  let authUser = null;
  try {
    authUser = await auth.getUserByEmail(emailNorm);
  } catch (e) {
    if (e.code === 'auth/user-not-found') return { durum: 'yok' };
    throw new HttpsError('internal', e.message);
  }

  const kulSnap = await db.collection('kullanicilar').doc(authUser.uid).get();
  if (!kulSnap.exists) return { durum: 'orphan', uid: authUser.uid };

  const kul = kulSnap.data();
  const aktif = kul.aktif !== false;

  if (beklenenRol && kul.rol !== beklenenRol) {
    return { durum: 'cakisma', uid: authUser.uid, rol: kul.rol, aktif, isim: kul.isim };
  }

  return {
    durum: aktif ? 'aktif' : 'pasif',
    uid: authUser.uid, rol: kul.rol, aktif,
    isim: kul.isim, kocId: kul.kocId || '',
  };
});

// ═══════════════════════════════════════════════════════
// 1. kullaniciOlustur
// Sadece { durum: 'yok' } olan e-postalar için.
// ═══════════════════════════════════════════════════════
exports.kullaniciOlustur = onCall(async (request) => {
  appCheckKontrol(request);
  const arayan = await kocVeyaAdminKontrol(request);

  try {
    await rateLimitKontrol(request.auth.uid, 'kullaniciOlustur', 20, 86400);
  } catch (e) {
    if (e.message === 'RATE_LIMIT_ASILDI')
      throw new HttpsError('resource-exhausted', 'Çok fazla istek. Lütfen bekleyin.');
    throw e;
  }

  const { isim, email, sifre, rol, kocId: kocIdPayload, tur, beklenenSaat, dogumTarihi, veliEmail, veliSifre, yenidenAktiveEt } = request.data;
  const hedefRol = rol || 'ogrenci';

  if (arayan.rol === 'koc' && hedefRol !== 'ogrenci' && hedefRol !== 'veli')
    throw new HttpsError('permission-denied', 'Koç sadece öğrenci veya veli ekleyebilir.');

  // Koç kendi uid'ini kullanır — payload'dan gelen kocId yok sayılır
  const kocId = arayan.rol === 'koc' ? arayan.uid : kocIdPayload;
  if (!isim || !email || !sifre || sifre.length < 6)
    throw new HttpsError('invalid-argument', 'isim, email ve min 6 haneli şifre gerekli.');
  if (!emailGecerliMi(email))
    throw new HttpsError('invalid-argument', 'Geçersiz email formatı.');

  const temizIsim = temizle(isim, 100);
  const emailNorm = email.trim().toLowerCase();

  // ─── E-posta kontrol politikası ───────────────────────
  let mevcutAuthUser = null;
  try {
    mevcutAuthUser = await auth.getUserByEmail(emailNorm);
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw new HttpsError('internal', e.message);
    // user-not-found → yeni hesap akışına devam
  }

  if (mevcutAuthUser) {
    const kulSnap = await db.collection('kullanicilar').doc(mevcutAuthUser.uid).get();
    const kul = kulSnap.exists ? kulSnap.data() : null;

    // Orphan: Auth'ta var, Firestore'da yok
    if (!kul) {
      throw new HttpsError('already-exists',
        'Bu e-posta sisteme kayıtlı fakat Firestore kaydı eksik. Migrasyon scriptiyle düzeltin.');
    }

    // Aktif hesap → kesinlikle yeni hesap açma
    if (kul.aktif !== false) {
      if (kul.rol === hedefRol) {
        throw new HttpsError('already-exists',
          `Bu e-posta aktif bir ${kul.rol} olarak zaten kayıtlı. Tekrar hesap açılamaz.`);
      } else {
        // Rol çakışması
        throw new HttpsError('already-exists',
          `Bu e-posta "${kul.rol}" rolüyle aktif olarak kayıtlı. ` +
          `Yeni kayıt açmak için önce "Kullanıcı Yaşam Döngüsü" ekranından rolü değiştirin.`);
      }
    }

    if (kul.rol !== hedefRol) {
      throw new HttpsError('already-exists',
        `Bu e-posta "${kul.rol}" rolüyle pasif olarak kayıtlı. ` +
        `Yeniden açmak için önce rolünü değiştirmeniz gerekir.`);
    }

    // Pasif hesap → yenidenAktiveEt onayı yoksa bildir
    if (!yenidenAktiveEt) {
      return {
        durum: 'pasif_hesap_mevcut',
        uid: mevcutAuthUser.uid,
        mesaj: `Bu e-postaya ait pasif bir hesap bulundu (${kul.isim || emailNorm}). ` +
               `Eski veriler korunarak yeniden aktive etmek ister misiniz?`,
      };
    }

    // yenidenAktiveEt: true — pasif hesabı aç
    await auth.updateUser(mevcutAuthUser.uid, { disabled: false });

    const kulGnc = {
      aktif: true,
      yenidenAktiveTarihi: FieldValue.serverTimestamp(),
    };
    if (isim) kulGnc.isim = temizIsim;
    if (kocId !== undefined) kulGnc.kocId = kocId;
    if (tur && kul.rol === 'ogrenci') kulGnc.tur = tur;
    await db.collection('kullanicilar').doc(mevcutAuthUser.uid).update(kulGnc);

    if (kul.rol === 'ogrenci') {
      const ogrGnc = { aktif: true };
      if (kocId !== undefined) ogrGnc.kocId = kocId;
      if (tur) ogrGnc.tur = tur;
      if (beklenenSaat) ogrGnc.beklenenSaat = beklenenSaat;
      // ogrenciler dokümanı yoksa oluştur
      const ogrSnap = await db.collection('ogrenciler').doc(mevcutAuthUser.uid).get();
      if (ogrSnap.exists) {
        await db.collection('ogrenciler').doc(mevcutAuthUser.uid).update(ogrGnc);
      } else {
        await db.collection('ogrenciler').doc(mevcutAuthUser.uid).set(
          ogrenciDokuman({ isim: temizIsim || kul.isim, email: emailNorm, tur, beklenenSaat, kocId })
        );
      }
      if (veliEmail) {
        await _veliIsle({ veliEmail, veliSifre, ogrenciUid: mevcutAuthUser.uid, ogrenciIsim: temizIsim || kul.isim || emailNorm });
      }
    }

    await logYaz({
      kim: request.auth.uid, kimIsim: arayan.isim || arayan.email,
      ne: 'kullanici_aktife_al',
      kimi: mevcutAuthUser.uid, kimiIsim: kul.isim || emailNorm,
      detay: { rol: kul.rol, kocId: kocId || '', kaynak: 'kullaniciOlustur_pasif' },
    });

    return { uid: mevcutAuthUser.uid, durum: 'yeniden_aktive_edildi' };
  }

  // ─── Yeni hesap oluştur ──────────────────────────────
  const authUser = await auth.createUser({ email: emailNorm, password: sifre, displayName: temizIsim });
  const uid = authUser.uid;

  const batch = db.batch();
  const kulData = {
    isim: temizIsim, email: emailNorm, rol: hedefRol,
    aktif: true, olusturma: FieldValue.serverTimestamp(),
  };
  if (kocId) kulData.kocId = kocId;
  if (hedefRol === 'ogrenci' && tur) kulData.tur = tur;
  batch.set(db.collection('kullanicilar').doc(uid), kulData);

  if (hedefRol === 'ogrenci') {
    batch.set(db.collection('ogrenciler').doc(uid),
      ogrenciDokuman({ isim: temizIsim, email: emailNorm, tur, beklenenSaat, dogumTarihi, kocId, veliEmail }));
  }
  await batch.commit();

  // Veli
  let veliUid = null;
  if (hedefRol === 'ogrenci' && veliEmail) {
    veliUid = await _veliIsle({ veliEmail, veliSifre, ogrenciUid: uid, ogrenciIsim: temizIsim });
  }

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || arayan.email,
    ne: 'kullanici_olustur', kimi: uid, kimiIsim: temizIsim,
    detay: { rol: hedefRol, email: emailNorm, kocId: kocId || '', veliUid: veliUid || '' },
  });

  return { uid, veliUid, durum: 'olusturuldu' };
});

// ═══════════════════════════════════════════════════════
// 2. kullaniciAktiveEt
// { durum: 'pasif' } olan hesabı yeniden aç.
// ═══════════════════════════════════════════════════════
exports.kullaniciAktiveEt = onCall(async (request) => {
  const arayan = await kocVeyaAdminKontrol(request);
  const { uid, kocId: kocIdPayload, tur, beklenenSaat } = request.data;
  if (!uid) throw new HttpsError('invalid-argument', 'uid gerekli.');

  const kulSnap = await db.collection('kullanicilar').doc(uid).get();
  if (!kulSnap.exists) throw new HttpsError('not-found', 'Kullanıcı bulunamadı.');
  const kul = kulSnap.data();

  if (arayan.rol === 'koc' && kul.rol !== 'ogrenci')
    throw new HttpsError('permission-denied', 'Koç sadece öğrenci aktive edebilir.');

  // Koç: sadece kendi öğrencisini veya atanmamış öğrenciyi aktive edebilir
  if (arayan.rol === 'koc') {
    const mevcutKocId = kul.kocId || '';
    if (mevcutKocId && mevcutKocId !== arayan.uid)
      throw new HttpsError('permission-denied', 'Bu öğrenci size ait değil.');
  }

  // Koç kendi uid'ini kullanır, admin payload'dan alır
  const kocId = arayan.rol === 'koc' ? arayan.uid : kocIdPayload;

  await auth.updateUser(uid, { disabled: false });

  const kulGnc = { aktif: true, yenidenAktiveTarihi: FieldValue.serverTimestamp() };
  if (kocId !== undefined) kulGnc.kocId = kocId;
  await db.collection('kullanicilar').doc(uid).update(kulGnc);

  if (kul.rol === 'ogrenci') {
    const ogrGnc = { aktif: true };
    if (kocId !== undefined) ogrGnc.kocId = kocId;
    if (tur) ogrGnc.tur = tur;
    if (beklenenSaat) ogrGnc.beklenenSaat = beklenenSaat;
    const ogrRef = db.collection('ogrenciler').doc(uid);
    const ogrSnap = await ogrRef.get();
    if (ogrSnap.exists) {
      await ogrRef.update(ogrGnc);
    } else {
      await ogrRef.set(ogrenciDokuman({ isim: kul.isim || '', email: kul.email || '', tur, beklenenSaat, kocId }));
    }
  }

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || arayan.email,
    ne: 'kullanici_aktife_al', kimi: uid, kimiIsim: kul.isim || uid,
    detay: { rol: kul.rol, kocId: kocId || kul.kocId || '' },
  });

  return { aktive: true };
});

// ═══════════════════════════════════════════════════════
// 3. kullaniciPasifYap
// Pasife al + refresh token'ları iptal et (oturumu düşür).
// ═══════════════════════════════════════════════════════
exports.kullaniciPasifYap = onCall(async (request) => {
  const arayan = await adminKontrol(request);
  const { uid } = request.data;
  if (!uid) throw new HttpsError('invalid-argument', 'uid gerekli.');

  const kulSnap = await db.collection('kullanicilar').doc(uid).get();
  if (!kulSnap.exists) throw new HttpsError('not-found', 'Kullanıcı bulunamadı.');
  const kul = kulSnap.data();

  await auth.updateUser(uid, { disabled: true });
  await auth.revokeRefreshTokens(uid);

  await db.collection('kullanicilar').doc(uid).update({
    aktif: false, pasifeTarihi: FieldValue.serverTimestamp(),
  });
  if (kul.rol === 'ogrenci') {
    const ogrRef = db.collection('ogrenciler').doc(uid);
    const ogrSnap = await ogrRef.get();
    if (ogrSnap.exists) await ogrRef.update({ aktif: false });
  }

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || 'Admin',
    ne: 'kullanici_pasife_al', kimi: uid, kimiIsim: kul.isim || uid,
    detay: { rol: kul.rol },
  });

  return { pasife: true };
});

// ═══════════════════════════════════════════════════════
// 4. kullaniciSil  — ANA YÖNTEM DEĞİL
// Sadece boş/hatalı hesaplar. onay:"SIL" zorunlu.
// ═══════════════════════════════════════════════════════
exports.kullaniciSil = onCall(async (request) => {
  const arayan = await adminKontrol(request);

  try {
    await rateLimitKontrol(request.auth.uid, 'kullaniciSil', 10, 86400);
  } catch (e) {
    if (e.message === 'RATE_LIMIT_ASILDI')
      throw new HttpsError('resource-exhausted', 'Çok fazla istek. Lütfen bekleyin.');
    throw e;
  }

  const { uid, onay } = request.data;
  if (!uid) throw new HttpsError('invalid-argument', 'uid gerekli.');
  if (onay !== 'SIL')
    throw new HttpsError('invalid-argument', 'Silmek için onay:"SIL" parametresi gerekli.');

  const kulSnap = await db.collection('kullanicilar').doc(uid).get();
  const kul = kulSnap.exists ? kulSnap.data() : {};
  const rol = kul.rol || 'bilinmiyor';

  const batch = db.batch();
  if (rol === 'ogrenci') {
    for (const kol of ['denemeler', 'program', 'mesajlar', 'calisma', 'notlar', 'hedefler', 'mufredat']) {
      const snap = await db.collection('ogrenciler').doc(uid).collection(kol).get();
      snap.docs.forEach(d => batch.delete(d.ref));
    }
    batch.delete(db.collection('ogrenciler').doc(uid));
  }
  if (rol === 'koc') {
    const ogrSnap = await db.collection('ogrenciler').where('kocId', '==', uid).get();
    ogrSnap.docs.forEach(d => {
      batch.update(d.ref, { kocId: '' });
      batch.update(db.collection('kullanicilar').doc(d.id), { kocId: '' });
    });
  }
  batch.delete(db.collection('kullanicilar').doc(uid));
  await batch.commit();

  try { await auth.deleteUser(uid); }
  catch (e) { console.warn('Auth silme başarısız:', e.message); }

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || 'Admin',
    ne: 'kullanici_sil', kimi: uid, kimiIsim: kul.isim || uid,
    detay: { rol },
  });

  return { silindi: true };
});

// ═══════════════════════════════════════════════════════
// 5. rolDegistir — rol çakışması çözümü
// ═══════════════════════════════════════════════════════
exports.rolDegistir = onCall(async (request) => {
  const arayan = await adminKontrol(request);

  try {
    await rateLimitKontrol(request.auth.uid, 'rolDegistir', 5, 3600);
  } catch (e) {
    if (e.message === 'RATE_LIMIT_ASILDI')
      throw new HttpsError('resource-exhausted', 'Çok fazla istek. Lütfen bekleyin.');
    throw e;
  }

  const { uid, yeniRol } = request.data;
  const izinliRoller = ['admin', 'koc', 'ogrenci', 'veli'];
  if (!uid || !izinliRoller.includes(yeniRol))
    throw new HttpsError('invalid-argument', 'uid ve geçerli rol gerekli.');

  const eskiSnap = await db.collection('kullanicilar').doc(uid).get();
  const eskiRol = eskiSnap.exists ? eskiSnap.data().rol : 'bilinmiyor';
  const eskiIsim = eskiSnap.data()?.isim || uid;

  const batch = db.batch();
  batch.update(db.collection('kullanicilar').doc(uid), { rol: yeniRol });

  if (eskiRol === 'ogrenci' && yeniRol !== 'ogrenci') {
    const oSnap = await db.collection('ogrenciler').doc(uid).get();
    if (oSnap.exists) batch.update(db.collection('ogrenciler').doc(uid), { aktif: false });
  }
  if (yeniRol === 'ogrenci' && eskiRol !== 'ogrenci') {
    const oSnap = await db.collection('ogrenciler').doc(uid).get();
    if (!oSnap.exists) {
      const kd = eskiSnap.data() || {};
      batch.set(db.collection('ogrenciler').doc(uid),
        ogrenciDokuman({ isim: kd.isim || '', email: kd.email || '', kocId: kd.kocId || '' }));
    } else {
      batch.update(db.collection('ogrenciler').doc(uid), { aktif: true });
    }
  }
  await batch.commit();

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || 'Admin',
    ne: 'rol_degistir', kimi: uid, kimiIsim: eskiIsim,
    detay: { eskiRol, yeniRol },
  });

  return { guncellendi: true, eskiRol, yeniRol };
});

// ═══════════════════════════════════════════════════════
// 6. kocAta
// ═══════════════════════════════════════════════════════
exports.kocAta = onCall(async (request) => {
  appCheckKontrol(request);
  const arayan = await adminKontrol(request);

  try {
    await rateLimitKontrol(request.auth.uid, 'kocAta', 10, 3600);
  } catch (e) {
    if (e.message === 'RATE_LIMIT_ASILDI')
      throw new HttpsError('resource-exhausted', 'Çok fazla istek. Lütfen bekleyin.');
    throw e;
  }

  const { ogrenciUid, yeniKocUid } = request.data;
  if (!ogrenciUid) throw new HttpsError('invalid-argument', 'ogrenciUid gerekli.');

  const [ogrSnap, kulSnap] = await Promise.all([
    db.collection('ogrenciler').doc(ogrenciUid).get(),
    db.collection('kullanicilar').doc(ogrenciUid).get(),
  ]);
  if (!ogrSnap.exists || !kulSnap.exists) throw new HttpsError('not-found', 'Öğrenci kaydı bulunamadı.');
  const ogr = ogrSnap.data();

  const eskiKocId = ogr.kocId || '';
  let yeniKocIsim = '';
  if (yeniKocUid) {
    const yeniKocSnap = await db.collection('kullanicilar').doc(yeniKocUid).get();
    if (!yeniKocSnap.exists || yeniKocSnap.data().rol !== 'koc') {
      throw new HttpsError('failed-precondition', 'Seçilen koç kaydı bulunamadı.');
    }
    yeniKocIsim = yeniKocSnap.data().isim || yeniKocSnap.data().email || '';
  }

  const batch = db.batch();
  batch.update(db.collection('ogrenciler').doc(ogrenciUid), { kocId: yeniKocUid || '' });
  batch.update(db.collection('kullanicilar').doc(ogrenciUid), { kocId: yeniKocUid || '' });
  await batch.commit();

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || arayan.email,
    ne: 'koc_ata', kimi: ogrenciUid, kimiIsim: ogr.isim || kulSnap.data().isim || ogrenciUid,
    detay: { eskiKocId, yeniKocUid: yeniKocUid || '', yeniKocIsim },
  });

  return { atandi: true, yeniKocUid: yeniKocUid || '' };
});

// ═══════════════════════════════════════════════════════
// 7. kocSilVeOgrenciTasi
// ═══════════════════════════════════════════════════════
exports.kocSilVeOgrenciTasi = onCall(async (request) => {
  const arayan = await adminKontrol(request);
  const { kocUid, hedefKocUid } = request.data;
  if (!kocUid) throw new HttpsError('invalid-argument', 'kocUid gerekli.');

  const kocSnap = await db.collection('kullanicilar').doc(kocUid).get();
  const kocIsim = kocSnap.data()?.isim || kocUid;
  const ogrSnap = await db.collection('ogrenciler').where('kocId', '==', kocUid).get();
  const yeniKocId = hedefKocUid || '';

  const batch = db.batch();
  ogrSnap.docs.forEach(d => {
    batch.update(d.ref, { kocId: yeniKocId });
    batch.update(db.collection('kullanicilar').doc(d.id), { kocId: yeniKocId });
  });
  batch.delete(db.collection('kullanicilar').doc(kocUid));
  await batch.commit();

  try { await auth.deleteUser(kocUid); }
  catch (e) { console.warn('Koç Auth silme başarısız:', e.message); }

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || 'Admin',
    ne: 'koc_sil', kimi: kocUid, kimiIsim: kocIsim,
    detay: { tasınanOgrenciSayisi: ogrSnap.size, hedefKocUid: hedefKocUid || 'atasız' },
  });

  return { silindi: true, tasınan: ogrSnap.size };
});

// ═══════════════════════════════════════════════════════
// 8. veliOgrenciBagla
// ═══════════════════════════════════════════════════════
exports.veliOgrenciBagla = onCall(async (request) => {
  const arayan = await kocVeyaAdminKontrol(request);
  const { ogrenciUid, veliEmail } = request.data;
  if (!ogrenciUid || !veliEmail)
    throw new HttpsError('invalid-argument', 'ogrenciUid ve veliEmail gerekli.');

  // Koç sadece kendi öğrencisine veli bağlayabilir
  if (arayan.rol === 'koc') await ogrencisiniDogrula(arayan.uid, ogrenciUid);

  const vSnap = await db.collection('kullanicilar')
    .where('email', '==', veliEmail).where('rol', '==', 'veli').limit(1).get();
  if (vSnap.empty) throw new HttpsError('not-found', 'Bu e-postaya ait veli bulunamadı.');

  const veliDoc = vSnap.docs[0];
  const veliUid = veliDoc.id;
  const ogrSnap = await db.collection('ogrenciler').doc(ogrenciUid).get();
  const ogrenciIsim = ogrSnap.data()?.isim || ogrenciUid;

  const batch = db.batch();
  batch.update(db.collection('ogrenciler').doc(ogrenciUid), { veliUid, veliEmail });
  batch.update(db.collection('kullanicilar').doc(ogrenciUid), { veliUid, veliEmail });
  batch.update(veliDoc.ref, { ogrenciUid, ogrenciIsim });
  await batch.commit();

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || arayan.email,
    ne: 'veli_bagla', kimi: ogrenciUid, kimiIsim: ogrenciIsim,
    detay: { veliUid, veliEmail },
  });

  return { veliUid };
});

// ═══════════════════════════════════════════════════════
// 9. sifreSifirlamaGonder
// Admin: reset link üret (mail entegrasyonu için genişletilebilir)
// ═══════════════════════════════════════════════════════
exports.sifreSifirlamaGonder = onCall(async (request) => {
  const arayan = await adminKontrol(request);
  const { email } = request.data;
  if (!email) throw new HttpsError('invalid-argument', 'email gerekli.');

  const link = await auth.generatePasswordResetLink(email);

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || 'Admin',
    ne: 'sifre_sifirlama', kimiIsim: email,
    detay: { email },
  });

  // Not: link'i şimdilik döndür. Gerçek mail için Firebase Extension
  // veya Nodemailer/SendGrid eklenmeli.
  return { link };
});

// ═══════════════════════════════════════════════════════
// kocSil — Admin paneli koç silme
// ═══════════════════════════════════════════════════════
exports.kocSil = onCall(async (request) => {
  const arayan = await adminKontrol(request);
  const { kocUid } = request.data;
  if (!kocUid) throw new HttpsError('invalid-argument', 'kocUid gerekli.');

  const kocSnap = await db.collection('kullanicilar').doc(kocUid).get();
  const kocIsim = kocSnap.data()?.isim || kocUid;
  const ogrSnap = await db.collection('ogrenciler').where('kocId', '==', kocUid).get();

  const batch = db.batch();
  ogrSnap.docs.forEach(d => {
    batch.update(d.ref, { kocId: '' });
    batch.update(db.collection('kullanicilar').doc(d.id), { kocId: '' });
  });
  batch.delete(db.collection('kullanicilar').doc(kocUid));
  await batch.commit();

  try { await auth.deleteUser(kocUid); } catch (e) { console.warn('Koç Auth silme:', e.message); }

  await logYaz({
    kim: request.auth.uid, kimIsim: arayan.isim || 'Admin',
    ne: 'koc_sil', kimi: kocUid, kimiIsim: kocIsim,
    detay: { tasınan: ogrSnap.size },
  });

  return { silindi: true };
});
