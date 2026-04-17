// lise10Seed.js — 10. Sınıf Türkiye Yüzyılı Maarif Modeli müfredat ağacı
// Hiyerarşi: Ders (1) → Tema/Ünite (2) → Konu Grubu (3) → Detay (4, seçili dersler)

const n = (ad, c = []) => ({
  ad,
  cocuklar: c.length && typeof c[0] === 'string' ? c.map(a => ({ ad: a, cocuklar: [] })) : c,
});

export { agaciDuzlestir } from './tytMufredatSeed';

export const LISE10_AGAC = [
  n('Türk Dili ve Edebiyatı', [
    n('Tema 1: Sözün Ezgisi', [
      n('Şiir', ['Şiirde anlam ve yapı', 'Şiirde ahenk ve söyleyiş']),
      n('Çözümleme', ['Şiir çözümleme ve yorumlama']),
    ]),
    n('Tema 2: Kelimelerin Ritmi', [
      n('Dil ve Anlam', ['Cümle ve metin yapısı', 'Dilin anlatım gücü', 'Söz varlığı ve kullanım']),
      n('Metin İlişkileri', ['Metinde anlam ilişkileri']),
    ]),
    n('Tema 3: Dünden Bugüne', [
      n('Kültür ve Edebiyat', ['Kültürel birikim', 'Gelenek ve edebiyat ilişkisi']),
      n('Metinler', ['Geçmişten günümüze edebî metinler', 'Metinler arası bağlar']),
    ]),
    n('Tema 4: Nesillerin Mirası', [
      n('Miras ve Değerler', ['Edebî miras', 'Ortak kültürel değerler', 'Kuşaklar arası aktarım']),
      n('Uygulama', ['Okuma yazma ve sözlü anlatım çalışmaları']),
    ]),
  ]),
  n('Matematik', [
    n('Tema 1: Sayılar', [
      'Sayı kümeleriyle işlemler',
      'Sayıların özellikleri',
      'Cebirsel sayı ilişkileri',
    ]),
    n('Tema 2: Nicelikler ve Değişimler', [
      'Fonksiyonel düşünme',
      'Değişim ve ilişki kurma',
      'Nicelikler arası bağlantılar',
    ]),
    n('Tema 3: Sayma Algoritma ve Bilişim', [
      'Sayma stratejileri',
      'Algoritmik düşünme',
      'Problem çözmede işlem basamakları',
    ]),
    n('Tema 4: Geometrik Şekiller', [
      'Doğru açı ve çokgen ilişkileri',
      'Temel geometrik şekiller',
      'Şekiller arası özellikler',
    ]),
    n('Tema 5: Analitik İnceleme', [
      'Koordinat düzlemi',
      'Analitik gösterimler',
      'Doğrusal ilişkiler ve grafikler',
    ]),
    n('Tema 6: İstatistiksel Araştırma Süreci', [
      'Veri toplama',
      'Veri düzenleme',
      'Grafik ve tablo yorumlama',
      'İstatistiksel sonuç çıkarma',
    ]),
    n('Tema 7: Veriden Olasılığa', [
      'Olasılık düşüncesi',
      'Deneysel ve teorik olasılık',
      'Veri temelli tahminler',
    ]),
  ]),
  n('Fizik', [
    n('Ünite 1: Kuvvet ve Hareket', [
      'Hareket türleri',
      'Kuvvet-hareket ilişkisi',
      'Newton yasaları bağlamında yorumlar',
    ]),
    n('Ünite 2: Enerji', ['İş güç ve enerji', 'Enerji dönüşümleri', 'Mekanik enerji ilişkileri']),
    n('Ünite 3: Elektrik', [
      'Elektriksel etkileşimler',
      'Elektrik alanı ve potansiyel',
      'Basit elektriksel sistemler',
    ]),
    n('Ünite 4: Dalgalar', [
      'Dalga türleri',
      'Dalga özellikleri',
      'Dalgaların günlük yaşam uygulamaları',
    ]),
  ]),
  n('Kimya', [
    n('Tema 1: Etkileşim', [
      n('Kimyasal Etkileşimler', [
        'Kimyasal türler arası etkileşimler',
        'Bağ oluşumu ve etkileşim çeşitleri',
      ]),
      n('Tanecikli Yapı', ['Maddenin tanecikli yapısı bağlamında yorumlar']),
    ]),
    n('Tema 2: Çeşitlilik', [
      n('Sınıflandırma', ['Kimyasal maddelerin sınıflandırılması', 'Karışımlar']),
      n('Çözeltiler', ['Çözeltiler', 'Ayırma süreçleri']),
    ]),
    n('Tema 3: Sürdürülebilirlik', [
      'Kimyanın çevre ile ilişkisi',
      'Sürdürülebilir yaşam ve kimya',
      'Günlük yaşamda kimyasal süreçler',
    ]),
  ]),
  n('Biyoloji', [
    n('Tema 1: Enerji', [
      n('Enerji Dönüşümleri', ['Canlılarda enerji dönüşümleri', 'Fotosentez', 'Hücresel solunum']),
      n('Enerji Akışı', ['Enerji akışı ve metabolik süreçler']),
    ]),
    n('Tema 2: Ekoloji', [
      n('Ekosistem', ['Ekosistem bileşenleri', 'Madde döngüleri', 'Enerji akışı']),
      n('Canlı Toplulukları', [
        'Popülasyon komünite ve ekosistem ilişkileri',
        'İnsan ve çevre etkileşimi',
      ]),
    ]),
  ]),
  n('Tarih', [
    n("Ünite 1: Türkistan'dan Türkiye'ye (1040-1299)", [
      'Türk-İslam dünyasının siyasi yapısı',
      "Anadolu'nun Türkleşmesi",
      'Selçuklu dönemi gelişmeleri',
    ]),
    n('Ünite 2: Beylikten Devlete Osmanlı (1299-1453)', [
      "Osmanlı'nın kuruluş süreci",
      'Beylikten devlete geçiş',
      'Erken dönem siyaset ve teşkilatlanma',
    ]),
    n('Ünite 3: Cihan Devleti Osmanlı (1453-1683)', [
      "Osmanlı'nın yükselişi",
      "İstanbul'un fethi sonrası dönüşüm",
      'Siyasi askerî ve idarî güçlenme',
    ]),
    n('Ünite 4: Değişen Dünya Dengeleri Karşısında Osmanlı (1683-1789)', [
      'Güç dengelerindeki değişim',
      "Osmanlı'da dönüşüm arayışları",
      'Avrupa ile ilişkiler',
    ]),
    n('Ünite 5: Devrimler Çağında Devlet-Toplum İlişkileri (1789-1908)', [
      'Modernleşme süreci',
      'Toplum ve devlet yapısındaki değişimler',
      'Yenileşme hareketleri',
    ]),
    n('Ünite 6: Sermaye ve Emek', [
      'Ekonomik dönüşümler',
      'Sanayi ve üretim ilişkileri',
      'Emek ticaret ve toplumsal yapı',
    ]),
  ]),
  n('Coğrafya', [
    n('Ünite 1: Coğrafyanın Doğası', [
      'Coğrafi bakış',
      'İnsan-doğa etkileşimi',
      'Mekânsal düşünme',
    ]),
    n('Ünite 2: Mekânsal Bilgi Teknolojileri', [
      'Harita ve konum bilgisi',
      'Coğrafi veri kullanımı',
      'Teknoloji destekli mekânsal analiz',
    ]),
    n('Ünite 3: Doğal Sistemler ve Süreçler', [
      'İklim sistemleri',
      'Yeryüzü şekilleri',
      'Su toprak ve doğal süreçler',
    ]),
    n('Ünite 4: Beşerî Sistemler ve Süreçler', [
      'Nüfus',
      'Yerleşme',
      'Göç',
      'İnsan faaliyetlerinin mekâna etkisi',
    ]),
    n('Ünite 5: Ekonomik Faaliyetler ve Etkileri', [
      'Tarım sanayi hizmetler',
      'Ekonomik faaliyetlerin dağılışı',
      'Çevresel ve toplumsal etkiler',
    ]),
    n('Ünite 6: Afetler ve Sürdürülebilir Çevre', [
      'Doğal afetler',
      'Risk ve zarar azaltma',
      'Sürdürülebilir çevre yaklaşımı',
    ]),
    n('Ünite 7: Bölgeler Ülkeler ve Küresel Bağlantılar', [
      'Bölge kavramı',
      'Ülkeler arası ilişkiler',
      'Küreselleşme ve mekânsal bağlar',
    ]),
  ]),
  n('Felsefe', [
    n('Ünite 1: Felsefenin Doğası', [
      'Felsefenin anlamı',
      'Felsefi düşüncenin özellikleri',
      'Felsefenin temel işlevi',
    ]),
    n('Ünite 2: Felsefe Mantık ve Argümantasyon', [
      'Akıl yürütme',
      'Temellendirme',
      'Argüman kurma ve çözümleme',
    ]),
    n('Ünite 3: Varlık Felsefesi', ['Varlık problemi', 'Varlığın niteliği', 'Felsefi yaklaşımlar']),
    n('Ünite 4: Bilgi Felsefesi', [
      'Bilginin kaynağı',
      'Doğruluk ve gerçeklik',
      'Bilginin sınırları',
    ]),
    n('Ünite 5: Ahlak Felsefesi', [
      'İyi-kötü problemi',
      'Özgürlük ve sorumluluk',
      'Ahlaki kararlar',
    ]),
    n('Ünite 6: Estetik ve Sanat Felsefesi', [
      'Güzellik ve estetik',
      'Sanat eseri',
      'Sanatın anlamı',
    ]),
    n('Ünite 7: Siyaset Felsefesi', ['Adalet', 'Devlet', 'İktidar ve meşruiyet']),
    n('Ünite 8: Din Felsefesi', [
      'İnanç ve akıl ilişkisi',
      'Tanrı evren ve insan',
      'Dinî düşüncenin felsefi yorumu',
    ]),
    n('Ünite 9: Bilim Felsefesi', [
      'Bilimsel bilginin yapısı',
      'Bilim ve yöntem',
      'Bilimin sınırları',
    ]),
  ]),
  n('Din Kültürü ve Ahlak Bilgisi', [
    n("Ünite 1: İslam'da Varlık ve Bilgi", [
      'Varlık anlayışı',
      'Bilgi kaynakları',
      'İslam düşüncesinde bilgi',
    ]),
    n("Ünite 2: Allah'ı Tanımak", [
      "Allah'ın varlığı ve birliği",
      'İsim ve sıfatlar',
      'İnsanın Allah ile ilişkisi',
    ]),
    n("Ünite 3: İslam'ın Evrensel Mesajları", [
      'Evrensel ahlak ilkeleri',
      'İnsanlık için ortak değerler',
      "İslam'ın kuşatıcı mesajı",
    ]),
    n('Ünite 4: Din Çevre ve Teknoloji', [
      'Din ve çevre bilinci',
      'Teknolojinin etik boyutu',
      'Sorumluluk ve denge',
    ]),
    n('Ünite 5: İslam Düşüncesinde İtikadî Siyasî ve Fıkhî Yorumlar', [
      'Yorum farklılıkları',
      'Mezhep ve yorum gelenekleri',
      'İslam düşüncesinde çoğul yapı',
    ]),
  ]),
  n('İngilizce', [
    n('Theme 1: School Life & Education', [
      'Education',
      'School routines',
      'Learning environments',
    ]),
    n('Theme 2: Classroom Life & Learning', [
      'Classroom communication',
      'Learning strategies',
      'Study habits',
    ]),
    n('Theme 3: Personal Life & Well-Being', ['Health', 'Daily life', 'Personal development']),
    n('Theme 4: Family Life & Home', ['Family relations', 'Home life', 'Responsibilities']),
    n('Theme 5: Neighbourhood City & Social Life', [
      'Community life',
      'Social interaction',
      'City and neighbourhood contexts',
    ]),
    n('Theme 6: World & Culture', ['Culture', 'Global awareness', 'Intercultural communication']),
    n('Theme 7: Nature & Global Problems', ['Nature', 'Environment', 'Global issues']),
    n('Theme 8: Universe & The Future', ['Space', 'Future life', 'Science and imagination']),
  ]),
];
