import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useGunlukTarih } from '../../utils/tarih';
import { Card, LoadingState } from '../../components/Shared';
import { haftaBasStr } from '../../utils/tarih';

function slotSureDk(baslangic, bitis) {
  if (!baslangic || !bitis) return 0;
  const [bh, bm] = baslangic.split(':').map(Number);
  const [eh, em] = bitis.split(':').map(Number);
  return Math.max(0, eh * 60 + em - (bh * 60 + bm));
}

function dkStr(dk) {
  if (dk <= 0) return '0 dk';
  const s = Math.floor(dk / 60);
  const m = dk % 60;
  return s > 0 ? (m > 0 ? `${s}s ${m}dk` : `${s}s`) : `${m}dk`;
}

// ─── Günlük ilerleme özeti (sınıf bazlı pano) ─────────────────────────────────
export default function GunlukIlerlemePano({ ogrenciler, s, mobil }) {
  const { bugun: BUGUN, bugunGun: BUGUN_GUN } = useGunlukTarih();
  const [ozet, setOzet] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!ogrenciler.length) {
      setOzet(null);
      setYukleniyor(false);
      return;
    }
    let iptal = false;
    const HAFTA_BAZ = haftaBasStr();
    (async () => {
      setYukleniyor(true);
      const n = ogrenciler.length;
      let rutinSay = 0,
        soruSay = 0,
        rutinVeSoru = 0,
        rutinSoruYok = 0;
      let programToplamSlot = 0,
        programTamamSlot = 0,
        programOgrenciSay = 0;
      let programToplamDk = 0,
        programTamamDk = 0;
      await Promise.all(
        ogrenciler.map(async o => {
          try {
            const [rSnap, gSnap, pSnap] = await Promise.all([
              getDoc(doc(db, 'ogrenciler', o.id, 'rutin', BUGUN)),
              getDoc(doc(db, 'ogrenciler', o.id, 'gunlukSoru', BUGUN)),
              getDoc(doc(db, 'ogrenciler', o.id, 'program_v2', HAFTA_BAZ)),
            ]);
            const hasRutin = rSnap.exists();
            let hasSoru = false;
            if (gSnap.exists()) {
              const dersler = gSnap.data().dersler || {};
              Object.values(dersler).forEach(row => {
                if ((row.d || 0) + (row.y || 0) + (row.b || 0) > 0) hasSoru = true;
              });
            }
            if (hasRutin) rutinSay += 1;
            if (hasSoru) soruSay += 1;
            if (hasRutin && hasSoru) rutinVeSoru += 1;
            if (!hasRutin && !hasSoru) rutinSoruYok += 1;

            if (pSnap.exists()) {
              const pVeri = pSnap.data();
              const tumSlotlar = pVeri.hafta?.[BUGUN_GUN] || [];
              const gunSlotlar = tumSlotlar
                .map((sl, i) => (sl.tip ? { ...sl, _idx: i } : null))
                .filter(Boolean);
              if (gunSlotlar.length > 0) {
                const tam = pVeri.tamamlandi || {};
                programToplamSlot += gunSlotlar.length;
                programOgrenciSay += 1;
                gunSlotlar.forEach(sl => {
                  const sure = slotSureDk(sl.baslangic, sl.bitis);
                  programToplamDk += sure;
                  if (tam[`${BUGUN_GUN}_${sl._idx}`]) {
                    programTamamSlot += 1;
                    programTamamDk += sure;
                  }
                });
              }
            }
          } catch {
            /* tek öğrenci hatası tüm panoyu düşürmesin */
          }
        })
      );
      if (!iptal) {
        const progYuzde =
          programToplamSlot > 0 ? Math.round((programTamamSlot / programToplamSlot) * 100) : 0;
        setOzet({
          n,
          rutinSay,
          soruSay,
          rutinVeSoru,
          rutinSoruYok,
          yuzdeRutin: n ? Math.round((rutinSay / n) * 100) : 0,
          yuzdeSoru: n ? Math.round((soruSay / n) * 100) : 0,
          yuzdeIkisi: n ? Math.round((rutinVeSoru / n) * 100) : 0,
          yuzdeEksik: n ? Math.round((rutinSoruYok / n) * 100) : 0,
          programTamamSlot,
          programToplamSlot,
          progYuzde,
          programOgrenciSay,
          programToplamDk,
          programTamamDk,
        });
        setYukleniyor(false);
      }
    })();
    return () => {
      iptal = true;
    };
  }, [ogrenciler, BUGUN, BUGUN_GUN]);

  if (!ogrenciler.length) return null;

  return (
    <Card
      style={{
        padding: mobil ? 16 : 20,
        marginBottom: 20,
        border: `1px solid ${s.border}`,
        background: s.surface,
        boxShadow: s.shadowCard || s.shadow,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: s.text }}>Günlük ilerleme özeti</div>
        <div style={{ fontSize: 12, color: s.text2, marginTop: 6, lineHeight: 1.55 }}>
          Bugün ({BUGUN}) rutin ve günlük soru girişi — özet üstte, detaylar öğrenci kartlarında.
        </div>
      </div>
      {yukleniyor || !ozet ? (
        <LoadingState />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobil ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {[
            {
              baslik: 'Rutin',
              alt: 'Uyku / su / egzersiz',
              deger: `${ozet.rutinSay}/${ozet.n}`,
              yuzde: ozet.yuzdeRutin,
              renk: s.ok || '#8FADA3',
            },
            {
              baslik: 'Günlük soru',
              alt: 'Ders bazlı D-Y-B',
              deger: `${ozet.soruSay}/${ozet.n}`,
              yuzde: ozet.yuzdeSoru,
              renk: s.accent,
            },
            {
              baslik: 'Program',
              alt:
                ozet.programToplamDk > 0
                  ? `${dkStr(ozet.programTamamDk)} / ${dkStr(ozet.programToplamDk)}`
                  : 'Bugün tamamlanan slot',
              deger:
                ozet.programToplamSlot > 0
                  ? `${ozet.programTamamSlot}/${ozet.programToplamSlot}`
                  : '—',
              yuzde: ozet.progYuzde,
              renk: '#10B981',
            },
            {
              baslik: 'Rutin + soru yok',
              alt: 'Bugün ikisi de boş',
              deger: `${ozet.rutinSoruYok}/${ozet.n}`,
              yuzde: ozet.yuzdeEksik,
              renk: ozet.rutinSoruYok > 0 ? s.uyari || '#B89A6E' : s.text3,
            },
          ].map(k => (
            <div
              key={k.baslik}
              style={{
                background: s.surface2,
                borderRadius: 12,
                padding: '12px 12px',
                border: `1px solid ${s.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: s.text3,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}
              >
                {k.baslik}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: k.renk, marginTop: 4 }}>
                {k.deger}
              </div>
              <div style={{ fontSize: 10, color: s.text3, marginTop: 2 }}>{k.alt}</div>
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  background: s.surface,
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${k.yuzde}%`,
                    background: k.renk,
                    borderRadius: 99,
                    transition: 'width .4s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

GunlukIlerlemePano.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object).isRequired,
  s: PropTypes.object.isRequired,
  mobil: PropTypes.bool,
};
