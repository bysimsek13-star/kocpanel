import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/Shared';

const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function renkSec(saat) {
  if (!saat || saat <= 0) return null;
  if (saat < 2) return '#2D4A22';
  if (saat < 4) return '#3B7A28';
  if (saat < 6) return '#4CAF50';
  if (saat < 8) return '#66D96A';
  return '#A5F3A8';
}

export default function CalismaTakvimi({ ogrenciId, hafta = 12 }) {
  const { s } = useTheme();
  const [veriler, setVeriler] = useState({});

  useEffect(() => {
    const getir = async () => {
      try {
        const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'calisma'));
        const obj = {};
        snap.docs.forEach(d => {
          obj[d.id] = d.data();
        });
        setVeriler(obj);
      } catch (e) {
        console.error(e);
      }
    };
    getir();
  }, [ogrenciId]);

  // Son N hafta tarihlerini oluştur
  const bugun = new Date();
  const gunler = [];
  for (let i = hafta * 7 - 1; i >= 0; i--) {
    const d = new Date(bugun);
    d.setDate(bugun.getDate() - i);
    gunler.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }

  // Haftalara böl (7'şerli)
  const haftalar = [];
  for (let i = 0; i < gunler.length; i += 7) {
    haftalar.push(gunler.slice(i, i + 7));
  }

  // İstatistikler
  const calisilanGunler = gunler.filter(g => veriler[g]?.saat > 0).length;
  const toplamSaat = gunler.reduce((a, g) => a + (veriler[g]?.saat || 0), 0);
  const ortSaat = calisilanGunler > 0 ? (toplamSaat / calisilanGunler).toFixed(1) : '0';

  return (
    <Card style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, color: s.text }}>📊 Çalışma Takvimi</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ fontSize: 12, color: s.text2 }}>
            <span style={{ fontWeight: 700, color: s.success }}>{calisilanGunler}</span> gün
            çalışıldı
          </div>
          <div style={{ fontSize: 12, color: s.text2 }}>
            ort. <span style={{ fontWeight: 700, color: s.success }}>{ortSaat}s</span>/gün
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 3 }}>
        {/* Gün etiketleri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4 }}>
          {GUNLER.map((g, i) => (
            <div
              key={g}
              style={{
                height: 16,
                fontSize: 9,
                color: s.text3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: 22,
              }}
            >
              {i % 2 === 0 ? g : ''}
            </div>
          ))}
        </div>

        {/* Haftalar */}
        <div style={{ display: 'flex', gap: 3, flex: 1, overflowX: 'auto' }}>
          {haftalar.map((hafta, hi) => (
            <div key={hi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {hafta.map(tarih => {
                const veri = veriler[tarih];
                const saat = veri?.saat || 0;
                const renk = renkSec(saat);
                const bugunku =
                  tarih ===
                  `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
                return (
                  <div
                    key={tarih}
                    title={`${tarih}: ${saat > 0 ? saat + ' saat' : 'Çalışılmadı'}`}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      background: renk || s.surface3,
                      border: bugunku
                        ? `2px solid ${s.accent}`
                        : `1px solid ${renk ? 'transparent' : s.border}`,
                      cursor: 'default',
                      transition: 'all 0.15s',
                      boxSizing: 'border-box',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Lejant */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          justifyContent: 'flex-end',
        }}
      >
        <span style={{ fontSize: 10, color: s.text3 }}>Az</span>
        {['#2D4A22', '#3B7A28', '#4CAF50', '#66D96A', '#A5F3A8'].map(r => (
          <div key={r} style={{ width: 12, height: 12, borderRadius: 2, background: r }} />
        ))}
        <span style={{ fontSize: 10, color: s.text3 }}>Çok</span>
      </div>
    </Card>
  );
}
