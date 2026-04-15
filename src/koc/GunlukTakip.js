import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { Btn } from '../components/Shared';

import GunlukIlerlemePano from './gunluk/GunlukIlerlemePano';
import OgrenciRutinKarti from './gunluk/OgrenciRutinKarti';

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function GunlukTakipSayfasi({ ogrenciler, onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();

  return (
    <div style={{ padding: 0 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: mobil ? 'column' : 'row',
          alignItems: mobil ? 'stretch' : 'center',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <Btn onClick={onGeri} variant="outline" style={{ padding: '8px 16px' }}>
            ← Geri
          </Btn>
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: s.text,
                margin: 0,
                letterSpacing: -0.02,
              }}
            >
              Günlük takip
            </h2>
            <div
              style={{ fontSize: 13, color: s.text2, marginTop: 6, lineHeight: 1.5, maxWidth: 520 }}
            >
              Rutin ve günlük soru girişi — özet üstte, detaylar öğrenci kartlarında.
            </div>
          </div>
        </div>
      </div>

      {ogrenciler.length === 0 ? (
        <div style={{ color: s.text3, textAlign: 'center', padding: 40 }}>Henüz öğrenci yok</div>
      ) : (
        <>
          <GunlukIlerlemePano ogrenciler={ogrenciler} s={s} mobil={mobil} />
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: s.text3,
              marginBottom: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Öğrenci detayları
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ogrenciler.map((o, i) => (
              <OgrenciRutinKarti key={o.id} ogrenci={o} index={i} s={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Öğrenci paneli için rutin giriş export ───────────────────────────────────
export { default as RutinGirisFormu } from './gunluk/RutinGirisFormu';

GunlukTakipSayfasi.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGeri: PropTypes.func.isRequired,
};
