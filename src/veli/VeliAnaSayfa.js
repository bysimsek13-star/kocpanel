import React from 'react';
import { LoadingState, EmptyState } from '../components/Shared';
import { CalismaOzet, KocRaporu, OgrenciDurumKart } from './VeliKartlari';

export function VeliAnaSayfa({
  ogrenci,
  denemeler,
  calisma,
  veliRaporlari,
  okunmamisMesaj,
  yukleniyor,
  ogrenciId,
  userData,
  git,
  s,
  mobil,
}) {
  const sonDeneme = denemeler[0] || null;
  const oncekiDeneme = denemeler[1] || null;
  const netDegisim =
    sonDeneme && oncekiDeneme
      ? (Number(sonDeneme.toplamNet) || 0) - (Number(oncekiDeneme.toplamNet) || 0)
      : null;
  const ortNet = denemeler.length
    ? (denemeler.reduce((a, d) => a + (Number(d.toplamNet) || 0), 0) / denemeler.length).toFixed(1)
    : '—';

  return (
    <div>
      {/* Hero kart */}
      <div
        style={{
          background: s.heroSurface,
          border: `1px solid ${s.border}`,
          borderRadius: 18,
          padding: mobil ? '18px 18px' : '22px 26px',
          marginBottom: 22,
          boxShadow: s.shadowCard || s.shadow,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 500, color: s.heroMuted, marginBottom: 6 }}>
          Veli Paneli
        </div>
        <div
          style={{
            fontSize: mobil ? 20 : 24,
            fontWeight: 600,
            color: s.heroTitle,
            marginBottom: 6,
          }}
        >
          Sayın {userData?.isim || 'Veli'},
        </div>
        <div
          style={{
            fontSize: 13,
            color: s.heroMuted,
            lineHeight: 1.5,
            maxWidth: 520,
            marginBottom: 18,
          }}
        >
          {ogrenci
            ? `${ogrenci.isim} için takip ekranı.${ogrenci.kocIsim ? ` Koç: ${ogrenci.kocIsim}` : ''}`
            : 'Öğrenci takip ekranına hoş geldiniz.'}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0,
            borderTop: `1px solid ${s.border}`,
            paddingTop: 16,
            margin: '0 -4px',
          }}
        >
          {[
            {
              v: sonDeneme ? Number(sonDeneme.toplamNet).toFixed(1) : '—',
              l: 'Son Deneme Neti',
              k: 'denemeler',
            },
            { v: ortNet, l: 'Ortalama Net', k: 'denemeler' },
            {
              v:
                netDegisim === null ? '—' : `${netDegisim >= 0 ? '+' : ''}${netDegisim.toFixed(1)}`,
              l: 'Net Değişimi',
              k: 'denemeler',
            },
            { v: okunmamisMesaj || 0, l: 'Koç Mesajı', k: 'mesajlar' },
          ].map((item, i, arr) => (
            <div
              key={item.l}
              onClick={() => git(item.k)}
              style={{
                flex: '1 1 80px',
                minWidth: 80,
                padding: '8px 12px',
                cursor: 'pointer',
                borderRight: i < arr.length - 1 ? `1px solid ${s.border}` : 'none',
                textAlign: 'center',
                borderRadius: 6,
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: s.heroTitle, lineHeight: 1.15 }}>
                {item.v}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: s.heroMuted, marginTop: 4 }}>
                {item.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {yukleniyor ? (
        <LoadingState />
      ) : !ogrenciId ? (
        <EmptyState mesaj="Bu hesaba bağlı öğrenci bulunamadı" icon="👨‍👩‍👧" />
      ) : (
        <>
          {/* Kısayol kutucukları */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: s.text3,
                marginBottom: 12,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Bölümler
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { k: 'denemeler', l: 'Denemeler', d: 'Sonuçlar & net takibi' },
                { k: 'program', l: 'Haftalık Program', d: 'Bu haftanın görevleri' },
                {
                  k: 'mesajlar',
                  l: 'Koç Mesajları',
                  d: okunmamisMesaj ? `${okunmamisMesaj} okunmamış` : 'Koçla iletişim',
                },
                { k: 'duyurular', l: 'Duyurular', d: 'Genel bildirimler' },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => git(item.k)}
                  style={{
                    background: s.surface,
                    border: `1px solid ${s.border}`,
                    borderRadius: 12,
                    padding: '14px 14px 12px',
                    cursor: 'pointer',
                    boxShadow: s.shadowCard || s.shadow,
                    borderLeft: `3px solid ${s.accent}`,
                    transition: 'box-shadow .15s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.boxShadow = `0 4px 14px rgba(91,79,232,0.12)`)
                  }
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = s.shadowCard || s.shadow)}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.text, lineHeight: 1.3 }}>
                    {item.l}
                  </div>
                  <div style={{ fontSize: 11, color: s.text3, marginTop: 4 }}>{item.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Son denemeler */}
          {denemeler.length > 0 && (
            <div
              style={{
                background: s.surface,
                border: `1px solid ${s.border}`,
                borderRadius: 14,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>Son Denemeler</div>
                <button
                  onClick={() => git('denemeler')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: s.accent,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Tümünü gör →
                </button>
              </div>
              {denemeler.slice(0, 4).map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom:
                      i < Math.min(denemeler.length, 4) - 1 ? `1px solid ${s.border}` : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>
                      {d.sinav}
                      {d.alan ? ` · ${d.alan}` : ''}
                    </div>
                    <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>
                      {d.tarih}
                      {d.yayinevi ? ` · ${d.yayinevi}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.accent }}>
                    {Number(d.toplamNet).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mesaj uyarısı */}
          {okunmamisMesaj > 0 && (
            <div
              onClick={() => git('mesajlar')}
              style={{
                background: s.accentSoft,
                border: `1px solid ${s.accent}`,
                borderRadius: 12,
                padding: '14px 18px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: s.accent }}>
                Koçtan {okunmamisMesaj} okunmamış mesaj var
              </div>
              <div style={{ fontSize: 12, color: s.accent }}>Mesajlara git →</div>
            </div>
          )}

          <OgrenciDurumKart ogrenci={ogrenci} s={s} />
          <div style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1fr 1fr', gap: 14 }}>
            <CalismaOzet calisma={calisma} s={s} />
            <KocRaporu raporlar={veliRaporlari} ogrenciIsim={ogrenci?.isim} s={s} />
          </div>
        </>
      )}
    </div>
  );
}
