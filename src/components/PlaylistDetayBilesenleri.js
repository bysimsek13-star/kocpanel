import React, { useEffect, useRef, useState } from 'react';

export function VideoPlayer({ video, izlendi: zatenIzlendi, onIzlendi, onKapat, s: _s, mobil }) {
  const acilisRef = useRef(Date.now());
  const [isaretlendi, setIsaretlendi] = useState(false);

  useEffect(() => {
    acilisRef.current = Date.now();
    setIsaretlendi(false);
  }, [video]);

  const izlendiIsaretle = async () => {
    const dur = Math.round((Date.now() - acilisRef.current) / 1000);
    setIsaretlendi(true);
    onIzlendi(video.videoId, dur);
  };

  if (!video) return null;
  const tamamenIzlendi = zatenIzlendi || isaretlendi;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: mobil ? 0 : 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          marginBottom: mobil ? 0 : 8,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: 12,
          }}
        >
          {video.title}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {!tamamenIzlendi && (
            <button
              onClick={izlendiIsaretle}
              style={{
                background: '#4CAF50',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ✓ İzledim
            </button>
          )}
          {tamamenIzlendi && (
            <div
              style={{
                background: 'rgba(76,175,80,0.2)',
                border: '1px solid #4CAF50',
                borderRadius: 8,
                padding: '6px 14px',
                color: '#4CAF50',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ✓ İzlendi
            </div>
          )}
          <button
            onClick={onKapat}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Kapat ✕
          </button>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 900,
          aspectRatio: '16/9',
          background: '#000',
          borderRadius: mobil ? 0 : 12,
          overflow: 'hidden',
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
  );
}

export function VideoSatiri({ video, izlendi, pozisyon, onClick, s }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'background 0.12s',
        background: hover ? s.surface2 : 'transparent',
      }}
    >
      <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
        {izlendi ? (
          <span style={{ fontSize: 14, color: '#4CAF50' }}>✓</span>
        ) : (
          <span style={{ fontSize: 11, color: s.text3, fontWeight: 600 }}>{pozisyon + 1}</span>
        )}
      </div>

      <div
        style={{
          width: 100,
          height: 56,
          borderRadius: 6,
          overflow: 'hidden',
          flexShrink: 0,
          background: s.surface2,
          position: 'relative',
        }}
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            🎬
          </div>
        )}
        {hover && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 20 }}>▶</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: izlendi ? 400 : 600,
            color: izlendi ? s.text3 : s.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {video.title}
        </div>
      </div>

      {video.duration && (
        <div
          style={{
            fontSize: 11,
            color: s.text3,
            flexShrink: 0,
            background: s.surface2,
            padding: '3px 7px',
            borderRadius: 5,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {video.duration}
        </div>
      )}
    </div>
  );
}
