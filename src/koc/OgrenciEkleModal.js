import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app, { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Btn } from '../components/Shared';
import { adminlereBildirimGonder } from './ogrenciEkleUtils';
import { OgrenciEkleForm } from './OgrenciEkleForm';

export default function OgrenciEkleModal({ onKapat, onEkle }) {
  const { s } = useTheme();
  const { kullanici, userData } = useAuth();
  const toast = useToast();

  const [isim, setIsim] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [veliEmail, setVeliEmail] = useState('');
  const [veliSifre, setVeliSifre] = useState('');
  const [veliTelefon, setVeliTelefon] = useState('');
  const [tur, setTur] = useState('tyt_12');
  const [dogumTarihi, setDogumTarihi] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [pasifHesapOnayiBiliyor, setPasifHesapOnayiBiliyor] = useState(false);
  const [pasifOnayMesaj, setPasifOnayMesaj] = useState('');

  useEffect(() => {
    const kapat = e => {
      if (e.key === 'Escape') onKapat();
    };
    document.addEventListener('keydown', kapat);
    return () => document.removeEventListener('keydown', kapat);
  }, [onKapat]);

  const ekle = async (yenidenAktiveOnayiGonder = false) => {
    if (!isim.trim() || !email.trim() || !sifre) return;
    if (sifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalı!');
      return;
    }

    setYukleniyor(true);
    setHata('');

    try {
      const functions = getFunctions(app, 'europe-west1');
      const kullaniciOlustur = httpsCallable(functions, 'kullaniciOlustur');

      const payload = {
        isim: isim.trim(),
        email: email.trim(),
        sifre,
        rol: 'ogrenci',
        kocId: kullanici.uid,
        tur,
        beklenenSaat: 6,
        dogumTarihi: dogumTarihi || null,
        yenidenAktiveEt: yenidenAktiveOnayiGonder,
      };

      if (veliEmail.trim() && veliSifre) {
        if (veliSifre.length < 6) {
          setHata('Veli şifresi en az 6 karakter olmalı!');
          setYukleniyor(false);
          return;
        }
        payload.veliEmail = veliEmail.trim();
        payload.veliSifre = veliSifre;
      }

      const sonuc = await kullaniciOlustur(payload);

      if (sonuc?.data?.durum === 'pasif_hesap_mevcut') {
        setPasifHesapOnayiBiliyor(true);
        setPasifOnayMesaj(sonuc.data.mesaj);
        setYukleniyor(false);
        return;
      }

      if (sonuc?.data?.durum === 'olusturuldu' || sonuc?.data?.durum === 'yeniden_aktive_edildi') {
        if (veliTelefon.trim() && sonuc.data.uid) {
          try {
            await updateDoc(doc(db, 'ogrenciler', sonuc.data.uid), {
              veliTelefon: veliTelefon.trim(),
            });
          } catch (e) {
            console.error(e);
          }
        }
        await adminlereBildirimGonder(kullanici, userData, sonuc.data.uid, isim.trim());
        toast('Öğrenci başarıyla eklendi/aktive edildi!');
        onEkle();
        onKapat();
      }
    } catch (e) {
      console.error('Öğrenci ekleme hatası:', e);
      setHata(e.message.includes('already-exists') ? e.message : e.message || 'İşlem başarısız.');
    } finally {
      setYukleniyor(false);
    }
  };

  const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  };

  if (pasifHesapOnayiBiliyor) {
    return (
      <div role="dialog" aria-modal="true" style={overlay}>
        <div
          style={{
            background: s.surface,
            border: `1px solid ${s.border}`,
            borderRadius: 20,
            padding: 36,
            width: 420,
            maxWidth: '95vw',
            margin: 20,
            boxShadow: s.shadow,
          }}
        >
          <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 16 }}>⏸️</div>
          <div
            style={{
              color: s.text,
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            Pasif Hesap Bulundu
          </div>
          <div
            style={{
              color: s.text2,
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            {pasifOnayMesaj}
          </div>
          <div
            style={{
              background: s.surface2,
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: s.text2,
            }}
          >
            <div>
              <b style={{ color: s.text }}>Email:</b> {email}
            </div>
            <div style={{ marginTop: 4 }}>
              <b style={{ color: s.text }}>Şifre:</b> yeniden aktivasyonda korunur
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn
              onClick={() => {
                setPasifHesapOnayiBiliyor(false);
                setPasifOnayMesaj('');
              }}
              variant="ghost"
              style={{ flex: 1 }}
            >
              İptal
            </Btn>
            <Btn
              onClick={() => {
                setPasifHesapOnayiBiliyor(false);
                setPasifOnayMesaj('');
                ekle(true);
              }}
              style={{ flex: 2 }}
            >
              {yukleniyor ? 'Aktive ediliyor...' : 'Evet, Aktive Et'}
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ogrenci-modal-baslik"
      style={{ ...overlay, overflowY: 'auto' }}
    >
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: 36,
          width: 440,
          maxWidth: '95vw',
          margin: 20,
          boxShadow: s.shadow,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          id="ogrenci-modal-baslik"
          style={{ color: s.text, fontSize: 18, fontWeight: 700, marginBottom: 24 }}
        >
          Yeni Öğrenci Ekle
        </div>
        <OgrenciEkleForm
          isim={isim}
          setIsim={setIsim}
          email={email}
          setEmail={setEmail}
          sifre={sifre}
          setSifre={setSifre}
          veliEmail={veliEmail}
          setVeliEmail={setVeliEmail}
          veliSifre={veliSifre}
          setVeliSifre={setVeliSifre}
          veliTelefon={veliTelefon}
          setVeliTelefon={setVeliTelefon}
          tur={tur}
          setTur={setTur}
          dogumTarihi={dogumTarihi}
          setDogumTarihi={setDogumTarihi}
          hata={hata}
          yukleniyor={yukleniyor}
          onKapat={onKapat}
          onEkle={() => ekle(false)}
          s={s}
        />
      </div>
    </div>
  );
}

OgrenciEkleModal.propTypes = {
  onKapat: PropTypes.func.isRequired,
  onEkle: PropTypes.func.isRequired,
};
