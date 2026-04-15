import React from 'react';
import { Card, Btn, EmptyState } from '../components/Shared';

export default function ProgramOlusturMufredat({
  tumDersler,
  seciliDers,
  setSeciliDers,
  seciliKonu,
  setSeciliKonu,
  saat,
  setSaat,
  gun,
  setGun,
  konuListesi,
  mufredatEkle,
  dersGruplari,
  mufredatSil,
  s,
}) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 16 }}>
        📚 Müfredat Planı
      </div>
      <div style={{ fontSize: 12, color: s.text3, marginBottom: 12 }}>
        Her derse konu ekleyin, kaç saat ve kaç günde bitirilmesi gerektiğini belirleyin.
      </div>

      <div style={{ background: s.surface2, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <select
            value={seciliDers}
            onChange={e => {
              setSeciliDers(e.target.value);
              setSeciliKonu('');
            }}
            style={{
              flex: 1,
              minWidth: 120,
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
            }}
          >
            <option value="">Ders seç...</option>
            {tumDersler.map(d => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          <select
            value={seciliKonu}
            onChange={e => setSeciliKonu(e.target.value)}
            style={{
              flex: 1,
              minWidth: 140,
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
            }}
          >
            <option value="">Konu seç...</option>
            {konuListesi.map(k => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            min="0"
            step="0.5"
            value={saat}
            onChange={e => setSaat(e.target.value)}
            placeholder="Saat"
            style={{
              width: 80,
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: 12, color: s.text3 }}>saat</span>
          <input
            type="number"
            min="0"
            value={gun}
            onChange={e => setGun(e.target.value)}
            placeholder="Gün"
            style={{
              width: 80,
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: 12, color: s.text3 }}>günde bitsin</span>
          <div style={{ flex: 1 }} />
          <Btn
            onClick={mufredatEkle}
            disabled={!seciliDers || !seciliKonu}
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            + Ekle
          </Btn>
        </div>
      </div>

      {Object.keys(dersGruplari).length === 0 ? (
        <EmptyState mesaj="Henüz müfredat eklenmedi" icon="📚" />
      ) : (
        Object.entries(dersGruplari).map(([dersId, grup]) => {
          const dersInfo = tumDersler.find(d => d.id === dersId);
          const topSaat = grup.konular.reduce((a, k) => a + (k.saat || 0), 0);
          return (
            <div key={dersId} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: dersInfo?.renk || s.accent,
                  }}
                />
                <div style={{ fontSize: 14, fontWeight: 600, color: s.text }}>{grup.label}</div>
                <div style={{ fontSize: 11, color: s.text3 }}>
                  {grup.konular.length} konu · {topSaat}s toplam
                </div>
              </div>
              {grup.konular.map(k => (
                <div
                  key={k.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    marginBottom: 4,
                    background: s.surface2,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ flex: 1, fontSize: 13, color: s.text }}>{k.konu}</div>
                  {k.saat > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: s.accent,
                        background: s.accentSoft,
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      {k.saat}s
                    </div>
                  )}
                  {k.gun > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#F59E0B',
                        background: 'rgba(245,158,11,0.1)',
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      {k.gun} gün
                    </div>
                  )}
                  <button
                    onClick={() => mufredatSil(k.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#F43F5E',
                      cursor: 'pointer',
                      fontSize: 14,
                      opacity: 0.5,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          );
        })
      )}
    </Card>
  );
}
