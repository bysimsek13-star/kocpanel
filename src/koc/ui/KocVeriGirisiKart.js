import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useMobil } from '../../hooks/useMediaQuery';
import { Card, Btn } from '../../components/Shared';
import { useKoc } from '../../context/KocContext';

export default function KocVeriGirisiKart({ onNav }) {
  const { ogrenciler, bugunMap } = useKoc();
  const { s } = useTheme();
  const mobil = useMobil();
  const n = ogrenciler.length;
  if (n === 0) return null;

  const bugunRutin = ogrenciler.filter(o => bugunMap[o.id]?.rutin).length;
  const bugunSoru = ogrenciler.filter(o => bugunMap[o.id]?.gunlukSoru).length;
  const bugunEksik = ogrenciler.filter(
    o => !bugunMap[o.id]?.rutin && !bugunMap[o.id]?.gunlukSoru
  ).length;
  const katilim = Math.round(((n - bugunEksik) / n) * 100);

  const bugunAktifler = ogrenciler.filter(o => bugunMap[o.id]?.bugunAktif);
  const ortSure = (() => {
    if (!bugunAktifler.length) return null;
    const toplam = bugunAktifler.reduce((t, o) => t + (o.gunlukDakika || 0), 0);
    const ort = Math.round(toplam / bugunAktifler.length);
    if (ort < 1) return null;
    return ort >= 60 ? `${Math.floor(ort / 60)}s ${ort % 60}dk` : `${ort} dk`;
  })();

  return (
    <Card style={{ padding: mobil ? 14 : 18, marginBottom: 18 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>Bugünün veri girişi</div>
          <div style={{ fontSize: 11, color: s.text3, marginTop: 4, lineHeight: 1.45 }}>
            Tıklayarak giriş yapmayan öğrencileri gör.
          </div>
        </div>
        <Btn
          variant="outline"
          onClick={() => onNav('gunluktakip')}
          style={{ fontSize: 12, padding: '8px 12px' }}
        >
          Günlük takibe git →
        </Btn>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobil ? '1fr 1fr' : 'repeat(5,1fr)',
          gap: 10,
        }}
      >
        {[
          { v: `${bugunRutin}/${n}`, l: 'Rutin girdi', c: s.ok, d: 'Uyku / su / egzersiz' },
          { v: `${bugunSoru}/${n}`, l: 'Günlük soru', c: s.accent, d: 'Ders bazlı soru' },
          {
            v: `${bugunEksik}`,
            l: 'Henüz veri yok',
            c: bugunEksik > 0 ? s.uyari : s.text3,
            d: 'İkisi de boş',
            onClick: bugunEksik > 0 ? () => onNav('gunluktakip') : undefined,
          },
          {
            v: `${katilim}%`,
            l: 'Gün içi katılım',
            c: n - bugunEksik >= n * 0.7 ? s.ok : s.uyari,
            d: 'En az bir giriş',
          },
          {
            v: ortSure ?? '—',
            l: 'Ort. süre',
            c: ortSure ? (s.bilgi ?? s.accent) : s.text3,
            d: `${bugunAktifler.length} aktif öğrenci`,
          },
        ].map(item => (
          <div
            key={item.l}
            onClick={item.onClick}
            style={{
              background: s.surface2,
              borderRadius: 12,
              padding: '12px 14px',
              border: `1px solid ${s.border}`,
              cursor: item.onClick ? 'pointer' : 'default',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: item.c }}>{item.v}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.text, marginTop: 4 }}>
              {item.l}
            </div>
            <div style={{ fontSize: 10, color: s.text3, marginTop: 2 }}>{item.d}</div>
          </div>
        ))}
      </div>

      {bugunEksik > 0 && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: s.uyari,
            background: s.uyariSoft,
            borderRadius: 10,
            padding: '10px 12px',
            lineHeight: 1.5,
            border: `1px solid ${s.border}`,
          }}
        >
          <strong>{bugunEksik}</strong> öğrencide bugün henüz giriş yok.{' '}
          <button
            type="button"
            onClick={() => onNav('gunluktakip')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: s.accent,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Günlük Takip
          </button>
          {"'ten kontrol edebilirsin."}
        </div>
      )}
    </Card>
  );
}

KocVeriGirisiKart.propTypes = {
  onNav: PropTypes.func.isRequired,
};
