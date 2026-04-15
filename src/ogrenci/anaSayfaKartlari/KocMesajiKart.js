import React from 'react';
import PropTypes from 'prop-types';

export default function KocMesajiKart({ mesaj, s }) {
  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.accent}`,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 16,
        boxShadow: s.shadow,
        transition: 'transform .18s ease, box-shadow .18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = s.shadowHover ?? s.shadowCard ?? s.shadow;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = s.shadow;
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: s.accent,
          marginBottom: 6,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Günün sözü
      </div>
      {mesaj ? (
        <>
          <div
            style={{
              fontSize: 13,
              color: s.text,
              lineHeight: 1.6,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {mesaj.metin}
          </div>
          <div style={{ fontSize: 11, color: s.text3, marginTop: 6 }}>
            {mesaj.guncelleme?.toDate?.()
              ? mesaj.guncelleme
                  .toDate()
                  .toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
              : ''}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: s.text3, fontStyle: 'italic' }}>
          Koçun henüz günün sözünü eklemedi.
        </div>
      )}
    </div>
  );
}

KocMesajiKart.propTypes = {
  mesaj: PropTypes.object,
  s: PropTypes.object.isRequired,
};
