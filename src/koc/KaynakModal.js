import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Btn } from '../components/Shared';
import { TUR_SECENEKLER, SEVIYE_LABEL, SEVIYE_RENK, DERS_BILESIMI } from './kitapVideoUtils';

const inputStyle = s => ({
  width: '100%',
  background: s.surface2,
  border: `1px solid ${s.border}`,
  borderRadius: 10,
  padding: '10px 14px',
  color: s.text,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
});

export function KaynakModal({ koc_uid, mevcut, onKapat, onKaydet, s }) {
  const toast = useToast();
  const [baslik, setBaslik] = useState(mevcut?.baslik ?? '');
  const [tur, setTur] = useState(mevcut?.tur ?? 'kitap');
  const [yazar, setYazar] = useState(mevcut?.yazar ?? '');
  const [link, setLink] = useState(mevcut?.link ?? '');
  const [aciklama, setAciklama] = useState(mevcut?.aciklama ?? '');
  const [seviye, setSeviye] = useState(mevcut?.seviye ?? 'orta');
  const [dersler, setDersler] = useState(mevcut?.dersler ?? []);
  const [yukleniyor, setYukleniyor] = useState(false);

  const dersSec = ders =>
    setDersler(prev => (prev.includes(ders) ? prev.filter(d => d !== ders) : [...prev, ders]));

  const kaydet = async () => {
    if (!baslik.trim()) return;
    setYukleniyor(true);
    try {
      const veri = {
        baslik: baslik.trim(),
        tur,
        yazar: yazar.trim(),
        link: link.trim(),
        aciklama: aciklama.trim(),
        seviye,
        dersler,
        koc_uid,
        guncelleme: new Date(),
      };
      if (mevcut) {
        await updateDoc(doc(db, 'kutuphane', mevcut.id), veri);
        toast('Kaynak güncellendi!');
      } else {
        veri.olusturma = new Date();
        await addDoc(collection(db, 'kutuphane'), veri);
        toast('Kaynak eklendi!');
      }
      onKaydet();
      onKapat();
    } catch (e) {
      toast('Hata: ' + e.message, 'error');
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
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: 28,
          width: 520,
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: s.shadow,
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: s.text, marginBottom: 20 }}>
          {mevcut ? 'Kaynağı düzenle' : 'Yeni kaynak ekle'}
        </div>

        {/* Tür */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 8 }}>Tür</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TUR_SECENEKLER.slice(1).map(t => (
              <div
                key={t.k}
                onClick={() => setTur(t.k)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  border: tur === t.k ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                  background: tur === t.k ? s.accentSoft : s.surface2,
                  color: tur === t.k ? s.accent : s.text2,
                }}
              >
                {t.l}
              </div>
            ))}
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 5 }}>
            Başlık *
          </div>
          <input
            value={baslik}
            onChange={e => setBaslik(e.target.value)}
            placeholder="Kaynak adı"
            style={inputStyle(s)}
          />
        </div>

        {/* Yazar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 5 }}>
            Yazar / Kaynak
          </div>
          <input
            value={yazar}
            onChange={e => setYazar(e.target.value)}
            placeholder="Yazar veya kanal adı"
            style={inputStyle(s)}
          />
        </div>

        {/* Link */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 5 }}>
            Link (isteğe bağlı)
          </div>
          <input
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://..."
            style={inputStyle(s)}
          />
        </div>

        {/* Açıklama */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 5 }}>
            Açıklama / Not
          </div>
          <textarea
            value={aciklama}
            onChange={e => setAciklama(e.target.value)}
            placeholder="Kısa açıklama, neden öneriyor olduğunuz..."
            style={{
              width: '100%',
              minHeight: 70,
              padding: '9px 12px',
              borderRadius: 10,
              border: `1px solid ${s.border}`,
              background: s.surface2,
              color: s.text,
              fontSize: 12,
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Seviye */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 8 }}>
            Seviye
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(SEVIYE_LABEL).map(([k, v]) => (
              <div
                key={k}
                onClick={() => setSeviye(k)}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'center',
                  border: seviye === k ? `2px solid ${SEVIYE_RENK[k]}` : `1px solid ${s.border}`,
                  background: seviye === k ? `${SEVIYE_RENK[k]}15` : s.surface2,
                  color: seviye === k ? SEVIYE_RENK[k] : s.text2,
                }}
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        {/* Ders etiketleri */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: s.text2, fontWeight: 600, marginBottom: 8 }}>
            İlgili dersler
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DERS_BILESIMI.map(d => (
              <div
                key={d}
                onClick={() => dersSec(d)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                  border: dersler.includes(d) ? `1.5px solid ${s.accent}` : `1px solid ${s.border}`,
                  background: dersler.includes(d) ? s.accentSoft : s.surface2,
                  color: dersler.includes(d) ? s.accent : s.text3,
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={kaydet} disabled={!baslik.trim() || yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Kaydediliyor...' : mevcut ? 'Güncelle' : 'Kaynak ekle'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
