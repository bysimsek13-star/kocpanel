import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, getDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { useToast } from '../components/Toast';
import { Btn, LoadingState, EmptyState } from '../components/Shared';
import { haftalikOzetOlustur } from '../utils/timelineUtils';
import { haftaBaslangici, programV2ToGorevler } from '../utils/programAlgoritma';
import { logIstemciHatasi } from '../utils/izleme';
import RaporKarti from './RaporKarti';

export default function VeliRaporlariSayfasi({ ogrenciler, onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const toast = useToast();
  const [veriler, setVeriler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  const getir = async () => {
    setYukleniyor(true);
    const sonuclar = await Promise.all(
      ogrenciler.map(async o => {
        try {
          const haftaKey = haftaBaslangici();
          const [pvSnap, ds, cs, ms, rs] = await Promise.all([
            getDoc(doc(db, 'ogrenciler', o.id, 'program_v2', haftaKey)),
            getDocs(collection(db, 'ogrenciler', o.id, 'denemeler')),
            getDocs(collection(db, 'ogrenciler', o.id, 'calisma')),
            getDocs(collection(db, 'ogrenciler', o.id, 'mesajlar')),
            getDocs(collection(db, 'ogrenciler', o.id, 'veliRaporlari')),
          ]);
          const den = ds.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.tarih || 0) - new Date(a.tarih || 0));
          const raporlar = rs.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort(
              (a, b) =>
                new Date(b.haftaBitis || b.olusturma || 0) -
                new Date(a.haftaBitis || a.olusturma || 0)
            );
          const progData = pvSnap.exists() ? pvSnap.data() : null;
          const ozet = haftalikOzetOlustur({
            ogrenci: o,
            program: programV2ToGorevler(progData),
            denemeler: den,
            calisma: cs.docs.map(d => ({ id: d.id, ...d.data(), tarih: d.id })),
            mesajlar: ms.docs.map(d => ({ id: d.id, ...d.data() })),
            raporlar,
          });
          return [o.id, { ...ozet, sonRapor: raporlar[0] || null }];
        } catch (e) {
          logIstemciHatasi({
            error: e,
            info: `Veli rapor verisi alınamadı: ${o.id}`,
            kaynak: 'VeliRaporlari',
          });
          return [o.id, haftalikOzetOlustur({ ogrenci: o })];
        }
      })
    );
    setVeriler(Object.fromEntries(sonuclar));
    setYukleniyor(false);
  };

  useEffect(() => {
    getir();
  }, [ogrenciler]);

  const telefonGuncelle = async (ogrenciId, telefon) => {
    try {
      await updateDoc(doc(db, 'ogrenciler', ogrenciId), { veliTelefon: telefon });
      toast('Telefon kaydedildi');
    } catch {
      toast('Kaydedilemedi', 'error');
    }
  };

  const raporBekleyen = useMemo(
    () => Object.values(veriler).filter(v => v.veliRaporGerekli).length,
    [veriler]
  );

  return (
    <div style={{ padding: mobil ? 16 : 28 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <Btn onClick={onGeri} variant="outline" style={{ padding: '8px 16px' }}>
          ← Geri
        </Btn>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: s.text, margin: 0 }}>Veli Raporları</h2>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: s.text3, fontWeight: 600 }}>
          {raporBekleyen} öğrenci için rapor bekliyor
        </div>
      </div>

      {yukleniyor ? (
        <LoadingState />
      ) : ogrenciler.length === 0 ? (
        <EmptyState mesaj="Henüz öğrenci yok" icon="📋" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobil ? '1fr' : 'repeat(auto-fill,minmax(380px,1fr))',
            gap: 16,
          }}
        >
          {ogrenciler.map((o, i) => (
            <RaporKarti
              key={o.id}
              ogrenci={o}
              data={veriler[o.id] || {}}
              index={i}
              onTelefonGuncelle={telefonGuncelle}
              s={s}
            />
          ))}
        </div>
      )}
    </div>
  );
}

VeliRaporlariSayfasi.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGeri: PropTypes.func.isRequired,
};
