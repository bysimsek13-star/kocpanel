import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, doc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { renkler } from '../../data/konular';
import { useGunlukTarih } from '../../utils/tarih';
import { Card, Avatar, LoadingState } from '../../components/Shared';
import BugunProgrami from './BugunProgrami';

const HAREKET_ONERILERI = [
  '10 dakika yürüyüş yap',
  '20 squat + 10 şınav',
  '5 dakika esneme hareketi',
  '2 dakika derin nefes egzersizi',
  '15 dakika açık havada dur',
  '30 saniyede 10 zıplama',
];

// ─── Koç için öğrenci rutin kartı ─────────────────────────────────────────────
export default function OgrenciRutinKarti({ ogrenci, index, s }) {
  const { bugun: BUGUN } = useGunlukTarih();
  const [rutinler, setRutinler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [gunlukSoruOzet, setGunlukSoruOzet] = useState(null);

  useEffect(() => {
    getDocs(
      query(collection(db, 'ogrenciler', ogrenci.id, 'rutin'), orderBy('tarih', 'desc'), limit(7))
    )
      .then(snap => {
        setRutinler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setYukleniyor(false);
      })
      .catch(() => setYukleniyor(false));
  }, [ogrenci.id]);

  useEffect(() => {
    getDoc(doc(db, 'ogrenciler', ogrenci.id, 'gunlukSoru', BUGUN))
      .then(snap => {
        if (!snap.exists()) {
          setGunlukSoruOzet(null);
          return;
        }
        const g = snap.data();
        const dersler = g.dersler || {};
        let toplam = 0,
          yanlis = 0,
          bos = 0;
        Object.values(dersler).forEach(row => {
          const d = row.d || 0,
            y = row.y || 0,
            b = row.b || 0;
          toplam += d + y + b;
          yanlis += y;
          bos += b;
        });
        setGunlukSoruOzet({ toplam, yanlis, bos, sureDk: g.sureDk });
      })
      .catch(() => setGunlukSoruOzet(null));
  }, [ogrenci.id, BUGUN]);

  const bugunRutin = rutinler.find(r => r.tarih === BUGUN);
  const ortUyku = rutinler.length
    ? (rutinler.reduce((a, r) => a + (r.uyku || 0), 0) / rutinler.length).toFixed(1)
    : '—';
  const suGun = rutinler.filter(r => r.su).length;
  const egzersizGun = rutinler.filter(r => r.egzersiz).length;

  const uyarilar = [];
  if (bugunRutin?.uyku < 6) uyarilar.push('Dün gece az uyudu');
  if (!bugunRutin && rutinler.length > 0) uyarilar.push('Bugün rutin girmedi');
  if (parseFloat(ortUyku) < 6 && ortUyku !== '—') uyarilar.push('Haftalık uyku ortalaması düşük');

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${s.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Avatar isim={ogrenci.isim} renk={renkler[index % renkler.length]} boyut={36} />
        <div style={{ flex: 1 }}>
          <div style={{ color: s.text, fontWeight: 700, fontSize: 14 }}>{ogrenci.isim}</div>
          {uyarilar.length > 0 && (
            <div style={{ fontSize: 11, color: s.uyari || '#B89A6E', marginTop: 2 }}>
              {uyarilar[0]}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          {bugunRutin ? (
            <div style={{ fontSize: 11, color: s.ok || '#8FADA3', fontWeight: 700 }}>
              ✓ Rutin girdi
            </div>
          ) : (
            <div style={{ fontSize: 11, color: s.text3 }}>Rutin yok</div>
          )}
          {gunlukSoruOzet && gunlukSoruOzet.toplam > 0 && (
            <div
              style={{
                fontSize: 10,
                color: s.text2,
                marginTop: 4,
                maxWidth: 160,
                lineHeight: 1.35,
              }}
            >
              📚 Bugün {gunlukSoruOzet.toplam} soru
              {gunlukSoruOzet.yanlis + gunlukSoruOzet.bos > 0
                ? ` · Y${gunlukSoruOzet.yanlis} B${gunlukSoruOzet.bos}`
                : ''}
              {gunlukSoruOzet.sureDk != null && gunlukSoruOzet.sureDk > 0
                ? ` · ${gunlukSoruOzet.sureDk} dk`
                : ''}
            </div>
          )}
          {ogrenci.gunlukDakika >= 1 &&
            (() => {
              const dk = Math.round(ogrenci.gunlukDakika);
              const s2 = Math.floor(dk / 60);
              const m = dk % 60;
              const etiket = s2 > 0 ? (m > 0 ? `${s2}s ${m}dk` : `${s2}s`) : `${m}dk`;
              return (
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: s.bilgiSoft || 'rgba(99,132,153,0.12)',
                    color: s.bilgi || '#6384A0',
                    border: `1px solid ${s.border}`,
                  }}
                >
                  ⏱ {etiket}
                </span>
              );
            })()}
        </div>
      </div>

      {yukleniyor ? (
        <div style={{ padding: 16 }}>
          <LoadingState />
        </div>
      ) : (
        <div style={{ padding: '14px 18px' }}>
          {/* Haftalık özet */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 8,
              marginBottom: 12,
            }}
          >
            {[
              {
                label: 'Ort. Uyku',
                val: ortUyku === '—' ? '—' : ortUyku + 's',
                renk: parseFloat(ortUyku) < 6 ? s.tehlika || '#B88383' : s.ok || '#8FADA3',
              },
              {
                label: 'Su (7 gün)',
                val: `${suGun}/7`,
                renk: suGun < 4 ? s.uyari || '#B89A6E' : s.ok || '#8FADA3',
              },
              {
                label: 'Egzersiz',
                val: `${egzersizGun}/7`,
                renk: egzersizGun < 3 ? s.uyari || '#B89A6E' : s.ok || '#8FADA3',
              },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background: s.surface2,
                  borderRadius: 10,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: stat.renk }}>{stat.val}</div>
                <div style={{ fontSize: 10, color: s.text3, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Son 7 gün uyku bar */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40 }}>
            {[...Array(7)].map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const tarih = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const r = rutinler.find(r2 => r2.tarih === tarih);
              const saat = r?.uyku || 0;
              const yuzde = Math.min((saat / 10) * 100, 100);
              const renk =
                saat === 0
                  ? s.surface2
                  : saat < 6
                    ? s.tehlika || '#B88383'
                    : saat < 7
                      ? s.uyari || '#B89A6E'
                      : s.ok || '#8FADA3';
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: 32,
                      background: s.surface2,
                      borderRadius: 4,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${yuzde}%`,
                        background: renk,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 9, color: s.text3 }}>
                    {
                      ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'][
                        d.getDay() === 0 ? 6 : d.getDay() - 1
                      ]
                    }
                  </div>
                </div>
              );
            })}
          </div>

          {/* Son 7 günün notları */}
          {rutinler
            .filter(r => r.not)
            .slice(0, 5)
            .map(r => (
              <div
                key={r.id}
                style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  background: s.surface2,
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 10, color: s.text3, fontWeight: 600, marginBottom: 3 }}>
                  {r.tarih}
                </div>
                <div style={{ fontSize: 12, color: s.text2, fontStyle: 'italic' }}>"{r.not}"</div>
              </div>
            ))}

          {/* Günün hareketi önerisi */}
          {(() => {
            const oneri = HAREKET_ONERILERI[new Date().getDate() % HAREKET_ONERILERI.length];
            return (
              <div
                style={{
                  marginTop: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: s.surface2,
                  border: `1px solid ${s.border}`,
                  borderRadius: 20,
                  padding: '5px 12px',
                  fontSize: 11,
                  color: s.text2,
                }}
              >
                <span>🏃</span>
                <span>
                  <strong style={{ color: s.text }}>Günün hareketi:</strong> {oneri}
                </span>
              </div>
            );
          })()}

          {/* Bugünün program slotları */}
          <BugunProgrami ogrenciId={ogrenci.id} s={s} />
        </div>
      )}
    </Card>
  );
}

OgrenciRutinKarti.propTypes = {
  ogrenci: PropTypes.shape({ id: PropTypes.string, isim: PropTypes.string }).isRequired,
  index: PropTypes.number,
  s: PropTypes.object.isRequired,
};
