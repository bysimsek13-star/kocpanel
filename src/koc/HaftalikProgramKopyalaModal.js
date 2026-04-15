import React from 'react';
import { haftaBaslangici } from '../utils/programAlgoritma';

export function HaftalikProgramKopyalaModal({
  haftaKey,
  haftaOffset,
  kopyalaHedef,
  setKopyalaHedef,
  kopyalaniyor,
  haftayiKopyala,
  onKapat,
  s,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(0,0,0,0.5)',
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
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 380,
          boxShadow: s.shadow,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 6 }}>
          Haftayı Kopyala
        </div>
        <div style={{ fontSize: 12, color: s.text3, marginBottom: 20 }}>
          Kaynak: <b style={{ color: s.text2 }}>{haftaKey}</b> haftası
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: s.text3,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Kopyalanacak hafta
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(delta => {
            const targetOffset = haftaOffset + delta;
            const targetKey = haftaBaslangici(
              new Date(Date.now() + targetOffset * 7 * 24 * 60 * 60 * 1000)
            );
            const label = delta === 1 ? 'Gelecek hafta' : `+${delta} hafta`;
            const secili = kopyalaHedef === targetOffset;
            return (
              <div
                key={delta}
                onClick={() => setKopyalaHedef(targetOffset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: `1.5px solid ${secili ? s.accent : s.border}`,
                  background: secili ? s.accentSoft : s.surface2,
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: secili ? s.accent : s.text }}>
                  {label}
                </span>
                <span style={{ fontSize: 11, color: s.text3 }}>{targetKey}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onKapat}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: 12,
              border: `1px solid ${s.border}`,
              background: s.surface2,
              color: s.text2,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            İptal
          </button>
          <button
            onClick={haftayiKopyala}
            disabled={kopyalaHedef === null || kopyalaniyor}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: 12,
              border: 'none',
              background: kopyalaHedef !== null ? s.accentGrad : s.surface3,
              color: kopyalaHedef !== null ? (s.buttonText ?? '#fff') : s.text3,
              fontWeight: 700,
              fontSize: 13,
              cursor: kopyalaHedef !== null ? 'pointer' : 'not-allowed',
            }}
          >
            {kopyalaniyor ? 'Kopyalanıyor...' : '📋 Kopyala'}
          </button>
        </div>
      </div>
    </div>
  );
}
