<template>
  <div>
    Detail Surat Masuk
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()

const { API_V2_URL } = runtimeConfig.public
const no = route.params.no as string
const accessToken = accessTokenStore.accessToken

const { data: suratMasuk, pending, error, refresh } = await useFetch(`${API_V2_URL}/surat/masuk/${atob(no)}`,{
  headers: { Authorization: `Bearer ${accessToken}` }
})
</script>