<script setup lang="ts">
useHead({
  title: 'Detail Surat Internal -- ILM ',
  meta: [{ name: 'description', content: 'Detail Surat Internal' }]
})

const route = useRoute()
const toast = useToast()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore();

const isMounted = ref(true)
const selected = ref<any>([])
const { API_V2_URL } = runtimeConfig.public

const mapPenerima = (penerima: any) => {
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
}

onMounted(() => {
  isMounted.value = true
})

const { data: dataPenerima, error: dataPenerimaError } = useFetch<any>(`${API_V2_URL}/undangan/penerima/${route.params.no_surat}`, {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
});

if (dataPenerima.value) {
  const penerima = dataPenerima.value.data.penerima
  mapPenerima(penerima)
}

watch(dataPenerima, (newValue) => {
  const penerima = newValue?.data?.penerima  
  mapPenerima(penerima)
})

const { data: suratInternal, pending, error: suratInternalError } = useFetch<any>(`${API_V2_URL}/surat/internal/${route.params.no_surat}`, {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
});

if (suratInternalError.value) {
  console.error('Error fetching surat internal:', suratInternalError.value);
}

const onSubmit = async () => {
  const selectedNik = selected.value.map((item: any) => item.nik);
  if (suratInternal?.value?.data?.no_surat) {
    let body = {
      no_surat: suratInternal?.value?.data?.no_surat,
      tipe: 'surat/internal',
      model: runtimeConfig.public.modelName.SURAT_INTERNAL,
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
      console.error('Error fetching surat internal:', error.value);
    }

    if (status.value == 'success') {
      toast.add({
        title: 'Berhasil',
        description: 'Data penerima surat berhasil disimpan',
      })

      router.push(`/surat/internal/${route.params.no_surat}`)
    }
  }
}
</script>

<template>
  <div class="flex gap-4 flex-col xl:flex-row items-start">
    <div class="w-full xl:w-[40%] space-y-4">
      <UCard class="w-full">
        <template #header>
          <div class="flex gap-2 items-center">
            <UButton icon="i-tabler-target-arrow" color="indigo" size="xs" square variant="soft" />
            <h1 class="text-lg">Detail Surat</h1>
          </div>
        </template>

        <!-- loop key of object suratInternal.data -->
        <div v-for="(value, key) in (suratInternal as any)?.data" :key="key">
          <div class="mb-2" v-if="!['pj', 'model', 'created_at'].includes(String(key))">
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

            <template v-else-if="String(key) == 'status'">
              <UBadge
                :color="value == 'pengajuan' ? 'yellow' : value == 'disetujui' ? 'teal' : value == 'ditolak' ? 'red' : 'purple'"
                class="text-xs uppercase">
                {{ value }}
              </UBadge>
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
          <div class="text-lg text-gray-500">Anda memilih <span class="text-primary font-bold">{{ selected.length }}</span> pegawai, klik tombol simpan untuk menyimpan data penerima surat.</div>
          <UButton icon="i-tabler-send" color="primary" size="sm" square @click="onSubmit" :loading="pending">
            Simpan
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
