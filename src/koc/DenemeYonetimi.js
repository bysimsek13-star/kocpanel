/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, renkler } from '../theme';
import { Card, Btn } from '../components/Shared';

export default function DenemeYonetimiSayfasi({ tema, ogrenciler, onGeri }) {
  const s = getS(tema);
  const [veriler, setVeriler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getir = async () => {
      const obj = {};
      for (const o of ogrenciler) {
        try {
          const snap = await getDocs(collection(db, 'ogrenciler', o.id, 'denemeler'));
          const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          liste.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
          obj[o.id] = liste;
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
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: s.text }}>Deneme Yonetimi</h2>
      </div>
      {yukleniyor ? <div style={{ textAlign: 'center', padding: '60px', color: s.text3 }}>Yukleniyor...</div> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
          {ogrenciler.map((o, i) => {
            const den = veriler[o.id] || [];
            const son = den[0]; const onc = den[1];
            const fark = son && onc ? (parseFloat(son.toplamNet) - parseFloat(onc.toplamNet)).toFixed(1) : null;
            return (
              <Card key={o.id} tema={tema}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${renkler[i % renkler.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: renkler[i % renkler.length], fontWeight: '700', fontSize: '13px' }}>
                    {o.isim.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}><div style={{ color: s.text, fontWeight: '600' }}>{o.isim}</div><div style={{ color: s.text2, fontSize: '12px' }}>{den.length} deneme</div></div>
                  {son && <div style={{ textAlign: 'right' }}><div style={{ fontSize: '22px', fontWeight: '700', color: s.accent }}>{son.toplamNet}</div><div style={{ fontSize: '10px', color: s.text3 }}>{son.sinav} net</div></div>}
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {den.length === 0 ? <div style={{ color: s.text3, fontSize: '13px', textAlign: 'center' }}>Deneme sonucu yok</div> : <>
                    {fark !== null && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '10px 14px', background: parseFloat(fark) >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', borderRadius: '10px', border: `1px solid ${parseFloat(fark) >= 0 ? '#10B981' : '#F43F5E'}` }}>
                      <span style={{ fontSize: '16px' }}>{parseFloat(fark) >= 0 ? 'yukseldi' : 'dustu'}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: parseFloat(fark) >= 0 ? '#10B981' : '#F43F5E' }}>{parseFloat(fark) >= 0 ? '+' : ''}{fark} net degisim</span>
                    </div>}
                    {den.slice(0, 3).map(d => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${s.border}` }}>
                        <div style={{ background: s.accentSoft, color: s.accent, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{d.sinav}</div>
                        <div style={{ fontSize: '12px', color: s.text2, flex: 1 }}>{d.tarih}</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: s.accent }}>{d.toplamNet}</div>
                      </div>
                    ))}
                  </>}
                </div>
              </Card>
            );
          })}
        </div>}
    </div>
  );
}
