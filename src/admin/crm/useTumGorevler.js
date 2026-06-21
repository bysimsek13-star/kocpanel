import { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export default function useTumGorevler() {
  const [gorevler, setGorevler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const q = query(collectionGroup(db, 'gorevler'), orderBy('tarih', 'asc'));
    const unsub = onSnapshot(
      q,
      snap => {
        setGorevler(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(g => !g.tamamlandi));
        setYukleniyor(false);
      },
      () => setYukleniyor(false)
    );
    return () => unsub();
  }, []);

  return { gorevler, yukleniyor };
}
