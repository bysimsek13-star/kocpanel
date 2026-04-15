import React from 'react';
import { KONULAR, netHesapla } from '../data/konular';

export default function GunlukSoruDersListesi({
  dersler,
  veriler,
  guncelle,
  konuDetay,
  konuGuncelle,
  s,
}) {
  return (
    <>
      {dersler.map(ders => {
        const dy = veriler[ders.id] || {};
        const d = dy.d || 0;
        const y = dy.y || 0;
        const b = dy.b || 0;
        const net = netHesapla(d, y);
        const konuListesi = KONULAR[ders.id] || [];
        const dersKonuDetay = konuDetay[ders.id] || {};
        const cozum = d + y + b;

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

            {konuListesi.length > 0 && (y > 0 || b > 0) && (
              <div>
                <div style={{ fontSize: 10, color: s.accent, marginBottom: 6, fontWeight: 700 }}>
                  KONU BAZLI (yanlış / boş)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {konuListesi.map(konu => {
                    const kb = dersKonuDetay[konu] || { soru: 0, yanlis: 0, bos: 0 };
                    return (
                      <div
                        key={konu}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
                      >
                        <div
                          style={{
                            flex: 1,
                            minWidth: 120,
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
                          onChange={e => konuGuncelle(ders.id, konu, 'yanlis', e.target.value)}
                          style={{
                            width: 48,
                            background: s.inputBg ?? s.surface,
                            border: `1px solid ${s.danger}`,
                            borderRadius: 6,
                            padding: '6px 4px',
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
                          onChange={e => konuGuncelle(ders.id, konu, 'bos', e.target.value)}
                          style={{
                            width: 48,
                            background: s.inputBg ?? s.surface,
                            border: `1px solid ${s.inputBorder ?? s.border}`,
                            borderRadius: 6,
                            padding: '6px 4px',
                            color: s.text2,
                            fontSize: 12,
                            textAlign: 'center',
                            touchAction: 'manipulation',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
