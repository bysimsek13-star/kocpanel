import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../components/Shared';
import DenemeListesi from '../ogrenci/DenemeListesi';
import Mesajlar from '../ogrenci/Mesajlar';
import HaftalikProgramSayfasi from './HaftalikProgram';
import MufredatGoruntule from '../ogrenci/MufredatGoruntule';
import OgrenciHedefKarti from './hedef/OgrenciHedefKarti';
import OgrenciDetayGenelOzet from './OgrenciDetayGenelOzet';
import OgrenciDetaySoruRutin from './OgrenciDetaySoruRutin';
import { OgrenciDetayBilgiler } from './OgrenciDetayBanner';

export function OgrenciDetaySekme({
  aktifSekme,
  ogrenci,
  readOnly,
  duzenleyebilir,
  veriGetir,
  denemeler,
  program,
  oran,
  setSilOnay,
  s,
  mobil,
}) {
  if (aktifSekme === 'ozet') {
    return <OgrenciDetayGenelOzet ogrenci={ogrenci} program={program} s={s} />;
  }

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

  if (aktifSekme === 'soruRutin') {
    return <OgrenciDetaySoruRutin ogrenci={ogrenci} s={s} />;
  }

  if (aktifSekme === 'deneme') {
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

  if (aktifSekme === 'hedef') {
    return (
      <div style={{ maxWidth: 700 }}>
        <OgrenciHedefKarti ogrenci={ogrenci} index={0} s={s} onHedefEkle={() => {}} />
      </div>
    );
  }

  if (aktifSekme === 'konuTakibi') {
    return (
      <div style={{ maxWidth: 860 }}>
        <MufredatGoruntule
          ogrenciId={ogrenci.id}
          ogrenciTur={ogrenci.tur}
          ogrenciSinif={ogrenci.sinif}
          kocModu={duzenleyebilir}
          denemeler={denemeler}
        />
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

  return null;
}

OgrenciDetaySekme.propTypes = {
  aktifSekme: PropTypes.string.isRequired,
  ogrenci: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  duzenleyebilir: PropTypes.bool,
  veriGetir: PropTypes.func,
  denemeler: PropTypes.array,
  program: PropTypes.array,
  oran: PropTypes.number,
  setSilOnay: PropTypes.func,
  s: PropTypes.object.isRequired,
  mobil: PropTypes.bool,
};
