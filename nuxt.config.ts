// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: true,

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@samk-dev/nuxt-vcalendar",
  ],

  runtimeConfig: {    
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_BASE_URL,
      API_V2_URL: process.env.NUXT_PUBLIC_API_V2_URL,
      TEST_USERNAME: process.env.NUXT_PUBLIC_TEST_USER_USERNAME,
      TEST_PASSWORD: process.env.NUXT_PUBLIC_TEST_USER_PASSWORD,
    }
  },

  pinia: {
    storesDirs: ['./stores/**'],
  }, 

  css: [
    '~/assets/style/custom.css',
  ],
})
