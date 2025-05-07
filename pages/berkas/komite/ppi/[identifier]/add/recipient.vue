<script setup lang="ts">
import type { BerkasKomite } from '~/types/BerkasKomite'
import { logEvent } from '~/utils/firebase'

useHead({
  title: 'Tambah Penerima Berkas Komite ',
  meta: [{ name: 'description', content: 'Tambah Penerima Berkas Komite' }]
})

const route = useRoute()
const toast = useToast()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore();

const selected = ref<any>([])
const noSurat = ref<string>('')

const { API_V2_URL } = runtimeConfig.public
const komite = route.fullPath.split('/').slice(-4)[0]

const { data: dataPenerima, error: dataPenerimaError } = await useAsyncData<any>(
  `dataPenerima:berkas/komite/${komite}/${route.params.identifier}`,
  () => $fetch(`${API_V2_URL}/undangan/penerima/${btoa(noSurat.value)}`, {
    headers: {
      Authorization: `Bearer ${tokenStore.accessToken}`
    }
  }), {
  watch: [noSurat]
});

watch(dataPenerima, (newValue) => {
  const penerima = dataPenerima?.value?.data?.penerima
  if (penerima) {
    selected.value = penerima.map((item: any) => {
      return {
        nik: item.nik,
        nama: item.nama,
        jk: item.jk,
        departemen: item.departemen,
        bidang: item.bidang,
        dep: item.dep,
      }
    })
  }
})

const { data: berkasKomite, pending, error: berkasKomiteError, status } = useFetch<BerkasKomite>(`${API_V2_URL}/berkas/komite/${komite}/${route.params.identifier}`, {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
});

if (berkasKomiteError.value) {
  logEvent('fetch_berkas_komite_failed', { error: berkasKomiteError.value, komite: komite, identifier: route.params.identifier })
  console.error('Error fetching surat internal:', berkasKomiteError.value);
}

watch(berkasKomite, (newValue) => {
  if (berkasKomite?.value?.data?.no_surat) {
    noSurat.value = berkasKomite?.value?.data?.no_surat
  }
})

const onSubmit = async () => {
  const selectedNik = selected.value.map((item: any) => item.nik);
  if (berkasKomite?.value?.data?.no_surat) {
    let body = {
      no_surat: berkasKomite?.value?.data?.no_surat,
      tipe: `komite/${komite}`,
      model: runtimeConfig.public.modelName.KOMITE_PPI,
      penerima: selectedNik
    }

    const { data, pending, error, refresh, status } = await useFetch(`${API_V2_URL}/undangan/penerima`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      },
      body: JSON.stringify(body)
    })

    if (error.value) {
      logEvent('fetch_berkas_komite_failed', { error: error.value })
      console.error('Error fetching surat internal:', error.value);
    }

    if (status.value == 'success') {
      logEvent('post_berkas_komite_success', { komite: komite, identifier: route.params.identifier })
      toast.add({
        title: 'Berhasil',
        description: 'Data penerima surat berhasil disimpan',
      })

      router.push(`/berkas/komite/${komite}`)
    }
  }
}
</script>

<template>
  <div class="flex gap-4 flex-col lg:flex-row items-start">
    <div class="w-full xl:w-[40%] space-y-4">
      <UCard class="w-full">
        <template #header>
          <div class="flex gap-2 items-center">
            <UButton icon="i-tabler-target-arrow" color="indigo" size="xs" square variant="soft" />
            <h1 class="text-lg">Detail Surat</h1>
          </div>
        </template>

        <!-- loop key of object berkasKomite.data -->
        <div v-for="(value, key) in (berkasKomite as any)?.data" :key="key">
          <div class="mb-2" v-if="!['nomor', 'prefix', 'pj', 'model', 'updated_at', 'status'].includes(String(key))">
            <h2 class="font-semibold text-indigo-500 text-lg capitalize">{{ String(key).replace('_', ' ') }}</h2>

            <template v-if="typeof value === 'object'">
              <div v-for="(subValue, subKey) in value" :key="subKey">
                <div class="mb-2 mt-1">
                  <UBadge v-if="String(subKey) == 'nik'" color="gray">{{ subValue }}</UBadge>
                  <p v-if="String(subKey) != 'nik'" class="text-base dark:text-gray-400 text-gray-800">{{ subValue }}
                  </p>
                </div>
              </div>
            </template>

            <template v-else-if="String(key) == 'created_at'">
              <!-- format ro dd, MMM YYY -->
              <p class="text-base dark:text-gray-400 text-gray-800">
                {{ new Date(value).toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day:
                    '2-digit', hour: '2-digit', minute: '2-digit' }) }}
              </p>
            </template>

            <template v-else>
              <p class="text-base dark:text-gray-400 text-gray-800">{{ value }}</p>
            </template>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex gap-2 items-center">
            <UButton icon="i-tabler-users" size="xs" color="primary" square variant="soft" />
            <h1 class="text-lg">Penerima Surat</h1>
          </div>
        </template>

        <div v-if="selected.length > 0">
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="(item, index) in selected" :key="index" color="gray">{{ item.nama }}</UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <div class="space-y-4 w-full sticky top-4">
      <UCard class="w-full">
        <template #header>
          <div class="flex gap-2 items-center">
            <UButton icon="i-tabler-users" size="xs" color="primary" square variant="soft" />
            <h1 class="text-lg">Data Pegawai</h1>
          </div>
        </template>

        <TablePegawai v-model="selected" />
      </UCard>

      <UCard>
        <div class="flex justify-between items-center">
          <div class="text-lg text-gray-500">
            Anda memilih <span class="text-primary font-bold">{{ selected.length }}</span> pegawai, klik tombol simpan
            untuk
            menyimpan data penerima surat.
          </div>

          <UButton icon="i-tabler-send" color="primary" size="sm" square @click="onSubmit" :loading="pending">
            Simpan
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
