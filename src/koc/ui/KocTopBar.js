import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ElsWayLogo from '../../components/ElsWayLogo';
import TemaSecici from '../../components/TemaSecici';
import { BildirimZili, BildirimPaneli } from '../../components/BildirimSistemi';
import { useTheme } from '../../context/ThemeContext';
import { useMobil } from '../../hooks/useMediaQuery';

export default function KocTopBar({
  toplamOkunmamis,
  onMesajlar,
  onOgrenciEkle,
  onCikis,
  onRehber,
}) {
  const { s } = useTheme();
  const mobil = useMobil();
  const [bildirimAcik, setBildirimAcik] = useState(false);
  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: s.topBarBg,
          borderBottom: `1px solid ${s.topBarBorder}`,
          padding: mobil ? '10px 14px' : '10px 20px',
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ElsWayLogo size="bar" variant="onDark" />
          <span
            style={{ fontSize: 13, color: s.topBarMuted, fontWeight: 600, letterSpacing: '0.02em' }}
          >
            Koç
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <TemaSecici variant="bar" onDarkBar />
          <BildirimZili onClick={() => setBildirimAcik(v => !v)} />
          {toplamOkunmamis > 0 && (
            <div
              onClick={onMesajlar}
              style={{
                background: s.tehlikaSoft,
                color: s.tehlika,
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 20,
                padding: '4px 10px',
                cursor: 'pointer',
                border: `1px solid ${s.topBarBorder}`,
              }}
            >
              {toplamOkunmamis} mesaj
            </div>
          )}
          <button
            onClick={onOgrenciEkle}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: s.logoWay,
              border: `1px solid ${s.topBarBorder}`,
              borderRadius: 9,
              padding: '7px 14px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            + Öğrenci
          </button>
          {onRehber && (
            <button
              onClick={onRehber}
              title="Başlangıç rehberini tekrar göster"
              style={{
                background: 'none',
                border: 'none',
                color: s.topBarMuted,
                fontSize: 16,
                cursor: 'pointer',
                lineHeight: 1,
                padding: '4px 6px',
              }}
            >
              ?
            </button>
          )}
          <button
            onClick={onCikis}
            style={{
              background: 'none',
              border: 'none',
              color: s.topBarMuted,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Çıkış
          </button>
        </div>
      </div>
      <BildirimPaneli acik={bildirimAcik} onKapat={() => setBildirimAcik(false)} />
    </>
  );
}

KocTopBar.propTypes = {
  toplamOkunmamis: PropTypes.number,
  onMesajlar: PropTypes.func,
  onOgrenciEkle: PropTypes.func,
  onCikis: PropTypes.func,
  onRehber: PropTypes.func,
};
