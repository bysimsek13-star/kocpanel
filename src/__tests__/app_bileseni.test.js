/**
 * App bileşeni testleri
 *
 * Kapsam:
 *   1. Giriş yapmamış kullanıcı /giris sayfasına yönlendirilir
 *   2. AuthProvider + ThemeProvider ile render edilir (oturum açık kullanıcı panelini görür)
 *   3. ErrorBoundary bileşen hatasını yakalar
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import App from '../App';
import ErrorBoundary from '../components/ErrorBoundary';
import { useAuth } from '../context/AuthContext';

// Lazy sayfaları basit stub'larla değiştir — gerçek bundle yüklemeden test yap
vi.mock('../pages/GirisEkrani', () => ({
  default: () => <div data-testid="giris-sayfasi">Giriş</div>,
}));
vi.mock('../pages/KocPaneli', () => ({
  default: () => <div data-testid="koc-paneli">KocPaneli</div>,
}));
vi.mock('../pages/OgrenciPaneli', () => ({
  default: () => <div data-testid="ogrenci-paneli">OgrenciPaneli</div>,
}));
vi.mock('../pages/VeliPaneli', () => ({
  default: () => <div data-testid="veli-paneli">VeliPaneli</div>,
}));
vi.mock('../pages/YoneticiPaneli', () => ({
  default: () => <div data-testid="yonetici-paneli">YoneticiPaneli</div>,
}));
vi.mock('../utils/izleme', () => ({ logIstemciHatasi: vi.fn() }));

// AuthContext'i bu dosya için vi.fn() olarak tanımla — setup.js'teki plain-fn override edilir
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children,
}));

afterEach(() => cleanup());

describe('App', () => {
  beforeEach(() => {
    // Varsayılan: oturum açık koç kullanıcısı
    vi.mocked(useAuth).mockReturnValue({
      kullanici: { uid: 'test-uid' },
      rol: 'koc',
      userData: { uid: 'test-uid', isim: 'Test Kullanıcı', rol: 'koc' },
      yukleniyor: false,
      cikisYap: vi.fn(),
    });
  });

  it('giriş yapmamış kullanıcı /giris sayfasına yönlendirilir', async () => {
    vi.mocked(useAuth).mockReturnValue({
      kullanici: null,
      rol: null,
      userData: null,
      yukleniyor: false,
      cikisYap: vi.fn(),
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('giris-sayfasi')).toBeInTheDocument();
    });
  });

  it('AuthProvider ve ThemeProvider içinde render edilir, koç paneli görünür', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('koc-paneli')).toBeInTheDocument();
    });
  });
});

describe('ErrorBoundary', () => {
  it('bileşen hatası oluştuğunda hata ekranı gösterir', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function HataliComponent() {
      throw new Error('Test hatası');
    }
    render(
      <ErrorBoundary>
        <HataliComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Bir hata oluştu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yenile' })).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
