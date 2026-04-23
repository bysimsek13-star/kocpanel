import React from 'react';
import { Btn } from '../components/Shared';

const SEKMELER = [
  { key: 'ozet', label: '🏠 Genel Özet' },
  { key: 'program', label: '📅 Program' },
  { key: 'sorurutin', label: '✏️ Soru & Rutin' },
  { key: 'denemeler', label: '📊 Deneme' },
  { key: 'mesajlar', label: '💬 Mesajlar' },
  { key: 'hedef', label: '🎯 Hedef' },
  { key: 'mufredat', label: '📋 Konu Takibi' },
];

export function OgrenciDetayTabBar({
  ogrenci,
  aktifSekme,
  setAktifSekme,
  onTabChange,
  onGeri,
  readOnly,
  isAdmin,
  mobil,
  s,
}) {
  return (
    <div
      style={{
        background: s.surface,
        borderBottom: `1px solid ${s.border}`,
        padding: mobil ? '0 12px' : '0 28px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        position: 'sticky',
        top: 56,
        zIndex: 90,
        boxShadow: s.shadow,
        overflowX: 'auto',
      }}
    >
      <Btn onClick={onGeri} variant="outline" style={{ padding: '6px 14px', flexShrink: 0 }}>
        ← Geri
      </Btn>
      <div style={{ fontWeight: 700, fontSize: 16, color: s.text, whiteSpace: 'nowrap' }}>
        {ogrenci.isim}
      </div>
      <div
        style={{
          background: s.accentSoft,
          color: s.accent,
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {ogrenci.tur}
      </div>
      {readOnly && (
        <div
          style={{
            background: 'rgba(249,115,22,0.15)',
            color: '#F97316',
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          🔒 OKUMA
        </div>
      )}
      {isAdmin && (
        <div
          style={{
            background: 'rgba(245,158,11,0.15)',
            color: '#F59E0B',
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          👑 ADMİN
        </div>
      )}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginLeft: 8,
          background: s.surface2,
          padding: 3,
          borderRadius: 10,
          flexShrink: 0,
        }}
      >
        {SEKMELER.map(sek => (
          <div
            key={sek.key}
            onClick={() => {
              setAktifSekme(sek.key);
              onTabChange?.(sek.key);
            }}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
              background: aktifSekme === sek.key ? s.surface : 'transparent',
              color: aktifSekme === sek.key ? s.accent : s.text2,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {sek.label}
          </div>
        ))}
      </div>
      {!mobil && (
        <div style={{ marginLeft: 'auto', fontSize: 13, color: s.text2 }}>{ogrenci.email}</div>
      )}
    </div>
  );
}
