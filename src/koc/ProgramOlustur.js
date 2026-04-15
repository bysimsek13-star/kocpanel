import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { KONULAR } from '../data/konular';
import { turdenBransDersler } from '../utils/sinavUtils';
import { useToast } from '../components/Toast';
import { LoadingState } from '../components/Shared';
import ProgramOlusturMufredat from './ProgramOlusturMufredat';
import ProgramOlusturHaftalik from './ProgramOlusturHaftalik';

export default function ProgramOlustur({ ogrenciId, ogrenciTur, onKaydet }) {
  const { s } = useTheme();
  const toast = useToast();
  const [sekme, setSekme] = useState('mufredat');
  const [mufredat, setMufredat] = useState([]);
  const [program, setProgram] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Müfredat formu
  const [seciliDers, setSeciliDers] = useState('');
  const [seciliKonu, setSeciliKonu] = useState('');
  const [saat, setSaat] = useState('');
  const [gun, setGun] = useState('');

  // Haftalık program formu
  const [gorev, setGorev] = useState('');
  const [gorevDers, setGorevDers] = useState('Matematik');

  const tumDersler = turdenBransDersler(ogrenciTur);
  const konuListesi = seciliDers ? KONULAR[seciliDers] || [] : [];
  const dersLabel = id => tumDersler.find(d => d.id === id)?.label || id;

  const getir = useCallback(async () => {
    try {
      const [ms, ps] = await Promise.all([
        getDocs(collection(db, 'ogrenciler', ogrenciId, 'mufredat')),
        getDocs(collection(db, 'ogrenciler', ogrenciId, 'program')),
      ]);
      setMufredat(ms.docs.map(d => ({ id: d.id, ...d.data() })));
      setProgram(ps.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  }, [ogrenciId]);

  useEffect(() => {
    getir();
  }, [getir]);

  const mufredatEkle = async () => {
    if (!seciliDers || !seciliKonu) {
      toast('Ders ve konu seçin', 'error');
      return;
    }
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'mufredat'), {
        dersId: seciliDers,
        ders: dersLabel(seciliDers),
        konu: seciliKonu,
        saat: parseFloat(saat) || 0,
        gun: parseInt(gun) || 0,
        tamamlandi: false,
        olusturma: new Date(),
      });
      setSeciliKonu('');
      setSaat('');
      setGun('');
      toast('Müfredata eklendi!');
      await getir();
    } catch {
      toast('Eklenemedi', 'error');
    }
  };

  const mufredatSil = async id => {
    try {
      await deleteDoc(doc(db, 'ogrenciler', ogrenciId, 'mufredat', id));
      toast('Silindi');
      await getir();
    } catch {
      toast('Silinemedi', 'error');
    }
  };

  const gorevEkle = async () => {
    if (!gorev.trim()) return;
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'program'), {
        gorev: gorev.trim(),
        ders: gorevDers,
        tamamlandi: false,
        tarih: new Date(),
      });
      setGorev('');
      toast('Görev eklendi!');
      await getir();
      if (onKaydet) onKaydet();
    } catch {
      toast('Eklenemedi', 'error');
    }
  };

  const gorevSil = async id => {
    try {
      await deleteDoc(doc(db, 'ogrenciler', ogrenciId, 'program', id));
      toast('Silindi');
      await getir();
      if (onKaydet) onKaydet();
    } catch {
      toast('Silinemedi', 'error');
    }
  };

  const dersGruplari = {};
  mufredat.forEach(m => {
    if (!dersGruplari[m.dersId]) dersGruplari[m.dersId] = { label: m.ders, konular: [] };
    dersGruplari[m.dersId].konular.push(m);
  });

  if (yukleniyor) return <LoadingState />;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 16,
          background: s.surface2,
          padding: 4,
          borderRadius: 10,
        }}
      >
        {[
          { key: 'mufredat', label: '📚 Müfredat' },
          { key: 'haftalik', label: '📅 Haftalık Program' },
        ].map(sk => (
          <div
            key={sk.key}
            onClick={() => setSekme(sk.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              background: sekme === sk.key ? s.surface : 'transparent',
              color: sekme === sk.key ? s.accent : s.text2,
              fontWeight: sekme === sk.key ? 600 : 400,
            }}
          >
            {sk.label}
          </div>
        ))}
      </div>

      {sekme === 'mufredat' && (
        <ProgramOlusturMufredat
          tumDersler={tumDersler}
          seciliDers={seciliDers}
          setSeciliDers={setSeciliDers}
          seciliKonu={seciliKonu}
          setSeciliKonu={setSeciliKonu}
          saat={saat}
          setSaat={setSaat}
          gun={gun}
          setGun={setGun}
          konuListesi={konuListesi}
          mufredatEkle={mufredatEkle}
          dersGruplari={dersGruplari}
          mufredatSil={mufredatSil}
          s={s}
        />
      )}

      {sekme === 'haftalik' && (
        <ProgramOlusturHaftalik
          gorev={gorev}
          setGorev={setGorev}
          gorevDers={gorevDers}
          setGorevDers={setGorevDers}
          gorevEkle={gorevEkle}
          gorevSil={gorevSil}
          program={program}
          s={s}
        />
      )}
    </div>
  );
}

ProgramOlustur.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  ogrenciTur: PropTypes.string,
  onKaydet: PropTypes.func.isRequired,
};
