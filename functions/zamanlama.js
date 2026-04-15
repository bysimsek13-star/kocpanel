/**
 * zamanlama.js — Scheduled (zamanlanmış) Cloud Functions
 * riskSkoreHesapla (gece 03:00), gunlukAlanlariSifirla (gece 00:05)
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore } = require('firebase-admin/firestore');
const { todayStrTR, daysAgoStrTR } = require('./helpers');
const { RISK_DURUM } = require('./sabitler');

const db = getFirestore();

// ═══════════════════════════════════════════════════════
// SCHEDULED — Risk skoru (gece 03:00 İstanbul)
// ═══════════════════════════════════════════════════════
exports.riskSkoreHesapla = onSchedule(
  { schedule: '0 3 * * *', timeZone: 'Europe/Istanbul' },
  async () => {
    // Root dokümanları tek sorguda çek — her öğrenci için sadece bu okuma zorunlu
    const ogrSnap = await db.collection('ogrenciler').where('aktif', '==', true).get();
    const yediGunOnceStr = daysAgoStrTR(7);
    const ondortGunOnceStr = daysAgoStrTR(14);
    const bugun = new Date();

    // ─── Çalışma sorguları paralel — aktif öğrenciler için aynı anda uçar ────
    // Pasif (sonCalisma < 7 gün) öğrenciler için null döner, ek okuma sıfır.
    const aktifOgrenciler = ogrSnap.docs.filter(d => {
      const sc = d.data().sonCalismaTarihi || '';
      return sc >= yediGunOnceStr; // son 7 günde aktif olanlar
    });
    const pasifSet = new Set(
      ogrSnap.docs.filter(d => {
        const sc = d.data().sonCalismaTarihi || '';
        return !sc || sc < yediGunOnceStr;
      }).map(d => d.id)
    );

    const calismaSnaplar = await Promise.all(
      aktifOgrenciler.map(d =>
        db.collection('ogrenciler').doc(d.id).collection('calisma')
          .where('tarih', '>=', ondortGunOnceStr)
          .get()
      )
    );
    const calismaMap = {};
    aktifOgrenciler.forEach((d, i) => { calismaMap[d.id] = calismaSnaplar[i]; });

    let batch = db.batch();
    let batchCount = 0;
    for (const ogrDoc of ogrSnap.docs) {
      const id = ogrDoc.id;
      const veri = ogrDoc.data();
      let risk = 0;
      try {
        // ─── Çalışma risk sinyali ───────────────────────────────────────────
        if (pasifSet.has(id)) {
          risk += 25; // 7 gündür çalışma kaydı yok
        } else {
          const cSnap = calismaMap[id];
          const cal = cSnap.docs.map(d => d.data());
          const son7 = cal.filter(c => c.tarih >= yediGunOnceStr);
          const onc7 = cal.filter(c => c.tarih >= ondortGunOnceStr && c.tarih < yediGunOnceStr);
          // Toplam saat + aktif gün sayısı üzerinden karşılaştır (ortalama yanıltıcı olabilir)
          const toplamSon7 = son7.reduce((a, c) => a + (c.saat || 0), 0);
          const toplamOnc7 = onc7.reduce((a, c) => a + (c.saat || 0), 0);
          const gunSon7 = son7.length;
          const gunOnc7 = onc7.length;
          // Hem saat hem gün sayısı %80'in altına düşerse risk
          if ((toplamOnc7 > 0 && toplamSon7 < toplamOnc7 * 0.8) ||
              (gunOnc7 > 0 && gunSon7 < gunOnc7 * 0.8)) {
            risk += 25;
          }
        }

        // ─── Mesaj risk sinyali (summary-driven) ───────────────────────────
        if (veri.bekleyenKocMesaj === true && veri.sonKocMesajZamani) {
          const kocZ = veri.sonKocMesajZamani.toDate?.() ?? new Date(veri.sonKocMesajZamani);
          if ((bugun - kocZ) / 3600000 > 24) risk += 25;
        }

        const riskDurumu = risk === 0 ? RISK_DURUM.YOK : risk <= 40 ? RISK_DURUM.RISK_ALTINDA : RISK_DURUM.YUKSEK_RISK;
        batch.update(ogrDoc.ref, { riskDurumu, riskPuan: risk });
        batchCount++;
        if (batchCount >= 400) {
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
        }
      } catch (e) { console.warn(`Risk (${id}):`, e.message); }
    }
    if (batchCount > 0) await batch.commit();
    console.log(`Risk skoru: ${ogrSnap.size} öğrenci`);
  }
);

// ═══════════════════════════════════════════════════════
// SCHEDULED — Günlük alanları sıfırla (gece 00:05 İstanbul) (Faz 10)
// bugunRutinTarihi / bugunSoruTarihi bugünkü tarihle eşleşmeyenler
// zaten "yok" sayılır — bu fonksiyon her öğrenci için açıkça sıfırlamaz,
// tarih karşılaştırması istemci + useKocVeri tarafından yapılır.
// Dolayısıyla bu scheduled job opsiyonel temizliktir (eski verileri kaldırır).
// ═══════════════════════════════════════════════════════
exports.gunlukAlanlariSifirla = onSchedule(
  { schedule: '5 0 * * *', timeZone: 'Europe/Istanbul', region: 'europe-west1' },
  async () => {
    // Dün ve öncesine ait bugunCalismaSaat değerlerini sıfırla
    // bugunRutinTarihi/bugunSoruTarihi'ni silmiyoruz — tarih karşılaştırması yeterli
    const bugunStr = todayStrTR();

    const snap = await db.collection('ogrenciler')
      .where('aktif', '==', true)
      .select('bugunCalismaSaat')
      .get();

    let batch = db.batch();
    let count = 0;
    for (const d of snap.docs) {
      const veri = d.data();
      // Dünden kalan bugunCalismaSaat'i sıfırla
      if (veri.bugunCalismaSaat != null && veri.bugunCalismaSaat > 0) {
        batch.update(d.ref, { bugunCalismaSaat: 0, gunlukDakika: 0, girisSayisi: 0 });
        count++;
        if (count % 400 === 0) { await batch.commit(); batch = db.batch(); }
      }
    }
    if (count % 400 !== 0) await batch.commit();
    console.log(`Günlük sıfırlama: ${count} öğrenci (${bugunStr})`);
  }
);
