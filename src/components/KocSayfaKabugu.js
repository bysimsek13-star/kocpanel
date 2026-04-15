import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Btn } from './Shared';

/** Kurumsal koç sayfaları için ortak üst başlık (Koçpit / Kant tarzı) */
export function KocSayfaBaslik({ baslik, aciklama, geriEtiket = 'Geri', onGeri, sagSlot, mobil }) {
  const { s } = useTheme();
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
          {onGeri && (
            <Btn
              onClick={onGeri}
              variant="outline"
              style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}
            >
              ← {geriEtiket}
            </Btn>
          )}
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: mobil ? 20 : 22,
                fontWeight: 700,
                color: s.heroTitle || s.text,
                margin: 0,
                letterSpacing: -0.02,
                lineHeight: 1.25,
              }}
            >
              {baslik}
            </h1>
            {aciklama ? (
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 13,
                  color: s.heroMuted || s.text2,
                  lineHeight: 1.55,
                  maxWidth: 620,
                }}
              >
                {aciklama}
              </p>
            ) : null}
          </div>
        </div>
        {sagSlot ? <div style={{ flexShrink: 0 }}>{sagSlot}</div> : null}
      </div>
    </div>
  );
}

/** Üst şerit özet kutuları */
export function KocOzetKutulari({ items, mobil }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mobil
          ? 'repeat(2, minmax(0, 1fr))'
          : `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
        gap: 10,
        marginBottom: 20,
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            background: s.heroSurface || s.surface,
            border: `1px solid ${s.border}`,
            borderRadius: 14,
            padding: mobil ? '12px 14px' : '14px 16px',
            boxShadow: s.shadowCard || s.shadow,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: s.text3,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              fontSize: mobil ? 20 : 22,
              fontWeight: 700,
              color: it.vurguRenk || s.heroTitle || s.text,
              marginTop: 6,
              letterSpacing: -0.02,
            }}
          >
            {it.deger}
          </div>
          {it.alt ? (
            <div style={{ fontSize: 11, color: s.heroMuted || s.text3, marginTop: 4 }}>
              {it.alt}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
