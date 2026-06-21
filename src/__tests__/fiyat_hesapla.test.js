/**
 * fiyat_hesapla.test.js — Fiyat hesaplama utility testleri
 */
import { describe, it, expect } from 'vitest';
import {
  kdvHesapla,
  brutHesapla,
  erkenKayitAktifMi,
  kodDogrula,
  fiyatHesapla,
  STANDART_NET,
  ERKEN_KAYIT_NET,
  VARSAYILAN_KDV,
  ERKEN_KAYIT_BITIS,
} from '../utils/fiyatHesapla';

// ── kdvHesapla ────────────────────────────────────────────────────────────────
describe('kdvHesapla', () => {
  it('%20 KDV 6000 için 1200 döner', () => {
    expect(kdvHesapla(6000, 20)).toBe(1200);
  });
  it('%20 KDV 5000 için 1000 döner', () => {
    expect(kdvHesapla(5000, 20)).toBe(1000);
  });
  it('%20 KDV 3000 için 600 döner', () => {
    expect(kdvHesapla(3000, 20)).toBe(600);
  });
  it('varsayılan KDV oranı %20 dir', () => {
    expect(kdvHesapla(6000)).toBe(kdvHesapla(6000, VARSAYILAN_KDV));
  });
});

// ── brutHesapla ───────────────────────────────────────────────────────────────
describe('brutHesapla', () => {
  it('6000 net → 7200 brüt', () => {
    expect(brutHesapla(6000)).toBe(7200);
  });
  it('5000 net → 6000 brüt', () => {
    expect(brutHesapla(5000)).toBe(6000);
  });
  it('3000 net → 3600 brüt', () => {
    expect(brutHesapla(3000)).toBe(3600);
  });
});

// ── erkenKayitAktifMi ─────────────────────────────────────────────────────────
describe('erkenKayitAktifMi', () => {
  it('Ağustos öncesi tarih → aktif', () => {
    expect(erkenKayitAktifMi(new Date('2026-07-01'))).toBe(true);
  });
  it('31 Ağustos son günü → aktif', () => {
    expect(erkenKayitAktifMi(new Date('2026-08-31T23:59:58+03:00'))).toBe(true);
  });
  it('1 Eylül → pasif', () => {
    expect(erkenKayitAktifMi(new Date('2026-09-01'))).toBe(false);
  });
  it('ERKEN_KAYIT_BITIS sabitiyle sınır doğru', () => {
    expect(ERKEN_KAYIT_BITIS.getFullYear()).toBe(2026);
    expect(ERKEN_KAYIT_BITIS.getMonth()).toBe(7); // 0-indexed → Ağustos
  });
});

// ── kodDogrula ────────────────────────────────────────────────────────────────
const ORNEK_KOD = {
  status: 'active',
  usedCount: 0,
  maxUses: 1,
  validUntil: null,
  allowedEmail: 'nehir@test.com',
  allowedPhone: '05001112233',
  monthlyNetAmount: 3000,
  vatRate: 20,
  appliesToRecurring: true,
};

describe('kodDogrula', () => {
  it('doğru email ile geçerli', () => {
    expect(kodDogrula(ORNEK_KOD, 'nehir@test.com', '').gecerli).toBe(true);
  });
  it('doğru telefon ile geçerli', () => {
    expect(kodDogrula(ORNEK_KOD, 'baska@email.com', '05001112233').gecerli).toBe(true);
  });
  it('yanlış email ve telefon → geçersiz', () => {
    const { gecerli, hata } = kodDogrula(ORNEK_KOD, 'baska@email.com', '09999999999');
    expect(gecerli).toBe(false);
    expect(hata).toContain('kullanılamaz');
  });
  it('pasif kod → geçersiz', () => {
    const { gecerli } = kodDogrula({ ...ORNEK_KOD, status: 'inactive' }, 'nehir@test.com', '');
    expect(gecerli).toBe(false);
  });
  it('limit dolmuş kod → geçersiz', () => {
    const { gecerli } = kodDogrula(
      { ...ORNEK_KOD, usedCount: 1, maxUses: 1 },
      'nehir@test.com',
      ''
    );
    expect(gecerli).toBe(false);
  });
  it('süresi dolmuş kod → geçersiz', () => {
    const eskiTarih = { toDate: () => new Date('2025-01-01') };
    const { gecerli } = kodDogrula({ ...ORNEK_KOD, validUntil: eskiTarih }, 'nehir@test.com', '');
    expect(gecerli).toBe(false);
  });
  it('null kod → geçersiz', () => {
    expect(kodDogrula(null, 'a@b.com', '').gecerli).toBe(false);
  });
  it('email büyük/küçük harf farketmez', () => {
    expect(kodDogrula(ORNEK_KOD, 'NEHIR@TEST.COM', '').gecerli).toBe(true);
  });
  it('telefon tire/boşluk temizlenerek karşılaştırılır', () => {
    expect(kodDogrula(ORNEK_KOD, '', '0500-111-22-33').gecerli).toBe(true);
  });
});

// ── fiyatHesapla — öncelik sırası ────────────────────────────────────────────
describe('fiyatHesapla', () => {
  const ERKEN_TARIH = new Date('2026-07-01');
  const STANDART_TAR = new Date('2026-09-15');

  it('özel kod varsa ve eşleşiyorsa → ozel_kod fiyatı', () => {
    const f = fiyatHesapla({ ozelKod: ORNEK_KOD, email: 'nehir@test.com', simdi: ERKEN_TARIH });
    expect(f.fiyatTuru).toBe('ozel_kod');
    expect(f.netFiyat).toBe(3000);
    expect(f.brutFiyat).toBe(3600);
    expect(f.kuponKodu).toBe(undefined); // code field not set in ORNEK_KOD
  });
  it('özel kod eşleşmezse erken kayıt döneminde → erken_kayit', () => {
    const f = fiyatHesapla({ ozelKod: ORNEK_KOD, email: 'baska@mail.com', simdi: ERKEN_TARIH });
    expect(f.fiyatTuru).toBe('erken_kayit');
    expect(f.netFiyat).toBe(ERKEN_KAYIT_NET);
    expect(f.brutFiyat).toBe(6000);
  });
  it('erken kayıt döneminde kod yoksa → erken_kayit', () => {
    const f = fiyatHesapla({ simdi: ERKEN_TARIH });
    expect(f.fiyatTuru).toBe('erken_kayit');
    expect(f.netFiyat).toBe(5000);
  });
  it('erken kayıt bitti, kod yoksa → standart', () => {
    const f = fiyatHesapla({ simdi: STANDART_TAR });
    expect(f.fiyatTuru).toBe('standart');
    expect(f.netFiyat).toBe(STANDART_NET);
    expect(f.brutFiyat).toBe(7200);
  });
  it('standart KDV doğru', () => {
    const f = fiyatHesapla({ simdi: STANDART_TAR });
    expect(f.kdvTutari).toBe(1200);
    expect(f.kdvOrani).toBe(20);
  });
  it('ozel_kod sürekli abonelik işaretlenmiş', () => {
    const f = fiyatHesapla({ ozelKod: ORNEK_KOD, email: 'nehir@test.com', simdi: ERKEN_TARIH });
    expect(f.surekliMi).toBe(true);
  });
});
