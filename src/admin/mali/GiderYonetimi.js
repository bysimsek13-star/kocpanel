import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/Toast';
import { Input, Btn } from '../../components/Shared';
import {
  GIDER_KATEGORILERI,
  KATEGORI_RENK,
  ayYilStr,
  ayLabel,
  aylarListesi,
  MIN_AY,
  tlFormat,
} from './maliSabitleri';
import { giderEkle, giderSil } from './useMaliVeri';

function GiderForm({ onEkle, onIptal, s }) {
  const toast = useToast();
  const [form, setForm] = useState({
    kategori: GIDER_KATEGORILERI[0],
    tutar: '',
    aciklama: '',
    tarih: new Date().toISOString().slice(0, 10),
    tekrarlayan: false,
  });
  const [islem, setIslem] = useState(false);

  const deger = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const kaydet = async () => {
    if (!form.tutar || Number(form.tutar) <= 0) {
      toast('Tutar giriniz.', 'error');
      return;
    }
    if (!form.aciklama.trim()) {
      toast('Açıklama giriniz.', 'error');
      return;
    }
    setIslem(true);
    try {
      await giderEkle(form);
      toast('Gider eklendi.');
      onEkle?.();
    } catch {
      toast('Hata oluştu.', 'error');
    } finally {
      setIslem(false);
    }
  };

  return (
    <div
      style={{
        background: s.surface2,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        border: `1px solid ${s.border}`,
      }}
    >
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <select
          value={form.kategori}
          onChange={deger('kategori')}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${s.border}`,
            background: s.surface,
            color: s.text,
            fontSize: 13,
          }}
        >
          {GIDER_KATEGORILERI.map(k => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="Tutar (₺)"
          value={form.tutar}
          onChange={deger('tutar')}
          style={{ width: 130 }}
        />
        <Input type="date" value={form.tarih} onChange={deger('tarih')} style={{ width: 150 }} />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Input
          placeholder="Açıklama"
          value={form.aciklama}
          onChange={deger('aciklama')}
          style={{ flex: 1, minWidth: 200 }}
        />
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: s.text2,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={form.tekrarlayan}
            onChange={e => setForm(f => ({ ...f, tekrarlayan: e.target.checked }))}
          />
          Tekrarlayan
        </label>
        <Btn onClick={kaydet} disabled={islem}>
          {islem ? '...' : 'Ekle'}
        </Btn>
        {onIptal && (
          <Btn onClick={onIptal} variant="secondary">
            İptal
          </Btn>
        )}
      </div>
    </div>
  );
}

export default function GiderYonetimi({ giderler }) {
  const { s } = useTheme();
  const toast = useToast();
  const [seciliAy, setSeciliAy] = useState(ayYilStr());
  const [formAcik, setFormAcik] = useState(false);

  const aylar = aylarListesi(MIN_AY);

  const ayGiderleri = giderler.filter(g => g.ayYil === seciliAy);

  const toplamGider = ayGiderleri.reduce((acc, g) => acc + (Number(g.tutar) || 0), 0);

  const kategoriler = GIDER_KATEGORILERI.filter(k => ayGiderleri.some(g => g.kategori === k));

  const sil = async id => {
    try {
      await giderSil(id);
      toast('Gider silindi.');
    } catch {
      toast('Silinemedi.', 'error');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <select
          value={seciliAy}
          onChange={e => setSeciliAy(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: `1px solid ${s.border}`,
            background: s.surface,
            color: s.text,
            fontSize: 14,
          }}
        >
          {aylar.map(a => (
            <option key={a} value={a}>
              {ayLabel(a)}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>
          {tlFormat(toplamGider)} toplam
        </div>
        <Btn
          onClick={() => setFormAcik(v => !v)}
          variant="secondary"
          style={{ marginLeft: 'auto' }}
        >
          {formAcik ? 'İptal' : '+ Gider Ekle'}
        </Btn>
      </div>

      {formAcik && (
        <GiderForm onEkle={() => setFormAcik(false)} onIptal={() => setFormAcik(false)} s={s} />
      )}

      {kategoriler.map(kat => (
        <div key={kat} style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: KATEGORI_RENK[kat] || s.text2,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {kat}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ayGiderleri
              .filter(g => g.kategori === kat)
              .map(g => (
                <div
                  key={g.id}
                  style={{
                    background: s.surface,
                    borderRadius: 10,
                    padding: '10px 14px',
                    border: `1px solid ${s.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderLeft: `3px solid ${KATEGORI_RENK[g.kategori] || s.border}`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: s.text, fontWeight: 500 }}>{g.aciklama}</div>
                    {g.tekrarlayan && (
                      <div style={{ fontSize: 11, color: s.text3 }}>Tekrarlayan</div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, color: s.text, fontSize: 14 }}>
                    {tlFormat(g.tutar)}
                  </div>
                  <button
                    onClick={() => sil(g.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: s.text3,
                      fontSize: 16,
                      padding: '0 4px',
                    }}
                    title="Sil"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}

      {ayGiderleri.length === 0 && !formAcik && (
        <div style={{ textAlign: 'center', color: s.text3, padding: 40, fontSize: 14 }}>
          Bu ay için gider kaydı yok.
        </div>
      )}
    </div>
  );
}

GiderYonetimi.propTypes = {
  giderler: PropTypes.array.isRequired,
};
