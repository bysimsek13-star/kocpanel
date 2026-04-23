import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { Btn, LoadingState, EmptyState } from '../components/Shared';
import { KocHeroBand } from '../components/koc/KocPanelUi';
import { usePlaylistler } from '../hooks/usePlaylist';
import PlaylistDetay from '../components/PlaylistDetay';
import PlaylistEkleModal from './PlaylistEkleModal';
import PlaylistKarti from './PlaylistKarti';
import {
  GRUPLAR,
  KANONIK_DERSLER,
  GRUP_DERSLER,
  kanonikDersLabel,
} from '../constants/playlistSabitleri';

function TabBar({ secili, onChange, s }) {
  return (
    <div style={{ display: 'flex', overflowX: 'auto', gap: 6, marginBottom: 18, paddingBottom: 4 }}>
      {GRUPLAR.map(g => (
        <button
          key={g.id}
          onClick={() => onChange(secili === g.id ? null : g.id)}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            border: `1px solid ${secili === g.id ? s.accent : s.border}`,
            background: secili === g.id ? `${s.accent}18` : s.surface2,
            color: secili === g.id ? s.accent : s.text2,
          }}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

function DersGrid({ playlistler, seciliGrup, onDersSecili, s }) {
  const grupPlaylists = playlistler.filter(p => p.gruplar?.includes(seciliGrup));
  const izinliDersIds = GRUP_DERSLER[seciliGrup] || Object.keys(KANONIK_DERSLER);
  const gorunenDersler = KANONIK_DERSLER.filter(d => izinliDersIds.includes(d.id));
  const atanmamis = grupPlaylists.filter(p => !p.ders).length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 10,
      }}
    >
      {gorunenDersler.map(d => {
        const sayi = grupPlaylists.filter(p => p.ders === d.id).length;
        return (
          <button
            key={d.id}
            onClick={() => onDersSecili(d.id)}
            style={{
              padding: '14px 10px',
              borderRadius: 14,
              border: `1px solid ${sayi > 0 ? s.accent + '50' : s.border}`,
              background: sayi > 0 ? `${s.accent}0d` : s.surface2,
              color: sayi > 0 ? s.text : s.text3,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
            <div style={{ fontSize: 11, color: sayi > 0 ? s.accent : s.text3 }}>
              {sayi > 0 ? `${sayi} playlist` : 'Yok'}
            </div>
          </button>
        );
      })}
      {atanmamis > 0 && (
        <button
          onClick={() => onDersSecili('__atanmamis__')}
          style={{
            padding: '14px 10px',
            borderRadius: 14,
            border: `1px solid ${s.danger}50`,
            background: `${s.danger}0d`,
            color: s.text,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Atanmamış</div>
          <div style={{ fontSize: 11, color: s.danger }}>{atanmamis} playlist</div>
        </button>
      )}
    </div>
  );
}

export default function PlaylistYonetimi({ kullanici, onGeri, dahadarKabuk = false }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const { playlistler, yukleniyor, yenile } = usePlaylistler(kullanici.uid);
  const [seciliGrup, setSeciliGrup] = useState(null);
  const [seciliDers, setSeciliDers] = useState(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliPlaylist, setSeciliPlaylist] = useState(null);

  const filtreliListe = useMemo(() => {
    if (!seciliGrup || !seciliDers) return [];
    const grupPlaylists = playlistler.filter(p => p.gruplar?.includes(seciliGrup));
    if (seciliDers === '__atanmamis__') return grupPlaylists.filter(p => !p.ders);
    return grupPlaylists.filter(p => p.ders === seciliDers);
  }, [playlistler, seciliGrup, seciliDers]);

  const grupSec = id => {
    setSeciliGrup(id);
    setSeciliDers(null);
  };

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
          aciklama="Grup ve derse göre playlistlerinizi yönetin."
          onGeri={onGeri}
          mobil={mobil}
        />
      )}

      <TabBar secili={seciliGrup} onChange={grupSec} s={s} />

      {!seciliGrup ? (
        <EmptyState mesaj="Bir grup seçerek playlistleri görüntüleyin." icon="📚" />
      ) : !seciliDers ? (
        yukleniyor ? (
          <LoadingState />
        ) : (
          <DersGrid
            playlistler={playlistler}
            seciliGrup={seciliGrup}
            onDersSecili={setSeciliDers}
            s={s}
          />
        )
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <button
              onClick={() => setSeciliDers(null)}
              style={{
                background: 'none',
                border: 'none',
                color: s.accent,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                padding: 0,
              }}
            >
              ← {seciliDers === '__atanmamis__' ? 'Atanmamış' : kanonikDersLabel(seciliDers)}
            </button>
            <Btn onClick={() => setModalAcik(true)}>+ Playlist Ekle</Btn>
          </div>

          {yukleniyor ? (
            <LoadingState />
          ) : filtreliListe.length === 0 ? (
            <EmptyState mesaj="Bu ders ve gruba ait playlist yok." icon="🎬" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtreliListe.map(p => (
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
        </>
      )}

      {modalAcik && (
        <PlaylistEkleModal
          kocUid={kullanici.uid}
          onKapat={() => setModalAcik(false)}
          onEklendi={yenile}
          preDers={seciliDers}
          preGrup={seciliGrup}
          s={s}
        />
      )}
    </div>
  );
}

TabBar.propTypes = {
  secili: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};

DersGrid.propTypes = {
  playlistler: PropTypes.array.isRequired,
  seciliGrup: PropTypes.string.isRequired,
  onDersSecili: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};

PlaylistYonetimi.propTypes = {
  kullanici: PropTypes.object.isRequired,
  onGeri: PropTypes.func.isRequired,
  dahadarKabuk: PropTypes.bool,
};
