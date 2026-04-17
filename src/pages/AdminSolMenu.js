import React from 'react';
import PropTypes from 'prop-types';
import { MENU } from './yoneticiPaneliSabitleri';

export function menuSatir(item, aktifSayfa, sayfayaGit, kapat, s) {
  const on = aktifSayfa === item.key;
  return (
    <div
      key={item.key}
      onClick={() => {
        sayfayaGit(item.key);
        kapat?.();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        marginBottom: 1,
        position: 'relative',
        background: on ? s.accentSoft : 'transparent',
        color: on ? s.accent : s.text2,
        fontWeight: on ? 600 : 500,
        fontSize: 13,
      }}
    >
      {on && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '18%',
            bottom: '18%',
            width: 2,
            background: s.accent,
            borderRadius: '0 2px 2px 0',
          }}
        />
      )}
      <span style={{ flex: 1, paddingLeft: on ? 4 : 0 }}>{item.label}</span>
    </div>
  );
}

export default function AdminSolMenu({ aktifSayfa, sayfayaGit, kullanici, s }) {
  return (
    <div
      style={{
        width: 220,
        background: s.surface,
        borderRight: `1px solid ${s.border}`,
        padding: '14px 10px 24px',
        position: 'sticky',
        top: 60,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '6px 12px 14px',
          borderBottom: `1px solid ${s.border}`,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>
          {kullanici?.email?.split('@')[0] || 'Yönetici'}
        </div>
        <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>ElsWay Yönetici</div>
      </div>
      {[
        { baslik: 'Yönetim', items: ['ana', 'koclar', 'ogrenciler', 'yasamdongusu'] },
        { baslik: 'Analiz', items: ['performans', 'auditlog'] },
        { baslik: 'Sistem', items: ['canli', 'sistem', 'mufredat', 'tursync'] },
      ].map(grup => (
        <div key={grup.baslik} style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: s.text3,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 12px 6px',
            }}
          >
            {grup.baslik}
          </div>
          {MENU.filter(m => grup.items.includes(m.key)).map(item =>
            menuSatir(item, aktifSayfa, sayfayaGit, undefined, s)
          )}
        </div>
      ))}
    </div>
  );
}

AdminSolMenu.propTypes = {
  aktifSayfa: PropTypes.string.isRequired,
  sayfayaGit: PropTypes.func.isRequired,
  kullanici: PropTypes.object,
  s: PropTypes.object.isRequired,
};
