import { aytFizKonular } from '../data/konularAytFiz';
import { aytKimKonular } from '../data/konularAytKim';
import { aytBiyKonular } from '../data/konularAytBiy';
import { aytMatKonular } from '../data/konularAytMat';
import { aytKonular } from '../data/konularAyt';
import { konuDuzListe, konuBasliklari } from '../utils/konuUtils';

describe('AYT Sayısal müfredat — ders bazlı dosyalar', () => {
  test('fiz, kim, biy dosyaları mevcut ve dolu', () => {
    expect(aytFizKonular.length).toBeGreaterThan(0);
    expect(aytKimKonular.length).toBeGreaterThan(0);
    expect(aytBiyKonular.length).toBeGreaterThan(0);
  });

  describe('fiz', () => {
    test('ana başlık AYT Fizik', () => {
      expect(aytFizKonular[0]).toBe('## AYT Fizik (14 soru)');
    });

    test('konuDuzListe başlıkları filtreler', () => {
      const duz = konuDuzListe(aytFizKonular);
      expect(
        duz.every(k => !k.startsWith('## ') && !k.startsWith('# ') && !k.startsWith('### '))
      ).toBe(true);
      expect(duz.length).toBeGreaterThan(0);
    });

    test('Mekanik, Elektrik, Modern Fizik ana bölümleri var', () => {
      const altlar = konuBasliklari(aytFizKonular)
        .filter(p => p.tip === 'alt')
        .map(p => p.baslik);
      expect(altlar.some(b => b.includes('Mekanik'))).toBe(true);
      expect(altlar.some(b => b.includes('Elektrik'))).toBe(true);
      expect(altlar.some(b => b.includes('Modern Fizik'))).toBe(true);
    });

    test('Isı ve Termodinamik listede yok (TYT konusu)', () => {
      expect(aytFizKonular.every(k => !k.includes('Termodinamik'))).toBe(true);
    });

    test('Dalga Mekaniği ve Kinematik mevcut', () => {
      const duz = konuDuzListe(aytFizKonular);
      expect(duz.some(k => k.includes('Doppler'))).toBe(true);
      expect(duz.some(k => k.includes('Yatay Atış'))).toBe(true);
    });
  });

  describe('kim', () => {
    test('ana başlık AYT Kimya', () => {
      expect(aytKimKonular[0]).toBe('## AYT Kimya (13 soru)');
    });

    test('konuDuzListe en az 30 konu döndürür', () => {
      expect(konuDuzListe(aytKimKonular).length).toBeGreaterThan(30);
    });

    test('Organik Kimya bölümü mevcut', () => {
      const duz = konuDuzListe(aytKimKonular);
      expect(duz.some(k => k.includes('Alkan'))).toBe(true);
      expect(duz.some(k => k.includes('Esterleşme'))).toBe(true);
    });
  });

  describe('biy', () => {
    test('ana başlık AYT Biyoloji', () => {
      expect(aytBiyKonular[0]).toBe('## AYT Biyoloji (13 soru)');
    });

    test('konuDuzListe en az 40 konu döndürür', () => {
      expect(konuDuzListe(aytBiyKonular).length).toBeGreaterThan(40);
    });

    test('Fotosentez ve Hücresel Solunum mevcut', () => {
      const duz = konuDuzListe(aytBiyKonular);
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
    expect(aytKonular.aytmat).toBe(aytMatKonular);
    expect(aytKonular.aytmat[0]).toBe('## AYT Matematik');
  });
});
