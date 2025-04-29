<template>
  <div class="w-full flex flex-col gap-2.5 items-start">
    <div class="flex items-center justify-between gap-2 w-full leading-none">
      <label class="block font-medium text-gray-700 dark:text-gray-200">{{ label }}</label>
      <div class="flex items-center leading-none gap-2">
        <UInput v-model="search" placeholder="Search" icon="i-tabler-search" class="w-full max-w-xs" />
      </div>
    </div>

    <UCard class="w-full" :ui="{ body: { padding: 'sm:p-1' } }">
      <UTable :rows="data?.data" :columns="columns" :loading="status === 'pending'" v-model="selected">
        <template #select-header="{ indeterminate, checked, change }">
          <input type="checkbox" 
            class="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 hidden invisible"
            disabled
            :indeterminate="indeterminate" 
            :checked="checked"
            @change="e => change((e?.target as any)?.checked)" />
        </template>

        <template #dep_id-data="{ row }">
          <UBadge color="gray" class="text-xs">
            {{ row.dep_id }}
          </UBadge>
        </template>
      </UTable>

      <div v-if="data && data.meta">
        <div class="flex items-center justify-between px-4 py-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Showing : {{ (data.meta as any).from }}
            to {{ (data.meta as any).to }}
            of {{ (data.meta as any).total }} entries
          </p>
          <UPagination v-model="currentPage" :page-count="(data.meta as any).per_page"
            :total="(data.meta as any).total" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { DepartemenData } from '~/types/departemen.types';
import type { LaravelPagination } from '~/types/laravel-pagination.types';

const tokenStore = useTokenStore();
const config = useRuntimeConfig();

const { API_V2_URL } = config.public;
const currentPage = ref<number>(1);
const selected = ref<any>([]);
const search = ref<string>('');

const columns = [
  { label: "Kode", key: "dep_id" },
  { label: "Departemen", key: "nama" },
];

const props = defineProps<{
  label: string;
}>();

const { data, error, refresh, status } = useAsyncData<LaravelPagination<DepartemenData>>(`${API_V2_URL}/departemen/search`, async () => {
  const response = await $fetch<LaravelPagination<DepartemenData>>(`${API_V2_URL}/departemen/search`, {
    method: 'POST',
    query: { limit: 7, page: currentPage.value },
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    body: JSON.stringify({
      search: { value: search.value },
      filters: [
        { field: 'aktif', operator: '=', value: "1" }
      ],
      sort: [
        { field: 'nama', direction: 'asc' }
      ],
    })
  });
  return response;
}, { watch: [currentPage, search], immediate: true, lazy: false });
</script>