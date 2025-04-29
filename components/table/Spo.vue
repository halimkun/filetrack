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

    <UFormGroup label="Status" class="w-full lg:w-72" name="status">
      <USelectMenu 
        v-model="filterJenis" 
        :options="jenisOptions"
        option-attribute="label"
        value-attribute="value"
      />
    </UFormGroup>

    <UFormGroup label="Search" class="w-full" name="search">
      <UInput v-model="search" placeholder="Search" color="gray" variant="outline" />
    </UFormGroup>
  </div>

  <!-- TODO : BUAT DETAIL SPO -->

  <div>
    <UTable
      :rows="response?.data"
      :columns="columns"
      :loading="loading"
    >

      <template #nomor-data="{ row }">
        <template v-if="row.nomor">
          <UBadge color="gray">{{ row.nomor }}</UBadge>
        </template>
      </template>

      <template #tgl_terbit-data="{ row }">
        {{ new Date(row.tgl_terbit).toLocaleDateString('id-ID', {
          weekday: 'short', year: 'numeric', month: 'short', day:
            '2-digit'
        }) }}
      </template>

      <template #judul-data="{ row }">
        <p class="text-sm text-gray-900 dark:text-gray-300 max-w-sm truncate font-semibold">
          {{ row.judul }}
        </p>
        <!-- <UBadge size="xs" color="indigo" variant="soft" class="mt-1">
          ACC Asisten Manager Penunjang
        </UBadge> -->
      </template>

      <template #unit_id-data="{ row }">
        <UBadge :color="row.unit ? 'primary' : 'rose'" variant="soft" class="text-xs">
          {{ row.unit ? row.unit.nama : row.unit_id }}
        </UBadge>
      </template>

      <template #jenis-data="{ row }">
        <UBadge variant="subtle" :color="row.jenis == 'medis' ? 'indigo' : row.jenis == 'penunjang' ? 'amber' : 'gray'">
          {{ row.jenis?.toUpperCase() }}
        </UBadge>
      </template>

      <template #actions-data="{ row }">
        <UDropdown v-if="menu" :items="menu(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>
    </UTable>

    <div v-if="response && response?.meta">
      <div class="mt-5 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing : {{ (response?.meta as any).from }}
          to {{ (response?.meta as any).to }}
          of {{ (response?.meta as any).total }} entries
        </p>
        <UPagination v-model="currentPage" :page-count="(response?.meta as any).per_page"
          :total="(response?.meta as any).total" />
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
  response: ResourcePagination | null;
  menu?: (row: any) => any[];
  columns?: any[];
  loading?: boolean;
}>();

const currentPage = ref<number>((response?.meta as any)?.current_page ?? 1)
watch(currentPage, (value) => emits('onPageChange', value))

const search = ref<string>('')
const tglTerbit = ref<Date | null>(null)
const filterJenis = ref<string>('')
const jenisOptions = [
  { label: "Semua", value: "" },
  { label: "Penunjang", value: "penunjang" },
  { label: "Medis", value: "medis" },
  { label: "Umum", value: "umum" },
];

watch([search, tglTerbit, filterJenis], useDebounceFn(([search, tgl, jenis]) => {
  let filterCond: any[] = [];

  jenis && filterCond.push({field: 'jenis', operator: '=', value: jenis})
  tgl && filterCond.push({field: 'tgl_terbit', operator: '=', value: format(tgl, 'yyyy-MM-dd')})

  emits('onFilter', {
    search: { value: search ?? '' },
    filters: filterCond
  })
}, 800))
</script>