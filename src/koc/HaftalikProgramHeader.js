import React from 'react';
import { TIPLER_NEON } from './ProgramBilesenleri';

export function HaftalikProgramHeader({
  compact,
  readOnly,
  ogrenciler,
  secilenOgrenci,
  setSecilenOgrenci,
  haftaOffset,
  setHaftaOffset,
  haftaKey,
  kaydetiliyor,
  duzenleme,
  setDuzenleme,
  setKopyalaModal,
  setKopyalaHedef,
  slotKopya,
  setSlotKopya,
  programModuEtiket,
  programModuRenk,
  onGeri,
  s,
  toast: _toast,
}) {
  if (compact) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: s.text3 }}>{haftaKey}</div>
          <div style={{ flex: 1 }} />
          {kaydetiliyor && <div style={{ fontSize: 11, color: s.text3 }}>Kaydediliyor...</div>}
          <button
            onClick={() => setDuzenleme(d => !d)}
            style={{
              background: duzenleme ? s.accentSoft : s.surface2,
              border: `1px solid ${duzenleme ? s.accent : s.border}`,
              borderRadius: 8,
              padding: '5px 12px',
              cursor: 'pointer',
              color: duzenleme ? s.accent : s.text2,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {duzenleme ? '✏️ Düzenleniyor' : '✏️ Düzenle'}
          </button>
        </div>
        <TipLejant s={s} />
      </>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {onGeri && (
          <button
            onClick={onGeri}
            style={{
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              color: s.text2,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ←
          </button>
        )}
        {ogrenciler.length > 1 && (
          <select
            value={secilenOgrenci?.id || ''}
            onChange={e => setSecilenOgrenci(ogrenciler.find(o => o.id === e.target.value))}
            style={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '8px 14px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
            }}
          >
            {ogrenciler.map(o => (
              <option key={o.id} value={o.id}>
                {o.isim}
              </option>
            ))}
          </select>
        )}
        {secilenOgrenci && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: programModuRenk,
              background: `${programModuRenk}18`,
              border: `1px solid ${programModuRenk}40`,
              borderRadius: 20,
              padding: '4px 12px',
            }}
          >
            {programModuEtiket}
          </div>
        )}
        {!readOnly ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button
              onClick={() => setHaftaOffset(h => h - 1)}
              style={{
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: 'pointer',
                color: s.text2,
                fontSize: 16,
              }}
            >
              ‹
            </button>
            <div style={{ textAlign: 'center', minWidth: 110 }}>
              <div style={{ fontSize: 12, color: s.text2, fontWeight: 600 }}>
                {haftaOffset === 0
                  ? 'Bu hafta'
                  : haftaOffset === 1
                    ? 'Gelecek hafta'
                    : haftaOffset === -1
                      ? 'Geçen hafta'
                      : `${haftaOffset > 0 ? '+' : ''}${haftaOffset} hafta`}
              </div>
              <div style={{ fontSize: 10, color: s.text3 }}>{haftaKey}</div>
            </div>
            <button
              onClick={() => setHaftaOffset(h => h + 1)}
              style={{
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: 'pointer',
                color: s.text2,
                fontSize: 16,
              }}
            >
              ›
            </button>
          </div>
        ) : (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: s.text2, fontWeight: 600 }}>Bu hafta</div>
            <div style={{ fontSize: 10, color: s.text3 }}>{haftaKey}</div>
          </div>
        )}
        {!readOnly && (
          <button
            onClick={() => setDuzenleme(d => !d)}
            style={{
              background: duzenleme ? s.accentSoft : s.surface2,
              border: `1px solid ${duzenleme ? s.accent : s.border}`,
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              color: duzenleme ? s.accent : s.text2,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {duzenleme ? '✏️ Düzenleniyor' : '✏️ Düzenle'}
          </button>
        )}
        {!readOnly && (
          <button
            onClick={() => {
              setKopyalaHedef(haftaOffset + 1);
              setKopyalaModal(true);
            }}
            style={{
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              color: s.text2,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            📋 Kopyala
          </button>
        )}
        {kaydetiliyor && <div style={{ fontSize: 11, color: s.text3 }}>Kaydediliyor...</div>}
      </div>
      <TipLejant s={s} />
      {slotKopya && duzenleme && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
            padding: '8px 14px',
            borderRadius: 12,
            background: `${s.accent}12`,
            border: `1.5px solid ${s.accent}40`,
          }}
        >
          <span style={{ fontSize: 14 }}>📋</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: s.accent, flex: 1 }}>
            <b>{slotKopya.ders || slotKopya.icerik || 'Slot'}</b> kopyalandı — yapıştırmak için boş
            bir kutuya tıkla
          </span>
          <button
            onClick={() => setSlotKopya(null)}
            style={{
              background: 'none',
              border: 'none',
              color: s.text3,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

function TipLejant({ s }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {TIPLER_NEON.slice(0, -1).map(tip => (
        <div
          key={tip.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            color: s.text2,
            background: tip.acikRenk,
            padding: '4px 10px',
            borderRadius: 20,
            border: `1px solid ${tip.renk}30`,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: tip.renk }} />
          {tip.label}
        </div>
      ))}
    </div>
  );
}
