import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { isUnread, readPatch, unreadCount } from '../utils/readState';

export function useBildirimler() {
  const { kullanici } = useAuth();
  const [bildirimler, setBildirimler] = useState([]);
  const [okunmamis, setOkunmamis] = useState(0);

  useEffect(() => {
    if (!kullanici?.uid) return;
    let unsub;
    const timer = setTimeout(() => {
      const q = query(
        collection(db, 'bildirimler'),
        where('aliciId', '==', kullanici.uid),
        orderBy('olusturma', 'desc'),
        limit(60)
      );
      unsub = onSnapshot(
        q,
        snap => {
          const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setBildirimler(liste);
          setOkunmamis(unreadCount(liste));
        },
        err => {
          console.warn('Bildirim listener hatası:', err.message);
        }
      );
    }, 1500);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [kullanici?.uid]);

  const okunduIsaretle = useCallback(async bildirimId => {
    setBildirimler(prev => prev.map(b => (b.id === bildirimId ? { ...b, ...readPatch() } : b)));
    setOkunmamis(prev => Math.max(0, prev - 1));
    try {
      await updateDoc(doc(db, 'bildirimler', bildirimId), readPatch());
    } catch (e) {
      console.error('Bildirim okundu işaretlenemedi:', e);
    }
  }, []);

  const tumunuOku = useCallback(async () => {
    const okunmamislar = bildirimler.filter(isUnread);
    await Promise.all(okunmamislar.map(b => updateDoc(doc(db, 'bildirimler', b.id), readPatch())));
    setBildirimler(prev => prev.map(b => ({ ...b, ...readPatch() })));
    setOkunmamis(0);
  }, [bildirimler]);

  const bildirimSil = useCallback(
    async bildirimId => {
      try {
        const hedef = bildirimler.find(b => b.id === bildirimId);
        await deleteDoc(doc(db, 'bildirimler', bildirimId));
        setBildirimler(prev => prev.filter(b => b.id !== bildirimId));
        if (hedef && isUnread(hedef)) setOkunmamis(prev => Math.max(0, prev - 1));
      } catch (e) {
        console.error('Bildirim silinemedi:', e);
      }
    },
    [bildirimler]
  );

  const okunmuslariTemizle = useCallback(async () => {
    const okunmuslar = bildirimler.filter(b => !isUnread(b));
    if (okunmuslar.length === 0) return;
    await Promise.all(okunmuslar.map(b => deleteDoc(doc(db, 'bildirimler', b.id))));
    setBildirimler(prev => prev.filter(isUnread));
  }, [bildirimler]);

  return { bildirimler, okunmamis, okunduIsaretle, tumunuOku, bildirimSil, okunmuslariTemizle };
}
