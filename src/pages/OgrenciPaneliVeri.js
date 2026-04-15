import { useState, useEffect, useRef } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { unreadCount } from '../utils/readState';
import { aktiflikKaydet, oturumBitir } from '../utils/aktiflikKaydet';
import { bugunStr, bugunGunAdi, haftaBasStr } from '../utils/tarih';

const BUGUN_GUN = bugunGunAdi();
const HAFTA_BAZ = haftaBasStr();

// Slotsüre ağırlığı hesaplama
function slotAgirligi(slotlar) {
  const saatliDk = slotlar.map(sl => {
    if (!sl.baslangic || !sl.bitis) return null;
    const [sh, sm] = sl.baslangic.split(':').map(Number);
    const [eh, em] = sl.bitis.split(':').map(Number);
    const d = eh * 60 + em - (sh * 60 + sm);
    return d > 0 ? d : null;
  });
  const saatliGecerli = saatliDk.filter(d => d !== null);
  const ort =
    saatliGecerli.length > 0 ? saatliGecerli.reduce((a, d) => a + d, 0) / saatliGecerli.length : 60;
  return saatliDk.map(d => (d !== null ? d : ort));
}

export function useOgrenciPaneliVeri(kullanici, userData) {
  const uid = kullanici?.uid;

  const [denemeler, setDenemeler] = useState([]);
  const [calismalar, setCalismalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [okunmamis, setOkunmamis] = useState(0);
  const [gununSozu, setGununSozu] = useState(null);
  const [bugunSoruVar, setBugunSoruVar] = useState(false);
  const [programOran, setProgramOran] = useState(null);
  const [ogrenciTur, setOgrenciTur] = useState(null);
  const [ogrenciSinif, setOgrenciSinif] = useState(null);
  const [kutlamaTema, setKutlamaTema] = useState('hedef');
  const [kutlamaGoster, setKutlamaGoster] = useState(false);
  const [kutlamaMesaj, setKutlamaMesaj] = useState(null);

  const oturumBaslangic = useRef(Date.now());

  // Program oran takibi
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, 'ogrenciler', uid, 'program_v2', HAFTA_BAZ);
    let slotlarRef = [];
    let tamamlandiRef = {};
    const hesapla = () => {
      if (slotlarRef.length === 0) {
        setProgramOran(null);
        return;
      }
      const agirliklar = slotAgirligi(slotlarRef.map(x => x.slot));
      const toplam = agirliklar.reduce((a, d) => a + d, 0);
      const tamam = agirliklar.reduce(
        (a, d, i) => a + (tamamlandiRef[`${BUGUN_GUN}_${slotlarRef[i]._idx}`] ? d : 0),
        0
      );
      setProgramOran(toplam > 0 ? Math.round((tamam / toplam) * 100) : 0);
    };
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const v = snap.data();
        slotlarRef = (v.hafta?.[BUGUN_GUN] || [])
          .map((sl, idx) => (sl.tip ? { slot: sl, _idx: idx } : null))
          .filter(Boolean);
        tamamlandiRef = v.tamamlandi || {};
      } else {
        slotlarRef = [];
        tamamlandiRef = {};
      }
      hesapla();
    });
    return () => unsub();
  }, [uid]);

  // Aktiflik kaydı
  useEffect(() => {
    aktiflikKaydet(uid, userData?.rol);
  }, [uid, userData?.rol]);

  // Oturum süresi takibi
  useEffect(() => {
    if (!uid) return;
    oturumBaslangic.current = Date.now();
    const bitir = () => {
      const sure = (Date.now() - oturumBaslangic.current) / 60000;
      oturumBitir(uid, sure, userData?.rol);
      oturumBaslangic.current = Date.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') bitir();
    };
    window.addEventListener('beforeunload', bitir);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('beforeunload', bitir);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [uid]);

  // Ana veri çekimi
  useEffect(() => {
    if (!uid) return;
    const BUGUN = bugunStr();
    Promise.all([
      getDocs(collection(db, 'ogrenciler', uid, 'denemeler')),
      getDocs(collection(db, 'ogrenciler', uid, 'calisma')),
      getDoc(doc(db, 'ogrenciler', uid, 'gunlukSoru', BUGUN)),
      getDoc(doc(db, 'gunun_sozu', uid)),
      getDoc(doc(db, 'gunun_sozu', 'genel')),
      getDoc(doc(db, 'ogrenciler', uid)),
    ])
      .then(([ds, cs, sq, kisisel, genel, ogrSnap]) => {
        const dl = ds.docs.map(d => ({ id: d.id, ...d.data() }));
        dl.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
        setDenemeler(dl);
        setCalismalar(cs.docs.map(d => ({ id: d.id, ...d.data(), tarih: d.id })));
        setBugunSoruVar(sq.exists());
        const bugunBaslangic = new Date();
        bugunBaslangic.setHours(0, 0, 0, 0);
        const sozBugunkuMu = veri => {
          const guncelleme = veri?.guncelleme?.toDate?.() || new Date(0);
          return guncelleme >= bugunBaslangic;
        };
        if (kisisel.exists() && sozBugunkuMu(kisisel.data())) setGununSozu(kisisel.data());
        else if (genel.exists() && sozBugunkuMu(genel.data())) setGununSozu(genel.data());
        if (ogrSnap.exists()) {
          const od = ogrSnap.data();
          if (od.tur) setOgrenciTur(od.tur);
          if (od.sinif) setOgrenciSinif(od.sinif);
          if (od.dogumTarihi) {
            const bugunSimdi = new Date();
            const dogum = new Date(od.dogumTarihi);
            if (
              dogum.getDate() === bugunSimdi.getDate() &&
              dogum.getMonth() === bugunSimdi.getMonth()
            ) {
              setKutlamaTema('dogumgunu');
              setKutlamaMesaj(`İyi ki doğdun, ${od.isim || userData?.isim || ''}! 🎉`);
              setKutlamaGoster(true);
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setYukleniyor(false));
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Okunmamış mesaj takibi
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'ogrenciler', uid, 'mesajlar'),
      orderBy('olusturma', 'desc'),
      limit(30)
    );
    return onSnapshot(q, snap => {
      const mesajlar = snap.docs.map(d => d.data());
      setOkunmamis(unreadCount(mesajlar, m => m.gonderen === 'koc'));
    });
  }, [uid]);

  const mesajlariOku = () => {
    setOkunmamis(0);
    updateDoc(doc(db, 'ogrenciler', uid), { okunmamisMesajSayisi: 0 }).catch(() => {});
  };

  return {
    denemeler,
    calismalar,
    yukleniyor,
    okunmamis,
    mesajlariOku,
    gununSozu,
    bugunSoruVar,
    programOran,
    ogrenciTur,
    ogrenciSinif,
    kutlamaTema,
    kutlamaGoster,
    setKutlamaGoster,
    kutlamaMesaj,
  };
}
