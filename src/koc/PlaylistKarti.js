import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Card } from '../components/Shared';
import { KANONIK_DERSLER, GRUPLAR, kanonikDersLabel } from '../constants/playlistSabitleri';

const functions = getFunctions(undefined, 'europe-west1');
const playlistYenileFn = httpsCallable(functions, 'playlistYenile');

export default function PlaylistKarti({ playlist, onAc, onYenile, onSil, s }) {
  const [yenileniyor, setYenileniyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);
  const [menu, setMenu] = useState(null); // null | 'ders' | 'gruplar'
  const toast = useToast();

  const yenile = async e => {
    e.stopPropagation();
    setYenileniyor(true);
    try {
      const res = await playlistYenileFn({ docId: playlist.id });
      toast(`Güncellendi — ${res.data.videoCount} video`);
      onYenile();
    } catch (e2) {
      toast(e2.message || 'Yenileme hatası', 'error');
    }
    setYenileniyor(false);
  };

  const sil = async e => {
    e.stopPropagation();
    if (!window.confirm(`"${playlist.title}" silinsin mi?`)) return;
    setSiliniyor(true);
    try {
      const videosRef = collection(db, 'playlists', playlist.id, 'videos');
      const snap = await getDocs(videosRef);
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      await deleteDoc(doc(db, 'playlists', playlist.id));
      toast('Playlist silindi');
      onSil(playlist.id);
    } catch (e2) {
      toast('Silinemedi: ' + e2.message, 'error');
    }
    setSiliniyor(false);
  };

  const dersGuncelle = async dersId => {
    setMenu(null);
    try {
      await updateDoc(doc(db, 'playlists', playlist.id), { ders: dersId || null });
      onYenile();
    } catch (e2) {
      toast('Kaydedilemedi: ' + e2.message, 'error');
    }
  };

  const grupToggle = async grupId => {
    const mevcut = playlist.gruplar || [];
    const yeni = mevcut.includes(grupId) ? mevcut.filter(g => g !== grupId) : [...mevcut, grupId];
    try {
      await updateDoc(doc(db, 'playlists', playlist.id), { gruplar: yeni });
      onYenile();
    } catch (e2) {
      toast('Kaydedilemedi: ' + e2.message, 'error');
    }
  };

  const gruplar = playlist.gruplar || [];
  const dersLabel = kanonikDersLabel(playlist.ders);

  const menuStil = {
    position: 'absolute',
    top: '100%',
    right: 0,
    zIndex: 200,
    background: s.surface,
    border: `1px solid ${s.border}`,
    borderRadius: 12,
    boxShadow: s.shadow,
    minWidth: 180,
    maxHeight: 260,
    overflowY: 'auto',
    marginTop: 4,
  };

  const menuSatirStil = secili => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    textAlign: 'left',
    padding: '9px 14px',
    fontSize: 12,
    fontWeight: secili ? 700 : 400,
    color: secili ? s.accent : s.text,
    background: secili ? `${s.accent}12` : 'transparent',
    border: 'none',
    borderBottom: `1px solid ${s.border}`,
    cursor: 'pointer',
  });

  return (
    <Card
      onClick={() => {
        setMenu(null);
        onAc(playlist);
      }}
      style={{ padding: '14px 18px', cursor: 'pointer', position: 'relative', overflow: 'visible' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 22, flexShrink: 0 }}>🎬</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: s.text,
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {playlist.title}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: s.text3 }}>{playlist.videoCount} video</span>
            {playlist.ders && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: s.accent,
                  background: `${s.accent}18`,
                  borderRadius: 20,
                  padding: '2px 8px',
                }}
              >
                {dersLabel}
              </span>
            )}
            {gruplar.map(g => (
              <span
                key={g}
                style={{
                  fontSize: 10,
                  color: s.text2,
                  background: s.surface2,
                  border: `1px solid ${s.border}`,
                  borderRadius: 20,
                  padding: '1px 7px',
                }}
              >
                {GRUPLAR.find(x => x.id === g)?.label ?? g}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenu(m => (m === 'ders' ? null : 'ders'))}
              style={{
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 7,
                padding: '5px 9px',
                color: s.text2,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Ders
            </button>
            {menu === 'ders' && (
              <div onClick={e => e.stopPropagation()} style={menuStil}>
                <button onClick={() => dersGuncelle('')} style={menuSatirStil(false)}>
                  — Ders yok
                </button>
                {KANONIK_DERSLER.map(d => (
                  <button
                    key={d.id}
                    onClick={() => dersGuncelle(d.id)}
                    style={menuSatirStil(playlist.ders === d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenu(m => (m === 'gruplar' ? null : 'gruplar'))}
              style={{
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 7,
                padding: '5px 9px',
                color: s.text2,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Gruplar {gruplar.length > 0 ? `(${gruplar.length})` : ''}
            </button>
            {menu === 'gruplar' && (
              <div onClick={e => e.stopPropagation()} style={menuStil}>
                {GRUPLAR.map(g => {
                  const secili = gruplar.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => grupToggle(g.id)}
                      style={menuSatirStil(secili)}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          border: `1.5px solid ${secili ? s.accent : s.border}`,
                          background: secili ? s.accent : 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {secili ? '✓' : ''}
                      </span>
                      {g.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={yenile}
            disabled={yenileniyor}
            style={{
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 7,
              padding: '5px 9px',
              color: s.text2,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {yenileniyor ? '...' : 'Yenile'}
          </button>
          <button
            onClick={sil}
            disabled={siliniyor}
            style={{
              background: s.tehlikaSoft ?? `${s.danger}18`,
              border: 'none',
              borderRadius: 7,
              padding: '5px 9px',
              color: s.tehlika ?? s.danger,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {siliniyor ? '...' : 'Sil'}
          </button>
        </div>
      </div>
    </Card>
  );
}

PlaylistKarti.propTypes = {
  playlist: PropTypes.object.isRequired,
  onAc: PropTypes.func.isRequired,
  onYenile: PropTypes.func.isRequired,
  onSil: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
