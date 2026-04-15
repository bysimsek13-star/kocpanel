import React, { useState } from 'react';
import { Btn } from '../components/Shared';
import HaftalikProgramSayfasi from './HaftalikProgram';
import { DONEM_RENKLER, haftaOffsetHesapla } from './senelikProgramUtils';

// ─── Dönem/not düzenleme paneli ───────────────────────────────────────────────
export function HaftaDetayPanel({ hafta, kayit, onKaydet, onKapat, ogrenci, s }) {
  const [sekme, setSekme] = useState('donem');
  const [donemIdx, setDonemIdx] = useState(kayit?.donemIdx ?? -1);
  const [not, setNot] = useState(kayit?.not ?? '');
  const [sinav, setSinav] = useState(kayit?.sinav ?? false);
  const [sinavAdi, setSinavAdi] = useState(kayit?.sinavAdi ?? '');

  const kaydet = () => {
    onKaydet({ donemIdx, not: not.trim(), sinav, sinavAdi: sinavAdi.trim() });
  };

  const offset = haftaOffsetHesapla(hafta.key);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onKapat}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          width: sekme === 'plan' ? '95vw' : 440,
          maxWidth: sekme === 'plan' ? 1100 : 440,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: s.shadow,
        }}
      >
        {/* Başlık */}
        <div style={{ padding: '18px 24px 0', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 2 }}>
            {hafta.bas.toLocaleDateString('tr-TR')} – {hafta.bitis.toLocaleDateString('tr-TR')}
          </div>
          <div style={{ fontSize: 11, color: s.text3, marginBottom: 14 }}>{hafta.key}</div>

          {/* Sekmeler */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: s.surface2,
              padding: 4,
              borderRadius: 10,
              marginBottom: 0,
            }}
          >
            {[
              { k: 'donem', l: '🎨 Dönem / Sınav' },
              { k: 'plan', l: '📅 Haftalık Plan' },
            ].map(t => (
              <button
                key={t.k}
                type="button"
                onClick={() => setSekme(t.k)}
                style={{
                  flex: 1,
                  border: 'none',
                  padding: '8px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: sekme === t.k ? s.surface : 'transparent',
                  color: sekme === t.k ? s.accent : s.text3,
                  fontWeight: sekme === t.k ? 700 : 500,
                  fontSize: 12,
                  boxShadow: sekme === t.k ? s.shadowCard : 'none',
                  transition: 'all .15s',
                }}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* İçerik */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: sekme === 'plan' ? '16px 8px 8px' : '20px 24px 0',
          }}
        >
          {/* ── Dönem sekmesi ── */}
          {sekme === 'donem' && (
            <>
              {/* Dönem seçimi */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 8 }}>
                  Dönem rengi
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <div
                    onClick={() => setDonemIdx(-1)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      border: donemIdx === -1 ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                      background: donemIdx === -1 ? s.accentSoft : s.surface2,
                      color: donemIdx === -1 ? s.accent : s.text3,
                    }}
                  >
                    Yok
                  </div>
                  {DONEM_RENKLER.map((d, i) => (
                    <div
                      key={i}
                      onClick={() => setDonemIdx(i)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        border: donemIdx === i ? `2px solid ${d.renk}` : `1px solid ${s.border}`,
                        background: donemIdx === i ? d.acik : s.surface2,
                        color: d.renk,
                      }}
                    >
                      {d.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sınav işareti */}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={sinav}
                    onChange={e => setSinav(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, color: s.text, fontWeight: 500 }}>
                    Bu hafta sınav var
                  </span>
                </label>
                {sinav && (
                  <input
                    value={sinavAdi}
                    onChange={e => setSinavAdi(e.target.value)}
                    placeholder="Sınav adı (örn: TYT Deneme, YKS)"
                    style={{
                      marginTop: 8,
                      width: '100%',
                      background: s.surface2,
                      border: `1px solid ${s.border}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: s.text,
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>

              {/* Not */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 6 }}>
                  Not / etiket
                </div>
                <textarea
                  value={not}
                  onChange={e => setNot(e.target.value)}
                  placeholder="Bu hafta için not..."
                  style={{
                    width: '100%',
                    minHeight: 60,
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid ${s.border}`,
                    background: s.surface2,
                    color: s.text,
                    fontSize: 12,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          {/* ── Haftalık Plan sekmesi ── */}
          {sekme === 'plan' && ogrenci && (
            <HaftalikProgramSayfasi ogrenci={ogrenci} initialOffset={offset} compact />
          )}
          {sekme === 'plan' && !ogrenci && (
            <div style={{ textAlign: 'center', color: s.text3, padding: 40, fontSize: 13 }}>
              Haftalık plan oluşturmak için önce bir öğrenci seçin.
            </div>
          )}
        </div>

        {/* Alt butonlar */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${s.border}`,
            display: 'flex',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            Kapat
          </Btn>
          {sekme === 'donem' && (
            <Btn onClick={kaydet} style={{ flex: 2 }}>
              Dönem bilgisini kaydet
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
