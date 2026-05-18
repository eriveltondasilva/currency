import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    benchmark: {
      include: ['benchmarks/**/*.ts'],
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types.ts', 'src/**/index.ts', 'src/demo.ts', 'src/lib/currencies.ts'],
    },
  },
});
