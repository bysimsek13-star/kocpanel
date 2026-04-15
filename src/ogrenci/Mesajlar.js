import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { Btn } from '../components/Shared';
import { isUnread, readPatch, unreadPatch } from '../utils/readState';
import { bildirimOlustur } from '../components/BildirimSistemi';

const LIMIT = 80; // Son 80 mesaj

export default function Mesajlar({
  ogrenciId,
  gonderen,
  aliciId = null,
  aliciIsim: _aliciIsim = '',
}) {
  const { s } = useTheme();
  const toast = useToast();
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const scrollRef = useRef(null);
  const okunduIsaretlendi = useRef(new Set()); // Zaten işaretlenenleri takip et

  // Realtime — limit'li
  useEffect(() => {
    const q = query(
      collection(db, 'ogrenciler', ogrenciId, 'mesajlar'),
      orderBy('olusturma', 'desc'),
      limit(LIMIT)
    );
    const unsub = onSnapshot(
      q,
      snap => {
        // desc + reverse → son LIMIT mesajı kronolojik sırada göster
        setMesajlar(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
      },
      err => console.error(err)
    );
    return () => unsub();
  }, [ogrenciId]);

  // Scroll en alta
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mesajlar]);

  // Okundu işaretleme — sadece yeni okunmamışlar için, bir kez
  useEffect(() => {
    if (!mesajlar.length) return;
    const karsi = gonderen === 'koc' ? 'ogrenci' : 'koc';
    const yeniOkunmamislar = mesajlar.filter(
      m => m.gonderen === karsi && isUnread(m) && !okunduIsaretlendi.current.has(m.id)
    );
    if (!yeniOkunmamislar.length) return;

    yeniOkunmamislar.forEach(m => {
      okunduIsaretlendi.current.add(m.id);
      updateDoc(doc(db, 'ogrenciler', ogrenciId, 'mesajlar', m.id), readPatch()).catch(() => {});
    });
    // okunmamisMesajSayisi → mesajOkunduAzalt CF her okundu update'inde azaltır
  }, [mesajlar, gonderen, ogrenciId]);

  const gonder = useCallback(async () => {
    if (!yeniMesaj.trim()) return;
    setYukleniyor(true);
    try {
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'mesajlar'), {
        mesaj: yeniMesaj.trim(),
        gonderen,
        ...unreadPatch(),
        olusturma: serverTimestamp(),
      });
      setYeniMesaj('');
      if (aliciId) {
        bildirimOlustur({
          aliciId,
          tip: 'yeni_mesaj',
          baslik: 'Yeni mesaj',
          mesaj: yeniMesaj.trim().slice(0, 80),
          route: gonderen === 'koc' ? '/ogrenci/mesajlar' : '/koc/ogrenciler',
        }).catch(() => {});
      }
    } catch {
      toast('Gönderilemedi', 'error');
    }
    setYukleniyor(false);
  }, [yeniMesaj, ogrenciId, gonderen, toast, aliciId]);

  const karsıIsim = gonderen === 'ogrenci' ? 'Koç' : 'Öğrenci';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 220px)',
        minHeight: 420,
        maxHeight: 700,
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Mesaj listesi */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {mesajlar.length === 0 ? (
          <div style={{ textAlign: 'center', color: s.text3, fontSize: 13, marginTop: 40 }}>
            Henüz mesaj yok
          </div>
        ) : (
          mesajlar.map(m => {
            const benimMesajim = m.gonderen === gonderen;
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: benimMesajim ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '72%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: benimMesajim ? s.accent : s.surface2,
                    color: benimMesajim ? '#fff' : s.text,
                    border: benimMesajim ? 'none' : `1px solid ${s.border}`,
                    borderBottomRightRadius: benimMesajim ? 4 : 14,
                    borderBottomLeftRadius: benimMesajim ? 14 : 4,
                  }}
                >
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.mesaj}</div>
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65, textAlign: 'right' }}>
                    {m.olusturma?.toDate?.()
                      ? m.olusturma
                          .toDate()
                          .toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                    {benimMesajim && !isUnread(m) && ' ✓'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Giriş alanı */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${s.border}`,
          display: 'flex',
          gap: 10,
          background: s.surface,
        }}
      >
        <input
          value={yeniMesaj}
          onChange={e => setYeniMesaj(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && gonder()}
          placeholder={`${karsıIsim}'a mesaj yaz...`}
          style={{
            flex: 1,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
            resize: 'none',
          }}
        />
        <Btn
          onClick={gonder}
          disabled={yukleniyor || !yeniMesaj.trim()}
          style={{ padding: '10px 16px', fontSize: 13, flexShrink: 0 }}
        >
          Gönder
        </Btn>
      </div>
    </div>
  );
}

Mesajlar.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  gonderen: PropTypes.string.isRequired,
  aliciId: PropTypes.string,
  aliciIsim: PropTypes.string,
};
