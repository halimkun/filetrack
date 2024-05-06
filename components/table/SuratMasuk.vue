<template>
  <div class="mb-5 flex flex-col lg:flex-row items-center justify-start gap-4">
    <UFormGroup label="No. SIMRS" class="w-full lg:w-72" name="no_simrs">
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton block icon="i-heroicons-calendar-days-20-solid" :label="noSimRs ? format(noSimRs, 'd MMM, yyy') : '-'" color="gray" variant="outline" />

        <template #panel="{ close }">
          <DatePicker v-model="noSimRs" is-required @close="close" />

          <div class="w-full px-4 pb-5">
            <button class="bg-rose-600 hover:bg-rose-700 text-white font-bold w-full px-3 py-1 rounded-md"
              @click="noSimRs = null">
              Clear
            </button>
          </div>
        </template>
      </UPopover>
    </UFormGroup>

    <UFormGroup label="Keterangan" class="w-full lg:w-72" name="ket">
      <USelectMenu 
        v-model="filterKet" 
        :options="ketOptions"
        option-attribute="label"
        value-attribute="value"
      />
    </UFormGroup>

    <UFormGroup label="Search" class="w-full" name="search">
      <UInput v-model="search" placeholder="Search" color="gray" variant="outline" />
    </UFormGroup>
  </div>

  <UTable v-model="selected" :columns="columns" :rows="response?.data" :loading="loading">
    <template #actions-header>
      <div class="flex justify-end">
        <UButton icon="i-heroicons-hashtag" color="gray" variant="ghost" />
      </div>
    </template>

    <template #actions-data="{ row }">
      <div class="flex justify-end">
        <UDropdown v-if="menu" :items="menu(row)">
          <UButton color="sky" variant="soft" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </div>
    </template>

    <template #no_surat-data="{ row }">
      <UBadge color="gray">{{ row.no_surat }}</UBadge>
    </template>

    <template #perihal-data="{ row }">
      <div class="flex items-center justify-start gap-2">
        <UButton 
          :color="row.ket == 'wa' ? 'primary' : row.ket == 'email' ? 'rose' : 'indigo'" 
          :icon="row.ket == 'wa' ? 'i-tabler-brand-whatsapp' : row.ket == 'email' ? 'i-tabler-mail' : 'i-tabler-file-text'"
          variant="soft"
          size="xs"
          square 
        />
        
        <p class="text-gray-500 dark:text-gray-400 max-w-xs truncate">
          {{ row.perihal }}
        </p>
      </div>
    </template>

    <template #pengirim-data="{ row }">
      <p class="text-gray-500 dark:text-gray-400 max-w-xs truncate">
        {{ row.pengirim }}
      </p>
    </template>

    <template #no_simrs-data="{ row }">
      <UBadge color="gray">
        {{ row.no_simrs != '0000-00-00' ? new Date(row.no_simrs).toLocaleDateString('id-ID', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        }) : '-' }}
      </UBadge>
    </template>

    <template #tgl_surat-data="{ row }">
      {{ row.tgl_surat != '0000-00-00' ? new Date(row.tgl_surat).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric', month: 'short', day:
          '2-digit'
      }) : '-' }}
    </template>
  </UTable>

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
</template>

<script setup lang="ts">
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

// =============== FILTER PURPOSE
const search = ref<string>('')
const noSimRs = ref<Date | null>(null)
const filterKet = ref<string>('')
const ketOptions = [
  { label: "All", value: "" },
  { label: "Email", value: "email" },
  { label: "Fisik", value: "fisik" },
  { label: "WhatsApp", value: "wa" },
];

watch([search, noSimRs, filterKet], useDebounceFn(([search, no_simrs, keterangan]) => {
  let filterCond: any[] = [];

  keterangan && filterCond.push({ field: 'ket', operator: '=', value: keterangan })
  no_simrs && filterCond.push({ field: 'no_simrs', operator: '=', value: new Date(no_simrs.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })

  emits('onFilter', {
    search: { value: search ?? '' },
    filters: filterCond
  })
}, 800))
</script>