import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';

export { default as ElsWayLogo } from './ElsWayLogo';

export function Avatar({ isim, renk, boyut = 40 }) {
  const safeIsim = isim && typeof isim === 'string' && isim.trim() ? isim.trim() : '';
  const h = safeIsim
    ? safeIsim
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '—';
  return (
    <div
      style={{
        width: boyut,
        height: boyut,
        borderRadius: '50%',
        background: `${renk}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: renk,
        fontWeight: 700,
        fontSize: Math.round(boyut * 0.33),
        flexShrink: 0,
      }}
    >
      {h}
    </div>
  );
}

export function LoadingState({ mesaj = 'Yükleniyor...' }) {
  const { s } = useTheme();
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: s.text3, fontSize: 14 }}>
      <div style={{ marginBottom: 8, fontSize: 24 }}>⏳</div>
      {mesaj}
    </div>
  );
}

export function EmptyState({ mesaj = 'Henüz veri yok', icon = '📭' }) {
  const { s } = useTheme();
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: s.text2, fontSize: 14 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      {mesaj}
    </div>
  );
}

export function Card({ children, style = {}, onClick }) {
  const { s } = useTheme();
  const sh = s.shadowCard || s.shadow;
  const tiklanabilir = !!onClick;
  return (
    <div
      onClick={onClick}
      onKeyDown={
        tiklanabilir
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') onClick(e);
            }
          : undefined
      }
      tabIndex={tiklanabilir ? 0 : undefined}
      role={tiklanabilir ? 'button' : undefined}
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: sh,
        cursor: tiklanabilir ? 'pointer' : 'default',
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, renk, icon }) {
  const { s } = useTheme();
  return (
    <Card style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: `${renk}10`,
          borderRadius: '0 16px 0 80px',
        }}
      />
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          fontSize: 11,
          color: s.text2,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: renk, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: s.text3, marginTop: 6 }}>{sub}</div>
    </Card>
  );
}

export function Btn({
  children,
  onClick,
  disabled,
  variant = 'primary',
  style = {},
  ariaLabel,
  type = 'button',
}) {
  const { s } = useTheme();
  const [h, setH] = useState(false);
  const [a, setA] = useState(false);
  const base = {
    padding: '11px 20px',
    borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    transition: 'all 0.15s',
    transform: a && !disabled ? 'scale(0.97)' : 'scale(1)',
    outline: 'none',
    whiteSpace: 'nowrap',
    ...style,
  };
  const hs = h && !disabled ? { boxShadow: `0 0 0 3px ${s.primary ?? s.accent}40` } : {};
  const ev = {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setA(false);
    },
    onMouseDown: () => setA(true),
    onMouseUp: () => setA(false),
  };
  const dangerBg = s.tehlikaSoft ?? `${s.danger}18`;
  const v = {
    primary: {
      background: disabled ? s.surface3 : s.accentGrad,
      color: disabled ? s.text3 : (s.buttonText ?? '#fff'),
      opacity: disabled ? 0.6 : h ? 0.9 : 1,
    },
    outline: {
      background: h ? s.accentSoft : 'transparent',
      color: s.accent,
      border: `2px solid ${h ? s.accent : s.border}`,
    },
    danger: {
      background: dangerBg,
      color: s.danger ?? s.tehlika,
      border: `1px solid ${h ? (s.danger ?? s.tehlika) : (s.borderSoft ?? s.border)}`,
    },
    ghost: {
      background: s.surface2,
      color: s.text2,
      border: `1px solid ${h ? s.accent : s.border}`,
    },
  };
  return (
    <button
      {...ev}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      style={{ ...base, ...hs, ...(v[variant] || v.ghost) }}
    >
      {children}
    </button>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  onKeyDown,
  style: es = {},
  id,
  ariaLabel,
  required = false,
  gecersiz = false,
}) {
  const { s } = useTheme();
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel || placeholder}
      aria-required={required}
      aria-invalid={gecersiz}
      style={{
        width: '100%',
        background: s.inputBg ?? s.surface,
        border: `1px solid ${gecersiz ? s.tehlika || s.danger : (s.inputBorder ?? s.border)}`,
        borderRadius: 10,
        padding: '12px 14px',
        color: s.text,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border 0.15s',
        ...es,
      }}
      onFocus={e => (e.target.style.borderColor = s.inputFocus ?? s.accent)}
      onBlur={e =>
        (e.target.style.borderColor = gecersiz
          ? s.tehlika || s.danger
          : (s.inputBorder ?? s.border))
      }
    />
  );
}

Avatar.propTypes = {
  isim: PropTypes.string,
  renk: PropTypes.string,
  boyut: PropTypes.number,
};

LoadingState.propTypes = {
  mesaj: PropTypes.string,
};

EmptyState.propTypes = {
  mesaj: PropTypes.string,
  icon: PropTypes.string,
};

Card.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

StatCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sub: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  renk: PropTypes.string,
  icon: PropTypes.node,
};

Btn.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'outline', 'danger', 'ghost']),
  style: PropTypes.object,
  ariaLabel: PropTypes.string,
  type: PropTypes.string,
};

Input.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  onKeyDown: PropTypes.func,
  style: PropTypes.object,
  id: PropTypes.string,
  ariaLabel: PropTypes.string,
  required: PropTypes.bool,
  gecersiz: PropTypes.bool,
};

export function ConfirmDialog({ baslik, mesaj, onEvet, onHayir }) {
  const { s } = useTheme();
  React.useEffect(() => {
    const kapat = e => {
      if (e.key === 'Escape') onHayir();
    };
    document.addEventListener('keydown', kapat);
    return () => document.removeEventListener('keydown', kapat);
  }, [onHayir]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-baslik"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: s.surface,
          borderRadius: 16,
          padding: 28,
          width: 360,
          margin: 20,
          boxShadow: s.shadow,
          border: `1px solid ${s.border}`,
        }}
      >
        <div
          id="confirm-baslik"
          style={{ fontSize: 16, fontWeight: 700, color: s.text, marginBottom: 12 }}
        >
          {baslik}
        </div>
        <div style={{ fontSize: 14, color: s.text2, marginBottom: 24, lineHeight: 1.6 }}>
          {mesaj}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onHayir} variant="ghost" style={{ flex: 1 }} ariaLabel="İptal et">
            İptal
          </Btn>
          <Btn onClick={onEvet} variant="danger" style={{ flex: 1 }} ariaLabel="Onayla ve sil">
            Evet, Sil
          </Btn>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  baslik: PropTypes.string.isRequired,
  mesaj: PropTypes.string,
  onEvet: PropTypes.func.isRequired,
  onHayir: PropTypes.func.isRequired,
};
