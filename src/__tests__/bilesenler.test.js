/**
 * ElsWay — Bileşen Testleri
 *
 * Kapsam:
 *   1. KocSolMenu
 *   2. KocHeroKart
 *   3. KocVeriGirisiKart
 *   4. KocMesajUyari
 *   5. GeriSayimKart
 *   6. DersKarti
 *   7. hedefUtils (ek davranış)
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { renderWithProviders, renderSade, mockS } from './testUtils';

import KocSolMenu from '../koc/ui/KocSolMenu';
import KocHeroKart from '../koc/ui/KocHeroKart';
import KocVeriGirisiKart from '../koc/ui/KocVeriGirisiKart';
import KocMesajUyari from '../koc/ui/KocMesajUyari';
import { KocProvider } from '../context/KocContext';
import GeriSayimKart from '../ogrenci/GeriSayimKart';
import DersKarti from '../ogrenci/deneme/DersKarti';

import {
  hedefDurumu,
  ilerlemeYuzdesi,
  durumStil,
  nettenTYTPuanTahmini,
  nettenAYTPuanTahmini,
  tahminiPuan,
} from '../koc/hedef/hedefUtils';

import { useGunlukTarih } from '../utils/tarih';

// ─────────────────────────────────────────────────────────────────────────────
// 1. KocSolMenu
// ─────────────────────────────────────────────────────────────────────────────
describe('KocSolMenu', () => {
  const defaultProps = {
    aktif: 'ana',
    onNav: vi.fn(),
    okunmamis: 0,
  };

  it('render olur', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} />);
    expect(document.body).toBeTruthy();
  });

  it('grup başlık metinleri görünür', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} />);
    expect(screen.getByText('Genel')).toBeDefined();
    expect(screen.getByText('İletişim')).toBeDefined();
  });

  it('menü öğesi etiketleri görünür', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} />);
    expect(screen.getByText('Ana sayfa')).toBeDefined();
    expect(screen.getByText('Öğrencilerim')).toBeDefined();
    expect(screen.getByText('Mesajlar')).toBeDefined();
  });

  it('okunmamis > 0 iken badge görünür', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} okunmamis={5} />);
    expect(screen.getByText('5')).toBeDefined();
  });

  it('okunmamis = 0 iken badge görünmez', () => {
    renderWithProviders(<KocSolMenu {...defaultProps} okunmamis={0} />);
    expect(screen.queryByText('0')).toBeNull();
  });

  it('menü öğesine tıklanınca onNav çağrılır', () => {
    const onNav = vi.fn();
    renderWithProviders(<KocSolMenu {...defaultProps} onNav={onNav} />);
    fireEvent.click(screen.getByText('Öğrencilerim'));
    expect(onNav).toHaveBeenCalledWith('ogrenciler');
  });

  it('aktif menü öğesi farklı bir öğede de çalışır', () => {
    const onNav = vi.fn();
    renderWithProviders(<KocSolMenu aktif="mesajlar" onNav={onNav} okunmamis={0} />);
    fireEvent.click(screen.getByText('İstatistikler'));
    expect(onNav).toHaveBeenCalledWith('istatistikler');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. KocHeroKart
// ─────────────────────────────────────────────────────────────────────────────
describe('KocHeroKart', () => {
  const defaultProps = {
    ogrenciSayisi: 10,
    bugunGirisYokList: [],
    toplamOkunmamis: 0,
    okunmamisMap: {},
    ogrenciler: [],
    onNav: vi.fn(),
    onSec: vi.fn(),
    kocAdi: 'Ayşe',
  };

  it('render olur', () => {
    renderWithProviders(<KocHeroKart {...defaultProps} />);
    expect(document.body).toBeTruthy();
  });

  it("kocAdi prop'u ekranda gösterilir", () => {
    renderWithProviders(<KocHeroKart {...defaultProps} kocAdi="Mehmet" />);
    expect(screen.getByText(/Mehmet/)).toBeDefined();
  });

  it('kocAdi yoksa "Koç" fallback gösterilir', () => {
    renderWithProviders(<KocHeroKart {...defaultProps} kocAdi={undefined} />);
    expect(screen.getByText(/Koç/)).toBeDefined();
  });

  it('selamlama metni görünür (Günaydın / İyi günler / İyi akşamlar / İyi geceler)', () => {
    renderWithProviders(<KocHeroKart {...defaultProps} />);
    const selam = screen.queryByText(/Günaydın|İyi günler|İyi akşamlar|İyi geceler/);
    expect(selam).toBeTruthy();
  });

  it('ogrenciSayisi ekranda görünür', () => {
    renderWithProviders(<KocHeroKart {...defaultProps} ogrenciSayisi={15} />);
    expect(screen.getByText('15')).toBeDefined();
  });

  it('bugunGirisYokList doluyken sayı gösterilir', () => {
    const liste = [
      { id: 'o1', isim: 'Ali' },
      { id: 'o2', isim: 'Veli' },
    ];
    renderWithProviders(<KocHeroKart {...defaultProps} bugunGirisYokList={liste} />);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('onNav çağrılınca Öğrenci kartına tıklanır', () => {
    const onNav = vi.fn();
    renderWithProviders(<KocHeroKart {...defaultProps} onNav={onNav} />);
    fireEvent.click(screen.getByText('Öğrenci'));
    expect(onNav).toHaveBeenCalledWith('ogrenciler');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. KocVeriGirisiKart
// ─────────────────────────────────────────────────────────────────────────────
describe('KocVeriGirisiKart', () => {
  const ogrenciler = [
    { id: 'o1', isim: 'Ali' },
    { id: 'o2', isim: 'Veli' },
    { id: 'o3', isim: 'Ayşe' },
  ];

  const renderKart = (kocOgrenciler, bugunMap, onNav = vi.fn()) =>
    renderWithProviders(
      <KocProvider
        ogrenciler={kocOgrenciler}
        bugunMap={bugunMap}
        dashboardMap={{}}
        okunmamisMap={{}}
        yukleniyor={false}
        yenile={vi.fn()}
      >
        <KocVeriGirisiKart onNav={onNav} />
      </KocProvider>
    );

  it('ogrenciler boşken null döner (render edilmez)', () => {
    const { container } = renderKart([], {});
    expect(container.firstChild).toBeNull();
  });

  it('render olur', () => {
    renderKart(ogrenciler, {});
    expect(screen.getByText('Bugünün veri girişi')).toBeDefined();
  });

  it('rutin giriş sayısını doğru gösterir', () => {
    const bugunMap = { o1: { rutin: true }, o2: { rutin: false }, o3: { rutin: true } };
    renderKart(ogrenciler, bugunMap);
    expect(screen.getByText('2/3')).toBeDefined();
  });

  it('tüm öğrenciler veri girdiyse "Henüz veri yok" 0 gösterir', () => {
    const bugunMap = {
      o1: { rutin: true, gunlukSoru: true },
      o2: { rutin: true, gunlukSoru: true },
      o3: { rutin: true, gunlukSoru: true },
    };
    renderKart(ogrenciler, bugunMap);
    expect(screen.getByText('0')).toBeDefined();
  });

  it('bugunEksik > 0 iken uyarı mesajı görünür', () => {
    renderKart(ogrenciler, {});
    expect(screen.getByText(/bugün henüz giriş yok/)).toBeDefined();
  });

  it('"Günlük Takip" linkine tıklanınca onNav çağrılır', () => {
    const onNav = vi.fn();
    renderKart(ogrenciler, {}, onNav);
    fireEvent.click(screen.getByText('Günlük Takip'));
    expect(onNav).toHaveBeenCalledWith('gunluktakip');
  });

  it('"Günlük takibe git" butonuna tıklanınca onNav çağrılır', () => {
    const onNav = vi.fn();
    renderKart(ogrenciler, {}, onNav);
    fireEvent.click(screen.getByText('Günlük takibe git →'));
    expect(onNav).toHaveBeenCalledWith('gunluktakip');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. KocMesajUyari
// ─────────────────────────────────────────────────────────────────────────────
describe('KocMesajUyari', () => {
  const renderMesaj = (ogrenciler, okunmamisMap, onSec = vi.fn()) =>
    renderWithProviders(
      <KocProvider
        ogrenciler={ogrenciler}
        okunmamisMap={okunmamisMap}
        bugunMap={{}}
        dashboardMap={{}}
        yukleniyor={false}
        yenile={vi.fn()}
      >
        <KocMesajUyari onSec={onSec} />
      </KocProvider>
    );

  it('mesaj bekleyen yoksa render edilmez', () => {
    const { container } = renderMesaj([{ id: 'o1', isim: 'Ali' }], {});
    expect(container.firstChild).toBeNull();
  });

  it('mesaj bekleyen varsa okunmamış sayısı görünür', () => {
    renderMesaj([{ id: 'o1', isim: 'Ali' }], { o1: 3 });
    expect(screen.getByText('Okunmamış öğrenci mesajı (1)')).toBeDefined();
  });

  it('mesaj bekleyen öğrencinin ismi görünür', () => {
    renderMesaj(
      [
        { id: 'o1', isim: 'Zeynep' },
        { id: 'o2', isim: 'Kemal' },
      ],
      { o1: 2 }
    );
    expect(screen.getByText('Zeynep')).toBeDefined();
    expect(screen.queryByText('Kemal')).toBeNull();
  });

  it('öğrenciye tıklanınca onSec çağrılır', () => {
    const onSec = vi.fn();
    const ogrenci = { id: 'o1', isim: 'Deniz' };
    renderMesaj([ogrenci], { o1: 1 }, onSec);
    fireEvent.click(screen.getByText('Deniz'));
    expect(onSec).toHaveBeenCalledWith(ogrenci, 'mesajlar');
  });

  it('birden fazla öğrencide toplam sayı doğru', () => {
    renderMesaj(
      [
        { id: 'o1', isim: 'A' },
        { id: 'o2', isim: 'B' },
        { id: 'o3', isim: 'C' },
      ],
      { o1: 2, o2: 5 }
    );
    expect(screen.getByText('Okunmamış öğrenci mesajı (2)')).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. GeriSayimKart
// ─────────────────────────────────────────────────────────────────────────────
describe('GeriSayimKart', () => {
  it('lgs_8 turunda LGS metni görünür', () => {
    renderSade(<GeriSayimKart tur="lgs_8" sinif="8" s={mockS} />);
    expect(screen.getByText(/LGS/)).toBeDefined();
  });

  it('sayisal_12 turunda TYT metni görünür', () => {
    renderSade(<GeriSayimKart tur="sayisal_12" sinif="12" s={mockS} />);
    expect(screen.getByText(/TYT/)).toBeDefined();
  });

  it('gelisim modunda null döner (gelisim_7)', () => {
    const { container } = renderSade(<GeriSayimKart tur="gelisim_7" sinif="7" s={mockS} />);
    expect(container.firstChild).toBeNull();
  });

  it('gün kutusu görünür (pozitif sayı)', () => {
    renderSade(<GeriSayimKart tur="tyt_12" sinif="12" s={mockS} />);
    expect(screen.getByText('gün')).toBeDefined();
  });

  it('saat, dakika, saniye etiketleri görünür', () => {
    renderSade(<GeriSayimKart tur="sayisal_12" sinif="12" s={mockS} />);
    expect(screen.getByText('saat')).toBeDefined();
    expect(screen.getByText('dakika')).toBeDefined();
    expect(screen.getByText('saniye')).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. DersKarti
// ─────────────────────────────────────────────────────────────────────────────
describe('DersKarti', () => {
  const defaultProps = {
    dersId: 'turkce',
    dersLabel: 'Türkçe',
    dersRenk: '#F59E0B',
    dersMax: 40,
    noktalar: [],
    s: mockS,
  };

  it('render olur', () => {
    renderSade(<DersKarti {...defaultProps} />);
    expect(document.body).toBeTruthy();
  });

  it('ders adı gösterilir', () => {
    renderSade(<DersKarti {...defaultProps} dersLabel="Matematik" />);
    expect(screen.getByText('Matematik')).toBeDefined();
  });

  it('veri yoksa net "—" gösterilir', () => {
    renderSade(<DersKarti {...defaultProps} noktalar={[]} />);
    expect(screen.getByText('—')).toBeDefined();
  });

  it('son net değeri gösterilir', () => {
    const noktalar = [
      { net: 25, tarih: '2026-03-01', tur: 'genel' },
      { net: 30, tarih: '2026-03-10', tur: 'genel' },
    ];
    renderSade(<DersKarti {...defaultProps} noktalar={noktalar} />);
    expect(screen.getByText('30')).toBeDefined();
  });

  it('birden fazla nokta varsa ortalama gösterilir', () => {
    const noktalar = [
      { net: 20, tarih: '2026-03-01', tur: 'genel' },
      { net: 30, tarih: '2026-03-10', tur: 'genel' },
    ];
    renderSade(<DersKarti {...defaultProps} noktalar={noktalar} />);
    expect(screen.getByText(/Ort\. 25\.0/)).toBeDefined();
  });

  it('genel denemeler chip olarak gösterilir', () => {
    const noktalar = [{ net: 25, tarih: '2026-03-01', tur: 'genel' }];
    renderSade(<DersKarti {...defaultProps} noktalar={noktalar} />);
    expect(screen.getByText(/1 genel/)).toBeDefined();
  });

  it('branş denemeler chip olarak gösterilir', () => {
    const noktalar = [{ net: 18, tarih: '2026-03-05', tur: 'brans' }];
    renderSade(<DersKarti {...defaultProps} noktalar={noktalar} />);
    expect(screen.getByText(/1 branş/)).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. hedefUtils — ek davranış testleri
// ─────────────────────────────────────────────────────────────────────────────
describe('hedefDurumu', () => {
  it('hedefDeger yoksa aktif döner', () => {
    expect(hedefDurumu({ hedefDeger: 0, baslangicDegeri: 0, guncelDeger: 0 })).toBe('aktif');
  });

  it('yüzde 100+ → tamamlandi', () => {
    expect(hedefDurumu({ hedefDeger: 100, baslangicDegeri: 0, guncelDeger: 100 })).toBe(
      'tamamlandi'
    );
  });

  it('sonTarih geçmişse → gecikti', () => {
    const gecmis = new Date(Date.now() - 86400000 * 10).toISOString();
    expect(
      hedefDurumu({ hedefDeger: 100, baslangicDegeri: 0, guncelDeger: 10, sonTarih: gecmis })
    ).toBe('gecikti');
  });

  it('az kalan gün + düşük ilerleme → riskli', () => {
    const yakin = new Date(Date.now() + 86400000 * 3).toISOString();
    expect(
      hedefDurumu({ hedefDeger: 100, baslangicDegeri: 0, guncelDeger: 5, sonTarih: yakin })
    ).toBe('riskli');
  });

  it('yeterli zaman varsa → aktif', () => {
    const uzak = new Date(Date.now() + 86400000 * 30).toISOString();
    expect(
      hedefDurumu({ hedefDeger: 100, baslangicDegeri: 0, guncelDeger: 20, sonTarih: uzak })
    ).toBe('aktif');
  });
});

describe('ilerlemeYuzdesi', () => {
  it('hedefDeger yoksa 0 döner', () => {
    expect(ilerlemeYuzdesi({ hedefDeger: 0, baslangicDegeri: 0, guncelDeger: 50 })).toBe(0);
  });

  it('başlangıç = hedef olunca 0 döner', () => {
    expect(ilerlemeYuzdesi({ hedefDeger: 50, baslangicDegeri: 50, guncelDeger: 50 })).toBe(0);
  });

  it('yarısına ulaşıldıysa 50 döner', () => {
    expect(ilerlemeYuzdesi({ hedefDeger: 100, baslangicDegeri: 0, guncelDeger: 50 })).toBe(50);
  });

  it('tamamen ulaşıldıysa 100 döner', () => {
    expect(ilerlemeYuzdesi({ hedefDeger: 100, baslangicDegeri: 0, guncelDeger: 100 })).toBe(100);
  });

  it('aşıldıysa maksimum 100 döner', () => {
    expect(ilerlemeYuzdesi({ hedefDeger: 100, baslangicDegeri: 0, guncelDeger: 150 })).toBe(100);
  });

  it("0'dan düşükse 0 döner", () => {
    expect(ilerlemeYuzdesi({ hedefDeger: 100, baslangicDegeri: 50, guncelDeger: 30 })).toBe(0);
  });
});

describe('durumStil', () => {
  const sTest = {
    accent: '#5B4FE8',
    accentSoft: '#EEF',
    chartPos: '#10B981',
    okSoft: '#D1FAE5',
    tehlika: '#F43F5E',
    tehlikaSoft: '#FEE2E2',
    uyari: '#F59E0B',
    uyariSoft: '#FEF3C7',
  };

  it('aktif durumu accent rengi döner', () => {
    const stil = durumStil(sTest, 'aktif');
    expect(stil.renk).toBe(sTest.accent);
    expect(typeof stil.label).toBe('string');
  });

  it('tamamlandi durumu chartPos rengi döner', () => {
    const stil = durumStil(sTest, 'tamamlandi');
    expect(stil.renk).toBe(sTest.chartPos);
  });

  it('gecikti durumu tehlika rengi döner', () => {
    const stil = durumStil(sTest, 'gecikti');
    expect(stil.renk).toBe(sTest.tehlika);
  });

  it('riskli durumu uyari rengi döner', () => {
    const stil = durumStil(sTest, 'riskli');
    expect(stil.renk).toBe(sTest.uyari);
  });

  it("bilinmeyen durum aktif'e fallback yapar", () => {
    const stil = durumStil(sTest, 'bilinmeyen');
    expect(stil.renk).toBe(sTest.accent);
  });

  it('her durum bg alanı döner', () => {
    ['aktif', 'tamamlandi', 'gecikti', 'riskli'].forEach(d => {
      expect(typeof durumStil(sTest, d).bg).toBe('string');
    });
  });
});

describe('hedefUtils — puan tahmini', () => {
  it('nettenTYTPuanTahmini: 0 net → 100 puan', () => {
    expect(nettenTYTPuanTahmini(0)).toBe(100);
  });

  it('nettenTYTPuanTahmini: 120 net → 500 sınırı', () => {
    expect(nettenTYTPuanTahmini(120)).toBe(500);
  });

  it('nettenTYTPuanTahmini: null → null', () => {
    expect(nettenTYTPuanTahmini(null)).toBeNull();
  });

  it('nettenAYTPuanTahmini: 0 net → 100 puan', () => {
    expect(nettenAYTPuanTahmini(0, 'say')).toBe(100);
  });

  it('nettenAYTPuanTahmini: bilinmeyen alan default katsayı kullanır', () => {
    expect(typeof nettenAYTPuanTahmini(50, 'dil')).toBe('number');
  });

  it('tahminiPuan: lgs öğrencisi için farklı formül', () => {
    const lgsP = tahminiPuan({ tyt: 30 }, 'lgs_8');
    const yksP = tahminiPuan({ tyt: 30 }, 'sayisal_12');
    // LGS katsayısı 4.0, YKS katsayısı 3.333 — aynı net için LGS daha yüksek
    expect(lgsP).toBeGreaterThan(yksP);
  });

  it('tahminiPuan: boş netler ile çalışır', () => {
    expect(typeof tahminiPuan({}, 'sayisal_12')).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. KocHeroKart — GirisYokModal ve handleOkunmamis ek testleri
// ─────────────────────────────────────────────────────────────────────────────
describe('KocHeroKart — GirisYokModal', () => {
  const ogrenci = { id: 'o1', isim: 'Zeynep', tur: 'lgs_8' };
  const defaultProps = {
    ogrenciSayisi: 5,
    bugunGirisYokList: [ogrenci],
    bugunMap: { o1: { bugunAktif: false, girisSayisi: 0, sonAktif: null } },
    toplamOkunmamis: 0,
    okunmamisMap: {},
    ogrenciler: [ogrenci],
    onNav: vi.fn(),
    onSec: vi.fn(),
    kocAdi: 'Selin',
  };

  it('"Bugün giriş yok" kartına tıklanınca modal açılır', async () => {
    renderWithProviders(<KocHeroKart {...defaultProps} />);
    fireEvent.click(screen.getByText('Bugün giriş yok'));
    await waitFor(() => {
      expect(screen.getByText('Bugün giriş durumu')).toBeDefined();
    });
  });

  it('modal içinde öğrenci ismi görünür', async () => {
    renderWithProviders(<KocHeroKart {...defaultProps} />);
    fireEvent.click(screen.getByText('Bugün giriş yok'));
    await waitFor(() => {
      expect(screen.getByText('Zeynep')).toBeDefined();
    });
  });

  it('✕ butonuyla modal kapanır', async () => {
    renderWithProviders(<KocHeroKart {...defaultProps} />);
    fireEvent.click(screen.getByText('Bugün giriş yok'));
    await waitFor(() => screen.getByText('Bugün giriş durumu'));
    fireEvent.click(screen.getByText('✕'));
    await waitFor(() => {
      expect(screen.queryByText('Bugün giriş durumu')).toBeNull();
    });
  });

  it('okunmamis = 1 iken okunmamış butona tıklanınca onSec çağrılır', () => {
    const onSec = vi.fn();
    const ogrenci = { id: 'o1', isim: 'Hasan' };
    renderWithProviders(
      <KocHeroKart
        {...defaultProps}
        toplamOkunmamis={1}
        okunmamisMap={{ o1: 1 }}
        ogrenciler={[ogrenci]}
        onSec={onSec}
      />
    );
    fireEvent.click(screen.getByText('Okunmamış mesaj'));
    expect(onSec).toHaveBeenCalledWith(ogrenci, 'mesajlar');
  });

  it('okunmamis > 1 iken onNav("mesajlar") çağrılır', () => {
    const onNav = vi.fn();
    renderWithProviders(
      <KocHeroKart
        {...defaultProps}
        toplamOkunmamis={3}
        okunmamisMap={{ o1: 2, o2: 1 }}
        ogrenciler={[
          { id: 'o1', isim: 'A' },
          { id: 'o2', isim: 'B' },
        ]}
        onNav={onNav}
      />
    );
    fireEvent.click(screen.getByText('Okunmamış mesaj'));
    expect(onNav).toHaveBeenCalledWith('mesajlar');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. useGunlukTarih hook
// ─────────────────────────────────────────────────────────────────────────────
describe('useGunlukTarih', () => {
  it('bugun YYYY-MM-DD formatında string döner', () => {
    const { result } = renderHook(() => useGunlukTarih());
    expect(result.current.bugun).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('bugunGun geçerli bir gün adı döner', () => {
    const { result } = renderHook(() => useGunlukTarih());
    const gunler = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'];
    expect(gunler).toContain(result.current.bugunGun);
  });

  it('haftaBaz YYYY-MM-DD formatında string döner', () => {
    const { result } = renderHook(() => useGunlukTarih());
    expect(result.current.haftaBaz).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('haftaBaz her zaman Pazartesi günü', () => {
    const { result } = renderHook(() => useGunlukTarih());
    const pazartesi = new Date(result.current.haftaBaz);
    // getDay(): 0=Pazar,1=Pazartesi,...
    expect(pazartesi.getDay()).toBe(1);
  });
});
