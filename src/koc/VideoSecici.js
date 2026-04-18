import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { toplamSureHesapla } from './programBilesenUtils';

export function VideoSecici({ kocUid, seciliVideolar, onChange, ders, s }) {
  const [playlistler, setPlaylistler] = useState([]);
  const [seciliPL, setSeciliPL] = useState(null);
  const [plVideolar, setPlVideolar] = useState([]);
  const [plYukleniyor, setPlYukleniyor] = useState(false);

  useEffect(() => {
    if (!kocUid) return;
    getDocs(
      query(
        collection(db, 'playlists'),
        where('coachId', '==', kocUid),
        orderBy('createdAt', 'desc')
      )
    )
      .then(snap => setPlaylistler(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error);
  }, [kocUid]);

  const plSec = async pl => {
    setSeciliPL(pl);
    setPlYukleniyor(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'playlists', pl.id, 'videos'), orderBy('position'))
      );
      setPlVideolar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setPlYukleniyor(false);
  };

  const toggle = video => {
    const var_ = seciliVideolar.some(v => v.videoId === video.videoId);
    if (var_) onChange(seciliVideolar.filter(v => v.videoId !== video.videoId));
    else
      onChange([
        ...seciliVideolar,
        {
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.thumbnail,
          duration: video.duration,
          playlistDocId: seciliPL.id,
        },
      ]);
  };

  const toplamSure = toplamSureHesapla(seciliVideolar);

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 11, color: s.text3, fontWeight: 600 }}>
          Video seç{seciliVideolar.length > 0 ? ` (${seciliVideolar.length} video)` : ''}
        </div>
        {toplamSure && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: s.info ?? s.accent,
              background: `${s.info ?? s.accent}15`,
              padding: '3px 10px',
              borderRadius: 20,
            }}
          >
            ⏱ {toplamSure}
          </div>
        )}
      </div>

      {seciliVideolar.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {seciliVideolar.map(v => (
            <div
              key={v.videoId}
              onClick={() => onChange(seciliVideolar.filter(x => x.videoId !== v.videoId))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 20,
                background: `${s.info ?? s.accent}18`,
                border: `1px solid ${s.info ?? s.accent}40`,
                cursor: 'pointer',
                fontSize: 11,
                color: s.text2,
              }}
            >
              <span
                style={{
                  maxWidth: 140,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.title}
              </span>
              <span style={{ color: s.text3, fontSize: 10 }}>✕</span>
            </div>
          ))}
        </div>
      )}

      {!seciliPL ? (
        playlistler.length === 0 ? (
          <div style={{ fontSize: 12, color: s.text3, padding: '8px 0' }}>
            Henüz playlist eklenmemiş.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              maxHeight: 160,
              overflowY: 'auto',
            }}
          >
            {(ders?.trim()
              ? [...playlistler].sort((a, b) => {
                  const al = a.title?.toLowerCase() || '';
                  const bl = b.title?.toLowerCase() || '';
                  const dl = ders.toLowerCase();
                  return (bl.includes(dl) ? 1 : 0) - (al.includes(dl) ? 1 : 0);
                })
              : playlistler
            ).map(pl => {
              const vurgula = ders?.trim() && pl.title?.toLowerCase().includes(ders.toLowerCase());
              return (
                <div
                  key={pl.id}
                  onClick={() => plSec(pl)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: vurgula ? `${s.info ?? s.accent}12` : s.surface2,
                    border: `1px solid ${vurgula ? (s.info ?? s.accent) + '50' : s.border}`,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontSize: 16 }}>🎬</span>
                  <span
                    style={{
                      flex: 1,
                      color: s.text,
                      fontWeight: vurgula ? 700 : 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pl.title}
                  </span>
                  <span style={{ color: s.text3, fontSize: 11, flexShrink: 0 }}>
                    {pl.videoCount} video →
                  </span>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div>
          <button
            onClick={() => {
              setSeciliPL(null);
              setPlVideolar([]);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: s.accent,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              padding: '0 0 8px 0',
            }}
          >
            ← {seciliPL.title}
          </button>
          {plYukleniyor ? (
            <div style={{ fontSize: 12, color: s.text3 }}>Yükleniyor...</div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxHeight: 180,
                overflowY: 'auto',
              }}
            >
              {plVideolar.map(v => {
                const secili = seciliVideolar.some(x => x.videoId === v.videoId);
                return (
                  <div
                    key={v.videoId}
                    onClick={() => toggle(v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                      background: secili ? `${s.info ?? s.accent}15` : s.surface2,
                      border: `1px solid ${secili ? (s.info ?? s.accent) : s.border}`,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        flexShrink: 0,
                        background: secili ? (s.info ?? s.accent) : 'transparent',
                        border: `2px solid ${secili ? (s.info ?? s.accent) : s.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {secili && (
                        <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>
                      )}
                    </div>
                    {v.thumbnail && (
                      <img
                        src={v.thumbnail}
                        alt=""
                        style={{
                          width: 40,
                          height: 22,
                          objectFit: 'cover',
                          borderRadius: 4,
                          flexShrink: 0,
                        }}
                        loading="lazy"
                      />
                    )}
                    <span
                      style={{
                        flex: 1,
                        fontSize: 11,
                        color: s.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v.title}
                    </span>
                    {v.duration && (
                      <span style={{ fontSize: 10, color: s.text3, flexShrink: 0 }}>
                        {v.duration}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
