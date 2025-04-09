<template>
  <div>
    <!-- filter -->
    <div class="mb-5 flex flex-col lg:flex-row items-center justify-start gap-4">
      <UFormGroup label="Departement" class="w-full lg:w-72" name="departemen">
        <SelectDepartemen :dep="selectedDep" @update:selectedDep="selectedDep = $event" />
      </UFormGroup>

      <UFormGroup label="Search" class="w-full" name="search">
        <UInput v-model="search" placeholder="Search" color="gray" variant="outline" />
      </UFormGroup>
    </div>

    <!-- table -->
    <UTable :columns="columns" :rows="(pegawaiData?.data as any)" :loading="pending" v-bind="$attrs">
      <template #nik-data="{ row }">
        <UBadge color="primary" variant="soft">{{ row.nik }}</UBadge>
      </template>

      <template #jk-data="{ row }">
        <UButton
          :icon="String(row.jk).toLocaleLowerCase() == 'pria' ? 'i-tabler-gender-male' : 'i-tabler-gender-female'"
          :color="String(row.jk).toLocaleLowerCase() == 'pria' ? 'indigo' : 'pink'" variant="soft" size="xs" square>{{
            row.jk }}</UButton>
      </template>
    </UTable>

    <!-- pagination -->
    <div v-if="pegawaiData && pegawaiData.meta">
      <div class="mt-5 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing : {{ (pegawaiData.meta as any).from }}
          to {{ (pegawaiData.meta as any).to }}
          of {{ (pegawaiData.meta as any).total }} entries
        </p>
        <UPagination v-model="currentPage" :page-count="(pegawaiData.meta as any).per_page"
          :total="(pegawaiData.meta as any).total" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig()
const tokenStore = useTokenStore();

const { API_V2_URL } = runtimeConfig.public
const defaultFilter = {
  sort: [
    { field: "nama", direction: "asc" }
  ],
  filters: [
    { field: "stts_aktif", operator: "=", value: "AKTIF" },
    { field: "jbtn", operator: "!=", value: "-" }
  ]
};

const bodyReq = ref<any>(defaultFilter)
const currentPage = ref<number>(1)

const selectedDep = ref<string>('-')
watch(selectedDep, (value) => {
  if (value != "-") {
    bodyReq.value = {
      ...defaultFilter,
      filters: [
        ...defaultFilter.filters,
        { field: "departemen", operator: "=", value: value }
      ]
    }
  } else {
    bodyReq.value = defaultFilter
  }
})

const search = ref<string>('')
watch(search, () => {
  if (search.value) {
    bodyReq.value = {
      ...defaultFilter,
      search: {
        value: search.value
      }
    }
  } else {
    bodyReq.value = defaultFilter
  }
})


const columns = [
  { label: "Nama", key: "nama" },
  { label: "JK", key: "jk" },
  { label: "NIK", key: "nik" },
  { label: "Bidang", key: "bidang" },
  { label: "Departemen", key: "dep.nama" },
];

const { data: pegawaiData, pending, error, refresh } = await useLazyAsyncData<any>(
  'Pegawai',
  () => $fetch(`${API_V2_URL}/pegawai/search?select=nik,nama,jk,departemen,bidang&include=dep`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    query: { page: currentPage.value, limit: 10, },
    body: JSON.stringify(bodyReq.value)
  }), { watch: [currentPage, bodyReq] }
);
</script>