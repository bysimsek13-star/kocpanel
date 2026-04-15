/**
 * Çalışma slot tipleri — tek kaynak (GunlukTakip, HaftalikProgram, OgrenciPaneli)
 *
 * Her tip hem pastel (renk/acik) hem neon (neonRenk/neonAcik) tonlarını
 * taşıyor; bileşen tercihine göre hangisini kullandığını seçer.
 */
export const SLOT_TIPLERI = [
  {
    id: 'konu',
    label: 'Konu Çalışma',
    renk: '#6D8B72',
    acik: '#E8F0EA',
    neonRenk: '#10B981',
    neonAcik: '#D1FAE5',
  },
  {
    id: 'soru',
    label: 'Soru Çözümü',
    renk: '#B89A6E',
    acik: '#F3EDE4',
    neonRenk: '#F59E0B',
    neonAcik: '#FEF3C7',
  },
  {
    id: 'video',
    label: 'Video İzleme',
    renk: '#6D8499',
    acik: '#E8EEF2',
    neonRenk: '#3B82F6',
    neonAcik: '#DBEAFE',
  },
  {
    id: 'tekrar',
    label: 'Tekrar',
    renk: '#8B7FA3',
    acik: '#EEECF3',
    neonRenk: '#8B5CF6',
    neonAcik: '#EDE9FE',
  },
  {
    id: 'deneme',
    label: 'Deneme',
    renk: '#B08080',
    acik: '#F3EAEA',
    neonRenk: '#F43F5E',
    neonAcik: '#FFE4E6',
  },
  {
    id: 'ozet',
    label: 'Özet Çıkar',
    renk: '#6D9599',
    acik: '#E5F0F1',
    neonRenk: '#06B6D4',
    neonAcik: '#CFFAFE',
  },
  {
    id: 'diger',
    label: 'Diğer',
    renk: '#8A9094',
    acik: '#ECEEEF',
    neonRenk: '#6B7280',
    neonAcik: '#F3F4F6',
  },
];

/** id → tip objesi (map lookup, O(1)) */
export const SLOT_TIP_MAP = Object.fromEntries(SLOT_TIPLERI.map(t => [t.id, t]));

/** id'den tip bul, bulamazsa 'diger' döner */
export const tipBul = id => SLOT_TIP_MAP[id] ?? SLOT_TIP_MAP['diger'];

/**
 * Eski TIP_RENK formatıyla uyumlu obje (GunlukTakip / OgrenciPaneli geçiş için)
 * Pastel tonları kullanır.
 */
export const TIP_RENK = Object.fromEntries(
  SLOT_TIPLERI.map(t => [t.id, { renk: t.renk, acik: t.acik, label: t.label }])
);

/**
 * Tema tokenlarından aktivite tipi renklerini döndürür.
 * HaftalikProgram / OgrenciPaneli bileşenlerinde `s` objesiyle çağır.
 * @param {object} s - useTheme() hook'undan gelen `s` objesi
 */
export function getTipRenkleri(s) {
  return {
    konu: { renk: s.success, acik: s.okSoft, label: 'Konu Çalışma' },
    soru: { renk: s.warning, acik: s.uyariSoft, label: 'Soru Çözümü' },
    video: { renk: s.info, acik: s.bilgiSoft, label: 'Video İzleme' },
    tekrar: { renk: s.chart5, acik: s.primarySoft, label: 'Tekrar' },
    deneme: { renk: s.danger, acik: s.tehlikaSoft, label: 'Deneme' },
    ozet: { renk: s.accent, acik: s.accentSoft, label: 'Özet Çıkar' },
    diger: { renk: s.textMuted, acik: s.borderSoft, label: 'Diğer' },
  };
}
