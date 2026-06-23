import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Btn } from '../../components/Shared';
import LeadDetayGorusmeler from './LeadDetayGorusmeler';
import LeadDetayGorevler from './LeadDetayGorevler';
import LeadDetayHeader from './LeadDetayHeader';

const SEKMELER = [
  { key: 'gorusmeler', label: '💬 Görüşmeler' },
  { key: 'gorevler', label: '☑️ Görevler' },
];

export default function LeadDetay({
  lead,
  onKapat,
  onKademeGuncelle,
  onDurumGuncelle,
  onLeadGuncelle,
  onLeadSil,
  onGorusmeEkle,
  onGorevEkle,
  onGorevTamamla,
  onOgrenciyeDonustur,
  sorumlular,
  s,
}) {
  const [aktifSekme, setAktifSekme] = useState('gorusmeler');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
      onClick={onKapat}
    >
      <div
        style={{
          background: s.bg,
          borderRadius: 18,
          width: '100%',
          maxWidth: 640,
          marginTop: 40,
          marginBottom: 40,
          border: `1px solid ${s.border}`,
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <LeadDetayHeader
          lead={lead}
          onKapat={onKapat}
          onKademeGuncelle={onKademeGuncelle}
          onDurumGuncelle={onDurumGuncelle}
          onLeadGuncelle={onLeadGuncelle}
          onLeadSil={onLeadSil}
          sorumlular={sorumlular}
          s={s}
        />

        <div
          style={{
            display: 'flex',
            background: s.surface,
            borderBottom: `1px solid ${s.border}`,
          }}
        >
          {SEKMELER.map(sk => (
            <button
              key={sk.key}
              onClick={() => setAktifSekme(sk.key)}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: aktifSekme === sk.key ? 700 : 400,
                color: aktifSekme === sk.key ? s.accent : s.text2,
                borderBottom:
                  aktifSekme === sk.key ? `2px solid ${s.accent}` : '2px solid transparent',
              }}
            >
              {sk.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px' }}>
          {aktifSekme === 'gorusmeler' && (
            <LeadDetayGorusmeler leadId={lead.id} onGorusmeEkle={onGorusmeEkle} s={s} />
          )}
          {aktifSekme === 'gorevler' && (
            <LeadDetayGorevler
              leadId={lead.id}
              onGorevEkle={onGorevEkle}
              onGorevTamamla={onGorevTamamla}
              sorumlular={sorumlular}
              s={s}
            />
          )}
        </div>

        {lead.kademe === 'Kazanıldı' && !lead.ogrenciyeDonusturuldu && (
          <div style={{ padding: '0 24px 24px' }}>
            <Btn
              onClick={() => onOgrenciyeDonustur(lead)}
              style={{
                width: '100%',
                background: '#16a34a',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              🎓 Öğrenciye Dönüştür
            </Btn>
          </div>
        )}
        {lead.ogrenciyeDonusturuldu && (
          <div
            style={{
              padding: '0 24px 20px',
              textAlign: 'center',
              fontSize: 12,
              color: '#22c55e',
            }}
          >
            ✅ Bu lead öğrenciye dönüştürüldü
          </div>
        )}
      </div>
    </div>
  );
}

LeadDetay.propTypes = {
  lead: PropTypes.object.isRequired,
  onKapat: PropTypes.func.isRequired,
  onKademeGuncelle: PropTypes.func.isRequired,
  onDurumGuncelle: PropTypes.func.isRequired,
  onLeadGuncelle: PropTypes.func.isRequired,
  onLeadSil: PropTypes.func.isRequired,
  onGorusmeEkle: PropTypes.func.isRequired,
  onGorevEkle: PropTypes.func.isRequired,
  onGorevTamamla: PropTypes.func.isRequired,
  onOgrenciyeDonustur: PropTypes.func.isRequired,
  sorumlular: PropTypes.array.isRequired,
  s: PropTypes.object.isRequired,
};
