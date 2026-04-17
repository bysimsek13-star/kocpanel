import React from 'react';
import useVideoGorusme from '../hooks/useVideoGorusme';
import VideoGorusmeKontroller from './VideoGorusmeKontroller';

function formatSure(sn) {
  const m = Math.floor(sn / 60);
  const s = sn % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function VideoGorusme({ session, kullanici, karsıIsim, onKapat }) {
  const {
    durum,
    mikrofon,
    kamera,
    karsiVar,
    hata,
    sure,
    localDivRef,
    remoteDivRef,
    kapat,
    mikToggle,
    kamToggle,
  } = useVideoGorusme({ session, kullanici, onKapat });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0d0d14',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div ref={remoteDivRef} style={{ position: 'absolute', inset: 0, background: '#111' }}>
        {!karsiVar && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 34,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {karsıIsim?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 500 }}>
              {durum === 'baglanıyor' ? 'Bağlanıyor...' : `${karsıIsim} henüz katılmadı`}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 100,
          right: 16,
          width: 140,
          height: 96,
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.18)',
          background: '#222',
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <div ref={localDivRef} style={{ width: '100%', height: '100%' }} />
        {!kamera && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.35)',
              fontSize: 22,
            }}
          >
            📷
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 600,
          }}
        >
          Sen
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '16px 20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {karsıIsim || 'Görüşme'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
            {durum === 'baglanıyor' && 'Bağlanıyor...'}
            {durum === 'aktif' && formatSure(sure)}
            {durum === 'hata' && 'Bağlantı hatası'}
          </div>
        </div>

        {durum === 'aktif' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16,185,129,0.18)',
              border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: 20,
              padding: '4px 12px',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ color: '#10B981', fontSize: 11, fontWeight: 700 }}>CANLI</span>
          </div>
        )}
      </div>

      {hata && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 20,
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 16,
            padding: '24px 32px',
            textAlign: 'center',
            maxWidth: 340,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: '#F43F5E', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {hata}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 20 }}>
            Tarayıcı izinlerini kontrol edin ve tekrar deneyin.
          </div>
          <button
            onClick={kapat}
            style={{
              background: '#F43F5E',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Kapat
          </button>
        </div>
      )}

      <VideoGorusmeKontroller
        mikrofon={mikrofon}
        kamera={kamera}
        mikToggle={mikToggle}
        kamToggle={kamToggle}
        kapat={kapat}
      />
    </div>
  );
}
