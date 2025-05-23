<script setup lang="ts">
import { z } from 'zod'
import { logEvent } from '~/utils/firebase'
import type { FormSubmitEvent } from '#ui/types'

const tokenStore = useTokenStore()
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

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: event.data.username,
        password: event.data.password,
      },
    })

    tokenStore.setData(response as any)

    logEvent('login_success', { username: event.data.username })

    toast.add({
      title: 'Success',
      description: 'Login success',
      color: 'green',
    })

    router.push('/')
  } catch (err) {
    logEvent('login_failed', { username: event.data.username, error: err })
    handleFetchError(toast, 'Failed to login, please check your username and password')
  } finally {
    onLoading.value = false
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