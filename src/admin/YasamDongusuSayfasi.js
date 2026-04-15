import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../components/Toast';
import { Card, Avatar, Btn, LoadingState, EmptyState, ConfirmDialog } from '../components/Shared';
import { auditLog, AuditTip } from '../utils/auditLog';
import { getCallable, hataMesajiVer } from './adminHelpers';
import SilmeTalepleri from './SilmeTalepleri';

export default function YasamDongusuSayfasi({ s, mobil, kullanici }) {
  const toast = useToast();
  const [kullanicilar, setKullanicilar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtre, setFiltre] = useState('hepsi');
  const [onay, setOnay] = useState(null);
  const [silOnay, setSilOnay] = useState(null);

  const getir = useCallback(async () => {
    setYukleniyor(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'kullanicilar'), orderBy('olusturma', 'desc'), limit(500))
      );
      setKullanicilar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
    }
    setYukleniyor(false);
  }, [toast]);

  useEffect(() => {
    getir();
  }, [getir]);

  const filtreli = useMemo(() => {
    if (filtre === 'aktif') return kullanicilar.filter(k => k.aktif !== false);
    if (filtre === 'pasif') return kullanicilar.filter(k => k.aktif === false);
    return kullanicilar;
  }, [filtre, kullanicilar]);

  const durumDegistir = async () => {
    if (!onay) return;
    try {
      await getCallable(onay.yeniDurum ? 'kullaniciAktiveEt' : 'kullaniciPasifYap')({
        uid: onay.uid,
      });
      await auditLog({
        kim: kullanici?.uid,
        kimIsim: 'Admin',
        ne: onay.yeniDurum ? AuditTip.KULLANICI_AKTIFE_AL : AuditTip.KULLANICI_PASIFE_AL,
        kimi: onay.uid,
        kimiIsim: onay.isim || onay.email,
        detay: { rol: onay.rol },
      }).catch(() => {});
      toast(onay.yeniDurum ? 'Kullanıcı aktive edildi.' : 'Kullanıcı pasife alındı.');
      setOnay(null);
      getir();
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
    }
  };

  const ogrenciSilIslem = async () => {
    if (!silOnay) return;
    try {
      await getCallable('kullaniciSil')({ uid: silOnay.uid, onay: 'SIL' });
      await auditLog({
        kim: kullanici?.uid,
        kimIsim: 'Admin',
        ne: AuditTip.KULLANICI_SIL,
        kimi: silOnay.uid,
        kimiIsim: silOnay.isim || silOnay.email,
        detay: { rol: silOnay.rol },
      }).catch(() => {});
      toast('Öğrenci silindi.');
      setSilOnay(null);
      getir();
    } catch (e) {
      toast(hataMesajiVer(e), 'error');
    }
  };

  return (
    <div style={{ padding: mobil ? 16 : 28, maxWidth: 980 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: s.text, fontSize: 20, fontWeight: 700, margin: 0 }}>
          🔄 Kullanıcı Yaşam Döngüsü
        </h2>
        <div style={{ color: s.text2, fontSize: 13, marginTop: 4 }}>
          Aktif / pasif hesap yönetimi
        </div>
      </div>
      <SilmeTalepleri s={s} kullanici={kullanici} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['hepsi', 'aktif', 'pasif'].map(k => (
          <div
            key={k}
            onClick={() => setFiltre(k)}
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              background: filtre === k ? s.accentSoft : s.surface2,
              color: filtre === k ? s.accent : s.text2,
              border: `1px solid ${filtre === k ? s.accent : s.border}`,
            }}
          >
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </div>
        ))}
      </div>

      {yukleniyor ? (
        <LoadingState />
      ) : filtreli.length === 0 ? (
        <EmptyState mesaj="Gösterilecek kullanıcı yok" icon="👥" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtreli.map(k => {
            const aktif = k.aktif !== false;
            return (
              <Card key={k.id} style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <Avatar isim={k.isim || k.email || '?'} boyut={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: s.text, fontWeight: 600, fontSize: 14 }}>
                      {k.isim || '—'}
                    </div>
                    <div style={{ color: s.text2, fontSize: 12 }}>{k.email || '—'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: s.surface2,
                        fontSize: 11,
                        color: s.text2,
                        fontWeight: 700,
                      }}
                    >
                      {k.rol}
                    </div>
                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: aktif ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                        color: aktif ? '#10B981' : '#F43F5E',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {aktif ? 'AKTİF' : 'PASİF'}
                    </div>
                    <Btn
                      onClick={() =>
                        setOnay({
                          uid: k.id,
                          isim: k.isim,
                          email: k.email,
                          rol: k.rol,
                          yeniDurum: !aktif,
                        })
                      }
                      variant="outline"
                      style={{ fontSize: 11, padding: '6px 12px' }}
                    >
                      {aktif ? 'Pasife Al' : 'Aktive Et'}
                    </Btn>
                    {k.rol === 'ogrenci' && (
                      <Btn
                        onClick={() =>
                          setSilOnay({ uid: k.id, isim: k.isim, email: k.email, rol: k.rol })
                        }
                        variant="danger"
                        style={{ fontSize: 11, padding: '6px 12px' }}
                      >
                        Sil
                      </Btn>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {onay && (
        <ConfirmDialog
          baslik={onay.yeniDurum ? 'Kullanıcıyı Aktive Et' : 'Kullanıcıyı Pasife Al'}
          mesaj={`${onay.isim || onay.email} için bu işlemi onaylıyor musunuz?`}
          onEvet={durumDegistir}
          onHayir={() => setOnay(null)}
        />
      )}
      {silOnay && (
        <ConfirmDialog
          baslik="Öğrenciyi Kalıcı Sil"
          mesaj={`${silOnay.isim || silOnay.email} ve tüm verileri kalıcı olarak silinecek. Bu işlem geri alınamaz!`}
          onEvet={ogrenciSilIslem}
          onHayir={() => setSilOnay(null)}
        />
      )}
    </div>
  );
}
