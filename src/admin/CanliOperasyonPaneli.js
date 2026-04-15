import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Card, EmptyState, LoadingState } from '../components/Shared';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { destekOzetiniGetir, funnelYuzde } from '../utils/adminUtils';
import DuyuruFormu from './DuyuruFormu';
import DuyuruListesi from './DuyuruListesi';

function Metric({ label, value, sub, color, s }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: s.text3, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || s.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: s.text3, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

export default function CanliOperasyonPaneli({ s: skin, mobil }) {
  const { s } = useTheme();
  const toast = useToast();
  const renk = skin || s;
  const [yukleniyor, setYukleniyor] = useState(true);
  const [duyuruBaslik, setDuyuruBaslik] = useState('');
  const [duyuruOzet, setDuyuruOzet] = useState('');
  const [duyuruSeviye, setDuyuruSeviye] = useState('bilgi');
  const [duyuruGun, setDuyuruGun] = useState(1);
  const [duyurular, setDuyurular] = useState([]);
  const [flags, setFlags] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [destek, setDestek] = useState({ acik: 0, bekliyor: 0, kapali: 0, son: [] });

  const verileriGetir = async () => {
    setYukleniyor(true);
    const sonuclar = await Promise.allSettled([
      getDocs(query(collection(db, 'duyurular'), orderBy('olusturma', 'desc'), limit(8))),
      getDocs(collection(db, 'featureFlags')),
      getDocs(query(collection(db, 'funnelGunluk'), orderBy('tarih', 'desc'), limit(7))),
      destekOzetiniGetir(),
    ]);
    if (sonuclar[0].status === 'fulfilled')
      setDuyurular(sonuclar[0].value.docs.map(d => ({ id: d.id, ...d.data() })));
    else toast('Duyurular yüklenemedi: ' + sonuclar[0].reason?.message, 'error');
    if (sonuclar[1].status === 'fulfilled')
      setFlags(sonuclar[1].value.docs.map(d => ({ id: d.id, ...d.data() })));
    else toast('Feature flags yüklenemedi: ' + sonuclar[1].reason?.message, 'error');
    if (sonuclar[2].status === 'fulfilled')
      setFunnel(sonuclar[2].value.docs.map(d => ({ id: d.id, ...d.data() })));
    if (sonuclar[3].status === 'fulfilled') setDestek(sonuclar[3].value);
    else toast('Destek özeti yüklenemedi: ' + sonuclar[3].reason?.message, 'error');
    setYukleniyor(false);
  };

  useEffect(() => {
    verileriGetir();
  }, []);

  const sonFunnel = funnel[0] || {};
  const toplam = sonFunnel.toplam ?? 0;

  const yayinla = async () => {
    if (!duyuruBaslik.trim()) return toast('Başlık gerekli', 'error');
    try {
      const gun = Math.max(1, Math.min(30, Number(duyuruGun) || 1));
      await addDoc(collection(db, 'duyurular'), {
        baslik: duyuruBaslik.trim(),
        ozet: duyuruOzet.trim(),
        seviye: duyuruSeviye,
        aktif: true,
        olusturma: serverTimestamp(),
        bitisTarihi: Timestamp.fromDate(new Date(Date.now() + gun * 86400000)),
      });
      setDuyuruBaslik('');
      setDuyuruOzet('');
      setDuyuruSeviye('bilgi');
      setDuyuruGun(1);
      toast('Duyuru yayınlandı', 'success');
      verileriGetir();
    } catch (e) {
      toast(e?.message || 'Duyuru yayınlanamadı', 'error');
    }
  };

  const duyuruPasifYap = async id => {
    try {
      await updateDoc(doc(db, 'duyurular', id), { aktif: false, arsivTarihi: serverTimestamp() });
      toast('Duyuru arşive alındı', 'success');
      verileriGetir();
    } catch (e) {
      toast(e?.message || 'İşlem başarısız', 'error');
    }
  };

  const duyuruSil = async id => {
    if (!window.confirm('Bu duyuruyu kalıcı olarak silmek istediğine emin misin?')) return;
    try {
      await deleteDoc(doc(db, 'duyurular', id));
      setDuyurular(prev => prev.filter(d => d.id !== id));
      toast('Duyuru silindi', 'success');
    } catch (e) {
      toast(e?.message || 'Silinemedi', 'error');
    }
  };

  const flagDegistir = async (id, aktif) => {
    try {
      await updateDoc(doc(db, 'featureFlags', id), { aktif: !aktif });
      setFlags(prev => prev.map(x => (x.id === id ? { ...x, aktif: !aktif } : x)));
      toast('Feature flag güncellendi', 'success');
    } catch (e) {
      toast(e?.message || 'Flag güncellenemedi', 'error');
    }
  };

  const funnelItems = useMemo(
    () => [
      { key: 'kayitli', label: 'Kayıtlı Kullanıcı', val: sonFunnel.kayitli ?? 0 },
      { key: 'aktifKullanan', label: 'Aktif Kullanan', val: sonFunnel.aktifKullanan ?? 0 },
      { key: 'mesajlasan', label: 'Mesaj Açan', val: sonFunnel.mesajlasan ?? 0 },
      { key: 'denemeGiren', label: 'Deneme Giren', val: sonFunnel.denemeGiren ?? 0 },
    ],
    [sonFunnel]
  );

  return (
    <div style={{ padding: mobil ? 16 : 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: renk.text, margin: 0 }}>
          🚀 Canlı Operasyon
        </h2>
        <div style={{ fontSize: 13, color: renk.text2, marginTop: 4 }}>
          Duyurular, destek, feature flag ve aktivasyon hunisi
        </div>
      </div>

      {yukleniyor ? (
        <LoadingState />
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobil ? '1fr 1fr' : 'repeat(4,1fr)',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <Metric label="Açık Destek" value={destek.acik} color="#F43F5E" s={renk} />
            <Metric label="Beklemede" value={destek.bekliyor} color="#F59E0B" s={renk} />
            <Metric
              label="Aktif Flag"
              value={flags.filter(x => x.aktif).length}
              color="#10B981"
              s={renk}
            />
            <Metric
              label="Aktivasyon"
              value={`%${funnelYuzde(toplam, sonFunnel.aktifKullanan ?? 0)}`}
              sub="Kayıtlı -> aktif"
              color="#5B4FE8"
              s={renk}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobil ? '1fr' : '1.2fr 0.8fr',
              gap: 16,
              marginBottom: 18,
            }}
          >
            <DuyuruFormu
              duyuruBaslik={duyuruBaslik}
              setDuyuruBaslik={setDuyuruBaslik}
              duyuruOzet={duyuruOzet}
              setDuyuruOzet={setDuyuruOzet}
              duyuruSeviye={duyuruSeviye}
              setDuyuruSeviye={setDuyuruSeviye}
              duyuruGun={duyuruGun}
              setDuyuruGun={setDuyuruGun}
              yayinla={yayinla}
              renk={renk}
            />
            <Card style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: renk.text, marginBottom: 12 }}>
                🧪 Feature Flags
              </div>
              {flags.length === 0 ? (
                <EmptyState mesaj="Henüz flag yok" icon="🧪" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {flags.map(flag => (
                    <div
                      key={flag.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: renk.surface2,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: renk.text }}>
                          {flag.baslik || flag.id}
                        </div>
                        {flag.aciklama && (
                          <div style={{ fontSize: 11, color: renk.text3, marginTop: 3 }}>
                            {flag.aciklama}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => flagDegistir(flag.id, flag.aktif)}
                        style={{
                          border: 'none',
                          background: flag.aktif ? '#10B981' : renk.border,
                          color: '#fff',
                          borderRadius: 999,
                          padding: '6px 12px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {flag.aktif ? 'AÇIK' : 'KAPALI'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1fr 1fr', gap: 16 }}>
            <Card style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: renk.text, marginBottom: 12 }}>
                📈 Aktivasyon Hunisi
              </div>
              {funnel.length === 0 ? (
                <EmptyState mesaj="Henüz özet üretilmedi" icon="📈" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {funnelItems.map(item => (
                    <div key={item.key}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          marginBottom: 4,
                          color: renk.text2,
                        }}
                      >
                        <span>{item.label}</span>
                        <strong style={{ color: renk.text }}>{item.val}</strong>
                      </div>
                      <div
                        style={{
                          height: 10,
                          borderRadius: 999,
                          background: renk.surface2,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${funnelYuzde(toplam, item.val)}%`,
                            height: '100%',
                            background: renk.accentGrad,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: renk.text, marginBottom: 12 }}>
                🆘 Son Destek Talepleri
              </div>
              {destek.son.length === 0 ? (
                <EmptyState mesaj="Henüz destek kaydı yok" icon="🆘" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {destek.son.map(t => (
                    <div
                      key={t.id}
                      style={{ padding: '10px 12px', borderRadius: 12, background: renk.surface2 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: renk.text }}>
                          {t.baslik}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color:
                              t.durum === 'acik'
                                ? '#F43F5E'
                                : t.durum === 'beklemede'
                                  ? '#F59E0B'
                                  : '#10B981',
                            fontWeight: 700,
                          }}
                        >
                          {t.durum || 'acik'}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: renk.text3, marginTop: 4 }}>
                        {t.tip || 'diger'} · {t.email || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div style={{ marginTop: 18 }}>
            <DuyuruListesi
              duyurular={duyurular}
              duyuruPasifYap={duyuruPasifYap}
              duyuruSil={duyuruSil}
              renk={renk}
            />
          </div>
        </>
      )}
    </div>
  );
}
