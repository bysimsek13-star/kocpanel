import { useMemo } from 'react';

/**
 * Okunmamış mesaj sayısını ogrenciler root dokümanındaki
 * `okunmamisMesajSayisi` alanından okur.
 *
 * Eski yaklaşım: öğrenci başına 1 onSnapshot (N gerçek zamanlı listener)
 * Yeni yaklaşım: hiç Firestore isteği yok — useKocVeri'nin zaten yüklediği
 *               ogrenciler dizisindeki aggregate alan okunur.
 *
 * Alan kim günceller?
 *  - Artış: mesajOkunmamisArt Cloud Function (öğrenci mesaj yazınca)
 *  - Sıfırlama: koç mesaj ekranını açınca istemci updateDoc ile 0 yazar
 */
export default function useOkunmamis(ogrenciler) {
  const okunmasisMap = useMemo(() => {
    const map = {};
    ogrenciler.forEach(o => {
      map[o.id] = o.okunmamisMesajSayisi || 0;
    });
    return map;
  }, [ogrenciler]);

  const toplamOkunmamis = useMemo(
    () => Object.values(okunmasisMap).reduce((t, v) => t + v, 0),
    [okunmasisMap]
  );

  return { okunmasisMap, toplamOkunmamis };
}
