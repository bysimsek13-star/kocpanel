import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { Btn, LoadingState } from './Shared';
import { usePlaylistVideolar, useIzlemeDurumu } from '../hooks/usePlaylist';

// ─── YouTube embed player ─────────────────────────────────────────────────────
function VideoPlayer({ video, izlendi: zatenIzlendi, onIzlendi, onKapat, s: _s, mobil }) {
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
      {/* Üst bar */}
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

      {/* Player */}
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

// ─── Video satırı ─────────────────────────────────────────────────────────────
function VideoSatiri({ video, izlendi, pozisyon, onClick, s }) {
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
      {/* Pozisyon / izlendi */}
      <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
        {izlendi ? (
          <span style={{ fontSize: 14, color: '#4CAF50' }}>✓</span>
        ) : (
          <span style={{ fontSize: 11, color: s.text3, fontWeight: 600 }}>{pozisyon + 1}</span>
        )}
      </div>

      {/* Thumbnail */}
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
        {/* Play overlay */}
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

      {/* Bilgi */}
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

      {/* Süre */}
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

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function PlaylistDetay({ playlist, kullanici, onGeri, kocGorunumu = false }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const { videolar, yukleniyor, daha, dahaYukle } = usePlaylistVideolar(playlist.id);
  const { izlenenler, izlendi } = useIzlemeDurumu(kullanici.uid, playlist.id);
  const [aktifVideo, setAktifVideo] = useState(null);

  const izlenenSayisi = Object.keys(izlenenler).length;
  const tamamlanmaYuzdesi =
    videolar.length > 0 ? Math.round((izlenenSayisi / playlist.videoCount) * 100) : 0;

  const videoAc = video => {
    setAktifVideo(video);
  };

  const playerKapat = () => setAktifVideo(null);

  return (
    <div style={{ padding: mobil ? 12 : 0 }}>
      {/* Geri / başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button
          onClick={onGeri}
          style={{
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 8,
            padding: '6px 12px',
            color: s.text2,
            cursor: 'pointer',
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          ← Geri
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: s.text }}>{playlist.title}</div>
          <div style={{ fontSize: 11, color: s.text3 }}>{playlist.videoCount} video</div>
        </div>
      </div>

      {/* İlerleme (öğrenci görünümünde) */}
      {!kocGorunumu && (
        <div
          style={{
            background: s.surface,
            border: `1px solid ${s.border}`,
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: s.text2 }}>İlerleme</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.accent }}>
              {izlenenSayisi} / {playlist.videoCount} — {tamamlanmaYuzdesi}%
            </span>
          </div>
          <div style={{ height: 6, background: s.surface2, borderRadius: 6, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${tamamlanmaYuzdesi}%`,
                background: s.accentGrad,
                borderRadius: 6,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Video listesi */}
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {yukleniyor && videolar.length === 0 ? (
          <LoadingState />
        ) : videolar.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: s.text3, fontSize: 13 }}>
            Video bulunamadı
          </div>
        ) : (
          <>
            <div style={{ padding: '8px 0' }}>
              {videolar.map((v, idx) => (
                <VideoSatiri
                  key={v.videoId}
                  video={v}
                  izlendi={!!izlenenler[v.videoId]}
                  pozisyon={idx}
                  onClick={() => videoAc(v)}
                  s={s}
                />
              ))}
            </div>

            {daha && (
              <div style={{ padding: '12px 14px', borderTop: `1px solid ${s.border}` }}>
                <Btn
                  onClick={dahaYukle}
                  variant="ghost"
                  style={{ width: '100%' }}
                  disabled={yukleniyor}
                >
                  {yukleniyor ? 'Yükleniyor...' : 'Daha fazla göster'}
                </Btn>
              </div>
            )}
          </>
        )}
      </div>

      {/* Player modal */}
      {aktifVideo && (
        <VideoPlayer
          video={aktifVideo}
          izlendi={!!izlenenler[aktifVideo.videoId]}
          onIzlendi={izlendi}
          onKapat={playerKapat}
          s={s}
          mobil={mobil}
        />
      )}
    </div>
  );
}
