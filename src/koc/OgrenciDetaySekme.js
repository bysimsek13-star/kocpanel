import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import DenemeListesi from '../ogrenci/DenemeListesi';
import Mesajlar from '../ogrenci/Mesajlar';
import HaftalikProgramSayfasi from './HaftalikProgram';
import MufredatGoruntule from '../ogrenci/MufredatGoruntule';
import OgrenciHedefKarti from './hedef/OgrenciHedefKarti';
import OgrenciDetayGenelOzet from './OgrenciDetayGenelOzet';
import OgrenciDetaySoruRutin from './OgrenciDetaySoruRutin';

export function OgrenciDetaySekme({
  aktifSekme,
  ogrenci,
  readOnly,
  duzenleyebilir,
  veriGetir,
  denemeler,
  program,
  dersBaslat,
  mufredatDersler,
  s,
}) {
  useEffect(() => {
    if (aktifSekme !== 'mesajlar' || !ogrenci?.id) return;
    const q = query(
      collection(db, 'ogrenciler', ogrenci.id, 'mesajlar'),
      where('okundu', '==', false),
      where('gonderen', '==', 'ogrenci')
    );
    getDocs(q).then(snap => {
      snap.docs.forEach(d => updateDoc(d.ref, { okundu: true }));
    });
  }, [aktifSekme, ogrenci?.id]);

  if (aktifSekme === 'ozet') {
    return (
      <OgrenciDetayGenelOzet
        ogrenci={ogrenci}
        program={program}
        dersBaslat={dersBaslat}
        mufredatDersler={mufredatDersler}
        s={s}
      />
    );
  }

  if (aktifSekme === 'program') {
    return <HaftalikProgramSayfasi ogrenciler={[ogrenci]} onGeri={veriGetir} />;
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
  dersBaslat: PropTypes.func,
  mufredatDersler: PropTypes.array,
  s: PropTypes.object.isRequired,
  mobil: PropTypes.bool,
};
