/**
 * ElsWay — Smoke Test Seti (Faz 17)
 *
 * Hedef: En kritik iş mantığı fonksiyonlarında "yanlışlıkla kırma" riskini azaltmak.
 * Firebase gerektirmeyen saf utility fonksiyonları test edilir.
 *
 * Kapsam:
 *   1. Deneme net hesabı         — netHesapla
 *   2. Çalışma streak hesabı     — calculateStreak
 *   3. Okundu/okunmamış durumu   — readState (mesaj sayaç akışı için temel)
 *   4. Sınav türü segmentasyonu  — turBelirle, turdenBransDersler
 *   5. Unread counter mantığı    — unreadCount
 */

import { describe, it, expect } from 'vitest';
import { netHesapla, verimlilikHesapla } from '../data/konular.js';
import { normalizeDateId, calculateStreak } from '../utils/ogrenciUtils.js';
import { isRead, isUnread, readPatch, unreadPatch, unreadCount } from '../utils/readState.js';
import { turBelirle, turdenBransDersler } from '../utils/sinavUtils.js';

// ─────────────────────────────────────────────
// 1. Deneme net hesabı
// ─────────────────────────────────────────────
describe('netHesapla', () => {
  it('doğru formül: d - y/4', () => {
    expect(netHesapla(40, 8)).toBe('38.00');
  });

  it('yanlış yoksa net = doğru sayısı', () => {
    expect(netHesapla(30, 0)).toBe('30.00');
  });

  it('doğru yoksa net negatif olabilir', () => {
    expect(parseFloat(netHesapla(0, 20))).toBe(-5);
  });

  it('string döndürür (toFixed)', () => {
    expect(typeof netHesapla(10, 4)).toBe('string');
  });
});

describe('verimlilikHesapla', () => {
  it('boş çalışmada 0 döner', () => {
    expect(verimlilikHesapla(0, 0, 0)).toBe(0);
  });

  it('100 üstüne çıkmaz', () => {
    expect(verimlilikHesapla(1000, 1, 100)).toBeLessThanOrEqual(100);
  });
});

// ─────────────────────────────────────────────
// 2. Çalışma streak hesabı
// ─────────────────────────────────────────────
describe('normalizeDateId', () => {
  it('YYYY-MM-DD string geçirir', () => {
    expect(normalizeDateId('2026-04-10')).toBe('2026-04-10');
  });

  it('null/undefined için null döner', () => {
    expect(normalizeDateId(null)).toBeNull();
    expect(normalizeDateId(undefined)).toBeNull();
  });

  it('geçersiz string için null döner', () => {
    expect(normalizeDateId('geçersiz-tarih')).toBeNull();
  });
});

describe('calculateStreak', () => {
  it('boş kayıt listesinde streak 0', () => {
    const sonuc = calculateStreak([]);
    expect(sonuc.current).toBe(0);
    expect(sonuc.best).toBe(0);
  });

  it('arka arkaya 3 gün streak hesaplar', () => {
    const bugun = new Date();
    const gunler = [0, 1, 2].map(n => {
      const d = new Date(bugun);
      d.setDate(d.getDate() - n);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const kayitlar = gunler.map(tarih => ({ tarih }));
    const sonuc = calculateStreak(kayitlar);
    expect(sonuc.current).toBe(3);
    expect(sonuc.best).toBeGreaterThanOrEqual(3);
  });

  it('kopuk kayıtlarda best doğru hesaplanır', () => {
    const kayitlar = [
      { tarih: '2026-01-01' },
      { tarih: '2026-01-02' },
      { tarih: '2026-01-04' }, // boşluk var
    ];
    const sonuc = calculateStreak(kayitlar);
    expect(sonuc.best).toBe(2);
  });
});

// ─────────────────────────────────────────────
// 3. Okundu/okunmamış durumu (mesaj sayaç temeli)
// ─────────────────────────────────────────────
describe('readState — isRead / isUnread', () => {
  it('readAt varsa okunmuş sayılır', () => {
    expect(isRead({ readAt: new Date() })).toBe(true);
  });

  it('okunmaZamani varsa okunmuş sayılır', () => {
    expect(isRead({ okunmaZamani: new Date() })).toBe(true);
  });

  it('okundu:true ise okunmuş sayılır', () => {
    expect(isRead({ okundu: true })).toBe(true);
  });

  it('okundu:false ise okunmamış sayılır', () => {
    expect(isUnread({ okundu: false })).toBe(true);
  });

  it('boş obje okunmamış sayılır', () => {
    expect(isUnread({})).toBe(true);
  });
});

describe('readPatch / unreadPatch', () => {
  it('readPatch okundu:true içerir', () => {
    const patch = readPatch();
    expect(patch.okundu).toBe(true);
    expect(patch.readAt).toBeInstanceOf(Date);
    expect(patch.okunmaZamani).toBeInstanceOf(Date);
  });

  it('unreadPatch okundu:false içerir', () => {
    const patch = unreadPatch();
    expect(patch.okundu).toBe(false);
    expect(patch.readAt).toBeNull();
    expect(patch.okunmaZamani).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 4. Sınav türü segmentasyonu
// ─────────────────────────────────────────────
describe('turBelirle', () => {
  it('lgs öğrencisi doğru tanınır', () => {
    expect(turBelirle('lgs')).toBe('lgs');
  });

  it('ortaokul öğrencisi doğru tanınır', () => {
    expect(turBelirle('ortaokul')).toBe('ortaokul');
  });

  it('sayisal öğrencisi yks döner', () => {
    expect(turBelirle('sayisal')).toBe('yks');
  });

  it('ea, sozel, dil yks döner', () => {
    expect(turBelirle('ea')).toBe('yks');
    expect(turBelirle('sozel')).toBe('yks');
    expect(turBelirle('dil')).toBe('yks');
  });

  it('null/undefined default yks döner', () => {
    expect(turBelirle(null)).toBe('yks');
    expect(turBelirle(undefined)).toBe('yks');
  });
});

describe('turdenBransDersler', () => {
  it('lgs sadece TYT dersleri alır', () => {
    const dersler = turdenBransDersler('lgs');
    expect(Array.isArray(dersler)).toBe(true);
    expect(dersler.length).toBeGreaterThan(0);
  });

  it('sayisal TYT + AYT_SAY birleşimini alır', () => {
    const tyt = turdenBransDersler('tyt');
    const sayisal = turdenBransDersler('sayisal');
    expect(sayisal.length).toBeGreaterThan(tyt.length);
  });

  it('farklı alanlar farklı ders setleri verir', () => {
    const sayisal = turdenBransDersler('sayisal');
    const sozel = turdenBransDersler('sozel');
    // Uzunluk veya içerik farklı olmalı
    const farkli = sayisal.length !== sozel.length || !sayisal.every((d, i) => d === sozel[i]);
    expect(farkli).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 5. Unread counter mantığı
// ─────────────────────────────────────────────
describe('unreadCount', () => {
  const mesajlar = [
    { okundu: false, gonderen: 'ogrenci' },
    { okundu: true, gonderen: 'ogrenci' },
    { okundu: false, gonderen: 'koc' },
  ];

  it('filtre olmadan tüm okunmamışları sayar', () => {
    expect(unreadCount(mesajlar)).toBe(2);
  });

  it('sadece öğrenci mesajlarını filtreler', () => {
    expect(unreadCount(mesajlar, m => m.gonderen === 'ogrenci')).toBe(1);
  });

  it('boş listede 0 döner', () => {
    expect(unreadCount([])).toBe(0);
  });

  it('sayaç negatife düşmez (tümü okunmuş)', () => {
    const hepsiOkunmus = [{ okundu: true }, { okundu: true }];
    expect(unreadCount(hepsiOkunmus)).toBe(0);
  });
});
