import React from 'react';
import { Card, Btn, Avatar, EmptyState } from '../components/Shared';

export default function YoneticiIstatistik({
  koclar,
  dashboard,
  kocOgrenciSayisi,
  sayfayaGit,
  setOgrenciEkleAcik,
  setKocEkleAcik,
  islemYukleniyor,
  s,
  mobil,
  renkler,
}) {
  return (
    <div style={{ padding: mobil ? 16 : 32, maxWidth: 960 }}>
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
          Yönetim Merkezi
        </div>
        <div
          style={{
            fontSize: mobil ? 20 : 24,
            fontWeight: 600,
            color: s.heroTitle,
            marginBottom: 6,
          }}
        >
          Hoş geldin, Yönetici 👑
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
          ElsWay yönetim merkezi — koç ve öğrenci durumuna genel bakış.
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
            { v: dashboard.kocSayisi, l: 'Koç', k: 'koclar' },
            { v: dashboard.ogrenciSayisi, l: 'Öğrenci', k: 'ogrenciler' },
            { v: dashboard.atasizOgrenci, l: 'Koç Bekleyen', k: 'ogrenciler' },
            { v: dashboard.aktifOgrenci, l: 'Aktif', k: 'yasamdongusu' },
          ].map((item, i, arr) => (
            <div
              key={item.l}
              onClick={() => sayfayaGit(item.k)}
              style={{
                flex: '1 1 80px',
                minWidth: 80,
                padding: '8px 12px',
                cursor: 'pointer',
                borderRight: i < arr.length - 1 ? `1px solid ${s.border}` : 'none',
                textAlign: 'center',
                borderRadius: 6,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: s.heroTitle }}>{item.v}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: s.heroMuted, marginTop: 4 }}>
                {item.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <Btn onClick={() => setOgrenciEkleAcik(true)} disabled={islemYukleniyor}>
          + Öğrenci Ekle
        </Btn>
        <Btn onClick={() => setKocEkleAcik(true)} variant="outline" disabled={islemYukleniyor}>
          + Koç Ekle
        </Btn>
      </div>

      <div style={{ marginBottom: 24 }}>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobil ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: 10,
          }}
        >
          {[
            { k: 'koclar', l: 'Koç Yönetimi', d: 'Ekle, sil, düzenle' },
            { k: 'ogrenciler', l: 'Öğrenci Portföyü', d: 'Arama & koç atama' },
            { k: 'yasamdongusu', l: 'Kullanıcı Döngüsü', d: 'Aktif / pasif yönetimi' },
            { k: 'performans', l: 'Koç Performansı', d: 'Grafikler & analiz' },
            { k: 'auditlog', l: 'İşlem Geçmişi', d: 'Son 150 kritik işlem' },
            { k: 'mufredat', l: 'Müfredat', d: 'Konu & saat yönetimi' },
          ].map(item => (
            <div
              key={item.k}
              onClick={() => sayfayaGit(item.k)}
              style={{
                background: s.surface,
                border: `1px solid ${s.border}`,
                borderRadius: 12,
                padding: '14px 14px 12px',
                cursor: 'pointer',
                boxShadow: s.shadowCard || s.shadow,
                borderLeft: `3px solid ${s.accent}`,
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,79,232,0.12)')
              }
              onMouseLeave={e => (e.currentTarget.style.boxShadow = s.shadowCard || s.shadow)}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{item.l}</div>
              <div style={{ fontSize: 11, color: s.text3, marginTop: 4 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobil ? '1fr' : '1.2fr 0.8fr',
          gap: 16,
        }}
      >
        <Card>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${s.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ color: s.text, fontWeight: 700, fontSize: 15 }}>
              👨‍🏫 Koç-Öğrenci Dağılımı
            </div>
            <Btn
              variant="outline"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={() => sayfayaGit('koclar')}
            >
              Tümü
            </Btn>
          </div>
          {koclar.length === 0 ? (
            <EmptyState mesaj="Henüz koç eklenmemiş" icon="👨‍🏫" />
          ) : (
            <div style={{ padding: '8px 20px 14px' }}>
              {koclar.map((koc, i) => {
                const sayi = kocOgrenciSayisi(koc.id);
                const max = Math.max(...koclar.map(x => kocOgrenciSayisi(x.id)), 1);
                return (
                  <div
                    key={koc.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: `1px solid ${s.border}`,
                    }}
                  >
                    <Avatar
                      isim={koc.isim || koc.email || '?'}
                      renk={renkler[i % renkler.length]}
                      boyut={34}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: s.text, fontSize: 13, fontWeight: 600 }}>
                        {koc.isim || koc.email || '—'}
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: s.surface2,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginTop: 6,
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(sayi / max) * 100}%`,
                            background: s.accentGrad,
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ color: s.accent, fontSize: 16, fontWeight: 700 }}>{sayi}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${s.border}` }}>
            <div style={{ color: s.text, fontWeight: 700, fontSize: 15 }}>🧭 Hızlı Durum</div>
          </div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 14, background: s.surface2 }}>
              <div style={{ color: s.text, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                Koç atama önceliği
              </div>
              <div style={{ color: s.text2, fontSize: 12 }}>
                {dashboard.atasizOgrenci} öğrenci şu an koç ataması bekliyor.
              </div>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: s.surface2 }}>
              <div style={{ color: s.text, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                Önerilen adım
              </div>
              <div style={{ color: s.text2, fontSize: 12 }}>
                Önce koçsuz öğrencileri eşleştir, sonra performans ekranından koç yüklerini dengele.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
