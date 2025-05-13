import { logEvent } from 'firebase/analytics'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  router.afterEach((to, from) => {
    // pastikan analytics sudah ada
    const analytics = nuxtApp.$firebase?.analytics
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_path: to.fullPath,
        page_title: document.title,
      })
    }
  })
})
