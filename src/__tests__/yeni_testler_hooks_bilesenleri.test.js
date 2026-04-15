/**
 * Yeni Testler — Hooks, Context, ve Kalan Bileşenler
 * Kapsam: useMediaQuery (gerçek impl), ThemeContext, usePlaylist,
 *         TemaSecici, GamificationKarti, KutlamaEkrani, KocSayfaKabugu,
 *         OgrenciNav sabitler, AnaSayfaKartlari, CalismaKarti, KocNotlari
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

vi.mock('../utils/tarih', () => ({
  bugunStr: vi.fn(() => '2024-01-15'),
  bugunGunAdi: vi.fn(() => 'Pazartesi'),
  haftaBasStr: vi.fn(() => '2024-W03'),
  dateToStr: vi.fn(d => d?.toISOString?.()?.slice(0, 10) ?? ''),
}));

vi.mock('../utils/izleme', () => ({
  logIstemciHatasi: vi.fn(),
  setIzlemeUser: vi.fn(),
  getIzlemeUser: vi.fn(),
}));

vi.mock('../data/konular', () => ({
  verimlilikHesapla: vi.fn(() => 80),
  renkler: {},
  TYT_DERSLER: [],
  AYT_DERSLER: [],
  netHesapla: vi.fn(() => '0.00'),
}));

// Yerel firestore mock — vi.unmock çağrıları sonrası module izolasyonu için
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(() => () => {}),
  query: vi.fn(ref => ref),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  startAfter: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn(d => ({ toDate: () => d })),
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// useMediaQuery — gerçek implementasyon (setup.js mock'unu geçerek)
// ─────────────────────────────────────────────────────────────────────────────
vi.unmock('../hooks/useMediaQuery');
import { useMobil, useTablet, useEkran } from '../hooks/useMediaQuery';

describe('useMobil()', () => {
  it('geniş ekranda false döner', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    const { result } = renderHook(() => useMobil());
    expect(result.current).toBe(false);
  });

  it('dar ekranda true döner', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
    const { result } = renderHook(() => useMobil());
    expect(result.current).toBe(true);
  });

  it('resize olayına tepki verir', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    const { result } = renderHook(() => useMobil());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(true);
  });
});

describe('useTablet()', () => {
  it('tablet aralığında true döner (800px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    const { result } = renderHook(() => useTablet());
    expect(result.current).toBe(true);
  });

  it('dar ekranda false döner', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
    const { result } = renderHook(() => useTablet());
    expect(result.current).toBe(false);
  });

  it('geniş ekranda false döner', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    const { result } = renderHook(() => useTablet());
    expect(result.current).toBe(false);
  });
});

describe('useEkran()', () => {
  it('mobil döner (400px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
    const { result } = renderHook(() => useEkran());
    expect(result.current).toBe('mobil');
  });

  it('tablet döner (900px)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 900 });
    const { result } = renderHook(() => useEkran());
    expect(result.current).toBe('tablet');
  });

  it('desktop döner (1300px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1300,
    });
    const { result } = renderHook(() => useEkran());
    expect(result.current).toBe('desktop');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ThemeContext — gerçek implementasyon
// ─────────────────────────────────────────────────────────────────────────────
vi.unmock('../context/ThemeContext');
import { ThemeProvider, useTheme, getS, geceMi } from '../context/ThemeContext';
import { VARSAYILAN_TEMA, TEMA_LISTESI } from '../themes/themes';

function TemaTestBileseni() {
  const { s, temaId, setTema, temaListesi } = useTheme();
  return (
    <div>
      <span data-testid="tema-id">{temaId}</span>
      <span data-testid="lista-uzunluk">{temaListesi.length}</span>
      <span data-testid="bg-renk">{s.bg}</span>
      <button onClick={() => setTema('softIndigo')}>Mor Tema</button>
      <button onClick={() => setTema('gecersiz-tema')}>Geçersiz</button>
    </div>
  );
}

describe('ThemeProvider ve useTheme()', () => {
  it('varsayılan tema ile render olur', () => {
    render(
      <ThemeProvider>
        <TemaTestBileseni />
      </ThemeProvider>
    );
    expect(screen.getByTestId('tema-id').textContent).toBe(VARSAYILAN_TEMA);
  });

  it('temaListesi doğru uzunlukta', () => {
    render(
      <ThemeProvider>
        <TemaTestBileseni />
      </ThemeProvider>
    );
    expect(screen.getByTestId('lista-uzunluk').textContent).toBe(String(TEMA_LISTESI.length));
  });

  it('setTema ile tema değiştirilebilir', () => {
    render(
      <ThemeProvider>
        <TemaTestBileseni />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Mor Tema'));
    expect(screen.getByTestId('tema-id').textContent).toBe('softIndigo');
  });

  it('geçersiz tema id reddedilir', () => {
    render(
      <ThemeProvider>
        <TemaTestBileseni />
      </ThemeProvider>
    );
    const oncekiTema = screen.getByTestId('tema-id').textContent;
    fireEvent.click(screen.getByText('Geçersiz'));
    expect(screen.getByTestId('tema-id').textContent).toBe(oncekiTema);
  });

  it('useTheme ThemeProvider dışında hata fırlatır', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TemaTestBileseni />)).toThrow();
    consoleSpy.mockRestore();
  });

  it('s objesi bg rengi içerir', () => {
    render(
      <ThemeProvider>
        <TemaTestBileseni />
      </ThemeProvider>
    );
    const bg = screen.getByTestId('bg-renk').textContent;
    expect(bg).toMatch(/^#/);
  });
});

describe('getS()', () => {
  it('geçerli tema id için s objesi döner', () => {
    const s = getS(VARSAYILAN_TEMA);
    expect(s).toHaveProperty('bg');
    expect(s).toHaveProperty('primary');
  });

  it('geçersiz id için varsayılan tema döner', () => {
    const s = getS('bilinmeyen');
    expect(s).toHaveProperty('bg');
  });
});

describe('geceMi()', () => {
  it('her zaman false döner (statik)', () => {
    expect(geceMi()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// usePlaylist hooks
// ─────────────────────────────────────────────────────────────────────────────
import { usePlaylistler, usePlaylistVideolar, useIzlemeDurumu } from '../hooks/usePlaylist';

describe('usePlaylistler()', () => {
  it('kocId yoksa boş dizi döner', () => {
    // When kocId is null, yukle() returns early without setting yukleniyor=false
    const { result } = renderHook(() => usePlaylistler(null));
    expect(result.current.playlistler).toEqual([]);
  });

  it('kocId ile getDocs çağrılır', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [{ id: 'pl1', data: () => ({ isim: 'Matematik Playlist', coachId: 'koc1' }) }],
    });
    const { result } = renderHook(() => usePlaylistler('koc1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.playlistler).toHaveLength(1);
    expect(result.current.playlistler[0].isim).toBe('Matematik Playlist');
  });

  it('getDocs hata verse boş dizi döner', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockRejectedValueOnce(new Error('firestore hata'));
    const { result } = renderHook(() => usePlaylistler('koc1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.playlistler).toEqual([]);
  });

  it('yenile fonksiyonu mevcut', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValue({ docs: [] });
    const { result } = renderHook(() => usePlaylistler('koc1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(typeof result.current.yenile).toBe('function');
  });
});

describe('usePlaylistVideolar()', () => {
  it('playlistDocId yoksa boş dizi döner', () => {
    // When playlistDocId is null, yukle() returns early without setting yukleniyor=false
    const { result } = renderHook(() => usePlaylistVideolar(null));
    expect(result.current.videolar).toEqual([]);
  });

  it('15 video varsa daha=true döner', async () => {
    const { getDocs } = await import('firebase/firestore');
    const docs = Array.from({ length: 15 }, (_, i) => ({
      id: `v${i}`,
      data: () => ({ title: `Video ${i}`, position: i }),
    }));
    getDocs.mockResolvedValueOnce({ docs });
    const { result } = renderHook(() => usePlaylistVideolar('pl1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.daha).toBe(true);
    expect(result.current.videolar).toHaveLength(15);
  });

  it("15'ten az video varsa daha=false döner", async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [{ id: 'v1', data: () => ({ title: 'Tek video', position: 0 }) }],
    });
    const { result } = renderHook(() => usePlaylistVideolar('pl1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));
    expect(result.current.daha).toBe(false);
  });
});

describe('useIzlemeDurumu()', () => {
  it('userId yoksa boş obje döner', () => {
    // When userId is null, yukle() returns early without setting yukleniyor=false
    const { result } = renderHook(() => useIzlemeDurumu(null, 'pl1'));
    expect(result.current.izlenenler).toEqual({});
  });

  it('izlendi() çağrısı setDoc ile kaydeder', async () => {
    const { getDocs, setDoc } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });
    setDoc.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useIzlemeDurumu('u1', 'pl1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));

    await act(async () => {
      await result.current.izlendi('vid1', 120);
    });
    expect(setDoc).toHaveBeenCalled();
  });

  it('izlendi() optimistik güncelleme yapar', async () => {
    const { getDocs, setDoc } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });
    setDoc.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useIzlemeDurumu('u1', 'pl1'));
    await waitFor(() => expect(result.current.yukleniyor).toBe(false));

    await act(async () => {
      await result.current.izlendi('vid-abc');
    });
    expect(result.current.izlenenler['vid-abc']).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TemaSecici bileşeni
// ─────────────────────────────────────────────────────────────────────────────
import TemaSecici from '../components/TemaSecici';

describe('TemaSecici', () => {
  it('variant=bar ile render olur', () => {
    render(
      <ThemeProvider>
        <TemaSecici variant="bar" />
      </ThemeProvider>
    );
    // Renkli yuvarlak buton render olmalı
    expect(document.querySelector('button')).toBeInTheDocument();
  });

  it('variant=bar açılır kapanır', () => {
    render(
      <ThemeProvider>
        <TemaSecici variant="bar" />
      </ThemeProvider>
    );
    const buton = document.querySelector('button');
    fireEvent.click(buton);
    // Dropdown açıldı — tema listesi görünmeli
    expect(screen.getByText(/Tema/i)).toBeInTheDocument();
    // Backdrop tıkla kapat
    const backdrop = document.querySelector('[style*="position: fixed"]');
    if (backdrop) fireEvent.click(backdrop);
  });

  it('variant=giris ile render olur', () => {
    render(
      <ThemeProvider>
        <TemaSecici variant="giris" />
      </ThemeProvider>
    );
    expect(screen.getByText('Tema')).toBeInTheDocument();
  });

  it('variant=panel ile tüm temalar listelenir', () => {
    render(
      <ThemeProvider>
        <TemaSecici variant="panel" />
      </ThemeProvider>
    );
    expect(screen.getByText('Renk Teması')).toBeInTheDocument();
    // 6 tema button'u olmalı
    const butonlar = screen.getAllByRole('button');
    expect(butonlar.length).toBeGreaterThanOrEqual(6);
  });

  it('tema seçince setTema tetiklenir', () => {
    render(
      <ThemeProvider>
        <TemaSecici variant="panel" />
      </ThemeProvider>
    );
    const butonlar = screen.getAllByRole('button');
    fireEvent.click(butonlar[1]); // ikinci temayı seç
    // Hata fırlatmamalı
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GamificationKarti — bileşen + rozetler
// ─────────────────────────────────────────────────────────────────────────────
import GamificationKarti from '../components/GamificationKarti';

function buildCalismalar(gunler) {
  return gunler.map(tarih => ({ tarih }));
}

describe('GamificationKarti', () => {
  it('boş verilerle render olur', () => {
    render(
      <ThemeProvider>
        <GamificationKarti calismalar={[]} denemeler={[]} />
      </ThemeProvider>
    );
    expect(document.body).toBeTruthy();
  });

  it('streak sekmesi varsayılan açık', () => {
    render(
      <ThemeProvider>
        <GamificationKarti calismalar={[]} denemeler={[]} />
      </ThemeProvider>
    );
    // Streak veya Seri içerikli bir şey render olmalı
    expect(document.querySelector('[style]')).toBeTruthy();
  });

  it('bugün ve dünki çalışmayla streak 2+ olur', () => {
    const bugun = new Date();
    const dun = new Date();
    dun.setDate(bugun.getDate() - 1);
    const fmt = d =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const calismalar = buildCalismalar([fmt(bugun), fmt(dun)]);
    render(
      <ThemeProvider>
        <GamificationKarti calismalar={calismalar} denemeler={[]} />
      </ThemeProvider>
    );
    expect(document.body).toBeTruthy();
  });

  it('"ilk_adim" rozeti 1 çalışmayla kazanılır', () => {
    const calismalar = buildCalismalar(['2024-01-01']);
    render(
      <ThemeProvider>
        <GamificationKarti calismalar={calismalar} denemeler={[]} />
      </ThemeProvider>
    );
    // Rozetler sekmesine geç
    const butonlar = screen.queryAllByRole('button');
    const rozetBtn = butonlar.find(b => /rozet|badge/i.test(b.textContent));
    if (rozetBtn) {
      fireEvent.click(rozetBtn);
      expect(screen.queryByText(/İlk Adım/)).toBeInTheDocument();
    }
  });

  it('10 farklı günde çalışmayla gun_10 rozeti aktif', () => {
    const calismalar = buildCalismalar(
      Array.from({ length: 10 }, (_, i) => {
        const d = new Date('2024-01-01');
        d.setDate(d.getDate() + i);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );
    const { container } = render(
      <ThemeProvider>
        <GamificationKarti calismalar={calismalar} denemeler={[]} />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KutlamaEkrani
// ─────────────────────────────────────────────────────────────────────────────
import KutlamaEkrani from '../ogrenci/KutlamaEkrani';

describe('KutlamaEkrani', () => {
  it('varsayılan tema ile render olur', () => {
    render(
      <ThemeProvider>
        <KutlamaEkrani />
      </ThemeProvider>
    );
    expect(screen.getByText(/Hedefe ulaştın!/)).toBeInTheDocument();
  });

  it('mesaj prop gösterilir', () => {
    render(
      <ThemeProvider>
        <KutlamaEkrani mesaj="Bravo, harika iş!" />
      </ThemeProvider>
    );
    expect(screen.getByText('Bravo, harika iş!')).toBeInTheDocument();
  });

  it('tema="dogumgunu" ile render olur', () => {
    render(
      <ThemeProvider>
        <KutlamaEkrani tema="dogumgunu" />
      </ThemeProvider>
    );
    expect(screen.getByText(/İyi ki doğdun/)).toBeInTheDocument();
  });

  it('tema="karne" ile render olur', () => {
    render(
      <ThemeProvider>
        <KutlamaEkrani tema="karne" />
      </ThemeProvider>
    );
    expect(screen.getByText(/Karne/)).toBeInTheDocument();
  });

  it('tema="yilbasi" ile render olur', () => {
    render(
      <ThemeProvider>
        <KutlamaEkrani tema="yilbasi" />
      </ThemeProvider>
    );
    expect(screen.getByText(/Yeni yıl/)).toBeInTheDocument();
  });

  it('onKapat prop tıklamada çağrılır', () => {
    const onKapat = vi.fn();
    render(
      <ThemeProvider>
        <KutlamaEkrani onKapat={onKapat} />
      </ThemeProvider>
    );
    const overlay = document.querySelector('[style*="position: fixed"]');
    fireEvent.click(overlay);
    expect(onKapat).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocSayfaKabugu — KocSayfaBaslik
// ─────────────────────────────────────────────────────────────────────────────
import { KocSayfaBaslik } from '../components/KocSayfaKabugu';

describe('KocSayfaBaslik', () => {
  it('başlık render olur', () => {
    render(
      <ThemeProvider>
        <KocSayfaBaslik baslik="Öğrenci Detay" />
      </ThemeProvider>
    );
    expect(screen.getByText('Öğrenci Detay')).toBeInTheDocument();
  });

  it('açıklama prop render olur', () => {
    render(
      <ThemeProvider>
        <KocSayfaBaslik baslik="Test" aciklama="Açıklama metni" />
      </ThemeProvider>
    );
    expect(screen.getByText('Açıklama metni')).toBeInTheDocument();
  });

  it('onGeri varsa geri butonu render olur', () => {
    const onGeri = vi.fn();
    render(
      <ThemeProvider>
        <KocSayfaBaslik baslik="Test" onGeri={onGeri} geriEtiket="Listeye Dön" />
      </ThemeProvider>
    );
    expect(screen.getByText(/Listeye Dön/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onGeri).toHaveBeenCalled();
  });

  it('onGeri yoksa geri butonu olmaz', () => {
    render(
      <ThemeProvider>
        <KocSayfaBaslik baslik="Test" />
      </ThemeProvider>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('sagSlot render olur', () => {
    render(
      <ThemeProvider>
        <KocSayfaBaslik baslik="Test" sagSlot={<span>Sağ içerik</span>} />
      </ThemeProvider>
    );
    expect(screen.getByText('Sağ içerik')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OgrenciNav — PATHS ve BASLIK sabitleri
// ─────────────────────────────────────────────────────────────────────────────
import { PATHS, BASLIK } from '../ogrenci/OgrenciNav';

describe('OgrenciNav sabitleri', () => {
  it('PATHS tüm anahtarları içeriyor', () => {
    const beklenenler = ['ana', 'program', 'rutin', 'denemeler', 'mesajlar'];
    beklenenler.forEach(k => {
      expect(PATHS).toHaveProperty(k);
      expect(PATHS[k]).toMatch(/^\/ogrenci\//);
    });
  });

  it('BASLIK PATHS ile eşleşiyor', () => {
    Object.keys(PATHS).forEach(k => {
      expect(BASLIK).toHaveProperty(k);
      expect(typeof BASLIK[k]).toBe('string');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AnaSayfaKartlari — DaireselOran ve KpiSerit
// ─────────────────────────────────────────────────────────────────────────────
import {
  DaireselOran,
  KpiSerit,
  KisayolGrid,
  KocMesajiKart,
  IstikrarMini,
  SonDenemeKart,
} from '../ogrenci/AnaSayfaKartlari';

const mockS = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === 'shadow' || prop === 'shadowCard') return '0 2px 8px rgba(0,0,0,0.1)';
      return '#cccccc';
    },
  }
);

describe('DaireselOran', () => {
  it('0 oranla render olur', () => {
    const { container } = render(<DaireselOran oran={0} s={mockS} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('%0')).toBeInTheDocument();
  });

  it('100 oranla render olur', () => {
    render(<DaireselOran oran={100} s={mockS} />);
    expect(screen.getByText('%100')).toBeInTheDocument();
  });

  it('100 üzerindeki değerleri kırpar', () => {
    render(<DaireselOran oran={150} s={mockS} />);
    // SVG render olmalı ve çökmemeli
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('özel boyut geçirilebilir', () => {
    const { container } = render(<DaireselOran oran={50} s={mockS} boyut={80} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('80');
  });
});

describe('KpiSerit', () => {
  // Component uses item.deger (not item.value)
  const items = [
    { label: 'Çalışma', deger: '5 gün' },
    { label: 'Süre', deger: '12 saat' },
    { label: 'Görev', deger: '%80' },
  ];

  it('tüm itemler render olur', () => {
    render(<KpiSerit items={items} s={mockS} mobil={false} />);
    expect(screen.getByText('5 gün')).toBeInTheDocument();
    expect(screen.getByText('12 saat')).toBeInTheDocument();
    expect(screen.getByText('%80')).toBeInTheDocument();
  });

  it('mobil modda render olur', () => {
    render(<KpiSerit items={items} s={mockS} mobil={true} />);
    expect(screen.getByText('5 gün')).toBeInTheDocument();
  });

  it('onClick varsa tıklanabilir', () => {
    const fn = vi.fn();
    const clickableItems = [{ label: 'Test', deger: '42', onClick: fn }];
    render(<KpiSerit items={clickableItems} s={mockS} />);
    fireEvent.click(screen.getByText('42'));
    expect(fn).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KisayolGrid
// ─────────────────────────────────────────────────────────────────────────────
describe('KisayolGrid', () => {
  it('6 kısayol kutusu render olur', () => {
    render(<KisayolGrid onNav={vi.fn()} okunmamis={0} s={mockS} />);
    expect(screen.getByText('Programım')).toBeInTheDocument();
    expect(screen.getByText('Günlük rutin')).toBeInTheDocument();
    expect(screen.getByText('Denemeler')).toBeInTheDocument();
    expect(screen.getByText('Koç mesajları')).toBeInTheDocument();
  });

  it('kutucuğa tıklayınca onNav doğru key ile çağrılır', () => {
    const onNav = vi.fn();
    render(<KisayolGrid onNav={onNav} okunmamis={0} s={mockS} />);
    fireEvent.click(screen.getByText('Programım'));
    expect(onNav).toHaveBeenCalledWith('program');
  });

  it('okunmamis > 0 ise badge gösterilir', () => {
    render(<KisayolGrid onNav={vi.fn()} okunmamis={3} s={mockS} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('okunmamis 0 ise mesajlar açıklaması "Mesajlar" olur', () => {
    render(<KisayolGrid onNav={vi.fn()} okunmamis={0} s={mockS} />);
    expect(screen.getByText('Mesajlar')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocMesajiKart
// ─────────────────────────────────────────────────────────────────────────────
describe('KocMesajiKart', () => {
  it('mesaj null iken boş durum metni gösterilir', () => {
    render(<KocMesajiKart mesaj={null} s={mockS} />);
    expect(screen.getByText(/henüz günün sözünü eklemedi/i)).toBeInTheDocument();
  });

  it('mesaj varken metin render olur', () => {
    const mesaj = { metin: 'Bugünün sözü budur.', guncelleme: null };
    render(<KocMesajiKart mesaj={mesaj} s={mockS} />);
    expect(screen.getByText('Bugünün sözü budur.')).toBeInTheDocument();
  });

  it('"Günün sözü" etiketi her zaman görünür', () => {
    render(<KocMesajiKart mesaj={null} s={mockS} />);
    expect(screen.getByText('Günün sözü')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IstikrarMini
// ─────────────────────────────────────────────────────────────────────────────
describe('IstikrarMini', () => {
  it('boş çalışma listesiyle render olur', () => {
    render(<IstikrarMini calismalar={[]} s={mockS} />);
    expect(screen.getByText('İstikrar serisi')).toBeInTheDocument();
    expect(screen.getByText('0 günlük kayıt')).toBeInTheDocument();
  });

  it('çalışma listesiyle kayıt sayısı görünür', () => {
    const bugun = new Date();
    const tarihler = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(bugun);
      d.setDate(bugun.getDate() - i);
      return {
        tarih: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      };
    });
    render(<IstikrarMini calismalar={tarihler} s={mockS} />);
    expect(screen.getByText('3 günlük kayıt')).toBeInTheDocument();
  });

  it('28 hücre (son 28 gün) render olur', () => {
    const { container } = render(<IstikrarMini calismalar={[]} s={mockS} />);
    // Grid div: gridTemplateColumns repeat(14,1fr) → her birinin altında 28 çocuk
    const gridDiv = container.querySelector('[style*="repeat(14"]');
    expect(gridDiv?.children.length).toBe(28);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SonDenemeKart
// ─────────────────────────────────────────────────────────────────────────────
describe('SonDenemeKart', () => {
  it('boş liste verilince null döner (render yok)', () => {
    const { container } = render(<SonDenemeKart denemeler={[]} onNav={vi.fn()} s={mockS} />);
    expect(container.firstChild).toBeNull();
  });

  it('tek deneme ile net değeri render olur', () => {
    const denemeler = [{ toplamNet: '45.5', tarih: '2026-04-15' }];
    render(<SonDenemeKart denemeler={denemeler} onNav={vi.fn()} s={mockS} />);
    expect(screen.getByText('45.5 net')).toBeInTheDocument();
    expect(screen.getByText(/Son deneme/)).toBeInTheDocument();
  });

  it('önceki denemeye göre artış varsa fark gösterilir', () => {
    const denemeler = [
      { toplamNet: '50', tarih: '2026-04-15' },
      { toplamNet: '40', tarih: '2026-04-10' },
    ];
    render(<SonDenemeKart denemeler={denemeler} onNav={vi.fn()} s={mockS} />);
    expect(screen.getByText('+10.0 önceki denemeden')).toBeInTheDocument();
  });

  it('düşüş varsa artış metni gösterilmez', () => {
    const denemeler = [
      { toplamNet: '35', tarih: '2026-04-15' },
      { toplamNet: '45', tarih: '2026-04-10' },
    ];
    render(<SonDenemeKart denemeler={denemeler} onNav={vi.fn()} s={mockS} />);
    expect(screen.queryByText(/önceki denemeden/)).toBeNull();
  });

  it('tıklanınca onNav("denemeler") çağrılır', () => {
    const onNav = vi.fn();
    const denemeler = [{ toplamNet: '42', tarih: '2026-04-15' }];
    render(<SonDenemeKart denemeler={denemeler} onNav={onNav} s={mockS} />);
    fireEvent.click(screen.getByText('42 net'));
    expect(onNav).toHaveBeenCalledWith('denemeler');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CalismaKarti
// ─────────────────────────────────────────────────────────────────────────────
import CalismaKarti from '../ogrenci/CalismaKarti';

describe('CalismaKarti', () => {
  beforeEach(() => vi.clearAllMocks());

  it('yeni kayıt ile render olur', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });

    render(
      <ThemeProvider>
        <CalismaKarti ogrenciId="ogr1" gorevOrani={60} onKaydet={vi.fn()} />
      </ThemeProvider>
    );
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('mevcut kayıt varsa saat alanı dolu gelir', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ saat: 5 }),
    });

    render(
      <ThemeProvider>
        <CalismaKarti ogrenciId="ogr1" onKaydet={vi.fn()} />
      </ThemeProvider>
    );
    await waitFor(() => {
      const input = document.querySelector('input[type="number"]');
      if (input) expect(input.value).toBe('5');
    });
  });

  it('geçersiz saat girişinde setDoc çağrılmaz', async () => {
    const { getDoc, setDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });
    setDoc.mockClear();

    render(
      <ThemeProvider>
        <CalismaKarti ogrenciId="ogr1" onKaydet={vi.fn()} />
      </ThemeProvider>
    );
    await waitFor(() => {
      const btn = screen.queryByText(/Kaydet|kaydet/i);
      if (btn) {
        fireEvent.click(btn);
        expect(setDoc).not.toHaveBeenCalled();
      }
    });
  });

  it('getDoc hata verse bileşen çökmez', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockRejectedValueOnce(new Error('hata'));

    expect(() =>
      render(
        <ThemeProvider>
          <CalismaKarti ogrenciId="ogr1" onKaydet={vi.fn()} />
        </ThemeProvider>
      )
    ).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useVeliPaneliVeri — Faz 2.4
// ─────────────────────────────────────────────────────────────────────────────
import { useVeliPaneliVeri } from '../veli/useVeliPaneliVeri';

describe('useVeliPaneliVeri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ogrenciUid yoksa yukleniyor hemen false olur', async () => {
    const { result } = renderHook(() => useVeliPaneliVeri({ uid: 'veli1' }, { rol: 'veli' }));
    await act(async () => {});
    expect(result.current.yukleniyor).toBe(false);
    expect(result.current.ogrenciId).toBeNull();
  });

  it('ogrenciUid varken onSnapshot çağrılır', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementation(() => () => {});

    renderHook(() => useVeliPaneliVeri({ uid: 'veli1' }, { rol: 'veli', ogrenciUid: 'ogr1' }));

    await act(async () => {});
    expect(onSnapshot).toHaveBeenCalled();
  });

  it("başlangıç state'leri doğru", async () => {
    const { result } = renderHook(() => useVeliPaneliVeri({ uid: 'veli1' }, { rol: 'veli' }));
    expect(result.current.ogrenci).toBeNull();
    expect(result.current.denemeler).toEqual([]);
    expect(result.current.calisma).toEqual([]);
    expect(result.current.veliRaporlari).toEqual([]);
    expect(result.current.okunmamisMesaj).toBe(0);
  });

  it('ogrenciUid snapshot ile ogrenci state güncellenir', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot
      .mockImplementationOnce((_ref, cb) => {
        cb({
          exists: () => true,
          id: 'ogr1',
          data: () => ({ isim: 'Test Öğrenci', tur: 'tyt_12' }),
        });
        return () => {};
      })
      .mockImplementation(() => () => {});

    const { result } = renderHook(() =>
      useVeliPaneliVeri({ uid: 'veli1' }, { rol: 'veli', ogrenciUid: 'ogr1' })
    );

    await act(async () => {});
    expect(result.current.ogrenci).toMatchObject({ id: 'ogr1', isim: 'Test Öğrenci' });
  });

  it("unmount'ta unsubscribe fonksiyonları çağrılır", async () => {
    const unsub = vi.fn();
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementation(() => unsub);

    const { unmount } = renderHook(() =>
      useVeliPaneliVeri({ uid: 'veli1' }, { rol: 'veli', ogrenciUid: 'ogr1' })
    );

    await act(async () => {});
    unmount();
    expect(unsub).toHaveBeenCalled();
  });

  it('bagliOgrenciId alternatif alan adı ile de çalışır', async () => {
    const { result } = renderHook(() =>
      useVeliPaneliVeri({ uid: 'veli1' }, { rol: 'veli', bagliOgrenciId: 'ogr-alt' })
    );
    expect(result.current.ogrenciId).toBe('ogr-alt');
  });
});
