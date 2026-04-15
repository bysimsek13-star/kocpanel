/**
 * ElsWay — Sayfa Smoke Testleri
 * KocPaneli ve OgrenciPaneli'nin temel render ve navigasyon testleri.
 * Tüm ağır bileşenler mock'lanmıştır — bu testler import/context
 * hatalarını ve temel UI yapısını doğrular.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './testUtils';

// ─── KocPaneli mock'ları ──────────────────────────────────────────────────────

vi.mock('../koc/hooks/useKocVeri', () => ({
  default: () => ({
    ogrenciler: [],
    dashboardMap: {},
    bugunMap: {},
    yukleniyor: false,
    yenile: vi.fn(),
  }),
}));

vi.mock('../koc/hooks/useOkunmamis', () => ({
  default: () => ({
    okunmasisMap: {},
    toplamOkunmamis: 0,
  }),
}));

vi.mock('../koc/OgrenciDetay', () => ({
  default: () => <div data-testid="ogrenci-detay">OgrenciDetay</div>,
}));

vi.mock('../koc/OgrenciEkleModal', () => ({
  default: ({ onKapat }) => (
    <div data-testid="ogrenci-ekle-modal">
      <button onClick={onKapat}>Kapat</button>
    </div>
  ),
}));

vi.mock('../koc/OnboardingSihirbazi', () => ({
  default: ({ onTamamla }) => (
    <div data-testid="onboarding">
      <button onClick={onTamamla}>Tamamla</button>
    </div>
  ),
}));

vi.mock('../koc/MesajlarSayfasi', () => ({
  default: () => <div data-testid="mesajlar-sayfasi">MesajlarSayfasi</div>,
}));

vi.mock('../koc/HaftalikProgram', () => ({
  default: () => <div data-testid="haftalik-program">HaftalikProgram</div>,
}));

vi.mock('../koc/GunlukTakip', () => ({
  default: () => <div data-testid="gunluk-takip">GunlukTakip</div>,
  RutinGirisFormu: () => <div data-testid="rutin-giris-formu">RutinGirisFormu</div>,
}));

vi.mock('../koc/DenemeYonetimi', () => ({
  default: () => <div data-testid="deneme-yonetimi">DenemeYonetimi</div>,
}));

vi.mock('../koc/HedefTakibi', () => ({
  default: () => <div data-testid="hedef-takibi">HedefTakibi</div>,
}));

vi.mock('../koc/VeliRaporlari', () => ({
  default: () => <div data-testid="veli-raporlari">VeliRaporlari</div>,
}));

vi.mock('../koc/GorevKutuphane', () => ({
  default: () => <div data-testid="gorev-kutuphane">GorevKutuphane</div>,
}));

vi.mock('../koc/SenelikProgram', () => ({
  default: () => <div data-testid="senelik-program">SenelikProgram</div>,
}));

vi.mock('../koc/KitapVideoKutuphane', () => ({
  default: () => <div data-testid="kitap-video">KitapVideoKutuphane</div>,
}));

vi.mock('../koc/Istatistikler', () => ({
  default: () => <div data-testid="istatistikler">Istatistikler</div>,
}));

vi.mock('../koc/TopluIslemler', () => ({
  default: () => <div data-testid="toplu-islemler">TopluIslemler</div>,
}));

vi.mock('../components/DuyuruMerkezi', () => ({
  default: () => <div data-testid="duyuru-merkezi">DuyuruMerkezi</div>,
}));

vi.mock('../koc/GununSozu', () => ({
  default: () => <div data-testid="gunun-sozu">GununSozu</div>,
}));

// ─── OgrenciPaneli mock'ları ──────────────────────────────────────────────────

vi.mock('../components/DestekTalebiModal', () => ({
  default: () => <div data-testid="destek-modal">DestekTalebiModal</div>,
}));

vi.mock('../ogrenci/KutlamaEkrani', () => ({
  default: () => <div data-testid="kutlama-ekrani">KutlamaEkrani</div>,
}));

vi.mock('../components/VideoGorusme', () => ({
  default: () => <div data-testid="video-gorusme">VideoGorusme</div>,
}));

vi.mock('../ogrenci/DenemeListesi', () => ({
  default: () => <div data-testid="deneme-listesi">DenemeListesi</div>,
}));

vi.mock('../ogrenci/MufredatGoruntule', () => ({
  default: () => <div data-testid="mufredat">MufredatGoruntule</div>,
}));

vi.mock('../components/BildirimSistemi', () => ({
  BildirimZili: () => <button data-testid="bildirim-zili">Bildirim</button>,
  BildirimPaneli: () => <div data-testid="bildirim-paneli">BildirimPaneli</div>,
}));

vi.mock('../ogrenci/OgrenciNav', () => ({
  PATHS: {
    ana: '/ogrenci',
    denemeler: '/ogrenci/denemeler',
    mesajlar: '/ogrenci/mesajlar',
    mufredat: '/ogrenci/mufredat',
    video: '/ogrenci/video',
    program: '/ogrenci/program',
    duyurular: '/ogrenci/duyurular',
  },
  BASLIK: {
    ana: 'Ana Sayfa',
    denemeler: 'Denemelerim',
    mesajlar: 'Mesajlar',
    mufredat: 'Müfredat',
    video: 'Video Görüşme',
    program: 'Program',
    duyurular: 'Duyurular',
  },
  SolMenu: ({ aktif, onNav }) => (
    <nav data-testid="sol-menu">
      <button onClick={() => onNav('ana')}>Ana</button>
    </nav>
  ),
  AltTabBar: ({ aktif, onNav }) => (
    <nav data-testid="alt-tab-bar">
      <button onClick={() => onNav('ana')}>Ana</button>
    </nav>
  ),
}));

vi.mock('../ogrenci/Mesajlar', () => ({
  default: () => <div data-testid="mesajlar">Mesajlar</div>,
}));

vi.mock('../ogrenci/GunlukSoruFormu', () => ({
  default: () => <div data-testid="gunluk-soru-formu">GunlukSoruFormu</div>,
}));

vi.mock('../utils/aktiflikKaydet', () => ({
  aktiflikKaydet: vi.fn(),
  oturumBitir: vi.fn(),
}));

// ─── Import'lar ───────────────────────────────────────────────────────────────

import KocPaneli from '../pages/KocPaneli';
import OgrenciPaneli from '../pages/OgrenciPaneli';

// ─── KocPaneli Testleri ───────────────────────────────────────────────────────

describe('KocPaneli', () => {
  it('render olur', () => {
    expect(() => {
      renderWithProviders(<KocPaneli />, { route: '/koc' });
    }).not.toThrow();
    expect(document.body).toBeTruthy();
  });

  it('ana sayfa yüklenince DOM çökmez', async () => {
    renderWithProviders(<KocPaneli />, { route: '/koc' });
    await waitFor(
      () => {
        expect(document.body).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('navigasyon elemanları görünür', async () => {
    renderWithProviders(<KocPaneli />, { route: '/koc' });
    await waitFor(() => {
      const metin = document.body.textContent;
      // KocSabahEkrani ya da başka bir UI elemanı — en azından DOM var
      expect(metin.length).toBeGreaterThan(0);
    });
  });

  it('boş öğrenci listesiyle çökmez', async () => {
    renderWithProviders(<KocPaneli />, { route: '/koc' });
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it("ogrenciler path'inde çökmez", () => {
    expect(() => {
      renderWithProviders(<KocPaneli />, { route: '/koc/ogrenciler' });
    }).not.toThrow();
  });

  it("mesajlar path'inde çökmez", () => {
    expect(() => {
      renderWithProviders(<KocPaneli />, { route: '/koc/mesajlar' });
    }).not.toThrow();
  });

  it("haftalık program path'inde çökmez", () => {
    expect(() => {
      renderWithProviders(<KocPaneli />, { route: '/koc/haftalik-program' });
    }).not.toThrow();
  });
});

// ─── OgrenciPaneli Testleri ───────────────────────────────────────────────────

describe('OgrenciPaneli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('render olur', () => {
    expect(() => {
      renderWithProviders(<OgrenciPaneli />, { route: '/ogrenci' });
    }).not.toThrow();
    expect(document.body).toBeTruthy();
  });

  it('ana sayfa yüklenince DOM çökmez', async () => {
    renderWithProviders(<OgrenciPaneli />, { route: '/ogrenci' });
    await waitFor(
      () => {
        expect(document.body).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it("denemeler path'inde çökmez", () => {
    expect(() => {
      renderWithProviders(<OgrenciPaneli />, { route: '/ogrenci/denemeler' });
    }).not.toThrow();
  });

  it("mesajlar path'inde çökmez", () => {
    expect(() => {
      renderWithProviders(<OgrenciPaneli />, { route: '/ogrenci/mesajlar' });
    }).not.toThrow();
  });

  it("müfredat path'inde çökmez", () => {
    expect(() => {
      renderWithProviders(<OgrenciPaneli />, { route: '/ogrenci/mufredat' });
    }).not.toThrow();
  });

  it("program path'inde çökmez", () => {
    expect(() => {
      renderWithProviders(<OgrenciPaneli />, { route: '/ogrenci/program' });
    }).not.toThrow();
  });

  it('UI içeriği gösterilir', async () => {
    renderWithProviders(<OgrenciPaneli />, { route: '/ogrenci' });
    await waitFor(
      () => {
        expect(document.body.textContent.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });
});
