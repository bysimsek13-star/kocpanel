import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import {
  ayYilStr,
  ayLabel,
  aylarListesi,
  MIN_AY,
  tlFormat,
  GIDER_KATEGORILERI,
  KATEGORI_RENK,
} from './maliSabitleri';

function StatKart({ baslik, deger, renk, s }) {
  return (
    <div
      style={{
        background: s.surface,
        borderRadius: 12,
        padding: '16px 20px',
        border: `1px solid ${s.border}`,
        borderTop: `3px solid ${renk}`,
        flex: '1 1 160px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: s.text2,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          marginBottom: 6,
        }}
      >
        {baslik}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: s.text }}>{deger}</div>
    </div>
  );
}

export default function MaliDashboard({ ogrenciler, odemeler, giderler }) {
  const { s } = useTheme();
  const [seciliAy, setSeciliAy] = useState(ayYilStr());

  const aylar = aylarListesi(MIN_AY);

  const { beklenen, tahsil, gecikmis, ayGiderler } = useMemo(() => {
    const aktifler = ogrenciler.filter(
      o => o.baslangicAyi && o.baslangicAyi <= seciliAy && Number(o.aylikUcret) > 0
    );

    let beklenenToplam = 0;
    let tahsilEdilen = 0;
    let gecikmisToplam = 0;
    const bugunAy = ayYilStr();

    aktifler.forEach(o => {
      const odenecek = Math.round(Number(o.aylikUcret) * (1 - (Number(o.iskontoOrani) || 0) / 100));
      beklenenToplam += odenecek;
      const odeme = odemeler.find(od => od.ogrenciId === o.id && od.ayYil === seciliAy);
      if (odeme?.odendi) {
        tahsilEdilen += odenecek;
      } else if (seciliAy < bugunAy) {
        gecikmisToplam += odenecek;
      }
    });

    const ayGid = giderler.filter(g => g.ayYil === seciliAy);
    return {
      beklenen: beklenenToplam,
      tahsil: tahsilEdilen,
      gecikmis: gecikmisToplam,
      ayGiderler: ayGid,
    };
  }, [ogrenciler, odemeler, giderler, seciliAy]);

  const toplamGider = ayGiderler.reduce((acc, g) => acc + (Number(g.tutar) || 0), 0);
  const netKar = tahsil - toplamGider;
  const tahsilOran = beklenen > 0 ? Math.round((tahsil / beklenen) * 100) : 0;

  const katToplam = GIDER_KATEGORILERI.map(k => ({
    k,
    toplam: ayGiderler.filter(g => g.kategori === k).reduce((a, g) => a + Number(g.tutar || 0), 0),
  })).filter(x => x.toplam > 0);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <select
          value={seciliAy}
          onChange={e => setSeciliAy(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: `1px solid ${s.border}`,
            background: s.surface,
            color: s.text,
            fontSize: 14,
          }}
        >
          {aylar.map(a => (
            <option key={a} value={a}>
              {ayLabel(a)}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 13, color: s.text2 }}>{ayLabel(seciliAy)} özeti</div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatKart baslik="Beklenen Gelir" deger={tlFormat(beklenen)} renk="#6366f1" s={s} />
        <StatKart
          baslik="Tahsil Edilen"
          deger={`${tlFormat(tahsil)} (%${tahsilOran})`}
          renk="#10b981"
          s={s}
        />
        <StatKart baslik="Gecikmiş" deger={tlFormat(gecikmis)} renk="#ef4444" s={s} />
        <StatKart baslik="Toplam Gider" deger={tlFormat(toplamGider)} renk="#f59e0b" s={s} />
        <StatKart
          baslik="Net Kâr"
          deger={tlFormat(netKar)}
          renk={netKar >= 0 ? '#10b981' : '#ef4444'}
          s={s}
        />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div
          style={{
            flex: '1 1 280px',
            background: s.surface,
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${s.border}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 14 }}>
            Gider Dağılımı
          </div>
          {katToplam.length === 0 ? (
            <div style={{ color: s.text3, fontSize: 13 }}>Bu ay gider yok.</div>
          ) : (
            katToplam.map(({ k, toplam }) => (
              <div
                key={k}
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: KATEGORI_RENK[k] || s.border,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, fontSize: 13, color: s.text }}>{k}</div>
                <div style={{ fontWeight: 600, color: s.text, fontSize: 13 }}>
                  {tlFormat(toplam)}
                </div>
                <div style={{ fontSize: 11, color: s.text3, width: 36, textAlign: 'right' }}>
                  {toplamGider > 0 ? `%${Math.round((toplam / toplamGider) * 100)}` : ''}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            flex: '1 1 280px',
            background: s.surface,
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${s.border}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 14 }}>
            P&L Özeti
          </div>
          {[
            { label: 'Tahsil Edilen Gelir', deger: tahsil, renk: '#10b981' },
            { label: 'Bekleyen Gelir', deger: beklenen - tahsil - gecikmis, renk: '#f59e0b' },
            { label: 'Gecikmiş', deger: gecikmis, renk: '#ef4444' },
            { label: 'Toplam Gider', deger: -toplamGider, renk: '#ef4444' },
          ].map(({ label, deger, renk }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: `1px solid ${s.border}`,
                fontSize: 13,
              }}
            >
              <span style={{ color: s.text2 }}>{label}</span>
              <span style={{ fontWeight: 600, color: deger < 0 ? '#ef4444' : renk }}>
                {tlFormat(Math.abs(deger))}
              </span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              fontSize: 15,
            }}
          >
            <span style={{ fontWeight: 700, color: s.text }}>Net Kâr</span>
            <span style={{ fontWeight: 700, color: netKar >= 0 ? '#10b981' : '#ef4444' }}>
              {tlFormat(netKar)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

MaliDashboard.propTypes = {
  ogrenciler: PropTypes.array.isRequired,
  odemeler: PropTypes.array.isRequired,
  giderler: PropTypes.array.isRequired,
};
