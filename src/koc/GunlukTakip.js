/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, renkler, verimlilikDurum } from '../theme';
import { Card, Btn } from '../components/Shared';

export default function GunlukTakipSayfasi({ tema, ogrenciler, onGeri }) {
  const s = getS(tema);
  const bugun = new Date().toISOString().split('T')[0];
  const [veriler, setVeriler] = useState({});
  const [calisma, setCalisma] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getir = async () => {
      const progObj = {}, calObj = {};
      for (const o of ogrenciler) {
        try {
          const snap = await getDocs(collection(db, 'ogrenciler', o.id, 'program'));
          progObj[o.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const cs = await getDoc(doc(db, 'ogrenciler', o.id, 'calisma', bugun));
          if (cs.exists()) calObj[o.id] = cs.data();
        } catch (e) { }
      }
      setVeriler(progObj); setCalisma(calObj); setYukleniyor(false);
    };
    getir();
  }, []);

  return (
    <div style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{ padding: '8px 16px' }}>Geri</Btn>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: s.text }}>Gunluk Takip — {bugun}</h2>
      </div>
      {yukleniyor ? <div style={{ textAlign: 'center', padding: '60px', color: s.text3 }}>Yukleniyor...</div> :
        <Card tema={tema}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 130px', padding: '12px 20px', background: s.surface2, borderBottom: `1px solid ${s.border}` }}>
            {['Ogrenci', 'Gorev', 'Tamamlama', 'Calisma', 'Verimlilik'].map(h => (
              <div key={h} style={{ fontSize: '11px', color: s.text3, fontWeight: '600', textTransform: 'uppercase', textAlign: h === 'Ogrenci' ? 'left' : 'center' }}>{h}</div>
            ))}
          </div>
          {ogrenciler.map((o, i) => {
            const prog = veriler[o.id] || [];
            const tam = prog.filter(p => p.tamamlandi).length;
            const oran = prog.length > 0 ? Math.round((tam / prog.length) * 100) : 0;
            const cal = calisma[o.id];
            const ver = cal ? verimlilikDurum(cal.verimlilik) : null;
            return (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 130px', padding: '14px 20px', borderBottom: `1px solid ${s.border}`, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `${renkler[i % renkler.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: renkler[i % renkler.length], fontWeight: '700', fontSize: '12px' }}>
                    {o.isim.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ color: s.text, fontSize: '13.5px', fontWeight: '500' }}>{o.isim}</div>
                    <div style={{ color: s.text2, fontSize: '11px' }}>{o.tur}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '13px', color: s.text2 }}>{tam}/{prog.length}</div>
                <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: '700', color: oran >= 80 ? '#10B981' : oran >= 50 ? '#F59E0B' : '#F43F5E' }}>{oran}%</div>
                <div style={{ textAlign: 'center', fontSize: '13px', color: cal ? s.text : s.text3 }}>{cal ? cal.saat + 's' : '—'}</div>
                <div style={{ textAlign: 'center' }}>
                  {ver ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><span>{ver.emoji}</span><span style={{ fontSize: '12px', fontWeight: '600', color: ver.renk }}>{ver.label}</span></div> :
                    <span style={{ fontSize: '12px', color: s.text3 }}>Giris yok</span>}
                </div>
              </div>
            );
          })}
        </Card>}
    </div>
  );
}
