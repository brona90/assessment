import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.js',
        '**/*.spec.jsx',
        '**/*.test.js',
        '**/*.test.jsx',
        '**/*.css',
        '**/*.svg',
        'src/main.jsx',
        'vite.config.js',
        'vitest.config.js'
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      }
    }
  }
})
