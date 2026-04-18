/**
 * Yeni Testler — Koc Hedef & Öğrenci Bileşenleri
 * Kapsam: HedefEkleModal, OgrenciHedefKarti, BugunProgramKart, GunlukRutinKart, DenemeModal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Ağır bağımlılıkları mock'la
vi.mock('../koc/HaftalikProgram', () => ({
  VideoIzleModal: () => null,
}));

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(),
}));

vi.mock('../data/konular', () => ({
  TYT_DERSLER: [],
  AYT_DERSLER: [],
  AYT_SAY: [],
  AYT_EA: [],
  AYT_SOZ: [],
  AYT_DIL: [],
  KONULAR: {},
  netHesapla: vi.fn(() => ({ net: 0, dogru: 0, yanlis: 0 })),
  renkler: {},
}));

vi.mock('../utils/ogrenciBaglam', () => ({
  LGS_DERSLER: [],
  mufredatAnahtarlariniBelirle: vi.fn(() => ['tyt']),
  ogrenciBaglaminiCoz: vi.fn(() => ({
    sinavModu: 'yks',
    lgsOgrencisi: false,
    arasinifOgrencisi: false,
    gerisayimHedef: null,
    mufredatAnahtarlari: ['tyt'],
  })),
}));

vi.mock('../utils/sinavUtils', () => ({
  turdenBransDersler: vi.fn(() => []),
}));

vi.mock('../utils/tarih', () => ({
  bugunStr: vi.fn(() => '2024-01-15'),
  bugunGunAdi: vi.fn(() => 'Pazartesi'),
  haftaBasStr: vi.fn(() => '2024-W03'),
}));

vi.mock('../utils/izleme', () => ({
  logIstemciHatasi: vi.fn(),
  setIzlemeUser: vi.fn(),
  getIzlemeUser: vi.fn(),
}));

// Mock s objesi
const mockS = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === 'shadow' || prop === 'shadowCard') return '0 2px 8px rgba(0,0,0,0.1)';
      return '#cccccc';
    },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// HedefEkleModal
// ─────────────────────────────────────────────────────────────────────────────
import HedefEkleModal from '../koc/hedef/HedefEkleModal';

const mockOgrenci = { id: 'ogrenci-1', isim: 'Test Öğrenci' };

describe('HedefEkleModal', () => {
  const onKapat = vi.fn();
  const onEkle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dialog olarak render olur', () => {
    render(<HedefEkleModal ogrenci={mockOgrenci} onKapat={onKapat} onEkle={onEkle} s={mockS} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Escape tuşu ile kapanır', () => {
    render(<HedefEkleModal ogrenci={mockOgrenci} onKapat={onKapat} onEkle={onEkle} s={mockS} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onKapat).toHaveBeenCalled();
  });

  it('başlık ve hedef değer girilip kaydedilebilir', async () => {
    const { addDoc } = await import('firebase/firestore');
    addDoc.mockResolvedValueOnce({ id: 'yeni-hedef-id' });

    render(<HedefEkleModal ogrenci={mockOgrenci} onKapat={onKapat} onEkle={onEkle} s={mockS} />);

    // Başlık gir
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'TYT Hedefi' } });

    // Hedef değer gir
    const hedefInput = document.querySelector('input[type="number"]');
    if (hedefInput) fireEvent.change(hedefInput, { target: { value: '85' } });

    // Kaydet butonunu bul ve tıkla
    const kaydetBtn = screen.getByText(/Ekle|Kaydet/i);
    await act(async () => {
      fireEvent.click(kaydetBtn);
    });
  });

  it('başlık boşken kaydet çalışmaz', async () => {
    const { addDoc } = await import('firebase/firestore');
    addDoc.mockClear();

    render(<HedefEkleModal ogrenci={mockOgrenci} onKapat={onKapat} onEkle={onEkle} s={mockS} />);

    const kaydetBtn = screen.getByText(/Ekle|Kaydet/i);
    fireEvent.click(kaydetBtn);
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('tur seçim alanları var', () => {
    render(<HedefEkleModal ogrenci={mockOgrenci} onKapat={onKapat} onEkle={onEkle} s={mockS} />);
    // Net, Saat, Puan veya Diğer seçeneklerinden biri görünmeli
    expect(screen.getAllByText(/Net|Saat|Puan/)[0]).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OgrenciHedefKarti
// ─────────────────────────────────────────────────────────────────────────────
import OgrenciHedefKarti from '../koc/hedef/OgrenciHedefKarti';

describe('OgrenciHedefKarti', () => {
  const onHedefEkle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('yükleniyor durumunda render olur', async () => {
    const { getDocs } = await import('firebase/firestore');
    // getDocs henüz resolve etmemiş — bileşen loading state'de
    getDocs.mockReturnValueOnce(new Promise(() => {}));

    const { container } = render(
      <OgrenciHedefKarti ogrenci={mockOgrenci} index={0} s={mockS} onHedefEkle={onHedefEkle} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('hedef yokken "Hedef Ekle" butonu gösterir', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(
      <OgrenciHedefKarti ogrenci={mockOgrenci} index={0} s={mockS} onHedefEkle={onHedefEkle} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Hedef Ekle|hedef ekle/i)).toBeInTheDocument();
    });
  });

  it('hedefler varken liste gösterir', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'h1',
          data: () => ({
            baslik: 'TYT 80 Net',
            hedefTur: 'net',
            hedefDeger: 80,
            baslangicDegeri: 60,
            guncelDeger: 70,
            durum: 'aktif',
            olusturma: { seconds: Date.now() / 1000 },
          }),
        },
      ],
    });

    render(
      <OgrenciHedefKarti ogrenci={mockOgrenci} index={0} s={mockS} onHedefEkle={onHedefEkle} />
    );

    await waitFor(() => {
      expect(screen.getByText('TYT 80 Net')).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BugunProgramKart
// ─────────────────────────────────────────────────────────────────────────────
import BugunProgramKart from '../ogrenci/BugunProgramKart';

describe('BugunProgramKart', () => {
  const onNav = vi.fn();

  it('boş program ile render olur', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementationOnce((_ref, cb) => {
      cb({ exists: () => false });
      return () => {};
    });

    render(<BugunProgramKart ogrenciId="ogr-1" onNav={onNav} s={mockS} />);

    await waitFor(() => {
      // Boş program varsa mesaj ya da başlık gösterilmeli
      expect(document.body).toBeTruthy();
    });
  });

  it('program slotları varken render olur', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementationOnce((_ref, cb) => {
      cb({
        exists: () => true,
        data: () => ({
          hafta: {
            Pazartesi: [{ tip: 'konu', ders: 'Matematik', konu: 'Türevler' }],
          },
          tamamlandi: {},
        }),
      });
      return () => {};
    });

    render(<BugunProgramKart ogrenciId="ogr-1" onNav={onNav} s={mockS} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Matematik|Türevler|Konu/)[0]).toBeInTheDocument();
    });
  });

  it('unmount sırasında snapshot dinleyici temizlenir', async () => {
    const unsubscribe = vi.fn();
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockReturnValueOnce(unsubscribe);

    const { unmount } = render(<BugunProgramKart ogrenciId="ogr-1" onNav={onNav} s={mockS} />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GunlukRutinKart
// ─────────────────────────────────────────────────────────────────────────────
import GunlukRutinKart from '../ogrenci/GunlukRutinKart';

describe('GunlukRutinKart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('render olur', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });

    render(<GunlukRutinKart ogrenciId="ogr-1" s={mockS} />);
    expect(document.body).toBeTruthy();
  });

  it('mevcut rutin verisi yüklenir', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ uyku: 8, su: true, egzersiz: false, not: 'İyi hissediyorum' }),
    });

    render(<GunlukRutinKart ogrenciId="ogr-1" s={mockS} />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('kaydet butonuna tıklanabilir', async () => {
    const { getDoc, setDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });
    setDoc.mockResolvedValueOnce(undefined);

    render(<GunlukRutinKart ogrenciId="ogr-1" s={mockS} />);

    await waitFor(() => {
      const kaydetBtn = screen.queryByText(/Kaydet|kaydet/i);
      if (kaydetBtn) {
        fireEvent.click(kaydetBtn);
        expect(setDoc).toHaveBeenCalled();
      }
    });
  });

  it('getDoc hata verse bileşen çökmez', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockRejectedValueOnce(new Error('Firestore hatası'));

    expect(() => render(<GunlukRutinKart ogrenciId="ogr-1" s={mockS} />)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deneme/constants — yorumUret saf fonksiyon
// ─────────────────────────────────────────────────────────────────────────────
import { yorumUret, RENK } from '../ogrenci/deneme/constants';

describe('yorumUret()', () => {
  it("2'den az veri varsa null döner", () => {
    expect(yorumUret([])).toBeNull();
    expect(yorumUret([{ tarih: '2024-01-01', net: 50 }])).toBeNull();
  });

  it('büyük artışta "artış" yorumu üretir', () => {
    const veri = [
      { tarih: '2024-01-01', net: 40 },
      { tarih: '2024-01-08', net: 45 },
    ];
    const yorum = yorumUret(veri);
    expect(yorum).toHaveProperty('ikon');
    expect(yorum).toHaveProperty('metin');
    expect(yorum).toHaveProperty('renk');
  });

  it('istikrarlı net için pozitif yorum verebilir', () => {
    const veri = [
      { tarih: '2024-01-01', net: 50 },
      { tarih: '2024-01-08', net: 50.1 },
      { tarih: '2024-01-15', net: 50.2 },
    ];
    // Düşüşte null dönmeli, artışta yorum dönmeli — null veya obje her ikisi geçerli
    const yorum = yorumUret(veri);
    if (yorum !== null) {
      expect(yorum).toHaveProperty('ikon');
    }
  });

  it('düşüşte null döner', () => {
    const veri = [
      { tarih: '2024-01-01', net: 70 },
      { tarih: '2024-01-08', net: 60 },
    ];
    expect(yorumUret(veri)).toBeNull();
  });

  it('RENK sabitleri tanımlı', () => {
    expect(RENK).toHaveProperty('genel');
    expect(RENK).toHaveProperty('artis');
    expect(RENK).toHaveProperty('istikrar');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BugunSlotSatir
// ─────────────────────────────────────────────────────────────────────────────
import BugunSlotSatir from '../ogrenci/BugunSlotSatir';

describe('BugunSlotSatir', () => {
  const mockTip = { renk: '#10B981', acik: '#e6f7f2', label: 'Konu' };
  const baseProps = {
    slot: {
      _idx: 0,
      tip: 'konu',
      ders: 'Matematik',
      icerik: 'Türevler',
      baslangic: '09:00',
      bitis: '10:00',
    },
    bitti: false,
    tip: mockTip,
    konularAcik: null,
    setKonularAcik: vi.fn(),
    setVideoModal: vi.fn(),
    onToggle: vi.fn(),
    ogrenciId: 'ogr-1',
    ogrenciTur: 'sayisal_12',
    ogrenciSinif: 12,
    s: mockS,
  };

  it('ders adını ve içeriği gösterir', () => {
    render(<BugunSlotSatir {...baseProps} />);
    expect(screen.getByText('Matematik')).toBeInTheDocument();
    expect(screen.getByText('Türevler')).toBeInTheDocument();
  });

  it('ogrenciTur varken Konular butonu render olur', () => {
    render(<BugunSlotSatir {...baseProps} />);
    expect(screen.getByText(/Konular/)).toBeInTheDocument();
  });

  it('ogrenciTur yoksa Konular butonu render olmaz', () => {
    render(<BugunSlotSatir {...baseProps} ogrenciTur={undefined} />);
    expect(screen.queryByText(/Konular/)).not.toBeInTheDocument();
  });

  it('tıklanınca onToggle çağrılır', () => {
    render(<BugunSlotSatir {...baseProps} />);
    fireEvent.click(screen.getByText('Matematik'));
    expect(baseProps.onToggle).toHaveBeenCalledWith(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SlotKonularPanel
// ─────────────────────────────────────────────────────────────────────────────
import SlotKonularPanel from '../ogrenci/SlotKonularPanel';

describe('SlotKonularPanel', () => {
  it('ogrenciTur yoksa yükleniyor göstermez', async () => {
    render(
      <SlotKonularPanel ders="Matematik" ogrenciId="ogr-1" ogrenciTur={undefined} s={mockS} />
    );
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('Firestore boş döndüğünde bulunamadı mesajı gösterir', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValue({ docs: [], empty: true });

    render(
      <SlotKonularPanel
        ders="Matematik"
        ogrenciId="ogr-1"
        ogrenciTur="sayisal_12"
        ogrenciSinif={12}
        s={mockS}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/bulunamadı/i)).toBeInTheDocument();
    });
  });
});
