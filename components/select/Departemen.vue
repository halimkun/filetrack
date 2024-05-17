<template>
  <UInputMenu 
    v-model="selectedDep" 
    :loading="loadingDep" 
    :search="search" 
    placeholder="Departement"
    option-attribute="nama" 
    class="w-full" 
    trailing 
  />
</template>

<script lang="ts" setup>
import type { Departemen, DepartemenList } from '~/types/Departemen';

const emit = defineEmits(['update:selectedDep'])
const { dep } = defineProps<{
  dep?: string
}>()

const accessTokenStore = useAccessTokenStore();
const config = useRuntimeConfig()

const { API_V2_URL } = config.public
const { accessToken } = accessTokenStore
const loadingDep = ref(false)
const selectedDep = ref<Departemen>({
  dep_id: dep || '',
  nama: '',
  kelompok: '',
  aktif: null,
  tele_id: ''
})

async function search(q: string): Promise<Departemen[]> {
  loadingDep.value = true;

  try {
    const response = await $fetch<DepartemenList>(`${API_V2_URL}/departemen/search?select=dep_id,nama&limit=100`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        search: { value: q },
      })
    });

    loadingDep.value = false;
    return response.data;
  } catch (error) {
    console.error("Error fetching pegawai:", error);
    loadingDep.value = false;
    return [];
  }
}

watch(selectedDep, (value) => {
  emit('update:selectedDep', value.dep_id);
});
</script>