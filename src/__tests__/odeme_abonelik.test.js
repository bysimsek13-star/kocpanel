/**
 * odeme_abonelik.test.js — useAbonelik hook + AbonelikDurum bileşeni testleri
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { onSnapshot } from 'firebase/firestore';
import { renderSade } from './testUtils';
import { useAbonelik } from '../hooks/useAbonelik';
import { AbonelikDurum } from '../veli/AbonelikDurum';

const MOCK_S = new Proxy({}, { get: (_, p) => (typeof p === 'string' ? '#cccccc' : undefined) });

// ── useAbonelik ───────────────────────────────────────────────────────────────
describe('useAbonelik', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uid yokken yukleniyor=false, abonelik=null döner', () => {
    const { result } = renderHook(() => useAbonelik(null));
    expect(result.current.yukleniyor).toBe(false);
    expect(result.current.abonelik).toBeNull();
  });

  it('uid varken onSnapshot dinleyici kurulur', () => {
    renderHook(() => useAbonelik('uid-1'));
    expect(onSnapshot).toHaveBeenCalledTimes(1);
  });

  it('Firestore dokümanı varsa abonelik verisi döner', async () => {
    const mockAbonelik = {
      durum: 'aktif',
      planId: 'aylik_kocluk',
      sonrakiOdeme: { toDate: () => new Date('2026-07-12') },
    };

    onSnapshot.mockImplementationOnce((_ref, cb) => {
      cb({ exists: () => true, data: () => mockAbonelik });
      return () => {};
    });

    const { result } = renderHook(() => useAbonelik('uid-aktif'));
    expect(result.current.abonelik?.durum).toBe('aktif');
    expect(result.current.yukleniyor).toBe(false);
  });

  it('Firestore dokümanı yoksa abonelik=null döner', async () => {
    onSnapshot.mockImplementationOnce((_ref, cb) => {
      cb({ exists: () => false, data: () => ({}) });
      return () => {};
    });

    const { result } = renderHook(() => useAbonelik('uid-yok'));
    expect(result.current.abonelik).toBeNull();
    expect(result.current.yukleniyor).toBe(false);
  });

  it('cleanup fonksiyonu döner (memory leak yok)', () => {
    const vazgecFn = vi.fn();
    onSnapshot.mockReturnValueOnce(vazgecFn);
    const { unmount } = renderHook(() => useAbonelik('uid-1'));
    unmount();
    expect(vazgecFn).toHaveBeenCalledTimes(1);
  });
});

// ── AbonelikDurum bileşeni ────────────────────────────────────────────────────
describe('AbonelikDurum', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abonelik yokken (null) hiçbir şey render etmez', () => {
    onSnapshot.mockImplementationOnce((_ref, cb) => {
      cb({ exists: () => false, data: () => ({}) });
      return () => {};
    });
    const { container } = renderSade(<AbonelikDurum uid="uid-1" s={MOCK_S} />);
    expect(container.firstChild).toBeNull();
  });

  it('aktif aboneliği yeşil badge ile gösterir', () => {
    const mockAbonelik = {
      durum: 'aktif',
      planId: 'aylik_kocluk',
      sonrakiOdeme: { toDate: () => new Date('2026-07-12') },
    };
    onSnapshot.mockImplementationOnce((_ref, cb) => {
      cb({ exists: () => true, data: () => mockAbonelik });
      return () => {};
    });
    renderSade(<AbonelikDurum uid="uid-1" s={MOCK_S} />);
    expect(screen.getByText('Aktif')).toBeInTheDocument();
    expect(screen.getByText('Aylık Koçluk Paketi')).toBeInTheDocument();
  });

  it('ödeme başarısız durumunda hata badge + link gösterir', () => {
    const mockAbonelik = { durum: 'odeme_basarisiz', planId: 'aylik_kocluk', sonrakiOdeme: null };
    onSnapshot.mockImplementationOnce((_ref, cb) => {
      cb({ exists: () => true, data: () => mockAbonelik });
      return () => {};
    });
    renderSade(<AbonelikDurum uid="uid-1" s={MOCK_S} />);
    expect(screen.getByText('Ödeme Başarısız')).toBeInTheDocument();
    expect(screen.getByText('Ödemeyi Tamamla →')).toBeInTheDocument();
  });

  it('pasif abonelikte "Abonelik Al" linki gösterir', () => {
    const mockAbonelik = { durum: 'pasif', planId: 'aylik_kocluk', sonrakiOdeme: null };
    onSnapshot.mockImplementationOnce((_ref, cb) => {
      cb({ exists: () => true, data: () => mockAbonelik });
      return () => {};
    });
    renderSade(<AbonelikDurum uid="uid-1" s={MOCK_S} />);
    expect(screen.getByText('Abonelik Al →')).toBeInTheDocument();
  });
});
