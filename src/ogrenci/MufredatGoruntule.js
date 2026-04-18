import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { LoadingState } from '../components/Shared';
import { mufredatAnahtarlariniBelirle } from '../utils/ogrenciBaglam';
import { dersiRenk } from './mufredatUtils';
import { Chip, NodSatiri } from './MufredatDers';

function dugumlerdenAgac(docs) {
  const harita = {};
  docs.forEach(d => {
    harita[d.id] = { ...d, _cocuklar: [] };
  });
  docs.forEach(d => {
    if (d.parentId && harita[d.parentId]) harita[d.parentId]._cocuklar.push(harita[d.id]);
  });
  Object.values(harita).forEach(n => n._cocuklar.sort((a, b) => (a.sira ?? 0) - (b.sira ?? 0)));
  return docs
    .filter(d => !d.parentId)
    .sort((a, b) => (a.sira ?? 0) - (b.sira ?? 0))
    .map(d => harita[d.id]);
}

function yapraklariTopla(dugum) {
  if (!dugum._cocuklar?.length) return [dugum.id];
  return dugum._cocuklar.flatMap(c => yapraklariTopla(c));
}

async function derslerGetir(anahtarlar) {
  const tumDersler = [];
  for (const anahtar of anahtarlar) {
    try {
      const dugSnap = await getDocs(collection(db, 'mufredat', anahtar, 'dugumler'));
      if (!dugSnap.empty) {
        const agac = dugumlerdenAgac(dugSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        tumDersler.push(...agac);
        continue;
      }
      const konSnap = await getDocs(
        query(collection(db, 'mufredat', anahtar, 'konular'), orderBy('sira'))
      );
      const grupHarita = {};
      konSnap.docs.forEach((d, i) => {
        const data = { id: d.id, ...d.data() };
        const key = data.dersLabel || data.ders || '—';
        if (!grupHarita[key]) {
          grupHarita[key] = {
            id: `fb_${key}`,
            ad: key,
            seviye: 1,
            sira: i,
            _cocuklar: [],
            kritik: false,
          };
        }
        grupHarita[key]._cocuklar.push({
          id: data.id,
          ad: data.konu,
          seviye: 3,
          sira: i,
          kritik: data.kritik || false,
          _cocuklar: [],
        });
      });
      tumDersler.push(...Object.values(grupHarita));
    } catch (e) {
      console.error('Müfredat alınamadı:', anahtar, e);
    }
  }
  return tumDersler;
}

export default function MufredatGoruntule({
  ogrenciId,
  ogrenciTur,
  ogrenciSinif,
  kocModu = false,
}) {
  const { s } = useTheme();
  const [konuDurumlar, setKonuDurumlar] = useState({});
  const [dersler, setDersler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [acikDers, setAcikDers] = useState(null);
  const [filtre, setFiltre] = useState('hepsi');
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const mufredatiGetir = useCallback(async () => {
    const anahtarlar = mufredatAnahtarlariniBelirle(ogrenciTur, ogrenciSinif);
    setDersler(await derslerGetir(anahtarlar));
  }, [ogrenciTur, ogrenciSinif]);

  const durumGetir = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'konu_takip'));
      const harita = {};
      snap.docs.forEach(d => {
        harita[d.id] = d.data();
      });
      setKonuDurumlar(harita);
    } catch (e) {
      console.error(e);
    }
  }, [ogrenciId]);

  useEffect(() => {
    setYukleniyor(true);
    Promise.all([mufredatiGetir(), durumGetir()]).finally(() => setYukleniyor(false));
  }, [mufredatiGetir, durumGetir]);

  const toggle = useCallback(
    async (konuId, hedef) => {
      const mevcutDurum = konuDurumlar[konuId]?.durum;
      const yeniDurum = mevcutDurum === hedef ? null : hedef;
      setKonuDurumlar(prev => ({
        ...prev,
        [konuId]: { ...(prev[konuId] || {}), durum: yeniDurum },
      }));
      setKaydediliyor(true);
      try {
        await setDoc(
          doc(db, 'ogrenciler', ogrenciId, 'konu_takip', konuId),
          {
            durum: yeniDurum,
            kaynak: 'koc',
            manuelMi: true,
            sonGuncellemeTipi: 'koc_isareti',
            sonDenemeTarihi: null,
            riskSeviyesi: yeniDurum === 'eksik' ? 'orta' : null,
            not: null,
            guncelleme: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.error(e);
        setKonuDurumlar(prev => ({
          ...prev,
          [konuId]: { ...(prev[konuId] || {}), durum: mevcutDurum },
        }));
      }
      setKaydediliyor(false);
    },
    [konuDurumlar, ogrenciId]
  );

  const { tamSayisi, eksikSayisi } = useMemo(() => {
    const vals = Object.values(konuDurumlar).map(v => v.durum);
    return {
      tamSayisi: vals.filter(v => v === 'tamamlandi').length,
      eksikSayisi: vals.filter(v => v === 'eksik').length,
    };
  }, [konuDurumlar]);

  if (yukleniyor) return <LoadingState />;

  const toplamKonu = dersler.reduce((acc, d) => acc + yapraklariTopla(d).length, 0);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: s.text }}>
          {kocModu ? 'Konu Takibi' : 'İlerleyişim'}
        </div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {tamSayisi > 0 && <Chip renk="#10B981">{tamSayisi} tamamlandı</Chip>}
          {eksikSayisi > 0 && <Chip renk="#F59E0B">{eksikSayisi} eksik</Chip>}
          {kaydediliyor && <span style={{ fontSize: 11, color: s.text3 }}>kaydediliyor…</span>}
        </div>
      </div>

      {toplamKonu === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: s.text3, fontSize: 14 }}>
          {kocModu
            ? 'Bu öğrenci için henüz müfredat yüklenmedi. Admin panelinden müfredat eklenebilir.'
            : 'Müfredatın henüz hazırlanmadı. Koçun en kısa sürede ekleyecek.'}
        </div>
      )}

      {!kocModu && toplamKonu > 0 && (tamSayisi > 0 || eksikSayisi > 0) && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { k: 'hepsi', l: 'Tümü' },
            { k: 'eksik', l: `⚠ Eksik` },
            { k: 'tamamlandi', l: `✓ Tamamlandı` },
          ].map(f => (
            <button
              key={f.k}
              onClick={() => setFiltre(f.k)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${filtre === f.k ? s.accent : s.border}`,
                background: filtre === f.k ? s.accent : 'transparent',
                color: filtre === f.k ? s.buttonText || '#fff' : s.text2,
              }}
            >
              {f.l}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dersler.map(ders => {
          const renk = dersiRenk(ders.ad);
          const yaprakIdleri = yapraklariTopla(ders);
          const dersTam = yaprakIdleri.filter(
            id => konuDurumlar[id]?.durum === 'tamamlandi'
          ).length;
          const dersEksik = yaprakIdleri.filter(id => konuDurumlar[id]?.durum === 'eksik').length;
          if (!kocModu && filtre !== 'hepsi') {
            const eslesen = filtre === 'tamamlandi' ? dersTam : dersEksik;
            if (eslesen === 0) return null;
          }
          const acik = acikDers === ders.id;

          return (
            <div
              key={ders.id}
              style={{
                background: s.surface,
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${acik ? renk + '80' : s.border}`,
                transition: 'border-color .2s',
              }}
            >
              <div
                onClick={() => setAcikDers(acik ? null : ders.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: renk,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>{ders.ad}</div>
                  {dersTam + dersEksik > 0 && (
                    <div
                      style={{
                        marginTop: 6,
                        height: 4,
                        background: s.surface3 || s.border,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ height: '100%', display: 'flex' }}>
                        <div
                          style={{
                            width: `${(dersTam / yaprakIdleri.length) * 100}%`,
                            background: '#10B981',
                            transition: 'width .4s',
                          }}
                        />
                        <div
                          style={{
                            width: `${(dersEksik / yaprakIdleri.length) * 100}%`,
                            background: '#F59E0B',
                            transition: 'width .4s',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {dersTam > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#10B981',
                        background: 'rgba(16,185,129,0.12)',
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      ✓ {dersTam}
                    </span>
                  )}
                  {dersEksik > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#F59E0B',
                        background: 'rgba(245,158,11,0.12)',
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      ⚠ {dersEksik}
                    </span>
                  )}
                  {dersTam > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        color: s.text3,
                        fontWeight: 600,
                        minWidth: 28,
                        textAlign: 'right',
                      }}
                    >
                      {Math.round((dersTam / yaprakIdleri.length) * 100)}%
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: s.text3,
                    fontSize: 11,
                    transform: acik ? 'rotate(90deg)' : 'none',
                    transition: 'transform .2s',
                    flexShrink: 0,
                  }}
                >
                  ▶
                </div>
              </div>

              {acik && (
                <div style={{ borderTop: `1px solid ${s.border}`, padding: '12px 18px 16px' }}>
                  {kocModu && (
                    <div
                      style={{
                        fontSize: 11,
                        color: s.text3,
                        marginBottom: 10,
                        fontWeight: 600,
                        letterSpacing: '.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Her konuya durum ata — öğrenci görecek
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {ders._cocuklar.map(c => (
                      <NodSatiri
                        key={c.id}
                        dugum={c}
                        konuDurumlar={konuDurumlar}
                        derinlik={0}
                        kocModu={kocModu}
                        onToggle={toggle}
                        s={s}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

MufredatGoruntule.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  kocModu: PropTypes.bool,
};
