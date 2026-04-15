import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMobil } from '../hooks/useMediaQuery';
import ElsWayLogo from '../components/ElsWayLogo';
import TemaSecici from '../components/TemaSecici';
import { EmptyState } from '../components/Shared';
import DuyuruMerkezi from '../components/DuyuruMerkezi';
import VeliMesajlar from './VeliMesajlar';
import VeliProgram from './VeliProgram';
import DenemeListesi from '../ogrenci/DenemeListesi';
import { BildirimZili, BildirimPaneli } from '../components/BildirimSistemi';
import { useVeliPaneliVeri } from '../veli/useVeliPaneliVeri';
import { VeliAnaSayfa } from '../veli/VeliAnaSayfa';
import { PATHS, sayfaGetir, VeliSolMenu, VeliAltTabBar } from '../veli/VeliNav';

export default function VeliPaneli() {
  const { s } = useTheme();
  const { kullanici, userData, cikisYap } = useAuth();
  const mobil = useMobil();
  const navigate = useNavigate();
  const location = useLocation();

  const [aktif, setAktif] = useState(sayfaGetir(location.pathname));
  const [bildirimAcik, setBildirimAcik] = useState(false);

  const {
    ogrenciId,
    ogrenci,
    denemeler,
    calisma,
    veliRaporlari,
    okunmamisMesaj,
    setOkunmamisMesaj,
    yukleniyor,
  } = useVeliPaneliVeri(kullanici, userData);

  useEffect(() => {
    setAktif(sayfaGetir(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/veli' || location.pathname === '/veli/') {
      navigate(PATHS.ana, { replace: true });
    }
  }, [location.pathname, navigate]);

  const git = sayfa => {
    if (sayfa === 'mesajlar') setOkunmamisMesaj(0);
    navigate(PATHS[sayfa] || PATHS.ana);
  };

  const GeriTusu = ({ baslik }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <button
        onClick={() => git('ana')}
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
      <div style={{ fontSize: 18, fontWeight: 700, color: s.text }}>{baslik}</div>
    </div>
  );

  const renderSayfa = () => {
    if (aktif === 'denemeler')
      return (
        <>
          <GeriTusu baslik="Denemeler" />
          {ogrenciId ? (
            <DenemeListesi
              ogrenciId={ogrenciId}
              readOnly
              ogrenciTur={ogrenci?.tur}
              ogrenciSinif={ogrenci?.sinif}
            />
          ) : (
            <EmptyState mesaj="Öğrenci bulunamadı" icon="📝" />
          )}
        </>
      );
    if (aktif === 'program')
      return ogrenciId ? (
        <VeliProgram ogrenciId={ogrenciId} onGeri={() => git('ana')} />
      ) : (
        <EmptyState mesaj="Öğrenci bulunamadı" icon="📅" />
      );
    if (aktif === 'mesajlar')
      return (
        <>
          <GeriTusu baslik="Koç Mesajları" />
          <VeliMesajlar ogrenciId={ogrenciId} onGeri={() => git('ana')} />
        </>
      );
    if (aktif === 'duyurular')
      return (
        <>
          <GeriTusu baslik="Duyurular" />
          <DuyuruMerkezi title="" />
        </>
      );
    return (
      <VeliAnaSayfa
        ogrenci={ogrenci}
        denemeler={denemeler}
        calisma={calisma}
        veliRaporlari={veliRaporlari}
        okunmamisMesaj={okunmamisMesaj}
        yukleniyor={yukleniyor}
        ogrenciId={ogrenciId}
        userData={userData}
        git={git}
        s={s}
        mobil={mobil}
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter, sans-serif' }}>
      {/* Üst çubuk */}
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
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ElsWayLogo size="bar" variant="onDark" />
          <span style={{ fontSize: 13, color: s.topBarMuted, fontWeight: 600 }}>Veli</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TemaSecici variant="bar" onDarkBar />
          <BildirimZili onClick={() => setBildirimAcik(v => !v)} />
          {okunmamisMesaj > 0 && (
            <div
              onClick={() => git('mesajlar')}
              style={{
                background: 'rgba(244,63,94,.12)',
                color: '#F43F5E',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 20,
                padding: '4px 10px',
                cursor: 'pointer',
                border: `1px solid ${s.topBarBorder}`,
              }}
            >
              {okunmamisMesaj} mesaj
            </div>
          )}
          <button
            onClick={cikisYap}
            style={{
              background: 'none',
              border: 'none',
              color: s.topBarMuted,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Çıkış
          </button>
        </div>
      </div>
      <BildirimPaneli acik={bildirimAcik} onKapat={() => setBildirimAcik(false)} />

      <div style={{ display: 'flex' }}>
        {!mobil && (
          <VeliSolMenu
            aktif={aktif}
            git={git}
            okunmamisMesaj={okunmamisMesaj}
            s={s}
            ogrenci={ogrenci}
            userData={userData}
          />
        )}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: mobil ? '16px 16px 88px' : '28px 32px',
            maxWidth: mobil ? '100%' : 860,
          }}
        >
          {renderSayfa()}
        </div>
      </div>

      {mobil && <VeliAltTabBar aktif={aktif} git={git} okunmamisMesaj={okunmamisMesaj} s={s} />}
    </div>
  );
}
