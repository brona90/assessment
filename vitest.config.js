import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    // Suppress React act warnings in test output
    onConsoleLog: (log, type) => {
      if (log.includes('act(...)') && type === 'warning') {
        return false
      }
    }
  }
})