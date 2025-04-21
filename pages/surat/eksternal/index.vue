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

        <UButton icon="i-tabler-plus" size="xs" square @click="isOpen = true">
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

  
  <!-- Modal Form -->
  <ModalFormSuratEksternal 
    v-model="isOpen"
    :selectedData="detailData"

    @close="detailData = null; isOpen = false"
    @refresh="refresh()"
  />

  <!-- Modal Detail -->
  <ModalDetailSuratEksternal
    v-model="isDetailOpen"
    :detailData="detailData"
    @onClose="isDetailOpen = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

useHead({
  title: 'Surat Eksternal -- ILM ',
  meta: [{ name: 'description', content: 'Surat Eksternal' }],
});

const isOpen = ref(false);
const isDetailOpen = ref(false);
const detailData = ref<any>({});

const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const tokenStore = useTokenStore();

// table columns
const columns = [
  { label: "No Surat", key: "no_surat" },
  { label: "Perihal", key: "perihal" },
  { label: "PJ", key: "penanggung_jawab.nama" },
  { label: "Status", key: "status" },
  // { label: "Alamat", key: "alamat" },
  { label: "Tanggal", key: "tgl_terbit" },
]

// row menu
const menu = (row: any) => [[
  { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => { detailData.value = row; isDetailOpen.value = true; } },
  { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => { detailData.value = row; isOpen.value = true } }
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
const accessToken: string | null = tokenStore.accessToken;
const selectedSurat = ref<any[]>([]);
const updateSelectedSurat = (data: any[]) => {
  selectedSurat.value = data;
};

// Api Request
const { data: suratEksternal, refresh, pending, error } = await useAsyncData(
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