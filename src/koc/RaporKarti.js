import React, { useState } from 'react';
import { collection, getDocs, getDoc, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { renkler } from '../data/konular';
import { useToast } from '../components/Toast';
import { Card, Btn, Avatar } from '../components/Shared';
import { formatDateShort } from '../utils/timelineUtils';
import { bildirimOlustur } from '../components/BildirimSistemi';
import { GUNLER, haftaBaslangici } from '../utils/programAlgoritma';
import { addDays, waMetniOlustur } from './veliRaporlariUtils';

export default function RaporKarti({ ogrenci, data, index, onTelefonGuncelle, s }) {
  const { userData } = useAuth();
  const toast = useToast();
  const rapor = data?.sonRapor || null;
  const netEtiket =
    data?.netDegisim == null ? '—' : `${data.netDegisim >= 0 ? '+' : ''}${data.netDegisim}`;

  const [telefonDuzenle, setTelefonDuzenle] = useState(false);
  const [telefonInput, setTelefonInput] = useState(ogrenci.veliTelefon || '');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kocNotu, setKocNotu] = useState('');
  const [onizleme, setOnizleme] = useState('');
  const [waMesaji, setWaMesaji] = useState('');

  const telefon = ogrenci.veliTelefon?.replace(/\D/g, '') || '';

  const telefonKaydet = () => {
    onTelefonGuncelle(ogrenci.id, telefonInput.trim());
    setTelefonDuzenle(false);
  };

  const raporOlustur = async () => {
    setYukleniyor(true);
    try {
      const gecenHafta = new Date();
      gecenHafta.setDate(gecenHafta.getDate() - 7);
      const secilenHafta = haftaBaslangici(gecenHafta);
      const haftaBitis = addDays(secilenHafta, 6);

      const [progDoc, calismaSnap, denSnap] = await Promise.all([
        getDoc(doc(db, 'ogrenciler', ogrenci.id, 'program_v2', secilenHafta)),
        getDocs(collection(db, 'ogrenciler', ogrenci.id, 'calisma')),
        getDocs(collection(db, 'ogrenciler', ogrenci.id, 'denemeler')),
      ]);

      const progData = progDoc.exists() ? progDoc.data() : {};
      const hafta = progData.hafta || {};
      const tamamlandiFlat = progData.tamamlandi || {};

      const calismaMap = {};
      calismaSnap.docs.forEach(d => {
        calismaMap[d.id] = Number(d.data().saat) || 0;
      });

      const gunTarihleri = GUNLER.map((_, i) => addDays(secilenHafta, i));
      const soruSnaps = await Promise.all(
        gunTarihleri.map(t => getDoc(doc(db, 'ogrenciler', ogrenci.id, 'gunlukSoru', t)))
      );

      const gunVerileri = GUNLER.map((gunAdi, i) => {
        const tarih = gunTarihleri[i];
        const slotlar = hafta[gunAdi] || [];
        const tamamlandi = {};
        slotlar.forEach((_, idx) => {
          tamamlandi[idx] = !!tamamlandiFlat[`${gunAdi}_${idx}`];
        });
        const soruData = soruSnaps[i].exists() ? soruSnaps[i].data() : null;
        const soruToplam = soruData
          ? Object.values(soruData.dersler || {}).reduce(
              (s, r) => s + (r.d || 0) + (r.y || 0) + (r.b || 0),
              0
            )
          : 0;
        return {
          tarih,
          gunAdi,
          slotlar,
          tamamlandi,
          calismaSaat: calismaMap[tarih] || 0,
          soruToplam,
          soruData,
        };
      });

      const toplamSaat = gunVerileri.reduce((a, g) => a + g.calismaSaat, 0);
      const calismaGun = gunVerileri.filter(g => g.calismaSaat > 0).length;
      const doluSlotlar = gunVerileri.flatMap(g => g.slotlar.filter(sl => sl.tip));
      const tamamlananSayi = gunVerileri.reduce(
        (acc, g) => acc + g.slotlar.filter((sl, i) => sl.tip && g.tamamlandi[i]).length,
        0
      );
      const gorevOran = doluSlotlar.length
        ? Math.round((tamamlananSayi / doluSlotlar.length) * 100)
        : 0;

      const buHaftaDen = denSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.tarih >= secilenHafta && d.tarih <= haftaBitis)
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
      const sonDeneme =
        buHaftaDen[0] ||
        denSnap.docs
          .map(d => ({ ...d.data() }))
          .sort((a, b) => new Date(b.tarih || 0) - new Date(a.tarih || 0))[0];

      const ozet = {
        calismaGun,
        toplamSaat: toplamSaat.toFixed(1),
        gorevOran,
        sonDenemeNet: sonDeneme ? Number(sonDeneme.toplamNet) || null : null,
      };

      const mesaj = waMetniOlustur({
        ogrenci,
        secilenHafta,
        haftaBitis,
        gunVerileri,
        denemeler: buHaftaDen,
        kocNotu,
        ozet,
      });
      setWaMesaji(mesaj);
      setOnizleme(mesaj);

      await addDoc(collection(db, 'ogrenciler', ogrenci.id, 'veliRaporlari'), {
        haftaBaslangic: secilenHafta,
        haftaBitis,
        ozetMetni: `${calismaGun} gün, ${toplamSaat.toFixed(1)} saat, %${gorevOran} görev tamamlandı.`,
        kocNotu: kocNotu.trim(),
        calismaGunSayisi: calismaGun,
        toplamSaat: Number(toplamSaat.toFixed(1)),
        gorevTamamlama: gorevOran,
        sonDenemeNet: ozet.sonDenemeNet,
        olusturma: serverTimestamp(),
        kaynak: 'detayli_koc',
        kocIsim: userData?.isim || '',
      });
      if (ogrenci.veliUid) {
        bildirimOlustur({
          aliciId: ogrenci.veliUid,
          tip: 'veli_raporu_hazir',
          baslik: 'Haftalık rapor hazırlandı',
          mesaj: `${ogrenci.isim} için haftalık rapor hazırlandı.`,
          ogrenciId: ogrenci.id,
          ogrenciIsim: ogrenci.isim || '',
          route: '/veli/mesajlar',
        }).catch(() => {});
      }
      toast(`${ogrenci.isim} için rapor oluşturuldu ✅`);
    } catch (e) {
      toast(e.message || 'Hata', 'error');
    }
    setYukleniyor(false);
  };

  const waGonder = () => {
    if (!telefon) return;
    const mesaj =
      waMesaji ||
      waMetniOlustur({
        ogrenci,
        secilenHafta: '',
        haftaBitis: '',
        gunVerileri: [],
        denemeler: [],
        kocNotu,
        ozet: {
          calismaGun: data?.calismaGunSayisi ?? 0,
          toplamSaat: data?.toplamSaat ?? 0,
          gorevOran: data?.gorevTamamlama ?? 0,
          sonDenemeNet: data?.sonDenemeNet,
        },
      });
    window.open(`https://wa.me/${telefon}?text=${encodeURIComponent(mesaj)}`, '_blank');
  };

  return (
    <Card style={{ padding: 18 }}>
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

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Btn
          onClick={raporOlustur}
          disabled={yukleniyor}
          variant="outline"
          style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}
        >
          {yukleniyor ? '⏳ Hazırlanıyor...' : onizleme ? '🔄 Yenile' : '📝 Rapor Oluştur'}
        </Btn>
        {onizleme && (
          <Btn
            onClick={() => window.print()}
            variant="outline"
            style={{ padding: '8px 10px', fontSize: 12 }}
          >
            📄 PDF İndir
          </Btn>
        )}
        <button
          onClick={waGonder}
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
