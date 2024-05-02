<script setup lang="ts">
type LaravelApiResourcePaginationType = {
  data: any[],
  links: any[]
  meta: any[],
}

const emits = defineEmits(['onPageChange']);
const { response, menu, columns, loading } = defineProps<{
  response: LaravelApiResourcePaginationType;
  menu?: (row: any) => any[];
  columns?: any[];
  loading?: boolean;
}>();

const currentPage = ref<number>((response?.meta as any)?.current_page);
watch(currentPage, (value) => emits('onPageChange', value))

if (menu && !columns?.some(column => column.key === 'actions')) {
  columns?.push({ label: 'Actions', key: 'actions' });
}
</script>

<template>
  <UTable :columns="columns" :rows="(response?.data as any)?.penerima" :loading="loading">
    <template #empty-state>
      <div class="flex flex-col items-center justify-center p-8">
        <div class="w-fit">
          <div class="flex flex-row items-start gap-2 justify-center p-4 border border-cool-800 rounded-xl">
            <UIcon name="i-tabler-info-circle" color="orange" class="text-xl mt-0.5 animate-pulse" />
            <div>
              <p class="text-gray-500 dark:text-gray-400">Tidak ada penerima.</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">mungkin surat ini tidak mewakili kegiatan tertentu.</p>
            </div>
          </div>
  
          <UDivider label="ATAU" class="my-8"/>
  
          <UButton icon="i-tabler-user-plus" color="cyan" variant="soft" block>
            Tambah Penerima
          </UButton>
        </div>
      </div>
    </template>

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
