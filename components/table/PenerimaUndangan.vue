<script setup lang="ts">
import type { ResourcePagination } from '~/types/ApiResponse';

const emits = defineEmits(['onPageChange']);
const { response, menu, columns, loading } = defineProps<{
  response: ResourcePagination;
  menu?: (row: any) => any[];
  columns?: any[];
  loading?: boolean;
}>();

const currentPage = ref<number>((response?.meta as any)?.current_page);
watch(currentPage, (value) => emits('onPageChange', value))

if (menu && !columns?.some(column => column.key === 'actions')) {
  columns?.push({ label: 'Actions', key: 'actions' });
}

const col = [
  { label: "No Surat", key: "no_surat" },
  { label: "Nama", key: "nama" },
  { label: "NIK", key: "nik" },
  { label: "Bidang", key: "bidang" },
  { label: "Departemen", key: "dep.nama" },
];
</script>

<template>
  <UTable :columns="col" :rows="(response?.data as any)?.penerima" :loading="loading">
    <template #actions-data="{ row }">
      <UDropdown v-if="menu" :items="menu(row)">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </template>

    <template #no_surat-data="{ row }">
      <UBadge color="gray">{{ row.no_surat }}</UBadge>
    </template>

    <template #nik-data="{ row }">
      <UBadge color="primary" variant="soft">{{ row.nik }}</UBadge>
    </template>
  </UTable>

  <div class="mt-5 flex items-center justify-between" v-if="response">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Showing : {{ (response?.meta as any)?.from }} to {{(response?.meta as any)?.to }} of {{ (response?.meta as any)?.total }} entries
    </p>
    <UPagination 
      v-model="currentPage" 
      :page-count="(response?.meta as any)?.per_page"
      :total="(response?.meta as any)?.total" 
    />
  </div>
</template>

<style scoped></style>
