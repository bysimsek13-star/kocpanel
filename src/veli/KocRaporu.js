import React, { useState } from 'react';

// ─── Rapor metnini düz metin olarak oluştur (WhatsApp / yazdır için) ─────────
function raporMetniOlustur(rapor, ogrenciIsim) {
  const satirlar = [];
  satirlar.push(`📋 ElsWay Haftalık Koç Raporu`);
  if (ogrenciIsim) satirlar.push(`Öğrenci: ${ogrenciIsim}`);
  if (rapor.haftaBaslangic)
    satirlar.push(`Dönem: ${rapor.haftaBaslangic} → ${rapor.haftaBitis || '—'}`);
  satirlar.push('');
  if (rapor.calismaGunSayisi != null) satirlar.push(`📅 Çalışma: ${rapor.calismaGunSayisi} gün`);
  if (rapor.toplamSaat != null) satirlar.push(`⏱ Süre: ${rapor.toplamSaat} saat`);
  if (rapor.gorevTamamlama != null) satirlar.push(`✅ Görev tamamlama: %${rapor.gorevTamamlama}`);
  if (rapor.sonDenemeNet != null) satirlar.push(`📊 Son deneme neti: ${rapor.sonDenemeNet}`);
  if (rapor.netDegisim != null)
    satirlar.push(`📈 Net değişimi: ${rapor.netDegisim >= 0 ? '+' : ''}${rapor.netDegisim}`);
  if (rapor.ozetMetni) {
    satirlar.push('');
    satirlar.push(`📝 ${rapor.ozetMetni}`);
  }
  if (rapor.dikkatAlanlari?.length > 0) {
    satirlar.push('');
    satirlar.push('⚠ Dikkat gerektiren alanlar:');
    rapor.dikkatAlanlari.forEach(alan => satirlar.push(`  • ${alan}`));
  }
  return satirlar.join('\n');
}

export function KocRaporu({ raporlar, ogrenciIsim, s }) {
  const [filtre, setFiltre] = useState('son4'); // son4 | son8 | tumü
  const [acik, setAcik] = useState(0);

  if (!raporlar.length) {
    return (
      <div
        style={{
          background: s.surface,
          border: `1px solid ${s.border}`,
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: s.text, marginBottom: 8 }}>
          Koç Raporu
        </div>
        <div style={{ fontSize: 13, color: s.text3 }}>Henüz haftalık rapor oluşturulmadı.</div>
      </div>
    );
  }

  const filtrelenmis =
    filtre === 'son4' ? raporlar.slice(0, 4) : filtre === 'son8' ? raporlar.slice(0, 8) : raporlar;
  const rapor = filtrelenmis[Math.min(acik, filtrelenmis.length - 1)];

  const whatsappPaylasimi = () => {
    const metin = raporMetniOlustur(rapor, ogrenciIsim);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(metin)}`, '_blank');
  };

  const yazdir = () => {
    const metin = raporMetniOlustur(rapor, ogrenciIsim);
    const w = window.open('', '_blank');
    w.document.write(
      `<html><head><title>Koç Raporu</title><style>body{font-family:sans-serif;padding:32px;white-space:pre-wrap;font-size:14px;line-height:1.7}</style></head>` +
        `<body>${metin.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`
    );
    w.document.close();
    w.print();
  };

  return (
    <div
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        padding: 20,
      }}
    >
      {/* Başlık + filtre */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: s.text, flex: 1 }}>Koç Raporu</div>
        <select
          value={filtre}
          onChange={e => {
            setFiltre(e.target.value);
            setAcik(0);
          }}
          style={{
            fontSize: 11,
            background: s.surface2,
            border: `1px solid ${s.border}`,
            borderRadius: 8,
            padding: '4px 8px',
            color: s.text2,
            cursor: 'pointer',
          }}
        >
          <option value="son4">Son 4 hafta</option>
          <option value="son8">Son 8 hafta</option>
          <option value="tumu">Tümü ({raporlar.length})</option>
        </select>
      </div>

      {/* Rapor navigasyonu */}
      {filtrelenmis.length > 1 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {filtrelenmis.map((r, i) => (
            <div
              key={i}
              onClick={() => setAcik(i)}
              style={{
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: acik === i ? 700 : 400,
                background: acik === i ? s.accent : s.surface2,
                color: acik === i ? s.buttonText || '#fff' : s.text3,
                border: `1px solid ${acik === i ? s.accent : s.border}`,
              }}
            >
              {r.haftaBaslangic || `#${i + 1}`}
            </div>
          ))}
        </div>
      )}

      {/* Tarih + kaynak */}
      {rapor.haftaBaslangic && (
        <div style={{ fontSize: 11, color: s.text3, marginBottom: 10 }}>
          {rapor.haftaBaslangic} → {rapor.haftaBitis || '—'}
          {rapor.kaynak === 'manuel_koc' && (
            <span style={{ marginLeft: 8, color: s.accent, fontWeight: 600 }}>Koç raporu</span>
          )}
        </div>
      )}

      {/* İstatistik chip'leri */}
      {(rapor.calismaGunSayisi != null || rapor.toplamSaat != null) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            rapor.calismaGunSayisi != null && { l: 'Çalışma', v: `${rapor.calismaGunSayisi} gün` },
            rapor.toplamSaat != null && { l: 'Süre', v: `${rapor.toplamSaat} saat` },
            rapor.gorevTamamlama != null && { l: 'Görev', v: `%${rapor.gorevTamamlama}` },
            rapor.sonDenemeNet != null && { l: 'Son net', v: rapor.sonDenemeNet },
            rapor.netDegisim != null && {
              l: 'Net Δ',
              v: `${rapor.netDegisim >= 0 ? '+' : ''}${rapor.netDegisim}`,
              renk: rapor.netDegisim >= 0 ? '#10B981' : '#F43F5E',
            },
          ]
            .filter(Boolean)
            .map(item => (
              <div
                key={item.l}
                style={{
                  background: s.surface2,
                  borderRadius: 20,
                  padding: '5px 12px',
                  fontSize: 12,
                  color: item.renk || s.text2,
                }}
              >
                <span style={{ color: s.text3 }}>{item.l}: </span>
                <b>{item.v}</b>
              </div>
            ))}
        </div>
      )}

      {rapor.ozetMetni && (
        <div
          style={{
            fontSize: 13,
            color: s.text2,
            lineHeight: 1.7,
            background: s.surface2,
            borderRadius: 10,
            padding: 14,
          }}
        >
          {rapor.ozetMetni}
        </div>
      )}

      {rapor.dikkatAlanlari?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 6 }}>
            DİKKAT GEREKTİREN ALANLAR
          </div>
          {rapor.dikkatAlanlari.map((alan, i) => (
            <div key={i} style={{ fontSize: 12, color: '#F59E0B', marginBottom: 3 }}>
              • {alan}
            </div>
          ))}
        </div>
      )}

      {/* Paylaş + Yazdır */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${s.border}`,
        }}
      >
        <button
          onClick={whatsappPaylasimi}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            background: '#25D366',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          WhatsApp ile paylaş
        </button>
        <button
          onClick={yazdir}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            background: s.surface2,
            color: s.text2,
            border: `1px solid ${s.border}`,
            cursor: 'pointer',
          }}
        >
          PDF / Yazdır
        </button>
      </div>
    </div>
  );
}
