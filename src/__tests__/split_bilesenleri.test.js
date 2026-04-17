import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// ─── Ortak mock s objesi ───────────────────────────────────────────────────────
const s = {
  text: '#000',
  text2: '#333',
  text3: '#666',
  bg: '#fff',
  surface: '#f5f5f5',
  surface2: '#eee',
  surface3: '#ddd',
  border: '#ccc',
  accent: '#007bff',
  accentSoft: '#e6f0ff',
  accentGrad: '#007bff',
  danger: '#dc3545',
  tehlika: '#dc3545',
  tehlikaSoft: '#ffe6e6',
  uyari: '#ffc107',
  shadow: '0 2px 8px rgba(0,0,0,0.1)',
  shadowCard: '0 1px 4px rgba(0,0,0,0.08)',
  topBarBg: '#1a1a2e',
  topBarBorder: '#16213e',
  topBarMuted: '#ccc',
  buttonText: '#fff',
};

// ─── PlaylistDetayBilesenleri ──────────────────────────────────────────────────
vi.mock('../hooks/usePlaylist', () => ({
  usePlaylistVideolar: () => ({ videolar: [], yukleniyor: false, daha: false, dahaYukle: vi.fn() }),
  useIzlemeDurumu: () => ({ izlenenler: {}, izlendi: vi.fn() }),
}));

describe('VideoSatiri', () => {
  it('video başlığını render eder', async () => {
    const { VideoSatiri } = await import('../components/PlaylistDetayBilesenleri');
    const video = { videoId: 'abc', title: 'Test Videosu', thumbnail: null };
    render(<VideoSatiri video={video} izlendi={false} pozisyon={0} onClick={vi.fn()} s={s} />);
    expect(screen.getByText('Test Videosu')).toBeTruthy();
  });

  it('izlendi işareti gösterir', async () => {
    const { VideoSatiri } = await import('../components/PlaylistDetayBilesenleri');
    const video = { videoId: 'abc', title: 'Test' };
    const { container } = render(
      <VideoSatiri video={video} izlendi={true} pozisyon={0} onClick={vi.fn()} s={s} />
    );
    expect(container.textContent).toContain('✓');
  });
});

describe('VideoPlayer', () => {
  it('video null ise render etmez', async () => {
    const { VideoPlayer } = await import('../components/PlaylistDetayBilesenleri');
    const { container } = render(
      <VideoPlayer
        video={null}
        izlendi={false}
        onIzlendi={vi.fn()}
        onKapat={vi.fn()}
        s={s}
        mobil={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});

// ─── BransBolumTablo ───────────────────────────────────────────────────────────
vi.mock('recharts', () => ({
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));
vi.mock('../ogrenci/deneme/constants', () => ({
  RENK: { genel: '#007bff', brans: '#ff6b6b', bg: { genel: '#e6f0ff', brans: '#ffe6e6' } },
  yorumUret: () => null,
}));

describe('BransBolumTablo', () => {
  it('tablo başlığı render eder', async () => {
    const BransBolumTablo = (await import('../ogrenci/deneme/BransBolumTablo')).default;
    render(
      <BransBolumTablo
        bransDenemeler={[]}
        bransNoktalar={[]}
        genelNoktalar={[
          { net: 10, tarih: '2025-01-01', sinav: 'TYT', tur: 'genel', etiket: 'TYT 01-01' },
        ]}
        denemeler={[
          {
            denemeTuru: 'genel',
            tarih: '2025-01-01',
            sinav: 'TYT',
            netler: { mat: { net: 10, d: 10, y: 0, b: 0 } },
          },
        ]}
        dersRenk="#007bff"
        dersId="mat"
        s={s}
      />
    );
    expect(screen.getByText('Net')).toBeTruthy();
  });
});

// ─── ProgramaEkleModal ─────────────────────────────────────────────────────────
vi.mock('../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(() => Promise.resolve()),
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'test' })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => 'ts'),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
}));
vi.mock('../components/Toast', () => ({ useToast: () => vi.fn() }));
vi.mock('../utils/programAlgoritma', () => ({
  GUNLER: ['pazartesi', 'sali'],
  GUN_ETIKET: { pazartesi: 'Pzt', sali: 'Sal' },
  haftaBaslangici: () => '2025-01-06',
}));
vi.mock('../utils/tarih', () => ({
  haftaBasStr: () => '2025-01-06',
  bugunStr: () => '2025-01-10',
}));

describe('ProgramaEkleModal', () => {
  it('modal başlığını render eder', async () => {
    const ProgramaEkleModal = (await import('../koc/ProgramaEkleModal')).default;
    const sablon = { title: 'Test Şablonu', tasks: ['Görev 1', 'Görev 2'] };
    render(<ProgramaEkleModal sablon={sablon} ogrenci={{ id: 'o1' }} onKapat={vi.fn()} s={s} />);
    expect(screen.getAllByText('Programa Ekle').length).toBeGreaterThan(0);
    expect(screen.getByText('Test Şablonu')).toBeTruthy();
  });
});

// ─── OgrenciSecimListesi ───────────────────────────────────────────────────────
vi.mock('../data/konular', () => ({
  renkler: ['#ff0000', '#00ff00'],
  TYT_DERSLER: [],
  AYT_SAY: [],
}));
vi.mock('../components/Shared', () => ({
  Card: ({ children, style }) => <div style={style}>{children}</div>,
  Btn: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Avatar: ({ isim }) => <div data-testid="avatar">{isim?.[0]}</div>,
  EmptyState: ({ mesaj }) => <div>{mesaj}</div>,
  LoadingState: () => <div>Yükleniyor...</div>,
  ConfirmDialog: ({ baslik, onEvet, onHayir }) => (
    <div>
      <button onClick={onEvet}>{baslik}</button>
      <button onClick={onHayir}>Hayır</button>
    </div>
  ),
  ElsWayLogo: () => <div>Logo</div>,
}));

describe('OgrenciSecimListesi', () => {
  it('öğrenci isimlerini listeler', async () => {
    const OgrenciSecimListesi = (await import('../koc/OgrenciSecimListesi')).default;
    const ogrenciler = [
      { id: 'o1', isim: 'Ali Yılmaz', tur: 'tyt' },
      { id: 'o2', isim: 'Ayşe Kaya', tur: 'lgs' },
    ];
    render(
      <OgrenciSecimListesi
        ogrenciler={ogrenciler}
        seciliIdler={new Set()}
        onToggle={vi.fn()}
        onTumunuSec={vi.fn()}
        s={s}
      />
    );
    expect(screen.getByText('Ali Yılmaz')).toBeTruthy();
    expect(screen.getByText('Ayşe Kaya')).toBeTruthy();
  });

  it('tümünü seç düğmesi öğrenci sayısını gösterir', async () => {
    const OgrenciSecimListesi = (await import('../koc/OgrenciSecimListesi')).default;
    const ogrenciler = [{ id: 'o1', isim: 'Ali', tur: 'tyt' }];
    render(
      <OgrenciSecimListesi
        ogrenciler={ogrenciler}
        seciliIdler={new Set()}
        onToggle={vi.fn()}
        onTumunuSec={vi.fn()}
        s={s}
      />
    );
    expect(screen.getByText('Tümünü seç (1)')).toBeTruthy();
  });
});

// ─── VideoGorusmeKontroller ────────────────────────────────────────────────────
describe('VideoGorusmeKontroller', () => {
  it('kontrol butonlarını render eder', async () => {
    const VideoGorusmeKontroller = (await import('../components/VideoGorusmeKontroller')).default;
    render(
      <VideoGorusmeKontroller
        mikrofon={true}
        kamera={true}
        mikToggle={vi.fn()}
        kamToggle={vi.fn()}
        kapat={vi.fn()}
      />
    );
    expect(screen.getByTitle('Mikrofonu kapat')).toBeTruthy();
    expect(screen.getByTitle('Görüşmeyi bitir')).toBeTruthy();
    expect(screen.getByTitle('Kamerayı kapat')).toBeTruthy();
  });

  it('mikrofon kapalıyken farklı title gösterir', async () => {
    const VideoGorusmeKontroller = (await import('../components/VideoGorusmeKontroller')).default;
    render(
      <VideoGorusmeKontroller
        mikrofon={false}
        kamera={true}
        mikToggle={vi.fn()}
        kamToggle={vi.fn()}
        kapat={vi.fn()}
      />
    );
    expect(screen.getByTitle('Mikrofonu aç')).toBeTruthy();
  });
});

// ─── OgrenciDigerSheet ─────────────────────────────────────────────────────────
describe('OgrenciDigerSheet', () => {
  it('kapalıyken render etmez', async () => {
    const OgrenciDigerSheet = (await import('../ogrenci/OgrenciDigerSheet')).default;
    const { container } = render(
      <OgrenciDigerSheet digerAcik={false} aktif="ana" onKapat={vi.fn()} onNav={vi.fn()} s={s} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('açıkken sayfa öğelerini gösterir', async () => {
    const OgrenciDigerSheet = (await import('../ogrenci/OgrenciDigerSheet')).default;
    render(
      <OgrenciDigerSheet
        digerAcik={true}
        aktif="mufredat"
        onKapat={vi.fn()}
        onNav={vi.fn()}
        s={s}
      />
    );
    expect(screen.getByText('İlerleyişim')).toBeTruthy();
    expect(screen.getByText('Duyurular')).toBeTruthy();
  });
});

// ─── DenemeFormSecim ───────────────────────────────────────────────────────────
describe('DenemeFormSecim', () => {
  it('deneme türü tablarını render eder', async () => {
    const DenemeFormSecim = (await import('../ogrenci/deneme/DenemeFormSecim')).default;
    render(
      <DenemeFormSecim
        denemeTuru="genel"
        onTurDegis={vi.fn()}
        secenekler={['TYT', 'AYT']}
        sinav="TYT"
        onSinavDegis={vi.fn()}
        tarih="2025-01-10"
        onTarihDegis={vi.fn()}
        yayinevi=""
        onYayineviDegis={vi.fn()}
        s={s}
      />
    );
    expect(screen.getByText('Genel Deneme')).toBeTruthy();
    expect(screen.getByText('Branş Denemesi')).toBeTruthy();
    expect(screen.getByText('TYT')).toBeTruthy();
  });
});

// ─── DenemeSilOnayModal ────────────────────────────────────────────────────────
describe('DenemeSilOnayModal', () => {
  it('deneme bilgilerini gösterir', async () => {
    const DenemeSilOnayModal = (await import('../ogrenci/deneme/DenemeSilOnayModal')).default;
    const deneme = { id: 'd1', sinav: 'TYT', tarih: '2025-01-10' };
    render(<DenemeSilOnayModal deneme={deneme} onIptal={vi.fn()} onSil={vi.fn()} s={s} />);
    expect(screen.getByText('Denemeyi sil')).toBeTruthy();
    expect(screen.getByText(/TYT/)).toBeTruthy();
  });
});

// ─── DenemeTabBar ──────────────────────────────────────────────────────────────
describe('DenemeTabBar', () => {
  it('sekmeleri render eder', async () => {
    const DenemeTabBar = (await import('../ogrenci/deneme/DenemeTabBar')).default;
    render(
      <DenemeTabBar
        bolum="genel"
        onBolum={vi.fn()}
        genelSayisi={5}
        bransSayisi={2}
        bransVeriDersSayisi={3}
        ogrenciTur="tyt"
        konuAnalizGoster={false}
        s={s}
      />
    );
    expect(screen.getByText(/Genel Denemeler/)).toBeTruthy();
    expect(screen.getByText(/Branş/)).toBeTruthy();
  });
});

// ─── BransKonuAnalizi ──────────────────────────────────────────────────────────
vi.mock('../utils/sinavUtils', () => ({
  turdenBransDersler: () => [{ id: 'mat', label: 'Matematik', renk: '#007bff', toplam: 40 }],
  turBelirle: () => 'yks',
}));

describe('BransKonuAnalizi', () => {
  it('veri yoksa empty state gösterir', async () => {
    const BransKonuAnalizi = (await import('../ogrenci/deneme/BransKonuAnalizi')).default;
    render(<BransKonuAnalizi denemeler={[]} ogrenciTur="tyt" s={s} />);
    expect(screen.getByText(/Konu analizi için henüz veri yok/)).toBeTruthy();
  });
});

// ─── AdminTopBar ───────────────────────────────────────────────────────────────
vi.mock('../components/TemaSecici', () => ({ default: () => <div>Tema</div> }));
vi.mock('../components/BildirimSistemi', () => ({
  BildirimZili: ({ onClick }) => <button onClick={onClick}>Bildirim</button>,
  BildirimPaneli: () => null,
}));

describe('AdminTopBar', () => {
  it('çıkış butonu render eder', async () => {
    const AdminTopBar = (await import('../pages/AdminTopBar')).default;
    render(
      <AdminTopBar
        kullanici={{ email: 'admin@test.com' }}
        mobil={false}
        s={s}
        onBildirimToggle={vi.fn()}
        onCikis={vi.fn()}
      />
    );
    expect(screen.getByText('Çıkış')).toBeTruthy();
    expect(screen.getByText('Yönetici')).toBeTruthy();
  });
});
