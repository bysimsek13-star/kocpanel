import React, { useState, useEffect } from 'react';
import { Card, LoadingState, EmptyState } from '../components/Shared';
import { auditLogGetir, auditTipMetin, auditTipIkon } from '../utils/auditLog';
import { kisaTarih } from './adminHelpers';

export default function AuditLogSayfasi({ s, mobil }) {
  const [loglar, setLoglar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let aktif = true;
    auditLogGetir(150)
      .then(liste => {
        if (aktif) setLoglar(liste || []);
      })
      .catch(e => console.error('Audit log alınamadı:', e))
      .finally(() => {
        if (aktif) setYukleniyor(false);
      });
    return () => {
      aktif = false;
    };
  }, []);

  return (
    <div style={{ padding: mobil ? 16 : 28, maxWidth: 980 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: s.text, margin: 0 }}>
          📋 İşlem Geçmişi
        </h2>
        <div style={{ fontSize: 13, color: s.text2, marginTop: 4 }}>Son 150 kritik işlem</div>
      </div>
      {yukleniyor ? (
        <LoadingState />
      ) : loglar.length === 0 ? (
        <EmptyState mesaj="Henüz kayıt yok" icon="📋" />
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          {loglar.map((log, i) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                padding: '14px 18px',
                borderBottom: i < loglar.length - 1 ? `1px solid ${s.border}` : 'none',
              }}
            >
              <div style={{ fontSize: 20, flexShrink: 0 }}>{auditTipIkon(log.ne)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: s.text, fontSize: 13, lineHeight: 1.6 }}>
                  <b>{log.kimIsim || log.kim || '—'}</b> {auditTipMetin(log.ne)}{' '}
                  {log.kimiIsim ? <b>{log.kimiIsim}</b> : null}
                </div>
                {log.detay && Object.keys(log.detay).length > 0 && (
                  <div
                    style={{ color: s.text3, fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}
                  >
                    {JSON.stringify(log.detay)}
                  </div>
                )}
              </div>
              <div style={{ color: s.text3, fontSize: 11, flexShrink: 0 }}>
                {kisaTarih(log.zaman)}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
