import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TIP_RENK } from '../../constants/slotTipleri';
import { useGunlukTarih } from '../../utils/tarih';
import VideoModal from './VideoModal';

function slotSureDk(baslangic, bitis) {
  if (!baslangic || !bitis) return 0;
  const [bh, bm] = baslangic.split(':').map(Number);
  const [eh, em] = bitis.split(':').map(Number);
  return Math.max(0, eh * 60 + em - (bh * 60 + bm));
}

function dkStr(dk) {
  if (dk <= 0) return '0dk';
  const h = Math.floor(dk / 60);
  const m = dk % 60;
  return h > 0 ? (m > 0 ? `${h}s ${m}dk` : `${h}s`) : `${m}dk`;
}

// ─── Bugünün programı (program_v2'den) ────────────────────────────────────────
export default function BugunProgrami({ ogrenciId, s }) {
  const { bugunGun: BUGUN_GUN, haftaBaz: HAFTA_BAZ } = useGunlukTarih();
  const [slotlar, setSlotlar] = useState([]);
  const [tamamlandi, setTamamlandi] = useState({});
  const [videoModal, setVideoModal] = useState(null);

  useEffect(() => {
    const ref = doc(db, 'ogrenciler', ogrenciId, 'program_v2', HAFTA_BAZ);
    return onSnapshot(ref, snap => {
      if (snap.exists()) {
        const veri = snap.data();
        // Orijinal indeksi koru — tamamlandiMap key'leri orijinal pozisyona göre
        const gunSlotlar = (veri.hafta?.[BUGUN_GUN] || [])
          .map((sl, idx) => (sl.tip ? { ...sl, _idx: idx } : null))
          .filter(Boolean);
        setSlotlar(gunSlotlar);
        setTamamlandi(veri.tamamlandi || {});
      } else {
        setSlotlar([]);
      }
    });
  }, [ogrenciId, BUGUN_GUN, HAFTA_BAZ]);

  if (slotlar.length === 0) return null;

  const tam = slotlar.filter(sl => tamamlandi[`${BUGUN_GUN}_${sl._idx}`]).length;
  const toplamDk = slotlar.reduce((t, sl) => t + slotSureDk(sl.baslangic, sl.bitis), 0);
  const tamamDk = slotlar
    .filter(sl => tamamlandi[`${BUGUN_GUN}_${sl._idx}`])
    .reduce((t, sl) => t + slotSureDk(sl.baslangic, sl.bitis), 0);

  const toggle = async slotIndex => {
    const key = `${BUGUN_GUN}_${slotIndex}`;
    const yeni = { ...tamamlandi, [key]: !tamamlandi[key] };
    setTamamlandi(yeni);
    const ref = doc(db, 'ogrenciler', ogrenciId, 'program_v2', HAFTA_BAZ);
    await setDoc(ref, { tamamlandi: yeni }, { merge: true });
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>Bugünün programı</div>
        <div style={{ fontSize: 11, color: s.text3 }}>
          {tam}/{slotlar.length} tamamlandı
          {toplamDk > 0 && ` · ${dkStr(tamamDk)} / ${dkStr(toplamDk)}`}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: s.surface2, borderRadius: 99, marginBottom: 10 }}>
        <div
          style={{
            height: '100%',
            borderRadius: 99,
            background: `linear-gradient(90deg, ${s.accent}, ${s.success})`,
            width: `${slotlar.length > 0 ? Math.round((tam / slotlar.length) * 100) : 0}%`,
            transition: 'width .4s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slotlar.map(slot => {
          const tip = TIP_RENK[slot.tip] || TIP_RENK.diger;
          const bitti = !!tamamlandi[`${BUGUN_GUN}_${slot._idx}`];
          return (
            <div
              key={slot._idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                opacity: bitti ? 0.65 : 1,
                transition: 'opacity .2s',
              }}
            >
              {/* Renkli sol çizgi */}
              <div
                style={{
                  width: 4,
                  minHeight: 52,
                  borderRadius: 99,
                  marginRight: 12,
                  flexShrink: 0,
                  background: bitti ? s.success : tip.renk,
                }}
              />
              {/* İçerik */}
              <div
                style={{
                  flex: 1,
                  background: bitti ? s.surface2 : tip.acik,
                  border: `1.5px solid ${bitti ? s.border : tip.renk + '30'}`,
                  borderRadius: 12,
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  {slot.baslangic && slot.bitis && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: bitti ? s.success : tip.renk,
                        marginBottom: 2,
                      }}
                    >
                      {slot.baslangic} – {slot.bitis}
                    </div>
                  )}
                  {slot.ders && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: bitti ? s.text3 : s.text }}>
                      {slot.ders}
                    </div>
                  )}
                  {slot.icerik && <div style={{ fontSize: 11, color: s.text2 }}>{slot.icerik}</div>}
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      color: bitti ? s.text3 : tip.renk,
                      background: bitti ? s.surface3 : `${tip.renk}20`,
                      display: 'inline-block',
                      padding: '1px 7px',
                      borderRadius: 20,
                    }}
                  >
                    {tip.label}
                  </div>
                </div>
                {/* Video butonu */}
                {slot.tip === 'video' && slot.videolar?.length > 0 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setVideoModal(slot.videolar);
                    }}
                    style={{
                      background: `${tip.renk}18`,
                      border: `1px solid ${tip.renk}40`,
                      borderRadius: 8,
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      color: tip.renk,
                      flexShrink: 0,
                    }}
                  >
                    ▶ İzle
                  </button>
                )}
                {/* Checkbox */}
                <div
                  onClick={() => toggle(slot._idx)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    flexShrink: 0,
                    border: bitti ? 'none' : `2px solid ${tip.renk}60`,
                    background: bitti ? s.success : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all .2s',
                    cursor: 'pointer',
                  }}
                >
                  {bitti && <span style={{ color: s.surface, fontSize: 13 }}>✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {videoModal && (
        <VideoModal
          videolar={videoModal}
          ogrenciId={ogrenciId}
          onKapat={() => setVideoModal(null)}
          s={s}
        />
      )}
    </div>
  );
}

BugunProgrami.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  s: PropTypes.object.isRequired,
};
