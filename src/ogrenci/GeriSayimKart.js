import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ogrenciBaglaminiCoz } from '../utils/ogrenciBaglam';

const YKS_TARIH = new Date('2026-06-20');
const AYT_TARIH = new Date('2026-06-21');
const LGS_TARIH = new Date('2026-06-13');

function kalaniHesapla(hedef) {
  const fark = hedef - Date.now();
  if (fark <= 0) return { gun: 0, saat: 0, dakika: 0, saniye: 0 };
  const gun = Math.floor(fark / 86400000);
  const saat = Math.floor((fark % 86400000) / 3600000);
  const dakika = Math.floor((fark % 3600000) / 60000);
  const saniye = Math.floor((fark % 60000) / 1000);
  return { gun, saat, dakika, saniye };
}

export default function GeriSayimKart({ tur, sinif, s }) {
  const baglam = ogrenciBaglaminiCoz({ tur, sinif });
  const lgs = baglam.lgsOgrencisi;
  const anaHedef = lgs ? LGS_TARIH : YKS_TARIH;
  // Hooks koşulsuz çağrılmalı — erken return hook'lardan sonra
  const [kalan, setKalan] = useState(() => kalaniHesapla(anaHedef));

  useEffect(() => {
    const id = setInterval(() => setKalan(kalaniHesapla(anaHedef)), 1000);
    return () => clearInterval(id);
  }, [anaHedef]);

  if (baglam.gerisayimHedef === null) return null; // gelisim modu — geri sayım yok

  const acil = kalan.gun <= 30;
  const yakin = kalan.gun <= 90;
  const renk = acil ? '#F43F5E' : yakin ? '#F59E0B' : s.accent;

  const Kutu = ({ deger, etiket }) => (
    <div style={{ textAlign: 'center', minWidth: 52 }}>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          color: renk,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {String(deger).padStart(2, '0')}
      </div>
      <div
        style={{
          fontSize: 10,
          color: s.text3,
          fontWeight: 600,
          marginTop: 3,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {etiket}
      </div>
    </div>
  );

  const Ayrac = () => (
    <div
      style={{
        fontSize: 28,
        fontWeight: 900,
        color: renk,
        lineHeight: 1,
        marginBottom: 14,
        opacity: 0.5,
      }}
    >
      :
    </div>
  );

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        padding: '16px 18px',
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: s.text3,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {lgs
            ? 'LGS · 13 Haz 2026'
            : baglam.sinavModu === 'gecis'
              ? 'TYT · 20 Haz 2026 (hazırlık)'
              : 'TYT · 20 Haz 2026'}
        </div>
        {acil && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#F43F5E',
              background: 'rgba(244,63,94,0.12)',
              padding: '2px 8px',
              borderRadius: 20,
            }}
          >
            Son sprint!
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Kutu deger={kalan.gun} etiket="gün" />
        <Ayrac />
        <Kutu deger={kalan.saat} etiket="saat" />
        <Ayrac />
        <Kutu deger={kalan.dakika} etiket="dakika" />
        <Ayrac />
        <Kutu deger={kalan.saniye} etiket="saniye" />
      </div>
      {!lgs && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${s.border}`,
            fontSize: 12,
            color: s.text3,
            textAlign: 'center',
          }}
        >
          AYT · 21 Haz 2026 · <b style={{ color: s.text2 }}>{kalaniHesapla(AYT_TARIH).gun} gün</b>
        </div>
      )}
    </div>
  );
}

GeriSayimKart.propTypes = {
  tur: PropTypes.string,
  sinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  s: PropTypes.object.isRequired,
};
