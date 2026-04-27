import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useMobil } from '../hooks/useMediaQuery';
import { Btn, ConfirmDialog } from '../components/Shared';
import { caprazKocBildirim, bildirimOlustur } from '../components/BildirimSistemi';
import { haftaBaslangici, programV2ToGorevler } from '../utils/programAlgoritma';
import { OgrenciDetayTabBar } from './OgrenciDetayTabBar';
import { OgrenciDetaySekme } from './OgrenciDetaySekme';
const VideoGorusme = React.lazy(() => import('../components/VideoGorusme'));

function ReadOnlyBanner({ ogrenci: _ogrenci, onBildirimGonder, s }) {
  const [gonderildi, setGonderildi] = useState(false);
  const gonder = async () => {
    await onBildirimGonder();
    setGonderildi(true);
    setTimeout(() => setGonderildi(false), 3000);
  };
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(244,63,94,0.1))',
        border: '1px solid rgba(249,115,22,0.3)',
        borderRadius: 14,
        padding: '14px 20px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: 20 }}>🔒</span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#F97316' }}>
          Sadece Görüntüleme Modu
        </div>
        <div style={{ fontSize: 12, color: s.text2, marginTop: 2 }}>
          Bu öğrenci başka bir koça ait. Düzenleme yapmak için bildirim gönderin.
        </div>
      </div>
      <Btn
        onClick={gonder}
        variant="outline"
        disabled={gonderildi}
        style={{ padding: '6px 14px', fontSize: 12, borderColor: '#F97316', color: '#F97316' }}
      >
        {gonderildi ? '✓ Gönderildi' : '📩 Değişiklik Talep Et'}
      </Btn>
    </div>
  );
}

export default function OgrenciDetay({ ogrenci, onGeri, initialTab = 'ozet', onTabChange = null }) {
  const { s } = useTheme();
  const { kullanici, userData, isAdmin, canEdit } = useAuth();
  const toast = useToast();
  const mobil = useMobil();
  const [program, setProgram] = useState([]);
  const [denemeler, setDenemeler] = useState([]);
  const [_calismalar, setCalismalar] = useState([]);
  const [aktifSekme, setAktifSekme] = useState(initialTab || 'ozet');
  const [silOnay, setSilOnay] = useState(false);
  const [aktifGorusme, setAktifGorusme] = useState(null);

  const duzenleyebilir = useMemo(() => canEdit(ogrenci), [canEdit, ogrenci]);
  const readOnly = !duzenleyebilir;

  const veriGetir = useCallback(async () => {
    try {
      const haftaKey = haftaBaslangici();
      const [pvSnap, ds, cs] = await Promise.all([
        getDoc(doc(db, 'ogrenciler', ogrenci.id, 'program_v2', haftaKey)),
        getDocs(collection(db, 'ogrenciler', ogrenci.id, 'denemeler')),
        getDocs(collection(db, 'ogrenciler', ogrenci.id, 'calisma')),
      ]);
      setProgram(programV2ToGorevler(pvSnap.exists() ? pvSnap.data() : null));
      const dl = ds.docs.map(d => ({ id: d.id, ...d.data() }));
      dl.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
      setDenemeler(dl);
      setCalismalar(cs.docs.map(d => ({ id: d.id, ...d.data(), tarih: d.id })));
    } catch (e) {
      console.error(e);
    }
  }, [ogrenci.id]);

  useEffect(() => {
    veriGetir();
  }, [veriGetir]);

  useEffect(() => {
    const gecerli = ['ozet', 'program', 'soruRutin', 'deneme', 'hedef', 'konuTakibi', 'mesajlar'];
    if (initialTab && gecerli.includes(initialTab)) setAktifSekme(initialTab);
  }, [initialTab]);

  const dersBaslat = useCallback(async () => {
    try {
      const sessionRef = await addDoc(collection(db, 'goruntulu'), {
        kocId: kullanici.uid,
        kocIsim: userData?.isim || kullanici.email,
        ogrenciId: ogrenci.id,
        ogrenciIsim: ogrenci.isim,
        kanal: `ders_${kullanici.uid}_${ogrenci.id}`,
        durum: 'bekliyor',
        olusturanAt: serverTimestamp(),
      });
      await bildirimOlustur({
        aliciId: ogrenci.id,
        tip: 'ders_daveti',
        baslik: 'Görüntülü Ders Daveti',
        mesaj: `${userData?.isim || 'Koçun'} sizi görüntülü derse davet ediyor.`,
        gonderenId: kullanici.uid,
        gonderen: userData?.isim || kullanici.email,
        ogrenciId: ogrenci.id,
        route: `/ogrenci/home?cagri=${sessionRef.id}`,
        entityId: sessionRef.id,
      });
      setAktifGorusme({ id: sessionRef.id, kanal: `ders_${kullanici.uid}_${ogrenci.id}` });
    } catch (e) {
      toast('Görüşme başlatılamadı: ' + (e.message || 'Bilinmeyen hata'), 'error');
    }
  }, [kullanici, userData, ogrenci, toast]);

  const caprazBildirimGonder = useCallback(async () => {
    if (!ogrenci.kocId || ogrenci.kocId === kullanici.uid) return;
    try {
      await caprazKocBildirim({
        isteyenKocId: kullanici.uid,
        isteyenKocIsim: userData?.isim || kullanici.email,
        hedefKocId: ogrenci.kocId,
        hedefKocIsim: '',
        ogrenciId: ogrenci.id,
        ogrenciIsim: ogrenci.isim,
        islemTipi: 'düzenleme',
        detay: 'Öğrenci detay sayfasından talep gönderildi.',
      });
      toast('Değişiklik talebi gönderildi!');
    } catch {
      toast('Bildirim gönderilemedi', 'error');
    }
  }, [ogrenci, kullanici, userData, toast]);

  const ogrenciSil = async () => {
    if (readOnly) {
      toast('Bu öğrenciyi silme yetkiniz yok', 'error');
      return;
    }
    try {
      if (isAdmin) {
        const fn = httpsCallable(getFunctions(app, 'europe-west1'), 'kullaniciSil');
        await fn({ uid: ogrenci.id, onay: 'SIL' });
        toast('Öğrenci silindi.');
        onGeri();
      } else {
        const talepRef = await addDoc(collection(db, 'silmeTalepleri'), {
          ogrenciId: ogrenci.id,
          ogrenciIsim: ogrenci.isim,
          kocId: kullanici.uid,
          kocIsim: userData?.isim || kullanici.email,
          durum: 'bekliyor',
          tarih: serverTimestamp(),
        });
        const adminSnap = await getDocs(
          query(collection(db, 'kullanicilar'), where('rol', '==', 'admin'))
        );
        await Promise.all(
          adminSnap.docs.map(d =>
            bildirimOlustur({
              aliciId: d.id,
              tip: 'silme_talebi',
              baslik: 'Öğrenci Silme Talebi',
              mesaj: `${userData?.isim || kullanici.email}, ${ogrenci.isim} adlı öğrencinin silinmesini talep ediyor.`,
              gonderenId: kullanici.uid,
              gonderen: userData?.isim || kullanici.email,
              ogrenciId: ogrenci.id,
              ogrenciIsim: ogrenci.isim,
              route: '/admin/yasam-dongusu',
              entityId: talepRef.id,
            })
          )
        );
        toast('Silme talebi yöneticiye iletildi.');
        setSilOnay(false);
      }
    } catch (e) {
      toast('İşlem başarısız: ' + (e.message || 'Bilinmeyen hata'), 'error');
    }
  };

  if (aktifGorusme) {
    return (
      <React.Suspense
        fallback={
          <div style={{ padding: 40, textAlign: 'center', color: s.text3, fontSize: 14 }}>
            Görüşme yükleniyor...
          </div>
        }
      >
        <VideoGorusme
          session={aktifGorusme}
          kullanici={kullanici}
          karsıIsim={ogrenci.isim}
          onKapat={() => setAktifGorusme(null)}
        />
      </React.Suspense>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter,sans-serif' }}>
      {silOnay && (
        <ConfirmDialog
          baslik={isAdmin ? 'Öğrenciyi Sil' : 'Silme Talebi Gönder'}
          mesaj={
            isAdmin
              ? `${ogrenci.isim} ve tüm verilerini kalıcı olarak silmek istiyor musunuz?`
              : `${ogrenci.isim} için yöneticiye silme talebi gönderilsin mi? Yönetici onayından sonra silinecek.`
          }
          onEvet={ogrenciSil}
          onHayir={() => setSilOnay(false)}
        />
      )}
      <OgrenciDetayTabBar
        ogrenci={ogrenci}
        aktifSekme={aktifSekme}
        setAktifSekme={setAktifSekme}
        onTabChange={onTabChange}
        onGeri={onGeri}
        readOnly={readOnly}
        isAdmin={isAdmin}
        mobil={mobil}
        s={s}
      />
      <div style={{ padding: mobil ? 16 : 24 }}>
        {readOnly && (
          <ReadOnlyBanner ogrenci={ogrenci} onBildirimGonder={caprazBildirimGonder} s={s} />
        )}
        <OgrenciDetaySekme
          aktifSekme={aktifSekme}
          ogrenci={ogrenci}
          readOnly={readOnly}
          duzenleyebilir={duzenleyebilir}
          veriGetir={veriGetir}
          denemeler={denemeler}
          program={program}
          dersBaslat={dersBaslat}
          s={s}
        />
      </div>
    </div>
  );
}

OgrenciDetay.propTypes = {
  ogrenci: PropTypes.shape({ id: PropTypes.string, isim: PropTypes.string }).isRequired,
  onGeri: PropTypes.func.isRequired,
  initialTab: PropTypes.string,
  onTabChange: PropTypes.func,
};
