import React from 'react';
import PropTypes from 'prop-types';

export default function DenemeTabBar({
  bolum,
  onBolum,
  genelSayisi,
  bransSayisi,
  bransVeriDersSayisi,
  ogrenciTur,
  konuAnalizGoster,
  s,
}) {
  const tablar = [
    {
      k: 'genel',
      l: `${ogrenciTur?.includes('lgs') ? 'LGS' : 'Genel'} Denemeler (${genelSayisi})`,
    },
    {
      k: 'brans',
      l: `Branş (${bransSayisi} deneme · ${bransVeriDersSayisi} ders)`,
    },
    ...(konuAnalizGoster ? [{ k: 'konu', l: '🔍 Konu Analizi' }] : []),
  ];

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `2px solid ${s.border}`,
        marginBottom: 20,
        gap: 0,
      }}
    >
      {tablar.map(tab => (
        <button
          key={tab.k}
          type="button"
          onClick={() => onBolum(tab.k)}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            position: 'relative',
            color: bolum === tab.k ? s.accent : s.text3,
          }}
        >
          {tab.l}
          {bolum === tab.k && (
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                left: 0,
                right: 0,
                height: 2,
                background: s.accent,
                borderRadius: 2,
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

DenemeTabBar.propTypes = {
  bolum: PropTypes.string.isRequired,
  onBolum: PropTypes.func.isRequired,
  genelSayisi: PropTypes.number.isRequired,
  bransSayisi: PropTypes.number.isRequired,
  bransVeriDersSayisi: PropTypes.number.isRequired,
  ogrenciTur: PropTypes.string,
  konuAnalizGoster: PropTypes.bool,
  s: PropTypes.object.isRequired,
};
