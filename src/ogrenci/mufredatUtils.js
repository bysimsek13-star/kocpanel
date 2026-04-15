export const RENK_HARITASI = {
  Türkçe: '#F59E0B',
  Matematik: '#5B4FE8',
  Geometri: '#8B5CF6',
  'Fen Bilimleri': '#10B981',
  İnkılap: '#F43F5E',
  Din: '#059669',
  İngilizce: '#0891B2',
  'Yabancı Dil': '#0891B2',
  Fizik: '#06B6D4',
  Kimya: '#EC4899',
  Biyoloji: '#22C55E',
  Edebiyat: '#F97316',
  Tarih: '#EF4444',
  Coğrafya: '#84CC16',
  Felsefe: '#A855F7',
  Sosyal: '#FB923C',
};

export function dersiRenk(dersLabel) {
  for (const [anahtar, renk] of Object.entries(RENK_HARITASI)) {
    if (dersLabel.includes(anahtar)) return renk;
  }
  return '#6B7280';
}

export const DURUM = {
  tamamlandi: { label: 'Tamamlandı', renk: '#10B981', bg: 'rgba(16,185,129,0.12)', ikon: '✓' },
  eksik: { label: 'Eksik var', renk: '#F59E0B', bg: 'rgba(245,158,11,0.12)', ikon: '⚠' },
};
