import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { serverTimestamp } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/Toast';
import {
  ayYilStr,
  ayLabel,
  aylarListesi,
  tlFormat,
  MIN_AY,
  ODEME_YONTEMLERI,
} from './maliSabitleri';
import { odemeKaydet } from './useMaliVeri';
import OgrenciUcretAyarlari from './OgrenciUcretAyarlari';
import OdemeEkleModal from './OdemeEkleModal';

function durum(odeme, ayYil) {
  if (odeme?.odendi) return 'odendi';
  if (ayYil < ayYilStr()) return 'gecikmis';
  return 'bekliyor';
}

const DURUM_ETIKET = { odendi: 'Ödendi', gecikmis: 'Gecikmiş', bekliyor: 'Bekliyor' };
const DURUM_RENK = { odendi: '#10b981', gecikmis: '#ef4444', bekliyor: '#f59e0b' };

function OdemeIslem({ satir, ayYil, onTamamla }) {
  const { s } = useTheme();
  const [acik, setAcik] = useState(false);
  const [yontem, setYontem] = useState('IBAN');
  const [not, setNot] = useState('');
  const [islem, setIslem] = useState(false);
  const toast = useToast();

  if (satir.odeme?.odendi) return null;

  const kaydet = async () => {
    setIslem(true);
    try {
      await odemeKaydet(satir.id, ayYil, {
        ogrenciAdi: satir.isim || satir.email,
        bedelTL: satir.aylikUcret,
        iskontoOrani: satir.iskontoOrani || 0,
        iskontoKodu: satir.iskontoKodu || '',
        odenecekTutar: satir.odenecekTutar,
        odendi: true,
        odemeTarihi: serverTimestamp(),
        odemeYontemi: yontem,
        not,
      });
      toast('Ödeme işaretlendi.');
      setAcik(false);
      onTamamla?.();
    } catch {
      toast('Hata oluştu.', 'error');
    } finally {
      setIslem(false);
    }
  };

  return acik ? (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {ODEME_YONTEMLERI.map(y => (
        <button
          key={y}
          onClick={() => setYontem(y)}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
            background: yontem === y ? s.accent : s.surface2,
            color: yontem === y ? '#fff' : s.text2,
            border: `1px solid ${s.border}`,
          }}
        >
          {y}
        </button>
      ))}
      <input
        placeholder="Not (opsiyonel)"
        value={not}
        onChange={e => setNot(e.target.value)}
        style={{
          fontSize: 12,
          padding: '4px 8px',
          borderRadius: 6,
          border: `1px solid ${s.border}`,
          background: s.surface2,
          color: s.text,
          width: 120,
        }}
      />
      <button
        onClick={kaydet}
        disabled={islem}
        style={{
          padding: '4px 12px',
          borderRadius: 6,
          fontSize: 12,
          background: '#10b981',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {islem ? '...' : 'Kaydet'}
      </button>
      <button
        onClick={() => setAcik(false)}
        style={{
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 12,
          background: s.surface2,
          color: s.text2,
          border: `1px solid ${s.border}`,
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  ) : (
    <button
      onClick={() => setAcik(true)}
      style={{
        padding: '5px 12px',
        borderRadius: 8,
        fontSize: 12,
        background: '#10b981',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      Ödendi İşaretle
    </button>
  );
}

export default function OdemeListesi({ ogrenciler, odemeler }) {
  const { s } = useTheme();
  const [seciliAy, setSeciliAy] = useState(ayYilStr());
  const [ayarModal, setAyarModal] = useState(null);
  const [odemeEkleAcik, setOdemeEkleAcik] = useState(false);
  const [yerelOgrenciler, setYerelOgrenciler] = useState(ogrenciler);

  const aylar = aylarListesi(MIN_AY);

  const aktifOgrenciler = React.useMemo(
    () =>
      yerelOgrenciler
        .filter(o => o.baslangicAyi && o.baslangicAyi <= seciliAy && Number(o.aylikUcret) > 0)
        .map(o => {
          const odeme = odemeler.find(od => od.ogrenciId === o.id && od.ayYil === seciliAy);
          const bedelTL = Number(o.aylikUcret) || 0;
          const iskontoOrani = Number(o.iskontoOrani) || 0;
          const odenecekTutar = Math.round(bedelTL * (1 - iskontoOrani / 100));
          return { ...o, odeme, bedelTL, iskontoOrani, odenecekTutar };
        }),
    [yerelOgrenciler, odemeler, seciliAy]
  );

  const ayarGuncelle = guncellenen => {
    setYerelOgrenciler(prev => prev.map(o => (o.id === guncellenen.id ? guncellenen : o)));
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <select
          value={seciliAy}
          onChange={e => setSeciliAy(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: `1px solid ${s.border}`,
            background: s.surface,
            color: s.text,
            fontSize: 14,
          }}
        >
          {aylar.map(a => (
            <option key={a} value={a}>
              {ayLabel(a)}
            </option>
          ))}
        </select>
        <div style={{ color: s.text2, fontSize: 13 }}>{aktifOgrenciler.length} öğrenci</div>
        <button
          onClick={() => setOdemeEkleAcik(true)}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            borderRadius: 10,
            background: s.accent,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          + Gelir Ekle
        </button>
      </div>

      {aktifOgrenciler.length === 0 ? (
        <div style={{ textAlign: 'center', color: s.text3, padding: 40, fontSize: 14 }}>
          Bu ay için ücret tanımlı öğrenci yok.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {aktifOgrenciler.map(satir => {
            const d = durum(satir.odeme, seciliAy);
            return (
              <div
                key={satir.id}
                style={{
                  background: s.surface,
                  borderRadius: 12,
                  padding: '12px 16px',
                  border: `1px solid ${s.border}`,
                  borderLeft: `4px solid ${DURUM_RENK[d]}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: '1 1 150px' }}>
                  <div style={{ fontWeight: 600, color: s.text, fontSize: 14 }}>
                    {satir.isim || satir.email}
                  </div>
                  {satir.iskontoOrani > 0 && (
                    <div style={{ fontSize: 11, color: s.text3 }}>
                      {tlFormat(satir.bedelTL)} - %{satir.iskontoOrani} iskonto
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: s.text,
                    flex: '0 0 100px',
                    textAlign: 'right',
                  }}
                >
                  {tlFormat(satir.odenecekTutar)}
                </div>
                <div
                  style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: `${DURUM_RENK[d]}22`,
                    color: DURUM_RENK[d],
                    flex: '0 0 auto',
                  }}
                >
                  {DURUM_ETIKET[d]}
                  {d === 'odendi' && satir.odeme?.odemeYontemi && (
                    <span style={{ marginLeft: 4, opacity: 0.7 }}>
                      · {satir.odeme.odemeYontemi}
                    </span>
                  )}
                </div>
                <OdemeIslem satir={satir} ayYil={seciliAy} />
                <button
                  onClick={() => setAyarModal(satir)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    background: s.surface2,
                    color: s.text2,
                    border: `1px solid ${s.border}`,
                    cursor: 'pointer',
                  }}
                >
                  Ayarla
                </button>
              </div>
            );
          })}
        </div>
      )}

      {ayarModal && (
        <OgrenciUcretAyarlari
          ogrenci={ayarModal}
          onKapat={() => setAyarModal(null)}
          onKaydet={ayarGuncelle}
        />
      )}

      {odemeEkleAcik && (
        <OdemeEkleModal ogrenciler={yerelOgrenciler} onKapat={() => setOdemeEkleAcik(false)} />
      )}
    </div>
  );
}

OdemeListesi.propTypes = {
  ogrenciler: PropTypes.array.isRequired,
  odemeler: PropTypes.array.isRequired,
};
