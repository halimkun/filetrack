<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-mail-star" color="teal" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg">Undangan // Kegiatan // Notulen</h1>
            <p class="text-sm text-cool-400">Data undangan atau kegiatan terdaftar</p>
          </div>
        </div>

        <UButton icon="i-tabler-plus" size="xs" color="teal" square @click="isInfoOpen = true">
          Undangan
        </UButton>
      </div>
    </template>

    <TableUndangan 
      :response="(dataUndangan as any)" 
      :columns="columns" 
      :menu="menu" 
      :loading="status == 'pending'"
      
      @selectedChange="updateSelectedData" 
      @onPageChange="currentPage = $event" 
      @onFilter="onFilter" 
    />
  </UCard>

  <ModalInfoTambahUndangan v-model="isInfoOpen" />
</template>

<script lang="ts" setup>
// import type { SuratUndangan } from '~/types/undangan.types';
import { logEvent } from '~/utils/firebase'

useHead({
  title: 'Data Undangan / Kegiatan -- ILM ',
  meta: [{ name: 'description', content: 'Data Undangan / Kegiatan' }],
})

const toast = useToast();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const tokenStore = useTokenStore();

const defaultFilter = {
  "sort": [
    { "field": "tanggal", "direction": "desc" }
  ],

  "includes": [
    { "relation": "penanggungJawab" }
  ],

  "aggregates": [
      { "relation": "peserta", "type": "count" }
  ]
};

const isInfoOpen = ref<boolean>(false);
const currentPage = ref<number>(1);
const bodyReq = ref<any>(defaultFilter)
const selectedData = ref<any>({
  no_surat: "",
  penerima_count: 0,
  tipe: "",
  undangan: {
    no_surat: '',
    perihal: '',
    tempat: '',
    pj: '',
    tgl_terbit: '',
    tanggal: '',
    catatan: '',
    status: '',
    created_at: '',
  }
});

const updateSelectedData = (data: any) => {
  selectedData.value = data;
};

const { API_V2_URL } = runtimeConfig.public;
const columns = [
  { label: "Perihal", key: "perihal" },
  { label: "Tempat", key: "lokasi" },
  { label: "Tipe", key: "tipe" },
  { label: "Tanggal Kegiatan", key: "tanggal" },
  { label: "Penanggung Jawab", key: "penanggung_jawab.nama" },
  { label: "Peserta", key: "peserta_count" },
];

const menu = (row: any) => [
  [
    { label: "Detail & Kehadiran", icon: "i-tabler-search", click: () => { router.push(`/undangan/${row.id}`) } },
    { label: "Tambah Penerima", icon: "i-tabler-users-plus", click: () => router.push(`/undangan/${row.id}/add/recipient`) },
  ], [
    { label: "QR Kehadiran", icon: "i-tabler-qrcode", click: () => router.push(`/undangan/${row.id}/qr`) },
    { label: "Bukti Kehadiwan", icon: "i-tabler-file-download", click: () => downloadBuktiKehadiran(row.id) },
    { label: "Undangan", icon: "i-tabler-download", click: () => downloadUndangan(row.id) }
  ], [
    // { label: "Buat Notulen", icon: "i-tabler-edit-circle", click: () => router.push(`/berkas/notulen/${row.id}/new`) }
  ]
]

const downloadBuktiKehadiran = (id: string) => {
  if (!tokenStore.accessToken) {
    toast.add({
      title: 'Gagal',
      description: 'Token tidak ditemukan, silahkan login kembali',
      color: 'red',
      timeout: 5000,
    });
    return;
  };

  const url = `${API_V2_URL}/undangan/${id}/proof?token=${tokenStore.accessToken}`;
  window.open(url, '_blank');
}

const downloadUndangan = (id: string) => {
  if (!tokenStore.accessToken) {
    toast.add({
      title: 'Gagal',
      description: 'Token tidak ditemukan, silahkan login kembali',
      color: 'red',
      timeout: 5000,
    });
    return;
  };

  const url = `${API_V2_URL}/undangan/${id}/download?token=${tokenStore.accessToken}`;
  window.open(url, '_blank');
}

const buildAddRecipientLink = (row: any) => {
  switch (row.tipe) {
    case 'surat/internal':
      return `${row.tipe}/${row.id}/add/recipient`;

    default:
      const noSurat = row.no_surat.split('/').slice(0, 1).join('/');
      const tglSurat = row.no_surat.split('/').slice(-1).join('/');

      // tgl surat is 030524 make it 2024-05-03
      const tglSuratFormatted = `20${tglSurat.slice(4, 6)}-${tglSurat.slice(2, 4)}-${tglSurat.slice(0, 2)}`;

      return `/berkas/${row.tipe}/${btoa(noSurat.replace(/^0+/, '') + "." + tglSuratFormatted)}/add/recipient`
  }
}

const onFilter = (data: any) => {
  currentPage.value = 1;
  if (data.search || data.filters) {
    const updatedBodyReq = {
      ...bodyReq.value,
      search: data.search ? { value: data.search.value } : bodyReq.value.search,
      filters: data.filters ? [...data.filters] : bodyReq.value.filters
    };

    bodyReq.value = updatedBodyReq;
  }
};

const { data: dataUndangan, status, error } = await useAsyncData(
  'dataUndangan',
  () => $fetch(`${API_V2_URL}/undangan/search`, {
    method: 'POST',
    query: { page: currentPage.value, limit: 10 },
    body: JSON.stringify(bodyReq.value),
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
  }), { watch: [currentPage, bodyReq], immediate: true, lazy: false }
);

if (error.value) {
  logEvent('fetch_undangan_error', error.value)
  console.error(error.value)
}
</script>