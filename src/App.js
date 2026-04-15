import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import ElsWayLogo from './components/ElsWayLogo';

// Lazy loading - Performans için sayfaları sadece ihtiyaç duyulduğunda yükler
const GirisEkrani = lazy(() => import('./pages/GirisEkrani'));
const KocPaneli = lazy(() => import('./pages/KocPaneli'));
const OgrenciPaneli = lazy(() => import('./pages/OgrenciPaneli'));
const VeliPaneli = lazy(() => import('./pages/VeliPaneli'));
const YoneticiPaneli = lazy(() => import('./pages/YoneticiPaneli'));

function YuklemeEkrani() {
  const { s } = useTheme();
  return (
    <div
      style={{
        minHeight: '100vh',
        background: s.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter,sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
          <span style={{ color: s.brandEls }}>Els</span>
          <span style={{ color: s.brandWayOnLight }}>Way</span>
        </div>
        <div style={{ color: s.text3, fontSize: 14, letterSpacing: 1 }}>Yükleniyor...</div>
      </div>
    </div>
  );
}

function EngelliEkran({ tip }) {
  const { s } = useTheme();
  const { cikisYap } = useAuth();
  const pasif = tip === 'pasif';

  useEffect(() => {
    document.title = pasif ? 'Hesap Pasif | ElsWay' : 'Erişim Engellendi | ElsWay';
  }, [pasif]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: s.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter,sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 420, padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>{pasif ? '⏸️' : '🚫'}</div>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
          <ElsWayLogo size="card" variant="onLight" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: s.text, marginBottom: 12 }}>
          {pasif ? 'Hesabınız Pasif Durumda' : 'Erişim Yetkiniz Yok'}
        </div>
        <div style={{ fontSize: 14, color: s.text2, lineHeight: 1.7, marginBottom: 28 }}>
          {pasif
            ? 'Hesabınız yöneticiniz tarafından pasife alınmış. Aktifleştirmek için lütfen iletişime geçin.'
            : 'Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.'}
        </div>
        <button
          onClick={cikisYap}
          style={{
            background: s.accentGrad,
            color: '#fff',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: `0 4px 12px rgba(${s.glowRgb}, 0.35)`,
          }}
        >
          Güvenli Çıkış
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { kullanici, rol, yukleniyor } = useAuth();
  const location = useLocation();

  // SW güncellemesi — bir sonraki navigasyonda sessizce yenile
  useEffect(() => {
    if (window.__swGuncellendi) {
      window.__swGuncellendi = false;
      window.location.reload();
    }
  }, [location.pathname]);

  // Dinamik Başlık Yönetimi
  useEffect(() => {
    if (!kullanici) {
      document.title = 'Giriş Yap | ElsWay';
    } else if (rol === 'ogrenci') {
      /* Başlık OgrenciPaneli içinde aktif sekmeye göre ayarlanır */
    } else {
      const basliklar = {
        admin: 'Yönetici Paneli | ElsWay',
        koc: 'Koç Paneli | ElsWay',
        veli: 'Veli Paneli | ElsWay',
        pasif: 'Hesap Pasif | ElsWay',
      };
      document.title = basliklar[rol] || 'ElsWay';
    }
  }, [kullanici, rol]);

  if (yukleniyor) return <YuklemeEkrani />;

  if (!kullanici) {
    return (
      <Suspense fallback={<YuklemeEkrani />}>
        <Routes>
          <Route path="/giris" element={<GirisEkrani />} />
          <Route path="*" element={<Navigate to="/giris" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Yetki ve Durum Kontrolleri
  if (rol === 'unauthorized') return <EngelliEkran tip="unauthorized" />;
  if (rol === 'pasif') return <EngelliEkran tip="pasif" />;

  const rolMap = {
    admin: { basePath: '/admin', component: YoneticiPaneli },
    ogrenci: { basePath: '/ogrenci', component: OgrenciPaneli },
    veli: { basePath: '/veli', component: VeliPaneli },
    koc: { basePath: '/koc', component: KocPaneli },
  };
  const hedef = rolMap[rol];
  if (!hedef) return <EngelliEkran tip="unauthorized" />;

  if (!location.pathname.startsWith(hedef.basePath)) {
    return <Navigate to={hedef.basePath} replace />;
  }

  const PanelComponent = hedef.component;

  return (
    <Suspense fallback={<YuklemeEkrani />}>
      <Routes>
        <Route path={`${hedef.basePath}/*`} element={<PanelComponent />} />
        <Route path="*" element={<Navigate to={hedef.basePath} replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
