import React from 'react';
import { Btn, Input } from '../components/Shared';

export function OgrenciEkleForm({
  isim,
  setIsim,
  email,
  setEmail,
  sifre,
  setSifre,
  veliEmail,
  setVeliEmail,
  veliSifre,
  setVeliSifre,
  veliTelefon,
  setVeliTelefon,
  tur,
  setTur,
  dogumTarihi,
  setDogumTarihi,
  hata,
  yukleniyor,
  onKapat,
  onEkle,
  s,
}) {
  return (
    <>
      <div
        style={{
          color: s.accent,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        Öğrenci Bilgileri
      </div>

      {[
        { l: 'Ad Soyad', v: isim, fn: setIsim, p: 'Ad Soyad', t: 'text', id: 'ogr-isim' },
        { l: 'Email', v: email, fn: setEmail, p: 'email@ornek.com', t: 'email', id: 'ogr-email' },
        {
          l: 'Şifre',
          v: sifre,
          fn: setSifre,
          p: 'En az 6 karakter',
          t: 'password',
          id: 'ogr-sifre',
        },
      ].map(f => (
        <div key={f.l} style={{ marginBottom: 12 }}>
          <label
            htmlFor={f.id}
            style={{
              display: 'block',
              color: s.text2,
              fontSize: 12,
              marginBottom: 5,
              fontWeight: 500,
            }}
          >
            {f.l}
          </label>
          <Input
            id={f.id}
            type={f.t}
            value={f.v}
            onChange={e => f.fn(e.target.value)}
            placeholder={f.p}
          />
        </div>
      ))}

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="ogr-tur"
          style={{
            display: 'block',
            color: s.text2,
            fontSize: 12,
            marginBottom: 5,
            fontWeight: 500,
          }}
        >
          Sınıf & Sınav Türü
        </label>
        <select
          id="ogr-tur"
          value={tur}
          onChange={e => setTur(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            color: s.text,
            fontSize: 13,
          }}
        >
          <optgroup label="LGS">
            <option value="lgs_7">7. Sınıf (LGS Hazırlık)</option>
            <option value="lgs_8">8. Sınıf (LGS)</option>
          </optgroup>
          <optgroup label="Ortaokul / Lise">
            <option value="ortaokul_9">9. Sınıf</option>
            <option value="ortaokul_10">10. Sınıf</option>
            <option value="ortaokul_11">11. Sınıf</option>
          </optgroup>
          <optgroup label="YKS - 12. Sınıf">
            <option value="tyt_12">12. Sınıf (TYT)</option>
            <option value="sayisal_12">12. Sınıf (Sayısal)</option>
            <option value="ea_12">12. Sınıf (EA)</option>
            <option value="sozel_12">12. Sınıf (Sözel)</option>
            <option value="dil_12">12. Sınıf (Dil)</option>
          </optgroup>
          <optgroup label="Mezun">
            <option value="tyt_mezun">Mezun (TYT)</option>
            <option value="sayisal_mezun">Mezun (Sayısal)</option>
            <option value="ea_mezun">Mezun (EA)</option>
            <option value="sozel_mezun">Mezun (Sözel)</option>
            <option value="dil_mezun">Mezun (Dil)</option>
          </optgroup>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label
          htmlFor="ogr-dogum"
          style={{
            display: 'block',
            color: s.text2,
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 5,
          }}
        >
          Doğum Tarihi (isteğe bağlı)
        </label>
        <input
          id="ogr-dogum"
          type="date"
          value={dogumTarihi}
          onChange={e => setDogumTarihi(e.target.value)}
          style={{
            width: '100%',
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            color: s.text,
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ borderTop: `1px solid ${s.border}`, paddingTop: 16, marginBottom: 16 }}>
        <div
          style={{
            color: '#10B981',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Veli (İsteğe Bağlı)
        </div>
        {[
          {
            l: 'Veli Email',
            v: veliEmail,
            fn: setVeliEmail,
            p: 'veli@email.com',
            t: 'email',
            id: 'veli-email',
          },
          {
            l: 'Veli Şifre',
            v: veliSifre,
            fn: setVeliSifre,
            p: 'En az 6 karakter',
            t: 'password',
            id: 'veli-sifre',
          },
          {
            l: 'Veli WhatsApp (ör: 905551234567)',
            v: veliTelefon,
            fn: setVeliTelefon,
            p: '905551234567',
            t: 'tel',
            id: 'veli-telefon',
          },
        ].map(f => (
          <div key={f.l} style={{ marginBottom: 10 }}>
            <label
              htmlFor={f.id}
              style={{
                display: 'block',
                color: s.text2,
                fontSize: 12,
                marginBottom: 5,
                fontWeight: 500,
              }}
            >
              {f.l}
            </label>
            <Input
              id={f.id}
              type={f.t}
              value={f.v}
              onChange={e => f.fn(e.target.value)}
              placeholder={f.p}
            />
          </div>
        ))}
        <div style={{ fontSize: 11, color: s.text3, marginTop: 4 }}>
          Veli email zaten kayıtlıysa otomatik bağlanır. Pasifse yeniden aktive edilir.
        </div>
      </div>

      {hata && (
        <div
          style={{
            color: '#F43F5E',
            fontSize: 13,
            marginBottom: 14,
            padding: '10px 14px',
            background: 'rgba(244,63,94,0.1)',
            borderRadius: 8,
            lineHeight: 1.5,
          }}
        >
          {hata}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
          İptal
        </Btn>
        <Btn
          onClick={onEkle}
          disabled={!isim || !email || !sifre || yukleniyor}
          style={{ flex: 2 }}
        >
          {yukleniyor ? 'Ekleniyor...' : 'Öğrenci Ekle'}
        </Btn>
      </div>
    </>
  );
}
