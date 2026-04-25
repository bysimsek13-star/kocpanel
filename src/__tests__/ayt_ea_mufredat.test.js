import { aytMatKonular } from '../data/konularAytMat';
import { aytEdeKonular } from '../data/konularAytEde';
import { aytTarKonular } from '../data/konularAytTar';
import { aytCogKonular } from '../data/konularAytCog';
import { aytKonular } from '../data/konularAyt';
import { konuDuzListe, konuBasliklari } from '../utils/konuUtils';

describe('AYT EA müfredat — ders bazlı dosyalar', () => {
  test('aytmat, ede, tar, cog dosyaları mevcut ve dolu', () => {
    expect(aytMatKonular.length).toBeGreaterThan(0);
    expect(aytEdeKonular.length).toBeGreaterThan(0);
    expect(aytTarKonular.length).toBeGreaterThan(0);
    expect(aytCogKonular.length).toBeGreaterThan(0);
  });

  describe('aytmat', () => {
    test('iki ana başlık var: AYT Matematik ve AYT Geometri', () => {
      const analar = aytMatKonular.filter(k => k.startsWith('## '));
      expect(analar).toContain('## AYT Matematik');
      expect(analar).toContain('## AYT Geometri');
    });

    test('konuDuzListe başlıkları filtreler, gerçek konular kalır', () => {
      const duz = konuDuzListe(aytMatKonular);
      expect(
        duz.every(k => !k.startsWith('## ') && !k.startsWith('# ') && !k.startsWith('### '))
      ).toBe(true);
      expect(duz.length).toBeGreaterThan(0);
    });

    test('Türev konusu düz listede mevcut', () => {
      expect(konuDuzListe(aytMatKonular)).toContain('Türev Tanımı (Limit ile)');
    });

    test('konuBasliklari hiyerarşiyi doğru parse eder', () => {
      const parsed = konuBasliklari(aytMatKonular);
      expect(parsed.filter(p => p.tip === 'ana').length).toBeGreaterThanOrEqual(2);
      expect(parsed.filter(p => p.tip === 'grup').length).toBeGreaterThan(0);
    });
  });

  describe('ede', () => {
    test('ilk satır AYT Edebiyat ana başlığı', () => {
      expect(aytEdeKonular[0]).toBe('## AYT Türk Dili ve Edebiyatı');
    });

    test('konuDuzListe en az 50 gerçek konu döndürür', () => {
      expect(konuDuzListe(aytEdeKonular).length).toBeGreaterThan(50);
    });

    test('Yunus Emre konusu mevcut', () => {
      expect(konuDuzListe(aytEdeKonular)).toContain('Yunus Emre');
    });
  });

  describe('tar', () => {
    test('ilk satır AYT Tarih-1 ana başlığı', () => {
      expect(aytTarKonular[0]).toBe('## AYT Tarih-1');
    });

    test('konuDuzListe en az 30 gerçek konu döndürür', () => {
      expect(konuDuzListe(aytTarKonular).length).toBeGreaterThan(30);
    });

    test('Lozan Barış Antlaşması konusu mevcut', () => {
      expect(konuDuzListe(aytTarKonular)).toContain('Lozan Barış Antlaşması');
    });
  });

  describe('cog', () => {
    test('ilk satır AYT Coğrafya-1 ana başlığı', () => {
      expect(aytCogKonular[0]).toBe('## AYT Coğrafya-1');
    });

    test('konuDuzListe en az 30 gerçek konu döndürür', () => {
      expect(konuDuzListe(aytCogKonular).length).toBeGreaterThan(30);
    });

    test('Sera Etkisi konusu mevcut', () => {
      expect(konuDuzListe(aytCogKonular)).toContain('Sera Etkisi');
    });
  });
});

describe('aytKonular — EA entegrasyonu', () => {
  test('aytmat, ede, tar, cog aytKonular içinde mevcut', () => {
    expect(aytKonular.aytmat).toBeDefined();
    expect(aytKonular.ede).toBeDefined();
    expect(aytKonular.tar).toBeDefined();
    expect(aytKonular.cog).toBeDefined();
  });

  test('aytmat konuları prefix formatlı (başlık içeriyor)', () => {
    expect(aytKonular.aytmat.some(k => k.startsWith('## '))).toBe(true);
  });

  test('cog2 aynı referans, kopya yok', () => {
    expect(aytKonular.cog2).toBe(aytKonular.cog);
  });

  test('fiz ve kim prefix formatlı listeler mevcut', () => {
    expect(aytKonular.fiz.length).toBeGreaterThan(0);
    expect(aytKonular.fiz[0]).toBe('## AYT Fizik (14 soru)');
    expect(aytKonular.kim.length).toBeGreaterThan(0);
  });

  test('Sözel dersler (tar2, cog2, fel, din) hâlâ mevcut', () => {
    expect(aytKonular.tar2).toBeDefined();
    expect(aytKonular.cog2).toBeDefined();
    expect(aytKonular.fel).toBeDefined();
    expect(aytKonular.din).toBeDefined();
  });
});
