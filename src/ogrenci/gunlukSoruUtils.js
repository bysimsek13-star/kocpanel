import { TYT_DERSLER } from '../data/konularTyt';
import { AYT_SAY, AYT_EA, AYT_SOZ, AYT_DIL, AYT_DERSLER } from '../data/konularAyt';
import { LGS_DERSLER, ORTAOKUL7_DERSLER, LISE910_DERSLER } from '../utils/ogrenciBaglam';

// Konular listesini ## işaretli ana bölümlere göre gruplar.
// Prefix olmayan (LGS gibi) listeler tek bölüm olarak döner.
export function konulariBolumle(konuListesi) {
  const bolumler = [];
  let aktif = null;
  for (const satir of konuListesi || []) {
    if (satir.startsWith('## ')) {
      aktif = { bolumAd: satir.slice(3), konular: [] };
      bolumler.push(aktif);
    } else if (!satir.startsWith('# ') && !satir.startsWith('### ')) {
      if (!aktif) {
        aktif = { bolumAd: '', konular: [] };
        bolumler.push(aktif);
      }
      aktif.konular.push(satir);
    }
    // # ve ### alt başlıkları atla — sadece leaf konular gösterilir
  }
  return bolumler.filter(b => b.konular.length > 0);
}

// Tur + sınıf + sinav toggle'a göre doğru ders listesini döner
export function dersleriBelirle(tur, sinif, sinav) {
  const t = (tur || '').toLowerCase();
  const s = Number(sinif);
  if (t.includes('lgs') || s === 8) return LGS_DERSLER;
  if (s === 7 || (s === 0 && t.includes('ortaokul'))) return ORTAOKUL7_DERSLER;
  if (s === 9 || s === 10) return LISE910_DERSLER;
  if (sinav === 'AYT') {
    if (t.startsWith('sayisal')) return AYT_SAY;
    if (t.startsWith('ea')) return AYT_EA;
    if (t.startsWith('sozel')) return AYT_SOZ;
    if (t.startsWith('dil')) return AYT_DIL;
    return AYT_DERSLER;
  }
  return TYT_DERSLER;
}

// YKS öğrencisi mi? (sinav toggle göster/gizle için)
export function yksOgrencisiMi(tur, sinif) {
  const t = (tur || '').toLowerCase();
  const s = Number(sinif);
  if (t.includes('lgs') || t.includes('ortaokul') || s === 8 || s === 7 || s === 9 || s === 10)
    return false;
  return true;
}
