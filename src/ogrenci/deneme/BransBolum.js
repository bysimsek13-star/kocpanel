import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RENK, yorumUret } from './constants';
import BransBolumTablo from './BransBolumTablo';

export default function BransBolum({ dersId, dersLabel, dersRenk, dersMax, denemeler, onSil, s }) {
  const [gosterim, setGosterim] = useState('tablo');

  const bransDenemeler = denemeler.filter(d => d.denemeTuru === 'brans' && d.netler?.[dersId]);

  const genelNoktalar = denemeler
    .filter(d => d.denemeTuru !== 'brans')
    .filter(d => d.netler?.[dersId])
    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
    .map(d => ({
      net: parseFloat(d.netler[dersId].net) || 0,
      tarih: d.tarih,
      sinav: d.sinav,
      tur: 'genel',
      etiket: `${d.sinav} ${d.tarih?.slice(5) || ''}`,
    }));

  const bransNoktalar = bransDenemeler
    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
    .map(d => ({
      net: parseFloat(d.toplamNet) || 0,
      tarih: d.tarih,
      sinav: d.sinav,
      tur: 'brans',
      etiket: `Branş ${d.tarih?.slice(5) || ''}`,
    }));

  const grafikData = [...genelNoktalar, ...bransNoktalar].sort(
    (a, b) => new Date(a.tarih) - new Date(b.tarih)
  );

  if (genelNoktalar.length === 0 && bransNoktalar.length === 0) return null;

  const yorum = yorumUret(grafikData.map(n => ({ net: n.net, tarih: n.tarih })));

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{ width: 3, height: 20, borderRadius: 99, background: dersRenk, flexShrink: 0 }}
        />
        <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>{dersLabel}</div>
        <div style={{ flex: 1, height: 1, background: s.border }} />
        <div
          style={{
            display: 'flex',
            background: s.surface2,
            borderRadius: 8,
            border: `1px solid ${s.border}`,
            overflow: 'hidden',
          }}
        >
          {[
            { k: 'tablo', l: 'Tablo' },
            { k: 'grafik', l: 'Grafik' },
          ].map(t => (
            <button
              key={t.k}
              type="button"
              onClick={() => setGosterim(t.k)}
              style={{
                padding: '5px 12px',
                border: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: gosterim === t.k ? s.accent : 'transparent',
                color: gosterim === t.k ? '#fff' : s.text3,
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {yorum && (
        <div
          style={{
            fontSize: 12,
            color: yorum.renk,
            fontWeight: 600,
            marginBottom: 10,
            background: s.surface,
            border: `1px solid ${s.border}`,
            borderRadius: 8,
            padding: '8px 12px',
            display: 'inline-block',
          }}
        >
          {yorum.ikon} {yorum.metin}
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
        {genelNoktalar.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 2, background: RENK.genel, borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: s.text3 }}>Genel denemede bu ders</span>
          </div>
        )}
        {bransNoktalar.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: RENK.brans,
                transform: 'rotate(45deg)',
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 10, color: s.text3 }}>Branş denemesi</span>
          </div>
        )}
      </div>

      {gosterim === 'grafik' && grafikData.length >= 2 && (
        <div
          style={{
            background: s.surface,
            border: `1px solid ${s.border}`,
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 12,
          }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={grafikData} margin={{ top: 5, right: 10, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={s.border} vertical={false} />
              <XAxis
                dataKey="etiket"
                tick={{ fontSize: 9, fill: s.text3 }}
                angle={-30}
                textAnchor="end"
                height={50}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: s.text3 }}
                tickLine={false}
                axisLine={false}
                domain={[0, dersMax || 40]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0]?.payload;
                  return (
                    <div
                      style={{
                        background: s.surface,
                        border: `1px solid ${s.border}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 11,
                      }}
                    >
                      <div style={{ color: s.text3 }}>
                        {p.tarih} · {p.sinav}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: dersRenk, marginTop: 2 }}>
                        {p.net} net
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          marginTop: 2,
                          color: p.tur === 'brans' ? RENK.brans : RENK.genel,
                        }}
                      >
                        {p.tur === 'brans' ? '◆ Branş' : '● Genel'}
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke={dersRenk}
                strokeWidth={2}
                dot={props => {
                  const { cx, cy, payload } = props;
                  if (payload.tur === 'brans')
                    return (
                      <rect
                        key={`${cx}${cy}`}
                        x={cx - 4}
                        y={cy - 4}
                        width={8}
                        height={8}
                        fill={RENK.brans}
                        transform={`rotate(45 ${cx} ${cy})`}
                      />
                    );
                  return (
                    <circle
                      key={`${cx}${cy}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={RENK.genel}
                      strokeWidth={0}
                    />
                  );
                }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {gosterim === 'tablo' && (
        <BransBolumTablo
          bransDenemeler={bransDenemeler}
          bransNoktalar={bransNoktalar}
          genelNoktalar={genelNoktalar}
          denemeler={denemeler}
          dersRenk={dersRenk}
          dersId={dersId}
          onSil={onSil}
          s={s}
        />
      )}
    </div>
  );
}

BransBolum.propTypes = {
  dersId: PropTypes.string,
  dersLabel: PropTypes.string,
  dersRenk: PropTypes.string,
  dersMax: PropTypes.number,
  denemeler: PropTypes.arrayOf(PropTypes.object),
  onSil: PropTypes.func,
  s: PropTypes.object.isRequired,
};
