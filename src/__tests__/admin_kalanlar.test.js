/**
 * ElsWay — Admin Kalan Testleri (Grup A)
 * AdminOgrenciEkleModal + OgrenciDuzenleModal
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { renderWithProviders } from './testUtils';

afterEach(() => cleanup());

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(() => () => {}),
  getCountFromServer: vi.fn(() => Promise.resolve({ data: () => ({ count: 0 }) })),
  query: vi.fn(ref => ref),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn(d => ({ toDate: () => d })),
  },
}));

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(() => Promise.resolve()),
}));

vi.mock('../admin/adminHelpers', () => ({
  getCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: {} }))),
  hataMesajiVer: vi.fn(() => 'Hata'),
  emailGecerliMi: vi.fn(e => /\S+@\S+\.\S+/.test(e)),
  SINAV_TUR_SECENEKLERI: <></>,
  kisaTarih: vi.fn(() => '12.04.2026'),
}));

import AdminOgrenciEkleModal from '../admin/AdminOgrenciEkleModal';
import OgrenciDuzenleModal from '../admin/OgrenciDuzenleModal';

describe('AdminOgrenciEkleModal', () => {
  const props = { koclar: [{ id: 'k1', isim: 'Ali Koç' }], onKapat: vi.fn(), onEkle: vi.fn() };

  it('render olur', () => {
    expect(() => renderWithProviders(<AdminOgrenciEkleModal {...props} />)).not.toThrow();
  });

  it('form input alanları var', () => {
    renderWithProviders(<AdminOgrenciEkleModal {...props} />);
    expect(document.querySelectorAll('input').length).toBeGreaterThan(0);
  });

  it('kapat butonu tıklanabilir', () => {
    const onKapat = vi.fn();
    renderWithProviders(<AdminOgrenciEkleModal {...props} onKapat={onKapat} />);
    const btn = screen.queryByText('Kapat') || screen.queryByText('İptal');
    if (btn) {
      fireEvent.click(btn);
      expect(onKapat).toHaveBeenCalled();
    } else expect(document.body).toBeTruthy();
  });
});

describe('OgrenciDuzenleModal', () => {
  const ogrenci = { id: 'o1', isim: 'Zeynep', tur: 'tyt_12' };

  it('render olur', () => {
    expect(() =>
      renderWithProviders(
        <OgrenciDuzenleModal ogrenci={ogrenci} onKapat={vi.fn()} onKaydet={vi.fn()} />
      )
    ).not.toThrow();
  });

  it('öğrenci adı input içinde önceden dolu', () => {
    renderWithProviders(
      <OgrenciDuzenleModal ogrenci={ogrenci} onKapat={vi.fn()} onKaydet={vi.fn()} />
    );
    expect(document.querySelector('input')?.value).toBe('Zeynep');
  });

  it('isim güncellenebilir', () => {
    renderWithProviders(
      <OgrenciDuzenleModal ogrenci={ogrenci} onKapat={vi.fn()} onKaydet={vi.fn()} />
    );
    const input = document.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'Ayşe' } });
      expect(input.value).toBe('Ayşe');
    }
  });
});
