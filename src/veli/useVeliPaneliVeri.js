import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { unreadCount } from '../utils/readState';
import { aktiflikKaydet } from '../utils/aktiflikKaydet';

function toMs(v) {
  if (!v) return 0;
  if (typeof v?.toDate === 'function') return v.toDate().getTime();
  if (v instanceof Date) return v.getTime();
  const n = new Date(v).getTime();
  return isNaN(n) ? 0 : n;
}

export function useVeliPaneliVeri(kullanici, userData) {
  const ogrenciId = userData?.ogrenciUid || userData?.ogrenciId || userData?.bagliOgrenciId || null;

  const [yukleniyor, setYukleniyor] = useState(true);
  const [ogrenci, setOgrenci] = useState(null);
  const [denemeler, setDenemeler] = useState([]);
  const [calisma, setCalisma] = useState([]);
  const [veliRaporlari, setVeliRaporlari] = useState([]);
  const [okunmamisMesaj, setOkunmamisMesaj] = useState(0);

  useEffect(() => {
    aktiflikKaydet(kullanici?.uid, userData?.rol);
  }, [kullanici?.uid, userData?.rol]);

  useEffect(() => {
    if (!ogrenciId) {
      setYukleniyor(false);
      return;
    }
    setYukleniyor(true);

    const unsubOgrenci = onSnapshot(
      doc(db, 'ogrenciler', ogrenciId),
      snap => {
        setOgrenci(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setYukleniyor(false);
      },
      () => setYukleniyor(false)
    );

    const unsubDenemeler = onSnapshot(
      collection(db, 'ogrenciler', ogrenciId, 'denemeler'),
      snap => {
        const l = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        l.sort((a, b) => toMs(b.tarih || b.olusturma) - toMs(a.tarih || a.olusturma));
        setDenemeler(l);
      },
      () => {}
    );

    const unsubCalisma = onSnapshot(
      collection(db, 'ogrenciler', ogrenciId, 'calisma'),
      snap => setCalisma(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => {}
    );

    const unsubRaporlar = onSnapshot(
      collection(db, 'ogrenciler', ogrenciId, 'veliRaporlari'),
      snap => {
        const l = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        l.sort((a, b) => toMs(b.haftaBitis || b.olusturma) - toMs(a.haftaBitis || a.olusturma));
        setVeliRaporlari(l);
      },
      () => {}
    );

    const q = query(
      collection(db, 'ogrenciler', ogrenciId, 'velimesajlar'),
      orderBy('olusturma', 'desc'),
      limit(50)
    );
    const unsubMesaj = onSnapshot(
      q,
      snap =>
        setOkunmamisMesaj(
          unreadCount(
            snap.docs.map(d => d.data()),
            m => m.gonderen === 'koc'
          )
        ),
      () => {}
    );

    return () => {
      unsubOgrenci();
      unsubDenemeler();
      unsubCalisma();
      unsubRaporlar();
      unsubMesaj();
    };
  }, [ogrenciId]);

  return {
    ogrenciId,
    ogrenci,
    denemeler,
    calisma,
    veliRaporlari,
    okunmamisMesaj,
    setOkunmamisMesaj,
    yukleniyor,
  };
}
