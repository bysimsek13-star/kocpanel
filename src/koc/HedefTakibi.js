/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, renkler } from '../theme';
import { Card, Btn } from '../components/Shared';

export default function HedefTakibiSayfasi({ tema, ogrenciler, onGeri }) {
  const s = getS(tema);
  const [hedefler, setHedefler] = useState({});
  const [yeniHedef, setYeniHedef] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getir = async () => {
      const obj = {};
      for (const o of ogrenciler) {
        try {
          const snap = await getDocs(collection(db, 'ogrenciler', o.id, 'hedefler'));
          obj[o.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) { }
      }
      setHedefler(obj); setYukleniyor(false);
    };
    getir();
  }, []);

  const hedefEkle = async (oid) => {
    const h = yeniHedef[oid];
    if (!h?.baslik || !h?.deger) return;
    try {
      await addDoc(collection(db, 'ogrenciler', oid, 'hedefler'), { baslik: h.baslik, deger: h.deger, olusturma: new Date() });
      setYeniHedef(prev => ({ ...prev, [oid]: { baslik: '', deger: '' } }));
      const snap = await getDocs(collection(db, 'ogrenciler', oid, 'hedefler'));
      setHedefler(prev => ({ ...prev, [oid]: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
    } catch (e) { alert(e.message); }
  };

  return (
    <div style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{ padding: '8px 16px' }}>Geri</Btn>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: s.text }}>Hedef Takibi</h2>
      </div>
      {yukleniyor ? <div style={{ textAlign: 'center', padding: '60px', color: s.text3 }}>Yukleniyor...</div> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
          {ogrenciler.map((o, i) => {
            const hList = hedefler[o.id] || [];
            const yh = yeniHedef[o.id] || { baslik: '', deger: '' };
            return (
              <Card key={o.id} tema={tema}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `${renkler[i % renkler.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: renkler[i % renkler.length], fontWeight: '700', fontSize: '12px' }}>
                    {o.isim.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ color: s.text, fontWeight: '600' }}>{o.isim}</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input value={yh.baslik} onChange={e => setYeniHedef(prev => ({ ...prev, [o.id]: { ...prev[o.id], baslik: e.target.value } }))} placeholder="Hedef (orn: TYT Net)"
                      style={{ flex: 1, background: s.surface2, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '8px 12px', color: s.text, fontSize: '13px', outline: 'none' }} />
                    <input value={yh.deger} onChange={e => setYeniHedef(prev => ({ ...prev, [o.id]: { ...prev[o.id], deger: e.target.value } }))} placeholder="Deger"
                      style={{ width: '70px', background: s.surface2, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '8px 12px', color: s.text, fontSize: '13px', outline: 'none' }} />
                    <Btn tema={tema} onClick={() => hedefEkle(o.id)} style={{ padding: '8px 12px', fontSize: '14px' }}>+</Btn>
                  </div>
                  {hList.length === 0 ? <div style={{ color: s.text3, fontSize: '13px', textAlign: 'center', padding: '8px' }}>Henuz hedef yok</div> :
                    hList.map(h => (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: s.surface2, borderRadius: '10px', marginBottom: '6px' }}>
                        <div style={{ flex: 1, fontSize: '13px', color: s.text }}>{h.baslik}</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: s.accent }}>{h.deger}</div>
                      </div>
                    ))}
                </div>
              </Card>
            );
          })}
        </div>}
    </div>
  );
}
