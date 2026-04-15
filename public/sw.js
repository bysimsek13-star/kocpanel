// Build script her deploy'da SHELL_CACHE degerini otomatik gunceller
const CHUNKS_CACHE = 'elsway-chunks';
const SHELL_CACHE  = 'elsway-v1776202254164';   // <- build script bunu gunceller (pattern: elsway-v[^']+)

const isFirebaseAPI = (url) =>
  url.includes('firestore.googleapis.com') ||
  url.includes('identitytoolkit') ||
  url.includes('firebase') ||
  url.includes('googleapis.com') ||
  url.includes('cloudfunctions.net');

// Vite chunk'lari /assets/ altinda; icerik-adresli hash icerirler (guvenle cache'lenebilir)
const isChunk = (url) => url.includes('/assets/');

const isHTML = (req) => req.headers.get('accept')?.includes('text/html');

// --- Install: shell dosyalarini cache'le (index.html HARIC) -----------------
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(c =>
      c.addAll(['/manifest.json', '/favicon.svg'])
    )
  );
  self.skipWaiting();
});

// --- Activate: eski shell cache'lerini temizle, chunk cache'i koru -----------
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== CHUNKS_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => {
      self.clients.claim();
      // Tüm açık sekmelere yeni sürüm sinyali gönder
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.postMessage({ tip: 'SW_GUNCELLENDI' }));
      });
    })
  );
});

// --- Fetch stratejileri ------------------------------------------------------
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (isFirebaseAPI(url)) return;

  // HTML -> Network-first, cevrimdisiysa cache'e bak
  // Neden: index.html her deploy'da degisir; eski surum eski chunk hash'lerini gosterir
  if (isHTML(e.request)) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const resClone = res.clone();
            caches.open(SHELL_CACHE).then(c => c.put(e.request, resClone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(r => r || caches.match('/index.html'))
        )
    );
    return;
  }

  // Vite chunk'lari (/assets/*.js, /assets/*.css) -> Cache-first
  // Icerik-adresli: URL degisince yeni hash -> eski cache asla servis edilmez
  if (isChunk(url)) {
    e.respondWith(
      caches.open(CHUNKS_CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(res => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Diger statik (manifest, favicon) -> Cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(SHELL_CACHE).then(c => c.put(e.request, resClone));
        }
        return res;
      });
    })
  );
});
