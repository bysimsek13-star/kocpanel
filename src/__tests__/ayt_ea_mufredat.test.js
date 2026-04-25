import { aytEaKonular } from '../data/konularAytEa';
import { aytKonular } from '../data/konularAyt';
import { konuDuzListe, konuBasliklari } from '../utils/konuUtils';

describe('AYT EA müfredat — konularAytEa', () => {
  test('aytEaKonular dört dersi içeriyor', () => {
    expect(Object.keys(aytEaKonular)).toEqual(
      expect.arrayContaining(['aytmat', 'ede', 'tar', 'cog'])
    );
  });

  describe('aytmat', () => {
    const liste = aytEaKonular.aytmat;

    test('iki ana başlık var: AYT Matematik ve AYT Geometri', () => {
      const analar = liste.filter(k => k.startsWith('## '));
      expect(analar).toContain('## AYT Matematik');
      expect(analar).toContain('## AYT Geometri');
    });

    test('konuDuzListe başlıkları filtreler, gerçek konular kalır', () => {
      const duz = konuDuzListe(liste);
      expect(
        duz.every(k => !k.startsWith('## ') && !k.startsWith('# ') && !k.startsWith('### '))
      ).toBe(true);
      expect(duz.length).toBeGreaterThan(0);
    });

    test('Türev konusu düz listede mevcut', () => {
      const duz = konuDuzListe(liste);
      expect(duz).toContain('Türev Tanımı (Limit ile)');
    });

    test('konuBasliklari hiyerarşiyi doğru parse eder', () => {
      const parsed = konuBasliklari(liste);
      const analar = parsed.filter(p => p.tip === 'ana');
      expect(analar.length).toBeGreaterThanOrEqual(2);
      const gruplar = parsed.filter(p => p.tip === 'grup');
      expect(gruplar.length).toBeGreaterThan(0);
    });
  });

  describe('ede', () => {
    const liste = aytEaKonular.ede;

    test('ilk satır AYT Edebiyat ana başlığı', () => {
      expect(liste[0]).toBe('## AYT Türk Dili ve Edebiyatı');
    });

    test('konuDuzListe en az 50 gerçek konu döndürür', () => {
      expect(konuDuzListe(liste).length).toBeGreaterThan(50);
    });

    test('Yunus Emre konusu mevcut', () => {
      expect(konuDuzListe(liste)).toContain('Yunus Emre');
    });
  });

  describe('tar', () => {
    const liste = aytEaKonular.tar;

    test('ilk satır AYT Tarih-1 ana başlığı', () => {
      expect(liste[0]).toBe('## AYT Tarih-1');
    });

    test('konuDuzListe en az 30 gerçek konu döndürür', () => {
      expect(konuDuzListe(liste).length).toBeGreaterThan(30);
    });

    test('Lozan Barış Antlaşması konusu mevcut', () => {
      expect(konuDuzListe(liste)).toContain('Lozan Barış Antlaşması');
    });
  });

  describe('cog', () => {
    const liste = aytEaKonular.cog;

    test('ilk satır AYT Coğrafya-1 ana başlığı', () => {
      expect(liste[0]).toBe('## AYT Coğrafya-1');
    });

    test('konuDuzListe en az 30 gerçek konu döndürür', () => {
      expect(konuDuzListe(liste).length).toBeGreaterThan(30);
    });

    test('Sera Etkisi konusu mevcut', () => {
      expect(konuDuzListe(liste)).toContain('Sera Etkisi');
    });
  });
});

describe('aytKonular — konularAyt entegrasyonu', () => {
  test('aytKonular içinde aytEaKonular yayılmış', () => {
    expect(aytKonular.aytmat).toBeDefined();
    expect(aytKonular.ede).toBeDefined();
    expect(aytKonular.tar).toBeDefined();
    expect(aytKonular.cog).toBeDefined();
  });

  test('aytmat konuları prefix formatlı (başlık içeriyor)', () => {
    expect(aytKonular.aytmat.some(k => k.startsWith('## '))).toBe(true);
  });

  test('fiz ve kim flat listeler korunuyor', () => {
    expect(aytKonular.fiz.length).toBeGreaterThan(0);
    expect(aytKonular.fiz.every(k => !k.startsWith('## '))).toBe(true);
    expect(aytKonular.kim.length).toBeGreaterThan(0);
  });

  test('Sözel dersler (tar2, cog2, fel, din) hâlâ mevcut', () => {
    expect(aytKonular.tar2).toBeDefined();
    expect(aytKonular.cog2).toBeDefined();
    expect(aytKonular.fel).toBeDefined();
    expect(aytKonular.din).toBeDefined();
  });
});
