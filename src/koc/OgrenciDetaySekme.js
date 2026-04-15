import React from 'react';
import { Card } from '../components/Shared';
import DenemeListesi from '../ogrenci/DenemeListesi';
import Mesajlar from '../ogrenci/Mesajlar';
import HaftalikVerimlilik from './HaftalikVerimlilik';
import HaftalikProgramSayfasi from './HaftalikProgram';
import CalismaTakvimi from '../components/CalismaTakvimi';
import MufredatGoruntule from '../ogrenci/MufredatGoruntule';
import GorusmeTimeline from './GorusmeTimeline';
import GamificationKarti from '../components/GamificationKarti';
import { OgrenciDetayBilgiler } from './OgrenciDetayBanner';

export function OgrenciDetaySekme({
  aktifSekme,
  ogrenci,
  readOnly,
  duzenleyebilir,
  veriGetir,
  calismalar,
  denemeler,
  oran,
  setSilOnay,
  s,
  mobil,
}) {
  if (aktifSekme === 'program') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1.2fr 1fr', gap: 20 }}>
        {duzenleyebilir ? (
          <HaftalikProgramSayfasi ogrenciler={[ogrenci]} onGeri={veriGetir} />
        ) : (
          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 14 }}>
              📅 Mevcut Program
            </div>
            <div style={{ color: s.text3, fontSize: 13 }}>
              Bu öğrencinin programını düzenleme yetkiniz yok.
            </div>
          </Card>
        )}
        <OgrenciDetayBilgiler
          ogrenci={ogrenci}
          oran={oran}
          duzenleyebilir={duzenleyebilir}
          setSilOnay={setSilOnay}
          s={s}
        />
      </div>
    );
  }

  if (aktifSekme === 'denemeler') {
    return (
      <div style={{ maxWidth: 750 }}>
        <DenemeListesi
          ogrenciId={ogrenci.id}
          readOnly={readOnly}
          gelisimOzetGoster
          konuAnalizGoster
          kocId={null}
          ogrenciTur={ogrenci.tur}
          ogrenciSinif={ogrenci.sinif}
        />
      </div>
    );
  }

  if (aktifSekme === 'verimlilik') {
    return (
      <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GamificationKarti calismalar={calismalar} denemeler={denemeler} />
        <HaftalikVerimlilik ogrenciId={ogrenci.id} />
        <CalismaTakvimi ogrenciId={ogrenci.id} />
      </div>
    );
  }

  if (aktifSekme === 'mesajlar') {
    return (
      <div style={{ maxWidth: 700 }}>
        {duzenleyebilir ? (
          <Mesajlar
            ogrenciId={ogrenci.id}
            gonderen="koc"
            aliciId={ogrenci.id}
            aliciIsim={ogrenci.isim?.split(' ')[0] || ''}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: s.text3 }}>
            🔒 Bu öğrencinin mesajlarını görüntüleme yetkiniz yok
          </div>
        )}
      </div>
    );
  }

  if (aktifSekme === 'timeline') {
    return (
      <div style={{ maxWidth: 860 }}>
        <GorusmeTimeline ogrenciId={ogrenci.id} />
      </div>
    );
  }

  if (aktifSekme === 'mufredat') {
    return (
      <div style={{ maxWidth: 860 }}>
        <MufredatGoruntule
          ogrenciId={ogrenci.id}
          ogrenciTur={ogrenci.tur}
          ogrenciSinif={ogrenci.sinif}
          kocModu={duzenleyebilir}
        />
      </div>
    );
  }

  return null;
}
