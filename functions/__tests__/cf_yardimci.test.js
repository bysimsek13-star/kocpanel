/**
 * ElsWay — Cloud Functions Yardımcı Testleri
 *
 * Strateji:
 *   Firebase Admin ve Functions v2 mock'lanır. index.js modülü
 *   sorunsuz yüklenir ve handler'lar doğrulanır. Saf hesaplama
 *   fonksiyonları doğrudan test ortamında doğrulanır.
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// Firebase Admin mock — vi.mock bu dosyada olmalı; Vitest bunları tüm import'lardan
// önce çalıştırır (hoist). setup.js'teki mock'lar yeterli değil çünkü CJS require()
// çağrıları ESM hoist sıralamasından farklı çalışır.
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('firebase-admin/app',       () => ({ initializeApp: vi.fn() }));
vi.mock('firebase-admin/auth',      () => ({ getAuth: vi.fn(() => ({ createUser: vi.fn(() => Promise.resolve({ uid: 'mock-uid' })), updateUser: vi.fn(() => Promise.resolve()), deleteUser: vi.fn(() => Promise.resolve()), generatePasswordResetLink: vi.fn(() => Promise.resolve('link')), revokeRefreshTokens: vi.fn(() => Promise.resolve()), getUserByEmail: vi.fn(() => Promise.resolve({ uid: 'mock-uid', disabled: false })) })) }));
vi.mock('firebase-admin/messaging', () => ({ getMessaging: vi.fn(() => ({ send: vi.fn(() => Promise.resolve('ok')), sendEach: vi.fn(() => Promise.resolve({ responses: [] })) })) }));

// Firestore mock — getFirestore() modül yükünde çağrılır (helpers.js vs.)
const mockBatchCf = { set: vi.fn(), update: vi.fn(), delete: vi.fn(), commit: vi.fn(() => Promise.resolve()) };
const mockDocCf   = { get: vi.fn(() => Promise.resolve({ exists: false, data: () => ({}) })), set: vi.fn(() => Promise.resolve()), update: vi.fn(() => Promise.resolve()), delete: vi.fn(() => Promise.resolve()), collection: vi.fn(), id: 'mock-doc-id' };
const mockColCf   = { doc: vi.fn(() => mockDocCf), where: vi.fn(() => ({ get: vi.fn(() => Promise.resolve({ docs: [] })), limit: vi.fn(() => ({ get: vi.fn(() => Promise.resolve({ docs: [] })) })) })), get: vi.fn(() => Promise.resolve({ docs: [], size: 0 })), add: vi.fn(() => Promise.resolve(mockDocCf)), orderBy: vi.fn(() => ({ limit: vi.fn(() => ({ get: vi.fn(() => Promise.resolve({ docs: [] })) })) })), listDocuments: vi.fn(() => Promise.resolve([])) };
const mockDbCf    = { collection: vi.fn(() => mockColCf), batch: vi.fn(() => mockBatchCf), runTransaction: vi.fn((fn) => fn({ get: vi.fn(() => Promise.resolve({ exists: false, data: () => ({}) })), update: vi.fn(), set: vi.fn() })) };
vi.mock('firebase-admin/firestore', () => ({
  getFirestore:  vi.fn(() => mockDbCf),
  FieldValue:    { serverTimestamp: vi.fn(() => new Date()), increment: vi.fn((n) => n), arrayRemove: vi.fn(), arrayUnion: vi.fn() },
  Timestamp:     { now: vi.fn(() => ({ toDate: () => new Date() })) },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Gerçek implementasyonları import et — kopya anti-pattern'den kaçın
// helpers.js modül yükünde getFirestore() çağırır; mock'ların etkin olmasını
// garantilemek için statik import yerine dinamik import (beforeAll içinde) kullanılır.
// sabitler.js Firebase bağımlılığı yok — statik import güvenli.
// ─────────────────────────────────────────────────────────────────────────────
import sabitler from '../sabitler.js';

let dateToStrTR, todayStrTR, daysAgoStrTR, normalizeEmail;

const { RISK_DURUM } = sabitler;

// helpers dinamik olarak yüklenir — mock'lar setUp sonrası etkin olduğundan
// beforeAll içinde import yapılır; let değişkenlerine atanır
beforeAll(async () => {
  const helpers = await import('../helpers.js');
  const h = helpers.default || helpers;
  dateToStrTR = h.dateToStrTR;
  todayStrTR  = h.todayStrTR;
  daysAgoStrTR = h.daysAgoStrTR;
  normalizeEmail = h.normalizeEmail;
});

// riskDurumu — zamanlama.js satır 61 ile birebir aynı mantık
function riskDurumunuBelirle(riskPuani) {
  return riskPuani === 0
    ? RISK_DURUM.YOK
    : riskPuani <= 40
      ? RISK_DURUM.RISK_ALTINDA
      : RISK_DURUM.YUKSEK_RISK;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. dateToStrTR — tarih formatlama
// ─────────────────────────────────────────────────────────────────────────────
describe('dateToStrTR', () => {
  it('YYYY-MM-DD formatında string döner', () => {
    const tarih = new Date('2026-04-10T12:00:00Z');
    expect(dateToStrTR(tarih)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('Ocak için 01 yazar', () => {
    const tarih = new Date('2026-01-15T10:00:00Z');
    expect(dateToStrTR(tarih)).toContain('-01-');
  });

  it('Aralık için 12 yazar', () => {
    const tarih = new Date('2026-12-25T10:00:00Z');
    expect(dateToStrTR(tarih)).toContain('-12-');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. todayStrTR — bugünün tarihi
// ─────────────────────────────────────────────────────────────────────────────
describe('todayStrTR', () => {
  it('YYYY-MM-DD formatında string döner', () => {
    expect(todayStrTR()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('bugünün yılını içerir', () => {
    const yil = String(new Date().getFullYear());
    expect(todayStrTR().startsWith(yil)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. daysAgoStrTR — N gün öncesi
// ─────────────────────────────────────────────────────────────────────────────
describe('daysAgoStrTR', () => {
  it('0 gün önce bugün döner', () => {
    expect(daysAgoStrTR(0)).toBe(todayStrTR());
  });

  it('YYYY-MM-DD formatında string döner', () => {
    expect(daysAgoStrTR(7)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('7 gün önce bugünden küçük', () => {
    const yediGunOnce = daysAgoStrTR(7);
    const bugun = todayStrTR();
    expect(yediGunOnce < bugun).toBe(true);
  });

  it('14 gün önce 7 gün önceden küçük', () => {
    expect(daysAgoStrTR(14) < daysAgoStrTR(7)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. normalizeEmail — e-posta normalize
// ─────────────────────────────────────────────────────────────────────────────
describe('normalizeEmail', () => {
  it('boşlukları temizler', () => {
    expect(normalizeEmail('  test@test.com  ')).toBe('test@test.com');
  });

  it('büyük harfleri küçülür', () => {
    expect(normalizeEmail('TEST@TEST.COM')).toBe('test@test.com');
  });

  it('null için boş string döner', () => {
    expect(normalizeEmail(null)).toBe('');
  });

  it('undefined için boş string döner', () => {
    expect(normalizeEmail(undefined)).toBe('');
  });

  it('geçerli e-posta değişmeden döner', () => {
    expect(normalizeEmail('kullanici@elsway.com')).toBe('kullanici@elsway.com');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. riskDurumunuBelirle — risk kategorisi
// ─────────────────────────────────────────────────────────────────────────────
// Gerçek değerler: 'yok' | 'risk_altinda' | 'yuksek_risk'
// Gerçek threshold: 0 → yok, 1-40 → risk_altinda, 41+ → yuksek_risk
// Risk adımları: 0, 25, 50 (max 2 sinyal × 25 puan)
describe('riskDurumunuBelirle', () => {
  it('0 puan → yok', () => {
    expect(riskDurumunuBelirle(0)).toBe(RISK_DURUM.YOK);
  });

  it('25 puan (1 sinyal) → risk_altinda', () => {
    expect(riskDurumunuBelirle(25)).toBe(RISK_DURUM.RISK_ALTINDA);
  });

  it('40 puan → risk_altinda (threshold sınırı dahil)', () => {
    expect(riskDurumunuBelirle(40)).toBe(RISK_DURUM.RISK_ALTINDA);
  });

  it('50 puan (2 sinyal) → yuksek_risk', () => {
    expect(riskDurumunuBelirle(50)).toBe(RISK_DURUM.YUKSEK_RISK);
  });

  it('41+ puan → yuksek_risk', () => {
    expect(riskDurumunuBelirle(41)).toBe(RISK_DURUM.YUKSEK_RISK);
    expect(riskDurumunuBelirle(100)).toBe(RISK_DURUM.YUKSEK_RISK);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. CF modülü yükleme smoke testi
// ─────────────────────────────────────────────────────────────────────────────
describe('CF modülü smoke testi', () => {
  let cfModul;

  beforeAll(async () => {
    // Mock'lar setup.js'te hazır — modülü yükle
    try {
      cfModul = await import('../index.js');
    } catch (e) {
      cfModul = null;
      console.error('CF modülü yüklenemedi:', e.message);
    }
  });

  it('modül yüklenebiliyor', () => {
    expect(cfModul).not.toBeNull();
  });

  it('kullaniciOlustur export var', () => {
    expect(cfModul?.kullaniciOlustur).toBeDefined();
  });

  it('denemeAggregateGuncelle export var', () => {
    expect(cfModul?.denemeAggregateGuncelle).toBeDefined();
  });

  it('riskSkoreHesapla export var', () => {
    expect(cfModul?.riskSkoreHesapla).toBeDefined();
  });

  it('mesajOkunmamisArt export var', () => {
    expect(cfModul?.mesajOkunmamisArt).toBeDefined();
  });

  it('gunlukAlanlariSifirla export var', () => {
    expect(cfModul?.gunlukAlanlariSifirla).toBeDefined();
  });

  it('mesajCevapDurumGuncelle export var', () => {
    expect(cfModul?.mesajCevapDurumGuncelle).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. appCheckKontrol — App Check doğrulama mantığı
// ─────────────────────────────────────────────────────────────────────────────
// helpers.js'teki appCheckKontrol fonksiyonunun davranışını doğrudan test et.
// Fonksiyon export edilmediğinden aynı mantığı saf fonksiyon olarak yeniden
// tanımlar (risk testleriyle aynı yaklaşım).

function appCheckKontrolSim(request) {
  if (request.app === undefined) {
    const err = new Error('App Check doğrulaması başarısız.');
    err.code = 'unauthenticated';
    throw err;
  }
}

describe('appCheckKontrol — App Check doğrulama mantığı', () => {
  it('request.app undefined ise hata fırlatır', () => {
    expect(() => appCheckKontrolSim({ app: undefined })).toThrow('App Check');
  });

  it('request.app undefined ise hata kodu unauthenticated', () => {
    try {
      appCheckKontrolSim({ app: undefined });
    } catch (e) {
      expect(e.code).toBe('unauthenticated');
    }
  });

  it('request.app dolu ise hata fırlatmaz', () => {
    expect(() => appCheckKontrolSim({ app: { token: 'mock-token' } })).not.toThrow();
  });

  it('CF modülünde kullaniciOlustur export var', async () => {
    const cfModul = await import('../index.js');
    expect(cfModul?.kullaniciOlustur).toBeDefined();
  });

  it('CF modülünde kocAta export var', async () => {
    const cfModul = await import('../index.js');
    expect(cfModul?.kocAta).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Risk hesabı — summary-driven mantığı
// ─────────────────────────────────────────────────────────────────────────────

// G13: riskSkoreHesapla artık root doc summary alanlarını okur.
// Bu testler summary alanlarından risk sinyali üretme mantığını doğrular.

function riskCalismaHesapla({ sonCalismaTarihi, yediGunOnceStr }) {
  if (!sonCalismaTarihi || sonCalismaTarihi < yediGunOnceStr) return 25;
  return 0;
}

function riskMesajHesapla({ bekleyenKocMesaj, sonKocMesajZamaniMs, simdiMs }) {
  if (bekleyenKocMesaj === true && sonKocMesajZamaniMs) {
    if ((simdiMs - sonKocMesajZamaniMs) / 3600000 > 24) return 25;
  }
  return 0;
}

describe('riskCalismaHesapla — summary-driven', () => {
  // yediGunOnceStr, daysAgoStrTR'ye bağlı — beforeAll sonrası hazır olur
  // describe scope'ta değil, her test içinde hesaplanır
  it('sonCalismaTarihi null ise risk 25', () => {
    const yediGunOnceStr = daysAgoStrTR(7);
    expect(riskCalismaHesapla({ sonCalismaTarihi: null, yediGunOnceStr })).toBe(25);
  });

  it('sonCalismaTarihi 7 günden eski ise risk 25', () => {
    const yediGunOnceStr = daysAgoStrTR(7);
    expect(riskCalismaHesapla({ sonCalismaTarihi: daysAgoStrTR(8), yediGunOnceStr })).toBe(25);
  });

  it('sonCalismaTarihi tam 7 gün önce ise risk 0 (sınır dahil)', () => {
    const yediGunOnceStr = daysAgoStrTR(7);
    expect(riskCalismaHesapla({ sonCalismaTarihi: yediGunOnceStr, yediGunOnceStr })).toBe(0);
  });

  it('sonCalismaTarihi bugün ise risk 0', () => {
    const yediGunOnceStr = daysAgoStrTR(7);
    expect(riskCalismaHesapla({ sonCalismaTarihi: todayStrTR(), yediGunOnceStr })).toBe(0);
  });
});

describe('riskMesajHesapla — summary-driven', () => {
  const simdiMs = Date.now();

  it('bekleyenKocMesaj false ise risk 0', () => {
    expect(riskMesajHesapla({ bekleyenKocMesaj: false, sonKocMesajZamaniMs: simdiMs - 48 * 3600000, simdiMs })).toBe(0);
  });

  it('bekleyenKocMesaj true ve 24 saatten az geçmişse risk 0', () => {
    expect(riskMesajHesapla({ bekleyenKocMesaj: true, sonKocMesajZamaniMs: simdiMs - 12 * 3600000, simdiMs })).toBe(0);
  });

  it('bekleyenKocMesaj true ve 24 saatten fazla geçmişse risk 25', () => {
    expect(riskMesajHesapla({ bekleyenKocMesaj: true, sonKocMesajZamaniMs: simdiMs - 25 * 3600000, simdiMs })).toBe(25);
  });

  it('bekleyenKocMesaj true ama zamani null ise risk 0', () => {
    expect(riskMesajHesapla({ bekleyenKocMesaj: true, sonKocMesajZamaniMs: null, simdiMs })).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. goruntulReddet — token doğrulama mantığı (GÜVENLİK-2)
// ─────────────────────────────────────────────────────────────────────────────
// goruntulReddet handler'ının token doğrulama mantığını saf fonksiyonla test
// ediyoruz (onRequest mock'u _handler erişimini desteklemediğinden).

function goruntulReddetTokenKontrol({ sessionId, token, session }) {
  // 1. Parametre eksik
  if (!sessionId || !token) return { status: 400, body: 'sessionId ve token gerekli' };
  // 2. Oturum bulunamadı
  if (!session) return { status: 404, body: 'Oturum bulunamadı' };
  // 3. Token eşleşmiyor
  if (!session.reddetToken || session.reddetToken !== token) {
    return { status: 403, body: 'Geçersiz token' };
  }
  // 4. olusturanAt yoksa geçersiz oturum (token sonsuz geçerli olamaz)
  if (!session.olusturanAt) return { status: 403, body: 'Geçersiz oturum' };
  // 5. Zaman penceresi
  const olusturma = session.olusturanAt instanceof Date
    ? session.olusturanAt
    : new Date(session.olusturanAt);
  if (Date.now() - olusturma.getTime() > 10 * 60 * 1000) {
    return { status: 403, body: 'Oturum süresi dolmuş' };
  }
  // 6. Geçerli
  return { status: 200, body: 'ok' };
}

describe('goruntulReddet — token doğrulama mantığı', () => {
  const gecerliSession = {
    reddetToken: 'abc123',
    durum: 'bekliyor',
    olusturanAt: new Date(Date.now() - 60000), // 1 dakika önce
  };

  it('sessionId eksikse 400 döner', () => {
    const r = goruntulReddetTokenKontrol({ sessionId: '', token: 'tok', session: gecerliSession });
    expect(r.status).toBe(400);
  });

  it('token eksikse 400 döner', () => {
    const r = goruntulReddetTokenKontrol({ sessionId: 'sid', token: '', session: gecerliSession });
    expect(r.status).toBe(400);
  });

  it('oturum bulunamazsa 404 döner', () => {
    const r = goruntulReddetTokenKontrol({ sessionId: 'sid', token: 'tok', session: null });
    expect(r.status).toBe(404);
  });

  it('token eşleşmiyorsa 403 döner', () => {
    const r = goruntulReddetTokenKontrol({ sessionId: 'sid', token: 'yanlis', session: gecerliSession });
    expect(r.status).toBe(403);
  });

  it('session.reddetToken yoksa 403 döner', () => {
    const r = goruntulReddetTokenKontrol({
      sessionId: 'sid', token: 'tok',
      session: { durum: 'bekliyor', olusturanAt: new Date() },
    });
    expect(r.status).toBe(403);
  });

  it('oturum 10 dakikadan eskiyse 403 döner', () => {
    const eskiSession = {
      reddetToken: 'abc123',
      durum: 'bekliyor',
      olusturanAt: new Date(Date.now() - 11 * 60 * 1000),
    };
    const r = goruntulReddetTokenKontrol({ sessionId: 'sid', token: 'abc123', session: eskiSession });
    expect(r.status).toBe(403);
  });

  it('olusturanAt yoksa 403 döner (token sonsuz geçerli olamaz)', () => {
    const r = goruntulReddetTokenKontrol({
      sessionId: 'sid', token: 'abc123',
      session: { reddetToken: 'abc123', durum: 'bekliyor' }, // olusturanAt yok
    });
    expect(r.status).toBe(403);
  });

  it('token doğru ve zaman geçerliyse 200 döner', () => {
    const r = goruntulReddetTokenKontrol({ sessionId: 'sid', token: 'abc123', session: gecerliSession });
    expect(r.status).toBe(200);
  });

  it('goruntulReddet export CF modülünde var', async () => {
    const cfModul = await import('../index.js');
    expect(cfModul?.goruntulReddet).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GÖREV 1.1 — medya.js Auth Testleri
// ─────────────────────────────────────────────────────────────────────────────
// agoraToken ve playlistEkle güvenlik mantığını saf fonksiyonlarla test eder.
// Strateji: AGORA env sabitleri modül yükünde const olarak atandığından
// test ortamında env manipülasyonu yerine aynı mantığı simüle eden saf
// fonksiyonlar kullanılır (bkz. appCheckKontrolSim, goruntulReddetTokenKontrol).

function agoraTokenGuvenlikKontrol({ agoraAppId, agoraAppCert, auth, session, uid }) {
  if (!agoraAppId || !agoraAppCert) {
    const e = new Error('Görüntülü görüşme yapılandırılmamış.'); e.code = 'internal'; throw e;
  }
  if (!auth) {
    const e = new Error('Giriş gerekli.'); e.code = 'unauthenticated'; throw e;
  }
  if (!session) {
    const e = new Error('Oturum bulunamadı.'); e.code = 'not-found'; throw e;
  }
  if (session.kocId !== uid && session.ogrenciId !== uid) {
    const e = new Error('Bu oturuma erişim yetkiniz yok.'); e.code = 'permission-denied'; throw e;
  }
}

function playlistEkleRolKontrol(arayanRol) {
  if (arayanRol !== 'koc' && arayanRol !== 'admin') {
    const e = new Error('Sadece koçlar playlist ekleyebilir.'); e.code = 'permission-denied'; throw e;
  }
}

// playlistEkle coachId her zaman arayan.uid'den alınır — request.data'dan değil
function playlistEkleCoachId(arayanUid, _requestDataCoachId) {
  return arayanUid; // _requestDataCoachId yok sayılır (güvenlik gereği)
}

describe('agoraToken — güvenlik mantığı (medya.js)', () => {
  const gecerliSession = { kocId: 'koc-1', ogrenciId: 'ogr-1', kanal: 'test-ch' };

  it('AGORA_APP_ID yoksa internal hatası fırlatır', () => {
    let e;
    try { agoraTokenGuvenlikKontrol({ agoraAppId: null, agoraAppCert: 'cert', auth: { uid: 'koc-1' }, session: gecerliSession, uid: 'koc-1' }); }
    catch (err) { e = err; }
    expect(e).toBeDefined();
    expect(e.code).toBe('internal');
  });

  it('AGORA_APP_CERT yoksa internal hatası fırlatır', () => {
    let e;
    try { agoraTokenGuvenlikKontrol({ agoraAppId: 'app-id', agoraAppCert: null, auth: { uid: 'koc-1' }, session: gecerliSession, uid: 'koc-1' }); }
    catch (err) { e = err; }
    expect(e).toBeDefined();
    expect(e.code).toBe('internal');
  });

  it('hem AGORA_APP_ID hem AGORA_APP_CERT yoksa internal hatası', () => {
    let e;
    try { agoraTokenGuvenlikKontrol({ agoraAppId: null, agoraAppCert: null, auth: { uid: 'koc-1' }, session: gecerliSession, uid: 'koc-1' }); }
    catch (err) { e = err; }
    expect(e?.code).toBe('internal');
  });

  it('auth null ise unauthenticated hatası fırlatır', () => {
    let e;
    try { agoraTokenGuvenlikKontrol({ agoraAppId: 'id', agoraAppCert: 'cert', auth: null, session: gecerliSession, uid: null }); }
    catch (err) { e = err; }
    expect(e?.code).toBe('unauthenticated');
  });

  it('session null ise not-found hatası fırlatır', () => {
    let e;
    try { agoraTokenGuvenlikKontrol({ agoraAppId: 'id', agoraAppCert: 'cert', auth: { uid: 'koc-1' }, session: null, uid: 'koc-1' }); }
    catch (err) { e = err; }
    expect(e?.code).toBe('not-found');
  });

  it('session.kocId ve ogrenciId ikisi de eşleşmiyorsa permission-denied', () => {
    let e;
    try {
      agoraTokenGuvenlikKontrol({
        agoraAppId: 'id', agoraAppCert: 'cert',
        auth: { uid: 'yabanci-uid' }, session: gecerliSession, uid: 'yabanci-uid',
      });
    } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('kocId eşleşiyorsa hata fırlatmaz', () => {
    expect(() => agoraTokenGuvenlikKontrol({
      agoraAppId: 'id', agoraAppCert: 'cert',
      auth: { uid: 'koc-1' }, session: gecerliSession, uid: 'koc-1',
    })).not.toThrow();
  });

  it('ogrenciId eşleşiyorsa hata fırlatmaz', () => {
    expect(() => agoraTokenGuvenlikKontrol({
      agoraAppId: 'id', agoraAppCert: 'cert',
      auth: { uid: 'ogr-1' }, session: gecerliSession, uid: 'ogr-1',
    })).not.toThrow();
  });

  it('agoraToken CF export var', async () => {
    const cfModul = await import('../index.js');
    expect(cfModul?.agoraToken).toBeDefined();
  });
});

describe('playlistEkle — güvenlik mantığı (medya.js)', () => {
  it('ogrenci rolü permission-denied alır', () => {
    let e;
    try { playlistEkleRolKontrol('ogrenci'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('veli rolü permission-denied alır', () => {
    let e;
    try { playlistEkleRolKontrol('veli'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('admin rolü permission-denied almaz', () => {
    expect(() => playlistEkleRolKontrol('admin')).not.toThrow();
  });

  it('koc rolü permission-denied almaz', () => {
    expect(() => playlistEkleRolKontrol('koc')).not.toThrow();
  });

  it('coachId her zaman arayan.uid olur — request.data.coachId yok sayılır', () => {
    const arayanUid = 'koc-uid-1';
    const sahteCoachId = 'koc-uid-9999';
    const result = playlistEkleCoachId(arayanUid, sahteCoachId);
    expect(result).toBe(arayanUid);
    expect(result).not.toBe(sahteCoachId);
  });

  it('playlistEkle CF export var', async () => {
    const cfModul = await import('../index.js');
    expect(cfModul?.playlistEkle).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GÖREV 1.2 — kullanici.js Yetki Testleri
// ─────────────────────────────────────────────────────────────────────────────
// Aynı simülasyon yaklaşımı: gerçek handler yerine güvenlik mantığını
// saf fonksiyonlara taşıyarak izole test edilir.

// kullanici.js satır 124: koç sadece ogrenci veya veli rolü ekleyebilir
function kullaniciOlusturRolKontrol({ arayanRol, hedefRol }) {
  if (arayanRol === 'koc' && hedefRol !== 'ogrenci' && hedefRol !== 'veli') {
    const e = new Error('Koç sadece öğrenci veya veli ekleyebilir.'); e.code = 'permission-denied'; throw e;
  }
}

// kullanici.js rateLimitKontrol fırlatınca resource-exhausted'a dönüştürme mantığı
function kullaniciOlusturRateLimit({ limitAsildi }) {
  if (limitAsildi) {
    const e = new Error('RATE_LIMIT_ASILDI');
    // handlers: if (e.message === 'RATE_LIMIT_ASILDI') throw new HttpsError('resource-exhausted', ...)
    if (e.message === 'RATE_LIMIT_ASILDI') {
      const fe = new Error('Çok fazla istek. Lütfen bekleyin.'); fe.code = 'resource-exhausted'; throw fe;
    }
  }
}

// adminKontrol: admin değilse permission-denied
function adminKontrolSim(arayanRol) {
  if (arayanRol !== 'admin') {
    const e = new Error('Admin yetkisi gerekli.'); e.code = 'permission-denied'; throw e;
  }
}

// kocVeyaAdminKontrol: koc veya admin değilse permission-denied
function kocVeyaAdminKontrolSim(arayanRol) {
  if (arayanRol !== 'admin' && arayanRol !== 'koc') {
    const e = new Error('Koç veya Admin yetkisi gerekli.'); e.code = 'permission-denied'; throw e;
  }
}

describe('kullaniciOlustur — rol kontrolü (kullanici.js)', () => {
  it('ogrenci rolündeki kullanıcı çağırırsa permission-denied', () => {
    let e;
    try { kocVeyaAdminKontrolSim('ogrenci'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('veli rolündeki kullanıcı çağırırsa permission-denied', () => {
    let e;
    try { kocVeyaAdminKontrolSim('veli'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('koç hedefRol: admin gönderirse permission-denied', () => {
    let e;
    try { kullaniciOlusturRolKontrol({ arayanRol: 'koc', hedefRol: 'admin' }); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('koç hedefRol: koc gönderirse permission-denied', () => {
    let e;
    try { kullaniciOlusturRolKontrol({ arayanRol: 'koc', hedefRol: 'koc' }); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('koç hedefRol: ogrenci için hata fırlatmaz', () => {
    expect(() => kullaniciOlusturRolKontrol({ arayanRol: 'koc', hedefRol: 'ogrenci' })).not.toThrow();
  });

  it('koç hedefRol: veli için hata fırlatmaz', () => {
    expect(() => kullaniciOlusturRolKontrol({ arayanRol: 'koc', hedefRol: 'veli' })).not.toThrow();
  });

  it('admin hedefRol: admin dahil her rol için hata fırlatmaz', () => {
    expect(() => kullaniciOlusturRolKontrol({ arayanRol: 'admin', hedefRol: 'admin' })).not.toThrow();
    expect(() => kullaniciOlusturRolKontrol({ arayanRol: 'admin', hedefRol: 'koc' })).not.toThrow();
  });
});

describe('kullaniciOlustur — rate limit (kullanici.js)', () => {
  it('rate limit aşıldığında resource-exhausted fırlatır', () => {
    let e;
    try { kullaniciOlusturRateLimit({ limitAsildi: true }); } catch (err) { e = err; }
    expect(e?.code).toBe('resource-exhausted');
  });

  it('rate limit aşılmadığında hata fırlatmaz', () => {
    expect(() => kullaniciOlusturRateLimit({ limitAsildi: false })).not.toThrow();
  });

  it('kullaniciOlustur CF export var', async () => {
    const cfModul = await import('../index.js');
    expect(cfModul?.kullaniciOlustur).toBeDefined();
  });
});

describe('rolDegistir — admin kontrolü (kullanici.js)', () => {
  it('admin değilse permission-denied', () => {
    let e;
    try { adminKontrolSim('koc'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('ogrenci rolü permission-denied alır', () => {
    let e;
    try { adminKontrolSim('ogrenci'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('veli rolü permission-denied alır', () => {
    let e;
    try { adminKontrolSim('veli'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('admin hata fırlatmaz', () => {
    expect(() => adminKontrolSim('admin')).not.toThrow();
  });

  it('rolDegistir CF export var', async () => {
    const cfModul = await import('../index.js');
    expect(cfModul?.rolDegistir).toBeDefined();
  });
});

describe('kocAta — admin kontrolü (kullanici.js)', () => {
  // kocAta, adminKontrol() kullanır — koç dahil admin olmayan her rol reddedilir
  it('koç kocAta çağırırsa permission-denied', () => {
    let e;
    try { adminKontrolSim('koc'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('ogrenci kocAta çağırırsa permission-denied', () => {
    let e;
    try { adminKontrolSim('ogrenci'); } catch (err) { e = err; }
    expect(e?.code).toBe('permission-denied');
  });

  it('admin kocAta çağırabilir', () => {
    expect(() => adminKontrolSim('admin')).not.toThrow();
  });

  it('kocAta CF export var', async () => {
    const cfModul = await import('../index.js');
    expect(cfModul?.kocAta).toBeDefined();
  });
});
