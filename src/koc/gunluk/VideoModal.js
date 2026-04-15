import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export default function VideoModal({ videolar, ogrenciId, onKapat, s }) {
  const [aktif, setAktif] = useState(videolar[0] || null);
  const [izlendi, setIzlendi] = useState(new Set());
  const acilisRef = useRef(null);

  const playerAc = v => {
    setAktif(v);
    acilisRef.current = Date.now();
  };

  useEffect(() => {
    acilisRef.current = Date.now();
  }, [aktif]);

  const izlendiIsaretle = async () => {
    if (!aktif || izlendi.has(aktif.videoId)) return;
    const dur = acilisRef.current ? Math.round((Date.now() - acilisRef.current) / 1000) : null;
    setIzlendi(prev => new Set([...prev, aktif.videoId]));
    try {
      await setDoc(
        doc(db, 'userProgress', `${ogrenciId}_${aktif.videoId}`),
        {
          userId: ogrenciId,
          videoId: aktif.videoId,
          playlistDocId: aktif.playlistDocId || '',
          watched: true,
          watchedAt: serverTimestamp(),
          ...(dur != null ? { watchDurationSec: dur } : {}),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('izlendi kaydedilemedi:', e.message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
      }}
      onClick={onKapat}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          borderRadius: 16,
          width: '100%',
          maxWidth: 620,
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: `1px solid ${s.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: s.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              marginRight: 8,
            }}
          >
            {aktif ? aktif.title : `${videolar.length} video`}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {aktif && !izlendi.has(aktif.videoId) && (
              <button
                onClick={izlendiIsaretle}
                style={{
                  background: '#4CAF50',
                  border: 'none',
                  borderRadius: 8,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                ✓ İzledim
              </button>
            )}
            {aktif && izlendi.has(aktif.videoId) && (
              <div
                style={{
                  background: 'rgba(76,175,80,0.15)',
                  border: '1px solid #4CAF50',
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 12,
                  color: '#4CAF50',
                  fontWeight: 700,
                }}
              >
                ✓ İzlendi
              </div>
            )}
            {aktif && videolar.length > 1 && (
              <button
                onClick={() => setAktif(null)}
                style={{
                  background: s.surface2,
                  border: `1px solid ${s.border}`,
                  borderRadius: 8,
                  padding: '5px 11px',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: s.text2,
                }}
              >
                ← Liste
              </button>
            )}
            <button
              onClick={onKapat}
              style={{
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 8,
                padding: '5px 11px',
                cursor: 'pointer',
                fontSize: 12,
                color: s.text2,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {aktif ? (
          <div style={{ padding: 10 }}>
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                background: '#000',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${aktif.videoId}?autoplay=1&rel=0`}
                title={aktif.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        ) : (
          <div style={{ padding: '6px 0' }}>
            {videolar.map((v, i) => (
              <div
                key={v.videoId}
                onClick={() => playerAc(v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderBottom: i < videolar.length - 1 ? `1px solid ${s.border}` : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: s.text3,
                    width: 18,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                {v.thumbnail && (
                  <img
                    src={v.thumbnail}
                    alt=""
                    loading="lazy"
                    style={{
                      width: 72,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 5,
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: izlendi.has(v.videoId) ? s.text3 : s.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {v.title}
                  </div>
                  {v.duration && (
                    <div style={{ fontSize: 10, color: s.text3, marginTop: 1 }}>{v.duration}</div>
                  )}
                </div>
                {izlendi.has(v.videoId) ? (
                  <span style={{ color: '#4CAF50', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    ✓
                  </span>
                ) : (
                  <span style={{ color: s.text3, fontSize: 16, flexShrink: 0 }}>▶</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
