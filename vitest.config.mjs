import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ include: /\.[jt]sx?$/ })],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/__tests__/**/*.test.js'],
    // firestore_rules.test.js gerçek emülatör gerektirir — ayrı script: npm run test:rules
    exclude: ['src/__tests__/firestore_rules.test.js'],
    setupFiles: ['src/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/**',
        'src/data/**',
        'src/koc/hedef/hedefUtils.js',
        'src/koc/ui/KocSolMenu.js',
        'src/koc/ui/KocHeroKart.js',
        'src/koc/ui/KocVeriGirisiKart.js',
        'src/koc/ui/KocMesajUyari.js',
        'src/ogrenci/GeriSayimKart.js',
        'src/ogrenci/deneme/DersKarti.js',
      ],
      exclude: [
        'src/__tests__/**',
        'src/firebase.js',
        '**/*.config.*',
        'src/utils/adminUtils.js',
        'src/utils/aktiflikKaydet.js',
        'src/utils/auditLog.js',
        'src/utils/fcmToken.js',
        'src/utils/izleme.js',
      ],
      thresholds: {
        lines:      90,
        functions:  90,
        branches:   80,
        statements: 90,
      },
    },
  },
});
