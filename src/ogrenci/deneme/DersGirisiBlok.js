import React from 'react';
import { KONULAR, netHesapla } from '../../data/konular';

export function DersGirisiBlok({ ders, veriler, konuDetay, onGuncelle, onKonuGuncelle, s }) {
  const dy = veriler[ders.id] || {};
  const net = netHesapla(dy.d || 0, dy.y || 0);
  const konuListesi = KONULAR[ders.id] || [];

  return (
    <div style={{ marginBottom: 12, background: s.surface2, borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ders.renk }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: ders.renk, flex: 1 }}>{ders.label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: s.accent }}>{net}</div>
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}
      >
        {[
          { t: 'd', l: 'Doğru', c: s.success },
          { t: 'y', l: 'Yanlış', c: s.danger },
          { t: 'b', l: 'Boş', c: s.text3 },
        ].map(f => (
          <div key={f.t}>
            <div style={{ fontSize: 9, color: f.c, marginBottom: 3, fontWeight: 600 }}>{f.l}</div>
            <input
              type="number"
              min="0"
              max={ders.toplam}
              placeholder="0"
              value={dy[f.t] || ''}
              onChange={e => onGuncelle(ders.id, f.t, e.target.value)}
              style={{
                width: '100%',
                background: s.inputBg ?? s.surface,
                border: `1px solid ${f.c}`,
                borderRadius: 8,
                padding: 7,
                color: f.c,
                fontSize: 13,
                outline: 'none',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
      </div>
      {konuListesi.length > 0 && (dy.y > 0 || dy.b > 0) && (
        <div>
          <div style={{ fontSize: 9, color: s.text3, marginBottom: 6, fontWeight: 600 }}>
            KONU BAZLI DETAY
          </div>
          {konuListesi.map(konu => {
            const kb = konuDetay[ders.id]?.[konu] || {};
            return (
              <div
                key={konu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 0',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 100, fontSize: 10, color: s.text }}>{konu}</div>
                {[
                  { l: 'Y', c: s.danger, k: 'yanlis' },
                  { l: 'B', c: s.text3, k: 'bos' },
                ].map(f => (
                  <input
                    key={f.k}
                    type="number"
                    min="0"
                    placeholder={f.l}
                    value={kb[f.k] || ''}
                    onChange={e => onKonuGuncelle(ders.id, konu, f.k, e.target.value)}
                    style={{
                      width: 38,
                      background: s.inputBg ?? s.surface,
                      border: `1px solid ${s.inputBorder ?? s.border}`,
                      borderRadius: 6,
                      padding: '3px 5px',
                      color: f.c,
                      fontSize: 10,
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
