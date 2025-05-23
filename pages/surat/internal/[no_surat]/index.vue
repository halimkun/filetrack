<script setup lang="ts">
useHead({
  title: 'Detail Surat Internal ',
  meta: [{ name: 'description', content: 'Detail Surat Internal' }]
})

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore();

const infoOpen = ref(false)
const { API_V2_URL } = runtimeConfig.public

// Mengambil data surat internal
const { data: suratInternal, error: suratInternalError } = useFetch<any[]>(`${API_V2_URL}/surat/internal/${route.params.no_surat}`, {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
});

if (suratInternalError.value) {
  console.error('Error fetching surat internal:', suratInternalError.value);
}

const currentPage = ref<number>(1)
const { data: penerimaData, pending: penerimaPending, error: penerimaError, refresh } = await useAsyncData(
  `${API_V2_URL}/undangan/penerima/search`,
  () => $fetch(`${API_V2_URL}/undangan/penerima/search`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    query: { page: currentPage.value, include: 'detail.dep', limit: 10 },
    body: JSON.stringify({ 
      filters: [
        { field: 'no_surat', operator: "=", value: atob(route.params.no_surat as string) }
      ]
     })
  }), { watch: [currentPage] }
);

if (penerimaError.value) {
  console.log('Error fetching penerima undangan:', penerimaError.value);
}
</script>

<template>
  <div class="flex gap-4 flex-col xl:flex-row items-start">
    <UCard class="w-full xl:w-[35%]">
      <template #header>
        <div class="flex gap-2 items-center">
          <UButton icon="i-tabler-target-arrow" color="indigo" size="xs" square variant="soft" />
          <h1 class="text-lg">Detail</h1>
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
                <p v-if="String(subKey) != 'nik'" class="text-base dark:text-gray-400 text-gray-800">{{ subValue }}</p>
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

    <UCard class="w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex gap-2 items-center">
            <UButton icon="i-heroicons-information-circle-20-solid" size="xs" color="yellow" square variant="soft"
              @click="infoOpen = true" />
            <h1 class="text-lg">Penerima</h1>
          </div>

          <!-- button to add/recipient -->
          <UButton icon="i-tabler-user-plus" square size="sm" color="primary" variant="soft"
            @click="router.push(`/surat/internal/${route.params.no_surat}/add/recipient`)">
            Tambah Penerima
          </UButton>
        </div>
      </template>

      <template v-if="penerimaData">
        <TablePenerimaUndangan 
          :response="(penerimaData as any)" 
          :loading="penerimaPending"
          :detailSurat="(suratInternal as any)?.data" @onPageChange="currentPage = $event" />
      </template>

      <template v-else>
        <div class="flex flex-row gap-8 items-center justify-center p-8">
          <div class="flex flex-row items-start gap-2 justify-center p-4 border border-cool-800 rounded-xl">
            <UIcon name="i-tabler-info-circle" color="orange" class="text-xl mt-0.5 animate-pulse" />
            <div>
              <p class="text-gray-500 dark:text-gray-400">Tidak ada penerima.</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">mungkin surat ini tidak mewakili kegiatan tertentu.
              </p>
            </div>
          </div>

          <UDivider label="OR" orientation="vertical" />

          <UButton icon="i-tabler-user-plus" color="indigo"
            @click="router.push(`/surat/internal/${route.params.no_surat}/add/recipient`)">
            Tambah Penerima
          </UButton>
        </div>
      </template>

    </UCard>
  </div>

  <!-- Modal Informasi -->
  <UModal v-model="infoOpen">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex gap-2 items-center">
          <UButton icon="i-heroicons-information-circle-20-solid" color="yellow" size="xs" square variant="soft" />
          <h1 class="text-lg">Informasi</h1>
        </div>
      </template>
      <p class="dark:text-cool-300 text-cool-800">Data penerima yang ada adalah penerima undangan jika surat terkait
        merupakan surat yang mewakili kegiatan tertentu, jika tidak terdapat data penerima maka bisa diartikan bahwa
        surat ini bukanlah surat yang mewakili kegiatan atau agenda tertentu.</p>
    </UCard>
  </UModal>
</template>
