import React from 'react';
import { Card, LoadingState, Btn } from '../components/Shared';
import Mesajlar from '../ogrenci/Mesajlar';
import { RutinGirisFormu } from '../koc/GunlukTakip';
import GunlukSoruFormu from '../ogrenci/GunlukSoruFormu';
import { ogrenciBaglaminiCoz } from '../utils/ogrenciBaglam';
import { DaireselOran, KpiSerit, KisayolGrid, KocMesajiKart } from '../ogrenci/AnaSayfaKartlari';
import BugunProgramKart from '../ogrenci/BugunProgramKart';
import GunlukRutinKart from '../ogrenci/GunlukRutinKart';
import GeriSayimKart from '../ogrenci/GeriSayimKart';

const DenemeListesi = React.lazy(() => import('../ogrenci/DenemeListesi'));
const MufredatGoruntule = React.lazy(() => import('../ogrenci/MufredatGoruntule'));
const HaftalikProgramSayfasi = React.lazy(() => import('../koc/HaftalikProgram'));
const DuyuruMerkezi = React.lazy(() => import('../components/DuyuruMerkezi'));

const YKS_TARIH = new Date('2026-06-20');
const LGS_TARIH = new Date('2026-06-13');

function kalanGunHesapla(hedef) {
  const simdi = new Date();
  const bugunYerel = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
  const hedefYerel = new Date(hedef.getFullYear(), hedef.getMonth(), hedef.getDate());
  return Math.max(0, Math.round((hedefYerel - bugunYerel) / 86400000));
}

function GeriTusu({ baslik, onNav, s }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <button
        onClick={() => onNav('ana')}
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
}

export function OgrenciAnaSayfa({
  ogrenciTur,
  ogrenciSinif,
  gununSozu,
  bugunSoruVar,
  okunmamis,
  programOran,
  userData,
  kullanici,
  onNav,
  s,
  mobil,
}) {
  const saat = new Date().getHours();
  const selam = saat < 12 ? 'Günaydın' : saat < 18 ? 'İyi günler' : 'İyi akşamlar';

  const baglam = ogrenciBaglaminiCoz({
    tur: ogrenciTur || userData?.tur,
    sinif: ogrenciSinif || userData?.sinif,
  });
  const { sinavModu, lgsOgrencisi, arasinifOgrencisi, gerisayimHedef } = baglam;

  const geriSayimVar = gerisayimHedef !== null;
  const kalanGun = geriSayimVar ? kalanGunHesapla(lgsOgrencisi ? LGS_TARIH : YKS_TARIH) : null;
  const geriSayimEtiketi = lgsOgrencisi ? 'LGS' : 'TYT';

  const panelAltBaslik =
    sinavModu === 'lgs'
      ? 'LGS odaklı hazırlık programı'
      : sinavModu === 'yks'
        ? 'YKS odaklı sınav programı'
        : sinavModu === 'gecis'
          ? 'Alan yerleştirme + TYT hazırlık'
          : 'Akademik gelişim programı';

  const motivasyonMesaji = bugunSoruVar
    ? 'Bugünkü soru girişini yaptın. Program ve rutinini kontrol et.'
    : arasinifOgrencisi
      ? 'Konu çalışmasına devam et. Küçük adımlar büyük fark yaratır.'
      : 'Günlük hedeflerine ulaşmak için başla. Her gün önemli.';

  const kpiItems = [
    {
      label: 'Koçundan mesaj',
      deger: okunmamis > 0 ? okunmamis : '—',
      alt: okunmamis > 0 ? 'Okunmamış' : 'Yeni mesaj yok',
      renk: okunmamis > 0 ? (s.danger ?? s.tehlika) : undefined,
      onClick: () => onNav('mesajlar'),
    },
    {
      label: 'Soru çözümü',
      deger: bugunSoruVar ? 'Tamamlandı' : 'Girilmedi',
      alt: bugunSoruVar ? 'Bugün girildi' : saat < 22 ? 'Girmeyi unutma!' : 'Bugün girilmedi',
      renk: bugunSoruVar
        ? (s.success ?? s.ok)
        : saat < 22
          ? (s.danger ?? s.tehlika)
          : (s.textMuted ?? s.text3),
      onClick: () => onNav('gunluk_soru'),
    },
    ...(geriSayimVar
      ? [{ label: `${geriSayimEtiketi}'a kalan`, deger: kalanGun, alt: 'gün', onClick: null }]
      : []),
  ];

  return (
    <>
      <div
        style={{
          background: s.heroSurface || s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 16,
          padding: mobil ? '20px 22px' : '24px 30px',
          marginBottom: 20,
          boxShadow: s.shadowCard || s.shadow,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: s.text3, fontWeight: 500, marginBottom: 2 }}>
              {selam},
            </div>
            <div
              style={{
                fontSize: mobil ? 28 : 34,
                fontWeight: 800,
                color: s.heroTitle || s.text,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {userData?.isim?.split(' ')[0] || 'Öğrenci'}
            </div>
            {userData?.sinif && (
              <div
                style={{
                  fontSize: 11,
                  color: s.accent,
                  fontWeight: 700,
                  marginTop: 4,
                  background: s.accentSoft,
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 20,
                  letterSpacing: '0.03em',
                }}
              >
                {userData.sinif}. Sınıf · {panelAltBaslik}
              </div>
            )}
            <div
              style={{
                fontSize: 13,
                color: s.text2,
                marginTop: 10,
                fontWeight: 500,
                paddingTop: 10,
                borderTop: `1px solid ${s.border}`,
              }}
            >
              {motivasyonMesaji}
            </div>
          </div>
          {programOran !== null && <DaireselOran oran={programOran} s={s} boyut={90} />}
        </div>
      </div>

      <KpiSerit s={s} mobil={mobil} items={kpiItems} />
      <KocMesajiKart mesaj={gununSozu} s={s} />
      <GunlukRutinKart ogrenciId={kullanici.uid} s={s} />
      <BugunProgramKart ogrenciId={kullanici.uid} onNav={onNav} s={s} />
      {geriSayimVar && (
        <GeriSayimKart
          tur={ogrenciTur || userData?.tur}
          sinif={ogrenciSinif || userData?.sinif}
          s={s}
        />
      )}
      <div
        style={{ fontSize: 12, fontWeight: 600, color: s.text3, marginBottom: 10, marginTop: 16 }}
      >
        Hızlı erişim
      </div>
      <KisayolGrid onNav={onNav} okunmamis={okunmamis} s={s} />
    </>
  );
}

export function OgrenciSayfaIcerigi({
  aktifSayfa,
  yukleniyor,
  setDestekAcik,
  ogrenciTur,
  ogrenciSinif,
  gununSozu,
  bugunSoruVar,
  okunmamis,
  programOran,
  userData,
  kullanici,
  onNav,
  s,
  mobil,
}) {
  switch (aktifSayfa) {
    case 'program':
      return (
        <>
          <GeriTusu baslik="Programım" onNav={onNav} s={s} />
          <HaftalikProgramSayfasi
            ogrenci={{ id: kullanici.uid, ...userData }}
            readOnly={true}
            onGeri={null}
          />
        </>
      );
    case 'rutin':
      return (
        <>
          <GeriTusu baslik="Günlük rutin" onNav={onNav} s={s} />
          <div style={{ fontSize: 13, color: s.text3, marginBottom: 16 }}>
            Bugün:{' '}
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <RutinGirisFormu ogrenciId={kullanici.uid} s={s} />
        </>
      );
    case 'gunluk_soru':
      return (
        <>
          <GeriTusu baslik="Günlük soru çözümü" onNav={onNav} s={s} />
          <GunlukSoruFormu ogrenciId={kullanici.uid} />
        </>
      );
    case 'denemeler':
      return (
        <>
          <GeriTusu baslik="Denemeler" onNav={onNav} s={s} />
          <DenemeListesi
            ogrenciId={kullanici.uid}
            kocId={userData?.kocId}
            ogrenciTur={ogrenciTur || userData?.tur}
            ogrenciSinif={ogrenciSinif || userData?.sinif}
          />
        </>
      );
    case 'mufredat':
      return (
        <>
          <GeriTusu baslik="İlerleyişim" onNav={onNav} s={s} />
          <MufredatGoruntule
            ogrenciId={kullanici.uid}
            ogrenciTur={ogrenciTur || userData?.tur}
            ogrenciSinif={ogrenciSinif || userData?.sinif}
          />
        </>
      );
    case 'mesajlar':
      return (
        <>
          <GeriTusu baslik="Mesajlar" onNav={onNav} s={s} />
          <Mesajlar ogrenciId={kullanici.uid} gonderen="ogrenci" aliciId={userData?.kocId} />
        </>
      );
    case 'duyurular':
      return (
        <>
          <GeriTusu baslik="Duyurular" onNav={onNav} s={s} />
          <DuyuruMerkezi title="Duyurular" />
        </>
      );
    case 'destek':
      return (
        <>
          <GeriTusu baslik="Destek" onNav={onNav} s={s} />
          <div style={{ fontSize: 13, color: s.text3, marginBottom: 20 }}>
            Teknik sorun veya başka bir konuda destek talebi oluşturabilirsin.
          </div>
          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: s.text, marginBottom: 8 }}>
              Destek talebi oluştur
            </div>
            <div style={{ fontSize: 13, color: s.text2, lineHeight: 1.7, marginBottom: 16 }}>
              Talebini ilettiğinde koçun ve destek ekibimiz en kısa sürede dönecek.
            </div>
            <Btn onClick={() => setDestekAcik(true)}>Talep Oluştur</Btn>
          </Card>
        </>
      );
    default:
      return yukleniyor ? (
        <LoadingState />
      ) : (
        <OgrenciAnaSayfa
          ogrenciTur={ogrenciTur}
          ogrenciSinif={ogrenciSinif}
          gununSozu={gununSozu}
          bugunSoruVar={bugunSoruVar}
          okunmamis={okunmamis}
          programOran={programOran}
          userData={userData}
          kullanici={kullanici}
          onNav={onNav}
          s={s}
          mobil={mobil}
        />
      );
  }
}
