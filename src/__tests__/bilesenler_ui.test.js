/**
 * ElsWay — UI Bileşen Testleri (Firebase bağımlısız)
 * Kapsam: koc/ui, ogrenci, ogrenci/deneme bileşenleri
 *
 * Not: KocContext kullanan bileşenler (KocVeriGirisiKart, KocMesajUyari,
 * KocOgrenciListesi, KocRiskOzeti, KocSabahEkrani) KocProvider ile sarmalanır.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, renderSade, mockS } from './testUtils';
import { KocProvider } from '../context/KocContext';

// koc/ui bileşenleri
import KocSolMenu from '../koc/ui/KocSolMenu';
import KocHeroKart from '../koc/ui/KocHeroKart';
import KocVeriGirisiKart from '../koc/ui/KocVeriGirisiKart';
import KocMesajUyari from '../koc/ui/KocMesajUyari';
import KocSabahEkrani from '../koc/ui/KocSabahEkrani';
import KocRiskOzeti from '../koc/ui/KocRiskOzeti';
import KocOgrenciListesi from '../koc/ui/KocOgrenciListesi';
import KocTopBar from '../koc/ui/KocTopBar';
import KocAltTabBar from '../koc/ui/KocAltTabBar';

// ogrenci bileşenleri
import GeriSayimKart from '../ogrenci/GeriSayimKart';
import DersKarti from '../ogrenci/deneme/DersKarti';
import { DenemeKart } from '../ogrenci/deneme/DenemeKart';

// ─── Yardımcı: KocProvider sarmalayıcı ───────────────────────────────────────

const renderWithKoc = (ui, kocDeger = {}) =>
  renderWithProviders(
    <KocProvider
      ogrenciler={kocDeger.ogrenciler || []}
      dashboardMap={kocDeger.dashboardMap || {}}
      bugunMap={kocDeger.bugunMap || {}}
      okunmamisMap={kocDeger.okunmamisMap || {}}
      yukleniyor={kocDeger.yukleniyor || false}
      yenile={vi.fn()}
    >
      {ui}
    </KocProvider>
  );

// ─── Test verileri ────────────────────────────────────────────────────────────

const mockOgrenciler = [
  {
    id: 'ogr1',
    isim: 'Ayşe Yılmaz',
    tur: 'sayisal_12',
    sonDenemeNet: 45,
    riskDurumu: 'orta',
    riskPuan: 50,
    aktif: true,
    okunmamisMesajSayisi: 0,
  },
  {
    id: 'ogr2',
    isim: 'Ali Demir',
    tur: 'ea_12',
    sonDenemeNet: 55,
    riskDurumu: 'iyi',
    aktif: true,
  },
];

const mockBugunMap = {
  ogr1: { bugunAktif: true, rutin: true, gunlukSoru: false },
  ogr2: { bugunAktif: false, rutin: false, gunlukSoru: false },
};

const mockOkunmamisMap = { ogr1: 0, ogr2: 2 };

// ─── KocSolMenu ───────────────────────────────────────────────────────────────

describe('KocSolMenu — UI', () => {
  const defaultProps = { aktif: 'ana', onNav: vi.fn(), okunmamis: 0 };

  it('render olur', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} />);
    expect(document.body).toBeTruthy();
  });

  it('Ana sayfa menü öğesi görünür', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} />);
    expect(screen.getByText('Ana sayfa')).toBeTruthy();
  });

  it('Öğrencilerim menü öğesi görünür', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} />);
    expect(screen.getByText('Öğrencilerim')).toBeTruthy();
  });

  it('okunmamis > 0 iken badge gösterilir', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} okunmamis={3} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('okunmamis = 0 iken badge yok', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} okunmamis={0} />);
    expect(screen.queryByText('0')).toBeNull();
  });

  it('menü öğesine tıklayınca onNav çağrılır', () => {
    const onNav = vi.fn();
    renderWithProviders(<KocSolMenu aktif="ana" onNav={onNav} okunmamis={0} />);
    fireEvent.click(screen.getByText('Öğrencilerim'));
    expect(onNav).toHaveBeenCalledWith('ogrenciler');
  });
});

// ─── KocVeriGirisiKart — KocProvider ile ─────────────────────────────────────

describe('KocVeriGirisiKart — UI', () => {
  it('öğrenci yoksa render edilmez', () => {
    const { container } = renderWithKoc(<KocVeriGirisiKart onNav={vi.fn()} />, { ogrenciler: [] });
    expect(container.firstChild).toBeNull();
  });

  it('öğrenci varsa kart görünür', () => {
    renderWithKoc(<KocVeriGirisiKart onNav={vi.fn()} />, {
      ogrenciler: mockOgrenciler,
      bugunMap: mockBugunMap,
    });
    expect(screen.getByText('Bugünün veri girişi')).toBeTruthy();
  });

  it('rutin giren öğrenci sayısı gösterilir', () => {
    renderWithKoc(<KocVeriGirisiKart onNav={vi.fn()} />, {
      ogrenciler: mockOgrenciler,
      bugunMap: mockBugunMap, // ogr1 rutin=true, ogr2 rutin=false → 1/2
    });
    expect(screen.getByText('1/2')).toBeTruthy();
  });
});

// ─── KocMesajUyari — KocProvider ile ─────────────────────────────────────────

describe('KocMesajUyari — UI', () => {
  it('okunmamış mesaj yoksa render edilmez', () => {
    const { container } = renderWithKoc(<KocMesajUyari onSec={vi.fn()} />, {
      ogrenciler: mockOgrenciler,
      okunmamisMap: { ogr1: 0, ogr2: 0 },
    });
    expect(container.firstChild).toBeNull();
  });

  it('okunmamış mesaj varsa öğrenci ismi gösterilir', () => {
    renderWithKoc(<KocMesajUyari onSec={vi.fn()} />, {
      ogrenciler: mockOgrenciler,
      okunmamisMap: mockOkunmamisMap,
    });
    expect(screen.getByText('Ali Demir')).toBeTruthy();
  });

  it('öğrenciye tıklayınca onSec çağrılır', () => {
    const onSec = vi.fn();
    renderWithKoc(<KocMesajUyari onSec={onSec} />, {
      ogrenciler: mockOgrenciler,
      okunmamisMap: mockOkunmamisMap,
    });
    fireEvent.click(screen.getByText('Ali Demir'));
    expect(onSec).toHaveBeenCalled();
  });
});

// ─── KocAltTabBar ─────────────────────────────────────────────────────────────

describe('KocAltTabBar', () => {
  it('render olur', () => {
    renderWithProviders(<KocAltTabBar aktif="ana" onNav={vi.fn()} okunmamis={0} />);
    expect(document.body).toBeTruthy();
  });

  it('Ana sekmesi görünür', () => {
    renderWithProviders(<KocAltTabBar aktif="ana" onNav={vi.fn()} okunmamis={0} />);
    expect(screen.getByText('Ana')).toBeTruthy();
  });

  it('Liste sekmesi görünür', () => {
    renderWithProviders(<KocAltTabBar aktif="ana" onNav={vi.fn()} okunmamis={0} />);
    expect(screen.getByText('Liste')).toBeTruthy();
  });

  it('Ana sekmesine tıklayınca onNav çağrılır', () => {
    const onNav = vi.fn();
    renderWithProviders(<KocAltTabBar aktif="ogrenciler" onNav={onNav} okunmamis={0} />);
    fireEvent.click(screen.getByText('Ana'));
    expect(onNav).toHaveBeenCalledWith('ana');
  });

  it('okunmamis > 0 iken mesaj badge gösterilir', () => {
    renderWithProviders(<KocAltTabBar aktif="ana" onNav={vi.fn()} okunmamis={5} />);
    expect(screen.getByText('5')).toBeTruthy();
  });
});

// ─── GeriSayimKart ────────────────────────────────────────────────────────────
// GeriSayimKart props: tur, sinif, s (mockS gerekli)

describe('GeriSayimKart — UI', () => {
  it('render olur', () => {
    renderSade(<GeriSayimKart tur="sayisal_12" sinif="12" s={mockS} />);
    expect(document.body).toBeTruthy();
  });

  it('LGS öğrencisi için LGS metni gösterilir', () => {
    renderSade(<GeriSayimKart tur="lgs_8" sinif="8" s={mockS} />);
    expect(screen.getByText(/LGS/i)).toBeTruthy();
  });

  it('YKS öğrencisi için TYT metni gösterilir', () => {
    renderSade(<GeriSayimKart tur="sayisal_12" sinif="12" s={mockS} />);
    expect(screen.getByText(/TYT/i)).toBeTruthy();
  });

  it('gün etiketi gösterilir', () => {
    renderSade(<GeriSayimKart tur="sayisal_12" sinif="12" s={mockS} />);
    expect(screen.getByText('gün')).toBeTruthy();
  });
});

// ─── DersKarti ───────────────────────────────────────────────────────────────
// DersKarti props: dersId, dersLabel, dersRenk, dersMax, noktalar, s

describe('DersKarti — UI', () => {
  const defaultProps = {
    dersId: 'mat',
    dersLabel: 'Matematik',
    dersRenk: '#5B4FE8',
    dersMax: 40,
    noktalar: [],
    s: mockS,
  };

  it('render olur', () => {
    renderSade(<DersKarti {...defaultProps} />);
    expect(document.body).toBeTruthy();
  });

  it('ders adı gösterilir', () => {
    renderSade(<DersKarti {...defaultProps} dersLabel="Matematik" />);
    expect(screen.getByText('Matematik')).toBeTruthy();
  });

  it('noktalar doluyken net değeri gösterilir', () => {
    const noktalar = [
      { tarih: '2026-03-01', net: 34.25 },
      { tarih: '2026-03-15', net: 36 },
    ];
    renderSade(<DersKarti {...defaultProps} noktalar={noktalar} />);
    const metin = document.body.textContent;
    expect(/34|36/.test(metin)).toBe(true);
  });
});

// ─── KocTopBar ───────────────────────────────────────────────────────────────

describe('KocTopBar', () => {
  const defaultProps = {
    toplamOkunmamis: 0,
    onMesajlar: vi.fn(),
    onOgrenciEkle: vi.fn(),
    onCikis: vi.fn(),
    onRehber: vi.fn(),
  };

  it('render olur', () => {
    renderWithProviders(<KocTopBar {...defaultProps} />);
    expect(document.body).toBeTruthy();
  });

  it('ElsWay logosu veya Koç metni görünür', () => {
    renderWithProviders(<KocTopBar {...defaultProps} />);
    const metin = document.body.textContent;
    expect(/Els|Way|ElsWay|Koç/.test(metin)).toBe(true);
  });

  it('toplamOkunmamis > 0 iken badge gösterilir', () => {
    renderWithProviders(<KocTopBar {...defaultProps} toplamOkunmamis={4} />);
    const metin = document.body.textContent;
    expect(/4/.test(metin)).toBe(true);
  });
});

// ─── KocOgrenciListesi — KocProvider ile ─────────────────────────────────────

describe('KocOgrenciListesi — UI', () => {
  it('render olur', () => {
    renderWithKoc(<KocOgrenciListesi onSec={vi.fn()} onEkle={vi.fn()} onGeri={vi.fn()} />, {
      ogrenciler: mockOgrenciler,
      dashboardMap: {},
    });
    expect(document.body).toBeTruthy();
  });

  it('öğrenci isimleri listelenir', () => {
    renderWithKoc(<KocOgrenciListesi onSec={vi.fn()} onEkle={vi.fn()} onGeri={vi.fn()} />, {
      ogrenciler: mockOgrenciler,
      dashboardMap: {},
    });
    expect(screen.getByText('Ayşe Yılmaz')).toBeTruthy();
    expect(screen.getByText('Ali Demir')).toBeTruthy();
  });

  it('öğrenci yoksa boş durum gösterilir', () => {
    renderWithKoc(<KocOgrenciListesi onSec={vi.fn()} onEkle={vi.fn()} onGeri={vi.fn()} />, {
      ogrenciler: [],
      dashboardMap: {},
    });
    const metin = document.body.textContent;
    expect(/öğrenci|kayıt|yok|henüz/i.test(metin)).toBe(true);
  });
});

// ─── KocRiskOzeti — KocProvider ile ──────────────────────────────────────────

describe('KocRiskOzeti — UI', () => {
  it('sorunlu öğrenci yoksa null döner', () => {
    const { container } = renderWithKoc(<KocRiskOzeti onSec={vi.fn()} />, { ogrenciler: [] });
    // toplamSorunlu = 0 → null render
    expect(container.firstChild).toBeNull();
  });

  it('riskli öğrenci varsa render edilir', () => {
    const riskliOgrenciler = [{ id: 'r1', isim: 'Risk Öğrenci', riskDurumu: 'yuksek_risk' }];
    renderWithKoc(<KocRiskOzeti onSec={vi.fn()} />, { ogrenciler: riskliOgrenciler });
    expect(screen.getByText('Risk Öğrenci')).toBeTruthy();
  });
});

// ─── KocSabahEkrani — KocProvider ile ────────────────────────────────────────

describe('KocSabahEkrani — UI', () => {
  it('render olur', () => {
    renderWithKoc(<KocSabahEkrani onSec={vi.fn()} onNav={vi.fn()} kocAdi="Test Koç" />, {
      ogrenciler: mockOgrenciler,
      bugunMap: mockBugunMap,
      okunmamisMap: mockOkunmamisMap,
    });
    expect(document.body).toBeTruthy();
  });

  it('kocAdi ekranda görünür', () => {
    renderWithKoc(<KocSabahEkrani onSec={vi.fn()} onNav={vi.fn()} kocAdi="Mehmet" />, {
      ogrenciler: mockOgrenciler,
      bugunMap: mockBugunMap,
      okunmamisMap: {},
    });
    const metin = document.body.textContent;
    expect(/Mehmet/.test(metin)).toBe(true);
  });
});

// ─── DenemeKart ──────────────────────────────────────────────────────────────

describe('DenemeKart — UI', () => {
  const mockS = new Proxy({}, { get: () => '#cccccc' });
  const mockDeneme = {
    id: 'd1',
    sinav: 'TYT Deneme 1',
    tarih: '2026-03-01',
    denemeTuru: 'genel',
    toplamNet: 75.5,
    tytNetler: { mat: 25, fen: 18, turkce: 22, sosyal: 10.5 },
  };

  it('render olur', () => {
    renderWithProviders(
      <DenemeKart
        deneme={mockDeneme}
        acik={false}
        onToggle={vi.fn()}
        onSil={vi.fn()}
        onDuzenle={vi.fn()}
        s={mockS}
      />
    );
    expect(document.body).toBeTruthy();
  });

  it('sınav adı gösterilir', () => {
    renderWithProviders(
      <DenemeKart
        deneme={mockDeneme}
        acik={false}
        onToggle={vi.fn()}
        onSil={vi.fn()}
        onDuzenle={vi.fn()}
        s={mockS}
      />
    );
    const metin = document.body.textContent;
    expect(/TYT Deneme 1/.test(metin)).toBe(true);
  });

  it('toplam net değeri gösterilir', () => {
    renderWithProviders(
      <DenemeKart
        deneme={mockDeneme}
        acik={false}
        onToggle={vi.fn()}
        onSil={vi.fn()}
        onDuzenle={vi.fn()}
        s={mockS}
      />
    );
    const metin = document.body.textContent;
    expect(/75/.test(metin)).toBe(true);
  });
});
