<template>
  <UInputMenu 
    v-model="selectedPegawai" 
    :loading="loadingPegawai"
    :search="useDebounceFn(search, 300)"
    placeholder="Penanggung Jawab"
    option-attribute="nama" 
    trailing
    class="w-full"
  />
</template>

<script lang="ts" setup>
import type { Pegawai, PegawaiList } from '~/types/pegawai.types';
import { useDebounceFn } from '@vueuse/core'

const emit = defineEmits(['update:selectedPegawai'])
const { pj } = defineProps<{ 
  pj?: string 
}>()

const tokenStore = useTokenStore();
const config = useRuntimeConfig()

const { API_V2_URL } = config.public
const loadingPegawai = ref(false)
const selectedPegawai = ref<Pegawai>({ nik: pj || '', nama: '' })

async function search(q: string): Promise<Pegawai[]> {
  loadingPegawai.value = true;
  
  try {
    const response = await $fetch<PegawaiList>(`${API_V2_URL}/pegawai/search?select=nik,nama&limit=500`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
      body: JSON.stringify({
        search: { value: q },
        filters: [
          { field: 'stts_aktif', operator: '=', value: 'AKTIF' }
        ]
      })
    });

    loadingPegawai.value = false;
    return response.data;
  } catch (error) {
    console.error("Error fetching pegawai:", error);
    loadingPegawai.value = false;
    return [];
  }
}

watch(selectedPegawai, (value) => {
  emit('update:selectedPegawai', value.nik);
});
</script>