import React from 'react';
import PropTypes from 'prop-types';

export default function IstikrarMini({ calismalar, s }) {
  const bugun = new Date();
  const gunler = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(bugun);
    d.setDate(bugun.getDate() - (27 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const set = new Set(calismalar.map(c => c.tarih || c.id));
  const streak = (() => {
    let s2 = 0;
    for (let i = 27; i >= 0; i--) {
      if (set.has(gunler[i])) s2++;
      else break;
    }
    return s2;
  })();

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        padding: '14px 18px',
        marginBottom: 16,
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>İstikrar serisi</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: s.accent }}>{streak} gün seri</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14,1fr)', gap: 3 }}>
        {gunler.map(g => (
          <div
            key={g}
            style={{
              aspectRatio: '1',
              borderRadius: 3,
              background: set.has(g) ? (s.success ?? s.ok) : s.surface2,
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: s.text3, marginTop: 8 }}>
        {calismalar.length} günlük kayıt
      </div>
    </div>
  );
}

IstikrarMini.propTypes = {
  calismalar: PropTypes.arrayOf(PropTypes.object),
  s: PropTypes.object.isRequired,
};
