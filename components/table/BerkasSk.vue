<template>
  <div class="mb-5 flex flex-col lg:flex-row items-center justify-start gap-4">
    <UFormGroup label="Tanggal Terbit" class="w-full lg:w-72" name="tgl_terbit">
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton block icon="i-heroicons-calendar-days-20-solid"
          :label="tglTerbit ? format(tglTerbit, 'd MMM, yyy') : '-'" color="gray" variant="outline" />

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

    <UFormGroup label="Status" class="w-full lg:w-72" name="jenis">
      <USelectMenu 
        v-model="filterJenis" 
        :options="statusOptions"
        option-attribute="label"
        value-attribute="value"
      />
    </UFormGroup>

    <UFormGroup label="Search" class="w-full" name="search">
      <UInput v-model="search" placeholder="Search" color="gray" variant="outline" />
    </UFormGroup>
  </div>

  <UTable v-model="selected" :columns="columns" :rows="response?.data" :loading="loading">
    <template #actions-data="{ row }">
      <UDropdown v-if="menu" :items="menu(row)">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </template>

    <template #tgl_terbit-data="{ row }">
      {{ new Date(row.tgl_terbit).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric', month: 'short', day:
          '2-digit'
      }) }}
    </template>

    <template #pj-data="{ row }">
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
        {{ row.penanggung_jawab ? row.penanggung_jawab.nama : row.pj }}
      </p>
    </template>

    <template #nomor-data="{ row }">
      <UBadge>
        {{ [
            String(row.nomor).padStart(3, '0'),
            row.jenis, 
            row.prefix, 
            format(new Date(row.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy')
          ].join('/')
        }}
      </UBadge>
    </template>

    <template #berkas-data="{ row }">
      <template v-if="row.berkas">
        <!-- open url http://192.168.100.33/webapps/rsia_sk/ -->
        <UButton icon="i-tabler-file" size="xs" color="primary" square
          variant="soft"
          @click="handleOpenFile(row.berkas)">
        </UButton>
      </template>

      <!-- disable button -->
      <template v-else>
        <UButton icon="i-tabler-file-off" size="xs" color="rose" variant="soft" square disabled>
        </UButton>
      </template>
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

if (menu && !columns?.some(column => column.key === 'pj')) {
  columns?.push({ label: 'PJ', key: 'pj' });
}

if (menu && !columns?.some(column => column.key === 'berkas')) {
  columns?.push({ label: 'Berkas', key: 'berkas' });
}

if (menu && !columns?.some(column => column.key === 'actions')) {
  columns?.push({ label: 'Actions', key: 'actions' });
}

// =============== FILTER PURPOSE
const search = ref<string>('')
const tglTerbit = ref<Date | null>(null)
const filterJenis = ref<string>('')
const statusOptions = [
  { label: "Semua", value: "" },
  { label: "SK Dokumen", value: "A" },
  { label: "SK Pengangkatan Jabatan", value: "B" },
];

watch([search, tglTerbit, filterJenis], useDebounceFn(([search, tgl, jenis]) => {
  let filterCond: any[] = [];

  jenis && filterCond.push({ field: 'jenis', operator: '=', value: jenis })
  tgl && filterCond.push({ field: 'tgl_terbit', operator: '=', value: new Date(tgl.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })

  emits('onFilter', {
    search: { value: search ?? '' },
    filters: filterCond
  })
}, 800))

async function handleOpenFile(berkas: string) {
  const url = `http://192.168.100.33/webapps/rsia_sk/${berkas}`
  window.open(url, '_blank')
}
</script>