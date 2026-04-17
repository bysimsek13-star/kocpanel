import React from 'react';

export const PATHS = {
  ana: '/ogrenci/home',
  program: '/ogrenci/program',
  rutin: '/ogrenci/rutin',
  gunluk_soru: '/ogrenci/gunluk-soru',
  denemeler: '/ogrenci/denemeler',
  mufredat: '/ogrenci/mufredat',
  mesajlar: '/ogrenci/mesajlar',
  duyurular: '/ogrenci/duyurular',
  destek: '/ogrenci/destek',
};

export const BASLIK = {
  ana: 'Genel bakış',
  program: 'Programım',
  rutin: 'Günlük rutin',
  gunluk_soru: 'Günlük soru',
  denemeler: 'Denemeler',
  mufredat: 'İlerleyişim',
  mesajlar: 'Mesajlar',
  duyurular: 'Duyurular',
  destek: 'Destek',
};

export function SolMenu({
  aktif,
  onNav,
  okunmamis,
  userData,
  ogrenciTur,
  s,
  programOran: _programOran,
}) {
  const gruplar = [
    { baslik: 'Genel', items: [{ key: 'ana', label: 'Ana sayfa' }] },
    {
      baslik: 'Günlük',
      items: [
        { key: 'program', label: 'Programım' },
        { key: 'rutin', label: 'Günlük rutin' },
        { key: 'gunluk_soru', label: 'Soru çözümü' },
      ],
    },
    {
      baslik: 'Takip',
      items: [
        { key: 'denemeler', label: 'Denemeler' },
        { key: 'mufredat', label: 'İlerleyişim' },
      ],
    },
    {
      baslik: 'İletişim',
      items: [
        { key: 'mesajlar', label: 'Mesajlar', badge: okunmamis },
        { key: 'duyurular', label: 'Duyurular' },
        { key: 'destek', label: 'Destek' },
      ],
    },
  ];

  const satir = item => {
    const on = aktif === item.key;
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
          marginBottom: 1,
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
            }}
          >
            {item.badge}
          </span>
        )}
      </div>
    );
  };

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
          {userData?.isim?.split(' ')[0] || 'Öğrenci'}
        </div>
        <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>
          {ogrenciTur || userData?.tur || '—'}
        </div>
      </div>
      {gruplar.map(g => (
        <div key={g.baslik} style={{ marginBottom: 14 }}>
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
            {g.baslik}
          </div>
          {g.items.map(satir)}
        </div>
      ))}
    </div>
  );
}

export { default as AltTabBar } from './OgrenciAltTabBar';
