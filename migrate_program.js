/**
 * program_v2 hafta key migrasyonu: Pazar-bazlı → Pazartesi-bazlı
 *
 * Eski kod: haftaKey = Pazar tarihi  (örn. 2026-04-05)
 * Yeni kod: haftaKey = Pazartesi tarihi (örn. 2026-04-06)
 *
 * Pazar tarihi + 1 gün = ilgili haftanın Pazartesisi
 *
 * Çalıştır: node migrate_program.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

function isPazar(dateStr) {
  // YYYY-MM-DD formatındaki tarihin Pazar olup olmadığını kontrol et
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid DST issues
  return d.getDay() === 0; // 0 = Pazar
}

function pazardanPazartesiye(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${g}`;
}

async function migrate() {
  console.log('program_v2 key migrasyonu başlıyor (Pazar → Pazartesi)...\n');

  const ogrencilerSnap = await db.collection('ogrenciler').get();
  console.log(`${ogrencilerSnap.size} öğrenci bulundu.\n`);

  let gecirilen = 0;
  let atlanan = 0;
  let hata = 0;

  for (const ogrenciDoc of ogrencilerSnap.docs) {
    const uid = ogrenciDoc.id;
    const isim = ogrenciDoc.data().isim || uid;

    const v2Snap = await db
      .collection('ogrenciler').doc(uid)
      .collection('program_v2').get();

    if (v2Snap.empty) continue;

    for (const d of v2Snap.docs) {
      const eskiKey = d.id;

      if (!isPazar(eskiKey)) {
        // Zaten Pazartesi veya başka bir gün — atla
        continue;
      }

      const yeniKey = pazardanPazartesiye(eskiKey);
      console.log(`${isim}: ${eskiKey} → ${yeniKey}`);

      // Yeni key'de zaten veri var mı?
      const yeniRef = db
        .collection('ogrenciler').doc(uid)
        .collection('program_v2').doc(yeniKey);

      const yeniSnap = await yeniRef.get();
      if (yeniSnap.exists) {
        const data = yeniSnap.data();
        const doluluk = Object.values(data.hafta || {}).flat().filter(s => s && s.tip).length;
        if (doluluk > 0) {
          console.log(`  Atlandı: ${yeniKey}'de zaten ${doluluk} dolu slot var`);
          atlanan++;
          continue;
        }
      }

      try {
        // Veriyi kopyala, eski key'i sil
        const data = d.data();
        await yeniRef.set({
          ...data,
          _migratedFrom: eskiKey,
          guncelleme: admin.firestore.FieldValue.serverTimestamp(),
        });
        await d.ref.delete();
        console.log(`  ✓ Taşındı`);
        gecirilen++;
      } catch (e) {
        console.error(`  ✗ Hata:`, e.message);
        hata++;
      }
    }
  }

  console.log('\n─── SONUÇ ───');
  console.log(`Taşınan:  ${gecirilen}`);
  console.log(`Atlanan:  ${atlanan}`);
  console.log(`Hata:     ${hata}`);
  console.log('\nMigrasyon tamamlandı.');
  process.exit(0);
}

migrate().catch(e => {
  console.error('Migrasyon başarısız:', e);
  process.exit(1);
});
