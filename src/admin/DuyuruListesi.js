import React from 'react';
import { Card, EmptyState } from '../components/Shared';

export default function DuyuruListesi({ duyurular, duyuruPasifYap, duyuruSil, renk }) {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: renk.text, marginBottom: 12 }}>
        📝 Son Duyurular
      </div>
      {duyurular.length === 0 ? (
        <EmptyState mesaj="Henüz duyuru yok" icon="📭" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {duyurular.map(d => {
            const arsivlendi = d.aktif === false;
            const bitisTarihi = d.bitisTarihi?.toDate ? d.bitisTarihi.toDate() : null;
            return (
              <div
                key={d.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: arsivlendi ? renk.surface : renk.surface2,
                  opacity: arsivlendi ? 0.6 : 1,
                  border: `1px solid ${arsivlendi ? renk.border : 'transparent'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: renk.text }}>
                      {d.baslik}
                    </div>
                    {d.ozet && (
                      <div style={{ fontSize: 12, color: renk.text2, marginTop: 4 }}>{d.ozet}</div>
                    )}
                    <div style={{ fontSize: 10, color: renk.text3, marginTop: 6 }}>
                      {d.seviye || 'bilgi'}
                      {bitisTarihi &&
                        !arsivlendi &&
                        ` · ${bitisTarihi.toLocaleDateString('tr-TR')}'de arşive gider`}
                      {arsivlendi && ' · Arşivlendi'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!arsivlendi && (
                      <button
                        onClick={() => duyuruPasifYap(d.id)}
                        style={{
                          border: `1px solid ${renk.border}`,
                          background: 'transparent',
                          color: renk.text3,
                          borderRadius: 8,
                          padding: '5px 10px',
                          fontSize: 11,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Arşivle
                      </button>
                    )}
                    <button
                      onClick={() => duyuruSil(d.id)}
                      style={{
                        border: '1px solid rgba(244,63,94,0.3)',
                        background: 'transparent',
                        color: '#F43F5E',
                        borderRadius: 8,
                        padding: '5px 10px',
                        fontSize: 11,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
