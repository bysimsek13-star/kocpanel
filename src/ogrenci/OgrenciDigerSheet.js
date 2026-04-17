import React from 'react';
import PropTypes from 'prop-types';

const DIGER_ITEMS = [
  { key: 'gunluk_soru', label: 'Soru çözümü', ikon: '📝' },
  { key: 'mufredat', label: 'İlerleyişim', ikon: '📈' },
  { key: 'duyurular', label: 'Duyurular', ikon: '📢' },
  { key: 'destek', label: 'Destek', ikon: '🆘' },
];

export default function OgrenciDigerSheet({ digerAcik, aktif, onKapat, onNav, s }) {
  if (!digerAcik) return null;

  return (
    <>
      <div
        onClick={onKapat}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 149,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 56,
          left: 0,
          right: 0,
          zIndex: 150,
          background: s.surface,
          borderRadius: '20px 20px 0 0',
          borderTop: `1px solid ${s.border}`,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
          animation: 'ogrSheetUp .22s cubic-bezier(.32,1.2,.4,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: s.border }} />
        </div>
        <div style={{ padding: '4px 16px 20px' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: s.text3,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '6px 2px 10px',
            }}
          >
            Diğer sayfalar
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {DIGER_ITEMS.map(item => {
              const on = aktif === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNav(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    border: `1px solid ${on ? s.accent : s.border}`,
                    background: on ? s.accentSoft : s.surface2,
                    borderRadius: 12,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: on ? s.accent : s.text2,
                    fontSize: 13,
                    fontWeight: on ? 600 : 500,
                    touchAction: 'manipulation',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.ikon}</span>
                  <span style={{ flex: 1, lineHeight: 1.3 }}>{item.label}</span>
                  {on && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: s.accent,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

OgrenciDigerSheet.propTypes = {
  digerAcik: PropTypes.bool.isRequired,
  aktif: PropTypes.string,
  onKapat: PropTypes.func.isRequired,
  onNav: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
