import React from 'react';

export const PATHS = {
  ana: '/veli/home',
  denemeler: '/veli/denemeler',
  program: '/veli/program',
  mesajlar: '/veli/mesajlar',
  duyurular: '/veli/duyurular',
};

export function sayfaGetir(pathname) {
  const bulunan = Object.entries(PATHS).find(([, p]) => pathname.startsWith(p));
  return bulunan?.[0] || 'ana';
}

export const MENU = [
  { k: 'ana', l: 'Ana', ikon: '🏠' },
  { k: 'denemeler', l: 'Deneme', ikon: '📊' },
  { k: 'program', l: 'Program', ikon: '📅' },
  { k: 'mesajlar', l: 'Mesaj', ikon: '💬' },
  { k: 'duyurular', l: 'Duyurular', ikon: '📢' },
];

function MenuSatir({ item, aktif, git, s }) {
  const on = aktif === item.k;
  return (
    <div
      onClick={() => git(item.k)}
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
      <span style={{ flex: 1, paddingLeft: on ? 4 : 0 }}>{item.l}</span>
      {item.badge > 0 && (
        <span
          style={{
            background: 'rgba(244,63,94,.12)',
            color: '#F43F5E',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 20,
            border: `1px solid ${s.border}`,
          }}
        >
          {item.badge}
        </span>
      )}
    </div>
  );
}

export function VeliSolMenu({ aktif, git, okunmamisMesaj, s, ogrenci, userData }) {
  const menu = MENU.map(m => (m.k === 'mesajlar' ? { ...m, badge: okunmamisMesaj || null } : m));
  return (
    <div
      style={{
        width: 200,
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
          {userData?.isim?.split(' ')[0] || 'Veli'}
        </div>
        <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>
          {ogrenci?.isim ? `Öğrenci: ${ogrenci.isim}` : 'ElsWay Veli'}
        </div>
      </div>
      {menu.map(item => (
        <MenuSatir key={item.k} item={item} aktif={aktif} git={git} s={s} />
      ))}
    </div>
  );
}

export function VeliAltTabBar({ aktif, git, okunmamisMesaj, s }) {
  const menu = MENU.map(m => (m.k === 'mesajlar' ? { ...m, badge: okunmamisMesaj || null } : m));
  return (
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
        boxShadow: '0 -2px 8px rgba(15,23,42,0.08)',
      }}
    >
      {menu.map(tab => {
        const on = aktif === tab.k;
        return (
          <button
            key={tab.k}
            type="button"
            onClick={() => git(tab.k)}
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
              {tab.l}
            </div>
          </button>
        );
      })}
    </div>
  );
}
