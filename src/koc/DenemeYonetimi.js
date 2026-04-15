import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { Card, LoadingState, EmptyState, Input } from '../components/Shared';
import { KocSayfaBaslik, KocOzetKutulari } from '../components/KocSayfaKabugu';
import { satirHesapla, ozetHesapla, listele } from './denemeYonetimiUtils';
import DenemeYonetimiListesi from './DenemeYonetimiListesi';

export default function DenemeYonetimiSayfasi({ ogrenciler, onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const navigate = useNavigate();
  const [veriler, setVeriler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState('tumu');
  const [sira, setSira] = useState('isim');

  useEffect(() => {
    const getir = async () => {
      const sonuclar = await Promise.all(
        ogrenciler.map(async o => {
          try {
            const snap = await getDocs(collection(db, 'ogrenciler', o.id, 'denemeler'));
            const l = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            l.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
            return [o.id, l];
          } catch {
            return [o.id, []];
          }
        })
      );
      setVeriler(Object.fromEntries(sonuclar));
      setYukleniyor(false);
    };
    getir();
  }, [ogrenciler]);

  const satirlar = useMemo(() => satirHesapla(ogrenciler, veriler, s), [ogrenciler, veriler, s]);
  const ozet = useMemo(
    () => ozetHesapla(satirlar, ogrenciler.length),
    [satirlar, ogrenciler.length]
  );
  const listelenen = useMemo(
    () => listele(satirlar, arama, filtre, sira),
    [satirlar, arama, filtre, sira]
  );

  const detay = ogrenciId => navigate(`/koc/ogrenciler/${ogrenciId}?tab=denemeler`);

  const chip = (id, label) => {
    const on = filtre === id;
    return (
      <button
        type="button"
        key={id}
        onClick={() => setFiltre(id)}
        style={{
          padding: '7px 14px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          border: `1px solid ${on ? s.accent : s.border}`,
          background: on ? s.accentSoft : s.surface,
          color: on ? s.accent : s.text2,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      <KocSayfaBaslik
        baslik="Deneme yönetimi"
        aciklama="Öğrenci bazında son deneme özeti; detay ve tüm geçmiş için öğrenciyi açıp Denemeler sekmesine gidin."
        onGeri={onGeri}
        geriEtiket="Panele dön"
        mobil={mobil}
      />
      <KocOzetKutulari
        mobil={mobil}
        items={[
          { label: 'Öğrenci', deger: ozet.n, alt: 'Listeniz' },
          { label: 'Deneme kaydı', deger: ozet.toplamDeneme, alt: 'Toplam giriş' },
          { label: 'Ort. son net', deger: ozet.ortSonNet, alt: 'Kaydı olanlar' },
          { label: 'Son iki denemede düşüş', deger: ozet.dususSay, alt: 'Takip önerilir' },
        ]}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
          alignItems: 'center',
        }}
      >
        {chip('tumu', 'Tümü')}
        {chip('veri_yok', 'Denemesi yok')}
        {chip('dusus', 'Net düşüşü')}
        <span style={{ width: 1, height: 20, background: s.border, margin: '0 4px' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: s.text3 }}>Sırala:</span>
        {[
          { id: 'isim', l: 'İsim' },
          { id: 'net_cok', l: 'Son net ↑' },
          { id: 'net_az', l: 'Son net ↓' },
        ].map(x => (
          <button
            type="button"
            key={x.id}
            onClick={() => setSira(x.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              background: sira === x.id ? s.surface2 : 'transparent',
              color: sira === x.id ? s.accent : s.text3,
            }}
          >
            {x.l}
          </button>
        ))}
      </div>

      <Input
        value={arama}
        onChange={e => setArama(e.target.value)}
        placeholder="Öğrenci ara…"
        style={{ marginBottom: 16, borderRadius: 12, padding: '12px 16px' }}
      />

      {yukleniyor ? (
        <LoadingState />
      ) : listelenen.length === 0 ? (
        <Card style={{ padding: 32 }}>
          <EmptyState mesaj="Filtreye uygun öğrenci yok" icon="📊" />
        </Card>
      ) : (
        <DenemeYonetimiListesi listelenen={listelenen} s={s} mobil={mobil} detay={detay} />
      )}
    </div>
  );
}

DenemeYonetimiSayfasi.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGeri: PropTypes.func.isRequired,
};
