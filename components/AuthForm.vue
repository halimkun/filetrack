<script setup lang="ts">
import { z } from 'zod'
import { logEvent } from '~/utils/firebase'
import type { FormSubmitEvent } from '#ui/types'

const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore()
// const menuStore = useMenuStore()

const { API_V2_URL, rsia } = runtimeConfig.public

const onLoading = ref(false)
const schema = z.object({
  username: z.string().regex(/^\d{1}\.\d{3}\.\d{4}$/),
  password: z.string()
})

type Schema = z.output<typeof schema>

const state = reactive({
  username: '' as string,
  password: '' as string
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const toast = useToast()
  const router = useRouter()
  
  onLoading.value = true

  // scope: [
  //   'document:approve',
  //   'document.general:view', 'document.general:manage',
  //   'document.komite:view', 'document.komite:manage',
  //   'document.other:view', 'document.other:manage',
  // ],

  const finalBody = {
    grant_type: rsia.grantType ?? 'password',
    client_id: rsia.clientId,
    client_secret: rsia.clientSecrete,
    scope: [],
    username: event.data.username,
    password: event.data.password
  };

  const {data, pending, error, refresh, status} = await useFetch(`${API_V2_URL}/oauth/token`, {
    method: 'POST',
    body: JSON.stringify(finalBody)
  })
  
  if (error.value || status.value != 'success') {
    onLoading.value = false
    logEvent('login_failed', { username: event.data.username, error: error.value })
    handleFetchError(toast, 'Failed to login, please check your username and password')
    return
  }

  // const accessToken = (data.value as { access_token?: string })?.access_token as string
  // const refreshToken = (data.value as { refresh_token?: string })?.refresh_token as string

  logEvent('login_success', { username: event.data.username })
  tokenStore.setData(data.value as any)

  // TODO : skip refresh token for now and skip menu data
  
  toast.add({
    title: 'Success',
    description: 'Login success',
    color: 'green'
  })

  if (!pending.value) {
    onLoading.value = false
  }

  router.push('/')
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