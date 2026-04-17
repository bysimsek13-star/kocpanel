import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Card, Btn, Input } from '../components/Shared';
import { SINAV_TUR_SECENEKLERI } from './adminHelpers';
import { auditLog, AuditTip } from '../utils/auditLog';

const TUR_ETIKETLER = {
  lgs_7: '7. Sınıf (LGS Hazırlık)',
  lgs_8: '8. Sınıf (LGS)',
  ortaokul_9: '9. Sınıf',
  ortaokul_10: '10. Sınıf',
  ortaokul_11: '11. Sınıf',
  tyt_12: '12. Sınıf (TYT)',
  sayisal_12: '12. Sınıf (Sayısal)',
  ea_12: '12. Sınıf (EA)',
  sozel_12: '12. Sınıf (Sözel)',
  dil_12: '12. Sınıf (Dil)',
  tyt_mezun: 'Mezun (TYT)',
  sayisal_mezun: 'Mezun (Sayısal)',
  ea_mezun: 'Mezun (EA)',
  sozel_mezun: 'Mezun (Sözel)',
  dil_mezun: 'Mezun (Dil)',
};

function turEtiket(tur) {
  return TUR_ETIKETLER[tur] || tur || '—';
}

export default function TurTopluSync({ ogrenciler, setOgrenciler, s, mobil }) {
  const { kullanici } = useAuth();
  const toast = useToast();
  const [aramaGirdi, setAramaGirdi] = useState('');
  const [turFiltre, setTurFiltre] = useState('');
  const [hedefTur, setHedefTur] = useState('');
  const [secili, setSecili] = useState(new Set());
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);

  const mevcutTurler = useMemo(() => {
    const set = new Set(ogrenciler.map(o => o.tur).filter(Boolean));
    return [...set].sort();
  }, [ogrenciler]);

  const filtrelenmis = useMemo(() => {
    const ara = aramaGirdi.trim().toLowerCase();
    return ogrenciler.filter(o => {
      if (turFiltre && o.tur !== turFiltre) return false;
      if (!ara) return true;
      return (
        (o.isim || '').toLowerCase().includes(ara) || (o.email || '').toLowerCase().includes(ara)
      );
    });
  }, [ogrenciler, aramaGirdi, turFiltre]);

  const toggle = id =>
    setSecili(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const tumunuSec = () => {
    if (secili.size === filtrelenmis.length && filtrelenmis.length > 0) setSecili(new Set());
    else setSecili(new Set(filtrelenmis.map(o => o.id)));
  };

  const guncelle = async () => {
    if (!hedefTur) return toast('Hedef tur seçin.', 'info');
    if (secili.size === 0) return toast('En az bir öğrenci seçin.', 'info');
    setYukleniyor(true);
    setSonuc(null);
    try {
      const batch = writeBatch(db);
      secili.forEach(id => {
        batch.update(doc(db, 'ogrenciler', id), { tur: hedefTur });
        batch.update(doc(db, 'kullanicilar', id), { tur: hedefTur });
      });
      await batch.commit();
      setOgrenciler(prev => prev.map(o => (secili.has(o.id) ? { ...o, tur: hedefTur } : o)));
      await auditLog({
        kim: kullanici?.uid,
        kimIsim: 'Admin',
        ne: AuditTip.TUR_GUNCELLE,
        detay: { hedefTur, sayi: secili.size },
      }).catch(() => {});
      const sayi = secili.size;
      setSonuc({ sayi, hedefTur });
      toast(`${sayi} öğrencinin turu güncellendi.`);
      setSecili(new Set());
    } catch (e) {
      toast('Güncellenemedi: ' + e.message, 'error');
    }
    setYukleniyor(false);
  };

  const tumSeciliMi = filtrelenmis.length > 0 && secili.size === filtrelenmis.length;

  return (
    <div style={{ padding: mobil ? 16 : 28, paddingTop: 0, maxWidth: 900 }}>
      <div style={{ color: s.text2, fontSize: 13, marginBottom: 20 }}>
        Öğrencilerin sınav türünü toplu olarak güncelleyin. Her iki koleksiyon senkronize edilir.
      </div>

      {sonuc && (
        <div
          style={{
            background: s.accentSoft,
            border: `1px solid ${s.accent}`,
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
            fontSize: 13,
            color: s.accent,
            fontWeight: 600,
          }}
        >
          Son işlem: {sonuc.sayi} öğrenci → {turEtiket(sonuc.hedefTur)}
        </div>
      )}

      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobil ? '1fr' : '1fr 1fr 1fr',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <Input
            placeholder="İsim veya e-posta ara"
            value={aramaGirdi}
            onChange={e => setAramaGirdi(e.target.value)}
          />
          <select
            value={turFiltre}
            onChange={e => setTurFiltre(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: s.surface2,
              border: `1px solid ${s.border}`,
              color: s.text,
              fontSize: 13,
            }}
          >
            <option value="">Tüm turlar</option>
            {mevcutTurler.map(t => (
              <option key={t} value={t}>
                {turEtiket(t)}
              </option>
            ))}
          </select>
          <select
            value={hedefTur}
            onChange={e => setHedefTur(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: s.surface2,
              border: `1px solid ${s.border}`,
              color: s.text,
              fontSize: 13,
            }}
          >
            <option value="">Hedef tur seç...</option>
            {SINAV_TUR_SECENEKLERI}
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={tumSeciliMi} onChange={tumunuSec} id="tumSec" />
            <label htmlFor="tumSec" style={{ fontSize: 13, color: s.text2, cursor: 'pointer' }}>
              Tümünü seç ({filtrelenmis.length})
            </label>
            {secili.size > 0 && (
              <span style={{ fontSize: 12, color: s.accent, fontWeight: 600 }}>
                {secili.size} seçili
              </span>
            )}
          </div>
          <Btn
            onClick={guncelle}
            disabled={yukleniyor || secili.size === 0 || !hedefTur}
            style={{ fontSize: 13, padding: '8px 20px' }}
          >
            {yukleniyor ? 'Güncelleniyor...' : `Turu Güncelle (${secili.size})`}
          </Btn>
        </div>
      </Card>

      <Card style={{ padding: 8 }}>
        {filtrelenmis.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: s.text3, fontSize: 13 }}>
            Öğrenci bulunamadı
          </div>
        ) : (
          filtrelenmis.map((o, i) => (
            <div
              key={o.id}
              onClick={() => toggle(o.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: i < filtrelenmis.length - 1 ? `1px solid ${s.border}` : 'none',
                background: secili.has(o.id) ? s.accentSoft : 'transparent',
                borderRadius:
                  i === 0 ? '8px 8px 0 0' : i === filtrelenmis.length - 1 ? '0 0 8px 8px' : 0,
              }}
            >
              <input
                type="checkbox"
                checked={secili.has(o.id)}
                onChange={() => toggle(o.id)}
                onClick={e => e.stopPropagation()}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: s.text, fontWeight: 600, fontSize: 13 }}>{o.isim || '—'}</div>
                <div style={{ color: s.text3, fontSize: 11 }}>{o.email || '—'}</div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: s.surface2,
                  border: `1px solid ${s.border}`,
                  color: s.text2,
                  flexShrink: 0,
                }}
              >
                {turEtiket(o.tur)}
              </span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

TurTopluSync.propTypes = {
  ogrenciler: PropTypes.array.isRequired,
  setOgrenciler: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
  mobil: PropTypes.bool,
};
