import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Veli abonelik durumunu Firestore'dan gerçek zamanlı okur.
 * abonelikler/{uid} koleksiyonunu dinler.
 *
 * @returns {{ abonelik: object|null, yukleniyor: boolean }}
 */
export function useAbonelik(uid) {
  const [abonelik, setAbonelik] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!uid) {
      setYukleniyor(false);
      return;
    }

    const ref = doc(db, 'abonelikler', uid);
    const vazgec = onSnapshot(
      ref,
      snap => {
        setAbonelik(snap.exists() ? snap.data() : null);
        setYukleniyor(false);
      },
      hata => {
        console.error('[useAbonelik] Firestore dinleme hatası:', hata.message);
        setYukleniyor(false);
      }
    );

    return vazgec;
  }, [uid]);

  return { abonelik, yukleniyor };
}
