<script setup lang="ts">
import { z } from 'zod'
import { logEvent } from '~/utils/firebase'
import type { FormSubmitEvent } from '#ui/types'

const runtimeConfig = useRuntimeConfig()
const tokenStore = useAccessTokenStore()
const menuStore = useMenuStore()

const { API_V2_URL, TEST_USERNAME, TEST_PASSWORD } = runtimeConfig.public

const onLoading = ref(false)
const schema = z.object({
  username: z.string().regex(/^\d{1}\.\d{3}\.\d{4}$/),
  password: z.string()
})

type Schema = z.output<typeof schema>

const state = reactive({
  username: TEST_USERNAME || '' as string,
  password: TEST_PASSWORD || '' as string
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  onLoading.value = true
  const { data, pending, error, refresh, status } = await useFetch(`${API_V2_URL}/user/auth/login`, {
    method: 'POST',
    body: JSON.stringify(event.data)
  })

  const toast = useToast()
  const router = useRouter()

  if (!error.value) {
    const accessToken = (data.value as { access_token?: string })?.access_token as string
    const [menuDataRes] = await Promise.all([
      useFetch(`${API_V2_URL}/user/menu/filetrack`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    ])

    const { data: menuData, status: statusMenuData } = menuDataRes

    if (statusMenuData.value != 'success') {
      handleFetchError(toast, 'Failed to fetch menu data, hubungi administrator untuk informasi lebih lanjut')
      logEvent('login_failed', { username: event.data.username, error: 'Failed to fetch menu data' })
      onLoading.value = false
      return
    }

    const menu = menuData.value as { data: any[] }

    if (menu.data.length == 0) {
      handleFetchError(toast, 'You do not have access to this application')
      logEvent('login_failed', { username: event.data.username, error: 'No menu data' })
      onLoading.value = false
      return
    }

    toast.add({
      title: 'Success',
      description: 'Login success',
      color: 'green'
    })

    if (!pending.value) {
      onLoading.value = false
    }
    
    logEvent('login_success', { username: event.data.username })
    tokenStore.setToken(accessToken)
    menuStore.setMenuFromArray(menu.data)
    router.push('/')
  } else {
    onLoading.value = false
    logEvent('login_failed', { username: event.data.username, error: error.value })
    handleFetchError(toast, 'Failed to login, please check your username and password')
  }
}

function handleFetchError(toast: any, errorMessage: string) {
  toast.add({
    title: 'Error',
    description: errorMessage,
    color: 'red'
  })
}

</script>


<template>
  <UCard class="shadow-xl dark:bg-cool-900 bg-white">
    <div class="mb-5">
      <h1 class="text-2xl font-bold">Login</h1>
      <p class="text-gray-500">Welcome back! Please login to your account.</p>
    </div>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormGroup label="Username" name="username">
        <UInput v-model="state.username" placeholder="nik anda" />
      </UFormGroup>

      <UFormGroup label="Password" name="password">
        <UInput v-model="state.password" type="password" placeholder="password" />
      </UFormGroup>

      <div class="mt-5">
        <UButton type="submit" block :loading="onLoading" color="indigo">Login</UButton>
      </div>
    </UForm>
  </UCard>
</template>