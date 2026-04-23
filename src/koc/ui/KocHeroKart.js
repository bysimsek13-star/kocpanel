import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useMobil } from '../../hooks/useMediaQuery';
import KocGirisDurumuModal from './KocGirisDurumuModal';

export default function KocHeroKart({
  ogrenciSayisi,
  bugunGirisYokList,
  bugunMap,
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
  const saatTR = parseInt(
    new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: 'numeric',
      hour12: false,
    })
  );
  const selam =
    saatTR >= 6 && saatTR < 12
      ? 'Günaydın'
      : saatTR >= 12 && saatTR < 18
        ? 'İyi günler'
        : saatTR >= 18 && saatTR < 22
          ? 'İyi akşamlar'
          : 'İyi geceler';

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
        <KocGirisDurumuModal
          ogrenciler={ogrenciler || []}
          bugunMap={bugunMap || {}}
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

KocHeroKart.propTypes = {
  ogrenciSayisi: PropTypes.number,
  bugunGirisYokList: PropTypes.arrayOf(PropTypes.object),
  bugunMap: PropTypes.object,
  toplamOkunmamis: PropTypes.number,
  okunmamisMap: PropTypes.object,
  ogrenciler: PropTypes.arrayOf(PropTypes.object),
  onNav: PropTypes.func.isRequired,
  onSec: PropTypes.func,
  kocAdi: PropTypes.string,
};
