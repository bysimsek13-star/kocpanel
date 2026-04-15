import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

const DIGER_KEYS = [
  'istatistikler',
  'hedeftakibi',
  'denemeyonetimi',
  'senelikprogram',
  'veliraporlari',
  'duyurular',
  'gorevkutuphane',
  'kaynakkutuphane',
  'playlistler',
  'topluislemler',
];

const DIGER_GRUPLAR = [
  {
    baslik: 'Plan & analiz',
    items: [
      { key: 'haftalikprogram', label: 'Haftalık program', ikon: '📅' },
      { key: 'senelikprogram', label: 'Senelik program', ikon: '🗓️' },
      { key: 'denemeyonetimi', label: 'Deneme yönetimi', ikon: '📝' },
      { key: 'istatistikler', label: 'İstatistikler', ikon: '📊' },
      { key: 'hedeftakibi', label: 'Hedef takibi', ikon: '🎯' },
    ],
  },
  {
    baslik: 'İletişim',
    items: [
      { key: 'veliraporlari', label: 'Veli raporları', ikon: '👨‍👩‍👧' },
      { key: 'duyurular', label: 'Duyurular', ikon: '📢' },
    ],
  },
  {
    baslik: 'Araçlar',
    items: [
      { key: 'gorevkutuphane', label: 'Görev şablonları', ikon: '📋' },
      { key: 'kaynakkutuphane', label: 'Kaynak kütüphanesi', ikon: '📚' },
      { key: 'playlistler', label: 'Video playlistler', ikon: '🎬' },
      { key: 'topluislemler', label: 'Toplu işlemler', ikon: '⚡' },
    ],
  },
];

export default function KocAltTabBar({ aktif, onNav, okunmamis }) {
  const { s } = useTheme();
  const [digerAcik, setDigerAcik] = useState(false);

  const anaTablar = [
    { key: 'ana', label: 'Ana', ikon: '🏠' },
    { key: 'ogrenciler', label: 'Liste', ikon: '👥' },
    { key: 'gunluktakip', label: 'Takip', ikon: '✅' },
    { key: 'mesajlar', label: 'Mesaj', ikon: '💬', badge: okunmamis },
  ];

  const digerAktifMi = DIGER_KEYS.includes(aktif);

  const handleNav = key => {
    onNav(key);
    setDigerAcik(false);
  };

  return (
    <>
      {/* Diğer sheet arka planı */}
      {digerAcik && (
        <div
          onClick={() => setDigerAcik(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 149,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Diğer sheet */}
      {digerAcik && (
        <div
          style={{
            position: 'fixed',
            bottom: 60,
            left: 0,
            right: 0,
            zIndex: 150,
            background: s.surface,
            borderRadius: '20px 20px 0 0',
            borderTop: `1px solid ${s.border}`,
            paddingBottom: 'env(safe-area-inset-bottom)',
            maxHeight: '72vh',
            overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
            animation: 'kocSheetUp .22s cubic-bezier(.32,1.2,.4,1)',
          }}
        >
          {/* Tutma çubuğu */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: s.border }} />
          </div>

          <div style={{ padding: '0 16px 16px' }}>
            {DIGER_GRUPLAR.map(g => (
              <div key={g.baslik} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: s.text3,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '8px 2px 8px',
                  }}
                >
                  {g.baslik}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {g.items.map(item => {
                    const on = aktif === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleNav(item.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          border: `1px solid ${on ? s.accent : s.border}`,
                          background: on ? s.accentSoft : s.surface2,
                          borderRadius: 12,
                          padding: '11px 14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: on ? s.accent : s.text2,
                          fontSize: 13,
                          fontWeight: on ? 600 : 500,
                          touchAction: 'manipulation',
                          transition: 'background .12s, border-color .12s',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{item.ikon}</span>
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
            ))}
          </div>
        </div>
      )}

      {/* Alt tab bar */}
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
        {anaTablar.map(tab => {
          const on = aktif === tab.key || (aktif === 'ogrenci_detay' && tab.key === 'ogrenciler');
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
              {tab.badge > 0 && (
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
                  {tab.badge}
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
                style={{
                  fontSize: 10,
                  fontWeight: on ? 700 : 400,
                  color: on ? s.accent : s.text3,
                  transition: 'color .15s',
                }}
              >
                {tab.label}
              </div>
            </button>
          );
        })}

        {/* Diğer */}
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
              background: digerAcik ? s.accentSoft : digerAktifMi ? s.accentSoft : 'transparent',
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
        @keyframes kocSheetUp {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

KocAltTabBar.propTypes = {
  aktif: PropTypes.string,
  onNav: PropTypes.func.isRequired,
  okunmamis: PropTypes.number,
};
