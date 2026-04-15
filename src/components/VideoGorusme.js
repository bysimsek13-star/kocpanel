import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firebase';
import { logIstemciHatasi } from '../utils/izleme';

const AGORA_APP_ID = '6d61a6f6984648b5835d30f11e18ee76';
const agoraTokenFn = httpsCallable(getFunctions(undefined, 'europe-west1'), 'agoraToken');

function formatSure(sn) {
  const m = Math.floor(sn / 60);
  const s = sn % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function VideoGorusme({ session, kullanici, karsıIsim, onKapat }) {
  const clientRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const localDivRef = useRef(null);
  const remoteDivRef = useRef(null);
  const baglandiRef = useRef(false); // join() başarılıysa true; hata durumunda leave() beklenen failure

  const [durum, setDurum] = useState('baglanıyor'); // baglanıyor | aktif | hata
  const [mikrofon, setMikrofon] = useState(true);
  const [kamera, setKamera] = useState(true);
  const [karsiVar, setKarsiVar] = useState(false);
  const [hata, setHata] = useState(null);
  const [sure, setSure] = useState(0);

  // Süre sayacı
  useEffect(() => {
    if (durum !== 'aktif') return;
    const t = setInterval(() => setSure(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [durum]);

  const temizle = useCallback(
    async (guncelle = true) => {
      audioRef.current?.close();
      videoRef.current?.close();
      try {
        await clientRef.current?.leave();
      } catch (e) {
        if (baglandiRef.current)
          logIstemciHatasi({
            error: e,
            info: 'Agora leave hatası',
            kaynak: 'VideoGorusme',
            ekstra: { sessionId: session.id },
          });
      }
      if (guncelle) {
        try {
          await updateDoc(doc(db, 'goruntulu', session.id), {
            durum: 'bitti',
            bitisTarih: serverTimestamp(),
          });
        } catch (e) {
          logIstemciHatasi({
            error: e,
            info: 'Görüşme bitiş bilgisi kaydedilemedi',
            kaynak: 'VideoGorusme',
            ekstra: { sessionId: session.id },
          });
        }
      }
    },
    [session.id]
  );

  useEffect(() => {
    AgoraRTC.setLogLevel(4);
    let mounted = true; // race condition önleyici flag

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (!mounted) return;
      if (mediaType === 'video') {
        setKarsiVar(true);
        setDurum('aktif');
        setTimeout(() => {
          if (remoteDivRef.current) user.videoTrack?.play(remoteDivRef.current);
        }, 100);
      }
      if (mediaType === 'audio') user.audioTrack?.play();
    });

    client.on('user-unpublished', (_user, mediaType) => {
      if (mounted && mediaType === 'video') setKarsiVar(false);
    });

    client.on('user-left', () => {
      if (mounted) setKarsiVar(false);
    });

    const baslat = async () => {
      try {
        const res = await agoraTokenFn({ sessionId: session.id });
        if (!mounted) return; // unmount olduysa devam etme

        const { token, channel } = res.data;
        await client.join(AGORA_APP_ID, channel, token, kullanici.uid);
        baglandiRef.current = true;
        if (!mounted) {
          client.leave().catch(() => {});
          return;
        }

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { encoderConfig: 'speech_standard' },
          { encoderConfig: '480p_1' }
        );
        if (!mounted) {
          audioTrack.close();
          videoTrack.close();
          client.leave().catch(() => {});
          return;
        }

        audioRef.current = audioTrack;
        videoRef.current = videoTrack;

        if (localDivRef.current) videoTrack.play(localDivRef.current);
        await client.publish([audioTrack, videoTrack]);

        if (mounted) setDurum('aktif');
      } catch (e) {
        if (mounted) {
          setHata(e.message || 'Kamera/mikrofona erişilemedi');
          setDurum('hata');
        }
      }
    };

    baslat();
    return () => {
      mounted = false;
      temizle(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const kapat = async () => {
    await temizle(true);
    onKapat();
  };

  const mikToggle = () => {
    audioRef.current?.setEnabled(!mikrofon);
    setMikrofon(p => !p);
  };

  const kamToggle = () => {
    videoRef.current?.setEnabled(!kamera);
    setKamera(p => !p);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0d0d14',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Uzak video (tam ekran arka plan) ───────────────────────────── */}
      <div ref={remoteDivRef} style={{ position: 'absolute', inset: 0, background: '#111' }}>
        {!karsiVar && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 34,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {karsıIsim?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 500 }}>
              {durum === 'baglanıyor' ? 'Bağlanıyor...' : `${karsıIsim} henüz katılmadı`}
            </div>
          </div>
        )}
      </div>

      {/* ── Yerel video (PiP sağ alt) ───────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          right: 16,
          width: 140,
          height: 96,
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.18)',
          background: '#222',
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <div ref={localDivRef} style={{ width: '100%', height: '100%' }} />
        {!kamera && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.35)',
              fontSize: 22,
            }}
          >
            📷
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 600,
          }}
        >
          Sen
        </div>
      </div>

      {/* ── Üst bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '16px 20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {karsıIsim || 'Görüşme'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
            {durum === 'baglanıyor' && 'Bağlanıyor...'}
            {durum === 'aktif' && formatSure(sure)}
            {durum === 'hata' && 'Bağlantı hatası'}
          </div>
        </div>

        {durum === 'aktif' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16,185,129,0.18)',
              border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: 20,
              padding: '4px 12px',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10B981',
              }}
            />
            <span style={{ color: '#10B981', fontSize: 11, fontWeight: 700 }}>CANLI</span>
          </div>
        )}
      </div>

      {/* ── Hata mesajı ─────────────────────────────────────────────────── */}
      {hata && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 20,
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 16,
            padding: '24px 32px',
            textAlign: 'center',
            maxWidth: 340,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: '#F43F5E', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {hata}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 20 }}>
            Tarayıcı izinlerini kontrol edin ve tekrar deneyin.
          </div>
          <button
            onClick={kapat}
            style={{
              background: '#F43F5E',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Kapat
          </button>
        </div>
      )}

      {/* ── Alt kontroller ──────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '24px 20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        {/* Mikrofon */}
        <button
          onClick={mikToggle}
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: mikrofon ? 'rgba(255,255,255,0.15)' : '#F43F5E',
            color: '#fff',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, transform 0.1s',
            backdropFilter: 'blur(8px)',
          }}
          title={mikrofon ? 'Mikrofonu kapat' : 'Mikrofonu aç'}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {mikrofon ? '🎙️' : '🔇'}
        </button>

        {/* Aramayı bitir */}
        <button
          onClick={kapat}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
            color: '#fff',
            fontSize: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(244,63,94,0.5)',
            transition: 'transform 0.1s',
          }}
          title="Görüşmeyi bitir"
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          📵
        </button>

        {/* Kamera */}
        <button
          onClick={kamToggle}
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: kamera ? 'rgba(255,255,255,0.15)' : '#F43F5E',
            color: '#fff',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, transform 0.1s',
            backdropFilter: 'blur(8px)',
          }}
          title={kamera ? 'Kamerayı kapat' : 'Kamerayı aç'}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {kamera ? '📹' : '🚫'}
        </button>
      </div>
    </div>
  );
}
