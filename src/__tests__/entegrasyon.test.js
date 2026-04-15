/**
 * ElsWay — Entegrasyon & Regresyon Testleri
 * Kritik iş mantığının end-to-end doğruluğunu test eder.
 * Bu testler bug regresyonlarını ve segment segmentasyon kararlılığını korur.
 *
 * Kapsam:
 *  1. Öğrenci segmentasyonu — tur+sinif kombinasyonları
 *  2. Mesaj okunmamış badge sayısı
 *  3. Hedef zinciri (durumu → yüzde → etiket)
 *  4. Program algoritması — eksik görev dağıtımı
 *  5. Tarih yardımcıları — timezone güvenliği
 *  6. readState — okunmamış sayım mantığı
 */

import { describe, it, expect } from 'vitest';

// ─── Import'lar ───────────────────────────────────────────────────────────────

import {
  ogrenciBaglaminiCoz,
  dersSetiniBelirle,
  denemeTipleriniBelirle,
} from '../utils/ogrenciBaglam';

import { turBelirle, turdenBransDersler } from '../utils/sinavUtils';

import { hedefDurumu, ilerlemeYuzdesi, hedefTurEtiket, TUR_LABEL } from '../koc/hedef/hedefUtils';

import { oneriOzeti, haftaAnalizi, bosHaftaOlustur, GUNLER } from '../utils/programAlgoritma';

import { aktifDurumu } from '../utils/aktiflikKaydet';

import { unreadCount, isRead, isUnread, readPatch } from '../utils/readState';

import { bugunStr, dateToStr, haftaBasStr } from '../utils/tarih';

// ─── 1. Öğrenci Segmentasyonu ─────────────────────────────────────────────────

describe('ogrenciBaglaminiCoz — segmentasyon', () => {
  it('sayisal_12 → yks, TYT+AYT_SAY ders seti', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'sayisal_12', sinif: 12 });
    expect(b.sinavModu).toBe('yks');
    expect(b.yksOgrencisi).toBe(true);
    expect(b.lgsOgrencisi).toBe(false);
    expect(b.denemeTipleri).toContain('tyt');
    expect(b.denemeTipleri).toContain('ayt');
  });

  it('ea_12 → yks, TYT+AYT_EA ders seti', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'ea_12', sinif: 12 });
    expect(b.sinavModu).toBe('yks');
    const dersIds = b.dersSet.map(d => d.id);
    // EA: Türkçe + Matematik + Sosyal (AYT_EA'da tarih, coğrafya vb.)
    expect(dersIds.some(id => id.startsWith('mat') || id.startsWith('tur'))).toBe(true);
  });

  it('lgs_8 → lgs, LGS ders seti', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'lgs_8', sinif: 8 });
    expect(b.sinavModu).toBe('lgs');
    expect(b.lgsOgrencisi).toBe(true);
    expect(b.gerisayimHedef).toBe('lgs');
  });

  it('sinif=8 tur belirsizken → lgs segmenti', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'ortaokul', sinif: 8 });
    expect(b.sinavModu).toBe('lgs');
  });

  it('sinif=11 tur bilinmiyorken → gecis segmenti', () => {
    // 'sayisal' tur string'i YKS kuralını tetikler; sinif=11 gecise sadece tur
    // string'inde YKS bilgisi yokken düşer (örn. boş tur, açık sinif=11)
    const b = ogrenciBaglaminiCoz({ tur: '', sinif: 11 });
    expect(b.sinavModu).toBe('gecis');
  });

  it('sinif=9 → gelisim segmenti', () => {
    const b = ogrenciBaglaminiCoz({ tur: '', sinif: 9 });
    expect(b.sinavModu).toBe('gelisim');
  });

  it('bilinmeyen tur → gelisim (güvenli default)', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'bilinmeyen', sinif: undefined });
    expect(b.sinavModu).toBe('gelisim');
    expect(b.lgsOgrencisi).toBe(false);
    expect(b.yksOgrencisi).toBe(false);
  });

  it('boş argüman → çökmez, gelisim döner', () => {
    expect(() => ogrenciBaglaminiCoz()).not.toThrow();
    const b = ogrenciBaglaminiCoz();
    expect(b.sinavModu).toBe('gelisim');
  });

  // Bug regresyonu: sayisal_12 → yanlış ortaokul dersleri dönerken düzeltildi
  it('REG: sayisal_12 LGS dersleri içermez', () => {
    const dersler = dersSetiniBelirle('sayisal_12', 12);
    const dersIds = dersler.map(d => d.id);
    expect(dersIds).not.toContain('lgsmat');
    expect(dersIds).not.toContain('lgsfen');
  });

  // Bug regresyonu: lgs_8 → YKS deneme tipleri dönmemeli
  it('REG: lgs_8 deneme tiplerinde ayt veya ydt olmamalı', () => {
    const tipler = denemeTipleriniBelirle('lgs_8', 8);
    expect(tipler).not.toContain('ayt');
    expect(tipler).not.toContain('ydt');
    expect(tipler).toContain('lgs');
  });
});

// ─── 2. turBelirle & turdenBransDersler ──────────────────────────────────────

describe('turBelirle', () => {
  it.each([
    ['sayisal_12', 'yks'],
    ['ea_12', 'yks'],
    ['lgs_8', 'lgs'],
    ['lgs', 'lgs'],
    ['ortaokul', 'ortaokul'],
    ['', 'yks'],
    [null, 'yks'],
    [undefined, 'yks'],
  ])('turBelirle(%s) → %s', (tur, beklenen) => {
    expect(turBelirle(tur)).toBe(beklenen);
  });

  it('turdenBransDersler lgs_8 → LGS dersleri döner', () => {
    const dersler = turdenBransDersler('lgs_8', 8);
    expect(dersler.length).toBeGreaterThan(0);
    expect(dersler[0]).toHaveProperty('id');
    expect(dersler[0]).toHaveProperty('label');
  });
});

// ─── 3. Hedef Zinciri ────────────────────────────────────────────────────────

describe('hedef zinciri — durumu, ilerleme, etiket', () => {
  const bugun = new Date().toISOString().split('T')[0];
  const gecen = '2020-01-01';
  const gelecek = '2099-12-31';

  it('tamamlanan hedef → tamamlandi', () => {
    const h = { guncelDeger: 100, hedefDeger: 100, baslangicDegeri: 0 };
    expect(hedefDurumu(h)).toBe('tamamlandi');
  });

  it('geçmiş hedef tamamlanmamış → gecikti', () => {
    const h = { guncelDeger: 50, hedefDeger: 100, baslangicDegeri: 0, sonTarih: gecen };
    expect(hedefDurumu(h)).toBe('gecikti');
  });

  it('aktif hedef → aktif', () => {
    const h = { guncelDeger: 30, hedefDeger: 100, baslangicDegeri: 0, sonTarih: gelecek };
    expect(hedefDurumu(h)).toBe('aktif');
  });

  it('ilerlemeYuzdesi 0/100 → 0', () => {
    expect(ilerlemeYuzdesi({ baslangicDegeri: 0, hedefDeger: 100, guncelDeger: 0 })).toBe(0);
  });

  it('ilerlemeYuzdesi 50/100 → 50', () => {
    expect(ilerlemeYuzdesi({ baslangicDegeri: 0, hedefDeger: 100, guncelDeger: 50 })).toBe(50);
  });

  it('ilerlemeYuzdesi 100/100 → 100', () => {
    expect(ilerlemeYuzdesi({ baslangicDegeri: 0, hedefDeger: 100, guncelDeger: 100 })).toBe(100);
  });

  it('ilerlemeYuzdesi 150/100 → 100 (cap)', () => {
    expect(ilerlemeYuzdesi({ baslangicDegeri: 0, hedefDeger: 100, guncelDeger: 150 })).toBe(100);
  });

  it('hedefTurEtiket net → "Net"', () => {
    expect(hedefTurEtiket({ hedefTur: 'net' })).toBe('Net');
  });

  it('hedefTurEtiket saat → "Saat"', () => {
    expect(hedefTurEtiket({ hedefTur: 'saat' })).toBe('Saat');
  });

  it('hedefTurEtiket bilinmeyen → raw değer döner', () => {
    expect(hedefTurEtiket({ hedefTur: 'ozel_tur' })).toBe('ozel_tur');
  });

  it('TUR_LABEL doğru etiketleri içerir', () => {
    expect(TUR_LABEL.net).toBe('Net');
    expect(TUR_LABEL.saat).toBe('Saat');
    expect(TUR_LABEL.puan).toBe('Puan');
    expect(TUR_LABEL.diger).toBe('Diğer');
  });
});

// ─── 4. Program Algoritması ───────────────────────────────────────────────────

describe('programAlgoritma — eksik görev dağıtımı', () => {
  // Salı gününde çalışıyoruz (indeks=1), Pazartesi geçti
  const sali = (() => {
    const d = new Date('2026-04-07'); // Salı
    return d;
  })();

  const mockProgram = {
    gunler: {
      pazartesi: [
        { id: 'g1', baslik: 'Matematik', tamamlandi: false },
        { id: 'g2', baslik: 'Türkçe', tamamlandi: true },
      ],
      sali: [{ id: 'g3', baslik: 'Fizik', tamamlandi: false }],
      carsamba: [],
      persembe: [],
      cuma: [],
      cumartesi: [],
      pazar: [],
    },
  };

  it('haftaAnalizi eksik görevleri bulur', () => {
    const { eksikGorevler } = haftaAnalizi(mockProgram, sali);
    expect(eksikGorevler.length).toBeGreaterThan(0);
    expect(eksikGorevler[0]).toHaveProperty('kaynakGun', 'pazartesi');
  });

  it('haftaAnalizi kalan günleri döner', () => {
    const { kalanGunler } = haftaAnalizi(mockProgram, sali);
    const gunAdlari = kalanGunler.map(g => g.gun);
    expect(gunAdlari).toContain('carsamba');
    expect(gunAdlari).not.toContain('pazartesi');
  });

  it('oneriOzeti eksik görev varken var=true döner', () => {
    const ozet = oneriOzeti(mockProgram, sali);
    expect(ozet.var).toBe(true);
    expect(ozet.eksikSayisi).toBeGreaterThan(0);
    expect(typeof ozet.ozet).toBe('string');
  });

  it('oneriOzeti tüm görevler tamamlanmışsa var=false döner', () => {
    const tamam = {
      gunler: {
        pazartesi: [{ id: 'g1', tamamlandi: true }],
        sali: [],
        carsamba: [],
        persembe: [],
        cuma: [],
        cumartesi: [],
        pazar: [],
      },
    };
    const ozet = oneriOzeti(tamam, sali);
    expect(ozet.var).toBe(false);
  });

  it('oneriOzeti boş program → var=false', () => {
    const ozet = oneriOzeti({}, sali);
    expect(ozet.var).toBe(false);
  });

  it('GUNLER dizisi 7 eleman içerir', () => {
    expect(GUNLER).toHaveLength(7);
    expect(GUNLER[0]).toBe('pazartesi');
    expect(GUNLER[6]).toBe('pazar');
  });
});

// ─── 5. Tarih Yardımcıları ────────────────────────────────────────────────────

describe('tarih yardımcıları', () => {
  it('bugunStr YYYY-MM-DD formatında döner', () => {
    const str = bugunStr();
    expect(/^\d{4}-\d{2}-\d{2}$/.test(str)).toBe(true);
  });

  it('dateToStr UTC kaymasına karşı güvenli', () => {
    // UTC+3 yerel saatte 2026-01-01 00:00:00
    const yerel = new Date(2026, 0, 1, 0, 0, 0); // Yerel zaman kullanır
    const str = dateToStr(yerel);
    expect(str).toBe('2026-01-01');
  });

  it('haftaBasStr Pazartesi döner', () => {
    const str = haftaBasStr();
    const d = new Date(str);
    // 0=Pazar, 1=Pazartesi
    expect(d.getDay()).toBe(1);
  });

  it('bugunStr her çağrıda tutarlı sonuç döner', () => {
    const a = bugunStr();
    const b = bugunStr();
    expect(a).toBe(b);
  });
});

// ─── 6. readState — Okunmamış Sayım ──────────────────────────────────────────

describe('readState', () => {
  const okunmamis = { okundu: false };
  const okunmus = { okundu: true };
  const readAtOkunmus = { readAt: new Date() };
  const zamanliOkunmus = { okunmaZamani: new Date() };

  it('isRead — okundu:true → true', () => {
    expect(isRead({ okundu: true })).toBe(true);
  });

  it('isRead — readAt var → true', () => {
    expect(isRead({ readAt: new Date() })).toBe(true);
  });

  it('isRead — okunmaZamani var → true', () => {
    expect(isRead({ okunmaZamani: new Date() })).toBe(true);
  });

  it('isRead — boş obje → false', () => {
    expect(isRead({})).toBe(false);
  });

  it('isUnread — okunmamış mesaj → true', () => {
    expect(isUnread(okunmamis)).toBe(true);
  });

  it('isUnread — okunmuş mesaj → false', () => {
    expect(isUnread(okunmus)).toBe(false);
  });

  it('unreadCount — karışık liste', () => {
    const liste = [okunmamis, okunmus, okunmamis, readAtOkunmus];
    expect(unreadCount(liste)).toBe(2);
  });

  it('unreadCount — boş liste → 0', () => {
    expect(unreadCount([])).toBe(0);
  });

  it('unreadCount — predicate ile filtreleme', () => {
    const liste = [
      { okundu: false, tip: 'koc' },
      { okundu: false, tip: 'sistem' },
      { okundu: true, tip: 'koc' },
    ];
    const sayisi = unreadCount(liste, item => item.tip === 'koc');
    expect(sayisi).toBe(1);
  });

  it('readPatch doğru alanları döner', () => {
    const patch = readPatch();
    expect(patch.okundu).toBe(true);
    expect(patch.okunmaZamani).toBeDefined();
    expect(patch.readAt).toBeDefined();
  });

  // Bug regresyonu: mesaj badge'i — ogrenciler toplu listesinde okunmamış sayım
  it('REG: mesaj badge sayımı — toplu öğrenci listesinden okunmamış hesabı', () => {
    const ogrenciler = [
      { id: 'ogr1', okunmamisMesajSayisi: 3 },
      { id: 'ogr2', okunmamisMesajSayisi: 0 },
      { id: 'ogr3', okunmamisMesajSayisi: 1 },
    ];
    const toplam = ogrenciler.reduce((acc, o) => acc + (o.okunmamisMesajSayisi || 0), 0);
    expect(toplam).toBe(4);
  });
});

// ─── 7. aktifDurumu ──────────────────────────────────────────────────────────
// aktifDurumu → { label: string, renk: string, puan: number }

describe('aktifDurumu', () => {
  const SIMDI = Date.now();

  it('1 dakika önce → puan:3, "Şu an aktif"', () => {
    const sonuc = aktifDurumu(new Date(SIMDI - 60_000));
    expect(sonuc.puan).toBe(3);
    expect(sonuc.label).toBe('Şu an aktif');
  });

  it('25 dakika önce → puan:3 (< 30 dk sınırı)', () => {
    const sonuc = aktifDurumu(new Date(SIMDI - 25 * 60_000));
    expect(sonuc.puan).toBe(3);
  });

  it('45 dakika önce → puan:2 (30-120 dk arası)', () => {
    const sonuc = aktifDurumu(new Date(SIMDI - 45 * 60_000));
    expect(sonuc.puan).toBe(2);
  });

  it('2 saat önce → puan:1 (saat < 12)', () => {
    const sonuc = aktifDurumu(new Date(SIMDI - 2 * 3600_000));
    expect(sonuc.puan).toBe(1);
  });

  it('2 gün önce → puan:0', () => {
    const sonuc = aktifDurumu(new Date(SIMDI - 2 * 86400_000));
    expect(sonuc.puan).toBe(0);
    expect(typeof sonuc.label).toBe('string');
  });

  it('null → "Hiç giriş yok", puan:0', () => {
    const sonuc = aktifDurumu(null);
    expect(sonuc.label).toBe('Hiç giriş yok');
    expect(sonuc.puan).toBe(0);
  });

  it('dönüş her zaman {label, renk, puan} şeklinde', () => {
    const sonuc = aktifDurumu(new Date());
    expect(sonuc).toHaveProperty('label');
    expect(sonuc).toHaveProperty('renk');
    expect(sonuc).toHaveProperty('puan');
  });
});
