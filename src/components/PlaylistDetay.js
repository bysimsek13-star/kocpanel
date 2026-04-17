import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { Btn, LoadingState } from './Shared';
import { usePlaylistVideolar, useIzlemeDurumu } from '../hooks/usePlaylist';
import { VideoPlayer, VideoSatiri } from './PlaylistDetayBilesenleri';

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
