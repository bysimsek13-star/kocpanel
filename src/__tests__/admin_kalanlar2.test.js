/**
 * ElsWay — Admin Kalan Bileşen Testleri (Grup B)
 *
 * Kapsam (3 dosya):
 *   CanliOperasyonPaneli, SistemDurumuPaneli, YasamDongusuSayfasi
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor, cleanup } from '@testing-library/react';
import { renderWithProviders, mockS } from './testUtils';

afterEach(() => cleanup());

// ─── Firestore override (Timestamp.fromDate + getCountFromServer) ─────────────
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
  startAfter: vi.fn(() => ({})),
  increment: vi.fn(v => v),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn(d => ({ toDate: () => d, seconds: Math.floor(d / 1000) })),
  },
}));

vi.mock('../admin/SilmeTalepleri', () => ({
  default: () => <div data-testid="silme-talepleri">SilmeTalepleri</div>,
}));

vi.mock('../components/BildirimSistemi', () => ({
  bildirimOlustur: vi.fn(() => Promise.resolve()),
  BildirimZili: () => <button>Bildirim</button>,
  BildirimPaneli: () => <div>Panel</div>,
}));

vi.mock('../utils/adminUtils', () => ({
  destekOzetiniGetir: vi.fn(() => Promise.resolve({ son: [], bekleyen: 0, bugun: 0, cozuldu: 0 })),
  funnelYuzde: vi.fn(() => 0),
}));

vi.mock('../utils/auditLog', () => ({
  auditLog: vi.fn(() => Promise.resolve()),
  auditLogGetir: vi.fn(() => Promise.resolve([])),
  auditTipMetin: vi.fn(t => t),
  auditTipIkon: vi.fn(() => '📋'),
  AuditTip: { OGRENCI_SIL: 'ogrenci_sil', KOC_SIL: 'koc_sil' },
}));

vi.mock('../utils/izleme', () => ({
  logIstemciHatasi: vi.fn(),
}));

vi.mock('../utils/tarih', () => ({
  bugunStr: vi.fn(() => '2026-04-12'),
  kisaTarih: vi.fn(() => '12.04.2026'),
}));

vi.mock('../admin/adminHelpers', () => ({
  getCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: {} }))),
  hataMesajiVer: vi.fn(() => 'Hata'),
  kisaTarih: vi.fn(() => '12.04.2026'),
}));

import CanliOperasyonPaneli from '../admin/CanliOperasyonPaneli';
import SistemDurumuPaneli from '../admin/SistemDurumuPaneli';
import YasamDongusuSayfasi from '../admin/YasamDongusuSayfasi';

// ─── CanliOperasyonPaneli ─────────────────────────────────────────────────────
describe('CanliOperasyonPaneli', () => {
  it('render olur', async () => {
    renderWithProviders(<CanliOperasyonPaneli s={mockS} mobil={false} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });

  it('mobil modda render olur', async () => {
    renderWithProviders(<CanliOperasyonPaneli s={mockS} mobil={true} />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });
});

// ─── SistemDurumuPaneli ───────────────────────────────────────────────────────
describe('SistemDurumuPaneli', () => {
  it('render olur', async () => {
    renderWithProviders(<SistemDurumuPaneli s={mockS} mobil={false} />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('mobil modda render olur', async () => {
    renderWithProviders(<SistemDurumuPaneli s={mockS} mobil={true} />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });

  it('DOM içeriği üretilir', async () => {
    renderWithProviders(<SistemDurumuPaneli s={mockS} mobil={false} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });
});

// ─── YasamDongusuSayfasi ──────────────────────────────────────────────────────
describe('YasamDongusuSayfasi', () => {
  it('render olur', async () => {
    renderWithProviders(
      <YasamDongusuSayfasi s={mockS} mobil={false} kullanici={{ uid: 'admin1' }} />
    );
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });

  it('mobil modda render olur', async () => {
    renderWithProviders(
      <YasamDongusuSayfasi s={mockS} mobil={true} kullanici={{ uid: 'admin1' }} />
    );
    await waitFor(() => expect(document.body).toBeTruthy());
  });
});
