import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { Card, Btn, EmptyState } from '../components/Shared';
import { buildTaskTemplates, generateSuggestions } from '../utils/ogrenciUtils';
import { GUNLER, GUN_ETIKET } from '../utils/programAlgoritma';
import { haftaBasStr } from '../utils/tarih';

// Görev metninden slot tipini tahmin et
function metindenTip(metin) {
  const m = metin.toLowerCase();
  if (m.includes('deneme') || m.includes('test')) return 'deneme';
  if (m.includes('soru') || m.includes('çöz')) return 'soru';
  if (m.includes('tekrar') || m.includes('özet') || m.includes('yanlış')) return 'tekrar';
  if (m.includes('video') || m.includes('izle')) return 'video';
  if (m.includes('konu') || m.includes('anlatım') || m.includes('derin') || m.includes('blok'))
    return 'konu';
  return 'konu';
}

// 'HH:MM' stringine dakika ekle
function saateEkle(saat, dk) {
  const [h, m] = saat.split(':').map(Number);
  const toplam = h * 60 + m + dk;
  return `${String(Math.floor(toplam / 60) % 24).padStart(2, '0')}:${String(toplam % 60).padStart(2, '0')}`;
}

// ─── Programa Ekle Modalı ─────────────────────────────────────────────────────
function ProgramaEkleModal({ sablon, ogrenci, onKapat, s }) {
  const toast = useToast();
  const [gun, setGun] = useState('pazartesi');
  const [baslangic, setBaslangic] = useState('09:00');
  const [slotDk, setSlotDk] = useState(90);
  const [yukleniyor, setYukleniyor] = useState(false);

  const ekle = async () => {
    if (!ogrenci?.id) return;
    setYukleniyor(true);
    try {
      const hafta = haftaBasStr();
      const ref = doc(db, 'ogrenciler', ogrenci.id, 'program_v2', hafta);
      const snap = await getDoc(ref);
      const mevcut = snap.exists() ? snap.data() : { hafta: {}, tamamlandi: {} };
      const mevcutGun = mevcut.hafta?.[gun] || [];

      // Şablonun her task'ini ardışık slot olarak ekle
      let sure = baslangic;
      const yeniSlotlar = sablon.tasks.map(gorev => {
        const bitis = saateEkle(sure, slotDk);
        const slot = {
          tip: metindenTip(gorev),
          ders: '',
          icerik: gorev,
          baslangic: sure,
          bitis,
        };
        sure = bitis;
        return slot;
      });

      const yeniHafta = {
        ...mevcut.hafta,
        [gun]: [...mevcutGun, ...yeniSlotlar],
      };

      await setDoc(ref, { hafta: yeniHafta, tamamlandi: mevcut.tamamlandi || {} }, { merge: true });
      toast(`${sablon.tasks.length} slot ${GUN_ETIKET[gun]} gününe eklendi!`);
      onKapat();
    } catch (e) {
      toast('Eklenemedi: ' + e.message, 'error');
    }
    setYukleniyor(false);
  };

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
          width: 420,
          maxWidth: '95vw',
          boxShadow: s.shadow,
          margin: 16,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: s.text, marginBottom: 4 }}>
          Programa Ekle
        </div>
        <div style={{ fontSize: 13, color: s.text2, marginBottom: 20 }}>{sablon.title}</div>

        {/* Gün seçimi */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>Gün</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GUNLER.map(g => (
              <div
                key={g}
                onClick={() => setGun(g)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: gun === g ? s.accent : s.surface2,
                  color: gun === g ? s.buttonText || '#fff' : s.text2,
                  border: `1px solid ${gun === g ? s.accent : s.border}`,
                }}
              >
                {GUN_ETIKET[g]}
              </div>
            ))}
          </div>
        </div>

        {/* Başlangıç saati */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>
            Başlangıç saati
          </div>
          <input
            type="time"
            value={baslangic}
            onChange={e => setBaslangic(e.target.value)}
            style={{
              width: '100%',
              background: s.surface2,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '10px 12px',
              color: s.text,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Slot süresi */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.text2, marginBottom: 6 }}>
            Her slot süresi
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[45, 60, 90, 120].map(dk => (
              <div
                key={dk}
                onClick={() => setSlotDk(dk)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '7px 0',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: slotDk === dk ? s.accent : s.surface2,
                  color: slotDk === dk ? s.buttonText || '#fff' : s.text2,
                  border: `1px solid ${slotDk === dk ? s.accent : s.border}`,
                }}
              >
                {dk}dk
              </div>
            ))}
          </div>
        </div>

        {/* Ön izleme */}
        <div
          style={{
            marginBottom: 20,
            background: s.surface2,
            borderRadius: 12,
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: s.text3,
              marginBottom: 6,
              textTransform: 'uppercase',
            }}
          >
            {GUN_ETIKET[gun]} — {sablon.tasks.length} slot
          </div>
          {(() => {
            let sure = baslangic;
            return sablon.tasks.map((gorev, i) => {
              const bitis = saateEkle(sure, slotDk);
              const satir = (
                <div key={i} style={{ fontSize: 12, color: s.text2, marginBottom: 2 }}>
                  {sure}–{bitis} · {gorev}
                </div>
              );
              sure = bitis;
              return satir;
            });
          })()}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={onKapat} variant="ghost" style={{ flex: 1 }}>
            İptal
          </Btn>
          <Btn onClick={ekle} disabled={yukleniyor} style={{ flex: 2 }}>
            {yukleniyor ? 'Ekleniyor...' : 'Programa Ekle'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function GorevKutuphane({ ogrenciler = [], dashboardMap = {}, onGeri }) {
  const { s } = useTheme();
  const [seciliId, setSeciliId] = useState(ogrenciler[0]?.id || '');
  const [ekleModal, setEkleModal] = useState(null); // sablon objesi | null
  const secili = ogrenciler.find(o => o.id === seciliId) || ogrenciler[0];
  const templates = useMemo(() => buildTaskTemplates(secili?.tur), [secili?.tur]);
  const suggestions = useMemo(
    () => generateSuggestions({ ogrenci: secili || {}, dashboard: dashboardMap[secili?.id] || {} }),
    [secili, dashboardMap]
  );

  const panoyaKopyala = async tpl => {
    const text =
      tpl.title +
      '\n' +
      tpl.tasks.map((t, i) => `${i + 1}. ${t}`).join('\n') +
      '\nNot: ' +
      tpl.note;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {}
  };

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: s.text, margin: 0 }}>
            Görev Şablonları
          </h2>
          <div style={{ color: s.text2, fontSize: 13, marginTop: 4 }}>
            Hazır planlar + akıllı öneriler
          </div>
        </div>
        <Btn variant="outline" onClick={onGeri}>
          ← Geri
        </Btn>
      </div>
      {ogrenciler.length === 0 ? (
        <EmptyState mesaj="Önce öğrenci ekleyin" icon="👥" />
      ) : (
        <>
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: s.text3, marginBottom: 8 }}>Öğrenci seç</div>
            <select
              value={seciliId}
              onChange={e => setSeciliId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: `1px solid ${s.border}`,
                background: s.surface2,
                color: s.text,
              }}
            >
              {ogrenciler.map(o => (
                <option key={o.id} value={o.id}>
                  {o.isim} · {o.tur}
                </option>
              ))}
            </select>
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: 16 }}>
            <Card style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, color: s.text, marginBottom: 12 }}>
                Akıllı öneriler
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {suggestions.map((sugg, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 14px',
                      background: s.surface2,
                      borderRadius: 12,
                      border: `1px solid ${s.border}`,
                    }}
                  >
                    <div
                      style={{ fontSize: 12, fontWeight: 700, color: s.accent, marginBottom: 4 }}
                    >
                      {sugg.title}
                    </div>
                    <div style={{ fontSize: 12, color: s.text2, lineHeight: 1.5 }}>{sugg.text}</div>
                  </div>
                ))}
              </div>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              {templates.map(tpl => (
                <Card key={tpl.id} style={{ padding: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: s.text }}>
                        {tpl.title}
                      </div>
                      <div style={{ fontSize: 11, color: s.accent, marginTop: 4 }}>{tpl.tag}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <Btn
                        style={{ padding: '6px 12px', fontSize: 11 }}
                        onClick={() => setEkleModal(tpl)}
                      >
                        + Programa Ekle
                      </Btn>
                      <Btn
                        variant="ghost"
                        style={{ padding: '6px 10px', fontSize: 11 }}
                        onClick={() => panoyaKopyala(tpl)}
                      >
                        Kopyala
                      </Btn>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {tpl.tasks.map((task, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 12,
                          color: s.text2,
                          padding: '9px 10px',
                          borderRadius: 10,
                          background: s.surface2,
                        }}
                      >
                        • {task}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: s.text3, marginTop: 10 }}>{tpl.note}</div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {ekleModal && secili && (
        <ProgramaEkleModal
          sablon={ekleModal}
          ogrenci={secili}
          onKapat={() => setEkleModal(null)}
          s={s}
        />
      )}
    </div>
  );
}

GorevKutuphane.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object),
  dashboardMap: PropTypes.object,
  onGeri: PropTypes.func.isRequired,
};
