<script setup lang="ts">
import { userStore } from '~/stores/user';
import type { ResourcePagination } from '~/types/ApiResponse';

const toast = useToast();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const userDetail = userStore();
const tokenStore = useTokenStore();
const { API_V2_URL } = runtimeConfig.public;
const selectedData = ref<any[]>([]);
const emits = defineEmits(['onPageChange']);
const props = defineProps<{
  response: any;
  detailSurat: any;
  menu?: (row: any) => any[];
  columns?: any[];
  loading?: boolean;
}>();

const { data: dataKehadiran, error: kehadiranError, refresh: kehadiranRefresh } = await useAsyncData<ResourcePagination>(
  `${API_V2_URL}/undangan/kehadiran/${route.params.id}`,
  () => $fetch(`${API_V2_URL}/undangan/kehadiran/${route.params.id}`, {
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
  }),
);

if (kehadiranError.value) {
  console.error('Error fetching kehadiran:', kehadiranError.value);
}

// Fungsi reusable untuk mengisi selectedData
const updateSelectedData = () => {
  const kehadiran = dataKehadiran.value?.data || [];
  const penerima = props.response?.data || [];

  // Tambahkan hanya jika belum ada
  penerima.forEach((item: any) => {
    const sudahAda = selectedData.value.some((s: any) => s.penerima === item.penerima);
    const hadir = kehadiran.some((k: any) => k.nik === item.penerima);

    if (hadir && !sudahAda) {
      selectedData.value.push(item);
    }
  });
};

onMounted(() => {
  updateSelectedData();
});

watch(() => props.response, async () => {
  await kehadiranRefresh(); // Pastikan refresh selesai dulu
  updateSelectedData();
});


const currentPage = ref<number>((props.response?.meta as any)?.current_page);
watch(currentPage, (value) => emits('onPageChange', value));

if (props.menu && !props.columns?.some(column => column.key === 'actions')) {
  props.columns?.push({ label: 'Actions', key: 'actions' });
}

const col = [
  { label: "Nama", key: "detail.nama" },
  { label: "NIK", key: "penerima" },
  { label: "Bidang", key: "detail.bidang" },
  { label: "Departemen", key: "detail.dep.nama" },
];

const simpanKehadiran = async () => {
  const karyawans = selectedData.value.map((data: any) => data.penerima);
  const undanganId = route.params.id;

  let body = {
    undangan_id: undanganId,
    nik: karyawans
  }

  const { data, error, refresh, status } = await useFetch(`${API_V2_URL}/undangan/kehadiran`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
  });

  if (error.value) {
    toast.add({ color: 'red', title: 'Error', description: 'Gagal menyimpan kehadiran', icon: 'i-heroicons-exclamation-circle' });
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
        <span v-html="title"></span>
      </template>

      <template #description>
        <div class="mb-3">Simpan sebelum meninggalkan halaman, jika <strong>terdapat update kehadiran</strong>. data yang sudah disimpan <strong><u>tidak dapat diubah</u></strong>.</div>
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

    <template #penerima-data="{ row }">
      <UBadge color="gray">{{ row.penerima }}</UBadge>
    </template>

    <template #nik-data="{ row }">
      <UBadge color="primary" variant="soft">{{ row.nik }}</UBadge>
    </template>
  </UTable>

  <div class="mt-5 flex items-center justify-between" v-if="props.response">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Showing : {{ (props.response?.meta as any)?.from }} to {{ (props.response?.meta as any)?.to }} of {{ (props.response?.meta as any)?.total }} entries
    </p>
    <UPagination v-model="currentPage" :page-count="(props.response?.meta as any)?.per_page" :total="(props.response?.meta as any)?.total" />
  </div>
</template>

<style scoped></style>
