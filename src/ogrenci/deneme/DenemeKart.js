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

const RENK_TYT = '#534AB7';
const RENK_AYT = '#0F6E56';

// ─── Genel deneme net grafiği — TYT ve AYT ayrı renkli çizgiler ───────────────
export function GenelNetGrafik({ denemeler, s }) {
  const geneller = [...denemeler]
    .filter(d => d.denemeTuru !== 'brans')
    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih));

  const hasTyt = geneller.some(d => (d.sinav || '').toUpperCase().includes('TYT'));
  const hasAyt = geneller.some(d => (d.sinav || '').toUpperCase().includes('AYT'));

  const tumData = geneller.map(d => ({
    etiket: `${d.sinav} ${d.tarih?.slice(5) || ''}`,
    tyt: (d.sinav || '').toUpperCase().includes('TYT') ? parseFloat(d.toplamNet) || 0 : null,
    ayt: (d.sinav || '').toUpperCase().includes('AYT') ? parseFloat(d.toplamNet) || 0 : null,
    net: parseFloat(d.toplamNet) || 0,
  }));

  const showSplit = hasTyt && hasAyt;

  if (geneller.length < 2) return null;
  const ort = (
    geneller.reduce((a, d) => a + (parseFloat(d.toplamNet) || 0), 0) / geneller.length
  ).toFixed(1);

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 16,
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>Toplam net seyri</div>
          <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>
            {geneller.length} deneme
            {showSplit && (
              <>
                {' · '}
                <span style={{ color: RENK_TYT }}>TYT</span>
                {' · '}
                <span style={{ color: RENK_AYT }}>AYT</span>
              </>
            )}
          </div>
        </div>
        <div style={{ fontSize: 11, color: s.text3 }}>
          Ort: <b style={{ color: s.text2 }}>{ort}</b>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={tumData} margin={{ top: 5, right: 10, bottom: 30, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={s.border} vertical={false} />
          <XAxis
            dataKey="etiket"
            tick={{ fontSize: 9, fill: s.text3 }}
            angle={-30}
            textAnchor="end"
            height={50}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 9, fill: s.text3 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              fontSize: 11,
              color: s.text,
            }}
            labelStyle={{ color: s.text3 }}
            formatter={(v, name) => [
              v != null ? `${v} net` : '—',
              name === 'tyt' ? 'TYT' : name === 'ayt' ? 'AYT' : '',
            ]}
          />
          <ReferenceLine y={parseFloat(ort)} stroke={s.text3} strokeDasharray="4 4" />
          {showSplit ? (
            <>
              <Line
                connectNulls
                type="monotone"
                dataKey="tyt"
                stroke={RENK_TYT}
                strokeWidth={2}
                dot={{ fill: RENK_TYT, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                connectNulls
                type="monotone"
                dataKey="ayt"
                stroke={RENK_AYT}
                strokeWidth={2}
                dot={{ fill: RENK_AYT, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </>
          ) : (
            <Line
              type="monotone"
              dataKey="net"
              stroke={RENK_TYT}
              strokeWidth={2}
              dot={{ fill: RENK_TYT, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Deneme detay kartı ────────────────────────────────────────────────────────
import { TYT_DERSLER, AYT_DERSLER } from '../../data/konular';
import { LGS_DERSLER } from '../../utils/ogrenciBaglam';
// Eski fen/sos ID'leriyle kaydedilmiş verilerin gösterilmesi için fallback'ler eklendi
const ESKI_DERSLER = [
  { id: 'fen', label: 'Fen Bilimleri', renk: '#10B981' },
  { id: 'sos', label: 'Sosyal Bilimler', renk: '#F43F5E' },
  { id: 'mat', label: 'Matematik (AYT)', renk: '#5B4FE8' },
];
const TUM_DERSLER_LOCAL = [...TYT_DERSLER, ...AYT_DERSLER, ...LGS_DERSLER, ...ESKI_DERSLER];
const dersGetir = id => TUM_DERSLER_LOCAL.find(d => d.id === id);

function kartBaslik(deneme) {
  if (deneme.denemeTuru === 'brans') {
    const ilkDersId = Object.keys(deneme.netler || {})[0];
    const dersLabel = ilkDersId ? dersGetir(ilkDersId)?.label || ilkDersId : '';
    return `Branş${dersLabel ? ` — ${dersLabel}` : ''}`;
  }
  return deneme.sinav || 'Deneme';
}

export function DenemeKart({ deneme, acik, onToggle, onSil, onDuzenle, s }) {
  const isBrans = deneme.denemeTuru === 'brans';
  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px' }}>
        <div
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flex: 1,
            cursor: 'pointer',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 20,
              background: isBrans ? RENK.bg.brans : RENK.bg.genel,
              color: isBrans ? RENK.brans : RENK.genel,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {kartBaslik(deneme)}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: s.text }}>
            {!isBrans && deneme.alan ? deneme.alan : ''}
          </span>
          <span style={{ fontSize: 11, color: s.text3 }}>{deneme.tarih}</span>
          {deneme.yayinevi && (
            <span
              style={{
                fontSize: 10,
                color: s.text3,
                background: s.surface2,
                padding: '2px 8px',
                borderRadius: 20,
              }}
            >
              {deneme.yayinevi}
            </span>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 20, fontWeight: 800, color: s.accent }}>
            {deneme.toplamNet}
          </div>
          <div style={{ fontSize: 11, color: s.text3, marginLeft: 2 }}>net</div>
          <div
            style={{
              color: s.text3,
              fontSize: 12,
              marginLeft: 4,
              transition: 'transform .2s',
              transform: acik ? 'rotate(90deg)' : 'none',
            }}
          >
            ▶
          </div>
        </div>
        {onDuzenle && (
          <button
            onClick={onDuzenle}
            style={{
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 7,
              padding: '5px 10px',
              cursor: 'pointer',
              color: s.text2,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            Düzenle
          </button>
        )}
        {onSil && (
          <button
            onClick={onSil}
            style={{
              background: s.tehlikaSoft,
              border: `1px solid ${s.border}`,
              borderRadius: 7,
              padding: '5px 10px',
              cursor: 'pointer',
              color: s.tehlika,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            Sil
          </button>
        )}
      </div>

      {acik && (
        <div
          style={{
            padding: '14px 18px',
            borderTop: `1px solid ${s.border}`,
            background: s.surface2,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
              gap: 8,
            }}
          >
            {Object.entries(deneme.netler || {}).map(([dersId, v]) => {
              const dl = dersGetir(dersId);
              return (
                <div
                  key={dersId}
                  style={{
                    background: s.surface,
                    borderRadius: 10,
                    padding: '10px 12px',
                    border: `1px solid ${s.border}`,
                  }}
                >
                  <div style={{ fontSize: 10, color: s.text3, marginBottom: 3 }}>
                    {dl?.label || dersId}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: dl?.renk || s.accent }}>
                    {v.net}
                  </div>
                  <div style={{ fontSize: 9, color: s.text3, marginTop: 2 }}>
                    {v.d}D {v.y}Y {v.b}B
                  </div>
                  {(v.yanlisKonular?.length > 0 || v.bosKonular?.length > 0) && (
                    <div style={{ marginTop: 6 }}>
                      {v.yanlisKonular?.length > 0 && (
                        <>
                          <div
                            style={{
                              fontSize: 10,
                              color: s.danger,
                              fontWeight: 700,
                              marginBottom: 4,
                            }}
                          >
                            YANLIŞ KONULAR
                          </div>
                          <div
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}
                          >
                            {v.yanlisKonular.map(k => (
                              <div
                                key={k}
                                style={{
                                  fontSize: 11,
                                  color: s.danger,
                                  background: `${s.danger}18`,
                                  border: `1px solid ${s.danger}40`,
                                  borderRadius: 6,
                                  padding: '2px 7px',
                                  fontWeight: 500,
                                }}
                              >
                                {k}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {v.bosKonular?.length > 0 && (
                        <>
                          <div
                            style={{
                              fontSize: 10,
                              color: s.text3,
                              fontWeight: 700,
                              marginBottom: 4,
                            }}
                          >
                            BOŞ KONULAR
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {v.bosKonular.map(k => (
                              <div
                                key={k}
                                style={{
                                  fontSize: 11,
                                  color: s.text2,
                                  background: s.surface3 || s.surface,
                                  border: `1px solid ${s.border}`,
                                  borderRadius: 6,
                                  padding: '2px 7px',
                                  fontWeight: 500,
                                }}
                              >
                                {k}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

GenelNetGrafik.propTypes = {
  denemeler: PropTypes.arrayOf(PropTypes.object).isRequired,
  s: PropTypes.object.isRequired,
};
DenemeKart.propTypes = {
  deneme: PropTypes.object.isRequired,
  acik: PropTypes.bool,
  onToggle: PropTypes.func,
  onSil: PropTypes.func,
  onDuzenle: PropTypes.func,
  s: PropTypes.object.isRequired,
};
