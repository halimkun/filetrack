<script setup lang="ts">
type LaravelApiResourcePaginationType = {
  data: any[],
  links: any[],
  meta: any[],
}

const emits = defineEmits(['selectedChange', 'onPageChange']);
const { response, menu, columns, loading } = defineProps<{
  response: LaravelApiResourcePaginationType;
  menu?: (row: any) => any[];
  columns?: any[];
  loading?: boolean;
}>();

const selected = ref<any[]>([]);
watch(selected, (value) => emits('selectedChange', value))

const currentPage = ref<number>((response?.meta as any).current_page);
watch(currentPage, (value) => emits('onPageChange', value))

if (menu && !columns?.some(column => column.key === 'actions')) {
  columns?.push({ label: 'Actions', key: 'actions' });
}
</script>

<template>
  <UTable v-model="selected" :columns="columns" :rows="response.data" :loading="loading">
    <template #actions-data="{ row }">
      <UDropdown v-if="menu" :items="menu(row)">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </template>

    <template #no_surat-data="{ row }">
      <UBadge color="gray">{{ row.no_surat }}</UBadge>
    </template>

    <template #tgl_terbit-data="{ row }">
      {{ new Date(row.tgl_terbit).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric', month: 'short', day:
          '2-digit'
      }) }}
    </template>

    <template #status-data="{ row }">
      <UBadge
        size="xs"
        :color="row.status == 'pengajuan' ? 'yellow' : row.status == 'disetujui' ? 'teal' : row.status == 'ditolak' ? 'red' : 'purple'">
        {{ row.status }}
      </UBadge>
    </template>
  </UTable>

  <div class="mt-5 flex items-center justify-between">
    <p class="text-sm text-gray-500 dark:text-gray-400">Showing : {{ (response.meta as any).from }} to {{ (response.meta as any).to }} of {{ (response.meta as any).total }} entries</p>
    <UPagination v-model="currentPage" :page-count="(response.meta as any).per_page" :total="(response.meta as any).total" />
  </div>
</template>

<style scoped></style>
