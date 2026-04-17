import React, { useState } from 'react';
import PropTypes from 'prop-types';
import OgrenciDigerSheet from './OgrenciDigerSheet';

const DIGER_KEYS = ['gunluk_soru', 'mufredat', 'duyurular', 'destek'];

const ANA_TABLAR = [
  { key: 'ana', label: 'Ana', ikon: '🏠' },
  { key: 'program', label: 'Program', ikon: '📅' },
  { key: 'rutin', label: 'Rutin', ikon: '✅' },
  { key: 'mesajlar', label: 'Mesajlar', ikon: '💬' },
  { key: 'denemeler', label: 'Deneme', ikon: '📊' },
];

export default function AltTabBar({ aktif, onNav, okunmamis, s }) {
  const [digerAcik, setDigerAcik] = useState(false);

  const digerAktifMi = DIGER_KEYS.includes(aktif);
  const handleNav = key => {
    onNav(key);
    setDigerAcik(false);
  };

  return (
    <>
      <OgrenciDigerSheet
        digerAcik={digerAcik}
        aktif={aktif}
        onKapat={() => setDigerAcik(false)}
        onNav={handleNav}
        s={s}
      />

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 151,
          background: s.surface,
          borderTop: `1px solid ${s.border}`,
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -2px 8px rgba(15,23,42,0.08)',
        }}
      >
        {ANA_TABLAR.map(tab => {
          const on = aktif === tab.key;
          const badge = tab.key === 'mesajlar' ? okunmamis : 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setDigerAcik(false);
                onNav(tab.key);
              }}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                padding: '8px 4px 6px',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                minHeight: 56,
                touchAction: 'manipulation',
              }}
            >
              {on && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 32,
                    height: 3,
                    borderRadius: 99,
                    background: s.accent,
                  }}
                />
              )}
              {badge > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: '50%',
                    marginLeft: 6,
                    background: '#F43F5E',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: '1px 5px',
                    minWidth: 14,
                    textAlign: 'center',
                    lineHeight: '14px',
                  }}
                >
                  {badge}
                </div>
              )}
              <div
                style={{
                  fontSize: 20,
                  lineHeight: 1,
                  filter: on ? 'none' : 'grayscale(0.5) opacity(0.55)',
                  transition: 'filter .15s',
                }}
              >
                {tab.ikon}
              </div>
              <div
                style={{ fontSize: 10, fontWeight: on ? 700 : 400, color: on ? s.accent : s.text3 }}
              >
                {tab.label}
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setDigerAcik(v => !v)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '8px 4px 6px',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            minHeight: 56,
            touchAction: 'manipulation',
          }}
        >
          {digerAktifMi && !digerAcik && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 32,
                height: 3,
                borderRadius: 99,
                background: s.accent,
              }}
            />
          )}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: digerAcik || digerAktifMi ? s.accentSoft : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: digerAcik || digerAktifMi ? s.accent : s.text3,
              transition: 'background .15s, color .15s',
            }}
          >
            ⋯
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: digerAcik || digerAktifMi ? 700 : 400,
              color: digerAcik || digerAktifMi ? s.accent : s.text3,
            }}
          >
            Diğer
          </div>
        </button>
      </div>

      <style>{`
        @keyframes ogrSheetUp {
          from { transform:translateY(100%); opacity:0.6; }
          to   { transform:translateY(0);    opacity:1; }
        }
      `}</style>
    </>
  );
}

AltTabBar.propTypes = {
  aktif: PropTypes.string,
  onNav: PropTypes.func.isRequired,
  okunmamis: PropTypes.number,
  s: PropTypes.object.isRequired,
};
