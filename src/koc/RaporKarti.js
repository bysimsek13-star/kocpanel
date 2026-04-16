import React from 'react';
import PropTypes from 'prop-types';
import { Card, Btn, Avatar } from '../components/Shared';
import { renkler } from '../data/konular';
import { formatDateShort } from '../utils/timelineUtils';
import { useRaporKarti } from './useRaporKarti';

export default function RaporKarti({ ogrenci, data, index, onTelefonGuncelle, s }) {
  const {
    telefonDuzenle,
    setTelefonDuzenle,
    telefonInput,
    setTelefonInput,
    yukleniyor,
    kocNotu,
    setKocNotu,
    onizleme,
    telefonKaydet,
    raporOlustur,
    waGonder,
    yazdirRapor,
  } = useRaporKarti({ ogrenci, data, onTelefonGuncelle });

  const rapor = data?.sonRapor || null;
  const netEtiket =
    data?.netDegisim == null ? '—' : `${data.netDegisim >= 0 ? '+' : ''}${data.netDegisim}`;
  const telefon = ogrenci.veliTelefon?.replace(/\D/g, '') || '';
  const pdfGorunur = !!(onizleme || rapor);

  return (
    <Card style={{ padding: 18 }}>
      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <Avatar isim={ogrenci.isim} renk={renkler[index % renkler.length]} boyut={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: s.text, fontWeight: 700, fontSize: 14 }}>{ogrenci.isim}</div>
          <div style={{ color: s.text2, fontSize: 12, marginTop: 3 }}>
            {ogrenci.tur} · {ogrenci.veliEmail || 'Veli email yok'}
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: s.text2,
            background: s.surface2,
            padding: '4px 10px',
            borderRadius: 999,
            border: `1px solid ${s.border}`,
          }}
        >
          Net Δ {netEtiket}
        </div>
      </div>

      {/* KPI grid */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}
      >
        {[
          { l: 'Çalışma', v: `${data?.calismaGunSayisi ?? 0}g`, renk: '#5B4FE8' },
          { l: 'Saat', v: `${data?.toplamSaat ?? 0}s`, renk: '#10B981' },
          { l: 'Görev', v: `%${data?.gorevTamamlama ?? 0}`, renk: '#F59E0B' },
          {
            l: 'Net',
            v: data?.sonDenemeNet ?? '—',
            renk: data?.netDegisim >= 0 ? '#10B981' : '#F43F5E',
          },
        ].map(item => (
          <div
            key={item.l}
            style={{ background: s.surface2, borderRadius: 10, padding: 10, textAlign: 'center' }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: item.renk }}>{item.v}</div>
            <div style={{ fontSize: 10, color: s.text3, marginTop: 4 }}>{item.l}</div>
          </div>
        ))}
      </div>

      {/* Telefon satırı */}
      <div style={{ marginBottom: 12 }}>
        {telefonDuzenle ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={telefonInput}
              onChange={e => setTelefonInput(e.target.value)}
              placeholder="905551234567"
              inputMode="tel"
              style={{
                flex: 1,
                background: s.surface2,
                border: `1px solid ${s.accent}`,
                borderRadius: 8,
                padding: '7px 10px',
                color: s.text,
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              onClick={telefonKaydet}
              style={{
                background: s.accent,
                border: 'none',
                borderRadius: 8,
                padding: '7px 12px',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Kaydet
            </button>
            <button
              onClick={() => setTelefonDuzenle(false)}
              style={{
                background: s.surface2,
                border: `1px solid ${s.border}`,
                borderRadius: 8,
                padding: '7px 10px',
                color: s.text3,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              İptal
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, color: telefon ? '#25D366' : s.text3 }}>
              {telefon ? `📱 ${ogrenci.veliTelefon}` : '📱 Veli WhatsApp numarası yok'}
            </div>
            <button
              onClick={() => setTelefonDuzenle(true)}
              style={{
                background: 'none',
                border: 'none',
                color: s.accent,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0,
              }}
            >
              {telefon ? 'Düzenle' : '+ Ekle'}
            </button>
          </div>
        )}
      </div>

      {/* Koç notu */}
      <div style={{ marginBottom: 12 }}>
        <textarea
          value={kocNotu}
          onChange={e => setKocNotu(e.target.value)}
          rows={2}
          placeholder="Veliye kısa not (isteğe bağlı)..."
          style={{
            width: '100%',
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '8px 12px',
            color: s.text,
            fontSize: 12,
            resize: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>

      {/* WA Önizleme */}
      {onizleme && (
        <div
          id="rapor-icerik"
          style={{
            background: s.surface2,
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: 11, color: s.text3, marginBottom: 6, fontWeight: 600 }}>
            📋 WA Önizleme
          </div>
          <pre
            style={{
              fontSize: 11,
              color: s.text,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {onizleme}
          </pre>
        </div>
      )}

      {/* Eylem butonları */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Btn
          onClick={raporOlustur}
          disabled={yukleniyor}
          variant="outline"
          style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}
        >
          {yukleniyor ? '⏳ Hazırlanıyor...' : onizleme ? '🔄 Yenile' : '📝 Rapor Oluştur'}
        </Btn>
        {pdfGorunur && (
          <Btn
            onClick={() => yazdirRapor(rapor)}
            variant="outline"
            style={{ padding: '8px 10px', fontSize: 12 }}
          >
            📄 PDF İndir
          </Btn>
        )}
        <button
          onClick={() => waGonder()}
          disabled={!telefon || (!onizleme && !rapor)}
          style={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: telefon && (onizleme || rapor) ? '#25D366' : s.surface2,
            border: 'none',
            borderRadius: 10,
            padding: '8px 14px',
            color: telefon && (onizleme || rapor) ? '#fff' : s.text3,
            fontSize: 12,
            fontWeight: 700,
            cursor: telefon && (onizleme || rapor) ? 'pointer' : 'not-allowed',
            opacity: telefon && (onizleme || rapor) ? 1 : 0.5,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp Gönder
        </button>
      </div>

      <div style={{ fontSize: 11, color: s.text3, marginTop: 8, textAlign: 'right' }}>
        {data?.veliRaporGerekli
          ? '⚠️ Bu hafta rapor bekliyor'
          : `Son rapor: ${rapor ? formatDateShort(rapor.haftaBitis) : '—'}`}
      </div>
    </Card>
  );
}

RaporKarti.propTypes = {
  ogrenci: PropTypes.object.isRequired,
  data: PropTypes.object,
  index: PropTypes.number.isRequired,
  onTelefonGuncelle: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
