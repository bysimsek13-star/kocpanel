/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getS } from '../theme';
import { Card, Btn, Input } from '../components/Shared';

export default function Mesajlar({ tema, ogrenciId, gonderen }) {
  const s = getS(tema);
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const getir = async () => {
    try {
      const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'mesajlar'));
      const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      liste.sort((a, b) => (a.olusturma?.seconds || 0) - (b.olusturma?.seconds || 0));
      setMesajlar(liste);
    } catch (e) { }
  };

  useEffect(() => { getir(); }, [ogrenciId]);

  const gonder = async () => {
    if (!yeniMesaj.trim()) return;
    setYukleniyor(true);
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'mesajlar'), { mesaj: yeniMesaj, gonderen, olusturma: new Date() });
      setYeniMesaj('');
      await getir();
    } catch (e) { alert(e.message); }
    setYukleniyor(false);
  };

  return (
    <Card tema={tema} style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mesajlar.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: s.text3 }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            <div>Henüz mesaj yok</div>
          </div>
        ) : mesajlar.map(m => {
          const benim = m.gonderen === gonderen;
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: benim ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%', background: benim ? s.accentGrad : s.surface2, borderRadius: benim ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '12px 16px', boxShadow: s.shadow }}>
                <div style={{ fontSize: '14px', color: benim ? 'white' : s.text, lineHeight: '1.6' }}>{m.mesaj}</div>
              </div>
              <div style={{ fontSize: '11px', color: s.text3, marginTop: '4px' }}>
                <span style={{ color: benim ? s.accent : '#10B981', fontWeight: '600' }}>{m.gonderen === 'koc' ? 'Koç' : 'Öğrenci'}</span>
                {' · '}{m.olusturma?.toDate ? m.olusturma.toDate().toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '16px', borderTop: `1px solid ${s.border}`, display: 'flex', gap: '10px' }}>
        <Input tema={tema} value={yeniMesaj} onChange={e => setYeniMesaj(e.target.value)} placeholder="Mesaj yaz... (Enter)" type="text" />
        <Btn tema={tema} onClick={gonder} disabled={!yeniMesaj.trim() || yukleniyor}>{yukleniyor ? '...' : 'Gönder →'}</Btn>
      </div>
    </Card>
  );
}
