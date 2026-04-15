import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Btn, Card, LoadingState, EmptyState } from '../components/Shared';
import { haftaBaslangici, GUNLER, GUN_ETIKET, haftaIlerlemeV2 } from '../utils/programAlgoritma';

export default function VeliProgram({ ogrenciId, onGeri }) {
  const { s } = useTheme();
  const [programDoc, setProgramDoc] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!ogrenciId) return;
    const haftaKey = haftaBaslangici();
    getDoc(doc(db, 'ogrenciler', ogrenciId, 'program_v2', haftaKey))
      .then(snap => {
        setProgramDoc(snap.exists() ? snap.data() : null);
        setYukleniyor(false);
      })
      .catch(() => setYukleniyor(false));
  }, [ogrenciId]);

  const ilerleme = programDoc ? haftaIlerlemeV2(programDoc) : 0;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Btn onClick={onGeri} variant="outline" style={{ padding: '8px 16px' }}>
          ← Geri
        </Btn>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: s.text, margin: 0 }}>
          📅 Haftalık Program
        </h2>
        {programDoc && (
          <div
            style={{
              marginLeft: 'auto',
              fontSize: 18,
              fontWeight: 700,
              color: ilerleme >= 80 ? '#10B981' : ilerleme >= 50 ? '#F59E0B' : '#F43F5E',
            }}
          >
            %{ilerleme}
          </div>
        )}
      </div>
      {yukleniyor ? (
        <LoadingState />
      ) : !programDoc ? (
        <EmptyState mesaj="Bu hafta henüz program oluşturulmamış" icon="📅" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GUNLER.map(gun => {
            const slotlar = (programDoc.hafta?.[gun] || []).filter(s => s?.tip);
            const tam = slotlar.filter((_, i) => programDoc.tamamlandi?.[`${gun}_${i}`]).length;
            return (
              <Card key={gun} style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: s.text }}>
                    {GUN_ETIKET[gun]}
                  </div>
                  <div style={{ fontSize: 12, color: s.text3 }}>
                    {tam}/{slotlar.length}
                  </div>
                </div>
                {slotlar.length === 0 ? (
                  <div style={{ fontSize: 12, color: s.text3 }}>Görev yok</div>
                ) : (
                  slotlar.map((slot, i) => {
                    const tamamlandi = programDoc.tamamlandi?.[`${gun}_${i}`] || false;
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 0',
                          borderBottom: `1px solid ${s.border}`,
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            background: tamamlandi ? '#10B981' : s.surface2,
                            flexShrink: 0,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 12,
                            color: tamamlandi ? s.text3 : s.text,
                            textDecoration: tamamlandi ? 'line-through' : 'none',
                          }}
                        >
                          {slot.icerik || slot.baslik || slot.tip}
                        </div>
                        <div style={{ fontSize: 11, color: s.text3, marginLeft: 'auto' }}>
                          {slot.ders}
                        </div>
                      </div>
                    );
                  })
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
