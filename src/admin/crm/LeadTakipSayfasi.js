import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { LoadingState, EmptyState, Btn } from '../../components/Shared';
import { useToast } from '../../components/Toast';
import useCrm from './useCrm';
import useTumGorevler from './useTumGorevler';
import CrmDashboard from './CrmDashboard';
import LeadKarti from './LeadKarti';
import LeadEkleModal from './LeadEkleModal';
import LeadDetay from './LeadDetay';
import { KADEMELER, KAYNAKLAR, DURUMLAR, KOMISYONLU_KAYNAKLAR } from './crmSabitleri';
import { giderEkle } from '../mali/useMaliVeri';

const TABS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'liste', label: '📋 Lead Listesi' },
  { key: 'gorevler', label: '☑️ Görevler' },
];

const DURUM_RENK = {
  gecikmiş: '#ef4444',
  bugün: '#f97316',
  yaklaşan: '#eab308',
  normal: '#6b7280',
};

function gorevDurum(tarih) {
  const d = tarih?.toDate?.() || (tarih ? new Date(tarih) : null);
  if (!d) return 'normal';
  const simdi = new Date();
  simdi.setHours(0, 0, 0, 0);
  const hedef = new Date(d);
  hedef.setHours(0, 0, 0, 0);
  const fark = Math.floor((hedef - simdi) / 86400000);
  if (fark < 0) return 'gecikmiş';
  if (fark === 0) return 'bugün';
  if (fark <= 3) return 'yaklaşan';
  return 'normal';
}

const selSt = s => ({
  padding: '7px 10px',
  background: s.surface2,
  border: `1px solid ${s.border}`,
  borderRadius: 8,
  color: s.text,
  fontSize: 12,
});

export default function LeadTakipSayfasi({ s, mobil, crmKullanicilari, ogrenciEkleAcik_Ac }) {
  const toast = useToast();
  const {
    leads,
    yukleniyor,
    leadEkle,
    leadGuncelle,
    leadSil,
    gorusmeEkle,
    gorevEkle,
    gorevTamamla,
  } = useCrm();
  const { gorevler: tumGorevler } = useTumGorevler();

  const [aktifTab, setAktifTab] = useState('dashboard');
  const [seciliLead, setSeciliLead] = useState(null);
  const [leadEkleAcik, setLeadEkleAcik] = useState(false);
  const [filtreler, setFiltreler] = useState({
    sorumlu: '',
    kademe: '',
    durum: '',
    kaynak: '',
    arama: '',
  });

  const sorumlular = useMemo(
    () =>
      crmKullanicilari.map(k => ({ id: k.id, label: k.isim || k.email?.split('@')[0] || k.id })),
    [crmKullanicilari]
  );

  const filtreliLeads = useMemo(() => {
    let liste = leads;
    if (filtreler.arama)
      liste = liste.filter(l =>
        [l.adSoyad, l.telefon, l.email]
          .filter(Boolean)
          .some(v => v.toLowerCase().includes(filtreler.arama.toLowerCase()))
      );
    if (filtreler.sorumlu) liste = liste.filter(l => l.sorumlu === filtreler.sorumlu);
    if (filtreler.kademe) liste = liste.filter(l => l.kademe === filtreler.kademe);
    if (filtreler.durum) liste = liste.filter(l => l.durum === filtreler.durum);
    if (filtreler.kaynak) liste = liste.filter(l => l.kaynak === filtreler.kaynak);
    return liste;
  }, [leads, filtreler]);

  const bugunGorevler = useMemo(() => {
    const bugunStr = new Date().toDateString();
    return tumGorevler.filter(g => {
      const d = g.tarih?.toDate?.() || (g.tarih ? new Date(g.tarih) : null);
      return d && d.toDateString() === bugunStr;
    });
  }, [tumGorevler]);

  const setFilt = (key, val) => setFiltreler(prev => ({ ...prev, [key]: val }));
  const seciliLeadGuncel = seciliLead
    ? leads.find(l => l.id === seciliLead.id) || seciliLead
    : null;

  const handleLeadEkle = async data => {
    const { armutUcreti, ...leadData } = data;
    await leadEkle(leadData);
    if (KOMISYONLU_KAYNAKLAR[leadData.kaynak] && Number(armutUcreti) > 0) {
      await giderEkle({
        kategori: 'Reklam',
        tutar: Number(armutUcreti),
        aciklama: `Armut lead komisyonu — ${leadData.adSoyad}`,
        tarih: new Date().toISOString().slice(0, 10),
        tekrarlayan: false,
      }).catch(() => {});
    }
    toast('Lead eklendi.');
  };

  const handleOgrenciyeDonustur = async lead => {
    await leadGuncelle(lead.id, { ogrenciyeDonusturuldu: true });
    setSeciliLead(null);
    ogrenciEkleAcik_Ac();
    toast(`Öğrenci ekleme formu açıldı — Lead: ${lead.adSoyad}`);
  };

  const handleGorevTamamla = async (leadId, gorevId) => {
    await gorevTamamla(leadId, gorevId);
    toast('Görev tamamlandı.');
  };

  if (yukleniyor) return <LoadingState mesaj="Lead'ler yükleniyor..." />;

  return (
    <div style={{ padding: mobil ? '12px 12px 80px' : '24px 28px' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          background: s.surface,
          borderRadius: 12,
          padding: 4,
          border: `1px solid ${s.border}`,
        }}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setAktifTab(t.key)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: aktifTab === t.key ? s.accent : 'transparent',
              color: aktifTab === t.key ? '#fff' : s.text2,
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aktifTab === 'dashboard' && (
        <CrmDashboard leads={leads} bugunGorevler={bugunGorevler} s={s} />
      )}

      {aktifTab === 'liste' && (
        <div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <input
              placeholder="🔍 Ara..."
              value={filtreler.arama}
              onChange={e => setFilt('arama', e.target.value)}
              style={{ ...selSt(s), flex: '1 1 160px', minWidth: 140 }}
            />
            <select
              value={filtreler.kademe}
              onChange={e => setFilt('kademe', e.target.value)}
              style={selSt(s)}
            >
              <option value="">Tüm Kademeler</option>
              {KADEMELER.map(k => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <select
              value={filtreler.durum}
              onChange={e => setFilt('durum', e.target.value)}
              style={selSt(s)}
            >
              <option value="">Tüm Durumlar</option>
              {DURUMLAR.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={filtreler.sorumlu}
              onChange={e => setFilt('sorumlu', e.target.value)}
              style={selSt(s)}
            >
              <option value="">Tüm Sorumlular</option>
              {sorumlular.map(sr => (
                <option key={sr.id} value={sr.label}>
                  {sr.label}
                </option>
              ))}
            </select>
            <select
              value={filtreler.kaynak}
              onChange={e => setFilt('kaynak', e.target.value)}
              style={selSt(s)}
            >
              <option value="">Tüm Kaynaklar</option>
              {KAYNAKLAR.map(k => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <Btn
              onClick={() => setLeadEkleAcik(true)}
              style={{ padding: '7px 16px', fontSize: 13 }}
            >
              + Yeni Lead
            </Btn>
          </div>

          {filtreliLeads.length === 0 ? (
            <EmptyState mesaj="Lead bulunamadı" icon="🎯" />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: mobil ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 12,
              }}
            >
              {filtreliLeads.map(lead => (
                <LeadKarti key={lead.id} lead={lead} onDetay={() => setSeciliLead(lead)} s={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {aktifTab === 'gorevler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tumGorevler.length === 0 ? (
            <EmptyState mesaj="Bekleyen görev yok" icon="✅" />
          ) : (
            tumGorevler.map(g => {
              const durum = gorevDurum(g.tarih);
              const renk = DURUM_RENK[durum];
              const tarihD = g.tarih?.toDate?.() || (g.tarih ? new Date(g.tarih) : null);
              return (
                <div
                  key={g.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: s.surface,
                    borderRadius: 10,
                    padding: '10px 14px',
                    border: `1px solid ${s.border}`,
                    borderLeft: `3px solid ${renk}`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{g.baslik}</div>
                    <div style={{ fontSize: 11, color: s.text2 }}>{g.leadAdi}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {g.sorumlu && <div style={{ fontSize: 11, color: s.accent }}>@{g.sorumlu}</div>}
                    {tarihD && (
                      <div style={{ fontSize: 11, color: renk, fontWeight: 600 }}>
                        {durum === 'gecikmiş' ? '⚠️ ' : durum === 'bugün' ? '🔔 ' : ''}
                        {tarihD.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={!!g.tamamlandi}
                    onChange={() => !g.tamamlandi && handleGorevTamamla(g.leadId, g.id)}
                    style={{ accentColor: renk, width: 15, height: 15, cursor: 'pointer' }}
                  />
                </div>
              );
            })
          )}
        </div>
      )}

      {leadEkleAcik && (
        <LeadEkleModal
          onKaydet={handleLeadEkle}
          onKapat={() => setLeadEkleAcik(false)}
          sorumlular={sorumlular}
          s={s}
        />
      )}

      {seciliLeadGuncel && (
        <LeadDetay
          lead={seciliLeadGuncel}
          onKapat={() => setSeciliLead(null)}
          onKademeGuncelle={kademe => leadGuncelle(seciliLeadGuncel.id, { kademe })}
          onDurumGuncelle={durum => leadGuncelle(seciliLeadGuncel.id, { durum })}
          onLeadGuncelle={data => leadGuncelle(seciliLeadGuncel.id, data)}
          onLeadSil={async () => {
            await leadSil(seciliLeadGuncel.id);
            setSeciliLead(null);
          }}
          onGorusmeEkle={data => gorusmeEkle(seciliLeadGuncel.id, data)}
          onGorevEkle={data => gorevEkle(seciliLeadGuncel.id, seciliLeadGuncel.adSoyad, data)}
          onGorevTamamla={gorevId => gorevTamamla(seciliLeadGuncel.id, gorevId)}
          onOgrenciyeDonustur={handleOgrenciyeDonustur}
          sorumlular={sorumlular}
          s={s}
        />
      )}
    </div>
  );
}

LeadTakipSayfasi.propTypes = {
  s: PropTypes.object.isRequired,
  mobil: PropTypes.bool,
  crmKullanicilari: PropTypes.array.isRequired,
  ogrenciEkleAcik_Ac: PropTypes.func.isRequired,
};
