import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Btn } from '../components/Shared';
import { kanonikDersLabel, grupLabel } from '../constants/playlistSabitleri';

const functions = getFunctions(undefined, 'europe-west1');
const playlistEkleFn = httpsCallable(functions, 'playlistEkle');

export default function PlaylistEkleModal({ kocUid, onKapat, onEklendi, preDers, preGrup, s }) {
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [yukleniyor, setYuk] = useState(false);

  const ekle = async () => {
    if (!url.trim()) return;
    setYuk(true);
    try {
      const res = await playlistEkleFn({ url: url.trim() });
      toast(`"${res.data.title}" eklendi — ${res.data.videoCount} video`);
      onEklendi();
      onKapat();
      // Ders/grup atamasını arka planda yap (modal zaten kapandı)
      if ((preDers || preGrup) && kocUid) {
        setTimeout(async () => {
          try {
            const snap = await getDocs(
              query(
                collection(db, 'playlists'),
                where('coachId', '==', kocUid),
                orderBy('createdAt', 'desc'),
                limit(1)
              )
            );
            if (!snap.empty) {
              const guncelle = {};
              if (preDers) guncelle.ders = preDers;
              if (preGrup) guncelle.gruplar = [preGrup];
              await updateDoc(doc(db, 'playlists', snap.docs[0].id), guncelle);
              onEklendi();
            }
          } catch (_) {
            /* sessizce geç */
          }
        }, 1500);
      }
    } catch (e) {
      const msg = e.message || 'Bir hata oluştu';
      if (msg.includes('already-exists')) toast('Bu playlist zaten eklenmiş', 'error');
      else if (msg.includes('invalid-argument'))
        toast("Geçerli bir YouTube playlist URL'si girin", 'error');
      else toast(msg, 'error');
      setYuk(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: 28,
          width: 480,
          maxWidth: '95vw',
          boxShadow: s.shadow,
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: s.text, marginBottom: 6 }}>
          YouTube Playlist Ekle
        </div>

        {(preDers || preGrup) && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {preDers && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: s.accent,
                  background: `${s.accent}18`,
                  borderRadius: 20,
                  padding: '3px 10px',
                }}
              >
                {kanonikDersLabel(preDers)}
              </span>
            )}
            {preGrup && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: s.text2,
                  background: s.surface2,
                  border: `1px solid ${s.border}`,
                  borderRadius: 20,
                  padding: '3px 10px',
                }}
              >
                {grupLabel(preGrup)}
              </span>
            )}
          </div>
        )}

        <div style={{ fontSize: 12, color: s.text3, marginBottom: 16 }}>
          Playlist URL'sini yapıştırın. Videolar otomatik çekilir ve Firestore'a kaydedilir.
        </div>

        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ekle()}
          placeholder="https://www.youtube.com/playlist?list=PLxxx"
          style={{
            width: '100%',
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '11px 14px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: 18,
          }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }} disabled={yukleniyor}>
            İptal
          </Btn>
          <Btn onClick={ekle} disabled={!url.trim() || yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Videolar çekiliyor...' : 'Playlist Ekle'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

PlaylistEkleModal.propTypes = {
  kocUid: PropTypes.string,
  onKapat: PropTypes.func.isRequired,
  onEklendi: PropTypes.func.isRequired,
  preDers: PropTypes.string,
  preGrup: PropTypes.string,
  s: PropTypes.object.isRequired,
};
