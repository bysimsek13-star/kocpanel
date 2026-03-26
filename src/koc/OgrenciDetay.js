/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getS } from '../theme';
import { Card, Btn } from '../components/Shared';
import DenemeListesi from '../ogrenci/DenemeListesi';
import Mesajlar from '../ogrenci/Mesajlar';
import { KocNotlari } from '../ogrenci/KocNotlari';
import HaftalikVerimlilik from './HaftalikVerimlilik';

export default function OgrenciDetay({ tema, ogrenci, onGeri }) {
  const s = getS(tema);
  const [program, setProgram] = useState([]);
  const [yeniGorev, setYeniGorev] = useState('');
  const [yeniDers, setYeniDers] = useState('Matematik');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [aktifSekme, setAktifSekme] = useState('program');
  const dersler = ['Matematik', 'Turkce', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Cografya', 'Edebiyat'];

  const programiGetir = async () => {
    try {
      const snap = await getDocs(collection(db, 'ogrenciler', ogrenci.id, 'program'));
      setProgram(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { }
  };

  useEffect(() => { programiGetir(); }, []);

  const gorevEkle = async () => {
    if (!yeniGorev) return;
    setYukleniyor(true);
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenci.id, 'program'), { gorev: yeniGorev, ders: yeniDers, tamamlandi: false, tarih: new Date() });
      setYeniGorev('');
      await programiGetir();
    } catch (e) { alert(e.message); }
    setYukleniyor(false);
  };

  const tam = program.filter(p => p.tamamlandi).length;
  const oran = program.length > 0 ? Math.round((tam / program.length) * 100) : 0;

  const sekmeler = [
    { key: 'program', label: 'Program' },
    { key: 'denemeler', label: 'Denemeler' },
    { key: 'verimlilik', label: 'Verimlilik' },
    { key: 'mesajlar', label: 'Mesajlar' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter,sans-serif' }}>
      {/* HEADER */}
      <div style={{ background: s.surface, borderBottom: `1px solid ${s.border}`, padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', gap: '14px', position: 'sticky', top: 0, zIndex: 100, boxShadow: s.shadow }}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{ padding: '8px 16px' }}>Geri</Btn>
        <div style={{ fontWeight: '700', fontSize: '17px', color: s.text }}>{ogrenci.isim}</div>
        <div style={{ background: s.accentSoft, color: s.accent, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{ogrenci.tur}</div>
        <div style={{ display: 'flex', gap: '4px', marginLeft: '12px', background: s.surface2, padding: '4px', borderRadius: '10px' }}>
          {sekmeler.map(sek => (
            <div key={sek.key} onClick={() => setAktifSekme(sek.key)}
              style={{ padding: '7px 14px', borderRadius: '8px', background: aktifSekme === sek.key ? s.surface : 'transparent', color: aktifSekme === sek.key ? s.accent : s.text2, cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'all 0.15s' }}>
              {sek.label}
            </div>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '13px', color: s.text2 }}>{ogrenci.email}</div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* PROGRAM SEKMESİ */}
        {aktifSekme === 'program' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <Card tema={tema}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${s.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: s.text }}>Haftalik Program</div>
                <div style={{ fontSize: '13px', color: s.text2 }}>{tam}/{program.length} · <span style={{ color: oran >= 80 ? '#10B981' : oran >= 50 ? '#F59E0B' : '#F43F5E', fontWeight: '600' }}>{oran}%</span></div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <select value={yeniDers} onChange={e => setYeniDers(e.target.value)} style={{ background: s.surface2, border: `1px solid ${s.border}`, borderRadius: '9px', padding: '9px 12px', color: s.text, fontSize: '13px', outline: 'none' }}>
                    {dersler.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input value={yeniGorev} onChange={e => setYeniGorev(e.target.value)} onKeyDown={e => e.key === 'Enter' && gorevEkle()} placeholder="Gorev yaz... (Enter)"
                    style={{ flex: 1, background: s.surface2, border: `1px solid ${s.border}`, borderRadius: '9px', padding: '9px 12px', color: s.text, fontSize: '13px', outline: 'none', minWidth: '120px' }} />
                  <Btn tema={tema} onClick={gorevEkle} disabled={!yeniGorev || yukleniyor} style={{ padding: '9px 16px', fontSize: '13px' }}>+ Ekle</Btn>
                </div>
                {program.length === 0 ? <div style={{ textAlign: 'center', padding: '20px', color: s.text3 }}>Henuz gorev eklenmedi</div> :
                  program.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', marginBottom: '4px', background: p.tamamlandi ? s.surface2 : 'transparent' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: p.tamamlandi ? '#10B981' : s.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', flexShrink: 0 }}>{p.tamamlandi && 'v'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: p.tamamlandi ? s.text3 : s.text, textDecoration: p.tamamlandi ? 'line-through' : 'none' }}>{p.gorev}</div>
                        <div style={{ fontSize: '11px', color: s.text3 }}>{p.ders}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: p.tamamlandi ? '#10B981' : s.text3 }}>{p.tamamlandi ? 'Tamamlandi' : 'Bekliyor'}</div>
                    </div>
                  ))}
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Card tema={tema} style={{ padding: '20px' }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: s.text, marginBottom: '14px' }}>Bilgiler</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  {[{ l: 'SINAV TURU', v: ogrenci.tur, c: s.accent }, { l: 'TAMAMLAMA', v: '%' + oran, c: '#10B981' }, { l: 'BEKLENEN', v: (ogrenci.beklenenSaat || 6) + 's/gun', c: '#F59E0B' }].map(k => (
                    <div key={k.l} style={{ background: s.surface2, borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '10px', color: s.text3, marginBottom: '4px', fontWeight: '600' }}>{k.l}</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                {ogrenci.veliEmail && <div style={{ background: s.surface2, borderRadius: '10px', padding: '12px 14px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', color: s.text3, marginBottom: '4px', fontWeight: '600' }}>VELI</div>
                  <div style={{ fontSize: '13px', color: s.text2 }}>{ogrenci.veliEmail}</div>
                </div>}
                <Btn tema={tema} onClick={async () => { if (window.confirm('Bu ogrenciyi silmek istiyor musunuz?')) { try { await deleteDoc(doc(db, 'ogrenciler', ogrenci.id)); onGeri(); } catch (e) { alert(e.message); } } }} variant="danger" style={{ width: '100%' }}>Ogrenciyi Sil</Btn>
              </Card>
              <KocNotlari tema={tema} ogrenciId={ogrenci.id} />
            </div>
          </div>
        )}

        {aktifSekme === 'denemeler' && <div style={{ maxWidth: '700px' }}><DenemeListesi tema={tema} ogrenciId={ogrenci.id} /></div>}
        {aktifSekme === 'verimlilik' && <div style={{ maxWidth: '700px' }}><HaftalikVerimlilik tema={tema} ogrenciId={ogrenci.id} /></div>}
        {aktifSekme === 'mesajlar' && <div style={{ maxWidth: '700px' }}><Mesajlar tema={tema} ogrenciId={ogrenci.id} gonderen="koc" /></div>}
      </div>
    </div>
  );
}
