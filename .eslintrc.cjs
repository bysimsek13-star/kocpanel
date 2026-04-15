module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: { presets: ['@babel/preset-react'] },
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    // React 17+ JSX transform — prop-types zorunlu değil
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // JSX içinde kaçırılmamış entities — pre-existing kod genelinde çok yaygın
    'react/no-unescaped-entities': 'off',
    // Kullanılmayan değişkenler: parametreleri görmezden gel
    'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    // Hooks kuralları
    'react-hooks/rules-of-hooks': 'error',
    // exhaustive-deps: pre-existing codebase genelinde çok fazla — warn olarak bırak
    'react-hooks/exhaustive-deps': 'off',
    // Genel
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    // Boş bloklar production'da warn, test dosyalarında yaygın pattern
    'no-empty': ['warn', { allowEmptyCatch: true }],
  },
  overrides: [
    // ── Test dosyaları: vitest global'leri + node ortamı ──────────────────────
    {
      files: [
        'src/**/*.test.js',
        'src/**/*.test.jsx',
        'src/**/*.spec.js',
        'src/App.test.js',
        'src/__tests__/**/*.js',
      ],
      env: {
        node: true,       // process, global vb.
        browser: true,
      },
      globals: {
        describe:  'readonly',
        it:        'readonly',
        test:      'readonly',
        expect:    'readonly',
        beforeAll: 'readonly',
        afterAll:  'readonly',
        beforeEach:'readonly',
        afterEach: 'readonly',
        vi:        'readonly',
        vitest:    'readonly',
      },
      rules: {
        // Test dosyalarında unused import/var çok yaygın — kapat
        'no-unused-vars': 'off',
        // Test dosyalarında catch blokları boş olabilir
        'no-empty': 'off',
        // Test dosyalarında console kullanımı kabul edilebilir
        'no-console': 'off',
      },
    },
  ],
};
