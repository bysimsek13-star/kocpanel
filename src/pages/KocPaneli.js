/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { getS, renkler } from '../theme';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';
import { Card, StatCard, Btn } from '../components/Shared';
import OgrenciDetay from '../koc/OgrenciDetay';
import OgrenciEkleModal from '../koc/OgrenciEkleModal';
import KocMesajlarSayfasi from '../koc/MesajlarSayfasi';
import HaftalikProgramSayfasi from '../koc/HaftalikProgram';
import GunlukTakipSayfasi from '../koc/GunlukTakip';
import DenemeYonetimiSayfasi from '../koc/DenemeYonetimi';
import IstatistiklerSayfasi from '../koc/Istatistikler';
import HedefTakibiSayfasi from '../koc/HedefTakibi';
import VeliRaporlariSayfasi from '../koc/VeliRaporlari';

export default function KocPaneli({ tema, tercih, setTema, kullanici, onCikis }) {
  const s = getS(tema);
  const [ogrenciler, setOgrenciler] = useState([]);
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliOgrenci, setSeciliOgrenci] = useState(null);
  const [aktifSayfa, setAktifSayfa] = useState('ana');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [okunmamisMesaj, setOkunmamisMesaj] = useState(0);

  const ogrencileriGetir = async () => {
    setYukleniyor(true);
    try {
      const snap = await getDocs(collection(db, 'ogrenciler'));
      setOgrenciler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { }
    setYukleniyor(false);
  };

  const mesajSayisiGetir = async (list) => {
    let toplam = 0;
    const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
    for (const o of list) {
      try {
        const snap = await getDocs(collection(db, 'ogrenciler', o.id, 'mesajlar'));
        toplam += snap.docs.filter(d => {
          const m = d.data();
          if (m.gonderen !== 'ogrenci') return false;
          const t = m.olusturma?.toDate ? m.olusturma.toDate() : new Date(0);
          return t >= bugun;
        }).length;
      } catch (e) { }
    }
    setOkunmamisMesaj(toplam);
  };

  useEffect(() => { ogrencileriGetir(); }, []);
  useEffect(() => { if (ogrenciler.length > 0) mesajSayisiGetir(ogrenciler); }, [ogrenciler]);

  const ortTamamlama = ogrenciler.length > 0 ? Math.round(ogrenciler.reduce((acc, o) => acc + (o.tamamlama || 0), 0) / ogrenciler.length) : 0;

  // ALT SAYFALAR
  if (seciliOgrenci) return <OgrenciDetay tema={tema} ogrenci={seciliOgrenci} onGeri={() => setSeciliOgrenci(null)} />;

  const sarmaTopBar = (title) => <TopBar tema={tema} tercih={tercih} setTema={setTema} kullanici={kullanici} rol="koc" onCikis={onCikis} title={title} />;
  const sayfaWrapper = (title, child) => <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter,sans-serif' }}>{sarmaTopBar(title)}{child}</div>;

  if (aktifSayfa === 'mesajlar') return sayfaWrapper('Mesajlar', <KocMesajlarSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={() => setAktifSayfa('ana')} />);
  if (aktifSayfa === 'haftalikprogram') return sayfaWrapper('Haftalik Program', <HaftalikProgramSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={() => setAktifSayfa('ana')} />);
  if (aktifSayfa === 'gunluktakip') return sayfaWrapper('Gunluk Takip', <GunlukTakipSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={() => setAktifSayfa('ana')} />);
  if (aktifSayfa === 'denemeyonetimi') return sayfaWrapper('Deneme Yonetimi', <DenemeYonetimiSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={() => setAktifSayfa('ana')} />);
  if (aktifSayfa === 'istatistikler') return sayfaWrapper('Istatistikler', <IstatistiklerSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={() => setAktifSayfa('ana')} />);
  if (aktifSayfa === 'hedeftakibi') return sayfaWrapper('Hedef Takibi', <HedefTakibiSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={() => setAktifSayfa('ana')} />);
  if (aktifSayfa === 'veliraporlari') return sayfaWrapper('Veli Raporlari', <VeliRaporlariSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={() => setAktifSayfa('ana')} />);
  if (aktifSayfa === 'ogrenciler') return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter,sans-serif' }}>
      {sarmaTopBar('Ogrencilerim')}
      {modalAcik && <OgrenciEkleModal tema={tema} onKapat={() => setModalAcik(false)} onEkle={() => { signOut(auth).then(() => window.location.reload()); }} />}
      <div style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <Btn tema={tema} onClick={() => setModalAcik(true)}>+ Ogrenci Ekle</Btn>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ogrenciler.map((o, i) => (
            <Card key={o.id} tema={tema} style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setSeciliOgrenci(o)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${renkler[i % renkler.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: renkler[i % renkler.length], fontWeight: '800', fontSize: '15px' }}>
                  {o.isim.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: s.text, fontSize: '14px', fontWeight: '600' }}>{o.isim}</div>
                  <div style={{ color: s.text2, fontSize: '12px', marginTop: '2px' }}>{o.tur} · {o.email}</div>
                </div>
                <div style={{ color: s.accent, fontSize: '18px' }}>→</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // ANA SAYFA
  const menu = [
    { key: 'ana', icon: 'ev', label: 'Genel Bakis' },
    { key: 'ogrenciler', icon: 'k', label: 'Ogrencilerim' },
    { key: 'haftalikprogram', icon: 'p', label: 'Haftalik Program' },
    { key: 'gunluktakip', icon: 'g', label: 'Gunluk Takip' },
    { key: 'denemeyonetimi', icon: 'd', label: 'Deneme Yonetimi' },
    { key: 'istatistikler', icon: 'i', label: 'Istatistikler' },
    { key: 'hedeftakibi', icon: 'h', label: 'Hedef Takibi' },
    { key: 'mesajlar', icon: 'm', label: 'Mesajlar', badge: okunmamisMesaj },
    { key: 'veliraporlari', icon: 'v', label: 'Veli Raporlari' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter,sans-serif', display: 'flex', flexDirection: 'column' }}>
      <TopBar tema={tema} tercih={tercih} setTema={setTema} kullanici={kullanici} rol="koc" onCikis={onCikis} />
      {modalAcik && <OgrenciEkleModal tema={tema} onKapat={() => setModalAcik(false)} onEkle={() => { signOut(auth).then(() => window.location.reload()); }} />}
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav tema={tema} menu={menu} aktif={aktifSayfa} onSelect={item => setAktifSayfa(item.key)} />
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: s.text }}>Hos geldin, <span style={{ background: s.accentGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Koc</span></h1>
            <div style={{ color: s.text2, fontSize: '14px', marginTop: '4px' }}>ElsWay - YKS / LGS Kocluk Platformu</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
            <StatCard tema={tema} label="Aktif Ogrenci" value={ogrenciler.length} sub="Toplam" renk="#5B4FE8" icon="k" />
            <StatCard tema={tema} label="Ort. Tamamlama" value={'%' + ortTamamlama} sub="Tum ogrenciler" renk="#10B981" icon="t" />
            <StatCard tema={tema} label="Yeni Mesaj" value={okunmamisMesaj} sub="Bugun gelen" renk="#F43F5E" icon="m" />
            <StatCard tema={tema} label="Toplam Ogrenci" value={ogrenciler.length} sub="Kayitli" renk="#F59E0B" icon="o" />
          </div>
          <Card tema={tema}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${s.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: s.text, fontWeight: '600', fontSize: '15px' }}>Ogrencilerim</div>
              <Btn tema={tema} onClick={() => setModalAcik(true)} style={{ padding: '8px 16px', fontSize: '13px' }}>+ Yeni Ekle</Btn>
            </div>
            {yukleniyor ? <div style={{ padding: '30px', textAlign: 'center', color: s.text3 }}>Yukleniyor...</div> :
              ogrenciler.length === 0 ? <div style={{ padding: '50px', textAlign: 'center', color: s.text2 }}>Henuz ogrenci yok</div> :
                ogrenciler.map((o, i) => (
                  <div key={o.id} onClick={() => setSeciliOgrenci(o)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: `1px solid ${s.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = s.surface2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${renkler[i % renkler.length]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: renkler[i % renkler.length], fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                      {o.isim.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: s.text, fontSize: '14px', fontWeight: '500' }}>{o.isim}</div>
                      <div style={{ color: s.text2, fontSize: '12px', marginTop: '2px' }}>{o.tur} · {o.email}</div>
                    </div>
                    <div style={{ color: s.accent, fontSize: '16px' }}>→</div>
                  </div>
                ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
