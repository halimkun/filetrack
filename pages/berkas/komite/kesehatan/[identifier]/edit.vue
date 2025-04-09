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
import { logEvent } from '~/utils/firebase'


const route = useRoute()
const toasts = useToast()
const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore();
const komite = route.fullPath.split('/').slice(-3)[0]
const { API_V2_URL } = runtimeConfig.public

const identifier = route.params.identifier as string
const decodedIdentifier = atob(identifier)
const [nomor, tgl_terbit] = decodedIdentifier.split('.')

const actionUrl = `${API_V2_URL}/berkas/komite/${komite}/${identifier}?_method=PUT`

const { data: dataBerkas, error, refresh, status } = await useFetch<BerkasKomite>(`${API_V2_URL}/berkas/komite/${komite}/${identifier}`, {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
})

if (error.value) {
  logEvent('fetch_berkas_komite_failed', { error: error.value, komite: komite, identifier: identifier })
  console.error(error.value)
  toasts.add({
    title: 'Error',
    description: 'Terjadi kesalahan saat mengambil data berkas',
    color: 'red'
  })
}
</script>