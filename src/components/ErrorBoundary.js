import React from 'react';
import { logIstemciHatasi } from '../utils/izleme';

function isChunkError(err) {
  return (
    err?.name === 'ChunkLoadError' ||
    /Loading chunk/.test(err?.message) ||
    /Unexpected token '<'/.test(err?.message) ||
    /Failed to fetch dynamically imported module/.test(err?.message) ||
    /error loading dynamically imported module/i.test(err?.message)
  );
}

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, info) {
    if (isChunkError(err)) {
      // Chunk hatası = yeni deploy sonrası eski hash. Sessizce yenile.
      // Sonsuz döngü koruması: son 30 saniyede zaten yenilendiyse durur.
      const RELOAD_KEY = 'chunk_reload_ts';
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - last > 30000) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
        return; // Reload başladı, render edilmeyecek
      }
      // 30 saniye içinde tekrar hata — gerçek sorun var, logla ama butonu göster
    }
    console.error('ElsWay Hata:', err, info);
    logIstemciHatasi({
      error: err,
      info: info?.componentStack || '',
      kaynak: 'react_error_boundary',
    });
  }

  render() {
    if (this.state.hasError)
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter,sans-serif',
            background: '#F0F9FF',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0C4A6E', marginBottom: 12 }}>
              Bir hata oluştu
            </h2>
            <p style={{ fontSize: 14, color: '#334155', marginBottom: 20 }}>
              Beklenmeyen bir sorun oluştu. Lütfen sayfayı yenileyin.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg,#0284C7,#38BDF8)',
                color: '#fff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Yenile
            </button>
          </div>
        </div>
      );
    return this.props.children;
  }
}
