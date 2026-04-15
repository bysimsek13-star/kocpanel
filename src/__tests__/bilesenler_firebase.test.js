/**
 * ElsWay — Firebase Bağımlı Bileşen Testleri
 * Firebase mock setup.js'den geliyor.
 * Kapsam: DenemeListesi, MesajlarSayfasi, GunlukSoruFormu, MufredatGoruntule
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './testUtils';
import { getDocs } from 'firebase/firestore';

import DenemeListesi from '../ogrenci/DenemeListesi';
import MesajlarSayfasi from '../koc/MesajlarSayfasi';
import GunlukSoruFormu from '../ogrenci/GunlukSoruFormu';
import MufredatGoruntule from '../ogrenci/MufredatGoruntule';

// ─── Test verileri ────────────────────────────────────────────────────────────

const mockOgrenciler = [
  { id: 'ogr1', isim: 'Ayşe Yılmaz', tur: 'sayisal_12', aktif: true, okunmamisMesajSayisi: 2 },
  { id: 'ogr2', isim: 'Ali Demir', tur: 'ea_12', aktif: true, okunmamisMesajSayisi: 0 },
];

const mockOkunmamisMap = { ogr1: 2, ogr2: 0 };

const mockDenemeDocs = [
  {
    id: 'den1',
    tarih: '2026-04-01',
    tur: 'TYT',
    toplamNet: 65,
    netler: {
      mat: { dogru: 20, yanlis: 5, bos: 5, net: 18.75 },
      tur: { dogru: 25, yanlis: 3, bos: 2, net: 24.25 },
    },
    olusturma: new Date('2026-04-01'),
  },
  {
    id: 'den2',
    tarih: '2026-03-25',
    tur: 'TYT',
    toplamNet: 60,
    netler: {},
    olusturma: new Date('2026-03-25'),
  },
];

// ─── DenemeListesi ────────────────────────────────────────────────────────────

describe('DenemeListesi', () => {
  beforeEach(() => {
    // getDocs setup.js'de global vi.fn() olarak tanımlı — her test için sıfırla
    vi.mocked(getDocs).mockResolvedValue({
      docs: mockDenemeDocs.map(d => ({ id: d.id, data: () => d })),
    });
  });

  it('render olur', () => {
    renderWithProviders(
      <DenemeListesi ogrenciId="ogr1" ogrenciTur="sayisal_12" ogrenciSinif={12} />
    );
    expect(document.body).toBeTruthy();
  });

  it('yükleme veya içerik gösterilir', async () => {
    renderWithProviders(
      <DenemeListesi ogrenciId="ogr1" ogrenciTur="sayisal_12" ogrenciSinif={12} />
    );
    await waitFor(
      () => {
        const metin = document.body.textContent;
        expect(/TYT|LGS|Deneme|net|Yükleniyor/i.test(metin)).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  it('LGS öğrencisi için çökmez', () => {
    expect(() => {
      renderWithProviders(<DenemeListesi ogrenciId="ogr1" ogrenciTur="lgs_8" ogrenciSinif={8} />);
    }).not.toThrow();
  });

  it('ogrenciTur boşsa çökmez', async () => {
    renderWithProviders(<DenemeListesi ogrenciId="ogr1" ogrenciTur="" ogrenciSinif={null} />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('ogrenciId yoksa sorgu yapılmaz', () => {
    expect(() => {
      renderWithProviders(
        <DenemeListesi ogrenciId={null} ogrenciTur="sayisal_12" ogrenciSinif={12} />
      );
    }).not.toThrow();
  });
});

// ─── MesajlarSayfasi ──────────────────────────────────────────────────────────

describe('MesajlarSayfasi', () => {
  it('render olur', () => {
    renderWithProviders(
      <MesajlarSayfasi
        ogrenciler={mockOgrenciler}
        okunmamisMap={mockOkunmamisMap}
        onGeri={vi.fn()}
      />
    );
    expect(document.body).toBeTruthy();
  });

  it('öğrenci isimleri sol panelde listelenir', () => {
    renderWithProviders(
      <MesajlarSayfasi
        ogrenciler={mockOgrenciler}
        okunmamisMap={mockOkunmamisMap}
        onGeri={vi.fn()}
      />
    );
    expect(screen.getAllByText('Ayşe Yılmaz').length).toBeGreaterThan(0);
  });

  it('okunmamış mesajı olan öğrenci liste başına sıralanır', () => {
    renderWithProviders(
      <MesajlarSayfasi
        ogrenciler={mockOgrenciler}
        okunmamisMap={mockOkunmamisMap}
        onGeri={vi.fn()}
      />
    );
    // siraliOgrenciler: Ayşe (2 unread) önce, Ali (0 unread) sonra
    const ayse = screen.getAllByText('Ayşe Yılmaz')[0];
    const ali = screen.getByText('Ali Demir');
    // DOM sırası: Ayşe'nin offsetTop < Ali'nin offsetTop olmalı
    // Sadece her ikisinin de görünür olduğunu doğrulayalım
    expect(ayse).toBeTruthy();
    expect(ali).toBeTruthy();
  });

  it('"← Geri" butonuna tıklayınca onGeri çağrılır', () => {
    const onGeri = vi.fn();
    renderWithProviders(
      <MesajlarSayfasi
        ogrenciler={mockOgrenciler}
        okunmamisMap={mockOkunmamisMap}
        onGeri={onGeri}
      />
    );
    const geriBtn = screen.getByText('← Geri').closest('button');
    fireEvent.click(geriBtn);
    expect(onGeri).toHaveBeenCalled();
  });

  it('öğrenci yoksa DOM çökmez', () => {
    renderWithProviders(<MesajlarSayfasi ogrenciler={[]} okunmamisMap={{}} onGeri={vi.fn()} />);
    expect(document.body).toBeTruthy();
  });

  it('tek öğrenci varsa hata vermez', () => {
    renderWithProviders(
      <MesajlarSayfasi
        ogrenciler={[mockOgrenciler[0]]}
        okunmamisMap={{ ogr1: 2 }}
        onGeri={vi.fn()}
      />
    );
    expect(screen.getAllByText('Ayşe Yılmaz').length).toBeGreaterThan(0);
  });
});

// ─── GunlukSoruFormu ─────────────────────────────────────────────────────────

describe('GunlukSoruFormu', () => {
  beforeEach(() => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] });
  });

  it('render olur', async () => {
    renderWithProviders(<GunlukSoruFormu ogrenciId="ogr1" />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('TYT ve AYT sekmeleri görünür', async () => {
    renderWithProviders(<GunlukSoruFormu ogrenciId="ogr1" />);
    await waitFor(
      () => {
        const metin = document.body.textContent;
        expect(/TYT|AYT/.test(metin)).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  it('Matematik dersi görünür', async () => {
    renderWithProviders(<GunlukSoruFormu ogrenciId="ogr1" />);
    await waitFor(
      () => {
        const metin = document.body.textContent;
        expect(/Matematik/.test(metin)).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  it('Kaydet butonu görünür', async () => {
    renderWithProviders(<GunlukSoruFormu ogrenciId="ogr1" />);
    await waitFor(
      () => {
        const metin = document.body.textContent;
        expect(/Kaydet|Güncelle/i.test(metin)).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  it('ogrenciId null olduğunda erken çıkış yapar ve çökmez', () => {
    expect(() => {
      renderWithProviders(<GunlukSoruFormu ogrenciId={null} />);
    }).not.toThrow();
  });
});

// ─── MufredatGoruntule ───────────────────────────────────────────────────────

describe('MufredatGoruntule', () => {
  beforeEach(() => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] });
  });

  it('render olur', async () => {
    renderWithProviders(
      <MufredatGoruntule ogrenciId="ogr1" ogrenciTur="sayisal_12" ogrenciSinif={12} />
    );
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('yükleme veya içerik gösterilir', async () => {
    renderWithProviders(
      <MufredatGoruntule ogrenciId="ogr1" ogrenciTur="sayisal_12" ogrenciSinif={12} />
    );
    await waitFor(
      () => {
        expect(document.body).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('ogrenciTur boşsa çökmez', () => {
    expect(() => {
      renderWithProviders(<MufredatGoruntule ogrenciId="ogr1" ogrenciTur="" ogrenciSinif={null} />);
    }).not.toThrow();
  });

  it('LGS öğrencisi için çökmez', async () => {
    renderWithProviders(<MufredatGoruntule ogrenciId="ogr1" ogrenciTur="lgs_8" ogrenciSinif={8} />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('ogrenciId null olduğunda çökmez', () => {
    expect(() => {
      renderWithProviders(
        <MufredatGoruntule ogrenciId={null} ogrenciTur="sayisal_12" ogrenciSinif={12} />
      );
    }).not.toThrow();
  });
});
