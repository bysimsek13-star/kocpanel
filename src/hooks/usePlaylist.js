import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase';

const VIDEO_PER_PAGE = 15;

// ─── Koçun playlist listesi ───────────────────────────────────────────────────
export function usePlaylistler(kocId) {
  const [playlistler, setPlaylistler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const yukle = useCallback(async () => {
    if (!kocId) return;
    setYukleniyor(true);
    try {
      const q = query(
        collection(db, 'playlists'),
        where('coachId', '==', kocId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setPlaylistler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('usePlaylistler:', e);
    }
    setYukleniyor(false);
  }, [kocId]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  return { playlistler, yukleniyor, yenile: yukle };
}

// ─── Playlist videoları — sayfalı ────────────────────────────────────────────
export function usePlaylistVideolar(playlistDocId) {
  const [videolar, setVideolar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [daha, setDaha] = useState(false);
  const cursorRef = useRef(null); // stale closure olmaması için ref

  const yukle = useCallback(
    async (sifirla = true) => {
      if (!playlistDocId) return;
      setYukleniyor(true);
      try {
        let q = query(
          collection(db, 'playlists', playlistDocId, 'videos'),
          orderBy('position'),
          limit(VIDEO_PER_PAGE)
        );
        if (!sifirla && cursorRef.current) q = query(q, startAfter(cursorRef.current));

        const snap = await getDocs(q);
        const yeni = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        setVideolar(prev => (sifirla ? yeni : [...prev, ...yeni]));
        cursorRef.current = snap.docs[snap.docs.length - 1] || null;
        setDaha(snap.docs.length === VIDEO_PER_PAGE);
      } catch (e) {
        console.error('usePlaylistVideolar:', e);
      }
      setYukleniyor(false);
    },
    [playlistDocId]
  );

  useEffect(() => {
    cursorRef.current = null;
    yukle(true);
  }, [yukle]);

  const dahaYukle = useCallback(() => yukle(false), [yukle]);

  return { videolar, yukleniyor, daha, dahaYukle };
}

// ─── Kullanıcı izleme durumu ─────────────────────────────────────────────────
export function useIzlemeDurumu(userId, playlistDocId) {
  const [izlenenler, setIzlenenler] = useState({}); // { videoId: watchedAt }
  const [yukleniyor, setYukleniyor] = useState(true);

  const yukle = useCallback(async () => {
    if (!userId || !playlistDocId) return;
    setYukleniyor(true);
    try {
      const q = query(
        collection(db, 'userProgress'),
        where('userId', '==', userId),
        where('playlistDocId', '==', playlistDocId),
        where('watched', '==', true)
      );
      const snap = await getDocs(q);
      const map = {};
      snap.docs.forEach(d => {
        const { videoId, watchedAt } = d.data();
        map[videoId] = watchedAt;
      });
      setIzlenenler(map);
    } catch (e) {
      console.error('useIzlemeDurumu:', e);
    }
    setYukleniyor(false);
  }, [userId, playlistDocId]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const izlendi = useCallback(
    async (videoId, watchDurationSec) => {
      if (!userId || !videoId) return;
      // Optimistic update
      setIzlenenler(prev => ({ ...prev, [videoId]: new Date() }));
      try {
        const docId = `${userId}_${videoId}`;
        const docRef = doc(db, 'userProgress', docId);
        await setDoc(
          docRef,
          {
            userId,
            videoId,
            playlistDocId,
            watched: true,
            watchedAt: serverTimestamp(),
            ...(watchDurationSec != null ? { watchDurationSec } : {}),
          },
          { merge: true }
        );
      } catch (e) {
        console.error('izlendi kayıt:', e);
      }
    },
    [userId, playlistDocId]
  );

  return { izlenenler, yukleniyor, izlendi };
}
