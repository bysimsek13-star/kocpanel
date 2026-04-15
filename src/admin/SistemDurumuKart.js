import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { onceOnce, mobilMi, rolRenk, lcpRenk } from './sistemDurumuUtils';

export function Kart({ children, style }) {
  const { s } = useTheme();
  return (
    <div
      style={{ background: s.surface, border: `1px solid ${s.border}`, borderRadius: 14, ...style }}
    >
      {children}
    </div>
  );
}

export function KartBaslik({ ikon, baslik, sag }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 18px 10px',
        borderBottom: `1px solid ${s.border}`,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>
        {ikon} {baslik}
      </div>
      {sag}
    </div>
  );
}

export function CanlıNokta() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        color: '#10B981',
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#10B981',
          animation: 'canliNokta 1.6s ease-in-out infinite',
          display: 'inline-block',
        }}
      />
      Canlı
    </span>
  );
}

export function HataListesi({ hatalar, yeniFlash, s }) {
  return (
    <Kart>
      <KartBaslik ikon="🐞" baslik={`Son Hatalar (${hatalar.length})`} sag={<CanlıNokta />} />
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {hatalar.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: s.text3, fontSize: 13 }}>
            ✅ Hata kaydı yok — sistem sağlıklı
          </div>
        ) : (
          hatalar.slice(0, 20).map(h => {
            const yeni = yeniFlash === h.id;
            const renk = rolRenk(h.rol);
            return (
              <div
                key={h.id}
                style={{
                  padding: '10px 18px',
                  borderBottom: `1px solid ${s.border}`,
                  background: yeni ? `${renk}10` : 'transparent',
                  transition: 'background 0.4s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: renk,
                        background: `${renk}15`,
                        padding: '2px 7px',
                        borderRadius: 20,
                      }}
                    >
                      {h.rol || '?'}
                    </span>
                    <span style={{ fontSize: 11, color: s.text3 }}>{mobilMi(h.userAgent)}</span>
                    <span style={{ fontSize: 11, color: s.text3 }}>
                      {h.email?.split('@')[0] || '—'}
                    </span>
                  </div>
                  <span
                    style={{ fontSize: 10, color: s.text3, flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {onceOnce(h.olusturma)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: s.text,
                    fontWeight: 500,
                    lineHeight: 1.4,
                    marginBottom: 2,
                  }}
                >
                  {h.mesaj?.slice(0, 120) || '—'}
                </div>
                <div style={{ fontSize: 10, color: s.text3 }}>
                  {h.path || ''}
                  {h.kaynak ? ` · ${h.kaynak}` : ''}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Kart>
  );
}

export function RolDagilim({ rolHata, s }) {
  return (
    <Kart>
      <KartBaslik ikon="👤" baslik="Kim hata yapıyor?" />
      <div style={{ padding: '12px 18px' }}>
        {Object.keys(rolHata).length === 0 ? (
          <div style={{ fontSize: 13, color: s.text3, textAlign: 'center', padding: '8px 0' }}>
            Henüz veri yok
          </div>
        ) : (
          Object.entries(rolHata).map(([rol, sayi]) => {
            const renk = rolRenk(rol);
            const max = Math.max(...Object.values(rolHata));
            return (
              <div key={rol} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: s.text, fontWeight: 600 }}>{rol}</span>
                  <span style={{ color: renk, fontWeight: 700 }}>{sayi}</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: s.surface2 }}>
                  <div
                    style={{
                      width: `${(sayi / max) * 100}%`,
                      height: '100%',
                      borderRadius: 99,
                      background: renk,
                      transition: 'width .4s',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Kart>
  );
}

export function SorunluSayfalar({ sayfaHata, s }) {
  return (
    <Kart>
      <KartBaslik ikon="📍" baslik="Sorunlu sayfalar" />
      <div style={{ padding: '12px 18px' }}>
        {sayfaHata.length === 0 ? (
          <div style={{ fontSize: 13, color: s.text3, textAlign: 'center', padding: '8px 0' }}>
            Henüz veri yok
          </div>
        ) : (
          sayfaHata.map(([path, sayi]) => (
            <div
              key={path}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: `1px solid ${s.border}`,
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: s.text2,
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {path}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#F43F5E',
                  background: 'rgba(244,63,94,0.1)',
                  padding: '2px 8px',
                  borderRadius: 20,
                  flexShrink: 0,
                }}
              >
                {sayi}
              </div>
            </div>
          ))
        )}
      </div>
    </Kart>
  );
}

export function WebVitalOzet({ perfOzet, perf, s }) {
  return (
    <Kart>
      <KartBaslik ikon="⚡" baslik="Web Vitals ortalaması" />
      <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { isim: 'LCP', val: perfOzet.lcp, birim: 'ms', aciklama: 'Sayfa yükleme' },
          { isim: 'INP', val: perfOzet.inp, birim: 'ms', aciklama: 'Etkileşim gecikmesi' },
          { isim: 'CLS', val: perfOzet.cls, birim: '', aciklama: 'Görsel kayma' },
        ].map(m => (
          <div
            key={m.isim}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.text }}>{m.isim}</span>
              <span style={{ fontSize: 11, color: s.text3, marginLeft: 6 }}>{m.aciklama}</span>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: m.isim === 'LCP' ? lcpRenk(m.val) : s.text2,
              }}
            >
              {m.val === '—' ? '—' : `${m.val}${m.birim}`}
            </div>
          </div>
        ))}
        {perf.length === 0 && (
          <div style={{ fontSize: 11, color: s.text3, marginTop: 4 }}>
            Öğrenciler sayfayı açtıkça veriler burada birikir
          </div>
        )}
      </div>
    </Kart>
  );
}
