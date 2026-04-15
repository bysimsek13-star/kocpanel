import React from 'react';

export default function GunlukSoruFormBaslik({
  tarih,
  setTarih,
  sinav,
  setSinav,
  setVeriler,
  setKonuDetay,
  sureDk,
  setSureDk,
  minTarih,
  bugun,
  s,
}) {
  return (
    <>
      <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 6 }}>
        Günlük soru çözümü
      </div>
      <div style={{ fontSize: 12, color: s.text2, lineHeight: 1.6, marginBottom: 14 }}>
        Her gün çözdüğün soruları ders bazında gir. Yanlış ve boşlarda konu işaretlemek, koçunun
        eksik kazanımları görmesini sağlar. Süre (dk) alanı isteğe bağlıdır; hız analizi için
        kullanılabilir.
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: s.text3, marginBottom: 4 }}>Tarih</div>
          <input
            type="date"
            value={tarih}
            min={minTarih}
            max={bugun}
            onChange={e => setTarih(e.target.value)}
            style={{
              background: s.inputBg ?? s.surface,
              border: `1px solid ${s.inputBorder ?? s.border}`,
              borderRadius: 10,
              padding: '8px 10px',
              color: s.text,
              fontSize: 13,
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 11, color: s.text3, marginBottom: 4 }}>Sınav seti</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['TYT', 'AYT'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSinav(t);
                  setVeriler({});
                  setKonuDetay({});
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: sinav === t ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                  background: sinav === t ? s.accentSoft : s.surface2,
                  color: sinav === t ? s.accent : s.text2,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: s.text3, marginBottom: 4 }}>
            Süre (dk, isteğe bağlı)
          </div>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="600"
            step="5"
            placeholder="Örn. 90"
            value={sureDk}
            onChange={e => setSureDk(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 140,
              background: s.inputBg ?? s.surface,
              border: `1px solid ${s.inputBorder ?? s.border}`,
              borderRadius: 10,
              padding: '8px 10px',
              color: s.text,
              fontSize: 13,
              touchAction: 'manipulation',
            }}
          />
        </div>
      </div>
    </>
  );
}
