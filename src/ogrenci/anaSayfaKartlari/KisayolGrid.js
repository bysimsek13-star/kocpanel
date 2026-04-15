import React from 'react';
import PropTypes from 'prop-types';

export default function KisayolGrid({ onNav, okunmamis, s }) {
  const renkler = [s.chart1, s.info, s.warning, s.danger, s.chart5, s.success];
  const kutular = [
    { key: 'program', baslik: 'Programım', aciklama: 'Haftalık ders planı' },
    { key: 'rutin', baslik: 'Günlük rutin', aciklama: 'Rutin takibi' },
    { key: 'denemeler', baslik: 'Denemeler', aciklama: 'Net analizi' },
    {
      key: 'mesajlar',
      baslik: 'Koç mesajları',
      aciklama: okunmamis > 0 ? `${okunmamis} okunmamış` : 'Mesajlar',
      badge: okunmamis,
    },
    { key: 'mufredat', baslik: 'İlerleyişim', aciklama: 'Konu takibi' },
    { key: 'gunluk_soru', baslik: 'Soru çözümü', aciklama: 'Günlük kayıt' },
  ];

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}
    >
      {kutular.map((k, i) => {
        const renk = renkler[i] ?? s.accent;
        return (
          <div
            key={k.key}
            onClick={() => onNav(k.key)}
            style={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderTop: `3px solid ${renk}`,
              borderRadius: 12,
              padding: '14px 16px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform .18s ease, box-shadow .18s ease',
              boxShadow: s.shadow,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.boxShadow = s.shadowHover ?? s.shadowCard ?? s.shadow;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = s.shadow;
            }}
          >
            {k.badge > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: s.danger ?? s.tehlika,
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: '1px 6px',
                }}
              >
                {k.badge}
              </div>
            )}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: `${renk}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                color: renk,
                marginBottom: 10,
                letterSpacing: '-0.02em',
              }}
            >
              {k.baslik.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 2 }}>
              {k.baslik}
            </div>
            <div style={{ fontSize: 11, color: s.text3 }}>{k.aciklama}</div>
          </div>
        );
      })}
    </div>
  );
}

KisayolGrid.propTypes = {
  onNav: PropTypes.func,
  okunmamis: PropTypes.number,
  s: PropTypes.object.isRequired,
};
