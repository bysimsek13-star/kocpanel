import React, { useState } from 'react';
import { DURUM } from './mufredatUtils';

const DERINLIK_RENK = ['#5B4FE8', '#0891B2', '#059669'];

function altAgactaEslesen(dugum, filtre, konuDurumlar) {
  if (!dugum._cocuklar?.length) return konuDurumlar[dugum.id]?.durum === filtre;
  return dugum._cocuklar.some(c => altAgactaEslesen(c, filtre, konuDurumlar));
}

export function NodSatiri({ dugum, konuDurumlar, derinlik, kocModu, onToggle, filtre, s }) {
  const [acik, setAcik] = useState(true);
  const yaprak = !dugum._cocuklar?.length;

  if (yaprak) {
    const durum = konuDurumlar[dugum.id]?.durum || null;
    if (!kocModu && filtre && filtre !== 'hepsi' && durum !== filtre) return null;
    const risk = konuDurumlar[dugum.id]?.riskSeviyesi || null;
    const kaynakDeneme = konuDurumlar[dugum.id]?.kaynak === 'deneme';
    const satir = kocModu ? (
      <KocSatiri
        konu={dugum.ad}
        durum={durum}
        kritik={dugum.kritik}
        riskSeviyesi={risk}
        kaynakDeneme={kaynakDeneme}
        sonDenemeTarihi={konuDurumlar[dugum.id]?.sonDenemeTarihi || null}
        onToggle={hedef => onToggle?.(dugum.id, hedef)}
        s={s}
      />
    ) : (
      <OgrenciSatiri
        konu={dugum.ad}
        durum={durum}
        kritik={dugum.kritik}
        riskSeviyesi={risk}
        s={s}
      />
    );
    return derinlik > 0 ? <div style={{ paddingLeft: derinlik * 10 }}>{satir}</div> : satir;
  }

  if (!kocModu && filtre && filtre !== 'hepsi' && !altAgactaEslesen(dugum, filtre, konuDurumlar))
    return null;

  const renk = DERINLIK_RENK[Math.min(derinlik, 2)];
  return (
    <div style={{ marginTop: derinlik === 0 ? 0 : 6 }}>
      <div
        onClick={() => setAcik(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 8px',
          marginLeft: derinlik * 10,
          borderLeft: `2px solid ${renk}50`,
          paddingLeft: 10,
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: 4,
        }}
      >
        <span
          style={{ flex: 1, fontSize: derinlik === 0 ? 12 : 11, fontWeight: 700, color: s.text2 }}
        >
          {dugum.ad}
        </span>
        <span
          style={{
            fontSize: 9,
            color: s.text3,
            transform: acik ? 'none' : 'rotate(-90deg)',
            transition: 'transform .15s',
          }}
        >
          ▼
        </span>
      </div>
      {acik &&
        dugum._cocuklar.map(c => (
          <NodSatiri
            key={c.id}
            dugum={c}
            konuDurumlar={konuDurumlar}
            derinlik={derinlik + 1}
            kocModu={kocModu}
            onToggle={onToggle}
            filtre={filtre}
            s={s}
          />
        ))}
    </div>
  );
}

export function KocSatiri({
  konu,
  durum,
  kritik,
  riskSeviyesi,
  kaynakDeneme,
  sonDenemeTarihi,
  onToggle,
  s,
}) {
  const tam = durum === 'tamamlandi';
  const eksik = durum === 'eksik';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 10,
        background: tam ? 'rgba(16,185,129,0.08)' : eksik ? 'rgba(245,158,11,0.08)' : s.surface2,
        border: `1px solid ${tam ? '#10B98140' : eksik ? '#F59E0B40' : s.border}`,
      }}
    >
      {kritik && <span style={{ fontSize: 11 }}>🔥</span>}
      <span
        style={{ flex: 1, fontSize: 13, color: s.text, fontWeight: tam ? 500 : eksik ? 600 : 400 }}
      >
        {konu}
      </span>
      {kaynakDeneme && (
        <span
          style={{
            fontSize: 10,
            color: s.text3,
            background: s.surface3 || s.border,
            borderRadius: 6,
            padding: '2px 6px',
          }}
          title={sonDenemeTarihi ? `Deneme: ${sonDenemeTarihi}` : 'Denemeden otomatik işaretlendi'}
        >
          {sonDenemeTarihi ? `deneme ${sonDenemeTarihi}` : 'deneme'}
        </span>
      )}
      {riskSeviyesi === 'yuksek' && !tam && (
        <span style={{ fontSize: 10, color: '#F43F5E', fontWeight: 700 }}>⚡ Yüksek risk</span>
      )}
      <button
        onClick={() => onToggle('tamamlandi')}
        style={{
          padding: '4px 10px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          border: `1.5px solid ${tam ? '#10B981' : s.border}`,
          background: tam ? '#10B981' : 'transparent',
          color: tam ? '#fff' : s.text3,
        }}
      >
        ✓ Tamamlandı
      </button>
      <button
        onClick={() => onToggle('eksik')}
        style={{
          padding: '4px 10px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          border: `1.5px solid ${eksik ? '#F59E0B' : s.border}`,
          background: eksik ? '#F59E0B' : 'transparent',
          color: eksik ? '#fff' : s.text3,
        }}
      >
        ⚠ Eksik
      </button>
    </div>
  );
}

const RISK_CFG = {
  orta: { ikon: '⚠', renk: '#F59E0B', label: 'Orta risk' },
  yuksek: { ikon: '⚡', renk: '#F43F5E', label: 'Yüksek risk' },
  kritik: { ikon: '🚨', renk: '#DC2626', label: 'Kritik' },
};

export function OgrenciSatiri({ konu, durum, kritik, riskSeviyesi, s }) {
  const riskCfg = riskSeviyesi && riskSeviyesi !== 'dusuk' ? RISK_CFG[riskSeviyesi] : null;

  if (!durum) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 10,
          background: riskCfg ? `${riskCfg.renk}12` : s.surface2,
          border: `1px solid ${riskCfg ? riskCfg.renk + '40' : s.border}`,
        }}
      >
        {kritik && <span style={{ fontSize: 11 }}>🔥</span>}
        <span style={{ flex: 1, fontSize: 13, color: s.text2 }}>{konu}</span>
        {riskCfg && (
          <span style={{ fontSize: 10, color: riskCfg.renk, fontWeight: 700 }}>
            {riskCfg.ikon} {riskCfg.label}
          </span>
        )}
      </div>
    );
  }
  const cfg = DURUM[durum];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 10,
        background: cfg.bg,
        border: `1px solid ${cfg.renk}50`,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: cfg.renk,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{cfg.ikon}</span>
      </div>
      {kritik && <span style={{ fontSize: 11 }}>🔥</span>}
      <span style={{ flex: 1, fontSize: 13, color: s.text, fontWeight: 600 }}>{konu}</span>
      {riskCfg && durum !== 'tamamlandi' && (
        <span style={{ fontSize: 10, color: riskCfg.renk, fontWeight: 700 }}>{riskCfg.ikon}</span>
      )}
      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.renk }}>{cfg.label}</span>
    </div>
  );
}

export function Chip({ renk, children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: renk,
        background: `${renk}18`,
        border: `1px solid ${renk}40`,
        borderRadius: 20,
        padding: '4px 12px',
      }}
    >
      {children}
    </div>
  );
}
