import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { haftalikOzetOlustur } from '../../utils/timelineUtils';
import { generateSuggestions } from '../../utils/ogrenciUtils';
import { bugunStr } from '../../utils/tarih';
import { haftaBaslangici, programV2ToGorevler } from '../../utils/programAlgoritma';

const BUGUN = bugunStr;

export default function useKocVeri(kocUid) {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [dashboardMap, setDashboardMap] = useState({});
  const [bugunMap, setBugunMap] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  const getir = useCallback(async () => {
    if (!kocUid) return;
    setYukleniyor(true);
    try {
      const snap = await getDocs(query(collection(db, 'ogrenciler'), where('kocId', '==', kocUid)));
      const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOgrenciler(liste);

      // ─── Dashboard map — toplu paralel sorgular ───────────────────────────
      // Tüm program_v2 ve tüm deneme sorgularını iki ayrı Promise.all grubunda
      // aynı anda başlatır; iç içe async fonksiyon yerine düz promise dizisi
      // kullanarak N öğrenci × 2 sorgu = 2N işlem tek seferde uçar.
      const haftaKey = haftaBaslangici();

      const [programSnaplar, denemeSnaplar] = await Promise.all([
        Promise.allSettled(
          liste.map(o => getDoc(doc(db, 'ogrenciler', o.id, 'program_v2', haftaKey)))
        ),
        Promise.allSettled(
          liste.map(o => getDocs(collection(db, 'ogrenciler', o.id, 'denemeler')))
        ),
      ]);

      const dmap = {};
      liste.forEach((o, i) => {
        // allSettled: tek öğrencinin hatası diğerlerini etkilemez
        const progResult = programSnaplar[i];
        const denemeResult = denemeSnaplar[i];
        if (progResult.status === 'rejected' || denemeResult.status === 'rejected') return;
        try {
          const denemeler = denemeResult.value.docs.map(d => ({ id: d.id, ...d.data() }));
          const progData = progResult.value.exists() ? progResult.value.data() : null;
          const ozet = haftalikOzetOlustur({
            program: programV2ToGorevler(progData),
            denemeler,
            ogrenci: o,
          });
          dmap[o.id] = {
            ...ozet,
            oneriler: generateSuggestions({ ogrenci: o, dashboard: ozet, denemeler }),
          };
        } catch {}
      });
      setDashboardMap(dmap);

      // ─── Bugün map — sıfır Firestore okuma ───────────────────────────────────
      // Root dokümanındaki aggregate alanları okur (rutin/gunlukSoru/calisma
      // Cloud Function veya istemci tarafından güncel tutulur).
      const bugun = BUGUN();
      // Türkiye saatine göre (Europe/Istanbul) bugünün 00:00:00 başlangıcı
      const bugunIstanbul = new Date().toLocaleDateString('sv-SE', {
        timeZone: 'Europe/Istanbul',
      });
      const bugunBaslangic = new Date(bugunIstanbul + 'T00:00:00+03:00').getTime();
      const bmap = {};
      liste.forEach(o => {
        let sonAktifMs = 0;
        try {
          if (o.sonAktif?.toDate) sonAktifMs = o.sonAktif.toDate().getTime();
          else if (o.sonAktif) sonAktifMs = new Date(o.sonAktif).getTime();
        } catch {
          sonAktifMs = 0;
        }
        bmap[o.id] = {
          rutin: o.bugunRutinTarihi === bugun,
          gunlukSoru: o.bugunSoruTarihi === bugun,
          soruToplam: 0,
          calisma: o.sonCalismaTarihi === bugun,
          bugunAktif: sonAktifMs >= bugunBaslangic,
          sonAktif: o.sonAktif ?? null,
          girisSayisi: o.bugunGirisSayisi ?? 0,
        };
      });
      setBugunMap(bmap);
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  }, [kocUid]);

  useEffect(() => {
    getir();
  }, [getir]);

  return { ogrenciler, dashboardMap, bugunMap, yukleniyor, yenile: getir };
}
