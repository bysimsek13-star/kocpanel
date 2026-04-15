import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Btn } from '../components/Shared';
import { isUnread, readPatch, unreadPatch } from '../utils/readState';

export default function VeliMesajlariPaneli({ ogrenciId }) {
  const { s } = useTheme();
  const [mesajlar, setMesajlar] = useState([]);
  const [yeni, setYeni] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (!ogrenciId) return;
    const q = query(
      collection(db, 'ogrenciler', ogrenciId, 'velimesajlar'),
      orderBy('olusturma', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMesajlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [ogrenciId]);

  useEffect(() => {
    if (!ogrenciId || !mesajlar.length) return;

    const okunmamislar = mesajlar.filter(m => m.gonderen === 'veli' && isUnread(m));
    if (!okunmamislar.length) return;

    okunmamislar.forEach(m => {
      updateDoc(doc(db, 'ogrenciler', ogrenciId, 'velimesajlar', m.id), readPatch()).catch(
        () => {}
      );
    });
  }, [mesajlar, ogrenciId]);

  const gonder = async () => {
    if (!yeni.trim()) return;
    setYukleniyor(true);
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'velimesajlar'), {
        mesaj: yeni.trim(),
        gonderen: 'koc',
        ...unreadPatch(),
        olusturma: serverTimestamp(),
      });
      setYeni('');
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  };

  const zamanFormat = ts => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: 'min(360px, 48vh)' }}>
      <div
        style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${s.border}`,
          fontWeight: 600,
          fontSize: 14,
          color: s.text,
        }}
      >
        👨‍👩‍👧 Veli Mesajları
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {mesajlar.length === 0 ? (
          <EmptyState mesaj="Veliden henüz mesaj yok" icon="💬" />
        ) : (
          mesajlar.map(m => {
            const veliMi = m.gonderen === 'veli';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: veliMi ? 'flex-start' : 'flex-end',
                }}
              >
                <div
                  style={{
                    maxWidth: '76%',
                    background: veliMi ? s.surface2 : s.accentGrad,
                    borderRadius: veliMi ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                    padding: '11px 16px',
                    boxShadow: s.shadow,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: veliMi ? s.text : '#fff',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                    }}
                  >
                    {m.mesaj}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: s.text3, marginTop: 3 }}>
                  <span style={{ fontWeight: 600, color: veliMi ? '#06B6D4' : s.accent }}>
                    {veliMi ? 'Veli' : 'Koç'}
                  </span>
                  {' · '}
                  {zamanFormat(m.olusturma)}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${s.border}`,
          display: 'flex',
          gap: 10,
        }}
      >
        <input
          value={yeni}
          onChange={e => setYeni(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              gonder();
            }
          }}
          placeholder="Veliye mesaj yaz..."
          style={{
            flex: 1,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 22,
            padding: '10px 16px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
            fontFamily: 'Inter,sans-serif',
          }}
          onFocus={e => (e.target.style.borderColor = s.accent)}
          onBlur={e => (e.target.style.borderColor = s.border)}
        />
        <Btn
          onClick={gonder}
          disabled={!yeni.trim() || yukleniyor}
          style={{ borderRadius: 22, padding: '10px 18px' }}
        >
          {yukleniyor ? '...' : '→'}
        </Btn>
      </div>
    </Card>
  );
}

VeliMesajlariPaneli.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
};
