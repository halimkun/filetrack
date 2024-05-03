<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-mail-share" color="primary" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg">Surat Eksternal</h1>
            <p class="text-sm text-cool-400">Data Surat Eksternal terdaftar</p>
          </div>
        </div>

        <UButton icon="i-tabler-plus" size="xs" square @click="router.push('/surat/eksternal/create')">
          Tambah Surat
        </UButton>
      </div>
    </template>

    <TableSuratEksternal 
      :response="(suratEksternal as any)" 
      :columns="columns" 
      :menu="menu" 
      :loading="pending"
      @selectedChange="updateSelectedSurat" 
      @onPageChange="currentPage = $event" 
      @onFilter="onFilter"
    />
  </UCard>

  <UModal v-model="isDetailOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-mail-share" color="primary" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Detail Surat Eksternal</h1>
              <p class="text-sm text-cool-400">Detail Surat Eksternal</p>
            </div>
          </div>

          <UButton icon="i-tabler-x" size="xs" color="orange" variant="soft" square @click="isDetailOpen = false" />
        </div>
      </template>

      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-sm text-primary-400">No Surat</p>
            <p class="text-lg">{{ detailData.no_surat }}</p>
          </div>
          <div>
            <p class="text-sm text-primary-400">Tanggal Surat</p>
            <p class="text-lg">{{ detailData.tanggal }}</p>
          </div>
        </div>
        <div>
          <p class="text-sm text-primary-400">Perihal</p>
          <p class="text-lg">{{ detailData.perihal }}</p>
        </div>
        <div>
          <p class="text-sm text-primary-400">Alamat</p>
          <p class="text-lg">{{ detailData.alamat }}</p>
        </div>
        <div>
          <p class="text-sm text-primary-400">Penanggung Jawab</p>
          <p class="text-lg">{{ detailData.penanggung_jawab_simple.nama }}</p>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';

useHead({
  title: 'Surat Eksternal -- FileTrack | FAISAL HALIM',
  meta: [{ name: 'description', content: 'Surat Eksternal' }],
});

const isDetailOpen = ref(false);
const detailData = ref<any>({});

const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const accessTokenStore = useAccessTokenStore();

// table columns
const columns = [
  { label: "No Surat", key: "no_surat" },
  { label: "PJ", key: "penanggung_jawab_simple.nama" },
  { label: "Perihal", key: "perihal" },
  { label: "Alamat", key: "alamat" },
  { label: "Tanggal", key: "tanggal" },
]

// row menu
const menu = (row: any) => [[
  { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => { detailData.value = row; isDetailOpen.value = true; } },
  { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => router.push(`/surat/eksternal/${btoa(row.no_surat)}/edit`) }
]]

// On Filter
const onFilter = (data: any) => {
  if (data.search || data.filters) {
    const updatedBodyReq = {
      ...bodyReq.value,
      search: data.search ? { value: data.search.value } : bodyReq.value.search,
      filters: data.filters ? [...data.filters] : bodyReq.value.filters
    };

    bodyReq.value = updatedBodyReq;
  }
};

const currentPage = ref<number>(1)
const bodyReq = ref<any>({
  "sort": [
    { "field": "created_at", "direction": "desc" }
  ]
})

// Ekstraksi nilai yang diperlukan dari hooks
const { API_V2_URL } = runtimeConfig.public;
const accessToken: string | null = accessTokenStore.accessToken;
const selectedSurat = ref<any[]>([]);
const updateSelectedSurat = (data: any[]) => {
  selectedSurat.value = data;
};

// Api Request
const { data: suratEksternal, pending, error } = await useAsyncData(
  'suratEksternal',
  () => $fetch(`${API_V2_URL}/surat/eksternal/search`, {
    method: 'POST',
    query: { page: currentPage.value },
    body: JSON.stringify(bodyReq.value),
    headers: { Authorization: `Bearer ${accessToken}` },
  }), { watch: [currentPage, bodyReq], immediate: true, lazy: false }
);

if (error.value) {
  console.error(error.value)
}
</script>