<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-mail-star" color="indigo" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg capitalize">
              Berkas Komite
              <span :class="lastSegment == 'ppi' || lastSegment == 'pmkp' ? 'uppercase' : ''">
                {{ lastSegment }}
              </span>
            </h1>
            <p class="text-sm text-cool-400">Data berkas komite {{ lastSegment }} terdaftar</p>
          </div>
        </div>

        <UButton icon="i-tabler-plus" size="xs" color="indigo" square
          @click="router.push(`/berkas/komite/${lastSegment}/create`)">
          Tambah Surat
        </UButton>
      </div>
    </template>

    <TableBerkasKomite :menu="menu" :komite="(lastSegment as string)" />
  </UCard>

  <!-- Modal Detail -->
  <UModal v-model="isDetailOpen">
    <UCard>
      <template #header>
        <div class="flex justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-file" color="indigo" size="xs" square variant="soft" />
            <h1 class="text-lg">Detail Surat</h1>
          </div>

          <UButton icon="i-tabler-x" size="xs" color="red" square variant="soft" @click="isDetailOpen = false" />
        </div>
      </template>

      <div class="mb-4">
        <h3 class="text-lg font-bold text-sky-400">Nomor Surat</h3>
        <UBadge color="gray" class="text-xs">
          {{ [rowSelected?.nomor, rowSelected?.prefix, format(new Date(rowSelected?.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy')].join('/') }}
        </UBadge>
      </div>

      <div class="mb-4">
        <h3 class="text-lg font-bold text-sky-400">Perihal</h3>
        <p class="text-gray-400">{{ rowSelected?.perihal }}</p>
      </div>

      <div class="mb-4">
        <h3 class="text-lg font-bold text-sky-400">Penanggung Jawab</h3>
        <p class="text-gray-400">{{ rowSelected?.penanggung_jawab.nama }}</p>
      </div>

      <div class="mb-4">
        <h3 class="text-lg font-bold text-sky-400">Tanggal Terbit</h3>
        <p class="text-gray-400">{{ new Date(rowSelected?.tgl_terbit).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>
    </UCard>
  </UModal>

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
      <UBadge color="gray">{{ [rowSelected?.nomor, rowSelected?.prefix, format(new Date(rowSelected?.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy')].join('/') }}</UBadge>
      perihal <span class="font-bold">{{ rowSelected?.perihal }}</span>?

      <div class="mt-4 flex gap-2 justify-end">
        <UButton color="red" @click="isDeleteConfirmationOpen = false">Batal</UButton>
        
        <UButton color="green" @click="doDelete">Hapus</UButton>
      </div>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()
const lastSegment = route.fullPath.split('/').pop()

useHead({
  title: `Berkas komite ${lastSegment} `,
  meta: [{ name: 'description', content: `Berkas komite ${lastSegment}` }]
});

const toasts = useToast()
const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore();
const { API_V2_URL } = runtimeConfig.public

const isDetailOpen = ref(false)
const isDeleteConfirmationOpen = ref(false)
const rowSelected = ref<any>(null)
const menu = (row: any) => [
  [
    { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => { rowSelected.value = row; isDetailOpen.value = true } },
  ], [
    { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => router.push(`/berkas/komite/${lastSegment}/${btoa(`${row.nomor}.${row.tgl_terbit}`)}/edit`) },
    { label: 'Tambah Penerima', icon: 'i-tabler-user-plus', click: () => router.push(`/berkas/komite/${lastSegment}/${btoa(`${row.nomor}.${row.tgl_terbit}`)}/add/recipient`) }
  ], [
    { label: 'Hapus Surat', icon: 'i-tabler-trash', click: () => { rowSelected.value = row; isDeleteConfirmationOpen.value = true } }
  ]
]

async function doDelete() {
  const data = {
    ...rowSelected.value,
    status: "0"
  }

  if (data.penanggung_jawab) {
    delete data.penanggung_jawab
  }

  const { data: postData, pending, error, refresh, status } = await useFetch(`${API_V2_URL}/berkas/komite/${lastSegment}/${btoa(`${rowSelected.value.nomor}.${rowSelected.value.tgl_terbit}`)}`, {
    params: { _method: 'PUT' },
    method: "POST",
    headers: { 'Authorization': `Bearer ${tokenStore.accessToken}` },
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