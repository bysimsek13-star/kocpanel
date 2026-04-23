import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Btn, EmptyState, LoadingState } from '../components/Shared';
import { KaynakKarti } from './KaynakKarti';
import PlaylistKarti from './PlaylistKarti';
import PlaylistDetay from '../components/PlaylistDetay';
import PlaylistEkleModal from './PlaylistEkleModal';
import { usePlaylistler } from '../hooks/usePlaylist';

export default function KitapVideoVideoPlaylist({
  kullanici,
  videoKaynaklar,
  _yukle,
  sil,
  setDuzenle,
  setModalAcik,
  s,
}) {
  const { playlistler, yukleniyor, yenile } = usePlaylistler(kullanici.uid);
  const [seciliPlaylist, setSeciliPlaylist] = useState(null);
  const [playlistModal, setPlaylistModal] = useState(false);

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
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '.05em',
          }}
        >
          Video Kaynaklar ({videoKaynaklar.length})
        </div>
        <Btn
          onClick={() => {
            setDuzenle(null);
            setModalAcik(true);
          }}
          style={{ padding: '7px 14px', fontSize: 12 }}
        >
          + Video Ekle
        </Btn>
      </div>

      {videoKaynaklar.length === 0 ? (
        <EmptyState mesaj="Video kaynak eklenmemiş" icon="🎬" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {videoKaynaklar.map(k => (
            <KaynakKarti
              key={k.id}
              kaynak={k}
              onDuzenle={kaynak => {
                setDuzenle(kaynak);
                setModalAcik(true);
              }}
              onSil={sil}
              s={s}
            />
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '.05em',
          }}
        >
          Playlistler ({yukleniyor ? '…' : playlistler.length})
        </div>
        <Btn onClick={() => setPlaylistModal(true)} style={{ padding: '7px 14px', fontSize: 12 }}>
          + Playlist Ekle
        </Btn>
      </div>

      {yukleniyor ? (
        <LoadingState />
      ) : playlistler.length === 0 ? (
        <EmptyState mesaj="Henüz playlist oluşturulmamış" icon="🎬" />
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

      {playlistModal && (
        <PlaylistEkleModal
          kocUid={kullanici.uid}
          onKapat={() => setPlaylistModal(false)}
          onEklendi={yenile}
          s={s}
        />
      )}
    </div>
  );
}

KitapVideoVideoPlaylist.propTypes = {
  kullanici: PropTypes.object.isRequired,
  videoKaynaklar: PropTypes.array.isRequired,
  _yukle: PropTypes.func.isRequired,
  sil: PropTypes.func.isRequired,
  setDuzenle: PropTypes.func.isRequired,
  setModalAcik: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
