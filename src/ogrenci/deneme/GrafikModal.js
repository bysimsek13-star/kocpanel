import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { RENK } from './constants';

export default function GrafikModal({
  dersId: _dersId,
  dersLabel,
  dersRenk,
  noktalar,
  onKapat,
  s,
}) {
  const genelNoktalar = noktalar.filter(n => n.tur === 'genel');
  const bransNoktalar = noktalar.filter(n => n.tur === 'brans');
  const ort =
    noktalar.length > 0
      ? (noktalar.reduce((a, n) => a + n.net, 0) / noktalar.length).toFixed(1)
      : null;

  const tooltipIcerik = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload;
    return (
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 10,
          padding: '10px 14px',
          boxShadow: s.shadow,
          minWidth: 160,
        }}
      >
        <div style={{ fontSize: 11, color: s.text3, marginBottom: 4 }}>
          {p?.tarih} · {p?.yayinevi || ''}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{p?.sinav}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: dersRenk, marginTop: 4 }}>
          {p?.net} net
        </div>
        {p?.tur === 'brans' && (
          <div
            style={{
              fontSize: 10,
              color: RENK.brans,
              marginTop: 4,
              background: RENK.bg.brans,
              padding: '2px 8px',
              borderRadius: 20,
              display: 'inline-block',
            }}
          >
            Branş denemesi
          </div>
        )}
        {p?.tur === 'genel' && (
          <div
            style={{
              fontSize: 10,
              color: RENK.genel,
              marginTop: 4,
              background: RENK.bg.genel,
              padding: '2px 8px',
              borderRadius: 20,
              display: 'inline-block',
            }}
          >
            Genel deneme
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onKapat}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: 28,
          width: '100%',
          maxWidth: 760,
          boxShadow: s.shadow,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.text }}>{dersLabel}</div>
            <div style={{ fontSize: 12, color: s.text3, marginTop: 2 }}>
              {noktalar.length} deneme · Ort: {ort} net
            </div>
          </div>
          <button
            onClick={onKapat}
            style={{
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 18,
              color: s.text2,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            { l: 'Son net', v: noktalar[noktalar.length - 1]?.net || '—', r: dersRenk },
            {
              l: 'En yüksek',
              v: noktalar.length ? Math.max(...noktalar.map(n => n.net)) : '—',
              r: RENK.artis,
            },
            { l: 'Ortalama', v: ort || '—', r: s.text2 },
          ].map((st, i) => (
            <div
              key={i}
              style={{
                background: s.surface2,
                borderRadius: 10,
                padding: '12px 14px',
                border: `1px solid ${s.border}`,
              }}
            >
              <div style={{ fontSize: 10, color: s.text3, marginBottom: 4 }}>{st.l}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: st.r }}>{st.v}</div>
            </div>
          ))}
        </div>

        {noktalar.length >= 2 ? (
          <>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              {genelNoktalar.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 24, height: 2, background: RENK.genel, borderRadius: 2 }} />
                  <span style={{ fontSize: 11, color: s.text2 }}>Genel deneme</span>
                </div>
              )}
              {bransNoktalar.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="10">
                    <polygon points="8,0 16,10 0,10" fill={RENK.brans} />
                  </svg>
                  <span style={{ fontSize: 11, color: s.text2 }}>Branş denemesi</span>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={noktalar} margin={{ top: 10, right: 20, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={s.border} vertical={false} />
                <XAxis
                  dataKey="etiket"
                  tick={{ fontSize: 10, fill: s.text3 }}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: s.text3 }} tickLine={false} axisLine={false} />
                <Tooltip content={tooltipIcerik} />
                {ort && (
                  <ReferenceLine
                    y={parseFloat(ort)}
                    stroke={s.text3}
                    strokeDasharray="4 4"
                    label={{ value: `Ort ${ort}`, position: 'right', fontSize: 9, fill: s.text3 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke={dersRenk}
                  strokeWidth={2}
                  dot={props => {
                    const { cx, cy, payload } = props;
                    if (payload.tur === 'brans')
                      return (
                        <polygon
                          key={`${cx}-${cy}`}
                          points={`${cx},${cy - 5} ${cx + 5},${cy + 4} ${cx - 5},${cy + 4}`}
                          fill={RENK.brans}
                          stroke="none"
                        />
                      );
                    return (
                      <circle
                        key={`${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={RENK.genel}
                        stroke={s.surface}
                        strokeWidth={1.5}
                      />
                    );
                  }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0', color: s.text3, fontSize: 13 }}>
            Grafik için en az 2 deneme gerekli
          </div>
        )}

        {noktalar.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: s.text3,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '.05em',
              }}
            >
              Tüm denemeler
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...noktalar].reverse().map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: s.surface2,
                    border: `1px solid ${s.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: n.tur === 'brans' ? 2 : '50%',
                      background: n.tur === 'brans' ? RENK.brans : RENK.genel,
                      flexShrink: 0,
                      transform: n.tur === 'brans' ? 'rotate(45deg)' : 'none',
                    }}
                  />
                  <div style={{ fontSize: 11, color: s.text3, minWidth: 80 }}>{n.tarih}</div>
                  <div style={{ fontSize: 11, color: s.text2, flex: 1 }}>
                    {n.sinav}
                    {n.yayinevi ? ` · ${n.yayinevi}` : ''}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: dersRenk }}>{n.net}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

GrafikModal.propTypes = {
  dersId: PropTypes.string,
  dersLabel: PropTypes.string,
  dersRenk: PropTypes.string,
  noktalar: PropTypes.arrayOf(PropTypes.object),
  onKapat: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
