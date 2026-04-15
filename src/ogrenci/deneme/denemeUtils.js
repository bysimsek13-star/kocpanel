import { AYT_SAY, AYT_EA, AYT_SOZ, AYT_DIL } from '../../data/konular';

export const AYT_MAP = { SAY: AYT_SAY, EA: AYT_EA, SÖZ: AYT_SOZ, DİL: AYT_DIL };
export const AYT_ALANLAR = [
  { k: 'SAY', l: 'Sayısal', maks: 80 },
  { k: 'EA', l: 'Eşit Ağırlık', maks: 80 },
  { k: 'SÖZ', l: 'Sözel', maks: 80 },
  { k: 'DİL', l: 'Dil', maks: 80 },
];

export function turdenAlan(tur) {
  if (!tur) return 'SAY';
  if (tur.startsWith('sayisal')) return 'SAY';
  if (tur.startsWith('ea')) return 'EA';
  if (tur.startsWith('sozel')) return 'SÖZ';
  if (tur.startsWith('dil')) return 'DİL';
  return 'SAY';
}

// Genel deneme için sinav seçenekleri — segmente göre
export function sinavSecenekleri(tur, sinif) {
  const t = (tur || '').toLowerCase();
  const s = Number(sinif) || 0;
  if (t.includes('lgs') || s === 8) return ['LGS'];
  if (s === 7) return ['Branş']; // 7. sınıf: sadece branş
  if (s === 9 || s === 10) return ['TYT', 'Branş']; // TYMM: TYT alıştırma + branş
  if (t.startsWith('tyt')) return ['TYT'];
  return ['TYT', 'AYT'];
}

// Alan seçici gizlensin mi? (alan zaten türden belli olanlar)
export function alanKilitli(tur) {
  if (!tur) return false;
  return (
    tur.startsWith('sayisal') ||
    tur.startsWith('ea') ||
    tur.startsWith('sozel') ||
    tur.startsWith('dil')
  );
}
