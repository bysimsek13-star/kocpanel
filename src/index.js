import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { globalHataDinleyicileriniKur, logPerformansMetriği } from './utils/izleme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Global hata yakalayıcıları — window.onerror + unhandledrejection → Firestore
globalHataDinleyicileriniKur();

// Web Vitals (LCP, CLS, FID, FCP, TTFB) → Firestore
reportWebVitals(metric => logPerformansMetriği(metric));

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        // Arka planda güncelleme kontrolü (her 60 dakikada bir)
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch(() => {});

    // SW'den gelen mesajları dinle
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.tip === 'SW_GUNCELLENDI') {
        // Sessiz güncelleme flag'i koy — bir sonraki navigasyonda reload edilecek
        window.__swGuncellendi = true;
      }
    });
  });
}
