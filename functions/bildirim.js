/**
 * bildirim.js — FCM push bildirimi trigger'ı + temizlik scheduled job
 * bildirimPushGonder, eskiBildirimleriSil
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const crypto = require('crypto');

const db = getFirestore();

// ═══════════════════════════════════════════════════════
// TRIGGER — Bildirim push (FCM)
// Yeni bildirim yazıldığında alıcının cihazına push gönderir
// ═══════════════════════════════════════════════════════
exports.bildirimPushGonder = onDocumentCreated(
  { document: 'bildirimler/{docId}', region: 'europe-west1' },
  async (event) => {
    const bildirim = event.data?.data();
    if (!bildirim?.aliciId) return;
    try {
      const kulSnap = await db.collection('kullanicilar').doc(bildirim.aliciId).get();
      if (!kulSnap.exists) return;
      const { fcmToken } = kulSnap.data();
      if (!fcmToken) return;

      const dersDaveti = bildirim.tip === 'ders_daveti';

      // ders_daveti: tek kullanımlık reddetToken üret ve goruntulu doc'a yaz.
      // goruntulReddet bu token'ı doğrular → auth olmadan SW'dan çağrılabilir
      // ama token bilmeden oturumu reddetmek imkânsız hale gelir.
      let reddetToken = '';
      if (dersDaveti && bildirim.entityId) {
        reddetToken = crypto.randomBytes(16).toString('hex');
        await db.collection('goruntulu').doc(bildirim.entityId)
          .update({ reddetToken })
          .catch(() => {}); // doc yoksa sessizce geç
      }

      await getMessaging().send({
        token: fcmToken,
        notification: { title: bildirim.baslik, body: bildirim.mesaj },
        webpush: {
          fcmOptions: { link: `https://kocpaneli.web.app${bildirim.route || '/'}` },
          notification: {
            icon:              'https://kocpaneli.web.app/logo192.png',
            badge:             'https://kocpaneli.web.app/logo192.png',
            requireInteraction: dersDaveti,
            vibrate:           dersDaveti ? [200, 100, 200, 100, 200] : [100],
            tag:               dersDaveti ? 'ders-daveti' : undefined,
            renotify:          dersDaveti,
          },
        },
        data: {
          bildirimId:  event.params.docId,
          route:       bildirim.route || '/',
          tip:         bildirim.tip   || '',
          entityId:    bildirim.entityId || '',
          reddetToken,
        },
      });
    } catch (e) {
      if (e.code === 'messaging/registration-token-not-registered') {
        // Token geçersiz — temizle
        await db.collection('kullanicilar').doc(bildirim.aliciId).update({ fcmToken: null }).catch(() => {});
      } else {
        console.error('FCM push hatası:', e.message);
      }
    }
  }
);

// ═══════════════════════════════════════════════════════
// SCHEDULED — Eski bildirimleri temizle (her gece 04:00)
// 30 günden eski ve okunmuş bildirimleri siler
// ═══════════════════════════════════════════════════════
exports.eskiBildirimleriSil = onSchedule(
  { schedule: '0 4 * * *', timeZone: 'Europe/Istanbul', region: 'europe-west1' },
  async () => {
    const otuzGunOnce = new Date();
    otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);

    const snap = await db.collection('bildirimler')
      .where('olusturma', '<', otuzGunOnce)
      .where('okundu', '==', true)
      .limit(500)
      .get();

    if (snap.empty) { console.log('Silinecek eski bildirim yok.'); return; }

    let batch = db.batch();
    let count = 0;
    snap.docs.forEach(d => {
      batch.delete(d.ref);
      count++;
      if (count % 400 === 0) { batch.commit(); batch = db.batch(); }
    });
    if (count % 400 !== 0) await batch.commit();
    console.log(`${count} eski bildirim silindi.`);
  }
);
