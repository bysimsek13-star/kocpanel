/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getS, TYT_DERSLER, AYT_DERSLER, netHesapla } from '../theme';
import { Card, Btn } from '../components/Shared';

function DenemeModal({ tema, ogrenciId, onKapat, onEkle }) {
  const s = getS(tema);
  const [sinav, setSinav] = useState('TYT');
  const [tarih, setTarih] = useState(new Date().toISOString().split('T')[0]);
  const [veriler, setVeriler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(false);
  const dersler = sinav === 'TYT' ? TYT_DERSLER : AYT_DERSLER;
  const guncelle = (dersId, tip, deger) => setVeriler(prev => ({ ...prev, [dersId]: { ...prev[dersId], [tip]: parseInt(deger) || 0 } }));
  const kaydet = async () => {
    setYukleniyor(true);
    try {
      const netler = {}; let top = 0;
      dersler.forEach(d => { const dy = veriler[d.id] || {}; const net = parseFloat(netHesapla(dy.d || 0, dy.y || 0)); netler[d.id] = { d: dy.d || 0, y: dy.y || 0, b: dy.b || 0, net }; top += net; });
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'denemeler'), { sinav, tarih, netler, toplamNet: top.toFixed(2), olusturma: new Date() });
      onEkle(); onKapat();
    } catch (e) { alert(e.message); }
    setYukleniyor(false);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: s.surface, border: `1px solid ${s.border}`, borderRadius: '20px', padding: '32px', width: '560px', margin: '20px', maxHeight: '90vh', overflowY: 'auto', boxShadow: s.shadow }}>
        <div style={{ color: s.text, fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Deneme Sonucu Gir</div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          {['TYT', 'AYT'].map(t => (<div key={t} onClick={() => { setSinav(t); setVeriler({}); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: sinav === t ? `2px solid ${s.accent}` : `1px solid ${s.border}`, background: sinav === t ? s.accentSoft : s.surface2, color: sinav === t ? s.accent : s.text2, cursor: 'pointer', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{t}</div>))}
          <input type="date" value={tarih} onChange={e => setTarih(e.target.value)} style={{ flex: 1, background: s.surface2, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '10px 12px', color: s.text, fontSize: '13px', outline: 'none' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px', gap: '6px', marginBottom: '20px' }}>
          <div style={{ padding: '8px 10px', background: s.surface2, borderRadius: '8px', fontSize: '11px', color: s.text3, fontWeight: '600' }}>DERS</div>
          {['DOGRU', 'YANLIS', 'BOS', 'NET'].map((h, i) => (<div key={h} style={{ padding: '8px', background: s.surface2, borderRadius: '8px', fontSize: '11px', fontWeight: '600', textAlign: 'center', color: i === 0 ? '#10B981' : i === 1 ? '#F43F5E' : i === 2 ? s.text3 : s.accent }}>{h}</div>))}
          {dersler.map(ders => {
            const dy = veriler[ders.id] || {}; const net = netHesapla(dy.d || 0, dy.y || 0);
            return (
              <React.Fragment key={ders.id}>
                <div style={{ padding: '8px 12px', background: s.surface2, borderRadius: '8px', fontSize: '13px', color: ders.renk, fontWeight: '500', display: 'flex', alignItems: 'center' }}>{ders.label}</div>
                <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.d || ''} onChange={e => guncelle(ders.id, 'd', e.target.value)} style={{ background: s.bg, border: '1px solid #10B981', borderRadius: '8px', padding: '8px', color: '#10B981', fontSize: '13px', outline: 'none', textAlign: 'center', width: '100%', boxSizing: 'border-box' }} />
                <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.y || ''} onChange={e => guncelle(ders.id, 'y', e.target.value)} style={{ background: s.bg, border: '1px solid #F43F5E', borderRadius: '8px', padding: '8px', color: '#F43F5E', fontSize: '13px', outline: 'none', textAlign: 'center', width: '100%', boxSizing: 'border-box' }} />
                <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.b || ''} onChange={e => guncelle(ders.id, 'b', e.target.value)} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '8px', color: s.text2, fontSize: '13px', outline: 'none', textAlign: 'center', width: '100%', boxSizing: 'border-box' }} />
                <div style={{ background: s.accentSoft, borderRadius: '8px', padding: '8px', fontSize: '15px', fontWeight: '700', color: s.accent, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{net}</div>
              </React.Fragment>
            );
          })}
          <div style={{ padding: '10px 12px', background: s.accentSoft, borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: s.text, border: `1px solid ${s.accent}`, display: 'flex', alignItems: 'center' }}>TOPLAM NET</div>
          <div /><div /><div />
          <div style={{ padding: '10px', background: s.accentSoft, borderRadius: '8px', fontSize: '18px', fontWeight: '800', color: s.accent, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${s.accent}` }}>
            {dersler.reduce((acc, ders) => { const dy = veriler[ders.id] || {}; return acc + parseFloat(netHesapla(dy.d || 0, dy.y || 0)); }, 0).toFixed(2)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Btn tema={tema} onClick={onKapat} variant="ghost" style={{ flex: 1 }}>Iptal</Btn>
          <Btn tema={tema} onClick={kaydet} disabled={yukleniyor} style={{ flex: 2 }}>{yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}</Btn>
        </div>
      </div>
    </div>
  );
}

export default function DenemeListesi({ tema, ogrenciId }) {
  const s = getS(tema);
  const [denemeler, setDenemeler] = useState([]);
  const [modalAcik, setModalAcik] = useState(false);
  const [secili, setSecili] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const getir = async () => {
    try {
      const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'denemeler'));
      const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      liste.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
      setDenemeler(liste);
    } catch (e) { }
    setYukleniyor(false);
  };
  useEffect(() => { getir(); }, []);
  return (
    <div>
      {modalAcik && <DenemeModal tema={tema} ogrenciId={ogrenciId} onKapat={() => setModalAcik(false)} onEkle={getir} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontWeight: '700', fontSize: '16px', color: s.text }}>Deneme Sonuclari</div>
        <Btn tema={tema} onClick={() => setModalAcik(true)} style={{ padding: '8px 16px', fontSize: '13px' }}>+ Deneme Ekle</Btn>
      </div>
      {yukleniyor ? <div style={{ textAlign: 'center', padding: '20px', color: s.text3 }}>Yukleniyor...</div> :
        denemeler.length === 0 ? <Card tema={tema} style={{ padding: '40px', textAlign: 'center' }}><div style={{ fontSize: '40px', marginBottom: '12px' }}>Henuz deneme yok</div></Card> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {denemeler.map(d => (
              <Card key={d.id} tema={tema}>
                <div onClick={() => setSecili(secili === d.id ? null : d.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', cursor: 'pointer' }}>
                  <div style={{ background: s.accentSoft, color: s.accent, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{d.sinav}</div>
                  <div style={{ fontSize: '13px', color: s.text2 }}>{d.tarih}</div>
                  <div style={{ marginLeft: 'auto', fontSize: '22px', fontWeight: '800', color: s.accent }}>{d.toplamNet}</div>
                  <div style={{ fontSize: '12px', color: s.text3 }}>net</div>
                  <div style={{ color: s.text3 }}>{secili === d.id ? 'v' : '>'}</div>
                </div>
                {secili === d.id && (
                  <div style={{ padding: '16px 20px', borderTop: `1px solid ${s.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '8px' }}>
                    {Object.entries(d.netler || {}).map(([dersId, v]) => {
                      const dl = [...TYT_DERSLER, ...AYT_DERSLER].find(x => x.id === dersId);
                      return (
                        <div key={dersId} style={{ background: s.surface2, borderRadius: '10px', padding: '12px 14px' }}>
                          <div style={{ fontSize: '11px', color: s.text3, marginBottom: '4px' }}>{dl?.label || dersId}</div>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: dl?.renk || s.accent }}>{v.net}</div>
                          <div style={{ fontSize: '10.5px', color: s.text3, marginTop: '2px' }}>{v.d}D - {v.y}Y - {v.b}B</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
      }
    </div>
  );
}
