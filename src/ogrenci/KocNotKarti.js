import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { Card, Btn, EmptyState } from '../components/Shared';
import { etiketBilgi } from './kocNotlariSabitleri';

const tarihFormat = ts => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export function NotKarti({ kayit, ogrenciId, onSilindi, s }) {
  const toast = useToast();
  const [silOnay, setSilOnay] = useState(false);

  const sil = async () => {
    try {
      await deleteDoc(doc(db, 'ogrenciler', ogrenciId, 'notlar', kayit.id));
      toast('Silindi');
      onSilindi();
    } catch {
      toast('Silinemedi', 'error');
    }
  };

  if (kayit.tip === 'gorusme') {
    return (
      <div
        style={{
          padding: 16,
          background: 'rgba(6,182,212,0.06)',
          borderRadius: 14,
          borderLeft: '3px solid #06B6D4',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>🗣</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>Görüşme</span>
            <span style={{ fontSize: 11, color: s.text3 }}>·</span>
            <span style={{ fontSize: 12, color: '#06B6D4', fontWeight: 600 }}>{kayit.tarih}</span>
            {kayit.suredk && <span style={{ fontSize: 11, color: s.text3 }}>{kayit.suredk}dk</span>}
          </div>
          <button
            onClick={() => setSilOnay(!silOnay)}
            style={{
              background: 'none',
              border: 'none',
              color: s.text3,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ⋯
          </button>
        </div>
        {kayit.konular && (
          <div style={{ fontSize: 13, color: s.text, marginBottom: 6, lineHeight: 1.6 }}>
            <strong style={{ color: s.text2 }}>Konular:</strong> {kayit.konular}
          </div>
        )}
        {kayit.odevler && (
          <div style={{ fontSize: 13, color: s.text, marginBottom: 6, lineHeight: 1.6 }}>
            <strong style={{ color: s.text2 }}>Ödevler:</strong> {kayit.odevler}
          </div>
        )}
        {kayit.sonrakiKontrol && (
          <div style={{ fontSize: 12, color: '#06B6D4', fontWeight: 600 }}>
            📅 Sonraki: {kayit.sonrakiKontrol}
          </div>
        )}
        {silOnay && (
          <Btn
            onClick={sil}
            variant="danger"
            style={{ marginTop: 10, padding: '5px 12px', fontSize: 12 }}
          >
            Sil
          </Btn>
        )}
      </div>
    );
  }

  const et = etiketBilgi(kayit.etiket);
  return (
    <div
      style={{
        padding: 14,
        background: s.surface2,
        borderRadius: 12,
        borderLeft: `3px solid ${et.renk}`,
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              background: `${et.renk}20`,
              color: et.renk,
            }}
          >
            {et.label}
          </span>
          <span style={{ fontSize: 11, color: s.text3 }}>{tarihFormat(kayit.olusturma)}</span>
        </div>
        <button
          onClick={() => setSilOnay(!silOnay)}
          style={{
            background: 'none',
            border: 'none',
            color: s.text3,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ⋯
        </button>
      </div>
      <div style={{ fontSize: 13, color: s.text, lineHeight: 1.7, wordBreak: 'break-word' }}>
        {kayit.not}
      </div>
      {silOnay && (
        <Btn
          onClick={sil}
          variant="danger"
          style={{ marginTop: 8, padding: '4px 10px', fontSize: 11 }}
        >
          Sil
        </Btn>
      )}
    </div>
  );
}

export function KocNotlariOgrenci({ ogrenciId }) {
  const { s } = useTheme();
  const [notlar, setNotlar] = useState([]);

  useEffect(() => {
    getDocs(collection(db, 'ogrenciler', ogrenciId, 'notlar'))
      .then(snap => {
        const liste = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(k => k.tip !== 'gorusme')
          .sort((a, b) => (b.olusturma?.seconds || 0) - (a.olusturma?.seconds || 0));
        setNotlar(liste);
      })
      .catch(() => {});
  }, [ogrenciId]);

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 16 }}>
        📝 Koçumdan Notlar
      </div>
      {notlar.length === 0 ? (
        <EmptyState mesaj="Henüz not yok" icon="📝" />
      ) : (
        notlar.map(n => {
          const et = etiketBilgi(n.etiket);
          return (
            <div
              key={n.id}
              style={{
                padding: 14,
                background: s.surface2,
                borderRadius: 12,
                borderLeft: `3px solid ${et.renk}`,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: `${et.renk}20`,
                  color: et.renk,
                  display: 'inline-block',
                  marginBottom: 6,
                }}
              >
                {et.label}
              </div>
              <div style={{ fontSize: 13, color: s.text, lineHeight: 1.7 }}>{n.not}</div>
            </div>
          );
        })
      )}
    </Card>
  );
}
