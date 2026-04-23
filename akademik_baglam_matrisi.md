# ElsWay — Akademik Bağlam Matrisi
**Tarih:** 2026-04-10  
**Kaynak:** 14 Günlük Çekirdek Doğruluk Sprinti — Gün 2  
**Kullanım:** `ogrenciBaglam.js` canonical çözücünün referans tablosu. Her yeni ürün kararı bu tablodan geçmeli.

---

## Sınıf Bazlı Matris

| Sınıf | sinavModu | Ders Seti | Deneme Tipleri | Müfredat Anahtarı | Program Modu | Veli Görünürlüğü |
|---|---|---|---|---|---|---|
| 7 | `gelisim` | TYT çekirdeği (Türkçe, Mat, Fen, Sos) | branş, mini genel | `tyt` | `gelisim_programi` | Temel (çalışma + rutin) |
| 8 LGS | `lgs` | LGS seti (Türkçe, Mat, Fen, İnkılap, Din, İng) | LGS genel, LGS sözel, LGS sayısal | `lgs` | `sinav_programi` | Tam (deneme + risk + çalışma) |
| 9 | `gelisim` | TYT çekirdeği + alan seçimi başlıyor | branş, mini TYT | `tyt` | `gelisim_programi` | Temel |
| 10 | `gelisim` | TYT + tercih edilen alan ağırlıklı | TYT, branş | `tyt` | `gelisim_programi` | Temel |
| 11 | `gecis` | TYT + AYT alanı | TYT, AYT, branş | `tyt` + `ayt_{alan}` | `gecis_programi` | Orta (çalışma + deneme trendi) |
| 12 | `yks` | TYT + AYT (alana göre) | TYT, AYT, YDT (dil), branş | `tyt` + `ayt_{alan}` | `sinav_programi` | Tam |
| mezun | `yks` | TYT + AYT (alana göre) | TYT, AYT, YDT, branş | `tyt` + `ayt_{alan}` | `sinav_programi` | Tam |

---

## Alan Bazlı Matris (YKS için)

| Alan (tur) | AYT Ders Seti | Deneme Kısıtı | Müfredat Anahtarı |
|---|---|---|---|
| `sayisal` | Matematik, Fizik, Kimya, Biyoloji | TYT + AYT SAY | `ayt_sayisal` |
| `ea` | Matematik, Edebiyat, Tarih, Coğrafya | TYT + AYT EA | `ayt_ea` |
| `sozel` | Edebiyat, Tarih, Coğrafya, Felsefe, Din | TYT + AYT SÖZ | `ayt_sozel` |
| `dil` | Yabancı Dil | TYT + YDT | `ayt_dil` |
| `tyt` | Yok | Sadece TYT | `tyt` |

---

## sinavModu Enum Tanımları

| sinavModu | Açıklama | Geri sayım | Deneme yoğunluğu | Konu planı |
|---|---|---|---|---|
| `lgs` | LGS sınavına odaklı | LGS tarihine | Yüksek | LGS müfredatı |
| `yks` | YKS sınavına odaklı | YKS tarihine | Yüksek | TYT + AYT müfredatı |
| `gecis` | Sınav yılına hazırlık | YKS tarihine (bilgi amaçlı) | Orta | TYT ağırlıklı |
| `gelisim` | Genel akademik gelişim | Yok | Düşük | TYT çekirdeği |

---

## programModu Enum Tanımları

| programModu | Kimler | Slot dili | Deneme sıklığı | Tekrar yoğunluğu |
|---|---|---|---|---|
| `sinav_programi` | 8/12/mezun | "Sınav odaklı çalışma" | Haftada 2-3 | Yüksek |
| `gecis_programi` | 11 | "Alan yerleştirme + TYT" | Haftada 1-2 | Orta |
| `gelisim_programi` | 7/9/10 | "Konu ilerleyişi" | Haftada 0-1 | Düşük |

---

## Müfredat Anahtarları (Firestore `mufredat/{anahtar}`)

| Anahtar | İçerik |
|---|---|
| `lgs` | Türkçe, Matematik, Fen Bilimleri, İnkılap Tarihi, Din Kültürü, İngilizce |
| `tyt` | Türkçe, Mat, Geometri, Tarih, Coğrafya, Felsefe, Din, Fizik, Kimya, Biyoloji |
| `ayt_sayisal` | Matematik, Geometri, Fizik, Kimya, Biyoloji |
| `ayt_ea` | Matematik, Geometri, Edebiyat, Tarih 1-2, Coğrafya 1-2 |
| `ayt_sozel` | Edebiyat, Tarih 1-2, Coğrafya 1-2, Felsefe, Din |
| `ayt_dil` | YDT (İngilizce / Almanca / Fransızca / vb.) |

---

## Kod Kullanım Rehberi

```js
// ogrenciBaglam.js'den çekilen canonical çözücü kullanımı:
const baglam = ogrenciBaglaminiCoz({ tur: userData.tur, sinif: userData.sinif });

baglam.sinavModu       // 'lgs' | 'yks' | 'gecis' | 'gelisim'
baglam.programModu     // 'sinav_programi' | 'gecis_programi' | 'gelisim_programi'
baglam.mufredatAnahtarlari // ['tyt', 'ayt_sayisal'] gibi dizi
baglam.dersSet         // turdenBransDersler ile uyumlu ders listesi
baglam.denemeTipleri   // ['tyt', 'ayt', 'brans'] gibi izin verilen türler
baglam.gerisayimHedef  // 'lgs' | 'yks' | null
```
