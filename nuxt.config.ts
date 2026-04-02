// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: { compatibilityVersion: 4 },

  devtools: { enabled: true },

  modules: ['@vueuse/nuxt'],


  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    dbPath: './data/yumi-fitness.db',
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },

  app: {
    head: {
      title: '🍑 Yumi Fitness Tracker',
      meta: [
        { name: 'description', content: 'Real-time fitness coaching and body transformation tracker' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#1A1A2E' },
      ],
      link: [
        { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍑</text></svg>' },
        // Google Fonts for all themes
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Exo+2:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Lora:wght@400;600;700&family=Nunito:wght@400;600;700&family=Oswald:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Quicksand:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  compatibilityDate: '2025-05-15',
})