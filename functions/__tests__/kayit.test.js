/**
 * kayit.test.js — PayTR kayıt CF smoke + fiyat mantığı testleri
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('firebase-admin/app',       () => ({ initializeApp: vi.fn() }));
vi.mock('firebase-admin/auth',      () => ({ getAuth: vi.fn(() => ({})) }));
vi.mock('firebase-admin/messaging', () => ({ getMessaging: vi.fn(() => ({})) }));
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
        set: vi.fn(() => Promise.resolve()),
        update: vi.fn(() => Promise.resolve()),
      })),
      where: vi.fn(() => ({ get: vi.fn(() => Promise.resolve({ docs: [] })) })),
    })),
    runTransaction: vi.fn((fn) => fn({
      get:    vi.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
      update: vi.fn(), set: vi.fn(),
    })),
  })),
  FieldValue: { serverTimestamp: vi.fn(() => new Date()), increment: vi.fn((n) => n) },
  Timestamp:  { fromDate: vi.fn((d) => d), now: vi.fn(() => ({ toDate: () => new Date() })) },
}));
vi.mock('firebase-functions/v2/https', () => ({
  onCall:    (...args) => ({ _handler: typeof args[0] === 'function' ? args[0] : args[1] }),
  onRequest: (h) => ({ _handler: h }),
  HttpsError: class HttpsError extends Error {
    constructor(code, msg) { super(msg); this.code = code; }
  },
}));
vi.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule: (_o, h) => ({ _handler: h }),
}));
vi.mock('firebase-functions/v2', () => ({ setGlobalOptions: vi.fn() }));
vi.mock('agora-access-token', () => ({
  RtcTokenBuilder: { buildTokenWithUid: vi.fn(() => 'tok') },
  RtcRole: { PUBLISHER: 1 },
}));
vi.mock('iyzipay', () => {
  const M = vi.fn(() => ({}));
  M.LOCALE = { TR: 'tr' }; M.CURRENCY = { TRY: 'TRY' };
  M.PAYMENT_GROUP = { SUBSCRIPTION: 'S' }; M.PAYMENT_CHANNEL = { WEB: 'W' };
  M.BASKET_ITEM_TYPE = { VIRTUAL: 'V' };
  return { default: M };
});

let kayitModulu;
beforeAll(async () => {
  try { kayitModulu = await import('../kayit.js'); } catch { kayitModulu = null; }
});

// ── Sabit fiyat mantığı (inline — kayit.js ile senkron) ───────────────────────
const STANDART_NET    = 6000;
const ERKEN_KAYIT_NET = 5000;
const VARSAYILAN_KDV  = 20;
const ERKEN_BITIS     = new Date('2026-08-31T23:59:59+03:00');

function kdvHesapla(net, oran) { return Math.round(net * oran) / 100; }
function erkenAktif(tarih) { return tarih <= ERKEN_BITIS; }

describe('kayit.js fiyat mantığı (CF içi fonksiyon kopyası)', () => {
  it('erken kayıt döneminde 5000 TL net → 6000 TL brüt', () => {
    const tarih = new Date('2026-07-15');
    const net   = erkenAktif(tarih) ? ERKEN_KAYIT_NET : STANDART_NET;
    const kdv   = kdvHesapla(net, VARSAYILAN_KDV);
    expect(net + kdv).toBe(6000);
  });

  it('standart dönemde 6000 TL net → 7200 TL brüt', () => {
    const tarih = new Date('2026-09-15');
    const net   = erkenAktif(tarih) ? ERKEN_KAYIT_NET : STANDART_NET;
    const kdv   = kdvHesapla(net, VARSAYILAN_KDV);
    expect(net + kdv).toBe(7200);
  });

  it('2500 TL net, KDV %20 → 3000 TL brüt', () => {
    expect(kdvHesapla(2500, 20) + 2500).toBe(3000);
  });

  it('ERKEN_BITIS Ağustos 2026 son günü', () => {
    expect(ERKEN_BITIS.getFullYear()).toBe(2026);
    expect(ERKEN_BITIS.getMonth()).toBe(7);
  });
});

// ── Kupon doğrulama mantığı ───────────────────────────────────────────────────
describe('kodDogrulaSync (CF içi)', () => {
  const gecerliKod = {
    status: 'active', usedCount: 0, maxUses: 5, validUntil: null,
    allowedEmail: 'test@elsway.com', allowedPhone: '05551112233',
    monthlyNetAmount: 2500, vatRate: 20, appliesToRecurring: true,
  };

  function dogrula(kod, email, telefon) {
    if (!kod || kod.status !== 'active') return false;
    if (kod.usedCount >= kod.maxUses) return false;
    if (kod.validUntil) {
      const b = kod.validUntil.toDate ? kod.validUntil.toDate() : new Date(kod.validUntil);
      if (b < new Date()) return false;
    }
    const emailOk = kod.allowedEmail && kod.allowedEmail.toLowerCase() === (email || '').toLowerCase();
    const telOk   = kod.allowedPhone && kod.allowedPhone.replace(/\D/g,'') === (telefon||'').replace(/\D/g,'');
    return emailOk || telOk;
  }

  it('email eşleşince geçerli', () => {
    expect(dogrula(gecerliKod, 'test@elsway.com', '')).toBe(true);
  });
  it('telefon eşleşince geçerli', () => {
    expect(dogrula(gecerliKod, '', '05551112233')).toBe(true);
  });
  it('hiçbiri eşleşmiyorsa geçersiz', () => {
    expect(dogrula(gecerliKod, 'baska@mail.com', '09999')).toBe(false);
  });
  it('limit dolmuşsa geçersiz', () => {
    expect(dogrula({ ...gecerliKod, usedCount: 5 }, 'test@elsway.com', '')).toBe(false);
  });
});

// ── Export smoke ──────────────────────────────────────────────────────────────
describe('kayit.js export smoke', () => {
  it('modül yüklendi', () => { expect(kayitModulu).not.toBeNull(); });
  it('fiyatSorgula export var',  () => { expect(kayitModulu?.fiyatSorgula).toBeDefined(); });
  it('kayitBaslat export var',   () => { expect(kayitModulu?.kayitBaslat).toBeDefined(); });
  it('paytrCallback export var', () => { expect(kayitModulu?.paytrCallback).toBeDefined(); });
});
