import React from 'react';
import { Card } from '../components/Shared';

export default function GunlukSoruGecmis({ gecmisKayitlar, tarih, setTarih, s }) {
  if (gecmisKayitlar.length === 0) return null;

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: s.text, marginBottom: 12 }}>
        Son 7 gün
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {gecmisKayitlar.map(kayit => {
          const dersler = kayit.dersler || {};
          let toplam = 0;
          Object.values(dersler).forEach(row => {
            toplam += (row.d || 0) + (row.y || 0) + (row.b || 0);
          });
          return (
            <div
              key={kayit.id}
              onClick={() => setTarih(kayit.tarih)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                background: kayit.tarih === tarih ? s.accentSoft : s.surface2,
                border: `1px solid ${kayit.tarih === tarih ? s.accent : s.border}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.text }}>
                {kayit.tarih}
              </div>
              <div style={{ fontSize: 12, color: s.text2 }}>
                {toplam} soru · {kayit.sinav || 'TYT'}
              </div>
              {kayit.sureDk > 0 && (
                <div style={{ fontSize: 11, color: s.text3 }}>{kayit.sureDk} dk</div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
