import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'TIMESTAMP'),
  updateDoc: vi.fn(() => Promise.resolve()),
}));
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    s: {
      surface: '#fff',
      border: '#eee',
      text: '#000',
      text2: '#555',
      bg: '#fafafa',
      surface2: '#f5f5f5',
      accent: '#5B4FE8',
    },
  }),
}));
vi.mock('../constants/uygulama', () => ({
  GUNCEL_SOZLESME_SURUMU: '2026-06',
}));

import SozlesmeOnayModal from '../components/SozlesmeOnayModal';
import { updateDoc } from 'firebase/firestore';

// OgrenciPaneli'ndeki mezun kontrolü: tur "_mezun" ile bitmiyorsa modal çıkmaz
describe('sozlesme modal gösterim koşulu (mezun mantığı)', () => {
  const SURUM = '2026-06';
  const modalGosterilmeli = userData =>
    String(userData.tur || '').endsWith('_mezun') &&
    (!userData.sozlesmeOnay || userData.sozlesmeOnay.surum !== SURUM);

  it('sayisal_mezun + onay yok → modal açılmalı', () => {
    expect(modalGosterilmeli({ tur: 'sayisal_mezun', sozlesmeOnay: null })).toBe(true);
  });

  it('tyt_mezun + eski sürüm → modal açılmalı', () => {
    expect(modalGosterilmeli({ tur: 'tyt_mezun', sozlesmeOnay: { surum: '2025-01' } })).toBe(true);
  });

  it('sayisal_mezun + güncel onay → modal açılmamalı', () => {
    expect(modalGosterilmeli({ tur: 'sayisal_mezun', sozlesmeOnay: { surum: SURUM } })).toBe(false);
  });

  it('sayisal (lise öğrencisi) → modal açılmamalı', () => {
    expect(modalGosterilmeli({ tur: 'sayisal', sozlesmeOnay: null })).toBe(false);
  });

  it('lgs (lise öğrencisi) → modal açılmamalı', () => {
    expect(modalGosterilmeli({ tur: 'lgs', sozlesmeOnay: null })).toBe(false);
  });

  it('tur boş → modal açılmamalı', () => {
    expect(modalGosterilmeli({ tur: '', sozlesmeOnay: null })).toBe(false);
  });
});

describe('SozlesmeOnayModal', () => {
  const onOnaylandi = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('modal render olur ve buton başlangıçta disabled', () => {
    render(<SozlesmeOnayModal uid="u1" onOnaylandi={onOnaylandi} />);
    expect(screen.getByText('Hizmet Sözleşmesi')).toBeTruthy();
    const btn = screen.getByRole('button', { name: /onayla ve devam/i });
    expect(btn.disabled).toBe(true);
  });

  it('yasal linkler listesi render olur', () => {
    render(<SozlesmeOnayModal uid="u1" onOnaylandi={onOnaylandi} />);
    expect(screen.getByText(/Mesafeli Satış Sözleşmesi/)).toBeTruthy();
    expect(screen.getByText(/KVKK Aydınlatma Metni/)).toBeTruthy();
    expect(screen.getByText(/Gizlilik Politikası/)).toBeTruthy();
  });

  it('kutu işaretlenince buton aktif olur', () => {
    render(<SozlesmeOnayModal uid="u1" onOnaylandi={onOnaylandi} />);
    const kutu = screen.getByRole('checkbox');
    fireEvent.click(kutu);
    const btn = screen.getByRole('button', { name: /onayla ve devam/i });
    expect(btn.disabled).toBe(false);
  });

  it('onaylama başarılı olunca onOnaylandi çağrılır', async () => {
    render(<SozlesmeOnayModal uid="u1" onOnaylandi={onOnaylandi} />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /onayla ve devam/i }));
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(onOnaylandi).toHaveBeenCalledTimes(1);
    });
  });

  it('updateDoc hata verince hata mesajı gösterilir', async () => {
    updateDoc.mockRejectedValueOnce(new Error('network error'));
    render(<SozlesmeOnayModal uid="u1" onOnaylandi={onOnaylandi} />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /onayla ve devam/i }));
    await waitFor(() => {
      expect(screen.getByText(/Kayıt sırasında hata/)).toBeTruthy();
    });
    expect(onOnaylandi).not.toHaveBeenCalled();
  });
});
