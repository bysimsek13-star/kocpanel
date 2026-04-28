/**
 * konuTakipUtils.js
 * Öğrencinin herhangi bir kaynaktan çalışmasını konu_takip koleksiyonuna yazar.
 * Tüm değişken adları Türkçe, console.log yasak.
 */

import { doc, setDoc, getDoc, serverTimestamp, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Konu adını normalize eder (dersId olmadan).
 * "Türev Alma Kuralları" → "türev_alma_kuralları"
 * Harita oluştururken ve arama yaparken tutarlı eşleştirme sağlar.
 */
export function normalizeKonuAdi(konuAdi) {
  if (!konuAdi) return 'genel';
  return konuAdi
    .trim()
    .toLowerCase()
    .replace(/[\s/\\.,;:!?()[\]{}'"-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Konu adını Firestore doküman ID'sine dönüştürür.
 * "Türev Alma Kuralları" → "türev_alma_kuralları"
 */
export function konuIdOlustur(dersId, konuAdi) {
  const normalize = str =>
    str
      .trim()
      .toLowerCase()
      .replace(/[\s/\\.,;:!?()[\]{}'"-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  const konuNorm = konuAdi ? normalize(konuAdi) : 'genel';
  return `${dersId}_${konuNorm}`;
}

/**
 * Virgülle ayrılmış konu string'ini parse eder.
 * "Türev, Limit, İntegral" → ["Türev", "Limit", "İntegral"]
 * Boş/null gelirse → ["Genel"] (dersin genel havuzuna düşer)
 */
export function konulariParse(iceriStr) {
  if (!iceriStr || !iceriStr.trim()) return ['Genel'];
  return iceriStr
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
}

/**
 * Ana fonksiyon — tüm kaynaklar bunu çağırır.
 *
 * @param {string} ogrenciId   - Öğrenci Firestore ID
 * @param {string} dersId      - Ders ID (örn: "mat", "fiz")
 * @param {string} iceriStr    - Virgülle ayrılmış konu adları (boş olabilir)
 * @param {string} kaynak      - "program" | "gunlukSoru" | "video" | "kitap" | "deneme"
 * @param {object} ekstra      - İsteğe bağlı: { videoSaat: 1.5, soruSayisi: 10 }
 */
export async function konuTakipYaz(ogrenciId, dersId, iceriStr, kaynak, ekstra = {}) {
  if (!ogrenciId || !dersId) return;

  const konular = konulariParse(iceriStr);
  const bugun = new Date().toISOString().slice(0, 10);

  for (const konuAdi of konular) {
    const konuId = konuIdOlustur(dersId, konuAdi);
    const ref = doc(db, 'ogrenciler', ogrenciId, 'konu_takip', konuId);

    try {
      const snap = await getDoc(ref);
      const mevcutVar = snap.exists();

      const yazilacak = {
        konuAdi: mevcutVar ? snap.data().konuAdi : konuAdi,
        dersId,
        kaynaklar: arrayUnion(kaynak),
        sonCalisma: bugun,
        guncelleme: serverTimestamp(),
      };

      if (!mevcutVar) {
        yazilacak.ilkCalisma = bugun;
        yazilacak.durum = 'calisiliyor';
        yazilacak.videoSaat = 0;
        yazilacak.soruSayisi = 0;
      }

      if (ekstra.videoSaat) {
        yazilacak.videoSaat = increment(ekstra.videoSaat);
      }
      if (ekstra.soruSayisi) {
        yazilacak.soruSayisi = increment(ekstra.soruSayisi);
      }

      await setDoc(ref, yazilacak, { merge: true });
    } catch (e) {
      console.error('konuTakipYaz hatası:', e.message, { ogrenciId, dersId, konuAdi, kaynak });
    }
  }
}

/**
 * Koçun veya öğrencinin manuel "tamamlandı" işaretlemesi.
 * durum alanını doğrudan günceller.
 */
export async function konuDurumGuncelle(ogrenciId, konuId, yeniDurum, kim = 'koc') {
  if (!ogrenciId || !konuId) return;
  const ref = doc(db, 'ogrenciler', ogrenciId, 'konu_takip', konuId);
  try {
    await setDoc(
      ref,
      {
        durum: yeniDurum,
        [`${kim}Tarihi`]: new Date().toISOString().slice(0, 10),
        guncelleme: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error('konuDurumGuncelle hatası:', e.message);
  }
}
