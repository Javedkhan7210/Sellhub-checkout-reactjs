import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tap-payments/gosell': fileURLToPath(new URL('./node_modules/@tap-payments/gosell/dist/index.js', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['@tap-payments/gosell'],
    exclude: [],
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  server: {
    allowedHosts: ['8caf805339f5.ngrok-free.app'], // ✅ add your ngrok host here

    proxy: {
      '/api': {
        target: 'https://paymentapi.sellhub.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),

      },
    },
  },
  
});
