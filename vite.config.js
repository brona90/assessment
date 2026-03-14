import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/assessment/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'charts': ['chart.js', 'react-chartjs-2'],
          'excel': ['exceljs']
        }
      }
    }
  },
  server: {
    host: true,
    watch: {
      // Also watch public/data JSON files so changes trigger a full reload
      include: ['src/**', 'public/data/**']
    }
  }
})
