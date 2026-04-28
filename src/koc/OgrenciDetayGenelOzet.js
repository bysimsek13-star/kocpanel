import React, { useState, useEffect, Suspense, lazy } from 'react';

const GorusmeTimeline = lazy(() => import('./GorusmeTimeline'));
const HaftalikVerimlilik = lazy(() => import('./HaftalikVerimlilik'));
import PropTypes from 'prop-types';
import {
  collection,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { dersOzetiHesapla } from '../utils/dersOzetiUtils';
import DersCalismaOzeti from './DersCalismaOzeti';
import { SINAV_TAKVIMI } from '../utils/ogrenciUtils';
import { turBelirle } from '../utils/sinavUtils';

const TUR_LABEL = {
  tyt: 'TYT',
  tyt_10: 'TYT',
  tyt_11: 'TYT',
  tyt_12: 'TYT',
  sayisal: 'AYT Sayısal',
  ea: 'AYT EA',
  sozel: 'AYT Sözel',
  dil: 'AYT Dil',
  lgs: 'LGS',
  lgs_7: '7. Sınıf',
  lgs_8: '8. Sınıf / LGS',
  ortaokul: 'Ortaokul',
};

function turEtiket(tur) {
  const key = (tur || '').toLowerCase();
  return TUR_LABEL[key] || tur || '—';
}

function gunHesapla(tur) {
  const sinav =
    turBelirle(tur) === 'lgs'
      ? SINAV_TAKVIMI.find(s => s.key === 'lgs')
      : SINAV_TAKVIMI.find(s => s.key === 'tyt');
  if (!sinav) return null;
  const kalan = Math.ceil((new Date(sinav.date + 'T09:30:00') - new Date()) / 86400000);
  return kalan > 0 ? kalan : null;
}

function BilgiKart({ baslik, deger, renk, s }) {
  return (
    <div
      style={{
        flex: '1 1 140px',
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: s.text3, marginBottom: 4 }}>{baslik}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: renk || s.text }}>{deger || '—'}</div>
    </div>
  );
}

function EksikKonularKarti({ ogrenciId, s }) {
  const [veriler, setVeriler] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ogrenciler', ogrenciId, 'eksikKonular'), snap => {
      setVeriler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [ogrenciId]);

  const grouped = veriler.reduce((acc, v) => {
    const ders = v.ders || 'Diğer';
    if (!acc[ders]) acc[ders] = [];
    acc[ders].push(v.konu);
    return acc;
  }, {});
  const dersler = Object.keys(grouped);

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 12 }}>
        📚 Eksik Konular
      </div>
      {dersler.length === 0 ? (
        <div style={{ fontSize: 12, color: s.text3 }}>Eksik konu kaydedilmemiş</div>
      ) : (
        dersler.map(ders => (
          <div key={ders} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.text, marginBottom: 3 }}>
              {ders}
            </div>
            <div style={{ fontSize: 12, color: s.text2 }}>{grouped[ders].join(', ')}</div>
          </div>
        ))
      )}
    </div>
  );
}

function NotKarti({ baslik, koleksiyon, ogrenciId, s }) {
  const [notlar, setNotlar] = useState([]);
  const [metin, setMetin] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'ogrenciler', ogrenciId, koleksiyon), orderBy('tarih', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setNotlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [ogrenciId, koleksiyon]);

  const kaydet = async () => {
    if (!metin.trim()) return;
    setKaydediliyor(true);
    await addDoc(collection(db, 'ogrenciler', ogrenciId, koleksiyon), {
      metin: metin.trim(),
      tarih: serverTimestamp(),
    });
    setMetin('');
    setKaydediliyor(false);
  };

  const formatTarih = ts => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 12 }}>{baslik}</div>
      <textarea
        value={metin}
        onChange={e => setMetin(e.target.value)}
        placeholder="Yeni not ekle..."
        rows={2}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '9px 12px',
          borderRadius: 10,
          border: `1px solid ${s.border}`,
          background: s.surface2,
          color: s.text,
          fontSize: 13,
          resize: 'none',
          outline: 'none',
          fontFamily: 'inherit',
          marginBottom: 8,
        }}
      />
      <button
        onClick={kaydet}
        disabled={!metin.trim() || kaydediliyor}
        style={{
          padding: '7px 18px',
          borderRadius: 9,
          border: 'none',
          background: s.accent,
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          cursor: !metin.trim() || kaydediliyor ? 'not-allowed' : 'pointer',
          opacity: !metin.trim() || kaydediliyor ? 0.5 : 1,
          marginBottom: notlar.length ? 14 : 0,
        }}
      >
        {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
      {notlar.map(n => (
        <div
          key={n.id}
          style={{
            borderTop: `1px solid ${s.border}`,
            paddingTop: 10,
            paddingBottom: 4,
            fontSize: 12,
            color: s.text,
          }}
        >
          <div style={{ color: s.text3, fontSize: 10, marginBottom: 4 }}>
            {formatTarih(n.tarih)}
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{n.metin}</div>
        </div>
      ))}
    </div>
  );
}

export default function OgrenciDetayGenelOzet({
  ogrenci,
  program,
  dersBaslat,
  mufredatDersler,
  s,
}) {
  const gun = gunHesapla(ogrenci.tur);
  const tamamlanmamis = program.filter(p => !p.tamamlandi);
  const [konuTakipListesi, setKonuTakipListesi] = useState([]);

  // onSnapshot — sayfa açıkken yeni konu_takip kaydı gelince otomatik güncellenir
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'ogrenciler', ogrenci.id, 'konu_takip'),
      snap => setKonuTakipListesi(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      e => console.error('konuTakip snapshot hatası:', e.message)
    );
    return unsub;
  }, [ogrenci.id]);

  const { dersBazliOzet, genelOzet } = dersOzetiHesapla(konuTakipListesi, mufredatDersler || []);

  const kayitTarihi = ogrenci.kayitTarihi
    ? new Date(ogrenci.kayitTarihi).toLocaleDateString('tr-TR')
    : '—';

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <BilgiKart baslik="Kayıt tarihi" deger={kayitTarihi} s={s} />
        <BilgiKart baslik="Sınav türü" deger={turEtiket(ogrenci.tur)} s={s} />
        <BilgiKart
          baslik="Sınava kalan"
          deger={gun ? `${gun} gün` : 'Geçti'}
          renk={gun && gun <= 30 ? '#EF4444' : gun && gun <= 60 ? '#F59E0B' : undefined}
          s={s}
        />
        <BilgiKart
          baslik="Hedef"
          deger={
            ogrenci.hedefUni || ogrenci.hedefBolum
              ? `${ogrenci.hedefUni || ''} ${ogrenci.hedefBolum || ''}`.trim()
              : '—'
          }
          s={s}
        />
      </div>

      {tamamlanmamis.length > 0 && (
        <div
          style={{
            background: s.surface,
            border: `1px solid ${s.border}`,
            borderRadius: 14,
            padding: '18px 20px',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text, marginBottom: 10 }}>
            Bu hafta tamamlanmamış slotlar ({tamamlanmamis.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tamamlanmamis.slice(0, 8).map((p, i) => (
              <div key={i} style={{ fontSize: 12, color: s.text2 }}>
                • {p.gun ? `${p.gun} — ` : ''}
                {p.ders || p.tip || 'Slot'}
              </div>
            ))}
            {tamamlanmamis.length > 8 && (
              <div style={{ fontSize: 11, color: s.text3 }}>
                +{tamamlanmamis.length - 8} slot daha
              </div>
            )}
          </div>
        </div>
      )}

      <EksikKonularKarti ogrenciId={ogrenci.id} s={s} />

      <div style={{ fontSize: 13, fontWeight: 700, color: s.text, margin: '16px 0 10px' }}>
        📊 Ders Bazlı Çalışma
      </div>
      <DersCalismaOzeti
        dersBazliOzet={dersBazliOzet}
        genelOzet={genelOzet}
        mufredatDersler={mufredatDersler}
        calisilmayanDersler={genelOzet.calisilmayanDersler}
        s={s}
      />
      <NotKarti baslik="📝 Koç notları" koleksiyon="kocNotlari" ogrenciId={ogrenci.id} s={s} />
      <NotKarti
        baslik="📝 Toplantı özetleri"
        koleksiyon="toplantıOzetleri"
        ogrenciId={ogrenci.id}
        s={s}
      />
      {dersBaslat && (
        <button
          onClick={dersBaslat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '14px 20px',
            marginBottom: 14,
            background: 'linear-gradient(135deg, #5B4FE8, #818CF8)',
            border: 'none',
            borderRadius: 14,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(91,79,232,0.3)',
          }}
        >
          <span style={{ fontSize: 20 }}>📹</span>
          Görüntülü Ders Başlat
        </button>
      )}
      <Suspense fallback={null}>
        <GorusmeTimeline ogrenciId={ogrenci.id} />
      </Suspense>
      <Suspense fallback={null}>
        <HaftalikVerimlilik ogrenciId={ogrenci.id} />
      </Suspense>
    </div>
  );
}

BilgiKart.propTypes = {
  baslik: PropTypes.string.isRequired,
  deger: PropTypes.string,
  renk: PropTypes.string,
  s: PropTypes.object.isRequired,
};

EksikKonularKarti.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  s: PropTypes.object.isRequired,
};

NotKarti.propTypes = {
  baslik: PropTypes.string.isRequired,
  koleksiyon: PropTypes.string.isRequired,
  ogrenciId: PropTypes.string.isRequired,
  s: PropTypes.object.isRequired,
};

OgrenciDetayGenelOzet.propTypes = {
  ogrenci: PropTypes.object.isRequired,
  program: PropTypes.array.isRequired,
  dersBaslat: PropTypes.func,
  mufredatDersler: PropTypes.array,
  s: PropTypes.object.isRequired,
};
