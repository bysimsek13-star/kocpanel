import React from 'react';
import PropTypes from 'prop-types';

export default function DenemeFormSecim({
  denemeTuru,
  onTurDegis,
  secenekler,
  sinav,
  onSinavDegis,
  tarih,
  onTarihDegis,
  yayinevi,
  onYayineviDegis,
  s,
}) {
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          { k: 'genel', l: 'Genel Deneme' },
          { k: 'brans', l: 'Branş Denemesi' },
        ].map(t => (
          <div
            key={t.k}
            onClick={() => onTurDegis(t.k)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: denemeTuru === t.k ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
              background: denemeTuru === t.k ? s.accentSoft : s.surface2,
              color: denemeTuru === t.k ? s.accent : s.text2,
            }}
          >
            {t.l}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {denemeTuru === 'genel' &&
          secenekler.map(t => (
            <div
              key={t}
              onClick={() => onSinavDegis(t)}
              style={{
                flex: 1,
                minWidth: 70,
                padding: 9,
                borderRadius: 10,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: sinav === t ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                background: sinav === t ? s.accentSoft : s.surface2,
                color: sinav === t ? s.accent : s.text2,
              }}
            >
              {t}
            </div>
          ))}
        <input
          type="date"
          value={tarih}
          onChange={e => onTarihDegis(e.target.value)}
          style={{
            flex: 1,
            minWidth: 110,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '9px 12px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
          }}
        />
        <input
          value={yayinevi}
          onChange={e => onYayineviDegis(e.target.value)}
          placeholder="Yayınevi"
          style={{
            flex: 1,
            minWidth: 110,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '9px 12px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
          }}
        />
      </div>
    </>
  );
}

DenemeFormSecim.propTypes = {
  denemeTuru: PropTypes.string.isRequired,
  onTurDegis: PropTypes.func.isRequired,
  secenekler: PropTypes.arrayOf(PropTypes.string).isRequired,
  sinav: PropTypes.string,
  onSinavDegis: PropTypes.func.isRequired,
  tarih: PropTypes.string,
  onTarihDegis: PropTypes.func.isRequired,
  yayinevi: PropTypes.string,
  onYayineviDegis: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
