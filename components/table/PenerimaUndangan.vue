<script setup lang="ts">
import { userStore } from '~/stores/user';
import type { ResourcePagination } from '~/types/ApiResponse';

const toast = useToast();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const userDetail = userStore();
const accessTokenStore = useAccessTokenStore();

const { API_V2_URL } = runtimeConfig.public;
const accessToken = computed(() => accessTokenStore.accessToken);

const selectedData = ref<any[]>([]);
const emits = defineEmits(['onPageChange']);
const props = defineProps<{
  response: any;
  detailSurat: any;
  menu?: (row: any) => any[];
  columns?: any[];
  loading?: boolean;
}>();

const { data: dataKehadiran, pending: kehadiranPending, error: kehadiranError, refresh: kehadiranRefresh } = await useAsyncData<ResourcePagination>(
  `${API_V2_URL}/undangan/kehadiran/${route.params.no_surat}`,
  () => $fetch(`${API_V2_URL}/undangan/kehadiran/${route.params.no_surat}`, {
    headers: { Authorization: `Bearer ${accessToken.value}` },
  }),
);

onMounted(() => {
  if (dataKehadiran.value) {
    const kehadiran = dataKehadiran.value.data as any;
    const penerima = props.response?.data;
    selectedData.value = penerima.filter((penerima: any) => kehadiran.some((kehadiran: any) => kehadiran.nik === penerima.penerima));
  }
});

watch(() => props.response, (value) => {
  kehadiranRefresh();
  if (dataKehadiran.value) {
    const kehadiran = dataKehadiran.value.data as any;
    const penerima = props.response?.data;
    selectedData.value = penerima.filter((penerima: any) => kehadiran.some((kehadiran: any) => kehadiran.nik === penerima.penerima));
  }
});

const currentPage = ref<number>((props.response?.meta as any)?.current_page);
watch(currentPage, (value) => emits('onPageChange', value));

if (props.menu && !props.columns?.some(column => column.key === 'actions')) {
  props.columns?.push({ label: 'Actions', key: 'actions' });
}

const col = [
  { label: "No Surat", key: "no_surat" },
  { label: "Nama", key: "detail.nama" },
  { label: "NIK", key: "penerima" },
  { label: "Bidang", key: "detail.bidang" },
  { label: "Departemen", key: "detail.dep.nama" },
];

const simpanKehadiran = async () => {
  const karyawans = selectedData.value.map((data: any) => data.penerima);
  const postData = {
    no_surat: atob(route.params.no_surat as string),
    nik: userDetail.user?.detail.nik,
    karyawans,
    tipe: 'surat/internal',
    model: props.detailSurat?.model,
  };

  const { data, error, pending, refresh, status } = await useFetch(`${API_V2_URL}/undangan/kehadiran`, {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: { Authorization: `Bearer ${accessToken.value}` },
  });

  if (error.value) {
    toast.add({ color: 'danger', title: 'Error', description: 'Gagal menyimpan kehadiran', icon: 'i-heroicons-exclamation-circle' });
  }

  if (status.value == 'success') {
    toast.add({ color: 'primary', title: 'Berhasil', description: 'Kehadiran berhasil disimpan', icon: 'i-heroicons-check-circle' });
  }
};
</script>


<template>
  <div class="w-full flex items-center justify-end mb-5">
    <UAlert title="Heads <i>up</i>!" icon="i-heroicons-exclamation-triangle-16-solid" color="amber" variant="subtle">
      <template #title="{ title }">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="title" />
      </template>

      <template #description>
        <div class="mb-3">Simpan sebelum meninggalkan halaman, jika <strong>terdapat update kehadiran</strong>. data
          yang sudah disimpan <strong><u>tidak dapat diubah</u></strong>.</div>
        <UButton variant="outline" color="indigo" @click="simpanKehadiran">
          Simpan Kehadiran
        </UButton>
      </template>
    </UAlert>
  </div>

  <UTable :columns="col" :rows="(props.response?.data as any)" :loading="props.loading" v-model="selectedData">
    <template #actions-data="{ row }">
      <UDropdown v-if="props.menu" :items="props.menu(row)">
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

  <div class="mt-5 flex items-center justify-between" v-if="props.response">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Showing : {{ (props.response?.meta as any)?.from }} to {{ (props.response?.meta as any)?.to }} of {{
        (props.response?.meta as any)?.total }} entries
    </p>
    <UPagination v-model="currentPage" :page-count="(props.response?.meta as any)?.per_page"
      :total="(props.response?.meta as any)?.total" />
  </div>
</template>

<style scoped></style>
