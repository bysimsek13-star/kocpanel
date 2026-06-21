import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { bugunGunAdi, haftaBasStr } from '../utils/tarih';
import { dersSetiniBelirle } from '../utils/ogrenciBaglam';

const GUN_TR = {
  pazartesi: 'Pazartesi',
  sali: 'Salı',
  carsamba: 'Çarşamba',
  persembe: 'Perşembe',
  cuma: 'Cuma',
  cumartesi: 'Cumartesi',
  pazar: 'Pazar',
};
const GUN_SIRA = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'];

function son7Tarihleri() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

const kartStil = s => ({
  background: s.surface,
  border: `1px solid ${s.border}`,
  borderRadius: 12,
  padding: 20,
  marginBottom: 12,
});
const baslikStil = s => ({ fontSize: 14, fontWeight: 500, color: s.text, marginBottom: 12 });

// Kart 2 — Uyku ortalaması
export function UykuKarti({ ogrenciId, s }) {
  const [rutinler, setRutinler] = useState([]);
  useEffect(
    () =>
      onSnapshot(collection(db, 'ogrenciler', ogrenciId, 'rutin'), snap =>
        setRutinler(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      ),
    [ogrenciId]
  );

  const tarihler = son7Tarihleri();
  const veri = rutinler.filter(r => tarihler.includes(r.tarih || r.id) && (r.uyku ?? 0) > 0);
  if (!veri.length) return null;

  const ort = veri.reduce((a, r) => a + (r.uyku || 0), 0) / veri.length;
  const [renk, bg, etiket] =
    ort >= 7 && ort <= 8
      ? ['#059669', '#D1FAE5', 'İdeal']
      : ort > 8
        ? ['#D97706', '#FEF3C7', 'Fazla uyuyor']
        : ort >= 6
          ? ['#EA580C', '#FFEDD5', 'Az uyuyor']
          : ['#DC2626', '#FEE2E2', 'Yetersiz'];

  return (
    <div style={kartStil(s)}>
      <div style={baslikStil(s)}>Uyku Ortalaması</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: s.text }}>{ort.toFixed(1)} saat</div>
      <span
        style={{
          background: bg,
          color: renk,
          borderRadius: 20,
          padding: '2px 10px',
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-block',
          marginTop: 6,
        }}
      >
        {etiket}
      </span>
    </div>
  );
}

// Kart 3 — Soru çözümü (bu hafta)
export function SoruKarti({ ogrenciId, s }) {
  const [kayitlar, setKayitlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  useEffect(
    () =>
      onSnapshot(collection(db, 'ogrenciler', ogrenciId, 'gunlukSoru'), snap => {
        setKayitlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setYukleniyor(false);
      }),
    [ogrenciId]
  );

  if (yukleniyor)
    return <div style={{ ...kartStil(s), color: s.text3, fontSize: 13 }}>Yükleniyor...</div>;

  const tarihler = son7Tarihleri();
  const haftalik = kayitlar.filter(r => tarihler.includes(r.tarih || r.id));
  if (!haftalik.length) return null;

  const dersBazli = {};
  haftalik.forEach(kayit => {
    Object.entries(kayit.dersler || {}).forEach(([id, v]) => {
      if (!dersBazli[id]) dersBazli[id] = { d: 0, y: 0, b: 0, konular: {} };
      dersBazli[id].d += v.d || 0;
      dersBazli[id].y += v.y || 0;
      dersBazli[id].b += v.b || 0;
    });
    Object.entries(kayit.konuDetay || {}).forEach(([id, konular]) => {
      if (!dersBazli[id]) dersBazli[id] = { d: 0, y: 0, b: 0, konular: {} };
      Object.entries(konular).forEach(([konu, kv]) => {
        if (!dersBazli[id].konular[konu]) dersBazli[id].konular[konu] = { y: 0, b: 0 };
        dersBazli[id].konular[konu].y += kv.yanlis || 0;
        dersBazli[id].konular[konu].b += kv.bos || 0;
      });
    });
  });

  const dersler = Object.entries(dersBazli).filter(([, v]) => v.d + v.y + v.b > 0);
  if (!dersler.length) return null;

  return (
    <div style={kartStil(s)}>
      <div style={baslikStil(s)}>Soru Çözümü (Bu Hafta)</div>
      {dersler.map(([dersId, { d, y, b, konular }]) => (
        <div key={dersId} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: s.text }}>{dersId}</span>
            <span style={{ fontSize: 12, color: s.text3 }}>
              {d + y + b} soru · {d}D/{y}Y/{b}B
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              height: 4,
              borderRadius: 2,
              overflow: 'hidden',
              background: s.surface2,
            }}
          >
            {d > 0 && <div style={{ flex: d, background: '#10B981' }} />}
            {y > 0 && <div style={{ flex: y, background: '#EF4444' }} />}
            {b > 0 && <div style={{ flex: b, background: '#9CA3AF' }} />}
          </div>
          {Object.entries(konular)
            .filter(([, kv]) => kv.y + kv.b > 0)
            .map(([konu, kv]) => (
              <div key={konu} style={{ fontSize: 11, color: s.text3, marginTop: 3 }}>
                {konu}: {kv.y + kv.b} soru, {kv.y} yanlış
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

// Kart 4 — Son deneme
export function DenemeKarti({ denemeler, ogrenci, s }) {
  const son = denemeler[0];
  if (!son) return null;

  // dersId → label eşlemesi (ör. lgstur → Türkçe)
  const dersLabelMap = {};
  dersSetiniBelirle(ogrenci?.tur, ogrenci?.sinif).forEach(d => {
    dersLabelMap[d.id] = d.label;
  });

  // netler[dersId] = {d, y, b, net, ...} — net alanı float
  const netlerGirdi = son.netler || son.dersNetler || {};
  const netler = Object.entries(netlerGirdi).filter(([, v]) => v != null);

  const tarihStr = son.tarih
    ? typeof son.tarih?.toDate === 'function'
      ? son.tarih.toDate().toLocaleDateString('tr-TR')
      : String(son.tarih)
    : null;

  return (
    <div style={kartStil(s)}>
      <div style={baslikStil(s)}>Son Deneme</div>
      {tarihStr && <div style={{ fontSize: 12, color: s.text3, marginBottom: 10 }}>{tarihStr}</div>}
      {netler.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 8,
            marginBottom: 10,
          }}
        >
          {netler.map(([dersId, val]) => {
            const netSayisi = typeof val === 'object' ? (val.net ?? 0) : val;
            return (
              <div
                key={dersId}
                style={{ background: s.surface2, borderRadius: 8, padding: '8px 10px' }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: s.text3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {dersLabelMap[dersId] || dersId}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: s.text }}>
                  {Number(netSayisi).toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {son.toplamNet != null && (
        <div
          style={{
            background: '#EEEDFE',
            borderRadius: 10,
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, color: '#3C3489' }}>Toplam Net</span>
          <span style={{ fontSize: 22, fontWeight: 500, color: '#534AB7' }}>
            {Number(son.toplamNet).toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}

// Kart 5 + 6 — Bugünün programı ve hafta özeti
export function ProgramKartlari({ ogrenciId, s }) {
  const [program, setProgram] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const haftaKey = haftaBasStr();
  const bugunGun = bugunGunAdi();

  useEffect(() => {
    const ref = doc(db, 'ogrenciler', ogrenciId, 'program_v2', haftaKey);
    return onSnapshot(ref, snap => {
      setProgram(snap.exists() ? snap.data() : null);
      setYukleniyor(false);
    });
  }, [ogrenciId, haftaKey]);

  if (yukleniyor)
    return <div style={{ ...kartStil(s), color: s.text3, fontSize: 13 }}>Yükleniyor...</div>;
  if (!program) return null;

  const hafta = program.hafta || {};
  const tam = program.tamamlandi || {};
  const bugunSlotlar = (hafta[bugunGun] || [])
    .filter(sl => sl.tip)
    .map((sl, i) => ({ ...sl, _idx: i }));
  const haftaVarMi = GUN_SIRA.some(g => (hafta[g] || []).some(sl => sl.tip));

  return (
    <>
      {bugunSlotlar.length > 0 && (
        <div style={kartStil(s)}>
          <div style={baslikStil(s)}>Bugünün Programı</div>
          {bugunSlotlar.map(slot => {
            const bitti = !!tam[`${bugunGun}_${slot._idx}`];
            return (
              <div
                key={slot._idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 0',
                  borderBottom: `1px solid ${s.border}`,
                }}
              >
                <span style={{ fontSize: 14, color: bitti ? '#10B981' : s.text3 }}>
                  {bitti ? '✓' : '○'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: bitti ? s.text3 : s.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {slot.ders || slot.tip}
                  </div>
                  {slot.icerik && (
                    <div
                      style={{
                        fontSize: 11,
                        color: s.text3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {slot.icerik}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: s.text3, flexShrink: 0 }}>{slot.tip}</span>
              </div>
            );
          })}
        </div>
      )}
      {haftaVarMi && (
        <div style={kartStil(s)}>
          <div style={baslikStil(s)}>Bu Hafta Programı</div>
          {GUN_SIRA.map(gun => {
            const gunSlotlar = (hafta[gun] || []).filter(sl => sl.tip);
            if (!gunSlotlar.length) return null;
            const tamSayi = gunSlotlar.filter((_, i) => tam[`${gun}_${i}`]).length;
            return (
              <div
                key={gun}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '5px 0',
                  fontSize: 13,
                  borderBottom: `1px solid ${s.border}`,
                }}
              >
                <span style={{ color: gun === bugunGun ? '#534AB7' : s.text2 }}>{GUN_TR[gun]}</span>
                <span style={{ color: s.text3 }}>
                  {tamSayi}/{gunSlotlar.length} tamamlandı
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// Kart 7 — Son koç raporu
export function SonRaporKarti({ veliRaporlari, s }) {
  const [acik, setAcik] = useState(false);
  const son = veliRaporlari[0];
  const metin = son?.kocNotu || son?.ozetMetni || '';

  return (
    <div style={kartStil(s)}>
      <div style={baslikStil(s)}>Son Koç Raporu</div>
      {!son ? (
        <div style={{ fontSize: 13, color: s.text3 }}>Henüz haftalık rapor oluşturulmadı.</div>
      ) : (
        <>
          {son.haftaBaslangic && (
            <div style={{ fontSize: 12, color: s.text3, marginBottom: 8 }}>
              {son.haftaBaslangic} – {son.haftaBitis || '—'}
            </div>
          )}
          {metin && (
            <div style={{ fontSize: 13, color: s.text2, lineHeight: 1.75, marginBottom: 10 }}>
              {acik ? metin : metin.slice(0, 140) + (metin.length > 140 ? '...' : '')}
            </div>
          )}
          {son.dikkatAlanlari?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {son.dikkatAlanlari.map(alan => (
                <span
                  key={alan}
                  style={{
                    fontSize: 11,
                    background: '#FEF3C7',
                    color: '#92400E',
                    borderRadius: 20,
                    padding: '2px 10px',
                    marginRight: 6,
                    fontWeight: 600,
                  }}
                >
                  ⚠ {alan}
                </span>
              ))}
            </div>
          )}
          {metin.length > 140 && (
            <button
              onClick={() => setAcik(v => !v)}
              style={{
                background: 'none',
                border: 'none',
                color: '#534AB7',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0,
              }}
            >
              {acik ? 'Küçült ▲' : 'Tamamını oku ▼'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
