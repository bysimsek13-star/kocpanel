import React, { useState } from 'react';
import { KONULAR, netHesapla } from '../data/konular';
import { konulariBolumle } from './gunlukSoruUtils';

function KonuSatir({ konu, kb, dersId, konuGuncelle, s }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
      <div
        style={{
          flex: 1,
          minWidth: 100,
          fontSize: 11,
          color: s.text,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {konu}
      </div>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max="50"
        placeholder="Y"
        title="Yanlış"
        value={kb.yanlis || ''}
        onChange={e => konuGuncelle(dersId, konu, 'yanlis', e.target.value)}
        style={{
          width: 44,
          background: 'transparent',
          border: `1px solid ${s.danger}`,
          borderRadius: 6,
          padding: '5px 4px',
          color: s.danger,
          fontSize: 12,
          textAlign: 'center',
          touchAction: 'manipulation',
        }}
      />
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max="50"
        placeholder="B"
        title="Boş"
        value={kb.bos || ''}
        onChange={e => konuGuncelle(dersId, konu, 'bos', e.target.value)}
        style={{
          width: 44,
          background: 'transparent',
          border: `1px solid ${s.border}`,
          borderRadius: 6,
          padding: '5px 4px',
          color: s.text2,
          fontSize: 12,
          textAlign: 'center',
          touchAction: 'manipulation',
        }}
      />
    </div>
  );
}

export default function GunlukSoruDersListesi({
  dersler,
  veriler,
  guncelle,
  konuDetay,
  konuGuncelle,
  s,
}) {
  const [acikBolumler, setAcikBolumler] = useState({});
  const toggleBolum = key => setAcikBolumler(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {dersler.map(ders => {
        const dy = veriler[ders.id] || {};
        const d = dy.d || 0;
        const y = dy.y || 0;
        const b = dy.b || 0;
        const net = netHesapla(d, y);
        const cozum = d + y + b;
        const dersKonuDetay = konuDetay[ders.id] || {};
        const bolumler = konulariBolumle(KONULAR[ders.id]);
        const tekDuzBolum = bolumler.length === 1 && bolumler[0].bolumAd === '';

        return (
          <div
            key={ders.id}
            style={{
              marginBottom: 12,
              background: s.surface2,
              borderRadius: 12,
              padding: 14,
              border: `1px solid ${s.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ders.renk }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: ders.renk, flex: 1 }}>
                {ders.label}
              </div>
              {cozum > 0 && (
                <div style={{ fontSize: 12, color: s.text3 }}>
                  {cozum} soru · <span style={{ fontWeight: 700, color: s.accent }}>{net}</span> net
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                marginBottom: 8,
              }}
            >
              {[
                { t: 'd', l: 'Doğru', c: s.success },
                { t: 'y', l: 'Yanlış', c: s.danger },
                { t: 'b', l: 'Boş', c: s.text3 },
              ].map(f => (
                <div key={f.t}>
                  <div style={{ fontSize: 9, color: f.c, marginBottom: 3, fontWeight: 600 }}>
                    {f.l}
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={200}
                    placeholder="0"
                    value={dy[f.t] || ''}
                    onChange={e => guncelle(ders.id, f.t, e.target.value)}
                    style={{
                      width: '100%',
                      background: s.inputBg ?? s.surface,
                      border: `1px solid ${f.c}`,
                      borderRadius: 8,
                      padding: '10px 7px',
                      color: f.c,
                      fontSize: 14,
                      outline: 'none',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                      touchAction: 'manipulation',
                    }}
                  />
                </div>
              ))}
            </div>

            {bolumler.length > 0 && (y > 0 || b > 0) && (
              <div>
                <div style={{ fontSize: 10, color: s.accent, marginBottom: 6, fontWeight: 700 }}>
                  KONU BAZLI (yanlış / boş)
                </div>

                {tekDuzBolum ? (
                  // LGS / flat format — doğrudan liste
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {bolumler[0].konular.map(konu => (
                      <KonuSatir
                        key={konu}
                        konu={konu}
                        kb={dersKonuDetay[konu] || {}}
                        dersId={ders.id}
                        konuGuncelle={konuGuncelle}
                        s={s}
                      />
                    ))}
                  </div>
                ) : (
                  // TYT / AYT — bölüm chip'leri, tık → açılır
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {bolumler.map(bolum => {
                      const key = `${ders.id}|${bolum.bolumAd}`;
                      const acik = acikBolumler[key];
                      const topGirilen = bolum.konular.reduce(
                        (sum, k) =>
                          sum + (dersKonuDetay[k]?.yanlis || 0) + (dersKonuDetay[k]?.bos || 0),
                        0
                      );
                      return (
                        <div key={bolum.bolumAd}>
                          <button
                            type="button"
                            onClick={() => toggleBolum(key)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: acik ? s.accentSoft : s.surface,
                              border: `1px solid ${acik ? s.accent : s.border}`,
                              borderRadius: 8,
                              padding: '6px 10px',
                              color: acik ? s.accent : s.text2,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <span>{bolum.bolumAd}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {topGirilen > 0 && (
                                <span
                                  style={{
                                    background: s.danger,
                                    color: '#fff',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    borderRadius: 99,
                                    padding: '1px 6px',
                                  }}
                                >
                                  {topGirilen}
                                </span>
                              )}
                              <span style={{ fontSize: 10 }}>{acik ? '▲' : '▼'}</span>
                            </span>
                          </button>
                          {acik && (
                            <div
                              style={{
                                paddingLeft: 8,
                                paddingTop: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                              }}
                            >
                              {bolum.konular.map(konu => (
                                <KonuSatir
                                  key={konu}
                                  konu={konu}
                                  kb={dersKonuDetay[konu] || {}}
                                  dersId={ders.id}
                                  konuGuncelle={konuGuncelle}
                                  s={s}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
