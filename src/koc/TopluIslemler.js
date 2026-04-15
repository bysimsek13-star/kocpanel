import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { useToast } from '../components/Toast';
import { Btn, Card, Avatar } from '../components/Shared';
import { KocHeroBand } from '../components/koc/KocPanelUi';
import { renkler } from '../data/konular';
import { haftaBaslangici } from '../utils/programAlgoritma';
import { unreadPatch } from '../utils/readState';

// ─── Öğrenci seçim bileşeni ───────────────────────────────────────────────────
function OgrenciSecimListesi({ ogrenciler, seciliIdler, onToggle, onTumunuSec, s }) {
  const tumunuSecildi = ogrenciler.length > 0 && ogrenciler.every(o => seciliIdler.has(o.id));

  return (
    <div style={{ border: `1px solid ${s.border}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Tümünü seç */}
      <div
        onClick={() => onTumunuSec(!tumunuSecildi)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          cursor: 'pointer',
          background: s.surface2,
          borderBottom: `1px solid ${s.border}`,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            flexShrink: 0,
            border: `2px solid ${tumunuSecildi ? s.accent : s.border}`,
            background: tumunuSecildi ? s.accent : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {tumunuSecildi && (
            <div
              style={{
                width: 8,
                height: 6,
                borderBottom: '2px solid #fff',
                borderLeft: '2px solid #fff',
                transform: 'rotate(-45deg) translate(1px,-1px)',
              }}
            />
          )}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: s.text2 }}>
          Tümünü seç ({ogrenciler.length})
        </span>
      </div>

      {/* Öğrenci listesi */}
      <div style={{ maxHeight: 260, overflowY: 'auto' }}>
        {ogrenciler.map((o, i) => {
          const secili = seciliIdler.has(o.id);
          return (
            <div
              key={o.id}
              onClick={() => onToggle(o.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: i < ogrenciler.length - 1 ? `1px solid ${s.border}` : 'none',
                background: secili ? s.accentSoft : 'transparent',
                transition: 'background .12s',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  flexShrink: 0,
                  border: `2px solid ${secili ? s.accent : s.border}`,
                  background: secili ? s.accent : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {secili && (
                  <div
                    style={{
                      width: 8,
                      height: 6,
                      borderBottom: '2px solid #fff',
                      borderLeft: '2px solid #fff',
                      transform: 'rotate(-45deg) translate(1px,-1px)',
                    }}
                  />
                )}
              </div>
              <Avatar isim={o.isim} renk={renkler[i % renkler.length]} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: secili ? s.accent : s.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {o.isim}
                </div>
                {o.tur && <div style={{ fontSize: 11, color: s.text3 }}>{o.tur}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Toplu mesaj kartı ────────────────────────────────────────────────────────
function TopluMesajKarti({ ogrenciler, s, mobil }) {
  const toast = useToast();
  const [seciliIdler, setSeciliIdler] = useState(new Set());
  const [mesaj, setMesaj] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);

  const toggle = id =>
    setSeciliIdler(prev => {
      const yeni = new Set(prev);
      yeni.has(id) ? yeni.delete(id) : yeni.add(id);
      return yeni;
    });

  const tumunuSec = sec => {
    setSeciliIdler(sec ? new Set(ogrenciler.map(o => o.id)) : new Set());
  };

  const gonder = async () => {
    if (!mesaj.trim() || seciliIdler.size === 0) return;
    setGonderiyor(true);
    try {
      await Promise.all(
        [...seciliIdler].map(ogrenciId =>
          addDoc(collection(db, 'ogrenciler', ogrenciId, 'mesajlar'), {
            mesaj: mesaj.trim(),
            gonderen: 'koc',
            ...unreadPatch(),
            olusturma: new Date(),
          })
        )
      );
      toast(`${seciliIdler.size} öğrenciye mesaj gönderildi`);
      setMesaj('');
      setSeciliIdler(new Set());
    } catch (e) {
      toast('Hata: ' + e.message, 'error');
    }
    setGonderiyor(false);
  };

  return (
    <Card style={{ padding: mobil ? 16 : 22 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 4 }}>
        Toplu mesaj gönder
      </div>
      <div style={{ fontSize: 12, color: s.text3, marginBottom: 16 }}>
        Seçili öğrencilere aynı mesajı gönderir.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1fr 1fr', gap: 16 }}>
        {/* Sol: Öğrenci seçimi */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 8 }}>
            Alıcılar{' '}
            {seciliIdler.size > 0 && (
              <span style={{ color: s.accent }}>({seciliIdler.size} seçili)</span>
            )}
          </div>
          <OgrenciSecimListesi
            ogrenciler={ogrenciler}
            seciliIdler={seciliIdler}
            onToggle={toggle}
            onTumunuSec={tumunuSec}
            s={s}
          />
        </div>

        {/* Sağ: Mesaj */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 8 }}>
              Mesaj
            </div>
            <textarea
              value={mesaj}
              onChange={e => setMesaj(e.target.value)}
              placeholder="Mesajınızı yazın..."
              style={{
                width: '100%',
                minHeight: 140,
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${s.border}`,
                background: s.surface2,
                color: s.text,
                fontSize: 13,
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Hızlı şablonlar */}
          <div>
            <div style={{ fontSize: 11, color: s.text3, marginBottom: 6 }}>Hızlı şablonlar</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                'Bu hafta çalışmaya devam edin!',
                'Deneme sonuçlarınızı girin lütfen.',
                'Haftalık görüşmemiz için hazır olun.',
                'Program güncellemesi yapıldı, kontrol edin.',
              ].map(sablon => (
                <div
                  key={sablon}
                  onClick={() => setMesaj(sablon)}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    border: `1px solid ${s.border}`,
                    background: s.surface2,
                    color: s.text3,
                    transition: 'all .12s',
                  }}
                >
                  {sablon}
                </div>
              ))}
            </div>
          </div>

          <Btn
            onClick={gonder}
            disabled={!mesaj.trim() || seciliIdler.size === 0 || gonderiyor}
            style={{ marginTop: 'auto', padding: '11px 0' }}
          >
            {gonderiyor ? 'Gönderiliyor...' : `Gönder (${seciliIdler.size} öğrenci)`}
          </Btn>
        </div>
      </div>
    </Card>
  );
}

// ─── Toplu program kopyala kartı ──────────────────────────────────────────────
function TopluProgramKopya({ ogrenciler, s, mobil }) {
  const toast = useToast();
  const [kaynakId, setKaynakId] = useState('');
  const [hedefIdler, setHedefIdler] = useState(new Set());
  const [kopyalaniyor, setKopyalaniyor] = useState(false);

  const toggle = id => {
    if (id === kaynakId) return; // kaynağı hedef olarak seçme
    setHedefIdler(prev => {
      const yeni = new Set(prev);
      yeni.has(id) ? yeni.delete(id) : yeni.add(id);
      return yeni;
    });
  };

  const tumunuSec = sec => {
    const hedefler = ogrenciler.filter(o => o.id !== kaynakId).map(o => o.id);
    setHedefIdler(sec ? new Set(hedefler) : new Set());
  };

  const kopyala = async () => {
    if (!kaynakId || hedefIdler.size === 0) return;
    setKopyalaniyor(true);
    try {
      const haftaKey = haftaBaslangici();
      const kaynakSnap = await getDoc(doc(db, 'ogrenciler', kaynakId, 'program_v2', haftaKey));

      if (!kaynakSnap.exists()) {
        toast('Kaynak öğrencinin bu haftaya ait programı yok', 'error');
        setKopyalaniyor(false);
        return;
      }

      const programVerisi = kaynakSnap.data();
      // Tamamlanma durumlarını sıfırla, sadece görev yapısını kopyala
      const temizProgram = { ...programVerisi };
      if (temizProgram.tamamlandi) {
        temizProgram.tamamlandi = {};
      }

      await Promise.all(
        [...hedefIdler].map(hedefId =>
          setDoc(doc(db, 'ogrenciler', hedefId, 'program_v2', haftaKey), temizProgram)
        )
      );

      const kaynakIsim = ogrenciler.find(o => o.id === kaynakId)?.isim || 'Kaynak';
      toast(`${kaynakIsim}'ın programı ${hedefIdler.size} öğrenciye kopyalandı`);
      setHedefIdler(new Set());
    } catch (e) {
      toast('Hata: ' + e.message, 'error');
    }
    setKopyalaniyor(false);
  };

  const hedefOgrenciler = ogrenciler.filter(o => o.id !== kaynakId);

  return (
    <Card style={{ padding: mobil ? 16 : 22 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 4 }}>
        Haftalık programı kopyala
      </div>
      <div style={{ fontSize: 12, color: s.text3, marginBottom: 16 }}>
        Bir öğrencinin bu haftaki programını diğer öğrencilere kopyalar. Tamamlanma durumları
        sıfırlanır.
      </div>

      {/* Kaynak seçimi */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 8 }}>
          Kaynak öğrenci
        </div>
        <select
          value={kaynakId}
          onChange={e => {
            setKaynakId(e.target.value);
            setHedefIdler(new Set());
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px solid ${s.border}`,
            background: s.surface2,
            color: kaynakId ? s.text : s.text3,
            fontSize: 13,
            outline: 'none',
          }}
        >
          <option value="">— Kaynak öğrenci seç —</option>
          {ogrenciler.map(o => (
            <option key={o.id} value={o.id}>
              {o.isim}
            </option>
          ))}
        </select>
      </div>

      {/* Hedef seçimi */}
      {kaynakId && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 8 }}>
            Kopyalanacak öğrenciler{' '}
            {hedefIdler.size > 0 && (
              <span style={{ color: s.accent }}>({hedefIdler.size} seçili)</span>
            )}
          </div>
          {hedefOgrenciler.length === 0 ? (
            <div style={{ fontSize: 13, color: s.text3, padding: 16, textAlign: 'center' }}>
              Başka öğrenci yok
            </div>
          ) : (
            <>
              <OgrenciSecimListesi
                ogrenciler={hedefOgrenciler}
                seciliIdler={hedefIdler}
                onToggle={toggle}
                onTumunuSec={tumunuSec}
                s={s}
              />
              <Btn
                onClick={kopyala}
                disabled={hedefIdler.size === 0 || kopyalaniyor}
                style={{ marginTop: 14, width: '100%', padding: '11px 0' }}
              >
                {kopyalaniyor ? 'Kopyalanıyor...' : `Programı kopyala (${hedefIdler.size} öğrenci)`}
              </Btn>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Ana sayfa ────────────────────────────────────────────────────────────────
export default function TopluIslemlerSayfasi({ ogrenciler = [], onGeri }) {
  const { s } = useTheme();
  const mobil = useMobil();

  const aktifOgrenciler = ogrenciler.filter(o => o.aktif !== false);

  return (
    <div style={{ padding: mobil ? 12 : 0 }}>
      <KocHeroBand
        baslik="Toplu işlemler"
        aciklama="Birden fazla öğrenciye aynı anda mesaj gönderin veya program kopyalayın."
        onGeri={onGeri}
        mobil={mobil}
      />

      {aktifOgrenciler.length === 0 ? (
        <div style={{ textAlign: 'center', color: s.text3, padding: 40 }}>Henüz öğrenci yok</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TopluMesajKarti ogrenciler={aktifOgrenciler} s={s} mobil={mobil} />
          <TopluProgramKopya ogrenciler={aktifOgrenciler} s={s} mobil={mobil} />
        </div>
      )}
    </div>
  );
}

TopluIslemlerSayfasi.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object),
  onGeri: PropTypes.func.isRequired,
};
