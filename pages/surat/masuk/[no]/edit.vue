<template>
  <div class="flex gap-4 flex-col-reverse xl:flex-row">
    <UCard class="w-full">
      <template #header>
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-edit" color="sky" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg">Edit Surat Masuk</h1>
          </div>
        </div>
      </template>

      <FormSuratMasuk 
        :no_simrs="suratMasuk?.data.no_simrs"
        :no_surat="suratMasuk?.data.no_surat"
        :perihal="suratMasuk?.data.perihal"
        :pengirim="suratMasuk?.data.pengirim"
        :tgl_surat="suratMasuk?.data.tgl_surat"
        :pelaksanaan="suratMasuk?.data.pelaksanaan"
        :pelaksanaan_end="suratMasuk?.data.pelaksanaan_end"
        :tempat="suratMasuk?.data.tempat"
        :ket="suratMasuk?.data.ket ?? '-'"

        :actionUrl="actionUrl"
      />
    </UCard>

    <div class="xl:w-[60%] w-full">
      <div class="space-y-4">
        <UCard>
          <template #header>
            <div class="flex gap-2 items-start">
              <UButton icon="i-tabler-exclamation-circle" color="yellow" size="xs" square variant="soft" />
              <div>
                <h1 class="text-lg">Perhatian</h1>
              </div>
            </div>
          </template>

          Jika file yang sudah diupload ingin diganti, silahkan upload file baru dan simpan. namun jika tetap menggunakan file yang lama, tidak perlu upload file baru.
        </UCard>
  
        <UAlert
          class="w-full"
          icon="i-heroicons-exclamation-circle-16-solid"
          color="yellow"
          variant="soft"
          title="Perhatian"
          description="Pastikan data yang diinputkan sudah benar sebelum menyimpan data."
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SuratMasukData } from '~/types/SuratMasuk';
import { logEvent } from '~/utils/firebase'

useHead({
  title: 'Edit Surat Internal -- ILM ',
  meta: [{ name: 'description', content: 'Edit Surat Internal' }],
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()

const { API_V2_URL } = runtimeConfig.public
const no = route.params.no as string
const accessToken = accessTokenStore.accessToken
const actionUrl = `${API_V2_URL}/surat/masuk/${atob(no)}?_method=PUT`

const { data: suratMasuk, error } = await useFetch<any>(`${API_V2_URL}/surat/masuk/${atob(no)}`, {
  headers: { Authorization: `Bearer ${accessToken}` }
})

if (error.value) {
  logEvent('fetch_surat_internal_error', error.value)
  console.error('Error fetching surat internal:', error.value);
}
</script>