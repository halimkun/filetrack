<template>
  <div>
    <UCard>
      <div class="flex items-center justify-center gap-3">
        <!-- loading icon -->
        <UIcon name="i-tabler-loader" class="animate-spin text-primary text-2xl" />

        <!-- text -->
        <div class="m-0 p-0">
          <h1 class="text-lg font-semibold">Logging out...</h1>
          <p class="text-gray-500">See you next time!</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { logEvent } from '~/utils/firebase'
definePageMeta({
  layout: 'auth'
})

const tokenStore = useTokenStore();
const router = useRouter()
const runTimeConfig = useRuntimeConfig()

const { API_V2_URL } = runTimeConfig.public

const { data, pending, error, refresh, status } = await useFetch(`${API_V2_URL}/user/auth/logout`, {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
})

if (error.value) {
  console.error(error.value)
  logEvent('logout_failed', { error: error.value })
  setTimeout(() => {
    router.push('/')
  }, 1000)
}

if (status.value == 'success') {
  tokenStore.clearData()
  logEvent('logout_success')
  
  setTimeout(() => {
    router.push('/auth/login')
  }, 3000)
}
</script>