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

    <TableUndangan :response="(dataUndangan as any)" :columns="columns" :menu="menu" :loading="pending"
      @selectedChange="updateSelectedData" @onPageChange="currentPage = $event" @onFilter="onFilter" />
  </UCard>

  <ModalInfoTambahUndangan v-model="isInfoOpen" />
</template>

<script lang="ts" setup>
import type { SuratUndangan } from '~/types/Undangan';
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
    { "field": "no_surat", "direction": "desc" }
  ]
};

const isInfoOpen = ref<boolean>(false);
const currentPage = ref<number>(1);
const bodyReq = ref<any>(defaultFilter)
const selectedData = ref<SuratUndangan>({
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

const updateSelectedData = (data: SuratUndangan) => {
  selectedData.value = data;
};

const { API_V2_URL } = runtimeConfig.public;
const columns = [
  { label: "No Surat", key: "no_surat" },
  { label: "Perihal", key: "undangan.perihal" },
  { label: "Tempat", key: "undangan.tempat" },
  { label: "Tanggal Kegiatan", key: "undangan.tanggal" },
  { label: "PJ", key: "undangan.penanggung_jawab_simple.nama" },
  { label: "Jenis", key: "tipe" },
  { label: "Peserta", key: "penerima_count" },
];

const menu = (row: any) => [
  [
    { label: "Detail & Kehadiran", icon: "i-tabler-search", click: () => { router.push(`/${row.tipe}/${btoa(row.no_surat)}`) } },
    { label: "Tambah Penerima", icon: "i-tabler-users-plus", click: () => router.push(buildAddRecipientLink(row)) },
  ], [
    { label: "QR Kehadiran", icon: "i-tabler-qrcode", click: () => router.push(`/undangan/${btoa(row.no_surat)}/qr`) },
    { label: "Bukti Kehadiwan", icon: "i-tabler-file-download", click: () => downloadBuktiKehadiran(row.no_surat) },
    { label: "Undangan", icon: "i-tabler-download", click: () => downloadUndangan(row.no_surat) }
  ], [
    { label: "Buat Notulen", icon: "i-tabler-edit-circle", click: () => router.push(`/berkas/notulen/${btoa(row.no_surat)}/new`) }
  ]
]

const downloadBuktiKehadiran = (noSurat: string) => {
  if (!tokenStore.accessToken) {
    toast.add({
      title: 'Gagal',
      description: 'Token tidak ditemukan, silahkan login kembali',
      color: 'red',
      timeout: 5000,
    });
    return;
  };

  const url = `${API_V2_URL}/undangan/penerima/${btoa(noSurat)}/proof?token=${tokenStore.accessToken}`;
  window.open(url, '_blank');
}

const downloadUndangan = (noSurat: string) => {
  if (!tokenStore.accessToken) {
    toast.add({
      title: 'Gagal',
      description: 'Token tidak ditemukan, silahkan login kembali',
      color: 'red',
      timeout: 5000,
    });
    return;
  };

  const url = `${API_V2_URL}/undangan/${btoa(noSurat)}/download?token=${tokenStore.accessToken}`;
  window.open(url, '_blank');
}

const buildAddRecipientLink = (row: any) => {
  switch (row.tipe) {
    case 'surat/internal':
      return `${row.tipe}/${btoa(row.no_surat)}/add/recipient`;

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

const { data: dataUndangan, pending, error } = await useAsyncData(
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