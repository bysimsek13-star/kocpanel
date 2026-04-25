import { aytTar2Konular } from '../data/konularAytTar2';
import { aytFelKonular } from '../data/konularAytFel';
import { aytDinKonular } from '../data/konularAytDin';
import { aytCogKonular } from '../data/konularAytCog';
import { aytKonular } from '../data/konularAyt';
import { konuDuzListe, konuBasliklari } from '../utils/konuUtils';

describe('AYT Sözel müfredat — ders bazlı dosyalar', () => {
  test('tar2, fel, din dosyaları mevcut ve dolu', () => {
    expect(aytTar2Konular.length).toBeGreaterThan(0);
    expect(aytFelKonular.length).toBeGreaterThan(0);
    expect(aytDinKonular.length).toBeGreaterThan(0);
  });

  describe('tar2', () => {
    test('ana başlık AYT Tarih-2', () => {
      expect(aytTar2Konular[0]).toBe('## AYT Tarih-2');
    });

    test('konuDuzListe gerçek konuları döndürür', () => {
      const duz = konuDuzListe(aytTar2Konular);
      expect(duz.length).toBeGreaterThan(10);
      expect(duz.some(k => k.includes('Soğuk Savaş'))).toBe(true);
    });
  });

  describe('cog2 referans testi', () => {
    test('cog2 cog ile aynı referans (kopya yok)', () => {
      expect(aytKonular.cog2).toBe(aytKonular.cog);
      expect(aytKonular.cog2).toBe(aytCogKonular);
    });

    test('cog2 prefix formatlı (başlık var)', () => {
      expect(aytKonular.cog2[0]).toBe('## AYT Coğrafya-1');
    });
  });

  describe('fel', () => {
    test('ana başlık AYT Felsefe Grubu', () => {
      expect(aytFelKonular[0]).toBe('## AYT Felsefe Grubu');
    });

    test('Psikoloji, Sosyoloji, Mantık, Felsefe bölümleri mevcut', () => {
      const altlar = konuBasliklari(aytFelKonular)
        .filter(p => p.tip === 'alt')
        .map(p => p.baslik);
      expect(altlar.some(b => b.includes('Psikoloji'))).toBe(true);
      expect(altlar.some(b => b.includes('Sosyoloji'))).toBe(true);
      expect(altlar.some(b => b.includes('Mantık'))).toBe(true);
      expect(altlar.some(b => b.includes('Felsefe'))).toBe(true);
    });

    test('konuDuzListe en az 40 konu döndürür', () => {
      expect(konuDuzListe(aytFelKonular).length).toBeGreaterThan(40);
    });
  });

  describe('din', () => {
    test('ana başlık Din Kültürü ve Ahlak Bilgisi', () => {
      expect(aytDinKonular[0]).toBe('## Din Kültürü ve Ahlak Bilgisi');
    });

    test('konuDuzListe en az 10 konu döndürür', () => {
      expect(konuDuzListe(aytDinKonular).length).toBeGreaterThan(10);
    });

    test('Hz. Muhammed bölümü mevcut', () => {
      expect(konuDuzListe(aytDinKonular).some(k => k.includes('Muhammed'))).toBe(true);
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
