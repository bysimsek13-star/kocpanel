import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useOdemeler, useGiderler } from './useMaliVeri';
import MaliDashboard from './MaliDashboard';
import OdemeListesi from './OdemeListesi';
import GiderYonetimi from './GiderYonetimi';

const SEKMELER = [
  { key: 'dashboard', label: 'P&L Özeti' },
  { key: 'odemeler', label: 'Öğrenci Ödemeleri' },
  { key: 'giderler', label: 'Giderler' },
];

export default function MaliYonetimSayfasi({ ogrenciler, s: sProp, mobil }) {
  const { s: sTheme } = useTheme();
  const s = sProp || sTheme;
  const [aktifSekme, setAktifSekme] = useState('dashboard');
  const { odemeler, yukleniyor: odYuk } = useOdemeler();
  const { giderler, yukleniyor: gidYuk } = useGiderler();

  const yukleniyor = odYuk || gidYuk;

  return (
    <div style={{ padding: mobil ? '0 16px 24px' : '0 28px 40px' }}>
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 24,
          borderBottom: `1px solid ${s.border}`,
          paddingBottom: 0,
        }}
      >
        {SEKMELER.map(sek => (
          <button
            key={sek.key}
            onClick={() => setAktifSekme(sek.key)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: aktifSekme === sek.key ? 700 : 500,
              color: aktifSekme === sek.key ? s.accent : s.text2,
              borderBottom:
                aktifSekme === sek.key ? `2px solid ${s.accent}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {sek.label}
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <div style={{ textAlign: 'center', padding: 60, color: s.text2, fontSize: 14 }}>
          Yükleniyor...
        </div>
      ) : (
        <>
          {aktifSekme === 'dashboard' && (
            <MaliDashboard ogrenciler={ogrenciler} odemeler={odemeler} giderler={giderler} />
          )}
          {aktifSekme === 'odemeler' && (
            <OdemeListesi ogrenciler={ogrenciler} odemeler={odemeler} />
          )}
          {aktifSekme === 'giderler' && <GiderYonetimi giderler={giderler} />}
        </>
      )}
    </div>
  );
}

MaliYonetimSayfasi.propTypes = {
  ogrenciler: PropTypes.array.isRequired,
  s: PropTypes.object,
  mobil: PropTypes.bool,
};
