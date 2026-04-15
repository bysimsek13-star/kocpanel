import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { GUNLER, haftaBaslangici } from '../utils/programAlgoritma';
import { bildirimOlustur } from '../components/BildirimSistemi';
import { logIstemciHatasi } from '../utils/izleme';

const SLOT_SAYISI = 6;
export const bosSlot = () => ({ tip: null, baslangic: '', bitis: '', icerik: '', ders: '' });
export const bosHafta = () => {
  const hafta = {};
  GUNLER.forEach(g => {
    hafta[g] = Array.from({ length: SLOT_SAYISI }, bosSlot);
  });
  return hafta;
};

export function useHaftalikProgram({ ogrenciler, ogrenciProp, readOnly, initialOffset }) {
  const { kullanici } = useAuth();
  const toast = useToast();
  const kocUid = kullanici?.uid || null;
  const bildirimTimerRef = useRef(null);

  const [secilenOgrenci, setSecilenOgrenci] = useState(ogrenciProp || ogrenciler[0] || null);
  const [haftaOffset, setHaftaOffset] = useState(initialOffset);
  const [hafta, setHafta] = useState(bosHafta());
  const [tamamlandiMap, setTamamlandiMap] = useState({});
  const [yukleniyor, setYukleniyor] = useState(false);
  const [duzenleme, setDuzenleme] = useState(!readOnly);
  const [modal, setModal] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [kaydetiliyor, setKaydetiliyor] = useState(false);
  const [kopyalaModal, setKopyalaModal] = useState(false);
  const [kopyalaHedef, setKopyalaHedef] = useState(null);
  const [kopyalaniyor, setKopyalaniyor] = useState(false);
  const [slotKopya, setSlotKopya] = useState(null);

  const haftaKey = haftaBaslangici(new Date(Date.now() + haftaOffset * 7 * 24 * 60 * 60 * 1000));
  const bugunGun = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'][
    new Date().getDay()
  ];
  const modalSlot = modal ? hafta[modal.gun][modal.slotIndex] : null;

  useEffect(() => {
    if (!secilenOgrenci && ogrenciler.length > 0) setSecilenOgrenci(ogrenciler[0]);
  }, [ogrenciler]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      if (bildirimTimerRef.current) clearTimeout(bildirimTimerRef.current);
    },
    []
  );

  const yukle = useCallback(async () => {
    if (!secilenOgrenci) return;
    setYukleniyor(true);
    try {
      const snap = await getDoc(doc(db, 'ogrenciler', secilenOgrenci.id, 'program_v2', haftaKey));
      if (snap.exists()) {
        const v = snap.data();
        setHafta(v.hafta || bosHafta());
        setTamamlandiMap(v.tamamlandi || {});
      } else {
        setHafta(bosHafta());
        setTamamlandiMap({});
      }
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  }, [secilenOgrenci, haftaKey]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const kaydet = async yeniHafta => {
    if (!secilenOgrenci || readOnly) return;
    setKaydetiliyor(true);
    try {
      // merge:true — sadece hafta alanına dokunuluyor, öğrencinin tamamlandi işaretleri korunuyor
      await setDoc(
        doc(db, 'ogrenciler', secilenOgrenci.id, 'program_v2', haftaKey),
        { hafta: yeniHafta, guncelleme: serverTimestamp() },
        { merge: true }
      );
      if (secilenOgrenci?.id) {
        if (bildirimTimerRef.current) clearTimeout(bildirimTimerRef.current);
        bildirimTimerRef.current = setTimeout(() => {
          bildirimOlustur({
            aliciId: secilenOgrenci.id,
            tip: 'program_degisti',
            baslik: 'Programın güncellendi',
            mesaj: `${haftaKey} haftası için programın güncellendi.`,
            ogrenciId: secilenOgrenci.id,
            ogrenciIsim: secilenOgrenci.isim || '',
            route: '/ogrenci/program',
          }).catch(() => {});
        }, 12000);
      }
    } catch (e) {
      logIstemciHatasi({
        error: e,
        info: 'Haftalık program kaydedilemedi',
        kaynak: 'HaftalikProgram',
        ekstra: { ogrenciId: secilenOgrenci?.id },
      });
      toast('Kaydedilemedi', 'error');
    }
    setKaydetiliyor(false);
  };

  const slotGuncelle = (gun, index, yeniSlot) => {
    const yeniHafta = { ...hafta, [gun]: hafta[gun].map((sl, i) => (i === index ? yeniSlot : sl)) };
    setHafta(yeniHafta);
    kaydet(yeniHafta);
  };

  const togglTamamla = async (gun, index) => {
    if (!secilenOgrenci) return;
    const key = `${gun}_${index}`;
    const yeni = { ...tamamlandiMap, [key]: !tamamlandiMap[key] };
    setTamamlandiMap(yeni);
    // merge:true — sadece tamamlandi alanına dokunuluyor, koçun hafta verisi korunuyor
    await setDoc(
      doc(db, 'ogrenciler', secilenOgrenci.id, 'program_v2', haftaKey),
      { tamamlandi: yeni },
      { merge: true }
    );
  };

  const haftayiKopyala = async () => {
    if (!secilenOgrenci || kopyalaHedef === null) return;
    setKopyalaniyor(true);
    try {
      const hedefKey = haftaBaslangici(
        new Date(Date.now() + kopyalaHedef * 7 * 24 * 60 * 60 * 1000)
      );
      await setDoc(doc(db, 'ogrenciler', secilenOgrenci.id, 'program_v2', hedefKey), {
        hafta,
        tamamlandi: {},
        guncelleme: serverTimestamp(),
      });
      toast(`"${hedefKey}" haftasına kopyalandı ✓`);
      setKopyalaModal(false);
      setKopyalaHedef(null);
    } catch (e) {
      logIstemciHatasi({
        error: e,
        info: 'Program kopyalanamadı',
        kaynak: 'HaftalikProgram',
        ekstra: { ogrenciId: secilenOgrenci?.id },
      });
      toast('Kopyalanamadı', 'error');
    }
    setKopyalaniyor(false);
  };

  const haftayaTasi = async slotForm => {
    if (!secilenOgrenci || !modal) return;
    try {
      const hedefKey = haftaBaslangici(
        new Date(Date.now() + (haftaOffset + 1) * 7 * 24 * 60 * 60 * 1000)
      );
      const ref = doc(db, 'ogrenciler', secilenOgrenci.id, 'program_v2', hedefKey);
      const snap = await getDoc(ref);
      const mevcut = snap.exists() ? snap.data() : { hafta: bosHafta(), tamamlandi: {} };
      const hedefGun = mevcut.hafta[modal.gun] || Array.from({ length: SLOT_SAYISI }, bosSlot);
      hedefGun[modal.slotIndex] = slotForm;
      await setDoc(ref, {
        hafta: { ...mevcut.hafta, [modal.gun]: hedefGun },
        tamamlandi: mevcut.tamamlandi || {},
        guncelleme: serverTimestamp(),
      });
      toast(
        `${modal.gun.charAt(0).toUpperCase() + modal.gun.slice(1)} günü gelecek haftaya taşındı ✓`
      );
      setModal(null);
    } catch (e) {
      toast('Taşınamadı: ' + e.message, 'error');
    }
  };

  return {
    secilenOgrenci,
    setSecilenOgrenci,
    haftaOffset,
    setHaftaOffset,
    hafta,
    tamamlandiMap,
    yukleniyor,
    duzenleme,
    setDuzenleme,
    modal,
    setModal,
    videoModal,
    setVideoModal,
    kaydetiliyor,
    kopyalaModal,
    setKopyalaModal,
    kopyalaHedef,
    setKopyalaHedef,
    kopyalaniyor,
    slotKopya,
    setSlotKopya,
    haftaKey,
    bugunGun,
    modalSlot,
    slotGuncelle,
    togglTamamla,
    haftayiKopyala,
    haftayaTasi,
    kocUid,
    toast,
  };
}
