import React from 'react';
import { SEVIYE_LABEL, SEVIYE_RENK } from './kitapVideoUtils';

const TUR_IKON = { kitap: '📚', video: '🎬', makale: '📄', podcast: '🎙️' };

export function KaynakKarti({ kaynak, onDuzenle, onSil, s }) {
  const seviyeRenk = SEVIYE_RENK[kaynak.seviye] || s.text3;

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: '16px 18px',
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>
          {TUR_IKON[kaynak.tur] || '📖'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
            {kaynak.link ? (
              <a
                href={kaynak.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: s.accent,
                  textDecoration: 'none',
                  flex: 1,
                }}
              >
                {kaynak.baslik} ↗
              </a>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 700, color: s.text, flex: 1 }}>
                {kaynak.baslik}
              </div>
            )}
          </div>

          {kaynak.yazar && (
            <div style={{ fontSize: 11, color: s.text3, marginBottom: 6 }}>{kaynak.yazar}</div>
          )}
          {kaynak.aciklama && (
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 8, lineHeight: 1.5 }}>
              {kaynak.aciklama}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 20,
                background: `${seviyeRenk}15`,
                color: seviyeRenk,
              }}
            >
              {SEVIYE_LABEL[kaynak.seviye]}
            </span>
            {kaynak.dersler?.map(d => (
              <span
                key={d}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: s.surface2,
                  color: s.text3,
                  border: `1px solid ${s.border}`,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onDuzenle(kaynak)}
            type="button"
            style={{
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              padding: '5px 10px',
              color: s.text2,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Düzenle
          </button>
          <button
            onClick={() => onSil(kaynak.id)}
            type="button"
            style={{
              background: s.tehlikaSoft,
              border: 'none',
              borderRadius: 8,
              padding: '5px 10px',
              color: s.tehlika,
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}
