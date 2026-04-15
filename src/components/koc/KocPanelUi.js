import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Btn } from '../Shared';

/** Üst bant: başlık + açıklama + opsiyonel geri + sağ aksiyon */
export function KocHeroBand({ baslik, aciklama, onGeri, geriEtiket = 'Geri', sagSlot, mobil }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        borderRadius: 20,
        padding: mobil ? 18 : 22,
        marginBottom: 22,
        background: s.heroSurface || s.surface,
        border: `1px solid ${s.border}`,
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
          {onGeri && (
            <Btn
              onClick={onGeri}
              variant="outline"
              style={{
                padding: '8px 14px',
                fontSize: 13,
                flexShrink: 0,
                background: s.surface,
                borderColor: s.border,
              }}
            >
              ← {geriEtiket}
            </Btn>
          )}
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: mobil ? 22 : 26,
                fontWeight: 700,
                color: s.heroTitle || s.text,
                letterSpacing: -0.03,
                lineHeight: 1.2,
              }}
            >
              {baslik}
            </h1>
            {aciklama ? (
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: 14,
                  color: s.heroMuted || s.text2,
                  lineHeight: 1.55,
                  maxWidth: 580,
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

/** KPI satırı */
export function KocKpiStrip({ items, mobil }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mobil
          ? 'repeat(2, minmax(0, 1fr))'
          : `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
        gap: 12,
        marginBottom: 22,
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            padding: '16px 18px',
            borderRadius: 16,
            background: s.surface,
            border: `1px solid ${s.border}`,
            boxShadow: s.shadow,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: s.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              fontSize: mobil ? 24 : 28,
              fontWeight: 700,
              color: it.vurgu || s.text,
              marginTop: 6,
              letterSpacing: -0.02,
            }}
          >
            {it.deger}
          </div>
          {it.alt ? (
            <div style={{ fontSize: 12, color: s.text3, marginTop: 4, lineHeight: 1.35 }}>
              {it.alt}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Filtre + arama için çerçeve */
export function KocToolbar({ children, mobil }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: mobil ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: mobil ? 'stretch' : 'center',
        marginBottom: 18,
        padding: '14px 16px',
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        boxShadow: s.shadow,
      }}
    >
      {children}
    </div>
  );
}

export function KocChipGroup({ options, value, onChange }) {
  const { s } = useTheme();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {options.map(opt => {
        const on = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${on ? s.accent : s.border}`,
              background: on ? s.accentSoft : s.surface2,
              color: on ? s.accent : s.text2,
              transition: 'background .15s, border-color .15s',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function KocSortRow({ options, value, onChange, label = 'Sırala' }) {
  const { s } = useTheme();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: s.text3,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {options.map(opt => {
        const on = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: on ? s.surface2 : 'transparent',
              color: on ? s.accent : s.text3,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Liste / tablo dış kabuğu */
export function KocTableShell({ children }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      {children}
    </div>
  );
}

/** Grafik kartı: başlık şeridi + içerik */
export function KocChartCard({ title, hint, children }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: s.shadowCard || s.shadow,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${s.border}`,
          background: s.surface2,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>{title}</div>
        {hint ? <div style={{ fontSize: 11, color: s.text3 }}>{hint}</div> : null}
      </div>
      <div style={{ padding: '18px 20px', flex: 1 }}>{children}</div>
    </div>
  );
}
