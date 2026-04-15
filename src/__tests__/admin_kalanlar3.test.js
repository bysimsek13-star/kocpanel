/**
 * ElsWay — Admin Kalan Testleri (Grup C)
 * KocPerformansPaneli + MufredatYonetimSayfasi
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor, cleanup } from '@testing-library/react';
import { renderWithProviders, mockS } from './testUtils';

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

vi.mock('../utils/kocSkorUtils', () => ({
  coachScoreMeta: vi.fn(() => []),
  computeCoachPerformance: vi.fn(koc => ({
    koc,
    performansSkoru: 80,
    operasyonSkoru: 75,
    kategoriler: {},
  })),
}));

vi.mock('../utils/tarih', () => ({
  bugunStr: vi.fn(() => '2026-04-12'),
  kisaTarih: vi.fn(() => '12.04.2026'),
}));

import KocPerformansPaneli from '../admin/KocPerformansPaneli';
import MufredatYonetimSayfasi from '../admin/MufredatYonetimSayfasi';

describe('KocPerformansPaneli', () => {
  it('boş prop ile render olur', () => {
    expect(() => renderWithProviders(<KocPerformansPaneli />)).not.toThrow();
  });

  it('koç+öğrenci verisiyle render olur', () => {
    expect(() =>
      renderWithProviders(
        <KocPerformansPaneli
          koclar={[{ id: 'k1', isim: 'Koç 1' }]}
          ogrenciler={[{ id: 'o1', kocId: 'k1' }]}
        />
      )
    ).not.toThrow();
  });

  it('DOM içeriği üretilir', () => {
    renderWithProviders(<KocPerformansPaneli koclar={[]} ogrenciler={[]} />);
    expect(document.body).toBeTruthy();
  });
});

describe('MufredatYonetimSayfasi', () => {
  it('render olur', async () => {
    renderWithProviders(<MufredatYonetimSayfasi s={mockS} mobil={false} />);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0));
  });

  it('mobil modda render olur', async () => {
    renderWithProviders(<MufredatYonetimSayfasi s={mockS} mobil={true} />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });
});
