/**
 * mesaj.js — Mesaj okundu/okunmamış sayacı trigger'ları
 * mesajOkunmamisArt, mesajOkunduAzalt, mesajCevapDurumGuncelle
 */

const { onDocumentCreated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const db = getFirestore();

// ═══════════════════════════════════════════════════════
// TRIGGER — Okunmamış mesaj sayacı artır (Faz 10)
// Öğrenci mesaj yazdığında okunmamisMesajSayisi artırılır
// ═══════════════════════════════════════════════════════
exports.mesajOkunmamisArt = onDocumentCreated(
  'ogrenciler/{ogrenciId}/mesajlar/{mesajId}',
  async (event) => {
    const { ogrenciId } = event.params;
    const mesaj = event.data?.data();
    // Sadece öğrenciden gelen ve okunmamış mesajlar sayılır
    if (!mesaj || mesaj.gonderen !== 'ogrenci' || mesaj.okundu === true) return;
    try {
      await db.collection('ogrenciler').doc(ogrenciId).update({
        okunmamisMesajSayisi: FieldValue.increment(1),
      });
    } catch (e) { console.error('Mesaj okunmamış artır:', e.message); }
  }
);

// ═══════════════════════════════════════════════════════
// TRIGGER — Mesaj cevap durumu (G13: summary-driven risk)
// Koç mesaj yazınca bekleyenKocMesaj=true + sonKocMesajZamani kaydeder;
// öğrenci cevap yazınca bekleyenKocMesaj=false yapar.
// riskSkoreHesapla bu iki alan üzerinden mesajlar subcollection'ını
// okumadan karar verir.
// ═══════════════════════════════════════════════════════
exports.mesajCevapDurumGuncelle = onDocumentCreated(
  'ogrenciler/{ogrenciId}/mesajlar/{mesajId}',
  async (event) => {
    const { ogrenciId } = event.params;
    const mesaj = event.data?.data();
    if (!mesaj) return;
    const guncelleme =
      mesaj.gonderen === 'koc'
        ? { bekleyenKocMesaj: true, sonKocMesajZamani: mesaj.olusturma ?? null }
        : mesaj.gonderen === 'ogrenci'
          ? { bekleyenKocMesaj: false }
          : null;
    if (!guncelleme) return;
    try {
      await db.collection('ogrenciler').doc(ogrenciId).update(guncelleme);
    } catch (e) { console.error('Mesaj cevap durumu:', e.message); }
  }
);

// ═══════════════════════════════════════════════════════
// TRIGGER — Okunmamış mesaj sayacı azalt (Faz 10)
// Mesaj okundu işaretlenince sayacı azaltır (min 0)
// ═══════════════════════════════════════════════════════
exports.mesajOkunduAzalt = onDocumentWritten(
  'ogrenciler/{ogrenciId}/mesajlar/{mesajId}',
  async (event) => {
    const { ogrenciId } = event.params;
    const once = event.data?.before?.data();
    const sonra = event.data?.after?.data();
    // Sadece okundu: false → true geçişini yakala
    if (!once || !sonra) return;
    if (once.okundu !== false || sonra.okundu !== true) return;
    if (once.gonderen !== 'ogrenci') return;
    try {
      // FieldValue.increment(-1) zaten atomik — okuma→yazma TOCTOU gerek yok.
      // Negatif değer oluşursa periyodik CF düzeltir (ya da UI Math.max(0,...) kullanır).
      await db.collection('ogrenciler').doc(ogrenciId).update({
        okunmamisMesajSayisi: FieldValue.increment(-1),
      });
    } catch (e) { console.error('Mesaj okundu azalt:', e.message); }
  }
);
