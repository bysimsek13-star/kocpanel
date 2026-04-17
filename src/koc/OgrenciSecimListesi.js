import React from 'react';
import PropTypes from 'prop-types';
import { Avatar } from '../components/Shared';
import { renkler } from '../data/konular';

export default function OgrenciSecimListesi({ ogrenciler, seciliIdler, onToggle, onTumunuSec, s }) {
  const tumunuSecildi = ogrenciler.length > 0 && ogrenciler.every(o => seciliIdler.has(o.id));

  return (
    <div style={{ border: `1px solid ${s.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div
        onClick={() => onTumunuSec(!tumunuSecildi)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          cursor: 'pointer',
          background: s.surface2,
          borderBottom: `1px solid ${s.border}`,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            flexShrink: 0,
            border: `2px solid ${tumunuSecildi ? s.accent : s.border}`,
            background: tumunuSecildi ? s.accent : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {tumunuSecildi && (
            <div
              style={{
                width: 8,
                height: 6,
                borderBottom: '2px solid #fff',
                borderLeft: '2px solid #fff',
                transform: 'rotate(-45deg) translate(1px,-1px)',
              }}
            />
          )}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: s.text2 }}>
          Tümünü seç ({ogrenciler.length})
        </span>
      </div>

      <div style={{ maxHeight: 260, overflowY: 'auto' }}>
        {ogrenciler.map((o, i) => {
          const secili = seciliIdler.has(o.id);
          return (
            <div
              key={o.id}
              onClick={() => onToggle(o.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: i < ogrenciler.length - 1 ? `1px solid ${s.border}` : 'none',
                background: secili ? s.accentSoft : 'transparent',
                transition: 'background .12s',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  flexShrink: 0,
                  border: `2px solid ${secili ? s.accent : s.border}`,
                  background: secili ? s.accent : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {secili && (
                  <div
                    style={{
                      width: 8,
                      height: 6,
                      borderBottom: '2px solid #fff',
                      borderLeft: '2px solid #fff',
                      transform: 'rotate(-45deg) translate(1px,-1px)',
                    }}
                  />
                )}
              </div>
              <Avatar isim={o.isim} renk={renkler[i % renkler.length]} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: secili ? s.accent : s.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {o.isim}
                </div>
                {o.tur && <div style={{ fontSize: 11, color: s.text3 }}>{o.tur}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

OgrenciSecimListesi.propTypes = {
  ogrenciler: PropTypes.arrayOf(PropTypes.object).isRequired,
  seciliIdler: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
  onTumunuSec: PropTypes.func.isRequired,
  s: PropTypes.object.isRequired,
};
