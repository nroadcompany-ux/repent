import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Legacy AI/VGL suites under tests/g07 and tests/vgl are standalone .mjs
    // runners (see package.json "test:g07"); they are not Vitest specs.
    include: ['src/**/*.test.ts', 'tests/product-lock/**/*.test.ts'],
  },
});
