import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export function useGorusmeler(leadId) {
  const [gorusmeler, setGorusmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!leadId) return;
    const q = query(collection(db, 'leads', leadId, 'gorusmeler'), orderBy('tarih', 'desc'));
    const unsub = onSnapshot(
      q,
      snap => {
        setGorusmeler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setYukleniyor(false);
      },
      () => setYukleniyor(false)
    );
    return () => unsub();
  }, [leadId]);

  return { gorusmeler, yukleniyor };
}

export function useLeadGorevleri(leadId) {
  const [gorevler, setGorevler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!leadId) return;
    const q = query(
      collection(db, 'leads', leadId, 'gorevler'),
      orderBy('olusturmaTarihi', 'desc')
    );
    const unsub = onSnapshot(
      q,
      snap => {
        setGorevler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setYukleniyor(false);
      },
      () => setYukleniyor(false)
    );
    return () => unsub();
  }, [leadId]);

  return { gorevler, yukleniyor };
}
