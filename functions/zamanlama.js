/**
 * zamanlama.js — Scheduled (zamanlanmış) Cloud Functions
 * riskSkoreHesapla (gece 00:10 — puanlama sistemi yeniden tasarlanacak)
 * gunlukAlanlariSifirla (gece 00:05)
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore } = require('firebase-admin/firestore');
const { todayStrTR } = require('./helpers');

const db = getFirestore();

// ═══════════════════════════════════════════════════════
// SCHEDULED — Risk skoru (gece 00:10 İstanbul)
// TODO: Puanlama sistemi yeniden tasarlanacak — roadmap
// ═══════════════════════════════════════════════════════
exports.riskSkoreHesapla = onSchedule(
  { schedule: '10 0 * * *', timeZone: 'Europe/Istanbul' },
  async () => {
    // Puanlama sistemi kaldırıldı — yeniden tasarım roadmap'te
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
