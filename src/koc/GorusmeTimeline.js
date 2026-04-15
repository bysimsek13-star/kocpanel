import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Card, LoadingState, EmptyState } from '../components/Shared';
import { gorusmeTimelineOlustur, formatDateShort } from '../utils/timelineUtils';

export default function GorusmeTimeline({ ogrenciId }) {
  const { s } = useTheme();
  const [kayitlar, setKayitlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let aktif = true;
    getDocs(collection(db, 'ogrenciler', ogrenciId, 'notlar'))
      .then(snap => {
        if (!aktif) return;
        setKayitlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      })
      .catch(() => {
        if (aktif) setKayitlar([]);
      })
      .finally(() => {
        if (aktif) setYukleniyor(false);
      });
    return () => {
      aktif = false;
    };
  }, [ogrenciId]);

  const timeline = useMemo(() => gorusmeTimelineOlustur(kayitlar), [kayitlar]);

  if (yukleniyor)
    return (
      <Card style={{ padding: 20 }}>
        <LoadingState mesaj="Görüşmeler yükleniyor..." />
      </Card>
    );

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 16 }}>
        🗓 Görüşme Timeline
      </div>
      {timeline.length === 0 ? (
        <EmptyState mesaj="Henüz görüşme kaydı yok" icon="🗣" />
      ) : (
        <div style={{ position: 'relative', paddingLeft: 14 }}>
          <div
            style={{
              position: 'absolute',
              top: 6,
              bottom: 6,
              left: 5,
              width: 2,
              background: s.border,
            }}
          />
          {timeline.map((item, index) => (
            <div
              key={item.id || index}
              style={{ position: 'relative', paddingLeft: 18, paddingBottom: 16 }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: -1,
                  top: 4,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#06B6D4',
                  border: `2px solid ${s.surface}`,
                }}
              />
              <div
                style={{
                  background: s.surface2,
                  border: `1px solid ${s.border}`,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>🗣 Görüşme</div>
                  <div style={{ fontSize: 12, color: '#06B6D4', fontWeight: 600 }}>
                    {item.tarih ? formatDateShort(item.tarih) : formatDateShort(item.olusturma)}
                    {item.suredk ? ` · ${item.suredk} dk` : ''}
                  </div>
                </div>
                {item.konular && (
                  <div style={{ fontSize: 13, color: s.text, marginBottom: 6, lineHeight: 1.6 }}>
                    <strong style={{ color: s.text2 }}>Konular:</strong> {item.konular}
                  </div>
                )}
                {item.odevler && (
                  <div style={{ fontSize: 13, color: s.text, marginBottom: 6, lineHeight: 1.6 }}>
                    <strong style={{ color: s.text2 }}>Ödevler:</strong> {item.odevler}
                  </div>
                )}
                {item.sonrakiKontrol && (
                  <div style={{ fontSize: 12, color: s.text3 }}>
                    📍 Sonraki kontrol: {item.sonrakiKontrol}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

GorusmeTimeline.propTypes = {
  ogrenciId: PropTypes.string.isRequired,
};
