import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { haftalikOzetOlustur } from '../../utils/timelineUtils';
import { generateSuggestions } from '../../utils/ogrenciUtils';
import { bugunStr } from '../../utils/tarih';
import { haftaBaslangici, programV2ToGorevler } from '../../utils/programAlgoritma';

const BUGUN = bugunStr;
const DENEME_LIMIT = 5;
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

// Oturum içi cache — koç paneli her navigasyonda yeniden fetch yapmaz
const _cache = new Map();

function cacheAl(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    _cache.delete(key);
    return null;
  }
  return entry.veri;
}

function cacheSakla(key, veri) {
  _cache.set(key, { veri, ts: Date.now() });
}

export const _testCacheTemizle = () => _cache.clear();

export default function useKocVeri(kocUid) {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [dashboardMap, setDashboardMap] = useState({});
  const [bugunMap, setBugunMap] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  const getir = useCallback(
    async ({ zorla = false } = {}) => {
      if (!kocUid) return;
      const haftaKey = haftaBaslangici();
      const cacheKey = `${kocUid}_${haftaKey}`;

      if (!zorla) {
        const cached = cacheAl(cacheKey);
        if (cached) {
          setOgrenciler(cached.ogrenciler);
          setDashboardMap(cached.dashboardMap);
          setBugunMap(cached.bugunMap);
          setYukleniyor(false);
          return;
        }
      }

      setYukleniyor(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'ogrenciler'), where('kocId', '==', kocUid))
        );
        const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOgrenciler(liste);

        const [programSnaplar, denemeSnaplar] = await Promise.all([
          Promise.allSettled(
            liste.map(o => getDoc(doc(db, 'ogrenciler', o.id, 'program_v2', haftaKey)))
          ),
          Promise.allSettled(
            liste.map(o =>
              getDocs(
                query(
                  collection(db, 'ogrenciler', o.id, 'denemeler'),
                  orderBy('tarih', 'desc'),
                  limit(DENEME_LIMIT)
                )
              )
            )
          ),
        ]);

        const dmap = {};
        liste.forEach((o, i) => {
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

        const bugun = BUGUN();
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

        cacheSakla(cacheKey, { ogrenciler: liste, dashboardMap: dmap, bugunMap: bmap });
      } catch (e) {
        console.error(e);
      }
      setYukleniyor(false);
    },
    [kocUid]
  );

  // Cache'i temizleyip zorla yenile (koç elle yenileme istediğinde)
  const yenile = useCallback(() => {
    _cache.delete(`${kocUid}_${haftaBaslangici()}`);
    getir({ zorla: true });
  }, [kocUid, getir]);

  useEffect(() => {
    getir();
  }, [getir]);

  return { ogrenciler, dashboardMap, bugunMap, yukleniyor, yenile };
}
