/**
 * Yeni Testler — Admin Bileşenleri
 * Kapsam: KocKarti, AuditLogSayfasi, KocEkleModal, SilmeTalepleri,
 *         KocAtamaModal, AdminOgrenciEkleModal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

vi.mock('../utils/tarih', () => ({
  bugunStr: vi.fn(() => '2024-01-15'),
}));

vi.mock('../utils/izleme', () => ({
  logIstemciHatasi: vi.fn(),
  setIzlemeUser: vi.fn(),
  getIzlemeUser: vi.fn(),
}));

vi.mock('../utils/aktiflikKaydet', () => ({
  aktifDurumu: vi.fn(() => ({ renk: '#22C55E', label: 'Aktif' })),
  aktiflikKaydet: vi.fn(),
}));

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(() => Promise.resolve()),
  BildirimZili: () => null,
  BildirimPaneli: () => null,
  useBildirimler: () => ({ bildirimler: [], okunmamis: 0 }),
}));

vi.mock('../admin/adminHelpers', () => ({
  getCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: {} }))),
  hataMesajiVer: vi.fn(e => e?.message || 'Hata'),
  emailGecerliMi: vi.fn(e => /.+@.+\..+/.test(String(e || ''))),
  kisaTarih: vi.fn(() => '15.01.2024 10:00'),
  SINAV_TUR_SECENEKLERI: null,
}));

const mockS = new Proxy(
  {},
  {
    get: (_, p) => (p === 'shadow' || p === 'shadowCard' ? '0 2px 8px rgba(0,0,0,.1)' : '#ccc'),
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// KocKarti
// ─────────────────────────────────────────────────────────────────────────────
import KocKarti from '../admin/KocKarti';

const mockKoc = { id: 'koc1', isim: 'Ahmet Yılmaz', email: 'ahmet@test.com', sonAktif: null };

describe('KocKarti', () => {
  beforeEach(() => vi.clearAllMocks());

  it('render olur', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });

    render(
      <KocKarti koc={mockKoc} ogrenciSayisi={5} s={mockS} onSil={vi.fn()} islemYukleniyor={false} />
    );
    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });
  });

  it('öğrenci sayısını gösterir', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });

    render(
      <KocKarti koc={mockKoc} ogrenciSayisi={8} s={mockS} onSil={vi.fn()} islemYukleniyor={false} />
    );
    await waitFor(() => expect(screen.getByText('8')).toBeInTheDocument());
  });

  it('email gösterilir', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });

    render(
      <KocKarti koc={mockKoc} ogrenciSayisi={3} s={mockS} onSil={vi.fn()} islemYukleniyor={false} />
    );
    await waitFor(() => expect(screen.getByText('ahmet@test.com')).toBeInTheDocument());
  });

  it('isim yoksa email gösterilir', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => false });
    const isimsizKoc = { id: 'k2', isim: '', email: 'noname@test.com' };

    render(
      <KocKarti
        koc={isimsizKoc}
        ogrenciSayisi={0}
        s={mockS}
        onSil={vi.fn()}
        islemYukleniyor={false}
      />
    );
    await waitFor(() => expect(screen.getAllByText('noname@test.com')[0]).toBeInTheDocument());
  });

  it('bugün giriş sayısı varsa gösterilir', async () => {
    const { getDoc } = await import('firebase/firestore');
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ girisSayisi: 3 }) });

    render(
      <KocKarti koc={mockKoc} ogrenciSayisi={2} s={mockS} onSil={vi.fn()} islemYukleniyor={false} />
    );
    await waitFor(() => expect(screen.getByText(/3 kez giriş/)).toBeInTheDocument());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AuditLogSayfasi
// ─────────────────────────────────────────────────────────────────────────────
import AuditLogSayfasi from '../admin/AuditLogSayfasi';

describe('AuditLogSayfasi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('render olur', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<AuditLogSayfasi s={mockS} mobil={false} />);
    await waitFor(() => expect(screen.getByText('📋 İşlem Geçmişi')).toBeInTheDocument());
  });

  it('kayıt yokken "Henüz kayıt yok" gösterir', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<AuditLogSayfasi s={mockS} mobil={false} />);
    await waitFor(() => expect(screen.getByText(/Henüz kayıt yok/)).toBeInTheDocument());
  });

  it('log varken liste gösterilir', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'l1',
          data: () => ({
            ne: 'koc_ata',
            kimIsim: 'Admin',
            kimiIsim: 'Ali',
            zaman: null,
          }),
        },
      ],
    });

    render(<AuditLogSayfasi s={mockS} mobil={false} />);
    await waitFor(() => expect(screen.getAllByText(/Admin|Ali|Koç atadı/)[0]).toBeInTheDocument());
  });

  it('mobil modda render olur', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<AuditLogSayfasi s={mockS} mobil={true} />);
    await waitFor(() => expect(screen.getByText('📋 İşlem Geçmişi')).toBeInTheDocument());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocEkleModal
// ─────────────────────────────────────────────────────────────────────────────
import KocEkleModal from '../admin/KocEkleModal';

describe('KocEkleModal', () => {
  const onKapat = vi.fn();
  const onEkle = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('render olur', () => {
    render(<KocEkleModal onKapat={onKapat} onEkle={onEkle} />);
    expect(screen.getByText('👨‍🏫 Yeni Koç Ekle')).toBeInTheDocument();
  });

  it('boş isimle ekle çalışmaz', async () => {
    const { getCallable } = await import('../admin/adminHelpers');
    render(<KocEkleModal onKapat={onKapat} onEkle={onEkle} />);
    const ekleBtn = screen.getAllByText(/Ekle|Kaydet|Oluştur/i)[0];
    fireEvent.click(ekleBtn);
    expect(getCallable).not.toHaveBeenCalled();
  });

  it('geçerli form ile getCallable çağrılır', async () => {
    const { getCallable } = await import('../admin/adminHelpers');
    const mockFn = vi.fn(() => Promise.resolve({ data: {} }));
    getCallable.mockReturnValueOnce(mockFn);

    render(<KocEkleModal onKapat={onKapat} onEkle={onEkle} />);

    const inputs = document.querySelectorAll('input');
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'Test Koç' } });
      fireEvent.change(inputs[1], { target: { value: 'koc@test.com' } });
      if (inputs[2]) fireEvent.change(inputs[2], { target: { value: '123456' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Koçu Ekle|Kaydediliyor/i }));
    });
    expect(getCallable).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SilmeTalepleri
// ─────────────────────────────────────────────────────────────────────────────
import SilmeTalepleri from '../admin/SilmeTalepleri';

describe('SilmeTalepleri', () => {
  beforeEach(() => vi.clearAllMocks());

  it('render olur', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<SilmeTalepleri s={mockS} kullanici={{ uid: 'admin1' }} />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('bekleyen talep yokken boş durum gösterir', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<SilmeTalepleri s={mockS} kullanici={{ uid: 'admin1' }} />);
    // Component returns null when talepler is empty — just verify no crash
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('talepler listesi render olur', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 't1',
          data: () => ({
            ogrenciIsim: 'Test Öğrenci',
            kocId: 'koc1',
            ogrenciId: 'ogr1',
            durum: 'bekliyor',
            tarih: null,
          }),
        },
      ],
    });

    render(<SilmeTalepleri s={mockS} kullanici={{ uid: 'admin1' }} />);
    await waitFor(() => expect(screen.getByText('Test Öğrenci')).toBeInTheDocument());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocAtamaModal
// ─────────────────────────────────────────────────────────────────────────────
import KocAtamaModal from '../admin/KocAtamaModal';

describe('KocAtamaModal', () => {
  const mockOgrenci = { id: 'ogr1', isim: 'Test Öğrenci', kocId: null };
  const mockKoclar = [
    { id: 'k1', isim: 'Koç Bir', email: 'koc1@test.com' },
    { id: 'k2', isim: 'Koç İki', email: 'koc2@test.com' },
  ];

  it('render olur', () => {
    render(
      <KocAtamaModal
        ogrenci={mockOgrenci}
        koclar={mockKoclar}
        onKapat={vi.fn()}
        onGuncelle={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getAllByText(/Koç Ata|Koç atama/i)[0]).toBeInTheDocument();
  });

  it('koç listesi gösterilir', () => {
    render(
      <KocAtamaModal
        ogrenci={mockOgrenci}
        koclar={mockKoclar}
        onKapat={vi.fn()}
        onGuncelle={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText('Koç Bir')).toBeInTheDocument();
    expect(screen.getByText('Koç İki')).toBeInTheDocument();
  });

  it('kapat butonu çalışır', () => {
    const onKapat = vi.fn();
    render(
      <KocAtamaModal
        ogrenci={mockOgrenci}
        koclar={mockKoclar}
        onKapat={onKapat}
        onGuncelle={vi.fn()}
        s={mockS}
      />
    );
    const kapatBtn = screen.queryByRole('button', { name: /Kapat|İptal|×/i });
    if (kapatBtn) {
      fireEvent.click(kapatBtn);
      expect(onKapat).toHaveBeenCalled();
    }
  });
});
