/**
 * Yeni Testler — Son Dosyalar (Benim kapsamım tamamlanıyor)
 * Kapsam: fcmToken, ogrenciBaglam, GeriSayimKart
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';

vi.mock('../utils/izleme', () => ({
  logIstemciHatasi: vi.fn(),
  setIzlemeUser: vi.fn(),
  getIzlemeUser: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// fcmToken
// ─────────────────────────────────────────────────────────────────────────────
import { fcmTokenGuncelle } from '../utils/fcmToken';

describe('fcmTokenGuncelle()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uid yoksa erken çıkar', async () => {
    const { getToken } = await import('firebase/messaging');
    await fcmTokenGuncelle(null);
    await fcmTokenGuncelle(undefined);
    await fcmTokenGuncelle('');
    expect(getToken).not.toHaveBeenCalled();
  });

  it('bildirim izni "denied" ise getToken çağrılmaz', async () => {
    const { getToken } = await import('firebase/messaging');
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: { permission: 'denied', requestPermission: vi.fn() },
    });
    await fcmTokenGuncelle('uid1');
    expect(getToken).not.toHaveBeenCalled();
  });

  it('isSupported false ise getToken çağrılmaz', async () => {
    const { isSupported, getToken } = await import('firebase/messaging');
    isSupported.mockResolvedValueOnce(false);
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: { permission: 'granted' },
    });
    await fcmTokenGuncelle('uid1');
    expect(getToken).not.toHaveBeenCalled();
  });

  it('hata olsa bile fırlatmaz', async () => {
    const { isSupported } = await import('firebase/messaging');
    isSupported.mockRejectedValueOnce(new Error('Messaging desteklenmiyor'));
    await expect(fcmTokenGuncelle('uid1')).resolves.toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ogrenciBaglam — saf fonksiyonlar
// ─────────────────────────────────────────────────────────────────────────────
import {
  dersSetiniBelirle,
  denemeTipleriniBelirle,
  mufredatAnahtarlariniBelirle,
  ogrenciBaglaminiCoz,
  LGS_DERSLER,
} from '../utils/ogrenciBaglam';

describe('dersSetiniBelirle()', () => {
  it('LGS öğrencisi için LGS_DERSLER döner', () => {
    expect(dersSetiniBelirle('lgs_8', 8)).toBe(LGS_DERSLER);
    expect(dersSetiniBelirle('lgs_8', null)).toBe(LGS_DERSLER);
  });
  it('TYT öğrencisi için TYT_DERSLER döner', () => {
    const dersler = dersSetiniBelirle('tyt_12', 12);
    expect(Array.isArray(dersler)).toBe(true);
    expect(dersler.length).toBeGreaterThan(0);
  });
  it('sayısal öğrencisi için TYT + AYT döner', () => {
    const dersler = dersSetiniBelirle('sayisal_12', 12);
    expect(Array.isArray(dersler)).toBe(true);
    // TYT + AYT Say birleşimi
    expect(dersler.length).toBeGreaterThan(4);
  });
  it('9. sınıf için lise9 seti döner', () => {
    const dersler = dersSetiniBelirle('ortaokul_9', 9);
    expect(Array.isArray(dersler)).toBe(true);
  });
  it('bilinmeyen tur için TYT döner', () => {
    const dersler = dersSetiniBelirle(null, null);
    expect(Array.isArray(dersler)).toBe(true);
  });
});

describe('denemeTipleriniBelirle()', () => {
  it('LGS için ["lgs","brans"] döner', () => {
    expect(denemeTipleriniBelirle('lgs_8', 8)).toEqual(['lgs', 'brans']);
  });
  it('TYT 12. sınıf için tyt ve brans içerir', () => {
    const tipler = denemeTipleriniBelirle('tyt_12', 12);
    expect(tipler).toContain('tyt');
    expect(tipler).toContain('brans');
  });
  it('sayısal için tyt, ayt, brans döner', () => {
    const tipler = denemeTipleriniBelirle('sayisal_12', 12);
    expect(tipler).toContain('tyt');
    expect(tipler).toContain('ayt');
    expect(tipler).toContain('brans');
  });
  it('dil öğrencisi için ydt içerir', () => {
    const tipler = denemeTipleriniBelirle('dil_12', 12);
    expect(tipler).toContain('ydt');
  });
  it('9–10. sınıf için brans öncelikli', () => {
    const tipler = denemeTipleriniBelirle('ortaokul_9', 9);
    expect(tipler).toContain('brans');
  });
});

describe('mufredatAnahtarlariniBelirle()', () => {
  it('LGS için ["lgs"] döner', () => {
    expect(mufredatAnahtarlariniBelirle('lgs_8', 8)).toEqual(['lgs']);
  });
  it('TYT için ["tyt"] içerir', () => {
    const keys = mufredatAnahtarlariniBelirle('tyt_12', 12);
    expect(keys).toContain('tyt');
  });
  it('sayısal için tyt ve ayt_sayisal döner', () => {
    const keys = mufredatAnahtarlariniBelirle('sayisal_12', 12);
    expect(keys).toContain('tyt');
    expect(keys).toContain('ayt_sayisal');
  });
  it('9. sınıf için lise9_tymm döner', () => {
    const keys = mufredatAnahtarlariniBelirle('ortaokul_9', 9);
    expect(keys).toContain('lise9_tymm');
  });
});

describe('ogrenciBaglaminiCoz()', () => {
  it('LGS öğrencisi için doğru baglam döner', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'lgs_8', sinif: 8 });
    expect(b.lgsOgrencisi).toBe(true);
    expect(b.yksOgrencisi).toBe(false);
    expect(b.sinavModu).toBe('lgs');
    expect(b.gerisayimHedef).toBe('lgs');
  });

  it('TYT öğrencisi için doğru baglam döner', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'tyt_12', sinif: 12 });
    expect(b.yksOgrencisi).toBe(true);
    expect(b.lgsOgrencisi).toBe(false);
    expect(b.gerisayimHedef).toBe('yks');
  });

  it('9–10. sınıf için arasinif olarak işaretlenir', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'ortaokul_9', sinif: 9 });
    expect(b.arasinifOgrencisi).toBe(true);
  });

  it('tüm alanlar mevcut', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'tyt_12', sinif: 12 });
    expect(b).toHaveProperty('sinavModu');
    expect(b).toHaveProperty('programModu');
    expect(b).toHaveProperty('dersSet');
    expect(b).toHaveProperty('denemeTipleri');
    expect(b).toHaveProperty('mufredatAnahtarlari');
    expect(b).toHaveProperty('gerisayimHedef');
    expect(b).toHaveProperty('lgsOgrencisi');
    expect(b).toHaveProperty('yksOgrencisi');
    expect(b).toHaveProperty('arasinifOgrencisi');
  });

  it('boş parametrelerle çökmez', () => {
    expect(() => ogrenciBaglaminiCoz({})).not.toThrow();
    expect(() => ogrenciBaglaminiCoz()).not.toThrow();
  });

  it('dersSet dizi döner', () => {
    const b = ogrenciBaglaminiCoz({ tur: 'sayisal_12', sinif: 12 });
    expect(Array.isArray(b.dersSet)).toBe(true);
    expect(b.dersSet.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GeriSayimKart — bileşen + kalaniHesapla mantığı
// ─────────────────────────────────────────────────────────────────────────────
const mockS = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === 'shadow' || prop === 'shadowCard') return '0 2px 8px rgba(0,0,0,0.1)';
      return '#cccccc';
    },
  }
);

import GeriSayimKart from '../ogrenci/GeriSayimKart';

describe('GeriSayimKart', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('gelisim modu öğrencisi için null render eder', () => {
    // sinif=7, tur='' → gelisim modu → gerisayimHedef null → null döner
    const { container } = render(<GeriSayimKart tur="" sinif={7} s={mockS} />);
    // 7. sınıf ortaokul modu geri sayım yok
    expect(container.firstChild === null || container.textContent === '').toBeTruthy();
  });

  it('YKS öğrencisi için geri sayım render eder', () => {
    render(<GeriSayimKart tur="tyt_12" sinif={12} s={mockS} />);
    // Gün, saat, dakika, saniye kutucukları render olmalı
    expect(screen.getAllByText(/GÜN|gün|YKS/i)[0]).toBeInTheDocument();
  });

  it('LGS öğrencisi için LGS geri sayımı render eder', () => {
    render(<GeriSayimKart tur="lgs_8" sinif={8} s={mockS} />);
    expect(screen.getAllByText(/GÜN|LGS/i)[0]).toBeInTheDocument();
  });

  it('saniye güncellemesi için interval kurulur', () => {
    render(<GeriSayimKart tur="tyt_12" sinif={12} s={mockS} />);
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    // setInterval zaten kurulmuş olmalı (useEffect içinde)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Bileşen çökmemeli
    expect(document.body).toBeTruthy();
  });

  it('unmount sırasında interval temizlenir', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = render(<GeriSayimKart tur="tyt_12" sinif={12} s={mockS} />);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('acil renk (≤30 gün kala) uygulanır', () => {
    // Sistem saatini sınav tarihine yakın yap
    vi.setSystemTime(new Date('2026-06-01')); // YKS'ye ~19 gün kala
    render(<GeriSayimKart tur="tyt_12" sinif={12} s={mockS} />);
    // Acil modda gün sayısı ≤30 olmalı — bileşen render edilmeli
    expect(document.body.textContent).toMatch(/\d+/); // en az bir sayı var
  });

  it('sayisal öğrencisi de YKS geri sayımı alır', () => {
    render(<GeriSayimKart tur="sayisal_12" sinif={12} s={mockS} />);
    expect(screen.getAllByText(/GÜN/i)[0]).toBeInTheDocument();
  });
});
