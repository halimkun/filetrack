<template>
  <FormBerkasPks 
    :judul="berkasPks?.data?.judul"
    :tanggal_awal="berkasPks?.data?.tanggal_awal"
    :tanggal_akhir="berkasPks?.data?.tanggal_akhir"
    :tgl_terbit="berkasPks?.data?.tgl_terbit"
    :no_pks_eksternal="berkasPks?.data?.no_pks_eksternal"
    :no_pks_internal="berkasPks?.data?.no_pks_internal"
    :pj="berkasPks?.data?.pj"

    :actionUrl="actionUrl"
  />
</template>

<script lang="ts" setup>
import type { BerkasPks } from '~/types/BerkasPks';

  const route = useRoute();
  const runtimeConfig = useRuntimeConfig()
  const accessTokenStore = useAccessTokenStore()
  const jenis = ref<string>('')

  const { API_V2_URL } = runtimeConfig.public
  const noSurat = route.params.no_surat as string
  const accessToken = accessTokenStore.accessToken

  const id = atob(route.params.id as string);
  const actionUrl = `${API_V2_URL}/berkas/pks/${id}?_method=PUT`

  const { data: berkasPks, error, status } = await useFetch<BerkasPks>(`${API_V2_URL}/berkas/pks/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (error.value) {
    console.error('Error fetching surat internal:', error.value);
  }
</script>