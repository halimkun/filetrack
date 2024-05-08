<template>
  <div class="mb-5 flex flex-col lg:flex-row items-center justify-start gap-4">
    <UFormGroup label="Tanggal Terbit" class="w-full lg:w-72" name="tgl_terbit">
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton block icon="i-heroicons-calendar-days-20-solid"
          :label="tglTerbit ? format(tglTerbit, 'd MMM, yyy') : 'Tanggal Terbit'" color="gray" variant="outline" />

        <template #panel="{ close }">
          <DatePicker v-model="tglTerbit" is-required @close="close" />

          <div class="w-full px-4 pb-5">
            <button class="bg-rose-600 hover:bg-rose-700 text-white font-bold w-full px-3 py-1 rounded-md"
              @click="tglTerbit = null">
              Clear
            </button>
          </div>
        </template>
      </UPopover>
    </UFormGroup>

    <UFormGroup label="Search" class="w-full" name="search">
      <UInput v-model="search" placeholder="Search" color="gray" variant="outline" />
    </UFormGroup>
  </div>

  <UTable v-model="selected" :columns="columns" :rows="berkasKomite.data" :loading="loading">
    <template #actions-data="{ row }">
      <UDropdown v-if="menu" :items="menu(row)">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </template>

    <template #no_surat-data="{ row }">
      <UBadge color="gray" class="text-xs">
        {{ [row.nomor, row.prefix, format(new Date(row.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy')].join('/') }}
      </UBadge>
    </template>

    <template #created_at-data="{ row }">
      {{ new Date(
        row.created_at.replace(' ', 'T').split('.')[0]
      ).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric',
        month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }) }}
    </template>

    <template #tgl_terbit-data="{ row }">
      {{ new Date(
        row.created_at.replace(' ', 'T').split('.')[0]
      ).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric',
        month: 'short', day: '2-digit'
      }) }}
    </template>
  </UTable>

  <div v-if="berkasKomite && berkasKomite.meta">
    <div class="mt-5 flex items-center justify-between">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing : {{ (berkasKomite.meta as any).from }}
        to {{ (berkasKomite.meta as any).to }}
        of {{ (berkasKomite.meta as any).total }} entries
      </p>
      <UPagination v-model="currentPage" :page-count="(berkasKomite.meta as any).per_page"
        :total="(berkasKomite.meta as any).total" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { format } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'
import type { ResourcePagination } from '~/types/ApiResponse';

const runtimeConfig = useRuntimeConfig();
const accessTokenStore = useAccessTokenStore();
const { komite, menu } = defineProps<{
  komite: 'iht' | 'radiologi';
  menu: (row: any) => any[]
}>();

// columns
const columns = [
  { label: "Perihal", key: "perihal" },
  { label: "PJ", key: "penanggung_jawab.nama" },
  { label: "Tanggal Terbit", key: "tgl_terbit" },
  { label: "Dibuat", key: "created_at" },
];

if (!columns?.some(column => column.key === 'no_surat')) {
  columns?.unshift({ label: 'Nomor Surat', key: 'no_surat' });
}

if (menu && !columns?.some(column => column.key === 'actions')) {
  columns?.push({ label: 'Actions', key: 'actions' });
}

const { API_V2_URL } = runtimeConfig.public;
const accessToken: string | null = accessTokenStore.accessToken;

const selected = ref<any[]>([]);
const currentPage = ref<number>(1);
const tglTerbit = ref<Date | null>(null);
const search = ref<string>('');
const bodyReq = ref<any>({
  sort: [
    { field: "created_at", direction: "desc" }
  ],
  filters: [
    { field: "status", operator: "=", value: "1" }
  ]
})

watch([search, tglTerbit], useDebounceFn(([search, tgl]) => {
  let filterCond: any[] = [];

  tgl && filterCond.push({ field: 'tgl_terbit', operator: '=', value: new Date(tgl.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })

  bodyReq.value = {
    ...bodyReq.value,
    search: search ? { value: search } : bodyReq.value.search,
    filters: filterCond
  }
}, 800))

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

const { data: berkasKomite, pending, error, refresh } = await useAsyncData(
  `berkas/${komite}`,
  () => $fetch(`${API_V2_URL}/berkas/${komite}/search`, {
    method: 'POST',
    query: { page: currentPage.value, limit: 10 },
    body: JSON.stringify(bodyReq.value),
    headers: { Authorization: `Bearer ${accessToken}` }
  }), { watch: [currentPage, bodyReq], immediate: true, lazy: false }
);

if (error) {
  console.error(error);
}

</script>