// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@samk-dev/nuxt-vcalendar",
    "nuxt-tiptap-editor",
  ],

  plugins: [
    '~/plugins/firebase.client.ts',
  ],

  runtimeConfig: {    
    public: {
      TZ: process.env.NUXT_PUBLIC_TZ,
      API_URL: process.env.NUXT_PUBLIC_API_BASE_URL,
      API_V2_URL: process.env.NUXT_PUBLIC_API_V2_URL,
      TEST_USERNAME: process.env.NUXT_PUBLIC_TEST_USER_USERNAME,
      TEST_PASSWORD: process.env.NUXT_PUBLIC_TEST_USER_PASSWORD,

      model: {
        SURAT_INTERNAL: process.env.NUXT_PUBLIC_SURAT_INTERNAL_MODEL_NAME,

        KOMITE_PPI: process.env.NUXT_PUBLIC_KOMITE_PPI_MODEL_NAME,
        KOMITE_PMKP: process.env.NUXT_PUBLIC_KOMITE_PMKP_MODEL_NAME,
        KOMITE_KESEHATAN: process.env.NUXT_PUBLIC_KOMITE_KESEHATAN_MODEL_NAME,
        KOMITE_KEPERAWATAN: process.env.NUXT_PUBLIC_KOMITE_KEPERAWATAN_MODEL_NAME,
        KOMITE_MEDIS: process.env.NUXT_PUBLIC_KOMITE_MEDIS_MODEL_NAME
      },

      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      },
    },
  },

  tailwindcss: {
    cssPath: '~/assets/style/tailwind.css',
    configPath: 'tailwind.config',
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  css: [
    '~/assets/style/custom.css',
  ],

  compatibilityDate: "2024-08-31",
})