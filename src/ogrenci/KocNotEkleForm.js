import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Btn } from '../components/Shared';
import { bugunStr } from '../utils/tarih';
import { ETIKETLER } from './kocNotlariSabitleri';

const inputStyle = s => ({
  width: '100%',
  background: s.surface2,
  border: `1px solid ${s.border}`,
  borderRadius: 10,
  padding: '9px 12px',
  color: s.text,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
});

export default function KocNotEkleForm({ ogrenciId, onEklendi, s }) {
  const toast = useToast();
  const [mod, setMod] = useState('not');
  const [not, setNot] = useState('');
  const [etiket, setEtiket] = useState('genel');
  const [tarih, setTarih] = useState(() => bugunStr());
  const [sure, setSure] = useState('');
  const [konular, setKonular] = useState('');
  const [odevler, setOdevler] = useState('');
  const [sonrakiKontrol, setSonraki] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const kaydet = async () => {
    setYukleniyor(true);
    try {
      const veri =
        mod === 'gorusme'
          ? {
              tip: 'gorusme',
              tarih,
              suredk: parseInt(sure) || null,
              konular: konular.trim(),
              odevler: odevler.trim(),
              sonrakiKontrol: sonrakiKontrol || null,
              etiket: 'gorusme',
              olusturma: new Date(),
            }
          : { tip: 'not', not: not.trim(), etiket, olusturma: new Date() };
      await addDoc(collection(db, 'ogrenciler', ogrenciId, 'notlar'), veri);
      toast(mod === 'gorusme' ? 'Görüşme kaydedildi!' : 'Not eklendi!');
      setNot('');
      setKonular('');
      setOdevler('');
      setSure('');
      setSonraki('');
      onEklendi();
    } catch {
      toast('Kaydedilemedi', 'error');
    }
    setYukleniyor(false);
  };

  const disabled = mod === 'not' ? !not.trim() : !konular.trim();

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[
          { k: 'not', l: '📝 Not' },
          { k: 'gorusme', l: '🗣 Görüşme' },
        ].map(m => (
          <div
            key={m.k}
            onClick={() => setMod(m.k)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: mod === m.k ? 700 : 400,
              background: mod === m.k ? s.accentSoft : s.surface2,
              color: mod === m.k ? s.accent : s.text2,
              border: mod === m.k ? `1px solid ${s.accent}` : `1px solid ${s.border}`,
            }}
          >
            {m.l}
          </div>
        ))}
      </div>

      {mod === 'not' ? (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {ETIKETLER.filter(e => e.key !== 'gorusme').map(e => (
              <div
                key={e.key}
                onClick={() => setEtiket(e.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: etiket === e.key ? `${e.renk}20` : s.surface2,
                  color: etiket === e.key ? e.renk : s.text3,
                  border: etiket === e.key ? `1px solid ${e.renk}` : `1px solid ${s.border}`,
                }}
              >
                {e.label}
              </div>
            ))}
          </div>
          <textarea
            value={not}
            onChange={e => setNot(e.target.value)}
            placeholder="Not yaz..."
            style={{
              ...inputStyle(s),
              resize: 'vertical',
              minHeight: 80,
              fontFamily: 'Inter,sans-serif',
            }}
            onFocus={e => (e.target.style.borderColor = s.accent)}
            onBlur={e => (e.target.style.borderColor = s.border)}
          />
        </>
      ) : (
        <>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}
          >
            <div>
              <div style={{ color: s.text2, fontSize: 12, fontWeight: 500, marginBottom: 5 }}>
                Görüşme Tarihi
              </div>
              <input
                type="date"
                value={tarih}
                onChange={e => setTarih(e.target.value)}
                style={inputStyle(s)}
              />
            </div>
            <div>
              <div style={{ color: s.text2, fontSize: 12, fontWeight: 500, marginBottom: 5 }}>
                Süre (dk)
              </div>
              <input
                type="number"
                value={sure}
                onChange={e => setSure(e.target.value)}
                placeholder="30"
                style={inputStyle(s)}
              />
            </div>
          </div>
          {[
            {
              l: 'Konular',
              v: konular,
              fn: setKonular,
              p: 'Hangi konular ele alındı?',
              multi: true,
            },
            {
              l: 'Ödevler / Görevler',
              v: odevler,
              fn: setOdevler,
              p: 'Verilen ödevler...',
              multi: true,
            },
            {
              l: 'Sonraki Kontrol Tarihi',
              v: sonrakiKontrol,
              fn: setSonraki,
              p: '',
              type: 'date',
              multi: false,
            },
          ].map(f => (
            <div key={f.l} style={{ marginBottom: 10 }}>
              <div style={{ color: s.text2, fontSize: 12, fontWeight: 500, marginBottom: 5 }}>
                {f.l}
              </div>
              {f.multi ? (
                <textarea
                  value={f.v}
                  onChange={e => f.fn(e.target.value)}
                  placeholder={f.p}
                  rows={2}
                  style={{ ...inputStyle(s), resize: 'vertical', fontFamily: 'Inter,sans-serif' }}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={f.v}
                  onChange={e => f.fn(e.target.value)}
                  placeholder={f.p}
                  style={inputStyle(s)}
                />
              )}
            </div>
          ))}
        </>
      )}

      <Btn
        onClick={kaydet}
        disabled={disabled || yukleniyor}
        style={{ marginTop: 10, width: '100%' }}
      >
        {yukleniyor ? 'Kaydediliyor...' : mod === 'gorusme' ? '🗣 Görüşme Kaydet' : '📝 Not Ekle'}
      </Btn>
    </div>
  );
}
