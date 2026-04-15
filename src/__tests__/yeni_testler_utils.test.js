/**
 * Yeni Testler — Utility & Saf Fonksiyonlar
 * Kapsam: auditLog, adminHelpers, themes, slotTipleri, hedefUtils, izleme, VeliKartlari
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

// ─────────────────────────────────────────────────────────────────────────────
// AuditLog
// ─────────────────────────────────────────────────────────────────────────────
import { AuditTip, auditTipMetin, auditTipIkon, auditLog, auditLogGetir } from '../utils/auditLog';

describe('AuditTip sabitleri', () => {
  it('tüm tipler string olmalı', () => {
    Object.values(AuditTip).forEach(v => expect(typeof v).toBe('string'));
  });
  it('KOC_ATA ve KULLANICI_OLUSTUR değerleri doğru', () => {
    expect(AuditTip.KOC_ATA).toBe('koc_ata');
    expect(AuditTip.KULLANICI_OLUSTUR).toBe('kullanici_olustur');
  });
  it('en az 10 tip tanımlı', () => {
    expect(Object.keys(AuditTip).length).toBeGreaterThanOrEqual(10);
  });
});

describe('auditTipMetin()', () => {
  it('bilinen tipler için Türkçe metin döner', () => {
    expect(auditTipMetin(AuditTip.KOC_ATA)).toBe('Koç atadı');
    expect(auditTipMetin(AuditTip.KULLANICI_SIL)).toBe('Kullanıcı sildi');
    expect(auditTipMetin(AuditTip.ROL_DEGISTIR)).toBe('Rol değiştirdi');
    expect(auditTipMetin(AuditTip.VELI_BAGLA)).toBe('Veli bağladı');
    expect(auditTipMetin(AuditTip.KULLANICI_PASIFE_AL)).toBe('Hesabı pasife aldı');
    expect(auditTipMetin(AuditTip.KULLANICI_AKTIFE_AL)).toBe('Hesabı aktife aldı');
  });
  it('bilinmeyen tip için tipin kendisini döner', () => {
    expect(auditTipMetin('bilinmeyen_tip')).toBe('bilinmeyen_tip');
    expect(auditTipMetin('xyz')).toBe('xyz');
  });
});

describe('auditTipIkon()', () => {
  it('bilinen tipler için emoji döner', () => {
    expect(auditTipIkon(AuditTip.KULLANICI_OLUSTUR)).toBe('➕');
    expect(auditTipIkon(AuditTip.KOC_ATA)).toBe('🔗');
    expect(auditTipIkon(AuditTip.DENEME_EKLE)).toBe('📊');
    expect(auditTipIkon(AuditTip.PROGRAM_GUNCELLE)).toBe('📅');
  });
  it('bilinmeyen tip için varsayılan emoji döner', () => {
    expect(auditTipIkon('yok')).toBe('📝');
  });
});

describe('auditLog()', () => {
  it('Firebase addDoc çağrılır', async () => {
    const { addDoc } = await import('firebase/firestore');
    addDoc.mockClear();
    await auditLog({ kim: 'uid1', ne: AuditTip.KOC_ATA, kimi: 'uid2' });
    expect(addDoc).toHaveBeenCalled();
  });

  it('addDoc hata verse bile fırlatmaz (sessiz hata)', async () => {
    const { addDoc } = await import('firebase/firestore');
    addDoc.mockRejectedValueOnce(new Error('network error'));
    await expect(auditLog({ kim: 'uid1', ne: AuditTip.KOC_ATA })).resolves.toBeUndefined();
  });
});

describe('auditLogGetir()', () => {
  it('getDocs çağrılır ve dizi döner', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });
    const sonuc = await auditLogGetir();
    expect(Array.isArray(sonuc)).toBe(true);
  });

  it('kimUid verilince where filtresi eklenir', async () => {
    const { getDocs, where } = await import('firebase/firestore');
    getDocs.mockResolvedValueOnce({ docs: [] });
    where.mockClear();
    await auditLogGetir(50, 'uid-x');
    expect(where).toHaveBeenCalledWith('kim', '==', 'uid-x');
  });

  it('hata olursa boş dizi döner', async () => {
    const { getDocs } = await import('firebase/firestore');
    getDocs.mockRejectedValueOnce(new Error('firestore error'));
    const sonuc = await auditLogGetir();
    expect(sonuc).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// adminHelpers — saf fonksiyonlar
// ─────────────────────────────────────────────────────────────────────────────
import { hataMesajiVer, kisaTarih, emailGecerliMi } from '../admin/adminHelpers';

describe('hataMesajiVer()', () => {
  it('bilinen Firebase hata kodları için Türkçe mesaj döner', () => {
    expect(hataMesajiVer({ code: 'auth/email-already-in-use' })).toBe(
      'Bu e-posta adresi zaten kullanımda.'
    );
    expect(hataMesajiVer({ code: 'auth/weak-password' })).toBe('Şifre en az 6 karakter olmalı.');
    expect(hataMesajiVer({ code: 'permission-denied' })).toBe(
      'Bu işlemi yapmak için yetkiniz yok.'
    );
    expect(hataMesajiVer({ code: 'functions/not-found' })).toBe('İstenen kayıt bulunamadı.');
    expect(hataMesajiVer({ code: 'functions/already-exists' })).toBe('Bu kayıt zaten mevcut.');
  });
  it('bilinmeyen kod için genel mesaj döner', () => {
    expect(hataMesajiVer({ code: 'bilinmeyen/kod' })).toBe('İşlem tamamlanamadı.');
    expect(hataMesajiVer({})).toBe('İşlem tamamlanamadı.');
    expect(hataMesajiVer(null)).toBe('İşlem tamamlanamadı.');
  });
  it('message alanından da kod okur', () => {
    expect(hataMesajiVer({ message: 'pasif' })).toBe('Bu kullanıcı hesabı pasif durumda.');
  });
});

describe('emailGecerliMi()', () => {
  it('geçerli emailler için true döner', () => {
    expect(emailGecerliMi('test@ornek.com')).toBe(true);
    expect(emailGecerliMi('user.name+tag@domain.co.uk')).toBe(true);
    expect(emailGecerliMi('a@b.c')).toBe(true);
  });
  it('geçersiz emailler için false döner', () => {
    expect(emailGecerliMi('')).toBe(false);
    expect(emailGecerliMi('eksik-at-isareti')).toBe(false);
    expect(emailGecerliMi('@nodomain')).toBe(false);
    expect(emailGecerliMi(null)).toBe(false);
    expect(emailGecerliMi(undefined)).toBe(false);
  });
});

describe('kisaTarih()', () => {
  it('null/undefined için tire döner', () => {
    expect(kisaTarih(null)).toBe('—');
    expect(kisaTarih(undefined)).toBe('—');
  });
  it('toDate() olan Firestore Timestamp objesini işler', () => {
    const ts = { toDate: () => new Date('2024-06-15T10:30:00') };
    const sonuc = kisaTarih(ts);
    expect(sonuc).toContain('2024');
  });
  it('geçersiz tarih için tire döner', () => {
    expect(kisaTarih('gecersiz-tarih-xyz')).toBe('—');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Themes
// ─────────────────────────────────────────────────────────────────────────────
import { TEMALAR, TEMA_LISTESI, VARSAYILAN_TEMA } from '../themes/themes';

describe('TEMA_LISTESI', () => {
  it('6 tema içerir', () => {
    expect(TEMA_LISTESI).toHaveLength(6);
  });
  it('her temanın id, label ve accent alanı var', () => {
    TEMA_LISTESI.forEach(t => {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('label');
      expect(t).toHaveProperty('accent');
    });
  });
});

describe('VARSAYILAN_TEMA', () => {
  it('tanımlı bir tema id-si', () => {
    expect(TEMA_LISTESI.some(t => t.id === VARSAYILAN_TEMA)).toBe(true);
  });
});

describe('TEMALAR objesi', () => {
  it("tüm tema id'leri için s objesi var", () => {
    TEMA_LISTESI.forEach(t => {
      expect(TEMALAR).toHaveProperty(t.id);
    });
  });

  it('her s objesi zorunlu alanları içerir', () => {
    const zorunlu = ['bg', 'text', 'primary', 'surface', 'border', 'accent', 'shadow'];
    TEMA_LISTESI.forEach(({ id }) => {
      const s = TEMALAR[id];
      zorunlu.forEach(alan => {
        expect(s).toHaveProperty(alan);
        expect(typeof s[alan]).toBe('string');
      });
    });
  });

  it('backward compat alanları var (text2, text3, ok, uyari, tehlika)', () => {
    const s = TEMALAR[VARSAYILAN_TEMA];
    expect(s).toHaveProperty('text2');
    expect(s).toHaveProperty('text3');
    expect(s).toHaveProperty('ok');
    expect(s).toHaveProperty('uyari');
    expect(s).toHaveProperty('tehlika');
  });

  it('shadow alanları string içerir', () => {
    const s = TEMALAR[VARSAYILAN_TEMA];
    expect(s.shadow).toContain('px');
    expect(s.shadowCard).toContain('px');
  });

  it('gradient alanları var', () => {
    const s = TEMALAR[VARSAYILAN_TEMA];
    expect(s.accentGrad).toContain('linear-gradient');
    expect(s.heroGrad).toContain('linear-gradient');
    expect(s.logoFrameGradient).toContain('linear-gradient');
  });

  it('soft/rgba renk alanları doğru formatta', () => {
    const s = TEMALAR[VARSAYILAN_TEMA];
    expect(s.okSoft).toContain('rgba');
    expect(s.tehlikaSoft).toContain('rgba');
    expect(s.uyariSoft).toContain('rgba');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// slotTipleri
// ─────────────────────────────────────────────────────────────────────────────
import {
  SLOT_TIPLERI,
  SLOT_TIP_MAP,
  tipBul,
  TIP_RENK,
  getTipRenkleri,
} from '../constants/slotTipleri';

describe('SLOT_TIPLERI', () => {
  it('7 tip içerir', () => {
    expect(SLOT_TIPLERI).toHaveLength(7);
  });
  it('her tip zorunlu alanları içerir', () => {
    SLOT_TIPLERI.forEach(t => {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('label');
      expect(t).toHaveProperty('renk');
      expect(t).toHaveProperty('acik');
      expect(t).toHaveProperty('neonRenk');
      expect(t).toHaveProperty('neonAcik');
    });
  });
  it('"diger" tipi mevcut', () => {
    expect(SLOT_TIPLERI.find(t => t.id === 'diger')).toBeDefined();
  });
});

describe('tipBul()', () => {
  it('bilinen id için doğru tipi döner', () => {
    expect(tipBul('konu').label).toBe('Konu Çalışma');
    expect(tipBul('deneme').label).toBe('Deneme');
    expect(tipBul('video').label).toBe('Video İzleme');
  });
  it('bilinmeyen id için diger döner', () => {
    expect(tipBul('bilinmeyen').id).toBe('diger');
    expect(tipBul(undefined).id).toBe('diger');
  });
});

describe('TIP_RENK (pastel compat)', () => {
  it('temel anahtarlar var', () => {
    ['konu', 'soru', 'deneme', 'video', 'tekrar', 'ozet', 'diger'].forEach(k => {
      expect(TIP_RENK).toHaveProperty(k);
    });
  });
  it('her değerin renk, acik, label alanları var', () => {
    Object.values(TIP_RENK).forEach(v => {
      expect(v).toHaveProperty('renk');
      expect(v).toHaveProperty('acik');
      expect(v).toHaveProperty('label');
    });
  });
});

describe('getTipRenkleri()', () => {
  it('s objesi verilince 7 tip döner', () => {
    const mockS = new Proxy({}, { get: () => '#ffffff' });
    const renk = getTipRenkleri(mockS);
    expect(Object.keys(renk)).toHaveLength(7);
    expect(renk).toHaveProperty('konu');
    expect(renk).toHaveProperty('diger');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// hedefUtils — saf fonksiyonlar
// ─────────────────────────────────────────────────────────────────────────────
import {
  hedefDurumu,
  ilerlemeYuzdesi,
  durumStil,
  TUR_LABEL,
  hedefTurEtiket,
  nettenTYTPuanTahmini,
  nettenAYTPuanTahmini,
  tahminiPuan,
} from '../koc/hedef/hedefUtils';

describe('hedefDurumu()', () => {
  it('hedefDeger yoksa "aktif" döner', () => {
    expect(hedefDurumu({ guncelDeger: 5, baslangicDegeri: 0 })).toBe('aktif');
  });
  it('hedefe ulaşılınca "tamamlandi" döner', () => {
    expect(hedefDurumu({ guncelDeger: 100, hedefDeger: 100, baslangicDegeri: 0 })).toBe(
      'tamamlandi'
    );
  });
  it('son tarih geçmişse "gecikti" döner', () => {
    expect(
      hedefDurumu({ guncelDeger: 10, hedefDeger: 100, baslangicDegeri: 0, sonTarih: '2020-01-01' })
    ).toBe('gecikti');
  });
  it('son tarih 3 gün içinde ve ilerleme düşükse "riskli" döner', () => {
    const yakın = new Date();
    yakın.setDate(yakın.getDate() + 3);
    const tarih = yakın.toISOString().slice(0, 10);
    expect(
      hedefDurumu({ guncelDeger: 5, hedefDeger: 100, baslangicDegeri: 0, sonTarih: tarih })
    ).toBe('riskli');
  });
  it('normal durumda "aktif" döner', () => {
    const ileri = new Date();
    ileri.setDate(ileri.getDate() + 30);
    const tarih = ileri.toISOString().slice(0, 10);
    expect(
      hedefDurumu({ guncelDeger: 60, hedefDeger: 100, baslangicDegeri: 0, sonTarih: tarih })
    ).toBe('aktif');
  });
});

describe('ilerlemeYuzdesi()', () => {
  it('hedefDeger yoksa 0 döner', () => {
    expect(ilerlemeYuzdesi({ guncelDeger: 5, baslangicDegeri: 0 })).toBe(0);
  });
  it('tamamlandıysa 100 döner', () => {
    expect(ilerlemeYuzdesi({ guncelDeger: 100, hedefDeger: 100, baslangicDegeri: 0 })).toBe(100);
  });
  it('yarı yolda 50 döner', () => {
    expect(ilerlemeYuzdesi({ guncelDeger: 50, hedefDeger: 100, baslangicDegeri: 0 })).toBe(50);
  });
  it('100 üstüne çıkmaz', () => {
    expect(ilerlemeYuzdesi({ guncelDeger: 200, hedefDeger: 100, baslangicDegeri: 0 })).toBe(100);
  });
  it('0 altına inmez', () => {
    expect(ilerlemeYuzdesi({ guncelDeger: -10, hedefDeger: 100, baslangicDegeri: 0 })).toBe(0);
  });
});

describe('durumStil()', () => {
  const mockS = new Proxy({}, { get: (_, k) => `#mock-${k}` });
  it('tüm durumlar için obje döner', () => {
    ['aktif', 'tamamlandi', 'gecikti', 'riskli'].forEach(d => {
      const stil = durumStil(mockS, d);
      expect(stil).toHaveProperty('renk');
      expect(stil).toHaveProperty('bg');
      expect(stil).toHaveProperty('label');
    });
  });
  it('bilinmeyen durum için aktif stili döner', () => {
    expect(durumStil(mockS, 'bilinmeyen')).toHaveProperty('label');
  });
});

describe('TUR_LABEL', () => {
  it('net, saat, puan, diger etiketleri doğru', () => {
    expect(TUR_LABEL.net).toBe('Net');
    expect(TUR_LABEL.saat).toBe('Saat');
    expect(TUR_LABEL.puan).toBe('Puan');
    expect(TUR_LABEL.diger).toBe('Diğer');
  });
});

describe('hedefTurEtiket()', () => {
  it('hedefTur alanını okur', () => {
    expect(hedefTurEtiket({ hedefTur: 'net' })).toBe('Net');
  });
  it('eski tur alanını fallback olarak okur', () => {
    expect(hedefTurEtiket({ tur: 'saat' })).toBe('Saat');
  });
  it('ikisi de yoksa tire döner', () => {
    expect(hedefTurEtiket({})).toBe('—');
  });
});

describe('nettenTYTPuanTahmini()', () => {
  it('null için null döner', () => {
    expect(nettenTYTPuanTahmini(null)).toBeNull();
  });
  it('0 net için baz puan 100 döner', () => {
    expect(nettenTYTPuanTahmini(0)).toBe(100);
  });
  it('pozitif net için puan artar', () => {
    expect(nettenTYTPuanTahmini(50)).toBeGreaterThan(200);
  });
  it('500 üzerine çıkmaz', () => {
    expect(nettenTYTPuanTahmini(9999)).toBe(500);
  });
});

describe('nettenAYTPuanTahmini()', () => {
  it('varsayılan alan say ile çalışır', () => {
    const puan = nettenAYTPuanTahmini(50);
    expect(puan).toBeGreaterThan(100);
    expect(puan).toBeLessThanOrEqual(500);
  });
  it('500 üzerine çıkmaz', () => {
    expect(nettenAYTPuanTahmini(10000, 'ea')).toBe(500);
  });
});

describe('tahminiPuan()', () => {
  it('lgs türü için sonuç döner', () => {
    const p = tahminiPuan({ tyt: 60 }, 'lgs_8');
    expect(typeof p).toBe('number');
    expect(p).toBeGreaterThan(100);
  });
  it('net yoksa baz puan 100 döner', () => {
    expect(tahminiPuan({}, 'tyt_12')).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// izleme utility
// ─────────────────────────────────────────────────────────────────────────────
import { setIzlemeUser, getIzlemeUser, logIstemciHatasi } from '../utils/izleme';

describe('setIzlemeUser / getIzlemeUser', () => {
  it('kullanıcı set edilip okunabilir', () => {
    setIzlemeUser({ uid: 'abc', email: 'a@b.com' });
    expect(getIzlemeUser()).toEqual({ uid: 'abc', email: 'a@b.com' });
  });
  it('null set edilebilir', () => {
    setIzlemeUser(null);
    expect(getIzlemeUser()).toBeNull();
  });
});

describe('logIstemciHatasi()', () => {
  beforeEach(() => setIzlemeUser(null));

  it('uid yoksa addDoc çağrılmaz', async () => {
    const { addDoc } = await import('firebase/firestore');
    addDoc.mockClear();
    await logIstemciHatasi({ error: new Error('test'), kaynak: 'test' });
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('uid varsa addDoc çağrılır', async () => {
    const { addDoc } = await import('firebase/firestore');
    addDoc.mockClear();
    setIzlemeUser({ uid: 'u1', email: 'u@test.com', rol: 'koc' });
    await logIstemciHatasi({ error: new Error('test hatası'), kaynak: 'birim_test' });
    expect(addDoc).toHaveBeenCalled();
  });

  it('addDoc hata verse bile fırlatmaz', async () => {
    const { addDoc } = await import('firebase/firestore');
    addDoc.mockRejectedValueOnce(new Error('firestore down'));
    setIzlemeUser({ uid: 'u1' });
    await expect(
      logIstemciHatasi({ error: new Error('test'), kaynak: 'test' })
    ).resolves.toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VeliKartlari bileşenleri
// ─────────────────────────────────────────────────────────────────────────────
import { CalismaOzet, OgrenciDurumKart, KocRaporu } from '../veli/VeliKartlari';

const mockS = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === 'shadow' || prop === 'shadowCard') return '0 2px 8px rgba(0,0,0,0.1)';
      return '#cccccc';
    },
  }
);

describe('OgrenciDurumKart', () => {
  it('ogrenci null ise null render eder', () => {
    const { container } = render(<OgrenciDurumKart ogrenci={null} s={mockS} />);
    expect(container.firstChild).toBeNull();
  });
  it('normal durumda render olur', () => {
    render(<OgrenciDurumKart ogrenci={{ riskDurumu: 'normal', sonDenemeNet: 42.5 }} s={mockS} />);
    expect(screen.getByText('Öğrenci Durumu')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });
  it('yuksek_risk durumunda "Yüksek Risk" gösterir', () => {
    render(<OgrenciDurumKart ogrenci={{ riskDurumu: 'yuksek_risk' }} s={mockS} />);
    expect(screen.getByText('Yüksek Risk')).toBeInTheDocument();
  });
  it('risk_altinda durumunda "Dikkat Gereken" gösterir', () => {
    render(<OgrenciDurumKart ogrenci={{ riskDurumu: 'risk_altinda' }} s={mockS} />);
    expect(screen.getByText('Dikkat Gereken')).toBeInTheDocument();
  });
  it('sonDenemeNet varsa sayı gösterir', () => {
    render(<OgrenciDurumKart ogrenci={{ sonDenemeNet: 55.5 }} s={mockS} />);
    expect(screen.getByText('55.5')).toBeInTheDocument();
  });
  it('toplamCalismaGunu varsa gösterir', () => {
    render(<OgrenciDurumKart ogrenci={{ toplamCalismaGunu: 12 }} s={mockS} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});

describe('CalismaOzet', () => {
  it('boş çalışma ile render olur', () => {
    render(<CalismaOzet calisma={[]} s={mockS} />);
    expect(screen.getByText('Çalışma Durumu')).toBeInTheDocument();
  });
  it('7 günlük özet satırı gösterilir', () => {
    render(<CalismaOzet calisma={[]} s={mockS} />);
    expect(screen.getByText(/7 gün/)).toBeInTheDocument();
  });
  it('çalışma verisi verilince saat bilgisi gösterilir', () => {
    const bugun = new Date().toISOString().slice(0, 10);
    render(<CalismaOzet calisma={[{ tarih: bugun, saat: 5 }]} s={mockS} />);
    expect(screen.getAllByText(/saat/)[0]).toBeInTheDocument();
  });
});

describe('KocRaporu', () => {
  it('boş raporlar için "Henüz haftalık rapor" mesajı gösterir', () => {
    render(<KocRaporu raporlar={[]} ogrenciIsim="Test" s={mockS} />);
    expect(screen.getByText(/Henüz haftalık rapor/)).toBeInTheDocument();
  });
  it('raporlarla başlık render olur', () => {
    const raporlar = [{ haftaBaslangic: '2024-W01', ozetMetni: 'Harika hafta' }];
    render(<KocRaporu raporlar={raporlar} ogrenciIsim="Ali" s={mockS} />);
    expect(screen.getByText('Koç Raporu')).toBeInTheDocument();
    expect(screen.getByText('Harika hafta')).toBeInTheDocument();
  });
  it('WhatsApp paylaşım butonu var', () => {
    const raporlar = [{ haftaBaslangic: '2024-W01', ozetMetni: 'İyi' }];
    render(<KocRaporu raporlar={raporlar} s={mockS} />);
    expect(screen.getByText(/WhatsApp/)).toBeInTheDocument();
  });
  it('dikkat alanları varsa gösterilir', () => {
    const raporlar = [{ ozetMetni: 'Tamam', dikkatAlanlari: ['Matematik', 'Fizik'] }];
    render(<KocRaporu raporlar={raporlar} s={mockS} />);
    expect(screen.getByText(/Matematik/)).toBeInTheDocument();
    expect(screen.getByText(/Fizik/)).toBeInTheDocument();
  });
});
