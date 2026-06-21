import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { renderWithProviders } from './testUtils';

afterEach(() => cleanup());

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => () => {}),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
}));

vi.mock('../hooks/useAbonelik', () => ({
  useAbonelik: vi.fn(() => ({ abonelik: null, yukleniyor: false })),
}));

vi.mock('../utils/ogrenciUtils', () => ({
  upcomingExams: vi.fn(() => [
    { key: 'lgs', label: 'LGS 2027', date: '2027-06-13', daysLeft: 359, isPast: false },
  ]),
}));

import { VeliAnaSayfa } from '../veli/VeliAnaSayfa';
import { VeliSolMenu, VeliAltTabBar, sayfaGetir, PATHS, MENU } from '../veli/VeliNav';
import { DenemeKarti, SonRaporKarti } from '../veli/VeliKartlariYeni';

const mockS = {
  bg: '#fff',
  surface: '#fff',
  surface2: '#f0f0f0',
  border: '#e5e7eb',
  text: '#1a202c',
  text2: '#4a5568',
  text3: '#718096',
  accent: '#6366f1',
  accentSoft: '#eef2ff',
  heroSurface: '#fff',
  heroTitle: '#1a202c',
  heroMuted: '#718096',
};

describe('VeliNav', () => {
  it('MENU 4 öğe içerir', () => {
    expect(MENU).toHaveLength(4);
  });

  it("MENU'da duyurular yok", () => {
    expect(MENU.find(m => m.k === 'duyurular')).toBeUndefined();
  });

  it("PATHS'ta duyurular yok", () => {
    expect(PATHS.duyurular).toBeUndefined();
  });

  it("sayfaGetir tanınmayan path için 'ana' döner", () => {
    expect(sayfaGetir('/veli/duyurular')).toBe('ana');
  });

  it('VeliSolMenu render olur', () => {
    expect(() =>
      renderWithProviders(
        <VeliSolMenu
          aktif="ana"
          git={vi.fn()}
          okunmamisMesaj={0}
          s={mockS}
          ogrenci={null}
          userData={null}
        />
      )
    ).not.toThrow();
  });

  it('VeliSolMenu Genel, Sınavlar, Program, Koçum etiketlerini gösterir', () => {
    renderWithProviders(
      <VeliSolMenu
        aktif="ana"
        git={vi.fn()}
        okunmamisMesaj={0}
        s={mockS}
        ogrenci={null}
        userData={null}
      />
    );
    expect(screen.getByText('Genel')).toBeTruthy();
    expect(screen.getByText('Sınavlar')).toBeTruthy();
    expect(screen.getByText('Program')).toBeTruthy();
    expect(screen.getByText('Koçum')).toBeTruthy();
  });

  it('VeliAltTabBar 4 sekme gösterir', () => {
    renderWithProviders(<VeliAltTabBar aktif="ana" git={vi.fn()} okunmamisMesaj={0} s={mockS} />);
    expect(screen.getByText('Genel')).toBeTruthy();
    expect(screen.getByText('Koçum')).toBeTruthy();
  });

  it('VeliAltTabBar okunmamış badge gösterir', () => {
    renderWithProviders(<VeliAltTabBar aktif="ana" git={vi.fn()} okunmamisMesaj={3} s={mockS} />);
    expect(screen.getByText('3')).toBeTruthy();
  });
});

describe('VeliAnaSayfa', () => {
  const defaultProps = {
    ogrenci: { isim: 'Ahmet Yılmaz', tur: 'lgs', sinif: '8. Sınıf', kocIsim: 'Test Koç' },
    denemeler: [{ id: 'd1', toplamNet: 55.5, sinav: 'LGS', tarih: '2026-06-01' }],
    calisma: [],
    veliRaporlari: [],
    okunmamisMesaj: 0,
    yukleniyor: false,
    ogrenciId: 'ogr-1',
    userData: { isim: 'Fatma Veli' },
    git: vi.fn(),
    s: mockS,
    mobil: false,
    uid: 'veli-uid',
  };

  it('render olur', () => {
    expect(() => renderWithProviders(<VeliAnaSayfa {...defaultProps} />)).not.toThrow();
  });

  it('öğrenci adını gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} />);
    expect(screen.getByText(/Ahmet Yılmaz/)).toBeTruthy();
  });

  it('sınav türünü büyük harfle gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} />);
    expect(screen.getByText('LGS')).toBeTruthy();
  });

  it('geri sayım sayısını gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} />);
    expect(screen.getByText('359')).toBeTruthy();
  });

  it('son deneme netini gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} />);
    expect(screen.getByText('55.5')).toBeTruthy();
  });

  it('öğrenci yoksa boş state gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} ogrenciId={null} />);
    expect(screen.getByText(/bulunamadı/)).toBeTruthy();
  });

  it('okunmamış mesaj varsa banner gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} okunmamisMesaj={2} />);
    expect(screen.getByText(/2 okunmamış mesaj/)).toBeTruthy();
  });

  it('koç raporu yoksa bilgilendirme mesajı gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} />);
    expect(screen.getByText(/Henüz haftalık rapor/)).toBeTruthy();
  });

  it('koç raporunu gösterir', () => {
    const props = {
      ...defaultProps,
      veliRaporlari: [
        {
          id: 'r1',
          haftaBaslangic: '2026-06-10',
          haftaBitis: '2026-06-16',
          ozetMetni: 'Bu hafta çok iyi çalıştı.',
          calismaGunSayisi: 5,
          toplamSaat: 32,
          gorevTamamlama: 90,
          sonDenemeNet: 55,
        },
      ],
    };
    renderWithProviders(<VeliAnaSayfa {...props} />);
    expect(screen.getByText(/Bu hafta çok iyi çalıştı/)).toBeTruthy();
    expect(screen.getByText('Son Koç Raporu')).toBeTruthy();
  });

  it('dikkat alanlarını gösterir', () => {
    const props = {
      ...defaultProps,
      veliRaporlari: [{ id: 'r1', dikkatAlanlari: ['Matematik', 'Fizik'] }],
    };
    renderWithProviders(<VeliAnaSayfa {...props} />);
    expect(screen.getByText(/Matematik/)).toBeTruthy();
  });

  it('koça mesaj gönder butonu gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} />);
    expect(screen.getByText('Koça Mesaj Gönder')).toBeTruthy();
  });

  it('öğrenci başlığında koç adını gösterir', () => {
    renderWithProviders(<VeliAnaSayfa {...defaultProps} />);
    expect(screen.getByText(/Test Koç/)).toBeTruthy();
  });
});

describe('DenemeKarti', () => {
  const mockS2 = {
    surface: '#fff',
    surface2: '#f0f0f0',
    border: '#e5e7eb',
    text: '#1a202c',
    text2: '#4a5568',
    text3: '#718096',
  };

  it('veri yoksa render etmez', () => {
    const { container } = renderWithProviders(<DenemeKarti denemeler={[]} s={mockS2} />);
    expect(container.firstChild).toBeNull();
  });

  it('toplamNet gösterir', () => {
    renderWithProviders(
      <DenemeKarti denemeler={[{ id: 'd1', toplamNet: 75.5, tarih: '2026-06-01' }]} s={mockS2} />
    );
    expect(screen.getByText('75.5')).toBeTruthy();
  });

  it('Son Deneme başlığını gösterir', () => {
    renderWithProviders(<DenemeKarti denemeler={[{ id: 'd1', toplamNet: 42 }]} s={mockS2} />);
    expect(screen.getByText('Son Deneme')).toBeTruthy();
  });
});

describe('SonRaporKarti', () => {
  const mockS2 = {
    surface: '#fff',
    surface2: '#f0f0f0',
    border: '#e5e7eb',
    text: '#1a202c',
    text2: '#4a5568',
    text3: '#718096',
  };

  it('rapor yoksa bilgilendirme gösterir', () => {
    renderWithProviders(<SonRaporKarti veliRaporlari={[]} s={mockS2} />);
    expect(screen.getByText(/Henüz haftalık rapor/)).toBeTruthy();
  });

  it('rapor metnini kısaltılmış gösterir', () => {
    const uzunMetin = 'A'.repeat(200);
    renderWithProviders(
      <SonRaporKarti veliRaporlari={[{ id: 'r1', ozetMetni: uzunMetin }]} s={mockS2} />
    );
    expect(screen.getByText('Tamamını oku ▼')).toBeTruthy();
  });

  it('dikkat alanlarını gösterir', () => {
    renderWithProviders(
      <SonRaporKarti veliRaporlari={[{ id: 'r1', dikkatAlanlari: ['Fizik'] }]} s={mockS2} />
    );
    expect(screen.getByText(/Fizik/)).toBeTruthy();
  });
});
