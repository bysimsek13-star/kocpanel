import React, { useState, useEffect, useCallback } from 'react';
import { collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { LoadingState } from '../components/Shared';
import { AYLAR, DONEM_RENKLER, yilHaftalari, HaftaHucresi } from './senelikProgramUtils';
import { HaftaDetayPanel } from './SenelikProgramHafta';

// ─── Öğrenci yıllık takvimi ───────────────────────────────────────────────────
export function OgrenciTakvimi({ ogrenci, yil, s, mobil: _mobil }) {
  const [kayitlar, setKayitlar] = useState({});
  const [denemeTarihleri, setDenemeTarihleri] = useState(new Set());
  const [seciliHafta, setSeciliHafta] = useState(null);
  const [_kaydediliyor, setKaydediliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);

  const haftalar = yilHaftalari(yil);

  // Kayıtları yükle
  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const snap = await getDoc(doc(db, 'ogrenciler', ogrenci.id, 'senelikProgram', String(yil)));
      if (snap.exists()) setKayitlar(snap.data().haftalar || {});
      else setKayitlar({});

      // Deneme tarihlerini al
      const dSnap = await getDocs(collection(db, 'ogrenciler', ogrenci.id, 'denemeler'));
      const tarihler = new Set();
      dSnap.docs.forEach(d => {
        const t = d.data().tarih;
        if (t) {
          const hafta = haftalar.find(h => {
            const bt = h.bitis;
            const bs = `${bt.getFullYear()}-${String(bt.getMonth() + 1).padStart(2, '0')}-${String(bt.getDate()).padStart(2, '0')}`;
            return t >= h.key && t <= bs;
          });
          if (hafta) tarihler.add(hafta.key);
        }
      });
      setDenemeTarihleri(tarihler);
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  }, [ogrenci.id, yil]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    yukle();
  }, [yukle]);

  const kaydet = async (haftaKey, veri) => {
    setKaydediliyor(true);
    try {
      const yeniKayitlar = { ...kayitlar, [haftaKey]: veri };
      if (!veri.donemIdx && veri.donemIdx !== 0 && !veri.not && !veri.sinav) {
        delete yeniKayitlar[haftaKey];
      }
      setKayitlar(yeniKayitlar);
      await setDoc(
        doc(db, 'ogrenciler', ogrenci.id, 'senelikProgram', String(yil)),
        { haftalar: yeniKayitlar },
        { merge: true }
      );
    } catch (e) {
      console.error(e);
    }
    setKaydediliyor(false);
    setSeciliHafta(null);
  };

  // Ay gruplarına böl
  const ayGruplari = AYLAR.map((ayAdi, ayIdx) => ({
    ayAdi,
    haftalar: haftalar.filter(
      h => h.ay === ayIdx || (h.ay !== ayIdx && h.ay2 === ayIdx && h.bas.getDate() <= 7)
    ),
  })).filter(g => g.haftalar.length > 0);

  if (yukleniyor)
    return (
      <div style={{ padding: 20 }}>
        <LoadingState />
      </div>
    );

  const _d = new Date();
  const kpiBugun = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;
  const kpiVeri = [
    { l: 'İşaretli hafta', v: Object.keys(kayitlar).length },
    { l: 'Sınav haftası', v: Object.values(kayitlar).filter(k => k.sinav).length },
    { l: 'Tatil', v: Object.values(kayitlar).filter(k => k.donemIdx === 3).length },
    { l: 'Kalan hafta', v: haftalar.filter(h => h.key >= kpiBugun).length },
  ];

  return (
    <div>
      {/* KPI şeridi */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {kpiVeri.map(item => (
          <div
            key={item.l}
            style={{
              background: s.surface2,
              borderRadius: 10,
              padding: '8px 14px',
              border: `1px solid ${s.border}`,
              textAlign: 'center',
              minWidth: 72,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: s.text, lineHeight: 1 }}>
              {item.v}
            </div>
            <div style={{ fontSize: 10, color: s.text3, marginTop: 3 }}>{item.l}</div>
          </div>
        ))}
      </div>

      {/* Ay başlıklı grid */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 16, paddingBottom: 8 }}>
        {ayGruplari.map(({ ayAdi, haftalar: ayHaftalari }) => (
          <div key={ayAdi} style={{ flexShrink: 0, minWidth: ayHaftalari.length * 52 + 8 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: s.text3,
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
              }}
            >
              {ayAdi}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {ayHaftalari.map(hafta => {
                const kayit = kayitlar[hafta.key];
                const donem = kayit?.donemIdx >= 0 ? DONEM_RENKLER[kayit.donemIdx] : null;
                return (
                  <div key={hafta.key} style={{ width: 48 }}>
                    <HaftaHucresi
                      hafta={hafta}
                      donem={donem}
                      denemeVar={denemeTarihleri.has(hafta.key)}
                      sinav={kayit?.sinav}
                      secili={seciliHafta?.key === hafta.key}
                      onClick={() => setSeciliHafta(hafta)}
                      s={s}
                    />
                    {kayit?.sinavAdi && (
                      <div
                        style={{
                          fontSize: 8,
                          color: '#9B5E5E',
                          textAlign: 'center',
                          marginTop: 2,
                          lineHeight: 1.2,
                          maxWidth: 48,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {kayit.sinavAdi}
                      </div>
                    )}
                    {kayit?.not && !kayit?.sinavAdi && (
                      <div
                        style={{
                          fontSize: 8,
                          color: s.text3,
                          textAlign: 'center',
                          marginTop: 2,
                          lineHeight: 1.2,
                          maxWidth: 48,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {kayit.not}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lejant */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
        {DONEM_RENKLER.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: d.renk }} />
            <span style={{ fontSize: 10, color: s.text3 }}>{d.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent }} />
          <span style={{ fontSize: 10, color: s.text3 }}>Deneme</span>
        </div>
      </div>

      {/* Hafta detay paneli */}
      {seciliHafta && (
        <HaftaDetayPanel
          hafta={seciliHafta}
          kayit={kayitlar[seciliHafta.key]}
          onKapat={() => setSeciliHafta(null)}
          onKaydet={veri => kaydet(seciliHafta.key, veri)}
          ogrenci={ogrenci}
          s={s}
        />
      )}
    </div>
  );
}
