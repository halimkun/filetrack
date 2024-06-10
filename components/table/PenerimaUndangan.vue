<script setup lang="ts">
import { userStore } from '~/stores/user';
import type { ResourcePagination } from '~/types/ApiResponse';

const toast = useToast()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const userDetail = userStore()
const accessTokenStore = useAccessTokenStore()

const { API_V2_URL } = runtimeConfig.public
const accessToken = accessTokenStore.accessToken

const selectedData = ref<any>([]);
const emits = defineEmits(['onPageChange']);
const { response, detailSurat, menu, columns, loading } = defineProps<{
  response: any;
  detailSurat: any;
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

const { data: dataKehadiran, pending: kehadiranPending, error: kehadiranError, refresh: kehadiranRefresh } = await useAsyncData<ResourcePagination>(
  `${API_V2_URL}/undangan/kehadiran/${route.params.no_surat}`,
  () => $fetch(`${API_V2_URL}/undangan/kehadiran/${route.params.no_surat}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }),
);

onMounted(() => {
  if (dataKehadiran.value) {
    const kehadiran = dataKehadiran.value.data as any;
    const penerima = response?.data.penerima;

    selectedData.value = penerima.filter((penerima: any) => kehadiran.some((kehadiran: any) => kehadiran.nik === penerima.nik));
  }
});

const simpanKehadiran = async () => {
  const karyawans = selectedData.value.map((data: any) => data.nik);
  const postData = {
    no_surat: atob(route.params.no_surat as string),
    nik: userDetail.user?.detail.nik,
    karyawans: karyawans,
    tipe: 'surat/internal',
    model: detailSurat?.model,
  };

  const { data, pending, error, refresh } = await useFetch(`${API_V2_URL}/undangan/kehadiran`,{
    method: 'POST',
    body: JSON.stringify(postData),
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (data) {
    kehadiranRefresh()
    toast.add({ color: 'primary', title: 'Berhasil', description: 'Kehadiran berhasil disimpan', icon: 'i-heroicons-check-circle' })
  }
};
</script>

<template>
  <div class="w-full flex items-center justify-end">
    <UButton
      class="mb-4"
      variant="outline"
      color="indigo"
      @click="simpanKehadiran"
    >
      Simpan Kehadiran
    </UButton>
  </div>

  <UTable :columns="col" :rows="(response?.data as any)?.penerima" :loading="loading" v-model="selectedData">
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
