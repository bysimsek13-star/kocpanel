import React, { useState } from 'react';
import { Card } from '../components/Shared';
import { TYT_DERSLER, AYT_DERSLER } from '../data/konular';

const DERS_HARITA = {};
[...TYT_DERSLER, ...AYT_DERSLER].forEach(d => {
  DERS_HARITA[d.id] = { label: d.label, renk: d.renk };
});

function dersSatiri(dersId, row, s) {
  const ders = DERS_HARITA[dersId];
  const label = ders?.label || dersId;
  const renk = ders?.renk || s.accent;
  const toplam = (row.d || 0) + (row.y || 0) + (row.b || 0);
  return (
    <div
      key={dersId}
      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: s.text2 }}
    >
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: renk, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ color: s.text3 }}>{toplam}s</span>
      {(row.y || 0) > 0 && <span style={{ color: '#F43F5E', fontWeight: 600 }}>Y{row.y}</span>}
      {(row.b || 0) > 0 && <span style={{ color: '#F59E0B', fontWeight: 600 }}>B{row.b}</span>}
    </div>
  );
}

export default function GunlukSoruGecmis({ gecmisKayitlar, tarih, setTarih, s }) {
  const [acikId, setAcikId] = useState(null);
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
          let toplamY = 0;
          let toplamB = 0;
          Object.values(dersler).forEach(row => {
            toplam += (row.d || 0) + (row.y || 0) + (row.b || 0);
            toplamY += row.y || 0;
            toplamB += row.b || 0;
          });
          const secili = kayit.tarih === tarih;
          const acik = acikId === kayit.id;
          const dersSiralari = Object.entries(dersler).filter(
            ([, r]) => (r.d || 0) + (r.y || 0) + (r.b || 0) > 0
          );

          return (
            <div key={kayit.id}>
              <div
                onClick={() => {
                  setTarih(kayit.tarih);
                  setAcikId(acik ? null : kayit.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: acik ? '10px 10px 0 0' : 10,
                  background: secili ? s.accentSoft : s.surface2,
                  border: `1px solid ${secili ? s.accent : s.border}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.text }}>
                  {kayit.tarih}
                </div>
                <div style={{ fontSize: 12, color: s.text2 }}>
                  {toplam}s · {kayit.sinav || 'TYT'}
                </div>
                {toplamY > 0 && (
                  <span style={{ fontSize: 11, color: '#F43F5E', fontWeight: 700 }}>
                    Y{toplamY}
                  </span>
                )}
                {toplamB > 0 && (
                  <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700 }}>
                    B{toplamB}
                  </span>
                )}
                {kayit.sureDk > 0 && (
                  <div style={{ fontSize: 11, color: s.text3 }}>{kayit.sureDk}dk</div>
                )}
                {dersSiralari.length > 1 && (
                  <div
                    style={{
                      fontSize: 10,
                      color: s.text3,
                      transform: acik ? 'rotate(90deg)' : 'none',
                      transition: 'transform .15s',
                    }}
                  >
                    ▶
                  </div>
                )}
              </div>
              {acik && dersSiralari.length > 0 && (
                <div
                  style={{
                    background: s.surface2,
                    border: `1px solid ${secili ? s.accent : s.border}`,
                    borderTop: 'none',
                    borderRadius: '0 0 10px 10px',
                    padding: '8px 14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                  }}
                >
                  {dersSiralari.map(([id, row]) => dersSatiri(id, row, s))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
