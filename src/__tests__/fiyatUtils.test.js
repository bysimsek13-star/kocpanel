import { describe, it, expect } from 'vitest';
import {
  kdvHesapla,
  erkenKayitAktifMi,
  fiyatHesapla,
  STANDART_NET,
  ERKEN_KAYIT_NET,
  VARSAYILAN_KDV,
} from '../utils/fiyatUtils';

const ERKEN = new Date('2026-07-01');
const STANDART = new Date('2026-09-15');

const ORNEK_KOD = {
  status: 'active',
  usedCount: 0,
  maxUses: 1,
  validUntil: null,
  allowedEmail: 'test@elsway.com',
  allowedPhone: '05001112233',
  monthlyNetAmount: 3000,
  vatRate: 20,
};

describe('kdvHesapla', () => {
  it('%20 KDV 6000 için 1200', () => expect(kdvHesapla(6000, 20)).toBe(1200));
  it('%20 KDV 3000 için 600', () => expect(kdvHesapla(3000, 20)).toBe(600));
  it('varsayılan oran %20', () => expect(kdvHesapla(6000)).toBe(kdvHesapla(6000, VARSAYILAN_KDV)));
});

describe('erkenKayitAktifMi', () => {
  it('Temmuz → aktif', () => expect(erkenKayitAktifMi(ERKEN)).toBe(true));
  it('Eylül → pasif', () => expect(erkenKayitAktifMi(STANDART)).toBe(false));
});

describe('fiyatHesapla — çıktı alanları', () => {
  it('kod yok, erken dönem → erken_kayit', () => {
    const f = fiyatHesapla({ simdi: ERKEN });
    expect(f.kaynak).toBe('erken_kayit');
    expect(f.net).toBe(ERKEN_KAYIT_NET);
    expect(f.brut).toBe(ERKEN_KAYIT_NET + f.kdvTutari);
    expect(f.kodGecerli).toBe(false);
    expect(f.kodSebep).toBeNull();
  });

  it('kod yok, standart dönem → standart', () => {
    const f = fiyatHesapla({ simdi: STANDART });
    expect(f.kaynak).toBe('standart');
    expect(f.net).toBe(STANDART_NET);
    expect(f.brut).toBe(7200);
    expect(f.kodGecerli).toBe(false);
  });

  it('geçerli kod + eşleşen email → ozel_kod', () => {
    const f = fiyatHesapla({ kodDoc: ORNEK_KOD, email: 'test@elsway.com', simdi: ERKEN });
    expect(f.kaynak).toBe('ozel_kod');
    expect(f.net).toBe(3000);
    expect(f.brut).toBe(3600);
    expect(f.kodGecerli).toBe(true);
    expect(f.kodSebep).toBeNull();
  });

  it('geçerli kod + eşleşen telefon → ozel_kod', () => {
    const f = fiyatHesapla({ kodDoc: ORNEK_KOD, telefon: '0500-111-22-33', simdi: ERKEN });
    expect(f.kaynak).toBe('ozel_kod');
    expect(f.kodGecerli).toBe(true);
  });

  it('geçerli kod ama email/telefon eşleşmiyor → erken_kayit + kodGecerli:false', () => {
    const f = fiyatHesapla({ kodDoc: ORNEK_KOD, email: 'yabanci@mail.com', simdi: ERKEN });
    expect(f.kaynak).toBe('erken_kayit');
    expect(f.kodGecerli).toBe(false);
    expect(f.kodSebep).toContain('kullanılamaz');
  });

  it('pasif kod → fallback fiyat, kodGecerli:false', () => {
    const f = fiyatHesapla({
      kodDoc: { ...ORNEK_KOD, status: 'inactive' },
      email: 'test@elsway.com',
      simdi: ERKEN,
    });
    expect(f.kodGecerli).toBe(false);
    expect(f.kodSebep).toContain('aktif değil');
  });

  it('limit dolmuş kod → fallback fiyat', () => {
    const f = fiyatHesapla({
      kodDoc: { ...ORNEK_KOD, usedCount: 1, maxUses: 1 },
      email: 'test@elsway.com',
      simdi: ERKEN,
    });
    expect(f.kodGecerli).toBe(false);
    expect(f.kodSebep).toContain('limit');
  });

  it('süresi dolmuş kod → fallback fiyat', () => {
    const eskiBitis = { toDate: () => new Date('2025-01-01') };
    const f = fiyatHesapla({
      kodDoc: { ...ORNEK_KOD, validUntil: eskiBitis },
      email: 'test@elsway.com',
      simdi: ERKEN,
    });
    expect(f.kodGecerli).toBe(false);
    expect(f.kodSebep).toContain('süresi');
  });
});
