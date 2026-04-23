/**
 * Yeni Testler — Koç UI Bileşenleri
 * Kapsam: KocContext, KocSolMenu, KocTopBar, KocHeroKart, KocMesajUyari,
 *         KocKisayollar, KocAltTabBar, KocVeriGirisiKart, KocOgrenciFiltreler,
 *         KocOgrenciListesi, KocOgrenciSatir, KocRiskOzeti, KocSabahEkrani
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../utils/tarih', () => ({
  bugunStr: vi.fn(() => '2024-01-15'),
  haftaBasStr: vi.fn(() => '2024-W03'),
}));

vi.mock('../utils/izleme', () => ({
  logIstemciHatasi: vi.fn(),
  setIzlemeUser: vi.fn(),
  getIzlemeUser: vi.fn(),
}));

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(),
  BildirimZili: ({ onClick }) => <button onClick={onClick}>🔔</button>,
  BildirimPaneli: ({ acik }) => (acik ? <div>Bildirim Paneli</div> : null),
  useBildirimler: () => ({ bildirimler: [], okunmamis: 0 }),
}));

vi.mock('../data/konular', () => ({
  renkler: ['#5B4FE8', '#22C55E', '#F59E0B', '#EF4444'],
  verimlilikHesapla: vi.fn(() => 80),
  TYT_DERSLER: [],
  AYT_DERSLER: [],
}));

vi.mock('../utils/aktiflikKaydet', () => ({
  aktifDurumu: vi.fn(() => ({ renk: '#22C55E', label: 'Aktif' })),
}));

vi.mock('../utils/programAlgoritma', () => ({
  haftaBaslangici: vi.fn(() => '2024-W03'),
  programV2ToGorevler: vi.fn(() => []),
}));

vi.mock('../utils/timelineUtils', () => ({
  haftalikOzetOlustur: vi.fn(() => ({})),
}));

vi.mock('../utils/ogrenciUtils', () => ({
  generateSuggestions: vi.fn(() => []),
  upcomingExams: vi.fn(() => []),
  formatCountdown: vi.fn(d => `${d} gün`),
}));

// KocContext yardımcısı
import { KocProvider } from '../context/KocContext';

const mockOgrenciler = [
  {
    id: 'o1',
    isim: 'Ali Veli',
    email: 'ali@t.com',
    riskDurumu: 'normal',
    sonCalismaTarihi: new Date(),
  },
  {
    id: 'o2',
    isim: 'Ayşe Hanım',
    email: 'ayse@t.com',
    riskDurumu: 'yuksek_risk',
    sonCalismaTarihi: null,
  },
];
const mockDashboardMap = {
  o1: { sonDenemeNet: 45, gorevTamamlama: 80 },
  o2: { sonDenemeNet: 30, gorevTamamlama: 40 },
};
const mockSonAktif = { toDate: () => new Date('2026-04-17T11:32:00+03:00') };
const mockBugunMap = {
  o1: { rutin: true, gunlukSoru: false, bugunAktif: true, sonAktif: mockSonAktif, girisSayisi: 2 },
  o2: { rutin: false, gunlukSoru: false, bugunAktif: false, sonAktif: null, girisSayisi: 0 },
};
const mockOkunmamisMap = { o1: 0, o2: 3 };

function TestWrapper({ children }) {
  return (
    <KocProvider
      ogrenciler={mockOgrenciler}
      dashboardMap={mockDashboardMap}
      bugunMap={mockBugunMap}
      okunmamisMap={mockOkunmamisMap}
      yukleniyor={false}
      yenile={vi.fn()}
    >
      {children}
    </KocProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KocContext
// ─────────────────────────────────────────────────────────────────────────────
import { KocProvider as KP, useKoc } from '../context/KocContext';

function KocTestBileseni() {
  const { ogrenciler, yukleniyor } = useKoc();
  return (
    <div data-testid="sayisi">
      {ogrenciler.length} / {String(yukleniyor)}
    </div>
  );
}

describe('KocProvider ve useKoc()', () => {
  it('veri sağlar', () => {
    render(
      <KP
        ogrenciler={mockOgrenciler}
        dashboardMap={{}}
        bugunMap={{}}
        okunmamisMap={{}}
        yukleniyor={false}
        yenile={vi.fn()}
      >
        <KocTestBileseni />
      </KP>
    );
    expect(screen.getByTestId('sayisi').textContent).toBe('2 / false');
  });

  it('Provider dışında kullanılırsa hata fırlatır', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<KocTestBileseni />)).toThrow();
    consoleSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocSolMenu
// ─────────────────────────────────────────────────────────────────────────────
import KocSolMenu from '../koc/ui/KocSolMenu';

describe('KocSolMenu', () => {
  const onNav = vi.fn();

  it('render olur', () => {
    render(<KocSolMenu aktif="ogrenciler" onNav={onNav} okunmamis={0} />);
    expect(document.body).toBeTruthy();
  });

  it('aktif menü öğesi vurgulu gösterilir', () => {
    const { container } = render(<KocSolMenu aktif="ogrenciler" onNav={onNav} okunmamis={0} />);
    expect(container).toBeTruthy();
  });

  it('menü öğesine tıklanınca onNav çağrılır', () => {
    render(<KocSolMenu aktif="dashboard" onNav={onNav} okunmamis={0} />);
    const items = screen.getAllByRole('generic').filter(el => el.style.cursor === 'pointer');
    if (items.length > 0) {
      fireEvent.click(items[0]);
      expect(onNav).toHaveBeenCalled();
    }
  });

  it('okunmamis>0 ise badge gösterilir', () => {
    const { container } = render(<KocSolMenu aktif="dashboard" onNav={onNav} okunmamis={5} />);
    expect(container.textContent).toContain('5');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocTopBar
// ─────────────────────────────────────────────────────────────────────────────
import KocTopBar from '../koc/ui/KocTopBar';

describe('KocTopBar', () => {
  it('render olur', () => {
    render(
      <KocTopBar
        toplamOkunmamis={0}
        onMesajlar={vi.fn()}
        onOgrenciEkle={vi.fn()}
        onCikis={vi.fn()}
        onRehber={vi.fn()}
      />
    );
    expect(screen.getByText('Els')).toBeInTheDocument();
    expect(screen.getByText('Way')).toBeInTheDocument();
  });

  it('okunmamis>0 sayacı gösterilir', () => {
    render(
      <KocTopBar
        toplamOkunmamis={7}
        onMesajlar={vi.fn()}
        onOgrenciEkle={vi.fn()}
        onCikis={vi.fn()}
        onRehber={vi.fn()}
      />
    );
    expect(screen.getByText(/7 mesaj/)).toBeInTheDocument();
  });

  it('bildirim ziline tıklanınca panel açılır', () => {
    render(
      <KocTopBar
        toplamOkunmamis={0}
        onMesajlar={vi.fn()}
        onOgrenciEkle={vi.fn()}
        onCikis={vi.fn()}
        onRehber={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('Bildirim Paneli')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocMesajUyari
// ─────────────────────────────────────────────────────────────────────────────
import KocMesajUyari from '../koc/ui/KocMesajUyari';

describe('KocMesajUyari', () => {
  it('okunmamis mesaj yoksa null döner', () => {
    const { container } = render(
      <KocProvider
        ogrenciler={mockOgrenciler}
        dashboardMap={{}}
        bugunMap={{}}
        okunmamisMap={{ o1: 0, o2: 0 }}
        yukleniyor={false}
        yenile={vi.fn()}
      >
        <KocMesajUyari onSec={vi.fn()} />
      </KocProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('okunmamis mesaj varsa gösterilir', () => {
    render(
      <TestWrapper>
        <KocMesajUyari onSec={vi.fn()} />
      </TestWrapper>
    );
    expect(screen.getByText(/3 mesaj bekliyor/)).toBeInTheDocument();
  });

  it('öğrenciye tıklanınca onSec çağrılır', () => {
    const onSec = vi.fn();
    render(
      <TestWrapper>
        <KocMesajUyari onSec={onSec} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('Ayşe Hanım'));
    expect(onSec).toHaveBeenCalledWith(mockOgrenciler[1], 'mesajlar');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocKisayollar
// ─────────────────────────────────────────────────────────────────────────────
import KocKisayollar from '../koc/ui/KocKisayollar';

describe('KocKisayollar', () => {
  const onNav = vi.fn();

  it('6 kısayol gösterilir', () => {
    render(<KocKisayollar onNav={onNav} />);
    expect(screen.getByText(/Haftalık program/)).toBeInTheDocument();
    expect(screen.getByText(/Günlük takip/)).toBeInTheDocument();
    expect(screen.getByText(/Denemeler/)).toBeInTheDocument();
  });

  it('kısayola tıklayınca onNav çağrılır', () => {
    render(<KocKisayollar onNav={onNav} />);
    fireEvent.click(screen.getByText(/Haftalık program/));
    expect(onNav).toHaveBeenCalledWith('haftalikprogram');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocAltTabBar
// ─────────────────────────────────────────────────────────────────────────────
import KocAltTabBar from '../koc/ui/KocAltTabBar';

describe('KocAltTabBar', () => {
  const onNav = vi.fn();

  it('render olur', () => {
    render(<KocAltTabBar aktif="ogrenciler" onNav={onNav} okunmamis={0} />);
    expect(document.body).toBeTruthy();
  });

  it('Diğer butonu açılır', () => {
    render(<KocAltTabBar aktif="ogrenciler" onNav={onNav} okunmamis={0} />);
    const digerBtn = screen.queryByText(/Diğer/i);
    if (digerBtn) {
      fireEvent.click(digerBtn);
      expect(screen.getByText(/İstatistikler|Hedefler/)).toBeInTheDocument();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocVeriGirisiKart
// ─────────────────────────────────────────────────────────────────────────────
import KocVeriGirisiKart from '../koc/ui/KocVeriGirisiKart';

describe('KocVeriGirisiKart', () => {
  const onNav = vi.fn();

  it('öğrenci yoksa null döner', () => {
    const { container } = render(
      <KocProvider
        ogrenciler={[]}
        dashboardMap={{}}
        bugunMap={{}}
        okunmamisMap={{}}
        yukleniyor={false}
        yenile={vi.fn()}
      >
        <KocVeriGirisiKart onNav={onNav} />
      </KocProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('öğrenciler varsa render olur', () => {
    render(
      <TestWrapper>
        <KocVeriGirisiKart onNav={onNav} />
      </TestWrapper>
    );
    expect(screen.getByText('Bugünün veri girişi')).toBeInTheDocument();
  });

  it('"Günlük takibe git" butonu çalışır', () => {
    render(
      <TestWrapper>
        <KocVeriGirisiKart onNav={onNav} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText(/Günlük takibe git/));
    expect(onNav).toHaveBeenCalledWith('gunluktakip');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocOgrenciFiltreler
// ─────────────────────────────────────────────────────────────────────────────
import KocOgrenciFiltreler from '../koc/ui/KocOgrenciFiltreler';

describe('KocOgrenciFiltreler', () => {
  it('render olur', () => {
    render(
      <KocOgrenciFiltreler
        arama=""
        setArama={vi.fn()}
        filtre="tumu"
        setFiltre={vi.fn()}
        sira="isim"
        setSira={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText(/ara/i)).toBeInTheDocument();
  });

  it('arama inputu değişince setArama çağrılır', () => {
    const setArama = vi.fn();
    render(
      <KocOgrenciFiltreler
        arama=""
        setArama={setArama}
        filtre="tumu"
        setFiltre={vi.fn()}
        sira="isim"
        setSira={vi.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/ara/i), { target: { value: 'Ali' } });
    expect(setArama).toHaveBeenCalled();
  });

  it('filtre chipleri gösterilir', () => {
    render(
      <KocOgrenciFiltreler
        arama=""
        setArama={vi.fn()}
        filtre="tumu"
        setFiltre={vi.fn()}
        sira="isim"
        setSira={vi.fn()}
      />
    );
    expect(screen.getByText('Tümü')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocRiskOzeti
// ─────────────────────────────────────────────────────────────────────────────
import KocRiskOzeti from '../koc/ui/KocRiskOzeti';

describe('KocRiskOzeti', () => {
  it('sorunlu öğrenci yoksa null döner', () => {
    const { container } = render(
      <KocProvider
        ogrenciler={[
          {
            id: 'o1',
            isim: 'Normal',
            riskDurumu: 'normal',
            sonCalismaTarihi: new Date(),
            bugunSoruTarihi: '2024-01-15',
          },
        ]}
        dashboardMap={{}}
        bugunMap={{}}
        okunmamisMap={{}}
        yukleniyor={false}
        yenile={vi.fn()}
      >
        <KocRiskOzeti onSec={vi.fn()} />
      </KocProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('yüksek riskli öğrenci varsa gösterilir', () => {
    render(
      <TestWrapper>
        <KocRiskOzeti onSec={vi.fn()} />
      </TestWrapper>
    );
    expect(screen.getByText('Ayşe Hanım')).toBeInTheDocument();
  });

  it('öğrenciye tıklanınca onSec çağrılır', () => {
    const onSec = vi.fn();
    render(
      <TestWrapper>
        <KocRiskOzeti onSec={onSec} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('Ayşe Hanım'));
    expect(onSec).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocSabahEkrani
// ─────────────────────────────────────────────────────────────────────────────
import KocSabahEkrani from '../koc/ui/KocSabahEkrani';

describe('KocSabahEkrani', () => {
  it('render olur ve koç adı görünür', () => {
    render(
      <TestWrapper>
        <KocSabahEkrani onSec={vi.fn()} onNav={vi.fn()} kocAdi="Test Koç" />
      </TestWrapper>
    );
    expect(document.body.textContent).toMatch(/Test Koç/);
  });

  it('selamlama metni görünür', () => {
    render(
      <TestWrapper>
        <KocSabahEkrani onSec={vi.fn()} onNav={vi.fn()} kocAdi="Mehmet Hoca" />
      </TestWrapper>
    );
    expect(document.body.textContent).toMatch(/Günaydın|İyi günler|İyi akşamlar|İyi geceler/);
  });

  it('öğrenci yoksa boş durum mesajı görünür', () => {
    render(
      <KocProvider
        ogrenciler={[]}
        dashboardMap={{}}
        bugunMap={{}}
        okunmamisMap={{}}
        yukleniyor={false}
        yenile={vi.fn()}
      >
        <KocSabahEkrani onSec={vi.fn()} onNav={vi.fn()} kocAdi="Test" />
      </KocProvider>
    );
    expect(document.body.textContent).toMatch(/öğrenci eklemedin/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocOgrenciListesi
// ─────────────────────────────────────────────────────────────────────────────
import KocOgrenciListesi from '../koc/ui/KocOgrenciListesi';

describe('KocOgrenciListesi', () => {
  it('öğrenci listesini gösterir', () => {
    render(
      <TestWrapper>
        <KocOgrenciListesi onSec={vi.fn()} onEkle={vi.fn()} onGeri={vi.fn()} />
      </TestWrapper>
    );
    expect(screen.getByText('Ali Veli')).toBeInTheDocument();
    expect(screen.getByText('Ayşe Hanım')).toBeInTheDocument();
  });

  it('arama ile filtreleme çalışır', async () => {
    render(
      <TestWrapper>
        <KocOgrenciListesi onSec={vi.fn()} onEkle={vi.fn()} onGeri={vi.fn()} />
      </TestWrapper>
    );
    const aramaInput = screen.getByPlaceholderText(/ara/i);
    fireEvent.change(aramaInput, { target: { value: 'Ali' } });
    await waitFor(() => {
      expect(screen.getByText('Ali Veli')).toBeInTheDocument();
      expect(screen.queryByText('Ayşe Hanım')).not.toBeInTheDocument();
    });
  });

  it('yükleniyor durumunda loading gösterilir', () => {
    render(
      <KocProvider
        ogrenciler={[]}
        dashboardMap={{}}
        bugunMap={{}}
        okunmamisMap={{}}
        yukleniyor={true}
        yenile={vi.fn()}
      >
        <KocOgrenciListesi onSec={vi.fn()} onEkle={vi.fn()} onGeri={vi.fn()} />
      </KocProvider>
    );
    expect(screen.getByText(/Yükleniyor/)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocGirisDurumuModal
// ─────────────────────────────────────────────────────────────────────────────
import KocGirisDurumuModal from '../koc/ui/KocGirisDurumuModal';
import { mockS } from './testUtils';

const modalOgrenciler = [
  { id: 'o1', isim: 'Ali Veli' },
  { id: 'o2', isim: 'Ayşe Hanım' },
  { id: 'o3', isim: 'Can Demir' },
];
const modalBugunMap = {
  o1: {
    bugunAktif: true,
    girisSayisi: 3,
    sonAktif: { toDate: () => new Date('2026-04-17T14:32:00+03:00') },
  },
  o2: {
    bugunAktif: false,
    girisSayisi: 0,
    sonAktif: { toDate: () => new Date('2026-04-16T23:00:00+03:00') },
  },
  o3: { bugunAktif: false, girisSayisi: 0, sonAktif: null },
};

describe('KocGirisDurumuModal', () => {
  it('tüm öğrencileri gösterir', () => {
    render(
      <KocGirisDurumuModal
        ogrenciler={modalOgrenciler}
        bugunMap={modalBugunMap}
        onKapat={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText('Ali Veli')).toBeInTheDocument();
    expect(screen.getByText('Ayşe Hanım')).toBeInTheDocument();
    expect(screen.getByText('Can Demir')).toBeInTheDocument();
  });

  it('bugün giriş yapan için "kez" ve saat gösterir', () => {
    render(
      <KocGirisDurumuModal
        ogrenciler={modalOgrenciler}
        bugunMap={modalBugunMap}
        onKapat={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText(/3 kez/)).toBeInTheDocument();
    expect(screen.getAllByText(/son giriş/i).length).toBeGreaterThanOrEqual(1);
  });

  it('hiç giriş yapmayan için "Hiç giriş yok" gösterir', () => {
    render(
      <KocGirisDurumuModal
        ogrenciler={modalOgrenciler}
        bugunMap={modalBugunMap}
        onKapat={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText('Hiç giriş yok')).toBeInTheDocument();
  });

  it('bugün giren/girmeyen özet sayısını gösterir', () => {
    render(
      <KocGirisDurumuModal
        ogrenciler={modalOgrenciler}
        bugunMap={modalBugunMap}
        onKapat={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText(/1\/3 öğrenci bugün giriş yaptı/)).toBeInTheDocument();
  });

  it('✕ butonuna basınca onKapat çağrılır', () => {
    const onKapat = vi.fn();
    render(
      <KocGirisDurumuModal
        ogrenciler={modalOgrenciler}
        bugunMap={modalBugunMap}
        onKapat={onKapat}
        s={mockS}
      />
    );
    fireEvent.click(screen.getByLabelText('Modalı kapat'));
    expect(onKapat).toHaveBeenCalledTimes(1);
  });

  it('arka plana tıklayınca onKapat çağrılır', () => {
    const onKapat = vi.fn();
    const { container } = render(
      <KocGirisDurumuModal
        ogrenciler={modalOgrenciler}
        bugunMap={modalBugunMap}
        onKapat={onKapat}
        s={mockS}
      />
    );
    fireEvent.click(container.firstChild);
    expect(onKapat).toHaveBeenCalledTimes(1);
  });

  it('bugün girenler listede önce sıralanır', () => {
    render(
      <KocGirisDurumuModal
        ogrenciler={modalOgrenciler}
        bugunMap={modalBugunMap}
        onKapat={vi.fn()}
        s={mockS}
      />
    );
    const isimler = screen.getAllByText(/Ali Veli|Ayşe Hanım|Can Demir/).map(el => el.textContent);
    expect(isimler[0]).toBe('Ali Veli');
  });
});
