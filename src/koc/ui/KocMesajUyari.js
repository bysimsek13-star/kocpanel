import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/Shared';
import { renkler } from '../../data/konular';
import { useKoc } from '../../context/KocContext';

export default function KocMesajUyari({ onSec }) {
  const { ogrenciler, okunmamisMap: okunmasisMap } = useKoc();
  const { s } = useTheme();
  const mesajBekleyen = ogrenciler.filter(o => (okunmasisMap?.[o.id] || 0) > 0);
  if (!mesajBekleyen.length) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: s.tehlika,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.tehlika }} />
        Okunmamış öğrenci mesajı ({mesajBekleyen.length})
      </div>
      {mesajBekleyen.map((o, i) => (
        <div
          key={o.id}
          onClick={() => onSec(o, 'mesajlar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: s.tehlikaSoft,
            border: `1px solid ${s.border}`,
            borderRadius: 12,
            cursor: 'pointer',
            marginBottom: 6,
          }}
        >
          <Avatar isim={o.isim} renk={renkler[i % renkler.length]} boyut={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{o.isim}</div>
            <div style={{ fontSize: 11, color: s.tehlika, marginTop: 2 }}>
              {okunmasisMap[o.id]} mesaj bekliyor
            </div>
          </div>
          <div style={{ color: s.accent, fontSize: 15 }}>→</div>
        </div>
      ))}
    </div>
  );
}

KocMesajUyari.propTypes = {
  onSec: PropTypes.func,
};
