import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Btn, Card } from '../components/Shared';
import { haftaBaslangici } from '../utils/programAlgoritma';
import OgrenciSecimListesi from './OgrenciSecimListesi';

export default function TopluProgramKopya({ ogrenciler, s, mobil }) {
  const toast = useToast();
  const [kaynakId, setKaynakId] = useState('');
  const [hedefIdler, setHedefIdler] = useState(new Set());
  const [kopyalaniyor, setKopyalaniyor] = useState(false);

  const toggle = id => {
    if (id === kaynakId) return;
    setHedefIdler(prev => {
      const yeni = new Set(prev);
      yeni.has(id) ? yeni.delete(id) : yeni.add(id);
      return yeni;
    });
  };

  const tumunuSec = sec => {
    const hedefler = ogrenciler.filter(o => o.id !== kaynakId).map(o => o.id);
    setHedefIdler(sec ? new Set(hedefler) : new Set());
  };

  const kopyala = async () => {
    if (!kaynakId || hedefIdler.size === 0) return;
    setKopyalaniyor(true);
    try {
      const haftaKey = haftaBaslangici();
      const kaynakSnap = await getDoc(doc(db, 'ogrenciler', kaynakId, 'program_v2', haftaKey));

      if (!kaynakSnap.exists()) {
        toast('Kaynak öğrencinin bu haftaya ait programı yok', 'error');
        setKopyalaniyor(false);
        return;
      }

      const programVerisi = kaynakSnap.data();
      const temizProgram = { ...programVerisi };
      if (temizProgram.tamamlandi) {
        temizProgram.tamamlandi = {};
      }

      await Promise.all(
        [...hedefIdler].map(hedefId =>
          setDoc(doc(db, 'ogrenciler', hedefId, 'program_v2', haftaKey), temizProgram)
        )
      );

      const kaynakIsim = ogrenciler.find(o => o.id === kaynakId)?.isim || 'Kaynak';
      toast(`${kaynakIsim}'ın programı ${hedefIdler.size} öğrenciye kopyalandı`);
      setHedefIdler(new Set());
    } catch (e) {
      toast('Hata: ' + e.message, 'error');
    }
    setKopyalaniyor(false);
  };

  const hedefOgrenciler = ogrenciler.filter(o => o.id !== kaynakId);

  return (
    <Card style={{ padding: mobil ? 16 : 22 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 4 }}>
        Haftalık programı kopyala
      </div>
      <div style={{ fontSize: 12, color: s.text3, marginBottom: 16 }}>
        Bir öğrencinin bu haftaki programını diğer öğrencilere kopyalar. Tamamlanma durumları
        sıfırlanır.
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 8 }}>
          Kaynak öğrenci
        </div>
        <select
          value={kaynakId}
          onChange={e => {
            setKaynakId(e.target.value);
            setHedefIdler(new Set());
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px solid ${s.border}`,
            background: s.surface2,
            color: kaynakId ? s.text : s.text3,
            fontSize: 13,
            outline: 'none',
          }}
        >
          <option value="">— Kaynak öğrenci seç —</option>
          {ogrenciler.map(o => (
            <option key={o.id} value={o.id}>
              {o.isim}
            </option>
          ))}
        </select>
      </div>

      {kaynakId && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 8 }}>
            Kopyalanacak öğrenciler{' '}
            {hedefIdler.size > 0 && (
              <span style={{ color: s.accent }}>({hedefIdler.size} seçili)</span>
            )}
          </div>
          {hedefOgrenciler.length === 0 ? (
            <div style={{ fontSize: 13, color: s.text3, padding: 16, textAlign: 'center' }}>
              Başka öğrenci yok
            </div>
          ) : (
            <>
              <OgrenciSecimListesi
                ogrenciler={hedefOgrenciler}
                seciliIdler={hedefIdler}
                onToggle={toggle}
                onTumunuSec={tumunuSec}
                s={s}
              />
              <Btn
                onClick={kopyala}
                disabled={hedefIdler.size === 0 || kopyalaniyor}
                style={{ marginTop: 14, width: '100%', padding: '11px 0' }}
              >
                {kopyalaniyor ? 'Kopyalanıyor...' : `Programı kopyala (${hedefIdler.size} öğrenci)`}
              </Btn>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

TopluProgramKopya.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object).isRequired,
  s: PropTypes.object.isRequired,
  mobil: PropTypes.bool,
};
