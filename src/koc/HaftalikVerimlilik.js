import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { verimlilikDurum } from '../data/konular';
import { Card } from '../components/Shared';

export default function HaftalikVerimlilik({ ogrenciId }) {
  const { s } = useTheme();
  const [veriler, setVeriler] = useState([]);
  const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  useEffect(() => {
    const getir = async () => {
      try {
        const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'calisma'));
        setVeriler(snap.docs.map(d => ({ tarih: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
    };
    getir();
  }, [ogrenciId]);

  const bugun = new Date();
  const haftaGunleri = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(bugun);
    d.setDate(bugun.getDate() - bugun.getDay() + i + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 16 }}>
        📈 Bu Hafta Verimlilik
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {haftaGunleri.map((tarih, i) => {
          const veri = veriler.find(v => v.tarih === tarih);
          const durum = veri ? verimlilikDurum(veri.verimlilik) : null;
          return (
            <div key={tarih} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: s.text3, marginBottom: 6, fontWeight: 500 }}>
                {gunler[i]}
              </div>
              <div
                style={{
                  height: 64,
                  borderRadius: 10,
                  background: durum ? `${durum.renk}20` : s.surface2,
                  border: `1px solid ${durum ? durum.renk : s.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                {durum ? (
                  <>
                    <div style={{ fontSize: 18 }}>{durum.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: durum.renk }}>
                      {veri.verimlilik}%
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: s.text3 }}>—</div>
                )}
              </div>
              {veri && (
                <div style={{ fontSize: 10, color: s.text3, marginTop: 4 }}>{veri.saat}s</div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

HaftalikVerimlilik.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
};
