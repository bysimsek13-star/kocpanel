import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { LoadingState } from '../components/Shared';
import { GUNLER } from '../utils/programAlgoritma';
import { ogrenciBaglaminiCoz } from '../utils/ogrenciBaglam';
import { VideoIzleModal } from './VideoIzleModal';
import { SlotModal, GunKolonu } from './ProgramBilesenleri';
import { useHaftalikProgram, bosSlot } from './useHaftalikProgram';
import { HaftalikProgramHeader } from './HaftalikProgramHeader';
import { HaftalikProgramKopyalaModal } from './HaftalikProgramKopyalaModal';

const SLOT_SAYISI = 6;

// VideoIzleModal re-exported for backward compat (used by BugunProgramKart)
export { VideoIzleModal };

export default function HaftalikProgramSayfasi({
  ogrenciler = [],
  ogrenci: ogrenciProp,
  onGeri,
  readOnly = false,
  initialOffset = 0,
  compact = false,
}) {
  const { s } = useTheme();
  const mobil = useMobil();

  const {
    secilenOgrenci,
    setSecilenOgrenci,
    haftaOffset,
    setHaftaOffset,
    hafta,
    tamamlandiMap,
    yukleniyor,
    duzenleme,
    setDuzenleme,
    modal,
    setModal,
    videoModal,
    setVideoModal,
    kaydetiliyor,
    kopyalaModal,
    setKopyalaModal,
    kopyalaHedef,
    setKopyalaHedef,
    kopyalaniyor,
    slotKopya,
    setSlotKopya,
    haftaKey,
    bugunGun,
    modalSlot,
    slotGuncelle,
    togglTamamla,
    haftayiKopyala,
    haftayaTasi,
    kocUid,
    toast,
  } = useHaftalikProgram({ ogrenciler, ogrenciProp, readOnly, initialOffset });

  const scrollRef = useRef(null);

  useEffect(() => {
    const idx = GUNLER.indexOf(bugunGun);
    if (scrollRef.current && idx >= 0) {
      const kolonGenislik = mobil ? 168 : scrollRef.current.offsetWidth / GUNLER.length;
      scrollRef.current.scrollTo({ left: idx * (kolonGenislik + 8), behavior: 'smooth' });
    }
  }, [bugunGun, haftaOffset, mobil]);

  const programBaglam = ogrenciBaglaminiCoz({
    tur: secilenOgrenci?.tur,
    sinif: secilenOgrenci?.sinif,
  });
  const programModuEtiket =
    programBaglam.programModu === 'sinav_programi'
      ? 'Sınav Programı'
      : programBaglam.programModu === 'gecis_programi'
        ? 'Alan Hazırlık Programı'
        : 'Gelişim Programı';
  const programModuRenk =
    programBaglam.programModu === 'sinav_programi'
      ? '#F43F5E'
      : programBaglam.programModu === 'gecis_programi'
        ? '#F59E0B'
        : '#10B981';

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <HaftalikProgramHeader
        compact={compact}
        readOnly={readOnly}
        ogrenciler={ogrenciler}
        secilenOgrenci={secilenOgrenci}
        setSecilenOgrenci={setSecilenOgrenci}
        scrollRef={scrollRef}
        bugunGun={bugunGun}
        mobil={mobil}
        haftaOffset={haftaOffset}
        setHaftaOffset={setHaftaOffset}
        haftaKey={haftaKey}
        kaydetiliyor={kaydetiliyor}
        duzenleme={duzenleme}
        setDuzenleme={setDuzenleme}
        setKopyalaModal={setKopyalaModal}
        setKopyalaHedef={setKopyalaHedef}
        slotKopya={slotKopya}
        setSlotKopya={setSlotKopya}
        programModuEtiket={programModuEtiket}
        programModuRenk={programModuRenk}
        onGeri={onGeri}
        s={s}
        toast={toast}
      />

      {yukleniyor ? (
        <LoadingState />
      ) : (
        <div
          ref={scrollRef}
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
          }}
        >
          <div style={{ display: 'flex', gap: 8, minWidth: mobil ? GUNLER.length * 168 : 0 }}>
            {GUNLER.map(gun => (
              <div key={gun} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                <GunKolonu
                  gunAdi={gun}
                  slotlar={hafta[gun] || Array.from({ length: SLOT_SAYISI }, bosSlot)}
                  duzenleme={duzenleme}
                  tamamlandiMap={Object.fromEntries(
                    Array.from({ length: SLOT_SAYISI }, (_, i) => [
                      i,
                      !!tamamlandiMap[`${gun}_${i}`],
                    ])
                  )}
                  onSlotClick={(g, i) => setModal({ gun: g, slotIndex: i })}
                  onToggle={(g, i) => togglTamamla(g, i)}
                  onVideoAc={videolar => setVideoModal(videolar)}
                  onKopyala={slot => {
                    setSlotKopya(slot);
                    toast('Slot kopyalandı — yapıştırmak için boş kutuya tıkla');
                  }}
                  onYapistir={(g, i) => {
                    if (slotKopya) {
                      slotGuncelle(g, i, { ...slotKopya });
                      setSlotKopya(null);
                      toast('Yapıştırıldı ✓');
                    }
                  }}
                  onHizliSil={(g, i) => {
                    slotGuncelle(g, i, bosSlot());
                    toast('Slot silindi');
                  }}
                  slotKopya={slotKopya}
                  bugunMu={gun === bugunGun && haftaOffset === 0}
                  s={s}
                  mobil={mobil}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {videoModal && (
        <VideoIzleModal
          videolar={videoModal}
          onKapat={() => setVideoModal(null)}
          izleyenUid={kocUid}
          s={s}
          mobil={mobil}
        />
      )}

      {kopyalaModal && (
        <HaftalikProgramKopyalaModal
          haftaKey={haftaKey}
          haftaOffset={haftaOffset}
          kopyalaHedef={kopyalaHedef}
          setKopyalaHedef={setKopyalaHedef}
          kopyalaniyor={kopyalaniyor}
          haftayiKopyala={haftayiKopyala}
          onKapat={() => setKopyalaModal(false)}
          s={s}
        />
      )}

      {modal && modalSlot && (
        <SlotModal
          slot={modalSlot}
          gunAdi={modal.gun}
          slotIndex={modal.slotIndex}
          onKaydet={form => {
            slotGuncelle(modal.gun, modal.slotIndex, form);
            setModal(null);
            toast('Kaydedildi ✓');
          }}
          onSil={() => {
            slotGuncelle(modal.gun, modal.slotIndex, bosSlot());
            setModal(null);
          }}
          onKapat={() => setModal(null)}
          onHaftayaTasi={readOnly ? null : haftayaTasi}
          kocUid={readOnly ? null : kocUid}
          ogrenciTur={secilenOgrenci?.tur}
          ogrenciSinif={secilenOgrenci?.sinif}
          s={s}
        />
      )}
    </div>
  );
}

HaftalikProgramSayfasi.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object),
  ogrenci: PropTypes.object,
  onGeri: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  initialOffset: PropTypes.number,
  compact: PropTypes.bool,
};
