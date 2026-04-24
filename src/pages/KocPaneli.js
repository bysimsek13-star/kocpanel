import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMobil, useTablet } from '../hooks/useMediaQuery';
import { LoadingState } from '../components/Shared';
import { aktiflikKaydet, oturumBitir } from '../utils/aktiflikKaydet';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Hooks
import useKocVeri from '../koc/hooks/useKocVeri';
import useOkunmamis from '../koc/hooks/useOkunmamis';

// Context
import { KocProvider } from '../context/KocContext';

// UI
import KocTopBar from '../koc/ui/KocTopBar';
import KocSolMenu from '../koc/ui/KocSolMenu';
import KocAltTabBar from '../koc/ui/KocAltTabBar';
import KocSabahEkrani from '../koc/ui/KocSabahEkrani';
import KocOgrenciListesi from '../koc/ui/KocOgrenciListesi';

// Sayfalar
import OgrenciDetay from '../koc/OgrenciDetay';
import OgrenciEkleModal from '../koc/OgrenciEkleModal';
import MesajlarSayfasi from '../koc/MesajlarSayfasi';
import HaftalikProgramSayfasi from '../koc/HaftalikProgram';
import GunlukTakipSayfasi from '../koc/GunlukTakip';
import DenemeYonetimiSayfasi from '../koc/DenemeYonetimi';
import HedefTakibiSayfasi from '../koc/HedefTakibi';
import VeliRaporlariSayfasi from '../koc/VeliRaporlari';
import GorevKutuphaneSayfasi from '../koc/GorevKutuphane';
import OnboardingSihirbazi from '../koc/OnboardingSihirbazi';

// Ağır sayfalar — lazy chunk'a ayrıldı
const SenelikProgramSayfasi = React.lazy(() => import('../koc/SenelikProgram'));
const KitapVideoKutuphane = React.lazy(() => import('../koc/KitapVideoKutuphane'));
const PlaylistYonetimi = React.lazy(() => import('../koc/PlaylistYonetimi'));
const IstatistiklerSayfasi = React.lazy(() => import('../koc/Istatistikler'));
const TopluIslemlerSayfasi = React.lazy(() => import('../koc/TopluIslemler'));
const DuyuruMerkezi = React.lazy(() => import('../components/DuyuruMerkezi'));
const GununSozu = React.lazy(() => import('../koc/GununSozu'));

const KOC_PATHS = {
  ana: '/koc',
  ogrenciler: '/koc/ogrenciler',
  haftalikprogram: '/koc/haftalik-program',
  senelikprogram: '/koc/senelik-program',
  gunluktakip: '/koc/gunluk-takip',
  denemeyonetimi: '/koc/deneme-yonetimi',
  istatistikler: '/koc/istatistikler',
  hedeftakibi: '/koc/hedef-takibi',
  topluislemler: '/koc/toplu-islemler',
  mesajlar: '/koc/mesajlar',
  veliraporlari: '/koc/veli-raporlari',
  gorevkutuphane: '/koc/gorev-kutuphane',
  kaynakkutuphane: '/koc/kaynak-kutuphane',
  playlistler: '/koc/playlistler',
  duyurular: '/koc/duyurular',
};

const GENIS = ['ogrenciler', 'denemeyonetimi', 'hedeftakibi', 'istatistikler', 'kaynakkutuphane'];

const sayfaGetir = p => {
  if (p.match(/^\/koc\/ogrenciler\/[^/]+/)) return 'ogrenci_detay';
  return Object.entries(KOC_PATHS).find(([, path]) => p === path)?.[0] || 'ana';
};
const ogrenciIdGetir = p => p.match(/^\/koc\/ogrenciler\/([^/]+)/)?.[1] || null;

export default function KocPaneli() {
  const { s } = useTheme();
  const { kullanici, rol, userData, cikisYap } = useAuth();
  const mobil = useMobil();
  const tablet = useTablet();
  const darEkran = mobil || tablet;
  const navigate = useNavigate();
  const location = useLocation();
  const [modalAcik, setModalAcik] = useState(false);
  const [onboardingGoster, setOnboardingGoster] = useState(false);

  const { ogrenciler, dashboardMap, bugunMap, yukleniyor, yenile } = useKocVeri(kullanici.uid);
  const { okunmamisMap, toplamOkunmamis } = useOkunmamis(ogrenciler);

  const aktifSayfa = useMemo(() => sayfaGetir(location.pathname), [location.pathname]);
  const seciliOgrenciId = useMemo(() => ogrenciIdGetir(location.pathname), [location.pathname]);
  const seciliOgrenci = useMemo(
    () => ogrenciler.find(o => o.id === seciliOgrenciId) || null,
    [ogrenciler, seciliOgrenciId]
  );

  const onNav = k => navigate(KOC_PATHS[k] || KOC_PATHS.ana);
  const onSec = (o, tab = 'program') => navigate(`/koc/ogrenciler/${o.id}?tab=${tab}`);

  // Aktiflik kaydı — mount'ta bir kez çalışır
  useEffect(() => {
    aktiflikKaydet(kullanici?.uid, rol);
  }, [kullanici?.uid]);

  const oturumBaslangic = useRef(Date.now());
  useEffect(() => {
    const uid = kullanici?.uid;
    if (!uid) return;
    oturumBaslangic.current = Date.now();
    const bitir = () => {
      const sure = (Date.now() - oturumBaslangic.current) / 60000;
      oturumBitir(uid, sure, rol);
      oturumBaslangic.current = Date.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') bitir();
    };
    window.addEventListener('beforeunload', bitir);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('beforeunload', bitir);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [kullanici?.uid]);

  // Onboarding — Firestore'dan kontrol et, ilk girişte göster
  useEffect(() => {
    if (!kullanici?.uid) return;
    getDoc(doc(db, 'kullanicilar', kullanici.uid)).then(snap => {
      if (!snap.exists() || !snap.data().onboardingTamamlandi) {
        setOnboardingGoster(true);
      }
    });
  }, [kullanici?.uid]);

  const onboardingTamamla = async () => {
    setOnboardingGoster(false);
    await setDoc(
      doc(db, 'kullanicilar', kullanici.uid),
      { onboardingTamamlandi: true },
      { merge: true }
    );
  };

  const renderSayfa = () => {
    if (aktifSayfa === 'ogrenci_detay' && seciliOgrenci) {
      const tab = new URLSearchParams(location.search).get('tab') || 'program';
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => navigate('/koc/ogrenciler')}
              style={{
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 10,
                padding: '8px 14px',
                cursor: 'pointer',
                color: s.text2,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ← Geri
            </button>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.text }}>{seciliOgrenci.isim}</div>
          </div>
          <OgrenciDetay
            ogrenci={seciliOgrenci}
            initialTab={tab}
            onGeri={() => navigate('/koc/ogrenciler')}
            onTabChange={t => navigate(`/koc/ogrenciler/${seciliOgrenci.id}?tab=${t}`)}
          />
        </>
      );
    }

    switch (aktifSayfa) {
      case 'ogrenciler':
        return (
          <KocOgrenciListesi
            onSec={onSec}
            onEkle={() => setModalAcik(true)}
            onGeri={() => onNav('ana')}
          />
        );
      case 'haftalikprogram':
        return <HaftalikProgramSayfasi ogrenciler={ogrenciler} onGeri={() => onNav('ana')} />;
      case 'senelikprogram':
        return <SenelikProgramSayfasi ogrenciler={ogrenciler} onGeri={() => onNav('ana')} />;
      case 'gunluktakip':
        return <GunlukTakipSayfasi ogrenciler={ogrenciler} onGeri={() => onNav('ana')} />;
      case 'denemeyonetimi':
        return <DenemeYonetimiSayfasi ogrenciler={ogrenciler} onGeri={() => onNav('ana')} />;
      case 'istatistikler':
        return <IstatistiklerSayfasi ogrenciler={ogrenciler} onGeri={() => onNav('ana')} />;
      case 'hedeftakibi':
        return <HedefTakibiSayfasi ogrenciler={ogrenciler} onGeri={() => onNav('ana')} />;
      case 'mesajlar':
        return (
          <MesajlarSayfasi
            ogrenciler={ogrenciler}
            okunmamisMap={okunmamisMap}
            onGeri={() => onNav('ana')}
          />
        );
      case 'veliraporlari':
        return <VeliRaporlariSayfasi ogrenciler={ogrenciler} onGeri={() => onNav('ana')} />;
      case 'gorevkutuphane':
        return (
          <GorevKutuphaneSayfasi
            ogrenciler={ogrenciler}
            dashboardMap={dashboardMap}
            onGeri={() => onNav('ana')}
          />
        );
      case 'topluislemler':
        return <TopluIslemlerSayfasi ogrenciler={ogrenciler} onGeri={() => onNav('ana')} />;
      case 'kaynakkutuphane':
        return <KitapVideoKutuphane kullanici={kullanici} onGeri={() => onNav('ana')} />;
      case 'playlistler':
        return <PlaylistYonetimi kullanici={kullanici} onGeri={() => onNav('ana')} />;
      case 'duyurular':
        return (
          <>
            <GununSozu ogrenciler={ogrenciler} />
            <DuyuruMerkezi title="Duyurular" />
          </>
        );
      default:
        return <KocSabahEkrani onSec={onSec} onNav={onNav} kocAdi={userData?.isim} />;
    }
  };

  return (
    <KocProvider
      ogrenciler={ogrenciler}
      dashboardMap={dashboardMap}
      bugunMap={bugunMap}
      okunmamisMap={okunmamisMap}
      yukleniyor={yukleniyor}
      yenile={yenile}
    >
      <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter, sans-serif' }}>
        <KocTopBar
          toplamOkunmamis={toplamOkunmamis}
          onMesajlar={() => onNav('mesajlar')}
          onOgrenciEkle={() => setModalAcik(true)}
          onCikis={cikisYap}
          onRehber={() => setOnboardingGoster(true)}
        />

        {onboardingGoster && (
          <OnboardingSihirbazi
            kullaniciUid={kullanici.uid}
            onTamamla={onboardingTamamla}
            onNav={onNav}
            onOgrenciEkle={() => setModalAcik(true)}
          />
        )}
        {modalAcik && <OgrenciEkleModal onKapat={() => setModalAcik(false)} onEkle={yenile} />}

        <div style={{ display: 'flex' }}>
          {!darEkran && <KocSolMenu aktif={aktifSayfa} onNav={onNav} okunmamis={toplamOkunmamis} />}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              padding: mobil ? '16px 16px 88px' : tablet ? '20px 24px 88px' : '28px 36px',
              maxWidth: darEkran ? '100%' : GENIS.includes(aktifSayfa) ? 1080 : 900,
            }}
          >
            {yukleniyor && aktifSayfa === 'ana' ? (
              <LoadingState />
            ) : (
              <React.Suspense fallback={<LoadingState />}>{renderSayfa()}</React.Suspense>
            )}
          </div>
        </div>

        {darEkran && <KocAltTabBar aktif={aktifSayfa} onNav={onNav} okunmamis={toplamOkunmamis} />}
      </div>
    </KocProvider>
  );
}
