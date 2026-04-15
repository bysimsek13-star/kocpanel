import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Tema seçici – 6 renk teması.
 * variant="bar"   → üst çubukta küçük daireler
 * variant="giris" → giriş ekranında geniş panel
 * variant="panel" → ayarlar panelinde detaylı gösterim
 */
export default function TemaSecici({ variant = 'bar' }) {
  const { s, temaId, setTema, temaListesi } = useTheme();
  const [acik, setAcik] = useState(false);

  if (variant === 'bar') {
    return (
      <div style={{ position: 'relative' }}>
        {/* Aktif tema renk noktası + aç/kapat */}
        <button
          type="button"
          title="Tema seç"
          onClick={() => setAcik(v => !v)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `2px solid ${s.topBarBorder}`,
            background: temaListesi.find(t => t.id === temaId)?.accent ?? s.primary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        />
        {acik && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setAcik(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            />
            {/* Dropdown */}
            <div
              style={{
                position: 'absolute',
                top: 36,
                right: 0,
                zIndex: 999,
                background: s.surface,
                border: `1px solid ${s.border}`,
                borderRadius: 14,
                padding: 12,
                boxShadow: s.shadowCard,
                minWidth: 192,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: s.textMuted,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Tema
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {temaListesi.map(t => (
                  <TemaItem
                    key={t.id}
                    tema={t}
                    aktif={temaId === t.id}
                    s={s}
                    onSec={() => {
                      setTema(t.id);
                      setAcik(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'giris') {
    return (
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: s.textMuted,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          Tema
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {temaListesi.map(t => (
            <button
              key={t.id}
              type="button"
              title={t.label}
              onClick={() => setTema(t.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: temaId === t.id ? `3px solid ${s.text}` : `2px solid ${s.border}`,
                background: t.accent,
                cursor: 'pointer',
                transition: 'transform 0.15s',
                transform: temaId === t.id ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* variant="panel" */
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: s.textSecondary, marginBottom: 12 }}>
        Renk Teması
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {temaListesi.map(t => (
          <TemaItem key={t.id} tema={t} aktif={temaId === t.id} s={s} onSec={() => setTema(t.id)} />
        ))}
      </div>
    </div>
  );
}

function TemaItem({ tema, aktif, s, onSec }) {
  return (
    <button
      type="button"
      onClick={onSec}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 9,
        border: aktif ? `1.5px solid ${s.primary}` : `1.5px solid transparent`,
        background: aktif ? s.primarySoft : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background 0.15s',
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: tema.accent,
          flexShrink: 0,
          border: aktif ? `2px solid ${s.primary}` : '2px solid transparent',
        }}
      />
      <span
        style={{ fontSize: 13, fontWeight: aktif ? 600 : 400, color: aktif ? s.primary : s.text }}
      >
        {tema.label}
      </span>
      {aktif && <span style={{ marginLeft: 'auto', color: s.primary, fontSize: 16 }}>✓</span>}
    </button>
  );
}
