<template>
  <div class="mb-5 flex flex-col lg:flex-row items-center justify-start gap-4">
    <UFormGroup label="Tanggal Terbit" class="w-full lg:w-72" name="tgl_terbit">
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton block icon="i-heroicons-calendar-days-20-solid"
          :label="tglAkhir ? format(tglAkhir, 'd MMM, yyy') : 'Tanggal Akhir'" color="gray" variant="outline" />

        <template #panel="{ close }">
          <DatePicker v-model="tglAkhir" is-required @close="close" />

          <div class="w-full px-4 pb-5">
            <button class="bg-rose-600 hover:bg-rose-700 text-white font-bold w-full px-3 py-1 rounded-md"
              @click="tglAkhir = null">
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

  <UTable v-model="selected" :columns="columns" :rows="response?.data" :loading="loading">
    <template #actions-data="{ row }">
      <UDropdown v-if="menu" :items="menu(row)">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </template>

    <template #no_pks_internal-data="{ row }">
      <UBadge color="gray">{{ row.no_pks_internal }}</UBadge>
    </template>

    <template #judul-data="{ row }">
      <div class="flex gap-4">
        <template v-if="row.berkas">
          <UButton title="lihat berkas di tab baru" icon="i-tabler-file-text" size="xs" color="primary" square
            variant="soft"
            @click="handleOpenFile(row.berkas)">
          </UButton>
        </template>

        <!-- disable button -->
        <template v-else>
          <UButton title="lihat berkas di tab baru" icon="i-tabler-file-off" size="xs" color="rose" variant="soft" square disabled>
          </UButton>
        </template>
        
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
          {{ row.judul }}
        </p>
      </div>
    </template>

    <template #tanggal_awal-data="{ row }">
      {{ new Date(row.tanggal_awal).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric', month: 'short', day:
          '2-digit'
      }) }}
    </template>

    <template #tanggal_akhir-data="{ row }">
      {{ row.tanggal_akhir && row.tanggal_akhir !== '0000-00-00' ? new Date(row.tanggal_akhir).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric', month: 'short', day:
          '2-digit'
      }) : '-' }}
    </template>

    <template #status-data="{ row }">
      <UBadge size="xs"
        :color="row.status == 'pengajuan' ? 'yellow' : row.status == 'disetujui' ? 'teal' : row.status == 'ditolak' ? 'red' : 'purple'">
        {{ row.status }}
      </UBadge>
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

if (menu && !columns?.some(column => column.key === 'actions')) {
  columns?.push({ label: 'Actions', key: 'actions' });
}

const search = ref<string>('')
const tglAkhir = ref<Date | null>(null)
const filterJenis = ref<string>('')
const jenisOptions = [
  { label: "Semua", value: "" },
  { label: "Internal", value: "A" },
  { label: "Eksternal", value: "B" },
];

watch([search, tglAkhir, filterJenis], useDebounceFn(([search, tgl, jenis]) => {
  let filterCond: any[] = [];

  jenis && filterCond.push({ field: 'no_pks_internal', operator: 'like', value: `%/${jenis}/%` })
  tgl && filterCond.push({ field: 'tgl_terbit', operator: '=', value: new Date(tgl.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })

  emits('onFilter', {
    search: { value: search ?? '' },
    filters: filterCond
  })
}, 800))

async function handleOpenFile(berkas: string) {
  const url = `https://sim.rsiaaisyiyah.com/webapps/rsia_pks/${berkas}`
  window.open(url, '_blank')
}
</script>