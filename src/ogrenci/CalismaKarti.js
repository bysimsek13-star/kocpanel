/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, verimlilikHesapla, verimlilikDurum } from '../theme';
import { Card, Btn } from '../components/Shared';

export default function CalismaKarti({ tema, ogrenciId, beklenenSaat, gorevOrani, onKaydet }) {
  const s = getS(tema);
  const bugun = new Date().toISOString().split('T')[0];
  const [saat, setSaat] = useState('');
  const [kaydedildi, setKaydedildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mevcutSaat, setMevcutSaat] = useState(null);

  useEffect(() => {
    const getir = async () => {
      try {
        const snap = await getDoc(doc(db, 'ogrenciler', ogrenciId, 'calisma', bugun));
        if (snap.exists()) { setMevcutSaat(snap.data().saat); setSaat(String(snap.data().saat)); setKaydedildi(true); }
      } catch (e) { }
    };
    getir();
  }, []);

  const kaydet = async () => {
    const ss = parseFloat(saat);
    if (!ss || ss <= 0) return;
    setYukleniyor(true);
    try {
      const ver = verimlilikHesapla(ss, beklenenSaat, gorevOrani);
      await setDoc(doc(db, 'ogrenciler', ogrenciId, 'calisma', bugun), { saat: ss, tarih: bugun, verimlilik: ver, gorevOrani, beklenenSaat, olusturma: new Date() });
      setMevcutSaat(ss); setKaydedildi(true);
      if (onKaydet) onKaydet();
    } catch (e) { alert(e.message); }
    setYukleniyor(false);
  };

  const ver = mevcutSaat !== null ? verimlilikHesapla(mevcutSaat, beklenenSaat, gorevOrani) : null;
  const durum = ver !== null ? verimlilikDurum(ver) : null;

  return (
    <Card tema={tema} style={{ padding: '24px' }}>
      <div style={{ fontWeight: '700', fontSize: '16px', color: s.text, marginBottom: '20px' }}>⏱️ Bugün Kaç Saat Çalıştım?</div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        <input type="number" min="0" max="16" step="0.5" value={saat} onChange={e => setSaat(e.target.value)} placeholder="0"
          style={{ width: '90px', background: s.surface2, border: `2px solid ${s.border}`, borderRadius: '12px', padding: '12px', color: s.text, fontSize: '24px', fontWeight: '700', outline: 'none', textAlign: 'center' }} />
        <div style={{ fontSize: '16px', color: s.text2 }}>saat</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: '13px', color: s.text3 }}>Beklenen: <span style={{ color: s.text2, fontWeight: '600' }}>{beklenenSaat}s</span></div>
        <Btn tema={tema} onClick={kaydet} disabled={!saat || yukleniyor}>{yukleniyor ? '...' : kaydedildi ? 'Güncelle' : 'Kaydet'}</Btn>
      </div>
      {durum && (
        <div style={{ background: s.surface2, borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', border: `1px solid ${durum.renk}30` }}>
          <div style={{ fontSize: '36px' }}>{durum.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: durum.renk }}>{durum.label}</div>
            <div style={{ fontSize: '12px', color: s.text3, marginTop: '2px' }}>{mevcutSaat}s çalışıldı · %{gorevOrani} görev tamamlandı</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '36px', fontWeight: '800', color: durum.renk }}>{ver}%</div>
            <div style={{ fontSize: '12px', color: s.text3 }}>verimlilik</div>
          </div>
        </div>
      )}
      {durum && <div style={{ marginTop: '12px', height: '8px', background: s.surface3, borderRadius: '8px', overflow: 'hidden' }}><div style={{ height: '100%', width: ver + '%', background: durum.renk, borderRadius: '8px', transition: 'width 0.5s' }} /></div>}
    </Card>
  );
}
