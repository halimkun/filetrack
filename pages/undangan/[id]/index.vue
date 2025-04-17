<script setup lang="ts">
import type { UndanganData } from '~/types/undangan.types'
import type { SuratInternal, SuratInternalData } from '~/types/surat-internal.types'

useHead({
  title: 'Detail Surat Internal -- ILM ',
  meta: [{ name: 'description', content: 'Detail Surat Internal' }]
})

const route = useRoute()
const router = useRouter()
const tokenStore = useTokenStore();
const runtimeConfig = useRuntimeConfig()

const infoOpen = ref(false)
const currentPage = ref<number>(1)
const detailSurat = ref<SuratInternal | undefined>(undefined)

const { API_V2_URL } = runtimeConfig.public

const { data: undangan, error: undanganDataError } = useFetch<UndanganData>(`${API_V2_URL}/undangan/${route.params.id}`, {
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  }
});

if (undanganDataError.value) {
  console.error('Error fetching surat internal:', undanganDataError.value);
}

watch(() => undangan.value, (val) => {
  if (val?.data.surat_id) {
    fetchDetailSurat(val.data.tipe, val.data.surat_id);
  }
});

onMounted(() => {
  if (undangan.value?.data.surat_id) {
    fetchDetailSurat(undangan.value.data.tipe, undangan.value.data.surat_id);
  }
});

const fetchDetailSurat = async (tipe: string, suratId: number) => {
  try {
    const { data: suratData } = await $fetch<SuratInternalData>(`${API_V2_URL}/${tipe}/${suratId}`, {
      headers: {
        Authorization: `Bearer ${tokenStore.accessToken}`
      }
    });

    detailSurat.value = suratData;
  } catch (error) {
    console.error('Error fetching detail surat:', error);
  }
};

const { data: penerimaData, error: penerimaError, status: penerimaStatus, refresh } = await useAsyncData(
  `${API_V2_URL}/undangan/penerima/search`,
  () => $fetch(`${API_V2_URL}/undangan/penerima/search`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    query: { page: currentPage.value, limit: 10 },
    body: JSON.stringify({ 
      filters: [
        { field: 'undangan_id', operator: "=", value: route.params.id }
      ],
      includes: [
        { relation: 'detail.dep' }
      ]
     })
  }), { watch: [currentPage] }
);

if (penerimaError.value) {
  console.log('Error fetching penerima undangan:', penerimaError.value);
}

console.log('Penerima Data:', penerimaData.value);
</script>

<template>
  <div class="flex gap-4 flex-col xl:flex-row items-start">
    <UCard class="w-full xl:w-[35%]">
      <template #header>
        <div class="flex gap-2 items-center">
          <UButton icon="i-tabler-target-arrow" color="indigo" size="xs" square variant="soft" />
          <h1 class="text-lg">Detail Surat & Undangan</h1>
        </div>
      </template>

      <div class="space-y-3">
        <div class="space-y-0">
          <p class="font-semibold text-sm text-indigo-500">Perihal</p>
          <p class="font-normal text-base">{{ detailSurat?.perihal }}</p>
        </div> 

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="space-y-0 md:col-span-2">
            <p class="font-semibold text-sm text-indigo-500">No Surat</p>
            <p class="font-normal text-base">{{ detailSurat?.no_surat ?? '-' }}</p>
          </div>

          <div class="space-y-0">
            <p class="font-semibold text-sm text-indigo-500">Status</p>
            <p class="font-normal text-base">
              <UBadge :color="detailSurat?.status == 'pengajuan' ? 'yellow' : detailSurat?.status == 'disetujui' ? 'sky' : detailSurat?.status == 'ditolak' ? 'red' : detailSurat?.status == 'batal' ? 'gray' : 'gray'">
                {{ detailSurat?.status }}
              </UBadge>
            </p>
          </div>
        </div>

        <div class="space-y-0">
          <p class="font-semibold text-sm text-indigo-500">Tanggal Terbit</p>
          <p class="font-normal text-base">
            <template v-if="detailSurat?.tgl_terbit">
              {{ new Date(detailSurat?.tgl_terbit).toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
              }) }}
            </template>
          </p>
        </div>

        <!-- penanggung jawab -->
        <div class="space-y-0">
          <p class="font-semibold text-sm text-indigo-500">Penanggung Jawab</p>
          <p class="font-normal text-base">{{ detailSurat?.penanggung_jawab.nama }}</p>
        </div>

        <!-- Diajukan Oleh jawab -->
        <div class="space-y-0">
          <p class="font-semibold text-sm text-indigo-500">Diajukan Oleh</p>
          <p class="font-normal text-base">{{ detailSurat?.diajukan_oleh.nama }}</p>
        </div>

        <!-- catatan -->
        <div class="space-y-0">
          <p class="font-semibold text-sm text-indigo-500">Catatan</p>
          <p class="font-normal text-base">{{ detailSurat?.catatan ?? "-" }}</p>
        </div>
        
        <template v-if="undangan?.data">
          <div class="p-3 rounded-md dark:bg-gray-800 space-y-3">
            <!-- judul -->
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Detail Undangan
            </h3>

            <!-- divider -->
            <UDivider class="my-2 border-t-2 border-gray-200 dark:border-gray-700" />

            <!-- Tanggal Kegiatan -->
            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Tanggal</p>
              <p class="font-semibold text-base">
                {{ new Date(undangan?.data.tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
                }) }}
              </p>
            </div>

            <!-- Lokasi Kegiatan -->
            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Lokasi</p>
              <p class="font-semibold text-base">{{ undangan?.data.lokasi }}</p>
            </div>

            <!-- Deskripsi -->
            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Deskripsi</p>
              <p class="font-semibold text-base">{{ undangan?.data.deskripsi ?? "-" }}</p>
            </div>
          </div>
        </template>
      </div>
    </UCard>

    <UCard class="w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex gap-2 items-center">
            <UButton icon="i-heroicons-information-circle-20-solid" size="xs" color="yellow" square variant="soft" @click="infoOpen = true" class="animate-pulse"/>
            <h1 class="text-lg">Peserta Kegiatan</h1>
          </div>

          <!-- button to add/recipient -->
          <UButton icon="i-tabler-user-plus" square size="sm" color="indigo" @click="router.push(`/undangan/${route.params.id}/add/recipient`)">
            Tambah Peserta
          </UButton>
        </div>
      </template>

      <template v-if="penerimaData">
        <TablePenerimaUndangan 
          :response="(penerimaData as any)" 
          :loading="penerimaStatus === 'pending'"
          :detailSurat="penerimaData" 

          @onPageChange="currentPage = $event"
        />
      </template>

      <template v-else>
        <div class="flex flex-row gap-8 items-center justify-center p-8">
          <!-- <div class="flex flex-row items-start gap-2 justify-center p-4 border border-cool-800 rounded-xl">
            <UIcon name="i-tabler-info-circle" color="orange" class="text-xl mt-0.5 animate-pulse" />
            <div>
              <p class="text-gray-500 dark:text-gray-400">Tidak ada penerima.</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">mungkin surat ini tidak mewakili kegiatan tertentu.
              </p>
            </div>
          </div> -->

          <!-- <UDivider label="OR" orientation="vertical" /> -->

          <UButton icon="i-tabler-user-plus" color="indigo" @click="router.push(`/undangan/${route.params.id}/add/recipient`)">
            Tambah Peserta
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
