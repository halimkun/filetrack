<script lang="ts" setup>
definePageMeta({
  title: 'Login',
  layout: 'auth'
})
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center dark:bg-cool-800 bg-gray-100">
    <AuthForm />
  </div>
</template>

<style scoped></style>
