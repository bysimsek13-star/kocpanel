import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Card, Btn } from '../components/Shared';
import { bildirimOlustur } from '../components/BildirimSistemi';
import { getCallable } from './adminHelpers';
import { logIstemciHatasi } from '../utils/izleme';

export default function SilmeTalepleri({ s, kullanici }) {
  const toast = useToast();
  const [talepler, setTalepler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const getir = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'silmeTalepleri'),
          where('durum', '==', 'bekliyor'),
          orderBy('tarih', 'desc')
        )
      );
      setTalepler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      logIstemciHatasi({ error: e, info: 'Silme talepleri yüklenemedi', kaynak: 'SilmeTalepleri' });
      toast('Veriler yüklenemedi', 'error');
    }
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    getir();
  }, [getir]);

  const onayla = async talep => {
    try {
      await getCallable('kullaniciSil')({ uid: talep.ogrenciId, onay: 'SIL' });
      await updateDoc(doc(db, 'silmeTalepleri', talep.id), { durum: 'onaylandi' });
      await bildirimOlustur({
        aliciId: talep.kocId,
        tip: 'silme_onaylandi',
        baslik: 'Silme Talebi Onaylandı',
        mesaj: `${talep.ogrenciIsim} adlı öğrencinin silinmesi onaylandı.`,
        gonderenId: kullanici?.uid,
      });
      toast('Öğrenci silindi, koça bildirim gönderildi.');
      getir();
    } catch (e) {
      toast('Hata: ' + e.message, 'error');
    }
  };

  const reddet = async talep => {
    try {
      await updateDoc(doc(db, 'silmeTalepleri', talep.id), { durum: 'reddedildi' });
      await bildirimOlustur({
        aliciId: talep.kocId,
        tip: 'silme_reddedildi',
        baslik: 'Silme Talebi Reddedildi',
        mesaj: `${talep.ogrenciIsim} adlı öğrencinin silme talebi reddedildi.`,
        gonderenId: kullanici?.uid,
      });
      toast('Talep reddedildi.');
      getir();
    } catch (e) {
      toast('Hata: ' + e.message, 'error');
    }
  };

  if (yukleniyor || talepler.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: s.text, marginBottom: 10 }}>
        ⏳ Bekleyen Silme Talepleri ({talepler.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {talepler.map(t => (
          <Card
            key={t.id}
            style={{
              padding: '12px 16px',
              border: '1px solid rgba(244,63,94,0.3)',
              background: 'rgba(244,63,94,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{t.ogrenciIsim}</div>
                <div style={{ fontSize: 12, color: s.text2, marginTop: 2 }}>
                  Talep eden: {t.kocIsim}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn
                  onClick={() => reddet(t)}
                  variant="outline"
                  style={{ fontSize: 11, padding: '6px 12px' }}
                >
                  Reddet
                </Btn>
                <Btn
                  onClick={() => onayla(t)}
                  variant="danger"
                  style={{ fontSize: 11, padding: '6px 12px' }}
                >
                  Onayla & Sil
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
