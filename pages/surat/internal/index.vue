<template>
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

        <UButton icon="i-tabler-plus" size="xs" square @click="router.push('/surat/internal/create')">
          Tambah Surat
        </UButton>
      </div>
    </template>

    <TableSuratInternal :response="(suratInternal as any)" :columns="columns" :menu="menu" :loading="pending"
      @selectedChange="updateSelectedData" @onPageChange="currentPage = $event" />
  </UCard>
</template>

<script setup lang="ts">
useHead({
  title: 'Surat Internal -- FileTrack | FAISAL HALIM',
  meta: [{ name: 'description', content: 'Surat Internal' }],
});

// Penggunaan hooks terkait runtime config dan akses token
const runtimeConfig = useRuntimeConfig();
const accessTokenStore = useAccessTokenStore();
const router = useRouter();

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
  { label: "Penanggung Jawab", key: "penanggung_jawab.nama" },
  { label: "Tanggal Terbit", key: "tgl_terbit" },
  { label: "Status", key: "status" },
]

const menu = (row: any) => [
  [
    { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => router.push(`/surat/internal/${btoa(row.no_surat)}`) }
  ], [
    { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => console.log('Edit', row.no_surat) },
    { label: 'Tambah Penerima', icon: 'i-tabler-user-plus', click: () => console.log('Tambah Penerima', row.no_surat) }
  ], [
    { label: 'Delete', icon: 'i-heroicons-trash-20-solid' }
  ]
]

const currentPage = ref<number>(1)
const { data: suratInternal, pending, error, refresh } = await useFetch(
  () => `${API_V2_URL}/surat/internal?page=${currentPage.value}`, {
  headers: { Authorization: `Bearer ${accessToken}` },
  watch: [currentPage]
}
);

if (error.value) {
  console.error(error.value)
}
</script>