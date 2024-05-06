<template>
  <!-- pegawai: { nik: string, nama: string }[], -->
  <FormSuratEksternal 
    :no_surat="suratEksternal?.data.no_surat" 
    :tgl_terbit="new Date((suratEksternal?.data.tgl_terbit || new Date()))"
    :tanggal="new Date((suratEksternal?.data.tanggal || new Date()))" 
    :alamat="suratEksternal?.data.alamat"
    :pj="suratEksternal?.data.pj" 
    :perihal="suratEksternal?.data.perihal" 
    
    :actionUrl="actionUrl" 
  />
</template>

<script lang="ts" setup>
import type { SuratEksternal } from '~/types/SuratEksternal';

useHead({
  title: 'Edit Surat Eksternal -- FileTrack | FAISAL HALIM',
  meta: [{ name: 'description', content: 'Edit Surat Eksternal' }],

})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()

const { API_V2_URL } = runtimeConfig.public
const noSurat = route.params.no_surat as string
const accessToken = accessTokenStore.accessToken
const actionUrl = `${API_V2_URL}/surat/eksternal/${noSurat}?_method=PUT`

const { data: suratEksternal, error } = await useFetch<SuratEksternal>(`${API_V2_URL}/surat/eksternal/${noSurat}`, {
  headers: { Authorization: `Bearer ${accessToken}` }
})

if (error.value) {
  console.error('Error fetching surat eksternal:', error.value);
}
</script>