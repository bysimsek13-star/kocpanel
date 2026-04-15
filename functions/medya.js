/**
 * medya.js — YouTube playlist yönetimi + Agora RTC token + görüntülü ders reddet
 * playlistEkle, playlistYenile, agoraToken, goruntulReddet
 */

const { onCall, HttpsError, onRequest } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { arayaniBul } = require('./helpers');
const https = require('https');

const db = getFirestore();

// ─── Agora kimlik bilgileri ───────────────────────────────────────────────────
const AGORA_APP_ID   = process.env.AGORA_APP_ID;
const AGORA_APP_CERT = process.env.AGORA_APP_CERT;

// ─── YouTube yardımcı fonksiyonları ──────────────────────────────────────────

/** ISO 8601 süreyi "d:ss" veya "ss:dd" formatına çevirir */
function isoDurasyonCevir(iso) {
  if (!iso) return '';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '';
  const h = parseInt(m[1] || 0);
  const min = parseInt(m[2] || 0);
  const sn = parseInt(m[3] || 0);
  if (h > 0) return `${h}:${String(min).padStart(2,'0')}:${String(sn).padStart(2,'0')}`;
  return `${min}:${String(sn).padStart(2,'0')}`;
}

/** URL'den playlistId çıkar */
function playlistIdCikar(url) {
  if (!url) return null;
  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]+)/,
    /playlist\?list=([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** HTTPS GET → JSON */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

/** YouTube playlistItems sayfalarını çek (tüm liste) */
async function tumPlaylistItemlariniCek(playlistId, apiKey) {
  const items = [];
  let pageToken = '';
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${apiKey}`;
    const data = await fetchJSON(url);
    if (data.error) throw new Error(data.error.message);
    (data.items || []).forEach(item => {
      const sn = item.snippet;
      if (sn?.resourceId?.kind === 'youtube#video') {
        items.push({
          videoId:   sn.resourceId.videoId,
          title:     sn.title || '',
          thumbnail: sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || '',
          position:  sn.position ?? items.length,
          playlistTitle: data.items?.[0]?.snippet?.channelTitle || '',
        });
      }
    });
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return items;
}

/** Videoların süresini çek (max 50 ID / istek) */
async function sureleriCek(videoIds, apiKey) {
  const sureler = {};
  for (let i = 0; i < videoIds.length; i += 50) {
    const parca = videoIds.slice(i, i + 50).join(',');
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${parca}&key=${apiKey}`;
    const data = await fetchJSON(url);
    (data.items || []).forEach(v => {
      sureler[v.id] = isoDurasyonCevir(v.contentDetails?.duration);
    });
  }
  return sureler;
}

/** Playlist başlığını çek */
async function playlistBasligiCek(playlistId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
  const data = await fetchJSON(url);
  if (data.error) throw new Error(data.error.message);
  return data.items?.[0]?.snippet?.title || 'Playlist';
}

/** Firestore'a video batch yaz */
async function videolariFirestoreYaz(playlistRef, items, sureler) {
  const BATCH_LIMIT = 400;
  let batch = db.batch();
  let count = 0;

  for (const item of items) {
    const videoRef = playlistRef.collection('videos').doc(item.videoId);
    batch.set(videoRef, {
      videoId:   item.videoId,
      title:     item.title,
      thumbnail: item.thumbnail,
      duration:  sureler[item.videoId] || '',
      position:  item.position,
    });
    count++;
    if (count % BATCH_LIMIT === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  if (count % BATCH_LIMIT !== 0) await batch.commit();
}

// ═══════════════════════════════════════════════════════
// playlistEkle
// ═══════════════════════════════════════════════════════
exports.playlistEkle = onCall({ region: 'europe-west1' }, async (request) => {
  const arayan = await arayaniBul(request);
  if (arayan.rol !== 'koc' && arayan.rol !== 'admin') {
    throw new HttpsError('permission-denied', 'Sadece koçlar playlist ekleyebilir.');
  }

  const { url } = request.data;
  if (!url) throw new HttpsError('invalid-argument', 'URL gerekli.');

  const playlistId = playlistIdCikar(url);
  if (!playlistId) throw new HttpsError('invalid-argument', 'Geçerli bir YouTube playlist URL\'si değil.');

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new HttpsError('internal', 'YouTube API key yapılandırılmamış.');

  // Zaten var mı?
  const mevcutSnap = await db.collection('playlists')
    .where('playlistId', '==', playlistId)
    .where('coachId', '==', arayan.uid)
    .limit(1).get();

  if (!mevcutSnap.empty) {
    throw new HttpsError('already-exists', 'Bu playlist zaten eklenmiş.');
  }

  // YouTube API çağrıları
  const [baslik, items] = await Promise.all([
    playlistBasligiCek(playlistId, apiKey),
    tumPlaylistItemlariniCek(playlistId, apiKey),
  ]);

  if (items.length === 0) throw new HttpsError('not-found', 'Playlist boş veya gizli.');

  const videoIds = items.map(i => i.videoId);
  const sureler  = await sureleriCek(videoIds, apiKey);

  // Firestore'a yaz
  const playlistRef = db.collection('playlists').doc();
  await playlistRef.set({
    id:         playlistRef.id,
    playlistId,
    title:      baslik,
    coachId:    arayan.uid,
    videoCount: items.length,
    createdAt:  FieldValue.serverTimestamp(),
    updatedAt:  FieldValue.serverTimestamp(),
  });

  await videolariFirestoreYaz(playlistRef, items, sureler);

  return { success: true, docId: playlistRef.id, title: baslik, videoCount: items.length };
});

// ═══════════════════════════════════════════════════════
// playlistYenile
// ═══════════════════════════════════════════════════════
exports.playlistYenile = onCall({ region: 'europe-west1' }, async (request) => {
  const arayan = await arayaniBul(request);
  if (arayan.rol !== 'koc' && arayan.rol !== 'admin') {
    throw new HttpsError('permission-denied', 'Sadece koçlar playlist yenileyebilir.');
  }

  const { docId } = request.data;
  if (!docId) throw new HttpsError('invalid-argument', 'docId gerekli.');

  const playlistRef  = db.collection('playlists').doc(docId);
  const playlistSnap = await playlistRef.get();

  if (!playlistSnap.exists) throw new HttpsError('not-found', 'Playlist bulunamadı.');
  const playlistData = playlistSnap.data();
  if (playlistData.coachId !== arayan.uid && arayan.rol !== 'admin') {
    throw new HttpsError('permission-denied', 'Bu playlist size ait değil.');
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new HttpsError('internal', 'YouTube API key yapılandırılmamış.');

  const [baslik, items] = await Promise.all([
    playlistBasligiCek(playlistData.playlistId, apiKey),
    tumPlaylistItemlariniCek(playlistData.playlistId, apiKey),
  ]);

  const videoIds = items.map(i => i.videoId);
  const sureler  = await sureleriCek(videoIds, apiKey);

  // Mevcut videoları sil
  const eskiVideolar = await playlistRef.collection('videos').listDocuments();
  if (eskiVideolar.length > 0) {
    let batch = db.batch();
    let cnt = 0;
    for (const vRef of eskiVideolar) {
      batch.delete(vRef);
      cnt++;
      if (cnt % 400 === 0) { await batch.commit(); batch = db.batch(); }
    }
    if (cnt % 400 !== 0) await batch.commit();
  }

  // Yenilerini yaz
  await videolariFirestoreYaz(playlistRef, items, sureler);

  await playlistRef.update({
    title:      baslik,
    videoCount: items.length,
    updatedAt:  FieldValue.serverTimestamp(),
  });

  return { success: true, title: baslik, videoCount: items.length };
});

// ═══════════════════════════════════════════════════════
// AGORA RTC TOKEN
// ═══════════════════════════════════════════════════════
exports.agoraToken = onCall({ region: 'europe-west1' }, async (request) => {
  if (!AGORA_APP_ID || !AGORA_APP_CERT) {
    throw new HttpsError('internal', 'Görüntülü görüşme yapılandırılmamış.');
  }
  if (!request.auth) throw new HttpsError('unauthenticated', 'Giriş gerekli.');

  const { sessionId } = request.data;
  if (!sessionId) throw new HttpsError('invalid-argument', 'sessionId gerekli.');

  const sessionSnap = await db.collection('goruntulu').doc(sessionId).get();
  if (!sessionSnap.exists) throw new HttpsError('not-found', 'Oturum bulunamadı.');

  const session = sessionSnap.data();
  const uid = request.auth.uid;

  if (session.kocId !== uid && session.ogrenciId !== uid) {
    throw new HttpsError('permission-denied', 'Bu oturuma erişim yetkiniz yok.');
  }

  const expireTime = Math.floor(Date.now() / 1000) + 7200; // 2 saat

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERT,
    session.kanal,
    0, // string UID için 0
    RtcRole.PUBLISHER,
    expireTime,
  );

  return { token, channel: session.kanal };
});

// ═══════════════════════════════════════════════════════
// GÖRÜNTÜLÜ DERS REDDET — Service Worker bildirim aksiyonundan çağrılır
// Service Worker Firebase Auth token taşıyamadığından onRequest kalıyor.
// Güvenlik katmanları:
//   1. reddetToken — bildirimPushGonder tarafından üretilen tek kullanımlık
//      token; sadece hedef cihaza FCM üzerinden iletilir.
//   2. sessionId   — rastgele Firestore doc ID (tahmin edilemez).
//   3. 10 dakika zaman penceresi.
//   4. CORS — sadece kocpaneli.web.app.
// ═══════════════════════════════════════════════════════
exports.goruntulReddet = onRequest(
  { region: 'europe-west1', cors: ['https://kocpaneli.web.app', 'https://kocpaneli.firebaseapp.com'] },
  async (req, res) => {
    const { sessionId, token } = req.query;
    if (!sessionId || !token) {
      res.status(400).send('sessionId ve token gerekli');
      return;
    }
    try {
      const ref = db.collection('goruntulu').doc(sessionId);
      const snap = await ref.get();
      if (!snap.exists) { res.status(404).send('Oturum bulunamadı'); return; }

      const session = snap.data();

      // Token doğrulama — token yoksa veya eşleşmiyorsa reddet
      if (!session.reddetToken || session.reddetToken !== token) {
        res.status(403).send('Geçersiz token');
        return;
      }

      // Zaman penceresi: olusturanAt yoksa veya oturum 10 dakikadan eski ise reddet
      if (!session.olusturanAt) {
        res.status(403).send('Geçersiz oturum');
        return;
      }
      const olusturma = session.olusturanAt.toDate?.() ?? new Date(session.olusturanAt);
      if (Date.now() - olusturma.getTime() > 10 * 60 * 1000) {
        res.status(403).send('Oturum süresi dolmuş');
        return;
      }

      // Transaction: kontrol ile yazma arasında race condition olmasın
      await db.runTransaction(async (tx) => {
        const fresh = await tx.get(ref);
        if (!fresh.exists || fresh.data().durum !== 'bekliyor') return;
        tx.update(ref, { durum: 'reddedildi', reddetToken: null });
      });
      res.status(200).send('ok');
    } catch (e) {
      console.error('goruntulReddet hatası:', e);
      res.status(500).send('Sunucu hatası');
    }
  }
);
