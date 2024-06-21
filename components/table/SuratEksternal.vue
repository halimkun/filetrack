<template>
  <div>
    <!-- Filter Section -->
    <div class="mb-5 flex flex-col lg:flex-row items-center justify-start gap-4">
      <UFormGroup label="Tanggal Terbit" class="w-full lg:w-72" name="tgl_terbit">
        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton block icon="i-heroicons-calendar-days-20-solid"
            :label="tanggal ? format(tanggal, 'd MMM, yyy') : '-'" color="gray" variant="outline" />

          <template #panel="{ close }">
            <DatePicker v-model="tanggal" is-required @close="close" />

            <div class="w-full px-4 pb-5">
              <button class="bg-rose-600 hover:bg-rose-700 text-white font-bold w-full px-3 py-1 rounded-md"
                @click="tanggal = null">
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

    <!-- Table Section -->
    <UTable v-model="selected" :columns="columns" :rows="response?.data" :loading="loading">
      <template #actions-data="{ row }">
        <UDropdown v-if="menu" :items="menu(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>

      <template #no_surat-data="{ row }">
        <UBadge color="gray">{{ row.no_surat }}</UBadge>
      </template>

      <template #perihal-data="{ row }">
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
          {{ row.perihal }}
        </p>
      </template>

      <template #alamat-data="{ row }">
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
          {{ row.alamat }}
        </p>
      </template>

      <template #tanggal-data="{ row }">
        {{ new Date(row.tanggal).toLocaleDateString('id-ID', {
          weekday: 'short', year: 'numeric', month: 'short', day:
            '2-digit'
        }) }}
      </template>
    </UTable>

    <!-- Pagination Section -->
    <div v-if="response && response.meta">
      <div class="mt-5 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing : {{ (response.meta as any).from }}
          to {{ (response.meta as any).to }}
          of {{ (response.meta as any).total }} entries
        </p>
        <UPagination v-model="currentPage" :page-count="(response.meta as any).per_page"
          :total="(response.meta as any).total" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { format } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'
import type { ResourcePagination } from '~/types/ApiResponse';

const emits = defineEmits(['selectedChange', 'onPageChange', 'onFilter']);
const { response, menu, columns, loading } = defineProps<{
  response: ResourcePagination;
  menu?: (row: any) => any[];
  columns?: any[];
  loading?: boolean;
}>();

const selected = ref<any[]>([]);
watch(selected, (value) => emits('selectedChange', value))

const currentPage = ref<number>((response?.meta as any)?.current_page ?? 1)
watch(currentPage, (value) => emits('onPageChange', value))

if (menu && !columns?.some(column => column.key === 'actions')) {
  columns?.push({ label: 'Actions', key: 'actions' });
}

const search = ref<string>('')
const tanggal = ref<Date | null>(null)
watch([search, tanggal], useDebounceFn(([search, tgl]) => {
  let filterCond: any[] = [];
  
  tgl && filterCond.push({ field: 'tanggal', operator: '=', value: new Date(tgl.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })

  emits('onFilter', {
    search: { value: search ?? '' },
    filters: filterCond
  })
}, 800))
</script>