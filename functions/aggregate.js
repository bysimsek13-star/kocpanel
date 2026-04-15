/**
 * aggregate.js — Firestore trigger aggregate fonksiyonları
 * denemeAggregateGuncelle, denemeKonuTakipYaz,
 * calismaAggregateGuncelle, rutinAggregateGuncelle,
 * gunlukSoruAggregateGuncelle
 */

const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { todayStrTR } = require('./helpers');

const db = getFirestore();

// ─── Özel yardımcı: müfredat anahtarlarını belirle ───────────────────────────
// (ogrenciBaglam.js ile senkronize tutulmalı)
function _mufredatAnahtarlariniBelirle(tur, sinif) {
  const t = (tur || '').toLowerCase();
  const s = Number(sinif) || 0;
  if (t.includes('lgs') || s === 8) return ['lgs'];
  if (t.startsWith('sayisal')) return ['tyt', 'ayt_sayisal'];
  if (t.startsWith('ea'))      return ['tyt', 'ayt_ea'];
  if (t.startsWith('sozel'))   return ['tyt', 'ayt_sozel'];
  if (t.startsWith('dil'))     return ['tyt', 'ayt_dil'];
  return ['tyt'];
}

// ═══════════════════════════════════════════════════════
// TRIGGER — Deneme aggregate
// ═══════════════════════════════════════════════════════
exports.denemeAggregateGuncelle = onDocumentWritten(
  'ogrenciler/{ogrenciId}/denemeler/{denemeId}',
  async (event) => {
    const ogrenciId = event.params.ogrenciId;
    const yeni = event.data?.after?.data();
    if (!yeni) return; // silindi — aggregate sıfırlama gerekmez (son deneme geçerli kalır)
    try {
      await db.collection('ogrenciler').doc(ogrenciId).update({
        sonDenemeNet: parseFloat(yeni.toplamNet) || 0,
        sonDenemeTarih: yeni.tarih || null,
      });
    } catch (e) { console.error('Deneme aggregate:', e.message); }
  }
);

// ═══════════════════════════════════════════════════════
// TRIGGER — Deneme → Konu Takip (Gün 7)
// Deneme kaydedilince yanlısKonular+boşKonular → konu_takip'e yazar
// ═══════════════════════════════════════════════════════
exports.denemeKonuTakipYaz = onDocumentWritten(
  'ogrenciler/{ogrenciId}/denemeler/{denemeId}',
  async (event) => {
    const ogrenciId = event.params.ogrenciId;
    const yeni = event.data?.after?.data();
    if (!yeni) return; // silindi, atla

    // Öğrencinin tur/sinif alanlarını çek
    let ogrData;
    try {
      const ogrSnap = await db.collection('ogrenciler').doc(ogrenciId).get();
      ogrData = ogrSnap.data() || {};
    } catch (e) {
      console.error('denemeKonuTakipYaz: öğrenci alınamadı', e.message);
      return;
    }

    const tur   = ogrData.tur   || '';
    const sinif = ogrData.sinif || 0;
    const anahtarlar = _mufredatAnahtarlariniBelirle(tur, sinif);

    // Müfredat konularını paralel çek ve konuAdi → docId haritası kur
    const konuHaritasi = {}; // normalize(konuAdi) → konuDocId
    const snaplar = await Promise.allSettled(
      anahtarlar.map(a => db.collection('mufredat').doc(a).collection('konular').get())
    );
    snaplar.forEach((sonuc, i) => {
      if (sonuc.status === 'rejected') {
        console.warn('denemeKonuTakipYaz: müfredat alınamadı', anahtarlar[i], sonuc.reason?.message);
        return;
      }
      sonuc.value.docs.forEach(d => {
        const konuAdi = (d.data().konu || '').trim().toLowerCase();
        if (konuAdi) konuHaritasi[konuAdi] = d.id;
      });
    });

    if (Object.keys(konuHaritasi).length === 0) return; // müfredat yoksa atla

    // Her ders için yanlisKonular + bosKonular'ı konu_takip'e yaz
    const netler = yeni.netler || {};
    const denemeTarih = yeni.tarih || null;
    const batch = db.batch();
    let yazilan = 0;

    for (const [, dersNetler] of Object.entries(netler)) {
      const yanlislar = dersNetler.yanlisKonular || [];
      const boslar    = dersNetler.bosKonular    || [];
      const zayiflar  = [...new Set([...yanlislar, ...boslar])];

      for (const konuAdi of zayiflar) {
        const normalized = konuAdi.trim().toLowerCase();
        const konuDocId  = konuHaritasi[normalized];
        if (!konuDocId) continue; // eşleşme yoksa atla

        const ref = db
          .collection('ogrenciler').doc(ogrenciId)
          .collection('konu_takip').doc(konuDocId);

        batch.set(ref, {
          durum:             'eksik',
          kaynak:            'deneme',
          manuelMi:          false,
          sonGuncellemeTipi: 'deneme_otomatik',
          sonDenemeTarihi:   denemeTarih,
          riskSeviyesi:      'orta',
          not:               null,
          guncelleme:        FieldValue.serverTimestamp(),
        }, { merge: true });
        yazilan++;
      }
    }

    try {
      if (yazilan > 0) await batch.commit();
      console.log(`denemeKonuTakipYaz: ${yazilan} konu → konu_takip (${ogrenciId})`);
    } catch (e) {
      console.error('denemeKonuTakipYaz: batch commit hatası', e.message);
    }
  }
);

// ═══════════════════════════════════════════════════════
// TRIGGER — Çalışma aggregate
// ═══════════════════════════════════════════════════════
exports.calismaAggregateGuncelle = onDocumentWritten(
  'ogrenciler/{ogrenciId}/calisma/{gun}',
  async (event) => {
    const ogrenciId = event.params.ogrenciId;
    const gun = event.params.gun;
    try {
      const ogrRef = db.collection('ogrenciler').doc(ogrenciId);
      const yeniVeri = event.data?.after?.data();
      const eskiVeri = event.data?.before?.data();

      // Silinme durumu — race condition yok, atomik azaltma
      if (!yeniVeri && eskiVeri) {
        await ogrRef.update({ toplamCalismaGunu: FieldValue.increment(-1) });
        return;
      }

      // Ekleme veya güncelleme — transaction ile race condition önlenir
      const artis = eskiVeri ? 0 : 1;
      const yeniTarih = yeniVeri?.tarih || gun;
      const bugunStr = todayStrTR();

      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ogrRef);
        const mevcut = snap.data() || {};
        const sonTarih = mevcut.sonCalismaTarihi;
        tx.update(ogrRef, {
          toplamCalismaGunu: FieldValue.increment(artis),
          sonCalismaTarihi: !sonTarih || yeniTarih > sonTarih ? yeniTarih : sonTarih,
          ...(yeniTarih === bugunStr ? { bugunCalismaSaat: yeniVeri?.saat || 0 } : {}),
        });
      });
    } catch (e) { console.error('Çalışma aggregate:', e.message); }
  }
);

// ═══════════════════════════════════════════════════════
// TRIGGER — Rutin aggregate (Faz 10)
// ogrenciler/{id}/rutin/{tarih} yazıldığında root doc'a bugunRutinTarihi yazar
// ═══════════════════════════════════════════════════════
exports.rutinAggregateGuncelle = onDocumentWritten(
  'ogrenciler/{ogrenciId}/rutin/{tarih}',
  async (event) => {
    const { ogrenciId, tarih } = event.params;
    const yeni = event.data?.after?.data();
    try {
      // Silindi → yanlış pozitif önlemek için bugunRutinTarihi sıfırla
      if (!yeni) {
        await db.collection('ogrenciler').doc(ogrenciId).update({ bugunRutinTarihi: null });
        return;
      }
      await db.collection('ogrenciler').doc(ogrenciId).update({ bugunRutinTarihi: tarih });
    } catch (e) { console.error('Rutin aggregate:', e.message); }
  }
);

// ═══════════════════════════════════════════════════════
// TRIGGER — Günlük soru aggregate (Faz 10)
// ogrenciler/{id}/gunlukSoru/{tarih} yazıldığında root doc'a bugunSoruTarihi yazar
// ═══════════════════════════════════════════════════════
exports.gunlukSoruAggregateGuncelle = onDocumentWritten(
  'ogrenciler/{ogrenciId}/gunlukSoru/{tarih}',
  async (event) => {
    const { ogrenciId, tarih } = event.params;
    const yeni = event.data?.after?.data();
    try {
      // Silindi → yanlış pozitif önlemek için bugunSoruTarihi sıfırla
      if (!yeni) {
        await db.collection('ogrenciler').doc(ogrenciId).update({ bugunSoruTarihi: null });
        return;
      }
      await db.collection('ogrenciler').doc(ogrenciId).update({ bugunSoruTarihi: tarih });
    } catch (e) { console.error('GünlükSoru aggregate:', e.message); }
  }
);
