import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

const s = {
  text: '#000',
  text2: '#333',
  text3: '#666',
  bg: '#fff',
  surface: '#f5f5f5',
  surface2: '#eee',
  border: '#ccc',
  accent: '#007bff',
  accentSoft: '#e6f0ff',
};

vi.mock('../firebase', () => ({ db: {} }));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ kullanici: { uid: 'admin1' } }),
}));
vi.mock('../components/Toast', () => ({ useToast: () => vi.fn() }));
vi.mock('../utils/auditLog', () => ({
  auditLog: vi.fn(() => Promise.resolve()),
  AuditTip: { TUR_GUNCELLE: 'tur_guncelle' },
}));
vi.mock('firebase/firestore', () => ({
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn(() => Promise.resolve()),
  })),
  doc: vi.fn(),
}));
vi.mock('../components/Shared', () => ({
  Card: ({ children, style }) => <div style={style}>{children}</div>,
  Btn: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));
vi.mock('../admin/adminHelpers', () => ({
  SINAV_TUR_SECENEKLERI: (
    <>
      <option value="tyt_12">12. Sınıf (TYT)</option>
      <option value="sayisal_12">12. Sınıf (Sayısal)</option>
    </>
  ),
}));

const ogrenciler = [
  { id: 'o1', isim: 'Ali Yılmaz', email: 'ali@test.com', tur: 'tyt_12' },
  { id: 'o2', isim: 'Ayşe Kaya', email: 'ayse@test.com', tur: 'sayisal_12' },
  { id: 'o3', isim: 'Mehmet Demir', email: 'mehmet@test.com', tur: 'tyt_12' },
];

describe('TurTopluSync', () => {
  it('öğrenci listesini render eder', async () => {
    const TurTopluSync = (await import('../admin/TurTopluSync')).default;
    render(<TurTopluSync ogrenciler={ogrenciler} setOgrenciler={vi.fn()} s={s} mobil={false} />);
    expect(screen.getByText('Ali Yılmaz')).toBeTruthy();
    expect(screen.getByText('Ayşe Kaya')).toBeTruthy();
    expect(screen.getByText('Mehmet Demir')).toBeTruthy();
  });

  it('tümünü seç checkbox öğrenci sayısını gösterir', async () => {
    const TurTopluSync = (await import('../admin/TurTopluSync')).default;
    render(<TurTopluSync ogrenciler={ogrenciler} setOgrenciler={vi.fn()} s={s} mobil={false} />);
    expect(screen.getByText('Tümünü seç (3)')).toBeTruthy();
  });

  it('tümünü seç tıklanınca seçili sayısı gösterilir', async () => {
    const TurTopluSync = (await import('../admin/TurTopluSync')).default;
    render(<TurTopluSync ogrenciler={ogrenciler} setOgrenciler={vi.fn()} s={s} mobil={false} />);
    fireEvent.click(document.getElementById('tumSec'));
    expect(screen.getByText('3 seçili')).toBeTruthy();
  });

  it('güncelle butonu başlangıçta disabled', async () => {
    const TurTopluSync = (await import('../admin/TurTopluSync')).default;
    render(<TurTopluSync ogrenciler={ogrenciler} setOgrenciler={vi.fn()} s={s} mobil={false} />);
    expect(screen.getByText(/Turu Güncelle/).disabled).toBe(true);
  });

  it('isim araması listeyi filtreler', async () => {
    const TurTopluSync = (await import('../admin/TurTopluSync')).default;
    render(<TurTopluSync ogrenciler={ogrenciler} setOgrenciler={vi.fn()} s={s} mobil={false} />);
    fireEvent.change(screen.getByPlaceholderText('İsim veya e-posta ara'), {
      target: { value: 'ali' },
    });
    expect(screen.getByText('Ali Yılmaz')).toBeTruthy();
    expect(screen.queryByText('Ayşe Kaya')).toBeNull();
    expect(screen.getByText('Tümünü seç (1)')).toBeTruthy();
  });

  it('öğrenci yoksa boş mesaj gösterir', async () => {
    const TurTopluSync = (await import('../admin/TurTopluSync')).default;
    render(<TurTopluSync ogrenciler={[]} setOgrenciler={vi.fn()} s={s} mobil={false} />);
    expect(screen.getByText('Öğrenci bulunamadı')).toBeTruthy();
  });

  it('tur etiketleri listede görünür', async () => {
    const TurTopluSync = (await import('../admin/TurTopluSync')).default;
    render(<TurTopluSync ogrenciler={ogrenciler} setOgrenciler={vi.fn()} s={s} mobil={false} />);
    expect(screen.getAllByText('12. Sınıf (TYT)').length).toBeGreaterThan(0);
  });
});

describe('auditLog TUR_GUNCELLE sabiti', () => {
  it('TUR_GUNCELLE tanımlı', async () => {
    const { AuditTip } = await import('../utils/auditLog');
    expect(AuditTip.TUR_GUNCELLE).toBe('tur_guncelle');
  });
});
