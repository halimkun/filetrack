<template>
  <FormBerkasKomite 
    :komite="komite"

    :pj="dataBerkas?.data.pj"
    :perihal="dataBerkas?.data.perihal"
    :tgl_terbit="dataBerkas?.data.tgl_terbit"
    
    :nomor="nomor"
    :prefix="dataBerkas?.data.prefix"
    :actionUrl="actionUrl"
  />
</template>

<script lang="ts" setup>
import type { BerkasKomite } from '~/types/BerkasKomite';

const route = useRoute()
const toasts = useToast()
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()
const komite = route.fullPath.split('/').slice(-3)[0]

const { API_V2_URL } = runtimeConfig.public
const accessToken = accessTokenStore.accessToken
const identifier = route.params.identifier as string
const decodedIdentifier = atob(identifier)
const [nomor, tgl_terbit] = decodedIdentifier.split('.')

const actionUrl = `${API_V2_URL}/berkas/komite/${komite}/${identifier}?_method=PUT`

const { data: dataBerkas, pending, error, refresh, status } = await useFetch<BerkasKomite>(`${API_V2_URL}/berkas/komite/${komite}/${identifier}`, {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})

if (error.value) {
  console.error(error.value)
  toasts.add({
    title: 'Error',
    description: 'Terjadi kesalahan saat mengambil data berkas',
    color: 'red'
  })
}
</script>