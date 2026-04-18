import React from 'react';
import PropTypes from 'prop-types';
import { TIPLER_NEON } from './programBilesenUtils';

export default function SlotTipSecici({ secilenTip, onChange, s }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: s.text3,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Aktivite Türü
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {TIPLER_NEON.map(tip => (
          <div
            key={tip.id}
            onClick={() => onChange(tip.id)}
            style={{
              padding: '8px 6px',
              borderRadius: 12,
              textAlign: 'center',
              cursor: 'pointer',
              border: `2px solid ${secilenTip === tip.id ? tip.renk : s.border}`,
              background: secilenTip === tip.id ? tip.acikRenk : s.surface2,
              transition: 'all .15s',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: secilenTip === tip.id ? tip.renk : s.text2,
              }}
            >
              {tip.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

SlotTipSecici.propTypes = {
  secilenTip: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
