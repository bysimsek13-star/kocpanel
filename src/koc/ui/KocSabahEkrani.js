import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useKoc } from '../../context/KocContext';
import { EmptyState, Btn } from '../../components/Shared';

function avatarHarf(isim) {
  return (isim || '?').charAt(0).toUpperCase();
}

export default function KocSabahEkrani({ onSec, onNav, kocAdi }) {
  const { s } = useTheme();
  const { ogrenciler, bugunMap, okunmamisMap } = useKoc();

  const saatTR = parseInt(
    new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: 'numeric',
      hour12: false,
    })
  );
  const selam =
    saatTR >= 6 && saatTR < 12
      ? 'Günaydın'
      : saatTR >= 12 && saatTR < 18
        ? 'İyi günler'
        : saatTR >= 18 && saatTR < 22
          ? 'İyi akşamlar'
          : 'İyi geceler';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: s.text, marginBottom: 4 }}>
          {selam}, {kocAdi} 👋
        </div>
        <div style={{ fontSize: 13, color: s.text3 }}>Bugün öğrencilerinin durumuna bak.</div>
      </div>

      {ogrenciler.length === 0 ? (
        <EmptyState mesaj="Henüz öğrenci eklemedin" icon="🎓">
          <Btn onClick={() => onNav('ogrenciler')} style={{ marginTop: 12 }}>
            + Öğrenci Ekle
          </Btn>
        </EmptyState>
      ) : (
        <div
          style={{
            background: s.surface,
            borderRadius: 16,
            border: `1px solid ${s.border}`,
            overflow: 'hidden',
          }}
        >
          {ogrenciler.map((o, i) => {
            const bugun = bugunMap[o.id] || {};
            const okunmamis = okunmamisMap?.[o.id] || 0;
            const sonSatir = i === ogrenciler.length - 1;
            return (
              <div
                key={o.id}
                onClick={() => onSec(o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: sonSatir ? 'none' : `1px solid ${s.border}`,
                  background: 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `${s.accent}22`,
                    color: s.accent,
                    fontWeight: 700,
                    fontSize: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {avatarHarf(o.isim)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: s.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {o.isim}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span title="Rutin" style={{ fontSize: 16, opacity: bugun.rutin ? 1 : 0.25 }}>
                    {bugun.rutin ? '✅' : '○'}
                  </span>
                  <span
                    title="Günlük soru"
                    style={{ fontSize: 16, opacity: bugun.gunlukSoru ? 1 : 0.25 }}
                  >
                    {bugun.gunlukSoru ? '📝' : '○'}
                  </span>
                  {okunmamis > 0 && (
                    <span
                      style={{
                        background: s.danger,
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 20,
                        padding: '1px 6px',
                        minWidth: 18,
                        textAlign: 'center',
                      }}
                    >
                      {okunmamis}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

KocSabahEkrani.propTypes = {
  onSec: PropTypes.func,
  onNav: PropTypes.func.isRequired,
  kocAdi: PropTypes.string,
};
