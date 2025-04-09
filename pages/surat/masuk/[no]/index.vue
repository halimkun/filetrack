<template>
  <div>
    Detail Surat Masuk
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore();

const { API_V2_URL } = runtimeConfig.public
const no = route.params.no as string

const { data: suratMasuk, error, refresh } = await useFetch(`${API_V2_URL}/surat/masuk/${atob(no)}`,{
  headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
})
</script>