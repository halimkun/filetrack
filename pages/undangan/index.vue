<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-mail-star" color="teal" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg">Undangan / Kegiatan</h1>
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
import type { SuratUndangan, Undangan } from '~/types/Undangan';

useHead({
  title: 'Data Undangan / Kegiatan -- FileTrack | FAISAL HALIM',
  meta: [{ name: 'description', content: 'Data Undangan / Kegiatan' }],
})

const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const accessTokenStore = useAccessTokenStore();

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
const accessToken: string | null = accessTokenStore.accessToken;

const columns = [
  { label: "No Surat", key: "no_surat" },
  { label: "Perihal", key: "undangan.perihal" },
  { label: "Tempat", key: "undangan.tempat" },
  { label: "Tanggal Kegiatan", key: "undangan.tanggal" },
  { label: "PJ", key: "undangan.pj" },
  { label: "Jenis", key: "tipe" },
  { label: "Peserta", key: "penerima_count" },
];

const menu = (row: any) => [
  [
    { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => { router.push(`/${row.tipe}/${btoa(row.no_surat)}`) } },
  ]
]

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

const { data: dataUndangan, pending, error } = await useAsyncData(
  'dataUndangan',
  () => $fetch(`${API_V2_URL}/undangan/search`, {
    method: 'POST',
    query: { page: currentPage.value, limit: 10 },
    body: JSON.stringify(bodyReq.value),
    headers: { Authorization: `Bearer ${accessToken}` },
  }), { watch: [currentPage, bodyReq], immediate: true, lazy: false }
);

if (error.value) {
  console.error(error.value)
}
</script>