<script setup lang="ts">
const links = ref<any[]>([])
const menuStore = useMenuStore()

onMounted(async () => {
  links.value = await menuStore.getMenu()
  console.log('links', links.value)
})
</script>

<template>
  <div class="flex bg-cool-100 text-cool-800 dark:bg-cool-800 dark:text-cool-100">
    <!-- sidebar -->
    <div class="flex-none w-60 h-screen relative">
      <div class="h-full border-r border-cool-300 dark:border-cool-800 bg-cool-100 dark:bg-cool-900 shadow-lg">
        <!-- logo -->
        <div class="flex items-center justify-start p-4 px-7 h-14 border-b border-cool-300 dark:border-cool-800">
          <span class="text-lg font-bold">File<span class="text-primary">Track</span></span>
        </div>

        <!-- links -->
        <div class="p-4 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          <UVerticalNavigation v-if="links.length" :links="links" />
        </div>
      </div>

      <!-- footer -->
      <div class="absolute bottom-0 w-full p-4 border-t dark:border-cool-800 dark:bg-cool-900">
        <p class="text-xs text-center">
          © 2024 <ULink to="https://github.com/halimkun/filetrack/" target="_blank"
            active-class="font-semibold text-primary"
            inactive-class="font-semibold text-sky-500 dark:text-sky-00 hover:text-sky-700 dark:hover:text-sky-200">
            FileTrack</ULink>
        </p>
      </div>
    </div>
    <!-- end sidebar -->

    <!-- main content -->
    <div class="flex-1 h-full max-h-screen overflow-y-auto">
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>