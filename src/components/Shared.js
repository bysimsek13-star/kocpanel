/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { getS } from '../theme';

export function Card({ tema, children, style = {} }) {
  const s = getS(tema);
  return <div style={{ background: s.surface, border: `1px solid ${s.border}`, borderRadius: '16px', overflow: 'hidden', boxShadow: s.shadow, ...style }}>{children}</div>;
}

export function StatCard({ tema, label, value, sub, renk, icon }) {
  const s = getS(tema);
  return (
    <Card tema={tema} style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `${renk}10`, borderRadius: '0 16px 0 80px' }} />
      <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '11px', color: s.text2, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: '700', color: renk, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', color: s.text3, marginTop: '6px' }}>{sub}</div>
    </Card>
  );
}

export function Btn({ tema, children, onClick, disabled, variant = 'primary', style = {} }) {
  const s = getS(tema);
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const base = {
    padding: '11px 20px', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px', fontWeight: '600', border: 'none', transition: 'all 0.15s',
    transform: active && !disabled ? 'scale(0.97)' : 'scale(1)', outline: 'none', ...style
  };
  const hoverShadow = hover && !disabled ? { boxShadow: `0 0 0 3px ${s.accent}40` } : {};
  const events = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => { setHover(false); setActive(false); },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
  };
  if (variant === 'primary') return <button {...events} onClick={onClick} disabled={disabled} style={{ ...base, ...hoverShadow, background: disabled ? s.surface3 : s.accentGrad, color: disabled ? s.text3 : 'white', opacity: disabled ? 0.6 : hover ? 0.9 : 1 }}>{children}</button>;
  if (variant === 'outline') return <button {...events} onClick={onClick} disabled={disabled} style={{ ...base, background: hover ? s.accentSoft : 'transparent', color: s.accent, border: `2px solid ${hover ? s.accent : s.border}` }}>{children}</button>;
  if (variant === 'danger') return <button {...events} onClick={onClick} disabled={disabled} style={{ ...base, background: 'rgba(244,63,94,0.1)', color: '#F43F5E', border: hover ? '1px solid #F43F5E' : '1px solid rgba(244,63,94,0.2)' }}>{children}</button>;
  return <button {...events} onClick={onClick} disabled={disabled} style={{ ...base, background: s.surface2, color: s.text2, border: `1px solid ${hover ? s.accent : s.border}` }}>{children}</button>;
}

export function Input({ tema, value, onChange, placeholder, type = 'text' }) {
  const s = getS(tema);
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', background: s.surface2, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '12px 14px', color: s.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' }}
      onFocus={e => e.target.style.borderColor = s.accent}
      onBlur={e => e.target.style.borderColor = s.border}
    />
  );
}
