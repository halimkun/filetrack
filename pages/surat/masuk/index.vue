<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-mail-star" color="sky" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg">Surat Masuk</h1>
            <p class="text-sm text-cool-400">Data Surat Masuk <strong>RSIA Aisyiyah Pekajangan</strong></p>
          </div>
        </div>

        <UButton icon="i-tabler-plus" size="xs" color="sky" square @click="isFormOpen = true">
          Tambah Surat
        </UButton>
      </div>
    </template>

    <TableSuratMasuk 
      :response="(suratMasuk as any)" 
      :columns="columns" 
      :menu="menu" 
      :loading="suratMasukPending"

      @selectedChange="updateSelectedData" 
      @onPageChange="currentPage = $event" 
      @onFilter="onFilter" 
    />
  </UCard>

  <UModal v-model="isDetailOpen" @close="isDetailOpen = false">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-mail-star" color="sky" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Detail Surat Masuk</h1>
              <p class="text-sm text-cool-400">Detail Surat Masuk <strong>RSIA Aisyiyah Pekajangan</strong></p>
            </div>
          </div>
        </div>
      </template>

      <!-- loop ["no_simrs", "no_surat", "pengirim", "tgl_surat", "perihal", "pelaksanaan", "pelaksanaan_end", "tempat", "ket", "berkas", "status"] -->
      <template v-for="key in detailedData">
        <div class="mb-3">
          <h3 class="font-semibold text-sky-300">
            {{ key.replace(/_/g, ' ').toUpperCase() }}
          </h3>
          
          <template v-if="key == 'berkas'">
            <div class="mt-1">
              <template v-if="selectedData[0][key] && selectedData[0][key] !== ''">
                <UButton icon="i-tabler-file" size="xs" square variant="soft">
                  Lihat Berkas
                </UButton>   
              </template>
              
              <template v-else>
                <UButton icon="i-tabler-x" size="xs" color='orange' square variant="soft" disabled>
                  Lihat Berkas
                </UButton>   
              </template>
            </div>       
          </template>

          <template v-else-if="key == 'no_simrs'">
            <UBadge color="gray">{{ selectedData[0][key].split('-').reverse().join('/') }}</UBadge>
          </template>
          
          <template v-else-if="key == 'no_surat'">
            <UBadge color="gray">{{ selectedData[0][key] }}</UBadge>
          </template>

          <template v-else-if="key == 'tgl_surat'">
            <UBadge color="gray">{{ selectedData[0][key] && selectedData[0][key] != "0000-00-00" ? format(new Date(selectedData[0][key]), 'dd/MM/yyyy') : "-" }}</UBadge>
          </template>
          
          <template v-else-if="key == 'pelaksanaan'">
            <p  class="text-sm text-gray-400">{{ selectedData[0][key] && selectedData[0][key] != "0000-00-00" ? format(new Date(selectedData[0][key]), 'd MMMM yyyy') : '-' }}</p> 
          </template>

          <template v-else-if="key == 'pelaksanaan_end'">
            <p  class="text-sm text-gray-400">{{ selectedData[0][key] && selectedData[0][key] != "0000-00-00" ? format(new Date(selectedData[0][key]), 'd MMMM yyyy') : '-' }}</p> 
          </template>
          
          <template v-else-if="key == 'ket'">
            <div class="flex items-center gap-2 mt-1">
              <UIcon :name="selectedData[0][key] == 'wa' ? 'i-tabler-brand-whatsapp' : selectedData[0][key] == 'email' ? 'i-tabler-mail' : 'i-tabler-file-text'" />
              <p  class="text-sm text-gray-400 uppercase">{{ selectedData[0][key] }}</p> 
            </div>
          </template>

          <template v-else>
            <p class="text-gray-400">{{ selectedData[0][key] }}</p>
          </template>

        </div>
      </template>
    </UCard>
  </UModal>

  <UModal v-model="isFormOpen" @close="isFormOpen = false" prevent-close :ui="{ width: 'w-full sm:max-w-lg md:max-w-3xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex gap-2 items-start">
            <UButton icon="i-tabler-mail-star" color="sky" size="xs" square variant="soft" />
            <div>
              <h1 class="text-lg">Tambah Surat Masuk</h1>
              <p class="text-sm text-cool-400">Tambah Surat Masuk <strong>RSIA Aisyiyah Pekajangan</strong></p>
            </div>
          </div>

          <UButton icon="i-tabler-x" size="xs" color="rose" variant="ghost" square @click="isFormOpen = false" />
        </div>
      </template>
      
      <FormSuratMasuk @formOpen="isFormOpen = false" @refreshTable="refresh" />
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

useHead({
  title: 'Surat Masuk ',
  meta: [{ name: 'description', content: 'Surat Masuk' }],
});

// Penggunaan hooks terkait runtime config dan akses token
const runtimeConfig = useRuntimeConfig();
const tokenStore = useTokenStore();
const router = useRouter();

// Ekstraksi nilai yang diperlukan dari hooks
const { API_V2_URL } = runtimeConfig.public;

const isDetailOpen = ref<boolean>(false);
const isFormOpen = ref(false);
const selectedData = ref<any[]>([]);
const updateSelectedData = (data: any[]) => {
  selectedData.value = data;
};

const detailedData = ["no_simrs", "no_surat", "pengirim", "tgl_surat", "perihal", "pelaksanaan", "pelaksanaan_end", "tempat", "ket", "berkas", "status"];
const columns = [
  { label: "No. SIMRS", key: "no_simrs" },
  { label: "Perihal", key: "perihal" },
  { label: "Berkas", key: "berkas" },
  { label: "Pengirim", key: "pengirim" },
  { label: "Tanggal Surat", key: "tgl_surat" },
]

const menu = (row: any) => [
  [
    { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => handleDetailClick(row) },
    { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => router.push(`/surat/masuk/${btoa(row.no)}/edit`) },
  ],
]

const currentPage = ref<number>(1)
const bodyReq = ref<any>({
  "sort": [
    { "field": "no_simrs", "direction": "desc" }
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

const { data: suratMasuk, pending: suratMasukPending, refresh, error } = await useAsyncData(
  'suratMasuk',
  () => $fetch(`${API_V2_URL}/surat/masuk/search`, {
    method: 'POST',
    query: { page: currentPage.value },
    body: JSON.stringify(bodyReq.value),
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
  }), { watch: [currentPage, bodyReq], immediate: true, lazy: false }
);

if (error.value) {
  console.error(error.value)
}

// handle detail click
const handleDetailClick = (row: any) => {
  isDetailOpen.value = true;
  selectedData.value = [row];
};
</script>