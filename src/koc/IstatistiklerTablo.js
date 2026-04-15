import React from 'react';
import { KocChartCard } from '../components/koc/KocPanelUi';

export function OgrenciDurumTablosu({ ogrenciDurum, s }) {
  return (
    <KocChartCard title="Öğrenci durum tablosu" hint="Son sınav neti, değişim, haftalık çalışma">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: s.text3, borderBottom: `1px solid ${s.border}` }}>
              {['Öğrenci', 'Son Net', 'Fark', 'Hft. Çalışma', 'Program', ''].map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: i === 0 ? 'left' : 'right',
                    padding: '6px 8px',
                    fontWeight: 600,
                    paddingLeft: i === 5 ? 4 : undefined,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ogrenciDurum.map((o, i) => {
              const netRenk =
                o.sonNet === null
                  ? s.text3
                  : o.sonNet >= 20
                    ? s.chartPos || '#22c55e'
                    : o.sonNet >= 10
                      ? s.uyari || '#f59e0b'
                      : s.danger || '#ef4444';
              const farkRenk =
                o.netFark === null
                  ? s.text3
                  : o.netFark >= 0
                    ? s.chartPos || '#22c55e'
                    : s.danger || '#ef4444';
              return (
                <tr
                  key={o.id}
                  style={{
                    borderBottom: `1px solid ${s.border}`,
                    background: i % 2 === 0 ? 'transparent' : `${s.accent}05`,
                  }}
                >
                  <td style={{ padding: '8px 8px', fontWeight: 600, color: s.text }}>
                    {o.isim.split(' ')[0]}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px 8px',
                      color: netRenk,
                      fontWeight: 700,
                    }}
                  >
                    {o.sonNet !== null ? o.sonNet.toFixed(1) : '—'}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px 8px',
                      color: farkRenk,
                      fontWeight: 600,
                    }}
                  >
                    {o.netFark === null
                      ? '—'
                      : `${o.netFark >= 0 ? '+' : ''}${o.netFark.toFixed(1)}`}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px 8px',
                      color: o.haftalikCalisma > 0 ? s.text : s.text3,
                    }}
                  >
                    {o.haftalikCalisma > 0 ? `${o.haftalikCalisma}s` : '—'}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px 8px',
                      color: o.progTam !== null ? s.text : s.text3,
                    }}
                  >
                    {o.progTam !== null ? `%${o.progTam}` : '—'}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                    {o.risk && (
                      <span
                        style={{
                          background: `${s.danger || '#ef4444'}20`,
                          color: s.danger || '#ef4444',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 20,
                        }}
                      >
                        Risk
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </KocChartCard>
  );
}

export function KonuYogunlugu({ zayifKonularDersle, s }) {
  return (
    <KocChartCard
      title="Konu yoğunluğu"
      hint="Derse göre gruplu — yanlış ve boş konuların ağırlıklı skoru"
    >
      {zayifKonularDersle.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: s.text3, fontSize: 13 }}>
          Bu kapsam için konu verisi yok.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {zayifKonularDersle.map(({ dersId, dersLabel, dersRenk, konular }) => {
            const maks = konular[0]?.skor || 1;
            return (
              <div key={dersId}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: dersRenk,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: s.text,
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                    }}
                  >
                    {dersLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {konular.map((k, i) => {
                    const oran = Math.round((k.skor / maks) * 100);
                    const rk =
                      i < 2 ? s.danger || '#ef4444' : i < 4 ? s.uyari || '#f59e0b' : s.text3;
                    return (
                      <div key={k.konu} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 96,
                            fontSize: 11,
                            color: s.text,
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={k.konu}
                        >
                          {k.konu}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: 7,
                            background: s.surface3 || s.border,
                            borderRadius: 8,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${oran}%`,
                              background: rk,
                              borderRadius: 8,
                              transition: 'width 0.5s',
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: rk,
                            width: 24,
                            textAlign: 'right',
                          }}
                        >
                          {k.skor}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </KocChartCard>
  );
}
