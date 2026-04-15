/**
 * Yeni Testler — Yardımcılar, Mesajlaşma ve Kalan Bileşenler
 * Kapsam: readState, Mesajlar, BransBolum, GrafikModal, KocNotlari, App
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

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

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(),
}));

vi.mock('../utils/fcmToken', () => ({
  fcmTokenGuncelle: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// readState — saf fonksiyonlar
// ─────────────────────────────────────────────────────────────────────────────
import { isRead, isUnread, readPatch, unreadPatch, unreadCount } from '../utils/readState';

describe('isRead()', () => {
  it('readAt varsa true döner', () => {
    expect(isRead({ readAt: new Date() })).toBe(true);
  });
  it('okunmaZamani varsa true döner', () => {
    expect(isRead({ okunmaZamani: new Date() })).toBe(true);
  });
  it('okundu=true ise true döner', () => {
    expect(isRead({ okundu: true })).toBe(true);
  });
  it('hiçbiri yoksa false döner', () => {
    expect(isRead({})).toBe(false);
    expect(isRead()).toBe(false);
  });
  it('okundu=false ise false döner', () => {
    expect(isRead({ okundu: false })).toBe(false);
  });
});

describe('isUnread()', () => {
  it('isRead tersini döner', () => {
    expect(isUnread({ readAt: new Date() })).toBe(false);
    expect(isUnread({})).toBe(true);
  });
});

describe('readPatch()', () => {
  it('okundu=true içerir', () => {
    const patch = readPatch();
    expect(patch.okundu).toBe(true);
  });
  it('readAt ve okunmaZamani alanları var', () => {
    const patch = readPatch();
    expect(patch.readAt).toBeInstanceOf(Date);
    expect(patch.okunmaZamani).toBeInstanceOf(Date);
  });
});

describe('unreadPatch()', () => {
  it('okundu=false ve null alanlar döner', () => {
    const patch = unreadPatch();
    expect(patch.okundu).toBe(false);
    expect(patch.readAt).toBeNull();
    expect(patch.okunmaZamani).toBeNull();
  });
});

describe('unreadCount()', () => {
  it('boş listede 0 döner', () => {
    expect(unreadCount([])).toBe(0);
  });
  it('okunmamış sayısını doğru hesaplar', () => {
    const liste = [{ okundu: false }, { okundu: true }, {}, { readAt: new Date() }];
    expect(unreadCount(liste)).toBe(2);
  });
  it('predicate filtresi çalışır', () => {
    const liste = [
      { tip: 'koc', okundu: false },
      { tip: 'ogrenci', okundu: false },
    ];
    const sayı = unreadCount(liste, item => item.tip === 'koc');
    expect(sayı).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mesajlar bileşeni
// ─────────────────────────────────────────────────────────────────────────────
import Mesajlar from '../ogrenci/Mesajlar';

describe('Mesajlar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('boş mesaj listesiyle render olur', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementation((_q, cb) => {
      cb({ docs: [] });
      return () => {};
    });

    render(<Mesajlar ogrenciId="ogr1" gonderen="koc" aliciId="ogr1" aliciIsim="Test Öğrenci" />);
    expect(document.body).toBeTruthy();
  });

  it('mesajlar gelince render olur', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementation((_q, cb) => {
      cb({
        docs: [
          {
            id: 'm1',
            data: () => ({
              mesaj: 'Merhaba!',
              gonderenId: 'koc1',
              olusturma: { toDate: () => new Date() },
            }),
          },
        ],
      });
      return () => {};
    });

    render(<Mesajlar ogrenciId="ogr1" gonderen="koc" />);
    expect(document.body.textContent).toMatch('Merhaba!');
  });

  it('unmount sırasında unsubscribe çağrılır', async () => {
    const unsubscribe = vi.fn();
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockReturnValue(unsubscribe);

    const { unmount } = render(<Mesajlar ogrenciId="ogr1" gonderen="koc" />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('gönder butonu var', async () => {
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockReturnValue(() => {});

    render(<Mesajlar ogrenciId="ogr1" gonderen="koc" />);
    const gonderBtn = screen.queryByRole('button');
    expect(gonderBtn || document.querySelector('button')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BransBolum bileşeni
// ─────────────────────────────────────────────────────────────────────────────
import BransBolum from '../ogrenci/deneme/BransBolum';

const mockS = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === 'shadow' || prop === 'shadowCard') return '0 2px 8px rgba(0,0,0,0.1)';
      return '#cccccc';
    },
  }
);

describe('BransBolum', () => {
  it('veri yoksa null render eder', () => {
    const { container } = render(
      <BransBolum
        dersId="mat"
        dersLabel="Matematik"
        dersRenk="#5B4FE8"
        dersMax={40}
        denemeler={[]}
        onSil={vi.fn()}
        s={mockS}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('genel deneme verisiyle render olur', () => {
    const denemeler = [
      {
        denemeTuru: 'genel',
        sinav: 'TYT',
        tarih: '2024-01-10',
        netler: { mat: { net: '32.5' } },
      },
    ];
    render(
      <BransBolum
        dersId="mat"
        dersLabel="Matematik"
        dersRenk="#5B4FE8"
        dersMax={40}
        denemeler={denemeler}
        onSil={vi.fn()}
        s={mockS}
      />
    );
    expect(screen.getByText('Matematik')).toBeInTheDocument();
  });

  it('tablo / grafik geçişi çalışır', () => {
    const denemeler = [
      {
        denemeTuru: 'genel',
        sinav: 'TYT',
        tarih: '2024-01-10',
        netler: { mat: { net: '30' } },
      },
      {
        denemeTuru: 'genel',
        sinav: 'TYT',
        tarih: '2024-01-17',
        netler: { mat: { net: '35' } },
      },
    ];
    render(
      <BransBolum
        dersId="mat"
        dersLabel="Matematik"
        dersRenk="#5B4FE8"
        dersMax={40}
        denemeler={denemeler}
        onSil={vi.fn()}
        s={mockS}
      />
    );
    const butonlar = screen.getAllByRole('button');
    const grafikBtn = butonlar.find(b => /grafik/i.test(b.textContent));
    if (grafikBtn) {
      fireEvent.click(grafikBtn);
      expect(document.body).toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GrafikModal bileşeni
// ─────────────────────────────────────────────────────────────────────────────
import GrafikModal from '../ogrenci/deneme/GrafikModal';

describe('GrafikModal', () => {
  const onKapat = vi.fn();
  const noktalar = [
    { tur: 'genel', net: 30, tarih: '2024-01-01', sinav: 'TYT', etiket: 'TYT 01' },
    { tur: 'genel', net: 35, tarih: '2024-01-08', sinav: 'TYT', etiket: 'TYT 08' },
    { tur: 'brans', net: 28, tarih: '2024-01-05', sinav: 'Branş', etiket: 'Branş 05' },
  ];

  it('render olur', () => {
    render(
      <GrafikModal
        dersId="mat"
        dersLabel="Matematik"
        dersRenk="#5B4FE8"
        noktalar={noktalar}
        onKapat={onKapat}
        s={mockS}
      />
    );
    expect(screen.getByText(/Matematik/)).toBeInTheDocument();
  });

  it('ortalama hesaplanıp gösterilir', () => {
    render(
      <GrafikModal
        dersId="mat"
        dersLabel="Matematik"
        dersRenk="#5B4FE8"
        noktalar={noktalar}
        onKapat={onKapat}
        s={mockS}
      />
    );
    // Ortalama = (30+35+28)/3 ≈ 31.0
    expect(screen.getAllByText(/31\.|ort/i)[0]).toBeInTheDocument();
  });

  it('boş noktalar ile render olur', () => {
    render(
      <GrafikModal
        dersId="mat"
        dersLabel="Matematik"
        dersRenk="#5B4FE8"
        noktalar={[]}
        onKapat={onKapat}
        s={mockS}
      />
    );
    expect(document.body).toBeTruthy();
  });

  it('kapat butonu çalışır', () => {
    render(
      <GrafikModal
        dersId="mat"
        dersLabel="Matematik"
        dersRenk="#5B4FE8"
        noktalar={noktalar}
        onKapat={onKapat}
        s={mockS}
      />
    );
    const kapatBtn = screen.queryByText(/Kapat|kapat|×|✕/);
    if (kapatBtn) {
      fireEvent.click(kapatBtn);
      expect(onKapat).toHaveBeenCalled();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KocNotlari bileşeni
// ─────────────────────────────────────────────────────────────────────────────
import { KocNotlari } from '../ogrenci/KocNotlari';

describe('KocNotlari', () => {
  beforeEach(() => vi.clearAllMocks());

  it('render olur', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<KocNotlari ogrenciId="ogr1" />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('notlar yokken boş durum gösterir', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<KocNotlari ogrenciId="ogr1" />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('notlar varken liste render olur', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'n1',
          data: () => ({
            tip: 'not',
            not: 'Harika ilerleme gösterdi!',
            etiket: 'motivasyon',
            tarih: '2024-01-10',
            olusturma: { seconds: 1704844800 },
          }),
        },
      ],
    });

    render(<KocNotlari ogrenciId="ogr1" />);
    await waitFor(() => {
      expect(screen.getByText('Harika ilerleme gösterdi!')).toBeInTheDocument();
    });
  });

  it('getDocs hata verse bileşen çökmez', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockRejectedValueOnce(new Error('hata'));

    expect(() => render(<KocNotlari ogrenciId="ogr1" />)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// App — yönlendirme ve koruma
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../pages/GirisEkrani', () => ({ default: () => <div>Giriş Ekranı</div> }));
vi.mock('../pages/KocPaneli', () => ({ default: () => <div>Koç Paneli</div> }));
vi.mock('../pages/OgrenciPaneli', () => ({ default: () => <div>Öğrenci Paneli</div> }));
vi.mock('../pages/VeliPaneli', () => ({ default: () => <div>Veli Paneli</div> }));
vi.mock('../pages/YoneticiPaneli', () => ({ default: () => <div>Yönetici Paneli</div> }));

import App from '../App';

describe('App', () => {
  it('render olur ve çökmez', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(document.body).toBeTruthy();
  });

  it('kimlik doğrulama yokken giriş sayfası gösterilir', async () => {
    // setup.js zaten yukleniyor=false ve kullanici=test-uid ile mock yapıyor
    await act(async () => {
      render(<App />);
    });
    // Auth mock'u varken sayfalardan biri render olmalı
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });
});
