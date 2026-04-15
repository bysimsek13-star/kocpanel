/**
 * seedMufredat.js — Firestore mufredat koleksiyonunu toplu doldurur.
 *
 * Çalıştırma:
 *   cd functions
 *   node seedMufredat.js
 *
 * Gereksinim: `firebase login` yapılmış olmalı (ADC kullanır).
 *
 * Seeded koleksiyonlar:
 *   mufredat/lgs/konular          — 8. sınıf LGS
 *   mufredat/tyt/konular          — TYT ortak
 *   mufredat/ayt_sayisal/konular  — AYT Sayısal
 *   mufredat/ayt_ea/konular       — AYT Eşit Ağırlık
 *   mufredat/ayt_sozel/konular    — AYT Sözel
 *   mufredat/ayt_dil/konular      — AYT Dil
 *   mufredat/ortaokul7/konular    — 7. sınıf
 *   mufredat/lise9_tymm/konular   — 9. sınıf TYMM
 *   mufredat/lise10_tymm/konular  — 10. sınıf TYMM
 *
 * NOT: Mevcut dokümanlar üzerine yazılır (merge: false).
 *      --dry  argümanıyla sadece sayıları yazar, Firestore'a dokunmaz.
 */

'use strict';

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry');

// Service account key'i ara: --key argümanı veya serviceAccount.json
const keyArg = process.argv.find(a => a.startsWith('--key='));
const keyPath = keyArg
  ? keyArg.split('=')[1]
  : path.join(__dirname, 'serviceAccount.json');

if (!DRY && fs.existsSync(keyPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'kocpaneli',
  });
} else {
  admin.initializeApp({ projectId: 'kocpaneli' });
}

const db = admin.firestore();

// ─── Veri Tanımı ─────────────────────────────────────────────────────────────
// Her segment: { anahtar, dersler: [{ id, label, renk, konular: [] }] }

const SEGMENTLER = [

  // ── LGS (8. sınıf) ────────────────────────────────────────────────────────
  {
    anahtar: 'lgs',
    dersler: [
      {
        id: 'lgstur', label: 'Türkçe', renk: '#F59E0B',
        konular: [
          'Sözcükte Anlam', 'Cümlede Anlam', 'Paragrafta Anlam (Ana Düşünce, Başlık, Özet)',
          'Ses Bilgisi', 'Sözcüğün Yapısı (Kök ve Ekler)',
          'Sözcük Türleri (İsim, Sıfat, Zamir, Zarf, Edat, Bağlaç, Ünlem)',
          'Fiil ve Fiil Çekimi (Kip, Zaman, Kişi)', 'Cümlenin Ögeleri', 'Cümle Türleri',
          'Anlatım Bozuklukları', 'Yazım Kuralları', 'Noktalama İşaretleri',
          'Deyimler ve Atasözleri',
        ],
      },
      {
        id: 'lgsmat', label: 'Matematik', renk: '#5B4FE8',
        konular: [
          'Çarpanlar ve Katlar (EBOB-EKOK)', 'Üslü İfadeler', 'Kareköklü İfadeler',
          'Ondalık Sayılar, Yüzde ve Faiz', 'Oran ve Orantı',
          'Cebirsel İfadeler ve Özdeşlikler', 'Doğrusal Denklemler', 'Eşitsizlikler',
          'Veri Analizi (Merkezi Eğilim ve Yayılım Ölçüleri)', 'Olasılık',
          'Eşlik ve Benzerlik', 'Üçgenler (Pisagor, Özel Üçgenler)', 'Dönüşüm Geometrisi',
          'Geometrik Cisimler (Prizma, Silindir, Koni, Küre)', 'Daire (Çevre, Alan, Dilim)',
        ],
      },
      {
        id: 'lgsfen', label: 'Fen Bilimleri', renk: '#10B981',
        konular: [
          'Mevsimler ve İklim',
          'DNA ve Genetik Kod',
          'Basit Makineler',
          'Ses',
          'Elektrik Yükleri ve Elektrik Enerjisi',
          'Asitler ve Bazlar',
          'Canlılar ve Enerji İlişkileri (Fotosentez ve Solunum)',
          'Madde ve Endüstri',
          'Hücre Bölünmesi ve Kalıtım',
          'Güneş Sistemi ve Ötesi (6-7. sınıf)',
          'Hücre ve Bölünmeler (7. sınıf)',
          'Kuvvet ve Enerji (7. sınıf)',
          'Saf Madde ve Karışımlar (7. sınıf)',
          'Madde ve Tanecikli Yapı (6. sınıf)',
          'Kuvvet ve Hareket (6. sınıf)',
          'Işık ve Ses Temelleri (6. sınıf)',
        ],
      },
      {
        id: 'lgsinkilap', label: 'T.C. İnkılap Tarihi ve Atatürkçülük', renk: '#F43F5E',
        konular: [
          'Bir Kahraman Doğuyor',
          'Milli Uyanış: Atatürk Önderliğinde Bağımsızlık Savaşı',
          'Atatürkçülük ve Türk İnkılabı',
          'İkinci Dünya Savaşı ve Türkiye',
          'Demokratikleşme Çabaları ve Türkiye Cumhuriyeti',
        ],
      },
      {
        id: 'lgsdin', label: 'Din Kültürü ve Ahlak Bilgisi', renk: '#059669',
        konular: [
          'Kader İnancı',
          "Kur'an'ı Kerim ve Yorumu",
          "Hz. Muhammed'in Hayatı ve Örnek Ahlakı",
          'İbadet (Namaz, Oruç, Zekat, Hac)',
          'İslam Düşüncesinde Tasavvufi Yorumlar',
        ],
      },
      {
        id: 'lgsing', label: 'İngilizce', renk: '#0891B2',
        konular: [
          'Friendship', 'Teen Life', 'Cooking', 'Communication', 'Movies',
          'Adventures', 'Tourism', 'Science and Technology',
          'Tenses (Present, Past, Future, Perfect)', 'Modal Verbs',
          'Passive Voice', 'Conditionals', 'Reported Speech', 'Relative Clauses',
        ],
      },
    ],
  },

  // ── TYT Ortak ─────────────────────────────────────────────────────────────
  {
    anahtar: 'tyt',
    dersler: [
      {
        id: 'tur', label: 'Türkçe', renk: '#F59E0B',
        konular: [
          'Sözcükte Anlam', 'Söz Yorumu', 'Deyim ve Atasözü', 'Cümlede Anlam',
          'Paragrafta Anlatım Teknikleri', 'Paragrafta Konu-Ana Düşünce', 'Paragrafta Yapı',
          'Anlatım Bozuklukları', 'Ses Bilgisi', 'Yazım Kuralları', 'Noktalama İşaretleri',
          'Sözcüğün Yapısı', 'Sözcük Türleri', 'Fiiller', 'Sözcük Grupları',
          'Cümlenin Ögeleri', 'Cümle Türleri',
        ],
      },
      {
        id: 'mat', label: 'Temel Matematik', renk: '#5B4FE8',
        konular: [
          'Sayılar ve Sayı Basamakları', 'Bölme ve Bölünebilme', 'EBOB-EKOK',
          'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer',
          'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma',
          'Oran Orantı', 'Denklem Çözme', 'Problemler',
          'Kümeler', 'Fonksiyonlar', 'Permütasyon', 'Kombinasyon', 'Olasılık', 'Veri-İstatistik',
          'Doğruda ve Üçgende Açılar', 'Dik ve Özel Üçgenler', 'Üçgende Alanlar',
          'Üçgende Eşlik ve Benzerlik', 'Çokgenler', 'Dörtgenler',
          'Çemberde Açılar', 'Çemberde Uzunluk', 'Daire',
          'Prizmalar', 'Piramitler', 'Küre', 'Koordinat Düzlemi ve Doğrunun Analitiği',
        ],
      },
      {
        id: 'tytfiz', label: 'Fizik', renk: '#3B82F6',
        konular: [
          'Fizik Bilimine Giriş', 'Madde ve Özellikleri', 'Hareket ve Kuvvet',
          'Enerji', 'Isı ve Sıcaklık', 'Elektrostatik', 'Elektrik ve Manyetizma',
          'Basınç ve Kaldırma Kuvveti', 'Dalgalar', 'Optik (Aydınlanma)',
        ],
      },
      {
        id: 'tytkim', label: 'Kimya', renk: '#10B981',
        konular: [
          'Kimya Bilimi', 'Atom ve Yapısı', 'Periyodik Sistem',
          'Kimyasal Türler Arası Etkileşimler', 'Asitler-Bazlar ve Tuzlar',
          'Bileşikler', 'Kimyasal Tepkimeler', 'Kimyanın Temel Yasaları',
          'Maddenin Halleri', 'Karışımlar', 'Endüstride ve Canlılarda Enerji',
        ],
      },
      {
        id: 'tytbiy', label: 'Biyoloji', renk: '#EC4899',
        konular: [
          'Biyoloji Bilimi ve İnorganik Bileşikler', 'Organik Bileşikler', 'Hücre',
          'Madde Geçişleri', 'DNA-RNA', 'Protein Sentezi', 'Enzimler',
          'Canlıların Sınıflandırılması', 'Ekoloji', 'Hücre Bölünmeleri',
          'Eşeysiz ve Eşeyli Üreme',
        ],
      },
      {
        id: 'tyttar', label: 'Tarih', renk: '#F43F5E',
        konular: [
          'Tarih Bilimine Giriş', 'İlk Uygarlıklar', 'İslam Tarihi ve Uygarlığı',
          'Türk-İslam Devletleri', 'Osmanlı Devleti Kuruluş Dönemi',
          'Osmanlı Klasik Çağ', 'Osmanlı Gerileme ve Çöküş',
          'I. Dünya Savaşı ve Mondros', 'Kurtuluş Savaşı', 'Atatürk İlkeleri ve İnkılaplar',
        ],
      },
      {
        id: 'tytcog', label: 'Coğrafya', renk: '#8B5CF6',
        konular: [
          'Harita Bilgisi', "Dünyanın Şekli ve Hareketleri", 'İklim Bilgisi',
          "Türkiye'nin İklimi ve Yer Şekilleri", 'Yerin Şekillenmesi (İç ve Dış Kuvvetler)',
          'Toprak Tipleri', 'Nüfus', 'Ulaşım Yolları', 'Çevre ve İnsan', 'Doğal Afetler',
        ],
      },
      {
        id: 'tytfel', label: 'Felsefe', renk: '#0891B2',
        konular: [
          'Felsefenin Konusu ve Alanı', 'Bilgi Felsefesi', 'Varlık Felsefesi',
          'Ahlak Felsefesi', 'Sanat Felsefesi', 'Din Felsefesi',
          'Siyaset Felsefesi', 'Bilim Felsefesi',
        ],
      },
      {
        id: 'tytdin', label: 'Din Kültürü', renk: '#059669',
        konular: [
          "İslam'ın İnanç Esasları", 'İbadet', "Hz. Muhammed'in Hayatı",
          'İslam Düşüncesinde Yorumlar', 'Ahlak ve Değerler', 'Yaşayan Dünya Dinleri',
        ],
      },
    ],
  },

  // ── AYT Sayısal ───────────────────────────────────────────────────────────
  {
    anahtar: 'ayt_sayisal',
    dersler: [
      {
        id: 'aytmat', label: 'Matematik', renk: '#5B4FE8',
        konular: [
          'Temel Kavramlar', 'Rasyonel Sayılar', 'Üslü Sayılar', 'Köklü Sayılar',
          'Çarpanlara Ayırma', 'Denklem Çözme', 'Oran-Orantı', 'Problemler',
          'Fonksiyonlar', 'Kümeler', 'Permütasyon', 'Kombinasyon', 'Binom', 'Olasılık', 'İstatistik',
          '2. Dereceden Denklemler', 'Karmaşık Sayılar', 'Parabol', 'Polinomlar',
          'Mantık', 'Eşitsizlikler', 'Logaritma', 'Diziler', 'Seriler',
          'Limit ve Süreklilik', 'Türev', 'İntegral',
          'Üçgende Açılar', 'Dik ve Özel Üçgenler', 'Trigonometrik Bağıntılar',
          'Üçgende Alanlar', 'Üçgende Eşlik ve Benzerlik', 'Çokgenler', 'Dörtgenler',
          'Çemberde Açılar ve Uzunluk', 'Daire', 'Prizmalar', 'Piramitler', 'Küre',
          'Koordinat Düzlemi', 'Vektörler', 'Doğrunun Analitiği', 'Trigonometri',
          'Çemberin Analitiği', 'Elips', 'Hiperbol',
        ],
      },
      {
        id: 'fiz', label: 'Fizik', renk: '#3B82F6',
        konular: [
          'Vektörler', 'Bağıl Hareket', "Newton'un Hareket Yasaları",
          'Bir Boyutta Sabit İvmeli Hareket', 'İki Boyutta Sabit İvmeli Hareket',
          'Enerji ve Hareket', 'İtme ve Çizgisel Momentum', 'Tork', 'Denge', 'Basit Makineler',
          'Elektriksel Kuvvet ve Elektrik Alanı', 'Elektriksel Potansiyel',
          'Düzgün Elektrik Alanı ve Sığa', 'Manyetizma ve Elektromanyetik İndükleme',
          'Alternatif Akım', 'Transformatörler',
          'Düzgün Çembersel Hareket', 'Dönerek Öteleme Hareketi',
          'Açısal Momentum', 'Kütle Çekimi ve Kepler Kanunu', 'Basit Harmonik Hareket',
          'Dalgalarda Kırınım, Girişim ve Doppler', 'Elektromanyetik Dalgalar',
          'Atom Fiziğine Giriş ve Radyoaktivite',
          'Özel Görelilik', 'Kuantum Fiziğine Giriş', 'Fotoelektrik Olayı',
        ],
      },
      {
        id: 'kim', label: 'Kimya', renk: '#10B981',
        konular: [
          'Modern Atom Teorisi', 'Kimyasal Hesaplamalar', 'Gazlar', 'Sıvı Çözeltiler',
          'Kimya ve Enerji', 'Tepkimelerde Hız', 'Kimyasal Denge',
          'Sıvı Çözeltilerde Denge', 'Kimya ve Elektrik (Elektrokimya)',
          'Karbon Kimyasına Giriş', 'Organik Bileşikler', 'Hayatımızdaki Kimya',
        ],
      },
      {
        id: 'biy', label: 'Biyoloji', renk: '#EC4899',
        konular: [
          'Biyoloji Bilimi ve İnorganik Bileşikler', 'Organik Bileşikler', 'Hücre',
          'Madde Geçişleri', 'DNA-RNA', 'Protein Sentezi', 'Enzimler',
          'Canlıların Sınıflandırılması', 'Ekoloji', 'Hücre Bölünmeleri',
          'Eşeysiz ve Eşeyli Üreme', 'İnsanda Üreme ve Gelişme', 'Mendel Genetiği',
          'Kan Grupları', 'Cinsiyete Bağlı Kalıtım', 'Biyoteknoloji ve Evrim',
          'Solunum', 'Fotosentez', 'Kemosentez', 'Bitki Biyolojisi',
          'Sistemler (Sindirim, Dolaşım, Boşaltım vb.)', 'Duyu Organları',
        ],
      },
    ],
  },

  // ── AYT Eşit Ağırlık ──────────────────────────────────────────────────────
  {
    anahtar: 'ayt_ea',
    dersler: [
      { id: 'aytmat', label: 'Matematik', renk: '#5B4FE8', konular: null }, // tyt'den paylaşımlı
      {
        id: 'ede', label: 'Edebiyat', renk: '#F59E0B',
        konular: [
          'Güzel Sanatlar ve Edebiyat', 'Metinlerin Sınıflandırılması',
          'Coşku ve Heyecanı Dile Getiren Metinler (Şiir)', 'Şiir Bilgisi', 'Nazım Biçimleri',
          'Edebi Sanatlar (Söz Sanatları)', 'Olay Çevresinde Oluşan Metinler',
          'Öğretici Metinler', 'Sözlü Anlatım Türleri',
          'İslamiyet Öncesi Türk Edebiyatı', 'İslami Dönem İlk Eserler', 'Halk Edebiyatı',
          'Divan Edebiyatı', 'Tanzimat Edebiyatı', 'Servetifünun Edebiyatı',
          'Fecriati Edebiyatı', 'Milli Edebiyat', 'Cumhuriyet Dönemi Türk Edebiyatı',
          'Edebi Akımlar', 'Dünya Edebiyatı',
        ],
      },
      {
        id: 'tar', label: 'Tarih-1', renk: '#F43F5E',
        konular: [
          'Tarih Bilimine Giriş', 'İlk Çağ Uygarlıkları', 'İslam Medeniyeti',
          'Türk-İslam Devletleri', 'Osmanlı Devleti Kuruluş ve Yükseliş',
          'Osmanlı Klasik Çağda Değişim', 'Osmanlı Gerileme ve Çöküş',
          'I. Dünya Savaşı', 'Kurtuluş Savaşı', 'Atatürk Dönemi ve İnkılaplar',
        ],
      },
      {
        id: 'cog', label: 'Coğrafya-1', renk: '#8B5CF6',
        konular: [
          'Doğal Sistemler', 'Beşeri Sistemler',
          "Mekansal Bir Sentez: Türkiye", 'Küresel Ortam: Bölgeler ve Ülkeler', 'Çevre ve Toplum',
        ],
      },
    ],
  },

  // ── AYT Sözel ─────────────────────────────────────────────────────────────
  {
    anahtar: 'ayt_sozel',
    dersler: [
      { id: 'ede', label: 'Edebiyat', renk: '#F59E0B', konular: null }, // ea'dan paylaşımlı
      { id: 'tar', label: 'Tarih-1', renk: '#F43F5E', konular: null },
      { id: 'cog', label: 'Coğrafya-1', renk: '#8B5CF6', konular: null },
      {
        id: 'tar2', label: 'Tarih-2', renk: '#EF4444',
        konular: [
          "Osmanlı Devleti'nde Değişme ve Süreklilik",
          'Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti',
          '19. Yüzyılda Değişim ve Diplomasi', '20. Yüzyıl Başlarında Osmanlı Devleti',
          "Birinci Dünya Savaşı'nda Osmanlı", "Cumhuriyetin İlk Yılları",
          'Türkiye Cumhuriyeti Tarihi', 'İkinci Dünya Savaşı ve Sonrası',
          'Soğuk Savaş Dönemi', 'Yakın Dönem Türkiye Tarihi',
        ],
      },
      {
        id: 'cog2', label: 'Coğrafya-2', renk: '#7C3AED',
        konular: [
          "Mekânsal Bir Sentez: Türkiye", "Türkiye'de Nüfus ve Yerleşme",
          "Türkiye'nin Ekonomisi", 'Küresel Ortam: Bölgeler ve Ülkeler',
          'Çevre ve Toplum', 'Küreselleşen Dünya',
        ],
      },
      {
        id: 'fel', label: 'Felsefe Grubu', renk: '#0891B2',
        konular: [
          'Felsefeye Giriş', 'Bilgi Felsefesi', 'Varlık Felsefesi',
          'Ahlak Felsefesi', 'Siyaset Felsefesi', 'Din Felsefesi',
          'Sanat Felsefesi', 'Bilim Felsefesi',
          'Mantığa Giriş', 'Klasik Mantık', 'Mantık ve Dil', 'Sembolik Mantık',
          'Psikolojinin Temel Süreçleri', 'Öğrenme, Bellek, Düşünme', 'Ruh Sağlığının Temelleri',
          'Birey ve Toplum', 'Toplumsal Yapı', 'Toplumsal Değişme ve Gelişme',
          'Toplum ve Kültür', 'Toplumsal Kurumlar',
        ],
      },
      {
        id: 'din', label: 'Din Kültürü', renk: '#059669',
        konular: [
          "İslam'ın İnanç Esasları", 'İbadet', "Hz. Muhammed'in Hayatı",
          'İslam Düşüncesinde Yorumlar', 'Ahlak ve Değerler', 'Yaşayan Dünya Dinleri',
        ],
      },
    ],
  },

  // ── AYT Dil ───────────────────────────────────────────────────────────────
  {
    anahtar: 'ayt_dil',
    dersler: [
      {
        id: 'yabdil', label: 'Yabancı Dil', renk: '#0EA5E9',
        konular: [
          'Vocabulary', 'Grammar', 'Reading Comprehension',
          'Dialogue Completion', 'Paragraph Completion', 'Translation',
        ],
      },
    ],
  },

  // ── 7. Sınıf Ortaokul ─────────────────────────────────────────────────────
  {
    anahtar: 'ortaokul7',
    dersler: [
      {
        id: 'tur7', label: 'Türkçe', renk: '#F59E0B',
        konular: [
          'Sözcükte Anlam', 'Cümlede Anlam', 'Paragrafta Anlam',
          'Söz Varlığı (Deyim, Atasözü)', 'Ses Bilgisi (Ses Uyumları)',
          'Sözcüğün Yapısı (Yapım ve Çekim Ekleri)', 'Sözcük Türleri',
          'Fiil ve Fiil Çekimi', 'Cümlenin Ögeleri',
          'Yazım Kuralları', 'Noktalama İşaretleri',
        ],
      },
      {
        id: 'mat7', label: 'Matematik', renk: '#5B4FE8',
        konular: [
          'Tam Sayılar', 'Rasyonel Sayılar', 'Mutlak Değer',
          'Cebirsel İfadeler', 'Denklemler', 'Eşitsizlikler',
          'Oran ve Orantı', 'Yüzde ve Faiz', 'Doğrusal Denklem ve Grafik',
          'Çember ve Daire (giriş)', 'Üçgenler', 'Katı Cisimler',
          'Veri Analizi', 'Olasılık (giriş)',
        ],
      },
      {
        id: 'fen7', label: 'Fen Bilimleri', renk: '#10B981',
        konular: [
          'Güneş Sistemi ve Ötesi', 'Hücre ve Bölünmeler',
          'Kuvvet ve Enerji (Basınç, Kaldırma, Newton)',
          'Elektrik Devreleri ve Direnç',
          'Karışımlar (Heterojen, Homojen, Çözünürlük)',
          'Canlılarda Üreme ve Gelişme', 'Ekoloji ve Çevre',
        ],
      },
      {
        id: 'sosyal7', label: 'Sosyal Bilgiler', renk: '#F43F5E',
        konular: [
          'İletişim ve İnsan İlişkileri', 'Nüfus ve Göç',
          "Ülkemizin Ekonomisi (Tarım, Sanayi, Hizmet)",
          "Türkiye'de Demokrasi", 'Küresel Bağlantılar',
          'Atatürk ve Türk İnkılabı', 'Farklı Kültürler, Farklı Yaşamlar',
        ],
      },
      {
        id: 'din7', label: 'Din Kültürü ve Ahlak Bilgisi', renk: '#059669',
        konular: [
          "Hz. Muhammed'in Hayatından Kesitler",
          "Kur'an'ı Anlama ve Yorumlama",
          "İslam'ın İnanç Esasları (Melekler, Kitaplar, Peygamberler)",
          "İslam'ın İbadet Boyutu", "İslam'da Ahlak ve Değerler",
          'Farklı Kültürlerde Din', 'Sosyal Hayatta Din',
        ],
      },
      {
        id: 'ing7', label: 'İngilizce', renk: '#0891B2',
        konular: [
          'Appearance and Personality', 'Sports', 'Biomes and Environment',
          'Celebrations', 'Food and Eating', 'My Town', 'Travel', 'Communication',
          'Grammar: Past Simple, Comparative, Superlative',
          'Modal Verbs (should/must/have to)', 'Relative Clauses (giriş)',
        ],
      },
    ],
  },

  // ── 9. Sınıf TYMM ─────────────────────────────────────────────────────────
  {
    anahtar: 'lise9_tymm',
    dersler: [
      {
        id: 'tde910', label: 'Türk Dili ve Edebiyatı', renk: '#F59E0B',
        konular: [
          'Türkçenin Tarihi Gelişimi ve Türk Dili Aileleri',
          'Ses ve Ses Bilgisi', 'Kelime Yapısı', 'Cümle Yapısı ve Ögeleri',
          'Anlatım Biçimleri ve Türleri',
          'Şiir Bilgisi (Nazım, Ölçü, Uyak)', 'Şiir Türleri',
          'Olay Çevresinde Oluşan Metinler (Hikâye, Destan, Masal, Efsane)',
          'Öğretici Metinler (Deneme, Makale, Fıkra)',
          'İslamiyet Öncesi Türk Edebiyatı', 'İslami Dönem İlk Eserler',
        ],
      },
      {
        id: 'mat910', label: 'Matematik', renk: '#5B4FE8',
        konular: [
          'Kümeler', 'Mantık', 'Gerçek Sayılar', 'Üslü ve Köklü İfadeler',
          'Mutlak Değer', 'Birinci Dereceden Denklemler ve Eşitsizlikler',
          'Oran ve Orantı', 'Doğrusal Fonksiyonlar',
          'Üçgenler', 'Çember ve Daire', 'Koordinat Geometrisi (giriş)',
          'Permütasyon ve Kombinasyon', 'Olasılık', 'Veri ve İstatistik',
        ],
      },
      {
        id: 'fiz910', label: 'Fizik', renk: '#3B82F6',
        konular: [
          'Fizik Bilimine Giriş (Ölçme, Birim, Vektör)',
          'Madde ve Özellikleri', 'Hareket (Konum, Hız, İvme)',
          "Newton'un Hareket Yasaları", 'İş, Güç, Enerji', 'Isı ve Sıcaklık', 'Gazlar (giriş)',
        ],
      },
      {
        id: 'kim910', label: 'Kimya', renk: '#10B981',
        konular: [
          'Kimya Bilimine Giriş', 'Atom ve Modern Atom Teorisi',
          'Periyodik Sistem', 'Kimyasal Bağlar',
          'Maddenin Halleri (Katı, Sıvı, Gaz)', 'Saf Madde ve Karışımlar',
          'Kimyasal Hesaplamalar (Mol Kavramı)',
        ],
      },
      {
        id: 'biy910', label: 'Biyoloji', renk: '#EC4899',
        konular: [
          'Canlıların Ortak Özellikleri', 'Canlıların Temel Bileşenleri (İnorganik)',
          'Organik Bileşikler (Karbonhidrat, Protein, Yağ)', 'Hücre',
          'Canlıların Sınıflandırılması', 'Ekosistem Ekolojisi',
        ],
      },
      {
        id: 'tar910', label: 'Tarih', renk: '#F43F5E',
        konular: [
          'Tarih Bilimine Giriş', 'Tarih Öncesi Çağlar',
          'İlk Uygarlıklar (Mezopotamya, Mısır, Ege, Anadolu)',
          "İslamiyet'in Doğuşu", 'İlk Türk-İslam Devletleri',
          'Türkiye Selçuklu Devleti', 'Moğol İstilası',
        ],
      },
      {
        id: 'cog910', label: 'Coğrafya', renk: '#8B5CF6',
        konular: [
          'Doğa ve İnsan', "Dünyanın Şekli ve Hareketleri", 'Harita Bilgisi',
          'Litosfer (Kayaçlar, Yerşekilleri)', 'Atmosfer (İklim Tipleri)',
          'Hidrosfer', 'Biyosfer (Biyomlar, Ekosistem)', 'Nüfus',
        ],
      },
      {
        id: 'fel910', label: 'Felsefe', renk: '#0891B2',
        konular: [
          'Felsefenin Tanımı, Konusu ve Önemi',
          'Felsefi Düşünce ile Bilimsel / Dini Düşüncenin Farkı',
          'Bilgi Felsefesi (Epistemoloji) — Bilginin Kaynağı ve Sınırları',
          'Varlık Felsefesi (Ontoloji)', 'Ahlak Felsefesi (Etik) Giriş',
        ],
      },
      {
        id: 'din910', label: 'Din Kültürü ve Ahlak Bilgisi', renk: '#059669',
        konular: [
          "İslam'ın İnanç Esasları (Tevhid, Nübüvvet, Ahiret)",
          'İslam ve Bilim', 'Hz. Muhammed ve Evrensel İlkeler',
          'İbadet ve Günlük Hayat', "İslam'da Ahlak ve Değerler", 'Dinlerin Ortak Değerleri',
        ],
      },
      {
        id: 'ing910', label: 'İngilizce', renk: '#0EA5E9',
        konular: [
          'Relationships', 'Hobbies and Skills', 'Legends', 'Values and Norms',
          'The Future', 'Bridging Cultures', 'Natural Disasters', 'Digital World',
          'Grammar: Tenses Review, Modals, Passives, Conditionals, Reported Speech',
          'Relative Clauses', 'Linkers and Discourse Markers',
        ],
      },
    ],
  },

  // ── 10. Sınıf TYMM ────────────────────────────────────────────────────────
  {
    anahtar: 'lise10_tymm',
    dersler: [
      {
        id: 'tde910', label: 'Türk Dili ve Edebiyatı', renk: '#F59E0B',
        konular: [
          'Divan Edebiyatı', 'Halk Edebiyatı (Tekke, Âşık, Anonim)',
          'Anlatmaya Bağlı Edebi Metinler (Roman, Hikâye)',
          'Göstermeye Bağlı Edebi Metinler (Tiyatro, Trajedi, Komedi)',
          'Tanzimat Dönemi Edebiyatı', 'Servetifünun Edebiyatı',
          'Yazılı Anlatım (Makale, Deneme)', 'Sözlü Anlatım',
        ],
      },
      {
        id: 'mat910', label: 'Matematik', renk: '#5B4FE8',
        konular: [
          'İkinci Dereceden Denklemler ve Eşitsizlikler', 'Parabol', 'Polinomlar',
          'Trigonometri (Radyan, Temel Formüller)', 'Logaritma',
          'Diziler (Aritmetik ve Geometrik)', 'Permütasyon ve Kombinasyon', 'Binom', 'Olasılık',
          'Koordinat Geometrisi (Analitik)', 'Çemberin Analitiği (giriş)',
        ],
      },
      {
        id: 'fiz910', label: 'Fizik', renk: '#3B82F6',
        konular: [
          'Elektrostatik (Coulomb Yasası, Elektrik Alanı)',
          'Elektrik Devreleri (Direnç, Ohm, Kirchhoff)', 'Manyetizma',
          'Düzgün Çembersel Hareket', 'Basit Harmonik Hareket',
          'Dalgalar (Mekanik Dalgalar, Ses)', 'Optik (Kırılma, Yansıma)',
        ],
      },
      {
        id: 'kim910', label: 'Kimya', renk: '#10B981',
        konular: [
          'Gazlar (İdeal Gaz, Kinetik Teori)', 'Çözeltiler (Derişim, Çözünürlük)',
          'Kimyasal Tepkimeler (Denklem Denkleştirme, Stokiyometri)',
          'Tepkimelerde Hız', 'Kimyasal Denge', 'Asit-Baz Dengesi', 'Elektrokimya (giriş)',
        ],
      },
      {
        id: 'biy910', label: 'Biyoloji', renk: '#EC4899',
        konular: [
          'Hücre Bölünmeleri (Mitoz, Mayoz)', 'Kalıtım (Mendel Yasaları)',
          'Kan Grupları ve Cinsiyete Bağlı Kalıtım',
          'İnsanda Sindirim Sistemi', 'İnsanda Dolaşım Sistemi',
          'İnsanda Boşaltım Sistemi', 'İnsanda Sinir Sistemi', 'Biyoteknoloji',
        ],
      },
      {
        id: 'tar910', label: 'Tarih', renk: '#F43F5E',
        konular: [
          "Osmanlı Devleti'nin Kuruluşu ve Yükselişi", 'Osmanlı Klasik Çağı',
          'Coğrafi Keşifler ve Rönesans', 'Reform ve Mezhep Savaşları',
          '17-18. Yüzyıl Osmanlı Değişimi', 'Aydınlanma Çağı',
          '19. Yüzyılda Osmanlı (Islahat, Tanzimat)',
        ],
      },
      {
        id: 'cog910', label: 'Coğrafya', renk: '#8B5CF6',
        konular: [
          "Türkiye'nin Yüzey Şekilleri", "Türkiye'nin İklimi",
          "Türkiye'nin Nüfusu ve Yerleşmesi", "Türkiye'nin Ekonomisi (Tarım, Sanayi, Ticaret)",
          'Türkiye Coğrafi Bölgeleri', 'Doğal Afetler ve Risk',
        ],
      },
      {
        id: 'fel910', label: 'Felsefe', renk: '#0891B2',
        konular: [
          'Bilim Felsefesi', 'Siyaset Felsefesi', 'Estetik (Sanat Felsefesi)',
          'Din Felsefesi', 'Çevre Felsefesi',
        ],
      },
      {
        id: 'din910', label: 'Din Kültürü ve Ahlak Bilgisi', renk: '#059669',
        konular: [
          "Hz. Peygamber'in Kronolojisi", "İslam'da Sosyal Dayanışma (Zekat, Sadaka, Vakıf)",
          "İslam'da Aile ve Toplum", 'Diğer İnanç Sistemleri (Yahudilik, Hristiyanlık, Budizm)',
          "İslam'da Evrensel Değerler",
        ],
      },
      {
        id: 'ing910', label: 'İngilizce', renk: '#0EA5E9',
        konular: [
          'Health and Lifestyle', 'Plans and Wishes', 'Invitations and Suggestions',
          'Life Experiences', 'Social Media and Communication',
          'Environment and Climate', 'Academic Reading Comprehension', 'Essay Writing',
          'Advanced Grammar: Mixed Conditionals, Subjunctive, Discourse Markers',
        ],
      },
    ],
  },
];

// ─── Seed Fonksiyonu ─────────────────────────────────────────────────────────

async function seedSegment(segment) {
  const { anahtar, dersler } = segment;
  console.log(`\n📚 ${anahtar} seeding...`);
  let toplamEklendi = 0;

  const batch = db.batch();
  let batchBoyut = 0;

  for (const ders of dersler) {
    if (!ders.konular) continue; // null → paylaşımlı, atla
    let sira = 1;
    for (const konu of ders.konular) {
      const ref = db.collection('mufredat').doc(anahtar).collection('konular').doc();
      const veri = {
        dersId:    ders.id,
        dersLabel: ders.label,
        dersRenk:  ders.renk,
        konu,
        sira,
        kritik:    false,
        olusturma: admin.firestore.FieldValue.serverTimestamp(),
      };
      if (!DRY) batch.set(ref, veri);
      sira++;
      batchBoyut++;
      toplamEklendi++;

      // Firestore batch max 500
      if (batchBoyut === 490) {
        if (!DRY) await batch.commit();
        batchBoyut = 0;
        console.log(`  ... ara commit yapıldı (${toplamEklendi})`);
      }
    }
    console.log(`  ✓ ${ders.label}: ${ders.konular.length} konu`);
  }

  if (batchBoyut > 0 && !DRY) await batch.commit();
  console.log(`  → ${anahtar}: toplam ${toplamEklendi} konu ${DRY ? '(DRY — yazılmadı)' : 'Firestore\'a eklendi'}`);
}

async function main() {
  console.log(`\n🌱 ElsWay Müfredat Seed Başlıyor — proje: kocpaneli`);
  console.log(DRY ? '⚠️  DRY RUN: Firestore\'a yazılmıyor\n' : '🔴 CANLI: Firestore\'a yazılıyor\n');

  for (const seg of SEGMENTLER) {
    await seedSegment(seg);
  }

  console.log('\n✅ Seed tamamlandı!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
