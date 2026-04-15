import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { verimlilikHesapla } from '../data/konular';
import { useToast } from '../components/Toast';
import { Card, Btn } from '../components/Shared';
import { bugunStr } from '../utils/tarih';
import { logIstemciHatasi } from '../utils/izleme';

const IC_BEKLENEN = 6;

export default function CalismaKarti({
  ogrenciId,
  gorevOrani = 0,
  onKaydet,
  gizliSkor: _gizliSkor = false,
}) {
  const { s } = useTheme();
  const toast = useToast();
  const bugun = bugunStr();
  const [saat, setSaat] = useState('');
  const [kaydedildi, setKaydedildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mevcutSaat, setMevcutSaat] = useState(null);

  useEffect(() => {
    const getir = async () => {
      try {
        const snap = await getDoc(doc(db, 'ogrenciler', ogrenciId, 'calisma', bugun));
        if (snap.exists()) {
          setMevcutSaat(snap.data().saat);
          setSaat(String(snap.data().saat));
          setKaydedildi(true);
        }
      } catch (e) {
        logIstemciHatasi({
          error: e,
          info: 'Çalışma verisi alınamadı',
          kaynak: 'CalismaKarti',
          ekstra: { ogrenciId },
        });
        toast('Veriler yüklenemedi', 'error');
      }
    };
    getir();
  }, [ogrenciId, bugun]);

  const kaydet = async () => {
    const ss = parseFloat(saat);
    if (!ss || ss <= 0 || ss > 24) {
      toast('Geçerli saat girin (0-24)', 'error');
      return;
    }
    setYukleniyor(true);
    try {
      const ver = verimlilikHesapla(ss, IC_BEKLENEN, gorevOrani);
      await setDoc(doc(db, 'ogrenciler', ogrenciId, 'calisma', bugun), {
        saat: ss,
        tarih: bugun,
        verimlilik: ver,
        gorevOrani,
        beklenenSaat: IC_BEKLENEN,
        olusturma: new Date(),
      });
      // sonCalismaTarihi / toplamCalismaGunu → calismaAggregateGuncelle CF yazar
      setMevcutSaat(ss);
      setKaydedildi(true);
      toast(kaydedildi ? 'Güncellendi!' : 'Kaydedildi!');
      if (onKaydet) onKaydet();
    } catch (e) {
      logIstemciHatasi({
        error: e,
        info: 'Çalışma kaydedilemedi',
        kaynak: 'CalismaKarti',
        ekstra: { ogrenciId },
      });
      toast('Kaydedilemedi', 'error');
    }
    setYukleniyor(false);
  };

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: s.text, marginBottom: 20 }}>
        ⏱️ Bugün Kaç Saat Çalıştım?
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={saat}
          onChange={e => setSaat(e.target.value)}
          placeholder="0"
          style={{
            width: 90,
            background: s.inputBg ?? s.surface,
            border: `2px solid ${s.inputBorder ?? s.border}`,
            borderRadius: 12,
            padding: 12,
            color: s.text,
            fontSize: 24,
            fontWeight: 700,
            outline: 'none',
            textAlign: 'center',
          }}
        />
        <div style={{ fontSize: 16, color: s.text2 }}>saat</div>
        <div style={{ flex: 1 }} />
        <Btn onClick={kaydet} disabled={!saat || yukleniyor}>
          {yukleniyor ? '...' : kaydedildi ? 'Güncelle' : 'Kaydet'}
        </Btn>
      </div>
      {kaydedildi && (
        <div
          style={{
            background: s.surface2,
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 36 }}>✅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.success }}>
              Bugünkü çalışma kaydedildi
            </div>
            <div style={{ fontSize: 12, color: s.text3, marginTop: 2 }}>
              {mevcutSaat}s çalışıldı
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

CalismaKarti.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  gorevOrani: PropTypes.number,
  onKaydet: PropTypes.func,
  gizliSkor: PropTypes.bool,
};
