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

        <UButton icon="i-tabler-plus" size="xs" color="indigo" square @click="router.push('/surat/internal/create')">
          Tambah Surat
        </UButton>
      </div>
    </template>
    
    <!-- content -->
    <TableSpo 
      :response="data"
      :columns="columns"
      @onPageChange="currentPage = $event"
      @onFilter="onFilter"
    />
  </UCard>
</template>

<script lang="ts" setup>
  import type { ResourcePagination } from '~/types/ApiResponse';

  const router = useRouter();
  const runtimeConfig = useRuntimeConfig()
  const accessTokenStore = useAccessTokenStore()

  const currentPage = ref<number>(1);
  const { API_V2_URL } = runtimeConfig.public;
  const accessToken: string | null = accessTokenStore.accessToken;
  const bodyReq = ref<any>({
    "sort": [
      { "field": "tgl_terbit", "direction": "desc" }
    ]
  })

  const columns = [
    { label: "Nomor", key: "nomor" },
    { label: "Judul", key: "judul" },
    { label: "Unit", key: "unit" },
    { label: "Unit Terkait", key: "unit_terkait" },
    { label: "Tgl Terbit", key: "tgl_terbit" },
    { label: "Jenis", key: "jenis" },
  ];

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

  const { data, pending, error, refresh } = await useAsyncData<ResourcePagination>(
      `${API_V2_URL}/berkas/spo/search`,
      () => $fetch(`${API_V2_URL}/berkas/spo/search`, {
        method: 'POST',
        query: { page: currentPage.value },
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(bodyReq.value)
      }), { watch: [ currentPage, bodyReq ], immediate: true, lazy: false }
  );

  if (error.value) {
    console.error('Error fetching data', error.value);
  }

  if (pending.value) {
    console.log('Fetching data...');
  }

  onMounted(() => {
    refresh();
  });
</script>