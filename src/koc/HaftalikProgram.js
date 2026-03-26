/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, renkler, verimlilikDurum } from '../theme';
import { Card, Btn } from '../components/Shared';

export default function HaftalikProgramSayfasi({ tema, ogrenciler, onGeri }) {
  const s = getS(tema);
  const [veriler, setVeriler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getir = async () => {
      const obj = {};
      for (const o of ogrenciler) {
        try {
          const snap = await getDocs(collection(db, 'ogrenciler', o.id, 'program'));
          obj[o.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) { }
      }
      setVeriler(obj); setYukleniyor(false);
    };
    getir();
  }, []);

  return (
    <div style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{ padding: '8px 16px' }}>Geri</Btn>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: s.text }}>Haftalik Program</h2>
      </div>
      {yukleniyor ? <div style={{ textAlign: 'center', padding: '60px', color: s.text3 }}>Yukleniyor...</div> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px' }}>
          {ogrenciler.map((o, i) => {
            const prog = veriler[o.id] || [];
            const tam = prog.filter(p => p.tamamlandi).length;
            const oran = prog.length > 0 ? Math.round((tam / prog.length) * 100) : 0;
            return (
              <Card key={o.id} tema={tema}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${renkler[i % renkler.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: renkler[i % renkler.length], fontWeight: '700', fontSize: '13px' }}>
                    {o.isim.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}><div style={{ color: s.text, fontWeight: '600' }}>{o.isim}</div><div style={{ color: s.text2, fontSize: '12px' }}>{o.tur}</div></div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: oran >= 80 ? '#10B981' : oran >= 50 ? '#F59E0B' : '#F43F5E' }}>{oran}%</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ height: '6px', background: s.surface3, borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ height: '100%', width: oran + '%', background: oran >= 80 ? '#10B981' : oran >= 50 ? '#F59E0B' : '#F43F5E', borderRadius: '6px', transition: 'width 0.5s' }} />
                  </div>
                  {prog.length === 0 ? <div style={{ color: s.text3, fontSize: '12px', textAlign: 'center' }}>Program eklenmedi</div> :
                    prog.slice(0, 5).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: `1px solid ${s.border}` }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: p.tamamlandi ? '#10B981' : s.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', flexShrink: 0 }}>{p.tamamlandi && 'v'}</div>
                        <div style={{ flex: 1, fontSize: '13px', color: p.tamamlandi ? s.text3 : s.text, textDecoration: p.tamamlandi ? 'line-through' : 'none' }}>{p.gorev}</div>
                        <div style={{ fontSize: '11px', color: s.text3, background: s.surface2, padding: '2px 8px', borderRadius: '20px' }}>{p.ders}</div>
                      </div>
                    ))}
                  {prog.length > 5 && <div style={{ fontSize: '12px', color: s.text3, textAlign: 'center', marginTop: '8px' }}>+{prog.length - 5} gorev daha</div>}
                </div>
              </Card>
            );
          })}
        </div>}
    </div>
  );
}
