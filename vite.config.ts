import { fileURLToPath, URL } from 'node:url';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Keep browser requests same-origin in development.
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'https://startlift.duckdns.org',
        changeOrigin: true,
      },
    },
  },
});
