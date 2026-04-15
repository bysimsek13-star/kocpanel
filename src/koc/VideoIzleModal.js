import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export function VideoIzleModal({ videolar, onKapat, s, mobil, izleyenUid }) {
  const [aktif, setAktif] = useState(null);
  const [izlendi, setIzlendi] = useState(new Set());
  const acilisRef = useRef(null);

  const playerAc = v => {
    setAktif(v);
    acilisRef.current = Date.now();
  };

  const izlendiIsaretle = async () => {
    if (!aktif || izlendi.has(aktif.videoId)) return;
    const dur = acilisRef.current ? Math.round((Date.now() - acilisRef.current) / 1000) : null;
    setIzlendi(prev => new Set([...prev, aktif.videoId]));
    if (!izleyenUid || !aktif.playlistDocId) return;
    try {
      await setDoc(
        doc(db, 'userProgress', `${izleyenUid}_${aktif.videoId}`),
        {
          userId: izleyenUid,
          videoId: aktif.videoId,
          playlistDocId: aktif.playlistDocId,
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
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: mobil ? 0 : 20,
      }}
      onClick={aktif ? () => setAktif(null) : onKapat}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          borderRadius: mobil ? 0 : 20,
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: s.shadow,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${s.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>
            {aktif ? aktif.title : `${videolar.length} video`}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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
            <button
              onClick={aktif ? () => setAktif(null) : onKapat}
              style={{
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 8,
                padding: '5px 12px',
                cursor: 'pointer',
                fontSize: 12,
                color: s.text2,
              }}
            >
              {aktif ? '← Liste' : '✕ Kapat'}
            </button>
          </div>
        </div>

        {aktif ? (
          <div style={{ padding: mobil ? 0 : 12 }}>
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                background: '#000',
                borderRadius: mobil ? 0 : 10,
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
          <div style={{ padding: '8px 0' }}>
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
                  transition: 'background .1s',
                  borderBottom: i < videolar.length - 1 ? `1px solid ${s.border}` : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = s.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: s.text3,
                    width: 20,
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
                      width: 80,
                      height: 45,
                      objectFit: 'cover',
                      borderRadius: 6,
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
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
                    <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>{v.duration}</div>
                  )}
                </div>
                {izlendi.has(v.videoId) ? (
                  <div style={{ fontSize: 14, color: '#4CAF50', flexShrink: 0, fontWeight: 700 }}>
                    ✓
                  </div>
                ) : (
                  <div style={{ fontSize: 18, color: s.text3, flexShrink: 0 }}>▶</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

VideoIzleModal.propTypes = {
  videolar: PropTypes.arrayOf(PropTypes.object),
  onKapat: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
  mobil: PropTypes.bool,
  izleyenUid: PropTypes.string,
};
