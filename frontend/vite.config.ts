import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-icon.jpg'],
      manifest: {
        name: 'SnapLinks',
        short_name: 'SnapLinks',
        description: 'End-to-End Encrypted P2P Chat',
        theme_color: '#10b981',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/logo-icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/logo-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: '/logo-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      },
      '/peerjs': {
        target: 'http://localhost:3001',
        ws: true
      }
    }
  }
});
