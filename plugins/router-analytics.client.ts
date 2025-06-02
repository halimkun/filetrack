import { logEvent } from 'firebase/analytics'
import { useNuxtApp } from '#app'
import { useRouter } from 'vue-router'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp() // Ambil nuxtApp
  const router = useRouter()

  router.afterEach((to, from) => {
    const firebase = nuxtApp.$firebase // Ambil resource firebase yang disediakan plugin pertama
    if (firebase?.analytics) {
      logEvent(firebase.analytics, 'page_view', {
        page_title: document.title,
        page_path: to.fullPath,
        page_location: window.location.href,
      })
    }
  })
})
