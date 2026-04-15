import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/Shared';
import { useKoc } from '../../context/KocContext';
import { RISK_DURUM } from '../../utils/sabitler';

// Milisaniye cinsinden kaç gün önce?
function gunFarki(tarih) {
  if (!tarih) return Infinity;
  const ms =
    typeof tarih?.toDate === 'function' ? tarih.toDate().getTime() : new Date(tarih).getTime();
  if (isNaN(ms)) return Infinity;
  return Math.floor((Date.now() - ms) / 86400000);
}

export default function KocRiskOzeti({ onSec }) {
  const { ogrenciler } = useKoc();
  const { s } = useTheme();
  const [acik, setAcik] = useState(true);

  const yuksekRisk = ogrenciler.filter(o => o.riskDurumu === RISK_DURUM.YUKSEK_RISK);
  const riskAltinda = ogrenciler.filter(o => o.riskDurumu === RISK_DURUM.RISK_ALTINDA);
  const inaktif = ogrenciler.filter(
    o =>
      o.riskDurumu !== RISK_DURUM.YUKSEK_RISK &&
      o.riskDurumu !== RISK_DURUM.RISK_ALTINDA &&
      gunFarki(o.sonCalismaTarihi) >= 7
  );

  const toplamSorunlu = yuksekRisk.length + riskAltinda.length + inaktif.length;
  if (toplamSorunlu === 0) return null;

  const Satir = ({ ogrenci, renk, etiket }) => (
    <div
      onClick={() => onSec && onSec(ogrenci)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background .12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: renk, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, color: s.text, fontWeight: 500 }}>{ogrenci.isim}</div>
      <div
        style={{
          fontSize: 11,
          color: renk,
          fontWeight: 600,
          background: `${renk}18`,
          padding: '2px 8px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
        }}
      >
        {etiket}
      </div>
    </div>
  );

  return (
    <Card style={{ padding: 0, marginBottom: 18, overflow: 'hidden' }}>
      {/* Başlık */}
      <div
        onClick={() => setAcik(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: acik ? `1px solid ${s.border}` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>
            Dikkat Gereken Öğrenciler
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#F43F5E',
              background: 'rgba(244,63,94,0.10)',
              padding: '2px 8px',
              borderRadius: 20,
            }}
          >
            {toplamSorunlu}
          </div>
        </div>
        <div style={{ fontSize: 12, color: s.text3 }}>{acik ? '▲' : '▼'}</div>
      </div>

      {acik && (
        <div style={{ padding: '8px 6px' }}>
          {/* Yüksek risk */}
          {yuksekRisk.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#F43F5E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 10px',
                }}
              >
                Yüksek Risk · {yuksekRisk.length}
              </div>
              {yuksekRisk.map(o => (
                <Satir key={o.id} ogrenci={o} renk="#F43F5E" etiket="Yüksek Risk" />
              ))}
            </div>
          )}

          {/* Risk altında */}
          {riskAltinda.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#F59E0B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 10px',
                }}
              >
                Dikkat · {riskAltinda.length}
              </div>
              {riskAltinda.map(o => (
                <Satir key={o.id} ogrenci={o} renk="#F59E0B" etiket="Risk Altında" />
              ))}
            </div>
          )}

          {/* İnaktif */}
          {inaktif.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: s.text3,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 10px',
                }}
              >
                İnaktif (7+ gün) · {inaktif.length}
              </div>
              {inaktif.map(o => {
                const gun = gunFarki(o.sonCalismaTarihi);
                return (
                  <Satir
                    key={o.id}
                    ogrenci={o}
                    renk={s.text3}
                    etiket={gun === Infinity ? 'Hiç giriş yok' : `${gun} gündür boş`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

KocRiskOzeti.propTypes = {
  onSec: PropTypes.func,
};
