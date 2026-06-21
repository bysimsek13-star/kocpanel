import React from 'react';
import { useAbonelik } from '../hooks/useAbonelik';

const DURUM_RENK = {
  aktif: { renk: '#16A34A', arkaplan: '#DCFCE7', etiket: 'Aktif' },
  pasif: { renk: '#D97706', arkaplan: '#FEF3C7', etiket: 'Pasif' },
  deneme: { renk: '#2563EB', arkaplan: '#DBEAFE', etiket: 'Deneme' },
  odeme_basarisiz: { renk: '#EF4444', arkaplan: '#FEE2E2', etiket: 'Ödeme Başarısız' },
  iptal: { renk: '#6B7280', arkaplan: '#F3F4F6', etiket: 'İptal Edildi' },
};

function tarihFormatla(timestamp) {
  if (!timestamp) return null;
  const tarih = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function AbonelikDurum({ uid, s }) {
  const { abonelik, yukleniyor } = useAbonelik(uid);

  if (yukleniyor || !abonelik) return null;

  const stil = DURUM_RENK[abonelik.durum] || DURUM_RENK.pasif;
  const sonrakiOdeme = tarihFormatla(abonelik.sonrakiOdeme);

  return (
    <div
      style={{
        background: s?.surface || '#fff',
        border: `1px solid ${s?.border || '#E5E7EB'}`,
        borderLeft: `4px solid ${stil.renk}`,
        borderRadius: 12,
        padding: '14px 18px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            background: stil.arkaplan,
            color: stil.renk,
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          {stil.etiket}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: s?.text || '#1E2A3A' }}>
          Aylık Koçluk Paketi
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {sonrakiOdeme && abonelik.durum === 'aktif' && (
          <div style={{ fontSize: 11, color: s?.text3 || '#8A97A8' }}>Yenileme: {sonrakiOdeme}</div>
        )}
        {abonelik.durum === 'odeme_basarisiz' && (
          <a
            href="https://elsway.com.tr/odeme"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#EF4444',
              textDecoration: 'none',
            }}
          >
            Ödemeyi Tamamla →
          </a>
        )}
        {!abonelik.durum || abonelik.durum === 'pasif' || abonelik.durum === 'iptal' ? (
          <a
            href="https://elsway.com.tr/odeme"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#2563EB',
              textDecoration: 'none',
            }}
          >
            Abonelik Al →
          </a>
        ) : null}
      </div>
    </div>
  );
}
