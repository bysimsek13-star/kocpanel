import React from 'react';
import { Card, Btn, Input } from '../components/Shared';

export default function DuyuruFormu({
  duyuruBaslik,
  setDuyuruBaslik,
  duyuruOzet,
  setDuyuruOzet,
  duyuruSeviye,
  setDuyuruSeviye,
  duyuruGun,
  setDuyuruGun,
  yayinla,
  renk,
}) {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: renk.text, marginBottom: 12 }}>
        📣 Yeni Duyuru Yayınla
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input
          value={duyuruBaslik}
          onChange={e => setDuyuruBaslik(e.target.value)}
          placeholder="Duyuru başlığı"
        />
        <textarea
          value={duyuruOzet}
          onChange={e => setDuyuruOzet(e.target.value)}
          rows={4}
          placeholder="Kısa özet / release note"
          style={{
            width: '100%',
            borderRadius: 12,
            border: `1px solid ${renk.border}`,
            background: renk.surface2,
            color: renk.text,
            padding: 12,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['bilgi', 'guncelleme', 'kritik'].map(seviye => (
            <button
              key={seviye}
              onClick={() => setDuyuruSeviye(seviye)}
              style={{
                border: `1px solid ${duyuruSeviye === seviye ? renk.accent : renk.border}`,
                background: duyuruSeviye === seviye ? renk.accentSoft : renk.surface2,
                color: duyuruSeviye === seviye ? renk.accent : renk.text2,
                borderRadius: 999,
                padding: '7px 12px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {seviye}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: renk.text2, whiteSpace: 'nowrap' }}>
            Kaç gün yayında kalsın:
          </span>
          <input
            type="number"
            min={1}
            max={30}
            value={duyuruGun}
            onChange={e => setDuyuruGun(e.target.value)}
            style={{
              width: 60,
              padding: '6px 10px',
              borderRadius: 8,
              border: `1px solid ${renk.border}`,
              background: renk.surface2,
              color: renk.text,
              fontSize: 13,
            }}
          />
          <span style={{ fontSize: 12, color: renk.text3 }}>gün</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Btn onClick={yayinla}>Duyuruyu Yayınla</Btn>
        </div>
      </div>
    </Card>
  );
}
