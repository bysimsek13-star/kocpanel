import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  onSnapshot,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { lcpRenk, lcpEtiket, saglikDurumu } from './sistemDurumuUtils';
import {
  CanlıNokta,
  HataListesi,
  RolDagilim,
  SorunluSayfalar,
  WebVitalOzet,
} from './SistemDurumuKart';

export default function SistemDurumuPaneli() {
  const { s } = useTheme();
  const mobil = useMobil();

  const [hatalar, setHatalar] = useState([]);
  const [perf, setPerf] = useState([]);
  const [sayilar, setSayilar] = useState({ aktif: 0, ogrenci: 0 });
  const [yuklendi, setYuklendi] = useState(false);
  const yeniHataId = useRef(null);
  const [yeniFlash, setYeniFlash] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      getCountFromServer(query(collection(db, 'kullanicilar'), where('aktif', '!=', false))),
      getCountFromServer(query(collection(db, 'kullanicilar'), where('rol', '==', 'ogrenci'))),
    ]).then(([a, b]) => {
      setSayilar({
        aktif: a.status === 'fulfilled' ? a.value.data().count : 0,
        ogrenci: b.status === 'fulfilled' ? b.value.data().count : 0,
      });
    });
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'istemciHataKayitlari'),
      orderBy('olusturma', 'desc'),
      limit(30)
    );
    const unsub = onSnapshot(
      q,
      snap => {
        const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHatalar(liste);
        setYuklendi(true);
        if (snap.docChanges().some(c => c.type === 'added') && yeniHataId.current !== null) {
          const yeni = snap.docChanges().find(c => c.type === 'added');
          if (yeni) {
            setYeniFlash(yeni.doc.id);
            setTimeout(() => setYeniFlash(null), 2000);
          }
        }
        yeniHataId.current = liste[0]?.id || null;
      },
      () => setYuklendi(true)
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'istemciPerformans'), orderBy('olusturma', 'desc'), limit(60));
    const unsub = onSnapshot(
      q,
      snap => {
        setPerf(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      () => {}
    );
    return () => unsub();
  }, []);

  const simdi = Date.now();
  const hata1s = hatalar.filter(h => {
    const d = h.olusturma?.toDate?.();
    return d && simdi - d.getTime() < 3600000;
  }).length;
  const hata24s = hatalar.filter(h => {
    const d = h.olusturma?.toDate?.();
    return d && simdi - d.getTime() < 86400000;
  }).length;
  const saglik = saglikDurumu(hata1s, hata24s);

  const perfOzet = useMemo(() => {
    const bul = isim => {
      const vals = perf
        .filter(p => p.isim === isim && typeof p.deger === 'number')
        .map(p => p.deger);
      if (!vals.length) return '—';
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    };
    return { lcp: bul('LCP'), inp: bul('INP'), cls: bul('CLS') };
  }, [perf]);

  const rolHata = useMemo(() => {
    const map = {};
    hatalar.forEach(h => {
      const r = h.rol || 'bilinmiyor';
      map[r] = (map[r] || 0) + 1;
    });
    return map;
  }, [hatalar]);

  const sayfaHata = useMemo(() => {
    const map = {};
    hatalar.forEach(h => {
      if (!h.path) return;
      const k = h.path.split('?')[0];
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [hatalar]);

  if (!yuklendi) {
    return (
      <div
        style={{
          padding: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: s.text3,
          fontSize: 14,
        }}
      >
        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
        Sistem durumu yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ padding: mobil ? 16 : 28, maxWidth: 1100 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: s.text, margin: 0 }}>
              Sistem Durumu
            </h2>
            <CanlıNokta />
          </div>
          <div style={{ fontSize: 13, color: s.text2, marginTop: 3 }}>
            Öğrenci hataları ve performans — gerçek zamanlı
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: `${saglik.renk}15`,
            border: `1px solid ${saglik.renk}40`,
            borderRadius: 12,
            padding: '8px 16px',
          }}
        >
          <span style={{ fontSize: 16 }}>{saglik.ikon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: saglik.renk }}>{saglik.etiket}</div>
            <div style={{ fontSize: 10, color: s.text3 }}>Son 1 saatte {hata1s} hata</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobil ? 'repeat(2,1fr)' : 'repeat(5,1fr)',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          { label: 'Aktif Kullanıcı', val: sayilar.aktif, renk: '#10B981', alt: 'sistemde' },
          { label: 'Toplam Öğrenci', val: sayilar.ogrenci, renk: '#5B4FE8', alt: 'kayıtlı' },
          {
            label: 'Son 1s Hata',
            val: hata1s,
            renk: hata1s > 0 ? '#F43F5E' : '#10B981',
            alt: 'yeni hata',
          },
          {
            label: 'Son 24s Hata',
            val: hata24s,
            renk: hata24s > 4 ? '#F43F5E' : hata24s > 0 ? '#F59E0B' : '#10B981',
            alt: 'toplam',
          },
          {
            label: 'Ort. LCP',
            val: perfOzet.lcp === '—' ? '—' : `${(perfOzet.lcp / 1000).toFixed(1)}s`,
            renk: lcpRenk(perfOzet.lcp),
            alt: perfOzet.lcp === '—' ? 'veri yok' : lcpEtiket(perfOzet.lcp),
          },
        ].map(m => (
          <div
            key={m.label}
            style={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: s.text3,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 6,
              }}
            >
              {m.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: m.renk, lineHeight: 1 }}>
              {m.val}
            </div>
            <div style={{ fontSize: 11, color: s.text3, marginTop: 4 }}>{m.alt}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobil ? '1fr' : '1.5fr 1fr',
          gap: 14,
          marginBottom: 14,
        }}
      >
        <HataListesi hatalar={hatalar} yeniFlash={yeniFlash} s={s} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <RolDagilim rolHata={rolHata} s={s} />
          <SorunluSayfalar sayfaHata={sayfaHata} s={s} />
          <WebVitalOzet perfOzet={perfOzet} perf={perf} s={s} />
        </div>
      </div>

      <style>{`
        @keyframes canliNokta {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
