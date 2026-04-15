import React from 'react';
import PropTypes from 'prop-types';

export default function KpiSerit({ items, s, mobil }) {
  const renkler = [s.chart1, s.chart4, s.chart3];
  const cols = mobil && items.length > 3 ? 2 : items.length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols},1fr)`,
        gap: 10,
        marginBottom: 20,
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          onClick={item.onClick}
          style={{
            background: s.surface,
            border: `1px solid ${s.border}`,
            borderTop: `3px solid ${renkler[i] || s.accent}`,
            borderRadius: 12,
            padding: mobil ? '12px 14px' : '14px 16px',
            cursor: item.onClick ? 'pointer' : 'default',
            boxShadow: s.shadow,
            touchAction: 'manipulation',
            transition: 'transform .18s ease, box-shadow .18s ease',
          }}
          onMouseEnter={e => {
            if (item.onClick) {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.boxShadow = s.shadowHover ?? s.shadowCard ?? s.shadow;
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = s.shadow;
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: s.text3,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              fontSize: mobil ? 18 : 20,
              fontWeight: 800,
              color: item.renk || renkler[i] || s.accent,
              lineHeight: 1,
            }}
          >
            {item.deger}
          </div>
          {item.alt && (
            <div style={{ fontSize: 11, color: s.text3, marginTop: 5, lineHeight: 1.4 }}>
              {item.alt}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

KpiSerit.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  s: PropTypes.object.isRequired,
  mobil: PropTypes.bool,
};
