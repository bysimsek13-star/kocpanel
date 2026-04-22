import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { toplamSureHesapla } from './programBilesenUtils';
import VideoSeciciVideoPanel from './VideoSeciciVideoPanel';
import { MUFREDAT_TO_KANONIK, ogrenciTurToGrup } from '../constants/playlistSabitleri';

export function VideoSecici({
  kocUid,
  seciliVideolar,
  onChange,
  ders,
  dersId,
  ogrenciTur,
  ogrenciSinif,
  s,
}) {
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

  const ogrenciGrup = useMemo(
    () => ogrenciTurToGrup(ogrenciTur, ogrenciSinif),
    [ogrenciTur, ogrenciSinif]
  );
  const kanonikDers = useMemo(() => (dersId ? MUFREDAT_TO_KANONIK[dersId] : null), [dersId]);

  const gorunenPlaylistler = useMemo(() => {
    if (!playlistler.length) return [];
    let liste = [...playlistler];
    // Önce öğrencinin grubuna atanmış olanları filtrele
    if (ogrenciGrup) {
      const grupluListe = liste.filter(p => (p.gruplar || []).includes(ogrenciGrup));
      if (grupluListe.length > 0) liste = grupluListe;
    }
    // Kanonik ders eşleşmesine göre sırala/filtrele
    if (kanonikDers) {
      const eslesenler = liste.filter(p => p.ders === kanonikDers);
      if (eslesenler.length > 0) return eslesenler;
    }
    // Fallback: ders adıyla title eşleşmesi
    if (ders?.trim()) {
      return [...liste].sort((a, b) => {
        const al = a.title?.toLowerCase() || '';
        const bl = b.title?.toLowerCase() || '';
        const dl = ders.toLowerCase();
        return (bl.includes(dl) ? 1 : 0) - (al.includes(dl) ? 1 : 0);
      });
    }
    return liste;
  }, [playlistler, ogrenciGrup, kanonikDers, ders]);

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
        gorunenPlaylistler.length === 0 ? (
          <div style={{ fontSize: 12, color: s.text3, padding: '8px 0' }}>
            {kanonikDers ? 'Bu derse atanmış playlist yok.' : 'Henüz playlist eklenmemiş.'}
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
            {gorunenPlaylistler.map(pl => {
              const vurgula = kanonikDers
                ? pl.ders === kanonikDers
                : ders?.trim() && pl.title?.toLowerCase().includes(ders.toLowerCase());
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
        <VideoSeciciVideoPanel
          seciliPL={seciliPL}
          plVideolar={plVideolar}
          plYukleniyor={plYukleniyor}
          seciliVideolar={seciliVideolar}
          onChange={onChange}
          onGeri={() => {
            setSeciliPL(null);
            setPlVideolar([]);
          }}
          s={s}
        />
      )}
    </div>
  );
}
