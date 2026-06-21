import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const TUR_IKON = { kitap: '📖', video: '📹', makale: '📄', podcast: '🎙', diger: '📎' };

export default function DersKaynaklari({ dersAdi, s }) {
  const [kaynaklar, setKaynaklar] = useState([]);

  useEffect(() => {
    if (!dersAdi) return;
    getDocs(query(collection(db, 'kutuphane'), where('ilgiliDersler', 'array-contains', dersAdi)))
      .then(snap => setKaynaklar(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => setKaynaklar([]));
  }, [dersAdi]);

  if (!kaynaklar.length) return null;

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: `1px solid ${s.border}`,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: s.text3, marginBottom: 8 }}>
        Bu derse ait kaynaklar
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {kaynaklar.map(k => (
          <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>{TUR_IKON[k.tur] || TUR_IKON.diger}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              {k.link ? (
                <a
                  href={k.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 12,
                    color: s.accent,
                    fontWeight: 600,
                    textDecoration: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {k.baslik}
                </a>
              ) : (
                <div
                  style={{
                    fontSize: 12,
                    color: s.text,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {k.baslik}
                </div>
              )}
              {k.yazar && (
                <div style={{ fontSize: 10, color: s.text3, marginTop: 1 }}>{k.yazar}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

DersKaynaklari.propTypes = {
  dersAdi: PropTypes.string.isRequired,
  s: PropTypes.object.isRequired,
};
