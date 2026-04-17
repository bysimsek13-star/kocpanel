import React from 'react';
import PropTypes from 'prop-types';
import { ElsWayLogo } from '../components/Shared';
import TemaSecici from '../components/TemaSecici';
import { BildirimZili } from '../components/BildirimSistemi';

export default function AdminTopBar({ kullanici, mobil, s, onBildirimToggle, onCikis }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: s.topBarBg,
        borderBottom: `1px solid ${s.topBarBorder}`,
        padding: mobil ? '10px 14px' : '10px 24px',
        minHeight: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ElsWayLogo size="bar" variant="onDark" />
        <span style={{ fontSize: 13, color: s.topBarMuted, fontWeight: 600 }}>Yönetici</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TemaSecici variant="bar" onDarkBar />
        <BildirimZili onClick={onBildirimToggle} />
        {!mobil && kullanici?.email && (
          <span
            style={{
              fontSize: 12,
              color: s.topBarMuted,
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {kullanici.email}
          </span>
        )}
        <button
          onClick={onCikis}
          style={{
            background: s.tehlikaSoft,
            border: `1px solid ${s.border}`,
            color: s.tehlika,
            padding: mobil ? '6px 10px' : '7px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Çıkış
        </button>
      </div>
    </div>
  );
}

AdminTopBar.propTypes = {
  kullanici: PropTypes.object,
  mobil: PropTypes.bool,
  s: PropTypes.object.isRequired,
  onBildirimToggle: PropTypes.func.isRequired,
  onCikis: PropTypes.func.isRequired,
};
