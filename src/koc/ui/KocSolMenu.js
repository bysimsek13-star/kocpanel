import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

export default function KocSolMenu({ aktif, onNav, okunmamis }) {
  const { s } = useTheme();

  const aktifMi = key => aktif === key || (aktif === 'ogrenci_detay' && key === 'ogrenciler');

  const satir = item => {
    const on = aktifMi(item.key);
    return (
      <div
        key={item.key}
        onClick={() => onNav(item.key)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 12px',
          borderRadius: 8,
          cursor: 'pointer',
          marginBottom: 2,
          position: 'relative',
          background: on ? s.accentSoft : 'transparent',
          color: on ? s.accent : s.text2,
          fontWeight: on ? 600 : 500,
          fontSize: 13,
          transition: 'background .15s, color .15s',
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
        {item.badge > 0 && (
          <span
            style={{
              background: s.tehlikaSoft,
              color: s.tehlika,
              border: `1px solid ${s.border}`,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 20,
              minWidth: 18,
              textAlign: 'center',
            }}
          >
            {item.badge}
          </span>
        )}
      </div>
    );
  };

  const gruplar = [
    {
      baslik: 'Genel',
      items: [{ key: 'ana', label: 'Ana sayfa' }],
    },
    {
      baslik: 'Öğrenci & analiz',
      items: [
        { key: 'ogrenciler', label: 'Öğrencilerim' },
        { key: 'hedeftakibi', label: 'Hedef takibi' },
        { key: 'istatistikler', label: 'İstatistikler' },
      ],
    },
    {
      baslik: 'Plan & günlük',
      items: [
        { key: 'haftalikprogram', label: 'Haftalık program' },
        { key: 'senelikprogram', label: 'Senelik program' }, // ← YENİ
        { key: 'gunluktakip', label: 'Günlük takip' },
        { key: 'denemeyonetimi', label: 'Deneme yönetimi' },
      ],
    },
    {
      baslik: 'İletişim',
      items: [
        { key: 'mesajlar', label: 'Mesajlar', badge: okunmamis },
        { key: 'veliraporlari', label: 'Veli raporları' },
        { key: 'duyurular', label: 'Duyurular' },
      ],
    },
    {
      baslik: 'Araçlar',
      items: [
        { key: 'gorevkutuphane', label: 'Görev şablonları' },
        { key: 'kaynakkutuphane', label: 'Kaynak kütüphanesi' },
        { key: 'topluislemler', label: 'Toplu işlemler' },
      ],
    },
  ];

  return (
    <div
      style={{
        width: 228,
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
      {gruplar.map(g => (
        <div key={g.baslik} style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: s.text,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '4px 12px 8px',
            }}
          >
            {g.baslik}
          </div>
          {g.items.map(satir)}
        </div>
      ))}
    </div>
  );
}

KocSolMenu.propTypes = {
  aktif: PropTypes.string,
  onNav: PropTypes.func.isRequired,
  okunmamis: PropTypes.number,
};
