import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Card, Btn, Input } from '../components/Shared';
import { useToast } from '../components/Toast';

const BOŞ_FORM = {
  code: '',
  studentName: '',
  allowedEmail: '',
  allowedPhone: '',
  monthlyNetAmount: '',
  vatRate: 20,
  appliesToRecurring: true,
  maxUses: 1,
  validUntil: '',
  status: 'active',
  note: '',
};

function KodForm({ baslangic = BOŞ_FORM, onKaydet, onIptal, s }) {
  const [form, setForm] = useState(baslangic);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const hesapla = () => {
    const net = parseFloat(form.monthlyNetAmount) || 0;
    const kdv = Math.round(net * form.vatRate) / 100;
    return { kdv, brut: net + kdv };
  };
  const { kdv, brut } = hesapla();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Kod *</div>
          <Input
            value={form.code}
            onChange={e => set('code', e.target.value.toUpperCase())}
            placeholder="NEHIR-OZEL"
            style={{ width: '100%' }}
            disabled={!!baslangic.code}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Öğrenci Adı</div>
          <Input
            value={form.studentName}
            onChange={e => set('studentName', e.target.value)}
            placeholder="Nehir"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>
            E-posta (zorunlu eşleşme)
          </div>
          <Input
            value={form.allowedEmail}
            onChange={e => set('allowedEmail', e.target.value.toLowerCase())}
            placeholder="nehir@example.com"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>
            Telefon (zorunlu eşleşme)
          </div>
          <Input
            value={form.allowedPhone}
            onChange={e => set('allowedPhone', e.target.value)}
            placeholder="05xxxxxxxxx"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>
            Aylık Net Fiyat (TL) *
          </div>
          <Input
            type="number"
            value={form.monthlyNetAmount}
            onChange={e => set('monthlyNetAmount', e.target.value)}
            placeholder="3000"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>KDV Oranı (%)</div>
          <Input
            type="number"
            value={form.vatRate}
            onChange={e => set('vatRate', parseFloat(e.target.value) || 0)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Son Kullanma Tarihi</div>
          <Input
            type="date"
            value={form.validUntil}
            onChange={e => set('validUntil', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Maks. Kullanım</div>
          <Input
            type="number"
            value={form.maxUses}
            onChange={e => set('maxUses', parseInt(e.target.value, 10) || 1)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <label
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            cursor: 'pointer',
            color: s.text,
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            checked={form.appliesToRecurring}
            onChange={e => set('appliesToRecurring', e.target.checked)}
          />
          Her ay aynı fiyat (sürekli indirim)
        </label>
        <label
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            cursor: 'pointer',
            color: s.text,
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            checked={form.status === 'active'}
            onChange={e => set('status', e.target.checked ? 'active' : 'inactive')}
          />
          Aktif
        </label>
      </div>

      <div>
        <div style={{ fontSize: 12, color: s.text2, marginBottom: 4 }}>Not</div>
        <Input
          value={form.note}
          onChange={e => set('note', e.target.value)}
          placeholder="İç not..."
          style={{ width: '100%' }}
        />
      </div>

      {form.monthlyNetAmount && (
        <div
          style={{
            background: s.surface2,
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            color: s.text2,
          }}
        >
          KDV ({form.vatRate}%):{' '}
          <strong style={{ color: s.text }}>{kdv.toLocaleString('tr-TR')} TL</strong>
          &nbsp;→&nbsp; KDV Dahil:{' '}
          <strong style={{ color: s.accent }}>{brut.toLocaleString('tr-TR')} TL</strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onIptal}>
          İptal
        </Btn>
        <Btn
          onClick={() =>
            onKaydet({
              ...form,
              monthlyNetAmount: parseFloat(form.monthlyNetAmount) || 0,
              grossAmount: brut,
            })
          }
        >
          Kaydet
        </Btn>
      </div>
    </div>
  );
}

export default function KodYonetimi({ s, mobil }) {
  const toast = useToast();
  const [kodlar, setKodlar] = useState([]);
  const [yukleniyor, setYukl] = useState(true);
  const [formAcik, setFormAcik] = useState(false);
  const [duzenle, setDuzenle] = useState(null);

  const yukle = useCallback(async () => {
    setYukl(true);
    try {
      const snap = await getDocs(collection(db, 'discountCodes'));
      setKodlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setYukl(false);
    }
  }, []);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const kaydet = async form => {
    if (!form.code) {
      toast('Kod zorunlu.', 'error');
      return;
    }
    if (!form.allowedEmail && !form.allowedPhone) {
      toast('E-posta veya telefon zorunlu.', 'error');
      return;
    }
    if (!form.monthlyNetAmount) {
      toast('Aylık net fiyat zorunlu.', 'error');
      return;
    }
    try {
      const net = parseFloat(form.monthlyNetAmount) || 0;
      const kdv = Math.round(net * (form.vatRate ?? 20)) / 100;
      const data = {
        ...form,
        type: form.appliesToRecurring ? 'surekli' : 'ilk_ay',
        monthlyGrossAmount: net + kdv,
        usedCount: duzenle?.usedCount ?? 0,
        updatedAt: serverTimestamp(),
      };
      if (!duzenle) data.olusturma = serverTimestamp();
      if (form.validUntil)
        data.validUntil = Timestamp.fromDate(new Date(form.validUntil + 'T23:59:59'));

      if (duzenle) {
        await updateDoc(doc(db, 'discountCodes', form.code), data);
      } else {
        await setDoc(doc(db, 'discountCodes', form.code), data);
      }
      toast('Kod kaydedildi.');
      setFormAcik(false);
      setDuzenle(null);
      yukle();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const pasifYap = async kod => {
    await updateDoc(doc(db, 'discountCodes', kod.id), {
      status: 'inactive',
      updatedAt: serverTimestamp(),
    });
    toast('Kod pasife alındı.');
    yukle();
  };

  const aktifYap = async kod => {
    await updateDoc(doc(db, 'discountCodes', kod.id), {
      status: 'active',
      updatedAt: serverTimestamp(),
    });
    toast('Kod aktife alındı.');
    yukle();
  };

  if (yukleniyor) return <div style={{ padding: 32, color: s.text2 }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: mobil ? 16 : 28 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: s.text }}>İndirim Kodları</div>
        {!formAcik && (
          <Btn
            onClick={() => {
              setDuzenle(null);
              setFormAcik(true);
            }}
          >
            + Yeni Kod
          </Btn>
        )}
      </div>

      {formAcik && (
        <Card style={{ marginBottom: 20, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 16 }}>
            {duzenle ? 'Kodu Düzenle' : 'Yeni Kod Oluştur'}
          </div>
          <KodForm
            baslangic={duzenle || BOŞ_FORM}
            onKaydet={kaydet}
            onIptal={() => {
              setFormAcik(false);
              setDuzenle(null);
            }}
            s={s}
          />
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {kodlar.length === 0 && (
          <div style={{ color: s.text2, textAlign: 'center', padding: 40 }}>Henüz kod yok.</div>
        )}
        {kodlar.map(k => (
          <Card key={k.id} style={{ padding: '14px 18px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: s.text,
                      fontFamily: 'monospace',
                    }}
                  >
                    {k.code}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: k.status === 'active' ? '#d1fae5' : '#fee2e2',
                      color: k.status === 'active' ? '#065f46' : '#991b1b',
                    }}
                  >
                    {k.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                  {k.appliesToRecurring && (
                    <span style={{ fontSize: 11, color: s.text2 }}>sürekli</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: s.text2 }}>
                  {k.studentName && <span>{k.studentName} · </span>}
                  {k.allowedEmail && <span>{k.allowedEmail} · </span>}
                  Net:{' '}
                  <strong style={{ color: s.text }}>
                    {(k.monthlyNetAmount || 0).toLocaleString('tr-TR')} TL
                  </strong>{' '}
                  (KDV {k.vatRate}% →{' '}
                  <strong style={{ color: s.accent }}>
                    {(k.monthlyGrossAmount || k.grossAmount || 0).toLocaleString('tr-TR')} TL
                  </strong>
                  )
                </div>
                <div style={{ fontSize: 12, color: s.text2, marginTop: 4 }}>
                  Kullanım: {k.usedCount ?? 0}/{k.maxUses}
                  {k.note && <span> · {k.note}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn
                  variant="ghost"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => {
                    setDuzenle(k);
                    setFormAcik(true);
                  }}
                >
                  Düzenle
                </Btn>
                {k.status === 'active' ? (
                  <Btn
                    variant="ghost"
                    style={{ fontSize: 12, padding: '4px 10px', color: '#dc2626' }}
                    onClick={() => pasifYap(k)}
                  >
                    Pasife Al
                  </Btn>
                ) : (
                  <Btn
                    variant="ghost"
                    style={{ fontSize: 12, padding: '4px 10px', color: '#10B981' }}
                    onClick={() => aktifYap(k)}
                  >
                    Aktife Al
                  </Btn>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
