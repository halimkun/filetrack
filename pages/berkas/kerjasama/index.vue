<template>
<UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-start">
          <UButton icon="i-tabler-mail-star" color="lime" size="xs" square variant="soft" />
          <div>
            <h1 class="text-lg">Berkas PKS</h1>
            <p class="text-sm text-cool-400">Data Berkas PKS terdaftar</p>
          </div>
        </div>

        <UButton icon="i-tabler-plus" size="xs" color="lime" square @click="router.push('/berkas/kerjasama/create')">
          Tambah
        </UButton>
      </div>
    </template>

    <TableBerkasPks
      :response="(berkasPKS as any)" 
      :columns="columns" 
      :menu="menu" 
      :loading="pending"
      @selectedChange="updateSelectedData" 
      @onPageChange="currentPage = $event" 
      @onFilter="onFilter"
    />    
  </UCard>

  <!-- Modal Detail PKS -->
  <ModalDetailPks 
    v-model="isDetailOpen"
    :data="selectedData" 
  />

  <!-- Modal Upload Berkas PKS -->
  <ModalUploadBerkasPks 
    v-model="isUploadOpen" 
    :selectedPks="selectedData"
  />
</template>

<script lang="ts" setup>
  import type {BerkasPksData} from '~/types/BerkasPks';

  useHead({
    title: 'Berkas PKS -- FileTrack | FAISAL HALIM',
    meta: [{ name: 'description', content: 'Berkas PKS' }],
  });

  const runtimeConfig = useRuntimeConfig();
  const accessTokenStore = useAccessTokenStore();
  const router = useRouter();

  // Ekstraksi nilai yang diperlukan dari hooks
  const { API_V2_URL } = runtimeConfig.public;
  const accessToken: string | null = accessTokenStore.accessToken;

  const isUploadOpen = ref<boolean>(false);
  const isDetailOpen = ref<boolean>(false);
  const selectedData = ref<any>({});
  const updateSelectedData = (data: BerkasPksData) => {
    selectedData.value = data;
  };

  const columns = [
    { label: "No PKS Internal", key: "no_pks_internal" },
    { label: "Judul", key: "judul" },
    { label: "Tgl Awal", key: "tanggal_awal" },
    { label: "Tgl Akhir", key: "tanggal_akhir" },
    { label: "PJ", key: "penanggung_jawab.nama" }
  ]

  const menu = (row: any) => [
    [
      { label: "Detail Surat", icon: "i-heroicons-eye-20-solid", click: () => { updateSelectedData(row); isDetailOpen.value = true } },
    ], [
      { label: 'Upload Berkas', icon: 'i-heroicons-arrow-up-tray-20-solid', click: () => { updateSelectedData(row); isUploadOpen.value = true } },
      { label: 'Edit Surat', icon: 'i-heroicons-pencil-square-20-solid', click: () => router.push(`/berkas/kerjasama/${btoa(row.id)}/edit`) },
    ]
  ]

  const currentPage = ref<number>(1)
  const bodyReq = ref<any>({
    "sort": [
      { "field": "id", "direction": "desc" }
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

  const { data: berkasPKS, pending, error } = await useAsyncData(
    'berkasPKS',
    () => $fetch(`${API_V2_URL}/berkas/pks/search`, {
      method: 'POST',
      query: { page: currentPage.value },
      body: JSON.stringify(bodyReq.value),
      headers: { Authorization: `Bearer ${accessToken}` },
    }), { watch: [currentPage, bodyReq], immediate: true, lazy: false }
  );

  if (error.value) {
    console.error(error.value)
  }
</script>