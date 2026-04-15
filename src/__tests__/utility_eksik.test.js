/**
 * ElsWay — Eksik Utility Testleri
 * Kapsam: aktifDurumu, adminUtils, hedefUtils
 */

import { describe, it, expect, vi } from 'vitest';

import { aktifDurumu, aktiflikKaydet, oturumBitir } from '../utils/aktiflikKaydet.js';
import { duyuruRenk, funnelYuzde, aktivasyonRozet, destekTipleri } from '../utils/adminUtils.js';
import {
  hedefDurumu,
  ilerlemeYuzdesi,
  hedefTurEtiket,
  TUR_LABEL,
} from '../koc/hedef/hedefUtils.js';

// ─── aktifDurumu ──────────────────────────────────────────────────────────────

describe('aktifDurumu', () => {
  it('null için hiç giriş yok döner', () => {
    const sonuc = aktifDurumu(null);
    expect(sonuc.label).toBe('Hiç giriş yok');
    expect(sonuc.puan).toBe(0);
  });

  it('30 dakikadan az önce → şu an aktif', () => {
    const onDkOnce = new Date(Date.now() - 10 * 60 * 1000);
    const sonuc = aktifDurumu(onDkOnce);
    expect(sonuc.label).toBe('Şu an aktif');
    expect(sonuc.puan).toBe(3);
  });

  it('30-120 dakika önce → X dk önce', () => {
    const elmisDkOnce = new Date(Date.now() - 60 * 60 * 1000);
    const sonuc = aktifDurumu(elmisDkOnce);
    expect(sonuc.label).toContain('dk önce');
    expect(sonuc.puan).toBe(2);
  });

  it('2-12 saat önce → X saat önce', () => {
    const ucSaatOnce = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const sonuc = aktifDurumu(ucSaatOnce);
    expect(sonuc.label).toContain('saat önce');
    expect(sonuc.puan).toBe(1);
  });

  it('12+ saat önce → puan 0', () => {
    const onUcSaatOnce = new Date(Date.now() - 13 * 60 * 60 * 1000);
    const sonuc = aktifDurumu(onUcSaatOnce);
    expect(sonuc.puan).toBe(0);
  });

  it('Firestore Timestamp simülasyonu desteklenir', () => {
    const simdi = new Date();
    const timestamp = { toDate: () => simdi };
    const sonuc = aktifDurumu(timestamp);
    expect(sonuc.label).toBe('Şu an aktif');
  });

  it('her durum renk ve puan döner', () => {
    [null, new Date(Date.now() - 5 * 60 * 1000), new Date(Date.now() - 3 * 60 * 60 * 1000)].forEach(
      v => {
        const sonuc = aktifDurumu(v);
        expect(sonuc.renk).toBeTruthy();
        expect(typeof sonuc.puan).toBe('number');
      }
    );
  });
});

// ─── aktiflikKaydet / oturumBitir ────────────────────────────────────────────
// Firebase mock'u setup.js'te hazır. rol parametresinin davranışını test et.

describe('aktiflikKaydet', () => {
  it('uid yoksa erken döner, Firestore çağrılmaz', async () => {
    const { updateDoc } = await import('firebase/firestore');
    vi.clearAllMocks();
    await aktiflikKaydet(null, 'ogrenci');
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('rol ogrenci ise ogrenciler koleksiyonu için doc() çağrılır', async () => {
    const { doc } = await import('firebase/firestore');
    vi.clearAllMocks();
    await aktiflikKaydet('uid123', 'ogrenci');
    // doc(db, 'ogrenciler', uid) çağrısında 'ogrenciler' argümanı geçmeli
    const ogrenciCagrisi = doc.mock.calls.some(c => c.includes('ogrenciler'));
    expect(ogrenciCagrisi).toBe(true);
  });

  it('rol koc ise ogrenciler koleksiyonu için doc() çağrılmaz', async () => {
    const { doc } = await import('firebase/firestore');
    vi.clearAllMocks();
    await aktiflikKaydet('uid123', 'koc');
    const ogrenciCagrisi = doc.mock.calls.some(c => c.includes('ogrenciler'));
    expect(ogrenciCagrisi).toBe(false);
  });
});

describe('oturumBitir', () => {
  it('uid veya süre yoksa işlem yapmaz', async () => {
    const { setDoc } = await import('firebase/firestore');
    vi.clearAllMocks();
    await oturumBitir(null, 5, 'ogrenci');
    await oturumBitir('uid', 0, 'ogrenci');
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('rol ogrenci ise ogrenciler koleksiyonu için doc() çağrılır', async () => {
    const { doc } = await import('firebase/firestore');
    vi.clearAllMocks();
    await oturumBitir('uid123', 30, 'ogrenci');
    const ogrenciCagrisi = doc.mock.calls.some(c => c.includes('ogrenciler'));
    expect(ogrenciCagrisi).toBe(true);
  });

  it('rol veli ise ogrenciler koleksiyonu için doc() çağrılmaz', async () => {
    const { doc } = await import('firebase/firestore');
    vi.clearAllMocks();
    await oturumBitir('uid123', 30, 'veli');
    const ogrenciCagrisi = doc.mock.calls.some(c => c.includes('ogrenciler'));
    expect(ogrenciCagrisi).toBe(false);
  });
});

// ─── adminUtils ───────────────────────────────────────────────────────────────

describe('duyuruRenk', () => {
  it('kritik seviye için kırmızı tonu döner', () => {
    const renk = duyuruRenk({ seviye: 'kritik' });
    expect(renk.text).toContain('#F43F5E');
  });

  it('guncelleme seviyesi için yeşil tonu döner', () => {
    const renk = duyuruRenk({ seviye: 'guncelleme' });
    expect(renk.text).toContain('#10B981');
  });

  it('varsayılan için mor tonu döner', () => {
    const renk = duyuruRenk({});
    expect(renk.text).toContain('#5B4FE8');
  });

  it('boş parametre ile çağrılınca hata vermez', () => {
    expect(() => duyuruRenk()).not.toThrow();
  });

  it('her durumda bg, border, text alanları var', () => {
    ['kritik', 'guncelleme', 'bilgi'].forEach(seviye => {
      const renk = duyuruRenk({ seviye });
      expect(renk.bg).toBeTruthy();
      expect(renk.border).toBeTruthy();
      expect(renk.text).toBeTruthy();
    });
  });
});

describe('funnelYuzde', () => {
  it('toplam 0 ise 0 döner', () => {
    expect(funnelYuzde(0, 50)).toBe(0);
  });

  it('doğru yüzde hesaplar', () => {
    expect(funnelYuzde(100, 75)).toBe(75);
    expect(funnelYuzde(200, 50)).toBe(25);
  });

  it('100 üstüne çıkmaz', () => {
    expect(funnelYuzde(10, 20)).toBe(100);
  });

  it('0 altına düşmez', () => {
    expect(funnelYuzde(100, -10)).toBe(0);
  });

  it('tam sayı döner', () => {
    expect(Number.isInteger(funnelYuzde(3, 1))).toBe(true);
  });
});

describe('aktivasyonRozet', () => {
  it('80+ → Güçlü', () => {
    expect(aktivasyonRozet(80).label).toBe('Güçlü');
    expect(aktivasyonRozet(100).label).toBe('Güçlü');
  });

  it('50-79 → Orta', () => {
    expect(aktivasyonRozet(50).label).toBe('Orta');
    expect(aktivasyonRozet(79).label).toBe('Orta');
  });

  it('50 altı → Riskli', () => {
    expect(aktivasyonRozet(49).label).toBe('Riskli');
    expect(aktivasyonRozet(0).label).toBe('Riskli');
  });

  it('her etiket renk ve bg döner', () => {
    [0, 50, 80].forEach(sk => {
      const rozet = aktivasyonRozet(sk);
      expect(rozet.renk).toBeTruthy();
      expect(rozet.bg).toBeTruthy();
    });
  });
});

describe('destekTipleri', () => {
  it('boş değil', () => {
    expect(destekTipleri.length).toBeGreaterThan(0);
  });

  it('her tipin value, label, icon alanı var', () => {
    destekTipleri.forEach(tip => {
      expect(tip.value).toBeTruthy();
      expect(tip.label).toBeTruthy();
      expect(tip.icon).toBeTruthy();
    });
  });

  it('teknik tipi içeriyor', () => {
    expect(destekTipleri.some(t => t.value === 'teknik')).toBe(true);
  });
});

// ─── hedefUtils ──────────────────────────────────────────────────────────────

describe('hedefDurumu', () => {
  it('hedefDeger yoksa aktif döner', () => {
    expect(hedefDurumu({})).toBe('aktif');
    expect(hedefDurumu({ hedefDeger: 0 })).toBe('aktif');
  });

  it('yüzde 100 iken tamamlandi döner', () => {
    const hedef = { baslangicDegeri: 0, hedefDeger: 100, guncelDeger: 100 };
    expect(hedefDurumu(hedef)).toBe('tamamlandi');
  });

  it('son tarih geçmişse gecikti döner', () => {
    const hedef = {
      baslangicDegeri: 0,
      hedefDeger: 100,
      guncelDeger: 50,
      sonTarih: '2024-01-01', // geçmiş tarih
    };
    expect(hedefDurumu(hedef)).toBe('gecikti');
  });

  it('kalan 7 günden az ve düşük ilerleme varsa riskli döner', () => {
    const yarin = new Date();
    yarin.setDate(yarin.getDate() + 3);
    const hedef = {
      baslangicDegeri: 0,
      hedefDeger: 100,
      guncelDeger: 10,
      sonTarih: yarin.toISOString().slice(0, 10),
    };
    expect(hedefDurumu(hedef)).toBe('riskli');
  });

  it('normal ilerleme aktif döner', () => {
    const gelecek = new Date();
    gelecek.setDate(gelecek.getDate() + 30);
    const hedef = {
      baslangicDegeri: 0,
      hedefDeger: 100,
      guncelDeger: 50,
      sonTarih: gelecek.toISOString().slice(0, 10),
    };
    expect(hedefDurumu(hedef)).toBe('aktif');
  });
});

describe('ilerlemeYuzdesi', () => {
  it('başlangıç = hedef ise 0 döner', () => {
    expect(ilerlemeYuzdesi({ baslangicDegeri: 50, hedefDeger: 50, guncelDeger: 50 })).toBe(0);
  });

  it('doğru yüzde hesaplar', () => {
    expect(ilerlemeYuzdesi({ baslangicDegeri: 0, hedefDeger: 100, guncelDeger: 50 })).toBe(50);
  });

  it('100 üstüne çıkmaz', () => {
    expect(ilerlemeYuzdesi({ baslangicDegeri: 0, hedefDeger: 100, guncelDeger: 150 })).toBe(100);
  });

  it('0 altına düşmez', () => {
    expect(ilerlemeYuzdesi({ baslangicDegeri: 50, hedefDeger: 100, guncelDeger: 30 })).toBe(0);
  });
});

describe('hedefTurEtiket', () => {
  it('net → Net', () => {
    expect(hedefTurEtiket({ hedefTur: 'net' })).toBe('Net');
  });

  it('puan → Puan', () => {
    expect(hedefTurEtiket({ hedefTur: 'puan' })).toBe('Puan');
  });

  it('saat → Saat', () => {
    expect(hedefTurEtiket({ hedefTur: 'saat' })).toBe('Saat');
  });

  it('eski format (tur alanı) da çalışır', () => {
    expect(hedefTurEtiket({ tur: 'net' })).toBe('Net');
  });

  it('bilinmeyen tür için kendisini döner', () => {
    const sonuc = hedefTurEtiket({ hedefTur: 'ozel' });
    expect(sonuc).toBe('ozel');
  });
});

describe('TUR_LABEL', () => {
  it('4 tür içeriyor', () => {
    expect(Object.keys(TUR_LABEL).length).toBe(4);
  });

  it('net, saat, puan, diger etiketleri var', () => {
    expect(TUR_LABEL.net).toBeTruthy();
    expect(TUR_LABEL.saat).toBeTruthy();
    expect(TUR_LABEL.puan).toBeTruthy();
    expect(TUR_LABEL.diger).toBeTruthy();
  });
});
