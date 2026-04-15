import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { TYT_DERSLER, AYT_DERSLER } from '../data/konular';
import { useToast } from '../components/Toast';
import { Card, Btn } from '../components/Shared';
import { bugunStr, dateToStr } from '../utils/tarih';
import GunlukSoruFormBaslik from './GunlukSoruFormBaslik';
import GunlukSoruDersListesi from './GunlukSoruDersListesi';
import GunlukSoruGecmis from './GunlukSoruGecmis';

export default function GunlukSoruFormu({ ogrenciId }) {
  const { s } = useTheme();
  const toast = useToast();
  const [tarih, setTarih] = useState(() => bugunStr());
  const [sinav, setSinav] = useState('TYT');
  const [veriler, setVeriler] = useState({});
  const [konuDetay, setKonuDetay] = useState({});
  const [sureDk, setSureDk] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [ilkYukleme, setIlkYukleme] = useState(true);
  const [gecmisKayitlar, setGecmisKayitlar] = useState([]);

  useEffect(() => {
    if (!ogrenciId) return;
    const yediGunOnce = new Date();
    yediGunOnce.setDate(yediGunOnce.getDate() - 7);
    const basTarih = yediGunOnce.toISOString().slice(0, 10);
    getDocs(
      query(
        collection(db, 'ogrenciler', ogrenciId, 'gunlukSoru'),
        where('tarih', '>=', basTarih),
        orderBy('tarih', 'desc'),
        limit(7)
      )
    )
      .then(snap => {
        setGecmisKayitlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      })
      .catch(console.error);
  }, [ogrenciId, yukleniyor]);

  const dersler = sinav === 'TYT' ? TYT_DERSLER : AYT_DERSLER;

  const guncelle = (dersId, tip, deger) =>
    setVeriler(prev => ({
      ...prev,
      [dersId]: { ...prev[dersId], [tip]: parseInt(deger, 10) || 0 },
    }));

  const konuGuncelle = (dersId, konu, alan, deger) => {
    setKonuDetay(prev => ({
      ...prev,
      [dersId]: {
        ...(prev[dersId] || {}),
        [konu]: {
          ...(prev[dersId]?.[konu] || { soru: 0, yanlis: 0, bos: 0 }),
          [alan]: parseInt(deger, 10) || 0,
        },
      },
    }));
  };

  const yukle = useCallback(async () => {
    setIlkYukleme(true);
    try {
      const snap = await getDoc(doc(db, 'ogrenciler', ogrenciId, 'gunlukSoru', tarih));
      if (snap.exists()) {
        const d = snap.data();
        setSinav(d.sinav === 'AYT' ? 'AYT' : 'TYT');
        const raw = d.dersler || {};
        const v2 = {};
        Object.entries(raw).forEach(([k, row]) => {
          v2[k] = { d: row.d || 0, y: row.y || 0, b: row.b || 0 };
        });
        setVeriler(v2);
        setKonuDetay(d.konuDetay || {});
        setSureDk(d.sureDk != null && d.sureDk !== '' ? String(d.sureDk) : '');
      } else {
        setVeriler({});
        setKonuDetay({});
        setSureDk('');
      }
    } catch (e) {
      console.error(e);
    }
    setIlkYukleme(false);
  }, [ogrenciId, tarih]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const kaydet = async () => {
    const temizDersler = {};
    dersler.forEach(ders => {
      const v = veriler[ders.id] || {};
      const d = v.d || 0;
      const y = v.y || 0;
      const b = v.b || 0;
      if (d + y + b === 0) return;
      temizDersler[ders.id] = { d, y, b };
    });
    if (Object.keys(temizDersler).length === 0 && !sureDk) {
      toast('En az bir derse soru gir veya süre yaz.', 'error');
      return;
    }
    const filteredKonu = {};
    Object.keys(temizDersler).forEach(id => {
      if (konuDetay[id] && Object.keys(konuDetay[id]).length) filteredKonu[id] = konuDetay[id];
    });
    let konuEksik = false;
    Object.entries(temizDersler).forEach(([dersId, row]) => {
      const y = row.y || 0;
      const bo = row.b || 0;
      if (y + bo === 0) return;
      const kd = filteredKonu[dersId] || {};
      const konuTop = Object.values(kd).reduce((a, k) => a + (k.yanlis || 0) + (k.bos || 0), 0);
      if (konuTop === 0) konuEksik = true;
    });
    if (konuEksik) {
      toast(
        'Yanlış veya boş varsa konu seçimi yap: koç kritik kazanım analizini buna göre yapar.',
        'warning',
        6000
      );
    }
    setYukleniyor(true);
    try {
      await setDoc(
        doc(db, 'ogrenciler', ogrenciId, 'gunlukSoru', tarih),
        {
          tarih,
          sinav,
          dersler: temizDersler,
          konuDetay: filteredKonu,
          sureDk: sureDk === '' ? null : Math.max(0, parseFloat(sureDk) || 0),
          guncelleme: serverTimestamp(),
        },
        { merge: true }
      );
      toast('Günlük soru kaydı güncellendi.');
    } catch (e) {
      toast('Kaydedilemedi: ' + (e.message || 'hata'), 'error');
    }
    setYukleniyor(false);
  };

  const minTarih = (() => {
    const x = new Date();
    x.setDate(x.getDate() - 14);
    return dateToStr(x);
  })();
  const bugun = bugunStr();

  if (ilkYukleme) {
    return (
      <Card style={{ padding: 24 }}>
        <div style={{ color: s.text3, fontSize: 13 }}>Yükleniyor...</div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card style={{ padding: 20 }}>
        <GunlukSoruFormBaslik
          tarih={tarih}
          setTarih={setTarih}
          sinav={sinav}
          setSinav={setSinav}
          setVeriler={setVeriler}
          setKonuDetay={setKonuDetay}
          sureDk={sureDk}
          setSureDk={setSureDk}
          minTarih={minTarih}
          bugun={bugun}
          s={s}
        />

        <GunlukSoruDersListesi
          dersler={dersler}
          veriler={veriler}
          guncelle={guncelle}
          konuDetay={konuDetay}
          konuGuncelle={konuGuncelle}
          s={s}
        />

        <Btn onClick={kaydet} disabled={yukleniyor} style={{ width: '100%', marginTop: 8 }}>
          {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
        </Btn>
      </Card>

      <GunlukSoruGecmis gecmisKayitlar={gecmisKayitlar} tarih={tarih} setTarih={setTarih} s={s} />
    </div>
  );
}

GunlukSoruFormu.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
};
