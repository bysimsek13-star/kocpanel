/**
 * ogrenciBaglam.js — Canonical Öğrenci Bağlam Çözücü
 *
 * Bu dosya, tüm segment kararlarının tek kaynağıdır.
 * `userData.tur` + `userData.sinif` → sinavModu, dersSet, denemeTipleri,
 * mufredatAnahtarlari, programModu, gerisayimHedef
 *
 * Kullanım:
 *   const baglam = ogrenciBaglaminiCoz({ tur: userData.tur, sinif: userData.sinif });
 *
 * Referans: akademik_baglam_matrisi.md
 */

import { TYT_DERSLER, AYT_SAY, AYT_EA, AYT_SOZ, AYT_DIL } from '../data/konular';

// ─── Ders setleri ─────────────────────────────────────────────────────────────

// 8. sınıf LGS — merkezi sınav yapısına göre
export const LGS_DERSLER = [
  { id: 'lgstur', label: 'Türkçe', toplam: 20, renk: '#F59E0B' },
  { id: 'lgsmat', label: 'Matematik', toplam: 20, renk: '#5B4FE8' },
  { id: 'lgsfen', label: 'Fen Bilimleri', toplam: 20, renk: '#10B981' },
  { id: 'lgsinkilap', label: 'T.C. İnkılap Tarihi ve Atatürkçülük', toplam: 10, renk: '#F43F5E' },
  { id: 'lgsdin', label: 'Din Kültürü ve Ahlak Bilgisi', toplam: 10, renk: '#059669' },
  { id: 'lgsing', label: 'İngilizce', toplam: 10, renk: '#0891B2' },
];

// 7. sınıf ortaokul — MEB ortaokul müfredatı
export const ORTAOKUL7_DERSLER = [
  { id: 'tur7', label: 'Türkçe', toplam: 0, renk: '#F59E0B' },
  { id: 'mat7', label: 'Matematik', toplam: 0, renk: '#5B4FE8' },
  { id: 'fen7', label: 'Fen Bilimleri', toplam: 0, renk: '#10B981' },
  { id: 'sosyal7', label: 'Sosyal Bilgiler', toplam: 0, renk: '#F43F5E' },
  { id: 'din7', label: 'Din Kültürü ve Ahlak Bilgisi', toplam: 0, renk: '#059669' },
  { id: 'ing7', label: 'İngilizce', toplam: 0, renk: '#0891B2' },
];

// 9-10. sınıf TYMM (Türkiye Yüzyılı Maarif Modeli) lise — 2023-2024 itibarıyla
export const LISE910_DERSLER = [
  { id: 'tde910', label: 'Türk Dili ve Edebiyatı', toplam: 0, renk: '#F59E0B' },
  { id: 'mat910', label: 'Matematik', toplam: 0, renk: '#5B4FE8' },
  { id: 'fiz910', label: 'Fizik', toplam: 0, renk: '#3B82F6' },
  { id: 'kim910', label: 'Kimya', toplam: 0, renk: '#10B981' },
  { id: 'biy910', label: 'Biyoloji', toplam: 0, renk: '#EC4899' },
  { id: 'tar910', label: 'Tarih', toplam: 0, renk: '#F43F5E' },
  { id: 'cog910', label: 'Coğrafya', toplam: 0, renk: '#8B5CF6' },
  { id: 'fel910', label: 'Felsefe', toplam: 0, renk: '#0891B2' },
  { id: 'din910', label: 'Din Kültürü ve Ahlak Bilgisi', toplam: 0, renk: '#059669' },
  { id: 'ing910', label: 'İngilizce', toplam: 0, renk: '#0EA5E9' },
];

// ─── sinavModu ────────────────────────────────────────────────────────────────
// 'lgs'     → 8. sınıf LGS odaklı
// 'yks'     → 12. sınıf / mezun YKS odaklı
// 'gecis'   → 11. sınıf — sınav yılına hazırlık
// 'gelisim' → 7 / 9 / 10. sınıf — genel akademik gelişim

/**
 * tur string'inden sınıf sayısını çıkartır.
 * 'ortaokul_9' → 9,  'lgs_8' → 8,  'sayisal_12' → 12,  'ea_mezun' → 0
 * sinif parametresi açıkça verilmişse onu kullanır.
 */
function efektifSinif(tur, sinif) {
  // tur'daki _12 gibi suffix en yetkili kaynak (örn: ea_12, sinif=9 ise yine 12 döner)
  const turM = (tur || '').match(/_(\d+)$/);
  if (turM) return Number(turM[1]);
  // tur'da sayı yoksa (mezun, eski format) sinif alanına bak
  const acik = Number(sinif);
  if (acik > 0) return acik;
  return 0;
}

function sinavModunuBelirle(tur, sinif) {
  // Türkçe karakterleri ve büyük/küçük harf farkını ortadan kaldır
  const t = (tur || '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
  const s = efektifSinif(tur, sinif);

  if (t.includes('lgs') || s === 8) return 'lgs';

  // YKS tur string'i → sinif alanından bağımsız, en yüksek öncelik
  // (sinif=9 gibi eski/yanlış değer YKS öğrencisini ezmemeli)
  if (
    t === 'yks' ||
    t.includes('sayisal') ||
    t.includes('ea') ||
    t.includes('sozel') ||
    t.includes('dil') ||
    t === 'tyt' ||
    t.startsWith('tyt')
  )
    return 'yks';

  // YKS değilse sinif alanına bak
  if (s === 7) return 'gelisim';
  if (s === 9 || s === 10) return 'gelisim';
  if (s === 11) return 'gecis';
  if (t.includes('ortaokul')) return 'gelisim';
  return 'gelisim'; // bilinmeyen segment için güvenli default
}

// ─── programModu ─────────────────────────────────────────────────────────────
function programModunuBelirle(sinavModu) {
  if (sinavModu === 'lgs' || sinavModu === 'yks') return 'sinav_programi';
  if (sinavModu === 'gecis') return 'gecis_programi';
  return 'gelisim_programi';
}

// ─── Ders seti ────────────────────────────────────────────────────────────────
export function dersSetiniBelirle(tur, sinif) {
  const t = (tur || '').toLowerCase();
  const s = efektifSinif(tur, sinif);

  // Sınıf öncelikli karar
  if (t.includes('lgs') || s === 8) return LGS_DERSLER;
  if (s === 7 || (s === 0 && t.includes('ortaokul'))) return ORTAOKUL7_DERSLER;
  if (s === 9 || s === 10) return LISE910_DERSLER;

  // 11. sınıf geçiş: TYT tabanı (alan henüz bilinmiyorsa TYT)
  if (s === 11) return TYT_DERSLER;

  // 12. sınıf / mezun — tur'a göre
  if (t.startsWith('sayisal')) return [...TYT_DERSLER, ...AYT_SAY];
  if (t.startsWith('ea')) return [...TYT_DERSLER, ...AYT_EA];
  if (t.startsWith('sozel')) return [...TYT_DERSLER, ...AYT_SOZ];
  if (t.startsWith('dil')) return [...TYT_DERSLER, ...AYT_DIL];
  return TYT_DERSLER;
}

// ─── Deneme tipleri ────────────────────────────────────────────────────────────
// Dönen değerler: 'lgs' | 'tyt' | 'ayt' | 'ydt' | 'brans'
export function denemeTipleriniBelirle(tur, sinif) {
  const t = (tur || '').toLowerCase();
  const s = efektifSinif(tur, sinif);

  if (t.includes('lgs') || s === 8) return ['lgs', 'brans'];
  if (s === 7 || (s === 0 && t.includes('ortaokul'))) return ['brans']; // ortaokul: sadece branş
  if (s === 9 || s === 10) return ['brans', 'tyt']; // TYMM: branş öncelikli
  if (s === 11) return ['tyt', 'ayt', 'brans'];
  if (t.startsWith('dil')) return ['tyt', 'ydt', 'brans'];
  if (t.startsWith('sayisal') || t.startsWith('ea') || t.startsWith('sozel'))
    return ['tyt', 'ayt', 'brans'];
  return ['tyt', 'brans'];
}

// ─── Müfredat anahtarları ─────────────────────────────────────────────────────
// Firestore: mufredat/{anahtar}/konular
export function mufredatAnahtarlariniBelirle(tur, sinif) {
  const t = (tur || '').toLowerCase();
  const s = efektifSinif(tur, sinif);

  if (t.includes('lgs') || s === 8) return ['lgs'];
  if (s === 7 || (s === 0 && t.includes('ortaokul'))) return ['ortaokul7'];
  if (s === 9) return ['lise9_tymm'];
  if (s === 10) return ['lise10_tymm'];
  if (s === 11) return ['tyt', 'gecis11'];
  if (t.startsWith('sayisal')) return ['tyt', 'ayt_sayisal'];
  if (t.startsWith('ea')) return ['tyt', 'ayt_ea'];
  if (t.startsWith('sozel')) return ['tyt', 'ayt_sozel'];
  if (t.startsWith('dil')) return ['tyt', 'ayt_dil'];
  return ['tyt'];
}

// ─── Geri sayım hedefi ────────────────────────────────────────────────────────
function gerisayimHedefiBelirle(sinavModu) {
  if (sinavModu === 'lgs') return 'lgs';
  if (sinavModu === 'yks' || sinavModu === 'gecis') return 'yks';
  return null;
}

// ─── Ana çözücü ───────────────────────────────────────────────────────────────
/**
 * @param {{ tur: string, sinif: number|string }} ogrenci
 * @returns {{
 *   sinavModu: 'lgs'|'yks'|'gecis'|'gelisim',
 *   programModu: 'sinav_programi'|'gecis_programi'|'gelisim_programi',
 *   dersSet: Array,
 *   denemeTipleri: string[],
 *   mufredatAnahtarlari: string[],
 *   gerisayimHedef: 'lgs'|'yks'|null,
 *   lgsOgrencisi: boolean,
 *   yksOgrencisi: boolean,
 *   arasinifOgrencisi: boolean,
 * }}
 */
export function ogrenciBaglaminiCoz({ tur, sinif } = {}) {
  const sinavModu = sinavModunuBelirle(tur, sinif);
  return {
    sinavModu,
    programModu: programModunuBelirle(sinavModu),
    dersSet: dersSetiniBelirle(tur, sinif),
    denemeTipleri: denemeTipleriniBelirle(tur, sinif),
    mufredatAnahtarlari: mufredatAnahtarlariniBelirle(tur, sinif),
    gerisayimHedef: gerisayimHedefiBelirle(sinavModu),
    lgsOgrencisi: sinavModu === 'lgs',
    yksOgrencisi: sinavModu === 'yks',
    arasinifOgrencisi: sinavModu === 'gelisim' || sinavModu === 'gecis',
  };
}
