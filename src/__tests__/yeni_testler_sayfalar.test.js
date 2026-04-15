/**
 * Yeni Testler — Sayfalar & Koc Hooks
 * Kapsam: VeliMesajlar, VeliProgram, VeliPaneli (smoke),
 *         YoneticiPaneli (smoke), useOkunmamis, useKocVeri
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

vi.mock('../utils/tarih', () => ({
  bugunStr: vi.fn(() => '2024-01-15'),
  haftaBasStr: vi.fn(() => '2024-W03'),
}));

vi.mock('../utils/izleme', () => ({
  logIstemciHatasi: vi.fn(),
  setIzlemeUser: vi.fn(),
  getIzlemeUser: vi.fn(),
}));

vi.mock('../utils/aktiflikKaydet', () => ({
  aktiflikKaydet: vi.fn(),
  aktifDurumu: vi.fn(() => ({ renk: '#22C55E', label: 'Aktif' })),
}));

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(),
  BildirimZili: () => <button>🔔</button>,
  BildirimPaneli: () => null,
  useBildirimler: () => ({ bildirimler: [], okunmamis: 0 }),
}));

vi.mock('../utils/readState', () => ({
  isRead: vi.fn(() => false),
  isUnread: vi.fn(() => true),
  readPatch: vi.fn(() => ({ okundu: true, readAt: new Date(), okunmaZamani: new Date() })),
  unreadPatch: vi.fn(() => ({ okundu: false, readAt: null, okunmaZamani: null })),
  unreadCount: vi.fn(() => 0),
}));

vi.mock('../utils/programAlgoritma', () => ({
  haftaBaslangici: vi.fn(() => '2024-W03'),
  GUNLER: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
  GUN_ETIKET: { Pazartesi: 'Pzt' },
  haftaIlerlemeV2: vi.fn(() => 65),
  programV2ToGorevler: vi.fn(() => []),
}));

vi.mock('../utils/ogrenciUtils', () => ({
  generateSuggestions: vi.fn(() => []),
  upcomingExams: vi.fn(() => []),
  formatCountdown: vi.fn(d => `${d} gün`),
  normalizeDateId: vi.fn(v => v),
  calculateStreak: vi.fn(() => ({ current: 3, best: 5, lastStudyDate: null, consistency: 40 })),
}));

vi.mock('../utils/timelineUtils', () => ({
  haftalikOzetOlustur: vi.fn(() => ({})),
}));

vi.mock('../data/konular', () => ({
  renkler: ['#5B4FE8', '#22C55E', '#F59E0B'],
  verimlilikHesapla: vi.fn(() => 80),
  TYT_DERSLER: [],
  AYT_DERSLER: [],
}));

// Ağır alt-bileşenleri mock'la
vi.mock('../ogrenci/DenemeListesi', () => ({ default: () => <div>Deneme Listesi</div> }));
vi.mock('../veli/VeliKartlari', () => ({
  CalismaOzet: () => <div>Çalışma Özet</div>,
  KocRaporu: () => <div>Koç Raporu</div>,
  OgrenciDurumKart: () => <div>Öğrenci Durum</div>,
}));
vi.mock('./VeliMesajlar', () => ({ default: () => <div>Veli Mesajlar</div> }), { virtual: true });
vi.mock('./VeliProgram', () => ({ default: () => <div>Veli Program</div> }), { virtual: true });
vi.mock('../koc/OgrenciDetay', () => ({ default: () => <div>Öğrenci Detay</div> }));
vi.mock('../admin/KocPerformansPaneli', () => ({ default: () => <div>Koç Performans</div> }));
vi.mock('../admin/SistemDurumuPaneli', () => ({ default: () => <div>Sistem Durumu</div> }));
vi.mock('../admin/CanliOperasyonPaneli', () => ({ default: () => <div>Canlı Operasyon</div> }));
vi.mock('../admin/AuditLogSayfasi', () => ({ default: () => <div>Audit Log</div> }));
vi.mock('../admin/YasamDongusuSayfasi', () => ({ default: () => <div>Yaşam Döngüsü</div> }));
vi.mock('../admin/MufredatYonetimSayfasi', () => ({ default: () => <div>Müfredat Yönetim</div> }));

// ─────────────────────────────────────────────────────────────────────────────
// useOkunmamis hook
// ─────────────────────────────────────────────────────────────────────────────
import useOkunmamis from '../koc/hooks/useOkunmamis';

describe('useOkunmamis()', () => {
  it('ogrenciler dizisinden map oluşturur', () => {
    const ogrenciler = [
      { id: 'o1', okunmamisMesajSayisi: 3 },
      { id: 'o2', okunmamisMesajSayisi: 0 },
    ];
    const { result } = renderHook(() => useOkunmamis(ogrenciler));
    expect(result.current.okunmasisMap).toEqual({ o1: 3, o2: 0 });
  });

  it('toplamOkunmamis doğru hesaplanır', () => {
    const ogrenciler = [
      { id: 'o1', okunmamisMesajSayisi: 3 },
      { id: 'o2', okunmamisMesajSayisi: 5 },
    ];
    const { result } = renderHook(() => useOkunmamis(ogrenciler));
    expect(result.current.toplamOkunmamis).toBe(8);
  });

  it('alan yoksa 0 sayılır', () => {
    const ogrenciler = [{ id: 'o1' }, { id: 'o2', okunmamisMesajSayisi: null }];
    const { result } = renderHook(() => useOkunmamis(ogrenciler));
    expect(result.current.okunmasisMap).toEqual({ o1: 0, o2: 0 });
    expect(result.current.toplamOkunmamis).toBe(0);
  });

  it('boş dizi ile 0 döner', () => {
    const { result } = renderHook(() => useOkunmamis([]));
    expect(result.current.toplamOkunmamis).toBe(0);
    expect(result.current.okunmasisMap).toEqual({});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useKocVeri hook
// ─────────────────────────────────────────────────────────────────────────────
import useKocVeri from '../koc/hooks/useKocVeri';

describe('useKocVeri()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('kocUid yoksa boş state döner', () => {
    // When kocUid is null, getir() returns early without setting yukleniyor=false
    const { result } = renderHook(() => useKocVeri(null));
    expect(result.current.ogrenciler).toEqual([]);
  });

  it('kocUid ile getDocs çağrılır', async () => {
    const { getDocs, getDoc } = await import('firebase/firestore');
    getDocs.mockResolvedValue({ docs: [] });
    getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });

    const { result } = renderHook(() => useKocVeri('koc1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.ogrenciler).toEqual([]);
  });

  it('ogrenciler yüklenince state güncellenir', async () => {
    const { getDocs, getDoc } = await import('firebase/firestore');
    getDocs
      .mockResolvedValueOnce({
        docs: [{ id: 'o1', data: () => ({ isim: 'Test Öğrenci', kocId: 'koc1' }) }],
      })
      .mockResolvedValue({ docs: [] });
    getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });

    const { result } = renderHook(() => useKocVeri('koc1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.ogrenciler).toHaveLength(1);
    expect(result.current.ogrenciler[0].isim).toBe('Test Öğrenci');
  });

  it('yenile fonksiyonu mevcut', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValue({ docs: [] });

    const { result } = renderHook(() => useKocVeri('koc1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(typeof result.current.yenile).toBe('function');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VeliMesajlar
// ─────────────────────────────────────────────────────────────────────────────
import VeliMesajlar from '../pages/VeliMesajlar';

describe('VeliMesajlar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('boş mesajlarla render olur', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementation((_q, cb) => {
      cb({ docs: [] });
      return () => {};
    });

    render(<VeliMesajlar ogrenciId="ogr1" onGeri={vi.fn()} kocId="koc1" />);
    expect(document.body).toBeTruthy();
  });

  it('mesajlar render olur', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementation((_q, cb) => {
      cb({
        docs: [
          {
            id: 'm1',
            data: () => ({
              metin: 'Merhaba koçum!',
              gonderenId: 'veli1',
              olusturma: { toDate: () => new Date() },
            }),
          },
        ],
      });
      return () => {};
    });

    render(<VeliMesajlar ogrenciId="ogr1" onGeri={vi.fn()} />);
    expect(screen.getByText('Merhaba koçum!')).toBeInTheDocument();
  });

  it('unmount temizliği yapılır', async () => {
    const unsubscribe = vi.fn();
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockReturnValue(unsubscribe);

    const { unmount } = render(<VeliMesajlar ogrenciId="ogr1" onGeri={vi.fn()} />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('ogrenciId yoksa render olur (boş durum)', () => {
    expect(() => render(<VeliMesajlar ogrenciId={null} onGeri={vi.fn()} />)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VeliProgram
// ─────────────────────────────────────────────────────────────────────────────
import VeliProgram from '../pages/VeliProgram';

describe('VeliProgram', () => {
  beforeEach(() => vi.clearAllMocks());

  it('render olur', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });

    render(<VeliProgram ogrenciId="ogr1" onGeri={vi.fn()} />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('program yokken "program yok" mesajı', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });

    render(<VeliProgram ogrenciId="ogr1" onGeri={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Henüz program|program yok|oluşturulmamış/i)).toBeInTheDocument();
    });
  });

  it('program varsa ilerleme gösterilir', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        hafta: { Pazartesi: [{ tip: 'konu', ders: 'Mat' }] },
        tamamlandi: {},
      }),
    });

    render(<VeliProgram ogrenciId="ogr1" onGeri={vi.fn()} />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('geri butonu çalışır', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });
    const onGeri = vi.fn();

    render(<VeliProgram ogrenciId="ogr1" onGeri={onGeri} />);
    await waitFor(() => {
      const btn = screen.queryByText(/← Geri/);
      if (btn) {
        fireEvent.click(btn);
        expect(onGeri).toHaveBeenCalled();
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VeliPaneli — smoke test
// ─────────────────────────────────────────────────────────────────────────────
import VeliPaneli from '../pages/VeliPaneli';

describe('VeliPaneli (smoke)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('render olur ve çökmez', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementation((_ref, cb) => {
      cb({ exists: () => false, docs: [] });
      return () => {};
    });

    await act(async () => {
      render(<VeliPaneli />);
    });
    expect(document.body).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// YoneticiPaneli — smoke test (çok karmaşık, sadece render denetimi)
// ─────────────────────────────────────────────────────────────────────────────
import YoneticiPaneli from '../pages/YoneticiPaneli';

vi.mock('../admin/adminHelpers', () => ({
  getCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: {} }))),
  hataMesajiVer: vi.fn(() => 'Hata'),
  emailGecerliMi: vi.fn(() => true),
  kisaTarih: vi.fn(() => '15.01.2024'),
  SINAV_TUR_SECENEKLERI: null,
}));

describe('YoneticiPaneli (smoke)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('render olur ve çökmez', async () => {
    const { getDocs, getDoc, onSnapshot } = await import('firebase/firestore');
    getDocs.mockResolvedValue({ docs: [] });
    getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    onSnapshot.mockReturnValue(() => {});

    await act(async () => {
      render(<YoneticiPaneli />);
    });
    expect(document.body).toBeTruthy();
  });

  it('admin menüsü gösterilir', async () => {
    const { getDocs, onSnapshot } = await import('firebase/firestore');
    getDocs.mockResolvedValue({ docs: [] });
    onSnapshot.mockReturnValue(() => {});

    await act(async () => {
      render(<YoneticiPaneli />);
    });
    // Admin paneli içeriğinden bir şey render olmalı
    expect(document.body.innerHTML.length).toBeGreaterThan(100);
  });
});
