// Uygulama geneli sabitler — hem frontend hem Cloud Functions aynı değerleri kullanır.
// Frontend tarafı: src/utils/sabitler.js (ESM mirror)

const RISK_DURUM = {
  YOK: 'yok',
  RISK_ALTINDA: 'risk_altinda',
  YUKSEK_RISK: 'yuksek_risk',
};

module.exports = { RISK_DURUM };
