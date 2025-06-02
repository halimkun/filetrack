import { useNuxtApp } from '#app'
import { logEvent as firebaseLogEvent } from 'firebase/analytics'

export const logEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  const nuxtApp = useNuxtApp()

  // Pastikan $firebase tersedia dan memiliki analytics
  const firebase = nuxtApp.$firebase as {
    firebaseApp?: ReturnType<typeof import('firebase/app').initializeApp>
    analytics?: ReturnType<typeof import('firebase/analytics').getAnalytics>
  }

  if (firebase?.analytics) {
    try {
      firebaseLogEvent(firebase.analytics, eventName, eventParams)
    } catch (error) {
      console.error(`Error logging event "${eventName}":`, error)
    }
  } else {
    console.warn(`Firebase Analytics is not initialized for event "${eventName}"`)
  }
}
