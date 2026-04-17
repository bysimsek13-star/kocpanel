import { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TYT_DERSLER, AYT_SAY, netHesapla } from '../../data/konular';
import { LGS_DERSLER } from '../../utils/ogrenciBaglam';
import { turdenBransDersler } from '../../utils/sinavUtils';
import { bugunStr } from '../../utils/tarih';
import { useToast } from '../../components/Toast';
import { bildirimOlustur } from '../../components/BildirimSistemi';
import { AYT_MAP, turdenAlan, sinavSecenekleri } from './denemeUtils';

export default function useDenemeModal({
  ogrenciId,
  onKapat,
  onEkle,
  mevcutDeneme,
  kocId,
  ogrenciTur,
  ogrenciSinif,
}) {
  const duzenle = !!mevcutDeneme;
  const toast = useToast();
  const secenekler = sinavSecenekleri(ogrenciTur, ogrenciSinif);
  const ilkSinav = secenekler[0];

  const [denemeTuru, setDenemeTuru] = useState(mevcutDeneme?.denemeTuru || 'genel');
  const [sinav, setSinav] = useState(
    mevcutDeneme?.sinav?.startsWith('Branş') ? ilkSinav : mevcutDeneme?.sinav || ilkSinav
  );
  const [alan, setAlan] = useState(mevcutDeneme?.alan || turdenAlan(ogrenciTur));
  const [bransDersler, setBransDersler] = useState(() => {
    if (mevcutDeneme?.denemeTuru === 'brans' && mevcutDeneme?.netler)
      return Object.keys(mevcutDeneme.netler);
    return [];
  });
  const [tarih, setTarih] = useState(mevcutDeneme?.tarih || bugunStr());
  const [yayinevi, setYayinevi] = useState(mevcutDeneme?.yayinevi || '');
  const [veriler, setVeriler] = useState(() => {
    if (!mevcutDeneme?.netler) return {};
    const ID_MAP = { fen: 'tytfiz', sos: 'tyttar' };
    const v = {};
    Object.entries(mevcutDeneme.netler).forEach(([id, n]) => {
      const yeniId = ID_MAP[id] || id;
      v[yeniId] = { d: n.d || 0, y: n.y || 0, b: n.b || 0 };
    });
    return v;
  });
  const [konuDetay, setKonuDetay] = useState(() => {
    if (!mevcutDeneme?.netler) return {};
    const k = {};
    Object.entries(mevcutDeneme.netler).forEach(([id, n]) => {
      if (n.konuDetay) k[id] = n.konuDetay;
    });
    return k;
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  const bransDersToggle = id => {
    setBransDersler(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    setVeriler(prev => {
      if (bransDersler.includes(id)) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  };

  const dersler =
    denemeTuru === 'brans'
      ? turdenBransDersler(ogrenciTur, ogrenciSinif).filter(d => bransDersler.includes(d.id))
      : sinav === 'LGS'
        ? LGS_DERSLER
        : sinav === 'TYT'
          ? TYT_DERSLER
          : AYT_MAP[alan] || AYT_SAY;

  const guncelle = (dersId, tip, deger) => {
    const ders = dersler.find(d => d.id === dersId);
    const max = ders?.toplam ?? 999;
    const mevcut = veriler[dersId] || {};
    const raw = parseInt(deger) || 0;
    const diger1 =
      tip === 'd'
        ? (mevcut.y || 0) + (mevcut.b || 0)
        : tip === 'y'
          ? (mevcut.d || 0) + (mevcut.b || 0)
          : (mevcut.d || 0) + (mevcut.y || 0);
    const val = Math.min(raw, Math.max(0, max - diger1));
    setVeriler(prev => ({ ...prev, [dersId]: { ...prev[dersId], [tip]: val } }));
  };

  const konuGuncelle = (dersId, konu, alan, deger) =>
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

  const kaydet = async () => {
    setYukleniyor(true);
    try {
      if (denemeTuru === 'brans') {
        for (const d of dersler) {
          const dy = veriler[d.id] || {};
          const net = parseFloat(netHesapla(dy.d || 0, dy.y || 0));
          const kb = konuDetay[d.id] || {};
          const yanlisKonular = Object.entries(kb)
            .filter(([, b]) => b.yanlis > 0)
            .map(([k]) => k);
          const bosKonular = Object.entries(kb)
            .filter(([, b]) => b.bos > 0)
            .map(([k]) => k);
          const bransVeri = {
            sinav: 'Branş',
            denemeTuru: 'brans',
            tarih,
            yayinevi: yayinevi.trim(),
            netler: {
              [d.id]: {
                d: dy.d || 0,
                y: dy.y || 0,
                b: dy.b || 0,
                net,
                yanlisKonular,
                bosKonular,
                konuDetay: kb,
              },
            },
            toplamNet: net.toFixed(2),
          };
          if (duzenle) {
            await updateDoc(
              doc(db, 'ogrenciler', ogrenciId, 'denemeler', mevcutDeneme.id),
              bransVeri
            );
          } else {
            await addDoc(collection(db, 'ogrenciler', ogrenciId, 'denemeler'), {
              ...bransVeri,
              olusturma: new Date(),
            });
          }
          if (kocId && !duzenle)
            bildirimOlustur({
              aliciId: kocId,
              tip: 'deneme_girildi',
              baslik: 'Branş denemesi kaydedildi',
              mesaj: `${d.label} — ${net.toFixed(2)} net.`,
              ogrenciId,
              route: '/koc/ogrenciler',
            }).catch(() => {});
        }
      } else {
        const netler = {};
        let top = 0;
        dersler.forEach(d => {
          const dy = veriler[d.id] || {};
          const net = parseFloat(netHesapla(dy.d || 0, dy.y || 0));
          const kb = konuDetay[d.id] || {};
          const yanlisKonular = Object.entries(kb)
            .filter(([, b]) => b.yanlis > 0)
            .map(([k]) => k);
          const bosKonular = Object.entries(kb)
            .filter(([, b]) => b.bos > 0)
            .map(([k]) => k);
          netler[d.id] = {
            d: dy.d || 0,
            y: dy.y || 0,
            b: dy.b || 0,
            net,
            yanlisKonular,
            bosKonular,
            konuDetay: kb,
          };
          top += net;
        });
        const veri = {
          sinav,
          denemeTuru,
          tarih,
          yayinevi: yayinevi.trim(),
          netler,
          toplamNet: top.toFixed(2),
          ...(sinav === 'AYT' ? { alan } : {}),
        };
        if (duzenle) {
          await updateDoc(doc(db, 'ogrenciler', ogrenciId, 'denemeler', mevcutDeneme.id), veri);
        } else {
          await addDoc(collection(db, 'ogrenciler', ogrenciId, 'denemeler'), {
            ...veri,
            olusturma: new Date(),
          });
        }
        if (kocId && !duzenle)
          bildirimOlustur({
            aliciId: kocId,
            tip: 'deneme_girildi',
            baslik: 'Yeni deneme kaydedildi',
            mesaj: `${sinav}${sinav === 'AYT' ? ' ' + alan : ''} — toplam ${top.toFixed(2)} net.`,
            ogrenciId,
            route: '/koc/ogrenciler',
          }).catch(() => {});
      }
      toast(duzenle ? 'Deneme güncellendi!' : 'Deneme kaydedildi!');
      onEkle();
      onKapat();
    } catch (e) {
      toast('Kaydedilemedi: ' + e.message, 'error');
    }
    setYukleniyor(false);
  };

  const toplamNet = dersler
    .reduce((a, d) => {
      const dy = veriler[d.id] || {};
      return a + parseFloat(netHesapla(dy.d || 0, dy.y || 0));
    }, 0)
    .toFixed(2);

  return {
    duzenle,
    denemeTuru,
    setDenemeTuru,
    sinav,
    setSinav,
    alan,
    setAlan,
    bransDersler,
    bransDersToggle,
    tarih,
    setTarih,
    yayinevi,
    setYayinevi,
    veriler,
    konuDetay,
    yukleniyor,
    guncelle,
    konuGuncelle,
    kaydet,
    toplamNet,
    dersler,
    secenekler,
    setVeriler,
    setKonuDetay,
  };
}
