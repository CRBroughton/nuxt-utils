export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  app: {
    pageTransition: false, // Disable Nuxt's built-in page transitions
    layoutTransition: false, // Disable Nuxt's built-in layout transitions
    head: {
      viewport: 'width=device-width, initial-scale=1',
      title: 'View Transition Demo',
      meta: [
        { name: 'view-transition', content: 'same-origin' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  experimental: {
    payloadExtraction: false, // Disable payload extraction to avoid interference with transitions
    viewTransition: true, // Enable the experimental View Transition feature if present in your Nuxt version
  },
  compatibilityDate: '2025-04-09',
})
