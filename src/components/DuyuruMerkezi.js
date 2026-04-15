import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { duyuruRenk } from '../utils/adminUtils';
import { Card, EmptyState, LoadingState } from './Shared';
import { useTheme } from '../context/ThemeContext';

export default function DuyuruMerkezi({ compact = false, title = '📣 Duyuru Merkezi' }) {
  const { s } = useTheme();
  const [liste, setListe] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const adet = compact ? 3 : 6;
    const q = query(
      collection(db, 'duyurular'),
      orderBy('olusturma', 'desc'),
      limit(adet * 3) // Arşivlenenleri filtrelemek için fazladan çek
    );

    const unsub = onSnapshot(
      q,
      snap => {
        const simdi = new Date();
        const aktifler = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => {
            if (d.aktif === false) return false;
            if (d.bitisTarihi?.toDate && d.bitisTarihi.toDate() < simdi) return false;
            return true;
          })
          .slice(0, adet);
        setListe(aktifler);
        setYukleniyor(false);
      },
      () => setYukleniyor(false)
    );

    return () => unsub();
  }, [compact]);

  return (
    <Card style={{ padding: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 12 }}>{title}</div>
      {yukleniyor ? (
        <LoadingState />
      ) : liste.length === 0 ? (
        <EmptyState mesaj="Henüz aktif duyuru yok" icon="📭" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {liste.map(item => {
            const renk = duyuruRenk(item);
            return (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${renk.border}`,
                  background: renk.bg,
                  borderRadius: 14,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: s.text }}>
                    {item.baslik}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: renk.text,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.seviye || 'bilgi'}
                  </div>
                </div>
                {item.ozet && (
                  <div style={{ fontSize: 12, color: s.text2, marginTop: 6, lineHeight: 1.55 }}>
                    {item.ozet}
                  </div>
                )}
                {item.olusturma && (
                  <div style={{ fontSize: 10, color: s.text3, marginTop: 8 }}>
                    {item.olusturma.toDate
                      ? item.olusturma.toDate().toLocaleString('tr-TR')
                      : new Date(item.olusturma).toLocaleString('tr-TR')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
