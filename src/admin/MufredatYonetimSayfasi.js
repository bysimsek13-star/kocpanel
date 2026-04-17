import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Card, Btn, Input, LoadingState } from '../components/Shared';
import MufredatAgaci from './MufredatAgaci';
import { agaciDuzlestir, TYT_AGAC } from '../data/tytMufredatSeed';
import { AYT_EA_AGAC, AYT_SAYISAL_AGAC, AYT_SOZEL_AGAC } from '../data/aytMufredatSeed';
import { LGS_AGAC } from '../data/lgsMufredatSeed';
import { LISE9_AGAC } from '../data/lise9Seed';
import { LISE10_AGAC } from '../data/lise10Seed';

const SEED_AGACLARI = {
  tyt: TYT_AGAC,
  lgs: LGS_AGAC,
  ayt_ea: AYT_EA_AGAC,
  ayt_sayisal: AYT_SAYISAL_AGAC,
  ayt_sozel: AYT_SOZEL_AGAC,
  lise9_tymm: LISE9_AGAC,
  lise10_tymm: LISE10_AGAC,
};

const TUR_SECENEKLER = [
  { id: 'lgs', label: 'LGS' },
  { id: 'tyt', label: 'TYT' },
  { id: 'ayt_sayisal', label: 'AYT Sayısal' },
  { id: 'ayt_ea', label: 'AYT EA' },
  { id: 'ayt_sozel', label: 'AYT Sözel' },
  { id: 'ayt_dil', label: 'AYT Dil / YDT' },
  { id: 'lise9_tymm', label: '9. Sınıf' },
  { id: 'lise10_tymm', label: '10. Sınıf' },
];

export default function MufredatYonetimSayfasi({ s, mobil }) {
  const toast = useToast();
  const [seciliTur, setSeciliTur] = useState('tyt');
  const [dugumler, setDugumler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [seedYukleniyor, setSeedYukleniyor] = useState(false);
  const [yeniDersFormu, setYeniDersFormu] = useState(false);
  const [yeniDersAd, setYeniDersAd] = useState('');

  const dugumlerGetir = useCallback(
    async tur => {
      setYukleniyor(true);
      try {
        const snap = await getDocs(collection(db, 'mufredat', tur, 'dugumler'));
        setDugumler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        toast('Müfredat alınamadı.', 'error');
      }
      setYukleniyor(false);
    },
    [toast]
  );

  useEffect(() => {
    dugumlerGetir(seciliTur);
  }, [seciliTur, dugumlerGetir]);

  const onEkle = async (parentId, ad, seviye) => {
    const id = `${parentId}_${Date.now()}`;
    const sira = dugumler.filter(d => d.parentId === parentId).length;
    try {
      await setDoc(doc(db, 'mufredat', seciliTur, 'dugumler', id), {
        parentId,
        seviye,
        ad,
        sira,
        olusturma: serverTimestamp(),
      });
      setDugumler(prev => [...prev, { id, parentId, seviye, ad, sira }]);
    } catch {
      toast('Eklenemedi.', 'error');
    }
  };

  const onDersEkle = async () => {
    if (!yeniDersAd.trim()) return;
    const id = `${seciliTur}_${Date.now()}`;
    const sira = dugumler.filter(d => !d.parentId).length;
    try {
      await setDoc(doc(db, 'mufredat', seciliTur, 'dugumler', id), {
        parentId: null,
        seviye: 1,
        ad: yeniDersAd.trim(),
        sira,
        olusturma: serverTimestamp(),
      });
      setDugumler(prev => [
        ...prev,
        { id, parentId: null, seviye: 1, ad: yeniDersAd.trim(), sira },
      ]);
      setYeniDersFormu(false);
      setYeniDersAd('');
    } catch {
      toast('Eklenemedi.', 'error');
    }
  };

  const onSil = async id => {
    const silinecekler = new Set();
    const kuyruk = [id];
    while (kuyruk.length > 0) {
      const cari = kuyruk.shift();
      silinecekler.add(cari);
      dugumler.filter(d => d.parentId === cari).forEach(d => kuyruk.push(d.id));
    }
    try {
      let batch = writeBatch(db);
      let sayac = 0;
      for (const did of silinecekler) {
        batch.delete(doc(db, 'mufredat', seciliTur, 'dugumler', did));
        sayac++;
        if (sayac % 400 === 0) {
          await batch.commit();
          batch = writeBatch(db);
        }
      }
      await batch.commit();
      setDugumler(prev => prev.filter(d => !silinecekler.has(d.id)));
      toast(`${silinecekler.size} düğüm silindi.`);
    } catch {
      toast('Silinemedi.', 'error');
    }
  };

  const onDuzenle = async (id, ad) => {
    try {
      await updateDoc(doc(db, 'mufredat', seciliTur, 'dugumler', id), {
        ad,
        guncelleme: serverTimestamp(),
      });
      setDugumler(prev => prev.map(d => (d.id === id ? { ...d, ad } : d)));
    } catch {
      toast('Güncellenemedi.', 'error');
    }
  };

  const seedMufredat = async () => {
    const agac = SEED_AGACLARI[seciliTur];
    if (!agac) return;
    if (
      !window.confirm(
        `${seciliTur.toUpperCase()} müfredatını yükle? Mevcut veriler üzerine yazılır.`
      )
    )
      return;
    setSeedYukleniyor(true);
    try {
      const docs = agaciDuzlestir(seciliTur, agac);
      let batch = writeBatch(db);
      let sayac = 0;
      for (const d of docs) {
        batch.set(doc(db, 'mufredat', seciliTur, 'dugumler', d.id), {
          parentId: d.parentId,
          seviye: d.seviye,
          ad: d.ad,
          sira: d.sira,
          olusturma: serverTimestamp(),
        });
        sayac++;
        if (sayac % 400 === 0) {
          await batch.commit();
          batch = writeBatch(db);
        }
      }
      await batch.commit();
      toast(`${docs.length} düğüm yüklendi.`);
      await dugumlerGetir(seciliTur);
    } catch (e) {
      console.error(e);
      toast('Seed başarısız.', 'error');
    }
    setSeedYukleniyor(false);
  };

  return (
    <div style={{ padding: mobil ? 16 : 28, maxWidth: 900 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: s.text, margin: 0 }}>
            Müfredat Yönetimi
          </h2>
          <div style={{ fontSize: 13, color: s.text2, marginTop: 4 }}>
            {dugumler.length > 0 ? `${dugumler.length} düğüm` : 'Henüz içerik yok'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SEED_AGACLARI[seciliTur] && (
            <Btn onClick={seedMufredat} variant="ghost" disabled={seedYukleniyor}>
              {seedYukleniyor ? 'Yükleniyor…' : 'Seed Yükle'}
            </Btn>
          )}
          <Btn onClick={() => setYeniDersFormu(!yeniDersFormu)}>+ Ders Ekle</Btn>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TUR_SECENEKLER.map(t => (
          <div
            key={t.id}
            onClick={() => setSeciliTur(t.id)}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              background: seciliTur === t.id ? s.accentSoft : s.surface2,
              color: seciliTur === t.id ? s.accent : s.text2,
              border: `1px solid ${seciliTur === t.id ? s.accent : s.border}`,
            }}
          >
            {t.label}
          </div>
        ))}
      </div>

      {yeniDersFormu && (
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              placeholder="Ders adı"
              value={yeniDersAd}
              onChange={e => setYeniDersAd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onDersEkle()}
              style={{ flex: 1 }}
            />
            <Btn onClick={onDersEkle}>Ekle</Btn>
            <Btn
              onClick={() => {
                setYeniDersFormu(false);
                setYeniDersAd('');
              }}
              variant="ghost"
            >
              İptal
            </Btn>
          </div>
        </Card>
      )}

      {yukleniyor ? (
        <LoadingState />
      ) : dugumler.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: s.text3, fontSize: 14 }}>
          Bu müfredat için henüz düğüm yok.
          {SEED_AGACLARI[seciliTur] && (
            <div style={{ marginTop: 12 }}>
              <Btn onClick={seedMufredat} disabled={seedYukleniyor}>
                {seedYukleniyor ? 'Yükleniyor…' : 'Müfredatı Yükle'}
              </Btn>
            </div>
          )}
        </div>
      ) : (
        <Card style={{ padding: '12px 8px' }}>
          <MufredatAgaci
            dugumler={dugumler}
            onEkle={onEkle}
            onSil={onSil}
            onDuzenle={onDuzenle}
            s={s}
          />
        </Card>
      )}
    </div>
  );
}
