import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Btn } from '../components/Shared';
import { GUNLER, GUN_ETIKET } from '../utils/programAlgoritma';
import { haftaBasStr } from '../utils/tarih';

function metindenTip(metin) {
  const m = metin.toLowerCase();
  if (m.includes('deneme') || m.includes('test')) return 'deneme';
  if (m.includes('soru') || m.includes('çöz')) return 'soru';
  if (m.includes('tekrar') || m.includes('özet') || m.includes('yanlış')) return 'tekrar';
  if (m.includes('video') || m.includes('izle')) return 'video';
  return 'konu';
}

function saateEkle(saat, dk) {
  const [h, m] = saat.split(':').map(Number);
  const toplam = h * 60 + m + dk;
  return `${String(Math.floor(toplam / 60) % 24).padStart(2, '0')}:${String(toplam % 60).padStart(2, '0')}`;
}

export default function ProgramaEkleModal({ sablon, ogrenci, onKapat, s }) {
  const toast = useToast();
  const [gun, setGun] = useState('pazartesi');
  const [baslangic, setBaslangic] = useState('09:00');
  const [slotDk, setSlotDk] = useState(90);
  const [yukleniyor, setYukleniyor] = useState(false);

  const ekle = async () => {
    if (!ogrenci?.id) return;
    setYukleniyor(true);
    try {
      const hafta = haftaBasStr();
      const ref = doc(db, 'ogrenciler', ogrenci.id, 'program_v2', hafta);
      const snap = await getDoc(ref);
      const mevcut = snap.exists() ? snap.data() : { hafta: {}, tamamlandi: {} };
      const mevcutGun = mevcut.hafta?.[gun] || [];

      let sure = baslangic;
      const yeniSlotlar = sablon.tasks.map(gorev => {
        const bitis = saateEkle(sure, slotDk);
        const slot = {
          tip: metindenTip(gorev),
          ders: '',
          icerik: gorev,
          baslangic: sure,
          bitis,
        };
        sure = bitis;
        return slot;
      });

      const yeniHafta = {
        ...mevcut.hafta,
        [gun]: [...mevcutGun, ...yeniSlotlar],
      };

      await setDoc(ref, { hafta: yeniHafta, tamamlandi: mevcut.tamamlandi || {} }, { merge: true });
      toast(`${sablon.tasks.length} slot ${GUN_ETIKET[gun]} gününe eklendi!`);
      onKapat();
    } catch (e) {
      toast('Eklenemedi: ' + e.message, 'error');
    }
    setYukleniyor(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: 28,
          width: 420,
          maxWidth: '95vw',
          boxShadow: s.shadow,
          margin: 16,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: s.text, marginBottom: 4 }}>
          Programa Ekle
        </div>
        <div style={{ fontSize: 13, color: s.text2, marginBottom: 20 }}>{sablon.title}</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>Gün</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GUNLER.map(g => (
              <div
                key={g}
                onClick={() => setGun(g)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: gun === g ? s.accent : s.surface2,
                  color: gun === g ? s.buttonText || '#fff' : s.text2,
                  border: `1px solid ${gun === g ? s.accent : s.border}`,
                }}
              >
                {GUN_ETIKET[g]}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>
            Başlangıç saati
          </div>
          <input
            type="time"
            value={baslangic}
            onChange={e => setBaslangic(e.target.value)}
            style={{
              width: '100%',
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '10px 12px',
              color: s.text,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>
            Her slot süresi
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[45, 60, 90, 120].map(dk => (
              <div
                key={dk}
                onClick={() => setSlotDk(dk)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '7px 0',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: slotDk === dk ? s.accent : s.surface2,
                  color: slotDk === dk ? s.buttonText || '#fff' : s.text2,
                  border: `1px solid ${slotDk === dk ? s.accent : s.border}`,
                }}
              >
                {dk}dk
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginBottom: 20,
            background: s.surface2,
            borderRadius: 12,
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: s.text3,
              marginBottom: 6,
              textTransform: 'uppercase',
            }}
          >
            {GUN_ETIKET[gun]} — {sablon.tasks.length} slot
          </div>
          {(() => {
            let sure = baslangic;
            return sablon.tasks.map((gorev, i) => {
              const bitis = saateEkle(sure, slotDk);
              const satir = (
                <div key={i} style={{ fontSize: 12, color: s.text2, marginBottom: 2 }}>
                  {sure}–{bitis} · {gorev}
                </div>
              );
              sure = bitis;
              return satir;
            });
          })()}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={ekle} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Ekleniyor...' : 'Programa Ekle'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

ProgramaEkleModal.propTypes = {
  sablon: PropTypes.shape({
    title: PropTypes.string,
    tasks: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  ogrenci: PropTypes.object,
  onKapat: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
