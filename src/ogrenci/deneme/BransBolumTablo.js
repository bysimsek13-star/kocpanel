import React from 'react';
import PropTypes from 'prop-types';
import { RENK } from './constants';

export default function BransBolumTablo({
  bransDenemeler,
  bransNoktalar,
  genelNoktalar,
  denemeler,
  dersRenk,
  dersId,
  onSil,
  s,
}) {
  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `1fr 80px 80px 80px 70px${onSil ? ' 44px' : ''}`,
          gap: 8,
          padding: '9px 14px',
          background: s.surface2,
          borderBottom: `1px solid ${s.border}`,
          fontSize: 9,
          fontWeight: 700,
          color: s.text3,
          textTransform: 'uppercase',
          letterSpacing: '.05em',
        }}
      >
        <div>Deneme</div>
        <div style={{ textAlign: 'center' }}>Net</div>
        <div style={{ textAlign: 'center' }}>D</div>
        <div style={{ textAlign: 'center' }}>Y</div>
        <div style={{ textAlign: 'center' }}>B</div>
        {onSil && <div />}
      </div>

      {bransNoktalar.length > 0 && (
        <>
          <div
            style={{
              padding: '6px 14px',
              background: RENK.bg.brans,
              fontSize: 9,
              fontWeight: 700,
              color: RENK.brans,
              borderBottom: `1px solid ${s.border}`,
            }}
          >
            BRANŞ DENEMELERİ
          </div>
          {bransDenemeler
            .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
            .map((d, i) => {
              const v = Object.values(d.netler || {})[0] || {};
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `1fr 80px 80px 80px 70px${onSil ? ' 44px' : ''}`,
                    gap: 8,
                    padding: '9px 14px',
                    borderBottom: `1px solid ${s.border}`,
                    fontSize: 12,
                    color: s.text,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{d.tarih}</div>
                    {d.yayinevi && <div style={{ fontSize: 10, color: s.text3 }}>{d.yayinevi}</div>}
                  </div>
                  <div style={{ textAlign: 'center', fontWeight: 700, color: dersRenk }}>
                    {parseFloat(d.toplamNet).toFixed(1)}
                  </div>
                  <div style={{ textAlign: 'center', color: s.text2 }}>{v.d || '—'}</div>
                  <div style={{ textAlign: 'center', color: s.danger }}>{v.y || '—'}</div>
                  <div style={{ textAlign: 'center', color: s.text3 }}>{v.b || '—'}</div>
                  {onSil && (
                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => onSil(d)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          color: s.danger,
                          padding: '2px 6px',
                          borderRadius: 6,
                        }}
                        title="Sil"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </>
      )}

      {genelNoktalar.length > 0 && (
        <>
          <div
            style={{
              padding: '6px 14px',
              background: RENK.bg.genel,
              fontSize: 9,
              fontWeight: 700,
              color: RENK.genel,
              borderBottom: `1px solid ${s.border}`,
            }}
          >
            GENEL DENEMELERDEKİ NET
          </div>
          {denemeler
            .filter(d => d.denemeTuru !== 'brans' && d.netler?.[dersId])
            .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
            .map((d, i) => {
              const v = d.netler[dersId];
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 80px 80px 70px',
                    gap: 8,
                    padding: '9px 14px',
                    borderBottom: `1px solid ${s.border}`,
                    fontSize: 12,
                    color: s.text,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {d.sinav} · {d.tarih}
                    </div>
                    {d.yayinevi && <div style={{ fontSize: 10, color: s.text3 }}>{d.yayinevi}</div>}
                  </div>
                  <div style={{ textAlign: 'center', fontWeight: 700, color: dersRenk }}>
                    {parseFloat(v.net).toFixed(1)}
                  </div>
                  <div style={{ textAlign: 'center', color: s.text2 }}>{v.d || '—'}</div>
                  <div style={{ textAlign: 'center', color: s.danger }}>{v.y || '—'}</div>
                  <div style={{ textAlign: 'center', color: s.text3 }}>{v.b || '—'}</div>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}

BransBolumTablo.propTypes = {
  bransDenemeler: PropTypes.arrayOf(PropTypes.object).isRequired,
  bransNoktalar: PropTypes.arrayOf(PropTypes.object).isRequired,
  genelNoktalar: PropTypes.arrayOf(PropTypes.object).isRequired,
  denemeler: PropTypes.arrayOf(PropTypes.object).isRequired,
  dersRenk: PropTypes.string,
  dersId: PropTypes.string,
  onSil: PropTypes.func,
  s: PropTypes.object.isRequired,
};
