<script setup lang="ts">
const links = ref<any[]>([])

const router = useRouter()

const tokenStore = useTokenStore()
const colorMode = useColorMode()
const menuStore = useMenuStore()
const detail = useUserStore()

const { user } = detail

onMounted(async () => {
  links.value = await menuStore.getMenu()
})

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const logout = async () => {
  const token = tokenStore.accessToken  // Atau dari storage kamu

  try {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    tokenStore.clearData()
    router.push('/login')
  } catch (err) {
    console.error('Logout gagal:', err)
  }
}
</script>

<template>
  <div class="flex bg-cool-100 text-cool-800 dark:bg-cool-800 dark:text-cool-100">
    <!-- sidebar -->
    <div class="sticky top-0 flex-none w-64 h-auto max-h-screen overflow-y-auto dark:border-cool-700 bg-white dark:bg-cool-900 shadow">
      <div class="flex items-center justify-center p-4 px-5 h-14 border-b border-cool-200 dark:border-cool-700">
        <span class="text-lg font-bold"><span class="text-primary">Serial Traking</span> System</span>
      </div>

      <div class="flex flex-col items-start p-4 px-5 h-min border-b border-cool-200 dark:border-cool-700">
        <p class="text-sm">{{ user?.detail.nama }}</p>
        <p class="text-sm">{{ user?.detail.jbtn }}</p>
      </div>

      <div class="flex items-center justify-between p-4 px-5 h-14 border-b border-cool-200 dark:border-cool-700">
        <UButton
          :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
          color="gray" variant="ghost" aria-label="Theme"
          @click="isDark = !isDark"
        />

        <UButton
          icon="i-heroicons-arrow-right-on-rectangle-20-solid"
          color="rose" variant="ghost" aria-label="Logout"
          class="ml-auto"
          @click="logout"
        />
      </div>

      <div class="px-5 py-4 min-h-[calc(100vh-14.7rem)]">
        <template v-if="links.length != 0">
          <UVerticalNavigation v-if="links.length" :links="links" class="h-full overflow-y-auto"/>
        </template>
      </div>

      <div class="sticky bottom-0 w-full p-4 border-r border-t border-cool-300 dark:border-cool-800 bg-cool-50 dark:bg-cool-900">
        <p class="text-xs text-center">
          © 2024 <ULink to="https://github.com/halimkun/filetrack/" target="_blank"
            active-class="font-semibold text-primary"
            inactive-class="font-semibold text-primary dark:text-primary-600 transition-colors duration-500 ease-in-out">
            Serial Traking System</ULink>
        </p>
      </div>
    </div>

    <!-- main content -->
    <div class="flex-1 h-full min-h-screen overflow-y-auto">
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>