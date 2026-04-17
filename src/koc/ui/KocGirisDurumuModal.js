import React from 'react';
import PropTypes from 'prop-types';
import { Avatar } from '../../components/Shared';
import { renkler } from '../../data/konular';

const ISTANBUL = 'Europe/Istanbul';

function saatiFormatla(ts) {
  if (!ts) return null;
  const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('tr-TR', { timeZone: ISTANBUL, hour: '2-digit', minute: '2-digit' });
}

function tarihSaatiFormatla(ts) {
  if (!ts) return null;
  const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  return d.toLocaleString('tr-TR', {
    timeZone: ISTANBUL,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function GirisEtiketi({ bilgi, s }) {
  if (!bilgi.sonAktif) {
    return <div style={{ fontSize: 11, color: s.text3 }}>Hiç giriş yok</div>;
  }
  if (bilgi.bugunAktif) {
    const saat = saatiFormatla(bilgi.sonAktif);
    const sayi = bilgi.girisSayisi || 1;
    return (
      <div style={{ fontSize: 11, color: '#10B981' }}>
        {sayi} kez — son giriş {saat}
      </div>
    );
  }
  return (
    <div style={{ fontSize: 11, color: s.text3 }}>
      Son giriş: {tarihSaatiFormatla(bilgi.sonAktif)}
    </div>
  );
}

export default function KocGirisDurumuModal({ ogrenciler, bugunMap, onKapat, s }) {
  const sirali = [...ogrenciler].sort((a, b) => {
    const aAktif = bugunMap[a.id]?.bugunAktif ? 1 : 0;
    const bAktif = bugunMap[b.id]?.bugunAktif ? 1 : 0;
    return bAktif - aAktif;
  });

  const bugunGirenSayisi = ogrenciler.filter(o => bugunMap[o.id]?.bugunAktif).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
      onClick={onKapat}
    >
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 18,
          padding: '24px 24px 20px',
          width: 380,
          maxWidth: '95vw',
          maxHeight: '72vh',
          overflowY: 'auto',
          boxShadow: s.shadow,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: s.text }}>Bugün giriş durumu</div>
          <button
            onClick={onKapat}
            aria-label="Modalı kapat"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: s.text3,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ fontSize: 12, color: s.text3, marginBottom: 16 }}>
          {bugunGirenSayisi}/{ogrenciler.length} öğrenci bugün giriş yaptı
        </div>

        {sirali.map((o, i) => {
          const bilgi = bugunMap[o.id] ?? {};
          return (
            <div
              key={o.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: i < sirali.length - 1 ? `1px solid ${s.border}` : 'none',
              }}
            >
              <Avatar isim={o.isim} renk={renkler[i % renkler.length]} boyut={34} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{o.isim}</div>
                <GirisEtiketi bilgi={bilgi} s={s} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

GirisEtiketi.propTypes = {
  bilgi: PropTypes.object.isRequired,
  s: PropTypes.object.isRequired,
};

KocGirisDurumuModal.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, isim: PropTypes.string }))
    .isRequired,
  bugunMap: PropTypes.object.isRequired,
  onKapat: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
