<template>
  <UCard>
    <!-- header -->
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
    
    <!-- content -->
    <TableSpo 
      :response="data"
      :columns="columns"
      :menu="menu"
      @onPageChange="currentPage = $event"
      @onFilter="onFilter"
    />
  </UCard>
</template>

<script lang="ts" setup>
  import type { ResourcePagination } from '~/types/ApiResponse';

  const router = useRouter();
  const runtimeConfig = useRuntimeConfig()
  const tokenStore = useTokenStore();
  
  const isDetailOpen = ref<boolean>(false);
  const isDeleteConfirmationOpen = ref<boolean>(false);

  const rowSelected = ref<any>(null);
  const currentPage = ref<number>(1);
  const { API_V2_URL } = runtimeConfig.public;
  const bodyReq = ref<any>({
    "sort": [
      { "field": "tgl_terbit", "direction": "desc" }
    ]
  })

  const menu = (row: any) => [
    [
      { label: "Detail SPO", icon: "i-heroicons-eye-20-solid", click: () => { rowSelected.value = row; isDetailOpen.value = true }, disabled: true },
      { label: 'Edit SPO', icon: 'i-heroicons-pencil-square-20-solid', click: () => router.push(`/berkas/spo/${btoa(`${row.nomor}`)}/edit`) },
    ]
  ]

  const columns = [
    { label: "Nomor", key: "nomor" },
    { label: "Judul", key: "judul" },
    { label: "Unit", key: "unit" },
    { label: "Unit Terkait", key: "unit_terkait" },
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

  onMounted(() => {
    refresh();
  });
</script>