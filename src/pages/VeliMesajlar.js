import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Btn } from '../components/Shared';
import { unreadPatch } from '../utils/readState';
import { bildirimOlustur } from '../components/BildirimSistemi';

export default function VeliMesajlar({ ogrenciId, onGeri: _onGeri, kocId = null }) {
  const { s } = useTheme();
  const { kullanici } = useAuth();
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const altRef = useRef(null);

  useEffect(() => {
    if (!ogrenciId) return;
    const q = query(
      collection(db, 'ogrenciler', ogrenciId, 'velimesajlar'),
      orderBy('olusturma', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      setMesajlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => altRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [ogrenciId]);

  const gonder = async () => {
    if (!yeniMesaj.trim() || yukleniyor) return;
    setYukleniyor(true);
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'velimesajlar'), {
        metin: yeniMesaj.trim(),
        gonderen: 'veli',
        gonderenId: kullanici.uid,
        olusturma: serverTimestamp(),
        ...unreadPatch(),
      });
      setYeniMesaj('');
      if (kocId) {
        bildirimOlustur({
          aliciId: kocId,
          tip: 'yeni_mesaj',
          baslik: 'Veliden yeni mesaj',
          mesaj: yeniMesaj.trim().slice(0, 80),
          ogrenciId,
          route: '/koc/ogrenciler',
        }).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {mesajlar.map(m => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              justifyContent: m.gonderen === 'veli' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: 14,
                background: m.gonderen === 'veli' ? s.accentSoft : s.surface2,
                color: m.gonderen === 'veli' ? s.accent : s.text,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {m.metin}
            </div>
          </div>
        ))}
        <div ref={altRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={yeniMesaj}
          onChange={e => setYeniMesaj(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && gonder()}
          placeholder="Mesaj yaz..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 12,
            border: `1px solid ${s.border}`,
            background: s.surface2,
            color: s.text,
            fontSize: 13,
            outline: 'none',
          }}
        />
        <Btn onClick={gonder} disabled={yukleniyor || !yeniMesaj.trim()}>
          Gönder
        </Btn>
      </div>
    </div>
  );
}
