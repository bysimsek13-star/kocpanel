import React, { lazy, Suspense } from 'react';
import { LoadingState } from '../components/Shared';
import YoneticiKoclar from '../admin/YoneticiKoclar';
import YoneticiOgrenciler from '../admin/YoneticiOgrenciler';
import YoneticiIstatistik from '../admin/YoneticiIstatistik';

// Sık kullanılmayan ağır sayfalar — ilk yüklemede bundle'a girmez
const KocPerformansPaneli = lazy(() => import('../admin/KocPerformansPaneli'));
const SistemDurumuPaneli = lazy(() => import('../admin/SistemDurumuPaneli'));
const CanliOperasyonPaneli = lazy(() => import('../admin/CanliOperasyonPaneli'));
const AuditLogSayfasi = lazy(() => import('../admin/AuditLogSayfasi'));
const YasamDongusuSayfasi = lazy(() => import('../admin/YasamDongusuSayfasi'));
const MufredatYonetimSayfasi = lazy(() => import('../admin/MufredatYonetimSayfasi'));
const TurTopluSync = lazy(() => import('../admin/TurTopluSync'));
const LeadTakipSayfasi = lazy(() => import('../admin/crm/LeadTakipSayfasi'));
const MaliYonetimSayfasi = lazy(() => import('../admin/mali/MaliYonetimSayfasi'));
const KodYonetimi = lazy(() => import('../admin/KodYonetimi'));
const YeniKayitlar = lazy(() => import('../admin/YeniKayitlar'));

export default function YoneticiSayfaRouter({
  aktifSayfa,
  ilkYukleme,
  s,
  mobil,
  kullanici,
  koclar,
  ogrenciler,
  setOgrenciler,
  filtreliOgrenciler,
  dahaFazlaVar,
  ogrenciArama,
  ogrenciAramaGirdi,
  setOgrenciAramaGirdi,
  dahaFazlaYukle,
  ogrenciYukleniyor,
  kocMap,
  kocOgrenciSayisi,
  dashboard,
  setAtamaModal,
  setDuzenleModal,
  setSeciliOgrenci,
  setOgrenciEkleAcik,
  setKocEkleAcik,
  setSilOnay,
  islemYukleniyor,
  sayfayaGit,
  renkler,
}) {
  if (ilkYukleme && aktifSayfa === 'ana')
    return <LoadingState mesaj="Veriler senkronize ediliyor..." />;

  let icerik;
  switch (aktifSayfa) {
    case 'koclar':
      icerik = (
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
      break;
    case 'ogrenciler':
      icerik = (
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
      break;
    case 'yasamdongusu':
      icerik = <YasamDongusuSayfasi s={s} mobil={mobil} kullanici={kullanici} />;
      break;
    case 'auditlog':
      icerik = <AuditLogSayfasi s={s} mobil={mobil} />;
      break;
    case 'performans':
      icerik = <KocPerformansPaneli koclar={koclar} ogrenciler={ogrenciler} />;
      break;
    case 'canli':
      icerik = <CanliOperasyonPaneli />;
      break;
    case 'sistem':
      icerik = <SistemDurumuPaneli />;
      break;
    case 'mufredat':
      icerik = <MufredatYonetimSayfasi s={s} mobil={mobil} />;
      break;
    case 'leads':
      icerik = (
        <LeadTakipSayfasi
          s={s}
          mobil={mobil}
          koclar={koclar}
          ogrenciEkleAcik_Ac={() => setOgrenciEkleAcik(true)}
        />
      );
      break;
    case 'mali':
      icerik = <MaliYonetimSayfasi ogrenciler={ogrenciler} s={s} mobil={mobil} />;
      break;
    case 'tursync':
      icerik = (
        <TurTopluSync ogrenciler={ogrenciler} setOgrenciler={setOgrenciler} s={s} mobil={mobil} />
      );
      break;
    case 'kodlar':
      icerik = <KodYonetimi s={s} mobil={mobil} />;
      break;
    case 'yeniKayitlar':
      icerik = <YeniKayitlar s={s} mobil={mobil} koclar={koclar} />;
      break;
    default:
      icerik = (
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

  return <Suspense fallback={<LoadingState />}>{icerik}</Suspense>;
}
