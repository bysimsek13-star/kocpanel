import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';

export default function useCrm() {
  const [leads, setLeads] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('guncellenmeTarihi', 'desc'));
    const unsub = onSnapshot(
      q,
      snap => {
        setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setYukleniyor(false);
      },
      () => setYukleniyor(false)
    );
    return () => unsub();
  }, []);

  const leadEkle = data =>
    addDoc(collection(db, 'leads'), {
      ...data,
      olusturmaTarihi: serverTimestamp(),
      guncellenmeTarihi: serverTimestamp(),
      sonAktiviteTarihi: serverTimestamp(),
      ogrenciyeDonusturuldu: false,
    });

  const leadGuncelle = (id, data) =>
    updateDoc(doc(db, 'leads', id), {
      ...data,
      guncellenmeTarihi: serverTimestamp(),
    });

  const leadSil = id => deleteDoc(doc(db, 'leads', id));

  const gorusmeEkle = async (leadId, gorusmeData) => {
    await addDoc(collection(db, 'leads', leadId, 'gorusmeler'), {
      ...gorusmeData,
      tarih: serverTimestamp(),
    });
    await updateDoc(doc(db, 'leads', leadId), {
      guncellenmeTarihi: serverTimestamp(),
      sonAktiviteTarihi: serverTimestamp(),
    });
  };

  const gorevEkle = async (leadId, leadAdi, gorevData) => {
    const ref = await addDoc(collection(db, 'leads', leadId, 'gorevler'), {
      ...gorevData,
      tarih: gorevData.tarih ? new Date(gorevData.tarih) : null,
      leadId,
      leadAdi,
      tamamlandi: false,
      tamamlanmaTarihi: null,
      olusturmaTarihi: serverTimestamp(),
    });
    await updateDoc(doc(db, 'leads', leadId), { guncellenmeTarihi: serverTimestamp() });
    return ref;
  };

  const gorevTamamla = (leadId, gorevId) =>
    updateDoc(doc(db, 'leads', leadId, 'gorevler', gorevId), {
      tamamlandi: true,
      tamamlanmaTarihi: serverTimestamp(),
    });

  return {
    leads,
    yukleniyor,
    leadEkle,
    leadGuncelle,
    leadSil,
    gorusmeEkle,
    gorevEkle,
    gorevTamamla,
  };
}
