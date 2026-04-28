import { konuIdOlustur, konulariParse } from '../utils/konuTakipUtils';
import { dersOzetiHesapla, saatFormat, kaynakEtiketleri } from '../utils/dersOzetiUtils';

describe('konuIdOlustur', () => {
  test('boşlukları alt çizgiye çevirir', () => {
    expect(konuIdOlustur('mat', 'Türev Alma')).toBe('mat_türev_alma');
  });

  test('büyük harfleri küçüğe çevirir', () => {
    expect(konuIdOlustur('fiz', 'Newton Yasaları')).toBe('fiz_newton_yasaları');
  });

  test('boş konu → genel', () => {
    expect(konuIdOlustur('mat', '')).toBe('mat_genel');
    expect(konuIdOlustur('mat', null)).toBe('mat_genel');
  });

  test('özel karakterler alt çizgiye dönüşür', () => {
    expect(konuIdOlustur('kim', 'Asit-Baz')).toContain('kim_');
  });

  test('ardışık alt çizgiler birleşir', () => {
    const id = konuIdOlustur('mat', 'A  B');
    expect(id).not.toContain('__');
  });
});

describe('konulariParse', () => {
  test('virgülle ayrılmış konuları dizi döner', () => {
    expect(konulariParse('Türev, Limit, İntegral')).toEqual(['Türev', 'Limit', 'İntegral']);
  });

  test('boş string → ["Genel"]', () => {
    expect(konulariParse('')).toEqual(['Genel']);
    expect(konulariParse(null)).toEqual(['Genel']);
  });

  test('tek konu', () => {
    expect(konulariParse('Türev')).toEqual(['Türev']);
  });

  test('baş/sondaki boşlukları temizler', () => {
    expect(konulariParse('  Türev  ,  Limit  ')).toEqual(['Türev', 'Limit']);
  });
});

describe('dersOzetiHesapla', () => {
  const konuTakipListesi = [
    { dersId: 'mat', konuAdi: 'Türev', durum: 'tamamlandi', videoSaat: 1, soruSayisi: 20 },
    { dersId: 'mat', konuAdi: 'Limit', durum: 'calisiliyor', videoSaat: 0.5, soruSayisi: 10 },
    { dersId: 'fiz', konuAdi: 'Mekanik', durum: 'tekrar', videoSaat: 2, soruSayisi: 15 },
  ];
  const mufredatDersler = [{ id: 'mat' }, { id: 'fiz' }, { id: 'kim' }];

  test('ders bazlı gruplama doğru', () => {
    const { dersBazliOzet } = dersOzetiHesapla(konuTakipListesi, mufredatDersler);
    expect(dersBazliOzet.mat.toplamKonu).toBe(2);
    expect(dersBazliOzet.mat.tamamlananKonu).toBe(1);
    expect(dersBazliOzet.fiz.tekrarBekleyenKonu).toBe(1);
  });

  test('genel özet toplam doğru', () => {
    const { genelOzet } = dersOzetiHesapla(konuTakipListesi, mufredatDersler);
    expect(genelOzet.toplamKonu).toBe(3);
    expect(genelOzet.toplamVideoSaat).toBeCloseTo(3.5);
    expect(genelOzet.toplamSoruSayisi).toBe(45);
  });

  test('çalışılmayan dersler doğru tespit ediliyor', () => {
    const { genelOzet } = dersOzetiHesapla(konuTakipListesi, mufredatDersler);
    expect(genelOzet.calisilmayanDersler).toContain('kim');
    expect(genelOzet.calisilmayanDersler).not.toContain('mat');
  });

  test('boş liste gelince sıfır döner', () => {
    const { genelOzet } = dersOzetiHesapla([], mufredatDersler);
    expect(genelOzet.toplamKonu).toBe(0);
    expect(genelOzet.calisilmayanDersler).toHaveLength(3);
  });
});

describe('saatFormat', () => {
  test('1.5 → "1s 30dk"', () => expect(saatFormat(1.5)).toBe('1s 30dk'));
  test('0.5 → "30dk"', () => expect(saatFormat(0.5)).toBe('30dk'));
  test('2 → "2s"', () => expect(saatFormat(2)).toBe('2s'));
  test('0 → null', () => expect(saatFormat(0)).toBeNull());
  test('null → null', () => expect(saatFormat(null)).toBeNull());
});

describe('kaynakEtiketleri', () => {
  test('["program", "video"] → "Program, Video"', () => {
    expect(kaynakEtiketleri(['program', 'video'])).toBe('Program, Video');
  });

  test('boş dizi → ""', () => {
    expect(kaynakEtiketleri([])).toBe('');
  });

  test('bilinmeyen kaynak olduğu gibi döner', () => {
    expect(kaynakEtiketleri(['bilinmeyen'])).toBe('bilinmeyen');
  });
});
