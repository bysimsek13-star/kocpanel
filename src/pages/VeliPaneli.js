/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getS } from '../theme';
import TopBar from '../components/TopBar';
import { Card, StatCard } from '../components/Shared';

export default function VeliPaneli({ tema, kullanici, veliData, onCikis }) {
  const s = getS(tema);
  const [ogrenciData, setOgrenciData] = useState(null);
  const [program, setProgram] = useState([]);
  const [denemeler, setDenemeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getir = async () => {
      try {
        if (veliData?.ogrenciUid) {
          const os = await getDoc(doc(db, 'kullanicilar', veliData.ogrenciUid));
          if (os.exists()) setOgrenciData(os.data());
          const ps = await getDocs(collection(db, 'ogrenciler', veliData.ogrenciUid, 'program'));
          setProgram(ps.docs.map(d => ({ id: d.id, ...d.data() })));
          const ds = await getDocs(collection(db, 'ogrenciler', veliData.ogrenciUid, 'denemeler'));
          const dl = ds.docs.map(d => ({ id: d.id, ...d.data() }));
          dl.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
          setDenemeler(dl);
        }
      } catch (e) { }
      setYukleniyor(false);
    };
    getir();
  }, []);

  const tam = program.filter(p => p.tamamlandi).length;
  const oran = program.length > 0 ? Math.round((tam / program.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter,sans-serif' }}>
      <TopBar tema={tema} kullanici={kullanici} rol="veli" onCikis={onCikis} title="Veli Paneli" />
      <div style={{ padding: '28px', maxWidth: '900px', margin: '0 auto' }}>
        {yukleniyor ? (
          <div style={{ textAlign: 'center', padding: '60px', color: s.text3 }}>Yükleniyor...</div>
        ) : !ogrenciData ? (
          <div style={{ textAlign: 'center', padding: '60px', color: s.text2 }}>Bilgi bulunamadı.</div>
        ) : (
          <>
            {/* BANNER */}
            <div style={{ background: s.accentGrad, borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 8px 32px rgba(91,79,232,0.3)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '22px', backdropFilter: 'blur(8px)' }}>
                {ogrenciData.isim?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: 'white' }}>{ogrenciData.isim}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{ogrenciData.tur} · {ogrenciData.email}</div>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '14px 20px', backdropFilter: 'blur(8px)' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{oran}%</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Görev</div>
                </div>
                {denemeler[0] && (
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '14px 20px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{denemeler[0].toplamNet}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Son Net</div>
                  </div>
                )}
              </div>
            </div>

            {/* STAT KARTLAR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }}>
              <StatCard tema={tema} label="Toplam Görev" value={program.length} sub="Bu hafta" renk="#5B4FE8" icon="📋" />
              <StatCard tema={tema} label="Tamamlanan" value={tam} sub="Görev" renk="#10B981" icon="✅" />
              <StatCard tema={tema} label="Deneme Sayısı" value={denemeler.length} sub="Toplam" renk="#F59E0B" icon="📊" />
            </div>

            {/* HAFTALIK PROGRAM */}
            <Card tema={tema}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${s.border}` }}>
                <div style={{ color: s.text, fontWeight: '600' }}>📅 Haftalık Program</div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {program.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: s.text3 }}>Program henüz eklenmemiş</div>
                ) : program.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${s.border}` }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: p.tamamlandi ? '#10B981' : s.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', flexShrink: 0 }}>{p.tamamlandi && '✓'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: p.tamamlandi ? s.text3 : s.text, textDecoration: p.tamamlandi ? 'line-through' : 'none' }}>{p.gorev}</div>
                      <div style={{ fontSize: '11px', color: s.text3 }}>{p.ders}</div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: p.tamamlandi ? '#10B981' : '#F59E0B' }}>{p.tamamlandi ? '✓ Tamamlandı' : 'Bekliyor'}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
