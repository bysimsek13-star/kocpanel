import React from 'react';
import PropTypes from 'prop-types';

export default function SonDenemeKart({ denemeler, onNav, s }) {
  const son = denemeler[0];
  const onceki = denemeler[1];
  if (!son) return null;

  const fark = onceki
    ? (parseFloat(son.toplamNet) - parseFloat(onceki.toplamNet)).toFixed(1)
    : null;
  const artti = fark !== null && parseFloat(fark) > 0;

  return (
    <div
      onClick={() => onNav('denemeler')}
      style={{
        background: s.surface2,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        padding: '14px 18px',
        marginBottom: 16,
        cursor: 'pointer',
        boxShadow: s.shadowCard || s.shadow,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          flexShrink: 0,
          background: s.accentSoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: s.accent,
        }}
      >
        NET
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: s.text3, marginBottom: 2 }}>
          Son deneme · {son.tarih}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: s.text }}>{son.toplamNet} net</div>
        {artti && (
          <div style={{ fontSize: 12, color: s.success ?? s.ok, marginTop: 1 }}>
            +{fark} önceki denemeden
          </div>
        )}
      </div>
      <div style={{ color: s.text3, fontSize: 16 }}>→</div>
    </div>
  );
}

SonDenemeKart.propTypes = {
  denemeler: PropTypes.arrayOf(PropTypes.object),
  onNav: PropTypes.func,
  s: PropTypes.object.isRequired,
};
