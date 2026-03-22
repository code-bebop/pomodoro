import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pomodoro Timer',
        short_name: 'Pomodoro',
        display: 'standalone',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        icons: [
          {
            src: '/pomodoro/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pomodoro/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  base: '/pomodoro/',
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
