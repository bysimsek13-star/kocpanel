import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { mufredatAnahtarlariniBelirle } from '../utils/ogrenciBaglam';

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

export default function SlotKonuSecici({ ders, ogrenciTur, ogrenciSinif, onSec, s }) {
  const [konular, setKonular] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (!ders?.trim() || !ogrenciTur) {
      setKonular([]);
      return;
    }
    let aktif = true;

    const timer = setTimeout(async () => {
      setYukleniyor(true);
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
          console.error('SlotKonuSecici:', e);
        }
      }

      if (aktif) setKonular(bulunan);
      if (aktif) setYukleniyor(false);
    }, 400);

    return () => {
      aktif = false;
      clearTimeout(timer);
    };
  }, [ders, ogrenciTur, ogrenciSinif]);

  if (!yukleniyor && konular.length === 0) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: s.text3, marginBottom: 5 }}>
        Müfredattan seç
      </div>
      {yukleniyor ? (
        <div style={{ fontSize: 11, color: s.text3 }}>Yükleniyor…</div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            maxHeight: 120,
            overflowY: 'auto',
          }}
        >
          {konular.map(k => (
            <button
              key={k.id}
              type="button"
              onClick={() => onSec(k.ad)}
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                border: `1px solid ${s.accent}50`,
                background: `${s.accent}12`,
                color: s.accent,
                transition: 'background .12s',
              }}
            >
              {k.ad}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

SlotKonuSecici.propTypes = {
  ders: PropTypes.string,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSec: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
