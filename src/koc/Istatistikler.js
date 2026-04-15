import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { LoadingState } from '../components/Shared';
import { dateToStr } from '../utils/tarih';
import { KocHeroBand, KocKpiStrip } from '../components/koc/KocPanelUi';
import {
  ARALIK_SECENEKLER,
  hesaplaKpiler,
  hesaplaNetTrend,
  hesaplaCalismaTrend,
  hesaplaOgrenciDurum,
  hesaplaZayifKonular,
} from './istatistiklerUtils';
import { NetTrendGrafik, CalismaBarGrafik } from './IstatistiklerGrafikler';
import { OgrenciDurumTablosu, KonuYogunlugu } from './IstatistiklerTablo';

export default function IstatistiklerSayfasi({ ogrenciler, onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const [veriler, setVeriler] = useState({ den: {}, cal: {}, prog2: {} });
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliOgrenci, setSeciliOgrenci] = useState('hepsi');
  const [aralik, setAralik] = useState(30);

  useEffect(() => {
    const getir = async () => {
      const sonuclar = await Promise.all(
        ogrenciler.map(async o => {
          try {
            const [ds, cs, ps] = await Promise.all([
              getDocs(
                query(
                  collection(db, 'ogrenciler', o.id, 'denemeler'),
                  orderBy('tarih', 'desc'),
                  limit(50)
                )
              ),
              getDocs(collection(db, 'ogrenciler', o.id, 'calisma')),
              getDocs(
                query(
                  collection(db, 'ogrenciler', o.id, 'program_v2'),
                  orderBy('guncelleme', 'desc'),
                  limit(14)
                )
              ),
            ]);
            return {
              id: o.id,
              den: ds.docs.map(d => ({ id: d.id, ...d.data() })),
              cal: cs.docs.map(d => ({ id: d.id, tarih: d.id, ...d.data() })),
              prog2: ps.docs.map(d => ({ id: d.id, ...d.data() })),
            };
          } catch {
            return { id: o.id, den: [], cal: [], prog2: [] };
          }
        })
      );
      const den = {},
        cal = {},
        prog2 = {};
      sonuclar.forEach(r => {
        den[r.id] = r.den;
        cal[r.id] = r.cal;
        prog2[r.id] = r.prog2;
      });
      setVeriler({ den, cal, prog2 });
      setYukleniyor(false);
    };
    getir();
  }, [ogrenciler]);

  const aralikTarih = useMemo(() => {
    if (!aralik) return null;
    const d = new Date();
    d.setDate(d.getDate() - aralik);
    return dateToStr(d);
  }, [aralik]);

  const hedefOgrenciler = useMemo(
    () => (seciliOgrenci === 'hepsi' ? ogrenciler : ogrenciler.filter(o => o.id === seciliOgrenci)),
    [ogrenciler, seciliOgrenci]
  );

  const filtreliDen = useMemo(() => {
    const result = {};
    hedefOgrenciler.forEach(o => {
      result[o.id] = (veriler.den[o.id] || []).filter(d => !aralikTarih || d.tarih >= aralikTarih);
    });
    return result;
  }, [hedefOgrenciler, veriler.den, aralikTarih]);

  const kpiler = useMemo(
    () => hesaplaKpiler(ogrenciler, veriler, aralikTarih),
    [ogrenciler, veriler, aralikTarih]
  );
  const netTrendVeri = useMemo(
    () => hesaplaNetTrend(hedefOgrenciler, filtreliDen),
    [hedefOgrenciler, filtreliDen]
  );
  const calismaTrendVeri = useMemo(
    () => hesaplaCalismaTrend(hedefOgrenciler, veriler),
    [hedefOgrenciler, veriler]
  );
  const ogrenciDurum = useMemo(
    () => hesaplaOgrenciDurum(ogrenciler, veriler),
    [ogrenciler, veriler]
  );
  const zayifKonularDersle = useMemo(
    () => hesaplaZayifKonular(hedefOgrenciler, filtreliDen),
    [hedefOgrenciler, filtreliDen]
  );

  const ozetItems = [
    { label: 'Öğrenci', deger: kpiler.n, alt: 'Kayıtlı', vurgu: s.accent },
    {
      label: 'Ort. Son Net',
      deger: kpiler.ortSonNet,
      alt: 'Tüm öğrenciler',
      vurgu: s.chartPos || '#22c55e',
    },
    {
      label: 'Çalışma Saati',
      deger: `${kpiler.topCalisma}s`,
      alt: aralik ? `Son ${aralik} gün` : 'Tüm zamanlar',
      vurgu: s.uyari || '#f59e0b',
    },
    { label: 'Program Ort.', deger: `%${kpiler.ortProgTam}`, alt: 'Tamamlanma', vurgu: s.accent },
    {
      label: 'Risk Altında',
      deger: kpiler.riskSayisi,
      alt: 'Net < 15 veya çalışmama',
      vurgu: s.danger || '#ef4444',
    },
  ];

  const sagSlot = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {ARALIK_SECENEKLER.map(a => (
        <button
          key={a.deger}
          onClick={() => setAralik(a.deger)}
          style={{
            padding: '7px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: aralik === a.deger ? 700 : 500,
            background: aralik === a.deger ? s.accent : s.surface,
            color: aralik === a.deger ? s.buttonText || '#fff' : s.text2,
            border: `1px solid ${aralik === a.deger ? s.accent : s.border}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {a.label}
        </button>
      ))}
      <select
        value={seciliOgrenci}
        onChange={e => setSeciliOgrenci(e.target.value)}
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: '7px 12px',
          color: s.text,
          fontSize: 12,
          outline: 'none',
          fontWeight: 500,
          marginLeft: 4,
        }}
      >
        <option value="hepsi">Tüm öğrenciler</option>
        {ogrenciler.map(o => (
          <option key={o.id} value={o.id}>
            {o.isim}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={{ padding: mobil ? 16 : 28 }}>
      <KocHeroBand
        baslik="İstatistikler"
        aciklama="Öğrenci bazlı net, çalışma ve program verisi. Detaylı sınav geçmişi her öğrencinin Denemeler sekmesindedir."
        onGeri={onGeri}
        mobil={mobil}
        sagSlot={sagSlot}
      />
      {yukleniyor ? (
        <LoadingState />
      ) : (
        <>
          <KocKpiStrip items={ozetItems} mobil={mobil} />
          <div style={{ marginBottom: 16 }}>
            <NetTrendGrafik veri={netTrendVeri} s={s} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <CalismaBarGrafik veri={calismaTrendVeri} s={s} />
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1.5fr 1fr', gap: 16 }}
          >
            <OgrenciDurumTablosu ogrenciDurum={ogrenciDurum} s={s} />
            <KonuYogunlugu zayifKonularDersle={zayifKonularDersle} s={s} />
          </div>
        </>
      )}
    </div>
  );
}
