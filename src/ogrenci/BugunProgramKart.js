import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useMobil } from '../hooks/useMediaQuery';
import { VideoIzleModal } from '../koc/HaftalikProgram';
import { bugunGunAdi, haftaBasStr } from '../utils/tarih';

const BUGUN_GUN = bugunGunAdi();
const HAFTA_BAZ = haftaBasStr();

export default function BugunProgramKart({ ogrenciId, onNav: _onNav, s }) {
  const [slotlar, setSlotlar] = useState([]);
  const [tamamlandi, setTamamlandi] = useState({});
  const [videoModal, setVideoModal] = useState(null);
  const mobil = useMobil();

  useEffect(() => {
    const ref = doc(db, 'ogrenciler', ogrenciId, 'program_v2', HAFTA_BAZ);
    return onSnapshot(ref, snap => {
      if (snap.exists()) {
        const v = snap.data();
        // Orijinal indeksi koru — tamamlandiMap'teki key'ler orijinal pozisyona göre
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
    const yeni = { ...tamamlandi, [key]: !tamamlandi[key] };
    setTamamlandi(yeni);
    const ref = doc(db, 'ogrenciler', ogrenciId, 'program_v2', HAFTA_BAZ);
    await setDoc(ref, { tamamlandi: yeni }, { merge: true });
  };

  if (slotlar.length === 0) return null;
  const tam = slotlar.filter(sl => tamamlandi[`${BUGUN_GUN}_${sl._idx}`]).length;
  const getDuration = sl => {
    if (!sl.baslangic || !sl.bitis) return 60;
    const [sh, sm] = sl.baslangic.split(':').map(Number);
    const [eh, em] = sl.bitis.split(':').map(Number);
    const d = eh * 60 + em - (sh * 60 + sm);
    return d > 0 ? d : 60;
  };
  const toplamDk = slotlar.reduce((a, sl) => a + getDuration(sl), 0);
  const tamamDk = slotlar.reduce(
    (a, sl) => a + (tamamlandi[`${BUGUN_GUN}_${sl._idx}`] ? getDuration(sl) : 0),
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
          {slotlar.map(slot => {
            const tip = TIP_RENK[slot.tip] || TIP_RENK.diger;
            const bitti = !!tamamlandi[`${BUGUN_GUN}_${slot._idx}`];
            return (
              <div
                key={slot._idx}
                onClick={() => toggle(slot._idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '8px 10px',
                  marginBottom: 6,
                  borderRadius: 10,
                  background: bitti ? s.surface2 : tip.acik,
                  border: `1px solid ${bitti ? s.border : tip.renk + '30'}`,
                  opacity: bitti ? 0.6 : 1,
                  transition: 'transform .15s ease, box-shadow .15s ease, opacity .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = s.shadowHover ?? s.shadow;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: 4,
                    minHeight: 36,
                    borderRadius: 99,
                    flexShrink: 0,
                    alignSelf: 'stretch',
                    background: bitti ? s.border : tip.renk,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: bitti ? s.text3 : tip.renk,
                        background: `${tip.renk}20`,
                        padding: '1px 7px',
                        borderRadius: 4,
                      }}
                    >
                      {tip.label}
                    </span>
                    {slot.baslangic && (
                      <span style={{ fontSize: 10, color: s.text3 }}>
                        {slot.baslangic}
                        {slot.bitis ? ` – ${slot.bitis}` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: bitti ? s.text3 : s.text }}>
                    {slot.ders || '—'}
                  </div>
                  {slot.icerik && (
                    <div style={{ fontSize: 11, color: s.text3, marginTop: 1 }}>{slot.icerik}</div>
                  )}
                  {slot.tip === 'video' && slot.videolar?.length > 0 && (
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        setVideoModal(slot.videolar);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        color: s.info ?? s.accent,
                        background: `${s.info ?? s.accent}15`,
                        padding: '2px 10px',
                        borderRadius: 20,
                        cursor: 'pointer',
                        border: `1px solid ${s.info ?? s.accent}30`,
                      }}
                    >
                      ▶ {slot.videolar.length} video izle
                    </div>
                  )}
                </div>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    flexShrink: 0,
                    border: bitti ? 'none' : `1.5px solid ${tip.renk}60`,
                    background: bitti ? tip.renk : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  {bitti ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

BugunProgramKart.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  onNav: PropTypes.func,
  s: PropTypes.object.isRequired,
};
