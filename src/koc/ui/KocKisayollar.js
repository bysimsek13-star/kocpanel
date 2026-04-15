import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useMobil } from '../../hooks/useMediaQuery';

const KISAYOLLAR = [
  { k: 'haftalikprogram', l: 'Haftalık program', d: 'Etüt planı' },
  { k: 'gunluktakip', l: 'Günlük takip', d: 'Rutin & soru' },
  { k: 'denemeyonetimi', l: 'Denemeler', d: 'Giriş & analiz' },
  { k: 'istatistikler', l: 'İstatistikler', d: 'Grafikler' },
  { k: 'hedeftakibi', l: 'Hedefler', d: 'Takip' },
  { k: 'veliraporlari', l: 'Veli raporları', d: 'Özetler' },
];

export default function KocKisayollar({ onNav }) {
  const { s } = useTheme();
  const mobil = useMobil();

  return (
    <div style={{ marginTop: 4 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: s.text3,
          marginBottom: 12,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Kısayollar
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobil ? '1fr 1fr' : 'repeat(3,1fr)',
          gap: 10,
        }}
      >
        {KISAYOLLAR.map(item => (
          <div
            key={item.k}
            onClick={() => onNav(item.k)}
            style={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderRadius: 12,
              padding: '14px 14px 12px',
              cursor: 'pointer',
              boxShadow: s.shadowCard || s.shadow,
              borderLeft: `3px solid ${s.accent}`,
              transition: 'box-shadow .15s',
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.boxShadow = `0 4px 14px rgba(91,79,232,0.12)`)
            }
            onMouseLeave={e => (e.currentTarget.style.boxShadow = s.shadowCard || s.shadow)}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: s.text, lineHeight: 1.3 }}>
              {item.l}
            </div>
            <div style={{ fontSize: 11, color: s.text3, marginTop: 4 }}>{item.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

KocKisayollar.propTypes = {
  onNav: PropTypes.func.isRequired,
};
