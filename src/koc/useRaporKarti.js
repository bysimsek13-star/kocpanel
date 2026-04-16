/**
 * useRaporKarti — RaporKarti bileşeninin state ve mantığı
 * raporOlustur, waGonder, yazdirRapor, telefon yönetimi
 */
import { useState } from 'react';
import { collection, getDocs, getDoc, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { bildirimOlustur } from '../components/BildirimSistemi';
import { GUNLER, haftaBaslangici } from '../utils/programAlgoritma';
import { addDays, waMetniOlustur, raporMetniOlustur } from './veliRaporlariUtils';

export function useRaporKarti({ ogrenci, data, onTelefonGuncelle }) {
  const { userData } = useAuth();
  const toast = useToast();

  const [telefonDuzenle, setTelefonDuzenle] = useState(false);
  const [telefonInput, setTelefonInput] = useState(ogrenci.veliTelefon || '');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kocNotu, setKocNotu] = useState('');
  const [onizleme, setOnizleme] = useState('');
  const [waMesaji, setWaMesaji] = useState('');

  const telefonKaydet = () => {
    onTelefonGuncelle(ogrenci.id, telefonInput.trim());
    setTelefonDuzenle(false);
  };

  const raporOlustur = async () => {
    setYukleniyor(true);
    try {
      const gecenHafta = new Date();
      gecenHafta.setDate(gecenHafta.getDate() - 7);
      const secilenHafta = haftaBaslangici(gecenHafta);
      const haftaBitis = addDays(secilenHafta, 6);

      const [progDoc, calismaSnap, denSnap] = await Promise.all([
        getDoc(doc(db, 'ogrenciler', ogrenci.id, 'program_v2', secilenHafta)),
        getDocs(collection(db, 'ogrenciler', ogrenci.id, 'calisma')),
        getDocs(collection(db, 'ogrenciler', ogrenci.id, 'denemeler')),
      ]);

      const progData = progDoc.exists() ? progDoc.data() : {};
      const hafta = progData.hafta || {};
      const tamamlandiFlat = progData.tamamlandi || {};

      const calismaMap = {};
      calismaSnap.docs.forEach(d => {
        calismaMap[d.id] = Number(d.data().saat) || 0;
      });

      const gunTarihleri = GUNLER.map((_, i) => addDays(secilenHafta, i));
      const soruSnaps = await Promise.all(
        gunTarihleri.map(t => getDoc(doc(db, 'ogrenciler', ogrenci.id, 'gunlukSoru', t)))
      );

      const gunVerileri = GUNLER.map((gunAdi, i) => {
        const tarih = gunTarihleri[i];
        const slotlar = hafta[gunAdi] || [];
        const tamamlandi = {};
        slotlar.forEach((_, idx) => {
          tamamlandi[idx] = !!tamamlandiFlat[`${gunAdi}_${idx}`];
        });
        const soruData = soruSnaps[i].exists() ? soruSnaps[i].data() : null;
        const soruToplam = soruData
          ? Object.values(soruData.dersler || {}).reduce(
              (acc, r) => acc + (r.d || 0) + (r.y || 0) + (r.b || 0),
              0
            )
          : 0;
        return {
          tarih,
          gunAdi,
          slotlar,
          tamamlandi,
          calismaSaat: calismaMap[tarih] || 0,
          soruToplam,
        };
      });

      const toplamSaat = gunVerileri.reduce((a, g) => a + g.calismaSaat, 0);
      const calismaGun = gunVerileri.filter(g => g.calismaSaat > 0).length;
      const doluSlotlar = gunVerileri.flatMap(g => g.slotlar.filter(sl => sl.tip));
      const tamamlananSayi = gunVerileri.reduce(
        (acc, g) => acc + g.slotlar.filter((sl, i) => sl.tip && g.tamamlandi[i]).length,
        0
      );
      const gorevOran = doluSlotlar.length
        ? Math.round((tamamlananSayi / doluSlotlar.length) * 100)
        : 0;

      const buHaftaDen = denSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.tarih >= secilenHafta && d.tarih <= haftaBitis)
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
      const sonDeneme =
        buHaftaDen[0] ||
        denSnap.docs
          .map(d => ({ ...d.data() }))
          .sort((a, b) => new Date(b.tarih || 0) - new Date(a.tarih || 0))[0];

      const ozet = {
        calismaGun,
        toplamSaat: toplamSaat.toFixed(1),
        gorevOran,
        sonDenemeNet: sonDeneme ? Number(sonDeneme.toplamNet) || null : null,
      };

      const mesaj = waMetniOlustur({
        ogrenci,
        secilenHafta,
        haftaBitis,
        gunVerileri,
        denemeler: buHaftaDen,
        kocNotu,
        ozet,
      });
      setWaMesaji(mesaj);
      setOnizleme(mesaj);

      await addDoc(collection(db, 'ogrenciler', ogrenci.id, 'veliRaporlari'), {
        haftaBaslangic: secilenHafta,
        haftaBitis,
        ozetMetni: `${calismaGun} gün, ${toplamSaat.toFixed(1)} saat, %${gorevOran} görev tamamlandı.`,
        kocNotu: kocNotu.trim(),
        calismaGunSayisi: calismaGun,
        toplamSaat: Number(toplamSaat.toFixed(1)),
        gorevTamamlama: gorevOran,
        sonDenemeNet: ozet.sonDenemeNet,
        olusturma: serverTimestamp(),
        kaynak: 'detayli_koc',
        kocIsim: userData?.isim || '',
      });

      if (ogrenci.veliUid) {
        bildirimOlustur({
          aliciId: ogrenci.veliUid,
          tip: 'veli_raporu_hazir',
          baslik: 'Haftalık rapor hazırlandı',
          mesaj: `${ogrenci.isim} için haftalık rapor hazırlandı.`,
          ogrenciId: ogrenci.id,
          ogrenciIsim: ogrenci.isim || '',
          route: '/veli/mesajlar',
        }).catch(() => {});
      }
      toast(`${ogrenci.isim} için rapor oluşturuldu ✅`);
    } catch (e) {
      toast(e.message || 'Hata', 'error');
    }
    setYukleniyor(false);
  };

  const waGonder = () => {
    const telefon = ogrenci.veliTelefon?.replace(/\D/g, '') || '';
    if (!telefon) return;
    const mesaj =
      waMesaji ||
      waMetniOlustur({
        ogrenci,
        secilenHafta: '',
        haftaBitis: '',
        gunVerileri: [],
        denemeler: [],
        kocNotu,
        ozet: {
          calismaGun: data?.calismaGunSayisi ?? 0,
          toplamSaat: data?.toplamSaat ?? 0,
          gorevOran: data?.gorevTamamlama ?? 0,
          sonDenemeNet: data?.sonDenemeNet,
        },
      });
    window.open(`https://wa.me/${telefon}?text=${encodeURIComponent(mesaj)}`, '_blank');
  };

  const yazdirRapor = rapor => {
    if (onizleme) {
      window.print();
      return;
    }
    // Kaydedilmiş rapordan yeni pencere aç (KocRaporu.js gibi)
    if (!rapor) return;
    const metin = raporMetniOlustur(rapor, ogrenci.isim);
    const w = window.open('', '_blank');
    w.document.write(
      `<html><head><title>Koç Raporu</title>` +
        `<style>body{font-family:sans-serif;padding:32px;white-space:pre-wrap;font-size:14px;line-height:1.7}</style></head>` +
        `<body>${metin.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`
    );
    w.document.close();
    w.print();
  };

  return {
    telefonDuzenle,
    setTelefonDuzenle,
    telefonInput,
    setTelefonInput,
    yukleniyor,
    kocNotu,
    setKocNotu,
    onizleme,
    telefonKaydet,
    raporOlustur,
    waGonder,
    yazdirRapor,
  };
}
