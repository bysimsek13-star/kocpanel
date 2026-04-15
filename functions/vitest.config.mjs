import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/**/*.test.js'],
    setupFiles: ['./__tests__/setup.js'],
    // firebase-admin alt paketlerini Vitest'in transform pipeline'ından geçir
    // böylece vi.mock() CJS require() çağrılarını doğru intercept eder
    server: {
      deps: {
        inline: ['firebase-admin', 'firebase-functions'],
      },
    },
  },
});
