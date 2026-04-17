import React from 'react';
import PropTypes from 'prop-types';
import {
  hedefDurumu,
  ilerlemeYuzdesi,
  durumStil,
  hedefTurEtiket,
  nettenTYTPuanTahmini,
} from './hedefUtils';

export default function AktifHedefSatiri({ h, onGuncelle, onSil, s }) {
  const yuzde = ilerlemeYuzdesi(h);
  const durum = hedefDurumu(h);
  const d = durumStil(s, durum);
  const kalanGun = h.sonTarih ? Math.ceil((new Date(h.sonTarih) - new Date()) / 86400000) : null;
  const gunRenk =
    kalanGun == null ? s.text3 : kalanGun < 0 ? s.tehlika : kalanGun < 7 ? s.uyari : s.text3;

  return (
    <div
      style={{
        marginBottom: 12,
        padding: 14,
        background: s.surface,
        borderRadius: 12,
        border: `1px solid ${s.border}`,
        borderLeft: `4px solid ${d.renk}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: s.text, marginBottom: 2 }}>
            {h.baslik}
          </div>
          <div style={{ fontSize: 11, color: s.text2 }}>
            {hedefTurEtiket(h)} · {h.baslangicDegeri} → {h.hedefDeger}
            {kalanGun !== null && (
              <span style={{ marginLeft: 8, color: gunRenk }}>
                · {kalanGun < 0 ? `${Math.abs(kalanGun)} gün geçti` : `${kalanGun} gün kaldı`}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
          <button
            onClick={() => onGuncelle(h)}
            type="button"
            style={{
              background: s.accentSoft,
              border: 'none',
              borderRadius: 8,
              padding: '5px 10px',
              color: s.accent,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Güncelle
          </button>
          <button
            onClick={() => onSil(h.id)}
            type="button"
            style={{
              background: s.tehlikaSoft,
              border: 'none',
              borderRadius: 8,
              padding: '5px 8px',
              color: s.tehlika,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Sil
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            flex: 1,
            height: 8,
            background: s.surface3,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${yuzde}%`,
              background: d.renk,
              borderRadius: 4,
              transition: 'width 0.4s',
            }}
          />
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: d.renk,
            minWidth: 36,
            textAlign: 'right',
          }}
        >
          {yuzde}%
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            background: d.bg,
            color: d.renk,
            whiteSpace: 'nowrap',
          }}
        >
          {d.label}
        </span>
      </div>
      {(h.hedefTur || h.tur) === 'puan' && (
        <div style={{ fontSize: 10, color: s.text3, marginTop: 2 }}>Genel deneme puanı hedefi</div>
      )}
      {h.guncelDeger !== undefined && (
        <div style={{ fontSize: 11, color: s.text3, marginTop: 6 }}>
          Güncel:{' '}
          <strong style={{ color: s.text }}>
            {h.guncelDeger} {hedefTurEtiket(h)}
          </strong>
          {(h.hedefTur || h.tur) === 'puan' &&
            h.guncelDeger != null &&
            (() => {
              const tahmini = nettenTYTPuanTahmini(h.guncelDeger);
              return tahmini != null ? (
                <span style={{ marginLeft: 6, color: s.text3 }}>(≈ {tahmini} puan)</span>
              ) : null;
            })()}
        </div>
      )}
    </div>
  );
}

AktifHedefSatiri.propTypes = {
  h: PropTypes.object.isRequired,
  onGuncelle: PropTypes.func.isRequired,
  onSil: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
