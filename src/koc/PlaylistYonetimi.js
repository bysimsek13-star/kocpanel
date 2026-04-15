import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { useToast } from '../components/Toast';
import { Btn, Card, LoadingState, EmptyState } from '../components/Shared';
import { KocHeroBand } from '../components/koc/KocPanelUi';
import { usePlaylistler } from '../hooks/usePlaylist';
import PlaylistDetay from '../components/PlaylistDetay';

const functions = getFunctions(undefined, 'europe-west1');
const playlistEkleFn = httpsCallable(functions, 'playlistEkle');
const playlistYenileFn = httpsCallable(functions, 'playlistYenile');

// ─── Playlist ekle formu ──────────────────────────────────────────────────────
function PlaylistEkleModal({ onKapat, onEklendi, s }) {
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
    } catch (e) {
      const msg = e.message || 'Bir hata oluştu';
      if (msg.includes('already-exists')) toast('Bu playlist zaten eklenmiş', 'error');
      else if (msg.includes('invalid-argument'))
        toast("Geçerli bir YouTube playlist URL'si girin", 'error');
      else toast(msg, 'error');
    }
    setYuk(false);
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
        <div style={{ fontSize: 12, color: s.text3, marginBottom: 20 }}>
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

// ─── Playlist kartı ───────────────────────────────────────────────────────────
function PlaylistKarti({ playlist, onAc, onYenile, onSil, s }) {
  const [yenileniyor, setYenileniyor] = useState(false);
  const [siliniyor, setSiliniyor] = useState(false);
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
    if (!window.confirm(`"${playlist.title}" playlist'ini silmek istediğinize emin misiniz?`))
      return;
    setSiliniyor(true);
    try {
      // Alt koleksiyonları sil
      const videosRef = collection(db, 'playlists', playlist.id, 'videos');
      const snap = await getDocs(videosRef);
      const deletions = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletions);
      await deleteDoc(doc(db, 'playlists', playlist.id));
      toast('Playlist silindi');
      onSil(playlist.id);
    } catch (e2) {
      toast('Silinemedi: ' + e2.message, 'error');
    }
    setSiliniyor(false);
  };

  return (
    <Card
      onClick={() => onAc(playlist)}
      style={{ padding: '18px 20px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>🎬</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: s.text,
              marginBottom: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {playlist.title}
          </div>
          <div style={{ fontSize: 12, color: s.text3 }}>{playlist.videoCount} video</div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={yenile}
            disabled={yenileniyor}
            style={{
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              padding: '6px 12px',
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
              borderRadius: 8,
              padding: '6px 12px',
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

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function PlaylistYonetimi({ kullanici, onGeri, dahadarKabuk = false }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const { playlistler, yukleniyor, yenile } = usePlaylistler(kullanici.uid);
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliPlaylist, setSeciliPlaylist] = useState(null);

  if (seciliPlaylist) {
    return (
      <PlaylistDetay
        playlist={seciliPlaylist}
        kullanici={kullanici}
        onGeri={() => setSeciliPlaylist(null)}
        kocGorunumu
      />
    );
  }

  return (
    <div style={{ padding: mobil && !dahadarKabuk ? 12 : 0 }}>
      {!dahadarKabuk && (
        <KocHeroBand
          baslik="Video Playlistler"
          aciklama="YouTube playlist URL'si ekleyin. Videolar otomatik çekilir, öğrenciler izleme ilerlemelerini takip edebilir."
          onGeri={onGeri}
          mobil={mobil}
        />
      )}

      {/* Üst bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={() => setModalAcik(true)}>+ Playlist Ekle</Btn>
      </div>

      {/* Liste */}
      {yukleniyor ? (
        <LoadingState />
      ) : playlistler.length === 0 ? (
        <EmptyState
          mesaj="Henüz playlist eklenmedi. YouTube playlist URL'si yapıştırarak başlayın."
          icon="🎬"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {playlistler.map(p => (
            <PlaylistKarti
              key={p.id}
              playlist={p}
              onAc={setSeciliPlaylist}
              onYenile={yenile}
              onSil={yenile}
              s={s}
            />
          ))}
        </div>
      )}

      {modalAcik && (
        <PlaylistEkleModal onKapat={() => setModalAcik(false)} onEklendi={yenile} s={s} />
      )}
    </div>
  );
}

PlaylistYonetimi.propTypes = {
  kullanici: PropTypes.object.isRequired,
  onGeri: PropTypes.func.isRequired,
  dahadarKabuk: PropTypes.bool,
};
