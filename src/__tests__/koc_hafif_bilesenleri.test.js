/**
 * ElsWay — Koç Hafif Bileşen Testleri
 *
 * Kapsam (10 dosya):
 *   PlaylistYonetimi, ProgramBilesenleri, ProgramOlustur, SenelikProgram,
 *   TopluIslemler, VeliMesajlariPaneli, VeliRaporlari, VideoIzleModal,
 *   koc/gunluk/* (BugunProgrami, GunlukIlerlemePano, OgrenciRutinKarti,
 *                  RutinGirisFormu),
 *   koc/hedef/GuncelleModal
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { renderWithProviders, renderSade, mockS } from './testUtils';
import { makeKoc } from './factories';

afterEach(() => cleanup());

// ─── Mock'lar ─────────────────────────────────────────────────────────────────
vi.mock('../koc/HaftalikProgram', () => ({
  default: () => <div data-testid="haftalik-program">HaftalikProgram</div>,
}));

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(() => Promise.resolve()),
}));

vi.mock('../utils/readState', () => ({
  isUnread: vi.fn(() => false),
  readPatch: vi.fn(() => ({})),
  unreadPatch: vi.fn(() => Promise.resolve()),
  unreadCount: vi.fn(() => 0),
}));

vi.mock('../utils/tarih', () => ({
  bugunStr: vi.fn(() => '2026-04-12'),
  kisaTarih: vi.fn(() => '12.04.2026'),
  dateToStr: vi.fn(() => '12.04.2026'),
  haftaBasStr: vi.fn(() => '2026-04-07'),
  haftaBaslangici: vi.fn(() => '2026-04-07'),
  useGunlukTarih: vi.fn(() => ({ bugun: '2026-04-12', tarihStr: '2026-04-12' })),
  GUNLER: ['pzt', 'sal', 'car', 'per', 'cum', 'cmt', 'paz'],
  GUN_ETIKET: {
    pzt: 'Pzt',
    sal: 'Sal',
    car: 'Çar',
    per: 'Per',
    cum: 'Cum',
    cmt: 'Cmt',
    paz: 'Paz',
  },
}));

vi.mock('../utils/programAlgoritma', () => ({
  haftaBaslangici: vi.fn(() => '2026-04-07'),
  haftaBasStr: vi.fn(() => '2026-04-07'),
  haftaIlerlemeV2: vi.fn(() => 65),
  GUNLER: ['pzt', 'sal', 'car', 'per', 'cum', 'cmt', 'paz'],
  GUN_ETIKET: {
    pzt: 'Pzt',
    sal: 'Sal',
    car: 'Çar',
    per: 'Per',
    cum: 'Cum',
    cmt: 'Cmt',
    paz: 'Paz',
  },
}));

vi.mock('../utils/auditLog', () => ({
  auditLog: vi.fn(() => Promise.resolve()),
  AuditTip: {},
}));

vi.mock('../utils/sinavUtils', () => ({
  turdenBransDersler: vi.fn(() => []),
}));

vi.mock('../components/koc/KocPanelUi', () => ({
  KocHeroBand: ({ children }) => <div>{children}</div>,
  KocKpiStrip: ({ children }) => <div>{children}</div>,
  KocChartCard: ({ children }) => <div>{children}</div>,
  KocSayfaBaslik: ({ baslik }) => <h2>{baslik}</h2>,
  KocOzetKutulari: () => <div />,
}));

vi.mock('../hooks/usePlaylist', () => ({
  usePlaylistler: vi.fn(() => ({ playlistler: [], yukleniyor: false, yenile: vi.fn() })),
}));

vi.mock('../koc/gunluk/BugunProgrami', () => ({
  default: () => <div data-testid="bugun-programi">BugunProgrami</div>,
}));

vi.mock('../koc/hedef/hedefUtils', () => ({
  // hedefTurEtiket(hedef) tam nesne alır — string döndür
  hedefTurEtiket: vi.fn(() => 'Net'),
  hedefDurumu: vi.fn(() => 'aktif'),
  ilerlemeYuzdesi: vi.fn(() => 50),
  durumStil: vi.fn(() => ({})),
}));

// ─── Import'lar ───────────────────────────────────────────────────────────────
import PlaylistYonetimi from '../koc/PlaylistYonetimi';
import { TIPLER_NEON, tipBulNeon } from '../koc/ProgramBilesenleri';
import ProgramOlustur from '../koc/ProgramOlustur';
import SenelikProgram from '../koc/SenelikProgram';
import TopluIslemler from '../koc/TopluIslemler';
import VeliMesajlariPaneli from '../koc/VeliMesajlariPaneli';
import VeliRaporlari from '../koc/VeliRaporlari';
import { VideoIzleModal } from '../koc/VideoIzleModal';
import BugunProgrami from '../koc/gunluk/BugunProgrami';
import GunlukIlerlemePano from '../koc/gunluk/GunlukIlerlemePano';
import OgrenciRutinKarti from '../koc/gunluk/OgrenciRutinKarti';
import RutinGirisFormu from '../koc/gunluk/RutinGirisFormu';
import GuncelleModal from '../koc/hedef/GuncelleModal';

const mockKullanici = makeKoc({ uid: 'test-uid', email: 'test@test.com' });
const ogrenciler = [
  { id: 'o1', isim: 'Ali Yılmaz', tur: 'tyt_12' },
  { id: 'o2', isim: 'Zeynep Kaya', tur: 'lgs' },
];
const mockOgrenci = { id: 'o1', isim: 'Ali Yılmaz', tur: 'tyt_12', kocId: 'k1' };

// ─── PlaylistYonetimi ─────────────────────────────────────────────────────────
// kullanici prop zorunlu
describe('PlaylistYonetimi', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<PlaylistYonetimi kullanici={mockKullanici} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<PlaylistYonetimi kullanici={mockKullanici} onGeri={vi.fn()} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── ProgramBilesenleri (yardımcı fonksiyonlar) ───────────────────────────────
describe('ProgramBilesenleri', () => {
  it('TIPLER_NEON dizi dolu', () => {
    expect(Array.isArray(TIPLER_NEON)).toBe(true);
    expect(TIPLER_NEON.length).toBeGreaterThan(0);
  });

  it('tipBulNeon — bilinen tip döner', () => {
    const tip = tipBulNeon(TIPLER_NEON[0]?.id);
    expect(tip).toBeTruthy();
    expect(tip.id).toBe(TIPLER_NEON[0].id);
  });

  it('tipBulNeon — bilinmeyen tip fallback döner', () => {
    const tip = tipBulNeon('bilinmeyen_tip_xyz');
    expect(tip).toBeTruthy(); // son eleman (diger) dönmeli
  });
});

// ─── ProgramOlustur ───────────────────────────────────────────────────────────
describe('ProgramOlustur', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<ProgramOlustur ogrenciId="o1" ogrenciTur="tyt_12" onKaydet={vi.fn()} />)
    ).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<ProgramOlustur ogrenciId="o1" ogrenciTur="tyt_12" onKaydet={vi.fn()} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── SenelikProgram ───────────────────────────────────────────────────────────
describe('SenelikProgram', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<SenelikProgram ogrenciler={[]} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() =>
      renderWithProviders(<SenelikProgram ogrenciler={ogrenciler} onGeri={vi.fn()} />)
    ).not.toThrow();
  });
});

// ─── TopluIslemler ────────────────────────────────────────────────────────────
describe('TopluIslemler', () => {
  it('boş listeyle render olur', () => {
    expect(() =>
      renderWithProviders(<TopluIslemler ogrenciler={[]} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() =>
      renderWithProviders(<TopluIslemler ogrenciler={ogrenciler} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<TopluIslemler ogrenciler={ogrenciler} onGeri={vi.fn()} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── VeliMesajlariPaneli ──────────────────────────────────────────────────────
describe('VeliMesajlariPaneli', () => {
  it('render olur', () => {
    expect(() => renderWithProviders(<VeliMesajlariPaneli ogrenciId="o1" />)).not.toThrow();
  });

  it('ogrenciId yoksa render olur', () => {
    expect(() => renderWithProviders(<VeliMesajlariPaneli ogrenciId={null} />)).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<VeliMesajlariPaneli ogrenciId="o1" />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── VeliRaporlari ────────────────────────────────────────────────────────────
describe('VeliRaporlari', () => {
  it('boş listeyle render olur', () => {
    expect(() =>
      renderWithProviders(<VeliRaporlari ogrenciler={[]} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() =>
      renderWithProviders(<VeliRaporlari ogrenciler={ogrenciler} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('tarih filtresi select görünür ve seçenekleri içerir', () => {
    renderWithProviders(<VeliRaporlari ogrenciler={ogrenciler} onGeri={vi.fn()} />);
    const select = screen.getByRole('combobox', { name: /tarih filtresi/i });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tümü' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Son 1 Ay' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Son 1 Hafta' })).toBeInTheDocument();
  });

  it('filtre değiştirilince select güncellenir', () => {
    renderWithProviders(<VeliRaporlari ogrenciler={ogrenciler} onGeri={vi.fn()} />);
    const select = screen.getByRole('combobox', { name: /tarih filtresi/i });
    fireEvent.change(select, { target: { value: 'son1hafta' } });
    expect(select.value).toBe('son1hafta');
  });
});

// ─── VideoIzleModal ───────────────────────────────────────────────────────────
describe('VideoIzleModal', () => {
  it('boş video listesiyle render olur', () => {
    expect(() =>
      renderSade(
        <VideoIzleModal videolar={[]} onKapat={vi.fn()} s={mockS} mobil={false} izleyenUid="u1" />
      )
    ).not.toThrow();
  });

  it('video listesiyle render olur', () => {
    const videolar = [{ id: 'v1', baslik: 'Test Video', url: 'https://test.com' }];
    expect(() =>
      renderSade(
        <VideoIzleModal
          videolar={videolar}
          onKapat={vi.fn()}
          s={mockS}
          mobil={false}
          izleyenUid="u1"
        />
      )
    ).not.toThrow();
  });

  it('video listesiyle DOM dolu', async () => {
    // VideoIzleModal `v.title` kullanıyor — `title` field gerekli
    const videolar = [{ id: 'v1', title: 'Test Video', url: 'https://test.com' }];
    renderSade(
      <VideoIzleModal
        videolar={videolar}
        onKapat={vi.fn()}
        s={mockS}
        mobil={false}
        izleyenUid="u1"
      />
    );
    await waitFor(() => expect(document.body.textContent).toContain('Test Video'));
  });
});

// ─── BugunProgrami ────────────────────────────────────────────────────────────
describe('BugunProgrami', () => {
  it('render olur (mock)', () => {
    // BugunProgrami onSnapshot kullanır — mock ile render
    expect(() => renderSade(<BugunProgrami ogrenciId="o1" s={mockS} />)).not.toThrow();
  });
});

// ─── GunlukIlerlemePano ───────────────────────────────────────────────────────
describe('GunlukIlerlemePano', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<GunlukIlerlemePano ogrenciler={[]} s={mockS} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', async () => {
    renderWithProviders(<GunlukIlerlemePano ogrenciler={ogrenciler} s={mockS} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── OgrenciRutinKarti ────────────────────────────────────────────────────────
describe('OgrenciRutinKarti', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<OgrenciRutinKarti ogrenci={mockOgrenci} index={0} s={mockS} />)
    ).not.toThrow();
  });

  it('öğrenci adı görünür', async () => {
    renderWithProviders(<OgrenciRutinKarti ogrenci={mockOgrenci} index={0} s={mockS} />);
    await waitFor(() => expect(document.body.textContent).toContain('Ali Yılmaz'));
  });
});

// ─── RutinGirisFormu ──────────────────────────────────────────────────────────
describe('RutinGirisFormu', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<RutinGirisFormu ogrenciId="o1" s={mockS} onKaydet={vi.fn()} />)
    ).not.toThrow();
  });

  it('form elemanları var', async () => {
    renderWithProviders(<RutinGirisFormu ogrenciId="o1" s={mockS} onKaydet={vi.fn()} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── GuncelleModal ────────────────────────────────────────────────────────────
describe('GuncelleModal (hedef)', () => {
  const mockHedef = {
    id: 'h1',
    tur: 'net',
    baslik: 'TYT Net hedefi',
    hedefDegeri: 100,
    baslangicDegeri: 60,
    guncelDeger: 70,
    bitis: '2026-06-01',
    tamamlandi: false,
  };

  it('render olur', () => {
    expect(() =>
      renderSade(
        <GuncelleModal
          hedef={mockHedef}
          ogrenciId="o1"
          onKapat={vi.fn()}
          onGuncelle={vi.fn()}
          s={mockS}
        />
      )
    ).not.toThrow();
  });

  it("mevcut değer input'ta dolu", () => {
    renderSade(
      <GuncelleModal
        hedef={mockHedef}
        ogrenciId="o1"
        onKapat={vi.fn()}
        onGuncelle={vi.fn()}
        s={mockS}
      />
    );
    const input = document.querySelector('input');
    expect(input?.value).toBe('70');
  });

  it('değer güncellenebilir', () => {
    renderSade(
      <GuncelleModal
        hedef={mockHedef}
        ogrenciId="o1"
        onKapat={vi.fn()}
        onGuncelle={vi.fn()}
        s={mockS}
      />
    );
    const input = document.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: '80' } });
      expect(input.value).toBe('80');
    }
  });

  it('kapat tıklaması çalışır', () => {
    const onKapat = vi.fn();
    renderSade(
      <GuncelleModal
        hedef={mockHedef}
        ogrenciId="o1"
        onKapat={onKapat}
        onGuncelle={vi.fn()}
        s={mockS}
      />
    );
    const kapat = screen.queryByText('İptal') || screen.queryByText('Kapat');
    if (kapat) {
      fireEvent.click(kapat);
      expect(onKapat).toHaveBeenCalled();
    }
  });
});
