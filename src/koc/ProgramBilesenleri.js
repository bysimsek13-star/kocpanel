import React, { useState } from 'react';
import { GUN_ETIKET } from '../utils/programAlgoritma';
import { TIPLER_NEON } from './programBilesenUtils';
import { VideoSecici } from './VideoSecici';

export { TIPLER_NEON } from './programBilesenUtils';
export { tipBulNeon } from './programBilesenUtils';
export { SlotKutu, GunKolonu } from './ProgramSlot';
export { VideoSecici } from './VideoSecici';

// ─── Slot düzenleme modalı ────────────────────────────────────────────────────
export function SlotModal({
  slot,
  gunAdi,
  slotIndex,
  onKaydet,
  onSil,
  onKapat,
  onHaftayaTasi,
  kocUid,
  s,
}) {
  const [form, setForm] = useState({
    tip: slot.tip || null,
    baslangic: slot.baslangic || '',
    bitis: slot.bitis || '',
    icerik: slot.icerik || '',
    ders: slot.ders || '',
    videolar: slot.videolar || [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onKapat}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          borderRadius: 24,
          padding: 24,
          width: '100%',
          maxWidth: form.tip === 'video' ? 480 : 400,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: s.shadowCard ?? s.shadow,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 20 }}>
          {GUN_ETIKET[gunAdi]} — {slotIndex + 1}. Etüt
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: s.text3,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Aktivite Türü
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {TIPLER_NEON.map(tip => (
              <div
                key={tip.id}
                onClick={() =>
                  setForm(f => ({
                    ...f,
                    tip: tip.id,
                    videolar: tip.id === 'video' ? f.videolar : [],
                  }))
                }
                style={{
                  padding: '8px 6px',
                  borderRadius: 12,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `2px solid ${form.tip === tip.id ? tip.renk : s.border}`,
                  background: form.tip === tip.id ? tip.acikRenk : s.surface2,
                  transition: 'all .15s',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: form.tip === tip.id ? tip.renk : s.text2,
                  }}
                >
                  {tip.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: s.text3, marginBottom: 5 }}>Başlangıç</div>
            <input
              type="time"
              value={form.baslangic}
              onChange={e => set('baslangic', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: s.inputBg ?? s.surface,
                border: `1px solid ${s.inputBorder ?? s.border}`,
                borderRadius: 10,
                padding: '9px 12px',
                color: s.text,
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: s.text3, marginBottom: 5 }}>Bitiş</div>
            <input
              type="time"
              value={form.bitis}
              onChange={e => set('bitis', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: s.inputBg ?? s.surface,
                border: `1px solid ${s.inputBorder ?? s.border}`,
                borderRadius: 10,
                padding: '9px 12px',
                color: s.text,
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: s.text3, marginBottom: 5 }}>Ders</div>
          <input
            value={form.ders}
            onChange={e => set('ders', e.target.value)}
            placeholder="ör: Matematik, Fizik..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '9px 12px',
              color: s.text,
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: form.tip === 'video' ? 14 : 20 }}>
          <div style={{ fontSize: 11, color: s.text3, marginBottom: 5 }}>Konu / İçerik</div>
          <input
            value={form.icerik}
            onChange={e => set('icerik', e.target.value)}
            placeholder="ör: Türev, Limit..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '9px 12px',
              color: s.text,
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {form.tip === 'video' && (
          <VideoSecici
            kocUid={kocUid}
            seciliVideolar={form.videolar}
            onChange={v => set('videolar', v)}
            s={s}
          />
        )}

        {onHaftayaTasi && slot.tip && (
          <button
            onClick={() => onHaftayaTasi(form)}
            style={{
              width: '100%',
              marginBottom: 8,
              padding: '9px',
              borderRadius: 12,
              border: `1px solid ${s.accent}50`,
              background: `${s.accent}12`,
              color: s.accent,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Haftaya Taşı (aynı gün + saat)
          </button>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {slot.tip && (
            <button
              onClick={onSil}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: 12,
                border: `1px solid ${s.danger}40`,
                background: s.tehlikaSoft,
                color: s.danger,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Sil
            </button>
          )}
          <button
            onClick={onKapat}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: 12,
              border: `1px solid ${s.border}`,
              background: s.surface2,
              color: s.text2,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            İptal
          </button>
          <button
            onClick={() => form.tip && onKaydet(form)}
            disabled={!form.tip}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: 12,
              border: 'none',
              background: form.tip ? s.accentGrad : s.surface3,
              color: form.tip ? (s.buttonText ?? '#fff') : s.text3,
              fontWeight: 700,
              fontSize: 13,
              cursor: form.tip ? 'pointer' : 'not-allowed',
            }}
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
