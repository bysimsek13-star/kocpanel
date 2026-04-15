import React from 'react';
import { GUN_ETIKET } from '../utils/programAlgoritma';
import { tipBulNeon } from './programBilesenUtils';

// ─── Slot kutusu ─────────────────────────────────────────────────────────────
export function SlotKutu({
  slot,
  index: _index,
  duzenleme,
  onClick,
  tamamlandi,
  onToggle,
  onVideoAc,
  onKopyala,
  onYapistir: _onYapistir,
  onHizliSil,
  slotKopya,
  s,
}) {
  const dolu = !!slot.tip;
  const tip = dolu ? tipBulNeon(slot.tip) : null;

  if (!dolu) {
    return (
      <div
        onClick={duzenleme ? onClick : undefined}
        style={{
          borderRadius: 14,
          padding: '12px 14px',
          minHeight: 70,
          border: `1.5px dashed ${duzenleme ? (slotKopya ? s.accent : s.border) : 'transparent'}`,
          background: duzenleme ? (slotKopya ? `${s.accent}08` : s.surface2) : 'transparent',
          cursor: duzenleme ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: duzenleme ? 1 : 0,
          transition: 'all .15s',
        }}
      >
        {duzenleme && slotKopya ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 16 }}>📋</div>
            <div style={{ fontSize: 9, color: s.accent, fontWeight: 700 }}>Yapıştır</div>
          </div>
        ) : duzenleme ? (
          <div style={{ fontSize: 20, color: s.text3 }}>+</div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        border: `1.5px solid ${tip.renk}30`,
        background: tamamlandi ? s.surface2 : tip.acikRenk,
        opacity: tamamlandi ? 0.6 : 1,
        transition: 'all .2s',
        cursor: duzenleme ? 'pointer' : onToggle ? 'pointer' : 'default',
      }}
      onClick={duzenleme ? onClick : undefined}
    >
      <div style={{ height: 4, background: tamamlandi ? s.success : tip.renk }} />

      <div style={{ padding: '10px 12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: tamamlandi ? s.success : tip.renk }}>
            {slot.baslangic && slot.bitis
              ? `${slot.baslangic} – ${slot.bitis}`
              : slot.baslangic || tip.label}
          </div>
          {!duzenleme && onToggle && (
            <div
              onClick={e => {
                e.stopPropagation();
                onToggle();
              }}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                flexShrink: 0,
                border: tamamlandi ? 'none' : `2px solid ${tip.renk}60`,
                background: tamamlandi ? s.success : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              {tamamlandi && <span style={{ color: s.buttonText ?? '#fff', fontSize: 12 }}>✓</span>}
            </div>
          )}
        </div>

        {slot.ders && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: tamamlandi ? s.text3 : s.text,
              marginBottom: 2,
            }}
          >
            {slot.ders}
          </div>
        )}
        {slot.icerik && (
          <div
            style={{
              fontSize: 11,
              color: s.text2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {slot.icerik}
          </div>
        )}

        <div
          style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}
        >
          <div
            style={{
              display: 'inline-block',
              fontSize: 10,
              fontWeight: 600,
              color: tamamlandi ? s.text3 : tip.renk,
              background: tamamlandi ? s.surface3 : `${tip.renk}20`,
              padding: '2px 8px',
              borderRadius: 20,
            }}
          >
            {tip.label}
          </div>
          {slot.tip === 'video' && slot.videolar?.length > 0 && onVideoAc && !duzenleme && (
            <div
              onClick={e => {
                e.stopPropagation();
                onVideoAc(slot.videolar);
              }}
              style={{
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
          {slot.tip === 'video' && slot.videolar?.length > 0 && (duzenleme || !onVideoAc) && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: s.info ?? s.accent,
                background: `${s.info ?? s.accent}15`,
                padding: '2px 8px',
                borderRadius: 20,
              }}
            >
              {slot.videolar.length} video
            </div>
          )}
          {duzenleme && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {onKopyala && (
                <div
                  onClick={e => {
                    e.stopPropagation();
                    onKopyala();
                  }}
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: s.accent,
                    background: `${s.accent}15`,
                    padding: '2px 8px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    border: `1px solid ${s.accent}30`,
                  }}
                >
                  📋
                </div>
              )}
              {onHizliSil && (
                <div
                  onClick={e => {
                    e.stopPropagation();
                    onHizliSil();
                  }}
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: s.danger,
                    background: `${s.danger}15`,
                    padding: '2px 8px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    border: `1px solid ${s.danger}30`,
                  }}
                >
                  ✕
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Gün kolonu ──────────────────────────────────────────────────────────────
export function GunKolonu({
  gunAdi,
  slotlar,
  duzenleme,
  tamamlandiMap,
  onSlotClick,
  onToggle,
  onVideoAc,
  onKopyala,
  onYapistir,
  onHizliSil,
  slotKopya,
  bugunMu,
  s,
  mobil,
}) {
  const doluSayi = slotlar.filter(sl => sl.tip).length;
  const tamSayi = slotlar.filter((sl, i) => sl.tip && tamamlandiMap?.[i]).length;

  return (
    <div style={{ flex: 1, minWidth: mobil ? 160 : 0 }}>
      <div
        style={{
          textAlign: 'center',
          padding: '10px 6px 12px',
          borderBottom: `2px solid ${bugunMu ? s.primary : s.border}`,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: bugunMu ? s.primary : s.text2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {GUN_ETIKET[gunAdi]}
        </div>
        {doluSayi > 0 && (
          <div style={{ fontSize: 10, color: s.text3, marginTop: 3 }}>
            {duzenleme ? `${doluSayi} etüt` : `${tamSayi}/${doluSayi}`}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px' }}>
        {slotlar.map((slot, i) => (
          <SlotKutu
            key={i}
            slot={slot}
            index={i}
            duzenleme={duzenleme}
            onClick={() => {
              if (duzenleme && !slot.tip && slotKopya) {
                onYapistir(gunAdi, i);
              } else {
                onSlotClick(gunAdi, i);
              }
            }}
            tamamlandi={!!tamamlandiMap?.[i]}
            onToggle={!duzenleme && slot.tip ? () => onToggle(gunAdi, i) : undefined}
            onVideoAc={onVideoAc}
            onKopyala={duzenleme && slot.tip ? () => onKopyala(slot) : undefined}
            onHizliSil={duzenleme && slot.tip ? () => onHizliSil(gunAdi, i) : undefined}
            onYapistir={
              duzenleme && !slot.tip && slotKopya ? () => onYapistir(gunAdi, i) : undefined
            }
            slotKopya={slotKopya}
            s={s}
          />
        ))}
      </div>
    </div>
  );
}
