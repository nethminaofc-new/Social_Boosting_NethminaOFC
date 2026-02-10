import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Crucial for GitHub Pages deployment to work on subpaths
  define: {
    // Polyfill process.env for the geminiService to prevent runtime errors in browser
    'process.env': {},
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
