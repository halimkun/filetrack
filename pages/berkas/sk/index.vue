<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-mail-star" color="amber" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg capitalize">
              Berkas SK
            </h1>
            <p class="text-sm text-cool-400">Data berkas SK terdaftar</p>
          </div>
        </div>

        <UButton icon="i-tabler-plus" size="xs" color="amber" square
          @click="rowSelected = null; isCreateModalOpen = true">
          Tambah Surat
        </UButton>
      </div>
    </template>

    <TableBerkasSk 
      :response="(berkasSk as any)"
      :menu="menu"
      :columns="columns"
      :loading="pending"

      @selectedChange="rowSelected = $event"
      @onPageChange="currentPage = $event"
      @onFilter="onFilter"
    />
  </UCard>

  <!-- Model Create -->
  <ModalTambahSk 
    v-model="isCreateModalOpen"
    :selectedSk="rowSelected"
  />

  <!-- Modal Delete confirmation -->
  <UModal v-model="isDeleteConfirmationOpen">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-trash" color="red" size="xs" square variant="soft" />
            <h1 class="text-lg">Konfirmasi Hapus</h1>
          </div>

          <UButton icon="i-tabler-x" size="xs" color="red" square variant="soft" @click="isDeleteConfirmationOpen = false" />
        </div>
      </template>

      Anda yakin ingin menghapus berkas surat dengan nomor 
      <UBadge color="gray">{{ [rowSelected?.nomor, rowSelected?.jenis, rowSelected?.prefix, format(new Date(rowSelected?.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy')].join('/') }}</UBadge>
      perihal <span class="font-bold">{{ rowSelected?.perihal }}</span>?

      <div class="mt-4 flex gap-2 justify-end">
        <UButton color="red" @click="isDeleteConfirmationOpen = false">Batal</UButton>
        
        <UButton color="green" @click="doDelete">Hapus</UButton>
      </div>
    </UCard>
  </UModal>

  <!-- Modal detail berkas -->
  <ModalDetailSk 
    v-model="isDetailOpen"
    :selectedSk="rowSelected"
  />

  <!-- Modal Upload Berkas -->
  <ModalUploadBerkasSk 
    v-model="isUploadModalOpen"
    :selectedSk="rowSelected"
  />
</template>

<script lang="ts" setup>
import { format } from 'date-fns'

const toasts = useToast()
const router = useRouter();
const runtimeConfig = useRuntimeConfig()
const accessTokenStore = useAccessTokenStore()

useHead({
  title: `Berkas SK direktur -- ILM `,
  meta: [{ name: 'description', content: `Berkas SK direktur` }]
});

const { API_V2_URL } = runtimeConfig.public;
const accessToken: string | null = accessTokenStore.accessToken;

const isDetailOpen = ref<boolean>(false)
const isDeleteConfirmationOpen = ref<boolean>(false)
const isCreateModalOpen = ref<boolean>(false)
const isUploadModalOpen = ref<boolean>(false)

const rowSelected = ref<any>(null)
const currentPage = ref<number>(1)

const defaultFilter = {
  "sort": [
    { "field": "created_at", "direction": "desc" }
  ], 
  "filters" : [
    { "field": 'status', "operator": '=', "value": '1' }
  ]
};
const bodyReq = ref<any>({ ...defaultFilter });

const onFilter = (data: any) => {
  if (data.search || data.filters) {
    const updatedFilters = data.filters ? [...defaultFilter.filters, ...data.filters] : [...defaultFilter.filters];
    const updatedBodyReq = {
      ...bodyReq.value,
      search: data.search ? { value: data.search.value } : bodyReq.value.search,
      filters: updatedFilters
    };

    bodyReq.value = updatedBodyReq;
  }
};


const columns = [
  { label: "Nomor", key: "nomor" },
  { label: "Judul", key: "judul" },
  { label: "Tanggal Terbit", key: "tgl_terbit" },
]

const menu = (row: any) => [
  [
    { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => { rowSelected.value = row; isDetailOpen.value = true } },
  ], [
    { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => handleOpenEdit(row) },
    { label: 'Upload Berkas', icon: 'i-heroicons-arrow-up-tray-20-solid', click: () => { rowSelected.value = row; isUploadModalOpen.value = true } }
  ], [
    { label: 'Hapus Surat', icon: 'i-tabler-trash', click: () => { rowSelected.value = row; isDeleteConfirmationOpen.value = true } }
  ]
]

const { data: berkasSk, pending, error } = await useAsyncData(
  'berkasSk',
  () => $fetch(`${API_V2_URL}/berkas/sk/search`, {
    method: 'POST',
    query: { page: currentPage.value },
    body: JSON.stringify(bodyReq.value),
    headers: { Authorization: `Bearer ${accessToken}` },
  }), { watch: [currentPage, bodyReq], immediate: true, lazy: false }
);

if (error.value) {
  console.error(error.value)
}

async function handleOpenEdit(row: any) {
  rowSelected.value = row
  setTimeout(() => {
    isCreateModalOpen.value = true
  }, 300)
}

async function doDelete() {
  const data = {
    ...rowSelected.value,
    status: "0"
  }

  if (data.penanggung_jawab) {
    delete data.penanggung_jawab
  }

  const { data: postData, error, status } = await useFetch(`${API_V2_URL}/berkas/sk/${btoa(`${data.nomor}.${data.jenis}.${data.tgl_terbit}`)}`, {
    params: { _method: 'PUT' },
    method: "POST",
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  })


  if (error.value) {
    console.error("Error deleting file: ", error.value)
    toasts.add({ title: 'Error', description: error.value.message, color: 'red' })
    return
  }

  if (status.value === 'success') {
    toasts.add({ title: 'Berhasil', description: 'Berkas berhasil dihapus', color: 'green' })
    router.go(0)
  }

  isDeleteConfirmationOpen.value = false
}
</script>