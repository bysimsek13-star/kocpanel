import { aytSayisalKonular } from '../data/konularAytSayisal';
import { aytKonular } from '../data/konularAyt';
import { konuDuzListe, konuBasliklari } from '../utils/konuUtils';

describe('AYT Sayısal müfredat — konularAytSayisal', () => {
  test('aytSayisalKonular üç dersi içeriyor: fiz, kim, biy', () => {
    expect(Object.keys(aytSayisalKonular)).toEqual(expect.arrayContaining(['fiz', 'kim', 'biy']));
    expect(Object.keys(aytSayisalKonular)).not.toContain('aytmat');
  });

  describe('fiz', () => {
    const liste = aytSayisalKonular.fiz;

    test('ana başlık AYT Fizik', () => {
      expect(liste[0]).toBe('## AYT Fizik (14 soru)');
    });

    test('konuDuzListe başlıkları filtreler', () => {
      const duz = konuDuzListe(liste);
      expect(
        duz.every(k => !k.startsWith('## ') && !k.startsWith('# ') && !k.startsWith('### '))
      ).toBe(true);
      expect(duz.length).toBeGreaterThan(0);
    });

    test('Mekanik, Elektrik, Modern Fizik ana bölümleri var', () => {
      const analar = konuBasliklari(liste)
        .filter(p => p.tip === 'alt')
        .map(p => p.baslik);
      expect(analar.some(b => b.includes('Mekanik'))).toBe(true);
      expect(analar.some(b => b.includes('Elektrik'))).toBe(true);
      expect(analar.some(b => b.includes('Modern Fizik'))).toBe(true);
    });

    test('Isı ve Termodinamik listede yok (TYT konusu)', () => {
      expect(liste.every(k => !k.includes('Termodinamik'))).toBe(true);
    });

    test('Dalga Mekaniği ve Kinematik mevcut', () => {
      const duz = konuDuzListe(liste);
      expect(duz.some(k => k.includes('Doppler'))).toBe(true);
      expect(duz.some(k => k.includes('Yatay Atış'))).toBe(true);
    });
  });

  describe('kim', () => {
    const liste = aytSayisalKonular.kim;

    test('ana başlık AYT Kimya', () => {
      expect(liste[0]).toBe('## AYT Kimya (13 soru)');
    });

    test('konuDuzListe en az 30 konu döndürür', () => {
      expect(konuDuzListe(liste).length).toBeGreaterThan(30);
    });

    test('Organik Kimya bölümü mevcut', () => {
      const duz = konuDuzListe(liste);
      expect(duz.some(k => k.includes('Alkan'))).toBe(true);
      expect(duz.some(k => k.includes('Esterleşme'))).toBe(true);
    });
  });

  describe('biy', () => {
    const liste = aytSayisalKonular.biy;

    test('ana başlık AYT Biyoloji', () => {
      expect(liste[0]).toBe('## AYT Biyoloji (13 soru)');
    });

    test('konuDuzListe en az 40 konu döndürür', () => {
      expect(konuDuzListe(liste).length).toBeGreaterThan(40);
    });

    test('Fotosentez ve Hücresel Solunum mevcut', () => {
      const duz = konuDuzListe(liste);
      expect(duz.some(k => k.includes('Calvin'))).toBe(true);
      expect(duz.some(k => k.includes('Krebs'))).toBe(true);
    });
  });
});

describe('aytKonular — Sayısal entegrasyonu', () => {
  test('fiz, kim, biy aytKonular içinde prefix formatlı', () => {
    expect(aytKonular.fiz[0]).toBe('## AYT Fizik (14 soru)');
    expect(aytKonular.kim[0]).toBe('## AYT Kimya (13 soru)');
    expect(aytKonular.biy[0]).toBe('## AYT Biyoloji (13 soru)');
  });

  test('aytmat EA ortaklığı bozulmadı', () => {
    expect(aytKonular.aytmat[0]).toBe('## AYT Matematik');
  });
});
