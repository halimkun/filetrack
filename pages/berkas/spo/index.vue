<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-checkup-list" color="indigo" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg">Berkas SPO</h1>
            <p class="text-sm text-cool-400">Data Berkas SPO ( Standar Prosedur Operasional )</p>
          </div>
        </div>

        <UButton icon="i-tabler-plus" size="xs" color="indigo" square @click="router.push('/berkas/spo/create')">
          Tambah SPO
        </UButton>
      </div>
    </template>
    
    <TableSpo 
      :response="data"
      :columns="columns"
      :menu="menu"
      @onPageChange="currentPage = $event"
      @onFilter="onFilter"
    />
  </UCard>

  <UModal v-model="isDetailOpen" :title="'Detail SPO'" :ui="{ width: 'w-full sm:max-w-4xl' }">
    <UCard>
      <table class="w-full detail-spo">
        <thead class="text-sm text-gray-500 dark:text-gray-400">
          <tr class="align-middle text-center text-sm text-gray-500 dark:text-gray-400">
            <td rowspan="2" class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 space-y-8 p-3 w-[200px]">
              <h4 class="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase leading-5">RSIA Aisyiyah Pekajangan</h4>
              <img src="/logo.png" alt="Logo RSIA Aisyiyah Pekajangan" class="w-24 h-24 mx-auto mb-2" />
            </td>
            <td colspan="2" class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3">
              <h3 class="text-xl text-gray-500 dark:text-gray-400 font-bold">
                {{ rowSelected.judul }}
              </h3>
            </td>
          </tr>
          <tr class="align-middle text-center text-sm text-gray-500 dark:text-gray-400">
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3">
              <p class="font-bold leading-none">No. Dokumen</p>
              <p>{{ rowSelected.nomor }}</p>
            </td>
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3">
              <p class="font-bold leading-none">Halaman</p>
              <p>1/1</p>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr class="align-middle text-center text-sm text-gray-500 dark:text-gray-400">
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3">
              <h4 class="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase leading-5">Standar Prosedur Operasional</h4>
            </td>
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3">
              <p class="font-bold">Tanggal Ditetapkan</p>
              <p>{{ new Date(rowSelected.tgl_terbit).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: '2-digit' 
              }) }}</p>
            </td>
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3">
              <p class="font-bold leading-none">Ditetapkan</p>
              <p class="font-bold leading-none">Direktur RSIA Aisyiyah Pekajangan</p>

              <div class="mt-20">
                <p>{{ "............." }}</p>
              </div>
            </td>
          </tr>

          <tr class="align-middle text-sm text-gray-500 dark:text-gray-400">
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center p-3 font-bold">Pengertian</td>
            <td colspan="2" class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3" v-html="unescapeHtml(rowSelected.pengertian)"></td>
          </tr>
          <tr class="align-middle text-sm text-gray-500 dark:text-gray-400">
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center p-3 font-bold">Tujuan</td>
            <td colspan="2" class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3" v-html="unescapeHtml(rowSelected.tujuan)"></td>
          </tr>
          <tr class="align-middle text-sm text-gray-500 dark:text-gray-400">
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center p-3 font-bold">Kebijakan</td>
            <td colspan="2" class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3" v-html="unescapeHtml(rowSelected.kebijakan)"></td>
          </tr>
          <tr class="align-middle text-sm text-gray-500 dark:text-gray-400">
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center p-3 font-bold">Prosedur</td>
            <td colspan="2" class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3" v-html="unescapeHtml(rowSelected.prosedur)"></td>
          </tr>
          <tr class="align-middle text-sm text-gray-500 dark:text-gray-400">
            <td class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center p-3 font-bold">Unit Terkait</td>
            <td colspan="2" class="border dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 p-3">
              <template v-if="spoUnits && spoUnits.length">
                <ol class="list-decimal ml-6">
                  <li v-for="(item, index) in spoUnits" :key="index" class="!mb-0">
                    {{ item.unit?.nama || item.unit_id }}
                  </li>
                </ol>
              </template>

              <template v-else>
                <p>Tidak ada unit ditemukan.</p>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
  import type { ResourcePagination } from '~/types/ApiResponse';
  import { format } from 'date-fns';

  const router = useRouter();
  const runtimeConfig = useRuntimeConfig()
  const tokenStore = useTokenStore();
  
  const isDetailOpen = ref<boolean>(false);

  const rowSelected = ref<any>(null);
  const spoUnits = ref<any>(null);
  const currentPage = ref<number>(1);
  const { API_V2_URL } = runtimeConfig.public;
  const bodyReq = ref<any>({
    "sort": [
      { "field": "tgl_terbit", "direction": "desc" }
    ]
  })

  const menu = (row: any) => [
    [
      { label: "Detail SPO", icon: "i-heroicons-eye-20-solid", click: () => { rowSelected.value = row; isDetailOpen.value = true } },
      { label: 'Edit SPO', icon: 'i-heroicons-pencil-square-20-solid', click: () => router.push(`/berkas/spo/${row.id}/edit`) },
    ]
  ]

  const columns = [
    { label: "Nomor", key: "nomor" },
    { label: "Judul", key: "judul" },
    { label: "Unit", key: "unit_id" },
    { label: "Tgl Terbit", key: "tgl_terbit" },
    { label: "Jenis", key: "jenis" },
  ];

  if (!columns?.some(column => column.key === 'actions')) {
    columns?.push({ label: 'Actions', key: 'actions' });
  }

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

  const { data, error, refresh } = await useAsyncData<ResourcePagination>(
      `${API_V2_URL}/berkas/spo/search`,
      () => $fetch(`${API_V2_URL}/berkas/spo/search`, {
        method: 'POST',
        query: { page: currentPage.value },
        headers: { 'Authorization': `Bearer ${tokenStore.accessToken}` },
        body: JSON.stringify(bodyReq.value)
      }), { watch: [ currentPage, bodyReq ], immediate: true, lazy: false }
  );

  if (error.value) {
    console.error('Error fetching data', error.value);
  }

  watch(isDetailOpen, async (value) => {
    if (value) {
      await $fetch(`${API_V2_URL}/berkas/spo/${rowSelected.value.id}/units`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenStore.accessToken}` }
      }).then((res) => {
        spoUnits.value = (res as any)?.data || null;
      }).catch((err) => {
        console.error('Error fetching SPO units', err);
      });
    } else {
      spoUnits.value = null;
    }
  });

  onMounted(() => {
    refresh();
  });
</script>