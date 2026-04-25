import { aytSozelKonular } from '../data/konularAytSozel';
import { aytEaKonular } from '../data/konularAytEa';
import { aytKonular } from '../data/konularAyt';
import { konuDuzListe, konuBasliklari } from '../utils/konuUtils';

describe('AYT Sözel müfredat — konularAytSozel', () => {
  test('aytSozelKonular dört dersi içeriyor: tar2, cog2, fel, din', () => {
    expect(Object.keys(aytSozelKonular)).toEqual(
      expect.arrayContaining(['tar2', 'cog2', 'fel', 'din'])
    );
  });

  describe('tar2', () => {
    const liste = aytSozelKonular.tar2;

    test('ana başlık AYT Tarih-2', () => {
      expect(liste[0]).toBe('## AYT Tarih-2');
    });

    test('konuDuzListe gerçek konuları döndürür', () => {
      const duz = konuDuzListe(liste);
      expect(duz.length).toBeGreaterThan(10);
      expect(duz.some(k => k.includes('Soğuk Savaş'))).toBe(true);
    });
  });

  describe('cog2', () => {
    test('cog2 içeriği cog (Coğrafya-1) ile özdeş', () => {
      expect(aytSozelKonular.cog2).toEqual(aytEaKonular.cog);
    });

    test('cog2 prefix formatlı (başlık var)', () => {
      expect(aytSozelKonular.cog2[0]).toBe('## AYT Coğrafya-1');
    });
  });

  describe('fel', () => {
    const liste = aytSozelKonular.fel;

    test('ana başlık AYT Felsefe Grubu', () => {
      expect(liste[0]).toBe('## AYT Felsefe Grubu');
    });

    test('Psikoloji, Sosyoloji, Mantık, Felsefe bölümleri mevcut', () => {
      const altlar = konuBasliklari(liste)
        .filter(p => p.tip === 'alt')
        .map(p => p.baslik);
      expect(altlar.some(b => b.includes('Psikoloji'))).toBe(true);
      expect(altlar.some(b => b.includes('Sosyoloji'))).toBe(true);
      expect(altlar.some(b => b.includes('Mantık'))).toBe(true);
      expect(altlar.some(b => b.includes('Felsefe'))).toBe(true);
    });

    test('konuDuzListe en az 40 konu döndürür', () => {
      expect(konuDuzListe(liste).length).toBeGreaterThan(40);
    });
  });

  describe('din', () => {
    const liste = aytSozelKonular.din;

    test('ana başlık Din Kültürü ve Ahlak Bilgisi', () => {
      expect(liste[0]).toBe('## Din Kültürü ve Ahlak Bilgisi');
    });

    test('konuDuzListe en az 10 konu döndürür', () => {
      expect(konuDuzListe(liste).length).toBeGreaterThan(10);
    });

    test('Hz. Muhammed bölümü mevcut', () => {
      const duz = konuDuzListe(liste);
      expect(duz.some(k => k.includes('Muhammed'))).toBe(true);
    });
  });
});

describe('aytKonular — Sözel entegrasyonu', () => {
  test('tar2, cog2, fel, din aytKonular içinde prefix formatlı', () => {
    expect(aytKonular.tar2[0]).toBe('## AYT Tarih-2');
    expect(aytKonular.cog2[0]).toBe('## AYT Coğrafya-1');
    expect(aytKonular.fel[0]).toBe('## AYT Felsefe Grubu');
    expect(aytKonular.din[0]).toBe('## Din Kültürü ve Ahlak Bilgisi');
  });

  test('EA ve Sayısal bozulmadı', () => {
    expect(aytKonular.aytmat[0]).toBe('## AYT Matematik');
    expect(aytKonular.fiz[0]).toBe('## AYT Fizik (14 soru)');
    expect(aytKonular.ede[0]).toBe('## AYT Türk Dili ve Edebiyatı');
  });

  test('yabdil flat liste olarak korunuyor', () => {
    expect(aytKonular.yabdil.length).toBeGreaterThan(0);
    expect(aytKonular.yabdil.every(k => !k.startsWith('## '))).toBe(true);
  });
});
