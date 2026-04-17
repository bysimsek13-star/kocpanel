import React from 'react';
import PropTypes from 'prop-types';

export default function DenemeSilOnayModal({ deneme, onIptal, onSil, s }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
      onClick={onIptal}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 16,
          padding: 28,
          width: 340,
          maxWidth: '90vw',
          boxShadow: s.shadow,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 8 }}>
          Denemeyi sil
        </div>
        <div style={{ fontSize: 13, color: s.text2, marginBottom: 20 }}>
          <b>{deneme.sinav}</b> ({deneme.tarih}) denemesi silinecek. Bu işlem geri alınamaz.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onIptal}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: `1px solid ${s.border}`,
              background: s.surface2,
              color: s.text2,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            İptal
          </button>
          <button
            onClick={() => onSil(deneme.id)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              background: s.tehlika,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

DenemeSilOnayModal.propTypes = {
  deneme: PropTypes.object.isRequired,
  onIptal: PropTypes.func.isRequired,
  onSil: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
