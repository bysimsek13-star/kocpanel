/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, verimlilikDurum } from '../theme';
import { Card } from '../components/Shared';

export default function HaftalikVerimlilik({ tema, ogrenciId }) {
  const s = getS(tema);
  const [veriler, setVeriler] = useState([]);
  const gunler = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'];

  useEffect(() => {
    const getir = async () => {
      try {
        const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'calisma'));
        setVeriler(snap.docs.map(d => ({ tarih: d.id, ...d.data() })));
      } catch (e) { }
    };
    getir();
  }, []);

  const bugun = new Date();
  const haftaGunleri = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(bugun);
    d.setDate(bugun.getDate() - bugun.getDay() + i + 1);
    return d.toISOString().split('T')[0];
  });

  return (
    <Card tema={tema} style={{ padding: '20px' }}>
      <div style={{ fontWeight: '700', fontSize: '15px', color: s.text, marginBottom: '16px' }}>Bu Hafta Verimlilik</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {haftaGunleri.map((tarih, i) => {
          const veri = veriler.find(v => v.tarih === tarih);
          const durum = veri ? verimlilikDurum(veri.verimlilik) : null;
          return (
            <div key={tarih} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: s.text3, marginBottom: '6px', fontWeight: '500' }}>{gunler[i]}</div>
              <div style={{ height: '64px', borderRadius: '10px', background: durum ? `${durum.renk}20` : s.surface2, border: `1px solid ${durum ? durum.renk : s.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', transition: 'all 0.2s' }}>
                {durum ? (
                  <><div style={{ fontSize: '18px' }}>{durum.emoji}</div><div style={{ fontSize: '11px', fontWeight: '700', color: durum.renk }}>{veri.verimlilik}%</div></>
                ) : <div style={{ fontSize: '12px', color: s.text3 }}>—</div>}
              </div>
              {veri && <div style={{ fontSize: '10px', color: s.text3, marginTop: '4px' }}>{veri.saat}s</div>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
