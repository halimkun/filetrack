<template>
  <UInputMenu 
    v-model="selectedDep" 
    :loading="loadingDep" 
    :search="search" 
    size="md"
    placeholder="Unit / Departement"
    option-attribute="nama" 
    class="w-full" 
    trailing 
  />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import type { Departemen, DepartemenList } from '~/types/departemen.types';

const emit = defineEmits(['update:selectedDep']);
const { dep } = defineProps<{
  dep?: string
}>();

const tokenStore = useTokenStore();
const config = useRuntimeConfig();

const { API_V2_URL } = config.public;
const loadingDep = ref(false);

// Initialize selectedDep with an empty object
const selectedDep = ref<Departemen>({
  dep_id: dep || '',
  nama: '',
  kelompok: '',
  aktif: null,
  tele_id: ''
});

// Fetch the selected department based on dep_id when the component is mounted
async function loadSelectedDep() {
  if (dep) {
    loadingDep.value = true;
    try {
      const response = await $fetch<DepartemenList>(`${API_V2_URL}/departemen/search?select=dep_id,nama&limit=100`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
        body: JSON.stringify({
          filters: [
            { field: 'nama  ', operator: '=', value: dep }
          ]
        })
      });

      if (response.data && response.data.length > 0) {
        selectedDep.value = response.data[0];
      }
    } catch (error) {
      console.error("Error loading selected department:", error);
    } finally {
      loadingDep.value = false;
    }
  }
}

// Call loadSelectedDep on component mount
onMounted(() => {
  loadSelectedDep();
});

// Search function
async function search(q: string): Promise<Departemen[]> {
  loadingDep.value = true;
  try {
    const response = await $fetch<DepartemenList>(`${API_V2_URL}/departemen/search?select=dep_id,nama&limit=100`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
      body: JSON.stringify({
        search: { value: q }
      })
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching departemen:", error);
    return [];
  } finally {
    loadingDep.value = false;
  }
}

// Watch for changes in selectedDep and emit the new dep_id
watch(selectedDep, (value) => {
  emit('update:selectedDep', value.dep_id);
});
</script>
