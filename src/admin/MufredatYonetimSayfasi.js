import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Card, Btn, Input, LoadingState } from '../components/Shared';

const TUR_SECENEKLER = [
  { id: 'lgs', label: 'LGS' },
  { id: 'tyt', label: 'TYT' },
  { id: 'ayt_sayisal', label: 'AYT Sayısal' },
  { id: 'ayt_ea', label: 'AYT EA' },
  { id: 'ayt_sozel', label: 'AYT Sözel' },
  { id: 'ayt_dil', label: 'AYT Dil / YDT' },
];

export default function MufredatYonetimSayfasi({ s, mobil }) {
  const toast = useToast();
  const [seciliTur, setSeciliTur] = useState('tyt');
  const [konular, setKonular] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [yeniKonuFormu, setYeniKonuFormu] = useState(false);
  const [yeniKonu, setYeniKonu] = useState({
    dersLabel: '',
    konu: '',
    tahminiSaat: 2,
    kritik: false,
  });

  const konulariGetir = useCallback(
    async tur => {
      setYukleniyor(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'mufredat', tur, 'konular'), orderBy('sira'))
        );
        setKonular(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        toast('Konular alınamadı.', 'error');
      }
      setYukleniyor(false);
    },
    [toast]
  );

  useEffect(() => {
    konulariGetir(seciliTur);
  }, [seciliTur, konulariGetir]);

  const saatGuncelle = async (konuId, yeniSaat) => {
    try {
      await updateDoc(doc(db, 'mufredat', seciliTur, 'konular', konuId), {
        tahminiSaat: Number(yeniSaat),
        guncelleme: serverTimestamp(),
      });
      setKonular(prev =>
        prev.map(k => (k.id === konuId ? { ...k, tahminiSaat: Number(yeniSaat) } : k))
      );
    } catch {
      toast('Güncelleme başarısız.', 'error');
    }
  };

  const kritikToggle = async (konuId, mevcutDeger) => {
    try {
      await updateDoc(doc(db, 'mufredat', seciliTur, 'konular', konuId), {
        kritik: !mevcutDeger,
        guncelleme: serverTimestamp(),
      });
      setKonular(prev => prev.map(k => (k.id === konuId ? { ...k, kritik: !mevcutDeger } : k)));
    } catch {
      toast('Güncelleme başarısız.', 'error');
    }
  };

  const konuSil = async konuId => {
    try {
      await deleteDoc(doc(db, 'mufredat', seciliTur, 'konular', konuId));
      setKonular(prev => prev.filter(k => k.id !== konuId));
      toast('Konu silindi.');
    } catch {
      toast('Silinemedi.', 'error');
    }
  };

  const konuEkle = async () => {
    if (!yeniKonu.konu.trim() || !yeniKonu.dersLabel.trim())
      return toast('Konu ve ders adı boş olamaz.', 'info');
    try {
      const konuId = `${yeniKonu.dersLabel.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`;
      await setDoc(doc(db, 'mufredat', seciliTur, 'konular', konuId), {
        ders: yeniKonu.dersLabel.toLowerCase().replace(/\s/g, '_'),
        dersLabel: yeniKonu.dersLabel.trim(),
        konu: yeniKonu.konu.trim(),
        tahminiSaat: Number(yeniKonu.tahminiSaat) || 2,
        kritik: yeniKonu.kritik,
        sira: konular.length,
        olusturma: serverTimestamp(),
      });
      toast('Konu eklendi.');
      setYeniKonuFormu(false);
      setYeniKonu({ dersLabel: '', konu: '', tahminiSaat: 2, kritik: false });
      konulariGetir(seciliTur);
    } catch {
      toast('Eklenemedi.', 'error');
    }
  };

  const dersGruplari = useMemo(() => {
    const gruplar = {};
    konular.forEach(k => {
      const key = k.dersLabel || k.ders || '—';
      if (!gruplar[key]) gruplar[key] = [];
      gruplar[key].push(k);
    });
    return gruplar;
  }, [konular]);

  return (
    <div style={{ padding: mobil ? 16 : 28, maxWidth: 960 }}>
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: s.text, margin: 0 }}>
            📚 Müfredat Yönetimi
          </h2>
          <div style={{ fontSize: 13, color: s.text2, marginTop: 4 }}>{konular.length} konu</div>
        </div>
        <Btn onClick={() => setYeniKonuFormu(true)}>+ Yeni Konu</Btn>
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

      {yeniKonuFormu && (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ color: s.text, fontWeight: 700, marginBottom: 12 }}>Yeni Konu Ekle</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobil ? '1fr' : '1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <Input
              placeholder="Ders adı (ör. Matematik)"
              value={yeniKonu.dersLabel}
              onChange={e => setYeniKonu(p => ({ ...p, dersLabel: e.target.value }))}
            />
            <Input
              placeholder="Konu adı (ör. Türev)"
              value={yeniKonu.konu}
              onChange={e => setYeniKonu(p => ({ ...p, konu: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: s.text2 }}>Tahmini saat:</div>
            <select
              value={yeniKonu.tahminiSaat}
              onChange={e => setYeniKonu(p => ({ ...p, tahminiSaat: e.target.value }))}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: s.surface2,
                border: `1px solid ${s.border}`,
                color: s.text,
              }}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                <option key={n} value={n}>
                  {n} saat
                </option>
              ))}
            </select>
            <div
              onClick={() => setYeniKonu(p => ({ ...p, kritik: !p.kritik }))}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                background: yeniKonu.kritik ? 'rgba(244,63,94,0.12)' : s.surface2,
                color: yeniKonu.kritik ? '#F43F5E' : s.text2,
                border: `1px solid ${yeniKonu.kritik ? '#F43F5E' : s.border}`,
              }}
            >
              🔥 Kritik
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={() => setYeniKonuFormu(false)} variant="ghost" style={{ flex: 1 }}>
              İptal
            </Btn>
            <Btn onClick={konuEkle} style={{ flex: 2 }}>
              Ekle
            </Btn>
          </div>
        </Card>
      )}

      {yukleniyor ? (
        <LoadingState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(dersGruplari).map(([dersAdi, dersKonular]) => (
            <Card key={dersAdi} style={{ overflow: 'hidden' }}>
              <div
                style={{
                  padding: '12px 18px',
                  borderBottom: `1px solid ${s.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ color: s.text, fontWeight: 700, fontSize: 14 }}>{dersAdi}</div>
                <div style={{ fontSize: 12, color: s.text3 }}>{dersKonular.length} konu</div>
              </div>
              {dersKonular.map((konu, i) => (
                <div
                  key={konu.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 18px',
                    borderBottom: i < dersKonular.length - 1 ? `1px solid ${s.border}` : 'none',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: s.text, fontSize: 13, fontWeight: 500 }}>{konu.konu}</div>
                  </div>
                  <div
                    onClick={() => kritikToggle(konu.id, konu.kritik)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      background: konu.kritik ? 'rgba(244,63,94,0.12)' : s.surface2,
                      color: konu.kritik ? '#F43F5E' : s.text3,
                    }}
                  >
                    🔥 {konu.kritik ? 'Kritik' : 'Normal'}
                  </div>
                  <select
                    value={konu.tahminiSaat || 2}
                    onChange={e => saatGuncelle(konu.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 8,
                      background: s.surface2,
                      border: `1px solid ${s.border}`,
                      color: s.text,
                      fontSize: 12,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                      <option key={n} value={n}>
                        {n}s
                      </option>
                    ))}
                  </select>
                  <div
                    onClick={() => konuSil(konu.id)}
                    style={{ color: s.text3, cursor: 'pointer', fontSize: 13, padding: '0 4px' }}
                  >
                    ✕
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
