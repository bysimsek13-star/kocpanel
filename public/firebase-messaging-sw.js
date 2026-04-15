// Firebase Cloud Messaging service worker
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDeHco3bRefSNYsRh3L490vB_XaZ739HZw",
  authDomain: "kocpaneli.firebaseapp.com",
  projectId: "kocpaneli",
  storageBucket: "kocpaneli.firebasestorage.app",
  messagingSenderId: "12496447602",
  appId: "1:12496447602:web:175349e246c423a7d77aeb",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const route       = payload.data?.route       || '/';
  const tip         = payload.data?.tip         || '';
  const entityId    = payload.data?.entityId    || '';
  const reddetToken = payload.data?.reddetToken || '';
  const link        = 'https://kocpaneli.web.app' + route;

  const dersDaveti = tip === 'ders_daveti';

  const opts = {
    body:               body || '',
    icon:               '/logo192.png',
    badge:              '/logo192.png',
    data:               { link, tip, entityId, reddetToken },
    tag:                dersDaveti ? 'ders-daveti' : (payload.data?.bildirimId || 'elsway-bildirim'),
    renotify:           true,
    requireInteraction: dersDaveti,
    vibrate:            dersDaveti ? [200, 100, 200, 100, 200] : [100],
  };

  if (dersDaveti && entityId) {
    opts.actions = [
      { action: 'katil',  title: '✅ Katıl'  },
      { action: 'reddet', title: '❌ Reddet' },
    ];
  }

  self.registration.showNotification(title || 'ElsWay', opts);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { tip, entityId, reddetToken } = event.notification.data || {};
  const action = event.action; // 'katil' | 'reddet' | ''

  let link = event.notification.data?.link || 'https://kocpaneli.web.app';

  if (tip === 'ders_daveti' && entityId) {
    if (action === 'reddet') {
      // Reddet: arka planda Firestore güncelle, uygulama açılmasın
      event.waitUntil(
        fetch(`https://europe-west1-kocpaneli.cloudfunctions.net/goruntulReddet?sessionId=${entityId}&token=${reddetToken}`)
          .catch(() => {})
      );
      return;
    }
    // Katıl veya bildirim gövdesine tıklama
    link = `https://kocpaneli.web.app/ogrenci/home?cagri=${entityId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith('https://kocpaneli.web.app') && 'focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      return clients.openWindow(link);
    }),
  );
});
