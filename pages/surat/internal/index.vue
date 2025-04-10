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

          <UButton icon="i-tabler-plus" size="xs" color="indigo" square @click="isFormOpen = true">
            Tambah Surat
          </UButton>
        </div>
      </template>

      <TableSuratInternal 
        :response="(suratInternal as any)" 
        :columns="columns" 
        :menu="menu" 
        :loading="status == 'pending'"

        @onPageChange="currentPage = $event" 
        @onFilter="onFilter"
        @openUndangan="(row: any) => {
          isDetailOpen = true
          selectedData = row
        }"
      />
      <!-- @selectedChange="updateSelectedData"  -->
    </UCard>


    <!-- modal form surat internal -->
    <ModalFormSuratInternal 
      v-model="isFormOpen"
      :selectedData="selectedData"

      @close="isFormOpen = false; selectedData = null"
      @refresh="refresh"
    />

    <UModal v-model="isDetailOpen" prevent-close :ui="{ width: 'w-full sm:max-w-lg md:max-w-2xl' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Detail Undangan
            </h3>

            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="selectedData = null; isDetailOpen = false" />
          </div>
        </template>

        <div class="space-y-3">
          <div class="space-y-0">
            <p class="font-semibold text-sm text-indigo-500">Perihal</p>
            <p class="font-semibold text-base">{{ selectedData?.perihal }}</p>
          </div> 

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-0 md:col-span-2">
              <p class="font-semibold text-sm text-indigo-500">No Surat</p>
              <p class="font-semibold text-base">{{ selectedData?.no_surat ?? '-' }}</p>
            </div>

            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Tanggal Terbit</p>
              <p class="font-semibold text-base">
                {{ new Date(selectedData?.tgl_terbit).toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
                }) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- penanggung jawab -->
            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Penanggung Jawab</p>
              <p class="font-semibold text-base">{{ selectedData?.penanggung_jawab.nama }}</p>
            </div>

            <!-- Diajukan Oleh jawab -->
            <div class="space-y-0">
              <p class="font-semibold text-sm text-indigo-500">Diajukan Oleh</p>
              <p class="font-semibold text-base">{{ selectedData?.diajukan_oleh.nama }}</p>
            </div>
          </div>

          <div class="space-y-0">
            <p class="font-semibold text-sm text-indigo-500">Status</p>
            <p class="font-semibold text-base">
              <UBadge :color="selectedData?.status == 'pengajuan' ? 'yellow' : selectedData?.status == 'disetujui' ? 'sky' : selectedData?.status == 'ditolak' ? 'red' : selectedData?.status == 'batal' ? 'gray' : 'gray'">
                {{ selectedData?.status }}
              </UBadge>
            </p>
          </div>

          <!-- catatan -->
          <div class="space-y-0">
            <p class="font-semibold text-sm text-indigo-500">Catatan</p>
            <p class="font-semibold text-base">{{ selectedData?.catatan ?? "-" }}</p>
          </div>

          <template v-if="selectedData?.undangan">
            <div class="p-3 rounded-md dark:bg-gray-800">
              <!-- judul -->
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Detail Undangan
              </h3>

              <!-- divider -->
               <UDivider class="my-2 border-t-2 border-gray-200 dark:border-gray-700" />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-0">
                  <p class="font-semibold text-sm text-indigo-500">Tanggal</p>
                  <p class="font-semibold text-base">
                    {{ new Date(selectedData?.undangan.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
                    }) }}
                  </p>
                </div>

                <div class="space-y-0">
                  <p class="font-semibold text-sm text-indigo-500">Lokasi</p>
                  <p class="font-semibold text-base">{{ selectedData?.undangan.lokasi }}</p>
                </div>

                <div class="space-y-0">
                  <p class="font-semibold text-sm text-indigo-500">Deskripsi</p>
                  <p class="font-semibold text-base">{{ selectedData?.undangan.deskripsi ?? "-" }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<!-- TODO : Lanjutkan fungsi lainnya yang termasuk dalam surat internal, misalnya edit dll.  -->

<script setup lang="ts">
useHead({
  title: 'Surat Internal -- ILM ',
  meta: [{ name: 'description', content: 'Surat Internal' }],
});

// Penggunaan hooks terkait runtime config dan akses token
const isFormOpen = ref<boolean>(false);
const isDetailOpen = ref<boolean>(false);

const selectedData = ref<any>(null);

const runtimeConfig = useRuntimeConfig();
const tokenStore = useTokenStore();
const router = useRouter();

// Ekstraksi nilai yang diperlukan dari hooks
const { API_V2_URL } = runtimeConfig.public;

// const updateSelectedData = (data: any[]) => {
//   selectedData.value = data;
// };

const columns = [
  { label: "No Surat", key: "no_surat" },
  { label: "", key: "undangan" },
  { label: "Perihal", key: "perihal" },
  { label: "PJ", key: "penanggung_jawab.nama" },
  { label: "Tanggal Terbit", key: "tgl_terbit" },
  { label: "Status", key: "status" },
]

const menu = (row: any) => [
  [
    { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => { isDetailOpen.value = true; selectedData.value = row; } }
  ], [
    { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => { selectedData.value = row; isFormOpen.value = true; } },
    // { label: 'Tambah Penerima', icon: 'i-tabler-user-plus', click: () => router.push(`/surat/internal/${btoa(row.no_surat)}/add/recipient`) },
  ]
]

const currentPage = ref<number>(1)
const bodyReq = ref<any>({
  "sort": [
    { "field": "created_at", "direction": "desc" }
  ],
  "includes": [
    { "relation": "undangan" }
  ]
})

const onFilter = (data: any) => {
  if (data.search || data.filters) {
    const updatedBodyReq = {
      ...bodyReq.value,
      search: data.search ? { value: data.search.value } : bodyReq.value.search,
      filters: data.filters ? [...data.filters] : bodyReq.value.filters,
    };

    bodyReq.value = updatedBodyReq;
  }
};

const { data: suratInternal, refresh, status, error } = await useAsyncData(
  'suratInternal',
  () => $fetch(`${API_V2_URL}/surat/internal/search`, {
    method: 'POST',
    query: { page: currentPage.value },
    body: JSON.stringify(bodyReq.value),
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
  }), { watch: [currentPage, bodyReq], immediate: true, lazy: false }
);

if (error.value) {
  console.error(error.value)
}
</script>