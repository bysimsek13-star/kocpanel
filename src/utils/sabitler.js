// Uygulama geneli sabitler — hem frontend hem Cloud Functions aynı değerleri kullanır.
// CF tarafı: functions/sabitler.js (CommonJS mirror)

export const RISK_DURUM = {
  YOK: 'yok',
  RISK_ALTINDA: 'risk_altinda',
  YUKSEK_RISK: 'yuksek_risk',
};
