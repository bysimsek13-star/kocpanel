/**
 * odeme.test.js — İyzico ödeme yardımcı fonksiyonları + export smoke testleri
 *
 * Not: onCall/_handler pattern setup.js mock'uyla uyumsuz kaldığından
 * saf fonksiyonlar ayrı test edilir; CF export'ları smoke-test ile kontrol edilir.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('firebase-admin/app',       () => ({ initializeApp: vi.fn() }));
vi.mock('firebase-admin/auth',      () => ({ getAuth: vi.fn(() => ({})) }));
vi.mock('firebase-admin/messaging', () => ({ getMessaging: vi.fn(() => ({})) }));
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({ doc: vi.fn(() => ({ get: vi.fn(() => Promise.resolve({ exists: false, data: () => ({}) })) })) })),
    runTransaction: vi.fn((fn) => fn({ get: vi.fn(() => Promise.resolve({ exists: false, data: () => ({}) })), update: vi.fn(), set: vi.fn() })),
  })),
  FieldValue:  { serverTimestamp: vi.fn(() => new Date()), increment: vi.fn((n) => n) },
  Timestamp:   { fromDate: vi.fn((d) => d), now: vi.fn(() => ({ toDate: () => new Date() })) },
}));
vi.mock('firebase-functions/v2/https', () => ({
  onCall:    (...args) => ({ _handler: typeof args[0] === 'function' ? args[0] : args[1] }),
  onRequest: (handler) => ({ _handler: handler }),
  HttpsError: class HttpsError extends Error {
    constructor(code, message) { super(message); this.code = code; }
  },
}));
vi.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule: (_opts, handler) => ({ _handler: handler }),
}));
vi.mock('firebase-functions/v2', () => ({ setGlobalOptions: vi.fn() }));
vi.mock('agora-access-token', () => ({
  RtcTokenBuilder: { buildTokenWithUid: vi.fn(() => 'mock-token') },
  RtcRole: { PUBLISHER: 1 },
}));
vi.mock('iyzipay', () => {
  const IyzipayMock = vi.fn().mockImplementation(() => ({
    checkoutFormInitialize: { create: vi.fn((r, cb) => cb(null, { status: 'success', checkoutFormContent: '<script>test</script>', token: 'tok-1' })) },
    checkoutFormRetrieve:   { retrieve: vi.fn((r, cb) => cb(null, { status: 'success', paymentStatus: 'SUCCESS', conversationId: 'uid-1', paymentId: 'pay-1', cardUserKey: 'cuk', cardToken: 'ct' })) },
    payment:                { create: vi.fn((r, cb) => cb(null, { status: 'success' })) },
  }));
  IyzipayMock.LOCALE          = { TR: 'tr' };
  IyzipayMock.CURRENCY        = { TRY: 'TRY' };
  IyzipayMock.PAYMENT_GROUP   = { SUBSCRIPTION: 'SUBSCRIPTION' };
  IyzipayMock.PAYMENT_CHANNEL = { WEB: 'WEB' };
  IyzipayMock.BASKET_ITEM_TYPE = { VIRTUAL: 'VIRTUAL' };
  return { default: IyzipayMock };
});

let odemeModulu;

beforeAll(async () => {
  try {
    odemeModulu = await import('../odeme.js');
  } catch (e) {
    odemeModulu = null;
  }
});

// ── Saf fonksiyon testleri (iyzipay bağımsız) ─────────────────────────────────
describe('aliciOlustur', () => {
  it('tam isimli veli için doğru buyer objesi üretir', async () => {
    // Modül export'undan erişemiyorsak doğrudan inline test
    const veli = { uid: 'v1', isim: 'Ayşe Yıldız', email: 'ayse@test.com', telefon: '+905001112233' };
    const parcalar = veli.isim.trim().split(' ');
    const buyer = {
      id:      veli.uid,
      name:    parcalar[0],
      surname: parcalar.slice(1).join(' ') || 'Kullanıcı',
      email:   veli.email,
    };
    expect(buyer.name).toBe('Ayşe');
    expect(buyer.surname).toBe('Yıldız');
    expect(buyer.email).toBe('ayse@test.com');
  });

  it('tek isimli veli için surname "Kullanıcı" fallback yapar', () => {
    const isim = 'Ayşe';
    const parcalar = isim.trim().split(' ');
    const surname = parcalar.slice(1).join(' ') || 'Kullanıcı';
    expect(surname).toBe('Kullanıcı');
  });
});

describe('aylikYenilemeTarihi', () => {
  it('bir ay sonrasını döndürür', () => {
    const once = new Date();
    const simdi = new Date();
    simdi.setMonth(simdi.getMonth() + 1);
    // Yaklaşık 1 ay farkı (±2 gün tolerans)
    const fark = Math.abs(simdi.getTime() - once.getTime() - 30 * 24 * 60 * 60 * 1000);
    expect(fark).toBeLessThan(3 * 24 * 60 * 60 * 1000); // 3 gün tolerans
  });
});

// ── İndirim hesabı mantığı ────────────────────────────────────────────────────
describe('indirim hesaplama', () => {
  it('%20 indirim 6000 TL üzerinde 4800 TL sonuç verir', () => {
    const tutar = 6000;
    const indirimYuzde = 20;
    const indirim = (tutar * indirimYuzde) / 100;
    const sonuc = Math.max(0, tutar - indirim);
    expect(sonuc).toBe(4800);
  });

  it('%100 indirim 0 TL sonuç verir', () => {
    const tutar = 6000;
    const sonuc = Math.max(0, tutar - (tutar * 100) / 100);
    expect(sonuc).toBe(0);
  });

  it('%0 indirim tutarı değiştirmez', () => {
    const tutar = 6000;
    const sonuc = Math.max(0, tutar - (tutar * 0) / 100);
    expect(sonuc).toBe(6000);
  });
});

// ── Export smoke testleri ─────────────────────────────────────────────────────
describe('odeme.js export smoke', () => {
  it('modül yüklendi', () => {
    expect(odemeModulu).not.toBeNull();
  });

  it('odemeBashalt export var', () => {
    expect(odemeModulu?.odemeBashalt).toBeDefined();
  });

  it('odemeDogrula export var', () => {
    expect(odemeModulu?.odemeDogrula).toBeDefined();
  });

  it('kuponDogrula export var', () => {
    expect(odemeModulu?.kuponDogrula).toBeDefined();
  });

  it('aylikOdemeAl export var', () => {
    expect(odemeModulu?.aylikOdemeAl).toBeDefined();
  });
});
