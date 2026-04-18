import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMobil, useTablet } from '../hooks/useMediaQuery';
import ElsWayLogo from '../components/ElsWayLogo';
import TemaSecici from '../components/TemaSecici';
import { LoadingState } from '../components/Shared';
import DestekTalebiModal from '../components/DestekTalebiModal';
import { BildirimZili, BildirimPaneli } from '../components/BildirimSistemi';
import { PATHS, BASLIK, SolMenu, AltTabBar } from '../ogrenci/OgrenciNav';
import KutlamaEkrani from '../ogrenci/KutlamaEkrani';
import { useOgrenciPaneliVeri } from './OgrenciPaneliVeri';
import { OgrenciSayfaIcerigi } from './OgrenciPaneliSayfa';

const VideoGorusme = React.lazy(() => import('../components/VideoGorusme'));

const sayfaGetir = p => Object.entries(PATHS).find(([, path]) => p.startsWith(path))?.[0] || 'ana';

export default function OgrenciPaneli() {
  const { s } = useTheme();
  const { kullanici, userData, cikisYap } = useAuth();
  const mobil = useMobil();
  const tablet = useTablet();
  const darEkran = mobil || tablet;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [destekAcik, setDestekAcik] = useState(false);
  const [bildirimAcik, setBildirimAcik] = useState(false);
  const [gelenCagri, setGelenCagri] = useState(null);
  const [aktifGorusme, setAktifGorusme] = useState(null);

  const {
    yukleniyor,
    okunmamis,
    mesajlariOku,
    gununSozu,
    bugunSoruVar,
    bugunSoruOzet,
    programOran,
    ogrenciTur,
    ogrenciSinif,
    kutlamaTema,
    kutlamaGoster,
    setKutlamaGoster,
    kutlamaMesaj,
  } = useOgrenciPaneliVeri(kullanici, userData);

  const aktifSayfa = useMemo(() => sayfaGetir(location.pathname), [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/ogrenci' || location.pathname === '/ogrenci/')
      navigate(PATHS.ana, { replace: true });
  }, [location.pathname, navigate]);

  useEffect(() => {
    document.title = `${BASLIK[aktifSayfa] || 'Öğrenci'} | ElsWay`;
  }, [aktifSayfa]);

  // Bildirimden gelen ?cagri=SESSION_ID parametresini karşıla
  useEffect(() => {
    const sessionId = searchParams.get('cagri');
    if (!sessionId) return;
    setSearchParams({}, { replace: true });
    getDoc(doc(db, 'goruntulu', sessionId))
      .then(snap => {
        if (!snap.exists()) return;
        const sd = snap.data();
        if (sd.ogrenciId !== kullanici.uid) return;
        if (sd.durum === 'bekliyor') setGelenCagri({ id: snap.id, ...sd });
        else if (sd.durum === 'aktif') setAktifGorusme({ id: snap.id, ...sd });
      })
      .catch(() => {});
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const onNav = useCallback(
    sayfa => {
      navigate(PATHS[sayfa] || PATHS.ana);
      if (sayfa === 'mesajlar') mesajlariOku();
    },
    [navigate, mesajlariOku]
  );

  if (aktifGorusme) {
    return (
      <React.Suspense
        fallback={
          <div style={{ padding: 40, textAlign: 'center', color: s.text3, fontSize: 14 }}>
            Görüşme yükleniyor...
          </div>
        }
      >
        <VideoGorusme
          session={aktifGorusme}
          kullanici={kullanici}
          karsıIsim={aktifGorusme.kocIsim || 'Koçun'}
          onKapat={() => setAktifGorusme(null)}
        />
      </React.Suspense>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter, sans-serif' }}>
      {kutlamaGoster && (
        <KutlamaEkrani
          tema={kutlamaTema}
          mesaj={kutlamaMesaj}
          onKapat={() => setKutlamaGoster(false)}
        />
      )}

      {/* Gelen görüntülü ders daveti */}
      {gelenCagri && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderRadius: 24,
              padding: '32px 28px',
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
              boxShadow: s.shadow,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #5B4FE8, #818CF8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                boxShadow: '0 0 0 12px rgba(91,79,232,0.15)',
                animation: 'ringPulse 1.4s ease-in-out infinite',
              }}
            >
              📹
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.text, marginBottom: 6 }}>
              Görüntülü Ders Daveti
            </div>
            <div style={{ fontSize: 14, color: s.text2, marginBottom: 28 }}>
              <strong>{gelenCagri.kocIsim || 'Koçun'}</strong> sizi görüntülü derse davet ediyor.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'goruntulu', gelenCagri.id), { durum: 'reddedildi' });
                  } catch (e) {
                    console.error(e);
                  }
                  setGelenCagri(null);
                }}
                style={{
                  flex: 1,
                  background: s.surface2,
                  border: `1px solid ${s.border}`,
                  borderRadius: 12,
                  padding: '12px',
                  color: s.text2,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Reddet
              </button>
              <button
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'goruntulu', gelenCagri.id), { durum: 'aktif' });
                  } catch (e) {
                    console.error(e);
                  }
                  setAktifGorusme(gelenCagri);
                  setGelenCagri(null);
                }}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                }}
              >
                Katıl 📹
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Üst Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: s.topBarBg,
          borderBottom: `1px solid ${s.topBarBorder}`,
          padding: mobil ? '10px 14px' : '10px 20px',
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ElsWayLogo size="bar" variant="onDark" />
          <span
            style={{ fontSize: 13, color: s.topBarMuted, fontWeight: 600, letterSpacing: '0.02em' }}
          >
            Öğrenci
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TemaSecici variant="bar" onDarkBar />
          <BildirimZili onClick={() => setBildirimAcik(v => !v)} />
          {okunmamis > 0 && (
            <div
              onClick={() => onNav('mesajlar')}
              style={{
                background: s.tehlikaSoft,
                color: s.tehlika,
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 20,
                padding: '4px 10px',
                cursor: 'pointer',
                border: `1px solid ${s.topBarBorder}`,
              }}
            >
              {okunmamis} mesaj
            </div>
          )}
          <button
            onClick={cikisYap}
            style={{
              background: 'none',
              border: 'none',
              color: s.topBarMuted,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Çıkış
          </button>
        </div>
      </div>
      <BildirimPaneli acik={bildirimAcik} onKapat={() => setBildirimAcik(false)} />

      <div style={{ display: 'flex' }}>
        {!darEkran && (
          <SolMenu
            aktif={aktifSayfa}
            onNav={onNav}
            okunmamis={okunmamis}
            userData={userData}
            ogrenciTur={ogrenciTur}
            s={s}
            programOran={programOran}
          />
        )}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: mobil ? '16px 16px 88px' : tablet ? '20px 24px 88px' : '28px 36px',
            maxWidth: darEkran ? '100%' : 860,
          }}
        >
          <React.Suspense fallback={<LoadingState />}>
            <OgrenciSayfaIcerigi
              aktifSayfa={aktifSayfa}
              yukleniyor={yukleniyor}
              setDestekAcik={setDestekAcik}
              ogrenciTur={ogrenciTur}
              ogrenciSinif={ogrenciSinif}
              gununSozu={gununSozu}
              bugunSoruVar={bugunSoruVar}
              bugunSoruOzet={bugunSoruOzet}
              okunmamis={okunmamis}
              programOran={programOran}
              userData={userData}
              kullanici={kullanici}
              onNav={onNav}
              s={s}
              mobil={mobil}
            />
          </React.Suspense>
        </div>
      </div>

      {darEkran && <AltTabBar aktif={aktifSayfa} onNav={onNav} okunmamis={okunmamis} s={s} />}
      <DestekTalebiModal
        acik={destekAcik}
        onClose={() => setDestekAcik(false)}
        varsayilanRol="ogrenci"
      />
    </div>
  );
}
