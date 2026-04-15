import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';

/**
 * Mor + buz mavisi gradyan çerçevede ElsWay wordmark.
 * @param {'bar'|'card'|'hero'|'drawer'} size
 * @param {'onDark'|'onLight'} variant — çerçeve içi dolgu ve yazı rengi
 */
export default function ElsWayLogo({ size = 'bar', variant = 'onDark', style = {} }) {
  const { s } = useTheme();
  const mobil = useMobil();

  const fs =
    size === 'hero'
      ? mobil
        ? 34
        : 40
      : size === 'card'
        ? mobil
          ? 26
          : 28
        : size === 'drawer'
          ? 22
          : mobil
            ? 20
            : 24;

  const pad =
    size === 'hero'
      ? '12px 24px'
      : size === 'card'
        ? '8px 18px'
        : size === 'drawer'
          ? '5px 12px'
          : '6px 14px';

  const innerBg = variant === 'onDark' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.92)';
  /** Koyu çubuk: Els = mor tonu, Way = lila (açık kart: brandEls / brandWayOnLight) */
  const elsColor = variant === 'onDark' ? s.logoEls : s.brandEls;
  const wayColor = variant === 'onDark' ? s.logoWay : s.brandWayOnLight;

  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 3,
        borderRadius: 16,
        background: s.logoFrameGradient,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        ...style,
      }}
    >
      <div
        style={{
          borderRadius: 13,
          background: innerBg,
          padding: pad,
          lineHeight: 1,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: fs, letterSpacing: -0.5, color: elsColor }}>
          Els
        </span>
        <span style={{ fontWeight: 800, fontSize: fs, letterSpacing: -0.5, color: wayColor }}>
          Way
        </span>
      </div>
    </div>
  );
}
