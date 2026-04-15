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

const OGR_DIGER_KEYS = ['gunluk_soru', 'mufredat', 'duyurular', 'destek'];

const OGR_DIGER_ITEMS = [
  { key: 'gunluk_soru', label: 'Soru çözümü', ikon: '📝' },
  { key: 'mufredat', label: 'İlerleyişim', ikon: '📈' },
  { key: 'duyurular', label: 'Duyurular', ikon: '📢' },
  { key: 'destek', label: 'Destek', ikon: '🆘' },
];

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

export function AltTabBar({ aktif, onNav, okunmamis, s }) {
  const [digerAcik, setDigerAcik] = React.useState(false);

  const anaTablar = [
    { key: 'ana', label: 'Ana', ikon: '🏠' },
    { key: 'program', label: 'Program', ikon: '📅' },
    { key: 'rutin', label: 'Rutin', ikon: '✅' },
    { key: 'mesajlar', label: 'Mesajlar', ikon: '💬', badge: okunmamis },
    { key: 'denemeler', label: 'Deneme', ikon: '📊' },
  ];

  const digerAktifMi = OGR_DIGER_KEYS.includes(aktif);
  const handleNav = key => {
    onNav(key);
    setDigerAcik(false);
  };

  return (
    <>
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

      {digerAcik && (
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
              {OGR_DIGER_ITEMS.map(item => {
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
      )}

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
          const on = aktif === tab.key;
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
