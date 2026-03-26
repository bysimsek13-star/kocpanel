/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getS } from '../theme';
import { Card, Btn } from '../components/Shared';

// Koç tarafından not ekleme bileşeni
export function KocNotlari({ tema, ogrenciId }) {
  const s = getS(tema);
  const [notlar, setNotlar] = useState([]);
  const [yeniNot, setYeniNot] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const getir = async () => {
    try {
      const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'notlar'));
      const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      liste.sort((a, b) => (b.olusturma?.seconds || 0) - (a.olusturma?.seconds || 0));
      setNotlar(liste);
    } catch (e) { }
  };

  useEffect(() => { getir(); }, []);

  const kaydet = async () => {
    if (!yeniNot.trim()) return;
    setYukleniyor(true);
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'notlar'), { not: yeniNot, olusturma: new Date() });
      setYeniNot('');
      await getir();
    } catch (e) { alert(e.message); }
    setYukleniyor(false);
  };

  return (
    <Card tema={tema} style={{ padding: '20px' }}>
      <div style={{ fontWeight: '700', fontSize: '15px', color: getS(tema).text, marginBottom: '16px' }}>📝 Koç Notları</div>
      <textarea
        value={yeniNot} onChange={e => setYeniNot(e.target.value)}
        placeholder="Yeni not ekle..."
        style={{ width: '100%', background: s.surface2, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '12px 14px', color: s.text, fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'Inter,sans-serif', transition: 'border 0.15s' }}
        onFocus={e => e.target.style.borderColor = s.accent}
        onBlur={e => e.target.style.borderColor = s.border}
      />
      <Btn tema={tema} onClick={kaydet} disabled={!yeniNot.trim() || yukleniyor} style={{ marginTop: '10px', width: '100%' }}>
        {yukleniyor ? 'Kaydediliyor...' : 'Not Ekle'}
      </Btn>
      {notlar.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notlar.map(n => (
            <div key={n.id} style={{ background: s.surface2, borderRadius: '10px', padding: '14px', borderLeft: `3px solid ${s.accent}` }}>
              <div style={{ fontSize: '11px', color: s.text3, marginBottom: '6px' }}>{n.olusturma?.toDate ? n.olusturma.toDate().toLocaleDateString('tr-TR') : ''}</div>
              <div style={{ fontSize: '13px', color: s.text, lineHeight: '1.6' }}>{n.not}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Öğrenci tarafından koç notlarını görüntüleme bileşeni
export function KocNotlariOgrenci({ tema, ogrenciId }) {
  const s = getS(tema);
  const [notlar, setNotlar] = useState([]);

  useEffect(() => {
    const getir = async () => {
      try {
        const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'notlar'));
        const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        liste.sort((a, b) => (b.olusturma?.seconds || 0) - (a.olusturma?.seconds || 0));
        setNotlar(liste);
      } catch (e) { }
    };
    getir();
  }, []);

  return (
    <Card tema={tema} style={{ padding: '20px' }}>
      <div style={{ fontWeight: '700', fontSize: '15px', color: s.text, marginBottom: '16px' }}>📝 Koçumdan Notlar</div>
      {notlar.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: s.text3 }}>Henüz not yok</div>
      ) : notlar.map(n => (
        <div key={n.id} style={{ background: s.surface2, borderRadius: '10px', padding: '14px', marginBottom: '10px', borderLeft: `3px solid ${s.accent}` }}>
          <div style={{ fontSize: '11px', color: s.text3, marginBottom: '6px' }}>{n.olusturma?.toDate ? n.olusturma.toDate().toLocaleDateString('tr-TR') : ''}</div>
          <div style={{ fontSize: '13px', color: s.text, lineHeight: '1.6' }}>{n.not}</div>
        </div>
      ))}
    </Card>
  );
}
