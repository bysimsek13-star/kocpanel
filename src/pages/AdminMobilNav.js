import React from 'react';
import PropTypes from 'prop-types';
import { ALT_TABS, MENU } from './yoneticiPaneliSabitleri';
import { menuSatir } from './AdminSolMenu';

export default function AdminMobilNav({ aktifSayfa, sayfayaGit, menuAcik, setMenuAcik, s }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: s.surface,
          borderTop: `1px solid ${s.border}`,
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {ALT_TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => sayfayaGit(tab.key)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '10px 4px 8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: aktifSayfa === tab.key ? 650 : 450,
                color: aktifSayfa === tab.key ? s.accent : s.text3,
              }}
            >
              {tab.label}
            </div>
            {aktifSayfa === tab.key && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 22,
                  height: 2,
                  borderRadius: 99,
                  background: s.accent,
                }}
              />
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMenuAcik(true)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '10px 4px 8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 450, color: s.text3 }}>Diğer</div>
        </button>
      </div>

      {menuAcik && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div
            onClick={() => setMenuAcik(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
          />
          <div
            style={{
              position: 'relative',
              marginLeft: 'auto',
              width: 280,
              background: s.surface,
              borderLeft: `1px solid ${s.border}`,
              padding: '20px 12px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 12px 16px',
                marginBottom: 4,
                borderBottom: `1px solid ${s.border}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>Tüm Bölümler</div>
              <button
                onClick={() => setMenuAcik(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  color: s.text2,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            {MENU.map(item => menuSatir(item, aktifSayfa, sayfayaGit, () => setMenuAcik(false), s))}
          </div>
        </div>
      )}
    </>
  );
}

AdminMobilNav.propTypes = {
  aktifSayfa: PropTypes.string.isRequired,
  sayfayaGit: PropTypes.func.isRequired,
  menuAcik: PropTypes.bool.isRequired,
  setMenuAcik: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
