import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { EmptyState } from '../components/Shared';
import { KocHeroBand, KocKpiStrip } from '../components/koc/KocPanelUi';

import { hedefDurumu } from './hedef/hedefUtils';
import HedefEkleModal from './hedef/HedefEkleModal';
import OgrenciHedefKarti from './hedef/OgrenciHedefKarti';

export default function HedefTakibiSayfasi({ ogrenciler, onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const [ekleModal, setEkleModal] = useState(null);
  const [yenile, setYenile] = useState(0);
  const [ozet, setOzet] = useState({ toplamHedef: 0, acil: 0, tamamlanan: 0 });

  const aktifOgrenciler = useMemo(() => ogrenciler.filter(o => o.aktif !== false), [ogrenciler]);

  useEffect(() => {
    if (!aktifOgrenciler.length) {
      setOzet({ toplamHedef: 0, acil: 0, tamamlanan: 0 });
      return;
    }
    let cancelled = false;
    (async () => {
      let th = 0,
        ac = 0,
        tm = 0;
      try {
        await Promise.all(
          aktifOgrenciler.map(async o => {
            const snap = await getDocs(collection(db, 'ogrenciler', o.id, 'hedefler'));
            snap.docs.forEach(docSnap => {
              const h = { id: docSnap.id, ...docSnap.data() };
              const dur = hedefDurumu(h);
              th += 1;
              if (dur === 'riskli' || dur === 'gecikti') ac += 1;
              if (dur === 'tamamlandi') tm += 1;
            });
          })
        );
      } catch (e) {
        console.error(e);
      }
      if (!cancelled) setOzet({ toplamHedef: th, acil: ac, tamamlanan: tm });
    })();
    return () => {
      cancelled = true;
    };
  }, [aktifOgrenciler, yenile]);

  const ozetItems = useMemo(
    () => [
      { label: 'Öğrenci', deger: aktifOgrenciler.length, alt: 'Aktif kayıt', vurgu: s.accent },
      { label: 'Toplam hedef', deger: ozet.toplamHedef, alt: 'Tüm öğrenciler', vurgu: s.bilgi },
      {
        label: 'Acil / gecikmiş',
        deger: ozet.acil,
        alt: 'Takip gerektirir',
        vurgu: ozet.acil > 0 ? s.tehlika : s.text3,
      },
      { label: 'Tamamlanan', deger: ozet.tamamlanan, alt: 'Bu dönem', vurgu: s.chartPos },
    ],
    [aktifOgrenciler.length, ozet, s]
  );

  return (
    <div style={{ padding: mobil ? 16 : 28 }}>
      <KocHeroBand
        baslik="Hedef takibi"
        aciklama="Net, puan veya süre hedeflerini öğrenci bazında tanımlayın; güncel ilerlemeyi ve süre baskısını tek ekranda görün."
        onGeri={onGeri}
        mobil={mobil}
      />
      <KocKpiStrip items={ozetItems} mobil={mobil} />

      {aktifOgrenciler.length === 0 ? (
        <EmptyState mesaj="Öğrenci yok" icon="" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill,minmax(${mobil ? 300 : 360}px,1fr))`,
            gap: 18,
          }}
        >
          {aktifOgrenciler.map((o, i) => (
            <OgrenciHedefKarti
              key={`${o.id}-${yenile}`}
              ogrenci={o}
              index={i}
              s={s}
              onHedefEkle={setEkleModal}
            />
          ))}
        </div>
      )}

      {ekleModal && (
        <HedefEkleModal
          ogrenci={ekleModal}
          onKapat={() => setEkleModal(null)}
          onEkle={() => {
            setEkleModal(null);
            setYenile(n => n + 1);
          }}
          s={s}
        />
      )}
    </div>
  );
}

HedefTakibiSayfasi.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGeri: PropTypes.func.isRequired,
};
