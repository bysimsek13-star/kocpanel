import React from 'react';
import { Btn } from './Shared';
import { isUnread } from '../utils/readState';
import { tipCfg } from './bildirimUtils';

export function BildirimItem({
  b,
  isAdmin,
  islemYapiliyor,
  tamamlananlar,
  bildirimSil,
  bildirimeTikla,
  silmeTalebiniIsle,
  zamanFark,
  s,
}) {
  const cfg = tipCfg(b.tip);
  const unread = isUnread(b);

  return (
    <div
      style={{
        borderBottom: `1px solid ${s.border}`,
        background: unread ? `${s.accent}08` : 'transparent',
        borderLeft: `3px solid ${unread ? cfg.renk : 'transparent'}`,
        transition: 'background 0.15s',
      }}
    >
      <div
        onClick={() => b.tip !== 'silme_talebi' && bildirimeTikla(b)}
        style={{
          padding: '12px 14px 12px 13px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          cursor: b.tip !== 'silme_talebi' ? 'pointer' : 'default',
        }}
      >
        <span
          style={{
            fontSize: 16,
            flexShrink: 0,
            marginTop: 1,
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: `${cfg.renk}18`,
          }}
        >
          {cfg.ikon}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ fontSize: 13, fontWeight: unread ? 600 : 400, color: s.text, marginBottom: 2 }}
          >
            {b.baslik}
          </div>
          <div style={{ fontSize: 12, color: s.text2, lineHeight: 1.4, marginBottom: 3 }}>
            {b.mesaj}
          </div>
          <div style={{ fontSize: 10, color: s.text3 }}>{zamanFark(b.olusturma)}</div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
            flexShrink: 0,
          }}
        >
          {unread && (
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: cfg.renk,
                marginTop: 4,
              }}
            />
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              bildirimSil(b.id);
            }}
            title="Sil"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: s.text3,
              fontSize: 13,
              padding: '2px 4px',
              lineHeight: 1,
              opacity: 0.5,
              borderRadius: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          >
            ✕
          </button>
        </div>
      </div>

      {b.tip === 'silme_talebi' && isAdmin && !tamamlananlar.has(b.id) && (
        <div style={{ display: 'flex', gap: 8, padding: '0 14px 12px 53px' }}>
          <Btn
            onClick={() => silmeTalebiniIsle(b, 'reddet')}
            variant="outline"
            disabled={!!islemYapiliyor}
            style={{ fontSize: 11, padding: '5px 12px', flex: 1 }}
          >
            {islemYapiliyor === b.id + 'reddet' ? '...' : 'Reddet'}
          </Btn>
          <Btn
            onClick={() => silmeTalebiniIsle(b, 'onayla')}
            variant="danger"
            disabled={!!islemYapiliyor}
            style={{ fontSize: 11, padding: '5px 12px', flex: 1 }}
          >
            {islemYapiliyor === b.id + 'onayla' ? '...' : 'Onayla & Sil'}
          </Btn>
        </div>
      )}
    </div>
  );
}
