import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { ayYilStr } from './maliSabitleri';

// Geriye 24 ay — coleksiyon büyüdükçe sınırsız okumayı önler
function enErkenAy() {
  const d = new Date();
  d.setMonth(d.getMonth() - 23);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function useOdemeler() {
  const [odemeler, setOdemeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'odemeler'),
      where('ayYil', '>=', enErkenAy()),
      orderBy('ayYil', 'desc')
    );
    const unsub = onSnapshot(
      q,
      snap => {
        setOdemeler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setYukleniyor(false);
      },
      () => setYukleniyor(false)
    );
    return () => unsub();
  }, []);

  return { odemeler, yukleniyor };
}

export function useGiderler() {
  const [giderler, setGiderler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'giderler'), orderBy('tarih', 'desc'));
    const unsub = onSnapshot(
      q,
      snap => {
        setGiderler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setYukleniyor(false);
      },
      () => setYukleniyor(false)
    );
    return () => unsub();
  }, []);

  return { giderler, yukleniyor };
}

export const odemeKaydet = (ogrenciId, ayYil, data) =>
  setDoc(
    doc(db, 'odemeler', `${ogrenciId}_${ayYil}`),
    { ...data, ogrenciId, ayYil, olusturmaTarihi: serverTimestamp() },
    { merge: true }
  );

export const odemeGuncelle = (ogrenciId, ayYil, data) =>
  updateDoc(doc(db, 'odemeler', `${ogrenciId}_${ayYil}`), {
    ...data,
    guncellemeTarihi: serverTimestamp(),
  });

export const giderEkle = data =>
  addDoc(collection(db, 'giderler'), {
    ...data,
    tutar: Number(data.tutar),
    tarih: data.tarih ? new Date(data.tarih) : new Date(),
    ayYil: data.tarih ? data.tarih.slice(0, 7) : ayYilStr(),
    olusturmaTarihi: serverTimestamp(),
  });

export const giderGuncelle = (id, data) =>
  updateDoc(doc(db, 'giderler', id), {
    ...data,
    tutar: Number(data.tutar),
    ayYil: data.tarih ? data.tarih.slice(0, 7) : ayYilStr(),
  });

export const giderSil = id => deleteDoc(doc(db, 'giderler', id));
