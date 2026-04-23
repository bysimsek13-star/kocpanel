import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, doc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { useToast } from '../components/Toast';
import { LoadingState, EmptyState } from '../components/Shared';
import { KocHeroBand } from '../components/koc/KocPanelUi';
import { KaynakModal } from './KaynakModal';
import { KaynakKarti } from './KaynakKarti';
import KitapVideoVideoPlaylist from './KitapVideoVideoPlaylist';
import { TUR_SECENEKLER } from './kitapVideoUtils';

export default function KitapVideoKutuphane({ kullanici, onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();
  const toast = useToast();
  const [kaynaklar, setKaynaklar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenle, setDuzenle] = useState(null);
  const [filtreTur, setFiltreTur] = useState('tumu');
  const [aramaText, setAramaText] = useState('');

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const q = query(
        collection(db, 'kutuphane'),
        where('koc_uid', '==', kullanici.uid),
        orderBy('olusturma', 'desc')
      );
      const snap = await getDocs(q);
      setKaynaklar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  }, [kullanici.uid]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const sil = async id => {
    try {
      await deleteDoc(doc(db, 'kutuphane', id));
      toast('Kaynak silindi');
      setKaynaklar(prev => prev.filter(k => k.id !== id));
    } catch {
      toast('Silinemedi', 'error');
    }
  };

  const gorunenler = kaynaklar
    .filter(k => filtreTur === 'tumu' || filtreTur === 'video' || k.tur === filtreTur)
    .filter(k => {
      if (!aramaText) return true;
      const ara = aramaText.toLowerCase();
      return (
        k.baslik?.toLowerCase().includes(ara) ||
        k.yazar?.toLowerCase().includes(ara) ||
        k.aciklama?.toLowerCase().includes(ara) ||
        k.dersler?.some(d => d.toLowerCase().includes(ara))
      );
    });

  const videoKaynaklar = kaynaklar
    .filter(k => k.tur === 'video')
    .filter(k => {
      if (!aramaText) return true;
      const ara = aramaText.toLowerCase();
      return k.baslik?.toLowerCase().includes(ara) || k.aciklama?.toLowerCase().includes(ara);
    });

  const istatistik = {
    kitap: kaynaklar.filter(k => k.tur === 'kitap').length,
    video: kaynaklar.filter(k => k.tur === 'video').length,
    makale: kaynaklar.filter(k => k.tur === 'makale').length,
    podcast: kaynaklar.filter(k => k.tur === 'podcast').length,
  };

  return (
    <div style={{ padding: mobil ? 12 : 0 }}>
      <KocHeroBand
        baslik="Kaynak kütüphanesi"
        aciklama="Öğrencilerinize önereceğiniz kitap, video, makale ve podcast kaynaklarını burada derleyin."
        onGeri={onGeri}
        mobil={mobil}
      />

      {/* KPI şeridi */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}
      >
        {[
          { l: 'Kitap', v: istatistik.kitap, ikon: '📚' },
          { l: 'Video', v: istatistik.video, ikon: '🎬' },
          { l: 'Makale', v: istatistik.makale, ikon: '📄' },
          { l: 'Podcast', v: istatistik.podcast, ikon: '🎙️' },
        ].map(k => (
          <div
            key={k.l}
            style={{
              background: s.surface,
              border: `1px solid ${s.border}`,
              borderRadius: 12,
              padding: '12px 14px',
              textAlign: 'center',
              boxShadow: s.shadowCard,
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{k.ikon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.text }}>{k.v}</div>
            <div style={{ fontSize: 10, color: s.text3 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Filtre + arama çubuğu */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          value={aramaText}
          onChange={e => setAramaText(e.target.value)}
          placeholder="Ara: başlık, yazar, ders..."
          style={{
            flex: 2,
            minWidth: 160,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '9px 14px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
          }}
        />
        <div
          style={{
            display: 'flex',
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {TUR_SECENEKLER.map(t => (
            <button
              key={t.k}
              type="button"
              onClick={() => setFiltreTur(t.k)}
              style={{
                padding: '8px 12px',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: filtreTur === t.k ? s.accent : 'transparent',
                color: filtreTur === t.k ? '#fff' : s.text3,
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
        {filtreTur !== 'video' && (
          <button
            onClick={() => {
              setDuzenle(null);
              setModalAcik(true);
            }}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              background: s.accent,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            + Kaynak ekle
          </button>
        )}
      </div>

      {/* Video & Playlist birleşik görünüm */}
      {filtreTur === 'video' ? (
        <KitapVideoVideoPlaylist
          kullanici={kullanici}
          videoKaynaklar={videoKaynaklar}
          yukle={yukle}
          sil={sil}
          setDuzenle={setDuzenle}
          setModalAcik={setModalAcik}
          s={s}
        />
      ) : yukleniyor ? (
        <LoadingState />
      ) : gorunenler.length === 0 ? (
        <EmptyState
          mesaj={
            kaynaklar.length === 0 ? 'Henüz kaynak eklenmedi' : 'Aramanızla eşleşen kaynak yok'
          }
          icon="📖"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {gorunenler.map(k => (
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

      {modalAcik && (
        <KaynakModal
          koc_uid={kullanici.uid}
          mevcut={duzenle}
          onKapat={() => {
            setModalAcik(false);
            setDuzenle(null);
          }}
          onKaydet={yukle}
          s={s}
        />
      )}
    </div>
  );
}

KitapVideoKutuphane.propTypes = {
  kullanici: PropTypes.object.isRequired,
  onGeri: PropTypes.func.isRequired,
};
