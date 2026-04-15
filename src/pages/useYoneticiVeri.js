import { useState, useCallback, useEffect } from 'react';
import {
  collection,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { hataMesajiVer } from '../admin/adminHelpers';
import { OGRENCI_SAYFA_BOYUTU } from './yoneticiPaneliSabitleri';

export default function useYoneticiVeri(isAdmin) {
  const toast = useToast();
  const [koclar, setKoclar] = useState([]);
  const [ogrenciler, setOgrenciler] = useState([]);
  const [ilkYukleme, setIlkYukleme] = useState(true);
  const [ogrenciYukleniyor, setOgrenciYukleniyor] = useState(false);
  const [sonCursor, setSonCursor] = useState(null);
  const [dahaFazlaVar, setDahaFazlaVar] = useState(false);
  const [istatistikler, setIstatistikler] = useState({
    toplamOgrenci: 0,
    atasizOgrenci: 0,
    aktifOgrenci: 0,
  });
  const [kocBazliSayilar, setKocBazliSayilar] = useState({});

  const koclarGetir = useCallback(
    async ({ sessiz = false } = {}) => {
      if (!isAdmin) return;
      if (!sessiz) setIlkYukleme(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'kullanicilar'), where('rol', '==', 'koc'))
        );
        setKoclar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        toast(hataMesajiVer(e), 'error');
      } finally {
        if (!sessiz) setIlkYukleme(false);
      }
    },
    [isAdmin, toast]
  );

  const istatistikleriGetir = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [toplamSnap, atasizSnap, aktifSnap] = await Promise.all([
        getCountFromServer(collection(db, 'ogrenciler')),
        getCountFromServer(query(collection(db, 'ogrenciler'), where('kocId', '==', ''))),
        getCountFromServer(query(collection(db, 'ogrenciler'), where('aktif', '!=', false))),
      ]);
      setIstatistikler({
        toplamOgrenci: toplamSnap.data().count,
        atasizOgrenci: atasizSnap.data().count,
        aktifOgrenci: aktifSnap.data().count,
      });
    } catch (e) {
      console.error('İstatistik alınamadı:', e);
    }
  }, [isAdmin]);

  const ogrencileriGetirSyfr = useCallback(async () => {
    if (!isAdmin) return;
    setOgrenciYukleniyor(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'ogrenciler'), orderBy('isim'), limit(OGRENCI_SAYFA_BOYUTU + 1))
      );
      const docs = snap.docs;
      const fazlasi = docs.length > OGRENCI_SAYFA_BOYUTU;
      setOgrenciler(docs.slice(0, OGRENCI_SAYFA_BOYUTU).map(d => ({ id: d.id, ...d.data() })));
      setSonCursor(fazlasi ? docs[OGRENCI_SAYFA_BOYUTU - 1] : null);
      setDahaFazlaVar(fazlasi);
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
    }
    setOgrenciYukleniyor(false);
  }, [isAdmin, toast]);

  const dahaFazlaYukle = useCallback(async () => {
    if (!sonCursor || ogrenciYukleniyor) return;
    setOgrenciYukleniyor(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, 'ogrenciler'),
          orderBy('isim'),
          startAfter(sonCursor),
          limit(OGRENCI_SAYFA_BOYUTU + 1)
        )
      );
      const docs = snap.docs;
      const fazlasi = docs.length > OGRENCI_SAYFA_BOYUTU;
      setOgrenciler(prev => [
        ...prev,
        ...docs.slice(0, OGRENCI_SAYFA_BOYUTU).map(d => ({ id: d.id, ...d.data() })),
      ]);
      setSonCursor(fazlasi ? docs[OGRENCI_SAYFA_BOYUTU - 1] : null);
      setDahaFazlaVar(fazlasi);
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
    }
    setOgrenciYukleniyor(false);
  }, [sonCursor, ogrenciYukleniyor, toast]);

  const verileriGetir = useCallback(
    async ({ sessiz = false } = {}) => {
      await koclarGetir({ sessiz });
      await Promise.all([ogrencileriGetirSyfr(), istatistikleriGetir()]);
    },
    [koclarGetir, ogrencileriGetirSyfr, istatistikleriGetir]
  );

  useEffect(() => {
    verileriGetir();
  }, [verileriGetir]);

  useEffect(() => {
    if (!koclar.length || !isAdmin) return;
    let aktif = true;
    Promise.all(
      koclar.map(async koc => {
        const snap = await getCountFromServer(
          query(collection(db, 'ogrenciler'), where('kocId', '==', koc.id))
        );
        return [koc.id, snap.data().count];
      })
    )
      .then(sonuclar => {
        if (aktif) setKocBazliSayilar(Object.fromEntries(sonuclar));
      })
      .catch(() => {});
    return () => {
      aktif = false;
    };
  }, [koclar, isAdmin]);

  return {
    koclar,
    ogrenciler,
    setOgrenciler,
    ilkYukleme,
    ogrenciYukleniyor,
    dahaFazlaVar,
    istatistikler,
    kocBazliSayilar,
    verileriGetir,
    dahaFazlaYukle,
  };
}
