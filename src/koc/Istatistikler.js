/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, renkler } from '../theme';
import { Card, StatCard, Btn } from '../components/Shared';

export default function IstatistiklerSayfasi({ tema, ogrenciler, onGeri }) {
  const s = getS(tema);
  const [veriler, setVeriler] = useState({ prog: {}, den: {}, cal: {} });
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getir = async () => {
      const prog = {}, den = {}, cal = {};
      for (const o of ogrenciler) {
        try {
          const ps = await getDocs(collection(db, 'ogrenciler', o.id, 'program'));
          prog[o.id] = ps.docs.map(d => ({ id: d.id, ...d.data() }));
          const ds = await getDocs(collection(db, 'ogrenciler', o.id, 'denemeler'));
          den[o.id] = ds.docs.map(d => ({ id: d.id, ...d.data() }));
          const cs = await getDocs(collection(db, 'ogrenciler', o.id, 'calisma'));
          cal[o.id] = cs.docs.map(d => ({ tarih: d.id, ...d.data() }));
        } catch (e) { }
      }
      setVeriler({ prog, den, cal }); setYukleniyor(false);
    };
    getir();
  }, []);

  const n = ogrenciler.length;
  const ortTam = n > 0 ? Math.round(ogrenciler.reduce((a, o) => { const p = veriler.prog[o.id] || []; const t = p.filter(x => x.tamamlandi).length; return a + (p.length > 0 ? Math.round((t / p.length) * 100) : 0); }, 0) / n) : 0;
  const topDen = Object.values(veriler.den).reduce((a, v) => a + v.length, 0);
  const ortCal = n > 0 ? Math.round(Object.values(veriler.cal).reduce((a, v) => a + v.reduce((b, c) => b + (c.saat || 0), 0), 0) / n * 10) / 10 : 0;

  return (
    <div style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{ padding: '8px 16px' }}>Geri</Btn>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: s.text }}>Istatistikler</h2>
      </div>
      {yukleniyor ? <div style={{ textAlign: 'center', padding: '60px', color: s.text3 }}>Yukleniyor...</div> : <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
          <StatCard tema={tema} label="Toplam Ogrenci" value={n} sub="Aktif" renk="#5B4FE8" icon="k" />
          <StatCard tema={tema} label="Ort. Tamamlama" value={'%' + ortTam} sub="Tum ogrenciler" renk="#10B981" icon="t" />
          <StatCard tema={tema} label="Toplam Deneme" value={topDen} sub="Girilmis" renk="#F59E0B" icon="d" />
          <StatCard tema={tema} label="Ort. Calisma" value={ortCal + 's'} sub="Kisi basi" renk="#3B82F6" icon="s" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Card tema={tema} style={{ padding: '20px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: s.text, marginBottom: '16px' }}>Program Tamamlama</div>
            {ogrenciler.map((o, i) => {
              const p = veriler.prog[o.id] || []; const t = p.filter(x => x.tamamlandi).length;
              const oran = p.length > 0 ? Math.round((t / p.length) * 100) : 0;
              return (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '110px', fontSize: '12px', color: s.text, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.isim.split(' ')[0]}</div>
                  <div style={{ flex: 1, height: '8px', background: s.surface3, borderRadius: '8px', overflow: 'hidden' }}><div style={{ height: '100%', width: oran + '%', background: renkler[i % renkler.length], borderRadius: '8px', transition: 'width 0.5s' }} /></div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: renkler[i % renkler.length], width: '36px', textAlign: 'right' }}>{oran}%</div>
                </div>
              );
            })}
          </Card>
          <Card tema={tema} style={{ padding: '20px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: s.text, marginBottom: '16px' }}>Son Deneme Netleri</div>
            {ogrenciler.map((o, i) => {
              const d = veriler.den[o.id] || []; d.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
              const son = d[0]; const oran = son ? Math.round((parseFloat(son.toplamNet) / 120) * 100) : 0;
              return (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '110px', fontSize: '12px', color: s.text, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.isim.split(' ')[0]}</div>
                  <div style={{ flex: 1, height: '8px', background: s.surface3, borderRadius: '8px', overflow: 'hidden' }}><div style={{ height: '100%', width: oran + '%', background: '#5B4FE8', borderRadius: '8px' }} /></div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#5B4FE8', width: '60px', textAlign: 'right' }}>{son ? son.toplamNet + ' net' : '—'}</div>
                </div>
              );
            })}
          </Card>
        </div>
      </>}
    </div>
  );
}
