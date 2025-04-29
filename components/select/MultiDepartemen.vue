<template>
  <USelectMenu 
    v-model="selectedDeps" 
    
    :loading="loadingDep" 
    :searchable="search" 
    
    placeholder="Departement"
    option-attribute="nama" 
    class="w-full" 
    by="dep_id"

    multiple
    trailing
    :disabled="disabled" 
    size="md"
  />
</template>

<script lang="ts" setup>
import type { Departemen, DepartemenData } from '~/types/departemen.types';

// Define Props and Emit
const emit = defineEmits(['update:selectedDep', 'update:depIds'])
const { dep, depIds, disabled } = defineProps<{
  dep?: string,
  depIds?: string[],
  disabled?: boolean
}>()

// Setup API access
const tokenStore = useTokenStore();
const config = useRuntimeConfig();
const { API_V2_URL } = config.public;

// Local State
const loadingDep = ref(false);
const selectedDeps = ref<Departemen[]>([]);

// Load initial data to match depIds with Departemen objects
async function loadSelectedDeps() {
  if (depIds && depIds.length > 0) {
    loadingDep.value = true;
    try {
      const response = await $fetch<DepartemenData>(`${API_V2_URL}/departemen/search?select=dep_id,nama&limit=100`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
        body: JSON.stringify({
          filters: [
            { field: 'nama', operator: 'in', value: depIds }
          ]
        })
      });
      selectedDeps.value = response.data;
    } catch (error) {
      console.error("Error loading selected departments:", error);
    } finally {
      loadingDep.value = false;
    }
  }
}

onMounted(() => {
  loadSelectedDeps();
});

async function search(q: string): Promise<Departemen[]> {
  loadingDep.value = true;

  try {
    const response = await $fetch<DepartemenData>(`${API_V2_URL}/departemen/search?select=dep_id,nama&limit=100`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
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
  } finally {
    loadingDep.value = false;
  }
}

watch(selectedDeps, (newValue) => {
  const depIds = newValue.map(dep => dep.nama);
  emit('update:depIds', depIds);
});

</script>