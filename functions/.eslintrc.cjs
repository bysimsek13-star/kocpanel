module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    // console.warn/error izinli, console.log üretimde uyarı verir
    // Cloud Logging'de her log entry maliyet + dahili veri sızıntısı riski taşır
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
  },
};
