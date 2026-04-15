/**
 * Yeni Testler — Saf Fonksiyon Utilities
 * Kapsam: adminUtils, ogrenciUtils
 */
import { describe, it, expect, vi } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// adminUtils
// ─────────────────────────────────────────────────────────────────────────────
import {
  destekTipleri,
  duyuruRenk,
  funnelYuzde,
  aktivasyonRozet,
  sonDuyurulariGetir,
  destekOzetiniGetir,
} from '../utils/adminUtils';

describe('destekTipleri', () => {
  it('dizi olmalı', () => {
    expect(Array.isArray(destekTipleri)).toBe(true);
  });
  it('her tipin value, label, icon alanı var', () => {
    destekTipleri.forEach(t => {
      expect(t).toHaveProperty('value');
      expect(t).toHaveProperty('label');
      expect(t).toHaveProperty('icon');
    });
  });
  it('"teknik" ve "hesap" tipleri mevcut', () => {
    expect(destekTipleri.find(t => t.value === 'teknik')).toBeDefined();
    expect(destekTipleri.find(t => t.value === 'hesap')).toBeDefined();
  });
});

describe('duyuruRenk()', () => {
  it('kritik seviye için kırmızı tonu döner', () => {
    const r = duyuruRenk({ seviye: 'kritik' });
    expect(r.text).toContain('#F43F5E');
    expect(r).toHaveProperty('bg');
    expect(r).toHaveProperty('border');
  });
  it('guncelleme seviye için yeşil tonu döner', () => {
    const r = duyuruRenk({ seviye: 'guncelleme' });
    expect(r.text).toContain('#10B981');
  });
  it('varsayılan seviye için mor tonu döner', () => {
    const r = duyuruRenk({});
    expect(r.text).toContain('#5B4FE8');
  });
  it('boş obje ile çalışır', () => {
    expect(() => duyuruRenk()).not.toThrow();
  });
});

describe('funnelYuzde()', () => {
  it('toplam 0 ise 0 döner', () => {
    expect(funnelYuzde(0, 10)).toBe(0);
    expect(funnelYuzde(null, 10)).toBe(0);
  });
  it('doğru oran hesaplar', () => {
    expect(funnelYuzde(100, 50)).toBe(50);
    expect(funnelYuzde(200, 100)).toBe(50);
    expect(funnelYuzde(100, 100)).toBe(100);
  });
  it('100 üzerine çıkmaz', () => {
    expect(funnelYuzde(100, 200)).toBe(100);
  });
  it('0 altına inmez', () => {
    expect(funnelYuzde(100, -5)).toBe(0);
  });
});

describe('aktivasyonRozet()', () => {
  it('80+ puan için "Güçlü" döner', () => {
    const r = aktivasyonRozet(80);
    expect(r.label).toBe('Güçlü');
    expect(r.renk).toContain('#10B981');
  });
  it('80 için "Güçlü" döner', () => {
    expect(aktivasyonRozet(80).label).toBe('Güçlü');
  });
  it('50–79 için "Orta" döner', () => {
    expect(aktivasyonRozet(50).label).toBe('Orta');
    expect(aktivasyonRozet(65).label).toBe('Orta');
  });
  it('50 altı için "Riskli" döner', () => {
    expect(aktivasyonRozet(49).label).toBe('Riskli');
    expect(aktivasyonRozet(0).label).toBe('Riskli');
  });
  it('her sonuç bg ve renk alanına sahip', () => {
    [0, 50, 80].forEach(sk => {
      const r = aktivasyonRozet(sk);
      expect(r).toHaveProperty('renk');
      expect(r).toHaveProperty('bg');
    });
  });
});

describe('sonDuyurulariGetir()', () => {
  it('getDocs çağrılır ve aktif duyurular döner', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'd1', data: () => ({ baslik: 'Aktif', aktif: true }) },
        { id: 'd2', data: () => ({ baslik: 'Pasif', aktif: false }) },
      ],
    });
    const sonuc = await sonDuyurulariGetir();
    expect(Array.isArray(sonuc)).toBe(true);
    expect(sonuc.find(d => d.baslik === 'Aktif')).toBeDefined();
    expect(sonuc.find(d => d.baslik === 'Pasif')).toBeUndefined();
  });
});

describe('destekOzetiniGetir()', () => {
  it('açık/bekliyor/kapalı sayıları döner', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: 't1', data: () => ({ durum: 'acik' }) },
        { id: 't2', data: () => ({ durum: 'acik' }) },
        { id: 't3', data: () => ({ durum: 'beklemede' }) },
        { id: 't4', data: () => ({ durum: 'kapali' }) },
      ],
    });
    const ozet = await destekOzetiniGetir();
    expect(ozet.acik).toBe(2);
    expect(ozet.bekliyor).toBe(1);
    expect(ozet.kapali).toBe(1);
    expect(Array.isArray(ozet.son)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ogrenciUtils
// ─────────────────────────────────────────────────────────────────────────────
import {
  SINAV_TAKVIMI,
  upcomingExams,
  formatCountdown,
  normalizeDateId,
  calculateStreak,
  buildTaskTemplates,
  generateSuggestions,
} from '../utils/ogrenciUtils';

describe('SINAV_TAKVIMI', () => {
  it('dizi ve en az 3 sınav içerir', () => {
    expect(Array.isArray(SINAV_TAKVIMI)).toBe(true);
    expect(SINAV_TAKVIMI.length).toBeGreaterThanOrEqual(3);
  });
  it('her kaydın key, label, date, turler alanı var', () => {
    SINAV_TAKVIMI.forEach(s => {
      expect(s).toHaveProperty('key');
      expect(s).toHaveProperty('label');
      expect(s).toHaveProperty('date');
      expect(Array.isArray(s.turler)).toBe(true);
    });
  });
});

describe('upcomingExams()', () => {
  it('tur yoksa tüm sınavlar döner', () => {
    const list = upcomingExams(null);
    expect(list.length).toBe(SINAV_TAKVIMI.length);
  });
  it('TYT filtresiyle ilgili sınavlar döner', () => {
    const list = upcomingExams('TYT');
    expect(list.length).toBeGreaterThan(0);
    list.forEach(e => {
      expect(e.turler.some(t => t.toUpperCase().includes('TYT'))).toBe(true);
    });
  });
  it('LGS filtresiyle LGS sınavı döner', () => {
    const list = upcomingExams('LGS');
    expect(list.find(e => e.key === 'lgs')).toBeDefined();
  });
  it('daysLeft alanı hesaplanır', () => {
    const list = upcomingExams(null);
    list.forEach(e => {
      expect(typeof e.daysLeft).toBe('number');
    });
  });
});

describe('formatCountdown()', () => {
  it('null için "Tarih yok" döner', () => {
    expect(formatCountdown(null)).toBe('Tarih yok');
  });
  it('negatif için "Geçti" döner', () => {
    expect(formatCountdown(-1)).toBe('Geçti');
  });
  it('0 için "Bugün" döner', () => {
    expect(formatCountdown(0)).toBe('Bugün');
  });
  it('1 için "1 gün kaldı" döner', () => {
    expect(formatCountdown(1)).toBe('1 gün kaldı');
  });
  it('15 için gün formatı döner', () => {
    expect(formatCountdown(15)).toBe('15 gün kaldı');
  });
  it('60+ gün için ay formatı döner', () => {
    const sonuc = formatCountdown(62);
    expect(sonuc).toContain('ay');
  });
});

describe('normalizeDateId()', () => {
  it('null için null döner', () => {
    expect(normalizeDateId(null)).toBeNull();
    expect(normalizeDateId('')).toBeNull();
  });
  it('YYYY-MM-DD formatındaki string aynen döner', () => {
    expect(normalizeDateId('2024-06-15')).toBe('2024-06-15');
  });
  it('toDate() olan Timestamp işlenir', () => {
    const ts = { toDate: () => new Date('2024-01-15') };
    expect(normalizeDateId(ts)).toBe('2024-01-15');
  });
  it('Date objesi işlenir', () => {
    expect(normalizeDateId(new Date('2024-03-20'))).toBe('2024-03-20');
  });
  it('geçersiz değer için null döner', () => {
    expect(normalizeDateId('gecersiz')).toBeNull();
  });
});

describe('calculateStreak()', () => {
  it('boş kayıtlarda 0 döner', () => {
    const r = calculateStreak([]);
    expect(r.current).toBe(0);
    expect(r.best).toBe(0);
  });

  it('bugün çalışıldıysa current 1+', () => {
    const bugun = new Date();
    const fmt = d =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const records = [{ tarih: fmt(bugun) }];
    const r = calculateStreak(records);
    expect(r.current).toBeGreaterThanOrEqual(1);
  });

  it('3 ardışık günde best=3', () => {
    const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
    const r = calculateStreak(dates.map(tarih => ({ tarih })));
    expect(r.best).toBe(3);
  });

  it('consistency 0–100 arasında', () => {
    const r = calculateStreak([{ tarih: '2024-01-01' }]);
    expect(r.consistency).toBeGreaterThanOrEqual(0);
    expect(r.consistency).toBeLessThanOrEqual(100);
  });

  it('lastStudyDate en son tarihi verir', () => {
    const records = [{ tarih: '2024-01-01' }, { tarih: '2024-01-05' }, { tarih: '2024-01-03' }];
    const r = calculateStreak(records);
    expect(r.lastStudyDate).toBe('2024-01-05');
  });
});

describe('buildTaskTemplates()', () => {
  it('her tur için en az 2 şablon döner', () => {
    ['LGS', 'TYT', 'AYT', null].forEach(tur => {
      const list = buildTaskTemplates(tur);
      expect(list.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('her şablonun id, title, tasks alanı var', () => {
    const list = buildTaskTemplates('TYT');
    list.forEach(t => {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('title');
      expect(Array.isArray(t.tasks)).toBe(true);
    });
  });

  it('LGS için özel şablonlar içerir', () => {
    const list = buildTaskTemplates('LGS');
    expect(list.some(t => t.tag === 'LGS')).toBe(true);
  });

  it('AYT için AYT şablonu içerir', () => {
    const list = buildTaskTemplates('AYT');
    expect(list.some(t => t.tag === 'AYT')).toBe(true);
  });
});

describe('generateSuggestions()', () => {
  it('veri yoksa "stabil" öneri döner', () => {
    const list = generateSuggestions({});
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0]).toHaveProperty('type');
    expect(list[0]).toHaveProperty('title');
    expect(list[0]).toHaveProperty('text');
  });

  it('tamamlama düşükse "program" önerisi gelir', () => {
    const list = generateSuggestions({
      dashboard: { gorevTamamlama: 40 },
    });
    expect(list.find(s => s.type === 'program')).toBeDefined();
  });

  it('net düşüşünde "deneme" önerisi gelir', () => {
    const list = generateSuggestions({
      denemeler: [{ toplamNet: 50 }, { toplamNet: 60 }],
    });
    expect(list.find(s => s.type === 'deneme')).toBeDefined();
  });

  it('streak 5+ ise motivasyon önerisi gelir', () => {
    const list = generateSuggestions({
      streak: { current: 7 },
    });
    expect(list.find(s => s.type === 'motivasyon')).toBeDefined();
  });

  it('aktif hedef varsa hedef önerisi gelir', () => {
    const list = generateSuggestions({
      hedefler: [{ baslik: 'TYT 80 Net', durum: 'aktif' }],
    });
    expect(list.find(s => s.type === 'hedef')).toBeDefined();
  });

  it('en fazla 4 öneri döner', () => {
    const list = generateSuggestions({
      dashboard: { gorevTamamlama: 40 },
      denemeler: [{ toplamNet: 50 }, { toplamNet: 60 }],
      streak: { current: 7 },
      hedefler: [{ baslik: 'Hedef', durum: 'aktif' }],
    });
    expect(list.length).toBeLessThanOrEqual(4);
  });
});

// denemeUtils — saf fonksiyon testleri
import {
  turdenAlan,
  sinavSecenekleri,
  alanKilitli,
  AYT_ALANLAR,
  AYT_MAP,
} from '../ogrenci/deneme/denemeUtils';

describe('denemeUtils', () => {
  describe('turdenAlan', () => {
    it('sayisal türü SAY döner', () => expect(turdenAlan('sayisal')).toBe('SAY'));
    it('ea türü EA döner', () => expect(turdenAlan('ea')).toBe('EA'));
    it('sozel türü SÖZ döner', () => expect(turdenAlan('sozel')).toBe('SÖZ'));
    it('dil türü DİL döner', () => expect(turdenAlan('dil')).toBe('DİL'));
    it('bilinmeyen SAY döner', () => expect(turdenAlan('bilinmeyen')).toBe('SAY'));
    it('null SAY döner', () => expect(turdenAlan(null)).toBe('SAY'));
  });

  describe('sinavSecenekleri', () => {
    it('lgs türü [LGS] döner', () => expect(sinavSecenekleri('lgs', 0)).toEqual(['LGS']));
    it('8. sınıf [LGS] döner', () => expect(sinavSecenekleri(null, 8)).toEqual(['LGS']));
    it('7. sınıf [Branş] döner', () => expect(sinavSecenekleri(null, 7)).toEqual(['Branş']));
    it('9. sınıf [TYT, Branş] döner', () =>
      expect(sinavSecenekleri(null, 9)).toEqual(['TYT', 'Branş']));
    it('tyt türü [TYT] döner', () => expect(sinavSecenekleri('tyt', 0)).toEqual(['TYT']));
    it('sayisal türü [TYT, AYT] döner', () =>
      expect(sinavSecenekleri('sayisal', 12)).toEqual(['TYT', 'AYT']));
  });

  describe('alanKilitli', () => {
    it('sayisal türü kilitlidir', () => expect(alanKilitli('sayisal')).toBe(true));
    it('ea türü kilitlidir', () => expect(alanKilitli('ea')).toBe(true));
    it('tyt türü kilitli değildir', () => expect(alanKilitli('tyt')).toBe(false));
    it('null kilitli değildir', () => expect(alanKilitli(null)).toBe(false));
  });

  it('AYT_ALANLAR 4 alan içerir', () => expect(AYT_ALANLAR).toHaveLength(4));
  it('AYT_MAP SAY anahtarı içerir', () => expect(AYT_MAP).toHaveProperty('SAY'));
});

// ─────────────────────────────────────────────────────────────────────────────
// istatistiklerUtils
// ─────────────────────────────────────────────────────────────────────────────
import {
  TUM_DERSLER_IST,
  ARALIK_SECENEKLER,
  hesaplaKpiler,
  hesaplaNetTrend,
  hesaplaOgrenciDurum,
  hesaplaZayifKonular,
} from '../koc/istatistiklerUtils';

describe('TUM_DERSLER_IST ve ARALIK_SECENEKLER', () => {
  it('TUM_DERSLER_IST dizi içerir', () => {
    expect(Array.isArray(TUM_DERSLER_IST)).toBe(true);
    expect(TUM_DERSLER_IST.length).toBeGreaterThan(0);
  });
  it('ARALIK_SECENEKLER 3 seçenek içerir', () => {
    expect(ARALIK_SECENEKLER).toHaveLength(3);
    expect(ARALIK_SECENEKLER[0]).toHaveProperty('label');
    expect(ARALIK_SECENEKLER[0]).toHaveProperty('deger');
  });
});

describe('hesaplaKpiler()', () => {
  const ogrenciler = [{ id: 'o1' }, { id: 'o2' }];
  const veriler = {
    den: {
      o1: [{ toplamNet: '20' }, { toplamNet: '18' }],
      o2: [{ toplamNet: '30' }],
    },
    cal: {
      o1: [{ tarih: '2099-01-01', saat: 3 }],
      o2: [{ tarih: '2099-01-01', saat: 2 }],
    },
    prog2: { o1: [], o2: [] },
  };

  it('n öğrenci sayısını döner', () => {
    const r = hesaplaKpiler(ogrenciler, veriler, null);
    expect(r.n).toBe(2);
  });

  it('ortSonNet doğru hesaplar', () => {
    const r = hesaplaKpiler(ogrenciler, veriler, null);
    expect(r.ortSonNet).toBe('25.0'); // (20+30)/2
  });

  it('topCalisma aralik filtresiz toplam döner', () => {
    const r = hesaplaKpiler(ogrenciler, veriler, null);
    expect(r.topCalisma).toBe(5);
  });

  it('boş veri için — döner', () => {
    const r = hesaplaKpiler([], { den: {}, cal: {}, prog2: {} }, null);
    expect(r.ortSonNet).toBe('—');
  });
});

describe('hesaplaNetTrend()', () => {
  it('tek tarihte iki öğrencinin ortalamasını alır', () => {
    const hedefOgrenciler = [{ id: 'o1' }, { id: 'o2' }];
    const filtreliDen = {
      o1: [{ tarih: '2024-03-01', toplamNet: '20' }],
      o2: [{ tarih: '2024-03-01', toplamNet: '30' }],
    };
    const r = hesaplaNetTrend(hedefOgrenciler, filtreliDen);
    expect(r).toHaveLength(1);
    expect(r[0].tarih).toBe('03-01');
    expect(r[0].net).toBe(25.0);
  });

  it('tarih eksikse atlar', () => {
    const r = hesaplaNetTrend([{ id: 'o1' }], { o1: [{ toplamNet: '10' }] });
    expect(r).toHaveLength(0);
  });

  it('boş veri için boş dizi döner', () => {
    expect(hesaplaNetTrend([], {})).toEqual([]);
  });
});

describe('hesaplaOgrenciDurum()', () => {
  it('sonNet ve netFark hesaplar', () => {
    const ogrenciler = [{ id: 'o1', isim: 'Ali Yılmaz' }];
    const veriler = {
      den: { o1: [{ toplamNet: '20' }, { toplamNet: '15' }] },
      cal: { o1: [] },
      prog2: { o1: [] },
    };
    const r = hesaplaOgrenciDurum(ogrenciler, veriler);
    expect(r[0].sonNet).toBe(20);
    expect(r[0].netFark).toBe(5);
  });

  it('hiç deneme yoksa sonNet null döner', () => {
    const r = hesaplaOgrenciDurum([{ id: 'o1', isim: 'Test' }], {
      den: { o1: [] },
      cal: { o1: [] },
      prog2: { o1: [] },
    });
    expect(r[0].sonNet).toBeNull();
  });
});

describe('hesaplaZayifKonular()', () => {
  it('yanlis 2 puan, bos 1 puan alır', () => {
    const hedef = [{ id: 'o1' }];
    const filtreli = {
      o1: [
        {
          netler: {
            mat: {
              yanlisKonular: ['Limit'],
              bosKonular: ['Türev'],
            },
          },
        },
      ],
    };
    const r = hesaplaZayifKonular(hedef, filtreli);
    const matDers = r.find(d => d.dersId === 'mat');
    expect(matDers).toBeDefined();
    const limitKonu = matDers.konular.find(k => k.konu === 'Limit');
    const turevKonu = matDers.konular.find(k => k.konu === 'Türev');
    expect(limitKonu.skor).toBe(2);
    expect(turevKonu.skor).toBe(1);
  });

  it('boş veri için boş dizi döner', () => {
    expect(hesaplaZayifKonular([], {})).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// veliRaporlariUtils
// ─────────────────────────────────────────────────────────────────────────────
import { addDays, fmt, waMetniOlustur } from '../koc/veliRaporlariUtils';

describe('addDays()', () => {
  it('gün ekler', () => {
    expect(addDays('2024-01-01', 6)).toBe('2024-01-07');
  });
  it('ay sınırını geçer', () => {
    expect(addDays('2024-01-28', 4)).toBe('2024-02-01');
  });
  it('0 gün aynı tarihi döner', () => {
    expect(addDays('2024-03-15', 0)).toBe('2024-03-15');
  });
});

describe('fmt()', () => {
  it('boş string için — döner', () => {
    expect(fmt('')).toBe('—');
  });
  it('null için — döner', () => {
    expect(fmt(null)).toBe('—');
  });
  it('geçerli tarih için lokalize string döner', () => {
    const r = fmt('2024-03-01');
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
    expect(r).not.toBe('—');
  });
});

describe('waMetniOlustur()', () => {
  const baseArgs = {
    ogrenci: { isim: 'Ali Veli', tur: 'sayisal' },
    secilenHafta: '2024-03-04',
    haftaBitis: '2024-03-10',
    gunVerileri: [],
    denemeler: [],
    kocNotu: '',
    ozet: { calismaGun: 3, toplamSaat: '6.0', gorevOran: 75, sonDenemeNet: 45 },
  };

  it('öğrenci adını içerir', () => {
    const r = waMetniOlustur(baseArgs);
    expect(r).toContain('Ali Veli');
  });

  it('ozet bilgilerini içerir', () => {
    const r = waMetniOlustur(baseArgs);
    expect(r).toContain('3 gün');
    expect(r).toContain('6.0 saat');
    expect(r).toContain('%75');
  });

  it('koç notu eklenince metinde görünür', () => {
    const r = waMetniOlustur({ ...baseArgs, kocNotu: 'Harika ilerleme!' });
    expect(r).toContain('Harika ilerleme!');
    expect(r).toContain('KOÇ NOTU');
  });

  it('deneme sonucu eklenince DENEME SONUÇLARI bölümü çıkar', () => {
    const r = waMetniOlustur({
      ...baseArgs,
      denemeler: [{ ad: 'TYT Deneme 1', toplamNet: '55' }],
    });
    expect(r).toContain('DENEME SONUÇLARI');
    expect(r).toContain('TYT Deneme 1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// sistemDurumuUtils
// ─────────────────────────────────────────────────────────────────────────────
import {
  onceOnce,
  mobilMi,
  rolRenk,
  lcpRenk,
  lcpEtiket,
  saglikDurumu,
} from '../admin/sistemDurumuUtils';

describe('mobilMi()', () => {
  it('Android UA mobil döner', () => expect(mobilMi('Android Chrome')).toBe('📱'));
  it('iPhone UA mobil döner', () => expect(mobilMi('iPhone Safari')).toBe('📱'));
  it('Desktop UA masaüstü döner', () => expect(mobilMi('Windows Chrome')).toBe('🖥️'));
  it('boş string masaüstü döner', () => expect(mobilMi('')).toBe('🖥️'));
});

describe('rolRenk()', () => {
  it('ogrenci mavi döner', () => expect(rolRenk('ogrenci')).toBe('#5B4FE8'));
  it('koc yeşil döner', () => expect(rolRenk('koc')).toBe('#10B981'));
  it('bilinmeyen gri döner', () => expect(rolRenk('admin')).toBe('#6B7280'));
});

describe('lcpRenk() ve lcpEtiket()', () => {
  it('2000ms iyi renk', () => expect(lcpRenk(2000)).toBe('#10B981'));
  it('3000ms orta renk', () => expect(lcpRenk(3000)).toBe('#F59E0B'));
  it('5000ms yavaş renk', () => expect(lcpRenk(5000)).toBe('#F43F5E'));
  it('— için gri renk', () => expect(lcpRenk('—')).toBe('#6B7280'));
  it('2000ms İyi etiket', () => expect(lcpEtiket(2000)).toBe('İyi'));
  it('3000ms Orta etiket', () => expect(lcpEtiket(3000)).toBe('Orta'));
  it('5000ms Yavaş etiket', () => expect(lcpEtiket(5000)).toBe('Yavaş'));
});

describe('saglikDurumu()', () => {
  it('hata yoksa Normal döner', () => {
    const r = saglikDurumu(0, 0);
    expect(r.etiket).toBe('Normal');
    expect(r.ikon).toBe('🟢');
  });
  it('5+ 1s hata Kritik döner', () => {
    const r = saglikDurumu(5, 0);
    expect(r.etiket).toBe('Kritik');
    expect(r.ikon).toBe('🔴');
  });
  it('2+ 1s hata Dikkat döner', () => {
    const r = saglikDurumu(2, 0);
    expect(r.etiket).toBe('Dikkat');
    expect(r.ikon).toBe('🟡');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// mufredatUtils
// ─────────────────────────────────────────────────────────────────────────────
import { dersiRenk, RENK_HARITASI, DURUM } from '../ogrenci/mufredatUtils';

describe('dersiRenk()', () => {
  it('Matematik için mavi döner', () => expect(dersiRenk('Matematik')).toBe('#5B4FE8'));
  it('Türkçe için sarı döner', () => expect(dersiRenk('Türkçe')).toBe('#F59E0B'));
  it('bilinmeyen ders için gri döner', () => expect(dersiRenk('Bilinmeyen Ders')).toBe('#6B7280'));
  it('kısmi eşleşme çalışır', () => expect(dersiRenk('Temel Matematik')).toBe('#5B4FE8'));
});

describe('RENK_HARITASI', () => {
  it('obje olmalı', () => expect(typeof RENK_HARITASI).toBe('object'));
  it('Fizik anahtarı içerir', () => expect(RENK_HARITASI).toHaveProperty('Fizik'));
});

describe('DURUM', () => {
  it('tamamlandi ve eksik anahtarlarını içerir', () => {
    expect(DURUM).toHaveProperty('tamamlandi');
    expect(DURUM).toHaveProperty('eksik');
  });
  it('tamamlandi label ve renk içerir', () => {
    expect(DURUM.tamamlandi).toHaveProperty('label', 'Tamamlandı');
    expect(DURUM.tamamlandi).toHaveProperty('renk');
  });
});
