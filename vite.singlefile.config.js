import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile()
  ],
  // Empty base so all asset paths are relative — required for file:// opening
  base: '',
  resolve: {
    alias: [
      {
        // Swap fetch-based data loading for bundled JSON.
        // Regex matches raw import strings like './rawDataProvider' (no /services/ prefix).
        // The pattern avoids matching rawDataProvider.embedded itself.
        find: /^(\.\/)?rawDataProvider(\.js)?$/,
        replacement: path.resolve(__dirname, 'src/services/rawDataProvider.embedded.js')
      },
      {
        // dataService fetches benchmarks and services.json — replace with embedded.
        find: /(.*)\/services\/dataService$/,
        replacement: path.resolve(__dirname, 'src/services/dataService.embedded.js')
      }
    ]
  },
  build: {
    outDir: 'dist-singlefile',
    // Don't copy public/ — embedded data services inline everything
    copyPublicDir: false,
    // Inline everything — no size limit warnings
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Single JS chunk so the plugin can inline it
        inlineDynamicImports: true
      }
    }
  }
});
