/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, renkler } from '../theme';
import { Card, Btn } from '../components/Shared';

export default function VeliRaporlariSayfasi({ tema, ogrenciler, onGeri }) {
  const s = getS(tema);
  const [veriler, setVeriler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getir = async () => {
      const obj = {};
      for (const o of ogrenciler) {
        try {
          const ps = await getDocs(collection(db, 'ogrenciler', o.id, 'program'));
          const prog = ps.docs.map(d => ({ id: d.id, ...d.data() }));
          const ds = await getDocs(collection(db, 'ogrenciler', o.id, 'denemeler'));
          const den = ds.docs.map(d => ({ id: d.id, ...d.data() }));
          den.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
          obj[o.id] = { prog, den };
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
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: s.text }}>Veli Raporlari</h2>
      </div>
      {yukleniyor ? <div style={{ textAlign: 'center', padding: '60px', color: s.text3 }}>Yukleniyor...</div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ogrenciler.map((o, i) => {
            const d = veriler[o.id] || { prog: [], den: [] };
            const tam = d.prog.filter(p => p.tamamlandi).length;
            const oran = d.prog.length > 0 ? Math.round((tam / d.prog.length) * 100) : 0;
            const son = d.den[0];
            return (
              <Card key={o.id} tema={tema} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${renkler[i % renkler.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: renkler[i % renkler.length], fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                  {o.isim.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: s.text, fontSize: '15px', fontWeight: '600' }}>{o.isim}</div>
                  <div style={{ color: s.text2, fontSize: '12px', marginTop: '2px' }}>{o.tur} · {o.email}</div>
                  {o.veliEmail && <div style={{ color: s.text3, fontSize: '11px', marginTop: '2px' }}>Veli: {o.veliEmail}</div>}
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: oran >= 80 ? '#10B981' : oran >= 50 ? '#F59E0B' : '#F43F5E' }}>{oran}%</div><div style={{ fontSize: '11px', color: s.text3 }}>Program</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: s.accent }}>{son ? son.toplamNet : '—'}</div><div style={{ fontSize: '11px', color: s.text3 }}>Son Net</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>{d.den.length}</div><div style={{ fontSize: '11px', color: s.text3 }}>Deneme</div></div>
                </div>
                {!o.veliEmail && <div style={{ background: 'rgba(244,63,94,0.1)', color: '#F43F5E', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', border: '1px solid rgba(244,63,94,0.2)' }}>Veli yok</div>}
              </Card>
            );
          })}
        </div>}
    </div>
  );
}
