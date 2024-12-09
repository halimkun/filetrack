<template>
  <!-- pegawai: { nik: string, nama: string }[], -->
  <FormSuratInternal 
    :no_surat="suratInternal?.data.no_surat" 
    :tgl_terbit="new Date((suratInternal?.data.tgl_terbit || new Date()))"
    :tanggal="new Date((suratInternal?.data.tanggal || new Date()))" 
    :tempat="suratInternal?.data.tempat"
    :pj="suratInternal?.data.pj" :perihal="suratInternal?.data.perihal" 
    :catatan="suratInternal?.data.catatan"
    :actionUrl="actionUrl" 
  />
</template>

<script lang="ts" setup>
import type { SuratInternalData } from '~/types/SuratInternal';

useHead({
  title: 'Edit Surat Internal -- ILM ',
  meta: [{ name: 'description', content: 'Edit Surat Internal' }],
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()

const { API_V2_URL } = runtimeConfig.public
const noSurat = route.params.no_surat as string
const accessToken = accessTokenStore.accessToken
const actionUrl = `${API_V2_URL}/surat/internal/${noSurat}?_method=PUT`

const { data: suratInternal, error } = await useFetch<SuratInternalData>(`${API_V2_URL}/surat/internal/${noSurat}`, {
  headers: { Authorization: `Bearer ${accessToken}` }
})

if (error.value) {
  console.error('Error fetching surat internal:', error.value);
}
</script>