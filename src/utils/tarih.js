import { useState, useEffect } from 'react';

/**
 * Tarih yardımcıları — modül yüklenince donmayan versiyonlar
 *
 * NEDEN: `const BUGUN = new Date().toISOString().split('T')[0]` modül
 * seviyesinde çalıştığında uygulama ilk açıldığı anı sabitler.
 * Kullanıcı gece yarısını geçerse tarih güncellenmez.
 *
 * Çözüm: Fonksiyon çağrısında hesapla ya da useGunlukTarih hook'unu kullan.
 */

const GUN_ADLARI = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];

/** Bugünün YYYY-MM-DD string'ini Türkiye saatiyle döner (her çağrıda taze) */
export function bugunStr() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
}

/** Herhangi bir Date nesnesini yerel saatle YYYY-MM-DD string'ine çevirir (timezone-safe) */
export function dateToStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Bugünün gün adını döner: 'pazartesi', 'sali' vb. */
export function bugunGunAdi() {
  return GUN_ADLARI[new Date().getDay()];
}

/**
 * İçinde bulunulan haftanın Pazartesi tarihini YYYY-MM-DD olarak döner.
 * Haftalık program dökümanlarının key'i olarak kullanılır.
 */
export function haftaBasStr() {
  const d = new Date();
  const fark = (d.getDay() + 6) % 7; // Pazartesi = 0
  d.setDate(d.getDate() - fark);
  return dateToStr(d);
}

/**
 * React hook: tarih değerlerini state'te tutar, gece yarısı otomatik günceller.
 *
 * Kullanım:
 *   const { bugun, bugunGun, haftaBaz } = useGunlukTarih();
 */
export function useGunlukTarih() {
  const hesapla = () => ({
    bugun: bugunStr(),
    bugunGun: bugunGunAdi(),
    haftaBaz: haftaBasStr(),
  });

  const [tarihler, setTarihler] = useState(hesapla);

  useEffect(() => {
    // Bir sonraki gece yarısına kaç ms kaldığını hesapla
    const simdi = new Date();
    const yarinGece = new Date(simdi);
    yarinGece.setDate(yarinGece.getDate() + 1);
    yarinGece.setHours(0, 0, 0, 0);
    const msKalan = yarinGece - simdi;

    const timer = setTimeout(() => {
      setTarihler(hesapla());
    }, msKalan + 100); // +100ms buffer

    return () => clearTimeout(timer);
  }, [tarihler.bugun]); // bugun değişince yeniden kur

  return tarihler;
}
