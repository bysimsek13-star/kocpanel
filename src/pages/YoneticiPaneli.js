import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useMobil } from '../hooks/useMediaQuery';
import { renkler } from '../data/konular';
import { auditLog, AuditTip } from '../utils/auditLog';
import { LoadingState, ConfirmDialog } from '../components/Shared';
import { BildirimPaneli } from '../components/BildirimSistemi';
import OgrenciDetay from '../koc/OgrenciDetay';
import KocPerformansPaneli from '../admin/KocPerformansPaneli';
import SistemDurumuPaneli from '../admin/SistemDurumuPaneli';
import CanliOperasyonPaneli from '../admin/CanliOperasyonPaneli';
import AuditLogSayfasi from '../admin/AuditLogSayfasi';
import YasamDongusuSayfasi from '../admin/YasamDongusuSayfasi';
import AdminOgrenciEkleModal from '../admin/AdminOgrenciEkleModal';
import KocEkleModal from '../admin/KocEkleModal';
import KocAtamaModal from '../admin/KocAtamaModal';
import OgrenciDuzenleModal from '../admin/OgrenciDuzenleModal';
import MufredatYonetimSayfasi from '../admin/MufredatYonetimSayfasi';
import TurTopluSync from '../admin/TurTopluSync';
import YoneticiKoclar from '../admin/YoneticiKoclar';
import YoneticiOgrenciler from '../admin/YoneticiOgrenciler';
import YoneticiIstatistik from '../admin/YoneticiIstatistik';
import { getCallable, hataMesajiVer } from '../admin/adminHelpers';
import {
  ADMIN_MENU_PATHS,
  adminSayfaAnahtariGetir,
  MENU,
  UnauthorizedScreen,
} from './yoneticiPaneliSabitleri';
import useYoneticiVeri from './useYoneticiVeri';
import AdminTopBar from './AdminTopBar';
import AdminSolMenu from './AdminSolMenu';
import AdminMobilNav from './AdminMobilNav';

export { ADMIN_MENU_PATHS, adminSayfaAnahtariGetir };

export default function YoneticiPaneli() {
  const { s } = useTheme();
  const { kullanici, isAdmin, cikisYap } = useAuth();
  const toast = useToast();
  const mobil = useMobil();
  const navigate = useNavigate();
  const location = useLocation();

  const [aktifSayfa, setAktifSayfa] = useState(adminSayfaAnahtariGetir(location.pathname));
  const [bildirimAcik, setBildirimAcik] = useState(false);
  const [menuAcik, setMenuAcik] = useState(false);
  const [islemYukleniyor, setIslemYukleniyor] = useState(false);
  const [kocEkleAcik, setKocEkleAcik] = useState(false);
  const [ogrenciEkleAcik, setOgrenciEkleAcik] = useState(false);
  const [atamaModal, setAtamaModal] = useState(null);
  const [duzenleModal, setDuzenleModal] = useState(null);
  const [silOnay, setSilOnay] = useState(null);
  const [seciliOgrenci, setSeciliOgrenci] = useState(null);
  const [ogrenciAramaGirdi, setOgrenciAramaGirdi] = useState('');
  const [ogrenciArama, setOgrenciArama] = useState('');

  const {
    koclar,
    ogrenciler,
    setOgrenciler,
    ilkYukleme,
    ogrenciYukleniyor,
    dahaFazlaVar,
    istatistikler,
    kocBazliSayilar,
    verileriGetir,
    dahaFazlaYukle,
  } = useYoneticiVeri(isAdmin);

  useEffect(() => {
    setAktifSayfa(adminSayfaAnahtariGetir(location.pathname));
  }, [location.pathname]);
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/')
      navigate(ADMIN_MENU_PATHS.ana, { replace: true });
  }, [location.pathname, navigate]);
  useEffect(() => {
    const t = setTimeout(() => setOgrenciArama(ogrenciAramaGirdi.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [ogrenciAramaGirdi]);

  const sayfayaGit = useCallback(
    sayfa => {
      navigate(ADMIN_MENU_PATHS[sayfa] || ADMIN_MENU_PATHS.ana);
    },
    [navigate]
  );

  const ogrenciSayisiByKocId = useMemo(
    () =>
      ogrenciler.reduce((acc, o) => {
        if (o.kocId) acc[o.kocId] = (acc[o.kocId] || 0) + 1;
        return acc;
      }, {}),
    [ogrenciler]
  );
  const kocOgrenciSayisi = useCallback(
    kocId => kocBazliSayilar[kocId] ?? ogrenciSayisiByKocId[kocId] ?? 0,
    [kocBazliSayilar, ogrenciSayisiByKocId]
  );
  const kocMap = useMemo(() => Object.fromEntries(koclar.map(k => [k.id, k])), [koclar]);
  const filtreliOgrenciler = useMemo(
    () =>
      !ogrenciArama
        ? ogrenciler
        : ogrenciler.filter(o =>
            [o.isim, o.email, o.veliEmail, o.tur, kocMap[o.kocId]?.isim, kocMap[o.kocId]?.email]
              .filter(Boolean)
              .some(a => String(a).toLowerCase().includes(ogrenciArama))
          ),
    [ogrenciler, ogrenciArama, kocMap]
  );
  const dashboard = useMemo(
    () => ({
      kocSayisi: koclar.length,
      ogrenciSayisi: istatistikler.toplamOgrenci,
      atasizOgrenci: istatistikler.atasizOgrenci,
      aktifOgrenci: istatistikler.aktifOgrenci,
    }),
    [koclar, istatistikler]
  );

  const kocSil = async () => {
    if (!silOnay) return;
    setIslemYukleniyor(true);
    try {
      await getCallable('kocSil')({ kocUid: silOnay.id });
      await auditLog({
        kim: kullanici?.uid,
        kimIsim: 'Admin',
        ne: AuditTip.KOC_SIL,
        kimi: silOnay.id,
        kimiIsim: silOnay.isim || silOnay.email,
        detay: { ogrenciSayisi: ogrenciSayisiByKocId[silOnay.id] || 0 },
      }).catch(() => {});
      toast('Koç güvenli şekilde sistemden kaldırıldı.');
      setSilOnay(null);
      await verileriGetir({ sessiz: true });
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
    } finally {
      setIslemYukleniyor(false);
    }
  };

  if (!ilkYukleme && !isAdmin) return <UnauthorizedScreen s={s} onCikis={cikisYap} />;
  if (seciliOgrenci)
    return (
      <OgrenciDetay
        ogrenci={seciliOgrenci}
        onGeri={() => {
          setSeciliOgrenci(null);
          verileriGetir({ sessiz: true });
        }}
      />
    );

  const sayfaIcerigi = () => {
    if (ilkYukleme && aktifSayfa === 'ana')
      return <LoadingState mesaj="Veriler senkronize ediliyor..." />;
    switch (aktifSayfa) {
      case 'koclar':
        return (
          <YoneticiKoclar
            koclar={koclar}
            kocOgrenciSayisi={kocOgrenciSayisi}
            setKocEkleAcik={setKocEkleAcik}
            setSilOnay={setSilOnay}
            islemYukleniyor={islemYukleniyor}
            s={s}
            mobil={mobil}
          />
        );
      case 'ogrenciler':
        return (
          <YoneticiOgrenciler
            filtreliOgrenciler={filtreliOgrenciler}
            dahaFazlaVar={dahaFazlaVar}
            ogrenciArama={ogrenciArama}
            ogrenciAramaGirdi={ogrenciAramaGirdi}
            setOgrenciAramaGirdi={setOgrenciAramaGirdi}
            dahaFazlaYukle={dahaFazlaYukle}
            ogrenciYukleniyor={ogrenciYukleniyor}
            kocMap={kocMap}
            setAtamaModal={setAtamaModal}
            setDuzenleModal={setDuzenleModal}
            setSeciliOgrenci={setSeciliOgrenci}
            setOgrenciEkleAcik={setOgrenciEkleAcik}
            islemYukleniyor={islemYukleniyor}
            s={s}
            mobil={mobil}
            renkler={renkler}
          />
        );
      case 'yasamdongusu':
        return <YasamDongusuSayfasi s={s} mobil={mobil} kullanici={kullanici} />;
      case 'auditlog':
        return <AuditLogSayfasi s={s} mobil={mobil} />;
      case 'performans':
        return <KocPerformansPaneli koclar={koclar} ogrenciler={ogrenciler} />;
      case 'canli':
        return <CanliOperasyonPaneli />;
      case 'sistem':
        return <SistemDurumuPaneli />;
      case 'mufredat':
        return <MufredatYonetimSayfasi s={s} mobil={mobil} />;
      case 'tursync':
        return (
          <TurTopluSync ogrenciler={ogrenciler} setOgrenciler={setOgrenciler} s={s} mobil={mobil} />
        );
      default:
        return (
          <YoneticiIstatistik
            koclar={koclar}
            dashboard={dashboard}
            kocOgrenciSayisi={kocOgrenciSayisi}
            sayfayaGit={sayfayaGit}
            setOgrenciEkleAcik={setOgrenciEkleAcik}
            setKocEkleAcik={setKocEkleAcik}
            islemYukleniyor={islemYukleniyor}
            s={s}
            mobil={mobil}
            renkler={renkler}
          />
        );
    }
  };

  const sayfaBasligi = aktifSayfa !== 'ana' ? MENU.find(m => m.key === aktifSayfa)?.label : '';

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter, sans-serif' }}>
      <AdminTopBar
        kullanici={kullanici}
        mobil={mobil}
        s={s}
        onBildirimToggle={() => setBildirimAcik(v => !v)}
        onCikis={cikisYap}
      />
      <BildirimPaneli acik={bildirimAcik} onKapat={() => setBildirimAcik(false)} />

      {kocEkleAcik && <KocEkleModal onKapat={() => setKocEkleAcik(false)} onEkle={verileriGetir} />}
      {ogrenciEkleAcik && (
        <AdminOgrenciEkleModal
          koclar={koclar}
          onKapat={() => setOgrenciEkleAcik(false)}
          onEkle={verileriGetir}
        />
      )}
      {atamaModal && (
        <KocAtamaModal
          ogrenci={atamaModal}
          koclar={koclar}
          onKapat={() => setAtamaModal(null)}
          onAta={verileriGetir}
          kullanici={kullanici}
        />
      )}
      {duzenleModal && (
        <OgrenciDuzenleModal
          ogrenci={duzenleModal}
          onKapat={() => setDuzenleModal(null)}
          onKaydet={guncellenen =>
            setOgrenciler(prev => prev.map(o => (o.id === guncellenen.id ? guncellenen : o)))
          }
        />
      )}
      {silOnay && (
        <ConfirmDialog
          baslik="Koçu Sistemden Kaldır"
          mesaj={`${silOnay.isim || silOnay.email} kaldırıldığında koç hesabı pasifleşecek veya silinecek, bağlı öğrenciler koçsuz kalabilir. Emin misiniz?`}
          onEvet={kocSil}
          onHayir={() => !islemYukleniyor && setSilOnay(null)}
        />
      )}

      <div style={{ display: 'flex' }}>
        {!mobil && (
          <AdminSolMenu
            aktifSayfa={aktifSayfa}
            sayfayaGit={sayfayaGit}
            kullanici={kullanici}
            s={s}
          />
        )}
        <div style={{ flex: 1, minWidth: 0, paddingBottom: mobil ? 72 : 0 }}>
          {aktifSayfa !== 'ana' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                padding: mobil ? '16px 16px 0' : '28px 28px 0',
              }}
            >
              <button
                onClick={() => sayfayaGit('ana')}
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
              <div style={{ fontSize: 18, fontWeight: 700, color: s.text }}>{sayfaBasligi}</div>
            </div>
          )}
          {sayfaIcerigi()}
        </div>
      </div>

      {mobil && (
        <AdminMobilNav
          aktifSayfa={aktifSayfa}
          sayfayaGit={sayfayaGit}
          menuAcik={menuAcik}
          setMenuAcik={setMenuAcik}
          s={s}
        />
      )}
    </div>
  );
}
