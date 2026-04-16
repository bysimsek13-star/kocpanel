/**
 * ElsWay — Koç Ağır Bileşen Testleri
 *
 * Kapsam (12 koc/ kök dosyası):
 *   DenemeYonetimi, GorevKutuphane, GorusmeTimeline, GunlukTakip,
 *   GununSozu, HaftalikVerimlilik, HedefTakibi, Istatistikler,
 *   KitapVideoKutuphane, MesajlarSayfasi, OgrenciDetay, OgrenciEkleModal
 *
 * HaftalikProgram ve OnboardingSihirbazi vi.mock ile çağrılır — render edilmez.
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor, cleanup, fireEvent, render, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { renderWithProviders, mockS } from './testUtils';
import { makeKoc } from './factories';

afterEach(() => cleanup());

// ─── Ağır/dış bileşen mock'ları ──────────────────────────────────────────────
vi.mock('../koc/HaftalikProgram', () => ({
  default: () => <div data-testid="haftalik-program">HaftalikProgram</div>,
}));

vi.mock('../koc/OnboardingSihirbazi', () => ({
  default: ({ onTamamla }) => (
    <div data-testid="onboarding">
      <button onClick={onTamamla}>Tamamla</button>
    </div>
  ),
}));

vi.mock('../koc/PlaylistYonetimi', () => ({
  default: () => <div data-testid="playlist-yonetimi">PlaylistYonetimi</div>,
}));

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(() => Promise.resolve()),
  BildirimZili: () => <button>Bildirim</button>,
  BildirimPaneli: () => <div>Panel</div>,
}));

vi.mock('../components/VideoGorusme', () => ({
  default: () => <div data-testid="video-gorusme">VideoGorusme</div>,
}));

vi.mock('../utils/aktiflikKaydet', () => ({
  aktifDurumu: vi.fn(() => ({ label: 'Aktif', renk: '#22c55e' })),
  aktiflikKaydet: vi.fn(),
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

vi.mock('../utils/timelineUtils', () => ({
  gorusmeTimelineOlustur: vi.fn(() => []),
  formatDateShort: vi.fn(() => '12.04'),
}));

vi.mock('../utils/auditLog', () => ({
  auditLog: vi.fn(() => Promise.resolve()),
  AuditTip: { GORUSME_NOT: 'gorusme_not' },
}));

vi.mock('../utils/ogrenciUtils', () => ({
  buildTaskTemplates: vi.fn(() => []),
  generateSuggestions: vi.fn(() => []),
}));

vi.mock('../utils/sinavUtils', () => ({
  turdenBransDersler: vi.fn(() => []),
}));

vi.mock('../components/koc/KocPanelUi', () => ({
  KocHeroBand: ({ children }) => <div>{children}</div>,
  KocKpiStrip: ({ children }) => <div>{children}</div>,
  KocChartCard: ({ children }) => <div>{children}</div>,
  KocTableShell: ({ children }) => <div>{children}</div>,
  KocToolbar: ({ children }) => <div>{children}</div>,
  KocChipGroup: () => <div />,
  KocSortRow: () => <div />,
  KocSayfaBaslik: ({ baslik }) => <h2>{baslik}</h2>,
  KocOzetKutulari: () => <div />,
}));

vi.mock('../hooks/usePlaylist', () => ({
  usePlaylistler: vi.fn(() => ({ playlistler: [], yukleniyor: false, yenile: vi.fn() })),
}));

vi.mock('../ogrenci/Mesajlar', () => ({
  default: () => <div data-testid="mesajlar">Mesajlar</div>,
}));

vi.mock('../koc/VeliMesajlariPaneli', () => ({
  default: () => <div data-testid="veli-mesajlari-paneli">VeliMesajlariPaneli</div>,
}));

vi.mock('../koc/gunluk/GunlukIlerlemePano', () => ({
  default: () => <div data-testid="gunluk-ilerleme-pano">GunlukIlerlemePano</div>,
}));

vi.mock('../koc/gunluk/OgrenciRutinKarti', () => ({
  default: ({ ogrenci }) => <div data-testid="ogrenci-rutin-karti">{ogrenci?.isim}</div>,
}));

vi.mock('../koc/hedef/HedefEkleModal', () => ({
  default: ({ onKapat }) => (
    <div data-testid="hedef-ekle-modal">
      <button onClick={onKapat}>Kapat</button>
    </div>
  ),
}));

vi.mock('../koc/hedef/OgrenciHedefKarti', () => ({
  default: ({ ogrenci }) => <div data-testid="ogrenci-hedef-karti">{ogrenci?.isim}</div>,
}));

// ─── Import'lar ───────────────────────────────────────────────────────────────
import DenemeYonetimi from '../koc/DenemeYonetimi';
import GorevKutuphane from '../koc/GorevKutuphane';
import GorusmeTimeline from '../koc/GorusmeTimeline';
import GunlukTakip from '../koc/GunlukTakip';
import GununSozu from '../koc/GununSozu';
import HaftalikVerimlilik from '../koc/HaftalikVerimlilik';
import HedefTakibi from '../koc/HedefTakibi';
import Istatistikler from '../koc/Istatistikler';
import KitapVideoKutuphane from '../koc/KitapVideoKutuphane';
import MesajlarSayfasi from '../koc/MesajlarSayfasi';
import OgrenciDetay from '../koc/OgrenciDetay';
import OgrenciEkleModal from '../koc/OgrenciEkleModal';
import { OgrenciEkleForm } from '../koc/OgrenciEkleForm';
import { useHaftalikProgram } from '../koc/useHaftalikProgram';
import TopluIslemlerSayfasi from '../koc/TopluIslemler';

// AuthContext'e canEdit ekliyoruz — OgrenciDetay bunu kullanıyor
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    kullanici: makeKoc({ uid: 'test-uid', email: 'test@test.com' }),
    rol: 'koc',
    userData: makeKoc({ uid: 'test-uid', isim: 'Test Kullanıcı' }),
    yukleniyor: false,
    cikisYap: vi.fn(),
    canEdit: vi.fn(() => true),
    isAdmin: false,
  }),
  AuthProvider: ({ children }) => children,
}));

const mockKullanici = makeKoc({ uid: 'test-uid', email: 'test@test.com' });
const ogrenciler = [
  { id: 'o1', isim: 'Ali Yılmaz', tur: 'tyt_12' },
  { id: 'o2', isim: 'Zeynep Kaya', tur: 'lgs' },
];
const mockOgrenci = { id: 'o1', isim: 'Ali Yılmaz', tur: 'tyt_12', kocId: 'k1' };

// ─── DenemeYonetimi ───────────────────────────────────────────────────────────
describe('DenemeYonetimi', () => {
  it('boş listeyle render olur', () => {
    expect(() =>
      renderWithProviders(<DenemeYonetimi ogrenciler={[]} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() =>
      renderWithProviders(<DenemeYonetimi ogrenciler={ogrenciler} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<DenemeYonetimi ogrenciler={ogrenciler} onGeri={vi.fn()} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── GorevKutuphane ───────────────────────────────────────────────────────────
describe('GorevKutuphane', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<GorevKutuphane ogrenci={mockOgrenci} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<GorevKutuphane ogrenci={mockOgrenci} onGeri={vi.fn()} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── GorusmeTimeline ──────────────────────────────────────────────────────────
describe('GorusmeTimeline', () => {
  it('render olur', () => {
    expect(() => renderWithProviders(<GorusmeTimeline ogrenciId="o1" />)).not.toThrow();
  });

  it('boş timeline gösterir (mock getDocs → [])', async () => {
    renderWithProviders(<GorusmeTimeline ogrenciId="o1" />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── GunlukTakip ─────────────────────────────────────────────────────────────
describe('GunlukTakip', () => {
  it('boş listeyle render olur', () => {
    expect(() =>
      renderWithProviders(<GunlukTakip ogrenciler={[]} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() =>
      renderWithProviders(<GunlukTakip ogrenciler={ogrenciler} onGeri={vi.fn()} />)
    ).not.toThrow();
  });
});

// ─── GununSozu ────────────────────────────────────────────────────────────────
describe('GununSozu', () => {
  it('boş listeyle render olur', () => {
    expect(() => renderWithProviders(<GununSozu ogrenciler={[]} />)).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() => renderWithProviders(<GununSozu ogrenciler={ogrenciler} />)).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<GununSozu ogrenciler={ogrenciler} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── HaftalikVerimlilik ───────────────────────────────────────────────────────
describe('HaftalikVerimlilik', () => {
  it('render olur', () => {
    expect(() => renderWithProviders(<HaftalikVerimlilik ogrenciId="o1" />)).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<HaftalikVerimlilik ogrenciId="o1" />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── HedefTakibi ─────────────────────────────────────────────────────────────
describe('HedefTakibi', () => {
  it('boş listeyle render olur', () => {
    expect(() =>
      renderWithProviders(<HedefTakibi ogrenciler={[]} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() =>
      renderWithProviders(<HedefTakibi ogrenciler={ogrenciler} onGeri={vi.fn()} />)
    ).not.toThrow();
  });
});

// ─── Istatistikler ────────────────────────────────────────────────────────────
describe('Istatistikler', () => {
  it('boş listeyle render olur', () => {
    expect(() =>
      renderWithProviders(<Istatistikler ogrenciler={[]} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() =>
      renderWithProviders(<Istatistikler ogrenciler={ogrenciler} onGeri={vi.fn()} />)
    ).not.toThrow();
  });
});

// ─── KitapVideoKutuphane ──────────────────────────────────────────────────────
// kullanici prop zorunlu — mockKullanici geçmek gerekiyor
describe('KitapVideoKutuphane', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(
        <KitapVideoKutuphane kullanici={mockKullanici} ogrenciler={[]} onGeri={vi.fn()} />
      )
    ).not.toThrow();
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(
      <KitapVideoKutuphane kullanici={mockKullanici} ogrenciler={[]} onGeri={vi.fn()} />
    );
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── MesajlarSayfasi ──────────────────────────────────────────────────────────
describe('MesajlarSayfasi', () => {
  it('boş listeyle render olur', () => {
    expect(() =>
      renderWithProviders(<MesajlarSayfasi ogrenciler={[]} okunmamisMap={{}} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci listesiyle render olur', () => {
    expect(() =>
      renderWithProviders(
        <MesajlarSayfasi ogrenciler={ogrenciler} okunmamisMap={{}} onGeri={vi.fn()} />
      )
    ).not.toThrow();
  });

  it('öğrenci adları görünür', async () => {
    renderWithProviders(
      <MesajlarSayfasi ogrenciler={ogrenciler} okunmamisMap={{}} onGeri={vi.fn()} />
    );
    await waitFor(() => expect(document.body.textContent).toContain('Ali Yılmaz'));
  });

  it('okunmamis badge görünür', async () => {
    renderWithProviders(
      <MesajlarSayfasi ogrenciler={ogrenciler} okunmamisMap={{ o1: 3 }} onGeri={vi.fn()} />
    );
    await waitFor(() => expect(document.body.textContent).toContain('3'));
  });
});

// ─── OgrenciDetay ─────────────────────────────────────────────────────────────
describe('OgrenciDetay', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<OgrenciDetay ogrenci={mockOgrenci} onGeri={vi.fn()} />)
    ).not.toThrow();
  });

  it('öğrenci adı görünür', async () => {
    renderWithProviders(<OgrenciDetay ogrenci={mockOgrenci} onGeri={vi.fn()} />);
    await waitFor(() => expect(document.body.textContent).toContain('Ali Yılmaz'), {
      timeout: 3000,
    });
  });
});

// ─── OgrenciEkleModal ─────────────────────────────────────────────────────────
describe('OgrenciEkleModal', () => {
  it('render olur', () => {
    expect(() =>
      renderWithProviders(<OgrenciEkleModal onKapat={vi.fn()} onEkle={vi.fn()} />)
    ).not.toThrow();
  });

  it('form input alanları var', () => {
    renderWithProviders(<OgrenciEkleModal onKapat={vi.fn()} onEkle={vi.fn()} />);
    expect(document.querySelectorAll('input').length).toBeGreaterThan(0);
  });
});

// ─── OgrenciEkleForm ──────────────────────────────────────────────────────────
describe('OgrenciEkleForm', () => {
  const noopS = new Proxy({}, { get: () => '#cccccc' });
  const baseProps = {
    isim: '',
    setIsim: vi.fn(),
    email: '',
    setEmail: vi.fn(),
    sifre: '',
    setSifre: vi.fn(),
    veliEmail: '',
    setVeliEmail: vi.fn(),
    veliSifre: '',
    setVeliSifre: vi.fn(),
    veliTelefon: '',
    setVeliTelefon: vi.fn(),
    tur: 'tyt_12',
    setTur: vi.fn(),
    dogumTarihi: '',
    setDogumTarihi: vi.fn(),
    hata: '',
    yukleniyor: false,
    onKapat: vi.fn(),
    onEkle: vi.fn(),
    s: noopS,
  };

  it('render olur', () => {
    expect(() => render(<OgrenciEkleForm {...baseProps} />)).not.toThrow();
  });

  it('öğrenci alanları görünür', () => {
    render(<OgrenciEkleForm {...baseProps} />);
    expect(screen.getByLabelText('Ad Soyad')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('hata mesajı gösterilir', () => {
    render(<OgrenciEkleForm {...baseProps} hata="Şifre hatalı" />);
    expect(screen.getByText('Şifre hatalı')).toBeInTheDocument();
  });

  it('İptal butonuna tıklanınca onKapat çağrılır', async () => {
    const onKapat = vi.fn();
    render(<OgrenciEkleForm {...baseProps} onKapat={onKapat} />);
    fireEvent.click(screen.getByText('İptal'));
    expect(onKapat).toHaveBeenCalled();
  });
});

// ─── useHaftalikProgram — regresyon: merge:true ────────────────────────────────
describe('useHaftalikProgram — setDoc merge davranışı', () => {
  const ogrenci = { id: 'ogr1', isim: 'Test', tur: 'tyt_12' };

  it("kaydet() setDoc'u merge:true ile çağırır ve tamamlandi içermez", async () => {
    const { setDoc } = await import('firebase/firestore');
    setDoc.mockClear();

    const { result } = renderHook(() =>
      useHaftalikProgram({
        ogrenciler: [ogrenci],
        ogrenciProp: ogrenci,
        readOnly: false,
        initialOffset: 0,
      })
    );

    await act(async () => {
      await result.current.slotGuncelle('pzt', 0, { tip: 'ders', icerik: 'Mat' });
    });

    const [, , options] = setDoc.mock.calls[setDoc.mock.calls.length - 1];
    expect(options).toEqual({ merge: true });

    const [, data] = setDoc.mock.calls[setDoc.mock.calls.length - 1];
    expect(data).not.toHaveProperty('tamamlandi');
    expect(data).toHaveProperty('hafta');
  });

  it("togglTamamla() setDoc'u sadece tamamlandi ile ve merge:true ile çağırır", async () => {
    const { setDoc } = await import('firebase/firestore');
    setDoc.mockClear();

    const { result } = renderHook(() =>
      useHaftalikProgram({
        ogrenciler: [ogrenci],
        ogrenciProp: ogrenci,
        readOnly: false,
        initialOffset: 0,
      })
    );

    await act(async () => {
      await result.current.togglTamamla('pzt', 0);
    });

    const lastCall = setDoc.mock.calls[setDoc.mock.calls.length - 1];
    expect(lastCall[2]).toEqual({ merge: true });
    expect(lastCall[1]).toHaveProperty('tamamlandi');
    expect(lastCall[1]).not.toHaveProperty('hafta');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TopluIslemlerSayfasi — Faz 2.3
// ─────────────────────────────────────────────────────────────────────────────
const topluOgrenciler = [
  { id: 'o1', isim: 'Ali Yılmaz', tur: 'tyt_12', aktif: true },
  { id: 'o2', isim: 'Zeynep Kaya', tur: 'lgs_8', aktif: true },
  { id: 'o3', isim: 'Pasif Öğrenci', tur: 'tyt_12', aktif: false },
];

describe('TopluIslemlerSayfasi', () => {
  it('render olur — başlık görünür', () => {
    renderWithProviders(<TopluIslemlerSayfasi ogrenciler={topluOgrenciler} onGeri={vi.fn()} />);
    expect(screen.getByText('Toplu mesaj gönder')).toBeInTheDocument();
  });

  it('pasif öğrenciler listeye dahil edilmez', () => {
    renderWithProviders(<TopluIslemlerSayfasi ogrenciler={topluOgrenciler} onGeri={vi.fn()} />);
    expect(screen.getAllByText(/Ali Yılmaz|Zeynep Kaya/).length).toBeGreaterThan(0);
    expect(screen.queryByText('Pasif Öğrenci')).not.toBeInTheDocument();
  });

  it('boş öğrenci listesinde "Henüz öğrenci yok" görünür', () => {
    renderWithProviders(<TopluIslemlerSayfasi ogrenciler={[]} onGeri={vi.fn()} />);
    expect(screen.getByText(/Henüz öğrenci yok/i)).toBeInTheDocument();
  });

  it('öğrenci tıklanınca seçim sayacı güncellenir', () => {
    renderWithProviders(<TopluIslemlerSayfasi ogrenciler={topluOgrenciler} onGeri={vi.fn()} />);
    // getAllByText — isim hem listede (div) hem select'te (option) görünür, ilki div
    fireEvent.click(screen.getAllByText('Ali Yılmaz')[0]);
    expect(screen.getByText(/1 seçili/i)).toBeInTheDocument();
  });

  it('"Tümünü seç" aktif öğrencilerin hepsini seçer', () => {
    renderWithProviders(<TopluIslemlerSayfasi ogrenciler={topluOgrenciler} onGeri={vi.fn()} />);
    // "Tümünü seç (2)" — aktif öğrenci sayısı 2
    fireEvent.click(screen.getByText(/Tümünü seç \(2\)/i));
    expect(screen.getByText(/2 seçili/i)).toBeInTheDocument();
  });

  it('Gönder butonu seçim yokken disabled', () => {
    renderWithProviders(<TopluIslemlerSayfasi ogrenciler={topluOgrenciler} onGeri={vi.fn()} />);
    const gonderBtn = screen.getByText(/Gönder \(0 öğrenci\)/i);
    expect(gonderBtn.closest('button')).toBeDisabled();
  });

  it('Gönder butonu mesaj ve seçim varken etkin olur', async () => {
    renderWithProviders(<TopluIslemlerSayfasi ogrenciler={topluOgrenciler} onGeri={vi.fn()} />);
    fireEvent.click(screen.getAllByText('Ali Yılmaz')[0]);
    const textarea = screen.getByPlaceholderText('Mesajınızı yazın...');
    fireEvent.change(textarea, { target: { value: 'Merhaba!' } });
    const gonderBtn = screen.getByText(/Gönder \(1 öğrenci\)/i);
    expect(gonderBtn.closest('button')).not.toBeDisabled();
  });

  it('hızlı şablona tıklayınca textarea dolup Gönder butonu etkinleşir', () => {
    renderWithProviders(<TopluIslemlerSayfasi ogrenciler={topluOgrenciler} onGeri={vi.fn()} />);
    fireEvent.click(screen.getAllByText('Ali Yılmaz')[0]);
    fireEvent.click(screen.getByText('Bu hafta çalışmaya devam edin!'));
    expect(screen.getByText(/Gönder \(1 öğrenci\)/i).closest('button')).not.toBeDisabled();
  });
});
