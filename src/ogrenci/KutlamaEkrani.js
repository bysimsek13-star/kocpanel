import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';

// tema: 'hedef' | 'dogumgunu' | 'karne' | 'yilbasi'
export default function KutlamaEkrani({ tema = 'hedef', mesaj, onKapat }) {
  const { s } = useTheme();
  const [goster, setGoster] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGoster(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!goster && onKapat) onKapat();
  }, [goster, onKapat]);

  if (!goster) return null;

  const temaAyar = {
    hedef: { emoji: '🏆', baslik: 'Hedefe ulaştın!', renk: s.accent, arka: s.accentSoft },
    dogumgunu: { emoji: '🎂', baslik: 'İyi ki doğdun! 🎉', renk: '#e85d9a', arka: '#fce4f3' },
    karne: { emoji: '📋', baslik: 'Karne günün kutlu!', renk: s.chartPos, arka: s.okSoft },
    yilbasi: { emoji: '🎆', baslik: 'Yeni yıl kutlu olsun!', renk: s.bilgi, arka: s.bilgiSoft },
  }[tema] || { emoji: '🎉', baslik: 'Tebrikler!', renk: s.accent, arka: s.accentSoft };

  return (
    <div
      onClick={onKapat}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: temaAyar.arka || s.surface,
          border: `2px solid ${temaAyar.renk || s.accent}`,
          borderRadius: 24,
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: 380,
          width: '90vw',
          boxShadow: s.shadow,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 64, marginBottom: 12 }}>{temaAyar.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: temaAyar.renk, marginBottom: 8 }}>
          {temaAyar.baslik}
        </div>
        {mesaj && (
          <div style={{ fontSize: 14, color: s.text2, marginBottom: 20, lineHeight: 1.6 }}>
            {mesaj}
          </div>
        )}
        <button
          onClick={onKapat}
          style={{
            background: temaAyar.renk,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 28px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Teşekkürler 🙌
        </button>
      </div>
    </div>
  );
}

KutlamaEkrani.propTypes = {
  tema: PropTypes.string,
  mesaj: PropTypes.string,
  onKapat: PropTypes.func.isRequired,
};
