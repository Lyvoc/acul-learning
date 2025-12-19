import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@screens': resolve(__dirname, './src/screens'),
      '@styles': resolve(__dirname, './src/styles')
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'index') {
            return 'assets/main.[hash].js';
          }
          return 'assets/[name].[hash].js';
        },
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'main.css') {
            return 'assets/main.[hash].[ext]';
          }
          return 'assets/[name].[hash].[ext]';
        },
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
          }
          // Split screens into separate chunks
          if (id.includes('src/login-id')) {
            return 'login-id';
          }
          if (id.includes('src/signup')) {
            return 'signup';
          }
          if (id.includes('src/consent')) {
            return 'consent';
          }
        }
      }
    },
    cssCodeSplit: true
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  preview: {
    port: 8080,
    cors: true
  }
});