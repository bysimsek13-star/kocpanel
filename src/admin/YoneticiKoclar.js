import React from 'react';
import { Btn, EmptyState } from '../components/Shared';
import KocKarti from './KocKarti';

export default function YoneticiKoclar({
  koclar,
  kocOgrenciSayisi,
  setKocEkleAcik,
  setSilOnay,
  islemYukleniyor,
  s,
  mobil,
}) {
  return (
    <div style={{ padding: mobil ? 16 : 28, paddingTop: 0 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ color: s.text2, fontSize: 13 }}>{koclar.length} koç kayıtlı</div>
        <Btn onClick={() => setKocEkleAcik(true)} disabled={islemYukleniyor}>
          + Yeni Koç Ekle
        </Btn>
      </div>
      {koclar.length === 0 ? (
        <EmptyState mesaj="Henüz koç yok" icon="👨‍🏫" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobil ? '1fr' : 'repeat(2, 1fr)',
            gap: 14,
          }}
        >
          {koclar.map(koc => (
            <KocKarti
              key={koc.id}
              koc={koc}
              ogrenciSayisi={kocOgrenciSayisi(koc.id)}
              s={s}
              onSil={setSilOnay}
              islemYukleniyor={islemYukleniyor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
