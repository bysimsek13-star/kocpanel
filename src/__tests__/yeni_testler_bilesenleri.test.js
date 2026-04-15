/**
 * Yeni Testler — Bileşenler
 * Kapsam: ElsWayLogo, Shared (Avatar, Btn, Card, LoadingState, EmptyState, StatCard),
 *         ErrorBoundary, Toast
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// ─────────────────────────────────────────────────────────────────────────────
// ElsWayLogo
// ─────────────────────────────────────────────────────────────────────────────
import ElsWayLogo from '../components/ElsWayLogo';

describe('ElsWayLogo', () => {
  it('varsayılan props ile render olur', () => {
    render(<ElsWayLogo />);
    expect(screen.getByText('Els')).toBeInTheDocument();
    expect(screen.getByText('Way')).toBeInTheDocument();
  });

  it('size="hero" ile render olur', () => {
    const { container } = render(<ElsWayLogo size="hero" />);
    expect(container.querySelector('span')).toBeTruthy();
  });

  it('size="card" ile render olur', () => {
    render(<ElsWayLogo size="card" />);
    expect(screen.getByText('Els')).toBeInTheDocument();
  });

  it('size="drawer" ile render olur', () => {
    render(<ElsWayLogo size="drawer" />);
    expect(screen.getByText('Way')).toBeInTheDocument();
  });

  it('variant="onLight" ile render olur', () => {
    render(<ElsWayLogo variant="onLight" />);
    expect(screen.getByText('Els')).toBeInTheDocument();
  });

  it('özel style prop geçirilebilir', () => {
    const { container } = render(<ElsWayLogo style={{ marginTop: 10 }} />);
    expect(container.firstChild).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared bileşenleri
// ─────────────────────────────────────────────────────────────────────────────
import { Avatar, LoadingState, EmptyState, Card, StatCard, Btn } from '../components/Shared';

describe('Avatar', () => {
  it('isimden baş harfleri oluşturur', () => {
    render(<Avatar isim="Ahmet Yılmaz" renk="#5B4FE8" />);
    expect(screen.getByText('AY')).toBeInTheDocument();
  });

  it('tek kelime isimde tek harf gösterir', () => {
    render(<Avatar isim="Mehmet" renk="#5B4FE8" />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('isim yoksa tire gösterir', () => {
    render(<Avatar isim="" renk="#5B4FE8" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('null isim için tire gösterir', () => {
    render(<Avatar isim={null} renk="#5B4FE8" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('boyut prop çalışır', () => {
    const { container } = render(<Avatar isim="Test" renk="#fff" boyut={60} />);
    const div = container.firstChild;
    expect(div.style.width).toBe('60px');
    expect(div.style.height).toBe('60px');
  });

  it('en fazla 2 harf gösterir', () => {
    render(<Avatar isim="Ali Veli Mehmet" renk="#aaa" />);
    expect(screen.getByText('AV')).toBeInTheDocument();
  });
});

describe('LoadingState', () => {
  it('varsayılan mesajla render olur', () => {
    render(<LoadingState />);
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  it('özel mesajla render olur', () => {
    render(<LoadingState mesaj="Veri çekiliyor" />);
    expect(screen.getByText('Veri çekiliyor')).toBeInTheDocument();
  });

  it('saat ikonu var', () => {
    render(<LoadingState />);
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('varsayılan mesaj ve ikonla render olur', () => {
    render(<EmptyState />);
    expect(screen.getByText('Henüz veri yok')).toBeInTheDocument();
    expect(screen.getByText('📭')).toBeInTheDocument();
  });

  it('özel mesaj ve ikonla render olur', () => {
    render(<EmptyState mesaj="Kayıt bulunamadı" icon="🔍" />);
    expect(screen.getByText('Kayıt bulunamadı')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('children render eder', () => {
    render(
      <Card>
        <span>İçerik</span>
      </Card>
    );
    expect(screen.getByText('İçerik')).toBeInTheDocument();
  });

  it('onClick verilince tıklanabilir', () => {
    const tıklama = vi.fn();
    render(
      <Card onClick={tıklama}>
        <span>Tıkla</span>
      </Card>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(tıklama).toHaveBeenCalledTimes(1);
  });

  it('onClick verilmeyince role=button yok', () => {
    render(
      <Card>
        <span>Pasif</span>
      </Card>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('Enter tuşuyla da tetiklenir', () => {
    const tıklama = vi.fn();
    render(
      <Card onClick={tıklama}>
        <span>Enter test</span>
      </Card>
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(tıklama).toHaveBeenCalled();
  });

  it('özel style geçirilebilir', () => {
    const { container } = render(<Card style={{ borderRadius: 20 }}>X</Card>);
    expect(container.firstChild.style.borderRadius).toBe('20px');
  });
});

describe('StatCard', () => {
  it('label, value, icon render eder', () => {
    render(<StatCard label="Testler" value={42} icon="📊" renk="#5B4FE8" />);
    expect(screen.getByText('Testler')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('sub prop gösterilir', () => {
    render(<StatCard label="Net" value={55} icon="📈" renk="#22C55E" sub="geçen haftadan +5" />);
    expect(screen.getByText('geçen haftadan +5')).toBeInTheDocument();
  });
});

describe('Btn', () => {
  it('children render eder', () => {
    render(<Btn>Kaydet</Btn>);
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeInTheDocument();
  });

  it('onClick tetiklenir', () => {
    const fn = vi.fn();
    render(<Btn onClick={fn}>Tıkla</Btn>);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('disabled iken onClick tetiklenmez', () => {
    const fn = vi.fn();
    render(
      <Btn onClick={fn} disabled>
        Pasif
      </Btn>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('ariaLabel prop çalışır', () => {
    render(<Btn ariaLabel="kapat-btn">X</Btn>);
    expect(screen.getByLabelText('kapat-btn')).toBeInTheDocument();
  });

  it('type prop geçirilebilir', () => {
    render(<Btn type="submit">Gönder</Btn>);
    expect(screen.getByRole('button').type).toBe('submit');
  });

  it('variant="danger" ile render olur', () => {
    const { container } = render(<Btn variant="danger">Sil</Btn>);
    expect(container.querySelector('button')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ErrorBoundary
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../utils/izleme', () => ({
  logIstemciHatasi: vi.fn(),
  setIzlemeUser: vi.fn(),
  getIzlemeUser: vi.fn(),
}));

import ErrorBoundary from '../components/ErrorBoundary';

// Hata fırlatan yardımcı bileşen
function HataBileseni({ hata }) {
  if (hata) throw new Error('Test hatası');
  return <div>Normal içerik</div>;
}

describe('ErrorBoundary', () => {
  // Konsol hata çıktısını bastır
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('hata yokken children render eder', () => {
    render(
      <ErrorBoundary>
        <HataBileseni hata={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal içerik')).toBeInTheDocument();
  });

  it('hata olunca fallback UI gösterir', () => {
    render(
      <ErrorBoundary>
        <HataBileseni hata={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Bir hata oluştu')).toBeInTheDocument();
    expect(screen.getByText('Yenile')).toBeInTheDocument();
  });

  it('fallback UI "Yenile" butonu içerir', () => {
    render(
      <ErrorBoundary>
        <HataBileseni hata={true} />
      </ErrorBoundary>
    );
    const btn = screen.getByRole('button', { name: 'Yenile' });
    expect(btn).toBeInTheDocument();
  });

  it('birden fazla çocuğu sarar', () => {
    render(
      <ErrorBoundary>
        <div>Birinci</div>
        <div>İkinci</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Birinci')).toBeInTheDocument();
    expect(screen.getByText('İkinci')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────
// Not: setup.js Toast'u mock'luyor. Burada gerçek implementasyonu test ediyoruz.
vi.unmock('../components/Toast');

import { ToastProvider, useToast } from '../components/Toast';

function ToastTetikleyici({ tip = 'success' }) {
  const toast = useToast();
  return <button onClick={() => toast('Test mesajı', tip)}>Toast Göster</button>;
}

describe('ToastProvider ve useToast', () => {
  it('provider render olur', () => {
    render(
      <ToastProvider>
        <div>İçerik</div>
      </ToastProvider>
    );
    expect(screen.getByText('İçerik')).toBeInTheDocument();
  });

  it('toast tetiklenince mesaj görünür', async () => {
    render(
      <ToastProvider>
        <ToastTetikleyici />
      </ToastProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Toast Göster'));
    });
    expect(screen.getByText('Test mesajı')).toBeInTheDocument();
  });

  it('success tipi render olur', async () => {
    render(
      <ToastProvider>
        <ToastTetikleyici tip="success" />
      </ToastProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Toast Göster'));
    });
    expect(screen.getByText('Test mesajı')).toBeInTheDocument();
  });

  it('error tipi render olur', async () => {
    render(
      <ToastProvider>
        <ToastTetikleyici tip="error" />
      </ToastProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Toast Göster'));
    });
    expect(screen.getByText('Test mesajı')).toBeInTheDocument();
  });

  it('warning tipi render olur', async () => {
    render(
      <ToastProvider>
        <ToastTetikleyici tip="warning" />
      </ToastProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Toast Göster'));
    });
    expect(screen.getByText('Test mesajı')).toBeInTheDocument();
  });
});
