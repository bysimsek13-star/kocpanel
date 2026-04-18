import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { KONULAR, TYT_DERSLER, AYT_DERSLER } from '../data/konular';
import { lgsKonular } from '../data/konularLgs';

const LGS_DERSLER_LISTE = Object.keys(lgsKonular).map(id => ({
  id,
  label: id.charAt(0).toUpperCase() + id.slice(1),
}));

const TUM_DERSLER = [...TYT_DERSLER, ...AYT_DERSLER, ...LGS_DERSLER_LISTE];

function konulariBul(ders) {
  if (!ders?.trim()) return [];
  const dl = ders.trim().toLowerCase();
  const eslesen = TUM_DERSLER.find(d => {
    const label = d.label.toLowerCase();
    return label.includes(dl) || dl.includes(label);
  });
  if (!eslesen) return [];
  const liste = KONULAR[eslesen.id] || lgsKonular[eslesen.id] || [];
  return liste;
}

export default function SlotKonuSecici({ ders, onSec, s }) {
  const konular = useMemo(() => konulariBul(ders), [ders]);

  if (!konular.length) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: s.text3, marginBottom: 5 }}>
        Müfredattan seç
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 5,
          maxHeight: 130,
          overflowY: 'auto',
        }}
      >
        {konular.map((k, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSec(k)}
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              border: `1px solid ${s.accent}50`,
              background: `${s.accent}12`,
              color: s.accent,
            }}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

SlotKonuSecici.propTypes = {
  ders: PropTypes.string,
  onSec: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
