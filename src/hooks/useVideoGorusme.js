import { useCallback, useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firebase';
import { logIstemciHatasi } from '../utils/izleme';

const AGORA_APP_ID = '6d61a6f6984648b5835d30f11e18ee76';
const agoraTokenFn = httpsCallable(getFunctions(undefined, 'europe-west1'), 'agoraToken');

export default function useVideoGorusme({ session, kullanici, onKapat }) {
  const clientRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const localDivRef = useRef(null);
  const remoteDivRef = useRef(null);
  const baglandiRef = useRef(false);

  const [durum, setDurum] = useState('baglanıyor');
  const [mikrofon, setMikrofon] = useState(true);
  const [kamera, setKamera] = useState(true);
  const [karsiVar, setKarsiVar] = useState(false);
  const [hata, setHata] = useState(null);
  const [sure, setSure] = useState(0);

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
    let mounted = true;

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
        if (!mounted) return;

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

  return {
    durum,
    mikrofon,
    kamera,
    karsiVar,
    hata,
    sure,
    localDivRef,
    remoteDivRef,
    kapat,
    mikToggle,
    kamToggle,
  };
}
