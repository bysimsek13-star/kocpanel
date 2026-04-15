/**
 * ElsWay — Tarih Yardımcıları & Timeline Testleri
 *
 * Kapsam:
 *   1. tarih.js        — bugunStr, dateToStr, bugunGunAdi, haftaBasStr
 *   2. timelineUtils.js — gunFarki, parseDateSafe, haftalikOzetOlustur,
 *                         mufredatHaritasiOlustur, gorusmeTimelineOlustur
 */

import { describe, it, expect } from 'vitest';

import { bugunStr, dateToStr, bugunGunAdi, haftaBasStr } from '../utils/tarih.js';

import {
  gunFarki,
  parseDateSafe,
  haftalikOzetOlustur,
  mufredatHaritasiOlustur,
  gorusmeTimelineOlustur,
} from '../utils/timelineUtils.js';

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
function gunSonra(n = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function gunOnce(n = 0) {
  return gunSonra(-n);
}

// ─── 1. bugunStr ──────────────────────────────────────────────────────────────
describe('bugunStr', () => {
  it('YYYY-MM-DD formatında string döner', () => {
    expect(bugunStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('bugünün gerçek tarihiyle eşleşir', () => {
    const bugun = new Date();
    const beklenen = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
    expect(bugunStr()).toBe(beklenen);
  });
});

// ─── 2. dateToStr ─────────────────────────────────────────────────────────────
describe('dateToStr', () => {
  it('Date nesnesini YYYY-MM-DD formatına çevirir', () => {
    expect(dateToStr(new Date(2026, 3, 10))).toBe('2026-04-10');
  });

  it('Ocak ayını 01 ile yazar', () => {
    expect(dateToStr(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('Aralık ayını 12 ile yazar', () => {
    expect(dateToStr(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('tek haneli gün ve ayı sıfır ile tamamlar', () => {
    expect(dateToStr(new Date(2026, 2, 3))).toBe('2026-03-03');
  });
});

// ─── 3. bugunGunAdi ───────────────────────────────────────────────────────────
describe('bugunGunAdi', () => {
  const GECERLI = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];

  it('geçerli bir gün adı döner', () => {
    expect(GECERLI).toContain(bugunGunAdi());
  });
});

// ─── 4. haftaBasStr ───────────────────────────────────────────────────────────
describe('haftaBasStr', () => {
  it('YYYY-MM-DD formatında string döner', () => {
    expect(haftaBasStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('dönen tarih Pazartesi günüdür', () => {
    const d = new Date(haftaBasStr() + 'T00:00:00');
    expect(d.getDay()).toBe(1);
  });

  it('bu haftanın içinde kalır (0-6 gün farkı)', () => {
    const pazartesi = new Date(haftaBasStr() + 'T00:00:00');
    const fark = Math.round((new Date() - pazartesi) / 86400000);
    expect(fark).toBeGreaterThanOrEqual(0);
    expect(fark).toBeLessThanOrEqual(6);
  });
});

// ─── 5. gunFarki ─────────────────────────────────────────────────────────────
describe('gunFarki', () => {
  it('null için null döner', () => {
    expect(gunFarki(null)).toBeNull();
  });

  it('3 gün öncesi için ~3 döner', () => {
    const fark = gunFarki(gunOnce(3).toISOString());
    expect(fark).toBeGreaterThanOrEqual(2);
    expect(fark).toBeLessThanOrEqual(3);
  });

  it('gelecek tarih için negatif döner', () => {
    expect(gunFarki(gunSonra(1).toISOString())).toBeLessThan(0);
  });

  it('iki tarih arasındaki fark 10 gün', () => {
    const bas = new Date('2026-01-01');
    const bit = new Date('2026-01-11');
    expect(gunFarki(bas, bit)).toBe(10);
  });
});

// ─── 6. parseDateSafe ────────────────────────────────────────────────────────
describe('parseDateSafe', () => {
  it('null için null döner', () => {
    expect(parseDateSafe(null)).toBeNull();
  });

  it('geçersiz string için null döner', () => {
    expect(parseDateSafe('bozuk-tarih-xxx')).toBeNull();
  });

  it('ISO string için Date döner', () => {
    const d = parseDateSafe('2026-04-10T10:00:00.000Z');
    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2026);
  });

  it('Date nesnesi geçirilirse aynı değer döner', () => {
    const giris = new Date(2026, 3, 10);
    expect(parseDateSafe(giris).getTime()).toBe(giris.getTime());
  });

  it('Firestore Timestamp simülasyonu desteklenir', () => {
    const hedef = new Date(2026, 3, 10);
    const ts = { toDate: () => hedef };
    expect(parseDateSafe(ts).getTime()).toBe(hedef.getTime());
  });
});

// ─── 7. haftalikOzetOlustur ──────────────────────────────────────────────────
describe('haftalikOzetOlustur', () => {
  it('boş girişlerde sıfır/null değerler döner', () => {
    const ozet = haftalikOzetOlustur({});
    expect(ozet.toplamSaat).toBe(0);
    expect(ozet.gorevTamamlama).toBe(0);
    expect(ozet.sonDenemeNet).toBeNull();
    expect(ozet.netDegisim).toBeNull();
    expect(ozet.okunmamisMesaj).toBe(0);
  });

  it('son 7 günün çalışma saatlerini toplar', () => {
    const dun = new Date();
    dun.setDate(dun.getDate() - 1);
    const calisma = [
      { tarih: dun.toISOString(), saat: 3 },
      { tarih: dun.toISOString(), saat: 2 },
    ];
    expect(haftalikOzetOlustur({ calisma }).toplamSaat).toBe(5);
  });

  it('8 gün önceki çalışmayı saymaz', () => {
    const eski = new Date();
    eski.setDate(eski.getDate() - 8);
    const calisma = [{ tarih: eski.toISOString(), saat: 5 }];
    expect(haftalikOzetOlustur({ calisma }).toplamSaat).toBe(0);
  });

  it('görev tamamlama oranını doğru hesaplar (50%)', () => {
    const program = [
      { tamamlandi: true },
      { tamamlandi: true },
      { tamamlandi: false },
      { tamamlandi: false },
    ];
    expect(haftalikOzetOlustur({ program }).gorevTamamlama).toBe(50);
  });

  it('tüm görevler tamamlanınca 100 döner', () => {
    const program = [{ tamamlandi: true }, { tamamlandi: true }];
    expect(haftalikOzetOlustur({ program }).gorevTamamlama).toBe(100);
  });

  it('net değişimini iki deneme arasında hesaplar', () => {
    const denemeler = [
      { tarih: new Date().toISOString(), toplamNet: 80 },
      { tarih: new Date(Date.now() - 86400000 * 7).toISOString(), toplamNet: 70 },
    ];
    const ozet = haftalikOzetOlustur({ denemeler });
    expect(ozet.sonDenemeNet).toBe(80);
    expect(ozet.netDegisim).toBe(10);
  });

  it('tek deneme varsa netDegisim null döner', () => {
    const denemeler = [{ tarih: new Date().toISOString(), toplamNet: 75 }];
    expect(haftalikOzetOlustur({ denemeler }).netDegisim).toBeNull();
  });

  it('10 günlük eski rapor ile veliRaporGerekli true döner', () => {
    const eskiRapor = { haftaBitis: new Date(Date.now() - 86400000 * 10).toISOString() };
    const ozet = haftalikOzetOlustur({
      ogrenci: { veliEmail: 'veli@test.com' },
      raporlar: [eskiRapor],
    });
    expect(ozet.veliRaporGerekli).toBe(true);
  });

  it('veli emaili yoksa veliRaporGerekli false döner', () => {
    const ozet = haftalikOzetOlustur({ ogrenci: { veliEmail: null }, raporlar: [] });
    expect(ozet.veliRaporGerekli).toBe(false);
  });

  it('okunmamış öğrenci mesajlarını sayar, koç mesajlarını saymaz', () => {
    const mesajlar = [
      { okundu: false, gonderen: 'ogrenci' },
      { okundu: false, gonderen: 'ogrenci' },
      { okundu: true, gonderen: 'ogrenci' },
      { okundu: false, gonderen: 'koc' },
    ];
    expect(haftalikOzetOlustur({ mesajlar }).okunmamisMesaj).toBe(2);
  });
});

// ─── 8. mufredatHaritasiOlustur ──────────────────────────────────────────────
describe('mufredatHaritasiOlustur', () => {
  const tumKonular = {
    matematik: ['Kumeler', 'Fonksiyonlar', 'Trigonometri'],
    fizik: ['Hareket', 'Kuvvet'],
  };

  it('boş girişlerde boş obje döner', () => {
    expect(mufredatHaritasiOlustur({})).toEqual({});
  });

  it('tüm konuları baslanmadi durumunda başlatır', () => {
    const harita = mufredatHaritasiOlustur({ tumKonular });
    expect(harita.matematik.length).toBe(3);
    harita.matematik.forEach(k => expect(k.durum).toBe('baslanmadi'));
  });

  it('tamamlandi bilgisini müfredattan uygular', () => {
    const mufredat = [{ dersId: 'matematik', konu: 'Kumeler', tamamlandi: true }];
    const harita = mufredatHaritasiOlustur({ mufredat, tumKonular });
    const k = harita.matematik.find(k => k.konu === 'Kumeler');
    expect(k.durum).toBe('tamamlandi');
  });

  it('deneme yanlışları tamamlanan konuyu tekrar durumuna getirir', () => {
    const mufredat = [{ dersId: 'matematik', konu: 'Kumeler', tamamlandi: true }];
    const denemeler = [{ netler: { matematik: { yanlisKonular: ['Kumeler'] } } }];
    const harita = mufredatHaritasiOlustur({ mufredat, denemeler, tumKonular });
    const k = harita.matematik.find(k => k.konu === 'Kumeler');
    expect(k.durum).toBe('tekrar');
    expect(k.yanlis).toBe(1);
  });

  it('birden fazla denemede yanlis sayısı birikir', () => {
    const mufredat = [{ dersId: 'matematik', konu: 'Kumeler', tamamlandi: true }];
    const denemeler = [
      { netler: { matematik: { yanlisKonular: ['Kumeler'] } } },
      { netler: { matematik: { yanlisKonular: ['Kumeler'] } } },
    ];
    const harita = mufredatHaritasiOlustur({ mufredat, denemeler, tumKonular });
    expect(harita.matematik.find(k => k.konu === 'Kumeler').yanlis).toBe(2);
  });
});

// ─── 9. gorusmeTimelineOlustur ───────────────────────────────────────────────
describe('gorusmeTimelineOlustur', () => {
  it('boş listede boş dizi döner', () => {
    expect(gorusmeTimelineOlustur([])).toEqual([]);
  });

  it('sadece tip=gorusme olanları içerir', () => {
    const notlar = [
      { tip: 'gorusme', tarih: '2026-04-01' },
      { tip: 'not', tarih: '2026-04-02' },
      { tip: 'gorusme', tarih: '2026-03-15' },
    ];
    const sonuc = gorusmeTimelineOlustur(notlar);
    expect(sonuc.length).toBe(2);
    sonuc.forEach(n => expect(n.tip).toBe('gorusme'));
  });

  it('en yeni önce gelir', () => {
    const notlar = [
      { tip: 'gorusme', tarih: '2026-01-01' },
      { tip: 'gorusme', tarih: '2026-04-10' },
      { tip: 'gorusme', tarih: '2026-02-15' },
    ];
    const sonuc = gorusmeTimelineOlustur(notlar);
    expect(sonuc[0].tarih).toBe('2026-04-10');
    expect(sonuc[2].tarih).toBe('2026-01-01');
  });

  it('orijinal diziyi değiştirmez', () => {
    const notlar = [
      { tip: 'gorusme', tarih: '2026-01-01' },
      { tip: 'gorusme', tarih: '2026-04-10' },
    ];
    const ilkTarih = notlar[0].tarih;
    gorusmeTimelineOlustur(notlar);
    expect(notlar[0].tarih).toBe(ilkTarih);
  });
});
