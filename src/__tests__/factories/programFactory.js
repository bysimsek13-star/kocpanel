/**
 * programFactory.js — Test veri üretici (program_v2 nesneleri)
 *
 * Kullanım:
 *   import { programBuild, slotBuild, doluHaftaBuild } from './factories/programFactory';
 *
 *   const program = programBuild({ hafta: { pazartesi: [slotBuild({ tip: 'ders' })] } });
 *   const dolu = doluHaftaBuild(['pazartesi', 'sali'], 2); // her gün 2 slot
 */

// ─── Slot şablonu ─────────────────────────────────────────────────────────────
function slotBuild(overrides = {}) {
  return {
    tip: 'ders',
    baslik: 'Matematik',
    sure: 60,
    ...overrides,
  };
}

// ─── Hafta şablonu (tüm günler boş) ──────────────────────────────────────────
const GUNLER = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];

function boshHaftaBuild() {
  return Object.fromEntries(GUNLER.map(g => [g, []]));
}

// ─── program_v2 dokümanı ──────────────────────────────────────────────────────
function programBuild(overrides = {}) {
  return {
    hafta: boshHaftaBuild(),
    tamamlandi: {},
    olusturma: null,
    guncelleme: null,
    ...overrides,
  };
}

// ─── Doldurucu yardımcılar ────────────────────────────────────────────────────
/**
 * Belirtilen günlere verilen sayıda slot eklenmiş program döner.
 * @param {string[]} gunler — Slot eklenecek günler, örn. ['pazartesi', 'sali']
 * @param {number} slotSayisi — Her güne eklenecek slot sayısı
 * @param {object} slotOverrides — Slot şablonu override'ları
 */
function doluHaftaBuild(gunler = ['pazartesi'], slotSayisi = 2, slotOverrides = {}) {
  const hafta = boshHaftaBuild();
  gunler.forEach(gun => {
    hafta[gun] = Array.from({ length: slotSayisi }, () => slotBuild(slotOverrides));
  });
  return programBuild({ hafta });
}

/**
 * Kısmen tamamlanmış program; belirtilen slotları tamamlandı olarak işaretler.
 * @param {object} program — programBuild() çıktısı
 * @param {string[]} tamamlananKeys — Örn. ['pazartesi_0', 'sali_1']
 */
function tamamlandiIsaretle(program, tamamlananKeys = []) {
  const tamamlandi = Object.fromEntries(tamamlananKeys.map(k => [k, true]));
  return { ...program, tamamlandi };
}

export { slotBuild, boshHaftaBuild, programBuild, doluHaftaBuild, tamamlandiIsaretle, GUNLER };

// ─── make* alias ──────────────────────────────────────────────────────────────
export const makeHaftalikProgram = (override = {}) => ({
  hafta: '2026-04-14',
  gunler: {
    pazartesi: [{ tip: 'mat', baslik: 'Türev', sure: 60, tamamlandi: false }],
    sali: [],
    carsamba: [],
    persembe: [],
    cuma: [],
    cumartesi: [],
    pazar: [],
  },
  tamamlandi: {},
  ...override,
});
