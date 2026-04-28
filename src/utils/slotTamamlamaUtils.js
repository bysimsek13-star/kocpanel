/**
 * slotTamamlamaUtils.js
 * Slot tamamlandığında konu_takip'e yazma mantığı.
 * Hem koç (useHaftalikProgram) hem öğrenci (BugunProgramKart) kullanır.
 */

import { konuTakipYaz } from './konuTakipUtils';

/**
 * Bir slot tamamlandığında ilgili kaynağa göre konu_takip'e yazar.
 * Deneme slotları bu fonksiyonun dışında ayrıca ele alınır.
 *
 * @param {object} slot       - program_v2 slot objesi
 * @param {string} ogrenciId  - öğrenci Firestore ID
 */
export async function slotTamamlamaKaydet(slot, ogrenciId) {
  if (!slot?.dersId || !ogrenciId) return;

  const { tip, dersId, icerik } = slot;

  if (tip === 'konu' || tip === 'tekrar' || tip === 'ozet') {
    await konuTakipYaz(ogrenciId, dersId, icerik || '', 'program');
    return;
  }

  if (tip === 'soru') {
    const soruSayisi = slot.soruSayisi || 1;
    await konuTakipYaz(ogrenciId, dersId, icerik || '', 'program', { soruSayisi });
    return;
  }

  if (tip === 'video') {
    const toplamDakika =
      slot.videoToplamDakika || (slot.videolar || []).reduce((t, v) => t + (v.duration || 0), 0);
    const videoSaat = toplamDakika / 60;
    await konuTakipYaz(ogrenciId, dersId, icerik || '', 'video', {
      videoSaat: videoSaat > 0 ? videoSaat : undefined,
    });
    return;
  }
}
