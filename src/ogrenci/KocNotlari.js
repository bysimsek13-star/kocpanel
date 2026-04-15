import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState } from '../components/Shared';
import { ETIKETLER } from './kocNotlariSabitleri';
import KocNotEkleForm from './KocNotEkleForm';
import { NotKarti, KocNotlariOgrenci } from './KocNotKarti';

export { KocNotlariOgrenci };

export function KocNotlari({ ogrenciId }) {
  const { s } = useTheme();
  const [kayitlar, setKayitlar] = useState([]);
  const [filtre, setFiltre] = useState('hepsi');
  const [yukleniyor, setYukleniyor] = useState(true);

  const getir = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'ogrenciler', ogrenciId, 'notlar'));
      const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      liste.sort((a, b) => (b.olusturma?.seconds || 0) - (a.olusturma?.seconds || 0));
      setKayitlar(liste);
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  }, [ogrenciId]);

  useEffect(() => {
    getir();
  }, [getir]);

  const filtrelenmis = kayitlar.filter(k => {
    if (filtre === 'hepsi') return true;
    if (filtre === 'gorusme') return k.tip === 'gorusme';
    return k.etiket === filtre;
  });

  const filtreler = [
    { key: 'hepsi', label: 'Hepsi' },
    { key: 'gorusme', label: '🗣 Görüşmeler' },
    ...ETIKETLER.filter(e => e.key !== 'gorusme').map(e => ({ key: e.key, label: e.label })),
  ];

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 16 }}>
        📝 Notlar & Görüşmeler
      </div>
      <KocNotEkleForm ogrenciId={ogrenciId} onEklendi={getir} s={s} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {filtreler.map(f => (
          <div
            key={f.key}
            onClick={() => setFiltre(f.key)}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: filtre === f.key ? 700 : 400,
              cursor: 'pointer',
              background: filtre === f.key ? s.accentSoft : s.surface2,
              color: filtre === f.key ? s.accent : s.text3,
              border: filtre === f.key ? `1px solid ${s.accent}` : `1px solid ${s.border}`,
            }}
          >
            {f.label} {filtre === f.key && `(${filtrelenmis.length})`}
          </div>
        ))}
      </div>
      {yukleniyor ? (
        <div style={{ color: s.text3, fontSize: 13, textAlign: 'center', padding: 12 }}>
          Yükleniyor...
        </div>
      ) : filtrelenmis.length === 0 ? (
        <EmptyState mesaj="Kayıt yok" icon="📝" />
      ) : (
        filtrelenmis.map(k => (
          <NotKarti key={k.id} kayit={k} ogrenciId={ogrenciId} onSilindi={getir} s={s} />
        ))
      )}
    </Card>
  );
}

KocNotlari.propTypes = { ogrenciId: PropTypes.string.isRequired };
KocNotlariOgrenci.propTypes = { ogrenciId: PropTypes.string.isRequired };
