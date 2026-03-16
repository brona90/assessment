import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/assessment/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts'
          }
          if (id.includes('exceljs')) {
            return 'excel'
          }
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
