import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { TYT_DERSLER, AYT_SAY, netHesapla } from '../../data/konular';
import { LGS_DERSLER } from '../../utils/ogrenciBaglam';
import { turdenBransDersler } from '../../utils/sinavUtils';
import { bugunStr } from '../../utils/tarih';
import { useToast } from '../../components/Toast';
import { Btn } from '../../components/Shared';
import { bildirimOlustur } from '../../components/BildirimSistemi';
import { AYT_MAP, AYT_ALANLAR, turdenAlan, sinavSecenekleri, alanKilitli } from './denemeUtils';
import { DersGirisiBlok } from './DersGirisiBlok';

export default function DenemeModal({
  ogrenciId,
  onKapat,
  onEkle,
  mevcutDeneme = null,
  kocId = null,
  ogrenciTur = null,
  ogrenciSinif = null,
}) {
  const duzenle = !!mevcutDeneme;
  const { s } = useTheme();
  const toast = useToast();
  const secenekler = sinavSecenekleri(ogrenciTur, ogrenciSinif);
  const ilkSinav = secenekler[0];
  const [denemeTuru, setDenemeTuru] = useState(mevcutDeneme?.denemeTuru || 'genel');
  const [sinav, setSinav] = useState(
    mevcutDeneme?.sinav?.startsWith('Branş') ? ilkSinav : mevcutDeneme?.sinav || ilkSinav
  );
  const [alan, setAlan] = useState(mevcutDeneme?.alan || turdenAlan(ogrenciTur));
  const [bransDersler, setBransDersler] = useState(() => {
    if (mevcutDeneme?.denemeTuru === 'brans' && mevcutDeneme?.netler)
      return Object.keys(mevcutDeneme.netler);
    return [];
  });
  const [tarih, setTarih] = useState(mevcutDeneme?.tarih || bugunStr());
  const [yayinevi, setYayinevi] = useState(mevcutDeneme?.yayinevi || '');
  const [veriler, setVeriler] = useState(() => {
    if (!mevcutDeneme?.netler) return {};
    const ID_MAP = { fen: 'tytfiz', sos: 'tyttar' };
    const v = {};
    Object.entries(mevcutDeneme.netler).forEach(([id, n]) => {
      const yeniId = ID_MAP[id] || id;
      v[yeniId] = { d: n.d || 0, y: n.y || 0, b: n.b || 0 };
    });
    return v;
  });
  const [konuDetay, setKonuDetay] = useState(() => {
    if (!mevcutDeneme?.netler) return {};
    const k = {};
    Object.entries(mevcutDeneme.netler).forEach(([id, n]) => {
      if (n.konuDetay) k[id] = n.konuDetay;
    });
    return k;
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  const bransDersToggle = id => {
    setBransDersler(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    setVeriler(prev => {
      if (bransDersler.includes(id)) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  };

  const dersler =
    denemeTuru === 'brans'
      ? turdenBransDersler(ogrenciTur, ogrenciSinif).filter(d => bransDersler.includes(d.id))
      : sinav === 'LGS'
        ? LGS_DERSLER
        : sinav === 'TYT'
          ? TYT_DERSLER
          : AYT_MAP[alan] || AYT_SAY;

  const guncelle = (dersId, tip, deger) => {
    const ders = dersler.find(d => d.id === dersId);
    const max = ders?.toplam ?? 999;
    const mevcut = veriler[dersId] || {};
    const raw = parseInt(deger) || 0;
    const diger1 =
      tip === 'd'
        ? (mevcut.y || 0) + (mevcut.b || 0)
        : tip === 'y'
          ? (mevcut.d || 0) + (mevcut.b || 0)
          : (mevcut.d || 0) + (mevcut.y || 0);
    const val = Math.min(raw, Math.max(0, max - diger1));
    setVeriler(prev => ({ ...prev, [dersId]: { ...prev[dersId], [tip]: val } }));
  };

  const konuGuncelle = (dersId, konu, alan, deger) =>
    setKonuDetay(prev => ({
      ...prev,
      [dersId]: {
        ...(prev[dersId] || {}),
        [konu]: {
          ...(prev[dersId]?.[konu] || { soru: 0, yanlis: 0, bos: 0 }),
          [alan]: parseInt(deger, 10) || 0,
        },
      },
    }));

  const kaydet = async () => {
    setYukleniyor(true);
    try {
      if (denemeTuru === 'brans') {
        for (const d of dersler) {
          const dy = veriler[d.id] || {};
          const net = parseFloat(netHesapla(dy.d || 0, dy.y || 0));
          const kb = konuDetay[d.id] || {};
          const yanlisKonular = Object.entries(kb)
            .filter(([, b]) => b.yanlis > 0)
            .map(([k]) => k);
          const bosKonular = Object.entries(kb)
            .filter(([, b]) => b.bos > 0)
            .map(([k]) => k);
          const bransVeri = {
            sinav: 'Branş',
            denemeTuru: 'brans',
            tarih,
            yayinevi: yayinevi.trim(),
            netler: {
              [d.id]: {
                d: dy.d || 0,
                y: dy.y || 0,
                b: dy.b || 0,
                net,
                yanlisKonular,
                bosKonular,
                konuDetay: kb,
              },
            },
            toplamNet: net.toFixed(2),
          };
          if (duzenle) {
            await updateDoc(
              doc(db, 'ogrenciler', ogrenciId, 'denemeler', mevcutDeneme.id),
              bransVeri
            );
          } else {
            await addDoc(collection(db, 'ogrenciler', ogrenciId, 'denemeler'), {
              ...bransVeri,
              olusturma: new Date(),
            });
          }
          if (kocId && !duzenle)
            bildirimOlustur({
              aliciId: kocId,
              tip: 'deneme_girildi',
              baslik: 'Branş denemesi kaydedildi',
              mesaj: `${d.label} — ${net.toFixed(2)} net.`,
              ogrenciId,
              route: '/koc/ogrenciler',
            }).catch(() => {});
        }
      } else {
        const netler = {};
        let top = 0;
        dersler.forEach(d => {
          const dy = veriler[d.id] || {};
          const net = parseFloat(netHesapla(dy.d || 0, dy.y || 0));
          const kb = konuDetay[d.id] || {};
          const yanlisKonular = Object.entries(kb)
            .filter(([, b]) => b.yanlis > 0)
            .map(([k]) => k);
          const bosKonular = Object.entries(kb)
            .filter(([, b]) => b.bos > 0)
            .map(([k]) => k);
          netler[d.id] = {
            d: dy.d || 0,
            y: dy.y || 0,
            b: dy.b || 0,
            net,
            yanlisKonular,
            bosKonular,
            konuDetay: kb,
          };
          top += net;
        });
        const veri = {
          sinav,
          denemeTuru,
          tarih,
          yayinevi: yayinevi.trim(),
          netler,
          toplamNet: top.toFixed(2),
          ...(sinav === 'AYT' ? { alan } : {}),
        };
        if (duzenle) {
          await updateDoc(doc(db, 'ogrenciler', ogrenciId, 'denemeler', mevcutDeneme.id), veri);
        } else {
          await addDoc(collection(db, 'ogrenciler', ogrenciId, 'denemeler'), {
            ...veri,
            olusturma: new Date(),
          });
        }
        // sonDenemeNet / sonDenemeTarih → CF denemeAggregateGuncelle trigger'ı yazıyor, burada yazılmaz
        if (kocId && !duzenle)
          bildirimOlustur({
            aliciId: kocId,
            tip: 'deneme_girildi',
            baslik: 'Yeni deneme kaydedildi',
            mesaj: `${sinav}${sinav === 'AYT' ? ' ' + alan : ''} — toplam ${top.toFixed(2)} net.`,
            ogrenciId,
            route: '/koc/ogrenciler',
          }).catch(() => {});
      }
      toast(duzenle ? 'Deneme güncellendi!' : 'Deneme kaydedildi!');
      onEkle();
      onKapat();
    } catch (e) {
      toast('Kaydedilemedi: ' + e.message, 'error');
    }
    setYukleniyor(false);
  };

  const toplamNet = dersler
    .reduce((a, d) => {
      const dy = veriler[d.id] || {};
      return a + parseFloat(netHesapla(dy.d || 0, dy.y || 0));
    }, 0)
    .toFixed(2);

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
          width: 620,
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: s.shadow,
          margin: 20,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: s.text, marginBottom: 16 }}>
          {duzenle ? 'Deneme Düzenle' : 'Deneme Sonucu Gir'}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { k: 'genel', l: 'Genel Deneme' },
            { k: 'brans', l: 'Branş Denemesi' },
          ].map(t => (
            <div
              key={t.k}
              onClick={() => {
                setDenemeTuru(t.k);
                setVeriler({});
                setKonuDetay({});
              }}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: denemeTuru === t.k ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                background: denemeTuru === t.k ? s.accentSoft : s.surface2,
                color: denemeTuru === t.k ? s.accent : s.text2,
              }}
            >
              {t.l}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          {denemeTuru === 'genel' &&
            secenekler.map(t => (
              <div
                key={t}
                onClick={() => {
                  setSinav(t);
                  setVeriler({});
                  setKonuDetay({});
                }}
                style={{
                  flex: 1,
                  minWidth: 70,
                  padding: 9,
                  borderRadius: 10,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: sinav === t ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                  background: sinav === t ? s.accentSoft : s.surface2,
                  color: sinav === t ? s.accent : s.text2,
                }}
              >
                {t}
              </div>
            ))}
          <input
            type="date"
            value={tarih}
            onChange={e => setTarih(e.target.value)}
            style={{
              flex: 1,
              minWidth: 110,
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '9px 12px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
            }}
          />
          <input
            value={yayinevi}
            onChange={e => setYayinevi(e.target.value)}
            placeholder="Yayınevi"
            style={{
              flex: 1,
              minWidth: 110,
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '9px 12px',
              color: s.text,
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {denemeTuru === 'brans' && (
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: s.text3,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Ders seç (birden fazla seçebilirsin)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {turdenBransDersler(ogrenciTur, ogrenciSinif).map(d => {
                const secili = bransDersler.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => bransDersToggle(d.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: secili ? `2px solid ${d.renk}` : `1px solid ${s.border}`,
                      background: secili ? `${d.renk}20` : s.surface2,
                      color: secili ? d.renk : s.text2,
                    }}
                  >
                    {d.label}
                  </div>
                );
              })}
            </div>
            {bransDersler.length === 0 && (
              <div style={{ fontSize: 12, color: s.text3, marginTop: 8 }}>
                Yukarıdan en az bir ders seç, sonra sonuçları gir.
              </div>
            )}
          </div>
        )}

        {sinav === 'AYT' &&
          denemeTuru === 'genel' &&
          (alanKilitli(ogrenciTur) ? (
            <div
              style={{
                marginBottom: 14,
                padding: '8px 14px',
                background: s.surface2,
                borderRadius: 10,
                border: `1px solid ${s.border}`,
                fontSize: 12,
                color: s.text2,
              }}
            >
              Alan:{' '}
              <b style={{ color: s.text }}>{AYT_ALANLAR.find(a => a.k === alan)?.l || alan}</b>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {AYT_ALANLAR.map(a => (
                <div
                  key={a.k}
                  onClick={() => {
                    setAlan(a.k);
                    setVeriler({});
                    setKonuDetay({});
                  }}
                  style={{
                    flex: 1,
                    minWidth: 70,
                    padding: '7px 10px',
                    borderRadius: 10,
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: alan === a.k ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                    background: alan === a.k ? s.accentSoft : s.surface2,
                    color: alan === a.k ? s.accent : s.text2,
                  }}
                >
                  <div>{a.l}</div>
                  <div style={{ fontSize: 10, fontWeight: 400, marginTop: 1, opacity: 0.7 }}>
                    maks {a.maks} net
                  </div>
                </div>
              ))}
            </div>
          ))}

        {dersler.map(ders => (
          <DersGirisiBlok
            key={ders.id}
            ders={ders}
            veriler={veriler}
            konuDetay={konuDetay}
            onGuncelle={guncelle}
            onKonuGuncelle={konuGuncelle}
            s={s}
          />
        ))}

        <div
          style={{
            background: s.accentSoft,
            borderRadius: 12,
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            border: `1px solid ${s.accent}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>TOPLAM NET</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: s.accent }}>{toplamNet}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={kaydet} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Kaydediliyor...' : duzenle ? 'Güncelle' : 'Kaydet'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

DenemeModal.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
  onKapat: PropTypes.func.isRequired,
  onEkle: PropTypes.func.isRequired,
  mevcutDeneme: PropTypes.object,
  kocId: PropTypes.string,
  ogrenciTur: PropTypes.string,
  ogrenciSinif: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
