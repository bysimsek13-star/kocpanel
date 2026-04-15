import React from 'react';
import { RISK_DURUM } from '../utils/sabitler';

export { KocRaporu } from './KocRaporu';
// ─── Risk durumu yardımcısı ───────────────────────────────────────────────────
function riskBilgisi(riskDurumu) {
  if (riskDurumu === RISK_DURUM.YUKSEK_RISK)
    return {
      renk: '#F43F5E',
      bg: 'rgba(244,63,94,0.10)',
      etiket: 'Yüksek Risk',
      aciklama: 'Koçunuza başvurun',
    };
  if (riskDurumu === RISK_DURUM.RISK_ALTINDA)
    return {
      renk: '#F59E0B',
      bg: 'rgba(245,158,11,0.10)',
      etiket: 'Dikkat Gereken',
      aciklama: 'Koç takip ediyor',
    };
  return {
    renk: '#10B981',
    bg: 'rgba(16,185,129,0.10)',
    etiket: 'Normal',
    aciklama: 'Her şey yolunda',
  };
}

export function OgrenciDurumKart({ ogrenci, s }) {
  if (!ogrenci) return null;

  const risk = riskBilgisi(ogrenci.riskDurumu);
  const netVar = ogrenci.sonDenemeNet != null;
  const tarih = ogrenci.sonDenemeTarih
    ? typeof ogrenci.sonDenemeTarih?.toDate === 'function'
      ? ogrenci.sonDenemeTarih.toDate().toLocaleDateString('tr-TR')
      : String(ogrenci.sonDenemeTarih)
    : null;

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: s.text, marginBottom: 14 }}>
        Öğrenci Durumu
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {/* Risk kartı */}
        <div
          style={{
            flex: '1 1 120px',
            background: risk.bg,
            borderRadius: 12,
            padding: '14px 16px',
            border: `1px solid ${risk.renk}30`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: risk.renk,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            Risk Durumu
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: risk.renk }}>{risk.etiket}</div>
          <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>{risk.aciklama}</div>
        </div>

        {/* Son deneme neti */}
        {netVar && (
          <div
            style={{
              flex: '1 1 120px',
              background: s.surface2,
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: s.text3,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 4,
              }}
            >
              Son Deneme Neti
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: s.accent,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Number(ogrenci.sonDenemeNet).toFixed(1)}
            </div>
            {tarih && <div style={{ fontSize: 11, color: s.text3, marginTop: 4 }}>{tarih}</div>}
          </div>
        )}

        {/* Toplam çalışma günü */}
        {ogrenci.toplamCalismaGunu != null && (
          <div
            style={{
              flex: '1 1 120px',
              background: s.surface2,
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: s.text3,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 4,
              }}
            >
              Toplam Çalışma
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: s.text,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {ogrenci.toplamCalismaGunu}
            </div>
            <div style={{ fontSize: 11, color: s.text3, marginTop: 4 }}>gün</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalismaOzet({ calisma, s }) {
  const bugun = new Date();
  const gunler = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(bugun);
    d.setDate(bugun.getDate() - (6 - i));
    const tarih = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const kayit = calisma.find(c => c.tarih === tarih || c.id === tarih);
    return {
      tarih,
      saat: kayit?.saat || 0,
      gun: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
    };
  });

  const toplamSaat = gunler.reduce((a, g) => a + g.saat, 0).toFixed(1);
  const calisanGun = gunler.filter(g => g.saat > 0).length;
  const maxSaat = Math.max(...gunler.map(g => g.saat), 1);

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>Çalışma Durumu</div>
        <div style={{ fontSize: 12, color: s.text3 }}>
          Son 7 gün ·{' '}
          <b style={{ color: s.text2 }}>
            {calisanGun} gün, {toplamSaat} saat
          </b>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
        {gunler.map(g => {
          const oran = g.saat / maxSaat;
          const renk =
            g.saat === 0 ? s.border : g.saat >= 6 ? '#10B981' : g.saat >= 3 ? '#5B4FE8' : '#F59E0B';
          return (
            <div
              key={g.tarih}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                title={`${g.saat} saat`}
                style={{
                  width: '100%',
                  borderRadius: 6,
                  height: g.saat === 0 ? 6 : Math.max(6, oran * 44),
                  background: renk,
                  opacity: g.saat === 0 ? 0.3 : 1,
                  transition: 'height .3s',
                }}
              />
              <div style={{ fontSize: 9, color: s.text3, textAlign: 'center' }}>{g.gun}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
        {[
          ['#10B981', '6+ saat'],
          ['#5B4FE8', '3-6 saat'],
          ['#F59E0B', '1-3 saat'],
        ].map(([c, l]) => (
          <div
            key={l}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: s.text3 }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
