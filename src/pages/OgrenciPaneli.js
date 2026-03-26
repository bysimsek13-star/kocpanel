/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getS } from '../theme';
import TopBar from '../components/TopBar';
import { Card } from '../components/Shared';
import DenemeListesi from '../ogrenci/DenemeListesi';
import CalismaKarti from '../ogrenci/CalismaKarti';
import Mesajlar from '../ogrenci/Mesajlar';
import { KocNotlariOgrenci } from '../ogrenci/KocNotlari';

export default function OgrenciPaneli({ tema, kullanici, ogrenciData, onCikis }) {
  const s = getS(tema);
  const [program, setProgram] = useState([]);
  const [denemeler, setDenemeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifSekme, setAktifSekme] = useState('program');

  const getir = async () => {
    try {
      const ps = await getDocs(collection(db, 'ogrenciler', kullanici.uid, 'program'));
      setProgram(ps.docs.map(d => ({ id: d.id, ...d.data() })));
      const ds = await getDocs(collection(db, 'ogrenciler', kullanici.uid, 'denemeler'));
      const dl = ds.docs.map(d => ({ id: d.id, ...d.data() }));
      dl.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
      setDenemeler(dl);
    } catch (e) { }
    setYukleniyor(false);
  };

  useEffect(() => { getir(); }, []);

  const gorevTamamla = async (id, mevcut) => {
    try {
      await updateDoc(doc(db, 'ogrenciler', kullanici.uid, 'program', id), { tamamlandi: !mevcut });
      await getir();
    } catch (e) { }
  };

  const tam = program.filter(p => p.tamamlandi).length;
  const oran = program.length > 0 ? Math.round((tam / program.length) * 100) : 0;
  const beklenenSaat = ogrenciData?.beklenenSaat || 6;

  const sekmeler = [
    { key: 'program', label: 'Program' },
    { key: 'denemeler', label: 'Denemeler' },
    { key: 'calisma', label: 'Calisma' },
    { key: 'mesajlar', label: 'Mesajlar' },
    { key: 'notlar', label: 'Notlar' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter,sans-serif' }}>
      <TopBar tema={tema} kullanici={kullanici} rol="ogrenci" onCikis={onCikis} />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
        {/* BANNER */}
        <div style={{ background: s.accentGrad, borderRadius: '20px', padding: '24px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 32px rgba(91,79,232,0.25)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'white' }}>
              Hos geldin, {ogrenciData?.isim?.split(' ')[0] || 'Ogrenci'} 
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{ogrenciData?.tur} · ElsWay</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { v: oran + '%', l: 'Tamamlama' },
              { v: `${tam}/${program.length}`, l: 'Gorev' },
              { v: denemeler[0] ? denemeler[0].toplamNet : '—', l: denemeler[0] ? `Son ${denemeler[0].sinav}` : 'Deneme' }
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>{item.v}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SEKMELER */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: s.surface2, padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          {sekmeler.map(sek => (
            <div key={sek.key} onClick={() => setAktifSekme(sek.key)}
              style={{ padding: '8px 16px', borderRadius: '9px', background: aktifSekme === sek.key ? s.surface : 'transparent', color: aktifSekme === sek.key ? s.accent : s.text2, cursor: 'pointer', fontSize: '13px', fontWeight: aktifSekme === sek.key ? '600' : '400', transition: 'all 0.15s', boxShadow: aktifSekme === sek.key ? s.shadow : 'none' }}>
              {sek.label}
            </div>
          ))}
        </div>

        {/* PROGRAM */}
        {aktifSekme === 'program' && (
          <Card tema={tema}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${s.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: s.text }}>Gunluk Programim</div>
              <div style={{ fontSize: '13px', color: s.text2 }}>{tam}/{program.length} · <span style={{ color: oran >= 80 ? '#10B981' : oran >= 50 ? '#F59E0B' : '#F43F5E', fontWeight: '600' }}>{oran}%</span></div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {yukleniyor ? <div style={{ textAlign: 'center', padding: '20px', color: s.text3 }}>Yukleniyor...</div> :
                program.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: s.text2 }}>Kocun henuz program eklemedi</div> :
                  program.map(p => (
                    <div key={p.id} onClick={() => gorevTamamla(p.id, p.tamamlandi)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.15s', background: p.tamamlandi ? `${s.surface2}80` : 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = s.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = p.tamamlandi ? `${s.surface2}80` : 'transparent'}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '7px', border: p.tamamlandi ? 'none' : `2px solid ${s.border}`, background: p.tamamlandi ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, color: 'white', transition: 'all 0.15s' }}>{p.tamamlandi && 'v'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', color: p.tamamlandi ? s.text3 : s.text, textDecoration: p.tamamlandi ? 'line-through' : 'none', fontWeight: '500' }}>{p.gorev}</div>
                        <div style={{ fontSize: '12px', color: s.text3, marginTop: '2px' }}>{p.ders}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: p.tamamlandi ? '#10B981' : s.text3, fontWeight: '500' }}>{p.tamamlandi ? 'Tamamlandi' : 'Tamamla'}</div>
                    </div>
                  ))}
            </div>
          </Card>
        )}

        {aktifSekme === 'denemeler' && <DenemeListesi tema={tema} ogrenciId={kullanici.uid} />}
        {aktifSekme === 'calisma' && <CalismaKarti tema={tema} ogrenciId={kullanici.uid} beklenenSaat={beklenenSaat} gorevOrani={oran} onKaydet={getir} />}
        {aktifSekme === 'mesajlar' && <Mesajlar tema={tema} ogrenciId={kullanici.uid} gonderen="ogrenci" />}
        {aktifSekme === 'notlar' && <KocNotlariOgrenci tema={tema} ogrenciId={kullanici.uid} />}
      </div>
    </div>
  );
}
