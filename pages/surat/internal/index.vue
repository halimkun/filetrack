<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-mail-star" color="indigo" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Surat Internal</h1>
              <p class="text-sm text-cool-400">Data Surat internal terdaftar</p>
            </div>
          </div>

          <UButton icon="i-tabler-plus" size="xs" color="indigo" square @click="router.push('/surat/internal/create')">
            Tambah Surat
          </UButton>
        </div>
      </template>

      <TableSuratInternal 
        :response="(suratInternal as any)" 
        :columns="columns" 
        :menu="menu" 
        :loading="pending"
        @selectedChange="updateSelectedData" 
        @onPageChange="currentPage = $event" 
        @onFilter="onFilter" 
      />
    </UCard>

    <ModalUpdateStatus 
      v-model="showModalUpdateStatus" 
      :showModalUpdateStatus="showModalUpdateStatus"
      :suratInternal="(selectedData as any)" 
    />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Surat Internal -- ILM ',
  meta: [{ name: 'description', content: 'Surat Internal' }],
});

// Penggunaan hooks terkait runtime config dan akses token
const runtimeConfig = useRuntimeConfig();
const accessTokenStore = useAccessTokenStore();
const router = useRouter();

const showModalUpdateStatus = ref<boolean>(false);

// Ekstraksi nilai yang diperlukan dari hooks
const { API_V2_URL } = runtimeConfig.public;
const accessToken: string | null = accessTokenStore.accessToken;

const selectedData = ref<any[]>([]);
const updateSelectedData = (data: any[]) => {
  selectedData.value = data;
};

const columns = [
  { label: "No Surat", key: "no_surat" },
  { label: "Perihal", key: "perihal" },
  { label: "Tempat", key: "tempat" },
  { label: "PJ", key: "penanggung_jawab_simple.nama" },
  { label: "Tanggal Terbit", key: "tgl_terbit" },
  { label: "Status", key: "status" },
]

const menu = (row: any) => [
  [
    { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => router.push(`/surat/internal/${btoa(row.no_surat)}`) }
  ], [
    { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => router.push(`/surat/internal/${btoa(row.no_surat)}/edit`) },
    { label: 'Tambah Penerima', icon: 'i-tabler-user-plus', click: () => router.push(`/surat/internal/${btoa(row.no_surat)}/add/recipient`) },
  ], [
    { label: 'Update Status', icon: 'i-tabler-tag-starred', click: () => { showModalUpdateStatus.value = true; selectedData.value = row } }
  ]
]

const currentPage = ref<number>(1)
const bodyReq = ref<any>({
  "sort": [
    { "field": "created_at", "direction": "desc" }
  ]
})

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

const { data: suratInternal, pending, error } = await useAsyncData(
  'suratInternal',
  () => $fetch(`${API_V2_URL}/surat/internal/search`, {
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