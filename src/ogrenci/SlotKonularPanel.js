import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { mufredatAnahtarlariniBelirle } from '../utils/ogrenciBaglam';
import { DURUM } from './mufredatUtils';

function agacKur(docs) {
  const h = {};
  docs.forEach(d => {
    h[d.id] = { ...d, _cocuklar: [] };
  });
  docs.forEach(d => {
    if (d.parentId && h[d.parentId]) h[d.parentId]._cocuklar.push(h[d.id]);
  });
  Object.values(h).forEach(n => n._cocuklar.sort((a, b) => (a.sira ?? 0) - (b.sira ?? 0)));
  return docs
    .filter(d => !d.parentId)
    .sort((a, b) => (a.sira ?? 0) - (b.sira ?? 0))
    .map(d => h[d.id]);
}

function yapraklar(n) {
  if (!n._cocuklar?.length) return [n];
  return n._cocuklar.flatMap(c => yapraklar(c));
}

function adEslesiyor(a, b) {
  const al = (a || '').toLowerCase();
  const bl = (b || '').toLowerCase();
  return al.includes(bl) || bl.includes(al);
}

export default function SlotKonularPanel({ ders, ogrenciId, ogrenciTur, ogrenciSinif, s }) {
  const [konular, setKonular] = useState(null);
  const [durumlar, setDurumlar] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!ders || !ogrenciTur) {
      setYukleniyor(false);
      return;
    }
    let aktif = true;

    async function yukle() {
      const takipSnap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'konu_takip'));
      const durumHarita = {};
      takipSnap.docs.forEach(d => {
        durumHarita[d.id] = d.data();
      });

      const anahtarlar = mufredatAnahtarlariniBelirle(ogrenciTur, ogrenciSinif);
      let bulunan = [];

      for (const anahtar of anahtarlar) {
        try {
          const dugSnap = await getDocs(collection(db, 'mufredat', anahtar, 'dugumler'));
          if (!dugSnap.empty) {
            const agac = agacKur(dugSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            const eslesen = agac.filter(n => adEslesiyor(n.ad, ders));
            if (eslesen.length) {
              bulunan = eslesen.flatMap(n => yapraklar(n));
              break;
            }
            continue;
          }
          const konSnap = await getDocs(
            query(collection(db, 'mufredat', anahtar, 'konular'), orderBy('sira'))
          );
          const eslesen = konSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(d => adEslesiyor(d.dersLabel || d.ders, ders));
          if (eslesen.length) {
            bulunan = eslesen.map(d => ({ id: d.id, ad: d.konu }));
            break;
          }
        } catch (e) {
          console.error('SlotKonularPanel:', e);
        }
      }

      if (aktif) {
        setKonular(bulunan);
        setDurumlar(durumHarita);
      }
    }

    yukle().finally(() => {
      if (aktif) setYukleniyor(false);
    });
    return () => {
      aktif = false;
    };
  }, [ders, ogrenciId, ogrenciTur, ogrenciSinif]);

  if (yukleniyor)
    return <div style={{ padding: '6px 0', fontSize: 11, color: s.text3 }}>Yükleniyor…</div>;

  if (!konular?.length)
    return (
      <div style={{ padding: '6px 0', fontSize: 11, color: s.text3 }}>
        Müfredatta eşleşen konu bulunamadı.
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 6 }}>
      {konular.map(k => {
        const durum = durumlar[k.id]?.durum || null;
        const cfg = durum ? DURUM[durum] : null;
        return (
          <div
            key={k.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 10px',
              borderRadius: 8,
              background: cfg ? cfg.bg : s.surface2,
              border: `1px solid ${cfg ? cfg.renk + '40' : s.border}`,
            }}
          >
            <span style={{ flex: 1, fontSize: 12, color: s.text }}>{k.ad}</span>
            {cfg && (
              <span style={{ fontSize: 10, fontWeight: 700, color: cfg.renk }}>
                {cfg.ikon} {cfg.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

SlotKonularPanel.propTypes = {
  ders: PropTypes.string,
  ogrenciId: PropTypes.string.isRequired,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  s: PropTypes.object.isRequired,
};
