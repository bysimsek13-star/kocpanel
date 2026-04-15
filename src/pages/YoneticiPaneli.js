import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useMobil } from '../hooks/useMediaQuery';
import { renkler } from '../data/konular';
import { auditLog, AuditTip } from '../utils/auditLog';
import { LoadingState, ConfirmDialog, ElsWayLogo } from '../components/Shared';
import TemaSecici from '../components/TemaSecici';
import { BildirimZili, BildirimPaneli } from '../components/BildirimSistemi';
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
import YoneticiKoclar from '../admin/YoneticiKoclar';
import YoneticiOgrenciler from '../admin/YoneticiOgrenciler';
import YoneticiIstatistik from '../admin/YoneticiIstatistik';
import { getCallable, hataMesajiVer } from '../admin/adminHelpers';
import {
  ADMIN_MENU_PATHS,
  adminSayfaAnahtariGetir,
  MENU,
  ALT_TABS,
  UnauthorizedScreen,
} from './yoneticiPaneliSabitleri';
import useYoneticiVeri from './useYoneticiVeri';

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

  const menuSatir = (item, kapat) => {
    const on = aktifSayfa === item.key;
    return (
      <div
        key={item.key}
        onClick={() => {
          sayfayaGit(item.key);
          kapat?.();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 12px',
          borderRadius: 8,
          cursor: 'pointer',
          marginBottom: 1,
          position: 'relative',
          background: on ? s.accentSoft : 'transparent',
          color: on ? s.accent : s.text2,
          fontWeight: on ? 600 : 500,
          fontSize: 13,
        }}
      >
        {on && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '18%',
              bottom: '18%',
              width: 2,
              background: s.accent,
              borderRadius: '0 2px 2px 0',
            }}
          />
        )}
        <span style={{ flex: 1, paddingLeft: on ? 4 : 0 }}>{item.label}</span>
      </div>
    );
  };

  const sayfaBasligi = aktifSayfa !== 'ana' ? MENU.find(m => m.key === aktifSayfa)?.label : '';

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter, sans-serif' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: s.topBarBg,
          borderBottom: `1px solid ${s.topBarBorder}`,
          padding: mobil ? '10px 14px' : '10px 24px',
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ElsWayLogo size="bar" variant="onDark" />
          <span style={{ fontSize: 13, color: s.topBarMuted, fontWeight: 600 }}>Yönetici</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TemaSecici variant="bar" onDarkBar />
          <BildirimZili onClick={() => setBildirimAcik(v => !v)} />
          {!mobil && kullanici?.email && (
            <span
              style={{
                fontSize: 12,
                color: s.topBarMuted,
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {kullanici.email}
            </span>
          )}
          <button
            onClick={cikisYap}
            style={{
              background: s.tehlikaSoft,
              border: `1px solid ${s.border}`,
              color: s.tehlika,
              padding: mobil ? '6px 10px' : '7px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Çıkış
          </button>
        </div>
      </div>
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
          <div
            style={{
              width: 220,
              background: s.surface,
              borderRight: `1px solid ${s.border}`,
              padding: '14px 10px 24px',
              position: 'sticky',
              top: 60,
              height: 'calc(100vh - 60px)',
              overflowY: 'auto',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: '6px 12px 14px',
                borderBottom: `1px solid ${s.border}`,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>
                {kullanici?.email?.split('@')[0] || 'Yönetici'}
              </div>
              <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>ElsWay Yönetici</div>
            </div>
            {[
              { baslik: 'Yönetim', items: ['ana', 'koclar', 'ogrenciler', 'yasamdongusu'] },
              { baslik: 'Analiz', items: ['performans', 'auditlog'] },
              { baslik: 'Sistem', items: ['canli', 'sistem', 'mufredat'] },
            ].map(grup => (
              <div key={grup.baslik} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: s.text3,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 12px 6px',
                  }}
                >
                  {grup.baslik}
                </div>
                {MENU.filter(m => grup.items.includes(m.key)).map(item => menuSatir(item))}
              </div>
            ))}
          </div>
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
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: s.surface,
            borderTop: `1px solid ${s.border}`,
            display: 'flex',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {ALT_TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => sayfayaGit(tab.key)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                padding: '10px 4px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: aktifSayfa === tab.key ? 650 : 450,
                  color: aktifSayfa === tab.key ? s.accent : s.text3,
                }}
              >
                {tab.label}
              </div>
              {aktifSayfa === tab.key && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 22,
                    height: 2,
                    borderRadius: 99,
                    background: s.accent,
                  }}
                />
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMenuAcik(true)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '10px 4px 8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 450, color: s.text3 }}>Diğer</div>
          </button>
        </div>
      )}

      {mobil && menuAcik && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div
            onClick={() => setMenuAcik(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
          />
          <div
            style={{
              position: 'relative',
              marginLeft: 'auto',
              width: 280,
              background: s.surface,
              borderLeft: `1px solid ${s.border}`,
              padding: '20px 12px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 12px 16px',
                marginBottom: 4,
                borderBottom: `1px solid ${s.border}`,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>Tüm Bölümler</div>
              <button
                onClick={() => setMenuAcik(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  color: s.text2,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            {MENU.map(item => menuSatir(item, () => setMenuAcik(false)))}
          </div>
        </div>
      )}
    </div>
  );
}
