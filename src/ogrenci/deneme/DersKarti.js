import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { RENK, yorumUret } from './constants';
import GrafikModal from './GrafikModal';

export default function DersKarti({ dersId, dersLabel, dersRenk, dersMax, noktalar, s }) {
  const [buyukAcik, setBuyukAcik] = useState(false);

  const nets = noktalar.map(n => n.net);
  const sonNet = nets[nets.length - 1] ?? null;
  const ort = nets.length ? (nets.reduce((a, b) => a + b, 0) / nets.length).toFixed(1) : null;
  const yorum = yorumUret(noktalar.map(n => ({ net: n.net, tarih: n.tarih })));
  const miniData = noktalar.slice(-6);

  return (
    <>
      <div
        onClick={() => noktalar.length > 0 && setBuyukAcik(true)}
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 14,
          padding: '14px 16px',
          cursor: noktalar.length > 0 ? 'pointer' : 'default',
          boxShadow: s.shadowCard || s.shadow,
          transition: 'box-shadow .15s',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: dersRenk,
                textTransform: 'uppercase',
                letterSpacing: '.04em',
                marginBottom: 3,
              }}
            >
              {dersLabel}
            </div>
            {ort && <div style={{ fontSize: 10, color: s.text3 }}>Ort. {ort}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{ fontSize: 22, fontWeight: 800, color: sonNet !== null ? dersRenk : s.text3 }}
            >
              {sonNet !== null ? sonNet : '—'}
            </div>
            {dersMax && sonNet !== null && (
              <div style={{ fontSize: 9, color: s.text3 }}>/ {dersMax}</div>
            )}
          </div>
        </div>

        {sonNet !== null && dersMax && (
          <div style={{ height: 4, background: s.surface2, borderRadius: 99, marginBottom: 8 }}>
            <div
              style={{
                height: '100%',
                borderRadius: 99,
                background: dersRenk,
                width: `${Math.min(100, (sonNet / dersMax) * 100)}%`,
                opacity: 0.7,
                transition: 'width .4s',
              }}
            />
          </div>
        )}

        {miniData.length >= 2 && (
          <div style={{ height: 32, marginBottom: 6 }}>
            <ResponsiveContainer width="100%" height={32}>
              <LineChart data={miniData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke={dersRenk}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {noktalar.filter(n => n.tur === 'genel').length > 0 && (
              <span
                style={{
                  fontSize: 9,
                  color: RENK.genel,
                  background: RENK.bg.genel,
                  padding: '2px 7px',
                  borderRadius: 20,
                  fontWeight: 600,
                }}
              >
                {noktalar.filter(n => n.tur === 'genel').length} genel
              </span>
            )}
            {noktalar.filter(n => n.tur === 'brans').length > 0 && (
              <span
                style={{
                  fontSize: 9,
                  color: RENK.brans,
                  background: RENK.bg.brans,
                  padding: '2px 7px',
                  borderRadius: 20,
                  fontWeight: 600,
                }}
              >
                {noktalar.filter(n => n.tur === 'brans').length} branş
              </span>
            )}
          </div>
          {noktalar.length > 0 && <span style={{ fontSize: 9, color: s.text3 }}>Detay →</span>}
        </div>

        {yorum && (
          <div style={{ marginTop: 8, fontSize: 11, color: yorum.renk, fontWeight: 600 }}>
            {yorum.ikon} {yorum.metin}
          </div>
        )}
      </div>

      {buyukAcik && (
        <GrafikModal
          dersId={dersId}
          dersLabel={dersLabel}
          dersRenk={dersRenk}
          noktalar={noktalar}
          onKapat={() => setBuyukAcik(false)}
          s={s}
        />
      )}
    </>
  );
}

DersKarti.propTypes = {
  dersId: PropTypes.string,
  dersLabel: PropTypes.string,
  dersRenk: PropTypes.string,
  dersMax: PropTypes.number,
  noktalar: PropTypes.arrayOf(PropTypes.shape({ net: PropTypes.number, tarih: PropTypes.string })),
  s: PropTypes.object.isRequired,
};
