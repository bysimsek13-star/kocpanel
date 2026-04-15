import React from 'react';
import PropTypes from 'prop-types';
import KocHeroKart from './KocHeroKart';
import KocVeriGirisiKart from './KocVeriGirisiKart';
import KocMesajUyari from './KocMesajUyari';
import KocKisayollar from './KocKisayollar';
import KocRiskOzeti from './KocRiskOzeti';
import { useKoc } from '../../context/KocContext';

export default function KocSabahEkrani({ onSec, onNav, kocAdi }) {
  const { ogrenciler, bugunMap, okunmamisMap } = useKoc();

  // Aktiflik bazlı: bugün uygulamaya girmeyen öğrenciler
  const bugunGirisYokList = ogrenciler.filter(o => !bugunMap[o.id]?.bugunAktif);
  // Veri girişi bazlı (rutin+soru): KocVeriGirisiKart için ayrı tutuluyor
  const toplamOkunmamis = Object.values(okunmamisMap || {}).reduce(
    (t, v) => t + (Number(v) || 0),
    0
  );

  return (
    <>
      <KocHeroKart
        ogrenciSayisi={ogrenciler.length}
        bugunGirisYokList={bugunGirisYokList}
        toplamOkunmamis={toplamOkunmamis}
        okunmamisMap={okunmamisMap}
        ogrenciler={ogrenciler}
        onNav={onNav}
        onSec={onSec}
        kocAdi={kocAdi}
      />
      <KocRiskOzeti onSec={onSec} />
      <KocVeriGirisiKart onNav={onNav} />
      <KocMesajUyari onSec={onSec} />
      <KocKisayollar onNav={onNav} />
    </>
  );
}

KocSabahEkrani.propTypes = {
  onSec: PropTypes.func,
  onNav: PropTypes.func.isRequired,
  kocAdi: PropTypes.string,
};
