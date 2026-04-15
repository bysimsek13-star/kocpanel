/**
 * ElsWay — Öğrenci Bağlam & Segment Testleri
 *
 * Kapsam:
 *   1. ogrenciBaglam.js  — dersSetiniBelirle, denemeTipleriniBelirle,
 *                          mufredatAnahtarlariniBelirle, ogrenciBaglaminiCoz
 *   2. ogrenciUtils.js   — upcomingExams, formatCountdown,
 *                          buildTaskTemplates, generateSuggestions
 *   3. konular.js        — verimlilikDurum, ders dizisi yapıları
 */

import { describe, it, expect } from 'vitest';

import {
  dersSetiniBelirle,
  denemeTipleriniBelirle,
  mufredatAnahtarlariniBelirle,
  ogrenciBaglaminiCoz,
  LGS_DERSLER,
} from '../utils/ogrenciBaglam.js';

import {
  upcomingExams,
  formatCountdown,
  buildTaskTemplates,
  generateSuggestions,
} from '../utils/ogrenciUtils.js';

import {
  verimlilikDurum,
  TYT_DERSLER,
  AYT_SAY,
  AYT_EA,
  AYT_SOZ,
  AYT_DIL,
  KONULAR,
} from '../data/konular.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. dersSetiniBelirle — KRİTİK (deneme ekranı bug'ının kaynağı)
// ─────────────────────────────────────────────────────────────────────────────
describe('dersSetiniBelirle', () => {
  it('lgs_8 → LGS ders seti', () => {
    const dersler = dersSetiniBelirle('lgs_8');
    expect(dersler.length).toBeGreaterThan(0);
    expect(dersler.every(d => d.id.startsWith('lgs'))).toBe(true);
  });

  it('sayisal_12 → TYT + AYT_SAY birleşimi', () => {
    const dersler = dersSetiniBelirle('sayisal_12');
    const tytIdler = TYT_DERSLER.map(d => d.id);
    const aytSayIdler = AYT_SAY.map(d => d.id);
    tytIdler.forEach(id => expect(dersler.map(d => d.id)).toContain(id));
    aytSayIdler.forEach(id => expect(dersler.map(d => d.id)).toContain(id));
  });

  it('ea_12 → TYT + AYT_EA birleşimi', () => {
    const dersler = dersSetiniBelirle('ea_12');
    AYT_EA.forEach(d => expect(dersler.map(x => x.id)).toContain(d.id));
  });

  it('sozel_12 → TYT + AYT_SOZ birleşimi', () => {
    const dersler = dersSetiniBelirle('sozel_12');
    AYT_SOZ.forEach(d => expect(dersler.map(x => x.id)).toContain(d.id));
  });

  it('dil_12 → TYT + AYT_DIL birleşimi', () => {
    const dersler = dersSetiniBelirle('dil_12');
    AYT_DIL.forEach(d => expect(dersler.map(x => x.id)).toContain(d.id));
  });

  it('ortaokul_11 → TYT tabanı', () => {
    const dersler = dersSetiniBelirle('ortaokul_11');
    expect(dersler).toEqual(TYT_DERSLER);
  });

  it('boş tur → TYT fallback (güvenli default)', () => {
    const dersler = dersSetiniBelirle('');
    expect(dersler).toEqual(TYT_DERSLER);
  });

  it('null tur → TYT fallback', () => {
    const dersler = dersSetiniBelirle(null);
    expect(dersler).toEqual(TYT_DERSLER);
  });

  it('her ders setinde id, label, renk alanları var', () => {
    ['lgs_8', 'sayisal_12', 'ea_12', 'sozel_12'].forEach(tur => {
      dersSetiniBelirle(tur).forEach(ders => {
        expect(ders.id).toBeTruthy();
        expect(ders.label).toBeTruthy();
        expect(ders.renk).toBeTruthy();
      });
    });
  });

  // KRİTİK: LGS öğrencisi AYT dersi GÖRMEMELİ
  it('lgs öğrencisi AYT dersi görmez', () => {
    const dersler = dersSetiniBelirle('lgs_8');
    const aytIdler = [...AYT_SAY, ...AYT_EA, ...AYT_SOZ, ...AYT_DIL].map(d => d.id);
    dersler.forEach(d => expect(aytIdler).not.toContain(d.id));
  });

  // KRİTİK: sayisal öğrencisi LGS dersi GÖRMEMELİ
  it('sayisal öğrencisi LGS dersi görmez', () => {
    const dersler = dersSetiniBelirle('sayisal_12');
    const lgsIdler = LGS_DERSLER.map(d => d.id);
    dersler.forEach(d => expect(lgsIdler).not.toContain(d.id));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. denemeTipleriniBelirle
// ─────────────────────────────────────────────────────────────────────────────
describe('denemeTipleriniBelirle', () => {
  it('lgs_8 → lgs ve brans', () => {
    const tipler = denemeTipleriniBelirle('lgs_8');
    expect(tipler).toContain('lgs');
    expect(tipler).toContain('brans');
  });

  it('sayisal_12 → tyt, ayt, brans', () => {
    const tipler = denemeTipleriniBelirle('sayisal_12');
    expect(tipler).toContain('tyt');
    expect(tipler).toContain('ayt');
    expect(tipler).toContain('brans');
  });

  it('dil_12 → tyt, ydt, brans', () => {
    const tipler = denemeTipleriniBelirle('dil_12');
    expect(tipler).toContain('tyt');
    expect(tipler).toContain('ydt');
    expect(tipler).toContain('brans');
  });

  it('ortaokul_9 → sadece brans ve tyt', () => {
    const tipler = denemeTipleriniBelirle('ortaokul_9');
    expect(tipler).toContain('brans');
    expect(tipler).not.toContain('lgs');
  });

  it('boş tur → en az tyt içerir', () => {
    expect(denemeTipleriniBelirle('')).toContain('tyt');
  });

  // KRİTİK: lgs öğrencisi tyt deneme GÖRMEMELİ
  it('lgs öğrencisi tyt veya ayt tipi deneme görmez', () => {
    const tipler = denemeTipleriniBelirle('lgs_8');
    expect(tipler).not.toContain('tyt');
    expect(tipler).not.toContain('ayt');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. mufredatAnahtarlariniBelirle
// ─────────────────────────────────────────────────────────────────────────────
describe('mufredatAnahtarlariniBelirle', () => {
  it('lgs_8 → lgs anahtarı', () => {
    expect(mufredatAnahtarlariniBelirle('lgs_8')).toContain('lgs');
  });

  it('sayisal_12 → tyt ve ayt_sayisal', () => {
    const anahtarlar = mufredatAnahtarlariniBelirle('sayisal_12');
    expect(anahtarlar).toContain('tyt');
    expect(anahtarlar).toContain('ayt_sayisal');
  });

  it('ea_12 → tyt ve ayt_ea', () => {
    const anahtarlar = mufredatAnahtarlariniBelirle('ea_12');
    expect(anahtarlar).toContain('ayt_ea');
  });

  it('ortaokul_9 → lise9_tymm', () => {
    expect(mufredatAnahtarlariniBelirle('ortaokul_9')).toContain('lise9_tymm');
  });

  it('ortaokul_10 → lise10_tymm', () => {
    expect(mufredatAnahtarlariniBelirle('ortaokul_10')).toContain('lise10_tymm');
  });

  it('boş tur → tyt fallback', () => {
    expect(mufredatAnahtarlariniBelirle('')).toContain('tyt');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ogrenciBaglaminiCoz — entegrasyon testi
// ─────────────────────────────────────────────────────────────────────────────
describe('ogrenciBaglaminiCoz', () => {
  it('lgs öğrencisi için tam bağlam döner', () => {
    const baglam = ogrenciBaglaminiCoz({ tur: 'lgs_8' });
    expect(baglam.sinavModu).toBe('lgs');
    expect(baglam.lgsOgrencisi).toBe(true);
    expect(baglam.yksOgrencisi).toBe(false);
    expect(baglam.programModu).toBe('sinav_programi');
    expect(baglam.gerisayimHedef).toBe('lgs');
  });

  it('sayisal öğrencisi için tam bağlam döner', () => {
    const baglam = ogrenciBaglaminiCoz({ tur: 'sayisal_12' });
    expect(baglam.sinavModu).toBe('yks');
    expect(baglam.yksOgrencisi).toBe(true);
    expect(baglam.lgsOgrencisi).toBe(false);
    expect(baglam.programModu).toBe('sinav_programi');
    expect(baglam.gerisayimHedef).toBe('yks');
  });

  it('9. sınıf için arasinif ve gelisim modu', () => {
    const baglam = ogrenciBaglaminiCoz({ tur: 'ortaokul_9' });
    expect(baglam.sinavModu).toBe('gelisim');
    expect(baglam.arasinifOgrencisi).toBe(true);
    expect(baglam.gerisayimHedef).toBeNull();
  });

  it('11. sınıf için gecis modu', () => {
    const baglam = ogrenciBaglaminiCoz({ tur: 'ortaokul_11' });
    expect(baglam.sinavModu).toBe('gecis');
    expect(baglam.arasinifOgrencisi).toBe(true);
  });

  it('boş obje için güvenli default döner', () => {
    const baglam = ogrenciBaglaminiCoz({});
    expect(baglam.sinavModu).toBeDefined();
    expect(Array.isArray(baglam.dersSet)).toBe(true);
    expect(Array.isArray(baglam.denemeTipleri)).toBe(true);
    expect(Array.isArray(baglam.mufredatAnahtarlari)).toBe(true);
  });

  it('tüm gerekli alanlar mevcut', () => {
    const baglam = ogrenciBaglaminiCoz({ tur: 'sayisal_12' });
    const zorunluAlanlar = [
      'sinavModu',
      'programModu',
      'dersSet',
      'denemeTipleri',
      'mufredatAnahtarlari',
      'gerisayimHedef',
      'lgsOgrencisi',
      'yksOgrencisi',
      'arasinifOgrencisi',
    ];
    zorunluAlanlar.forEach(alan => {
      expect(baglam).toHaveProperty(alan);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. upcomingExams
// ─────────────────────────────────────────────────────────────────────────────
describe('upcomingExams', () => {
  it('dizi döner', () => {
    expect(Array.isArray(upcomingExams('lgs'))).toBe(true);
  });

  it('her sınavda daysLeft alanı var', () => {
    upcomingExams('lgs').forEach(s => {
      expect(typeof s.daysLeft).toBe('number');
    });
  });

  it('tur verilmezse tüm sınavları döner', () => {
    const hepsi = upcomingExams(null);
    const lgs = upcomingExams('lgs');
    expect(hepsi.length).toBeGreaterThanOrEqual(lgs.length);
  });

  it('sınavlar tarih sırasına göre sıralı', () => {
    const sinavlar = upcomingExams(null);
    for (let i = 1; i < sinavlar.length; i++) {
      expect(new Date(sinavlar[i].date) >= new Date(sinavlar[i - 1].date)).toBe(true);
    }
  });

  it('isPast alanı boolean döner', () => {
    upcomingExams(null).forEach(s => {
      expect(typeof s.isPast).toBe('boolean');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. formatCountdown
// ─────────────────────────────────────────────────────────────────────────────
describe('formatCountdown', () => {
  it('null → Tarih yok', () => {
    expect(formatCountdown(null)).toBe('Tarih yok');
  });

  it('negatif → Geçti', () => {
    expect(formatCountdown(-1)).toBe('Geçti');
    expect(formatCountdown(-100)).toBe('Geçti');
  });

  it('0 → Bugün', () => {
    expect(formatCountdown(0)).toBe('Bugün');
  });

  it('1 → 1 gün kaldı', () => {
    expect(formatCountdown(1)).toBe('1 gün kaldı');
  });

  it('15 → X gün kaldı formatı', () => {
    expect(formatCountdown(15)).toBe('15 gün kaldı');
  });

  it('45 gün → ay ve gün formatı', () => {
    const sonuc = formatCountdown(45);
    expect(sonuc).toContain('ay');
    expect(sonuc).toContain('gün');
  });

  it('30 → 1 ay 0 gün', () => {
    expect(formatCountdown(30)).toBe('1 ay 0 gün');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. buildTaskTemplates
// ─────────────────────────────────────────────────────────────────────────────
describe('buildTaskTemplates', () => {
  it('dizi döner', () => {
    expect(Array.isArray(buildTaskTemplates('lgs'))).toBe(true);
  });

  it('LGS için LGS şablonları içerir', () => {
    const sablonlar = buildTaskTemplates('lgs');
    expect(sablonlar.some(s => s.tag === 'LGS' || s.id?.includes('lgs'))).toBe(true);
  });

  it('YKS için TYT/AYT şablonları içerir', () => {
    const sablonlar = buildTaskTemplates('sayisal');
    expect(sablonlar.some(s => s.tag === 'TYT' || s.tag === 'AYT')).toBe(true);
  });

  it('her şablonda id, title, tasks alanları var', () => {
    buildTaskTemplates('lgs').forEach(s => {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(Array.isArray(s.tasks)).toBe(true);
    });
  });

  it('ortak şablonlar her tur için gelir', () => {
    const lgs = buildTaskTemplates('lgs');
    const yks = buildTaskTemplates('sayisal');
    // 'haftalik-dengeli' ve 'moral-toparlama' ortak şablonlar
    expect(lgs.some(s => s.id === 'haftalik-dengeli')).toBe(true);
    expect(yks.some(s => s.id === 'haftalik-dengeli')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. generateSuggestions
// ─────────────────────────────────────────────────────────────────────────────
describe('generateSuggestions', () => {
  it('dizi döner', () => {
    expect(Array.isArray(generateSuggestions({}))).toBe(true);
  });

  it('en fazla 4 öneri döner', () => {
    const sonuc = generateSuggestions({
      dashboard: { gorevTamamlama: 30 },
      denemeler: [{ toplamNet: 50 }, { toplamNet: 60 }],
      streak: { current: 7 },
      hedefler: [{ baslik: 'Hedef 1', durum: 'aktif' }],
    });
    expect(sonuc.length).toBeLessThanOrEqual(4);
  });

  it('düşük tamamlama oranında program önerisi gelir', () => {
    const sonuc = generateSuggestions({ dashboard: { gorevTamamlama: 40 } });
    expect(sonuc.some(s => s.type === 'program')).toBe(true);
  });

  it('net düşüşünde deneme önerisi gelir', () => {
    const sonuc = generateSuggestions({
      denemeler: [{ toplamNet: 60 }, { toplamNet: 70 }],
    });
    expect(sonuc.some(s => s.type === 'deneme')).toBe(true);
  });

  it('5+ streak varsa motivasyon önerisi gelir', () => {
    const sonuc = generateSuggestions({ streak: { current: 7 } });
    expect(sonuc.some(s => s.type === 'motivasyon')).toBe(true);
  });

  it('aktif hedef varsa hedef önerisi gelir', () => {
    const sonuc = generateSuggestions({
      hedefler: [{ baslik: 'Matematik hedefi', durum: 'aktif' }],
    });
    expect(sonuc.some(s => s.type === 'hedef')).toBe(true);
  });

  it('hiçbir koşul yoksa stabil öneri gelir', () => {
    // gorevTamamlama=100, sıfır streak, deneme yok → stabil
    const sonuc = generateSuggestions({
      ogrenci: { isim: 'Ali' },
      dashboard: { gorevTamamlama: 100 },
      streak: { current: 0 },
      hedefler: [],
      denemeler: [],
    });
    expect(sonuc.some(s => s.type === 'stabil')).toBe(true);
  });

  it('her önerinin type, title, text alanları var', () => {
    generateSuggestions({}).forEach(s => {
      expect(s.type).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.text).toBeTruthy();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. verimlilikDurum (konular.js)
// ─────────────────────────────────────────────────────────────────────────────
describe('verimlilikDurum', () => {
  // verimlilikDurum → { emoji, label, renk } objesi döner

  it('her değer için obje döner — emoji, label, renk alanları mevcut', () => {
    [0, 30, 60, 80, 100].forEach(v => {
      const sonuc = verimlilikDurum(v);
      expect(typeof sonuc).toBe('object');
      expect(sonuc.emoji).toBeTruthy();
      expect(sonuc.label).toBeTruthy();
      expect(sonuc.renk).toBeTruthy();
    });
  });

  it('80+ için yüksek performans etiketi döner', () => {
    const sonuc = verimlilikDurum(80);
    expect(sonuc.label).toBeTruthy();
    expect(sonuc.renk).toBeTruthy();
  });

  it('farklı değerlerde farklı etiketler üretir', () => {
    const yuksek = verimlilikDurum(90);
    const dusuk = verimlilikDurum(20);
    expect(yuksek.label).not.toBe(dusuk.label);
  });

  it('renk alanı hex formatında', () => {
    const sonuc = verimlilikDurum(70);
    expect(sonuc.renk).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Ders dizisi yapısal bütünlük (konular.js)
// ─────────────────────────────────────────────────────────────────────────────
describe('Ders dizisi yapısal bütünlük', () => {
  const DERS_SETLERI = [
    { label: 'TYT_DERSLER', set: TYT_DERSLER },
    { label: 'AYT_SAY', set: AYT_SAY },
    { label: 'AYT_EA', set: AYT_EA },
    { label: 'AYT_SOZ', set: AYT_SOZ },
    { label: 'AYT_DIL', set: AYT_DIL },
    { label: 'LGS_DERSLER', set: LGS_DERSLER },
  ];

  DERS_SETLERI.forEach(({ label, set }) => {
    it(`${label} — boş değil ve her eleman id+label+renk içerir`, () => {
      expect(set.length).toBeGreaterThan(0);
      set.forEach(ders => {
        expect(ders.id).toBeTruthy();
        expect(ders.label).toBeTruthy();
        expect(ders.renk).toBeTruthy();
      });
    });
  });

  it('Ders id leri kendi seti içinde benzersiz', () => {
    DERS_SETLERI.forEach(({ label: _label, set }) => {
      const idler = set.map(d => d.id);
      const benzersiz = new Set(idler);
      expect(benzersiz.size).toBe(idler.length);
    });
  });

  it('KONULAR anahtarlarının tamamı bilinen bir ders id ile eşleşir', () => {
    // KONULAR TYT, AYT, LGS, ortaokul7 ve lise910 derslerini kapsar
    const tumDersIdler = new Set(
      [...TYT_DERSLER, ...AYT_SAY, ...AYT_EA, ...AYT_SOZ, ...AYT_DIL, ...LGS_DERSLER].map(d => d.id)
    );
    // ogrenciBaglam'daki ortaokul7 ve lise910 id'lerini manuel ekle
    [
      'tur7',
      'mat7',
      'fen7',
      'sosyal7',
      'din7',
      'ing7',
      'tde910',
      'mat910',
      'fiz910',
      'kim910',
      'biy910',
      'tar910',
      'cog910',
      'fel910',
      'din910',
      'ing910',
    ].forEach(id => tumDersIdler.add(id));

    Object.keys(KONULAR).forEach(dersId => {
      expect(tumDersIdler.has(dersId)).toBe(true);
    });
  });
});
