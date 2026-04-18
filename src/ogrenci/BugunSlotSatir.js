import React from 'react';
import PropTypes from 'prop-types';
import SlotKonularPanel from './SlotKonularPanel';

export default function BugunSlotSatir({
  slot,
  bitti,
  tip,
  konularAcik,
  setKonularAcik,
  setVideoModal,
  onToggle,
  ogrenciId,
  ogrenciTur,
  ogrenciSinif,
  s,
}) {
  return (
    <div
      onClick={() => onToggle(slot._idx)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        padding: '8px 10px',
        marginBottom: 6,
        borderRadius: 10,
        background: bitti ? s.surface2 : tip.acik,
        border: `1px solid ${bitti ? s.border : tip.renk + '30'}`,
        opacity: bitti ? 0.6 : 1,
        transition: 'transform .15s ease, box-shadow .15s ease, opacity .2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = s.shadowHover ?? s.shadow;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: 4,
          minHeight: 36,
          borderRadius: 99,
          flexShrink: 0,
          alignSelf: 'stretch',
          background: bitti ? s.border : tip.renk,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: bitti ? s.text3 : tip.renk,
              background: `${tip.renk}20`,
              padding: '1px 7px',
              borderRadius: 4,
            }}
          >
            {tip.label}
          </span>
          {slot.baslangic && (
            <span style={{ fontSize: 10, color: s.text3 }}>
              {slot.baslangic}
              {slot.bitis ? ` – ${slot.bitis}` : ''}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: bitti ? s.text3 : s.text }}>
          {slot.ders || '—'}
        </div>
        {slot.icerik && (
          <div style={{ fontSize: 11, color: s.text3, marginTop: 1 }}>{slot.icerik}</div>
        )}
        {slot.ders && ogrenciTur && (
          <button
            onClick={e => {
              e.stopPropagation();
              setKonularAcik(prev => (prev === slot._idx ? null : slot._idx));
            }}
            style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: 600,
              color: s.text3,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            📚 Konular {konularAcik === slot._idx ? '▲' : '▼'}
          </button>
        )}
        {konularAcik === slot._idx && (
          <SlotKonularPanel
            ders={slot.ders}
            ogrenciId={ogrenciId}
            ogrenciTur={ogrenciTur}
            ogrenciSinif={ogrenciSinif}
            s={s}
          />
        )}
        {slot.tip === 'video' && slot.videolar?.length > 0 && (
          <div
            onClick={e => {
              e.stopPropagation();
              setVideoModal(slot.videolar);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 4,
              fontSize: 10,
              fontWeight: 700,
              color: s.info ?? s.accent,
              background: `${s.info ?? s.accent}15`,
              padding: '2px 10px',
              borderRadius: 20,
              cursor: 'pointer',
              border: `1px solid ${s.info ?? s.accent}30`,
            }}
          >
            ▶ {slot.videolar.length} video izle
          </div>
        )}
      </div>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          flexShrink: 0,
          border: bitti ? 'none' : `1.5px solid ${tip.renk}60`,
          background: bitti ? tip.renk : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#fff',
          fontWeight: 700,
        }}
      >
        {bitti ? '✓' : ''}
      </div>
    </div>
  );
}

BugunSlotSatir.propTypes = {
  slot: PropTypes.object.isRequired,
  bitti: PropTypes.bool.isRequired,
  tip: PropTypes.object.isRequired,
  konularAcik: PropTypes.number,
  setKonularAcik: PropTypes.func.isRequired,
  setVideoModal: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  ogrenciId: PropTypes.string.isRequired,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  s: PropTypes.object.isRequired,
};
