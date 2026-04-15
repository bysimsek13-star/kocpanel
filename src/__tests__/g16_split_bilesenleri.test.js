/**
 * G16 — Bölünen dosyalar için birim ve render testleri
 *
 * Kapsam:
 *   1. denemeYonetimiUtils — satirHesapla, ozetHesapla, listele
 *   2. yoneticiPaneliSabitleri — adminSayfaAnahtariGetir
 *   3. DenemeYonetimiListesi — render (masaüstü)
 *   4. GunlukSoruDersListesi — render
 *   5. GunlukSoruGecmis — render
 *   6. GunlukSoruFormBaslik — render
 *   7. ProgramOlusturHaftalik — render
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderSade, mockS } from './testUtils';

import { satirHesapla, ozetHesapla, listele } from '../koc/denemeYonetimiUtils';
import { adminSayfaAnahtariGetir, ADMIN_MENU_PATHS } from '../pages/yoneticiPaneliSabitleri';
import DenemeYonetimiListesi from '../koc/DenemeYonetimiListesi';
import GunlukSoruDersListesi from '../ogrenci/GunlukSoruDersListesi';
import GunlukSoruGecmis from '../ogrenci/GunlukSoruGecmis';
import GunlukSoruFormBaslik from '../ogrenci/GunlukSoruFormBaslik';
import ProgramOlusturHaftalik from '../koc/ProgramOlusturHaftalik';

// ─── 1. denemeYonetimiUtils ───────────────────────────────────────────────────

describe('satirHesapla()', () => {
  const s = mockS;
  const ogrenciler = [
    { id: 'o1', isim: 'Ali', tur: 'sayisal' },
    { id: 'o2', isim: 'Veli', tur: 'tyt' },
  ];
  const veriler = {
    o1: [
      { toplamNet: '85', tarih: '2026-04-14', sinav: 'TYT' },
      { toplamNet: '80', tarih: '2026-04-07', sinav: 'TYT' },
    ],
    o2: [],
  };

  it('son ve önceki deneme farkını hesaplar', () => {
    const satirlar = satirHesapla(ogrenciler, veriler, s);
    const satir = satirlar.find(r => r.ogrenci.id === 'o1');
    expect(satir.fark).toBeCloseTo(5);
  });

  it('verisi olmayan öğrenci için fark null döner', () => {
    const satirlar = satirHesapla(ogrenciler, veriler, s);
    const satir = satirlar.find(r => r.ogrenci.id === 'o2');
    expect(satir.fark).toBeNull();
    expect(satir.den).toHaveLength(0);
  });

  it('netBand = yukselis olarak işaretler', () => {
    const satirlar = satirHesapla(ogrenciler, veriler, s);
    const satir = satirlar.find(r => r.ogrenci.id === 'o1');
    expect(satir.netBand).toBe('yukselis');
  });
});

describe('ozetHesapla()', () => {
  const s = mockS;
  const ogrenciler = [
    { id: 'o1', isim: 'A' },
    { id: 'o2', isim: 'B' },
  ];
  const veriler = {
    o1: [{ toplamNet: '80' }, { toplamNet: '70' }],
    o2: [{ toplamNet: '60' }, { toplamNet: '65' }],
  };
  const satirlar = satirHesapla(ogrenciler, veriler, s);

  it('toplam deneme sayısını doğru hesaplar', () => {
    const ozet = ozetHesapla(satirlar, 2);
    expect(ozet.toplamDeneme).toBe(4);
  });

  it('ortalama son neti hesaplar', () => {
    const ozet = ozetHesapla(satirlar, 2);
    expect(parseFloat(ozet.ortSonNet)).toBeCloseTo(70);
  });

  it('n değerini korur', () => {
    const ozet = ozetHesapla(satirlar, 2);
    expect(ozet.n).toBe(2);
  });
});

describe('listele()', () => {
  const s = mockS;
  const ogrenciler = [
    { id: 'o1', isim: 'Ali', email: 'ali@test.com' },
    { id: 'o2', isim: 'Veli', email: 'veli@test.com' },
  ];
  const veriler = {
    o1: [{ toplamNet: '80' }, { toplamNet: '70' }],
    o2: [{ toplamNet: '50' }],
  };
  const satirlar = satirHesapla(ogrenciler, veriler, s);

  it('arama ile filtreler', () => {
    const sonuc = listele(satirlar, 'ali', 'tumu', 'isim');
    expect(sonuc).toHaveLength(1);
    expect(sonuc[0].ogrenci.isim).toBe('Ali');
  });

  it('net_cok sıralaması doğru çalışır', () => {
    const sonuc = listele(satirlar, '', 'tumu', 'net_cok');
    expect(parseFloat(sonuc[0].son?.toplamNet)).toBeGreaterThanOrEqual(
      parseFloat(sonuc[1].son?.toplamNet)
    );
  });

  it('veri_yok filtresi boş denemeye sahip öğrencileri döner', () => {
    const verileri2 = { o1: [{ toplamNet: '80' }], o2: [] };
    const sat2 = satirHesapla(ogrenciler, verileri2, s);
    const sonuc = listele(sat2, '', 'veri_yok', 'isim');
    expect(sonuc).toHaveLength(1);
    expect(sonuc[0].ogrenci.id).toBe('o2');
  });
});

// ─── 2. yoneticiPaneliSabitleri ───────────────────────────────────────────────

describe('adminSayfaAnahtariGetir()', () => {
  it('bilinen path için doğru anahtar döner', () => {
    expect(adminSayfaAnahtariGetir('/admin/koclar')).toBe('koclar');
    expect(adminSayfaAnahtariGetir('/admin/performans')).toBe('performans');
    expect(adminSayfaAnahtariGetir('/admin/canli-operasyon')).toBe('canli');
  });

  it('bilinmeyen path için "ana" döner', () => {
    expect(adminSayfaAnahtariGetir('/admin/bilinmeyen')).toBe('ana');
  });

  it('ADMIN_MENU_PATHS beklenen anahtarları içerir', () => {
    expect(ADMIN_MENU_PATHS.ana).toBe('/admin/home');
    expect(ADMIN_MENU_PATHS.mufredat).toBe('/admin/mufredat');
  });
});

// ─── 3. DenemeYonetimiListesi ─────────────────────────────────────────────────

describe('DenemeYonetimiListesi', () => {
  const detay = vi.fn();
  const listelenen = [
    {
      ogrenci: { id: 'o1', isim: 'Test Öğrenci', tur: 'sayisal' },
      index: 0,
      den: [
        { toplamNet: '80', sinav: 'TYT' },
        { toplamNet: '75', sinav: 'TYT' },
      ],
      son: { toplamNet: '80', sinav: 'TYT' },
      fark: 5,
      sonUcOrt: 80,
      netUI: { etiket: 'Son iki denemede artış', renk: '#10B981', bg: '#f0fdf4' },
      netBand: 'yukselis',
    },
  ];

  it('masaüstü modda öğrenci ismi görünür', () => {
    renderSade(
      <DenemeYonetimiListesi listelenen={listelenen} s={mockS} mobil={false} detay={detay} />
    );
    expect(screen.getByText('Test Öğrenci')).toBeTruthy();
  });

  it('Aç butonu tıklanabilir', () => {
    renderSade(
      <DenemeYonetimiListesi listelenen={listelenen} s={mockS} mobil={false} detay={detay} />
    );
    fireEvent.click(screen.getByText('Aç'));
    expect(detay).toHaveBeenCalledWith('o1');
  });

  it('mobil modda kart görünür', () => {
    renderSade(
      <DenemeYonetimiListesi listelenen={listelenen} s={mockS} mobil={true} detay={detay} />
    );
    expect(screen.getByText('Test Öğrenci')).toBeTruthy();
  });
});

// ─── 4. GunlukSoruDersListesi ─────────────────────────────────────────────────

describe('GunlukSoruDersListesi', () => {
  const dersler = [{ id: 'mat', label: 'Matematik', renk: '#6366F1' }];

  it('ders adını gösterir', () => {
    renderSade(
      <GunlukSoruDersListesi
        dersler={dersler}
        veriler={{}}
        guncelle={vi.fn()}
        konuDetay={{}}
        konuGuncelle={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText('Matematik')).toBeTruthy();
  });

  it('Doğru / Yanlış / Boş etiketleri görünür', () => {
    renderSade(
      <GunlukSoruDersListesi
        dersler={dersler}
        veriler={{}}
        guncelle={vi.fn()}
        konuDetay={{}}
        konuGuncelle={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText('Doğru')).toBeTruthy();
    expect(screen.getByText('Yanlış')).toBeTruthy();
    expect(screen.getByText('Boş')).toBeTruthy();
  });
});

// ─── 5. GunlukSoruGecmis ─────────────────────────────────────────────────────

describe('GunlukSoruGecmis', () => {
  it('kayıt yoksa hiçbir şey render etmez', () => {
    const { container } = renderSade(
      <GunlukSoruGecmis gecmisKayitlar={[]} tarih="2026-04-14" setTarih={vi.fn()} s={mockS} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('kayıtlar varsa tarih bilgisi görünür', () => {
    const kayitlar = [
      {
        id: 'k1',
        tarih: '2026-04-13',
        sinav: 'TYT',
        dersler: { mat: { d: 10, y: 2, b: 1 } },
        sureDk: 60,
      },
    ];
    renderSade(
      <GunlukSoruGecmis gecmisKayitlar={kayitlar} tarih="2026-04-14" setTarih={vi.fn()} s={mockS} />
    );
    expect(screen.getByText('2026-04-13')).toBeTruthy();
  });
});

// ─── 6. GunlukSoruFormBaslik ─────────────────────────────────────────────────

describe('GunlukSoruFormBaslik', () => {
  it('TYT ve AYT butonlarını gösterir', () => {
    renderSade(
      <GunlukSoruFormBaslik
        tarih="2026-04-14"
        setTarih={vi.fn()}
        sinav="TYT"
        setSinav={vi.fn()}
        setVeriler={vi.fn()}
        setKonuDetay={vi.fn()}
        sureDk=""
        setSureDk={vi.fn()}
        minTarih="2026-04-01"
        bugun="2026-04-14"
        s={mockS}
      />
    );
    expect(screen.getByText('TYT')).toBeTruthy();
    expect(screen.getByText('AYT')).toBeTruthy();
  });
});

// ─── 7. ProgramOlusturHaftalik ────────────────────────────────────────────────

describe('ProgramOlusturHaftalik', () => {
  it('boş program için EmptyState gösterir', () => {
    renderSade(
      <ProgramOlusturHaftalik
        gorev=""
        setGorev={vi.fn()}
        gorevDers="Matematik"
        setGorevDers={vi.fn()}
        gorevEkle={vi.fn()}
        gorevSil={vi.fn()}
        program={[]}
        s={mockS}
      />
    );
    expect(screen.getByText('Henüz haftalık görev yok')).toBeTruthy();
  });

  it('program öğesi listede görünür', () => {
    const program = [{ id: 'p1', gorev: 'Türev çalış', ders: 'Matematik', tamamlandi: false }];
    renderSade(
      <ProgramOlusturHaftalik
        gorev=""
        setGorev={vi.fn()}
        gorevDers="Matematik"
        setGorevDers={vi.fn()}
        gorevEkle={vi.fn()}
        gorevSil={vi.fn()}
        program={program}
        s={mockS}
      />
    );
    expect(screen.getByText('Türev çalış')).toBeTruthy();
  });
});
