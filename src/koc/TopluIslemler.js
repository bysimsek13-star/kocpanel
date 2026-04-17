import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useMobil } from '../hooks/useMediaQuery';
import { useToast } from '../components/Toast';
import { Btn, Card } from '../components/Shared';
import { KocHeroBand } from '../components/koc/KocPanelUi';
import { unreadPatch } from '../utils/readState';
import OgrenciSecimListesi from './OgrenciSecimListesi';
import TopluProgramKopya from './TopluProgramKopya';

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
