import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { slotTamamlamaKaydet } from '../utils/slotTamamlamaUtils';
import { useMobil } from '../hooks/useMediaQuery';
import { VideoIzleModal } from '../koc/HaftalikProgram';
import { bugunGunAdi, haftaBasStr } from '../utils/tarih';
import BugunSlotSatir from './BugunSlotSatir';

const BUGUN_GUN = bugunGunAdi();
const HAFTA_BAZ = haftaBasStr();

function slotSuresi(sl) {
  if (!sl.baslangic || !sl.bitis) return 60;
  const [sh, sm] = sl.baslangic.split(':').map(Number);
  const [eh, em] = sl.bitis.split(':').map(Number);
  const d = eh * 60 + em - (sh * 60 + sm);
  return d > 0 ? d : 60;
}

export default function BugunProgramKart({
  ogrenciId,
  ogrenciTur,
  ogrenciSinif,
  onNav: _onNav,
  s,
}) {
  const [slotlar, setSlotlar] = useState([]);
  const [tamamlandi, setTamamlandi] = useState({});
  const [videoModal, setVideoModal] = useState(null);
  const [konularAcik, setKonularAcik] = useState(null);
  const mobil = useMobil();

  useEffect(() => {
    const ref = doc(db, 'ogrenciler', ogrenciId, 'program_v2', HAFTA_BAZ);
    return onSnapshot(ref, snap => {
      if (snap.exists()) {
        const v = snap.data();
        setSlotlar(
          (v.hafta?.[BUGUN_GUN] || [])
            .map((sl, idx) => (sl.tip ? { ...sl, _idx: idx } : null))
            .filter(Boolean)
        );
        setTamamlandi(v.tamamlandi || {});
      } else {
        setSlotlar([]);
      }
    });
  }, [ogrenciId]);

  const TIP_RENK = {
    konu: { renk: s.success, acik: s.okSoft, label: 'Konu' },
    soru: { renk: s.warning, acik: s.uyariSoft, label: 'Soru' },
    video: { renk: s.info, acik: s.bilgiSoft, label: 'Video' },
    tekrar: { renk: s.chart5, acik: s.primarySoft, label: 'Tekrar' },
    deneme: { renk: s.danger, acik: s.tehlikaSoft, label: 'Deneme' },
    ozet: { renk: s.accent, acik: s.accentSoft, label: 'Özet' },
    diger: { renk: s.textMuted, acik: s.borderSoft, label: 'Diğer' },
  };

  const toggle = async idx => {
    const key = `${BUGUN_GUN}_${idx}`;
    const yeniTamamlandi = !tamamlandi[key];
    const yeni = { ...tamamlandi, [key]: yeniTamamlandi };
    setTamamlandi(yeni);
    const ref = doc(db, 'ogrenciler', ogrenciId, 'program_v2', HAFTA_BAZ);
    await setDoc(ref, { tamamlandi: yeni }, { merge: true });

    if (yeniTamamlandi) {
      const slot = slotlar.find(sl => sl._idx === idx);
      if (slot?.dersId && slot.tip !== 'deneme') {
        slotTamamlamaKaydet(slot, ogrenciId).catch(e =>
          console.error('slotTamamlamaKaydet hatası:', e.message)
        );
      }
    }
  };

  if (slotlar.length === 0) return null;

  const tam = slotlar.filter(sl => tamamlandi[`${BUGUN_GUN}_${sl._idx}`]).length;
  const toplamDk = slotlar.reduce((a, sl) => a + slotSuresi(sl), 0);
  const tamamDk = slotlar.reduce(
    (a, sl) => a + (tamamlandi[`${BUGUN_GUN}_${sl._idx}`] ? slotSuresi(sl) : 0),
    0
  );
  const oran = toplamDk > 0 ? Math.round((tamamDk / toplamDk) * 100) : 0;

  return (
    <>
      {videoModal && (
        <VideoIzleModal
          videolar={videoModal}
          onKapat={() => setVideoModal(null)}
          izleyenUid={ogrenciId}
          s={s}
          mobil={mobil}
        />
      )}
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 16,
          boxShadow: s.shadowCard || s.shadow,
        }}
      >
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${s.border}` }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: s.text }}>Bugünün programı</div>
            <div style={{ fontSize: 11, color: s.text3 }}>
              {tam}/{slotlar.length} tamamlandı
            </div>
          </div>
          <div style={{ height: 4, background: s.surface2, borderRadius: 99 }}>
            <div
              style={{
                height: '100%',
                borderRadius: 99,
                background: s.accent,
                width: `${oran}%`,
                transition: 'width .4s',
              }}
            />
          </div>
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {slotlar.map(slot => (
            <BugunSlotSatir
              key={slot._idx}
              slot={slot}
              bitti={!!tamamlandi[`${BUGUN_GUN}_${slot._idx}`]}
              tip={TIP_RENK[slot.tip] || TIP_RENK.diger}
              konularAcik={konularAcik}
              setKonularAcik={setKonularAcik}
              setVideoModal={setVideoModal}
              onToggle={toggle}
              ogrenciId={ogrenciId}
              ogrenciTur={ogrenciTur}
              ogrenciSinif={ogrenciSinif}
              s={s}
            />
          ))}
        </div>
      </div>
    </>
  );
}

BugunProgramKart.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onNav: PropTypes.func,
  s: PropTypes.object.isRequired,
};
