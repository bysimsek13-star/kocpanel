import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import { Card, Btn, EmptyState } from '../components/Shared';
import { buildTaskTemplates, generateSuggestions } from '../utils/ogrenciUtils';
import ProgramaEkleModal from './ProgramaEkleModal';

export default function GorevKutuphane({ ogrenciler = [], dashboardMap = {}, onGeri }) {
  const { s } = useTheme();
  const [seciliId, setSeciliId] = useState(ogrenciler[0]?.id || '');
  const [ekleModal, setEkleModal] = useState(null);
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
