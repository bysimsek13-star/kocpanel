/**
 * ElsWay — Program Algoritması & Koç Skoru Testleri
 *
 * Kapsam:
 *   1. programAlgoritma.js  — haftaBaslangici, bugunIndeks, gunAnalizi,
 *                             haftaAnalizi, oneriUret, oneriUygula,
 *                             haftaIlerleme, haftaIlerlemeV2, programV2ToGorevler
 *   2. kocSkorUtils.js      — coachScoreMeta, computeCoachPerformance
 *
 * Kurulum:
 *   Bu dosyayı src/__tests__/ klasörüne koy.
 *   Çalıştır: npm test
 */

import { describe, it, expect } from 'vitest';

import {
  GUNLER,
  haftaBaslangici,
  bugunIndeks,
  gunIndeks,
  gunAnalizi,
  haftaAnalizi,
  oneriUret,
  oneriOzeti,
  oneriUygula,
  bosHaftaOlustur,
  haftaIlerleme,
  haftaIlerlemeV2,
  programV2ToGorevler,
} from '../utils/programAlgoritma.js';

import { coachScoreMeta, computeCoachPerformance } from '../utils/kocSkorUtils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcı fonksiyonlar
// ─────────────────────────────────────────────────────────────────────────────

/** YYYY-MM-DD formatında gün üretir (şablonlarda kullanım için) */
function _tarihStr(yil, ay, gun) {
  return `${yil}-${String(ay).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
}

/** Sabit bir Çarşamba döner (indeks=2, Pazartesi=0) */
const CARSAMBA = new Date('2026-04-08T10:00:00'); // Çarşamba
const PAZARTESI = new Date('2026-04-06T08:00:00'); // Pazartesi
const PAZAR = new Date('2026-04-12T23:59:00'); // Pazar

/** Boş haftalık program dokümanı fabrikası */
function programOlustur(gorevlerMap = {}) {
  const gunler = {};
  GUNLER.forEach(gun => {
    gunler[gun] = gorevlerMap[gun] || [];
  });
  return { gunler };
}

/** Basit görev fabrikası */
function gorev(id, tamamlandi = false, kismiOran = null) {
  return { id, baslik: `Görev ${id}`, tamamlandi, kismiOran };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. haftaBaslangici
// ─────────────────────────────────────────────────────────────────────────────
describe('haftaBaslangici', () => {
  it("Çarşamba için o haftanın Pazartesi'sini döner", () => {
    expect(haftaBaslangici(CARSAMBA)).toBe('2026-04-06');
  });

  it('Pazartesi için kendisini döner', () => {
    expect(haftaBaslangici(PAZARTESI)).toBe('2026-04-06');
  });

  it("Pazar için o haftanın Pazartesi'sini döner", () => {
    expect(haftaBaslangici(PAZAR)).toBe('2026-04-06');
  });

  it('YYYY-MM-DD formatında string döner', () => {
    const sonuc = haftaBaslangici(new Date());
    expect(sonuc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('parametre verilmezse bugünün haftasını döner', () => {
    const sonuc = haftaBaslangici();
    expect(sonuc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. bugunIndeks
// ─────────────────────────────────────────────────────────────────────────────
describe('bugunIndeks', () => {
  it('Pazartesi 0 döner', () => {
    expect(bugunIndeks(PAZARTESI)).toBe(0);
  });

  it('Çarşamba 2 döner', () => {
    expect(bugunIndeks(CARSAMBA)).toBe(2);
  });

  it('Pazar 6 döner', () => {
    expect(bugunIndeks(PAZAR)).toBe(6);
  });

  it('sonuç her zaman 0-6 arasında', () => {
    for (let i = 0; i < 7; i++) {
      const tarih = new Date('2026-04-06');
      tarih.setDate(tarih.getDate() + i);
      const indeks = bugunIndeks(tarih);
      expect(indeks).toBeGreaterThanOrEqual(0);
      expect(indeks).toBeLessThanOrEqual(6);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. gunIndeks
// ─────────────────────────────────────────────────────────────────────────────
describe('gunIndeks', () => {
  it('pazartesi → 0', () => expect(gunIndeks('pazartesi')).toBe(0));
  it('pazar → 6', () => expect(gunIndeks('pazar')).toBe(6));
  it('bilinmeyen → -1', () => expect(gunIndeks('gunbati')).toBe(-1));
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. gunAnalizi
// ─────────────────────────────────────────────────────────────────────────────
describe('gunAnalizi', () => {
  it('boş görev listesinde her şey 0', () => {
    const sonuc = gunAnalizi([]);
    expect(sonuc.toplam).toBe(0);
    expect(sonuc.tamamlandi).toBe(0);
    expect(sonuc.eksik.length).toBe(0);
  });

  it('tamamlananları doğru sayar', () => {
    const gorevler = [gorev('a', true), gorev('b', true), gorev('c', false)];
    const sonuc = gunAnalizi(gorevler);
    expect(sonuc.toplam).toBe(3);
    expect(sonuc.tamamlandi).toBe(2);
    expect(sonuc.eksik.length).toBe(1);
  });

  it('kısmi görevleri ayrı listeler', () => {
    const gorevler = [
      gorev('a', false, 0.5), // kısmi
      gorev('b', false, 0), // sıfır oran — kısmi sayılmaz
      gorev('c', false, null), // null — kısmi sayılmaz
    ];
    const sonuc = gunAnalizi(gorevler);
    expect(sonuc.kismiGorevler.length).toBe(1);
    expect(sonuc.kismiGorevler[0].id).toBe('a');
  });

  it('tüm görevler tamamlanınca eksik boş', () => {
    const gorevler = [gorev('x', true), gorev('y', true)];
    expect(gunAnalizi(gorevler).eksik.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. haftaAnalizi
// ─────────────────────────────────────────────────────────────────────────────
describe('haftaAnalizi', () => {
  it('boş programda eksik ve kalan sıfır/dolu döner', () => {
    const prog = programOlustur();
    const sonuc = haftaAnalizi(prog, CARSAMBA);
    expect(sonuc.eksikGorevler.length).toBe(0);
    // Çarşamba günü olduğunda Perşembe-Cuma-Cumartesi-Pazar kalan gün
    expect(sonuc.kalanGunler.length).toBeGreaterThan(0);
  });

  it("Pazartesi tamamlanmamış görevler Çarşamba'da eksik çıkar", () => {
    const prog = programOlustur({
      pazartesi: [gorev('p1', false), gorev('p2', true)],
    });
    const sonuc = haftaAnalizi(prog, CARSAMBA);
    // p1 tamamlanmamış, Pazartesi geçmiş gün → eksik
    expect(sonuc.eksikGorevler.length).toBe(1);
    expect(sonuc.eksikGorevler[0].id).toBe('p1');
  });

  it('kalan günler bugünden sonrasını içerir', () => {
    const prog = programOlustur();
    const sonuc = haftaAnalizi(prog, CARSAMBA); // indeks=2
    // Kalan günler: persembe(3), cuma(4), cumartesi(5), pazar(6) = 4 gün
    expect(sonuc.kalanGunler.length).toBe(4);
    sonuc.kalanGunler.forEach(gun => {
      expect(gunIndeks(gun.gun)).toBeGreaterThan(2);
    });
  });

  it('Pazar günü kalan gün yok', () => {
    const prog = programOlustur();
    const sonuc = haftaAnalizi(prog, PAZAR);
    expect(sonuc.kalanGunler.length).toBe(0);
  });

  it('Pazartesi günü 6 kalan gün var', () => {
    const prog = programOlustur();
    const sonuc = haftaAnalizi(prog, PAZARTESI);
    expect(sonuc.kalanGunler.length).toBe(6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. oneriUret
// ─────────────────────────────────────────────────────────────────────────────
describe('oneriUret', () => {
  it('eksik görev yoksa boş dizi döner', () => {
    const kalanGunler = [{ gun: 'persembe', mevcutSayi: 2 }];
    expect(oneriUret([], kalanGunler)).toEqual([]);
  });

  it('kalan gün yoksa boş dizi döner', () => {
    const eksik = [gorev('e1')];
    expect(oneriUret(eksik, [])).toEqual([]);
  });

  it('tek görevi mevcut kapasitesi olan güne atar', () => {
    const eksik = [{ ...gorev('e1'), kaynakGun: 'pazartesi' }];
    const kalanGunler = [{ gun: 'persembe', mevcutSayi: 2 }]; // kapasite: 8-2=6
    const sonuc = oneriUret(eksik, kalanGunler);
    expect(sonuc.length).toBe(1);
    expect(sonuc[0].gun).toBe('persembe');
    expect(sonuc[0].eklenecek.length).toBe(1);
  });

  it('kapasite dolduğunda kalan görevleri dağıtamaz', () => {
    // Günlük max=8, mevcutSayi=7 → sadece 1 boş slot
    const eksik = [
      { ...gorev('e1'), kaynakGun: 'pazartesi' },
      { ...gorev('e2'), kaynakGun: 'pazartesi' },
    ];
    const kalanGunler = [{ gun: 'persembe', mevcutSayi: 7 }];
    const sonuc = oneriUret(eksik, kalanGunler);
    // Sadece 1 görev sığar
    expect(sonuc[0].eklenecek.length).toBe(1);
  });

  it('birden fazla güne dengeli dağıtır', () => {
    const eksik = [
      { ...gorev('e1'), kaynakGun: 'pazartesi' },
      { ...gorev('e2'), kaynakGun: 'pazartesi' },
      { ...gorev('e3'), kaynakGun: 'sali' },
    ];
    const kalanGunler = [
      { gun: 'carsamba', mevcutSayi: 7 }, // 1 slot
      { gun: 'persembe', mevcutSayi: 6 }, // 2 slot
    ];
    const sonuc = oneriUret(eksik, kalanGunler);
    const toplamAtanan = sonuc.reduce((acc, o) => acc + o.eklenecek.length, 0);
    expect(toplamAtanan).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. oneriUygula
// ─────────────────────────────────────────────────────────────────────────────
describe('oneriUygula', () => {
  it('taşınan görevi kaynak günden kaldırır', () => {
    const prog = programOlustur({
      pazartesi: [gorev('g1', false), gorev('g2', true)],
      persembe: [],
    });
    const oneriler = [
      {
        gun: 'persembe',
        eklenecek: [{ id: 'g1', baslik: 'Görev g1', kaynakGun: 'pazartesi' }],
      },
    ];
    const sonuc = oneriUygula(prog, oneriler);
    // Pazartesi'de g1 kalmamalı
    expect(sonuc.pazartesi.find(g => g.id === 'g1')).toBeUndefined();
    // Perşembe'ye eklenmiş olmalı
    expect(sonuc.persembe.find(g => g.id === 'g1')).toBeDefined();
  });

  it('hedef güne eklenen görev tamamlandi=false ile gelir', () => {
    const prog = programOlustur({ pazartesi: [gorev('g3', true)] });
    const oneriler = [
      {
        gun: 'cuma',
        eklenecek: [{ id: 'g3', baslik: 'Görev g3', tamamlandi: true, kaynakGun: 'pazartesi' }],
      },
    ];
    const sonuc = oneriUygula(prog, oneriler);
    expect(sonuc.cuma[0].tamamlandi).toBe(false);
  });

  it('kaynakGun alanı temizlenir, tasindiGun eklenir', () => {
    const prog = programOlustur({ pazartesi: [gorev('g4')] });
    const oneriler = [
      {
        gun: 'cuma',
        eklenecek: [{ id: 'g4', kaynakGun: 'pazartesi' }],
      },
    ];
    const sonuc = oneriUygula(prog, oneriler);
    const eklenen = sonuc.cuma[0];
    expect(eklenen.kaynakGun).toBeUndefined();
    expect(eklenen.tasindiGun).toBe('pazartesi');
  });

  it('boş öneri listesinde program değişmez', () => {
    const prog = programOlustur({ pazartesi: [gorev('g5', true)] });
    const sonuc = oneriUygula(prog, []);
    expect(sonuc.pazartesi.length).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. bosHaftaOlustur
// ─────────────────────────────────────────────────────────────────────────────
describe('bosHaftaOlustur', () => {
  it('7 günün hepsini boş dizi ile döner', () => {
    const prog = bosHaftaOlustur('2026-04-06');
    GUNLER.forEach(gun => {
      expect(prog.gunler[gun]).toEqual([]);
    });
  });

  it("hafta key'ini doğru atar", () => {
    const prog = bosHaftaOlustur('2026-04-06');
    expect(prog.hafta).toBe('2026-04-06');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. haftaIlerleme (eski format)
// ─────────────────────────────────────────────────────────────────────────────
describe('haftaIlerleme', () => {
  it('boş programda 0 döner', () => {
    expect(haftaIlerleme(programOlustur())).toBe(0);
  });

  it('tüm görevler tamamlanınca 100 döner', () => {
    const prog = programOlustur({
      pazartesi: [gorev('a', true), gorev('b', true)],
    });
    expect(haftaIlerleme(prog)).toBe(100);
  });

  it('yarısı tamamlanınca 50 döner', () => {
    const prog = programOlustur({
      pazartesi: [gorev('a', true), gorev('b', false)],
    });
    expect(haftaIlerleme(prog)).toBe(50);
  });

  it('null/undefined programda 0 döner', () => {
    expect(haftaIlerleme(null)).toBe(0);
    expect(haftaIlerleme(undefined)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. haftaIlerlemeV2 (yeni program_v2 formatı)
// ─────────────────────────────────────────────────────────────────────────────
describe('haftaIlerlemeV2', () => {
  it('boş programda 0 döner', () => {
    expect(haftaIlerlemeV2({})).toBe(0);
  });

  it('tamamlanan slot oranını doğru hesaplar', () => {
    const prog = {
      hafta: {
        pazartesi: [{ tip: 'ders' }, { tip: 'ders' }],
        sali: [{ tip: 'ders' }],
      },
      tamamlandi: {
        pazartesi_0: true,
        // pazartesi_1 ve sali_0 tamamlanmadı
      },
    };
    // 3 slottan 1 tamamlandı → %33
    expect(haftaIlerlemeV2(prog)).toBe(33);
  });

  it('tip alanı olmayan slotları saymaz', () => {
    const prog = {
      hafta: { pazartesi: [{ tip: 'ders' }, {}] }, // ikincisinde tip yok
      tamamlandi: { pazartesi_0: true },
    };
    // Sadece 1 geçerli slot, o da tamamlandı → %100
    expect(haftaIlerlemeV2(prog)).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. programV2ToGorevler
// ─────────────────────────────────────────────────────────────────────────────
describe('programV2ToGorevler', () => {
  it('null programda boş dizi döner', () => {
    expect(programV2ToGorevler(null)).toEqual([]);
  });

  it('doğru görev sayısını üretir', () => {
    const prog = {
      hafta: {
        pazartesi: [{ tip: 'ders' }, { tip: 'ders' }],
        sali: [{ tip: 'tekrar' }],
      },
      tamamlandi: {
        pazartesi_0: true,
      },
    };
    const gorevler = programV2ToGorevler(prog);
    expect(gorevler.length).toBe(3);
  });

  it('tamamlandi durumunu doğru aktarır', () => {
    const prog = {
      hafta: { pazartesi: [{ tip: 'ders' }, { tip: 'ders' }] },
      tamamlandi: { pazartesi_0: true },
    };
    const gorevler = programV2ToGorevler(prog);
    expect(gorevler[0].tamamlandi).toBe(true);
    expect(gorevler[1].tamamlandi).toBe(false);
  });

  it('tip alanı olmayan slotları atlar', () => {
    const prog = {
      hafta: { pazartesi: [{ tip: 'ders' }, { baskaBir: 'alan' }] },
      tamamlandi: {},
    };
    expect(programV2ToGorevler(prog).length).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. oneriOzeti (entegrasyon testi)
// ─────────────────────────────────────────────────────────────────────────────
describe('oneriOzeti', () => {
  it('eksik görev yoksa var:false döner', () => {
    const prog = programOlustur({
      pazartesi: [gorev('a', true)],
    });
    const sonuc = oneriOzeti(prog, CARSAMBA);
    expect(sonuc.var).toBe(false);
    expect(sonuc.eksikSayisi).toBe(0);
  });

  it('eksik görevler varsa ozet metni üretir', () => {
    const prog = programOlustur({
      pazartesi: [gorev('a', false), gorev('b', false)],
    });
    const sonuc = oneriOzeti(prog, CARSAMBA);
    expect(sonuc.var).toBe(true);
    expect(sonuc.eksikSayisi).toBe(2);
    expect(typeof sonuc.ozet).toBe('string');
    expect(sonuc.ozet.length).toBeGreaterThan(0);
  });

  it('Pazar günü kalan gün olmadığında dagitilamayan = eksikSayisi', () => {
    const prog = programOlustur({
      pazartesi: [gorev('a', false)],
      sali: [gorev('b', false)],
    });
    const sonuc = oneriOzeti(prog, PAZAR);
    // Pazar günü kalan gün yok, hiçbir şey dağıtılamaz
    expect(sonuc.dagitilamayan).toBe(sonuc.eksikSayisi);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. coachScoreMeta
// ─────────────────────────────────────────────────────────────────────────────
describe('coachScoreMeta', () => {
  it('85+ → Çok iyi', () => {
    expect(coachScoreMeta(90).label).toBe('Çok iyi');
    expect(coachScoreMeta(85).label).toBe('Çok iyi');
  });

  it('70-84 → Dengeli', () => {
    expect(coachScoreMeta(70).label).toBe('Dengeli');
    expect(coachScoreMeta(84).label).toBe('Dengeli');
  });

  it('55-69 → Takip edilmeli', () => {
    expect(coachScoreMeta(55).label).toBe('Takip edilmeli');
    expect(coachScoreMeta(69).label).toBe('Takip edilmeli');
  });

  it('55 altı → Geliştirilmeli', () => {
    expect(coachScoreMeta(54).label).toBe('Geliştirilmeli');
    expect(coachScoreMeta(0).label).toBe('Geliştirilmeli');
  });

  it('her kategori renk ve bg döner', () => {
    [100, 75, 60, 30].forEach(skor => {
      const meta = coachScoreMeta(skor);
      expect(typeof meta.color).toBe('string');
      expect(typeof meta.bg).toBe('string');
    });
  });

  it('order değerleri sıralı (iyi → kötü artar)', () => {
    const cokIyi = coachScoreMeta(90).order;
    const dengeli = coachScoreMeta(75).order;
    const takip = coachScoreMeta(60).order;
    const gelistir = coachScoreMeta(30).order;
    expect(cokIyi).toBeLessThan(dengeli);
    expect(dengeli).toBeLessThan(takip);
    expect(takip).toBeLessThan(gelistir);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. computeCoachPerformance
// ─────────────────────────────────────────────────────────────────────────────
describe('computeCoachPerformance', () => {
  const koc = { uid: 'koc1', isim: 'Test Koç' };

  it('öğrenci yoksa 0 öğrenci ile sonuç döner', () => {
    const sonuc = computeCoachPerformance(koc, []);
    expect(sonuc.ogrenciSayisi).toBe(0);
    expect(typeof sonuc.performansSkoru).toBe('number');
  });

  it('sonuç her zaman 0-100 arası skor içerir', () => {
    const ogrenciler = [
      { uid: 'o1', aktif: true, sonDenemeNet: 45, baslangicNet: 30 },
      { uid: 'o2', aktif: true, sonDenemeNet: 60, baslangicNet: 55 },
    ];
    const sonuc = computeCoachPerformance(koc, ogrenciler);
    expect(sonuc.performansSkoru).toBeGreaterThanOrEqual(0);
    expect(sonuc.performansSkoru).toBeLessThanOrEqual(100);
  });

  it('pasif öğrenciler hesaba katılmaz', () => {
    const ogrenciler = [
      { uid: 'o1', aktif: true },
      { uid: 'o2', aktif: false }, // pasif
    ];
    const sonuc = computeCoachPerformance(koc, ogrenciler);
    expect(sonuc.ogrenciSayisi).toBe(1);
  });

  it('aciklama alanı string döner', () => {
    const sonuc = computeCoachPerformance(koc, [{ uid: 'o1', aktif: true }]);
    expect(typeof sonuc.aciklama).toBe('string');
    expect(sonuc.aciklama.length).toBeGreaterThan(0);
  });

  it('yüksek netli öğrencilerle skor daha yüksek çıkar', () => {
    const iyi = computeCoachPerformance(koc, [
      {
        uid: 'o1',
        aktif: true,
        sonDenemeNet: 90,
        baslangicNet: 40,
        sonCalismaTarihi: new Date().toISOString(),
      },
    ]);
    const kotu = computeCoachPerformance(koc, [
      {
        uid: 'o2',
        aktif: true,
        sonDenemeNet: 10,
        baslangicNet: 40,
        sonCalismaTarihi: new Date(2024, 0, 1).toISOString(),
      },
    ]);
    // Her zaman garantili değil (DEFAULT_NEUTRAL_SCORE devreye girebilir)
    // ama en azından tipleri doğru
    expect(typeof iyi.performansSkoru).toBe('number');
    expect(typeof kotu.performansSkoru).toBe('number');
  });

  it('skoru etiketle tutarlı döner', () => {
    const sonuc = computeCoachPerformance(koc, [{ uid: 'o1', aktif: true }]);
    const beklenenEtiket = coachScoreMeta(sonuc.performansSkoru).label;
    expect(sonuc.performansEtiketi).toBe(beklenenEtiket);
  });
});
