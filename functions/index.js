/**
 * ElsWay — Cloud Functions — Giriş Noktası
 *
 * Bu dosya sadece başlatma ve re-export yapar.
 * Gerçek fonksiyon kodları ayrı modüllerde:
 *   kullanici.js — Kullanıcı yönetimi (emailKontrol, kullaniciOlustur, ...)
 *   aggregate.js — Firestore trigger aggregate'ler
 *   mesaj.js     — Mesaj okundu/okunmamış sayaçları
 *   bildirim.js  — FCM push + temizlik
 *   zamanlama.js — Scheduled jobs (risk skoru, günlük sıfırlama)
 *   medya.js     — YouTube playlist + Agora token + görüntülü reddet
 *   helpers.js   — Paylaşılan yardımcılar (import edilmez, alt modüller kullanır)
 *
 * Deploy: firebase deploy --only functions
 */

const { initializeApp } = require('firebase-admin/app');
const { setGlobalOptions } = require('firebase-functions/v2');

initializeApp();
setGlobalOptions({ region: 'europe-west1' });

// Alt modülleri yükle ve tüm export'ları bu dosyadan yayınla
Object.assign(exports, require('./kullanici'));
Object.assign(exports, require('./aggregate'));
Object.assign(exports, require('./mesaj'));
Object.assign(exports, require('./bildirim'));
Object.assign(exports, require('./zamanlama'));
Object.assign(exports, require('./medya'));
