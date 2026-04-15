import React from 'react';
import { Card, Btn, Input, Avatar, EmptyState } from '../components/Shared';

export default function YoneticiOgrenciler({
  filtreliOgrenciler,
  dahaFazlaVar,
  ogrenciArama,
  ogrenciAramaGirdi,
  setOgrenciAramaGirdi,
  dahaFazlaYukle,
  ogrenciYukleniyor,
  kocMap,
  setAtamaModal,
  setDuzenleModal,
  setSeciliOgrenci,
  setOgrenciEkleAcik,
  islemYukleniyor,
  s,
  mobil,
  renkler,
}) {
  return (
    <div style={{ padding: mobil ? 16 : 28, paddingTop: 0 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ color: s.text2, fontSize: 13 }}>
          {filtreliOgrenciler.length} kayıt
          {dahaFazlaVar && !ogrenciArama ? ' • daha fazla var' : ''}
        </div>
        <Btn onClick={() => setOgrenciEkleAcik(true)} disabled={islemYukleniyor}>
          + Yeni Öğrenci
        </Btn>
      </div>
      <Card style={{ padding: 14, marginBottom: 14 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobil ? '1fr' : '1.4fr 0.8fr',
            gap: 12,
          }}
        >
          <Input
            placeholder="İsim, e-posta, veli, sınav türü veya koç ile ara"
            value={ogrenciAramaGirdi}
            onChange={e => setOgrenciAramaGirdi(e.target.value)}
          />
          <Btn
            variant="outline"
            onClick={() => setOgrenciAramaGirdi('')}
            disabled={islemYukleniyor}
          >
            Aramayı Temizle
          </Btn>
        </div>
      </Card>
      <Card style={{ padding: 8 }}>
        {filtreliOgrenciler.length === 0 ? (
          <EmptyState mesaj="Öğrenci bulunamadı" icon="📈" />
        ) : (
          <>
            {filtreliOgrenciler.map((ogrenci, i) => {
              const koc = kocMap[ogrenci.kocId];
              return (
                <div
                  key={ogrenci.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '12px 16px',
                    borderBottom:
                      i < filtreliOgrenciler.length - 1 ? `1px solid ${s.border}` : 'none',
                    flexWrap: 'wrap',
                  }}
                >
                  <Avatar
                    isim={ogrenci.isim || ogrenci.email || '?'}
                    boyut={42}
                    renk={renkler[i % renkler.length]}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: s.text, fontWeight: 700, fontSize: 14 }}>
                      {ogrenci.isim || '—'}
                    </div>
                    <div style={{ color: s.text2, fontSize: 12 }}>
                      {ogrenci.email || '—'} • {ogrenci.tur || '—'}
                    </div>
                    <div style={{ color: s.text3, fontSize: 11, marginTop: 2 }}>
                      📩 Veli: {ogrenci.veliEmail || 'Tanımlanmamış'}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: koc ? s.accentSoft : 'rgba(244,63,94,0.12)',
                        color: koc ? s.accent : '#F43F5E',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {koc ? koc.isim || koc.email : 'Koçsuz'}
                    </div>
                    <Btn
                      variant="outline"
                      style={{ fontSize: 11, padding: '6px 12px' }}
                      onClick={() => setAtamaModal(ogrenci)}
                    >
                      Koç Ata
                    </Btn>
                    <Btn
                      variant="outline"
                      style={{ fontSize: 11, padding: '6px 12px' }}
                      onClick={() => setDuzenleModal(ogrenci)}
                    >
                      Düzenle
                    </Btn>
                    <Btn
                      variant="outline"
                      style={{ fontSize: 11, padding: '6px 12px' }}
                      onClick={() => setSeciliOgrenci(ogrenci)}
                    >
                      Yönet
                    </Btn>
                  </div>
                </div>
              );
            })}
            {dahaFazlaVar && !ogrenciArama && (
              <div
                style={{
                  padding: '14px 16px 10px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Btn variant="outline" onClick={dahaFazlaYukle} disabled={ogrenciYukleniyor}>
                  {ogrenciYukleniyor ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
                </Btn>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
