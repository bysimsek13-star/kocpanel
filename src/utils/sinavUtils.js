import { dersSetiniBelirle } from './ogrenciBaglam';

/**
 * Öğrenci türünden genel kategori döndürür: 'lgs' | 'ortaokul' | 'yks'
 */
export function turBelirle(tur) {
  const t = (tur || '').toLowerCase();
  if (t.includes('lgs')) return 'lgs';
  if (t.includes('ortaokul')) return 'ortaokul';
  return 'yks';
}

/**
 * Öğrencinin segment'ine göre branş ders listesi döndürür.
 * sinif parametresi ile doğru segment seti kullanılır.
 * — 7. sınıf: ortaokul dersleri
 * — 8. sınıf / lgs: LGS dersleri
 * — 9-10. sınıf: TYMM lise dersleri
 * — 11. sınıf: TYT tabanı
 * — 12 / mezun: tur'a göre TYT + AYT
 */
export function turdenBransDersler(tur, sinif) {
  return dersSetiniBelirle(tur, sinif);
}
