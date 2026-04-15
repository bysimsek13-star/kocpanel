import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useMobil } from '../../hooks/useMediaQuery';
import { Avatar } from '../../components/Shared';
import { renkler } from '../../data/konular';

// Modal: bugün uygulamaya girmeyen öğrenciler listesi
function GirisYokModal({ liste, onKapat, s }) {
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
      onClick={onKapat}
    >
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 18,
          padding: '24px 24px 20px',
          width: 360,
          maxWidth: '95vw',
          maxHeight: '70vh',
          overflowY: 'auto',
          boxShadow: s.shadow,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: s.text }}>
            Bugün giriş yapmayan öğrenciler
          </div>
          <button
            onClick={onKapat}
            aria-label="Modalı kapat"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: s.text3,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        {liste.length === 0 ? (
          <div style={{ textAlign: 'center', color: s.text3, fontSize: 13, padding: '20px 0' }}>
            Tüm öğrenciler bugün giriş yaptı 🎉
          </div>
        ) : (
          liste.map((o, i) => (
            <div
              key={o.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: i < liste.length - 1 ? `1px solid ${s.border}` : 'none',
              }}
            >
              <Avatar isim={o.isim} renk={renkler[i % renkler.length]} boyut={34} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{o.isim}</div>
                <div style={{ fontSize: 11, color: s.text3 }}>{o.tur || '—'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function KocHeroKart({
  ogrenciSayisi,
  bugunGirisYokList,
  toplamOkunmamis,
  okunmamisMap,
  ogrenciler,
  onNav,
  onSec,
  kocAdi,
}) {
  const { s } = useTheme();
  const mobil = useMobil();
  const [girisYokAcik, setGirisYokAcik] = useState(false);
  const saat = new Date().getHours();
  const selam = saat < 12 ? 'Günaydın' : saat < 18 ? 'İyi günler' : 'İyi akşamlar';

  const handleOkunmamis = () => {
    if (!okunmamisMap || !ogrenciler?.length) {
      onNav('mesajlar');
      return;
    }
    const unreadList = ogrenciler.filter(o => (okunmamisMap[o.id] || 0) > 0);
    if (unreadList.length === 1) {
      onSec(unreadList[0], 'mesajlar');
    } else {
      onNav('mesajlar');
    }
  };

  const kartlar = [
    {
      v: ogrenciSayisi,
      l: 'Öğrenci',
      onClick: () => onNav('ogrenciler'),
    },
    {
      v: bugunGirisYokList?.length ?? 0,
      l: 'Bugün giriş yok',
      onClick: () => setGirisYokAcik(true),
      renk: (bugunGirisYokList?.length ?? 0) > 0 ? s.uyari : undefined,
    },
    {
      v: toplamOkunmamis,
      l: 'Okunmamış mesaj',
      onClick: handleOkunmamis,
      renk: toplamOkunmamis > 0 ? s.tehlika : undefined,
    },
  ];

  return (
    <>
      {girisYokAcik && (
        <GirisYokModal
          liste={bugunGirisYokList || []}
          onKapat={() => setGirisYokAcik(false)}
          s={s}
        />
      )}
      <div
        style={{
          background: s.heroSurface,
          border: `1px solid ${s.border}`,
          borderRadius: 18,
          padding: mobil ? '18px 18px' : '22px 26px',
          marginBottom: 22,
          boxShadow: s.shadowCard || s.shadow,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 500, color: s.heroMuted, marginBottom: 6 }}>
          {selam}
        </div>
        <div
          style={{
            fontSize: mobil ? 20 : 24,
            fontWeight: 700,
            color: s.heroTitle,
            marginBottom: 6,
          }}
        >
          Sevgili {kocAdi || 'Koç'} 👋
        </div>
        <div
          style={{
            fontSize: 13,
            color: s.heroMuted,
            lineHeight: 1.5,
            maxWidth: 520,
            marginBottom: 18,
          }}
        >
          Özet rakamlar ve günlük giriş durumu.
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0,
            borderTop: `1px solid ${s.border}`,
            paddingTop: 16,
            margin: '0 -4px',
          }}
        >
          {kartlar.map((item, i, arr) => (
            <div
              key={item.l}
              onClick={item.onClick}
              style={{
                flex: '1 1 100px',
                minWidth: 96,
                padding: '8px 12px',
                cursor: 'pointer',
                borderRight: i < arr.length - 1 ? `1px solid ${s.border}` : 'none',
                textAlign: 'center',
                borderRadius: 6,
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: item.renk || s.heroTitle,
                  lineHeight: 1.15,
                }}
              >
                {item.v}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: s.heroMuted, marginTop: 4 }}>
                {item.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

GirisYokModal.propTypes = {
  liste: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, isim: PropTypes.string })),
  onKapat: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};

KocHeroKart.propTypes = {
  ogrenciSayisi: PropTypes.number,
  bugunGirisYokList: PropTypes.arrayOf(PropTypes.object),
  toplamOkunmamis: PropTypes.number,
  okunmamisMap: PropTypes.object,
  ogrenciler: PropTypes.arrayOf(PropTypes.object),
  onNav: PropTypes.func.isRequired,
  onSec: PropTypes.func,
  kocAdi: PropTypes.string,
};
