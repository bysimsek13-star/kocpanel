import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { renkler } from '../../data/konular';
import { useToast } from '../../components/Toast';
import { Card, Avatar, Btn } from '../../components/Shared';
import { hedefDurumu } from './hedefUtils';
import GuncelleModal from './GuncelleModal';
import AktifHedefSatiri from './AktifHedefSatiri';

export default function OgrenciHedefKarti({ ogrenci, index, s, onHedefEkle }) {
  const [hedefler, setHedefler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [guncelleModal, setGuncelleModal] = useState(null);
  const toast = useToast();

  const getir = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'ogrenciler', ogrenci.id, 'hedefler'));
      const liste = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      liste.sort((a, b) => (b.olusturma?.seconds || 0) - (a.olusturma?.seconds || 0));
      setHedefler(liste);
    } catch (e) {
      console.error(e);
    }
    setYukleniyor(false);
  }, [ogrenci.id]);

  useEffect(() => {
    getir();
  }, [getir]);

  const sil = async hedefId => {
    try {
      await deleteDoc(doc(db, 'ogrenciler', ogrenci.id, 'hedefler', hedefId));
      toast('Hedef silindi');
      getir();
    } catch {
      toast('Silinemedi', 'error');
    }
  };

  const aktifHedefler = hedefler.filter(h => h.durum !== 'tamamlandi');
  const tamamlananlar = hedefler.filter(h => h.durum === 'tamamlandi');
  const acilVeyaGecikmis = hedefler.filter(h => {
    const d = hedefDurumu(h);
    return d === 'riskli' || d === 'gecikti';
  }).length;

  return (
    <Card
      style={{
        overflow: 'hidden',
        borderRadius: 16,
        border: `1px solid ${s.border}`,
        boxShadow: s.shadowCard,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: `1px solid ${s.border}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          background: s.surface2,
        }}
      >
        <Avatar isim={ogrenci.isim} renk={renkler[index % renkler.length]} boyut={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: s.text, fontWeight: 700, fontSize: 15.5 }}>{ogrenci.isim}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
                background: s.surface,
                border: `1px solid ${s.border}`,
                color: s.text2,
              }}
            >
              {hedefler.length} hedef
            </span>
            {acilVeyaGecikmis > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: s.tehlikaSoft,
                  color: s.tehlika,
                }}
              >
                {acilVeyaGecikmis} acil / gecikmiş
              </span>
            )}
            {tamamlananlar.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: s.okSoft,
                  color: s.chartPos,
                }}
              >
                {tamamlananlar.length} tamamlandı
              </span>
            )}
          </div>
        </div>
        <Btn
          onClick={() => onHedefEkle(ogrenci)}
          style={{ padding: '6px 12px', fontSize: 12, flexShrink: 0 }}
        >
          Hedef ekle
        </Btn>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px' }}>
        {yukleniyor ? (
          <div style={{ color: s.text3, fontSize: 13, textAlign: 'center', padding: 12 }}>
            Yükleniyor...
          </div>
        ) : aktifHedefler.length === 0 && tamamlananlar.length === 0 ? (
          <div style={{ color: s.text3, fontSize: 13, textAlign: 'center', padding: 8 }}>
            Henüz hedef yok
          </div>
        ) : (
          <>
            {aktifHedefler.map(h => (
              <AktifHedefSatiri key={h.id} h={h} onGuncelle={setGuncelleModal} onSil={sil} s={s} />
            ))}

            {tamamlananlar.length > 0 && (
              <details style={{ marginTop: 4 }}>
                <summary
                  style={{
                    fontSize: 12,
                    color: s.chartPos,
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: '4px 0',
                  }}
                >
                  {tamamlananlar.length} tamamlanan hedef
                </summary>
                {tamamlananlar.map(h => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: s.okSoft,
                      borderRadius: 10,
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: s.text3,
                        textDecoration: 'line-through',
                      }}
                    >
                      {h.baslik}
                    </div>
                    <button
                      onClick={() => sil(h.id)}
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: s.text3,
                        cursor: 'pointer',
                        fontSize: 12,
                        opacity: 0.7,
                      }}
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </details>
            )}
          </>
        )}
      </div>

      {guncelleModal && (
        <GuncelleModal
          hedef={guncelleModal}
          ogrenciId={ogrenci.id}
          onKapat={() => setGuncelleModal(null)}
          onGuncelle={getir}
          s={s}
        />
      )}
    </Card>
  );
}

OgrenciHedefKarti.propTypes = {
  ogrenci: PropTypes.shape({ id: PropTypes.string, isim: PropTypes.string }).isRequired,
  index: PropTypes.number,
  s: PropTypes.object.isRequired,
  onHedefEkle: PropTypes.func,
};
