import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{png,jpg,jpeg,gif,svg,mp4,webm,ogg,mp3,wav}'],
      manifest: {
        name: 'Digiturno - Visor',
        short_name: 'Visor',
        description: 'Visor de turnos para Digiturno',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'fullscreen',
        orientation: 'landscape',
        start_url: '?reload=' + Date.now(),
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,gif,svg,mp4,webm,ogg,mp3,wav}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|gif|svg|mp4|webm|ogg,mp3,wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  publicDir: './public',
  server: {
    port: 5175,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3000', changeOrigin: true, ws: true },

    },
  },
})
