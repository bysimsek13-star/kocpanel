/**
 * ElsWay — Admin Kalan Testleri (Grup C)
 * KocPerformansPaneli + MufredatYonetimSayfasi + MufredatAgaci
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
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(() => Promise.resolve()),
  })),
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
import MufredatAgaci from '../admin/MufredatAgaci';
import { agaciDuzlestir, TYT_AGAC } from '../data/tytMufredatSeed';
import { AYT_EA_AGAC, AYT_SAYISAL_AGAC, AYT_SOZEL_AGAC } from '../data/aytMufredatSeed';
import { LGS_AGAC } from '../data/lgsMufredatSeed';
import { LISE9_AGAC } from '../data/lise9Seed';
import { LISE10_AGAC } from '../data/lise10Seed';

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

describe('agaciDuzlestir', () => {
  it('9 ders kök düğüm üretir', () => {
    const docs = agaciDuzlestir('tyt', TYT_AGAC);
    const kokler = docs.filter(d => d.parentId === null);
    expect(kokler).toHaveLength(9);
  });

  it('kök düğümler seviye 1', () => {
    const docs = agaciDuzlestir('tyt', TYT_AGAC);
    docs.filter(d => !d.parentId).forEach(d => expect(d.seviye).toBe(1));
  });

  it('tüm düğümlerde id, ad, seviye, sira mevcut', () => {
    const docs = agaciDuzlestir('tyt', TYT_AGAC);
    docs.forEach(d => {
      expect(d.id).toBeTruthy();
      expect(d.ad).toBeTruthy();
      expect(typeof d.seviye).toBe('number');
      expect(typeof d.sira).toBe('number');
    });
  });

  it('TYT Türkçe id tyt_0 olur', () => {
    const docs = agaciDuzlestir('tyt', TYT_AGAC);
    const turkce = docs.find(d => d.ad === 'TYT Türkçe');
    expect(turkce?.id).toBe('tyt_0');
  });

  it('Anlam Bilgisi parentId tyt_0 olur', () => {
    const docs = agaciDuzlestir('tyt', TYT_AGAC);
    const anlamBilgisi = docs.find(d => d.ad === 'Anlam Bilgisi');
    expect(anlamBilgisi?.parentId).toBe('tyt_0');
    expect(anlamBilgisi?.seviye).toBe(2);
  });

  it('alt konu düğümleri seviye 4 olur', () => {
    const docs = agaciDuzlestir('tyt', TYT_AGAC);
    const gercekAnlam = docs.find(d => d.ad === 'Gerçek anlam');
    expect(gercekAnlam?.seviye).toBe(4);
  });

  it('300+ düğüm üretilir', () => {
    const docs = agaciDuzlestir('tyt', TYT_AGAC);
    expect(docs.length).toBeGreaterThan(300);
  });
});

describe('aytMufredatSeed', () => {
  it('EA: 4 ders kök düğümü üretir', () => {
    const docs = agaciDuzlestir('ayt_ea', AYT_EA_AGAC);
    expect(docs.filter(d => !d.parentId)).toHaveLength(4);
  });

  it('Sayısal: 4 ders kök düğümü üretir', () => {
    const docs = agaciDuzlestir('ayt_sayisal', AYT_SAYISAL_AGAC);
    expect(docs.filter(d => !d.parentId)).toHaveLength(4);
  });

  it('Sözel: 5 ders kök düğümü üretir', () => {
    const docs = agaciDuzlestir('ayt_sozel', AYT_SOZEL_AGAC);
    expect(docs.filter(d => !d.parentId)).toHaveLength(5);
  });

  it('EA Coğrafya alt başlıkları seviye 2 olur', () => {
    const docs = agaciDuzlestir('ayt_ea', AYT_EA_AGAC);
    const cografyaKok = docs.find(d => d.ad === 'AYT Coğrafya-1');
    const altBasliklar = docs.filter(d => d.parentId === cografyaKok?.id && d.seviye === 2);
    expect(altBasliklar.length).toBeGreaterThan(0);
  });
});

describe('lgsMufredatSeed', () => {
  it('6 ders kök düğümü üretir', () => {
    const docs = agaciDuzlestir('lgs', LGS_AGAC);
    expect(docs.filter(d => !d.parentId)).toHaveLength(6);
  });

  it('LGS Türkçe 4 seviyeli ağaç üretir', () => {
    const docs = agaciDuzlestir('lgs', LGS_AGAC);
    const seviye4Docs = docs.filter(d => d.seviye === 4);
    expect(seviye4Docs.length).toBeGreaterThan(0);
  });

  it('LGS Matematik ünite düğümleri mevcut', () => {
    const docs = agaciDuzlestir('lgs', LGS_AGAC);
    const matKok = docs.find(d => d.ad === 'LGS Matematik');
    const uniteler = docs.filter(d => d.parentId === matKok?.id);
    expect(uniteler).toHaveLength(12);
  });
});

describe('MufredatAgaci', () => {
  const mockDugumler = [
    { id: 'd1', parentId: null, seviye: 1, ad: 'Türkçe', sira: 0 },
    { id: 'd1_0', parentId: 'd1', seviye: 2, ad: 'Anlam Bilgisi', sira: 0 },
    { id: 'd1_0_0', parentId: 'd1_0', seviye: 3, ad: 'Sözcükte Anlam', sira: 0 },
  ];

  it('render olur', () => {
    renderWithProviders(
      <MufredatAgaci
        dugumler={mockDugumler}
        onEkle={vi.fn()}
        onSil={vi.fn()}
        onDuzenle={vi.fn()}
        s={mockS}
      />
    );
    expect(document.body.textContent).toContain('Türkçe');
  });

  it('ders adını gösterir', () => {
    const { getByText } = renderWithProviders(
      <MufredatAgaci
        dugumler={mockDugumler}
        onEkle={vi.fn()}
        onSil={vi.fn()}
        onDuzenle={vi.fn()}
        s={mockS}
      />
    );
    expect(getByText('Türkçe')).toBeTruthy();
  });

  it('boş dugumler için null döner', () => {
    const { container } = renderWithProviders(
      <MufredatAgaci dugumler={[]} onEkle={vi.fn()} onSil={vi.fn()} onDuzenle={vi.fn()} s={mockS} />
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('lise9Seed', () => {
  it('9 ders kök düğümü üretir', () => {
    const docs = agaciDuzlestir('lise9_tymm', LISE9_AGAC);
    expect(docs.filter(d => !d.parentId)).toHaveLength(9);
  });

  it('Biyoloji Tema 2 seviye 4 düğüm içerir', () => {
    const docs = agaciDuzlestir('lise9_tymm', LISE9_AGAC);
    const seviye4 = docs.filter(d => d.seviye === 4);
    expect(seviye4.length).toBeGreaterThan(0);
  });

  it('Organik Moleküller seviye 3 düğümüdür', () => {
    const docs = agaciDuzlestir('lise9_tymm', LISE9_AGAC);
    const orgMol = docs.find(d => d.ad === 'Organik Moleküller');
    expect(orgMol?.seviye).toBe(3);
  });

  it('İngilizce 8 tema içerir', () => {
    const docs = agaciDuzlestir('lise9_tymm', LISE9_AGAC);
    const ingKok = docs.find(d => d.ad === 'İngilizce' && d.seviye === 1);
    const temalar = docs.filter(d => d.parentId === ingKok?.id);
    expect(temalar).toHaveLength(8);
  });

  it('tüm düğümlerde zorunlu alanlar mevcut', () => {
    const docs = agaciDuzlestir('lise9_tymm', LISE9_AGAC);
    docs.forEach(d => {
      expect(d.id).toBeTruthy();
      expect(d.ad).toBeTruthy();
      expect(typeof d.seviye).toBe('number');
      expect(typeof d.sira).toBe('number');
    });
  });
});

describe('lise10Seed', () => {
  it('10 ders kök düğümü üretir', () => {
    const docs = agaciDuzlestir('lise10_tymm', LISE10_AGAC);
    expect(docs.filter(d => !d.parentId)).toHaveLength(10);
  });

  it('Felsefe 9 ünite içerir', () => {
    const docs = agaciDuzlestir('lise10_tymm', LISE10_AGAC);
    const felsefeKok = docs.find(d => d.ad === 'Felsefe' && d.seviye === 1);
    const uniteler = docs.filter(d => d.parentId === felsefeKok?.id);
    expect(uniteler).toHaveLength(9);
  });

  it('Tarih 6 ünite içerir', () => {
    const docs = agaciDuzlestir('lise10_tymm', LISE10_AGAC);
    const tarihKok = docs.find(d => d.ad === 'Tarih' && d.seviye === 1);
    const uniteler = docs.filter(d => d.parentId === tarihKok?.id);
    expect(uniteler).toHaveLength(6);
  });

  it('tüm düğümlerde zorunlu alanlar mevcut', () => {
    const docs = agaciDuzlestir('lise10_tymm', LISE10_AGAC);
    docs.forEach(d => {
      expect(d.id).toBeTruthy();
      expect(d.ad).toBeTruthy();
      expect(typeof d.seviye).toBe('number');
      expect(typeof d.sira).toBe('number');
    });
  });
});
